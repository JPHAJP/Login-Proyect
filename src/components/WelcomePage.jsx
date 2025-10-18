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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-green-50 flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <div className="mb-8">
            <CasaDelSolLogo size="medium" />
          </div>

          <div className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              ¡Bienvenido, {user?.nombre_completo}!
            </h1>
            <p className="text-xl text-gray-600">{getRoleWelcomeMessage()}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <button 
              className="bg-gradient-to-r from-casa-purple to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-48"
              onClick={handleViewProfile}
            >
              <span className="mr-2 text-xl">👤</span>
              Ver Mi Perfil
            </button>

            <button 
              className="bg-gradient-to-r from-casa-green to-green-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-48"
              onClick={() => navigate('/access')}
            >
              <span className="mr-2 text-xl">🔐</span>
              Control de Acceso
            </button>

            {user?.role === 'admin' && (
              <>
                <button 
                  className="bg-gradient-to-r from-casa-cyan to-cyan-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-48"
                  onClick={handleGoToAdmin}
                >
                  <span className="mr-2 text-xl">⚙️</span>
                  Panel de Administración
                </button>
                
                <button 
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-48"
                  onClick={() => navigate('/admin/access')}
                >
                  <span className="mr-2 text-xl">📊</span>
                  Gestión de Accesos
                </button>

                <button 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-48"
                  onClick={() => navigate('/admin/qr')}
                >
                  <span className="mr-2 text-xl">🎯</span>
                  Mostrar Código QR
                </button>
              </>
            )}
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Nuestra Misión</h3>
                <p className="text-gray-600">Brindar cuidado y bienestar a nuestra comunidad con amor y dedicación.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Trabajamos Juntos</h3>
                <p className="text-gray-600">Cada persona es importante en nuestra gran familia de Casa del Sol.</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Impacto Positivo</h3>
                <p className="text-gray-600">Juntos creamos un impacto positivo en la vida de quienes más lo necesitan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};