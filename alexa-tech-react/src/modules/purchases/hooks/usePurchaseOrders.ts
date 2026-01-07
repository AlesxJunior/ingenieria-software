/**
 * HOOK: usePurchaseOrders
 * Hook personalizado para gestión de órdenes de compra
 * Fase 4 - Task 10
 * 
 * Características:
 * - Operaciones CRUD completas
 * - Cache local con useState
 * - Loading/error states
 * - Invalidación manual de cache
 * - Optimistic updates
 */

import { useState, useEffect, useCallback } from 'react';
import { purchaseOrderService } from '../services';
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  UpdatePurchaseOrderStatusDto,
  FilterPurchaseOrderDto,
  PaginatedResponse,
  PurchaseOrderStatistics,
} from '../types/purchases.types';

// ==================== TIPOS ====================

interface UsePurchaseOrdersOptions {
  filters?: FilterPurchaseOrderDto;
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UsePurchaseOrdersReturn {
  // Data
  orders: PurchaseOrder[];
  order: PurchaseOrder | null;
  statistics: PurchaseOrderStatistics | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  } | null;

  // States
  isLoading: boolean;
  isFetching: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: Error | null;

  // Methods - Queries
  fetchOrders: (filters?: FilterPurchaseOrderDto) => Promise<void>;
  fetchOrderById: (id: string) => Promise<PurchaseOrder | null>;
  fetchStatistics: () => Promise<void>;
  refetch: () => Promise<void>;

  // Methods - Mutations
  createOrder: (data: CreatePurchaseOrderDto) => Promise<PurchaseOrder | null>;
  updateOrder: (id: string, data: UpdatePurchaseOrderDto) => Promise<PurchaseOrder | null>;
  updateOrderStatus: (id: string, data: UpdatePurchaseOrderStatusDto) => Promise<PurchaseOrder | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  downloadPDF: (id: string, filename?: string) => Promise<void>;

  // Cache management
  clearCache: () => void;
  invalidateQueries: () => void;
}

// ==================== HOOK ====================

