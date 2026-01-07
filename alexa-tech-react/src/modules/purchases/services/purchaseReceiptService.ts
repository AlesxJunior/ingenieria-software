/**
 * SERVICIO: Recepciones de Compra (Purchase Receipts)
 * Maneja todas las operaciones relacionadas con recepciones de órdenes de compra
 * Endpoints: http://localhost:3001/api/compras/recepciones
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type {
  PurchaseReceipt,
  CreatePurchaseReceiptDto,
  ConfirmReceiptDto,
  FilterPurchaseReceiptDto,
  PaginatedResponse,
  ApiResponse,
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
 * Clase de servicio para gestión de recepciones de compra
 */
class PurchaseReceiptService {
  private api: AxiosInstance;
  private baseEndpoint = '/compras/recepciones';

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
   * 1. Obtener listado de recepciones con filtros y paginación
   * GET /api/compras/recepciones
   */
  async getPurchaseReceipts(
    filters?: FilterPurchaseReceiptDto
  ): Promise<PaginatedResponse<PurchaseReceipt>> {
    try {
      const params = new URLSearchParams();

      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.estado) params.append('estado', filters.estado);
      if (filters?.ordenCompraId) params.append('ordenCompraId', filters.ordenCompraId);
      if (filters?.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) params.append('fechaFin', filters.fechaFin);
      if (filters?.search) params.append('search', filters.search);

      const response = await this.api.get<PaginatedResponse<PurchaseReceipt>>(
        `${this.baseEndpoint}?${params.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching purchase receipts:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 2. Obtener una recepción por ID
   * GET /api/compras/recepciones/:id
   */
  async getPurchaseReceiptById(id: string): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.get<ApiResponse<PurchaseReceipt>>(
        `${this.baseEndpoint}/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching purchase receipt ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 3. Crear nueva recepción de compra
   * POST /api/compras/recepciones
   */
  async createPurchaseReceipt(
    data: CreatePurchaseReceiptDto
  ): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.post<ApiResponse<PurchaseReceipt>>(
        this.baseEndpoint,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('Error creating purchase receipt:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 4. Confirmar recepción (actualiza inventario)
   * PATCH /api/compras/recepciones/:id/confirmar
   */
  async confirmPurchaseReceipt(
    id: string,
    data?: ConfirmReceiptDto
  ): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.patch<ApiResponse<PurchaseReceipt>>(
        `${this.baseEndpoint}/${id}/confirmar`,
        data || { items: [] }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error confirming purchase receipt ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 5. Anular recepción
   * PATCH /api/compras/recepciones/:id/anular
   */
  async cancelPurchaseReceipt(
    id: string,
    motivo?: string
  ): Promise<ApiResponse<PurchaseReceipt>> {
    try {
      const response = await this.api.patch<ApiResponse<PurchaseReceipt>>(
        `${this.baseEndpoint}/${id}/anular`,
        { motivo }
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error canceling purchase receipt ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * 6. Exportar recepción a PDF
   * GET /api/compras/recepciones/:id/pdf
   */
  async exportToPDF(id: string): Promise<Blob> {
    try {
      const response = await this.api.get(`${this.baseEndpoint}/${id}/pdf`, {
        responseType: 'blob',
      });

      return new Blob([response.data], { type: 'application/pdf' });
    } catch (error: any) {
      console.error(`Error exporting purchase receipt ${id} to PDF:`, error);
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
      link.download = filename || `recepcion-compra-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error(`Error downloading purchase receipt PDF ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener recepciones pendientes de una orden de compra
   * Método auxiliar útil para UI
   */
  async getPendingReceiptsByOrderId(
    ordenCompraId: string
  ): Promise<PaginatedResponse<PurchaseReceipt>> {
    try {
      return await this.getPurchaseReceipts({
        ordenCompraId,
        estado: 'PENDIENTE' as PurchaseReceiptStatus,
        limit: 100,
      });
    } catch (error: any) {
      console.error(`Error fetching pending receipts for order ${ordenCompraId}:`, error);
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
export const purchaseReceiptService = new PurchaseReceiptService();

// Exportar clase para testing
export default PurchaseReceiptService;
