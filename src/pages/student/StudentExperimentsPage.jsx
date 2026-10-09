import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getLabs } from '../../api/labApi';
import { getExperiments } from '../../api/experimentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ExperimentImage from '../../components/common/ExperimentImage';

// Digital syllabus experiment catalog for students with circuit schematics
const StudentExperimentsPage = () => {
  const [searchParams] = useSearchParams();
  const initialLabId = searchParams.get('labId') || '';

  const [labs, setLabs] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState(initialLabId);
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial load of labs
  useEffect(() => {
    const fetchLabs = async () => {
      setLoading(true);
      setError(null);
      try {
        const labsData = await getLabs();
        setLabs(labsData);
        if (!selectedLabId && labsData.length > 0) {
          setSelectedLabId(labsData[0].id.toString());
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, []);

  // Fetch experiments when selected lab changes
  useEffect(() => {
    if (!selectedLabId) return;

    const fetchExp = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getExperiments(selectedLabId);
        setExperiments(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchExp();
  }, [selectedLabId]);

  const filteredExperiments = experiments.filter((e) =>
    e.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedLabObj = labs.find((l) => l.id.toString() === selectedLabId);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Digital Laboratory Manuals</h1>
          <p className="page-subtitle">
            Curriculum practical procedures, circuit schematics, component checklists, and calculation guides
          </p>
        </div>
      </div>

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {/* Lab Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '300px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Select Laboratory</label>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="form-control"
            >
              {labs.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.roomNo})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1 1 240px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Search by Code or Title</label>
            <input
              type="text"
              placeholder="e.g. EDC, DSP, MPMC, VLSI, Diode, Adder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'flex-end', paddingBottom: '8px' }}>
            Showing <strong>{filteredExperiments.length}</strong> experiments in {selectedLabObj?.roomNo}
          </div>
        </div>
      </div>

      {/* Experiments Grid with Schematics */}
      {loading ? (
        <Loader message="Loading curriculum experiment manuals..." />
      ) : filteredExperiments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📖</div>
          <div className="empty-title">No Experiments Found</div>
          <p className="empty-text">
            No experiments found matching the selected laboratory or search criteria.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '22px' }}>
          {filteredExperiments.map((exp) => (
            <div key={exp.id} className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                <ExperimentImage code={exp.code} height={140} />
              </div>

              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-info">{exp.code}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Room: {selectedLabObj?.roomNo}
                  </span>
                </div>

                <h3 style={{ fontSize: '16px', margin: '0 0 10px 0', color: 'var(--secondary-color)' }}>
                  {exp.title}
                </h3>

                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px 0', flex: 1, lineHeight: '1.5' }}>
                  {exp.aim.length > 130 ? `${exp.aim.substring(0, 130)}...` : exp.aim}
                </p>

                {/* Feature tags */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                    📋 {exp.steps ? exp.steps.length : 0} Steps
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                    📦 {exp.components ? exp.components.length : 0} Components
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '11px' }}>
                    🧮 {exp.formulas ? exp.formulas.length : 0} Formulas
                  </span>
                </div>

                <Link
                  to={`/student/experiments/${exp.id}`}
                  className="btn btn-primary btn-sm"
                  style={{ textAlign: 'center', width: '100%' }}
                >
                  Open Experiment Guide & Manual →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentExperimentsPage;
