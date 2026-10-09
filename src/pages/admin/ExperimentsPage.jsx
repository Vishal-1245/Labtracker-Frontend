import React, { useState, useEffect } from 'react';
import { getLabs } from '../../api/labApi';
import { getComponents } from '../../api/componentApi';
import {
  getExperiments,
  getExperimentById,
  createExperiment,
  updateExperiment,
  deleteExperiment,
} from '../../api/experimentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ExperimentImage from '../../components/common/ExperimentImage';

// Admin page managing laboratory curriculum experiments, procedures, components, and formulas
const ExperimentsPage = () => {
  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState('');
  const [experiments, setExperiments] = useState([]);
  const [labComponents, setLabComponents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // View Details Modal
  const [detailedExp, setDetailedExp] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [formData, setFormData] = useState({
    labId: '',
    code: '',
    title: '',
    aim: '',
    theory: '',
    observationFormat: '',
    conclusionNote: '',
    safetyNotes: '',
    steps: [{ stepNo: 1, instruction: '' }],
    components: [],
    formulas: [],
  });
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete target
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Initial load of labs
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const labsData = await getLabs();
        setLabs(labsData);
        if (labsData.length > 0) {
          setSelectedLabId(labsData[0].id.toString());
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch experiments and components whenever selected lab changes
  const fetchExperimentsAndComponents = async (labId) => {
    if (!labId) return;
    setLoading(true);
    setError(null);
    try {
      const [expList, compList] = await Promise.all([
        getExperiments(labId),
        getComponents(labId),
      ]);
      setExperiments(expList);
      setLabComponents(compList);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLabId) {
      fetchExperimentsAndComponents(selectedLabId);
    }
  }, [selectedLabId]);

  // View full experiment details
  const handleViewDetails = async (expId) => {
    setLoadingDetails(true);
    try {
      const fullExp = await getExperimentById(expId);
      setDetailedExp(fullExp);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingExp(null);
    setFormData({
      labId: selectedLabId || (labs[0]?.id?.toString() || ''),
      code: '',
      title: '',
      aim: '',
      theory: '',
      observationFormat: '',
      conclusionNote: '',
      safetyNotes: '',
      steps: [{ stepNo: 1, instruction: '' }],
      components: [],
      formulas: [],
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = async (exp) => {
    setModalError(null);
    try {
      const fullExp = await getExperimentById(exp.id);
      setEditingExp(fullExp);
      setFormData({
        labId: fullExp.labId?.toString() || selectedLabId,
        code: fullExp.code || '',
        title: fullExp.title || '',
        aim: fullExp.aim || '',
        theory: fullExp.theory || '',
        observationFormat: fullExp.observationFormat || '',
        conclusionNote: fullExp.conclusionNote || '',
        safetyNotes: fullExp.safetyNotes || '',
        steps: fullExp.steps && fullExp.steps.length > 0
          ? fullExp.steps.map((s) => ({ stepNo: s.stepNo, instruction: s.instruction }))
          : [{ stepNo: 1, instruction: '' }],
        components: fullExp.components && fullExp.components.length > 0
          ? fullExp.components.map((c) => ({
              componentId: c.componentId || c.component?.id,
              quantityPerTeam: c.quantityPerTeam || 1,
            }))
          : [],
        formulas: fullExp.formulas && fullExp.formulas.length > 0
          ? fullExp.formulas.map((f) => ({
              label: f.label,
              expression: f.expression,
              variables: f.variables,
              unit: f.unit || '',
            }))
          : [],
      });
      setIsModalOpen(true);
    } catch (err) {
      setError(err);
    }
  };

  // Step builder helpers
  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { stepNo: formData.steps.length + 1, instruction: '' }],
    });
  };

  const handleStepChange = (index, value) => {
    const updated = [...formData.steps];
    updated[index].instruction = value;
    setFormData({ ...formData, steps: updated });
  };

  const handleRemoveStep = (index) => {
    const updated = formData.steps.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      stepNo: idx + 1,
    }));
    setFormData({ ...formData, steps: updated });
  };

  // Component requirements builder helpers
  const handleAddComponent = () => {
    if (labComponents.length === 0) return;
    setFormData({
      ...formData,
      components: [
        ...formData.components,
        { componentId: labComponents[0].id, quantityPerTeam: 1 },
      ],
    });
  };

  const handleComponentChange = (index, field, value) => {
    const updated = [...formData.components];
    updated[index][field] = value;
    setFormData({ ...formData, components: updated });
  };

  const handleRemoveComponent = (index) => {
    setFormData({
      ...formData,
      components: formData.components.filter((_, i) => i !== index),
    });
  };

  // Formula builder helpers
  const handleAddFormula = () => {
    setFormData({
      ...formData,
      formulas: [
        ...formData.formulas,
        { label: '', expression: '', variables: '', unit: '' },
      ],
    });
  };

  const handleFormulaChange = (index, field, value) => {
    const updated = [...formData.formulas];
    updated[index][field] = value;
    setFormData({ ...formData, formulas: updated });
  };

  const handleRemoveFormula = (index) => {
    setFormData({
      ...formData,
      formulas: formData.formulas.filter((_, i) => i !== index),
    });
  };

  // Save experiment
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.labId || !formData.code.trim() || !formData.title.trim()) {
      setModalError('Lab, Experiment Code, and Title are required.');
      return;
    }

    if (!formData.aim.trim() || !formData.theory.trim()) {
      setModalError('Aim and Theory are required.');
      return;
    }

    // Clean steps
    const validSteps = formData.steps
      .filter((s) => s.instruction.trim().length > 0)
      .map((s, idx) => ({ stepNo: idx + 1, instruction: s.instruction.trim() }));

    const payload = {
      labId: parseInt(formData.labId, 10),
      code: formData.code.trim(),
      title: formData.title.trim(),
      aim: formData.aim.trim(),
      theory: formData.theory.trim(),
      observationFormat: formData.observationFormat.trim(),
      conclusionNote: formData.conclusionNote.trim(),
      safetyNotes: formData.safetyNotes.trim(),
      steps: validSteps,
      components: formData.components.map((c) => ({
        componentId: parseInt(c.componentId, 10),
        quantityPerTeam: parseInt(c.quantityPerTeam, 10) || 1,
      })),
      formulas: formData.formulas
        .filter((f) => f.label.trim() && f.expression.trim())
        .map((f) => ({
          label: f.label.trim(),
          expression: f.expression.trim(),
          variables: f.variables.trim(),
          unit: f.unit ? f.unit.trim() : '',
        })),
    };

    setIsSubmitting(true);
    try {
      if (editingExp) {
        await updateExperiment(editingExp.id, payload);
        setActionSuccess(`Experiment '${payload.title}' updated.`);
      } else {
        await createExperiment(payload);
        setActionSuccess(`Experiment '${payload.title}' registered.`);
      }

      setIsModalOpen(false);
      fetchExperimentsAndComponents(payload.labId);
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete confirmation
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExperiment(deleteTarget.id);
      setActionSuccess(`Experiment '${deleteTarget.title}' removed.`);
      setDeleteTarget(null);
      fetchExperimentsAndComponents(selectedLabId);
    } catch (err) {
      setError(err);
      setDeleteTarget(null);
    }
  };

  const filteredExperiments = experiments.filter((e) =>
    e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum Experiments</h1>
          <p className="page-subtitle">
            Manage laboratory experiments, procedure steps, required components, and formulas
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
          + Add Experiment
        </button>
      </div>

      {actionSuccess && (
        <div className="alert alert-success" style={{ marginBottom: '16px' }}>
          ✓ {actionSuccess}
          <button
            onClick={() => setActionSuccess('')}
            style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {/* Lab Selector and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '280px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Filter by Laboratory</label>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="form-control"
            >
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name} ({lab.roomNo})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Search Experiments</label>
            <input
              type="text"
              placeholder="Search by code or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'flex-end', paddingBottom: '8px' }}>
            Showing <strong>{filteredExperiments.length}</strong> experiments
          </div>
        </div>
      </div>

      {/* Experiments List */}
      {loading ? (
        <Loader message="Loading experiments..." />
      ) : filteredExperiments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-title">No Experiments Found</div>
          <p className="empty-text">
            {searchQuery
              ? 'No experiments match your search query.'
              : 'No experiments registered for this laboratory yet.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '85px' }}>Schematic</th>
                  <th>Code</th>
                  <th>Experiment Title</th>
                  <th>Steps</th>
                  <th>Components</th>
                  <th>Formulas</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExperiments.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <ExperimentImage code={exp.code} title={exp.title} height={46} />
                    </td>
                    <td>
                      <code>{exp.code}</code>
                    </td>
                    <td>
                      <strong>{exp.title}</strong>
                    </td>
                    <td>
                      <span className="badge badge-secondary">
                        {exp.steps ? exp.steps.length : 0} Steps
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {exp.components ? exp.components.length : 0} Items
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {exp.formulas ? exp.formulas.length : 0} Formulas
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleViewDetails(exp.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Manual
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(exp)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(exp)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger-color)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Experiment Manual Modal */}
      {detailedExp && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-info" style={{ marginBottom: '4px' }}>{detailedExp.code}</span>
                <h3 className="modal-title">{detailedExp.title}</h3>
              </div>
              <button onClick={() => setDetailedExp(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <ExperimentImage code={detailedExp.code} title={detailedExp.title} height={140} />
              </div>

              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--secondary-color)' }}>🎯 Aim</h4>
                <p style={{ margin: 0, fontSize: '13px' }}>{detailedExp.aim}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--secondary-color)' }}>💡 Theory</h4>
                <p style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-line' }}>{detailedExp.theory}</p>
              </div>

              {detailedExp.safetyNotes && (
                <div className="alert alert-warning" style={{ fontSize: '12px' }}>
                  <strong>⚠️ Safety Notes:</strong> {detailedExp.safetyNotes}
                </div>
              )}

              {/* Procedure Steps */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--secondary-color)' }}>📋 Procedure Steps</h4>
                {(!detailedExp.steps || detailedExp.steps.length === 0) ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No procedure steps listed.</p>
                ) : (
                  <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
                    {detailedExp.steps.map((st) => (
                      <li key={st.id || st.stepNo} style={{ marginBottom: '4px' }}>
                        {st.instruction}
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {/* Required Components */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--secondary-color)' }}>📦 Required Components</h4>
                {(!detailedExp.components || detailedExp.components.length === 0) ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No components listed.</p>
                ) : (
                  <table className="data-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Category</th>
                        <th>Quantity Per Team</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedExp.components.map((comp) => (
                        <tr key={comp.id}>
                          <td><strong>{comp.component?.name || `Component #${comp.componentId}`}</strong></td>
                          <td>{comp.component?.category || '-'}</td>
                          <td>{comp.quantityPerTeam} units</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Formulas */}
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--secondary-color)' }}>🧮 Calculation Formulas</h4>
                {(!detailedExp.formulas || detailedExp.formulas.length === 0) ? (
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No formulas configured.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {detailedExp.formulas.map((f) => (
                      <div key={f.id} style={{ background: 'var(--bg-primary)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px' }}>{f.label}: </span>
                        <code>{f.expression}</code>
                        {f.unit && <span style={{ marginLeft: '8px', color: 'var(--text-secondary)' }}>({f.unit})</span>}
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          Variables: {f.variables}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setDetailedExp(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Experiment Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingExp ? `Edit Experiment: ${editingExp.code}` : 'Create New Experiment'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Laboratory <span className="required">*</span></label>
                    <select
                      value={formData.labId}
                      onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                      className="form-control"
                      required
                    >
                      {labs.map((lab) => (
                        <option key={lab.id} value={lab.id}>
                          {lab.name} ({lab.roomNo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <FormInput
                    label="Experiment Code"
                    name="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. EDC-EXP-01"
                    required
                  />
                </div>

                <FormInput
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. V-I Characteristics of PN Junction Diode"
                  required
                />

                <FormInput
                  label="Aim"
                  name="aim"
                  type="textarea"
                  rows={2}
                  value={formData.aim}
                  onChange={(e) => setFormData({ ...formData, aim: e.target.value })}
                  placeholder="To plot the V-I characteristics of PN junction diode in forward and reverse bias..."
                  required
                />

                <FormInput
                  label="Theory"
                  name="theory"
                  type="textarea"
                  rows={3}
                  value={formData.theory}
                  onChange={(e) => setFormData({ ...formData, theory: e.target.value })}
                  placeholder="A PN junction diode is a two-terminal semiconductor device..."
                  required
                />

                <FormInput
                  label="Safety Notes"
                  name="safetyNotes"
                  value={formData.safetyNotes}
                  onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
                  placeholder="e.g. Do not exceed diode reverse breakdown voltage rating."
                />

                {/* Steps Section */}
                <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px' }}>📋 Procedure Steps</h4>
                    <button type="button" onClick={handleAddStep} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }}>
                      + Add Step
                    </button>
                  </div>
                  {formData.steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '12px', width: '24px' }}>{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Step ${idx + 1} instruction...`}
                        value={step.instruction}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        className="form-control"
                        style={{ flex: 1 }}
                        required
                      />
                      {formData.steps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--danger-color)' }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Components Required Section */}
                <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px' }}>📦 Component Requirements</h4>
                    <button
                      type="button"
                      onClick={handleAddComponent}
                      disabled={labComponents.length === 0}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '2px 8px', fontSize: '12px' }}
                    >
                      + Add Component
                    </button>
                  </div>
                  {labComponents.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      No components available in this lab inventory yet.
                    </p>
                  ) : formData.components.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      No required components added yet.
                    </p>
                  ) : (
                    formData.components.map((comp, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                        <select
                          value={comp.componentId}
                          onChange={(e) => handleComponentChange(idx, 'componentId', e.target.value)}
                          className="form-control"
                          style={{ flex: 2 }}
                        >
                          {labComponents.map((lc) => (
                            <option key={lc.id} value={lc.id}>
                              {lc.name} ({lc.category})
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={comp.quantityPerTeam}
                          onChange={(e) => handleComponentChange(idx, 'quantityPerTeam', e.target.value)}
                          className="form-control"
                          style={{ width: '80px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveComponent(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--danger-color)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Formulas Section */}
                <div className="card" style={{ padding: '12px', background: 'var(--bg-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px' }}>🧮 Calculation Formulas (Used with MathJS)</h4>
                    <button type="button" onClick={handleAddFormula} className="btn btn-outline btn-sm" style={{ padding: '2px 8px', fontSize: '12px' }}>
                      + Add Formula
                    </button>
                  </div>
                  {formData.formulas.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      No formulas added. Add formulas for automatic student calculation & verification.
                    </p>
                  ) : (
                    formData.formulas.map((f, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1.5fr 1fr auto', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                        <input
                          type="text"
                          placeholder="Label (e.g. Resistance)"
                          value={f.label}
                          onChange={(e) => handleFormulaChange(idx, 'label', e.target.value)}
                          className="form-control"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Expr (e.g. V / I)"
                          value={f.expression}
                          onChange={(e) => handleFormulaChange(idx, 'expression', e.target.value)}
                          className="form-control"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Vars (e.g. V,I)"
                          value={f.variables}
                          onChange={(e) => handleFormulaChange(idx, 'variables', e.target.value)}
                          className="form-control"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Unit (e.g. Ω)"
                          value={f.unit}
                          onChange={(e) => handleFormulaChange(idx, 'unit', e.target.value)}
                          className="form-control"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFormula(idx)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--danger-color)' }}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                >
                  {isSubmitting ? 'Saving...' : editingExp ? 'Update Experiment' : 'Create Experiment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Experiment"
        message={`Are you sure you want to delete '${deleteTarget?.title}' (${deleteTarget?.code})?`}
        confirmText="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default ExperimentsPage;
