import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

export type StockEstado = 'CRITICO' | 'BAJO' | 'NORMAL';

export interface StockFilters {
  almacenId?: string;
  q?: string; // search by codigo or nombre
  estado?: StockEstado;
  page?: number;
  pageSize?: number;
  sortBy?: 'cantidad' | 'estado' | 'producto';
  order?: 'asc' | 'desc';
}

export interface StockRow {
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  cantidad: number;
  stockMinimo: number | null;
  estado: StockEstado;
}

export interface StockByWarehouseRow {
  stockByWarehouseId: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  warehouseId: string;
  cantidad: number;
  stockMinimo: number | null;
  estado: StockEstado;
  updatedAt: string;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface KardexFilters {
  productId?: string;
  tipoMovimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  warehouseId?: string;
  fechaDesde?: string; // ISO
  fechaHasta?: string; // ISO
  page?: number;
  pageSize?: number;
  sortBy?: 'fecha' | 'tipo' | 'cantidad';
  order?: 'asc' | 'desc';
}

export interface KardexRow {
  id: string;
  fecha: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo?: string;
  usuario?: string;
  documentoReferencia?: string | null;
}

export interface AjusteBody {
  productId: string;
  warehouseId: string;
  cantidadAjuste: number; // puede ser positivo o negativo
  tipoAjuste?: 'INCREMENT' | 'DECREMENT';
  adjustmentReason?: 'MermaDanio' | 'MermaRotura' | 'DevolucionCliente' | 'ErrorConteo' | 'OtroRazon';
  reasonId?: string; // Nuevo: ID del motivo de movimiento desde MovementReason
  observaciones?: string;
}

function calcularEstado(cantidad: number, stockMinimo: number | null): StockEstado {
  const min = Number(stockMinimo ?? 0);
  if (min <= 0) return 'NORMAL';
  if (cantidad <= Math.floor(min * 0.5)) return 'CRITICO';
  if (cantidad < min) return 'BAJO';
  return 'NORMAL';
}

export const inventoryService = {
  // Existente: listado simple para compatibilidad
  async getStock(filters: StockFilters): Promise<StockRow[]> {
    const page = Number(filters.page || 1);
    const pageSize = Math.min(Number(filters.pageSize || 20), 100);
    const skip = (page - 1) * pageSize;

    const where: Prisma.StockByWarehouseWhereInput = {
      warehouseId: filters.almacenId ? String(filters.almacenId) : undefined,
      product: filters.q
        ? {
            OR: [
              { codigo: { contains: String(filters.q), mode: 'insensitive' } },
              { nombre: { contains: String(filters.q), mode: 'insensitive' } },
            ],
          }
        : undefined,
    };

    const records = await prisma.stockByWarehouse.findMany({
      where,
      include: { product: true, warehouse: true },
      skip,
      take: pageSize,
      orderBy:
        filters.sortBy === 'producto'
          ? { product: { nombre: filters.order || 'asc' } }
          : { quantity: filters.order || 'desc' },
    });

    const rows: StockRow[] = records.map((r) => {
      const minStock = r.minStock ?? r.product.minStock ?? null;
      const estado = calcularEstado(r.quantity, minStock);
      return {
        productId: r.productId,
        codigo: r.product.codigo,
        nombre: r.product.nombre,
        almacen: r.warehouse.nombre,
        cantidad: r.quantity,
        stockMinimo: minStock,
        estado,
      };
    });

    return filters.estado ? rows.filter((x) => x.estado === filters.estado) : rows;
  },

  // Nuevo: listado con ID, updatedAt y paginación
  async getStockByWarehouse(filters: {
    almacenId?: string;
    productId?: string;
    estado?: StockEstado;
    page?: number;
    limit?: number;
    sortBy?: 'cantidad' | 'updatedAt' | 'producto';
    order?: 'asc' | 'desc';
  }): Promise<Paginated<StockByWarehouseRow>> {
    const page = Number(filters.page || 1);
    const limit = Math.min(Number(filters.limit || 20), 200);
    const skip = (page - 1) * limit;

    const where: Prisma.StockByWarehouseWhereInput = {
      warehouseId: filters.almacenId ?? undefined,
      productId: filters.productId ?? undefined,
    };

    const [total, records] = await Promise.all([
      prisma.stockByWarehouse.count({ where }),
      prisma.stockByWarehouse.findMany({
        where,
        include: { product: true, warehouse: true },
        skip,
        take: limit,
        orderBy:
          filters.sortBy === 'producto'
            ? { product: { nombre: filters.order || 'asc' } }
            : filters.sortBy === 'updatedAt'
            ? { updatedAt: filters.order || 'desc' }
            : { quantity: filters.order || 'desc' },
      }),
    ]);

    let rows: StockByWarehouseRow[] = records.map((r) => {
      const minStock = r.minStock ?? r.product.minStock ?? null;
      const estado = calcularEstado(r.quantity, minStock);
      return {
        stockByWarehouseId: r.id,
        productId: r.productId,
        codigo: r.product.codigo,
        nombre: r.product.nombre,
        almacen: r.warehouse.nombre,
        warehouseId: r.warehouseId,
        cantidad: r.quantity,
        stockMinimo: minStock,
        estado,
        updatedAt: r.updatedAt.toISOString(),
      };
    });

    if (filters.estado) rows = rows.filter((x) => x.estado === filters.estado);

    return {
      rows,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    };
  },

  async getKardex(filters: KardexFilters): Promise<Paginated<KardexRow>> {
    const page = Number(filters.page || 1);
    const pageSize = Math.min(Number(filters.pageSize || 50), 200);
    const skip = (page - 1) * pageSize;

    const where: Prisma.InventoryMovementWhereInput = {
      productId: filters.productId,
      warehouseId: filters.warehouseId,
      ...(filters.tipoMovimiento && { type: filters.tipoMovimiento as any }),
      createdAt: {
        gte: filters.fechaDesde ? new Date(filters.fechaDesde) : undefined,
        lte: filters.fechaHasta ? new Date(filters.fechaHasta) : undefined,
      },
    };

    const [total, movements] = await Promise.all([
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.findMany({
        where,
        orderBy:
          filters.sortBy === 'fecha'
            ? { createdAt: filters.order || 'desc' }
            : filters.sortBy === 'tipo'
            ? { type: filters.order || 'asc' }
            : filters.sortBy === 'cantidad'
            ? { quantity: filters.order || 'desc' }
            : { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { 
          product: true, 
          warehouse: true, 
          user: true,
          movementReason: true // Incluir el motivo de movimiento
        },
      }),
    ]);

    const rows: KardexRow[] = movements.map((m) => ({
      id: m.id,
      fecha: m.createdAt.toISOString(),
      productId: m.productId,
      codigo: (m as any).product?.codigo,
      nombre: (m as any).product?.nombre,
      almacen: (m as any).warehouse?.nombre,
      tipo: m.type as any,
      cantidad: m.quantity,
      stockAntes: m.stockBefore,
      stockDespues: m.stockAfter,
      motivo: (m as any).movementReason?.nombre || m.reason || undefined, // Priorizar nombre del motivo
      usuario: (m as any).user?.username ?? undefined,
      documentoReferencia: m.documentRef ?? null,
    }));

    return {
      rows,
      total,
      page,
      limit: pageSize,
      pages: Math.ceil(total / pageSize) || 1,
    };
  },

  // Existente: ajustar stock con dirección explícita (se mantiene para compatibilidad)
  async ajustarStock(body: {
    productId: string;
    warehouseId: string;
    cantidadAjuste: number;
    adjustmentDirection: 'INCREMENT' | 'DECREMENT';
    adjustmentReason?: 'MermaDanio' | 'MermaRotura' | 'DevolucionCliente' | 'ErrorConteo' | 'OtroRazon';
    reasonId?: string; // Nuevo: ID del motivo de movimiento
    observaciones?: string;
  }, userId?: string) {
    const cantidad = Number(body.cantidadAjuste);
    if (!body.productId || !body.warehouseId) throw new Error('productId y warehouseId son requeridos');
    if (!cantidad || cantidad <= 0) throw new Error('cantidadAjuste debe ser > 0');

    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) throw new Error('Producto no encontrado');
    if (product.trackInventory === false) throw new Error('Producto no gestionado por inventario');

    const existing = await prisma.stockByWarehouse.findUnique({
      where: { productId_warehouseId: { productId: body.productId, warehouseId: body.warehouseId } },
      include: { product: true },
    });

    const stockBefore = existing?.quantity ?? 0;
    const delta = body.adjustmentDirection === 'INCREMENT' ? cantidad : -cantidad;
    const stockAfter = stockBefore + delta;

    if (stockAfter < 0) {
      throw new Error('El ajuste resultaría en stock negativo');
    }

    const minStock = existing?.minStock ?? product.minStock ?? null;

    await prisma.$transaction(async (tx) => {
      await tx.stockByWarehouse.upsert({
        where: { productId_warehouseId: { productId: body.productId, warehouseId: body.warehouseId } },
        update: { quantity: stockAfter, updatedAt: new Date() },
        create: {
          productId: body.productId,
          warehouseId: body.warehouseId,
          quantity: stockAfter,
          minStock: minStock ?? undefined,
        },
      });

      await tx.inventoryMovement.create({
        data: {
          productId: body.productId,
          warehouseId: body.warehouseId,
          type: 'AJUSTE',
          quantity: delta, // Corregido: usar delta en lugar de cantidad para reflejar el cambio real
          stockBefore: stockBefore,
          stockAfter: stockAfter,
          reason: body.reasonId ? '' : (body.adjustmentReason ?? 'OtroRazon'), // Si hay reasonId, reason vacío
          reasonId: body.reasonId ?? null, // Nuevo: guardar el ID del motivo
          userId,
          documentRef: null,
        },
      });

      const totalByProduct = await tx.stockByWarehouse.aggregate({
        where: { productId: body.productId },
        _sum: { quantity: true },
      });
      const total = totalByProduct._sum.quantity ?? 0;
      await tx.product.update({ where: { id: body.productId }, data: { stock: total, updatedAt: new Date() } });
    });

    return { success: true, stockBefore, stockAfter };
  },

  // Nuevo: createAjuste que acepta cantidad positiva o negativa
  async createAjuste(body: AjusteBody, userId?: string) {
    const { productId, warehouseId } = body;
    if (!productId || !warehouseId) throw new Error('productId y warehouseId son requeridos');

    const cantidad = Number(body.cantidadAjuste);
    if (!Number.isInteger(cantidad) || cantidad === 0) {
      throw new Error('Cantidad ajuste no puede ser 0');
    }

    // Derivar dirección y valor absoluto
    const direction: 'INCREMENT' | 'DECREMENT' = cantidad > 0 ? 'INCREMENT' : 'DECREMENT';
    const absCantidad = Math.abs(cantidad);

    // Reutilizar la lógica robusta de ajustarStock
    return this.ajustarStock(
      {
        productId,
        warehouseId,
        cantidadAjuste: absCantidad,
        adjustmentDirection: direction,
        adjustmentReason: body.adjustmentReason ?? (body.tipoAjuste as any) ?? 'OtroRazon',
        reasonId: body.reasonId, // Pasar el reasonId
        observaciones: body.observaciones,
      },
      userId,
    );
  },

  // Nuevo: aplicar entrada por compra a un almacén
  async applyPurchaseEntrada(purchaseId: string, items: Array<{ productId: string; cantidad: number }>, warehouseId: string, userId?: string) {
    if (!purchaseId) throw new Error('purchaseId es requerido');
    if (!warehouseId) throw new Error('warehouseId es requerido');
    if (!items || !Array.isArray(items) || items.length === 0) throw new Error('items es requerido');

    // Validar almacén
    const warehouse = await prisma.warehouse.findUnique({ where: { id: warehouseId } });
    if (!warehouse) throw new Error('Warehouse no encontrado');

    // Buscar motivo de entrada por compra
    const purchaseReason = await prisma.movementReason.findFirst({
      where: { 
        codigo: 'ENT-COMPRA',
        activo: true
      }
    });

    const now = new Date();

    const movimientosCreados: Array<{
      id: string;
      productId: string;
      cantidad: number;
      stockAntes: number;
      stockDespues: number;
    }> = [];

    await prisma.$transaction(async (tx) => {
      for (const it of items) {
        const product = await tx.product.findUnique({ where: { id: it.productId } });
        if (!product) throw new Error('Producto no encontrado');
        if (product.trackInventory === false) continue; // saltar si no lleva inventario

        const existing = await tx.stockByWarehouse.findUnique({
          where: { productId_warehouseId: { productId: it.productId, warehouseId } },
        });
        const stockBefore = existing?.quantity ?? 0;
        const stockAfter = stockBefore + Number(it.cantidad);

        await tx.stockByWarehouse.upsert({
          where: { productId_warehouseId: { productId: it.productId, warehouseId } },
          update: { quantity: stockAfter, updatedAt: now },
          create: {
            productId: it.productId,
            warehouseId,
            quantity: stockAfter,
            minStock: existing?.minStock ?? product.minStock ?? undefined,
            createdAt: now,
            updatedAt: now,
          },
        });

        const movement = await tx.inventoryMovement.create({
          data: {
            productId: it.productId,
            warehouseId,
            type: 'ENTRADA',
            quantity: Number(it.cantidad),
            stockBefore,
            stockAfter,
            reason: `Compra ${purchaseId}`,
            reasonId: purchaseReason?.id ?? null, // Vincular con motivo ENT-COMPRA
            documentRef: purchaseId,
            userId,
            createdAt: now,
          },
        });

        movimientosCreados.push({ id: movement.id, productId: it.productId, cantidad: Number(it.cantidad), stockAntes: stockBefore, stockDespues: stockAfter });
      }

      // Recalcular stock global por cada producto tocado
      const productIds = Array.from(new Set(items.map((i) => i.productId)));
      for (const pid of productIds) {
        const agg = await tx.stockByWarehouse.aggregate({ where: { productId: pid }, _sum: { quantity: true } });
        const total = agg._sum.quantity ?? 0;
        await tx.product.update({ where: { id: pid }, data: { stock: total, updatedAt: now } });
      }
    }, { isolationLevel: 'Serializable' as any });

    return movimientosCreados;
  },

  async getAlertas(): Promise<Array<{ productId: string; codigo: string; nombre: string; almacen: string; cantidad: number; stockMinimo: number; tipoAlerta: 'CRITICO' | 'BAJO'; }>> {
    const records = await prisma.stockByWarehouse.findMany({
      include: { product: true, warehouse: true },
      take: 100,
      orderBy: { updatedAt: 'desc' },
    });

    const alertas: Array<{ productId: string; codigo: string; nombre: string; almacen: string; cantidad: number; stockMinimo: number; tipoAlerta: 'CRITICO' | 'BAJO'; }> = [];

    for (const r of records) {
      const minStock = r.minStock ?? r.product.minStock ?? 0;
      if (r.quantity < minStock) {
        const tipoAlerta: 'CRITICO' | 'BAJO' = r.quantity <= Math.floor(minStock * 0.5) ? 'CRITICO' : 'BAJO';
        alertas.push({
          productId: r.productId,
          codigo: r.product.codigo,
          nombre: r.product.nombre,
          almacen: r.warehouse.nombre,
          cantidad: r.quantity,
          stockMinimo: minStock,
          tipoAlerta,
        });
      }
    }

    return alertas.slice(0, 100);
  },
};