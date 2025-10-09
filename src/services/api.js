import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
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
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          });

          const { access_token } = response.data;
          localStorage.setItem('access_token', access_token);

          // Reintentar la petición original
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Si falla la renovación, redirigir al login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  // Iniciar sesión
  async login(email, password) {
    const response = await apiClient.post('/auth/login', { email, password });
    const { access_token, refresh_token } = response.data;
    
    // Guardar tokens
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    return response.data;
  },

  // Registrar usuario
  async register(userData) {
    const formData = new FormData();
    
    // Añadir todos los campos al FormData
    Object.keys(userData).forEach(key => {
      if (userData[key] !== null && userData[key] !== undefined) {
        formData.append(key, userData[key]);
      }
    });

    const response = await apiClient.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Renovar token
  async refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });
    
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    
    return response.data;
  },

  // Cerrar sesión
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Obtener perfil del usuario
  async getProfile() {
    const response = await apiClient.get('/profile');
    localStorage.setItem('user', JSON.stringify(response.data.user));
    return response.data;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  // Obtener usuario almacenado
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Servicios de administración
export const adminService = {
  // Obtener usuarios pendientes
  async getPendingUsers(page = 1, perPage = 20, role = null) {
    const params = { page, per_page: perPage };
    if (role) params.role = role;
    
    const response = await apiClient.get('/admin/users/pending', { params });
    return response.data;
  },

  // Autorizar usuario
  async authorizeUser(userId) {
    const response = await apiClient.post(`/admin/users/${userId}/authorize`);
    return response.data;
  },

  // Rechazar usuario
  async rejectUser(userId, reason = null) {
    const data = reason ? { reason } : {};
    const response = await apiClient.post(`/admin/users/${userId}/reject`, data);
    return response.data;
  },

  // Obtener identificación del usuario
  async getUserIdentification(userId) {
    const response = await apiClient.get(`/admin/users/${userId}/identification`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obtener estadísticas
  async getStats() {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  }
};

// Servicio de sistema
export const systemService = {
  // Verificar salud del servidor
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

export default apiClient;