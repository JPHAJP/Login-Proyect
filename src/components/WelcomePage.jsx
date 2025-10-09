import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CasaDelSolLogo } from './CasaDelSolLogo';
import './components.css';

export const WelcomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate('/profile');
  };

  const handleGoToAdmin = () => {
    navigate('/admin');
  };

  const getRoleWelcomeMessage = () => {
    const messages = {
      admin: '¡Bienvenido administrador! Tienes acceso completo al sistema.',
      voluntarios: '¡Gracias por ser parte de nuestro equipo de voluntarios!',
      personal: '¡Bienvenido al equipo! Juntos hacemos la diferencia.',
      servicio_social: '¡Gracias por tu compromiso con el servicio social!',
      visitas: '¡Bienvenido! Esperamos que disfrutes tu visita.',
      familiares: '¡Bienvenido! Nos alegra tenerte como parte de nuestra familia.',
      donantes: '¡Gracias por tu generosidad y apoyo continuo!',
      proveedores: '¡Bienvenido! Valoramos mucho nuestra asociación.'
    };
    return messages[user?.role] || '¡Bienvenido a Casa del Sol!';
  };

  return (
    <div className="main-content">
      <div className="welcome-page">
        <div className="welcome-container">
          <div className="welcome-content">
            <div className="welcome-logo">
              <CasaDelSolLogo size="medium" />
            </div>

            <div className="welcome-message">
              <h1>¡Bienvenido, {user?.nombre_completo}!</h1>
              <p className="role-message">{getRoleWelcomeMessage()}</p>
            </div>

            <div className="welcome-actions">
              <button 
                className="btn btn-primary btn-large"
                onClick={handleViewProfile}
              >
                <span className="btn-icon">👤</span>
                Ver Mi Perfil
              </button>

              {user?.role === 'admin' && (
                <button 
                  className="btn btn-info btn-large"
                  onClick={handleGoToAdmin}
                >
                  <span className="btn-icon">⚙️</span>
                  Panel de Administración
                </button>
              )}
            </div>

            <div className="welcome-info">
              <div className="info-cards">
                <div className="info-card">
                  <div className="card-icon">🏠</div>
                  <div className="card-content">
                    <h3>Nuestra Misión</h3>
                    <p>Brindar cuidado y bienestar a nuestra comunidad con amor y dedicación.</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon">🤝</div>
                  <div className="card-content">
                    <h3>Trabajamos Juntos</h3>
                    <p>Cada persona es importante en nuestra gran familia de Casa del Sol.</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="card-icon">🌟</div>
                  <div className="card-content">
                    <h3>Impacto Positivo</h3>
                    <p>Juntos creamos un impacto positivo en la vida de quienes más lo necesitan.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};