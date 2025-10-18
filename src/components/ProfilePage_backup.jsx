import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user } = useAuth();
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  if (!user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorizationStatus = () => {
    if (user.authorization_status) {
      return {
        status: user.authorization_status,
        label: user.authorization_status === 'authorized' ? 'Autorizado' :
               user.authorization_status === 'pending' ? 'Pendiente de Autorización' :
               user.authorization_status === 'unauthorized' ? 'Desautorizado' : 'Estado Desconocido',
        icon: user.authorization_status === 'authorized' ? '✅' :
              user.authorization_status === 'pending' ? '⏳' :
              user.authorization_status === 'unauthorized' ? '🚫' : '❓',
        color: user.authorization_status === 'authorized' ? 'bg-green-100 text-green-800' :
               user.authorization_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
               user.authorization_status === 'unauthorized' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      };
    }
    // Fallback al sistema anterior
    return {
      status: user.is_authorized ? 'authorized' : 'pending',
      label: user.is_authorized ? 'Autorizado' : 'Pendiente de Autorización',
      icon: user.is_authorized ? '✅' : '⏳',
      color: user.is_authorized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    };
  };

  const authStatus = getAuthorizationStatus();

  const getRoleLabel = (role) => {
    const roleLabels = {
      admin: 'Administrador',
      user: 'Usuario',
      manager: 'Gerente',
      voluntarios: 'Voluntarios',
      personal: 'Personal',
      servicio_social: 'Servicio Social',
      visitas: 'Visitas',
      familiares: 'Familiares',
      donantes: 'Donantes',
      proveedores: 'Proveedores'
    };
    return roleLabels[role] || role;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casa-cyan via-white to-casa-purple p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-casa-cyan to-casa-purple p-8 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-2xl font-bold">
                {user.nombre_completo.charAt(0)}{user.apellidos.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{user.nombre_completo} {user.apellidos}</h1>
                <p className="text-white text-opacity-90 text-lg mb-3">{user.email}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-full">
                  <span className="text-2xl">
                    {authStatus.icon}
                  </span>
                  <span className="font-medium">
                    {authStatus.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Información Personal */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span>
              Información Personal
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre Completo:</label>
                  <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{user.nombre_completo} {user.apellidos}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Correo Electrónico:</label>
                  <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Edad:</label>
                  <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{user.edad} años</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Teléfono:</label>
                  <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{user.telefono}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Dirección:</label>
                  <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{user.direccion}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Rol:</label>
                  <span className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'voluntarios' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'personal' ? 'bg-green-100 text-green-800' :
                    user.role === 'servicio_social' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'visitas' ? 'bg-yellow-100 text-yellow-800' :
                    user.role === 'familiares' ? 'bg-pink-100 text-pink-800' :
                    user.role === 'donantes' ? 'bg-orange-100 text-orange-800' :
                    user.role === 'proveedores' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Cuenta */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📅</span>
              Información de Cuenta
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Registro:</label>
                <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{formatDate(user.created_at)}</p>
              </div>
              {user.authorized_at && (
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Fecha de Autorización:</label>
                  <p className="text-lg text-gray-800 bg-gray-50 px-4 py-2 rounded-lg">{formatDate(user.authorized_at)}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Estado de la Cuenta:</label>
                <span className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${authStatus.color}`}>
                  {authStatus.icon} {authStatus.label}
                </span>
                {user.authorization_info && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">Información adicional:</p>
                    <p className="text-sm text-blue-700">{user.authorization_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información adicional según el estado */}
          {authStatus.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                Cuenta Pendiente
              </h2>
              <div className="bg-white rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Tu cuenta está pendiente de autorización por parte del administrador. 
                  Una vez autorizada, podrás acceder a todas las funcionalidades del sistema.
                </p>
                <p className="text-gray-700">
                  Si tienes preguntas o necesitas asistencia, por favor contacta al administrador.
                </p>
              </div>
            </div>
          )}

          {authStatus.status === 'unauthorized' && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-red-800 mb-4 flex items-center gap-3">
                <span className="text-3xl">🚫</span>
                Cuenta Desautorizada
              </h2>
              <div className="bg-white rounded-xl p-6">
                <p className="text-gray-700 mb-4">
                  Tu cuenta ha sido desautorizada. No tienes acceso a las funcionalidades del sistema.
                </p>
                {user.authorization_info && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-red-800 font-medium">Motivo:</p>
                    <p className="text-red-700">{user.authorization_info}</p>
                  </div>
                )}
                <p className="text-gray-700">
                  Si consideras que esto es un error, por favor contacta al administrador.
                </p>
              </div>
            </div>
          )}

          {/* Acceso y Seguridad */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <span className="text-3xl">🔐</span>
                Acceso y Seguridad
              </h2>
              <button
                onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <span>{showSecurityInfo ? 'Ocultar detalles' : 'Ver detalles'}</span>
                <div className={`transform transition-transform duration-200 ${showSecurityInfo ? 'rotate-180' : ''}`}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
            </div>
            
            <div className={`transition-all duration-300 overflow-hidden ${showSecurityInfo ? 'max-h-96 opacity-100' : 'max-h-32 opacity-100'}`}>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="text-3xl">🔑</div>
                  <div>
                    <h4 className="font-semibold text-green-800 mb-1">Autenticación Segura</h4>
                    <p className="text-green-700">Tu cuenta utiliza autenticación JWT para garantizar la seguridad de tus datos.</p>
                  </div>
                </div>
                
                {showSecurityInfo && (
                  <>
                    <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="text-3xl">🛡️</div>
                      <div>
                        <h4 className="font-semibold text-blue-800 mb-1">Protección de Datos</h4>
                        <p className="text-blue-700">Toda tu información personal está protegida y encriptada según estándares de seguridad.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <div className="text-3xl">�</div>
                      <div>
                        <h4 className="font-semibold text-purple-800 mb-1">Control de Acceso QR</h4>
                        <p className="text-purple-700">Utiliza el sistema QR para registrar tus entradas y salidas de forma segura.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;