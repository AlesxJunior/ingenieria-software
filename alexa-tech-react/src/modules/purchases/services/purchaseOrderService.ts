/**
 * SERVICIO: Órdenes de Compra (Purchase Orders)
 * Maneja todas las operaciones CRUD relacionadas con órdenes de compra
 * Endpoints: http://localhost:3001/api/compras/ordenes
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  UpdatePurchaseOrderStatusDto,
  FilterPurchaseOrderDto,
  PaginatedResponse,
  ApiResponse,
  PurchaseOrderStatistics,
} from '../types/purchases.types';

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

const API_BASE_URL = getApiBaseUrl();

/**
 * Clase de servicio para gestión de órdenes de compra
 */
class PurchaseOrderService {
  private api: AxiosInstance;
  private baseEndpoint = '/compras/ordenes';

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 segundos
    });

    // Interceptor para agregar token de autenticación
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejo de errores globales
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si es 401, limpiar token y redirigir al login
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('alexatech_token');
          localStorage.removeItem('alexatech_refresh_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * 1. Obtener listado de órdenes de compra con filtros y paginación
   * GET /api/compras/ordenes
   */
  async getPurchaseOrders(
    filters?: FilterPurchaseOrderDto
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.proveedorId) params.append('proveedorId', filters.proveedorId);
      if (filters?.almacenDestinoId) params.append('almacenDestinoId', filters.almacenDestinoId);
      if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters?.search) params.append('search', filters.search);

      const response = await this.api.get<PaginatedResponse<PurchaseOrder>>(
        `${this.baseEndpoint}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase orders:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 2. Obtener una orden de compra por ID
   * GET /api/compras/ordenes/:id
   */
  async getPurchaseOrderById(id: string): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.get<ApiResponse<PurchaseOrder>>(
        `${this.baseEndpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching purchase order ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 3. Crear nueva orden de compra
   * POST /api/compras/ordenes
   */
  async createPurchaseOrder(
    data: CreatePurchaseOrderDto
  ): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.post<ApiResponse<PurchaseOrder>>(
        this.baseEndpoint,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 4. Actualizar orden de compra existente
   * PUT /api/compras/ordenes/:id
   */
  async updatePurchaseOrder(
    id: string,
    data: UpdatePurchaseOrderDto
  ): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.put<ApiResponse<PurchaseOrder>>(
        `${this.baseEndpoint}/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating purchase order ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 5. Actualizar estado de orden de compra
   * PATCH /api/compras/ordenes/:id/estado
   */
  async updatePurchaseOrderStatus(
    id: string,
    data: UpdatePurchaseOrderStatusDto
  ): Promise<ApiResponse<PurchaseOrder>> {
    try {
      const response = await this.api.patch<ApiResponse<PurchaseOrder>>(
        `${this.baseEndpoint}/${id}/estado`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error updating purchase order status ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 6. Eliminar orden de compra (soft delete)
   * DELETE /api/compras/ordenes/:id
   */
  async deletePurchaseOrder(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.api.delete<ApiResponse<void>>(
        `${this.baseEndpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting purchase order ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 7. Obtener estadísticas de órdenes de compra
   * GET /api/compras/ordenes/estadisticas/resumen
   */
  async getPurchaseOrderStatistics(): Promise<ApiResponse<PurchaseOrderStatistics>> {
    try {
      const response = await this.api.get<ApiResponse<PurchaseOrderStatistics>>(
        `${this.baseEndpoint}/estadisticas/resumen`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase order statistics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 8. Exportar orden de compra a PDF
   * GET /api/compras/ordenes/:id/pdf
   */
  async exportToPDF(id: string): Promise<Blob> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/${id}/pdf`, {
        responseType: 'blob',
      });

      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error: any) {
      console.error(`Error exporting purchase order ${id} to PDF:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Método auxiliar para descargar el PDF generado
   */
  async downloadPDF(id: string, filename?: string): Promise<void> {
    try {
      const blob = await this.exportToPDF(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `orden-compra-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(`Error downloading purchase order PDF ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Error {
    if (error.response) {
      // Error de respuesta del servidor (4xx, 5xx)
      const message = error.response.data?.message || error.response.data?.error || 'Error en la operación';
      return new Error(`${message} (Status: ${error.response.status})`);
    } else if (error.request) {
      // Error de red (sin respuesta)
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      // Error en la configuración de la petición
      return new Error(error.message || 'Error desconocido');
    }
  }
}

// Exportar instancia única (singleton)
export const purchaseOrderService = new PurchaseOrderService();

// Exportar clase para testing
export default PurchaseOrderService;
