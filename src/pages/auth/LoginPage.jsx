import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';
import FormInput from '../../components/common/FormInput';
import ErrorMessage from '../../components/common/ErrorMessage';

// Institutional Login Portal with college branding and role-based redirect
const LoginPage = () => {
  const { login } = useAuth();
  const { collegeName, departmentName } = useConfig();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Please provide both Roll Number/Username and Password.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(formData);

      // If backend indicates student/staff must change temporary password, force change-password page
      if (data.mustChangePassword) {
        navigate('/change-password');
        return;
      }

      // Redirect according to authenticated role
      if (data.role === 'ADMIN') {
        navigate('/admin');
      } else if (data.role === 'LAB_INCHARGE') {
        navigate('/incharge');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* College Header */}
        <div className="auth-header">
          <div className="logo-badge">🏛️</div>
          <h1>{collegeName}</h1>
          <p>{departmentName}</p>
        </div>

        {/* Login Form */}
        <div className="auth-body">
          <h2 style={{ fontSize: '18px', margin: '0 0 16px 0', textAlign: 'center', color: 'var(--secondary-color)' }}>
            ECE Laboratory Management Portal
          </h2>

          <ErrorMessage error={error} onDismiss={() => setError(null)} />

          <form onSubmit={handleSubmit}>
            <FormInput
              label="Username / Roll Number"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. admin or 24eg104e29"
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '8px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Access Credentials */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed var(--border-color)' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
              One-Click Quick Login (Demo & Viva)
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ username: 'admin', password: 'admin123' })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'left' }}
              >
                🛡️ <strong>Admin</strong><br /><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>admin / admin123</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ username: 'incharge_vlsi', password: 'incharge123' })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'left' }}
              >
                🔬 <strong>VLSI In-charge</strong><br /><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>incharge_vlsi</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ username: 'assistant_vlsi', password: 'assistant123' })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'left' }}
              >
                🛠️ <strong>VLSI Assistant</strong><br /><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>assistant_vlsi</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ username: 'incharge_edc', password: 'incharge123' })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'left' }}
              >
                ⚡ <strong>EDC In-charge</strong><br /><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>incharge_edc</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ username: '24eg104e01', password: 'student123' })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'left' }}
              >
                👨‍🎓 <strong>Student 1</strong><br /><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>24eg104e01 / student123</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ username: '24eg104e29', password: 'Student@123' })}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '11px', padding: '6px 8px', textAlign: 'left' }}
              >
                👨‍🎓 <strong>Student (Vishal)</strong><br /><span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>24eg104e29</span>
              </button>
            </div>
          </div>
        </div>

        <div className="auth-footer">
          <span>ECE Lab Management Portal • Anurag University</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
