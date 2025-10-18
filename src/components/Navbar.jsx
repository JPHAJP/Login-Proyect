import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoImage from '../assets/LogoCasaDelSol2-980x493.png';
import './components.css';

export const Navbar = () => {
  const { user, logout, isAuthenticated, canAccessQR } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Si no está autenticado, no mostrar navbar
  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
    setShowDropdown(false);
  };

  const getUserInitials = () => {
    if (!user.nombre_completo || !user.apellidos) return 'US';
    return `${user.nombre_completo.charAt(0)}${user.apellidos.charAt(0)}`.toUpperCase();
  };

  const getAuthorizationStatus = () => {
    if (user.authorization_status) {
      return {
        status: user.authorization_status,
        label: user.authorization_status === 'authorized' ? 'Autorizado' :
               user.authorization_status === 'pending' ? 'Pendiente' :
               user.authorization_status === 'unauthorized' ? 'Desautorizado' : 'Desconocido',
        color: user.authorization_status === 'authorized' ? 'bg-green-100 text-green-800' :
               user.authorization_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
               user.authorization_status === 'unauthorized' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
      };
    }
    // Fallback al sistema anterior
    return {
      status: user.is_authorized ? 'authorized' : 'pending',
      label: user.is_authorized ? 'Autorizado' : 'Pendiente',
      color: user.is_authorized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    };
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

  const authStatus = getAuthorizationStatus();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/welcome" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200">
            <img 
              src={logoImage} 
              alt="Casa del Sol - Centro de Bienestar" 
              className="h-12 w-auto object-contain"
            />
          </Link>
        </div>

        <div className="relative">
          <div 
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200" 
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-9 h-9 bg-gradient-to-r from-casa-cyan to-casa-purple text-white rounded-full flex items-center justify-center font-semibold text-sm">
              {getUserInitials()}
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">{user.nombre_completo} {user.apellidos}</div>
              <div className="text-xs text-gray-600">{getRoleLabel(user.role)}</div>
            </div>
            <div className="text-gray-500 transition-transform duration-200">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8l-4 4z"/>
              </svg>
            </div>
          </div>

          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
              <div className="p-4 flex items-center gap-3 bg-gray-50 border-b border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-r from-casa-cyan to-casa-purple text-white rounded-full flex items-center justify-center font-semibold">
                  {getUserInitials()}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-800">{user.nombre_completo} {user.apellidos}</div>
                  <div className="text-sm text-gray-600 mb-1">{user.email}</div>
                  <div className="flex items-center">
                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${authStatus.color}`}>
                      {authStatus.label}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="py-2">
                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <span className="text-lg">👤</span>
                  <span>Mi Perfil</span>
                </Link>
                
                {canAccessQR ? (
                  <Link to="/access" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                    <span className="text-lg">🔐</span>
                    <span>Control de Acceso</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-4 py-3 text-gray-400 cursor-not-allowed">
                    <span className="text-lg">🔐</span>
                    <span>Control de Acceso</span>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">Sin acceso</span>
                  </div>
                )}
                
                {user.role === 'admin' && (
                  <>
                    <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-lg">⚙️</span>
                      <span>Panel Admin</span>
                    </Link>
                    <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-lg">🔍</span>
                      <span>Buscar Usuarios</span>
                    </Link>
                    <Link to="/admin/access" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-lg">📊</span>
                      <span>Gestión de Accesos</span>
                    </Link>
                    <Link to="/admin/qr" className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                      <span className="text-lg">🎯</span>
                      <span>Mostrar Código QR</span>
                    </Link>
                  </>
                )}
              </div>
              
              <div className="border-t border-gray-200 mt-2"></div>
              
              <button 
                className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 border-0 bg-transparent"
                onClick={handleLogout}
              >
                <span className="text-lg">🚪</span>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay para cerrar dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        ></div>
      )}
    </nav>
  );
};