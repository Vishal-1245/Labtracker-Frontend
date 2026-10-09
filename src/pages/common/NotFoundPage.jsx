import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// 404 Not Found page for invalid routes
const NotFoundPage = () => {
  const { isAuthenticated, role } = useAuth();

  const getHomeLink = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'ADMIN') return '/admin';
    if (role === 'LAB_INCHARGE') return '/incharge';
    return '/student';
  };

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
      <h1 style={{ fontSize: '36px', color: 'var(--primary-color)', margin: '0 0 12px 0' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '480px', margin: '0 auto 24px auto' }}>
        The laboratory portal page you are looking for does not exist or may have been moved.
      </p>
      <Link to={getHomeLink()} className="btn btn-primary">
        Return to Home / Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
