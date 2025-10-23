/**
 * Routes Configuration
 * Defines all application routes
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../store/slices/authSlice';

// Route Components
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Layout
import MainLayout from '../components/layout/MainLayout';

// Pages (placeholders - will be created later)
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import SalesPage from '../pages/SalesPage';
import UsersPage from '../pages/UsersPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

// Constants
import { ROLES } from '../constants';

/**
 * App Routes
 */
const AppRoutes = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Default redirect to dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Sales */}
        <Route path="sales" element={<SalesPage />} />

        {/* Users (Admin only) */}
        <Route
          path="users"
          element={
            <RoleRoute allowedRoles={[ROLES.ADMIN.ID]}>
              <UsersPage />
            </RoleRoute>
          }
        />

        {/* Profile */}
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;