export const usePurchaseOrders = (options: UsePurchaseOrdersOptions = {}): UsePurchaseOrdersReturn => {
  const {
    filters: initialFilters,
    autoFetch = true,
    onSuccess,
    onError,
  } = options;

  // ==================== ESTADOS ====================

  // Data states
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [statistics, setStatistics] = useState<PurchaseOrderStatistics | null>(null);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    total: number;
    limit: number;
  } | null>(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  // Current filters
  const [currentFilters, setCurrentFilters] = useState<FilterPurchaseOrderDto | undefined>(initialFilters);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (autoFetch) {
      fetchOrders(initialFilters);
    }
  }, [autoFetch]);

  // ==================== QUERY METHODS ====================

  /**
   * Obtener lista de órdenes con filtros
   */
  const fetchOrders = useCallback(async (filters?: FilterPurchaseOrderDto) => {
    try {
      setIsFetching(true);
      setIsLoading(orders.length === 0);
      setError(null);

      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);

      const response: PaginatedResponse<PurchaseOrder> = await purchaseOrderService.getPurchaseOrders(filtersToUse);

      setOrders(response.data);
      setPagination({
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        total: response.pagination.total,
        limit: response.pagination.limit,
      });

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al cargar órdenes');
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [currentFilters, orders.length, onSuccess, onError]);

  /**
   * Obtener orden por ID
   */
  const fetchOrderById = useCallback(async (id: string): Promise<PurchaseOrder | null> => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await purchaseOrderService.getPurchaseOrderById(id);
      const fetchedOrder = response.data;

      setOrder(fetchedOrder);

      // Actualizar en cache si existe
      setOrders(prev => {
        const index = prev.findIndex(o => o.id === id);
        if (index !== -1) {
          const newOrders = [...prev];
          newOrders[index] = fetchedOrder;
          return newOrders;
        }
        return prev;
      });

      if (onSuccess) {
        onSuccess(fetchedOrder);
      }

      return fetchedOrder;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al cargar orden');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsFetching(false);
    }
  }, [onSuccess, onError]);

  /**
   * Obtener estadísticas
   */
  const fetchStatistics = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await purchaseOrderService.getPurchaseOrderStatistics();
      setStatistics(response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al cargar estadísticas');
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsFetching(false);
    }
  }, [onSuccess, onError]);

  /**
   * Re-fetch con filtros actuales
   */
  const refetch = useCallback(async () => {
    await fetchOrders(currentFilters);
  }, [currentFilters, fetchOrders]);

  // ==================== MUTATION METHODS ====================

  /**
   * Crear nueva orden
   */
  const createOrder = useCallback(async (data: CreatePurchaseOrderDto): Promise<PurchaseOrder | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await purchaseOrderService.createPurchaseOrder(data);
      const newOrder = response.data;

      // Optimistic update: agregar al inicio de la lista
      setOrders(prev => [newOrder, ...prev]);

      if (onSuccess) {
        onSuccess(newOrder);
      }

      // Refetch para sincronizar
      await refetch();

      return newOrder;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al crear orden');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsCreating(false);
    }
  }, [onSuccess, onError, refetch]);

  /**
   * Actualizar orden existente
   */
  const updateOrder = useCallback(async (
    id: string,
    data: UpdatePurchaseOrderDto
  ): Promise<PurchaseOrder | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await purchaseOrderService.updatePurchaseOrder(id, data);
      const updatedOrder = response.data;

      // Optimistic update en cache
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      
      if (order?.id === id) {
        setOrder(updatedOrder);
      }

      if (onSuccess) {
        onSuccess(updatedOrder);
      }

      return updatedOrder;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al actualizar orden');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [order, onSuccess, onError]);

  /**
   * Actualizar estado de orden
   */
  const updateOrderStatus = useCallback(async (
    id: string,
    data: UpdatePurchaseOrderStatusDto
  ): Promise<PurchaseOrder | null> => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await purchaseOrderService.updatePurchaseOrderStatus(id, data);
      const updatedOrder = response.data;

      // Optimistic update en cache
      setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
      
      if (order?.id === id) {
        setOrder(updatedOrder);
      }

      if (onSuccess) {
        onSuccess(updatedOrder);
      }

      return updatedOrder;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al actualizar estado');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [order, onSuccess, onError]);

  /**
   * Eliminar orden
   */
  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setError(null);

      // Optimistic update: remover de cache
      const previousOrders = [...orders];
      setOrders(prev => prev.filter(o => o.id !== id));

      await purchaseOrderService.deletePurchaseOrder(id);

      if (order?.id === id) {
        setOrder(null);
      }

      if (onSuccess) {
        onSuccess({ id });
      }

      return true;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al eliminar orden');
      setError(error);
      
      // Rollback en caso de error
      await refetch();
      
      if (onError) {
        onError(error);
      }

      return false;
    } finally {
      setIsDeleting(false);
    }
  }, [orders, order, onSuccess, onError, refetch]);

  /**
   * Descargar PDF
   */
  const downloadPDF = useCallback(async (id: string, filename?: string): Promise<void> => {
    try {
      setError(null);
      await purchaseOrderService.downloadPDF(id, filename);

      if (onSuccess) {
        onSuccess({ id, action: 'download_pdf' });
      }
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al descargar PDF');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      throw error;
    }
  }, [onSuccess, onError]);

  // ==================== CACHE MANAGEMENT ====================

  /**
   * Limpiar cache
   */
  const clearCache = useCallback(() => {
    setOrders([]);
    setOrder(null);
    setStatistics(null);
    setPagination(null);
    setError(null);
  }, []);

  /**
   * Invalidar queries (refetch)
   */
  const invalidateQueries = useCallback(() => {
    refetch();
  }, [refetch]);

  // ==================== RETURN ====================

  return {
    // Data
    orders,
    order,
    statistics,
    pagination,

    // States
    isLoading,
    isFetching,
    isCreating,
    isUpdating,
    isDeleting,
    error,

    // Methods - Queries
    fetchOrders,
    fetchOrderById,
    fetchStatistics,
    refetch,

    // Methods - Mutations
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder,
    downloadPDF,

    // Cache management
    clearCache,
    invalidateQueries,
  };
};

export default usePurchaseOrders;
