import React, { useState, useEffect } from 'react';
import { getLabs } from '../../api/labApi';
import { getExperiments, getExperimentById } from '../../api/experimentApi';
import { getEquipment } from '../../api/equipmentApi';
import { createBooking, getMyBookings, getAllBookings, cancelBooking } from '../../api/bookingApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ComponentImage from '../../components/common/ComponentImage';

// Student booking portal: live slot availability, component stock checking, controlled reservation form, and cancellation
const BookSlotPage = () => {
  const [labs, setLabs] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [labBookingsOnDate, setLabBookingsOnDate] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Selected experiment details for required component stock checks
  const [selectedExpDetails, setSelectedExpDetails] = useState(null);
  const [loadingExpDetails, setLoadingExpDetails] = useState(false);

  // Controlled form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    labId: '',
    experimentId: '',
    equipmentId: '',
    bookingDate: todayStr,
    startTime: '09:30',
    endTime: '11:30',
    purpose: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Cancel reservation state
  const [cancelTarget, setCancelTarget] = useState(null);

  // Initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [labsData, myBookingsData] = await Promise.all([
          getLabs(),
          getMyBookings(),
        ]);
        setLabs(labsData);
        setMyBookings(myBookingsData);

        if (labsData.length > 0) {
          const firstLabId = labsData[0].id.toString();
          setFormData((prev) => ({ ...prev, labId: firstLabId }));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // When lab changes, load its experiments and equipment
  useEffect(() => {
    if (!formData.labId) return;

    const fetchLabAssets = async () => {
      try {
        const [expData, eqData] = await Promise.all([
          getExperiments(formData.labId),
          getEquipment({ labId: formData.labId }),
        ]);
        setExperiments(expData);
        setEquipmentList(eqData);

        // Reset experiment and equipment selections for the new lab
        setFormData((prev) => ({
          ...prev,
          experimentId: expData.length > 0 ? expData[0].id.toString() : '',
          equipmentId: '',
        }));
      } catch (err) {
        console.error('Failed to load lab assets:', err);
      }
    };

    fetchLabAssets();
  }, [formData.labId]);

  // When experiment changes, load its details (aim, required components, stock status)
  useEffect(() => {
    if (!formData.experimentId) {
      setSelectedExpDetails(null);
      return;
    }

    const fetchExpDetails = async () => {
      setLoadingExpDetails(true);
      try {
        const exp = await getExperimentById(formData.experimentId);
        setSelectedExpDetails(exp);
      } catch (err) {
        console.error('Failed to load experiment details:', err);
      } finally {
        setLoadingExpDetails(false);
      }
    };

    fetchExpDetails();
  }, [formData.experimentId]);

  // Check lab bookings on the selected date to compute remaining capacity
  useEffect(() => {
    if (!formData.labId || !formData.bookingDate) return;

    const fetchLabBookings = async () => {
      try {
        const bookingsOnDate = await getAllBookings({
          labId: formData.labId,
          date: formData.bookingDate,
        });
        setLabBookingsOnDate(bookingsOnDate);
      } catch {
        // Fallback gracefully
        setLabBookingsOnDate([]);
      }
    };

    fetchLabBookings();
  }, [formData.labId, formData.bookingDate]);

  // Compute remaining slot capacity for selected lab and time window
  const selectedLabObj = labs.find((l) => l.id.toString() === formData.labId);
  const totalLabCapacity = selectedLabObj?.slotCapacity || 30;

  const overlappingCount = labBookingsOnDate.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    // Check time overlap: (startA < endB) and (endA > startB)
    const bStart = b.startTime?.substring(0, 5);
    const bEnd = b.endTime?.substring(0, 5);
    return formData.startTime < bEnd && formData.endTime > bStart;
  }).length;

  const remainingSlots = Math.max(0, totalLabCapacity - overlappingCount);

  // Selected equipment check
  const selectedEquipObj = equipmentList.find((e) => e.id.toString() === formData.equipmentId);
  const isEquipmentInMaintenance = selectedEquipObj?.status === 'UNDER_MAINTENANCE';

  // Handle form change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formError) setFormError(null);
  };

  // Submit booking
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setActionSuccess('');

    // Client-side validations
    if (!formData.labId || !formData.bookingDate || !formData.startTime || !formData.endTime) {
      setFormError('Please fill in all required date, lab, and time fields.');
      return;
    }

    if (formData.startTime >= formData.endTime) {
      setFormError('Start time must be strictly earlier than end time.');
      return;
    }

    if (formData.bookingDate < todayStr) {
      setFormError('Booking date cannot be in the past.');
      return;
    }

    if (!formData.purpose.trim()) {
      setFormError('Please describe the purpose of your practical reservation.');
      return;
    }

    if (isEquipmentInMaintenance) {
      setFormError(`Selected equipment '${selectedEquipObj.name}' is currently UNDER MAINTENANCE and cannot be reserved.`);
      return;
    }

    if (remainingSlots <= 0) {
      setFormError('This laboratory has reached maximum slot capacity for the selected time window. Please choose another time or day.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        labId: parseInt(formData.labId, 10),
        experimentId: formData.experimentId ? parseInt(formData.experimentId, 10) : null,
        equipmentId: formData.equipmentId ? parseInt(formData.equipmentId, 10) : null,
        bookingDate: formData.bookingDate,
        startTime: `${formData.startTime}:00`,
        endTime: `${formData.endTime}:00`,
        purpose: formData.purpose.trim(),
      };

      await createBooking(payload);

      setActionSuccess('Lab slot successfully reserved! Your booking is confirmed.');
      setFormData((prev) => ({
        ...prev,
        purpose: '',
        equipmentId: '',
      }));

      // Refresh student's bookings
      const updatedMyBookings = await getMyBookings();
      setMyBookings(updatedMyBookings);
    } catch (err) {
      setFormError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancellation
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking(cancelTarget.id);
      setActionSuccess(`Reservation #${cancelTarget.id} has been cancelled.`);
      setCancelTarget(null);
      const updated = await getMyBookings();
      setMyBookings(updated);
    } catch (err) {
      setError(err);
      setCancelTarget(null);
    }
  };

  if (loading) {
    return <Loader message="Loading slot availability and labs..." />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Reserve Laboratory Slot</h1>
          <p className="page-subtitle">
            Check real-time bench capacity, component availability, and reserve apparatus
          </p>
        </div>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 0.8fr)', gap: '24px' }}>
        {/* Reservation Form */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">📝 Slot Booking Form</h2>
          </div>
          <div className="card-body">
            <ErrorMessage error={formError} onDismiss={() => setFormError(null)} />

            <form onSubmit={handleSubmit}>
              {/* Lab Selector */}
              <div className="form-group">
                <label className="form-label">Select Laboratory Room <span className="required">*</span></label>
                <select
                  name="labId"
                  value={formData.labId}
                  onChange={handleChange}
                  className="form-control"
                  required
                >
                  {labs.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name} ({l.roomNo}) — Capacity: {l.slotCapacity} teams
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Time Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <FormInput
                  label="Date"
                  name="bookingDate"
                  type="date"
                  min={todayStr}
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />

                <FormInput
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Experiment Selector */}
              <div className="form-group">
                <label className="form-label">Syllabus Experiment</label>
                <select
                  name="experimentId"
                  value={formData.experimentId}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- General Workbench Practice / Project Work --</option>
                  {experiments.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      [{exp.code}] {exp.title}
                    </option>
                  ))}
                </select>
                <span className="form-help">
                  Select an experiment to automatically check required components and verify formula guides.
                </span>
              </div>

              {/* Equipment Selector */}
              <div className="form-group">
                <label className="form-label">Reserve Specific Apparatus (Optional)</label>
                <select
                  name="equipmentId"
                  value={formData.equipmentId}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="">-- Standard Workstation Setup --</option>
                  {equipmentList.map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name} ({eq.assetTag}) — {eq.status === 'UNDER_MAINTENANCE' ? '⚠️ MAINTENANCE' : '✓ Available'}
                    </option>
                  ))}
                </select>
                {isEquipmentInMaintenance && (
                  <span className="form-error" style={{ display: 'block', marginTop: '4px' }}>
                    ⚠️ This apparatus is currently undergoing maintenance and cannot be reserved.
                  </span>
                )}
              </div>

              {/* Purpose */}
              <FormInput
                label="Practical Purpose / Details"
                name="purpose"
                type="textarea"
                rows={3}
                value={formData.purpose}
                onChange={handleChange}
                placeholder="e.g. Performing V-I characteristics experiment for Lab Internal Exam preparation"
                required
              />

              <button
                type="submit"
                disabled={isSubmitting || isEquipmentInMaintenance || remainingSlots <= 0}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '8px' }}
              >
                {isSubmitting ? 'Confirming Reservation...' : 'Confirm Lab Booking'}
              </button>
            </form>
          </div>
        </div>

        {/* Live Availability & Component Stock Status Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Slot Capacity Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">⚡ Live Slot Availability</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Selected Room:</span>
                <strong>{selectedLabObj?.name || 'Loading...'}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Time Window:</span>
                <code>{formData.startTime} to {formData.endTime} ({formData.bookingDate})</code>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Remaining Free Slots:</span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: remainingSlots > 5 ? 'var(--success-color)' : remainingSlots > 0 ? 'var(--warning-color)' : 'var(--danger-color)',
                  }}
                >
                  {remainingSlots} / {totalLabCapacity} slots
                </span>
              </div>

              {remainingSlots <= 0 ? (
                <div className="alert alert-danger" style={{ fontSize: '12px' }}>
                  🚫 Room capacity full for this time slot. Please pick an alternative hour or date.
                </div>
              ) : (
                <div className="alert alert-success" style={{ fontSize: '12px' }}>
                  ✓ Slots are available. Your workbench will be ready upon arrival.
                </div>
              )}
            </div>
          </div>

          {/* Component Inventory Stock for Chosen Experiment */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">📦 Required Component Stock</h3>
            </div>
            <div className="card-body">
              {loadingExpDetails ? (
                <Loader message="Checking inventory stock..." />
              ) : !selectedExpDetails || !selectedExpDetails.components || selectedExpDetails.components.length === 0 ? (
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {formData.experimentId
                    ? 'No specific component prerequisites configured for this experiment.'
                    : 'Select a syllabus experiment to view component availability.'}
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="data-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Required</th>
                        <th>Stock Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExpDetails.components.map((comp) => {
                        const compObj = comp.component;
                        const avail = compObj?.availableQuantity ?? 0;
                        const isSufficient = avail >= comp.quantityPerTeam;

                        return (
                          <tr key={comp.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <ComponentImage name={compObj?.name || ''} category={compObj?.category || ''} size={32} />
                                <strong>{compObj?.name || `Component #${comp.componentId}`}</strong>
                              </div>
                            </td>
                            <td>{comp.quantityPerTeam} units</td>
                            <td>
                              {isSufficient ? (
                                <span className="badge badge-success">✓ In Stock ({avail})</span>
                              ) : (
                                <span className="badge badge-danger">⚠️ Low Stock ({avail})</span>
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
        </div>
      </div>

      {/* My Bookings Table */}
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="card-header">
          <h2 className="card-title">📋 My Recent Reservations</h2>
        </div>
        <div className="card-body">
          {myBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p>No reservations found on your account.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Laboratory</th>
                    <th>Experiment / Purpose</th>
                    <th>Apparatus</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {myBookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.bookingDate}</strong></td>
                      <td>
                        <code>
                          {b.startTime?.substring(0, 5)} - {b.endTime?.substring(0, 5)}
                        </code>
                      </td>
                      <td>{b.labName}</td>
                      <td>{b.experimentTitle || b.purpose}</td>
                      <td>{b.equipmentName || 'Standard Bench'}</td>
                      <td><StatusBadge status={b.status} /></td>
                      <td style={{ textAlign: 'right' }}>
                        {b.status === 'BOOKED' && (
                          <button
                            onClick={() => setCancelTarget(b)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger-color)' }}
                          >
                            Cancel
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
      </div>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel Laboratory Reservation"
        message={`Are you sure you want to cancel your slot reservation for ${cancelTarget?.labName} on ${cancelTarget?.bookingDate}?`}
        confirmText="Cancel Reservation"
        danger
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default BookSlotPage;
