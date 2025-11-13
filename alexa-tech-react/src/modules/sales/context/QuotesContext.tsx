import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { api, tokenUtils } from '../../../utils/api';
import { useNotification } from '../../../context/NotificationContext';

// Tipos
export type QuoteStatus = 'Pendiente' | 'Aceptada' | 'Convertida' | 'Rechazada' | 'Vencida' | 'Cancelada';

export interface QuoteItem {
  id: string;
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Quote {
  id: string;
  codigoCotizacion: string;
  clienteId: string | null;
  almacenId: string;
  usuarioId: string;
  fechaEmision: string;
  fechaVencimiento: string;
  diasValidez: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: QuoteStatus;
  observaciones: string | null;
  motivoRechazo: string | null;
  intentosConversion: number;
  createdAt: string;
  updatedAt: string;
  items: QuoteItem[];
  cliente?: {
    id: string;
    nombres?: string;
    apellidos?: string;
    razonSocial?: string;
    numeroDocumento: string;
  } | null;
  usuario?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  salesConverted?: {
    id: string;
    codigoVenta: string;
    total: number;
    createdAt: string;
  }[];
}

export interface QuoteFilters {
  estado?: QuoteStatus | 'Todas';
  clienteId?: string;
  usuarioId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

export interface CreateQuoteInput {
  clienteId?: string;
  almacenId: string;
  usuarioId: string;
  diasValidez?: number;
  observaciones?: string;
  items: {
    productId: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
}

export interface ConvertToSaleInput {
  quoteId: string;
  userId: string;
  formaPago: string;
  tipoComprobante: string;
  cashSessionId: string;
}

interface QuotesContextType {
  quotes: Quote[];
  loading: boolean;
  filters: QuoteFilters;
  stats: {
    totalQuotes: number;
    pendientes: number;
    aceptadas: number;
    convertidas: number;
    rechazadas: number;
    vencidas: number;
    canceladas: number;
  };
  fetchQuotes: () => Promise<void>;
  createQuote: (data: CreateQuoteInput) => Promise<Quote>;
  getQuoteById: (id: string) => Promise<Quote>;
  updateQuote: (id: string, data: Partial<Quote>) => Promise<Quote>;
  deleteQuote: (id: string) => Promise<void>;
  approveQuote: (id: string) => Promise<Quote>;
  rejectQuote: (id: string, motivoRechazo?: string) => Promise<Quote>;
  convertToSale: (data: ConvertToSaleInput) => Promise<any>;
  setFilters: (filters: QuoteFilters) => void;
  applyFilters: (filters: QuoteFilters) => void;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

export const QuotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFiltersState] = useState<QuoteFilters>({});
  const [stats, setStats] = useState({
    totalQuotes: 0,
    pendientes: 0,
    aceptadas: 0,
    convertidas: 0,
    rechazadas: 0,
    vencidas: 0,
    canceladas: 0
  });

  const { showNotification } = useNotification();

  /**
   * Obtener todas las cotizaciones con filtros
   */
  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();
      
