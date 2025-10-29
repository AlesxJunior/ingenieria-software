import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type StockEstado = 'CRITICO' | 'BAJO' | 'NORMAL';
export type MovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE';
export type AdjustmentDirection = 'INCREMENT' | 'DECREMENT';
export type AdjustmentReason = 'MermaDanio' | 'MermaRotura' | 'DevolucionCliente' | 'ErrorConteo' | 'OtroRazon';

export interface StockFilters {
  almacenId?: string;
  q?: string;
  estado?: StockEstado;
  page?: number;
  pageSize?: number;
  sortBy?: 'cantidad' | 'estado' | 'producto';
  order?: 'asc' | 'desc';
}

export interface KardexFilters {
  productId?: string;
  tipoMovimiento?: MovementType;
  warehouseId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'fecha' | 'tipo' | 'cantidad';
  order?: 'asc' | 'desc';
}

export interface AjusteBody {
  productId: string;
  warehouseId: string;
  cantidadAjuste: number;
  tipoAjuste?: AdjustmentDirection;
  adjustmentReason?: AdjustmentReason;
  observaciones?: string;
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

export interface KardexRow {
  id: string;
  fecha: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  tipo: MovementType;
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo?: string;
  usuario?: string;
  documentoReferencia?: string | null;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================================================
// CUSTOM ERRORS
// ============================================================================

export class InventoryError extends Error {
  constructor(message: string, public code: string, public statusCode: number = 400) {
    super(message);
    this.name = 'InventoryError';
  }
}

export class ValidationError extends InventoryError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends InventoryError {
  constructor(resource: string, id: string) {
    super(`${resource} with ID ${id} not found`, 'NOT_FOUND', 404);
  }
}

export class InsufficientStockError extends InventoryError {
  constructor(available: number, requested: number) {
    super(`Insufficient stock. Available: ${available}, Requested: ${requested}`, 'INSUFFICIENT_STOCK', 400);
  }
}

export class NegativeStockError extends InventoryError {
  constructor(resultingStock: number) {
    super(`Operation would result in negative stock: ${resultingStock}`, 'NEGATIVE_STOCK', 400);
  }
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

class InventoryValidator {
  static validateProductId(productId: string): void {
    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      throw new ValidationError('Product ID is required and must be a non-empty string');
    }
  }

  static validateWarehouseId(warehouseId: string): void {
    if (!warehouseId || typeof warehouseId !== 'string' || warehouseId.trim().length === 0) {
      throw new ValidationError('Warehouse ID is required and must be a non-empty string');
    }
  }

  static validateQuantity(quantity: number, allowNegative: boolean = false): void {
    if (typeof quantity !== 'number' || isNaN(quantity)) {
      throw new ValidationError('Quantity must be a valid number');
    }
    if (!allowNegative && quantity < 0) {
      throw new ValidationError('Quantity cannot be negative');
    }
    if (quantity === 0) {
      throw new ValidationError('Quantity cannot be zero');
    }
  }

  static validateUserId(userId: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new ValidationError('User ID is required and must be a non-empty string');
    }
  }

  static validatePagination(page?: number, pageSize?: number): { page: number; pageSize: number } {
    const validPage = Math.max(1, Number(page) || 1);
    const validPageSize = Math.min(Math.max(1, Number(pageSize) || 20), 100);
    return { page: validPage, pageSize: validPageSize };
  }

  static validateDateRange(fechaDesde?: string, fechaHasta?: string): { startDate?: Date; endDate?: Date } {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (fechaDesde) {
      startDate = new Date(fechaDesde);
      if (isNaN(startDate.getTime())) {
        throw new ValidationError('Invalid start date format');
      }
    }

    if (fechaHasta) {
      endDate = new Date(fechaHasta);
      if (isNaN(endDate.getTime())) {
        throw new ValidationError('Invalid end date format');
      }
    }

    if (startDate && endDate && startDate > endDate) {
      throw new ValidationError('Start date cannot be after end date');
    }

    return { startDate, endDate };
  }
}

// ============================================================================
// BUSINESS LOGIC UTILITIES
// ============================================================================

class StockCalculator {
  private static readonly LOW_MULTIPLIER = Number(process.env.LOW_STOCK_MULTIPLIER || 1.5);

