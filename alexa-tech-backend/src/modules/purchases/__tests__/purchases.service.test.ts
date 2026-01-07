import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PurchasesService } from '../purchases.service';
import { prisma } from '../../../config/database';

vi.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: {
    purchaseOrder: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    purchaseOrderItem: {
      deleteMany: vi.fn(),
    },
    warehouse: {
      findUnique: vi.fn(),
    },
    stockByWarehouse: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
      aggregate: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    kardex: {
      create: vi.fn(),
    },
    inventoryMovement: {
      create: vi.fn(),
    },
    movementReason: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      const tx = {
        product: { findUnique: vi.fn(), update: vi.fn() },
        stockByWarehouse: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn(), upsert: vi.fn(), aggregate: vi.fn() },
        kardex: { create: vi.fn() },
        inventoryMovement: { create: vi.fn() },
      };
      return callback(tx);
    }),
  },
}));

vi.mock('../../../services/auditService', () => ({
  __esModule: true,
  AuditService: {
    createAuditLog: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../../../services/entidadService', () => ({
  __esModule: true,
  clientService: {
    getClientById: vi.fn(),
  },
}));

vi.mock('../../products/products.service', () => ({
  __esModule: true,
  productService: {
    findByCodigo: vi.fn(),
    updateByCodigo: vi.fn(),
  },
  default: {
    findByCodigo: vi.fn(),
    updateByCodigo: vi.fn(),
  },
}));

import { AuditService } from '../../../services/auditService';
import { clientService } from '../../../services/entidadService';
import { productService } from '../../products/products.service';

const prismaMock = prisma as any;

// Crear instancia del servicio para tests
const purchasesService = new PurchasesService();
// Alias para compatibilidad con tests existentes
const purchaseService = purchasesService;

describe('Purchase Service', () => {
  beforeEach(() => {
    // Limpiar solo los históricos de llamadas, no destruir los mocks
    prismaMock.purchaseOrder.findUnique.mockClear();
    prismaMock.purchaseOrder.findMany.mockClear();
    prismaMock.purchaseOrder.create.mockClear();
    prismaMock.purchaseOrder.update.mockClear();
    prismaMock.purchaseOrder.count.mockClear();
    prismaMock.warehouse.findUnique.mockClear();
    prismaMock.movementReason.findFirst.mockClear();
    (clientService.getClientById as any).mockClear();
    (productService.findByCodigo as any).mockClear();
    (AuditService.createAuditLog as any).mockClear();
  });

  it('should create a purchase with calculated totals and discount', async () => {
    // Mock proveedor válido
    (clientService.getClientById as any).mockResolvedValueOnce({ 
      id: 'prov-1', 
      tipoEntidad: 'Proveedor' 
    });

    // Mock código único (no existe duplicado)
    prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

    const now = new Date();
    const created = {
      id: 'po-1',
      codigo: 'OC-20250101-101010',
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      fechaEmision: now,
      fechaEntregaEstimada: null,
      tipoComprobante: 'FACTURA',
      formaPago: 'EFECTIVO',
      subtotal: new Decimal(25),
      descuento: new Decimal(5),
      igv: new Decimal(0),
      total: new Decimal(20),
      estado: 'PENDIENTE',
      observaciones: null,
      creadoPorId: 'user-1',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      items: [
        {
          id: 'item-1',
          ordenCompraId: 'po-1',
          productoCodigo: 'P-1',
          nombreProducto: 'Prod 1',
          cantidad: 2,
          precioUnitario: new Decimal(10),
          subtotal: new Decimal(20),
        },
        {
          id: 'item-2',
          ordenCompraId: 'po-1',
          productoCodigo: 'P-2',
          nombreProducto: 'Prod 2',
          cantidad: 1,
          precioUnitario: new Decimal(5),
          subtotal: new Decimal(5),
        },
      ],
    } as any;

    prismaMock.purchaseOrder.create.mockResolvedValueOnce(created);

    const purchase = await purchaseService.create({
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      fechaEmision: now.toISOString(),
      tipoComprobante: 'FACTURA' as any,
      items: [
        { productoId: 'P-1', nombreProducto: 'Prod 1', cantidad: 2, precioUnitario: 10 },
        { productoId: 'P-2', nombreProducto: 'Prod 2', cantidad: 1, precioUnitario: 5 },
      ],
      formaPago: 'EFECTIVO' as any,
      descuento: 5,
      creadoPorId: 'user-1',
    });

    expect(prismaMock.purchaseOrder.create).toHaveBeenCalledTimes(1);
    expect(purchase).toBeDefined();
    expect(purchase!.subtotal).toBe(25);
    expect(purchase!.total).toBe(20);
    expect(purchase!.items).toHaveLength(2);
    expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('should list purchases with filters', async () => {
    // Mock Prisma methods for pagination
    prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);
    prismaMock.purchaseOrder.count.mockResolvedValueOnce(0);

    await purchaseService.findAll({
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      estado: 'PENDIENTE',
      fechaInicio: '2025-01-01',
      fechaFin: '2025-01-31',
      q: 'OC-2025',
    });

    expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalled();
    expect(prismaMock.purchaseOrder.count).toHaveBeenCalled();
  });

  it('should update status to Recibida and increase product stock', async () => {
    const now = new Date();
    const existing = {
      id: 'po-1',
      codigo: 'OC-1',
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      fechaEmision: now,
      tipoComprobante: null,
      items: [
        { id: 'i1', productoCodigo: 'P-1', nombreProducto: 'P1', cantidad: 3, precioUnitario: new Decimal(10), subtotal: new Decimal(30) },
      ],
      subtotal: new Decimal(30),
      descuento: new Decimal(0),
      igv: new Decimal(0),
      total: new Decimal(30),
      formaPago: null,
      fechaEntregaEstimada: null,
      observaciones: null,
      creadoPorId: 'user-1',
      estado: 'PENDIENTE',
      createdAt: now,
      updatedAt: now,
    } as any;

    prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(existing);

    const updated = { ...existing, estado: 'RECIBIDA' } as any;
    prismaMock.purchaseOrder.update.mockResolvedValueOnce(updated);

    // Mock warehouse
    prismaMock.warehouse.findUnique.mockResolvedValueOnce({ id: 'alm-1', nombre: 'Almacen 1' } as any);
    
    // Mock movementReason
    prismaMock.movementReason.findFirst.mockResolvedValueOnce({ id: 'reason-1', codigo: 'ENT-COMPRA', nombre: 'Entrada por compra' } as any);
    
    // Mock product
    (productService.findByCodigo as any).mockResolvedValueOnce({ id: 'prod-1', codigo: 'P-1', stock: 10 });
    
    // Mock $transaction with proper mocks inside
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        product: { 
          findUnique: vi.fn().mockResolvedValueOnce({ id: 'prod-1', codigo: 'P-1', stock: 10 }),
          update: vi.fn().mockResolvedValueOnce({ id: 'prod-1', codigo: 'P-1', stock: 13 })
        },
        stockByWarehouse: { 
          findUnique: vi.fn().mockResolvedValueOnce({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 10 }),
          update: vi.fn().mockResolvedValueOnce({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 13 }),
          create: vi.fn().mockResolvedValueOnce({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 13 }),
          upsert: vi.fn().mockResolvedValueOnce({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 13 }),
          aggregate: vi.fn().mockResolvedValueOnce({ _sum: { quantity: 13 } })
        },
        kardex: { 
          create: vi.fn().mockResolvedValueOnce({})
        },
        inventoryMovement: {
          create: vi.fn().mockResolvedValueOnce({})
        },
      };
      return callback(tx);
    });

    const result = await purchaseService.updateStatus('po-1', 'RECIBIDA', 'user-1');

    expect(result).toBeDefined();
    expect(result!.estado).toBe('RECIBIDA');
  });

  it('should delete a pending purchase order', async () => {
    prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce({ id: 'po-1', estado: 'PENDIENTE', codigo: 'OC-1' } as any);
    prismaMock.purchaseOrder.update.mockResolvedValueOnce({ id: 'po-1', deletedAt: new Date() } as any);

    await purchaseService.delete('po-1');

    expect(prismaMock.purchaseOrder.update).toHaveBeenCalledWith({
      where: { id: 'po-1' },
      data: expect.objectContaining({ deletedAt: expect.any(Date) })
    });
    expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('should not delete a non-pending purchase order', async () => {
    prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce({ id: 'po-1', estado: 'RECIBIDA' } as any);

    await expect(purchaseService.delete('po-1')).rejects.toThrow(
      'Solo se puede eliminar órdenes en estado PENDIENTE',
    );
    expect(prismaMock.purchaseOrder.update).not.toHaveBeenCalled();
  });

  describe('create', () => {
    it('should fail if proveedor does not exist', async () => {
      (clientService.getClientById as any).mockResolvedValueOnce(null);

      await expect(
        purchaseService.create({
          proveedorId: 'invalid-id',
          almacenId: 'alm-1',
          fechaEmision: new Date().toISOString(),
          creadoPorId: 'user-1',
          items: [{ productoId: 'P-1', cantidad: 1, precioUnitario: 10 }],
        }),
      ).rejects.toThrow('Proveedor no encontrado');
    });

    it('should fail if proveedor is not type Proveedor or Ambos', async () => {
      (clientService.getClientById as any).mockResolvedValueOnce({
        id: 'client-1',
        tipoEntidad: 'Cliente',
      });

      await expect(
        purchaseService.create({
          proveedorId: 'client-1',
          almacenId: 'alm-1',
          fechaEmision: new Date().toISOString(),
          creadoPorId: 'user-1',
          items: [{ productoId: 'P-1', cantidad: 1, precioUnitario: 10 }],
        }),
      ).rejects.toThrow('Proveedor no encontrado');
    });

    it('should create purchase with Ambos type entity', async () => {
      (clientService.getClientById as any).mockResolvedValueOnce({
        id: 'entity-1',
        tipoEntidad: 'Ambos',
      });

      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      const now = new Date();
      const created = {
        id: 'po-1',
        codigo: 'OC-20250101-101010',
        proveedorId: 'entity-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: 'FACTURA',
        formaPago: 'EFECTIVO',
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
      igv: new Decimal(0),
      total: new Decimal(100),
        estado: 'PENDIENTE',
        observaciones: null,
        creadoPorId: 'user-1',
        createdAt: now,
        updatedAt: now,
      deletedAt: null,
      items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      prismaMock.purchaseOrder.create.mockResolvedValueOnce(created);

      const result = await purchaseService.create({
        proveedorId: 'entity-1',
        almacenId: 'alm-1',
        fechaEmision: now.toISOString(),
        tipoComprobante: 'FACTURA' as any,
        formaPago: 'EFECTIVO' as any,
        creadoPorId: 'user-1',
        items: [{ productoId: 'P-1', nombreProducto: 'Product', cantidad: 10, precioUnitario: 10 }],
      });

      expect(result).toBeDefined();
      expect(result!.total).toBe(100);
      expect(AuditService.createAuditLog).toHaveBeenCalled();
    });

    it('should handle duplicate codigo by appending timestamp', async () => {
      (clientService.getClientById as any).mockResolvedValueOnce({
        id: 'prov-1',
        tipoEntidad: 'Proveedor',
      });

      // First call returns existing order (duplicate)
      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce({
        id: 'existing-po',
        codigo: 'OC-20250101-101010',
      } as any);

      const now = new Date();
      const created = {
        id: 'po-2',
        codigo: `OC-20250101-101010-${Date.now()}`,
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: null,
        formaPago: null,
        subtotal: new Decimal(50),
        descuento: new Decimal(0),
      igv: new Decimal(0),
      total: new Decimal(50),
        estado: 'PENDIENTE',
        observaciones: null,
        creadoPorId: 'user-1',
        createdAt: now,
        updatedAt: now,
      deletedAt: null,
      items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-2',
            productoCodigo: 'P-1',
            nombreProducto: null,
            cantidad: 5,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(50),
          },
        ],
      } as any;

      prismaMock.purchaseOrder.create.mockResolvedValueOnce(created);

      const result = await purchaseService.create({
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now.toISOString(),
        creadoPorId: 'user-1',
        items: [{ productoId: 'P-1', cantidad: 5, precioUnitario: 10 }],
      });

      expect(result).toBeDefined();
      expect(result!.codigoOrden).toContain('OC-20250101-101010');
      expect(prismaMock.purchaseOrder.create).toHaveBeenCalled();
    });

    it('should calculate subtotal from multiple items', async () => {
      (clientService.getClientById as any).mockResolvedValueOnce({
        id: 'prov-1',
        tipoEntidad: 'Proveedor',
      });

      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      const now = new Date();
      const created = {
        id: 'po-1',
        codigo: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: null,
        formaPago: null,
        subtotal: new Decimal(350), // (10*10) + (50*5) = 100 + 250
        descuento: new Decimal(50),
      igv: new Decimal(0),
      total: new Decimal(300),
        estado: 'PENDIENTE',
        observaciones: null,
        creadoPorId: 'user-1',
        createdAt: now,
        updatedAt: now,
      deletedAt: null,
      items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-1',
            nombreProducto: 'Product 1',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
          {
            id: 'item-2',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-2',
            nombreProducto: 'Product 2',
            cantidad: 50,
            precioUnitario: new Decimal(5),
            subtotal: new Decimal(250),
          },
        ],
      } as any;

      prismaMock.purchaseOrder.create.mockResolvedValueOnce(created);

      const result = await purchaseService.create({
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now.toISOString(),
        creadoPorId: 'user-1',
        items: [
          { productoId: 'P-1', nombreProducto: 'Product 1', cantidad: 10, precioUnitario: 10 },
          { productoId: 'P-2', nombreProducto: 'Product 2', cantidad: 50, precioUnitario: 5 },
        ],
        descuento: 50,
      });

      expect(result).toBeDefined();
      expect(result!.subtotal).toBe(350);
      expect(result!.total).toBe(300);
      expect(result!.items).toHaveLength(2);
    });

    it('should create purchase with optional fields', async () => {
      (clientService.getClientById as any).mockResolvedValueOnce({
        id: 'prov-1',
        tipoEntidad: 'Proveedor',
      });

      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      const now = new Date();
      const entrega = new Date('2025-02-01');
      const created = {
        id: 'po-1',
        codigo: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: entrega,
        tipoComprobante: 'BOLETA',
        formaPago: 'CREDITO',
        subtotal: new Decimal(100),
        descuento: new Decimal(10),
      igv: new Decimal(0),
      total: new Decimal(90),
        estado: 'PENDIENTE',
        observaciones: 'Test observations',
        creadoPorId: 'user-1',
        createdAt: now,
        updatedAt: now,
      deletedAt: null,
      items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      prismaMock.purchaseOrder.create.mockResolvedValueOnce(created);

      const result = await purchaseService.create({
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now.toISOString(),
        fechaEntregaEstimada: entrega.toISOString(),
        tipoComprobante: 'BOLETA' as any,
        formaPago: 'CREDITO' as any,
        observaciones: 'Test observations',
        creadoPorId: 'user-1',
        items: [{ productoId: 'P-1', nombreProducto: 'Product', cantidad: 10, precioUnitario: 10 }],
        descuento: 10,
      });

      expect(result).toBeDefined();
      expect(result!.fechaEntregaEstimada).toBe(entrega.toISOString());
      expect(result!.observaciones).toBe('Test observations');
      expect(result!.formaPago).toBe('Credito');
    });
  });

  describe('findAll', () => {
    it('should list all purchases without filters', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);

      const result = await purchaseService.findAll({});

      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
      expect(result).toEqual([]);
    });

    it('should filter by proveedorId only', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);

      await purchaseService.findAll({ proveedorId: 'prov-1' });

      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: { proveedorId: 'prov-1' },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by almacenId only', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);

      await purchaseService.findAll({ almacenId: 'alm-1' });

      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: { almacenId: 'alm-1' },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by estado only', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);

      await purchaseService.findAll({ estado: 'RECIBIDA' });

      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: { estado: 'RECIBIDA' },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by search query', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);

      await purchaseService.findAll({ q: 'OC-2025' });

      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { codigo: { contains: 'OC-2025', mode: 'insensitive' } },
            { items: { some: { nombreProducto: { contains: 'OC-2025', mode: 'insensitive' } } } },
          ],
        },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by date range', async () => {
      prismaMock.purchaseOrder.findMany.mockResolvedValueOnce([]);

      await purchaseService.findAll({
        fechaInicio: '2025-01-01',
        fechaFin: '2025-01-31',
      });

      expect(prismaMock.purchaseOrder.findMany).toHaveBeenCalledWith({
        where: {
          fechaEmision: {
            gte: new Date('2025-01-01'),
            lte: new Date('2025-01-31'),
          },
        },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a purchase by id', async () => {
      const now = new Date();
      const purchase = {
        id: 'po-1',
        codigo: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: 'FACTURA',
        formaPago: 'EFECTIVO',
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
      igv: new Decimal(0),
      total: new Decimal(100),
        estado: 'PENDIENTE',
        observaciones: null,
        creadoPorId: 'user-1',
        createdAt: now,
        updatedAt: now,
      deletedAt: null,
      items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(purchase);

      const result = await purchaseService.findOne('po-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('po-1');
      expect(result?.codigoOrden).toBe('OC-TEST');
    });

    it('should return null if purchase not found', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      const result = await purchaseService.findOne('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a pending purchase', async () => {
      const now = new Date();
      const existing = {
        id: 'po-1',
        codigo: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: null,
        formaPago: null,
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
      igv: new Decimal(0),
      total: new Decimal(100),
        estado: 'PENDIENTE',
        observaciones: null,
        creadoPorId: 'user-1',
        createdAt: now,
        updatedAt: now,
      deletedAt: null,
      items: [
          {
            id: 'item-1',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      const updated = {
        ...existing,
        observaciones: 'Updated observations',
        subtotal: new Decimal(200),
        total: new Decimal(180),
        descuento: new Decimal(20),
        items: [
          {
            id: 'item-2',
            ordenCompraId: 'po-1',
            productoCodigo: 'P-2',
            nombreProducto: 'New Product',
            cantidad: 20,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(200),
          },
        ],
      } as any;

      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(existing);
      prismaMock.$transaction.mockImplementation(async (operations: any) => {
        // Si es un array de operaciones, devolver array de resultados
        if (Array.isArray(operations)) {
          return [{}, updated]; // [deleteMany result, update result]
        }
        // Si es un callback, ejecutarlo
        return operations();
      });

      const result = await purchaseService.update('po-1', {
        observaciones: 'Updated observations',
        items: [{ productoId: 'P-2', nombreProducto: 'New Product', cantidad: 20, precioUnitario: 10 }],
        descuento: 20,
      });

      expect(result).toBeDefined();
      expect(result!.observaciones).toBe('Updated observations');
      expect(result!.subtotal).toBe(200);
      expect(result!.total).toBe(180);
      expect(AuditService.createAuditLog).toHaveBeenCalled();
    });

    it('should not update a non-pending purchase', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce({
        id: 'po-1',
        estado: 'RECIBIDA',
        items: [],
      } as any);

      await expect(
        purchaseService.update('po-1', { observaciones: 'New' }),
      ).rejects.toThrow('Solo se puede actualizar órdenes en estado PENDIENTE');
    });

    it('should throw if purchase not found', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      await expect(
        purchaseService.update('non-existent', {}),
      ).rejects.toThrow('Orden de compra no encontrada');
    });
  });

  describe('updateStatus', () => {
    it('should update status from Pendiente to En Transito', async () => {
      const now = new Date();
      const existing = {
        id: 'po-1',
        codigo: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        tipoComprobante: null,
        items: [],
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
      igv: new Decimal(0),
      total: new Decimal(100),
        formaPago: null,
        fechaEntregaEstimada: null,
        observaciones: null,
        creadoPorId: 'user-1',
        estado: 'PENDIENTE',
        createdAt: now,
        updatedAt: now,
      } as any;

      const updated = { ...existing, estado: 'EN_TRANSITO' } as any;

      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(existing);
      prismaMock.purchaseOrder.update.mockResolvedValueOnce(updated);

      const result = await purchaseService.updateStatus('po-1', 'EN_TRANSITO', 'user-1');

      expect(result).toBeDefined();
      expect(result!.estado).toBe('En Transito');
      expect(AuditService.createAuditLog).toHaveBeenCalled();
    });

    it('should throw if purchase not found for status update', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      await expect(
        purchaseService.updateStatus('non-existent', 'RECIBIDA', 'user-1'),
      ).rejects.toThrow('Orden de compra no encontrada');
    });
  });

  describe('delete', () => {
    it('should throw if purchase not found', async () => {
      prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce(null);

      await expect(purchaseService.delete('non-existent')).rejects.toThrow(
        'Orden de compra no encontrada',
      );
    });
  });
});




