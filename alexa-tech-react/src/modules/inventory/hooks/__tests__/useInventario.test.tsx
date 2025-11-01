import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInventario, useInventarioWithDebounce } from '../useInventario';
import InventoryContext from '../../context/InventoryContext';
import type { InventoryContextType } from '../../context/InventoryContext';
import type { ReactNode } from 'react';

// Mock del contexto de inventario
const mockFetchStock = vi.fn();
const mockFetchKardex = vi.fn();

const mockInventoryContextValue: InventoryContextType = {
  stockItems: [],
  movimientos: [],
  alertas: { stockBajo: [], stockCritico: [] },
  loading: false,
  error: null,
  pagination: {
    stock: null,
    kardex: null
  },
  fetchStock: mockFetchStock,
  fetchKardex: mockFetchKardex,
  crearAjuste: vi.fn(),
  fetchAlertas: vi.fn(),
  clearError: vi.fn(),
  canUpdateInventory: true,
  getStockStats: vi.fn()
};

// Wrapper del provider
const createWrapper = (value: InventoryContextType = mockInventoryContextValue) => {
  return ({ children }: { children: ReactNode }) => (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

describe('useInventario', () => {
  it('debe retornar el contexto cuando se usa dentro del provider', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useInventario(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.stockItems).toEqual([]);
    expect(result.current.fetchStock).toBeDefined();
  });

  it('debe lanzar error cuando se usa fuera del provider', () => {
    // Suprimir console.error para este test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useInventario());
    }).toThrow('useInventario must be used within an InventoryProvider');

    consoleSpy.mockRestore();
  });
});

describe('useInventarioWithDebounce', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('debouncedFetchStock', () => {
    it('debe hacer debounce de las llamadas a fetchStock', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      // Llamar múltiples veces rápidamente
      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-1' });
        result.current.debouncedFetchStock({ almacenId: 'wh-2' });
        result.current.debouncedFetchStock({ almacenId: 'wh-3' });
      });

      // No debe haber llamado todavía
      expect(mockFetchStock).not.toHaveBeenCalled();

      // Avanzar el tiempo (delay por defecto es 500ms)
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Solo debe llamar una vez con el último valor
      expect(mockFetchStock).toHaveBeenCalledTimes(1);
      expect(mockFetchStock).toHaveBeenCalledWith({ almacenId: 'wh-3' });
    });

    it('debe respetar el delay personalizado', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchStock({ q: 'producto' }, 1000);
      });

      // No debe llamar antes del delay
      act(() => {
        vi.advanceTimersByTime(999);
      });
      expect(mockFetchStock).not.toHaveBeenCalled();

      // Debe llamar después del delay
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockFetchStock).toHaveBeenCalledTimes(1);
      expect(mockFetchStock).toHaveBeenCalledWith({ q: 'producto' });
    });

    it('debe cancelar el timeout anterior si se llama nuevamente', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      // Primera llamada
      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-1' });
      });

      // Avanzar 300ms (no completa el timeout de 500ms)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Segunda llamada antes de que termine el timeout
      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-2' });
      });

      // Avanzar otros 300ms (total 600ms desde la primera llamada)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // No debe haber llamado todavía porque el segundo timeout reinició
      expect(mockFetchStock).not.toHaveBeenCalled();

      // Avanzar los 200ms restantes para completar el segundo timeout
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Solo debe llamar una vez con el valor de la segunda llamada
      expect(mockFetchStock).toHaveBeenCalledTimes(1);
      expect(mockFetchStock).toHaveBeenCalledWith({ almacenId: 'wh-2' });
    });
  });

  describe('debouncedFetchKardex', () => {
    it('debe hacer debounce de las llamadas a fetchKardex', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchKardex({ warehouseId: 'wh-1' });
        result.current.debouncedFetchKardex({ warehouseId: 'wh-2' });
      });

      expect(mockFetchKardex).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockFetchKardex).toHaveBeenCalledTimes(1);
      expect(mockFetchKardex).toHaveBeenCalledWith({ warehouseId: 'wh-2' });
    });

    it('debe respetar el delay personalizado', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchKardex({ warehouseId: 'wh-1', tipoMovimiento: 'ENTRADA' }, 800);
      });

      act(() => {
        vi.advanceTimersByTime(799);
      });
      expect(mockFetchKardex).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(mockFetchKardex).toHaveBeenCalledTimes(1);
    });

    it('debe mantener debounces independientes para stock y kardex', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      // Llamar a ambos
      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-1' });
        result.current.debouncedFetchKardex({ warehouseId: 'wh-1' });
      });

      // Avanzar el tiempo
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Ambos deben haber sido llamados
      expect(mockFetchStock).toHaveBeenCalledTimes(1);
      expect(mockFetchKardex).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearDebounces', () => {
    it('debe limpiar el timeout de stock pendiente', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-1' });
      });

      // Limpiar antes de que se ejecute
      act(() => {
        result.current.clearDebounces();
      });

      // Avanzar el tiempo
      act(() => {
        vi.advanceTimersByTime(500);
      });

      // No debe haber llamado porque se limpió
      expect(mockFetchStock).not.toHaveBeenCalled();
    });

    it('debe limpiar el timeout de kardex pendiente', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchKardex({ warehouseId: 'wh-1' });
      });

      act(() => {
        result.current.clearDebounces();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockFetchKardex).not.toHaveBeenCalled();
    });

    it('debe limpiar ambos timeouts simultáneamente', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-1' });
        result.current.debouncedFetchKardex({ warehouseId: 'wh-1' });
      });

      act(() => {
        result.current.clearDebounces();
      });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockFetchStock).not.toHaveBeenCalled();
      expect(mockFetchKardex).not.toHaveBeenCalled();
    });

    it('debe ser seguro llamar clearDebounces sin timeouts activos', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      // No debe lanzar error
      expect(() => {
        act(() => {
          result.current.clearDebounces();
        });
      }).not.toThrow();
    });

    it('debe ser seguro llamar clearDebounces múltiples veces', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.debouncedFetchStock({ almacenId: 'wh-1' });
      });

      // Llamar múltiples veces
      expect(() => {
        act(() => {
          result.current.clearDebounces();
          result.current.clearDebounces();
          result.current.clearDebounces();
        });
      }).not.toThrow();

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(mockFetchStock).not.toHaveBeenCalled();
    });
  });

  describe('integración con contexto', () => {
    it('debe retornar todas las propiedades del contexto', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      // Verificar que tiene todas las propiedades del contexto base
      expect(result.current.stockItems).toEqual([]);
      expect(result.current.movimientos).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();

      // Verificar que tiene las funciones adicionales
      expect(typeof result.current.debouncedFetchStock).toBe('function');
      expect(typeof result.current.debouncedFetchKardex).toBe('function');
      expect(typeof result.current.clearDebounces).toBe('function');
    });

    it('debe poder llamar funciones del contexto base', () => {
      const mockClearError = vi.fn();
      const customContext = { ...mockInventoryContextValue, clearError: mockClearError };
      const wrapper = createWrapper(customContext);
      const { result } = renderHook(() => useInventarioWithDebounce(), { wrapper });

      act(() => {
        result.current.clearError();
      });

      expect(mockClearError).toHaveBeenCalledTimes(1);
    });
  });
});
