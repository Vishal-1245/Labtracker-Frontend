import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { getSessions } from '../../api/sessionApi';
import { getAllBookings } from '../../api/bookingApi';
import { getEquipment, getMaintenanceLogs } from '../../api/equipmentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';

// Lab In-charge Dashboard: session overview, bench reservations, and maintenance tickets
const InchargeDashboard = () => {
  const { fullName, assignedLabId } = useAuth();
  const { collegeName, departmentName } = useConfig();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sessions, setSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [maintenanceEquipment, setMaintenanceEquipment] = useState([]);

  const fetchDashboardData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const results = await Promise.allSettled([
        getSessions(assignedLabId ? { labId: assignedLabId } : {}),
        getAllBookings(assignedLabId ? { labId: assignedLabId } : {}),
        getMaintenanceLogs({ resolved: false }),
        getEquipment({ ...(assignedLabId ? { labId: assignedLabId } : {}), status: 'UNDER_MAINTENANCE' }),
      ]);
      const [sessionsResult, bookingsResult, logsResult, equipmentResult] = results;
      setSessions(sessionsResult.status === 'fulfilled' ? sessionsResult.value : []);
      setBookings(bookingsResult.status === 'fulfilled' ? bookingsResult.value : []);
      const equipmentUnderMaintenance = equipmentResult.status === 'fulfilled' ? equipmentResult.value : [];
      const maintainedEquipmentIds = new Set(equipmentUnderMaintenance.map((equipment) => equipment.id));
      const maintenanceLogs = logsResult.status === 'fulfilled' ? logsResult.value : [];
      setMaintenanceItems(maintenanceLogs.filter((item) => maintainedEquipmentIds.has(item.equipmentId)));
      setMaintenanceEquipment(equipmentUnderMaintenance);
      const failedResult = results.find((result) => result.status === 'rejected');
      if (failedResult) setError(failedResult.reason);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchDashboardData);

  if (loading) {
    return <Loader message="Loading faculty laboratory dashboard..." />;
  }

  const openSessions = sessions.filter((s) => s.status === 'OPEN');
  const pendingBookings = bookings.filter((b) => b.status === 'BOOKED');

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Lab In-charge Portal</h1>
          <p className="page-subtitle">
            Welcome, <strong>{fullName}</strong> | {departmentName}, {collegeName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/incharge/sessions" className="btn btn-primary btn-sm">
            + Manage Sessions
          </Link>
          <Link to="/incharge/maintenance" className="btn btn-outline btn-sm">
            🛠️ Maintenance ({maintenanceItems.length})
          </Link>
        </div>
      </div>

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {/* Metric Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{openSessions.length}</div>
          <div className="stat-label">Active / Open Sessions</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Class practical batches currently open
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{pendingBookings.length}</div>
          <div className="stat-label">Student Bench Bookings</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Upcoming student slot reservations
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: maintenanceEquipment.length ? 'var(--warning-color)' : 'var(--success-color)' }}>
            {maintenanceEquipment.length}
          </div>
          <div className="stat-label">Equipment Under Maintenance</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Assets unavailable until maintenance is resolved
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: maintenanceItems.length > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
            {maintenanceItems.length}
          </div>
          <div className="stat-label">Open Maintenance Tickets</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Equipment reported requiring repair
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{sessions.length}</div>
          <div className="stat-label">Total Practical Batches</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Conducted throughout academic semester
          </p>
        </div>
      </div>

      {/* Sessions and Reservations Quick View */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginTop: '16px' }}>
        {/* Active Class Sessions */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🏫 Scheduled Practical Sessions</h2>
            <Link to="/incharge/sessions" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          <div className="card-body">
            {sessions.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No practical class sessions scheduled yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Batch</th>
                      <th>Date</th>
                      <th>Experiment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 5).map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.batch}</strong></td>
                        <td>{s.sessionDate}</td>
                        <td>{s.experimentCode || s.labName}</td>
                        <td><StatusBadge status={s.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pending Maintenance Alerts */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⚠️ Open Maintenance Issues</h2>
            <Link to="/incharge/maintenance" className="btn btn-outline btn-sm">
              Resolve
            </Link>
          </div>
          <div className="card-body">
            {maintenanceItems.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>✓ All lab instruments are operational. No open tickets.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Reported Fault</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceItems.slice(0, 5).map((item) => (
                      <tr key={item.id}>
                        <td><code>{item.equipmentAssetTag || `Equipment #${item.equipmentId}`}</code></td>
                        <td>{item.issueDescription}</td>
                        <td>{item.reportedAt ? new Date(item.reportedAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Equipment Requiring Attention</h2>
          <Link to="/incharge/equipment" className="btn btn-outline btn-sm">View Equipment</Link>
        </div>
        <div className="card-body">
          {maintenanceEquipment.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}><p>No equipment is marked under maintenance.</p></div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead><tr><th>Asset</th><th>Equipment</th><th>Lab</th><th>Status</th></tr></thead>
                <tbody>
                  {maintenanceEquipment.map((equipment) => (
                    <tr key={equipment.id}>
                      <td><code>{equipment.assetTag}</code></td>
                      <td>{equipment.name}</td>
                      <td>{equipment.labName}</td>
                      <td><StatusBadge status={equipment.status} /></td>
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

export default InchargeDashboard;
