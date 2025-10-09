import React, { useState, useEffect } from 'react';
import { adminService } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import '../components/components.css';

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
    <div className="main-content">
      <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Panel de Administración</h1>
          <p className="text-muted">Gestión de usuarios y estadísticas del sistema</p>
        </div>
      </div>

      <div className="dashboard-nav">
        <button
          className={`nav-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Usuarios Pendientes
        </button>
        <button
          className={`nav-tab ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Estadísticas
        </button>
      </div>

      {activeTab === 'pending' && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Usuarios Pendientes de Autorización</h2>
            <div>
              <select
                value={selectedRole}
                onChange={handleRoleFilterChange}
                className="form-control"
                style={{ width: 'auto', display: 'inline-block' }}
              >
                <option value="">Todos los roles</option>
                {Object.entries(ROLES_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span className="loading-text">Cargando usuarios...</span>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="empty-state">
              <h3>No hay usuarios pendientes</h3>
              <p>Todos los usuarios han sido procesados o no hay registros nuevos.</p>
            </div>
          ) : (
            <>
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Rol</th>
                      <th>Edad</th>
                      <th>Teléfono</th>
                      <th>Registro</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {getUserInitials(user.nombre_completo, user.apellidos)}
                            </div>
                            <div className="user-details">
                              <h4>{user.nombre_completo} {user.apellidos}</h4>
                              <p>{user.email}</p>
                              <p>{user.direccion}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {ROLES_LABELS[user.role]}
                          </span>
                        </td>
                        <td>{user.edad} años</td>
                        <td>{user.telefono}</td>
                        <td>{formatDate(user.created_at)}</td>
                        <td>
                          <div className="actions-buttons">
                            <button
                              className="btn btn-info btn-sm"
                              onClick={() => handleViewIdentification(user)}
                            >
                              Ver ID
                            </button>
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => handleAuthorizeUser(user.id)}
                            >
                              Autorizar
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRejectUser(user.id)}
                            >
                              Rechazar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={currentPage === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div>
          <h2>Estadísticas del Sistema</h2>
          
          {stats ? (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.users_total}</div>
                  <div className="stat-label">Total de Usuarios</div>
                </div>
                <div className="stat-card authorized">
                  <div className="stat-number">{stats.users_authorized}</div>
                  <div className="stat-label">Usuarios Autorizados</div>
                </div>
                <div className="stat-card pending">
                  <div className="stat-number">{stats.users_pending}</div>
                  <div className="stat-label">Usuarios Pendientes</div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Usuarios por Rol</h3>
                </div>
                <div className="card-body">
                  <div className="stats-grid">
                    {Object.entries(stats.users_by_role).map(([role, count]) => (
                      <div key={role} className="stat-card">
                        <div className="stat-number">{count}</div>
                        <div className="stat-label">
                          <span className={`role-badge ${role}`}>
                            {ROLES_LABELS[role] || role}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="loading-container">
              <div className="spinner"></div>
              <span className="loading-text">Cargando estadísticas...</span>
            </div>
          )}
        </div>
      )}

      {/* Modal para ver identificación */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ×
            </button>
            
            <h3>Identificación de {selectedUser?.nombre_completo} {selectedUser?.apellidos}</h3>
            
            {identificationImage ? (
              <div className="text-center mt-3">
                <img
                  src={identificationImage}
                  alt="Identificación del usuario"
                  className="identification-image"
                />
              </div>
            ) : (
              <div className="loading-container">
                <div className="spinner"></div>
                <span className="loading-text">Cargando identificación...</span>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
};