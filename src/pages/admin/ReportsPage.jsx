import { useState } from 'react';
import { useConfig } from '../../context/ConfigContext';
import useAutoRefresh from '../../hooks/useAutoRefresh';
import { getUsers } from '../../api/userApi';
import { getLabs } from '../../api/labApi';
import { getEquipment } from '../../api/equipmentApi';
import { getComponents } from '../../api/componentApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';

// Admin audit reports and departmental laboratory metrics summary
const ReportsPage = () => {
  const { collegeName, departmentName } = useConfig();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [labs, setLabs] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [components, setComponents] = useState([]);

  const fetchAllData = async () => {
    setError(null);
    try {
      const [userData, labData, eqData, compData] = await Promise.all([
        getUsers(),
        getLabs(),
        getEquipment(),
        getComponents(),
      ]);
      setUsers(userData);
      setLabs(labData);
      setEquipment(eqData);
      setComponents(compData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useAutoRefresh(fetchAllData);

  // Compute metrics
  const studentCount = users.filter((u) => u.role === 'STUDENT').length;
  const inchargeCount = users.filter((u) => u.role === 'LAB_INCHARGE').length;
  const assistantCount = users.filter((u) => u.role === 'LAB_ASSISTANT').length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const loggedInUsers = users.filter((user) => (user.loginCount || 0) > 0);
  const neverLoggedInUsers = users.length - loggedInUsers.length;

  const totalCapacity = labs.reduce((sum, l) => sum + (l.slotCapacity || 0), 0);

  const operationalEquipment = equipment.filter((e) => e.status === 'AVAILABLE').length;
  const maintenanceEquipment = equipment.filter((e) => e.status === 'UNDER_MAINTENANCE').length;
  const operationalRate = equipment.length > 0
    ? Math.round((operationalEquipment / equipment.length) * 100)
    : 100;

  const totalStockUnits = components.reduce((sum, c) => sum + (c.availableQuantity || 0), 0);
  const lowStockItems = components.filter((c) => c.availableQuantity < 15);

  // CSV Export utility
  const exportToCsv = (filename, rows) => {
    const processRow = (row) =>
      row
        .map((val) => {
          let text = val === null || val === undefined ? '' : String(val);
          text = text.replace(/"/g, '""');
          if (text.search(/("|,|\n)/g) >= 0) text = `"${text}"`;
          return text;
        })
        .join(',');

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(processRow).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportEquipmentCsv = () => {
    const rows = [
      ['Asset Tag', 'Equipment Name', 'Category', 'Lab ID', 'Status', 'Next Calibration Date'],
      ...equipment.map((eq) => [
        eq.assetTag,
        eq.name,
        eq.category,
        eq.labId,
        eq.status,
        eq.nextCalibrationDate || 'N/A',
      ]),
    ];
    exportToCsv('ECE_Equipment_Audit_Report.csv', rows);
  };

  const handleExportComponentsCsv = () => {
    const rows = [
      ['Component Name', 'Category', 'Lab ID', 'Available Quantity', 'Total Quantity'],
      ...components.map((c) => [
        c.name,
        c.category,
        c.labId,
        c.availableQuantity,
        c.totalQuantity,
      ]),
    ];
    exportToCsv('ECE_Components_Inventory_Report.csv', rows);
  };

  const getLabName = (labId) => {
    const l = labs.find((lab) => lab.id === labId);
    return l ? `${l.name} (${l.roomNo})` : `Lab #${labId}`;
  };

  if (loading) {
    return <Loader message="Generating departmental laboratory report..." />;
  }

  return (
    <div className="page-container">
      {/* Header and Print / Export Actions */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Department Audit Reports</h1>
          <p className="page-subtitle">
            {departmentName} — {collegeName}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
            🖨️ Print Report
          </button>
          <button onClick={handleExportEquipmentCsv} className="btn btn-outline btn-sm">
            📥 Equipment CSV
          </button>
          <button onClick={handleExportComponentsCsv} className="btn btn-primary btn-sm">
            📥 Stock CSV
          </button>
        </div>
      </div>

      <ErrorMessage error={error} onDismiss={() => setError(null)} />

      {/* High-level Audit Overview Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Registered Users</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {studentCount} Students · {inchargeCount} In-charges · {assistantCount} Assistants · {adminCount} Admins
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{loggedInUsers.length}</div>
          <div className="stat-label">Users Logged In</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {neverLoggedInUsers} of {users.length} registered accounts have never signed in
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{labs.length}</div>
          <div className="stat-label">Active Laboratories</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Cumulative Capacity: <strong>{totalCapacity}</strong> concurrent teams
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{operationalRate}%</div>
          <div className="stat-label">Equipment Health Rate</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: maintenanceEquipment > 0 ? 'var(--warning-color)' : 'var(--success-color)' }}>
            {operationalEquipment} of {equipment.length} units fully operational
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-value">{totalStockUnits}</div>
          <div className="stat-label">Total Component Units</div>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: lowStockItems.length > 0 ? 'var(--danger-color)' : 'var(--text-secondary)' }}>
            {lowStockItems.length > 0
              ? `⚠️ ${lowStockItems.length} types require restocking (< 15 units)`
              : 'All component stocks healthy'}
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">Account Login Activity</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {loggedInUsers.length} signed in · {neverLoggedInUsers} never signed in
          </span>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>Account</th><th>Name</th><th>Role</th><th>Sign-ins</th><th>Last Sign-in</th></tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><code>{user.username}</code></td>
                    <td>{user.fullName}</td>
                    <td><StatusBadge status={user.role} /></td>
                    <td>{user.loginCount || 0}</td>
                    <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Equipment Operational State Audit */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h2 className="card-title">📟 Equipment Status & Calibration Audit</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Total {equipment.length} assets recorded
          </span>
        </div>
        <div className="card-body">
          {equipment.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p>No equipment records registered.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset Tag</th>
                    <th>Equipment Name</th>
                    <th>Category</th>
                    <th>Laboratory</th>
                    <th>Operational Status</th>
                    <th>Next Calibration</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((eq) => (
                    <tr key={eq.id}>
                      <td><code>{eq.assetTag}</code></td>
                      <td><strong>{eq.name}</strong></td>
                      <td>{eq.category.replace(/_/g, ' ')}</td>
                      <td style={{ fontSize: '13px' }}>{getLabName(eq.labId)}</td>
                      <td><StatusBadge status={eq.status} /></td>
                      <td>
                        {eq.nextCalibrationDate ? (
                          <span>{eq.nextCalibrationDate}</span>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)' }}>N/A</span>
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

      {/* Low Stock Component Replenishment Checklist */}
      <div className="card" style={{ marginTop: '24px' }}>
        <div className="card-header">
          <h2 className="card-title">📦 Component Inventory Restock Priority</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Items with available stock &lt; 15 units
          </span>
        </div>
        <div className="card-body">
          {lowStockItems.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <p>✓ All component inventory stocks meet minimum operational reserves.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Component Name</th>
                    <th>Category</th>
                    <th>Laboratory</th>
                    <th>Available</th>
                    <th>Total Inventory</th>
                    <th>Urgency</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((comp) => (
                    <tr key={comp.id}>
                      <td><strong>{comp.name}</strong></td>
                      <td><span className="badge badge-secondary">{comp.category}</span></td>
                      <td style={{ fontSize: '13px' }}>{getLabName(comp.labId)}</td>
                      <td>
                        <strong style={{ color: 'var(--danger-color)' }}>
                          {comp.availableQuantity} units
                        </strong>
                      </td>
                      <td>{comp.totalQuantity} units</td>
                      <td>
                        {comp.availableQuantity < 5 ? (
                          <span className="badge badge-danger">CRITICAL</span>
                        ) : (
                          <span className="badge badge-warning">LOW</span>
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
    </div>
  );
};

export default ReportsPage;
