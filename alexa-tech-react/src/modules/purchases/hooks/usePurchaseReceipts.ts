/**
 * HOOK: usePurchaseReceipts
 * Hook personalizado para gestión de recepciones de compra
 * Fase 4 - Task 11
 * 
 * Características:
 * - Operaciones CRUD completas
 * - Confirm/Cancel operations
 * - Cache local con useState
 * - Loading/error states
 * - Relación con Purchase Orders
 * - Validaciones integradas
 */

import { useState, useEffect, useCallback } from 'react';
import { purchaseReceiptService } from '../services';
import type {
  PurchaseReceipt,
  CreatePurchaseReceiptDto,
  ConfirmReceiptDto,
  FilterPurchaseReceiptDto,
  PaginatedResponse,
} from '../types/purchases.types';

// ==================== TIPOS ====================

interface UsePurchaseReceiptsOptions {
  filters?: FilterPurchaseReceiptDto;
  autoFetch?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UsePurchaseReceiptsReturn {
  // Data
  receipts: PurchaseReceipt[];
  receipt: PurchaseReceipt | null;
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
  isConfirming: boolean;
  isCanceling: boolean;
  error: Error | null;

  // Methods - Queries
  fetchReceipts: (filters?: FilterPurchaseReceiptDto) => Promise<void>;
  fetchReceiptById: (id: string) => Promise<PurchaseReceipt | null>;
  fetchPendingReceiptsByOrderId: (orderId: string) => Promise<void>;
  refetch: () => Promise<void>;

  // Methods - Mutations
  createReceipt: (data: CreatePurchaseReceiptDto) => Promise<PurchaseReceipt | null>;
  confirmReceipt: (id: string, data?: ConfirmReceiptDto) => Promise<PurchaseReceipt | null>;
  cancelReceipt: (id: string, motivo?: string) => Promise<PurchaseReceipt | null>;
  downloadPDF: (id: string, filename?: string) => Promise<void>;

  // Cache management
  clearCache: () => void;
  invalidateQueries: () => void;
}

// ==================== HOOK ====================

export const usePurchaseReceipts = (options: UsePurchaseReceiptsOptions = {}): UsePurchaseReceiptsReturn => {
  const {
    filters: initialFilters,
    autoFetch = true,
    onSuccess,
    onError,
  } = options;

  // ==================== ESTADOS ====================

  // Data states
  const [receipts, setReceipts] = useState<PurchaseReceipt[]>([]);
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);
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
  const [isConfirming, setIsConfirming] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  // Current filters
  const [currentFilters, setCurrentFilters] = useState<FilterPurchaseReceiptDto | undefined>(initialFilters);

  // ==================== EFFECTS ====================

  useEffect(() => {
    if (autoFetch) {
      fetchReceipts(initialFilters);
    }
  }, [autoFetch]);

  // ==================== QUERY METHODS ====================

  /**
   * Obtener lista de recepciones con filtros
   */
  const fetchReceipts = useCallback(async (filters?: FilterPurchaseReceiptDto) => {
    try {
      setIsFetching(true);
      setIsLoading(receipts.length === 0);
      setError(null);

      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);

      const response: PaginatedResponse<PurchaseReceipt> = await purchaseReceiptService.getPurchaseReceipts(filtersToUse);

      setReceipts(response.data);
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
      const error = err instanceof Error ? err : new Error('Error al cargar recepciones');
      setError(error);
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  }, [currentFilters, receipts.length, onSuccess, onError]);

  /**
   * Obtener recepción por ID
   */
  const fetchReceiptById = useCallback(async (id: string): Promise<PurchaseReceipt | null> => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await purchaseReceiptService.getPurchaseReceiptById(id);
      const fetchedReceipt = response.data;

      setReceipt(fetchedReceipt);

      // Actualizar en cache si existe
      setReceipts(prev => {
        const index = prev.findIndex(r => r.id === id);
        if (index !== -1) {
          const newReceipts = [...prev];
          newReceipts[index] = fetchedReceipt;
          return newReceipts;
        }
        return prev;
      });

      if (onSuccess) {
        onSuccess(fetchedReceipt);
      }

      return fetchedReceipt;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al cargar recepción');
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
   * Obtener recepciones pendientes de una orden
   */
  const fetchPendingReceiptsByOrderId = useCallback(async (orderId: string) => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await purchaseReceiptService.getPendingReceiptsByOrderId(orderId);

      setReceipts(response.data);
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
      const error = err instanceof Error ? err : new Error('Error al cargar recepciones pendientes');
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
    await fetchReceipts(currentFilters);
  }, [currentFilters, fetchReceipts]);

