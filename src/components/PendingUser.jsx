import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './components.css';

export const PendingUser = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  return (
    <div className="auth-container">
      <div className="pending-message">
        <h2>Cuenta Pendiente de Autorización</h2>
        <p>
          Hola <strong>{user.nombre_completo}</strong>, tu cuenta ha sido creada exitosamente 
          pero está pendiente de autorización por parte de un administrador.
        </p>
        <p>
          Te notificaremos por email cuando tu cuenta sea autorizada y puedas acceder 
          completamente al sistema.
        </p>
        
        <div className="mt-4">
          <button 
            className="btn btn-secondary"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </button>
        </div>

        <div className="card mt-4">
          <div className="card-header">
            <h4>Información de tu Solicitud</h4>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nombre</label>
                <div className="user-info-display">
                  {user.nombre_completo} {user.apellidos}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="user-info-display">{user.email}</div>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Rol Solicitado</label>
                <div className="user-info-display">
                  <span className={`role-badge ${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Solicitud</label>
                <div className="user-info-display">
                  {new Date(user.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};