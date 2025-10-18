import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ROLES_LABELS = {
  admin: 'Administrador',
  voluntarios: 'Voluntarios',
  personal: 'Personal',
  servicio_social: 'Servicio Social',
  visitas: 'Visitas',
  familiares: 'Familiares',
  donantes: 'Donantes',
  proveedores: 'Proveedores'
};

const AUTHORIZATION_STATUS_LABELS = {
  pending: 'Pendiente',
  authorized: 'Autorizado',
  unauthorized: 'Desautorizado'
};

const AUTHORIZATION_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  authorized: 'bg-green-100 text-green-800',
  unauthorized: 'bg-red-100 text-red-800'
};

const VALID_CATEGORIES = Object.keys(ROLES_LABELS);

const UserSearch = () => {
  const { showSuccess, showError, showInfo } = useToast();
  
  // Estados principales
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    page: 1,
    per_page: 20,
    include_pending: true
  });
  
  // Estados UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [identificationImage, setIdentificationImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  
  // Estados para modal de desautorización
  const [showUnauthorizeModal, setShowUnauthorizeModal] = useState(false);
  const [unauthorizeReason, setUnauthorizeReason] = useState('');
  const [unauthorizeLoading, setUnauthorizeLoading] = useState(false);
  const [userToUnauthorize, setUserToUnauthorize] = useState(null);

  // Cargar usuarios al montar y cuando cambien los filtros
  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.searchUsers(filters);
      
      setUsers(response.users);
      setTotal(response.total);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
      
      console.log(`✅ Cargados ${response.users.length} usuarios de ${response.total} total`);
    } catch (error) {
      console.error('❌ Error cargando usuarios:', error);
      showError('Error al cargar usuarios: ' + (error.response?.data?.detail || 'Error de conexión'));
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset página si cambia otro filtro
    }));
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      page: 1,
      per_page: 20,
      include_pending: true
    });
  };

  // Ver detalles de usuario
  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowModal(true);
    setIdentificationImage(null);
    
    // Cargar imagen de identificación si existe
    if (user.foto_identificacion_path) {
      await loadUserIdentification(user.id);
    }
  };

  // Cargar imagen de identificación con autenticación correcta
  const loadUserIdentification = async (userId) => {
    try {
      setLoadingImage(true);
      const imageBlob = await adminService.getUserIdentificationFile(userId);
      const imageUrl = URL.createObjectURL(imageBlob);
      setIdentificationImage(imageUrl);
    } catch (error) {
      console.error('❌ Error cargando identificación:', error);
      showError('Error al cargar la identificación del usuario');
    } finally {
      setLoadingImage(false);
    }
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    
    // Limpiar imagen para liberar memoria
    if (identificationImage) {
      URL.revokeObjectURL(identificationImage);
      setIdentificationImage(null);
    }
  };

  // Autorizar usuario
  const handleAuthorizeUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres autorizar a ${userName}?`)) {
      return;
    }

    try {
      await adminService.authorizeUser(userId);
      showSuccess(`Usuario ${userName} autorizado exitosamente`);
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('❌ Error autorizando usuario:', error);
      
      // Manejo mejorado de errores
      const errorMessage = error.response?.data?.detail || 'Error de conexión';
      
      if (error.response?.status === 400) {
        if (errorMessage.includes('ya autorizado')) {
          showError('El usuario ya está autorizado.');
        } else {
          showError(`Error de validación: ${errorMessage}`);
        }
      } else if (error.response?.status === 404) {
        showError('Usuario no encontrado.');
      } else {
        showError(`Error al autorizar usuario: ${errorMessage}`);
      }
    }
  };

  // Rechazar usuario con validación previa
  const handleRejectUser = async (userId, userName, authorizationStatus, userRole) => {
    // Validación previa - simular verificación de eliminación segura
    const canDelete = canDeleteUser(authorizationStatus, userRole);
    
    if (!canDelete.canDelete) {
      showError(`No se puede eliminar a ${userName}: ${canDelete.reasons.join(', ')}`);
      showInfo(`Recomendación: ${canDelete.recommendation}`);
      return;
    }

    const reason = prompt('Razón del rechazo (opcional):');
    if (reason === null) return; // Usuario canceló

    if (!confirm(`¿Estás seguro de que quieres rechazar a ${userName}? Esta acción eliminará su registro.`)) {
      return;
    }

    try {
      await adminService.rejectUser(userId, reason);
      showSuccess(`Usuario ${userName} rechazado exitosamente`);
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('❌ Error rechazando usuario:', error);
      
      // Manejo mejorado de errores según la documentación
      const errorMessage = error.response?.data?.detail || 'Error de conexión';
      
      if (error.response?.status === 400) {
        if (errorMessage.includes('autorizado')) {
          showError('No se puede eliminar un usuario ya autorizado. Use la opción "Desautorizar" para quitarle los permisos.');
        } else if (errorMessage.includes('registros de acceso')) {
          showError('No se puede eliminar un usuario que tiene registros de acceso. Use la opción "Desautorizar" para suspender su acceso.');
        } else if (errorMessage.includes('administrador')) {
          showError('No se puede eliminar un usuario administrador.');
        } else {
          showError(`Error de validación: ${errorMessage}`);
        }
      } else if (error.response?.status === 500) {
        showError('Error interno del servidor. Es posible que el usuario tenga datos relacionados que impiden su eliminación.');
      } else {
        showError(`Error al rechazar usuario: ${errorMessage}`);
      }
    }
  };

  // Función auxiliar para verificar si un usuario puede ser eliminado
  const canDeleteUser = (authorizationStatus, role) => {
    const reasons = [];
    
    if (authorizationStatus === 'authorized') {
      reasons.push('Usuario está autorizado');
    }
    
    if (authorizationStatus === 'unauthorized') {
      reasons.push('Usuario desautorizado (use re-autorizar)');
    }
    
    if (role === 'admin') {
      reasons.push('Es un administrador del sistema');
    }
    
    // Solo usuarios pendientes sin historial se pueden eliminar
    const canDelete = authorizationStatus === 'pending' && role !== 'admin';
    const recommendation = canDelete ? 
      'Proceder con eliminación' : 
      (authorizationStatus === 'authorized' ? 'Use "Desautorizar" en lugar de eliminar' : 
       authorizationStatus === 'unauthorized' ? 'Use "Re-autorizar" para restaurar acceso' :
       'No se puede eliminar este usuario');
    
    return {
      canDelete,
      reasons,
      recommendation
    };
  };

  // Iniciar proceso de desautorización
  const handleStartUnauthorize = (user) => {
    setUserToUnauthorize(user);
    setUnauthorizeReason('');
    setShowUnauthorizeModal(true);
  };

  // Ejecutar desautorización
  const handleUnauthorizeUser = async () => {
    if (!userToUnauthorize || unauthorizeReason.length < 10) {
      showError('La razón debe tener al menos 10 caracteres');
      return;
    }

    setUnauthorizeLoading(true);
    try {
      await adminService.unauthorizeUser(userToUnauthorize.id, unauthorizeReason);
      showSuccess(`Usuario ${userToUnauthorize.nombre_completo} desautorizado exitosamente`);
      setShowUnauthorizeModal(false);
      setUserToUnauthorize(null);
      setUnauthorizeReason('');
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('❌ Error desautorizando usuario:', error);
      showError('Error al desautorizar usuario: ' + (error.response?.data?.detail || 'Error de conexión'));
    } finally {
      setUnauthorizeLoading(false);
    }
  };

  // Cancelar desautorización
  const handleCancelUnauthorize = () => {
    setShowUnauthorizeModal(false);
    setUserToUnauthorize(null);
    setUnauthorizeReason('');
  };

  // Re-autorizar usuario
  const handleReauthorizeUser = async (userId, userName) => {
    if (!confirm(`¿Estás seguro de que quieres re-autorizar a ${userName}?`)) {
      return;
    }

    try {
      await adminService.reauthorizeUser(userId);
      showSuccess(`Usuario ${userName} re-autorizado exitosamente`);
      loadUsers(); // Recargar lista
    } catch (error) {
      console.error('❌ Error re-autorizando usuario:', error);
      showError('Error al re-autorizar usuario: ' + (error.response?.data?.detail || 'Error de conexión'));
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obtener iniciales
  const getUserInitials = (nombre, apellidos) => {
    const initials = `${nombre.charAt(0)}${apellidos.charAt(0)}`;
    return initials.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-casa-cyan via-white to-casa-purple p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-casa-cyan to-casa-purple p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
                🔍
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">Búsqueda de Usuarios</h1>
            <p className="text-center text-white text-opacity-90 text-lg">
              Encuentra y gestiona usuarios del sistema
            </p>
          </div>

          {/* Filtros */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔧</span>
                <span className="font-semibold text-gray-800">Filtros de búsqueda</span>
              </div>
              <div className={`transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            <div className={`transition-all duration-300 overflow-hidden ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Búsqueda por texto */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar por nombre o email:
                    </label>
                    <input
                      type="text"
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      placeholder="Escribe para buscar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan"
                    />
                  </div>

                  {/* Filtro por categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría:
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan"
                    >
                      <option value="">Todas las categorías</option>
                      {VALID_CATEGORIES.map(category => (
                        <option key={category} value={category}>
                          {ROLES_LABELS[category]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Incluir pendientes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado:
                    </label>
                    <select
                      value={filters.include_pending}
                      onChange={(e) => handleFilterChange('include_pending', e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan"
                    >
                      <option value={true}>Todos los usuarios</option>
                      <option value={false}>Solo autorizados</option>
                    </select>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-end gap-2">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información sobre gestión de usuarios */}
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
                ℹ️
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 mb-2">Sistema de 3 Estados de Autorización</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• <strong>Pendiente:</strong> Usuario registrado, sin autorizar (puede eliminarse)</div>
                  <div>• <strong>Autorizado:</strong> Acceso completo al sistema (usar desautorizar, no eliminar)</div>
                  <div>• <strong>Desautorizado:</strong> Acceso suspendido con motivo registrado (usar re-autorizar)</div>
                  <div>• <strong>Administradores:</strong> Protegidos contra eliminación y desautorización</div>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Resultados {total > 0 && `(${total} usuarios)`}
              </h2>
              <div className="flex items-center gap-4">
                <select
                  value={filters.per_page}
                  onChange={(e) => handleFilterChange('per_page', parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-casa-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-gray-600 font-medium">Buscando usuarios...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No se encontraron usuarios</h3>
                <p className="text-gray-500">Intenta ajustar los filtros de búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Usuario</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Rol</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Estado</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Registro</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gradient-to-r from-casa-cyan to-casa-purple rounded-full flex items-center justify-center text-white font-bold">
                                {getUserInitials(user.nombre_completo, user.apellidos)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{user.nombre_completo} {user.apellidos}</h4>
                                <p className="text-sm text-gray-600">{user.email}</p>
                                <p className="text-sm text-gray-500">{user.direccion}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
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
                              {ROLES_LABELS[user.role] || user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              AUTHORIZATION_STATUS_COLORS[user.authorization_status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {user.authorization_status === 'authorized' && '✅ '}
                              {user.authorization_status === 'pending' && '⏳ '}
                              {user.authorization_status === 'unauthorized' && '🚫 '}
                              {AUTHORIZATION_STATUS_LABELS[user.authorization_status] || user.authorization_status}
                            </span>
                            {user.authorization_info && (
                              <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                                {user.authorization_info}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            <div className="text-sm">
                              <div>{formatDate(user.created_at)}</div>
                              {user.authorized_at && (
                                <div className="text-green-600">
                                  Autorizado: {formatDate(user.authorized_at)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2 flex-wrap">
                              <button
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                onClick={() => handleViewUser(user)}
                              >
                                👁️ Ver
                              </button>
                              
                              {user.authorization_status === 'pending' ? (
                                <>
                                  <button
                                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                    onClick={() => handleAuthorizeUser(user.id, `${user.nombre_completo} ${user.apellidos}`)}
                                    title="Autorizar acceso al usuario"
                                  >
                                    ✅ Autorizar
                                  </button>
                                  
                                  {(() => {
                                    const canDelete = canDeleteUser(user.authorization_status, user.role);
                                    if (canDelete.canDelete) {
                                      return (
                                        <button
                                          className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                          onClick={() => handleRejectUser(user.id, `${user.nombre_completo} ${user.apellidos}`, user.authorization_status, user.role)}
                                          title="Eliminar usuario del sistema"
                                        >
                                          ❌ Eliminar
                                        </button>
                                      );
                                    } else {
                                      return (
                                        <button
                                          className="px-3 py-2 bg-gray-400 text-white text-sm font-medium rounded-lg cursor-not-allowed opacity-50"
                                          disabled
                                          title={`No se puede eliminar: ${canDelete.reasons.join(', ')}`}
                                        >
                                          ❌ Eliminar
                                        </button>
                                      );
                                    }
                                  })()}
                                </>
                              ) : user.authorization_status === 'authorized' && user.role !== 'admin' ? (
                                <button
                                  className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                  onClick={() => handleStartUnauthorize(user)}
                                  title="Quitar autorización (no elimina el usuario)"
                                >
                                  🚫 Desautorizar
                                </button>
                              ) : user.authorization_status === 'unauthorized' ? (
                                <button
                                  className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                  onClick={() => handleReauthorizeUser(user.id, user.nombre_completo)}
                                  title="Re-autorizar usuario previamente desautorizado"
                                >
                                  ♻️ Re-autorizar
                                </button>
                              ) : user.role === 'admin' ? (
                                <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                                  🛡️ Admin protegido
                                </span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handleFilterChange('page', currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>
                    
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      
                      return (
                        <button
                          key={page}
                          onClick={() => handleFilterChange('page', page)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                            currentPage === page
                              ? 'bg-casa-cyan text-white shadow-lg'
                              : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handleFilterChange('page', currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Modal de detalles */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">
                    👤 Detalles de {selectedUser.nombre_completo} {selectedUser.apellidos}
                  </h3>
                  <button 
                    onClick={handleCloseModal}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors duration-200"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Información Personal</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Email:</strong> {selectedUser.email}</div>
                      <div><strong>Edad:</strong> {selectedUser.edad} años</div>
                      <div><strong>Teléfono:</strong> {selectedUser.telefono}</div>
                      <div><strong>Dirección:</strong> {selectedUser.direccion}</div>
                      <div><strong>Rol:</strong> {ROLES_LABELS[selectedUser.role] || selectedUser.role}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Estado de la Cuenta</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Estado:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${
                          AUTHORIZATION_STATUS_COLORS[selectedUser.authorization_status] || 'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedUser.authorization_status === 'authorized' && '✅ '}
                          {selectedUser.authorization_status === 'pending' && '⏳ '}
                          {selectedUser.authorization_status === 'unauthorized' && '🚫 '}
                          {AUTHORIZATION_STATUS_LABELS[selectedUser.authorization_status] || selectedUser.authorization_status}
                        </span>
                      </div>
                      
                      {/* Información de autorización/desautorización */}
                      {selectedUser.authorization_info && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <strong className="text-blue-800">Información adicional:</strong>
                          <p className="text-blue-700 mt-1">{selectedUser.authorization_info}</p>
                        </div>
                      )}
                      
                      <div><strong>Registrado:</strong> {formatDate(selectedUser.created_at)}</div>
                      
                      {/* Información de autorización */}
                      {selectedUser.authorized_at && (
                        <div className="text-green-600">
                          <strong>Autorizado:</strong> {formatDate(selectedUser.authorized_at)}
                          {selectedUser.authorized_by_name && (
                            <div className="text-sm">Por: {selectedUser.authorized_by_name}</div>
                          )}
                        </div>
                      )}
                      
                      {/* Información de desautorización */}
                      {selectedUser.unauthorized_at && (
                        <div className="text-red-600">
                          <strong>Desautorizado:</strong> {formatDate(selectedUser.unauthorized_at)}
                          {selectedUser.unauthorized_by_name && (
                            <div className="text-sm">Por: {selectedUser.unauthorized_by_name}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Identificación */}
                {selectedUser.foto_identificacion_path && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-800 mb-3">Identificación</h4>
                    <div className="text-center">
                      {loadingImage ? (
                        <div className="flex flex-col items-center justify-center py-16">
                          <div className="w-12 h-12 border-4 border-casa-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                          <span className="text-gray-600 font-medium">Cargando identificación...</span>
                        </div>
                      ) : identificationImage ? (
                        <img
                          src={identificationImage}
                          alt="Identificación del usuario"
                          className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200"
                        />
                      ) : (
                        <div className="text-gray-500 py-8">
                          Error al cargar la imagen de identificación
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de desautorización */}
        {showUnauthorizeModal && userToUnauthorize && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                    🚫
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Desautorizar Usuario</h3>
                    <p className="text-gray-600">
                      {userToUnauthorize.nombre_completo} {userToUnauthorize.apellidos}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-gray-700 mb-4">
                    Esta acción quitará la autorización al usuario, pero mantendrá su registro para auditoría.
                    El usuario no podrá acceder al sistema hasta ser re-autorizado.
                  </p>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Razón para desautorizar (mínimo 10 caracteres) *
                  </label>
                  <textarea
                    value={unauthorizeReason}
                    onChange={(e) => setUnauthorizeReason(e.target.value)}
                    placeholder="Especifica la razón detallada para quitar la autorización..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    disabled={unauthorizeLoading}
                  />
                  <div className="text-sm text-gray-500 mt-1">
                    {unauthorizeReason.length}/500 caracteres {unauthorizeReason.length < 10 && '(mínimo 10)'}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelUnauthorize}
                    disabled={unauthorizeLoading}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUnauthorizeUser}
                    disabled={unauthorizeLoading || unauthorizeReason.length < 10}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {unauthorizeLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        🚫 Desautorizar
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;