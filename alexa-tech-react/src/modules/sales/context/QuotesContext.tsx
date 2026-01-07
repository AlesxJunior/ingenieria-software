import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { tokenUtils } from '../../../utils/api';
import { useNotification } from '../../../context/NotificationContext';

const API_URL = 'http://localhost:3001/api';

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
  updateQuoteStatus: (id: string, estado: QuoteStatus, motivoRechazo?: string) => Promise<Quote>; // ✅ Nuevo
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

  // Helper function para hacer fetch con autenticación
  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const token = tokenUtils.getAccessToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.json();
  };

  /**
   * Obtener todas las cotizaciones con filtros
   */
  const fetchQuotes = useCallback(async () => {
    try {
      setLoading(true);
      
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

      const response = await fetchAPI(`/quotes?${params.toString()}`, {
        method: 'GET'
      });

      // Backend devuelve: { success: true, data: [...] }
      if (response.success) {
        setQuotes(response.data || []);
        
        // Calcular estadísticas
        const data = response.data || [];
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
      showNotification('error', 'Error', 'No se pudieron cargar las cotizaciones');
      // Establecer arrays vacíos en caso de error para evitar bucles
      setQuotes([]);
      setStats({
        totalQuotes: 0,
        pendientes: 0,
        aceptadas: 0,
        convertidas: 0,
        rechazadas: 0,
        vencidas: 0,
        canceladas: 0
      });
    } finally {
      setLoading(false);
    }
  }, [showNotification]); // ❗ SOLO showNotification como dependencia

  /**
   * Crear una nueva cotización
   */
  const createQuote = useCallback(async (data: CreateQuoteInput): Promise<Quote> => {
    try {
      setLoading(true);

      const response = await fetchAPI('/quotes', {
        method: 'POST',
        body: JSON.stringify(data)
      });

      // Si llegamos aquí, la respuesta fue exitosa (status 200-299)
      showNotification('success', 'Éxito', 'Cotización creada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('Error al crear cotización:', error);
      const errorMessage = error.message || 'Error al crear cotización';
      showNotification('error', 'Error', errorMessage);
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
      const response = await fetchAPI(`/quotes/${id}`, {
        method: 'GET'
      });

      if (response.success) {
        return response.data;
      }

      throw new Error(response.data.message || 'Error al obtener cotización');
    } catch (error: any) {
      console.error('Error al obtener cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al obtener cotización';
      showNotification('error', 'Error', errorMessage);
      throw error;
    }
  }, [showNotification]);

  /**
   * Actualizar una cotización
   */
  const updateQuote = useCallback(async (id: string, data: Partial<Quote>): Promise<Quote> => {
    try {
      setLoading(true);

      const response = await fetchAPI(`/quotes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      if (response.success) {
        showNotification('success', 'Éxito', 'Cotización actualizada exitosamente');
        // ✅ Actualizar el estado local en lugar de recargar
        setQuotes(quotes.map(q => q.id === id ? { ...q, ...data } : q));
        return response.data;
      }

      throw new Error(response.data.message || 'Error al actualizar cotización');
    } catch (error: any) {
      console.error('Error al actualizar cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al actualizar cotización';
      showNotification('error', 'Error', errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchQuotes, showNotification]);

  /**
   * ✅ Actualizar estado de una cotización (Convertida, Aceptada, etc.)
   */
  const updateQuoteStatus = useCallback(async (id: string, estado: QuoteStatus, motivoRechazo?: string): Promise<Quote> => {
    try {
      setLoading(true);

      const response = await fetchAPI(`/quotes/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado, motivoRechazo })
      });

      if (response.success || response.quote) {
        const updatedQuote = response.quote || response.data;
        
        // No mostrar notificación si se llama desde conversión automática
        if (estado !== 'Convertida') {
          showNotification('success', 'Éxito', `Cotización ${estado.toLowerCase()} exitosamente`);
        }
        
        // ✅ Actualizar el estado local
        setQuotes(prevQuotes => prevQuotes.map(q => q.id === id ? { ...q, estado } : q));
        
        return updatedQuote;
      }

      throw new Error(response.message || 'Error al actualizar estado');
    } catch (error: any) {
      console.error('Error al actualizar estado de cotización:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar estado';
      
      // Solo mostrar error si no es conversión automática
      if (estado !== 'Convertida') {
        showNotification('error', 'Error', errorMessage);
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  /**
   * Eliminar una cotización
   */
  const deleteQuote = useCallback(async (id: string): Promise<void> => {
    try {
      setLoading(true);

      const response = await fetchAPI(`/quotes/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        showNotification('success', 'Éxito', 'Cotización eliminada exitosamente');
        // ✅ Eliminar del estado local
        setQuotes(quotes.filter(q => q.id !== id));
      } else {
        throw new Error(response.data.message || 'Error al eliminar cotización');
      }
    } catch (error: any) {
      console.error('Error al eliminar cotización:', error);
      const errorMessage = error.response?.data?.message || 'No se puede eliminar una cotización convertida a venta';
      showNotification('error', 'Error', errorMessage);
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

      const response = await fetchAPI(`/quotes/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({})
      });

      if (response.success) {
        showNotification('success', 'Éxito', 'Cotización aprobada exitosamente');
        // ✅ Actualizar el estado local
        setQuotes(quotes.map(q => q.id === id ? { ...q, estado: 'Aceptada' as QuoteStatus } : q));
        return response.data;
      }

      throw new Error(response.data.message || 'Error al aprobar cotización');
    } catch (error: any) {
      console.error('Error al aprobar cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al aprobar cotización';
      showNotification('error', 'Error', errorMessage);
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

      const response = await fetchAPI(`/quotes/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ motivoRechazo })
      });

      if (response.success) {
        showNotification('info', 'Información', 'Cotización rechazada');
        // ✅ Actualizar el estado local
        setQuotes(quotes.map(q => q.id === id ? { ...q, estado: 'Rechazada' as QuoteStatus, motivoRechazo: motivoRechazo || null } : q));
        return response.data;
      }

      throw new Error(response.data.message || 'Error al rechazar cotización');
    } catch (error: any) {
      console.error('Error al rechazar cotización:', error);
      const errorMessage = error.response?.data?.message || 'Error al rechazar cotización';
      showNotification('error', 'Error', errorMessage);
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

      const response = await fetchAPI(`/quotes/${data.quoteId}/convert`, {
        method: 'POST',
        body: JSON.stringify(data)
      });

      // ✅ Actualizar el estado local
      await fetchQuotes();
      showNotification('success', 'Éxito', 'Cotización convertida a venta exitosamente');
      return response;
    } catch (error: any) {
      console.error('Error al convertir cotización:', error);
      const errorMessage = error?.message || 'Error al convertir cotización a venta';
      showNotification('error', 'Error', errorMessage);
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
    // ✅ Llamar directamente a fetchQuotes sin dependencias
    setTimeout(() => {
      fetchQuotes();
    }, 0);
  }, []); // ⚠️ Sin dependencias - fetchQuotes es estable

  const value: QuotesContextType = {
    quotes,
    loading,
    filters,
    stats,
    fetchQuotes,
    createQuote,
    getQuoteById,
    updateQuote,
    updateQuoteStatus, // ✅ Agregar nueva función
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
