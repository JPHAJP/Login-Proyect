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
    
    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="card">
        <div className="card-header">
          <h2 className="text-center mb-0">Iniciar Sesión</h2>
          <p className="text-center text-muted mb-0">Ingresa tus credenciales para acceder</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-control"
                value={formData.password}
                onChange={handleChange}
                placeholder="Tu contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading || !formData.email || !formData.password}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          <p className="mb-0">
            ¿No tienes cuenta?{' '}
            <button 
              type="button" 
              className="btn-link" 
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
