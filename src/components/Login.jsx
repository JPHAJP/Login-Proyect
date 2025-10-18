import React, { useState } from "react";
import { useAuth } from '../contexts/AuthContext';
import './components.css';

export const Login = ({ onSwitchToRegister }) => {
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (error) {
      setError("");
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    const result = await login(formData.email, formData.password);
    
    // No mostrar error aquí porque ya se muestra en el contexto
    if (!result.success && !result.error.includes('no autorizado')) {
      setError(result.error);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-6 border-b border-gray-200">
          <h2 className="text-center mb-2 text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
          <p className="text-center text-gray-600 mb-0 text-sm">Ingresa tus credenciales para acceder</p>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="mb-0">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-casa-cyan to-casa-purple text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-lg"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-200">
          <p className="mb-0 text-gray-600">
            ¿No tienes cuenta?{' '}
            <button 
              type="button" 
              className="text-casa-purple font-semibold hover:text-purple-700 underline transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onSwitchToRegister}
              disabled={loading}
            >
              Registrarse
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
