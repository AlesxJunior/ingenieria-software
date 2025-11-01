import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { InventoryProvider } from '../context/InventoryContext';
import InventoryContext from '../context/InventoryContext';
import type { ReactNode } from 'react';
import React from 'react';
import * as inventarioApiModule from '../services/inventarioApi';

// Mock del AuthContext
const mockHasPermission = vi.fn();
const mockUser = {
  id: 'user-1',
  username: 'testuser',
  email: 'test@test.com',
  permissions: ['inventory.read', 'inventory.update'],
};

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: () => ({
    hasPermission: mockHasPermission,
    isAuthenticated: true,
    user: mockUser,
  }),
}));

// Mock de la API de inventario
vi.mock('../services/inventarioApi', () => ({
  inventarioApi: {
    getStock: vi.fn(),
    getKardex: vi.fn(),
    createAjuste: vi.fn(),
    getAlertas: vi.fn(),
  },
}));

// Helper para acceder al contexto
const useInventoryContext = () => {
  const context = React.useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};

// Wrapper component
const createWrapper = () => {
  return ({ children }: { children: ReactNode }) => (
    <InventoryProvider>{children}</InventoryProvider>
  );
};

describe('InventoryContext', () => {
  const { inventarioApi } = inventarioApiModule;

  beforeEach(() => {
    vi.clearAllMocks();
    mockHasPermission.mockReturnValue(true);
    window.showToast = vi.fn();
  });

  describe('Estado inicial', () => {
    it('debe iniciar con arrays vacíos y loading false', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      expect(result.current.stockItems).toEqual([]);
      expect(result.current.movimientos).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.alertas.stockBajo).toEqual([]);
      expect(result.current.alertas.stockCritico).toEqual([]);
    });

    it('debe iniciar con paginación en null', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      expect(result.current.pagination.stock).toBeNull();
      expect(result.current.pagination.kardex).toBeNull();
    });

    it('debe calcular canUpdateInventory basado en permisos', () => {
      mockHasPermission.mockImplementation((permission: string) => 
        permission === 'inventory.update'
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      expect(result.current.canUpdateInventory).toBe(true);
    });
  });

  describe('fetchStock', () => {
    it('debe cargar stock exitosamente', async () => {
      const mockResponse: any = {
        data: [{
          stockByWarehouseId: 'stock-1',
          productId: 'prod-1',
          codigo: 'P001',
          nombre: 'Producto 1',
          almacen: 'Almacén Principal',
          warehouseId: 'wh-1',
          cantidad: 100,
          stockMinimo: 10,
          estado: 'NORMAL',
          updatedAt: '2025-01-01',
        }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      vi.mocked(inventarioApi.getStock).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchStock();
      });

      await waitFor(() => {
        expect(result.current.stockItems).toHaveLength(1);
      });

      expect(result.current.stockItems[0].codigo).toBe('P001');
      expect(result.current.pagination.stock).toEqual(mockResponse.pagination);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('debe cargar stock con filtros', async () => {
      const mockResponse: any = {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      vi.mocked(inventarioApi.getStock).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      const filters = {
        almacenId: 'wh-1',
        q: 'producto',
        estado: 'BAJO' as const,
      };

      await act(async () => {
        await result.current.fetchStock(filters);
      });

      expect(inventarioApi.getStock).toHaveBeenCalledWith(filters);
    });

    it('debe manejar error al cargar stock', async () => {
      vi.mocked(inventarioApi.getStock).mockRejectedValue(
        new Error('Error de red')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchStock();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Error de red');
      });

      expect(result.current.stockItems).toEqual([]);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('fetchKardex', () => {
    it('debe cargar movimientos kardex exitosamente', async () => {
      const mockResponse: any = {
        data: [{
          id: 'mov-1',
          productId: 'prod-1',
          codigo: 'P001',
          nombre: 'Producto 1',
          almacen: 'Almacén Principal',
          tipo: 'ENTRADA',
          cantidad: 50,
          stockAntes: 100,
          stockDespues: 150,
          motivo: 'COMPRA',
          fecha: '2025-01-01',
          usuario: 'test@test.com',
        }],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          pages: 1,
        },
      };

      vi.mocked(inventarioApi.getKardex).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      const filters = { warehouseId: 'wh-1' };

      await act(async () => {
        await result.current.fetchKardex(filters);
      });

      await waitFor(() => {
        expect(result.current.movimientos).toHaveLength(1);
      });

      expect(result.current.movimientos[0].id).toBe('mov-1');
      expect(result.current.pagination.kardex).toEqual(mockResponse.pagination);
      expect(result.current.loading).toBe(false);
    });

    it('debe manejar error al cargar kardex', async () => {
      vi.mocked(inventarioApi.getKardex).mockRejectedValue(
        new Error('Error al cargar kardex')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchKardex({ warehouseId: 'wh-1' });
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Error al cargar kardex');
      });
    });
  });

  describe('crearAjuste', () => {
    it('debe crear ajuste exitosamente', async () => {
      const mockResponse: any = {
        success: true,
        message: 'Ajuste creado exitosamente',
      };

      const mockStockResponse: any = {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 1 },
      };

      const mockKardexResponse: any = {
        data: [],
        pagination: { total: 0, page: 1, limit: 10, pages: 1 },
      };

      vi.mocked(inventarioApi.createAjuste).mockResolvedValue(mockResponse);
      vi.mocked(inventarioApi.getStock).mockResolvedValue(mockStockResponse);
      vi.mocked(inventarioApi.getKardex).mockResolvedValue(mockKardexResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      const ajusteData: any = {
        warehouseId: 'wh-1',
        productId: 'prod-1',
        cantidadAjuste: 10,
        reasonId: 'reason-1',
        observaciones: 'Ajuste de prueba',
      };

      await act(async () => {
        await result.current.crearAjuste(ajusteData);
      });

      expect(inventarioApi.createAjuste).toHaveBeenCalledWith(ajusteData);
      expect(window.showToast).toHaveBeenCalledWith('Ajuste creado exitosamente', 'success');
      expect(inventarioApi.getStock).toHaveBeenCalled();
      expect(inventarioApi.getKardex).toHaveBeenCalledWith({ warehouseId: 'wh-1' });
    });

    it('debe manejar error al crear ajuste', async () => {
      vi.mocked(inventarioApi.createAjuste).mockRejectedValue(
        new Error('Error al crear ajuste')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      const ajusteData: any = {
        warehouseId: 'wh-1',
        productId: 'prod-1',
        cantidadAjuste: 10,
      };

      try {
        await act(async () => {
          await result.current.crearAjuste(ajusteData);
        });
      } catch (error) {
        // Error esperado - se lanza desde el context
      }

      // Verificar que se llamó a showToast con el error
      expect(window.showToast).toHaveBeenCalledWith('Error al crear ajuste', 'error');
    });
  });

  describe('fetchAlertas', () => {
    it('debe cargar alertas exitosamente', async () => {
      const mockAlertas: any = {
        stockBajo: [{
          stockByWarehouseId: 'stock-1',
          productId: 'prod-1',
          codigo: 'P001',
          nombre: 'Producto 1',
          almacen: 'Almacén 1',
          warehouseId: 'wh-1',
          cantidad: 5,
          stockMinimo: 10,
          estado: 'BAJO',
          updatedAt: '2025-01-01',
        }],
        stockCritico: [{
          stockByWarehouseId: 'stock-2',
          productId: 'prod-2',
          codigo: 'P002',
          nombre: 'Producto 2',
          almacen: 'Almacén 1',
          warehouseId: 'wh-1',
          cantidad: 1,
          stockMinimo: 10,
          estado: 'CRITICO',
          updatedAt: '2025-01-01',
        }],
      };

      vi.mocked(inventarioApi.getAlertas).mockResolvedValue(mockAlertas);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchAlertas();
      });

      expect(result.current.alertas.stockBajo).toHaveLength(1);
      expect(result.current.alertas.stockCritico).toHaveLength(1);
    });

    it('debe manejar error al cargar alertas sin afectar el estado de error global', async () => {
      vi.mocked(inventarioApi.getAlertas).mockRejectedValue(
        new Error('Error al cargar alertas')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchAlertas();
      });

      // No debe establecer error global
      expect(result.current.error).toBeNull();
    });
  });

  describe('clearError', () => {
    it('debe limpiar el error', async () => {
      vi.mocked(inventarioApi.getStock).mockRejectedValue(
        new Error('Test error')
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchStock();
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('getStockStats', () => {
    it('debe calcular estadísticas de stock correctamente', async () => {
      const mockResponse: any = {
        data: [
          {
            stockByWarehouseId: 'stock-1',
            productId: 'prod-1',
            codigo: 'P001',
            nombre: 'Producto 1',
            almacen: 'Almacén 1',
            warehouseId: 'wh-1',
            cantidad: 100,
            stockMinimo: 10,
            estado: 'NORMAL',
            updatedAt: '2025-01-01',
          },
          {
            stockByWarehouseId: 'stock-2',
            productId: 'prod-2',
            codigo: 'P002',
            nombre: 'Producto 2',
            almacen: 'Almacén 1',
            warehouseId: 'wh-1',
            cantidad: 5,
            stockMinimo: 10,
            estado: 'BAJO',
            updatedAt: '2025-01-01',
          },
          {
            stockByWarehouseId: 'stock-3',
            productId: 'prod-3',
            codigo: 'P003',
            nombre: 'Producto 3',
            almacen: 'Almacén 1',
            warehouseId: 'wh-1',
            cantidad: 1,
            stockMinimo: 10,
            estado: 'CRITICO',
            updatedAt: '2025-01-01',
          },
        ],
        pagination: { total: 3, page: 1, limit: 10, pages: 1 },
      };

      vi.mocked(inventarioApi.getStock).mockResolvedValue(mockResponse);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchStock();
      });

      await waitFor(() => {
        expect(result.current.stockItems).toHaveLength(3);
      });

      const stats = result.current.getStockStats();

      expect(stats.totalProductos).toBe(3);
      expect(stats.stockBajo).toBe(1);
      expect(stats.stockCritico).toBe(1);
    });

    it('debe retornar ceros si no hay stock', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      const stats = result.current.getStockStats();

      expect(stats.totalProductos).toBe(0);
      expect(stats.stockBajo).toBe(0);
      expect(stats.stockCritico).toBe(0);
    });
  });

  describe('Permisos', () => {
    it('debe denegar acceso si no tiene permiso inventory.read', async () => {
      mockHasPermission.mockReturnValue(false);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      await act(async () => {
        await result.current.fetchStock();
      });

      expect(result.current.error).toBe('No tienes permisos para acceder al inventario');
      expect(inventarioApi.getStock).not.toHaveBeenCalled();
    });

    it('canUpdateInventory debe ser false si no tiene permiso', () => {
      mockHasPermission.mockImplementation((permission: string) =>
        permission !== 'inventory.update'
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => useInventoryContext(), { wrapper });

      expect(result.current.canUpdateInventory).toBe(false);
    });
  });
});
