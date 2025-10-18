import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CasaDelSolLogo } from './CasaDelSolLogo';
import './components.css';

export const Dashboard = () => {
  const { user } = useAuth();

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="main-content">
      <div className="profile-hero">
        <div className="hero-background">
          <div className="hero-pattern"></div>
        </div>
        
        <div className="hero-content">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {getUserInitials()}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user.nombre_completo} {user.apellidos}</h1>
              <div className="profile-role">
                <span className={`role-badge-large ${user.role}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
              <div className="profile-status">
                <span className={`status-indicator ${
                  user.authorization_status === 'authorized' || user.is_authorized ? 'authorized' : 
                  user.authorization_status === 'unauthorized' ? 'unauthorized' : 'pending'
                }`}>
                  <span className="status-dot"></span>
                  {user.authorization_status === 'authorized' || user.is_authorized ? 'Cuenta Autorizada' : 
                   user.authorization_status === 'unauthorized' ? 'Cuenta Desautorizada' : 'Pendiente de Autorización'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-container">
          <div className="profile-grid">
            {/* Información Personal */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Información Personal</h2>
                <div className="section-icon">👤</div>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Email</div>
                  <div className="info-value">{user.email}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Edad</div>
                  <div className="info-value">{user.edad} años</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Teléfono</div>
                  <div className="info-value">{user.telefono}</div>
                </div>
                <div className="info-item full-width">
                  <div className="info-label">Dirección</div>
                  <div className="info-value">{user.direccion}</div>
                </div>
              </div>
            </div>

            {/* Información de Cuenta */}
            <div className="profile-section">
              <div className="section-header">
                <h2>Información de Cuenta</h2>
                <div className="section-icon">🔐</div>
              </div>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Fecha de Registro</div>
                  <div className="info-value">
                    {user.created_at ? formatDate(user.created_at) : 'No disponible'}
                  </div>
                </div>
                {user.authorized_at && (
                  <div className="info-item">
                    <div className="info-label">Fecha de Autorización</div>
                    <div className="info-value">{formatDate(user.authorized_at)}</div>
                  </div>
                )}
                <div className="info-item">
                  <div className="info-label">Estado de Cuenta</div>
                  <div className="info-value">
                    <span className={`mini-badge ${user.is_authorized ? 'success' : 'warning'}`}>
                      {user.is_authorized ? '✓ Autorizada' : '⏳ Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bienvenida con logo */}
          <div className="profile-welcome">
            <div className="welcome-card">
              <CasaDelSolLogo size="small" />
              <div className="welcome-message">
                <h3>¡Gracias por ser parte de Casa del Sol!</h3>
                <p>
                  Tu participación es valiosa para nuestra comunidad. 
                  Juntos construimos un espacio de bienestar y crecimiento.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};