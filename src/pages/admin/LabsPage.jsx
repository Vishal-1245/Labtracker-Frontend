import React, { useState, useEffect } from 'react';
import { getLabs, createLab, updateLab, deleteLab } from '../../api/labApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Admin page managing departmental laboratories, rooms, and slot capacities
const LabsPage = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Lab modal state (create / edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    roomNo: '',
    slotCapacity: 30,
  });
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch labs from backend
  const fetchLabs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLabs();
      setLabs(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  // Filter labs by name or room
  const filteredLabs = labs.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.roomNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreateModal = () => {
    setEditingLab(null);
    setFormData({ name: '', roomNo: '', slotCapacity: 30 });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lab) => {
    setEditingLab(lab);
    setFormData({
      name: lab.name,
      roomNo: lab.roomNo,
      slotCapacity: lab.slotCapacity,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.name.trim() || !formData.roomNo.trim()) {
      setModalError('Lab name and Room number are required.');
      return;
    }

    if (Number(formData.slotCapacity) <= 0) {
      setModalError('Slot capacity must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        roomNo: formData.roomNo.trim(),
        slotCapacity: parseInt(formData.slotCapacity, 10),
      };

      if (editingLab) {
        await updateLab(editingLab.id, payload);
        setActionSuccess(`Laboratory '${payload.name}' updated successfully.`);
      } else {
        await createLab(payload);
        setActionSuccess(`Laboratory '${payload.name}' created successfully.`);
      }

      setIsModalOpen(false);
      fetchLabs();
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLab(deleteTarget.id);
      setActionSuccess(`Laboratory '${deleteTarget.name}' deleted.`);
      setDeleteTarget(null);
      fetchLabs();
    } catch (err) {
      setError(err);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ECE Laboratories</h1>
          <p className="page-subtitle">
            Configure department laboratory facilities, room locations, and team capacities
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
          + Add Laboratory
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

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              type="text"
              placeholder="Search by Lab Name or Room Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total <strong>{filteredLabs.length}</strong> laboratories
          </div>
        </div>
      </div>

      {/* Labs Table / Cards */}
      {loading ? (
        <Loader message="Loading laboratories..." />
      ) : filteredLabs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <div className="empty-title">No Laboratories Found</div>
          <p className="empty-text">
            {searchQuery
              ? 'No laboratories match your query.'
              : 'No laboratories configured. Click "+ Add Laboratory" to register your first lab.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Lab Name</th>
                  <th>Room No</th>
                  <th>Slot / Team Capacity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabs.map((lab) => (
                  <tr key={lab.id}>
                    <td>
                      <strong>{lab.name}</strong>
                    </td>
                    <td>
                      <code>{lab.roomNo}</code>
                    </td>
                    <td>
                      <span className="badge badge-info">{lab.slotCapacity} Teams</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(lab)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(lab)}
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingLab ? `Edit Lab: ${editingLab.name}` : 'Create New Laboratory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

                <FormInput
                  label="Laboratory Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Electronic Devices & Circuits Lab (EDC)"
                  required
                />

                <FormInput
                  label="Room Number"
                  name="roomNo"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  placeholder="e.g. ECE-204"
                  required
                />

                <FormInput
                  label="Max Slot / Team Capacity"
                  name="slotCapacity"
                  type="number"
                  min="1"
                  value={formData.slotCapacity}
                  onChange={(e) => setFormData({ ...formData, slotCapacity: e.target.value })}
                  placeholder="30"
                  helperText="Maximum number of student workbenches or teams allowed simultaneously"
                  required
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
                  {isSubmitting ? 'Saving...' : editingLab ? 'Update Lab' : 'Create Lab'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Laboratory"
        message={`Are you sure you want to delete '${deleteTarget?.name}'? Note that experiments and equipment linked to this lab may prevent deletion.`}
        confirmText="Delete Lab"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default LabsPage;
