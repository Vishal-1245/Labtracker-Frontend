import { useState } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import {
  getEquipment,
  getMaintenanceLogs,
  reportMaintenance,
  resolveMaintenance,
} from '../../api/equipmentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Equipment maintenance tracking: reporting instrument malfunctions and closing maintenance tickets
const MaintenancePage = () => {
  const [logs, setLogs] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filter
  const [statusFilter, setStatusFilter] = useState('UNRESOLVED');

  // Report Defect Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Resolve Ticket Confirmation
  const [resolveTarget, setResolveTarget] = useState(null);

  const fetchLogsAndEquipment = async () => {
    setError(null);
    try {
      const [logsData, eqData] = await Promise.all([
        getMaintenanceLogs(),
        getEquipment(),
      ]);
      setLogs(logsData);
      setEquipmentList(eqData);

      setSelectedEquipmentId((currentId) =>
        eqData.some((equipment) => equipment.id.toString() === currentId)
          ? currentId
          : eqData[0]?.id.toString() || ''
      );
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchLogsAndEquipment);

  // Filter tickets
  const filteredLogs = logs.filter((l) => {
    if (statusFilter === 'UNRESOLVED') return !l.resolved;
    if (statusFilter === 'RESOLVED') return l.resolved;
    return true;
  });

  // Report maintenance defect
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedEquipmentId || !issueDescription.trim()) {
      setModalError('Equipment and issue description are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportMaintenance(parseInt(selectedEquipmentId, 10), {
        issue: issueDescription.trim(),
      });

      setActionSuccess('Maintenance ticket logged. Instrument marked as UNDER MAINTENANCE.');
      setIsReportModalOpen(false);
      setIssueDescription('');
      fetchLogsAndEquipment();
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve ticket
  const handleConfirmResolve = async () => {
    if (!resolveTarget) return;
    try {
      await resolveMaintenance(resolveTarget.id);
      setActionSuccess(`Maintenance ticket #${resolveTarget.id} resolved. Instrument returned to AVAILABLE.`);
      setResolveTarget(null);
      fetchLogsAndEquipment();
    } catch (err) {
      setError(err);
      setResolveTarget(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Maintenance & Service</h1>
          <p className="page-subtitle">
            Log equipment malfunctions, track service tickets, and restore repaired instruments to service
          </p>
        </div>
        <button onClick={() => { setModalError(null); setIsReportModalOpen(true); }} className="btn btn-primary btn-sm">
          + Report Equipment Fault
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

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
            <label className="form-label" style={{ marginBottom: '4px' }}>Ticket Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="UNRESOLVED">Active / Open Tickets</option>
              <option value="RESOLVED">Resolved Tickets</option>
              <option value="ALL">All Maintenance Records</option>
            </select>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'flex-end', paddingBottom: '8px' }}>
            Showing <strong>{filteredLogs.length}</strong> service tickets
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      {loading ? (
        <Loader message="Loading maintenance tickets..." />
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛠️</div>
          <div className="empty-title">No Maintenance Tickets</div>
          <p className="empty-text">
            {statusFilter === 'UNRESOLVED'
              ? '✓ No open maintenance issues reported. All apparatus units are operational.'
              : 'No service records match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Equipment Asset</th>
                  <th>Reported Issue</th>
                  <th>Date Logged</th>
                  <th>Status</th>
                  <th>Resolution Details</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td><code>#{log.id}</code></td>
                    <td>
                      <strong>{log.equipmentName || `Equipment #${log.equipmentId}`}</strong><br />
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        Tag: {log.equipmentAssetTag || 'N/A'}
                      </span>
                    </td>
                    <td>{log.issueDescription}</td>
                    <td>{log.reportedAt ? new Date(log.reportedAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <StatusBadge status={log.resolved ? 'COMPLETED' : 'UNDER_MAINTENANCE'} />
                    </td>
                    <td>
                      {log.resolved ? (
                        <span style={{ color: 'var(--success-color)', fontSize: '13px' }}>
                          ✓ {log.resolutionNotes || 'Fixed & Calibrated'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--warning-color)', fontSize: '13px' }}>
                          Pending Inspection
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {!log.resolved && (
                        <button
                          onClick={() => setResolveTarget(log)}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            borderColor: 'var(--success-color)',
                            color: 'var(--success-color)',
                          }}
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report Defect Modal */}
      {isReportModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Report Equipment Defect / Fault</h3>
              <button onClick={() => setIsReportModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleReportSubmit}>
              <div className="modal-body">
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

                <div className="form-group">
                  <label className="form-label">Select Equipment Apparatus <span className="required">*</span></label>
                  <select
                    value={selectedEquipmentId}
                    onChange={(e) => setSelectedEquipmentId(e.target.value)}
                    className="form-control"
                    required
                  >
                    {equipmentList.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.name} ({eq.assetTag}) — {eq.status}
                      </option>
                    ))}
                  </select>
                </div>

                <FormInput
                  label="Observed Defect / Issue Description"
                  name="issueDescription"
                  type="textarea"
                  rows={3}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="e.g. Channel 1 probe attenuation erratic; display backlight flickering."
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
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
                  {isSubmitting ? 'Submitting...' : 'Log Defect Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(resolveTarget)}
        title="Resolve Maintenance Ticket"
        message={`Confirm that '${resolveTarget?.equipmentName || `Ticket #${resolveTarget?.id}`}' has been repaired, tested, and calibrated? This will restore its status to AVAILABLE.`}
        confirmText="Confirm Resolution"
        onConfirm={handleConfirmResolve}
        onCancel={() => setResolveTarget(null)}
      />
    </div>
  );
};

export default MaintenancePage;
