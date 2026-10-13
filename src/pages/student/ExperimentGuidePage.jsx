import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { evaluate } from 'mathjs';
import { getExperimentById, submitExperimentResults } from '../../api/experimentApi';
import { getEquipment } from '../../api/equipmentApi';
import { useAuth } from '../../context/AuthContext';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import ComponentSymbol from '../../components/common/ComponentSymbol';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ExperimentImage from '../../components/common/ExperimentImage';
import ComponentImage from '../../components/common/ComponentImage';

// Digital interactive laboratory manual: Aim, Theory, Safety, Checklist, Live Observation Table, and MathJS Calculation Helper
const ExperimentGuidePage = () => {
  const { id } = useParams();
  const { role } = useAuth();

  const [experiment, setExperiment] = useState(null);
  const [labEquipment, setLabEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Procedure step completion checklist state
  const [completedSteps, setCompletedSteps] = useState({});

  // Editable observation table state
  const [observationRows, setObservationRows] = useState([
    { id: 1, col1: '', col2: '', col3: '' },
  ]);
  const [conclusion, setConclusion] = useState('');
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MathJS formula calculator state: inputs and calculated results per formula
  const [formulaInputs, setFormulaInputs] = useState({});
  const [formulaResults, setFormulaResults] = useState({});

  const fetchExperiment = async () => {
    setError(null);
    try {
      const data = await getExperimentById(id);
      setExperiment(data);
      try {
        setLabEquipment(await getEquipment({ labId: data.labId }));
      } catch {
        setLabEquipment([]);
      }

      const refreshedInputs = {};
      data.formulas?.forEach((formula) => {
        refreshedInputs[formula.id] = {};
        formula.variables?.split(',').forEach((variable) => {
          const variableName = variable.trim();
          if (variableName) {
            refreshedInputs[formula.id][variableName] =
              formulaInputs[formula.id]?.[variableName] || '';
          }
        });
      });
      setFormulaInputs(refreshedInputs);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  useAutoRefresh(fetchExperiment, 15000, id);

  // Toggle procedure step checkbox
  const handleToggleStep = (stepNo) => {
    setSubmissionResult(null);
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNo]: !prev[stepNo],
    }));
  };

  // Observation table actions
  const handleAddObservationRow = () => {
    setSubmissionResult(null);
    const newId = observationRows.length > 0 ? Math.max(...observationRows.map((r) => r.id)) + 1 : 1;
    setObservationRows([
      ...observationRows,
      { id: newId, col1: '', col2: '', col3: '' },
    ]);
  };

  const handleUpdateObservationCell = (rowId, field, value) => {
    setSubmissionResult(null);
    setObservationRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [field]: value } : row))
    );
  };

  const handleDeleteObservationRow = (rowId) => {
    setSubmissionResult(null);
    setObservationRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  // Safe MathJS formula evaluation (NO eval())
  const handleVariableChange = (formulaId, varName, value) => {
    setSubmissionResult(null);
    setFormulaInputs((prev) => ({
      ...prev,
      [formulaId]: {
        ...prev[formulaId],
        [varName]: value,
      },
    }));
  };

  const allStepsComplete = (experiment?.steps || []).every((step) => completedSteps[step.stepNo]);
  const hasObservationValues = observationRows.some((row) => row.col1.trim() || row.col2.trim() || row.col3.trim());

  const handleSubmitExperiment = async () => {
    setSubmissionError(null);
    setIsSubmitting(true);
    try {
      const result = await submitExperimentResults(id, {
        completedSteps: Object.keys(completedSteps).filter((stepNo) => completedSteps[stepNo]).map(Number),
        observations: observationRows.filter((row) => row.col1.trim() || row.col2.trim() || row.col3.trim()),
        formulaInputs,
        formulaResults,
        conclusion: conclusion.trim(),
      });
      setSubmissionResult(result);
    } catch (err) {
      setSubmissionError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCalculateFormula = (formula) => {
    const formulaId = formula.id;
    const currentScope = formulaInputs[formulaId] || {};

    try {
      const varNames = formula.variables
        ? formula.variables.split(',').map((v) => v.trim()).filter(Boolean)
        : [];

      const parsedScope = {};
      for (const name of varNames) {
        const rawVal = currentScope[name];
        if (rawVal === undefined || rawVal === '') {
          throw new Error(`Variable '${name}' is required.`);
        }
        const numVal = parseFloat(rawVal);
        if (isNaN(numVal)) {
          throw new Error(`Value for '${name}' must be a valid number.`);
        }
        parsedScope[name] = numVal;
      }

      // Safely evaluate expression using mathjs
      const evaluated = evaluate(formula.expression, parsedScope);

      // Handle divisions by zero or infinite values
      if (evaluated === Infinity || evaluated === -Infinity) {
        throw new Error('Result is infinite (possible division by zero).');
      }

      const formattedResult = typeof evaluated === 'number' ? Number(evaluated.toFixed(4)) : String(evaluated);

      setFormulaResults((prev) => ({
        ...prev,
        [formulaId]: {
          result: formattedResult,
          error: null,
        },
      }));
    } catch (calcError) {
      setFormulaResults((prev) => ({
        ...prev,
        [formulaId]: {
          result: null,
          error: calcError.message || 'Error evaluating mathematical formula.',
        },
      }));
    }
  };

  if (loading) {
    return <Loader message="Loading digital laboratory manual..." />;
  }

  if (error || !experiment) {
    return (
      <div className="page-container">
        <ErrorMessage error={error || 'Experiment manual not found.'} />
        <Link to="/student/experiments" className="btn btn-outline btn-sm">
          ← Back to Experiments
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Breadcrumb & Navigation */}
      <div style={{ marginBottom: '16px' }}>
        <Link to="/student/experiments" style={{ fontSize: '13px', color: 'var(--primary-color)', textDecoration: 'none' }}>
          ← Back to All Experiments
        </Link>
      </div>

      {/* Manual Header */}
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
            <span className="badge badge-info">{experiment.code}</span>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Laboratory Room: {experiment.lab?.roomNo || 'ECE Practical Lab'}
            </span>
          </div>
          <h1 className="page-title">{experiment.title}</h1>
        </div>
        <Link to="/student/book" className="btn btn-primary btn-sm">
          Book Slot For This Experiment
        </Link>
      </div>

      {/* Circuit Schematic Illustration Banner */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', margin: '0 0 12px 0', color: 'var(--secondary-color)' }}>
          ⚡ Experimental Circuit & Block Diagram
        </h3>
        <ExperimentImage code={experiment.code} height={160} />
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Apparatus & Lab Equipment</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{experiment.labName || 'Assigned laboratory'}</span>
        </div>
        <div className="card-body">
          {labEquipment.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>No apparatus is registered for this laboratory yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
              {labEquipment.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  <ComponentImage name={item.name} category={item.category || ''} size={58} />
                  <div>
                    <strong style={{ display: 'block', fontSize: '13px' }}>{item.name}</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{item.assetTag || item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Aim & Theory */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">🎯 Aim & Theoretical Foundation</h2>
        </div>
        <div className="card-body">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--secondary-color)' }}>Aim:</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>{experiment.aim}</p>
          </div>

          <div>
            <h3 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--secondary-color)' }}>Theory & Working Principle:</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {experiment.theory}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Safety & Laboratory Precautions */}
      {experiment.safetyNotes && (
        <div className="alert alert-warning" style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong>Laboratory Safety & Apparatus Guidelines:</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px' }}>{experiment.safetyNotes}</p>
          </div>
        </div>
      )}

      {/* Section 3: Required Apparatus & Components Checklist */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">📦 Required Apparatus & Component Checklist</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Allocated per student workbench
          </span>
        </div>
        <div className="card-body">
          {!experiment.components || experiment.components.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Standard electronics workbench apparatus required.
            </p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '90px' }}>Symbol</th>
                    <th style={{ width: '60px' }}>Part</th>
                    <th>Component Name</th>
                    <th>Category</th>
                    <th>Quantity Required</th>
                    <th>Inventory Status</th>
                  </tr>
                </thead>
                <tbody>
                  {experiment.components.map((comp) => {
                    const avail = comp.availableQuantity ?? 0;
                    const isAvailable = avail >= comp.quantityPerTeam;
                    const compName = comp.componentName || `Component #${comp.componentId}`;
                    const compCat = comp.componentCategory || 'Discrete';

                    return (
                      <tr key={comp.id}>
                        <td><ComponentSymbol name={compName} size={74} /></td>
                        <td><ComponentImage name={compName} category={compCat} size={42} /></td>
                        <td><strong>{compName}</strong></td>
                        <td><span className="badge badge-secondary">{compCat}</span></td>
                        <td>{comp.quantityPerTeam} units / bench</td>
                        <td>
                          {isAvailable ? (
                            <span className="badge badge-success">✓ In Stock ({avail} available)</span>
                          ) : (
                            <span className="badge badge-warning">Low Reserve ({avail} available)</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Ordered Procedure Steps with Interactive Checklist */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">📋 Step-by-Step Practical Procedure</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Check items as you wire and test the setup on your workbench
          </span>
        </div>
        <div className="card-body">
          {!experiment.steps || experiment.steps.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              No procedure steps configured for this experiment.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experiment.steps.map((st) => {
                const isDone = Boolean(completedSteps[st.stepNo]);
                return (
                  <div
                    key={st.id || st.stepNo}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: isDone ? '#f0fdf4' : 'var(--bg-primary)',
                      border: `1px solid ${isDone ? '#86efac' : 'var(--border-color)'}`,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <input
                      type="checkbox"
                      id={`step-${st.stepNo}`}
                      checked={isDone}
                      onChange={() => handleToggleStep(st.stepNo)}
                      style={{ marginTop: '3px', cursor: 'pointer' }}
                    />
                    <label
                      htmlFor={`step-${st.stepNo}`}
                      style={{
                        margin: 0,
                        cursor: 'pointer',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        flex: 1,
                        textDecoration: isDone ? 'line-through' : 'none',
                        color: isDone ? 'var(--text-secondary)' : 'var(--text-primary)',
                      }}
                    >
                      <strong>Step {st.stepNo}:</strong> {st.instruction}
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Editable Digital Observation Table */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">📊 Digital Observation Table</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Record electrical meter readings live during your experiment
            </span>
          </div>
          <button onClick={handleAddObservationRow} className="btn btn-outline btn-sm">
            + Add Reading Row
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>S.No</th>
                  <th>Applied Input (e.g. Voltage V)</th>
                  <th>Measured Output (e.g. Current mA)</th>
                  <th>Observations / Remarks</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {observationRows.map((row, idx) => (
                  <tr key={row.id}>
                    <td><strong>{idx + 1}</strong></td>
                    <td>
                      <input
                        type="text"
                        value={row.col1}
                        onChange={(e) => handleUpdateObservationCell(row.id, 'col1', e.target.value)}
                        placeholder="e.g. 0.5 V"
                        className="form-control"
                        style={{ padding: '6px 8px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.col2}
                        onChange={(e) => handleUpdateObservationCell(row.id, 'col2', e.target.value)}
                        placeholder="e.g. 5.2 mA"
                        className="form-control"
                        style={{ padding: '6px 8px', fontSize: '13px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.col3}
                        onChange={(e) => handleUpdateObservationCell(row.id, 'col3', e.target.value)}
                        placeholder="e.g. Linear conduction"
                        className="form-control"
                        style={{ padding: '6px 8px', fontSize: '13px' }}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteObservationRow(row.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', color: 'var(--danger-color)', fontSize: '12px' }}
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Section 6: Interactive Calculation Helper (Powered safely by MathJS) */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">🧮 Interactive Formula Calculation Helper</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Evaluate experimental formulas safely with real-time MathJS verification
            </span>
          </div>
        </div>
        <div className="card-body">
          {!experiment.formulas || experiment.formulas.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              No quantitative calculation formulas configured for this manual.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {experiment.formulas.map((f) => {
                const formulaResult = formulaResults[f.id];
                const varList = f.variables
                  ? f.variables.split(',').map((v) => v.trim()).filter(Boolean)
                  : [];

                return (
                  <div
                    key={f.id}
                    className="card"
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <h3 style={{ fontSize: '15px', margin: 0, color: 'var(--secondary-color)' }}>
                        {f.label}
                      </h3>
                      <span className="badge badge-info" style={{ fontFamily: 'monospace', fontSize: '13px' }}>
                        {f.expression} {f.unit ? `(${f.unit})` : ''}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Enter your measured variable values below to compute the analytical parameter:
                    </p>

                    {/* Variable inputs grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                      {varList.map((varName) => (
                        <div key={varName} className="form-group" style={{ margin: 0 }}>
                          <label className="form-label" style={{ fontSize: '12px', marginBottom: '2px' }}>
                            {varName}
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder={`Enter ${varName}`}
                            value={formulaInputs[f.id]?.[varName] ?? ''}
                            onChange={(e) => handleVariableChange(f.id, varName, e.target.value)}
                            className="form-control"
                            style={{ padding: '6px 8px', fontSize: '13px' }}
                          />
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleCalculateFormula(f)}
                        className="btn btn-primary btn-sm"
                      >
                        Calculate {f.label}
                      </button>

                      {/* Display Computed Answer */}
                      {formulaResult?.result !== undefined && formulaResult?.result !== null && (
                        <div
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #10b981',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            color: '#065f46',
                            fontWeight: 'bold',
                            fontSize: '14px',
                          }}
                        >
                          Result: {formulaResult.result} {f.unit || ''}
                        </div>
                      )}

                      {/* Display Calculation Error */}
                      {formulaResult?.error && (
                        <div
                          style={{
                            background: '#fef2f2',
                            border: '1px solid #ef4444',
                            padding: '6px 14px',
                            borderRadius: '4px',
                            color: '#991b1b',
                            fontSize: '13px',
                          }}
                        >
                          ⚠️ {formulaResult.error}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {role === 'STUDENT' && (
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <div>
              <h2 className="card-title">Submit Experiment Results</h2>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Finish every procedure step and enter at least one observation before submitting.
              </span>
            </div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label htmlFor="experiment-conclusion" className="form-label">Conclusion</label>
              <textarea
                id="experiment-conclusion"
                className="form-control"
                rows="3"
                value={conclusion}
                onChange={(event) => { setConclusion(event.target.value); setSubmissionResult(null); }}
                placeholder="Summarize your result and any deviations."
              />
            </div>
            {submissionError && <ErrorMessage error={submissionError} onDismiss={() => setSubmissionError(null)} />}
            {submissionResult && (
              <div className="alert alert-success" role="status">
                Results submitted successfully. Submission #{submissionResult.id} recorded at {new Date(submissionResult.submittedAt).toLocaleString()}.
              </div>
            )}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!allStepsComplete || !hasObservationValues || isSubmitting}
              onClick={handleSubmitExperiment}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Experiment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperimentGuidePage;
