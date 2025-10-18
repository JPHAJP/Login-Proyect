import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../contexts/ToastContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { HomePage } from './HomePage';
import { WelcomePage } from './WelcomePage';
import { Dashboard } from './Dashboard';
import { AdminPanel } from './AdminPanel';
import { PendingUser } from './PendingUser';
import { Navbar } from './Navbar';
import QRScanner from './QRScanner';
import QRDisplay from './QRDisplay';
import AccessManagement from './AccessManagement';
import ProfilePage from './ProfilePage';
import UserSearch from './UserSearch';

import './components.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requireAdmin = false, requireQRAccess = false }) => {
  const { isAuthenticated, user, loading, isPending, isAuthorized, isUnauthorized, canAccessQR } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Cargando...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Si el usuario no puede acceder (estado pending), mostrar pantalla pendiente
  if (isPending) {
    return (
      <>
        <Navbar />
        <div className="main-content">
          <PendingUser />
        </div>
      </>
    );
  }

  // Si el usuario está desautorizado y intenta acceder a QR
  if (requireQRAccess && !canAccessQR) {
    return (
      <>
        <Navbar />
        <div className="main-content">
          <div className="alert alert-error">
            <h3>Acceso Restringido</h3>
            <p>
              {isUnauthorized 
                ? 'Tu acceso ha sido desautorizado. No puedes usar las funcionalidades QR.' 
                : 'Tu cuenta no tiene autorización para acceder a las funcionalidades QR.'}
            </p>
            <p>Si crees que esto es un error, contacta al administrador.</p>
          </div>
        </div>
      </>
    );
  }

  // Si requiere admin y el usuario no es admin
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="main-content">
        {children}
      </div>
    </>
  );
};

// Componente para rutas públicas (solo cuando no está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading, isPending } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Cargando...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    // Si está autenticado pero pendiente de autorización
    if (isPending) {
      return <Navigate to="/pending" replace />;
    }
    
    // Redirigir a welcome después del login
    return <Navigate to="/welcome" replace />;
  }

  return children;
};

// Componente principal de enrutamiento
const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta pública - Home/Login */}
      <Route path="/" element={
        <PublicRoute>
          <HomePage />
        </PublicRoute>
      } />

      {/* Rutas protegidas */}
      <Route path="/welcome" element={
        <ProtectedRoute>
          <WelcomePage />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminPanel />
        </ProtectedRoute>
      } />

      <Route path="/access" element={
        <ProtectedRoute requireQRAccess={true}>
          <QRScanner />
        </ProtectedRoute>
      } />

      <Route path="/admin/access" element={
        <ProtectedRoute requireAdmin={true}>
          <AccessManagement />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute requireAdmin={true}>
          <UserSearch />
        </ProtectedRoute>
      } />

      <Route path="/admin/qr" element={
        <ProtectedRoute requireAdmin={true}>
          <QRDisplay />
        </ProtectedRoute>
      } />



      <Route path="/pending" element={
        <ProtectedRoute>
          <PendingUser />
        </ProtectedRoute>
      } />

      {/* Ruta catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Layout con navbar para rutas autenticadas
const AuthenticatedLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// Componente principal
const AppContent = () => {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
};

export default AppContent;