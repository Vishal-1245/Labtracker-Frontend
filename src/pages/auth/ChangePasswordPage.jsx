import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import { changePassword } from '../../api/authApi';
import FormInput from '../../components/common/FormInput';
import ErrorMessage from '../../components/common/ErrorMessage';

// Page allowing users to update their account password (mandatory on first login for students)
const ChangePasswordPage = () => {
  const { role, mustChangePassword, clearMustChangePassword } = useAuth();
  const { collegeName, departmentName } = useConfig();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');

    // Client-side validations
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (formData.newPassword === formData.oldPassword) {
      setError('New password must be different from the current password.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      // Clear the mandatory password reset flag in AuthContext and localStorage
      clearMustChangePassword();
      setSuccessMsg('Password changed successfully! Redirecting to your dashboard...');

      setTimeout(() => {
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'LAB_INCHARGE') {
          navigate('/incharge');
        } else if (role === 'LAB_ASSISTANT') {
          navigate('/assistant');
        } else {
          navigate('/student');
        }
      }, 1500);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'LAB_INCHARGE') navigate('/incharge');
    else if (role === 'LAB_ASSISTANT') navigate('/assistant');
    else navigate('/student');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* College Header */}
        <div className="auth-header">
          <div className="logo-badge">🔐</div>
          <h1>{collegeName}</h1>
          <p>{departmentName}</p>
        </div>

        {/* Change Password Body */}
        <div className="auth-body">
          <h2 style={{ fontSize: '18px', margin: '0 0 12px 0', textAlign: 'center', color: 'var(--secondary-color)' }}>
            {mustChangePassword ? 'First-Time Password Change' : 'Update Your Password'}
          </h2>

          {mustChangePassword && (
            <div className="alert alert-warning" style={{ fontSize: '13px', marginBottom: '16px' }}>
              ℹ️ For security, you must update your default password before accessing the lab portal.
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success" style={{ fontSize: '13px', marginBottom: '16px' }}>
              ✓ {successMsg}
            </div>
          )}

          <ErrorMessage error={error} onDismiss={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Current Password"
              name="oldPassword"
              type="password"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />

            <FormInput
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              required
            />

            <FormInput
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter new password"
              required
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              {!mustChangePassword && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-footer">
          <span>Keep your login credentials confidential at all times.</span>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
