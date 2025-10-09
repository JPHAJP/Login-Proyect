import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
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
  const { showSuccess, showError } = useToast();

  // Verificar autenticación al inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getStoredUser();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Si tenemos token pero no datos de usuario, obtenerlos
            const profileData = await authService.getProfile();
            setUser(profileData.user);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        // Si hay error, limpiar tokens
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      // Obtener perfil del usuario después del login
      const profileData = await authService.getProfile();
      setUser(profileData.user);
      setIsAuthenticated(true);
      
      showSuccess(`¡Bienvenido, ${profileData.user.nombre_completo}!`);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Error en login:', error);
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
    showSuccess('Sesión cerrada exitosamente');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    isAdmin: user?.role === 'admin',
    isPending: user && !user.is_authorized
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};