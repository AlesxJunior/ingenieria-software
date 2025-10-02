// Configuración dinámica de la API
const getApiBaseUrl = (): string => {
  // Si estamos en desarrollo y hay una variable de entorno específica, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detectar automáticamente la IP del servidor basándose en la URL actual
  const currentHost = window.location.hostname;
  const apiPort = 3001;
  
  // Si estamos en localhost, mantener localhost
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://localhost:${apiPort}/api`;
  }
  
  // Si estamos en una IP específica, usar esa misma IP para la API
  return `http://${currentHost}:${apiPort}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    permissions?: string[];
  };
  accessToken: string;
  refreshToken: string;
}

// Clase para manejar las llamadas a la API
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Método genérico para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autorización si existe
    const token = localStorage.getItem('alexatech_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          error: data.error || `HTTP ${response.status}`
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Error de conexión con el servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async refreshToken(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = localStorage.getItem('alexatech_refresh_token');
    return this.request<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<AuthResponse['user']>> {
    return this.request<AuthResponse['user']>('/auth/me');
  }

  async validateToken(): Promise<ApiResponse> {
    const token = localStorage.getItem('alexatech_token');
    return this.request('/auth/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async checkEmail(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    return this.request<{ exists: boolean }>(`/auth/check-email/${email}`);
  }

  // Métodos de gestión de usuarios
  async getUsers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<ApiResponse<{
    users: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalUsers: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    
    return this.request(endpoint);
  }

  async getUserById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async patchUser(id: string, userData: {
    username?: string;
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<ApiResponse<any>> {
    return this.request(`/users/${id}/change-password`, {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Obtener actividad del usuario actual
  async getUserActivity(limit: number = 10): Promise<ApiResponse<any>> {
    return this.request(`/audit/my-activity?limit=${limit}`, {
      method: 'GET',
    });
  }

  // Métodos de gestión de clientes
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tipoDocumento?: string;
    ciudad?: string;
    fechaDesde?: string;
    fechaHasta?: string;
  }): Promise<ApiResponse<{
    clients: any[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalClients: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.tipoDocumento) queryParams.append('tipoDocumento', params.tipoDocumento);
    if (params?.ciudad) queryParams.append('ciudad', params.ciudad);
    if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/clients?${queryString}` : '/clients';
    
    return this.request(endpoint);
  }

  async getClientById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/clients/${id}`);
  }

  async createClient(clientData: {
    tipoDocumento: 'DNI' | 'CE' | 'RUC';
    numeroDocumento: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: {
    tipoDocumento?: 'DNI' | 'CE' | 'RUC';
    numeroDocumento?: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    ciudad?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<any>> {
    return this.request(`/clients/${id}`, {
      method: 'DELETE',
    });
  }

  async reactivateClient(id: string): Promise<ApiResponse<any>> {
    return this.request(`/clients/${id}/reactivate`, {
      method: 'PATCH',
    });
  }

  // Método para verificar la salud de la API
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }

  // Método para verificar la salud de la autenticación
  async authHealthCheck(): Promise<ApiResponse> {
    return this.request('/auth/health');
  }

  // Método GET genérico
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }
}

// Instancia singleton del servicio de API
export const apiService = new ApiService();

// Funciones de utilidad para el manejo de tokens
export const tokenUtils = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('alexatech_token', accessToken);
    localStorage.setItem('alexatech_refresh_token', refreshToken);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem('alexatech_token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('alexatech_refresh_token');
  },

  clearTokens: () => {
    localStorage.removeItem('alexatech_token');
    localStorage.removeItem('alexatech_refresh_token');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
};

export default apiService;