      // Construir query params
      const params = new URLSearchParams();
      if (filters.estado && filters.estado !== 'Todas') {
        params.append('estado', filters.estado);
      }
      if (filters.clienteId) {
        params.append('clienteId', filters.clienteId);
      }
      if (filters.usuarioId) {
        params.append('usuarioId', filters.usuarioId);
      }
      if (filters.fechaDesde) {
        params.append('fechaDesde', filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        params.append('fechaHasta', filters.fechaHasta);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const response = await api.get(`/quotes?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setQuotes(response.data.data || []);
        
        // Calcular estadísticas
        const data = response.data.data || [];
        setStats({
          totalQuotes: data.length,
          pendientes: data.filter((q: Quote) => q.estado === 'Pendiente').length,
          aceptadas: data.filter((q: Quote) => q.estado === 'Aceptada').length,
          convertidas: data.filter((q: Quote) => q.estado === 'Convertida').length,
          rechazadas: data.filter((q: Quote) => q.estado === 'Rechazada').length,
          vencidas: data.filter((q: Quote) => q.estado === 'Vencida').length,
          canceladas: data.filter((q: Quote) => q.estado === 'Cancelada').length
        });
      }
    } catch (error: any) {
      console.error('Error al obtener cotizaciones:', error);
      showNotification('Error al cargar cotizaciones', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showNotification]);

  /**
   * Crear una nueva cotización
   */
  const createQuote = useCallback(async (data: CreateQuoteInput): Promise<Quote> => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();

      const response = await api.post('/quotes', data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Cotización creada exitosamente', 'success');
        await fetchQuotes(); // Recargar lista
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al crear cotización');
    } catch (error: any) {
      console.error('Error al crear cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al crear cotización';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * Obtener una cotización por ID
   */
  const getQuoteById = useCallback(async (id: string): Promise<Quote> => {
    try {
      const token = tokenUtils.getAccessToken();

      const response = await api.get(`/quotes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al obtener cotización');
    } catch (error: any) {
      console.error('Error al obtener cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener cotización';
      showNotification(errorMessage, 'error');
      throw error;
    }
  }, [showNotification]);

  /**
   * Actualizar una cotización
   */
  const updateQuote = useCallback(async (id: string, data: Partial<Quote>): Promise<Quote> => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();

      const response = await api.put(`/quotes/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Cotización actualizada exitosamente', 'success');
        await fetchQuotes();
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al actualizar cotización');
    } catch (error: any) {
      console.error('Error al actualizar cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar cotización';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * Eliminar una cotización
   */
  const deleteQuote = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();

      const response = await api.delete(`/quotes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Cotización eliminada exitosamente', 'success');
        await fetchQuotes();
      } else {
        throw new Error(response.data.message || 'Error al eliminar cotización');
      }
    } catch (error: any) {
      console.error('Error al eliminar cotización:', error);
      const errorMessage = error.response?.data?.message || 'No se puede eliminar una cotización convertida a venta';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * Aprobar una cotización
   */
  const approveQuote = useCallback(async (id: string): Promise<Quote> => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();

      const response = await api.post(`/quotes/${id}/approve`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Cotización aprobada exitosamente', 'success');
        await fetchQuotes();
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al aprobar cotización');
    } catch (error: any) {
      console.error('Error al aprobar cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al aprobar cotización';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * Rechazar una cotización
   */
  const rejectQuote = useCallback(async (id: string, motivoRechazo?: string): Promise<Quote> => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();

      const response = await api.post(`/quotes/${id}/reject`, { motivoRechazo }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Cotización rechazada', 'info');
        await fetchQuotes();
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al rechazar cotización');
    } catch (error: any) {
      console.error('Error al rechazar cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al rechazar cotización';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * Convertir cotización a venta
   */
  const convertToSale = useCallback(async (data: ConvertToSaleInput): Promise<any> => {
    try {
      setLoading(true);
      const token = tokenUtils.getAccessToken();

      const response = await api.post(`/quotes/${data.quoteId}/convert-to-sale`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        showNotification('Cotización convertida a venta exitosamente', 'success');
        await fetchQuotes();
        return response.data.data;
      }

      throw new Error(response.data.message || 'Error al convertir cotización');
    } catch (error: any) {
      console.error('Error al convertir cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al convertir cotización a venta';
      showNotification(errorMessage, 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * Establecer filtros sin aplicar
   */
  const setFilters = useCallback((newFilters: QuoteFilters) => {
    setFiltersState(newFilters);
  }, []);

  /**
   * Aplicar filtros y recargar
   */
  const applyFilters = useCallback((newFilters: QuoteFilters) => {
    setFiltersState(newFilters);
    // fetchQuotes se ejecutará automáticamente cuando cambien los filtros
  }, []);

  const value: QuotesContextType = {
    quotes,
    loading,
    filters,
    stats,
    fetchQuotes,
    createQuote,
    getQuoteById,
    updateQuote,
    deleteQuote,
    approveQuote,
    rejectQuote,
    convertToSale,
    setFilters,
    applyFilters
  };

  return <QuotesContext.Provider value={value}>{children}</QuotesContext.Provider>;
};

export const useQuotes = (): QuotesContextType => {
  const context = useContext(QuotesContext);
  if (!context) {
    throw new Error('useQuotes debe ser usado dentro de un QuotesProvider');
  }
  return context;
};
