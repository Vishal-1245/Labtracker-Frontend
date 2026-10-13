import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllBookings } from '../../api/bookingApi';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';

const LabAssistantDashboard = () => {
  const { assignedLabId, fullName } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookings = async () => {
    try {
      setBookings(await getAllBookings(assignedLabId ? { labId: assignedLabId } : {}));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  useAutoRefresh(fetchBookings, 15000, assignedLabId);

  if (loading) return <Loader message="Loading laboratory bookings..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Lab Assistant</h1>
          <p className="page-subtitle">Bookings for your assigned laboratory, {fullName}.</p>
        </div>
      </div>
      <ErrorMessage error={error} onDismiss={() => setError(null)} />
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Student Slot Bookings</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{bookings.length} total</span>
        </div>
        <div className="card-body">
          {bookings.length === 0 ? (
            <div className="empty-state"><p>No bookings are registered for this laboratory.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead><tr><th>Date</th><th>Time</th><th>Student</th><th>Experiment</th><th>Purpose</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.bookingDate}</td>
                      <td>{booking.startTime?.slice(0, 5)}–{booking.endTime?.slice(0, 5)}</td>
                      <td>{booking.studentName || booking.studentUsername}</td>
                      <td>{booking.experimentTitle || 'General practical'}</td>
                      <td>{booking.purpose}</td>
                      <td><StatusBadge status={booking.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabAssistantDashboard;