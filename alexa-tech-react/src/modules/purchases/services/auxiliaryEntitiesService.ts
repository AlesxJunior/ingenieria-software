/**
 * SERVICIO: Entidades Comerciales (Proveedores, Productos, Almacenes)
 * Maneja operaciones auxiliares necesarias para el módulo de compras
 * Endpoints varios del sistema
 */

import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { Supplier, Warehouse, Product } from '../types/purchases.types';

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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * Servicio para entidades comerciales auxiliares
 */
class AuxiliaryEntitiesService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
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
   * PROVEEDORES (Suppliers)
   */

  /**
   * Obtener listado de proveedores activos
   * GET /api/entidades?tipo=Proveedor&activo=true
   */
  async getSuppliers(params?: {
    activo?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Supplier[]>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('tipo', 'Proveedor'); // Filtrar solo proveedores
      if (params?.activo !== undefined) queryParams.append('activo', String(params.activo));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const response = await this.api.get<ApiResponse<Supplier[]>>(
        `/entidades?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching suppliers:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener proveedor por ID
   * GET /api/entidades/:id
   */
  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    try {
      const response = await this.api.get<ApiResponse<Supplier>>(
        `/entidades/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching supplier ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * ALMACENES (Warehouses)
   */

  /**
   * Obtener listado de almacenes activos
   * GET /api/almacenes
   */
  async getWarehouses(params?: {
    activo?: boolean;
    search?: string;
  }): Promise<ApiResponse<Warehouse[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.activo !== undefined) queryParams.append('activo', String(params.activo));
      if (params?.search) queryParams.append('search', params.search);

      const response = await this.api.get<ApiResponse<Warehouse[]>>(
        `/almacenes?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching warehouses:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener almacén por ID
   * GET /api/almacenes/:id
   */
  async getWarehouseById(id: string): Promise<ApiResponse<Warehouse>> {
    try {
      const response = await this.api.get<ApiResponse<Warehouse>>(
        `/almacenes/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching warehouse ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * PRODUCTOS (Products)
   */

  /**
   * Obtener listado de productos activos
   * GET /api/productos
   */
  async getProducts(params?: {
    activo?: boolean;
    search?: string;
    categoriaId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.activo !== undefined) queryParams.append('activo', String(params.activo));
      if (params?.search) queryParams.append('search', params.search);
      if (params?.categoriaId) queryParams.append('categoriaId', params.categoriaId);
      if (params?.page) queryParams.append('page', String(params.page));
      if (params?.limit) queryParams.append('limit', String(params.limit));

      const response = await this.api.get<ApiResponse<Product[]>>(
        `/productos?${queryParams.toString()}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching products:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener producto por ID
   * GET /api/productos/:id
   */
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    try {
      const response = await this.api.get<ApiResponse<Product>>(
        `/productos/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching product ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar producto por código
   * GET /api/productos/buscar-por-codigo/:codigo
   */
  async getProductByCode(codigo: string): Promise<ApiResponse<Product>> {
    try {
      const response = await this.api.get<ApiResponse<Product>>(
        `/productos/buscar-por-codigo/${codigo}`
      );
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching product by code ${codigo}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || 'Error en la operación';
      return new Error(`${message} (Status: ${error.response.status})`);
    } else if (error.request) {
      return new Error('No se pudo conectar con el servidor. Verifica tu conexión.');
    } else {
      return new Error(error.message || 'Error desconocido');
    }
  }
}

// Exportar instancia única (singleton)
export const auxiliaryEntitiesService = new AuxiliaryEntitiesService();

// Exportar clase para testing
export default AuxiliaryEntitiesService;
