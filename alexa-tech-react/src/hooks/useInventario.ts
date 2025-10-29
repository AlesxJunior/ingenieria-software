import { useContext, useCallback, useRef } from 'react';
import InventoryContext from '../context/InventoryContext';
import type { InventoryContextType } from '../context/InventoryContext';
import type { StockFilters, KardexFilters } from '../types/inventario';

// Hook personalizado para usar el contexto de inventario
export const useInventario = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventario must be used within an InventoryProvider');
  }
  return context;
};

// Hook con funcionalidades adicionales como debouncing
export const useInventarioWithDebounce = () => {
  const inventario = useInventario();
  const stockDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kardexDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Función de búsqueda de stock con debounce
  const debouncedFetchStock = useCallback((filters: StockFilters, delay: number = 500) => {
    if (stockDebounceRef.current) {
      clearTimeout(stockDebounceRef.current);
    }

    stockDebounceRef.current = setTimeout(() => {
      inventario.fetchStock(filters);
    }, delay);
  }, [inventario]);

  // Función de búsqueda de kardex con debounce
  const debouncedFetchKardex = useCallback((filters: KardexFilters, delay: number = 500) => {
    if (kardexDebounceRef.current) {
      clearTimeout(kardexDebounceRef.current);
    }

    kardexDebounceRef.current = setTimeout(() => {
      inventario.fetchKardex(filters);
    }, delay);
  }, [inventario]);

  // Limpiar timeouts al desmontar
  const clearDebounces = useCallback(() => {
    if (stockDebounceRef.current) {
      clearTimeout(stockDebounceRef.current);
      stockDebounceRef.current = null;
    }
    if (kardexDebounceRef.current) {
      clearTimeout(kardexDebounceRef.current);
      kardexDebounceRef.current = null;
    }
  }, []);

  return {
    ...inventario,
    debouncedFetchStock,
    debouncedFetchKardex,
    clearDebounces
  };
};

export default useInventario;