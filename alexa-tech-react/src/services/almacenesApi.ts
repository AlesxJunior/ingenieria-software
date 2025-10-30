import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';

const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const currentHost = window.location.hostname;
  const apiPort = 3001;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://localhost:${apiPort}/api`;
  }
  
  return `http://${currentHost}:${apiPort}/api`;
};

export interface Almacen {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion: string | null;
  capacidad: number | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    stockByWarehouses: number;
    inventoryMovements: number;
  };
}

export interface AlmacenFormData {
  codigo: string;
  nombre: string;
  ubicacion?: string;
  capacidad?: number;
}

export interface AlmacenesResponse {
  success: boolean;
  message: string;
  data: {
    rows: Almacen[];
    total: number;
  };
}

class AlmacenesApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor para agregar token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor para manejar errores 401
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('alexatech_token');
          localStorage.removeItem('alexatech_refresh_token');
          
          const isOnLogin = window.location.pathname.includes('/login');
          if (!isOnLogin) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtener todos los almacenes
   * GET /api/almacenes
   */
  async getAlmacenes(params?: { activo?: boolean; q?: string }): Promise<Almacen[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.activo !== undefined) queryParams.append('activo', String(params.activo));
      if (params?.q) queryParams.append('q', params.q);

      const response: AxiosResponse<AlmacenesResponse> = await this.api.get(
        `/almacenes?${queryParams.toString()}`
      );

      return response.data.data.rows;
    } catch (error: any) {
      console.error('Error fetching almacenes:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al cargar almacenes';
      throw new Error(message);
    }
  }

  /**
   * Obtener un almacén por ID
   * GET /api/almacenes/:id
   */
  async getAlmacenById(id: string): Promise<Almacen> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Almacen }> = 
        await this.api.get(`/almacenes/${id}`);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching almacén:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al cargar almacén';
      throw new Error(message);
    }
  }

  /**
   * Crear un nuevo almacén
   * POST /api/almacenes
   */
  async createAlmacen(data: AlmacenFormData): Promise<Almacen> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Almacen }> = 
        await this.api.post('/almacenes', data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error creating almacén:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al crear almacén';
      throw new Error(message);
    }
  }

  /**
   * Actualizar un almacén
   * PUT /api/almacenes/:id
   */
  async updateAlmacen(id: string, data: Partial<AlmacenFormData> & { activo?: boolean }): Promise<Almacen> {
    try {
      const response: AxiosResponse<{ success: boolean; data: Almacen }> = 
        await this.api.put(`/almacenes/${id}`, data);
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error updating almacén:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al actualizar almacén';
      throw new Error(message);
    }
  }

  /**
   * Desactivar un almacén
   * DELETE /api/almacenes/:id
   */
  async deleteAlmacen(id: string): Promise<void> {
    try {
      await this.api.delete(`/almacenes/${id}`);
    } catch (error: any) {
      console.error('Error deleting almacén:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al desactivar almacén';
      throw new Error(message);
    }
  }
}

// Instancia singleton
export const almacenesApi = new AlmacenesApiService();

export default AlmacenesApiService;
