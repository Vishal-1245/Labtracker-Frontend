import React, { useState, useEffect } from 'react';
import { getMaintenanceLogs, resolveMaintenance } from '../../api/equipmentApi';
import { useAuth } from '../../context/AuthContext';

// Institutional multi-role defect & maintenance broadcast banner
// Synchronizes instrument breakdowns and defect logs across Admin, Lab In-charge, Assistant, and Students
const BroadcastBanner = ({ onRefreshData = null }) => {
  const { role } = useAuth();
  const [activeLogs, setActiveLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchActiveAlerts = async () => {
    try {
      const logs = await getMaintenanceLogs({ resolved: false });
      setActiveLogs(logs);
    } catch {
      // In case user is offline or not authenticated yet, fail silently
      setActiveLogs([]);
    }
  };

  useEffect(() => {
    fetchActiveAlerts();
    // Poll every 30 seconds for live updates between logged-in tabs
    const interval = setInterval(fetchActiveAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickResolve = async (logId, assetTag) => {
    try {
      await resolveMaintenance(logId);
      setActionMsg(`Asset '${assetTag}' restored to AVAILABLE.`);
      fetchActiveAlerts();
      if (onRefreshData) onRefreshData();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      console.error('Failed to resolve maintenance issue:', err);
    }
  };

  if (activeLogs.length === 0 && !actionMsg) {
    return null;
  }

  return (
    <div className="broadcast-alert-panel">
      <div className="broadcast-alert-header">
        <h4 className="broadcast-alert-title">
          <span>⚠️</span> Departmental Maintenance Notice & Instrument Downtime ({activeLogs.length} active)
        </h4>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#92400e',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ fontSize: '12px', color: 'var(--success-color)', fontWeight: 600, marginTop: '4px' }}>
          ✓ {actionMsg}
        </div>
      )}

      {isExpanded && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeLogs.map((log) => (
            <div key={log.id} className="broadcast-item">
              <div>
                <strong>[{log.equipmentAssetTag || `Equipment #${log.equipmentId}`}]</strong>{' '}
                <span style={{ fontWeight: 500 }}>{log.issueDescription}</span>
                <span style={{ fontSize: '11px', color: '#b45309', marginLeft: '8px' }}>
                  • Reported {log.reportedAt ? new Date(log.reportedAt).toLocaleDateString() : 'recently'}
                </span>
              </div>

              {(role === 'ADMIN' || role === 'LAB_INCHARGE') && (
                <button
                  type="button"
                  onClick={() => handleQuickResolve(log.id, log.equipmentAssetTag || 'Equipment')}
                  className="btn btn-sm btn-outline"
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    backgroundColor: '#ffffff',
                    borderColor: '#d97706',
                    color: '#b45309',
                    whiteSpace: 'nowrap',
                  }}
                  title="Mark maintenance resolved and restore instrument to Available"
                >
                  ✓ Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BroadcastBanner;
