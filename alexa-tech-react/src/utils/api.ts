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

  // ==== Productos ====
  // Crear producto
  async createProduct(productData: {
    codigo: string;
    nombre: string;
    descripcion?: string;
    categoria: string;
    precioVenta: number;
    stock: number;
    estado?: boolean;
    unidadMedida: string;
    ubicacion?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/productos', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // ==== Compras ====
  async createPurchase(purchaseData: {
    proveedorId: string;
    almacenId: string;
    fechaEmision: string;
    tipoComprobante?: string;
    items: Array<{
      productoId: string;
      nombreProducto?: string;
      cantidad: number;
      precioUnitario: number;
    }>;
    formaPago?: string;
    observaciones?: string;
    fechaEntregaEstimada?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/compras', {
      method: 'POST',
      body: JSON.stringify(purchaseData),
    });
  }

  async getPurchases(params?: {
    estado?: 'Pendiente' | 'Recibida' | 'Cancelada';
    proveedorId?: string;
    almacenId?: string;
    fechaInicio?: string; // ISO date
    fechaFin?: string; // ISO date
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ purchases: any[]; total: number; filters: Record<string, any> }>> {
    const queryParams = new URLSearchParams();
    if (params?.estado) queryParams.append('estado', params.estado);
    if (params?.proveedorId) queryParams.append('proveedorId', params.proveedorId);
    if (params?.almacenId) queryParams.append('almacenId', params.almacenId);
    if (params?.fechaInicio) queryParams.append('fechaInicio', params.fechaInicio);
    if (params?.fechaFin) queryParams.append('fechaFin', params.fechaFin);
    if (params?.q) queryParams.append('q', params.q);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/compras?${queryString}` : '/compras';
    return this.request<{ purchases: any[]; total: number; filters: Record<string, any> }>(endpoint, { method: 'GET' });
  }

  async getPurchaseById(id: string): Promise<ApiResponse<any>> {
    return this.request(`/compras/${id}`, { method: 'GET' });
  }

  async updatePurchase(id: string, purchaseData: {
    proveedorId?: string;
    almacenId?: string;
    fechaEmision?: string;
    tipoComprobante?: string;
    items?: Array<{
      productoId: string;
      nombreProducto?: string;
      cantidad: number;
      precioUnitario: number;
    }>;
    formaPago?: string;
    observaciones?: string;
    fechaEntregaEstimada?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/compras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(purchaseData),
    });
  }

  async updatePurchaseStatus(id: string, estado: 'Pendiente' | 'Recibida' | 'Cancelada'): Promise<ApiResponse<any>> {
    return this.request(`/compras/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  // Listar productos con filtros opcionales
  async getProducts(params?: {
    categoria?: string;
    estado?: boolean;
    unidadMedida?: string;
    ubicacion?: string;
    q?: string;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    maxStock?: number;
  }): Promise<ApiResponse<{ products: any[]; total: number; filters: Record<string, any> }>> {
    const queryParams = new URLSearchParams();
    if (params?.categoria) queryParams.append('categoria', params.categoria);
    if (typeof params?.estado === 'boolean') queryParams.append('estado', String(params.estado));
    if (params?.unidadMedida) queryParams.append('unidadMedida', params.unidadMedida);
    if (params?.ubicacion) queryParams.append('ubicacion', params.ubicacion);
    if (params?.q) queryParams.append('q', params.q);
    if (typeof params?.minPrecio === 'number') queryParams.append('minPrecio', String(params.minPrecio));
    if (typeof params?.maxPrecio === 'number') queryParams.append('maxPrecio', String(params.maxPrecio));
    if (typeof params?.minStock === 'number') queryParams.append('minStock', String(params.minStock));
    if (typeof params?.maxStock === 'number') queryParams.append('maxStock', String(params.maxStock));

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/productos?${queryString}` : '/productos';
    return this.request<{ products: any[]; total: number; filters: Record<string, any> }>(endpoint, { method: 'GET' });
  }

  // Obtener producto por código
  async getProductByCodigo(codigo: string): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}`, {
      method: 'GET',
    });
  }

  // Actualizar producto por código
  async updateProductByCodigo(codigo: string, productData: {
    nombre?: string;
    descripcion?: string;
    categoria?: string;
    precioVenta?: number;
    stock?: number;
    estado?: boolean;
    unidadMedida?: string;
    ubicacion?: string;
  }): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  // Actualizar estado (activo/inactivo) del producto
  async updateProductStatus(codigo: string, estado: boolean): Promise<ApiResponse<any>> {
    return this.request(`/productos/${codigo}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  }

  // Método genérico para hacer peticiones
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    console.log(`[API Request] Iniciando fetch a: ${options.method || 'GET'} ${url}`);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Agregar token de autorización si existe
    const token = localStorage.getItem('alexatech_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
      console.log('[API Request] Token enviado:', token);
    } else {
      console.log('[API Request] No se encontró token.');
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

      console.log(`[API Response] Status: ${response.status}`, {
        url,
        status: response.status,
        statusText: response.statusText,
        data,
      });

      if (!response.ok) {
        return {
          success: false,
          message: data.message || `HTTP error! status: ${response.status}`,
          error: data.error || `HTTP ${response.status}`
        };
      }

      return data;
    } catch (error) {
      console.error(`[API Error] Fallo en la petición a ${url}:`, error);
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

  // Métodos de gestión de entidades comerciales (clientes/proveedores/ambos)
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    tipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
    tipoDocumento?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
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
    if (params?.tipoEntidad) queryParams.append('tipoEntidad', params.tipoEntidad);
    if (params?.tipoDocumento) queryParams.append('tipoDocumento', params.tipoDocumento);
    if (params?.fechaDesde) queryParams.append('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) queryParams.append('fechaHasta', params.fechaHasta);
    if (params?.departamentoId) queryParams.append('departamentoId', params.departamentoId);
    if (params?.provinciaId) queryParams.append('provinciaId', params.provinciaId);
    if (params?.distritoId) queryParams.append('distritoId', params.distritoId);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/entidades?${queryString}` : '/entidades';
    
    return this.request(endpoint);
  }

  async getClientById(id: string): Promise<ApiResponse<any>> {
     return this.request(`/entidades/${id}`);
   }

  // ==== Ubigeo ====
  async getDepartamentos(): Promise<ApiResponse<Array<{ id: string; nombre: string }>>> {
    const res = await this.get<{ departamentos: Array<{ id: string; nombre: string }> }>(
      '/ubigeo/departamentos'
    );
    if (res.success) {
      const data = Array.isArray(res.data?.departamentos) ? res.data!.departamentos : [];
      return { success: res.success, message: res.message, data, error: res.error };
    }
    return { success: res.success, message: res.message, data: [], error: res.error };
  }

  async getProvincias(
    departamentoId: string
  ): Promise<ApiResponse<Array<{ id: string; nombre: string; departamentoId: string }>>> {
    const res = await this.get<{ provincias: Array<{ id: string; nombre: string; departamentoId: string }> }>(
      `/ubigeo/departamentos/${departamentoId}/provincias`
    );
    if (res.success) {
      const data = Array.isArray(res.data?.provincias) ? res.data!.provincias : [];
      return { success: res.success, message: res.message, data, error: res.error };
    }
    return { success: res.success, message: res.message, data: [], error: res.error };
  }

  async getDistritos(
    provinciaId: string
  ): Promise<ApiResponse<Array<{ id: string; nombre: string; provinciaId: string }>>> {
    const res = await this.get<{ distritos: Array<{ id: string; nombre: string; provinciaId: string }> }>(
      `/ubigeo/provincias/${provinciaId}/distritos`
    );
    if (res.success) {
      const data = Array.isArray(res.data?.distritos) ? res.data!.distritos : [];
      return { success: res.success, message: res.message, data, error: res.error };
    }
    return { success: res.success, message: res.message, data: [], error: res.error };
  }

  async createClient(clientData: {
    tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
    tipoDocumento: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
    numeroDocumento: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    email: string;
    telefono: string;
    direccion: string;
    // Ubigeo
    departamentoId: string;
    provinciaId: string;
    distritoId: string;
    // Campo opcional manteniendo compatibilidad
    ciudad?: string;
  }): Promise<ApiResponse<any>> {
    return this.request('/entidades', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async updateClient(id: string, clientData: {
    tipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
    tipoDocumento?: 'DNI' | 'CE' | 'RUC' | 'Pasaporte';
    numeroDocumento?: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    email?: string;
    telefono?: string;
    direccion?: string;
    // Ubigeo
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
    ciudad?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request(`/entidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    });
  }

  async deleteClient(id: string): Promise<ApiResponse<any>> {
    // Soft delete vía actualización de estado (isActive: false)
    return this.request(`/entidades/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: false })
    });
  }

  async reactivateClient(id: string): Promise<ApiResponse<any>> {
    // Alinear con backend: /entidades/:id/reactivate vía POST
    return this.request(`/entidades/${id}/reactivate`, {
      method: 'POST',
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