  // ==================== MUTATION METHODS ====================

  /**
   * Crear nueva recepción
   */
  const createReceipt = useCallback(async (data: CreatePurchaseReceiptDto): Promise<PurchaseReceipt | null> => {
    try {
      setIsCreating(true);
      setError(null);

      const response = await purchaseReceiptService.createPurchaseReceipt(data);
      const newReceipt = response.data;

      // Optimistic update: agregar al inicio de la lista
      setReceipts(prev => [newReceipt, ...prev]);

      if (onSuccess) {
        onSuccess(newReceipt);
      }

      // Refetch para sincronizar
      await refetch();

      return newReceipt;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al crear recepción');
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
   * Confirmar recepción (actualiza inventario)
   */
  const confirmReceipt = useCallback(async (
    id: string,
    data?: ConfirmReceiptDto
  ): Promise<PurchaseReceipt | null> => {
    try {
      setIsConfirming(true);
      setError(null);

      // Validación: solo pendientes
      const currentReceipt = receipts.find(r => r.id === id) || receipt;
      if (currentReceipt && currentReceipt.estado !== 'PENDIENTE') {
        throw new Error('Solo se pueden confirmar recepciones pendientes');
      }

      const response = await purchaseReceiptService.confirmPurchaseReceipt(id, data);
      const confirmedReceipt = response.data;

      // Optimistic update en cache
      setReceipts(prev => prev.map(r => r.id === id ? confirmedReceipt : r));
      
      if (receipt?.id === id) {
        setReceipt(confirmedReceipt);
      }

      if (onSuccess) {
        onSuccess(confirmedReceipt);
      }

      return confirmedReceipt;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al confirmar recepción');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsConfirming(false);
    }
  }, [receipts, receipt, onSuccess, onError]);

  /**
   * Anular recepción
   */
  const cancelReceipt = useCallback(async (
    id: string,
    motivo?: string
  ): Promise<PurchaseReceipt | null> => {
    try {
      setIsCanceling(true);
      setError(null);

      // Validación: no cancelar recepciones ya canceladas
      const currentReceipt = receipts.find(r => r.id === id) || receipt;
      if (currentReceipt && currentReceipt.estado === 'CANCELADA') {
        throw new Error('La recepción ya está cancelada');
      }

      const response = await purchaseReceiptService.cancelPurchaseReceipt(id, motivo);
      const canceledReceipt = response.data;

      // Optimistic update en cache
      setReceipts(prev => prev.map(r => r.id === id ? canceledReceipt : r));
      
      if (receipt?.id === id) {
        setReceipt(canceledReceipt);
      }

      if (onSuccess) {
        onSuccess(canceledReceipt);
      }

      return canceledReceipt;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error('Error al anular recepción');
      setError(error);
      
      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsCanceling(false);
    }
  }, [receipts, receipt, onSuccess, onError]);

  /**
   * Descargar PDF
   */
  const downloadPDF = useCallback(async (id: string, filename?: string): Promise<void> => {
    try {
      setError(null);
      await purchaseReceiptService.downloadPDF(id, filename);

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
    setReceipts([]);
    setReceipt(null);
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
    receipts,
    receipt,
    pagination,

    // States
    isLoading,
    isFetching,
    isCreating,
    isConfirming,
    isCanceling,
    error,

    // Methods - Queries
    fetchReceipts,
    fetchReceiptById,
    fetchPendingReceiptsByOrderId,
    refetch,

    // Methods - Mutations
    createReceipt,
    confirmReceipt,
    cancelReceipt,
    downloadPDF,

    // Cache management
    clearCache,
    invalidateQueries,
  };
};

export default usePurchaseReceipts;
