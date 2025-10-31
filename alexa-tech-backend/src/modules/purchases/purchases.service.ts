import { prisma } from '../../config/database';
import {
  Purchase,
  PurchaseCreateInput,
  PurchaseUpdateInput,
  PurchaseStatusUpdateInput,
} from '../../types';
import { clientService } from '../../services/entidadService';
import { productService } from '../../services/productService';
import { AuditService } from '../../services/auditService';
import { inventoryService } from '../../services/inventoryService';

const genCodigoOrden = (): string => {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `OC-${y}${m}${d}-${hh}${mm}${ss}`;
};

export const purchaseService = {
  async create(data: PurchaseCreateInput, userId: string): Promise<Purchase> {
    // Validar proveedor
    const proveedor = await clientService.getClientById(data.proveedorId);
    if (!proveedor || !['Proveedor', 'Ambos'].includes(String(proveedor.tipoEntidad))) {
      throw new Error('Proveedor no encontrado o inválido');
    }

    // Calcular items y totales
    const items = data.items.map((it) => ({
      productCodigo: String(it.productoId),
      nombreProducto: it.nombreProducto ?? null,
      cantidad: Number(it.cantidad),
      precioUnitario: Number(it.precioUnitario) as any,
      subtotal: Number(it.cantidad) * Number(it.precioUnitario) as any,
    }));
    const subtotal = items.reduce((acc, cur) => acc + Number(cur.subtotal), 0);
    const descuento = Number(data.descuento ?? 0);
    const total = subtotal - descuento;

    // Generar código único
    let codigoOrden = genCodigoOrden();
    // Asegurar unicidad por si se crean simultáneamente
    const exists = await prisma.purchase.findUnique({ where: { codigoOrden } });
    if (exists) {
      codigoOrden = `${codigoOrden}-${Date.now()}`;
    }

    const now = new Date();
    const created = await prisma.purchase.create({
      data: {
        codigoOrden,
        proveedorId: data.proveedorId,
        almacenId: data.almacenId,
        fechaEmision: new Date(data.fechaEmision),
        fechaEntregaEstimada: data.fechaEntregaEstimada ? new Date(data.fechaEntregaEstimada) : null,
        tipoComprobante: (data.tipoComprobante as any) ?? null,
        formaPago: (data.formaPago as any) ?? null,
        subtotal: subtotal as any,
        descuento: descuento as any,
        total: total as any,
        estado: 'Pendiente' as any,
        observaciones: data.observaciones ?? null,
        usuarioId: userId,
        createdAt: now,
        updatedAt: now,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    await AuditService.createAuditLog({
      action: 'CREATE_PURCHASE_ORDER',
      userId,
      targetId: created.id,
      details: `Orden de compra creada: ${created.codigoOrden}`,
    });

    return {
      id: created.id,
      codigoOrden: created.codigoOrden,
      proveedorId: created.proveedorId,
      almacenId: created.almacenId,
      fechaEmision: created.fechaEmision.toISOString(),
      tipoComprobante: created.tipoComprobante ?? undefined,
      items: created.items.map((it) => ({
        productoId: it.productCodigo,
        nombreProducto: it.nombreProducto ?? undefined,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      subtotal: Number(created.subtotal),
      descuento: Number(created.descuento),
      total: Number(created.total),
      formaPago: created.formaPago ?? undefined,
      fechaEntregaEstimada: created.fechaEntregaEstimada?.toISOString(),
      observaciones: created.observaciones ?? undefined,
      usuarioId: created.usuarioId!,
      estado: created.estado as any,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async list(filters: any = {}): Promise<Purchase[]> {
    const where: any = {};
    if (filters.proveedorId) where.proveedorId = String(filters.proveedorId);
    if (filters.almacenId) where.almacenId = String(filters.almacenId);
    if (filters.estado) where.estado = String(filters.estado) as any;
    if (filters.fechaInicio || filters.fechaFin) {
      // Usar límites en UTC como espera el test
      const start = filters.fechaInicio ? new Date(filters.fechaInicio) : undefined;
      const end = filters.fechaFin ? new Date(filters.fechaFin) : undefined;
      where.fechaEmision = {};
      if (start) (where.fechaEmision as any).gte = start;
      if (end) (where.fechaEmision as any).lte = end; // inclusivo
    }
    if (filters.q) {
      const q = String(filters.q);
      where.OR = [
        { codigoOrden: { contains: q, mode: 'insensitive' } },
        { items: { some: { nombreProducto: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const purchases = await prisma.purchase.findMany({
      where,
      orderBy: { fechaEmision: 'desc' },
      include: { items: true },
    });

    return purchases.map((p) => ({
      id: p.id,
      codigoOrden: p.codigoOrden,
      proveedorId: p.proveedorId,
      almacenId: p.almacenId,
      fechaEmision: p.fechaEmision.toISOString(),
      tipoComprobante: p.tipoComprobante ?? undefined,
      items: p.items.map((it) => ({
        productoId: it.productCodigo,
        nombreProducto: it.nombreProducto ?? undefined,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      subtotal: Number(p.subtotal),
      descuento: Number(p.descuento),
      total: Number(p.total),
      formaPago: p.formaPago ?? undefined,
      fechaEntregaEstimada: p.fechaEntregaEstimada?.toISOString(),
      observaciones: p.observaciones ?? undefined,
      usuarioId: p.usuarioId!,
      estado: p.estado as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  },

  async getById(id: string): Promise<Purchase | null> {
    const p = await prisma.purchase.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!p) return null;
    return {
      id: p.id,
      codigoOrden: p.codigoOrden,
      proveedorId: p.proveedorId,
      almacenId: p.almacenId,
      fechaEmision: p.fechaEmision.toISOString(),
      tipoComprobante: p.tipoComprobante ?? undefined,
      items: p.items.map((it) => ({
        productoId: it.productCodigo,
        nombreProducto: it.nombreProducto ?? undefined,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      subtotal: Number(p.subtotal),
      descuento: Number(p.descuento),
      total: Number(p.total),
      formaPago: p.formaPago ?? undefined,
      fechaEntregaEstimada: p.fechaEntregaEstimada?.toISOString(),
      observaciones: p.observaciones ?? undefined,
      usuarioId: p.usuarioId!,
      estado: p.estado as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    };
  },

  async update(id: string, data: PurchaseUpdateInput, userId: string): Promise<Purchase> {
    const existing = await prisma.purchase.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new Error('Orden de compra no encontrada');
    if (existing.estado !== ('Pendiente' as any)) {
      throw new Error('Solo se puede actualizar órdenes en estado Pendiente');
    }

    // Preparar items
    const items = (data.items ?? existing.items.map((it) => ({
      productoId: it.productCodigo,
      nombreProducto: it.nombreProducto ?? undefined,
      cantidad: it.cantidad,
      precioUnitario: Number(it.precioUnitario),
    })) ).map((it) => ({
      productCodigo: String(it.productoId),
      nombreProducto: it.nombreProducto ?? null,
      cantidad: Number(it.cantidad),
      precioUnitario: Number(it.precioUnitario) as any,
      subtotal: Number(it.cantidad) * Number(it.precioUnitario) as any,
    }));

    const subtotal = items.reduce((acc, cur) => acc + Number(cur.subtotal), 0);
    const descuento = Number(data.descuento ?? Number(existing.descuento));
    const total = subtotal - descuento;

    const updated = await prisma.$transaction([
      prisma.purchaseItem.deleteMany({ where: { purchaseId: id } }),
      prisma.purchase.update({
        where: { id },
        data: {
          proveedorId: data.proveedorId ?? existing.proveedorId,
          almacenId: data.almacenId ?? existing.almacenId,
          fechaEmision: data.fechaEmision ? new Date(data.fechaEmision) : existing.fechaEmision,
          fechaEntregaEstimada: data.fechaEntregaEstimada ? new Date(data.fechaEntregaEstimada) : existing.fechaEntregaEstimada,
          tipoComprobante: (data.tipoComprobante as any) ?? existing.tipoComprobante,
          formaPago: (data.formaPago as any) ?? existing.formaPago,
          observaciones: data.observaciones ?? existing.observaciones,
          subtotal: subtotal as any,
          descuento: descuento as any,
          total: total as any,
          updatedAt: new Date(),
          items: { create: items },
        },
        include: { items: true },
      }),
    ]).then(([, purchase]) => purchase);

    await AuditService.createAuditLog({
      action: 'UPDATE_PURCHASE_ORDER',
      userId,
      targetId: id,
      details: `Orden de compra actualizada: ${existing.codigoOrden}`,
    });

    return {
      id: updated.id,
      codigoOrden: updated.codigoOrden,
      proveedorId: updated.proveedorId,
      almacenId: updated.almacenId,
      fechaEmision: updated.fechaEmision.toISOString(),
      tipoComprobante: updated.tipoComprobante ?? undefined,
      items: updated.items.map((it) => ({
        productoId: it.productCodigo,
        nombreProducto: it.nombreProducto ?? undefined,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      subtotal: Number(updated.subtotal),
      descuento: Number(updated.descuento),
      total: Number(updated.total),
      formaPago: updated.formaPago ?? undefined,
      fechaEntregaEstimada: updated.fechaEntregaEstimada?.toISOString(),
      observaciones: updated.observaciones ?? undefined,
      usuarioId: updated.usuarioId!,
      estado: updated.estado as any,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async updateStatus(id: string, data: PurchaseStatusUpdateInput, userId: string): Promise<Purchase> {
    const existing = await prisma.purchase.findUnique({ where: { id }, include: { items: true } });
    if (!existing) throw new Error('Orden de compra no encontrada');

    const prevEstado = existing.estado as any;
    const nextEstado = data.estado as any;

    const updated = await prisma.purchase.update({
      where: { id },
      data: { estado: nextEstado, updatedAt: new Date() },
      include: { items: true },
    });

    await AuditService.createAuditLog({
      action: 'CHANGE_PURCHASE_STATUS',
      userId,
      targetId: id,
      details: `Estado cambiado de ${prevEstado} a ${nextEstado} (${existing.codigoOrden})`,
    });

    if (nextEstado === ('Recibida' as any) && prevEstado !== ('Recibida' as any)) {
      // Aplicar ENTRADA de inventario por almacén usando inventoryService
      const itemsForInventory: Array<{ productId: string; cantidad: number }> = [];
      for (const it of existing.items) {
        const prod = await productService.findByCodigo(it.productCodigo);
        if (!prod) continue;
        itemsForInventory.push({ productId: prod.id, cantidad: Number(it.cantidad) });
      }
      if (itemsForInventory.length > 0 && existing.almacenId) {
        await inventoryService.applyPurchaseEntrada(id, itemsForInventory, existing.almacenId, userId);
      }
    }

    return {
      id: updated.id,
      codigoOrden: updated.codigoOrden,
      proveedorId: updated.proveedorId,
      almacenId: updated.almacenId,
      fechaEmision: updated.fechaEmision.toISOString(),
      tipoComprobante: updated.tipoComprobante ?? undefined,
      items: updated.items.map((it) => ({
        productoId: it.productCodigo,
        nombreProducto: it.nombreProducto ?? undefined,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      subtotal: Number(updated.subtotal),
      descuento: Number(updated.descuento),
      total: Number(updated.total),
      formaPago: updated.formaPago ?? undefined,
      fechaEntregaEstimada: updated.fechaEntregaEstimada?.toISOString(),
      observaciones: updated.observaciones ?? undefined,
      usuarioId: updated.usuarioId!,
      estado: updated.estado as any,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.purchase.findUnique({ where: { id } });
    if (!existing) throw new Error('Orden de compra no encontrada');
    if (existing.estado !== ('Pendiente' as any)) {
      throw new Error('Solo se puede eliminar órdenes en estado Pendiente');
    }

    await prisma.purchase.delete({ where: { id } });

    await AuditService.createAuditLog({
      action: 'DELETE_PURCHASE_ORDER',
      userId,
      targetId: id,
      details: `Orden de compra eliminada: ${existing.codigoOrden}`,
    });
  },
};

export default purchaseService;