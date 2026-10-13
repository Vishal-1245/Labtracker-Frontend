import { useState } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import { getLabs } from '../../api/labApi';
import {
  getEquipment,
  createEquipment,
  updateEquipment,
  updateEquipmentStatus,
  getMaintenanceLogs,
  reportMaintenance,
  resolveMaintenance,
} from '../../api/equipmentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import FormInput from '../../components/common/FormInput';
import ComponentImage from '../../components/common/ComponentImage';

const CATEGORIES = [
  { value: 'OSCILLOSCOPE', label: 'Oscilloscope' },
  { value: 'FUNCTION_GENERATOR', label: 'Function Generator' },
  { value: 'POWER_SUPPLY', label: 'Power Supply' },
  { value: 'TRAINER_KIT', label: 'Trainer Kit' },
  { value: 'MULTIMETER', label: 'Multimeter' },
  { value: 'OTHER', label: 'Other Equipment' },
];

// Admin page managing departmental equipment inventory, calibration schedules, and operational states
const EquipmentPage = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [selectedLab, setSelectedLab] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // View mode: 'grid' (catalog cards) or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Create / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    category: 'OSCILLOSCOPE',
    labId: '',
    status: 'AVAILABLE',
    nextCalibrationDate: '',
  });
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maintenance Log Modal State
  const [viewingLogsFor, setViewingLogsFor] = useState(null);
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const fetchLabsAndEquipment = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [labsData, eqData] = await Promise.all([
        getLabs(),
        getEquipment(),
      ]);
      setLabs(labsData);
      setEquipmentList(eqData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchLabsAndEquipment);

  // Filter equipment
  const filteredEquipment = equipmentList.filter((eq) => {
    const matchesLab = selectedLab === 'ALL' || eq.labId?.toString() === selectedLab;
    const matchesCategory = selectedCategory === 'ALL' || eq.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || eq.status === selectedStatus;
    const matchesSearch =
      eq.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eq.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesLab && matchesCategory && matchesStatus && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      assetTag: '',
      name: '',
      category: 'OSCILLOSCOPE',
      labId: labs[0]?.id?.toString() || '',
      status: 'AVAILABLE',
      nextCalibrationDate: '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      assetTag: item.assetTag,
      name: item.name,
      category: item.category,
      labId: item.labId?.toString() || '',
      status: item.status,
      nextCalibrationDate: item.nextCalibrationDate || '',
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.assetTag.trim() || !formData.name.trim() || !formData.labId) {
      setModalError('Asset tag, equipment name, and lab assignment are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        assetTag: formData.assetTag.trim(),
        name: formData.name.trim(),
        category: formData.category,
        labId: parseInt(formData.labId, 10),
        status: formData.status,
        nextCalibrationDate: formData.nextCalibrationDate || null,
      };

      if (editingItem) {
        await updateEquipment(editingItem.id, payload);
        setActionSuccess(`Equipment '${payload.assetTag}' updated.`);
      } else {
        await createEquipment(payload);
        setActionSuccess(`Equipment '${payload.assetTag}' registered.`);
      }

      setIsModalOpen(false);
      fetchLabsAndEquipment();
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle status between AVAILABLE and UNDER_MAINTENANCE
  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'AVAILABLE' ? 'UNDER_MAINTENANCE' : 'AVAILABLE';
    try {
      await updateEquipmentStatus(item.id, newStatus);
      setActionSuccess(`Status of '${item.assetTag}' changed to ${newStatus}.`);
      fetchLabsAndEquipment();
    } catch (err) {
      setError(err);
    }
  };

  // Defect logging inside modal state
  const [logIssueText, setLogIssueText] = useState('');
  const [isLoggingIssue, setIsLoggingIssue] = useState(false);

  // View maintenance logs for an asset
  const handleViewLogs = async (item) => {
    setViewingLogsFor(item);
    setLogIssueText('');
    setLoadingLogs(true);
    try {
      const logs = await getMaintenanceLogs({ equipmentId: item.id });
      setMaintenanceLogs(logs);
    } catch (err) {
      setError(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Direct log defect handler inside modal
  const handleReportIssueInModal = async (e) => {
    e.preventDefault();
    if (!logIssueText.trim() || !viewingLogsFor) return;
    setIsLoggingIssue(true);
    try {
      await reportMaintenance(viewingLogsFor.id, { issue: logIssueText.trim() });
      setActionSuccess(`Maintenance issue logged for '${viewingLogsFor.assetTag}'. Asset marked UNDER MAINTENANCE.`);
      setLogIssueText('');
      const updatedLogs = await getMaintenanceLogs({ equipmentId: viewingLogsFor.id });
      setMaintenanceLogs(updatedLogs);
      fetchLabsAndEquipment();
    } catch (err) {
      setError(err);
    } finally {
      setIsLoggingIssue(false);
    }
  };

  // Direct resolve ticket handler inside modal
  const handleResolveLog = async (logId) => {
    try {
      await resolveMaintenance(logId);
      setActionSuccess(`Maintenance ticket #${logId} resolved. Equipment restored to AVAILABLE.`);
      const updatedLogs = await getMaintenanceLogs({ equipmentId: viewingLogsFor.id });
      setMaintenanceLogs(updatedLogs);
      fetchLabsAndEquipment();
    } catch (err) {
      setError(err);
    }
  };

  // Helper to find lab name
  const getLabName = (labId) => {
    const l = labs.find((lab) => lab.id === labId);
    return l ? `${l.name} (${l.roomNo})` : `Lab #${labId}`;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Equipment Inventory</h1>
          <p className="page-subtitle">
            Track oscilloscopes, signal generators, power supplies, and workbench hardware
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
          + Add Equipment
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              placeholder="Tag or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div>
            <label className="form-label">Laboratory</label>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="form-control"
            >
              <option value="ALL">All Laboratories</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-control"
            >
              <option value="ALL">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="form-control"
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {!loading && filteredEquipment.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
          <div className="view-switcher">
            <button
              type="button"
              className={`view-switcher-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              Gallery
            </button>
            <button
              type="button"
              className={`view-switcher-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <Loader message="Loading equipment inventory..." />
      ) : filteredEquipment.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📟</div>
          <div className="empty-title">No Equipment Found</div>
          <p className="empty-text">
            No equipment items match the current filter selection.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="catalog-card-grid">
          {filteredEquipment.map((item) => (
            <div className="catalog-card" key={item.id}>
              <div className="catalog-card-img-box">
                <ComponentImage name={item.name} category={item.category} size={150} />
              </div>
              <div className="catalog-card-body">
                <h3 className="catalog-card-title">{item.name}</h3>
                <div className="catalog-card-meta">
                  {item.assetTag} • {item.category.replace(/_/g, ' ')}
                </div>
                <div className="catalog-card-badges">
                  <StatusBadge status={item.status} />
                  <span className="badge badge-secondary">{getLabName(item.labId)}</span>
                </div>
                <div className="catalog-card-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    className="btn btn-outline btn-sm"
                  >
                    {item.status === 'AVAILABLE' ? 'Set Maint.' : 'Set Avail.'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleViewLogs(item)}
                    className="btn btn-secondary btn-sm"
                  >
                    Logs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(item)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Preview</th>
                  <th>Asset Tag</th>
                  <th>Equipment Name</th>
                  <th>Category</th>
                  <th>Lab Assignment</th>
                  <th>Calibration Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipment.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <ComponentImage name={item.name} category={item.category} size={44} />
                    </td>
                    <td><code>{item.assetTag}</code></td>
                    <td><strong>{item.name}</strong></td>
                    <td>{item.category.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: '13px' }}>{getLabName(item.labId)}</td>
                    <td>
                      {item.nextCalibrationDate ? (
                        <span>{item.nextCalibrationDate}</span>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className="btn btn-outline btn-sm"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            borderColor: item.status === 'AVAILABLE' ? 'var(--warning-color)' : 'var(--success-color)',
                            color: item.status === 'AVAILABLE' ? 'var(--warning-color)' : 'var(--success-color)',
                          }}
                          title="Toggle operational status"
                        >
                          {item.status === 'AVAILABLE' ? 'Set Maint.' : 'Set Avail.'}
                        </button>
                        <button
                          onClick={() => handleViewLogs(item)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingItem ? `Edit Equipment: ${editingItem.assetTag}` : 'Register Equipment Asset'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

                <FormInput
                  label="Asset Tag"
                  name="assetTag"
                  value={formData.assetTag}
                  onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                  placeholder="e.g. ECE-DSO-05"
                  required
                />

                <FormInput
                  label="Equipment Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Digital Storage Oscilloscope (100MHz)"
                  required
                />

                <div className="form-group">
                  <label className="form-label">Category <span className="required">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="form-control"
                    required
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Laboratory Room <span className="required">*</span></label>
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

                <div className="form-group">
                  <label className="form-label">Operational Status <span className="required">*</span></label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="form-control"
                    required
                  >
                    <option value="AVAILABLE">AVAILABLE (Operational)</option>
                    <option value="UNDER_MAINTENANCE">UNDER_MAINTENANCE (Repair/Calibration)</option>
                  </select>
                </div>

                <FormInput
                  label="Next Calibration Date"
                  name="nextCalibrationDate"
                  type="date"
                  value={formData.nextCalibrationDate}
                  onChange={(e) => setFormData({ ...formData, nextCalibrationDate: e.target.value })}
                  helperText="Recommended periodic instrument calibration due date"
                />
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Asset' : 'Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Logs Modal */}
      {viewingLogsFor && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ComponentImage name={viewingLogsFor.name} category={viewingLogsFor.category} size={42} />
                <div>
                  <h3 className="modal-title" style={{ margin: 0 }}>
                    Maintenance & Service History: {viewingLogsFor.assetTag}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {viewingLogsFor.name} — {getLabName(viewingLogsFor.labId)}
                  </p>
                </div>
              </div>
              <button onClick={() => setViewingLogsFor(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              {/* Report New Defect Section */}
              <div className="card" style={{ marginBottom: '16px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', padding: '12px 16px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span> Log New Fault / Issue Report
                </h4>
                <form onSubmit={handleReportIssueInModal} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Probe damaged, calibration drift, screen flickers..."
                    value={logIssueText}
                    onChange={(e) => setLogIssueText(e.target.value)}
                    required
                    style={{ flex: 1, fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    className="btn btn-warning btn-sm"
                    disabled={isLoggingIssue || !logIssueText.trim()}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {isLoggingIssue ? 'Reporting...' : '+ Report Defect'}
                  </button>
                </form>
              </div>

              {loadingLogs ? (
                <Loader message="Loading service records..." />
              ) : maintenanceLogs.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>
                  <p>No maintenance tickets recorded for this instrument. Operational state is healthy.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Date Reported</th>
                        <th>Reported Issue</th>
                        <th>Status</th>
                        <th>Resolution Notes</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceLogs.map((log) => (
                        <tr key={log.id}>
                          <td>{log.reportedAt ? new Date(log.reportedAt).toLocaleDateString() : '-'}</td>
                          <td><strong>{log.issueDescription}</strong></td>
                          <td><StatusBadge status={log.resolved ? 'COMPLETED' : 'UNDER_MAINTENANCE'} /></td>
                          <td>{log.resolutionNotes || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Pending resolution</span>}</td>
                          <td style={{ textAlign: 'right' }}>
                            {!log.resolved && (
                              <button
                                type="button"
                                onClick={() => handleResolveLog(log.id)}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '3px 8px', fontSize: '11px' }}
                              >
                                ✓ Resolve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setViewingLogsFor(null)} className="btn btn-secondary btn-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentPage;
