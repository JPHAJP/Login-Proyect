import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import './components.css';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { showSuccess } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);

  // Si no está autenticado, no mostrar navbar
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
      showSuccess('Sesión cerrada exitosamente');
    }
    setShowDropdown(false);
  };

  const getUserInitials = () => {
    if (!user.nombre_completo || !user.apellidos) return 'US';
    return `${user.nombre_completo.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrador',
      voluntarios: 'Voluntario',
      personal: 'Personal',
      servicio_social: 'Servicio Social',
      visitas: 'Visitante',
      familiares: 'Familiar',
      donantes: 'Donante',
      proveedores: 'Proveedor'
    };
    return labels[role] || role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <span className="brand-icon">🏠</span>
            <span className="brand-text">Casa del Sol</span>
          </div>
        </div>

        <div className="navbar-user">
          <div 
            className="user-menu" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-info">
              <div className="user-name">{user.nombre_completo} {user.apellidos}</div>
              <div className="user-role">{getRoleLabel(user.role)}</div>
            </div>
            <div className="dropdown-arrow">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8l-4 4z"/>
              </svg>
            </div>
          </div>

          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar large">
                  {getUserInitials()}
                </div>
                <div className="user-details">
                  <div className="user-name">{user.nombre_completo} {user.apellidos}</div>
                  <div className="user-email">{user.email}</div>
                  <div className="user-status">
                    <span className={`status-badge ${user.is_authorized ? 'authorized' : 'pending'}`}>
                      {user.is_authorized ? 'Autorizado' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="dropdown-divider"></div>
              
              <button 
                className="dropdown-item logout-item"
                onClick={handleLogout}
              >
                <span className="item-icon">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div 
          className="dropdown-overlay" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
};