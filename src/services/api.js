import axios from 'axios';

// 🌐 Configuración de la API
//const API_BASE_URL = 'https://api-login-uqgo.onrender.com';
const API_BASE_URL = 'http://localhost:8000';

// ✅ Configuración base de Axios con CORS
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,  // 10 segundos de timeout
  withCredentials: true,  // Importante para CORS
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

// ✅ Interceptor para agregar token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Asegurar headers CORS para todas las requests
    config.headers['Accept'] = 'application/json';
    
    // Solo agregar Content-Type si no es FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Interceptor para manejar errores de token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es un error 401 y no hemos intentado renovar el token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              headers: {
                'Authorization': `Bearer ${refreshToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              withCredentials: true,
            }
          );

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Reintentar la petición original
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla la renovación, limpiar tokens y redirigir
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Servicios de autenticación mejorados
export const authService = {
  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { access_token, refresh_token } = response.data;
      
      // Guardar tokens
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registrar usuario
  async register(userData) {
    try {
      const formData = new FormData();
      
      // Añadir todos los campos al FormData
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          formData.append(key, userData[key]);
        }
      });

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        formData,
        {
          withCredentials: true,
          timeout: 15000,
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Renovar token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Obtener perfil del usuario
  async getProfile() {
    try {
      const response = await apiClient.get('/profile');
      
      // Según OpenAPI, /profile devuelve directamente UserResponse, no { user: UserResponse }
      const userData = response.data;
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Mantener compatibilidad con el código existente que espera { user: ... }
      return { user: userData };
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Obtener usuario almacenado
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Verificar estado de autorización del usuario actual
  async getAuthStatus() {
    try {
      const response = await apiClient.get('/auth/status');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// ✅ Servicios de administración mejorados
export const adminService = {
  // Obtener usuarios pendientes
  async getPendingUsers(page = 1, perPage = 20, role = null) {
    try {
      const params = { page, per_page: perPage };
      if (role) params.role = role;
      
      const response = await apiClient.get('/admin/users/pending', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Búsqueda avanzada de usuarios
  async searchUsers(filters = {}) {
    try {
      const params = {};
      
      // Agregar filtros válidos
      if (filters.category) params.category = filters.category;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.per_page) params.per_page = filters.per_page;
      if (filters.include_pending !== undefined) params.include_pending = filters.include_pending;
      
      console.log('🔍 Buscando usuarios con filtros:', params);
      
      const response = await apiClient.get('/admin/users/search', { params });
      
      console.log('✅ Resultados de búsqueda:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en searchUsers:', error);
      throw error;
    }
  },

  // Autorizar usuario
  async authorizeUser(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/authorize`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Rechazar usuario
  async rejectUser(userId, reason = null) {
    try {
      const data = reason ? { reason } : {};
      const response = await apiClient.post(`/admin/users/${userId}/reject`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Desautorizar usuario (quitar autorización)
  async unauthorizeUser(userId, reason) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/unauthorize`, {
        reason
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Re-autorizar usuario (volver a dar autorización)
  async reauthorizeUser(userId) {
    try {
      const response = await apiClient.post(`/admin/users/${userId}/reauthorize`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener identificación del usuario (blob)
  async getUserIdentification(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/identification`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener imagen de identificación con autenticación correcta
  async getUserIdentificationFile(userId) {
    try {
      const response = await apiClient.get(`/admin/users/${userId}/identification-file`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear URL de imagen de identificación (para usar con fetch)
  getIdentificationImageUrl(userId) {
    return `${apiClient.defaults.baseURL}/admin/users/${userId}/identification-file`;
  },

  // Obtener estadísticas
  async getStats() {
    try {
      const response = await apiClient.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// ✅ Servicios de sistema y utilidades
export const systemService = {
  // Verificar salud del servidor
  async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// ✅ Servicios de QR y acceso físico
export const qrService = {
  // Obtener QR actual (solo para admins o token especial)
  async getCurrentQR() {
    try {
      const response = await apiClient.get('/qr/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Escanear QR (para todos los usuarios autenticados)
  async scanQR(qrCode, accessType) {
    try {
      const response = await apiClient.post('/qr/scan', { 
        qr_code: qrCode, 
        access_type: accessType 
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

// ✅ Servicios de administración de acceso
export const accessService = {
  // Obtener logs de acceso por fecha
  async getAccessLogs(date = null, page = 1, perPage = 50) {
    try {
      const params = { page, per_page: perPage };
      if (date) params.date = date;
      
      console.log('🔍 Solicitando logs de acceso:', { 
        url: '/admin/access-logs', 
        params,
        token: localStorage.getItem('access_token') ? 'presente' : 'ausente'
      });
      
      const response = await apiClient.get('/admin/access-logs', { 
        params,
        timeout: 15000  // Aumentar timeout para estos endpoints
      });
      
      console.log('✅ Respuesta logs de acceso:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getAccessLogs:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        params: error.config?.params
      });
      throw error;
    }
  },

  // Obtener usuarios que están actualmente dentro (no han salido)
  async getUsersInside() {
    try {
      console.log('🔍 Solicitando usuarios dentro:', {
        url: '/admin/users-inside',
        token: localStorage.getItem('access_token') ? 'presente' : 'ausente'
      });
      
      const response = await apiClient.get('/admin/users-inside', {
        timeout: 15000  // Aumentar timeout
      });
      
      console.log('✅ Respuesta usuarios dentro:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en getUsersInside:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  // Registrar salida manual por admin
  async manualExit(userId, notes = null) {
    try {
      const data = notes ? { notes } : {};
      
      console.log('🔍 Solicitando salida manual:', {
        url: `/admin/users/${userId}/manual-exit`,
        data,
        token: localStorage.getItem('access_token') ? 'presente' : 'ausente'
      });
      
      const response = await apiClient.post(`/admin/users/${userId}/manual-exit`, data, {
        timeout: 15000
      });
      
      console.log('✅ Respuesta salida manual:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en manualExit:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url,
        userId
      });
      throw error;
    }
  }
};

// ✅ Funciones de utilidad
export const utilsAPI = {
  // Test de conexión básica
  testConnection: async () => {
    try {
      await systemService.checkHealth();
      return true;
    } catch (error) {
      return false;
    }
  },

  // Verificar tokens
  checkTokens: () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    const user = localStorage.getItem('user');

    return {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUserData: !!user
    };
  }
};

export default apiClient;