  static calcularEstado(cantidad: number, stockMinimo: number | null): StockEstado {
    const min = Number(stockMinimo ?? 0);
    if (min <= 0) return 'NORMAL';
    if (cantidad <= Math.floor(min * 0.5)) return 'CRITICO';
    if (cantidad < min) return 'BAJO';
    return 'NORMAL';
  }

  static calculateDelta(adjustmentDirection: AdjustmentDirection, cantidad: number): number {
    return adjustmentDirection === 'INCREMENT' ? cantidad : -cantidad;
  }

  static validateStockOperation(stockBefore: number, delta: number): number {
    const stockAfter = stockBefore + delta;
    if (stockAfter < 0) {
      throw new NegativeStockError(stockAfter);
    }
    return stockAfter;
  }
}

// ============================================================================
// DATABASE ACCESS LAYER
// ============================================================================

class InventoryRepository {
  static async findProductById(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, codigo: true, nombre: true, minStock: true, trackInventory: true, estado: true }
    });
    
    if (!product) {
      throw new NotFoundError('Product', productId);
    }
    
    if (!product.estado) {
      throw new ValidationError('Product is inactive');
    }
    
    if (!product.trackInventory) {
      throw new ValidationError('Product does not track inventory');
    }
    
    return product;
  }

  static async findWarehouseById(warehouseId: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
      select: { id: true, codigo: true, nombre: true, activo: true }
    });
    
    if (!warehouse) {
      throw new NotFoundError('Warehouse', warehouseId);
    }
    
    if (!warehouse.activo) {
      throw new ValidationError('Warehouse is inactive');
    }
    
    return warehouse;
  }

  static async findStockByWarehouse(productId: string, warehouseId: string) {
    return await prisma.stockByWarehouse.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
      include: { product: true, warehouse: true }
    });
  }

  static async findUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, isActive: true }
    });
    
    if (!user) {
      throw new NotFoundError('User', userId);
    }
    
    if (!user.isActive) {
      throw new ValidationError('User is inactive');
    }
    
    return user;
  }
}

// ============================================================================
// MAIN SERVICE CLASS
// ============================================================================

export class InventoryService {
  // ========================================================================
  // STOCK QUERIES
  // ========================================================================

  async getStock(filters: StockFilters): Promise<StockRow[]> {
    try {
      const { page, pageSize } = InventoryValidator.validatePagination(filters.page, filters.pageSize);
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
        const estado = StockCalculator.calcularEstado(r.quantity, minStock);
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
    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError('Failed to retrieve stock data', 'QUERY_ERROR', 500);
    }
  }

  // ========================================================================
  // KARDEX QUERIES
  // ========================================================================

  async getKardex(filters: KardexFilters): Promise<Paginated<KardexRow>> {
    try {
      const { page, pageSize } = InventoryValidator.validatePagination(filters.page, filters.pageSize);
      const { startDate, endDate } = InventoryValidator.validateDateRange(filters.fechaDesde, filters.fechaHasta);
      
      const skip = (page - 1) * pageSize;

      const where: Prisma.InventoryMovementWhereInput = {
        productId: filters.productId ?? undefined,
        warehouseId: filters.warehouseId ?? undefined,
        type: filters.tipoMovimiento ?? undefined,
        createdAt: startDate || endDate ? {
          gte: startDate,
          lte: endDate,
        } : undefined,
      };

      const [total, records] = await Promise.all([
        prisma.inventoryMovement.count({ where }),
        prisma.inventoryMovement.findMany({
          where,
          include: { product: true, warehouse: true, user: true },
          skip,
          take: pageSize,
          orderBy: { createdAt: filters.order === 'asc' ? 'asc' : 'desc' },
        }),
      ]);

      const rows: KardexRow[] = records.map((r) => ({
        id: r.id,
        fecha: r.createdAt.toISOString(),
        productId: r.productId,
        codigo: r.product.codigo,
        nombre: r.product.nombre,
        almacen: r.warehouse.nombre,
        tipo: r.type as MovementType,
        cantidad: r.quantity,
        stockAntes: r.stockBefore,
        stockDespues: r.stockAfter,
        motivo: r.reason,
        usuario: r.user?.username,
        documentoReferencia: r.documentRef,
      }));

      return {
        rows,
        total,
        page,
        limit: pageSize,
        pages: Math.ceil(total / pageSize) || 1,
      };
    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError('Failed to retrieve kardex data', 'QUERY_ERROR', 500);
    }
  }

