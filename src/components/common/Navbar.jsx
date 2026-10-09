import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useConfig } from '../../context/ConfigContext';

// Institutional navigation bar with college branding, dynamic role menus, and user actions
const Navbar = () => {
  const { isAuthenticated, role, fullName, logout } = useAuth();
  const { collegeName, departmentName } = useConfig();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand identity */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔬</span>
          <div className="brand-titles">
            <span className="brand-college">{collegeName}</span>
            <span className="brand-dept">{departmentName}</span>
          </div>
        </Link>

        {/* Navigation links based on authenticated role */}
        {isAuthenticated && (
          <nav>
            <ul className="navbar-nav">
              {role === 'ADMIN' && (
                <>
                  <li><NavLink to="/admin" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                  <li><NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Users</NavLink></li>
                  <li><NavLink to="/admin/labs" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Labs</NavLink></li>
                  <li><NavLink to="/admin/experiments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Experiments</NavLink></li>
                  <li><NavLink to="/admin/equipment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Equipment</NavLink></li>
                  <li><NavLink to="/admin/components" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Components</NavLink></li>
                  <li><NavLink to="/admin/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Reports</NavLink></li>
                </>
              )}

              {role === 'LAB_INCHARGE' && (
                <>
                  <li><NavLink to="/incharge" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Dashboard</NavLink></li>
                  <li><NavLink to="/incharge/sessions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Sessions</NavLink></li>
                  <li><NavLink to="/incharge/equipment" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Equipment</NavLink></li>
                  <li><NavLink to="/incharge/components" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Components</NavLink></li>
                  <li><NavLink to="/incharge/experiments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Experiments</NavLink></li>
                  <li><NavLink to="/incharge/maintenance" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Maintenance</NavLink></li>
                </>
              )}

              {role === 'STUDENT' && (
                <>
                  <li><NavLink to="/student" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>My Dashboard</NavLink></li>
                  <li><NavLink to="/student/book" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Book Slot</NavLink></li>
                  <li><NavLink to="/student/experiments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Lab Manuals</NavLink></li>
                </>
              )}
            </ul>
          </nav>
        )}

        {/* User profile & actions */}
        <div className="navbar-user">
          {isAuthenticated ? (
            <>
              <div className="user-profile">
                <span className="user-name">{fullName || 'User'}</span>
                <span className="user-role-tag">{role}</span>
              </div>
              <NavLink to="/change-password" className="btn btn-outline btn-sm" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.4)' }}>
                🔑 Password
              </NavLink>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
