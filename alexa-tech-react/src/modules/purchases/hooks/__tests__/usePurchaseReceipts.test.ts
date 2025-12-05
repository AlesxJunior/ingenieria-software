/**
 * Integration Tests - usePurchaseReceipts Hook
 * Tests de integración para hook de Recepciones de Compra
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePurchaseReceipts } from '../usePurchaseReceipts';
import { purchaseReceiptService } from '../../services/purchaseReceiptService';
import type { PurchaseReceipt, FilterPurchaseReceiptDto } from '../../types/purchases.types';

// Mock del servicio
vi.mock('../../services/purchaseReceiptService');

describe('usePurchaseReceipts', () => {
  const mockPurchaseReceipts: PurchaseReceipt[] = [
    {
      id: 'pr-1',
      codigo: 'RC-2025-001',
      ordenCompraId: 'po-1',
      fecha: '2025-12-01T00:00:00.000Z',
      estado: 'PENDIENTE',
      recibidoPorId: 'user-1',
      items: [],
      createdAt: '2025-12-01T00:00:00.000Z',
      updatedAt: '2025-12-01T00:00:00.000Z',
    },
    {
      id: 'pr-2',
      codigo: 'RC-2025-002',
      ordenCompraId: 'po-2',
      fecha: '2025-12-02T00:00:00.000Z',
      estado: 'CONFIRMADA',
      recibidoPorId: 'user-2',
      items: [],
      createdAt: '2025-12-02T00:00:00.000Z',
      updatedAt: '2025-12-02T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== FETCH RECEIPTS ====================

  describe('fetchReceipts', () => {
    it('debe cargar recepciones exitosamente', async () => {
      const mockResponse = {
        success: true,
        data: mockPurchaseReceipts,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseReceiptService.getPurchaseReceipts).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseReceipts());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.receipts).toEqual(mockPurchaseReceipts);
      expect(result.current.pagination.total).toBe(2);
      expect(result.current.error).toBeNull();
    });

    it('debe manejar errores al cargar recepciones', async () => {
      const errorMessage = 'Error al cargar datos';
      vi.mocked(purchaseReceiptService.getPurchaseReceipts).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.receipts).toEqual([]);
      expect(result.current.error).toBe(errorMessage);
    });

    it('debe filtrar por orden de compra', async () => {
      const filters: FilterPurchaseReceiptDto = {
        ordenCompraId: 'po-1',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        success: true,
        data: [mockPurchaseReceipts[0]],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseReceiptService.getPurchaseReceipts).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseReceipts(filters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.receipts).toHaveLength(1);
      expect(result.current.receipts[0].ordenCompraId).toBe('po-1');
      expect(purchaseReceiptService.getPurchaseReceipts).toHaveBeenCalledWith(filters);
    });

    it('debe filtrar por estado', async () => {
      const filters: FilterPurchaseReceiptDto = {
        estado: 'CONFIRMADA',
      };

      const mockResponse = {
        success: true,
        data: [mockPurchaseReceipts[1]],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseReceiptService.getPurchaseReceipts).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseReceipts(filters));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.receipts).toHaveLength(1);
      expect(result.current.receipts[0].estado).toBe('CONFIRMADA');
    });
  });

  // ==================== CREATE RECEIPT ====================

  describe('createReceipt', () => {
    it('debe crear una nueva recepción exitosamente', async () => {
      const newReceiptData = {
        ordenCompraId: 'po-3',
        fecha: '2025-12-03',
        items: [
          {
            productoId: 'prod-1',
            cantidadRecibida: 50,
            cantidadEsperada: 50,
          },
        ],
      };

      const createdReceipt: PurchaseReceipt = {
        id: 'pr-3',
        codigo: 'RC-2025-003',
        ordenCompraId: newReceiptData.ordenCompraId,
        fecha: '2025-12-03T00:00:00.000Z',
        estado: 'PENDIENTE',
        recibidoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-03T00:00:00.000Z',
        updatedAt: '2025-12-03T00:00:00.000Z',
      };

      vi.mocked(purchaseReceiptService.createPurchaseReceipt).mockResolvedValue({
        success: true,
        data: createdReceipt,
        message: 'Recepción creada',
      });

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const newReceipt = await result.current.createReceipt(newReceiptData);

      expect(newReceipt).toEqual(createdReceipt);
      expect(purchaseReceiptService.createPurchaseReceipt).toHaveBeenCalledWith(newReceiptData);
    });

    it('debe manejar errores de validación', async () => {
      const errorMessage = 'Cantidad excede lo esperado';
      vi.mocked(purchaseReceiptService.createPurchaseReceipt).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const invalidData = {
        ordenCompraId: 'po-1',
        fecha: '2025-12-01',
        items: [
          {
            productoId: 'prod-1',
            cantidadRecibida: 100,
            cantidadEsperada: 50,
          },
        ],
      };

      await expect(result.current.createReceipt(invalidData)).rejects.toThrow(errorMessage);
    });
  });

  // ==================== UPDATE RECEIPT ====================

  describe('updateReceipt', () => {
    it('debe actualizar una recepción existente', async () => {
      const updateData = {
        observaciones: 'Recepción actualizada',
      };

      const updatedReceipt: PurchaseReceipt = {
        ...mockPurchaseReceipts[0],
        observaciones: updateData.observaciones,
        updatedAt: '2025-12-01T11:00:00.000Z',
      };

      vi.mocked(purchaseReceiptService.updatePurchaseReceipt).mockResolvedValue({
        success: true,
        data: updatedReceipt,
      });

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const updated = await result.current.updateReceipt('pr-1', updateData);

      expect(updated).toEqual(updatedReceipt);
      expect(purchaseReceiptService.updatePurchaseReceipt).toHaveBeenCalledWith('pr-1', updateData);
    });
  });

  // ==================== CONFIRM RECEIPT ====================

  describe('confirmReceipt', () => {
    it('debe confirmar una recepción pendiente', async () => {
      const confirmedReceipt: PurchaseReceipt = {
        ...mockPurchaseReceipts[0],
        estado: 'CONFIRMADA',
        updatedAt: '2025-12-01T12:00:00.000Z',
      };

      vi.mocked(purchaseReceiptService.confirmPurchaseReceipt).mockResolvedValue({
        success: true,
        data: confirmedReceipt,
        message: 'Recepción confirmada',
      });

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const confirmed = await result.current.confirmReceipt('pr-1');

      expect(confirmed.estado).toBe('CONFIRMADA');
      expect(purchaseReceiptService.confirmPurchaseReceipt).toHaveBeenCalledWith('pr-1');
    });

    it('debe manejar errores al confirmar', async () => {
      const errorMessage = 'Recepción ya confirmada';
      vi.mocked(purchaseReceiptService.confirmPurchaseReceipt).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.confirmReceipt('pr-2')).rejects.toThrow(errorMessage);
    });
  });

  // ==================== DELETE RECEIPT ====================

  describe('deleteReceipt', () => {
    it('debe eliminar una recepción correctamente', async () => {
      vi.mocked(purchaseReceiptService.deletePurchaseReceipt).mockResolvedValue({
        success: true,
        data: undefined,
        message: 'Eliminado',
      });

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteReceipt('pr-1');

      expect(purchaseReceiptService.deletePurchaseReceipt).toHaveBeenCalledWith('pr-1');
    });
  });

  // ==================== GET PENDING RECEIPTS ====================

  describe('getPendingReceiptsByOrder', () => {
    it('debe obtener recepciones pendientes de una orden', async () => {
      const pendingReceipts = [mockPurchaseReceipts[0]];

      vi.mocked(purchaseReceiptService.getPendingReceiptsByOrderId).mockResolvedValue({
        success: true,
        data: pendingReceipts,
      });

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const pending = await result.current.getPendingReceiptsByOrder('po-1');

      expect(pending).toEqual(pendingReceipts);
      expect(purchaseReceiptService.getPendingReceiptsByOrderId).toHaveBeenCalledWith('po-1');
    });
  });

  // ==================== REFRESH ====================

  describe('refresh', () => {
    it('debe recargar las recepciones', async () => {
      const mockResponse = {
        success: true,
        data: mockPurchaseReceipts,
        pagination: {
          total: 2,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      vi.mocked(purchaseReceiptService.getPurchaseReceipts).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePurchaseReceipts());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Primera carga
      expect(purchaseReceiptService.getPurchaseReceipts).toHaveBeenCalledTimes(1);

      // Refresh
      await result.current.refresh();

      expect(purchaseReceiptService.getPurchaseReceipts).toHaveBeenCalledTimes(2);
    });
  });
});
