import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import purchaseService from './purchaseService';
import { prisma } from '../config/database';

vi.mock('../config/database', () => ({
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

vi.mock('./auditService', () => ({
  __esModule: true,
  AuditService: {
    createAuditLog: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('./entidadService', () => ({
  __esModule: true,
  clientService: {
    getClientById: vi.fn(),
  },
}));

vi.mock('./productService', () => ({
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

import { AuditService } from './auditService';
import { clientService } from './entidadService';
import { productService } from './productService';

const prismaMock = prisma as any;

describe('Purchase Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
