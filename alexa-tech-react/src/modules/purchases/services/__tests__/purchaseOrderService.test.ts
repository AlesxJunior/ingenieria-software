/**
 * Unit Tests - purchaseOrderService
 * Tests para servicio de Órdenes de Compra
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { purchaseOrderService } from '../purchaseOrderService';
import type {
  PurchaseOrder,
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  FilterPurchaseOrderDto,
  PaginatedResponse,
  ApiResponse,
} from '../../types/purchases.types';

// Mock de axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('purchaseOrderService', () => {
  const mockToken = 'test-token-123';
  const API_BASE_URL = 'http://localhost:3001';

  beforeEach(() => {
    // Reset mocks antes de cada test
    vi.clearAllMocks();
    
    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key) => key === 'token' ? mockToken : null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==================== GET PURCHASE ORDERS ====================

  describe('getPurchaseOrders', () => {
    it('debe obtener lista de órdenes de compra con paginación', async () => {
      const mockResponse: PaginatedResponse<PurchaseOrder> = {
        success: true,
        data: [
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
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const filters: FilterPurchaseOrderDto = { page: 1, limit: 10 };
      const result = await purchaseOrderService.getPurchaseOrders(filters);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          params: expect.any(URLSearchParams),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });

    it('debe aplicar filtros correctamente', async () => {
      const mockResponse: PaginatedResponse<PurchaseOrder> = {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const filters: FilterPurchaseOrderDto = {
        estado: 'ENVIADA',
        proveedorId: 'prov-123',
        search: 'OC-2025',
        page: 2,
        limit: 20,
      };

      await purchaseOrderService.getPurchaseOrders(filters);

      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params as URLSearchParams;

      expect(params.get('estado')).toBe('ENVIADA');
      expect(params.get('proveedorId')).toBe('prov-123');
      expect(params.get('search')).toBe('OC-2025');
      expect(params.get('page')).toBe('2');
      expect(params.get('limit')).toBe('20');
    });

    it('debe manejar errores de red', async () => {
      const errorMessage = 'Network Error';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      await expect(
        purchaseOrderService.getPurchaseOrders({})
      ).rejects.toThrow(errorMessage);
    });
  });

  // ==================== GET PURCHASE ORDER BY ID ====================

  describe('getPurchaseOrderById', () => {
    it('debe obtener una orden de compra por ID', async () => {
      const mockPurchaseOrder: PurchaseOrder = {
        id: 'po-1',
        codigo: 'OC-2025-001',
        fecha: '2025-12-01T00:00:00.000Z',
        proveedorId: 'prov-1',
        proveedor: {
          id: 'prov-1',
          numeroDocumento: '12345678901',
          nombres: 'Proveedor Test',
          email: 'proveedor@test.com',
        },
        almacenDestinoId: 'alm-1',
        almacenDestino: {
          id: 'alm-1',
          codigo: 'ALM-001',
          nombre: 'Almacén Principal',
        },
        estado: 'ENVIADA',
        subtotal: 200,
        descuento: 10,
        impuestos: 36,
        total: 226,
        creadoPorId: 'user-1',
        items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-1',
            productoId: 'prod-1',
            cantidad: 10,
            precioUnitario: 20,
            subtotal: 200,
            descuento: 10,
            impuesto: 36,
            total: 226,
          },
        ],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<PurchaseOrder> = {
        success: true,
        data: mockPurchaseOrder,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await purchaseOrderService.getPurchaseOrderById('po-1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes/po-1`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('po-1');
      expect(result.data.items).toHaveLength(1);
    });

    it('debe manejar orden no encontrada', async () => {
      mockedAxios.get.mockRejectedValue({
        response: { status: 404, data: { message: 'Orden no encontrada' } },
      });

      await expect(
        purchaseOrderService.getPurchaseOrderById('non-existent')
      ).rejects.toBeDefined();
    });
  });

  // ==================== CREATE PURCHASE ORDER ====================

  describe('createPurchaseOrder', () => {
    it('debe crear una nueva orden de compra', async () => {
      const newOrder: CreatePurchaseOrderDto = {
        proveedorId: 'prov-1',
        almacenDestinoId: 'alm-1',
        fecha: '2025-12-01',
        items: [
          {
            productoId: 'prod-1',
            cantidad: 10,
            precioUnitario: 20,
          },
        ],
      };

      const mockCreatedOrder: PurchaseOrder = {
        id: 'po-new',
        codigo: 'OC-2025-002',
        fecha: '2025-12-01T00:00:00.000Z',
        proveedorId: newOrder.proveedorId,
        almacenDestinoId: newOrder.almacenDestinoId,
        estado: 'PENDIENTE',
        subtotal: 200,
        descuento: 0,
        impuestos: 36,
        total: 236,
        creadoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<PurchaseOrder> = {
        success: true,
        data: mockCreatedOrder,
        message: 'Orden creada exitosamente',
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await purchaseOrderService.createPurchaseOrder(newOrder);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes`,
        newOrder,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.estado).toBe('PENDIENTE');
    });

    it('debe validar datos requeridos', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Datos inválidos' },
        },
      });

      const invalidOrder = {} as CreatePurchaseOrderDto;

      await expect(
        purchaseOrderService.createPurchaseOrder(invalidOrder)
      ).rejects.toBeDefined();
    });
  });

  // ==================== UPDATE PURCHASE ORDER ====================

  describe('updatePurchaseOrder', () => {
    it('debe actualizar una orden de compra existente', async () => {
      const updateData: UpdatePurchaseOrderDto = {
        observaciones: 'Actualización de prueba',
        fechaEntregaEstimada: '2025-12-10',
      };

      const mockUpdatedOrder: PurchaseOrder = {
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
        observaciones: updateData.observaciones,
        fechaEntregaEstimada: updateData.fechaEntregaEstimada,
        creadoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      };

      const mockResponse: ApiResponse<PurchaseOrder> = {
        success: true,
        data: mockUpdatedOrder,
        message: 'Orden actualizada exitosamente',
      };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await purchaseOrderService.updatePurchaseOrder('po-1', updateData);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes/po-1`,
        updateData,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.observaciones).toBe(updateData.observaciones);
    });
  });

  // ==================== UPDATE STATUS ====================

  describe('updatePurchaseOrderStatus', () => {
    it('debe actualizar el estado de una orden', async () => {
      const newStatus = 'ENVIADA';

      const mockResponse: ApiResponse<PurchaseOrder> = {
        success: true,
        data: {
          id: 'po-1',
          codigo: 'OC-2025-001',
          fecha: '2025-12-01T00:00:00.000Z',
          proveedorId: 'prov-1',
          almacenDestinoId: 'alm-1',
          estado: newStatus,
          subtotal: 100,
          descuento: 0,
          impuestos: 18,
          total: 118,
          creadoPorId: 'user-1',
          items: [],
          createdAt: '2025-12-01T00:00:00.000Z',
          updatedAt: '2025-12-01T11:00:00.000Z',
        },
      };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await purchaseOrderService.updatePurchaseOrderStatus('po-1', newStatus);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes/po-1/estado`,
        { estado: newStatus },
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.data.estado).toBe(newStatus);
    });
  });

  // ==================== DELETE PURCHASE ORDER ====================

  describe('deletePurchaseOrder', () => {
    it('debe eliminar una orden de compra', async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
        message: 'Orden eliminada exitosamente',
      };

      mockedAxios.delete.mockResolvedValue({ data: mockResponse });

      const result = await purchaseOrderService.deletePurchaseOrder('po-1');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes/po-1`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.success).toBe(true);
    });

    it('debe manejar errores al eliminar', async () => {
      mockedAxios.delete.mockRejectedValue({
        response: {
          status: 403,
          data: { message: 'No tiene permisos para eliminar' },
        },
      });

      await expect(
        purchaseOrderService.deletePurchaseOrder('po-1')
      ).rejects.toBeDefined();
    });
  });

  // ==================== DOWNLOAD PDF ====================

  describe('downloadPurchaseOrderPDF', () => {
    it('debe descargar PDF de una orden', async () => {
      const mockBlob = new Blob(['PDF content'], { type: 'application/pdf' });
      mockedAxios.get.mockResolvedValue({ data: mockBlob });

      await purchaseOrderService.downloadPurchaseOrderPDF('po-1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/ordenes/po-1/pdf`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          responseType: 'blob',
        })
      );
    });
  });
});
