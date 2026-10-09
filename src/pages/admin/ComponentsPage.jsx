import React, { useState, useEffect } from 'react';
import { getLabs } from '../../api/labApi';
import {
  getComponents,
  createComponent,
  updateComponent,
  restockComponent,
} from '../../api/componentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import FormInput from '../../components/common/FormInput';
import ComponentImage from '../../components/common/ComponentImage';
import BroadcastBanner from '../../components/common/BroadcastBanner';

// Admin page managing component stock, categories, inventory health, and restocking
const ComponentsPage = () => {
  const [componentsList, setComponentsList] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // View mode: 'grid' (cards with big centered picture) or 'table'
  const [viewMode, setViewMode] = useState('grid');

  // Filters
  const [selectedLab, setSelectedLab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    labId: '',
    name: '',
    category: '',
    totalQuantity: 50,
    availableQuantity: 50,
  });
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restock Modal
  const [restockTarget, setRestockTarget] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState(20);
  const [restockError, setRestockError] = useState(null);
  const [isRestocking, setIsRestocking] = useState(false);

  const fetchLabsAndComponents = async () => {
    setLoading(true);
    setError(null);
    try {
      const [labsData, compsData] = await Promise.all([
        getLabs(),
        getComponents(),
      ]);
      setLabs(labsData);
      setComponentsList(compsData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabsAndComponents();
  }, []);

  // Filter components
  const filteredComponents = componentsList.filter((c) => {
    const matchesLab = selectedLab === 'ALL' || c.labId?.toString() === selectedLab;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLab && matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      labId: labs[0]?.id?.toString() || '',
      name: '',
      category: '',
      totalQuantity: 50,
      availableQuantity: 50,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      labId: item.labId?.toString() || '',
      name: item.name,
      category: item.category,
      totalQuantity: item.totalQuantity,
      availableQuantity: item.availableQuantity,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    if (!formData.name.trim() || !formData.category.trim() || !formData.labId) {
      setModalError('Component name, category, and lab assignment are required.');
      return;
    }

    const total = parseInt(formData.totalQuantity, 10);
    const avail = parseInt(formData.availableQuantity, 10);

    if (avail > total) {
      setModalError('Available quantity cannot exceed total quantity.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        labId: parseInt(formData.labId, 10),
        name: formData.name.trim(),
        category: formData.category.trim(),
        totalQuantity: total,
        availableQuantity: avail,
      };

      if (editingItem) {
        await updateComponent(editingItem.id, payload);
        setActionSuccess(`Component '${payload.name}' updated.`);
      } else {
        await createComponent(payload);
        setActionSuccess(`Component '${payload.name}' registered to inventory.`);
      }

      setIsModalOpen(false);
      fetchLabsAndComponents();
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restock handler
  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    setRestockError(null);

    const qty = parseInt(quantityToAdd, 10);
    if (!qty || qty <= 0) {
      setRestockError('Please enter a valid quantity greater than 0.');
      return;
    }

    setIsRestocking(true);
    try {
      await restockComponent(restockTarget.id, qty);
      setActionSuccess(`Restocked ${qty} units of '${restockTarget.name}'.`);
      setRestockTarget(null);
      fetchLabsAndComponents();
    } catch (err) {
      setRestockError(err);
    } finally {
      setIsRestocking(false);
    }
  };

  const getLabName = (labId) => {
    const l = labs.find((lab) => lab.id === labId);
    return l ? `${l.name} (${l.roomNo})` : `Lab #${labId}`;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Components Inventory</h1>
          <p className="page-subtitle">
            Manage electronic discrete components, ICs, modules, and stock replenishment
          </p>
        </div>
        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
          + Add Component
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px' }}>
            <input
              type="text"
              placeholder="Search components or category (e.g. Diode, Resistor)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          <div style={{ width: '240px' }}>
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

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total <strong>{filteredComponents.length}</strong> component items
          </div>
        </div>
      </div>

      {/* Inventory View Toggle */}
      {!loading && filteredComponents.length > 0 && (
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
        <Loader message="Loading components inventory..." />
      ) : filteredComponents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-title">No Components Found</div>
          <p className="empty-text">
            No components match the selected laboratory or search terms.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="catalog-card-grid">
          {filteredComponents.map((item) => {
            const isLow = item.availableQuantity < 10;
            const isWarning = item.availableQuantity >= 10 && item.availableQuantity < 20;

            return (
              <div className="catalog-card" key={item.id}>
                <div className="catalog-card-img-box">
                  <ComponentImage name={item.name} category={item.category} size={150} />
                </div>
                <div className="catalog-card-body">
                  <h3 className="catalog-card-title">{item.name}</h3>
                  <div className="catalog-card-meta">{item.category} • {getLabName(item.labId)}</div>
                  <div className="catalog-card-badges">
                    {isLow ? (
                      <span className="badge badge-danger">Low stock</span>
                    ) : isWarning ? (
                      <span className="badge badge-warning">Moderate</span>
                    ) : (
                      <span className="badge badge-success">Adequate</span>
                    )}
                    <span className="badge badge-secondary">{item.availableQuantity}/{item.totalQuantity}</span>
                  </div>
                  <div className="catalog-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setRestockTarget(item);
                        setQuantityToAdd(20);
                        setRestockError(null);
                      }}
                    >
                      + Restock
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEditModal(item)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Preview</th>
                  <th>Component Name</th>
                  <th>Category</th>
                  <th>Laboratory</th>
                  <th>Available / Total</th>
                  <th>Stock Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComponents.map((item) => {
                  const isLow = item.availableQuantity < 10;
                  const isWarning = item.availableQuantity >= 10 && item.availableQuantity < 20;

                  return (
                    <tr key={item.id}>
                      <td>
                        <ComponentImage name={item.name} category={item.category} size={44} />
                      </td>
                      <td><strong>{item.name}</strong></td>
                      <td><span className="badge badge-secondary">{item.category}</span></td>
                      <td style={{ fontSize: '13px' }}>{getLabName(item.labId)}</td>
                      <td>
                        <strong>{item.availableQuantity}</strong> / {item.totalQuantity} units
                      </td>
                      <td>
                        {isLow ? (
                          <span className="badge badge-danger">Low Stock (&lt; 10)</span>
                        ) : isWarning ? (
                          <span className="badge badge-warning">Moderate</span>
                        ) : (
                          <span className="badge badge-success">Adequate</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              setRestockTarget(item);
                              setQuantityToAdd(20);
                              setRestockError(null);
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            + Restock
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                {editingItem ? `Edit Component: ${editingItem.name}` : 'Add Component to Inventory'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

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

                <FormInput
                  label="Component Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. 1N4007 PN Diode or BC547 NPN Transistor"
                  required
                />

                <FormInput
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Diode, Transistor, Resistor, IC, Op-Amp"
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <FormInput
                    label="Total Quantity"
                    name="totalQuantity"
                    type="number"
                    min="0"
                    value={formData.totalQuantity}
                    onChange={(e) => setFormData({ ...formData, totalQuantity: e.target.value })}
                    required
                  />

                  <FormInput
                    label="Available Quantity"
                    name="availableQuantity"
                    type="number"
                    min="0"
                    value={formData.availableQuantity}
                    onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                    required
                  />
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
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Component' : 'Add Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockTarget && (
        <div className="modal-backdrop">
          <div className="modal-dialog" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Restock: {restockTarget.name}</h3>
              <button onClick={() => setRestockTarget(null)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleRestockSubmit}>
              <div className="modal-body">
                <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
                  Current Stock: <strong>{restockTarget.availableQuantity}</strong> available out of <strong>{restockTarget.totalQuantity}</strong> total.
                </p>

                <ErrorMessage error={restockError} onDismiss={() => setRestockError(null)} />

                <FormInput
                  label="Quantity to Add"
                  name="quantityToAdd"
                  type="number"
                  min="1"
                  value={quantityToAdd}
                  onChange={(e) => setQuantityToAdd(e.target.value)}
                  placeholder="20"
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="btn btn-secondary btn-sm"
                  disabled={isRestocking}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRestocking}
                  className="btn btn-primary btn-sm"
                >
                  {isRestocking ? 'Restocking...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentsPage;
