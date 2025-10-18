import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './components.css';

export const PendingUser = () => {
  const { user, logout, isUnauthorized, isPending } = useAuth();

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  // Determinar título y mensaje según el estado
  const getStatusInfo = () => {
    if (isUnauthorized) {
      return {
        title: 'Cuenta Desautorizada',
        message: `Hola ${user.nombre_completo}, tu cuenta ha sido desautorizada.`,
        detail: user.authorization_info || 'Contacta al administrador para más información.',
        icon: '🚫',
        statusClass: 'unauthorized'
      };
    } else if (isPending) {
      return {
        title: 'Cuenta Pendiente de Autorización',
        message: `Hola ${user.nombre_completo}, tu cuenta ha sido creada exitosamente pero está pendiente de autorización por parte de un administrador.`,
        detail: 'Te notificaremos por email cuando tu cuenta sea autorizada y puedas acceder completamente al sistema.',
        icon: '⏳',
        statusClass: 'pending'
      };
    } else {
      return {
        title: 'Estado de Cuenta',
        message: `Hola ${user.nombre_completo}, hay un problema con tu cuenta.`,
        detail: 'Contacta al administrador para más información.',
        icon: '❓',
        statusClass: 'unknown'
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="auth-container">
      <div className={`pending-message ${statusInfo.statusClass}`}>
        <div className="status-icon">{statusInfo.icon}</div>
        <h2>{statusInfo.title}</h2>
        <p>{statusInfo.message}</p>
        <p>{statusInfo.detail}</p>
        
        {isUnauthorized && user.unauthorized_at && (
          <div className="alert alert-error mt-3">
            <strong>Fecha de desautorización:</strong>{' '}
            {new Date(user.unauthorized_at).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
        
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
                <label className="form-label">Estado de Autorización</label>
                <div className="user-info-display">
                  <span className={`role-badge ${statusInfo.statusClass}`}>
                    {user.authorization_status === 'pending' ? 'Pendiente' : 
                     user.authorization_status === 'unauthorized' ? 'Desautorizada' :
                     user.authorization_status === 'authorized' ? 'Autorizada' :
                     user.is_authorized ? 'Autorizada (Legacy)' : 'Pendiente'}
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