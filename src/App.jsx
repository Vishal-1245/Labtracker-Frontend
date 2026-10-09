import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import ChangePasswordPage from './pages/auth/ChangePasswordPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersPage from './pages/admin/UsersPage';
import LabsPage from './pages/admin/LabsPage';
import ExperimentsPage from './pages/admin/ExperimentsPage';
import EquipmentPage from './pages/admin/EquipmentPage';
import ComponentsPage from './pages/admin/ComponentsPage';
import ReportsPage from './pages/admin/ReportsPage';

// Lab In-charge Pages
import InchargeDashboard from './pages/incharge/InchargeDashboard';
import SessionsPage from './pages/incharge/SessionsPage';
import MaintenancePage from './pages/incharge/MaintenancePage';

// Student Pages (Phase 5)
import StudentDashboard from './pages/student/StudentDashboard';
import BookSlotPage from './pages/student/BookSlotPage';
import StudentExperimentsPage from './pages/student/StudentExperimentsPage';
import ExperimentGuidePage from './pages/student/ExperimentGuidePage';

// Common Pages
import NotFoundPage from './pages/common/NotFoundPage';

// Root redirect component routing user directly to their respective home dashboard
const RootRedirect = () => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (role === 'LAB_INCHARGE') return <Navigate to="/incharge" replace />;
  if (role === 'STUDENT') return <Navigate to="/student" replace />;

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ConfigProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-layout">
            <Navbar />
            <main className="app-main">
              <Routes>
                {/* Root Route */}
                <Route path="/" element={<RootRedirect />} />

                {/* Public Authentication Route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Password Change (Protected for all authenticated users) */}
                <Route
                  path="/change-password"
                  element={
                    <ProtectedRoute>
                      <ChangePasswordPage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/labs"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <LabsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/experiments"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'LAB_INCHARGE']}>
                      <ExperimentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/equipment"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'LAB_INCHARGE']}>
                      <EquipmentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/components"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'LAB_INCHARGE']}>
                      <ComponentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN', 'LAB_INCHARGE']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Lab Incharge Routes */}
                <Route
                  path="/incharge"
                  element={
                    <ProtectedRoute allowedRoles={['LAB_INCHARGE', 'ADMIN']}>
                      <InchargeDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incharge/sessions"
                  element={
                    <ProtectedRoute allowedRoles={['LAB_INCHARGE', 'ADMIN']}>
                      <SessionsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incharge/equipment"
                  element={
                    <ProtectedRoute allowedRoles={['LAB_INCHARGE', 'ADMIN']}>
                      <EquipmentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incharge/components"
                  element={
                    <ProtectedRoute allowedRoles={['LAB_INCHARGE', 'ADMIN']}>
                      <ComponentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incharge/experiments"
                  element={
                    <ProtectedRoute allowedRoles={['LAB_INCHARGE', 'ADMIN']}>
                      <ExperimentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/incharge/maintenance"
                  element={
                    <ProtectedRoute allowedRoles={['LAB_INCHARGE', 'ADMIN']}>
                      <MaintenancePage />
                    </ProtectedRoute>
                  }
                />

                {/* Student Routes (Phase 5) */}
                <Route
                  path="/student"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/book"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                      <BookSlotPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/experiments"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                      <StudentExperimentsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/experiments/:id"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
                      <ExperimentGuidePage />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
