import {
  Purchase,
  PurchaseCreateInput,
  PurchaseUpdateInput,
  PurchaseStatusUpdateInput,
} from '../types';
import { clientService } from './entidadService';
import { productService } from './productService';
import { AuditService } from './auditService';
import crypto from 'node:crypto';

// Servicio de Compras (en memoria por ahora)
const purchases = new Map<string, Purchase>();

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
    if (
      !proveedor ||
      !['Proveedor', 'Ambos'].includes(String(proveedor.tipoEntidad))
    ) {
      throw new Error('Proveedor no encontrado o inválido');
    }

    // Nota: Validación de almacén pendiente (no hay servicio de almacén)

    // Calcular totales
    const items = data.items.map((it) => ({
      productoId: String(it.productoId),
      nombreProducto: it.nombreProducto,
      cantidad: Number(it.cantidad),
      precioUnitario: Number(it.precioUnitario),
      subtotal: Number(it.cantidad) * Number(it.precioUnitario),
    }));
    const subtotal = items.reduce((acc, cur) => acc + cur.subtotal, 0);
    const total = subtotal; // sin impuestos por ahora

    // Generar ID y código únicos
    const id = crypto.randomUUID();
    let codigoOrden = genCodigoOrden();
    while ([...purchases.values()].some((p) => p.codigoOrden === codigoOrden)) {
      codigoOrden = genCodigoOrden();
    }

    const nowIso = new Date().toISOString();
    const purchase: Purchase = {
      id,
      codigoOrden,
      proveedorId: data.proveedorId,
      almacenId: data.almacenId,
      fechaEmision: data.fechaEmision,
      tipoComprobante: data.tipoComprobante,
      items,
      subtotal,
      total,
      formaPago: data.formaPago,
      fechaEntregaEstimada: data.fechaEntregaEstimada,
      observaciones: data.observaciones,
      usuarioId: userId,
      estado: 'Pendiente',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    purchases.set(id, purchase);

    await AuditService.createAuditLog({
      action: 'CREATE_PURCHASE_ORDER',
      userId,
      targetId: id,
      details: `Orden de compra creada: ${codigoOrden}`,
    });

    return purchase;
  },

  async list(filters: any = {}): Promise<Purchase[]> {
    const all = [...purchases.values()];
    const q = String(filters.q || '').toLowerCase();
    const proveedorId = filters.proveedorId
      ? String(filters.proveedorId)
      : undefined;
    const almacenId = filters.almacenId ? String(filters.almacenId) : undefined;
    const estado = filters.estado ? String(filters.estado) : undefined;
    const fechaInicio = filters.fechaInicio
      ? new Date(filters.fechaInicio)
      : undefined;
    const fechaFin = filters.fechaFin ? new Date(filters.fechaFin) : undefined;

    return all.filter((p) => {
      if (q) {
        const matchQ =
          p.codigoOrden.toLowerCase().includes(q) ||
          p.items.some((it) =>
            (it.nombreProducto || '').toLowerCase().includes(q),
          );
        if (!matchQ) return false;
      }
      if (proveedorId && p.proveedorId !== proveedorId) return false;
      if (almacenId && p.almacenId !== almacenId) return false;
      if (estado && p.estado !== estado) return false;
      if (fechaInicio && new Date(p.fechaEmision) < fechaInicio) return false;
      if (fechaFin && new Date(p.fechaEmision) > fechaFin) return false;
      return true;
    });
  },

  async getById(id: string): Promise<Purchase | null> {
    return purchases.get(id) || null;
  },

  async update(
    id: string,
    data: PurchaseUpdateInput,
    userId: string,
  ): Promise<Purchase> {
    const existing = purchases.get(id);
    if (!existing) throw new Error('Orden de compra no encontrada');
    if (existing.estado !== 'Pendiente') {
      throw new Error('Solo se puede actualizar órdenes en estado Pendiente');
    }

    const merged: Purchase = {
      ...existing,
      proveedorId: data.proveedorId ?? existing.proveedorId,
      almacenId: data.almacenId ?? existing.almacenId,
      fechaEmision: data.fechaEmision ?? existing.fechaEmision,
      tipoComprobante: data.tipoComprobante ?? existing.tipoComprobante,
      formaPago: data.formaPago ?? existing.formaPago,
      observaciones: data.observaciones ?? existing.observaciones,
      fechaEntregaEstimada:
        data.fechaEntregaEstimada ?? existing.fechaEntregaEstimada,
      items: data.items
        ? data.items.map((it) => ({
            productoId: String(it.productoId),
            nombreProducto: it.nombreProducto,
            cantidad: Number(it.cantidad),
            precioUnitario: Number(it.precioUnitario),
            subtotal: Number(it.cantidad) * Number(it.precioUnitario),
          }))
        : existing.items,
    };
    merged.subtotal = merged.items.reduce((acc, cur) => acc + cur.subtotal, 0);
    merged.total = merged.subtotal;
    merged.updatedAt = new Date().toISOString();

    purchases.set(id, merged);

    await AuditService.createAuditLog({
      action: 'UPDATE_PURCHASE_ORDER',
      userId,
      targetId: id,
      details: `Orden de compra actualizada: ${existing.codigoOrden}`,
    });

    return merged;
  },

  async updateStatus(
    id: string,
    data: PurchaseStatusUpdateInput,
    userId: string,
  ): Promise<Purchase> {
    const existing = purchases.get(id);
    if (!existing) throw new Error('Orden de compra no encontrada');

    const prevEstado = existing.estado;
    const nextEstado = data.estado;
    const updated: Purchase = {
      ...existing,
      estado: nextEstado,
      updatedAt: new Date().toISOString(),
    };
    purchases.set(id, updated);

    await AuditService.createAuditLog({
      action: 'CHANGE_PURCHASE_STATUS',
      userId,
      targetId: id,
      details: `Estado cambiado de ${prevEstado} a ${nextEstado} (${existing.codigoOrden})`,
    });

    // Efecto: actualizar stock al pasar a Recibida
    if (nextEstado === 'Recibida' && prevEstado !== 'Recibida') {
      for (const it of existing.items) {
        // Interpretar productoId como código de producto
        const prod = await productService.findByCodigo(it.productoId);
        if (!prod) continue;
        const newStock = Number(prod.stock || 0) + Number(it.cantidad);
        await productService.updateByCodigo(
          String(prod.codigo),
          { stock: newStock } as any,
          userId,
        );
      }
    }

    return updated;
  },
};

export default purchaseService;