  // ========================================================================
  // STOCK ADJUSTMENTS
  // ========================================================================

  async ajustarStock(body: AjusteBody, userId: string): Promise<{ success: boolean; message: string; data: any }> {
    try {
      // Validaciones de entrada
      InventoryValidator.validateProductId(body.productId);
      InventoryValidator.validateWarehouseId(body.warehouseId);
      InventoryValidator.validateQuantity(Math.abs(body.cantidadAjuste), false);
      InventoryValidator.validateUserId(userId);

      // Verificar existencia de entidades
      const [product] = await Promise.all([
        InventoryRepository.findProductById(body.productId),
        InventoryRepository.findWarehouseById(body.warehouseId),
        InventoryRepository.findUserById(userId)
      ]);

      // Determinar dirección del ajuste
      const adjustmentDirection: AdjustmentDirection = body.cantidadAjuste > 0 ? 'INCREMENT' : 'DECREMENT';
      const cantidad = Math.abs(body.cantidadAjuste);
      const delta = StockCalculator.calculateDelta(adjustmentDirection, cantidad);

      // Obtener stock actual
      const existing = await InventoryRepository.findStockByWarehouse(body.productId, body.warehouseId);
      const stockBefore = existing?.quantity ?? 0;
      
      // Validar operación
      const stockAfter = StockCalculator.validateStockOperation(stockBefore, delta);
      const minStock = existing?.minStock ?? product.minStock ?? null;

      // Ejecutar transacción
      const result = await prisma.$transaction(async (tx) => {
        // Actualizar o crear stock
        const updatedStock = await tx.stockByWarehouse.upsert({
          where: { productId_warehouseId: { productId: body.productId, warehouseId: body.warehouseId } },
          update: { quantity: stockAfter, updatedAt: new Date() },
          create: {
            productId: body.productId,
            warehouseId: body.warehouseId,
            quantity: stockAfter,
            minStock: minStock ?? undefined,
          },
        });

        // Crear movimiento de inventario
        const movement = await tx.inventoryMovement.create({
          data: {
            productId: body.productId,
            warehouseId: body.warehouseId,
            type: 'AJUSTE',
            quantity: delta, // Usar delta con signo correcto
            stockBefore: stockBefore,
            stockAfter: stockAfter,
            reason: body.adjustmentReason ?? 'OtroRazon',
            userId,
            documentRef: null,
          },
        });

        // Actualizar stock global del producto
        const totalByProduct = await tx.stockByWarehouse.aggregate({
          where: { productId: body.productId },
          _sum: { quantity: true },
        });

        await tx.product.update({
          where: { id: body.productId },
          data: { 
            stock: totalByProduct._sum.quantity || 0,
            updatedAt: new Date()
          },
        });

        return { updatedStock, movement };
      });

      return {
        success: true,
        message: `Stock adjusted successfully. New quantity: ${stockAfter}`,
        data: {
          productId: body.productId,
          warehouseId: body.warehouseId,
          stockBefore,
          stockAfter,
          delta,
          movementId: result.movement.id
        }
      };

    } catch (error) {
      if (error instanceof InventoryError) {
        throw error;
      }
      throw new InventoryError('Failed to adjust stock', 'ADJUSTMENT_ERROR', 500);
    }
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async validateStockConsistency(productId?: string): Promise<{ consistent: boolean; issues: string[] }> {
    try {
      const issues: string[] = [];
      
      const whereClause = productId ? { id: productId } : { trackInventory: true };
      const products = await prisma.product.findMany({
        where: whereClause,
        include: { stockByWarehouses: true }
      });

      for (const product of products) {
        const calculatedStock = product.stockByWarehouses.reduce((sum, stock) => sum + stock.quantity, 0);
        
        if (product.stock !== calculatedStock) {
          issues.push(`Product ${product.codigo}: Global stock (${product.stock}) != Calculated stock (${calculatedStock})`);
        }
      }

      return {
        consistent: issues.length === 0,
        issues
      };
    } catch {
      throw new InventoryError('Failed to validate stock consistency', 'VALIDATION_ERROR', 500);
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const inventoryService = new InventoryService();