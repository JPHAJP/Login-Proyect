import React, { useState } from 'react';
import { CasaDelSolLogo } from './CasaDelSolLogo';
import { Login } from './Login';
import { Register } from './Register';
import './components.css';

export const HomePage = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Lado izquierdo - Logo */}
        <div className="home-left">
          <div className="logo-section">
            <CasaDelSolLogo size="large" />
            <div className="welcome-text">
              <h1>Bienvenido a nuestro hogar</h1>
              <p>
                Un espacio dedicado al cuidado, bienestar y desarrollo 
                de nuestra comunidad. Juntos construimos un futuro mejor.
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho - Login/Register */}
        <div className="home-right">
          <div className="auth-section">
            {showRegister ? (
              <Register onSwitchToLogin={() => setShowRegister(false)} />
            ) : (
              <Login onSwitchToRegister={() => setShowRegister(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};