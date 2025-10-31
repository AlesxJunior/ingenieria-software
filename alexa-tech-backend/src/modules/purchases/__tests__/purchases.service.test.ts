import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { Decimal } from '@prisma/client/runtime/library';
import purchaseService from '../purchases.service';
import { prisma } from '../../../config/database';

jest.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

jest.mock('./auditService', () => ({
  __esModule: true,
  AuditService: {
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('./entidadService', () => ({
  __esModule: true,
  clientService: {
    getClientById: jest.fn(),
  },
}));

jest.mock('./productService', () => ({
  __esModule: true,
  productService: {
    findByCodigo: jest.fn(),
    updateByCodigo: jest.fn(),
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
const { AuditService } = jest.requireMock('./auditService');
const { clientService } = jest.requireMock('./entidadService');
const { productService } = jest.requireMock('./productService');

describe('Purchase Service', () => {
  beforeEach(() => {
    mockReset(prismaMock);
    (AuditService.createAuditLog as jest.Mock).mockClear();
    (clientService.getClientById as jest.Mock).mockReset();
    (productService.findByCodigo as jest.Mock).mockReset();
    (productService.updateByCodigo as jest.Mock).mockReset();
  });

  it('should create a purchase with calculated totals and discount', async () => {
    (clientService.getClientById as jest.Mock).mockResolvedValue({ id: 'prov-1', tipoEntidad: 'Proveedor' });

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

    (productService.findByCodigo as jest.Mock).mockResolvedValue({ codigo: 'P-1', stock: 10 });
    (productService.updateByCodigo as jest.Mock).mockResolvedValue({ codigo: 'P-1', stock: 13 });

    const result = await purchaseService.updateStatus('po-1', { estado: 'Recibida' as any }, 'user-1');

    expect(result.estado).toBe('Recibida');
    expect(productService.findByCodigo).toHaveBeenCalledWith('P-1');
    expect(productService.updateByCodigo).toHaveBeenCalledWith('P-1', { stock: 13 }, 'user-1');
    expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
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