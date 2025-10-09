import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
  { value: 'voluntarios', label: 'Voluntarios' },
  { value: 'personal', label: 'Personal' },
  { value: 'servicio_social', label: 'Servicio Social' },
  { value: 'visitas', label: 'Visitas' },
  { value: 'familiares', label: 'Familiares' },
  { value: 'donantes', label: 'Donantes' },
  { value: 'proveedores', label: 'Proveedores' }
];

export const Register = ({ onSwitchToLogin }) => {
  const { register, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre_completo: '',
    apellidos: '',
    direccion: '',
    edad: '',
    telefono: '',
    role: '',
    foto_identificacion: null
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    if (name === 'foto_identificacion') {
      const file = files[0];
      if (file) {
        // Validar tipo de archivo
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
          setErrors(prev => ({ 
            ...prev, 
            foto_identificacion: 'Solo se permiten imágenes PNG, JPG o JPEG' 
          }));
          return;
        }
        
        // Validar tamaño (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          setErrors(prev => ({ 
            ...prev, 
            foto_identificacion: 'La imagen debe ser menor a 5MB' 
          }));
          return;
        }

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviewImage(e.target.result);
        };
        reader.readAsDataURL(file);

        setFormData(prev => ({ ...prev, [name]: file }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!formData.nombre_completo) {
      newErrors.nombre_completo = 'El nombre es requerido';
    }

    if (!formData.apellidos) {
      newErrors.apellidos = 'Los apellidos son requeridos';
    }

    if (!formData.direccion) {
      newErrors.direccion = 'La dirección es requerida';
    }

    if (!formData.edad) {
      newErrors.edad = 'La edad es requerida';
    } else if (parseInt(formData.edad) < 18) {
      newErrors.edad = 'Debe ser mayor de edad (18 años o más)';
    }

    if (!formData.telefono) {
      newErrors.telefono = 'El teléfono es requerido';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El formato del teléfono no es válido';
    }

    if (!formData.role) {
      newErrors.role = 'Debe seleccionar un rol';
    }

    if (!formData.foto_identificacion) {
      newErrors.foto_identificacion = 'La fotografía de identificación es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Preparar datos para envío
    const submitData = { ...formData };
    delete submitData.confirmPassword; // No enviar confirmPassword
    submitData.edad = parseInt(formData.edad); // Convertir edad a número

    const result = await register(submitData);

    if (result.success) {
      setSuccess('Registro exitoso. Tu cuenta está pendiente de autorización por un administrador.');
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        nombre_completo: '',
        apellidos: '',
        direccion: '',
        edad: '',
        telefono: '',
        role: '',
        foto_identificacion: null
      });
      setPreviewImage(null);
      
      // Cambiar al login después de 3 segundos
      setTimeout(() => {
        onSwitchToLogin();
      }, 3000);
    } else {
      setErrors({ general: result.error });
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-success">
              <h3>¡Registro Exitoso!</h3>
              <p>{success}</p>
              <p>Serás redirigido al login en unos segundos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-container">
      <div className="card">
        <div className="card-header">
          <h2 className="text-center mb-0">Registro de Usuario</h2>
          <p className="text-center text-muted mb-0">Completa todos los campos para crear tu cuenta</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="alert alert-danger">
                {errors.general}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-control ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Contraseña *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control ${errors.confirmPassword ? 'error' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  disabled={loading}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre_completo" className="form-label">
                  Nombre(s) *
                </label>
                <input
                  type="text"
                  id="nombre_completo"
                  name="nombre_completo"
                  className={`form-control ${errors.nombre_completo ? 'error' : ''}`}
                  value={formData.nombre_completo}
                  onChange={handleChange}
                  placeholder="Juan Carlos"
                  disabled={loading}
                />
                {errors.nombre_completo && <div className="error-message">{errors.nombre_completo}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="apellidos" className="form-label">
                  Apellidos *
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  className={`form-control ${errors.apellidos ? 'error' : ''}`}
                  value={formData.apellidos}
                  onChange={handleChange}
                  placeholder="Pérez García"
                  disabled={loading}
                />
                {errors.apellidos && <div className="error-message">{errors.apellidos}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="direccion" className="form-label">
                Dirección Completa *
              </label>
              <textarea
                id="direccion"
                name="direccion"
                className={`form-control ${errors.direccion ? 'error' : ''}`}
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Calle Principal #123, Col. Centro, Ciudad, CP 12345"
                rows="3"
                disabled={loading}
              />
              {errors.direccion && <div className="error-message">{errors.direccion}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="edad" className="form-label">
                  Edad *
                </label>
                <input
                  type="number"
                  id="edad"
                  name="edad"
                  className={`form-control ${errors.edad ? 'error' : ''}`}
                  value={formData.edad}
                  onChange={handleChange}
                  placeholder="18"
                  min="18"
                  max="120"
                  disabled={loading}
                />
                {errors.edad && <div className="error-message">{errors.edad}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="telefono" className="form-label">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  className={`form-control ${errors.telefono ? 'error' : ''}`}
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="+525512345678"
                  disabled={loading}
                />
                {errors.telefono && <div className="error-message">{errors.telefono}</div>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Rol Solicitado *
              </label>
              <select
                id="role"
                name="role"
                className={`form-control ${errors.role ? 'error' : ''}`}
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Selecciona un rol</option>
                {ROLES.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && <div className="error-message">{errors.role}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="foto_identificacion" className="form-label">
                Fotografía de Identificación *
              </label>
              <input
                type="file"
                id="foto_identificacion"
                name="foto_identificacion"
                className={`form-control ${errors.foto_identificacion ? 'error' : ''}`}
                onChange={handleChange}
                accept="image/png,image/jpeg,image/jpg"
                disabled={loading}
              />
              <small className="form-text text-muted">
                Sube una foto clara de tu identificación oficial (PNG, JPG, JPEG - máx 5MB)
              </small>
              {errors.foto_identificacion && <div className="error-message">{errors.foto_identificacion}</div>}
              
              {previewImage && (
                <div className="image-preview mt-3">
                  <img 
                    src={previewImage} 
                    alt="Preview de identificación" 
                    style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Registrando...
                  </>
                ) : (
                  'Registrar Usuario'
                )}
              </button>
            </div>
          </form>
        </div>
        <div className="card-footer text-center">
          <p className="mb-0">
            ¿Ya tienes cuenta?{' '}
            <button 
              type="button" 
              className="btn-link" 
              onClick={onSwitchToLogin}
              disabled={loading}
            >
              Iniciar Sesión
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};