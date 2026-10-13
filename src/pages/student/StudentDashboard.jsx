import { useState, useEffect } from 'react';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { getLabs } from '../../api/labApi';
import { getExperiments } from '../../api/experimentApi';
import { getMyBookings, getAllBookings, cancelBooking } from '../../api/bookingApi';
import { getSessions } from '../../api/sessionApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ExperimentImage from '../../components/common/ExperimentImage';

// Student Home page: departmental labs overview, syllabus experiments with diagrams, live slot checker, reservations, and practical attendance
const StudentDashboard = () => {
  const { fullName, username } = useAuth();
  const { collegeName, departmentName } = useConfig();

  const [labs, setLabs] = useState([]);
  const [experiments, setExperiments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Quick live slot checker state
  const todayStr = new Date().toISOString().split('T')[0];
  const [checkLabId, setCheckLabId] = useState('');
  const [checkDate, setCheckDate] = useState(todayStr);
  const [liveSlotBookings, setLiveSlotBookings] = useState([]);

  // Cancel booking confirmation
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchStudentData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        getLabs(),
        getExperiments(),
        getMyBookings(),
        getSessions(),
      ]);
      const [labsResult, experimentsResult, bookingsResult, sessionsResult] = results;
      const labsData = labsResult.status === 'fulfilled' ? labsResult.value : [];
      const expsData = experimentsResult.status === 'fulfilled' ? experimentsResult.value : [];
      const bookingsData = bookingsResult.status === 'fulfilled' ? bookingsResult.value : [];
      const sessionsData = sessionsResult.status === 'fulfilled' ? sessionsResult.value : [];
      const failedResult = results.find((result) => result.status === 'rejected');
      if (failedResult) setError(failedResult.reason);
      setLabs(labsData);
      setExperiments(expsData);
      setBookings(bookingsData);
      setSessions(sessionsData);

      if (labsData.length > 0) {
        setCheckLabId(labsData[0].id.toString());
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchStudentData);

  // Whenever quick slot checker lab or date changes, check bookings
  useEffect(() => {
    if (!checkLabId) return;
    const fetchSlotInfo = async () => {
      try {
        const data = await getAllBookings({ labId: checkLabId, date: checkDate });
        setLiveSlotBookings(data);
      } catch {
        setLiveSlotBookings([]);
      }
    };
    fetchSlotInfo();
  }, [checkLabId, checkDate]);

  // Compute live slot metrics for checked lab
  const checkedLabObj = labs.find((l) => l.id.toString() === checkLabId);
  const totalBenches = checkedLabObj?.slotCapacity || 30;
  const bookedBenchesCount = liveSlotBookings.filter((b) => b.status === 'BOOKED').length;
  const availableBenches = Math.max(0, totalBenches - bookedBenchesCount);

  // Handle booking cancellation
  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelBooking(cancelTarget.id);
      setActionSuccess(`Reservation #${cancelTarget.id} has been cancelled.`);
      setCancelTarget(null);
      const updated = await getMyBookings();
      setBookings(updated);
    } catch (err) {
      setError(err);
      setCancelTarget(null);
    }
  };

  // Metrics
  const activeBookings = bookings.filter((b) => b.status === 'BOOKED');
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED');

  if (loading) {
    return <Loader message="Loading your student lab portal..." />;
  }

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Laboratory Dashboard</h1>
          <p className="page-subtitle">
            Welcome, <strong>{fullName}</strong> (Roll No: <code>{username}</code>) | {departmentName}, {collegeName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/student/book" className="btn btn-primary btn-sm">
            + Book Lab Slot
          </Link>
          <Link to="/student/experiments" className="btn btn-outline btn-sm">
            📖 Lab Manuals
          </Link>
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

      {/* Metric Counters Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{labs.length}</div>
          <div className="stat-label">Department Laboratories</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            EDC, DSP, MPMC, and VLSI facilities
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{experiments.length}</div>
          <div className="stat-label">Syllabus Experiments</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Digital manuals with circuit schematics
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent-color)' }}>
            {activeBookings.length}
          </div>
          <div className="stat-label">My Upcoming Bookings</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Confirmed slots waiting for your practical
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success-color)' }}>
            {completedBookings.length}
          </div>
          <div className="stat-label">Completed Practicals</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Sessions performed and signed off
          </p>
        </div>
      </div>

      {/* Live Slot Availability Quick Checker Widget */}
      <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', border: '1px solid #bbf7d0' }}>
        <div className="card-header" style={{ borderBottomColor: '#dcfce7' }}>
          <div>
            <h2 className="card-title" style={{ color: '#166534' }}>⚡ Real-Time Workbench Availability</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Check available workbenches before heading to the lab
            </span>
          </div>
          <Link to="/student/book" className="btn btn-primary btn-sm">
            Reserve This Slot →
          </Link>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
            <div>
              <label className="form-label">Choose Laboratory</label>
              <select
                value={checkLabId}
                onChange={(e) => setCheckLabId(e.target.value)}
                className="form-control"
              >
                {labs.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.roomNo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Practical Date</label>
              <input
                type="date"
                min={todayStr}
                value={checkDate}
                onChange={(e) => setCheckDate(e.target.value)}
                className="form-control"
              />
            </div>

            <div style={{ background: '#ffffff', padding: '12px 16px', borderRadius: '6px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block' }}>Available Workbenches</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: availableBenches > 0 ? '#15803d' : '#b91c1c' }}>
                {availableBenches} / {totalBenches}
              </span>
              <span style={{ fontSize: '11px', display: 'block', color: availableBenches > 0 ? '#166534' : '#991b1b', marginTop: '2px' }}>
                {availableBenches > 0 ? '✓ Ready for booking' : '⚠️ Fully Booked'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Department Laboratories Section */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--secondary-color)' }}>
              🏢 Department Laboratories
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              ECE specialized experimental lab facilities and room locations
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {labs.map((lab) => (
            <div key={lab.id} className="card" style={{ padding: '16px', borderTop: '4px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span className="badge badge-info">{lab.roomNo}</span>
                <span className="badge badge-success">Active</span>
              </div>
              <h3 style={{ fontSize: '15px', margin: '0 0 6px 0', color: 'var(--secondary-color)' }}>
                {lab.name}
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Workbench Capacity: <strong>{lab.slotCapacity} concurrent teams</strong>
              </p>
              <Link
                to={`/student/experiments?labId=${lab.id}`}
                className="btn btn-outline btn-sm"
                style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}
              >
                Browse Experiments →
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Curriculum Experiments with Circuit Illustrations */}
      <div style={{ marginTop: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--secondary-color)' }}>
              🔬 Syllabus Experiments & Circuit Schematics
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Study circuit diagrams, procedures, component checklists, and calculation formulas
            </p>
          </div>
          <Link to="/student/experiments" className="btn btn-outline btn-sm">
            View All Manuals ({experiments.length}) →
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {experiments.slice(0, 4).map((exp) => (
            <div key={exp.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px' }}>
                <ExperimentImage code={exp.code} height={130} />
              </div>
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', paddingTop: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-info">{exp.code}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{exp.lab?.roomNo}</span>
                </div>
                <h3 style={{ fontSize: '15px', margin: '0 0 8px 0', color: 'var(--secondary-color)' }}>
                  {exp.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 14px 0', flex: 1, lineHeight: '1.4' }}>
                  {exp.aim.length > 110 ? `${exp.aim.substring(0, 110)}...` : exp.aim}
                </p>
                <Link to={`/student/experiments/${exp.id}`} className="btn btn-primary btn-sm" style={{ width: '100%', textAlign: 'center' }}>
                  Open Digital Manual & Calculator →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Workbench Reservations Table */}
      <div className="card" style={{ marginTop: '28px' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">📅 My Workbench & Slot Reservations</h2>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Manage your personal practical reservations
            </span>
          </div>
          <Link to="/student/book" className="btn btn-outline btn-sm">
            + New Booking
          </Link>
        </div>
        <div className="card-body">
          {bookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '28px' }}>
              <div className="empty-icon">🔬</div>
              <div className="empty-title">No Reservations Yet</div>
              <p className="empty-text">
                You haven't booked any laboratory slots or instruments yet.
              </p>
              <Link to="/student/book" className="btn btn-primary btn-sm">
                Book Your First Workbench Slot
              </Link>
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
                    <th>Reserved Apparatus</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td><strong>{b.bookingDate}</strong></td>
                      <td>
                        <code>{b.startTime?.substring(0, 5)} - {b.endTime?.substring(0, 5)}</code>
                      </td>
                      <td>{b.labName}</td>
                      <td>
                        <div>
                          {b.experimentTitle ? (
                            <span style={{ fontWeight: '500' }}>
                              [{b.experimentCode}] {b.experimentTitle}
                            </span>
                          ) : (
                            <span>{b.purpose}</span>
                          )}
                        </div>
                      </td>
                      <td>{b.equipmentName || 'Standard Workbench'}</td>
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

      {/* Practical Class Batch Schedules */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">🏫 Scheduled Practical Class Batches</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Curriculum practical sessions conducted by faculty
          </span>
        </div>
        <div className="card-body">
          {sessions.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p>No departmental practical sessions are currently scheduled.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Batch</th>
                    <th>Laboratory</th>
                    <th>Experiment</th>
                    <th>Faculty In-charge</th>
                    <th>Session Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, 6).map((s) => (
                    <tr key={s.id}>
                      <td>{s.sessionDate}</td>
                      <td><strong>{s.batch}</strong></td>
                      <td>{s.labName}</td>
                      <td>{s.experimentCode ? `[${s.experimentCode}] ${s.experimentTitle}` : 'Lab Practical'}</td>
                      <td>{s.conductedByName || 'Faculty In-charge'}</td>
                      <td><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        title="Cancel Laboratory Reservation"
        message={`Are you sure you want to cancel your slot reservation for ${cancelTarget?.labName} on ${cancelTarget?.bookingDate} (${cancelTarget?.startTime?.substring(0, 5)} - ${cancelTarget?.endTime?.substring(0, 5)})?`}
        confirmText="Cancel Reservation"
        danger
        onConfirm={handleConfirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
};

export default StudentDashboard;
