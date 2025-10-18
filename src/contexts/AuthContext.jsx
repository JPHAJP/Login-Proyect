import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, utilsAPI } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState(null); // Estado de autorización detallado
  const { showSuccess, showError } = useToast();

  // Verificar autenticación al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await utilsAPI.testConnection();

        if (authService.isAuthenticated()) {
          // Si tenemos token, intentar obtener datos del usuario
          try {
            const userData = authService.getStoredUser();
            if (userData) {
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              // Si no tenemos datos almacenados, obtenerlos del servidor
              const profileData = await authService.getProfile();
              setUser(profileData.user);
              setIsAuthenticated(true);
            }
            
            // Intentar obtener estado de autorización (opcional)
            try {
              const statusData = await authService.getAuthStatus();
              setAuthStatus(statusData);
            } catch (statusError) {
              console.warn('No se pudo obtener el estado de autorización:', statusError);
            }
          } catch (profileError) {
            // Si falla obtener el perfil, limpiar tokens
            authService.logout();
            setUser(null);
            setIsAuthenticated(false);
            setAuthStatus(null);
          }
        }
      } catch (error) {
        // Si hay error de conexión, limpiar tokens
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setAuthStatus(null);
        
        // Mostrar error de conexión si es necesario
        if (error.message.includes('Network Error') || error.code === 'ECONNREFUSED') {
          showError('No se puede conectar con el servidor. Verifica que la API esté funcionando.');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [showError]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const data = await authService.login(email, password);
      
      // Si el login fue exitoso (tenemos token), obtener datos del usuario
      const profileData = await authService.getProfile();
      setUser(profileData.user);
      setIsAuthenticated(true);
      
      // Obtener estado de autorización después del login (opcional)
      try {
        const statusData = await authService.getAuthStatus();
        setAuthStatus(statusData);
      } catch (statusError) {
        // Si falla el status, no importa, ya tenemos el perfil
        console.warn('No se pudo obtener el estado de autorización:', statusError);
      }
      
      showSuccess('¡Bienvenido! Has iniciado sesión correctamente.');
      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || error.message || 'Error al iniciar sesión';
      showError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      showSuccess('Registro exitoso. Tu cuenta está pendiente de autorización.');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error en registro:', error);
      const errorMessage = error.response?.data?.error || 'Error de conexión';
      showError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthStatus(null);
    showSuccess('Has cerrado sesión correctamente.');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const refreshProfile = async () => {
    try {
      if (isAuthenticated) {
        // Obtener datos del perfil
        const profileData = await authService.getProfile();
        setUser(profileData.user);
        
        // Intentar verificar estado (opcional)
        try {
          const statusData = await authService.getAuthStatus();
          setAuthStatus(statusData);
        } catch (statusError) {
          console.warn('No se pudo obtener el estado de autorización:', statusError);
        }
        
        return profileData.user;
      }
    } catch (error) {
      console.error('Error al refrescar perfil:', error);
      // Solo cerrar sesión si hay error de autenticación (401)
      if (error.response?.status === 401) {
        logout();
      }
      throw error;
    }
  };

  // Función para verificar estado de autorización
  const checkAuthStatus = async () => {
    try {
      if (isAuthenticated) {
        const statusData = await authService.getAuthStatus();
        setAuthStatus(statusData);
        return statusData;
      }
      return null;
    } catch (error) {
      console.error('Error al verificar estado:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    authStatus,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    checkAuthStatus,
    isAdmin: user?.role === 'admin',
    // Estados de autorización basados en el nuevo sistema
    isPending: user && (user.authorization_status === 'pending' || (!user.authorization_status && !user.is_authorized)),
    isAuthorized: user && (user.authorization_status === 'authorized' || user.is_authorized),
    isUnauthorized: user && user.authorization_status === 'unauthorized',
    canAccessQR: user && (user.authorization_status === 'authorized' || user.is_authorized)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};