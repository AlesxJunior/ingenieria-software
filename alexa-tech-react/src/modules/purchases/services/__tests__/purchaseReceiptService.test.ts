/**
 * Unit Tests - purchaseReceiptService
 * Tests para servicio de Recepciones de Compra
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { purchaseReceiptService } from '../purchaseReceiptService';
import type {
  PurchaseReceipt,
  CreatePurchaseReceiptDto,
  UpdatePurchaseReceiptDto,
  FilterPurchaseReceiptDto,
  PaginatedResponse,
  ApiResponse,
} from '../../types/purchases.types';

// Mock de axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('purchaseReceiptService', () => {
  const mockToken = 'test-token-456';
  const API_BASE_URL = 'http://localhost:3001';

  beforeEach(() => {
    vi.clearAllMocks();
    
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

  // ==================== GET PURCHASE RECEIPTS ====================

  describe('getPurchaseReceipts', () => {
    it('debe obtener lista de recepciones con paginación', async () => {
      const mockResponse: PaginatedResponse<PurchaseReceipt> = {
        success: true,
        data: [
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
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const filters: FilterPurchaseReceiptDto = { page: 1, limit: 10 };
      const result = await purchaseReceiptService.getPurchaseReceipts(filters);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
          params: expect.any(URLSearchParams),
        })
      );
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('debe aplicar filtros de búsqueda', async () => {
      const mockResponse: PaginatedResponse<PurchaseReceipt> = {
        success: true,
        data: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const filters: FilterPurchaseReceiptDto = {
        ordenCompraId: 'po-123',
        estado: 'CONFIRMADA',
        search: 'RC-2025',
        almacenId: 'alm-1',
      };

      await purchaseReceiptService.getPurchaseReceipts(filters);

      const callArgs = mockedAxios.get.mock.calls[0];
      const params = callArgs[1]?.params as URLSearchParams;

      expect(params.get('ordenCompraId')).toBe('po-123');
      expect(params.get('estado')).toBe('CONFIRMADA');
      expect(params.get('search')).toBe('RC-2025');
      expect(params.get('almacenId')).toBe('alm-1');
    });
  });

  // ==================== GET PURCHASE RECEIPT BY ID ====================

  describe('getPurchaseReceiptById', () => {
    it('debe obtener una recepción por ID con relaciones', async () => {
      const mockReceipt: PurchaseReceipt = {
        id: 'pr-1',
        codigo: 'RC-2025-001',
        ordenCompraId: 'po-1',
        ordenCompra: {
          id: 'po-1',
          codigo: 'OC-2025-001',
          fecha: '2025-11-30T00:00:00.000Z',
          proveedorId: 'prov-1',
          almacenDestinoId: 'alm-1',
          estado: 'ENVIADA',
          subtotal: 500,
          descuento: 0,
          impuestos: 90,
          total: 590,
          creadoPorId: 'user-1',
          items: [],
          createdAt: '2025-11-30T00:00:00.000Z',
          updatedAt: '2025-11-30T00:00:00.000Z',
        },
        fecha: '2025-12-01T00:00:00.000Z',
        estado: 'CONFIRMADA',
        observaciones: 'Recepción completa',
        recibidoPorId: 'user-1',
        recibidoPor: {
          id: 'user-1',
          username: 'admin',
          firstName: 'Admin',
          lastName: 'User',
        },
        items: [
          {
            id: 'pri-1',
            recepcionCompraId: 'pr-1',
            productoId: 'prod-1',
            cantidadRecibida: 50,
            cantidadEsperada: 50,
            observaciones: 'OK',
          },
        ],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<PurchaseReceipt> = {
        success: true,
        data: mockReceipt,
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await purchaseReceiptService.getPurchaseReceiptById('pr-1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones/pr-1`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.data.id).toBe('pr-1');
      expect(result.data.items).toHaveLength(1);
      expect(result.data.ordenCompra).toBeDefined();
    });
  });

  // ==================== CREATE PURCHASE RECEIPT ====================

  describe('createPurchaseReceipt', () => {
    it('debe crear una nueva recepción', async () => {
      const newReceipt: CreatePurchaseReceiptDto = {
        ordenCompraId: 'po-1',
        fecha: '2025-12-01',
        items: [
          {
            productoId: 'prod-1',
            cantidadRecibida: 50,
            cantidadEsperada: 50,
          },
        ],
      };

      const mockCreatedReceipt: PurchaseReceipt = {
        id: 'pr-new',
        codigo: 'RC-2025-002',
        ordenCompraId: newReceipt.ordenCompraId,
        fecha: '2025-12-01T00:00:00.000Z',
        estado: 'PENDIENTE',
        recibidoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T00:00:00.000Z',
      };

      const mockResponse: ApiResponse<PurchaseReceipt> = {
        success: true,
        data: mockCreatedReceipt,
        message: 'Recepción creada exitosamente',
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await purchaseReceiptService.createPurchaseReceipt(newReceipt);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones`,
        newReceipt,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.success).toBe(true);
      expect(result.data.estado).toBe('PENDIENTE');
    });

    it('debe validar cantidades recibidas vs esperadas', async () => {
      mockedAxios.post.mockRejectedValue({
        response: {
          status: 400,
          data: { message: 'Cantidad recibida excede la esperada' },
        },
      });

      const invalidReceipt: CreatePurchaseReceiptDto = {
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

      await expect(
        purchaseReceiptService.createPurchaseReceipt(invalidReceipt)
      ).rejects.toBeDefined();
    });
  });

  // ==================== UPDATE PURCHASE RECEIPT ====================

  describe('updatePurchaseReceipt', () => {
    it('debe actualizar una recepción existente', async () => {
      const updateData: UpdatePurchaseReceiptDto = {
        observaciones: 'Actualización de recepción',
      };

      const mockUpdatedReceipt: PurchaseReceipt = {
        id: 'pr-1',
        codigo: 'RC-2025-001',
        ordenCompraId: 'po-1',
        fecha: '2025-12-01T00:00:00.000Z',
        estado: 'PENDIENTE',
        observaciones: updateData.observaciones,
        recibidoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T12:00:00.000Z',
      };

      const mockResponse: ApiResponse<PurchaseReceipt> = {
        success: true,
        data: mockUpdatedReceipt,
      };

      mockedAxios.patch.mockResolvedValue({ data: mockResponse });

      const result = await purchaseReceiptService.updatePurchaseReceipt('pr-1', updateData);

      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones/pr-1`,
        updateData,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.data.observaciones).toBe(updateData.observaciones);
    });
  });

  // ==================== CONFIRM RECEIPT ====================

  describe('confirmPurchaseReceipt', () => {
    it('debe confirmar una recepción', async () => {
      const mockResponse: ApiResponse<PurchaseReceipt> = {
        success: true,
        data: {
          id: 'pr-1',
          codigo: 'RC-2025-001',
          ordenCompraId: 'po-1',
          fecha: '2025-12-01T00:00:00.000Z',
          estado: 'CONFIRMADA',
          recibidoPorId: 'user-1',
          items: [],
          createdAt: '2025-12-01T00:00:00.000Z',
          updatedAt: '2025-12-01T13:00:00.000Z',
        },
        message: 'Recepción confirmada exitosamente',
      };

      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const result = await purchaseReceiptService.confirmPurchaseReceipt('pr-1');

      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones/pr-1/confirmar`,
        {},
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.data.estado).toBe('CONFIRMADA');
    });
  });

  // ==================== DELETE PURCHASE RECEIPT ====================

  describe('deletePurchaseReceipt', () => {
    it('debe eliminar una recepción', async () => {
      const mockResponse: ApiResponse<void> = {
        success: true,
        data: undefined,
        message: 'Recepción eliminada',
      };

      mockedAxios.delete.mockResolvedValue({ data: mockResponse });

      const result = await purchaseReceiptService.deletePurchaseReceipt('pr-1');

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones/pr-1`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.success).toBe(true);
    });
  });

  // ==================== GET PENDING RECEIPTS ====================

  describe('getPendingReceiptsByOrderId', () => {
    it('debe obtener recepciones pendientes de una orden', async () => {
      const mockResponse: ApiResponse<PurchaseReceipt[]> = {
        success: true,
        data: [
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
        ],
      };

      mockedAxios.get.mockResolvedValue({ data: mockResponse });

      const result = await purchaseReceiptService.getPendingReceiptsByOrderId('po-1');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_BASE_URL}/compras/recepciones/orden/po-1/pendientes`,
        expect.objectContaining({
          headers: { Authorization: `Bearer ${mockToken}` },
        })
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].estado).toBe('PENDIENTE');
    });
  });
});
