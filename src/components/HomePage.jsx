import React, { useState } from 'react';
import { CasaDelSolLogo } from './CasaDelSolLogo';
import { Login } from './Login';
import { Register } from './Register';
import './components.css';

export const HomePage = () => {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen max-w-7xl mx-auto">
        {/* Lado izquierdo - Logo */}
        <div className="flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-cyan-50 to-green-50 relative">
          <div className="max-w-lg z-10 relative text-center">
            <CasaDelSolLogo size="large" />
            <div className="mt-8">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                Bienvenido a nuestro hogar
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Un espacio dedicado al cuidado, bienestar y desarrollo 
                de nuestra comunidad. Juntos construimos un futuro mejor.
              </p>
            </div>
          </div>
        </div>

        {/* Lado derecho - Login/Register */}
        <div className="flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">
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