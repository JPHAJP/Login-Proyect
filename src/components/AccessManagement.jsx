import React, { useState, useEffect } from 'react';
import { accessService } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const AccessManagement = () => {
  const [accessData, setAccessData] = useState(null);
  const [usersInside, setUsersInside] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs', 'inside'
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (activeTab === 'logs') {
      loadAccessLogs();
    } else if (activeTab === 'inside') {
      loadUsersInside();
    }
  }, [activeTab, selectedDate, currentPage]);

  const loadAccessLogs = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando logs de acceso:', { selectedDate, currentPage });
      const response = await accessService.getAccessLogs(selectedDate, currentPage, 20);
      console.log('✅ Logs cargados:', response);
      setAccessData(response);
    } catch (error) {
      console.error('❌ Error cargando logs:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Error al cargar los logs de acceso';
      if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor al cargar logs';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadUsersInside = async () => {
    setLoading(true);
    try {
      console.log('🔍 Cargando usuarios dentro...');
      const response = await accessService.getUsersInside();
      console.log('✅ Usuarios dentro cargados:', response);
      setUsersInside(response);
    } catch (error) {
      console.error('❌ Error cargando usuarios dentro:', error);
      console.error('Response data:', error.response?.data);
      console.error('Status:', error.response?.status);
      
      let errorMessage = 'Error al cargar usuarios dentro';
      if (error.response?.status === 500) {
        errorMessage = 'Error interno del servidor al cargar usuarios';
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Error de conexión con el servidor';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleManualExit = async (userId, userName) => {
    const notes = `Salida registrada manualmente por admin - ${new Date().toLocaleString()}`;
    
    if (!confirm(`¿Estás seguro de registrar la salida de ${userName}?`)) {
      return;
    }

    try {
      await accessService.manualExit(userId, notes);
      showSuccess(`Salida registrada para ${userName}`);
      loadUsersInside(); // Recargar lista
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al registrar salida';
      showError(errorMsg);
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (type) => {
    return type === 'entry' ? (
      <span className="status-badge entry">📥 Entrada</span>
    ) : (
      <span className="status-badge exit">📤 Salida</span>
    );
  };

  const getManualBadge = (isManual) => {
    return isManual ? (
      <span className="manual-badge">👤 Manual</span>
    ) : null;
  };

  return (
    <div className="access-management-container">
      <div className="access-management-header">
        <h2>🚪 Gestión de Acceso Físico</h2>
        
        {/* Selector de fecha */}
        <div className="date-selector">
          <label htmlFor="date">Fecha:</label>
          <input
            type="date"
            id="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {accessData && activeTab === 'logs' && (
        <div className="quick-stats">
          <div className="stat-item">
            <span className="stat-icon">📥</span>
            <div className="stat-info">
              <span className="stat-number">{accessData.total_entries || 0}</span>
              <span className="stat-label">Entradas</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">📤</span>
            <div className="stat-info">
              <span className="stat-number">{accessData.total_exits || 0}</span>
              <span className="stat-label">Salidas</span>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">👥</span>
            <div className="stat-info">
              <span className="stat-number">{accessData.currently_inside || 0}</span>
              <span className="stat-label">Dentro</span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="access-tabs">
        <button 
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📋 Logs de Acceso
        </button>
        <button 
          className={`tab ${activeTab === 'inside' ? 'active' : ''}`}
          onClick={() => setActiveTab('inside')}
        >
          � Usuarios Dentro ({usersInside.length})
        </button>
      </div>

      {/* Contenido */}
      <div className="access-content">
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando datos...</p>
          </div>
        )}

        {/* Tab: Logs de Acceso */}
        {activeTab === 'logs' && !loading && accessData && (
          <div className="logs-container">
            <div className="logs-header">
              <h3>
                Registros del {new Date(selectedDate).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
              <p className="logs-count">{accessData.logs?.length || 0} registros</p>
            </div>

            {!accessData.logs || accessData.logs.length === 0 ? (
              <div className="no-data">
                <p>📝 No hay registros para esta fecha</p>
              </div>
            ) : (
              <div className="logs-table">
                <div className="table-header">
                  <span>Usuario</span>
                  <span>Tipo</span>
                  <span>Fecha y Hora</span>
                  <span>Estado</span>
                </div>
                {accessData.logs.map((log, index) => (
                  <div key={index} className="table-row">
                    <div className="user-info">
                      <span className="user-name">{log.user_name}</span>
                      <span className="user-email">{log.user_email}</span>
                    </div>
                    <div className="log-type">
                      {getStatusBadge(log.access_type)}
                      {getManualBadge(log.is_manual)}
                    </div>
                    <div className="log-time">
                      {formatDateTime(log.timestamp)}
                    </div>
                    <div className="log-status">
                      <span className="status success">✅ Registrado</span>
                      {log.notes && (
                        <div className="log-notes" title={log.notes}>
                          📝 Con notas
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Usuarios dentro */}
        {activeTab === 'inside' && !loading && (
          <div className="inside-container">
            <div className="inside-header">
              <h3>👥 Usuarios actualmente dentro</h3>
              <p className="inside-description">
                Usuarios que han registrado entrada pero aún no han registrado salida
              </p>
            </div>

            {usersInside.length === 0 ? (
              <div className="no-data success">
                <p>✅ No hay usuarios dentro en este momento</p>
              </div>
            ) : (
              <div className="inside-list">
                {usersInside.map((user, index) => (
                  <div key={index} className="inside-card">
                    <div className="user-details">
                      <h4>{user.nombre_completo} {user.apellidos}</h4>
                      <p className="user-email">{user.email}</p>
                      <p className="user-role">Rol: {user.role}</p>
                      <p className="entry-time">
                        � Entrada: {formatDateTime(user.entry_time)}
                      </p>
                      <p className="entry-id">
                        ID de entrada: {user.entry_id}
                      </p>
                    </div>
                    <div className="actions">
                      <button 
                        className="manual-exit-btn"
                        onClick={() => handleManualExit(user.id, `${user.nombre_completo} ${user.apellidos}`)}
                      >
                        📤 Registrar Salida Manual
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessManagement;