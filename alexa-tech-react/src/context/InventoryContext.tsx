import React, { createContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { 
  StockItem, 
  MovimientoKardex, 
  PaginationData, 
  StockFilters, 
  KardexFilters, 
  AjusteData,
  StockStats
} from '../types/inventario';
import { inventarioApi } from '../services/inventarioApi';
import { useAuth } from './AuthContext';

export interface InventoryContextType {
  // Estado
  stockItems: StockItem[];
  movimientos: MovimientoKardex[];
  alertas: {
    stockBajo: StockItem[];
    stockCritico: StockItem[];
  };
  loading: boolean;
  error: string | null;
  pagination: {
    stock: PaginationData | null;
    kardex: PaginationData | null;
  };
  canUpdateInventory: boolean;

  // Funciones
  fetchStock: (filters?: StockFilters) => Promise<void>;
  fetchKardex: (filters: KardexFilters) => Promise<void>;
  crearAjuste: (data: AjusteData) => Promise<void>;
  fetchAlertas: () => Promise<void>;
  clearError: () => void;
  getStockStats: () => StockStats;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const { hasPermission, isAuthenticated, user } = useAuth();
  
  // Estado
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoKardex[]>([]);
  const [alertas, setAlertas] = useState<{
    stockBajo: StockItem[];
    stockCritico: StockItem[];
  }>({
    stockBajo: [],
    stockCritico: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    stock: PaginationData | null;
    kardex: PaginationData | null;
  }>({
    stock: null,
    kardex: null
  });

  // Permisos
  const canUpdateInventory = hasPermission('inventory.update');

  // Función para verificar autenticación antes de hacer llamadas
  const checkAuthentication = (): boolean => {
    if (!isAuthenticated || !user) {
      setError('Debes iniciar sesión para acceder al inventario');
      return false;
    }
    
    if (!hasPermission('inventory.read')) {
      setError('No tienes permisos para acceder al inventario');
      return false;
    }
    
    return true;
  };

  // Función para obtener stock
  const fetchStock = useCallback(async (filters: StockFilters = {}) => {
    if (!checkAuthentication()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [InventoryContext] Fetching stock with filters:', filters);
      console.log('🔍 [InventoryContext] User authenticated:', isAuthenticated);
      console.log('🔍 [InventoryContext] User permissions:', user?.role?.permissions);
      
      const response = await inventarioApi.getStock(filters);
      console.log('✅ [InventoryContext] getStock response:', response);
      console.log('✅ [InventoryContext] Response data type:', typeof response.data);
      console.log('✅ [InventoryContext] Response data length:', Array.isArray(response.data) ? response.data.length : 'Not array');
      
      setStockItems(Array.isArray(response.data) ? response.data : []);
      setPagination(prev => ({
        ...prev,
        stock: response.pagination
      }));
      
      console.log('✅ [InventoryContext] Stock items set:', Array.isArray(response.data) ? response.data.length : 0, 'items');
    } catch (error: any) {
      console.error('❌ [InventoryContext] Error fetching stock:', error);
      console.error('❌ [InventoryContext] Error message:', error?.message);
      console.error('❌ [InventoryContext] Error response:', error?.response?.data);
      
      // Manejar errores específicos de autenticación
      if (error?.message?.includes('Token de acceso requerido') || 
          error?.message?.includes('401') ||
          error?.message?.includes('Unauthorized')) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Limpiar tokens y redirigir
        localStorage.removeItem('authToken');
        localStorage.removeItem('alexatech_token');
        localStorage.removeItem('alexatech_refresh_token');
        window.location.href = '/login';
      } else {
        setError(error?.message || 'Error al cargar el stock');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, hasPermission]);

  // Función para obtener kardex
  const fetchKardex = useCallback(async (filters: KardexFilters) => {
    if (!checkAuthentication()) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 [InventoryContext] Fetching kardex with filters:', filters);
      console.log('🔍 [InventoryContext] User authenticated:', isAuthenticated);
      console.log('🔍 [InventoryContext] User permissions:', user?.role?.permissions);
      
      const response = await inventarioApi.getKardex(filters);
      console.log('✅ [InventoryContext] getKardex response:', response);
      console.log('✅ [InventoryContext] Response data type:', typeof response.data);
      console.log('✅ [InventoryContext] Response data length:', Array.isArray(response.data) ? response.data.length : 'Not array');
      
      setMovimientos(Array.isArray(response.data) ? response.data : []);
      setPagination(prev => ({
        ...prev,
        kardex: response.pagination
      }));
      
      console.log('✅ [InventoryContext] Kardex movements set:', Array.isArray(response.data) ? response.data.length : 0, 'items');
    } catch (error: any) {
      console.error('❌ [InventoryContext] Error fetching kardex:', error);
      console.error('❌ [InventoryContext] Error message:', error?.message);
      console.error('❌ [InventoryContext] Error response:', error?.response?.data);
      
      // Manejar errores específicos de autenticación
      if (error?.message?.includes('Token de acceso requerido') || 
          error?.message?.includes('401') ||
          error?.message?.includes('Unauthorized')) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // Limpiar tokens y redirigir
        localStorage.removeItem('authToken');
        localStorage.removeItem('alexatech_token');
        localStorage.removeItem('alexatech_refresh_token');
        window.location.href = '/login';
      } else {
        setError(error?.message || 'Error al cargar el kardex');
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, hasPermission]);

  // Función para crear ajuste
  const crearAjuste = useCallback(async (data: AjusteData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventarioApi.createAjuste(data);
      
      // Mostrar notificación de éxito
      if (window.showToast) {
        window.showToast(response.message || 'Ajuste creado exitosamente', 'success');
      }
      
      // Refrescar datos
      await Promise.all([
        fetchStock(), // Refrescar stock
        fetchKardex({ warehouseId: data.warehouseId }) // Refrescar kardex del almacén
      ]);
      
    } catch (error: any) {
      console.error('Error creating adjustment:', error);
      const errorMessage = error?.message || 'Error al crear el ajuste';
      setError(errorMessage);
      
      // Mostrar notificación de error
      if (window.showToast) {
        window.showToast(errorMessage, 'error');
      }
      
      throw error; // Re-lanzar para que el componente pueda manejarlo
    } finally {
      setLoading(false);
    }
  }, [fetchStock, fetchKardex]);

  // Función para obtener alertas
  const fetchAlertas = useCallback(async () => {
    try {
      const response = await inventarioApi.getAlertas();
      setAlertas(response);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      // No establecer error global para alertas, ya que es información secundaria
    }
  }, []);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Función para calcular estadísticas de stock
  const getStockStats = useCallback((): StockStats => {
    const items = Array.isArray(stockItems) ? stockItems : [];
    const totalProductos = items.length;
    const stockBajo = items.filter(item => item.estado === 'BAJO').length;
    const stockCritico = items.filter(item => item.estado === 'CRITICO').length;
    
    return {
      totalProductos,
      stockBajo,
      stockCritico
    };
  }, [stockItems]);

  const value: InventoryContextType = {
    // Estado
    stockItems,
    movimientos,
    alertas,
    loading,
    error,
    pagination,
    canUpdateInventory,

    // Funciones
    fetchStock,
    fetchKardex,
    crearAjuste,
    fetchAlertas,
    clearError,
    getStockStats
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

export default InventoryContext;

declare global {
  interface Window {
    showToast?: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  }
}