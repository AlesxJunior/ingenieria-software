import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { 
  StockResponse, 
  KardexResponse, 
  StockFilters, 
  KardexFilters, 
  AjusteData,
  StockItem,
  MovimientoKardex
} from '../../../types/inventario';

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

class InventarioApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor para agregar token de autorización y loguear llamada
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
        if (token) {
          (config.headers as any).Authorization = `Bearer ${token}`;
        }
        const method = (config.method || 'GET').toUpperCase();
        const url = `${config.baseURL || ''}${config.url || ''}`;
        const params = (config.params || {});
        const headers = config.headers || {};
        console.log('API call:', method, url, params, headers);
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores 401
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if ((error.response?.status as number) === 401) {
          // Limpiar tokens
          localStorage.removeItem('authToken');
          localStorage.removeItem('alexatech_token');
          localStorage.removeItem('alexatech_refresh_token');
          
          // Mostrar notificación (si hay un sistema de notificaciones)
          const showToast = (window as any).showToast as ((msg: string, type?: string) => void) | undefined;
          const isOnLogin = window.location.pathname.includes('/login');
          if (showToast) {
            showToast('Sesión expirada', 'error');
          }
          
          // Redirigir a login si no estamos ya en /login
          if (!isOnLogin) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtener stock de productos
   * GET /api/inventario/stock
   */
  async getStock(filters: StockFilters = {}): Promise<StockResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.almacenId) params.append('almacenId', filters.almacenId);
      if (filters.q) params.append('q', filters.q);
      if (filters.estado) params.append('estado', filters.estado);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.order) params.append('order', filters.order);

      const response: AxiosResponse<{ success: boolean; data: { rows: StockItem[]; total: number; page: number; limit: number } }> = 
        await this.api.get(`/inventario/stock?${params.toString()}`);

      // El backend envuelve la respuesta en { success, data, message }
      const { rows, total, page, limit } = response.data.data;
      
      const mapped: StockResponse = {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
      console.log('getStock response:', mapped);
      return mapped;
    } catch (error: any) {
      console.error('Error fetching stock:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al cargar el stock';
      throw new Error(message);
    }
  }

  /**
   * Obtener movimientos del kardex
   * GET /api/inventario/kardex
   */
  async getKardex(filters: KardexFilters): Promise<KardexResponse> {
    try {
      const params = new URLSearchParams();
      
      params.append('warehouseId', filters.warehouseId);
      if (filters.productId) params.append('productId', filters.productId);
      if (filters.tipoMovimiento) params.append('tipoMovimiento', filters.tipoMovimiento);
      if (filters.fechaDesde) params.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) params.append('fechaHasta', filters.fechaHasta);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.order) params.append('order', filters.order);

      const response: AxiosResponse<{ success: boolean; data: { rows: MovimientoKardex[]; total: number; page: number; limit: number } }> = 
        await this.api.get(`/inventario/kardex?${params.toString()}`);

      // El backend envuelve la respuesta en { success, data, message }
      // Y dentro de data está { rows, total, page, limit } (no data/pageSize)
      const { rows, total, page, limit } = response.data.data;
      
      const mapped: KardexResponse = {
        data: rows,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit) || 1
        }
      };
      console.log('getKardex response:', mapped);
      return mapped;
    } catch (error: any) {
      console.error('Error fetching kardex:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al cargar el kardex';
      throw new Error(message);
    }
  }

  /**
   * Crear ajuste de inventario
   * POST /api/inventario/ajustes
   */
  async createAjuste(ajusteData: AjusteData): Promise<{ success: boolean; message: string }> {
    try {
      const response: AxiosResponse<{ success: boolean; message: string }> = 
        await this.api.post('/inventario/ajustes', ajusteData);

      return response.data;
    } catch (error: any) {
      console.error('Error creating adjustment:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al crear el ajuste';
      throw new Error(message);
    }
  }

  /**
   * Buscar productos para autocomplete
   * GET /api/productos/search
   */
  async searchProducts(query: string): Promise<{ id: string; codigo: string; nombre: string }[]> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { id: string; codigo: string; nombre: string }[] }> = 
        await this.api.get(`/productos/search?q=${encodeURIComponent(query)}`);

      // El backend envuelve la respuesta en { success, data, message }
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  /**
   * Obtener alertas de stock bajo/crítico
   * GET /api/inventario/alertas
   */
  async getAlertas(): Promise<{ stockBajo: StockItem[]; stockCritico: StockItem[] }> {
    try {
      const response: AxiosResponse<{ success: boolean; data: { rows: StockItem[]; total: number } }> = 
        await this.api.get('/inventario/alertas');

      // El backend envuelve la respuesta en { success, data, message }
      // Nota: Las alertas actualmente devuelven un array plano en 'rows'
      // Necesitamos separar entre bajo y crítico en el frontend o actualizar el backend
      const alertas = response.data.data.rows || [];
      const stockBajo = alertas.filter(item => item.estado === 'BAJO');
      const stockCritico = alertas.filter(item => item.estado === 'CRITICO');

      return { stockBajo, stockCritico };
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      const message = error?.response?.data?.message || error?.message || 'Error al cargar alertas';
      throw new Error(message);
    }
  }
}

// Instancia singleton del servicio
export const inventarioApi = new InventarioApiService();

// Exportar la clase para testing
export default InventarioApiService;