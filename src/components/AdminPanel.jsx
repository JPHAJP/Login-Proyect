import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ROLES_LABELS = {
  voluntarios: 'Voluntarios',
  personal: 'Personal',
  servicio_social: 'Servicio Social',
  visitas: 'Visitas',
  familiares: 'Familiares',
  donantes: 'Donantes',
  proveedores: 'Proveedores'
};

export const AdminPanel = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedRole, setSelectedRole] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [identificationImage, setIdentificationImage] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Cargar usuarios pendientes
  const loadPendingUsers = async (page = 1, role = '') => {
    try {
      setLoading(true);
      const response = await adminService.getPendingUsers(page, 20, role);
      setPendingUsers(response.users);
      setTotalPages(response.total_pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error cargando usuarios pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Cargar identificación del usuario
  const loadUserIdentification = async (userId) => {
    try {
      const imageBlob = await adminService.getUserIdentification(userId);
      const imageUrl = URL.createObjectURL(imageBlob);
      setIdentificationImage(imageUrl);
    } catch (error) {
      console.error('Error cargando identificación:', error);
      showError('Error al cargar la identificación del usuario');
    }
  };

  // Autorizar usuario
  const handleAuthorizeUser = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres autorizar a este usuario?')) {
      return;
    }

    try {
      await adminService.authorizeUser(userId);
      showSuccess('Usuario autorizado exitosamente');
      loadPendingUsers(currentPage, selectedRole);
      loadStats();
    } catch (error) {
      console.error('Error autorizando usuario:', error);
      showError('Error al autorizar usuario: ' + (error.response?.data?.error || 'Error de conexión'));
    }
  };

  // Rechazar usuario
  const handleRejectUser = async (userId) => {
    const reason = prompt('Razón del rechazo (opcional):');
    if (reason === null) return; // Usuario canceló

    if (!confirm('¿Estás seguro de que quieres rechazar a este usuario? Esta acción eliminará su registro.')) {
      return;
    }

    try {
      await adminService.rejectUser(userId, reason);
      showSuccess('Usuario rechazado exitosamente');
      loadPendingUsers(currentPage, selectedRole);
      loadStats();
    } catch (error) {
      console.error('Error rechazando usuario:', error);
      showError('Error al rechazar usuario: ' + (error.response?.data?.error || 'Error de conexión'));
    }
  };

  // Ver identificación
  const handleViewIdentification = async (user) => {
    setSelectedUser(user);
    setIdentificationImage(null);
    setShowModal(true);
    await loadUserIdentification(user.id);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    if (identificationImage) {
      URL.revokeObjectURL(identificationImage);
      setIdentificationImage(null);
    }
  };

  // Efectos
  useEffect(() => {
    if (activeTab === 'pending') {
      loadPendingUsers(1, selectedRole);
    } else if (activeTab === 'stats') {
      loadStats();
    }
  }, [activeTab, selectedRole]);

  // Cambiar página
  const handlePageChange = (page) => {
    loadPendingUsers(page, selectedRole);
  };

  // Cambiar filtro de rol
  const handleRoleFilterChange = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  // Obtener iniciales del usuario
  const getUserInitials = (nombre, apellidos) => {
    const initials = `${nombre.charAt(0)}${apellidos.charAt(0)}`;
    return initials.toUpperCase();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-casa-cyan via-white to-casa-purple p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-casa-cyan to-casa-purple p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-4xl">
                🛠️
              </div>
            </div>
            <h1 className="text-4xl font-bold text-center mb-2">Panel de Administración</h1>
            <p className="text-center text-white text-opacity-90 text-lg">
              Gestión de usuarios y estadísticas del sistema
            </p>
          </div>

          {/* Instrucciones colapsables */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💡</span>
                <span className="font-semibold text-gray-800">¿Cómo usar el panel de administración?</span>
              </div>
              <div className={`transform transition-transform duration-200 ${showInstructions ? 'rotate-180' : ''}`}>
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
            
            <div className={`transition-all duration-300 overflow-hidden ${showInstructions ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="mt-4 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">👥</span>
                      Usuarios Pendientes
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-casa-cyan mt-1">•</span>
                        <span>Revisa la información y documentos de identidad</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-casa-cyan mt-1">•</span>
                        <span>Autoriza o rechaza usuarios según criterios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-casa-cyan mt-1">•</span>
                        <span>Filtra por rol para gestión más eficiente</span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      Estadísticas
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <span className="text-casa-purple mt-1">•</span>
                        <span>Monitorea usuarios totales y autorizados</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-casa-purple mt-1">•</span>
                        <span>Visualiza distribución por roles</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-casa-purple mt-1">•</span>
                        <span>Controla el crecimiento de usuarios</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-6 py-4 font-semibold border-b-2 transition-colors duration-200 ${
                  activeTab === 'pending'
                    ? 'border-casa-cyan text-casa-cyan bg-cyan-50'
                    : 'border-transparent text-gray-600 hover:text-casa-cyan hover:border-casa-cyan'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                👥 Usuarios Pendientes
              </button>
              <button
                className={`px-6 py-4 font-semibold border-b-2 transition-colors duration-200 ${
                  activeTab === 'stats'
                    ? 'border-casa-purple text-casa-purple bg-purple-50'
                    : 'border-transparent text-gray-600 hover:text-casa-purple hover:border-casa-purple'
                }`}
                onClick={() => setActiveTab('stats')}
              >
                📊 Estadísticas
              </button>
            </div>
          </div>
        </div>

        {/* Usuarios Pendientes Tab */}
        {activeTab === 'pending' && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Usuarios Pendientes de Autorización</h2>
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filtrar por rol:</label>
                <select
                  value={selectedRole}
                  onChange={handleRoleFilterChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-casa-cyan focus:border-casa-cyan bg-white text-gray-700"
                >
                  <option value="">Todos los roles</option>
                  {Object.entries(ROLES_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-casa-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-gray-600 font-medium">Cargando usuarios...</span>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👤</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No hay usuarios pendientes</h3>
                <p className="text-gray-500">Todos los usuarios han sido procesados o no hay registros nuevos.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Usuario</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Rol</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Edad</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Teléfono</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Registro</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingUsers.map(user => (
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
                              user.role === 'voluntarios' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'personal' ? 'bg-green-100 text-green-800' :
                              user.role === 'servicio_social' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'visitas' ? 'bg-yellow-100 text-yellow-800' :
                              user.role === 'familiares' ? 'bg-pink-100 text-pink-800' :
                              user.role === 'donantes' ? 'bg-orange-100 text-orange-800' :
                              user.role === 'proveedores' ? 'bg-gray-100 text-gray-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {ROLES_LABELS[user.role]}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-700">{user.edad} años</td>
                          <td className="py-4 px-4 text-gray-700">{user.telefono}</td>
                          <td className="py-4 px-4 text-gray-700">{formatDate(user.created_at)}</td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                onClick={() => handleViewIdentification(user)}
                              >
                                👁️ Ver ID
                              </button>
                              <button
                                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                onClick={() => handleAuthorizeUser(user.id)}
                              >
                                ✅ Autorizar
                              </button>
                              <button
                                className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                onClick={() => handleRejectUser(user.id)}
                              >
                                ❌ Rechazar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Anterior
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPage === i + 1
                            ? 'bg-casa-cyan text-white shadow-lg'
                            : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
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
        )}

        {/* Estadísticas Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📊 Estadísticas del Sistema</h2>
              
              {stats ? (
                <>
                  {/* Estadísticas principales */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold mb-2">{stats.users_total}</div>
                      <div className="text-blue-100">Total de Usuarios</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold mb-2">{stats.users_authorized}</div>
                      <div className="text-green-100">Usuarios Autorizados</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl p-6 text-center">
                      <div className="text-4xl font-bold mb-2">{stats.users_pending}</div>
                      <div className="text-orange-100">Usuarios Pendientes</div>
                    </div>
                  </div>

                  {/* Usuarios por rol */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">👥 Usuarios por Rol</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(stats.users_by_role).map(([role, count]) => (
                        <div key={role} className="bg-white rounded-xl p-4 text-center shadow-md border border-gray-200">
                          <div className="text-2xl font-bold text-gray-800 mb-2">{count}</div>
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            role === 'voluntarios' ? 'bg-blue-100 text-blue-800' :
                            role === 'personal' ? 'bg-green-100 text-green-800' :
                            role === 'servicio_social' ? 'bg-purple-100 text-purple-800' :
                            role === 'visitas' ? 'bg-yellow-100 text-yellow-800' :
                            role === 'familiares' ? 'bg-pink-100 text-pink-800' :
                            role === 'donantes' ? 'bg-orange-100 text-orange-800' :
                            role === 'proveedores' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ROLES_LABELS[role] || role}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 border-4 border-casa-purple border-t-transparent rounded-full animate-spin mb-4"></div>
                  <span className="text-gray-600 font-medium">Cargando estadísticas...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal para ver identificación */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={handleCloseModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800">
                    📄 Identificación de {selectedUser?.nombre_completo} {selectedUser?.apellidos}
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
                {identificationImage ? (
                  <div className="text-center">
                    <img
                      src={identificationImage}
                      alt="Identificación del usuario"
                      className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 border-4 border-casa-cyan border-t-transparent rounded-full animate-spin mb-4"></div>
                    <span className="text-gray-600 font-medium">Cargando identificación...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};