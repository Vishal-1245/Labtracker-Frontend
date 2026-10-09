import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { getUsers } from '../../api/userApi';
import { getLabs } from '../../api/labApi';
import { getEquipment } from '../../api/equipmentApi';
import { getComponents } from '../../api/componentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';

// Admin dashboard providing high-level laboratory stats, alerts, and quick navigation
const AdminDashboard = () => {
  const { fullName } = useAuth();
  const { collegeName, departmentName } = useConfig();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    studentCount: 0,
    inchargeCount: 0,
    totalLabs: 0,
    totalEquipment: 0,
    maintenanceEquipment: 0,
    totalComponents: 0,
    lowStockComponents: 0,
  });
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [lowStockList, setLowStockList] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [users, labs, equipment, components] = await Promise.all([
          getUsers(),
          getLabs(),
          getEquipment(),
          getComponents(),
        ]);

        const students = users.filter((u) => u.role === 'STUDENT').length;
        const incharges = users.filter((u) => u.role === 'LAB_INCHARGE').length;
        const maintEq = equipment.filter((e) => e.status === 'UNDER_MAINTENANCE');
        const lowStock = components.filter((c) => c.availableQuantity < 10);

        setStats({
          totalUsers: users.length,
          studentCount: students,
          inchargeCount: incharges,
          totalLabs: labs.length,
          totalEquipment: equipment.length,
          maintenanceEquipment: maintEq.length,
          totalComponents: components.length,
          lowStockComponents: lowStock.length,
        });

        setRecentMaintenance(maintEq.slice(0, 5));
        setLowStockList(lowStock.slice(0, 5));
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <Loader message="Loading administrative dashboard metrics..." />;
  }

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, <strong>{fullName}</strong> | {departmentName}, {collegeName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/users" className="btn btn-outline btn-sm">
            👥 Manage Users
          </Link>
          <Link to="/admin/reports" className="btn btn-primary btn-sm">
            📊 View Reports
          </Link>
        </div>
      </div>

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {/* Metric Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Total Users</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {stats.studentCount} Students · {stats.inchargeCount} Lab In-charges
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalLabs}</div>
          <div className="stat-label">Active Laboratories</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Departmental lab rooms configured
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalEquipment}</div>
          <div className="stat-label">Total Equipment</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: stats.maintenanceEquipment > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
            {stats.maintenanceEquipment > 0
              ? `⚠️ ${stats.maintenanceEquipment} Under Maintenance`
              : '✓ All Units Operational'}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalComponents}</div>
          <div className="stat-label">Component Types</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: stats.lowStockComponents > 0 ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
            {stats.lowStockComponents > 0
              ? `🚨 ${stats.lowStockComponents} Low Stock Items (< 10)`
              : '✓ Healthy Inventory Stock'}
          </p>
        </div>
      </div>

      {/* Operational Attention Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginTop: '16px' }}>
        {/* Equipment Requiring Maintenance */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⚠️ Equipment Under Maintenance</h2>
            <Link to="/admin/equipment" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          <div className="card-body">
            {recentMaintenance.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>No equipment is currently under maintenance. All assets are available.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Asset Tag</th>
                      <th>Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentMaintenance.map((eq) => (
                      <tr key={eq.id}>
                        <td><code>{eq.assetTag}</code></td>
                        <td>{eq.name}</td>
                        <td><StatusBadge status={eq.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Components */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">🚨 Low Inventory Alerts</h2>
            <Link to="/admin/components" className="btn btn-outline btn-sm">
              Restock
            </Link>
          </div>
          <div className="card-body">
            {lowStockList.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px' }}>
                <p>All component stocks are currently sufficient.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th>Category</th>
                      <th>Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockList.map((comp) => (
                      <tr key={comp.id}>
                        <td><strong>{comp.name}</strong></td>
                        <td>{comp.category}</td>
                        <td>
                          <span style={{ color: 'var(--danger-color)', fontWeight: 'bold' }}>
                            {comp.availableQuantity} / {comp.totalQuantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">⚡ Quick Management Shortcuts</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <Link to="/admin/users" className="card" style={{ padding: '16px', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>👤</div>
              <h3 style={{ fontSize: '15px', margin: '0 0 4px 0' }}>User Management</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Add students, faculty, or import batch roll numbers via CSV.
              </p>
            </Link>

            <Link to="/admin/labs" className="card" style={{ padding: '16px', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏢</div>
              <h3 style={{ fontSize: '15px', margin: '0 0 4px 0' }}>ECE Laboratories</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Configure department labs, room numbers, and slot capacities.
              </p>
            </Link>

            <Link to="/admin/experiments" className="card" style={{ padding: '16px', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📖</div>
              <h3 style={{ fontSize: '15px', margin: '0 0 4px 0' }}>Lab Experiments</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Create syllabus experiments, step-by-step procedures, and formulas.
              </p>
            </Link>

            <Link to="/admin/equipment" className="card" style={{ padding: '16px', textDecoration: 'none', color: 'inherit', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📟</div>
              <h3 style={{ fontSize: '15px', margin: '0 0 4px 0' }}>Equipment Tracking</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Register DSOs, signal generators, and track maintenance tickets.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
