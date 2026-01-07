import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  ProductCategory,
  CategoryInput,
  CategoryResponse,
  CategoriesListResponse,
  UnitOfMeasure,
  UnitInput,
  UnitResponse,
  UnitsListResponse,
  ConfiguracionFilters
} from '../types/configuracion';

// Configuración dinámica de la API
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

class ConfiguracionApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor para agregar token de autorización
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
        if (token) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
        const method = (config.method || 'GET').toUpperCase();
        const url = `${config.baseURL || ''}${config.url || ''}`;
        console.log('🔧 Configuración API:', method, url);
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          console.error('❌ No autorizado. Redirigiendo a login...');
          localStorage.removeItem('authToken');
          localStorage.removeItem('alexatech_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  /**
   * Obtener todas las categorías
   */
  async getAllCategories(filters?: ConfiguracionFilters): Promise<ProductCategory[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.activo !== undefined) {
        params.append('activo', filters.activo.toString());
      }
      if (filters?.q) {
        params.append('q', filters.q);
      }

      const response = await this.api.get<CategoriesListResponse>(
        `/configuracion/categorias${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al obtener categorías');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      throw error;
    }
  }

  /**
   * Obtener solo categorías activas
   */
  async getActiveCategories(): Promise<ProductCategory[]> {
    return this.getAllCategories({ activo: true });
  }

  /**
   * Obtener una categoría por ID
   */
  async getCategoryById(id: string): Promise<ProductCategory> {
    try {
      const response = await this.api.get<CategoryResponse>(`/configuracion/categorias/${id}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Categoría no encontrada');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener categoría:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva categoría
   */
  async createCategory(data: CategoryInput): Promise<ProductCategory> {
    try {
      const response = await this.api.post<CategoryResponse>('/configuracion/categorias', data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear categoría');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear categoría:', error);
      throw new Error(error.response?.data?.error || 'Error al crear categoría');
    }
  }

  /**
   * Actualizar una categoría
   */
  async updateCategory(id: string, data: Partial<CategoryInput>): Promise<ProductCategory> {
    try {
      const response = await this.api.put<CategoryResponse>(`/configuracion/categorias/${id}`, data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar categoría');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar categoría:', error);
      throw new Error(error.response?.data?.error || 'Error al actualizar categoría');
    }
  }

  /**
   * Eliminar (soft delete) una categoría
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const response = await this.api.delete<CategoryResponse>(`/configuracion/categorias/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar categoría');
      }
    } catch (error: any) {
      console.error('Error al eliminar categoría:', error);
      throw new Error(error.response?.data?.error || 'Error al eliminar categoría');
    }
  }

  /**
   * Eliminar permanentemente una categoría
   */
  async hardDeleteCategory(id: string): Promise<void> {
    try {
      const response = await this.api.delete<CategoryResponse>(`/configuracion/categorias/${id}/hard`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar categoría permanentemente');
      }
    } catch (error: any) {
      console.error('Error al eliminar categoría permanentemente:', error);
      throw new Error(error.response?.data?.error || 'Error al eliminar categoría permanentemente');
    }
  }

  // ==========================================
  // UNIDADES DE MEDIDA
  // ==========================================

  /**
   * Obtener todas las unidades de medida
   */
  async getAllUnits(filters?: ConfiguracionFilters): Promise<UnitOfMeasure[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.activo !== undefined) {
        params.append('activo', filters.activo.toString());
      }
      if (filters?.q) {
        params.append('q', filters.q);
      }

      const response = await this.api.get<UnitsListResponse>(
        `/configuracion/unidades${params.toString() ? `?${params.toString()}` : ''}`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al obtener unidades');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error al obtener unidades:', error);
      throw error;
    }
  }

  /**
   * Obtener solo unidades activas
   */
  async getActiveUnits(): Promise<UnitOfMeasure[]> {
    return this.getAllUnits({ activo: true });
  }

  /**
   * Obtener una unidad por ID
   */
  async getUnitById(id: string): Promise<UnitOfMeasure> {
    try {
      const response = await this.api.get<UnitResponse>(`/configuracion/unidades/${id}`);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Unidad no encontrada');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener unidad:', error);
      throw error;
    }
  }

  /**
   * Crear una nueva unidad de medida
   */
  async createUnit(data: UnitInput): Promise<UnitOfMeasure> {
    try {
      const response = await this.api.post<UnitResponse>('/configuracion/unidades', data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al crear unidad');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al crear unidad:', error);
      throw new Error(error.response?.data?.error || 'Error al crear unidad');
    }
  }

  /**
   * Actualizar una unidad de medida
   */
  async updateUnit(id: string, data: Partial<UnitInput>): Promise<UnitOfMeasure> {
    try {
      const response = await this.api.put<UnitResponse>(`/configuracion/unidades/${id}`, data);
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Error al actualizar unidad');
      }
      
      return response.data.data;
    } catch (error: any) {
      console.error('Error al actualizar unidad:', error);
      throw new Error(error.response?.data?.error || 'Error al actualizar unidad');
    }
  }

  /**
   * Eliminar (soft delete) una unidad de medida
   */
  async deleteUnit(id: string): Promise<void> {
    try {
      const response = await this.api.delete<UnitResponse>(`/configuracion/unidades/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar unidad');
      }
    } catch (error: any) {
      console.error('Error al eliminar unidad:', error);
      throw new Error(error.response?.data?.error || 'Error al eliminar unidad');
    }
  }

  /**
   * Eliminar permanentemente una unidad de medida
   */
  async hardDeleteUnit(id: string): Promise<void> {
    try {
      const response = await this.api.delete<UnitResponse>(`/configuracion/unidades/${id}/hard`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Error al eliminar unidad permanentemente');
      }
    } catch (error: any) {
      console.error('Error al eliminar unidad permanentemente:', error);
      throw new Error(error.response?.data?.error || 'Error al eliminar unidad permanentemente');
    }
  }
}

// Exportar instancia única del servicio
export const configuracionApi = new ConfiguracionApiService();
