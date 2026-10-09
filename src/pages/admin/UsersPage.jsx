import React, { useState, useEffect } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { getUsers, createUser, updateUser, deactivateUser, importUsersCsv } from '../../api/userApi';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import StatusBadge from '../../components/common/StatusBadge';
import FormInput from '../../components/common/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog';

// Admin page managing user accounts, roll number validation, and bulk CSV student onboarding
const UsersPage = () => {
  const { rollNoPattern } = useConfig();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Single User Create/Edit Modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'STUDENT',
    password: '',
    active: true,
  });
  const [modalError, setModalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bulk CSV Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importSummary, setImportSummary] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  // Deactivation confirmation dialog
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  // Fetch all users on mount
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on query and role
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Open modal for creating a new user
  const handleOpenCreateModal = () => {
    setEditingUser(null);
    setUserFormData({
      username: '',
      fullName: '',
      email: '',
      role: 'STUDENT',
      password: '',
      active: true,
    });
    setModalError(null);
    setIsUserModalOpen(true);
  };

  // Open modal for editing an existing user
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      password: '',
      active: user.active,
    });
    setModalError(null);
    setIsUserModalOpen(true);
  };

  // Handle single user form submit
  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    setModalError(null);

    // Client-side roll number pattern validation for student role
    if (userFormData.role === 'STUDENT' && rollNoPattern) {
      try {
        const regex = new RegExp(rollNoPattern);
        if (!regex.test(userFormData.username.trim())) {
          setModalError(`Student Roll Number must match pattern (e.g. 24eg104e29). Format: ${rollNoPattern}`);
          return;
        }
      } catch {
        // Fallback if pattern string is not standard regex
      }
    }

    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, userFormData);
        setActionSuccess(`User '${userFormData.username}' updated successfully.`);
      } else {
        await createUser(userFormData);
        setActionSuccess(`User '${userFormData.username}' registered successfully.`);
      }
      setIsUserModalOpen(false);
      fetchUsers();
    } catch (err) {
      setModalError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm and execute account deactivation
  const handleConfirmDeactivate = async () => {
    if (!deactivateTarget) return;
    try {
      await deactivateUser(deactivateTarget.id);
      setActionSuccess(`User '${deactivateTarget.username}' account deactivated.`);
      setDeactivateTarget(null);
      fetchUsers();
    } catch (err) {
      setError(err);
      setDeactivateTarget(null);
    }
  };

  // Handle CSV file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportError(null);
    }
  };

  // Upload and process bulk student CSV
  const handleImportCsv = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setImportError('Please choose a .csv file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setIsImporting(true);
    setImportError(null);
    setImportSummary(null);

    try {
      const summary = await importUsersCsv(formData);
      setImportSummary(summary);
      setActionSuccess(`Batch import completed: ${summary.createdCount} student accounts registered.`);
      fetchUsers();
    } catch (err) {
      setImportError(err);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header and Action Buttons */}
      <div className="page-header">
        <div>
          <h1 className="page-title">User Accounts</h1>
          <p className="page-subtitle">
            Manage students, laboratory in-charges, and administrators
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => { setImportSummary(null); setSelectedFile(null); setImportError(null); setIsImportModalOpen(true); }} className="btn btn-outline btn-sm">
            📁 Bulk Import Students
          </button>
          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
            + Add User
          </button>
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

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 260px' }}>
            <input
              type="text"
              placeholder="Search by Roll No, Name, or Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
          <div style={{ width: '180px' }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-control"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="LAB_INCHARGE">Lab In-charges</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <Loader message="Loading accounts list..." />
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <div className="empty-title">No User Accounts Found</div>
          <p className="empty-text">
            {searchQuery || roleFilter !== 'ALL'
              ? 'No accounts match your search filters.'
              : 'No accounts registered yet. Click "+ Add User" or "Bulk Import Students" to start.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Roll No / Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Must Change Password</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td><code>{user.username}</code></td>
                    <td><strong>{user.fullName}</strong></td>
                    <td>{user.email}</td>
                    <td><StatusBadge status={user.role} /></td>
                    <td><StatusBadge status={user.active} /></td>
                    <td>
                      {user.mustChangePassword ? (
                        <span className="badge badge-warning">Required</span>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Completed</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditModal(user)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Edit
                        </button>
                        {user.active && user.role !== 'ADMIN' && (
                          <button
                            onClick={() => setDeactivateTarget(user)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '12px', color: 'var(--danger-color)' }}
                          >
                            Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal */}
      {isUserModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingUser ? `Edit Account: ${editingUser.username}` : 'Add New User Account'}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleUserFormSubmit}>
              <div className="modal-body">
                <ErrorMessage error={modalError} onDismiss={() => setModalError(null)} />

                <FormInput
                  label="Username / Roll Number"
                  name="username"
                  value={userFormData.username}
                  onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  placeholder={userFormData.role === 'STUDENT' ? 'e.g. 24eg104e29' : 'e.g. staff_ece'}
                  helperText={userFormData.role === 'STUDENT' ? `Pattern: ${rollNoPattern}` : ''}
                  required
                />

                <FormInput
                  label="Full Name"
                  name="fullName"
                  value={userFormData.fullName}
                  onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  placeholder="e.g. K. Sai Kumar"
                  required
                />

                <FormInput
                  label="Email Address"
                  name="email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="e.g. saikumar@anurag.edu.in"
                  required
                />

                <div className="form-group">
                  <label htmlFor="role" className="form-label">
                    Role <span className="required">*</span>
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                    className="form-control"
                    required
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="LAB_INCHARGE">LAB_INCHARGE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <FormInput
                  label={editingUser ? 'New Password (leave empty to keep current)' : 'Password'}
                  name="password"
                  type="password"
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder={
                    editingUser
                      ? '••••••••'
                      : userFormData.role === 'STUDENT'
                      ? 'Defaults to Student@123'
                      : 'Defaults to default123'
                  }
                  helperText={!editingUser ? 'Leave blank to use institutional default' : ''}
                />

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="active"
                    checked={userFormData.active}
                    onChange={(e) => setUserFormData({ ...userFormData, active: e.target.checked })}
                  />
                  <label htmlFor="active" style={{ margin: 0, cursor: 'pointer', fontSize: '14px' }}>
                    Account is active
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
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
                  {isSubmitting ? 'Saving...' : editingUser ? 'Update Account' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Import Modal */}
      {isImportModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <div className="modal-header">
              <h3 className="modal-title">Bulk Student Registration (CSV)</h3>
              <button onClick={() => setIsImportModalOpen(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleImportCsv}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>
                  Upload a <code>.csv</code> file containing student roll numbers, full names, and email addresses.
                  Registered students will receive default password <code>Student@123</code> and will be prompted to change it on initial login.
                </p>

                <div className="card" style={{ background: 'var(--bg-primary)', padding: '10px', marginBottom: '14px', fontSize: '12px' }}>
                  <strong>Expected CSV columns:</strong><br />
                  <code>rollNo,fullName,email</code><br />
                  <em>Example:</em> <code>24eg104e01,Aarav Sharma,aarav@anurag.edu.in</code>
                </div>

                <ErrorMessage error={importError} onDismiss={() => setImportError(null)} />

                <div className="form-group">
                  <label className="form-label">Select CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="form-control"
                    required
                  />
                </div>

                {importSummary && (
                  <div className="card" style={{ padding: '12px', background: '#ecfdf5', borderColor: '#10b981', marginTop: '12px' }}>
                    <h4 style={{ margin: '0 0 6px 0', color: '#065f46', fontSize: '14px' }}>
                      Import Summary
                    </h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
                      ✓ <strong>{importSummary.createdCount}</strong> accounts successfully created.<br />
                      ℹ️ <strong>{importSummary.skippedCount}</strong> already existed and were skipped.
                    </p>
                    {importSummary.errors && importSummary.errors.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <strong style={{ color: 'var(--danger-color)', fontSize: '12px' }}>Issues encountered:</strong>
                        <ul style={{ margin: '4px 0 0 16px', fontSize: '12px', color: 'var(--danger-color)' }}>
                          {importSummary.errors.map((err, idx) => (
                            <li key={idx}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !selectedFile}
                  className="btn btn-primary btn-sm"
                >
                  {isImporting ? 'Processing File...' : 'Upload & Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate User Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deactivateTarget)}
        title="Deactivate Account"
        message={`Are you sure you want to deactivate ${deactivateTarget?.fullName} (${deactivateTarget?.username})? They will no longer be able to log in.`}
        confirmText="Deactivate"
        danger
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
};

export default UsersPage;
