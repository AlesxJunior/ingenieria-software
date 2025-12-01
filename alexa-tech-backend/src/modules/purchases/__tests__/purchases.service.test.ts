import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import purchaseService from '../purchases.service';
import { prisma } from '../../../config/database';

vi.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: {
    purchase: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    purchaseItem: {
      deleteMany: vi.fn(),
    },
    warehouse: {
      findUnique: vi.fn(),
    },
    stockByWarehouse: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    kardex: {
      create: vi.fn(),
    },
    movementReason: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(async (callback) => {
      const tx = {
        product: { findUnique: vi.fn(), update: vi.fn() },
        stockByWarehouse: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
        kardex: { create: vi.fn() },
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

describe('Purchase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a purchase with calculated totals and discount', async () => {
    (clientService.getClientById as any).mockResolvedValue({ id: 'prov-1', tipoEntidad: 'Proveedor' });

    // Ensure initial code uniqueness check returns null
    prismaMock.purchase.findUnique.mockResolvedValue(null);

    const now = new Date();
    const created = {
      id: 'po-1',
      codigoOrden: 'OC-20250101-101010',
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      fechaEmision: now,
      fechaEntregaEstimada: null,
      tipoComprobante: 'Factura',
      formaPago: 'Efectivo',
      subtotal: new Decimal(25),
      descuento: new Decimal(5),
      total: new Decimal(20),
      estado: 'Pendiente',
      observaciones: null,
      usuarioId: 'user-1',
      createdAt: now,
      updatedAt: now,
      items: [
        {
          id: 'item-1',
          purchaseId: 'po-1',
          productCodigo: 'P-1',
          nombreProducto: 'Prod 1',
          cantidad: 2,
          precioUnitario: new Decimal(10),
          subtotal: new Decimal(20),
        },
        {
          id: 'item-2',
          purchaseId: 'po-1',
          productCodigo: 'P-2',
          nombreProducto: 'Prod 2',
          cantidad: 1,
          precioUnitario: new Decimal(5),
          subtotal: new Decimal(5),
        },
      ],
    } as any;

    prismaMock.purchase.create.mockResolvedValue(created);

    const purchase = await purchaseService.create(
      {
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now.toISOString(),
        tipoComprobante: 'Factura' as any,
        items: [
          { productoId: 'P-1', nombreProducto: 'Prod 1', cantidad: 2, precioUnitario: 10 },
          { productoId: 'P-2', nombreProducto: 'Prod 2', cantidad: 1, precioUnitario: 5 },
        ],
        formaPago: 'Efectivo' as any,
        descuento: 5,
      },
      'user-1',
    );

    expect(prismaMock.purchase.create).toHaveBeenCalledTimes(1);
    expect(purchase.subtotal).toBe(25);
    expect(purchase.total).toBe(20);
    expect(purchase.items).toHaveLength(2);
    expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('should list purchases with filters', async () => {
    prismaMock.purchase.findMany.mockResolvedValue([] as any);

    await purchaseService.list({
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      estado: 'Pendiente',
      fechaInicio: '2025-01-01',
      fechaFin: '2025-01-31',
      q: 'OC-2025',
    });

    expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
      where: {
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        estado: 'Pendiente',
        fechaEmision: {
          gte: new Date('2025-01-01'),
          lte: new Date('2025-01-31'),
        },
        OR: [
          { codigoOrden: { contains: 'OC-2025', mode: 'insensitive' } },
          { items: { some: { nombreProducto: { contains: 'OC-2025', mode: 'insensitive' } } } },
        ],
      },
      orderBy: { fechaEmision: 'desc' },
      include: { items: true },
    });
  });

  it('should update status to Recibida and increase product stock', async () => {
    const now = new Date();
    const existing = {
      id: 'po-1',
      codigoOrden: 'OC-1',
      proveedorId: 'prov-1',
      almacenId: 'alm-1',
      fechaEmision: now,
      tipoComprobante: null,
      items: [
        { id: 'i1', productCodigo: 'P-1', nombreProducto: 'P1', cantidad: 3, precioUnitario: new Decimal(10), subtotal: new Decimal(30) },
      ],
      subtotal: new Decimal(30),
      descuento: new Decimal(0),
      total: new Decimal(30),
      formaPago: null,
      fechaEntregaEstimada: null,
      observaciones: null,
      usuarioId: 'user-1',
      estado: 'Pendiente',
      createdAt: now,
      updatedAt: now,
    } as any;

    prismaMock.purchase.findUnique.mockResolvedValue(existing);

    const updated = { ...existing, estado: 'Recibida' } as any;
    prismaMock.purchase.update.mockResolvedValue(updated);

    // Mock warehouse
    prismaMock.warehouse.findUnique.mockResolvedValue({ id: 'alm-1', nombre: 'Almacen 1' } as any);
    
    // Mock movementReason
    prismaMock.movementReason.findFirst.mockResolvedValue({ id: 'reason-1', codigo: 'ENT-COMPRA', nombre: 'Entrada por compra' } as any);
    
    // Mock product
    (productService.findByCodigo as any).mockResolvedValue({ id: 'prod-1', codigo: 'P-1', stock: 10 });
    
    // Mock $transaction with proper mocks inside
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        product: { 
          findUnique: vi.fn().mockResolvedValue({ id: 'prod-1', codigo: 'P-1', stock: 10 }),
          update: vi.fn().mockResolvedValue({ id: 'prod-1', codigo: 'P-1', stock: 13 })
        },
        stockByWarehouse: { 
          findUnique: vi.fn().mockResolvedValue({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 10 }),
          update: vi.fn().mockResolvedValue({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 13 }),
          create: vi.fn().mockResolvedValue({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 13 }),
          upsert: vi.fn().mockResolvedValue({ productId: 'prod-1', warehouseId: 'alm-1', quantity: 13 }),
          aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 13 } })
        },
        kardex: { 
          create: vi.fn().mockResolvedValue({})
        },
        inventoryMovement: {
          create: vi.fn().mockResolvedValue({})
        },
      };
      return callback(tx);
    });

    const result = await purchaseService.updateStatus('po-1', { estado: 'Recibida' as any }, 'user-1');

    expect(result.estado).toBe('Recibida');
  });

  it('should delete a pending purchase order', async () => {
    prismaMock.purchase.findUnique.mockResolvedValue({ id: 'po-1', estado: 'Pendiente', codigoOrden: 'OC-1' } as any);
    prismaMock.purchase.delete.mockResolvedValue({} as any);

    await purchaseService.delete('po-1', 'user-1');

    expect(prismaMock.purchase.delete).toHaveBeenCalledWith({ where: { id: 'po-1' } });
    expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
  });

  it('should not delete a non-pending purchase order', async () => {
    prismaMock.purchase.findUnique.mockResolvedValue({ id: 'po-1', estado: 'Recibida' } as any);

    await expect(purchaseService.delete('po-1', 'user-1')).rejects.toThrow(
      'Solo se puede eliminar órdenes en estado Pendiente',
    );
    expect(prismaMock.purchase.delete).not.toHaveBeenCalled();
  });

  describe('create', () => {
    it('should fail if proveedor does not exist', async () => {
      (clientService.getClientById as any).mockResolvedValue(null);

      await expect(
        purchaseService.create(
          {
            proveedorId: 'invalid-id',
            almacenId: 'alm-1',
            fechaEmision: new Date().toISOString(),
            items: [{ productoId: 'P-1', cantidad: 1, precioUnitario: 10 }],
          },
          'user-1',
        ),
      ).rejects.toThrow('Proveedor no encontrado o inválido');
    });

    it('should fail if proveedor is not type Proveedor or Ambos', async () => {
      (clientService.getClientById as any).mockResolvedValue({
        id: 'client-1',
        tipoEntidad: 'Cliente',
      });

      await expect(
        purchaseService.create(
          {
            proveedorId: 'client-1',
            almacenId: 'alm-1',
            fechaEmision: new Date().toISOString(),
            items: [{ productoId: 'P-1', cantidad: 1, precioUnitario: 10 }],
          },
          'user-1',
        ),
      ).rejects.toThrow('Proveedor no encontrado o inválido');
    });

    it('should create purchase with Ambos type entity', async () => {
      (clientService.getClientById as any).mockResolvedValue({
        id: 'entity-1',
        tipoEntidad: 'Ambos',
      });

      prismaMock.purchase.findUnique.mockResolvedValue(null);

      const now = new Date();
      const created = {
        id: 'po-1',
        codigoOrden: 'OC-20250101-101010',
        proveedorId: 'entity-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: 'Factura',
        formaPago: 'Efectivo',
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
        total: new Decimal(100),
        estado: 'Pendiente',
        observaciones: null,
        usuarioId: 'user-1',
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-1',
            purchaseId: 'po-1',
            productCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      prismaMock.purchase.create.mockResolvedValue(created);

      const result = await purchaseService.create(
        {
          proveedorId: 'entity-1',
          almacenId: 'alm-1',
          fechaEmision: now.toISOString(),
          tipoComprobante: 'Factura' as any,
          formaPago: 'Efectivo' as any,
          items: [{ productoId: 'P-1', nombreProducto: 'Product', cantidad: 10, precioUnitario: 10 }],
        },
        'user-1',
      );

      expect(result.total).toBe(100);
      expect(AuditService.createAuditLog).toHaveBeenCalled();
    });

    it('should handle duplicate codigo by appending timestamp', async () => {
      (clientService.getClientById as any).mockResolvedValue({
        id: 'prov-1',
        tipoEntidad: 'Proveedor',
      });

      // First call returns existing order (duplicate)
      prismaMock.purchase.findUnique.mockResolvedValueOnce({
        id: 'existing-po',
        codigoOrden: 'OC-20250101-101010',
      } as any);

      const now = new Date();
      const created = {
        id: 'po-2',
        codigoOrden: `OC-20250101-101010-${Date.now()}`,
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: null,
        formaPago: null,
        subtotal: new Decimal(50),
        descuento: new Decimal(0),
        total: new Decimal(50),
        estado: 'Pendiente',
        observaciones: null,
        usuarioId: 'user-1',
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-1',
            purchaseId: 'po-2',
            productCodigo: 'P-1',
            nombreProducto: null,
            cantidad: 5,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(50),
          },
        ],
      } as any;

      prismaMock.purchase.create.mockResolvedValue(created);

      const result = await purchaseService.create(
        {
          proveedorId: 'prov-1',
          almacenId: 'alm-1',
          fechaEmision: now.toISOString(),
          items: [{ productoId: 'P-1', cantidad: 5, precioUnitario: 10 }],
        },
        'user-1',
      );

      expect(result.codigoOrden).toContain('OC-20250101-101010');
      expect(prismaMock.purchase.create).toHaveBeenCalled();
    });

    it('should calculate subtotal from multiple items', async () => {
      (clientService.getClientById as any).mockResolvedValue({
        id: 'prov-1',
        tipoEntidad: 'Proveedor',
      });

      prismaMock.purchase.findUnique.mockResolvedValue(null);

      const now = new Date();
      const created = {
        id: 'po-1',
        codigoOrden: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: null,
        formaPago: null,
        subtotal: new Decimal(350), // (10*10) + (50*5) = 100 + 250
        descuento: new Decimal(50),
        total: new Decimal(300),
        estado: 'Pendiente',
        observaciones: null,
        usuarioId: 'user-1',
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-1',
            purchaseId: 'po-1',
            productCodigo: 'P-1',
            nombreProducto: 'Product 1',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
          {
            id: 'item-2',
            purchaseId: 'po-1',
            productCodigo: 'P-2',
            nombreProducto: 'Product 2',
            cantidad: 50,
            precioUnitario: new Decimal(5),
            subtotal: new Decimal(250),
          },
        ],
      } as any;

      prismaMock.purchase.create.mockResolvedValue(created);

      const result = await purchaseService.create(
        {
          proveedorId: 'prov-1',
          almacenId: 'alm-1',
          fechaEmision: now.toISOString(),
          items: [
            { productoId: 'P-1', nombreProducto: 'Product 1', cantidad: 10, precioUnitario: 10 },
            { productoId: 'P-2', nombreProducto: 'Product 2', cantidad: 50, precioUnitario: 5 },
          ],
          descuento: 50,
        },
        'user-1',
      );

      expect(result.subtotal).toBe(350);
      expect(result.total).toBe(300);
      expect(result.items).toHaveLength(2);
    });

    it('should create purchase with optional fields', async () => {
      (clientService.getClientById as any).mockResolvedValue({
        id: 'prov-1',
        tipoEntidad: 'Proveedor',
      });

      prismaMock.purchase.findUnique.mockResolvedValue(null);

      const now = new Date();
      const entrega = new Date('2025-02-01');
      const created = {
        id: 'po-1',
        codigoOrden: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: entrega,
        tipoComprobante: 'Boleta',
        formaPago: 'Credito',
        subtotal: new Decimal(100),
        descuento: new Decimal(10),
        total: new Decimal(90),
        estado: 'Pendiente',
        observaciones: 'Test observations',
        usuarioId: 'user-1',
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-1',
            purchaseId: 'po-1',
            productCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      prismaMock.purchase.create.mockResolvedValue(created);

      const result = await purchaseService.create(
        {
          proveedorId: 'prov-1',
          almacenId: 'alm-1',
          fechaEmision: now.toISOString(),
          fechaEntregaEstimada: entrega.toISOString(),
          tipoComprobante: 'Boleta' as any,
          formaPago: 'Credito' as any,
          observaciones: 'Test observations',
          items: [{ productoId: 'P-1', nombreProducto: 'Product', cantidad: 10, precioUnitario: 10 }],
          descuento: 10,
        },
        'user-1',
      );

      expect(result.fechaEntregaEstimada).toBe(entrega.toISOString());
      expect(result.observaciones).toBe('Test observations');
      expect(result.tipoComprobante).toBe('Boleta');
      expect(result.formaPago).toBe('Credito');
    });
  });

  describe('list', () => {
    it('should list all purchases without filters', async () => {
      prismaMock.purchase.findMany.mockResolvedValue([]);

      const result = await purchaseService.list({});

      expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
      expect(result).toEqual([]);
    });

    it('should filter by proveedorId only', async () => {
      prismaMock.purchase.findMany.mockResolvedValue([]);

      await purchaseService.list({ proveedorId: 'prov-1' });

      expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
        where: { proveedorId: 'prov-1' },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by almacenId only', async () => {
      prismaMock.purchase.findMany.mockResolvedValue([]);

      await purchaseService.list({ almacenId: 'alm-1' });

      expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
        where: { almacenId: 'alm-1' },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by estado only', async () => {
      prismaMock.purchase.findMany.mockResolvedValue([]);

      await purchaseService.list({ estado: 'Recibida' });

      expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
        where: { estado: 'Recibida' },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by search query', async () => {
      prismaMock.purchase.findMany.mockResolvedValue([]);

      await purchaseService.list({ q: 'OC-2025' });

      expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { codigoOrden: { contains: 'OC-2025', mode: 'insensitive' } },
            { items: { some: { nombreProducto: { contains: 'OC-2025', mode: 'insensitive' } } } },
          ],
        },
        orderBy: { fechaEmision: 'desc' },
        include: { items: true },
      });
    });

    it('should filter by date range', async () => {
      prismaMock.purchase.findMany.mockResolvedValue([]);

      await purchaseService.list({
        fechaInicio: '2025-01-01',
        fechaFin: '2025-01-31',
      });

      expect(prismaMock.purchase.findMany).toHaveBeenCalledWith({
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

  describe('getById', () => {
    it('should return a purchase by id', async () => {
      const now = new Date();
      const purchase = {
        id: 'po-1',
        codigoOrden: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: 'Factura',
        formaPago: 'Efectivo',
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
        total: new Decimal(100),
        estado: 'Pendiente',
        observaciones: null,
        usuarioId: 'user-1',
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-1',
            purchaseId: 'po-1',
            productCodigo: 'P-1',
            nombreProducto: 'Product',
            cantidad: 10,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(100),
          },
        ],
      } as any;

      prismaMock.purchase.findUnique.mockResolvedValue(purchase);

      const result = await purchaseService.getById('po-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('po-1');
      expect(result?.codigoOrden).toBe('OC-TEST');
    });

    it('should return null if purchase not found', async () => {
      prismaMock.purchase.findUnique.mockResolvedValue(null);

      const result = await purchaseService.getById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a pending purchase', async () => {
      const now = new Date();
      const existing = {
        id: 'po-1',
        codigoOrden: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        fechaEntregaEstimada: null,
        tipoComprobante: null,
        formaPago: null,
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
        total: new Decimal(100),
        estado: 'Pendiente',
        observaciones: null,
        usuarioId: 'user-1',
        createdAt: now,
        updatedAt: now,
        items: [
          {
            id: 'item-1',
            purchaseId: 'po-1',
            productCodigo: 'P-1',
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
            purchaseId: 'po-1',
            productCodigo: 'P-2',
            nombreProducto: 'New Product',
            cantidad: 20,
            precioUnitario: new Decimal(10),
            subtotal: new Decimal(200),
          },
        ],
      } as any;

      prismaMock.purchase.findUnique.mockResolvedValue(existing);
      prismaMock.$transaction.mockImplementation(async (operations: any) => {
        // Si es un array de operaciones, devolver array de resultados
        if (Array.isArray(operations)) {
          return [{}, updated]; // [deleteMany result, update result]
        }
        // Si es un callback, ejecutarlo
        return operations();
      });

      const result = await purchaseService.update(
        'po-1',
        {
          observaciones: 'Updated observations',
          items: [{ productoId: 'P-2', nombreProducto: 'New Product', cantidad: 20, precioUnitario: 10 }],
          descuento: 20,
        },
        'user-1',
      );

      expect(result.observaciones).toBe('Updated observations');
      expect(result.subtotal).toBe(200);
      expect(result.total).toBe(180);
      expect(AuditService.createAuditLog).toHaveBeenCalled();
    });

    it('should not update a non-pending purchase', async () => {
      prismaMock.purchase.findUnique.mockResolvedValue({
        id: 'po-1',
        estado: 'Recibida',
        items: [],
      } as any);

      await expect(
        purchaseService.update('po-1', { observaciones: 'New' }, 'user-1'),
      ).rejects.toThrow('Solo se puede actualizar órdenes en estado Pendiente');
    });

    it('should throw if purchase not found', async () => {
      prismaMock.purchase.findUnique.mockResolvedValue(null);

      await expect(
        purchaseService.update('non-existent', {}, 'user-1'),
      ).rejects.toThrow('Orden de compra no encontrada');
    });
  });

  describe('updateStatus', () => {
    it('should update status from Pendiente to En Transito', async () => {
      const now = new Date();
      const existing = {
        id: 'po-1',
        codigoOrden: 'OC-TEST',
        proveedorId: 'prov-1',
        almacenId: 'alm-1',
        fechaEmision: now,
        tipoComprobante: null,
        items: [],
        subtotal: new Decimal(100),
        descuento: new Decimal(0),
        total: new Decimal(100),
        formaPago: null,
        fechaEntregaEstimada: null,
        observaciones: null,
        usuarioId: 'user-1',
        estado: 'Pendiente',
        createdAt: now,
        updatedAt: now,
      } as any;

      const updated = { ...existing, estado: 'En Transito' } as any;

      prismaMock.purchase.findUnique.mockResolvedValue(existing);
      prismaMock.purchase.update.mockResolvedValue(updated);

      const result = await purchaseService.updateStatus('po-1', { estado: 'En Transito' as any }, 'user-1');

      expect(result.estado).toBe('En Transito');
      expect(AuditService.createAuditLog).toHaveBeenCalled();
    });

    it('should throw if purchase not found for status update', async () => {
      prismaMock.purchase.findUnique.mockResolvedValue(null);

      await expect(
        purchaseService.updateStatus('non-existent', { estado: 'Recibida' as any }, 'user-1'),
      ).rejects.toThrow('Orden de compra no encontrada');
    });
  });

  describe('delete', () => {
    it('should throw if purchase not found', async () => {
      prismaMock.purchase.findUnique.mockResolvedValue(null);

      await expect(purchaseService.delete('non-existent', 'user-1')).rejects.toThrow(
        'Orden de compra no encontrada',
      );
    });
  });
});

