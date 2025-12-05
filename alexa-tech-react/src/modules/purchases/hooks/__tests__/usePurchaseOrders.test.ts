/**
 * Integration Tests - usePurchaseOrders Hook
 * Tests de integración para hook de Órdenes de Compra
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePurchaseOrders } from '../usePurchaseOrders';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import type { PurchaseOrder, FilterPurchaseOrderDto } from '../../types/purchases.types';

// Mock del servicio
vi.mock('../../services/purchaseOrderService');

describe('usePurchaseOrders', () => {
  const mockPurchaseOrders: PurchaseOrder[] = [
    {
      id: 'po-1',
      codigo: 'OC-2025-001',
      fecha: '2025-12-01T00:00:00.000Z',
      proveedorId: 'prov-1',
      almacenDestinoId: 'alm-1',
      estado: 'PENDIENTE',
      subtotal: 100,
      descuento: 0,
      impuestos: 18,
      total: 118,
      creadoPorId: 'user-1',
      items: [],
      createdAt: '2025-12-01T00:00:00.000Z',
      updatedAt: '2025-12-01T00:00:00.000Z',
    },
    {
      id: 'po-2',
      codigo: 'OC-2025-002',
      fecha: '2025-12-02T00:00:00.000Z',
      proveedorId: 'prov-2',
      almacenDestinoId: 'alm-1',
      estado: 'ENVIADA',
      subtotal: 200,
      descuento: 10,
      impuestos: 36,
      total: 226,
      creadoPorId: 'user-1',
      items: [],
      createdAt: '2025-12-02T00:00:00.000Z',
      updatedAt: '2025-12-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== FETCH ORDERS ====================

  describe('fetchOrders', () => {
    it('debe cargar órdenes de compra exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: mockPurchaseOrders,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseOrderService.getPurchaseOrders).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseOrders());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.orders).toEqual(mockPurchaseOrders);
      expect(result.current.pagination.total).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar errores al cargar órdenes', async () => {
      const errorMessage = 'Error de red';
      vi.mocked(purchaseOrderService.getPurchaseOrders).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.orders).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('debe aplicar filtros correctamente', async () => {
      const filters: FilterPurchaseOrderDto = {
        estado: 'ENVIADA',
        proveedorId: 'prov-2',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        success: true,
        data: [mockPurchaseOrders[1]],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseOrderService.getPurchaseOrders).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseOrders(filters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.orders).toHaveLength(1);
      expect(result.current.orders[0].estado).toBe('ENVIADA');
      expect(purchaseOrderService.getPurchaseOrders).toHaveBeenCalledWith(filters);
    });
  });

  // ==================== CREATE ORDER ====================

  describe('createOrder', () => {
    it('debe crear una nueva orden exitosamente', async () => {
      const newOrderData = {
        proveedorId: 'prov-1',
        almacenDestinoId: 'alm-1',
        fecha: '2025-12-03',
        items: [
          {
            productoId: 'prod-1',
            cantidad: 10,
            precioUnitario: 20,
          },
        ],
      };

      const createdOrder: PurchaseOrder = {
        id: 'po-3',
        codigo: 'OC-2025-003',
        fecha: '2025-12-03T00:00:00.000Z',
        proveedorId: newOrderData.proveedorId,
        almacenDestinoId: newOrderData.almacenDestinoId,
        estado: 'PENDIENTE',
        subtotal: 200,
        descuento: 0,
        impuestos: 36,
        total: 236,
        creadoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-03T00:00:00.000Z',
        updatedAt: '2025-12-03T00:00:00.000Z',
      };

      vi.mocked(purchaseOrderService.createPurchaseOrder).mockResolvedValue({
        success: true,
        data: createdOrder,
        message: 'Orden creada',
      });

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newOrder = await result.current.createOrder(newOrderData);

      expect(newOrder).toEqual(createdOrder);
      expect(purchaseOrderService.createPurchaseOrder).toHaveBeenCalledWith(newOrderData);
    });

    it('debe manejar errores al crear orden', async () => {
      const errorMessage = 'Datos inválidos';
      vi.mocked(purchaseOrderService.createPurchaseOrder).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invalidData = {} as any;

      await expect(result.current.createOrder(invalidData)).rejects.toThrow(errorMessage);
    });
  });

  // ==================== UPDATE ORDER ====================

  describe('updateOrder', () => {
    it('debe actualizar una orden existente', async () => {
      const updateData = {
        observaciones: 'Orden actualizada',
      };

      const updatedOrder: PurchaseOrder = {
        ...mockPurchaseOrders[0],
        observaciones: updateData.observaciones,
        updatedAt: '2025-12-01T10:00:00.000Z',
      };

      vi.mocked(purchaseOrderService.updatePurchaseOrder).mockResolvedValue({
        success: true,
        data: updatedOrder,
      });

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = await result.current.updateOrder('po-1', updateData);

      expect(updated).toEqual(updatedOrder);
      expect(purchaseOrderService.updatePurchaseOrder).toHaveBeenCalledWith('po-1', updateData);
    });
  });

  // ==================== UPDATE STATUS ====================

  describe('updateOrderStatus', () => {
    it('debe actualizar el estado de una orden', async () => {
      const newStatus = 'ENVIADA';

      const updatedOrder: PurchaseOrder = {
        ...mockPurchaseOrders[0],
        estado: newStatus,
      };

      vi.mocked(purchaseOrderService.updatePurchaseOrderStatus).mockResolvedValue({
        success: true,
        data: updatedOrder,
      });

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = await result.current.updateOrderStatus('po-1', newStatus);

      expect(updated.estado).toBe(newStatus);
      expect(purchaseOrderService.updatePurchaseOrderStatus).toHaveBeenCalledWith('po-1', newStatus);
    });
  });

  // ==================== DELETE ORDER ====================

  describe('deleteOrder', () => {
    it('debe eliminar una orden correctamente', async () => {
      vi.mocked(purchaseOrderService.deletePurchaseOrder).mockResolvedValue({
        success: true,
        data: undefined,
        message: 'Eliminado',
      });

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteOrder('po-1');

      expect(purchaseOrderService.deletePurchaseOrder).toHaveBeenCalledWith('po-1');
    });
  });

  // ==================== REFRESH ====================

  describe('refresh', () => {
    it('debe recargar las órdenes', async () => {
      const mockResponse = {
        success: true,
        data: mockPurchaseOrders,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseOrderService.getPurchaseOrders).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseOrders());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Primera carga
      expect(purchaseOrderService.getPurchaseOrders).toHaveBeenCalledTimes(1);

      // Refresh
      await result.current.refresh();

      expect(purchaseOrderService.getPurchaseOrders).toHaveBeenCalledTimes(2);
    });
  });
});
