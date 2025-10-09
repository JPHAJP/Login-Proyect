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
import './components.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

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

  // Si el usuario no está autorizado, mostrar pantalla pendiente
  if (!user.is_authorized) {
    return (
      <>
        <Navbar />
        <PendingUser />
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
      {children}
    </>
  );
};

// Componente para rutas públicas (solo cuando no está autenticado)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Cargando...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    // Si está autenticado pero no autorizado
    if (!user.is_authorized) {
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
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminPanel />
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