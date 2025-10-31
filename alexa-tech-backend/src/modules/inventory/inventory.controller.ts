import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { inventoryService } from '../../services/inventoryService';
import { asyncHandler } from '../../middleware/errorHandler';

export const InventoryController = {
  // GET /stock - paginado y filtrado
  getStock: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { almacenId, productId, estado, page, limit, sortBy, order } = req.query as any;

    const result = await inventoryService.getStockByWarehouse({
      almacenId: almacenId ? String(almacenId) : undefined,
      productId: productId ? String(productId) : undefined,
      estado: estado ? String(estado) as any : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      sortBy: sortBy ? String(sortBy) as any : undefined,
      order: order ? String(order) as any : undefined,
    });

    return ResponseHelper.success(res, result, 'Stock por almacén');
  }),

  // GET /kardex - paginado y filtrado por rango de fechas
  getKardex: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      productId,
      tipoMovimiento,
      warehouseId,
      fechaDesde,
      fechaHasta,
      page,
      pageSize,
      sortBy,
      order,
    } = req.query as any;

    const result = await inventoryService.getKardex({
      productId: productId ? String(productId) : undefined,
      tipoMovimiento: tipoMovimiento ? String(tipoMovimiento) as any : undefined,
      warehouseId: warehouseId ? String(warehouseId) : undefined,
      fechaDesde: fechaDesde ? String(fechaDesde) : undefined,
      fechaHasta: fechaHasta ? String(fechaHasta) : undefined,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      sortBy: sortBy ? String(sortBy) as any : undefined,
      order: order ? String(order) as any : undefined,
    });

    return ResponseHelper.success(res, result, 'Kardex de inventario');
  }),

  // POST /ajustes - nuevo handler que acepta cantidad positiva o negativa
  createAjuste: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      return ResponseHelper.unauthorized(res, 'Usuario no autenticado');
    }

    const body = req.body as any;

    // Validación de campos requeridos
    const missing: Array<{ field: string; message: string; value?: any }> = [];
    if (!body?.productId) missing.push({ field: 'productId', message: 'productId es requerido', value: body?.productId });
    if (!body?.warehouseId) missing.push({ field: 'warehouseId', message: 'warehouseId es requerido', value: body?.warehouseId });
    if (body?.cantidadAjuste == null) missing.push({ field: 'cantidadAjuste', message: 'cantidadAjuste es requerido', value: body?.cantidadAjuste });

    if (missing.length) {
      return ResponseHelper.validationError(res, missing);
    }

    const cantidad = Number(body.cantidadAjuste);
    if (!Number.isFinite(cantidad) || !Number.isInteger(cantidad) || cantidad === 0) {
      return ResponseHelper.validationError(res, [
        { field: 'cantidadAjuste', message: 'cantidadAjuste debe ser entero distinto de 0', value: body?.cantidadAjuste },
      ]);
    }

    const result = await inventoryService.createAjuste(
      {
        productId: String(body.productId),
        warehouseId: String(body.warehouseId),
        cantidadAjuste: cantidad,
        tipoAjuste: body.tipoAjuste ?? undefined,
        adjustmentReason: body.adjustmentReason ?? undefined,
        reasonId: body.reasonId ?? undefined, // Nuevo: ID del motivo de movimiento
        observaciones: body.observaciones ?? undefined,
      },
      userId,
    );

    return ResponseHelper.success(res, result, 'Ajuste de stock realizado');
  }),

  // Compatibilidad: handler existente para ajustarStock con dirección explícita
  ajustarStock: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user?.userId;
    const body = req.body as any;

    if (!body?.productId || !body?.warehouseId || body?.cantidadAjuste == null) {
      return ResponseHelper.validationError(res, [
        { field: 'productId', message: 'productId es requerido', value: body?.productId },
        { field: 'warehouseId', message: 'warehouseId es requerido', value: body?.warehouseId },
        { field: 'cantidadAjuste', message: 'cantidadAjuste es requerido', value: body?.cantidadAjuste },
      ]);
    }

    const cantidad = Number(body.cantidadAjuste);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      return ResponseHelper.validationError(res, [
        { field: 'cantidadAjuste', message: 'cantidadAjuste debe ser entero > 0', value: body?.cantidadAjuste },
      ]);
    }

    const adjustmentDirection = String(body.adjustmentDirection) as 'INCREMENT' | 'DECREMENT';
    if (!['INCREMENT', 'DECREMENT'].includes(adjustmentDirection)) {
      return ResponseHelper.validationError(res, [
        { field: 'adjustmentDirection', message: 'adjustmentDirection debe ser INCREMENT o DECREMENT', value: body?.adjustmentDirection },
      ]);
    }

    const result = await inventoryService.ajustarStock(
      {
        productId: String(body.productId),
        warehouseId: String(body.warehouseId),
        cantidadAjuste: cantidad,
        adjustmentDirection,
        adjustmentReason: body.adjustmentReason ?? undefined,
        observaciones: body.observaciones ?? undefined,
      },
      userId,
    );

    return ResponseHelper.success(res, result, 'Ajuste de stock realizado');
  }),

  // GET /alertas - inventario bajo y crítico
  getAlertas: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const alertas = await inventoryService.getAlertas();
    return ResponseHelper.success(res, { rows: alertas, total: alertas.length }, 'Alertas de stock');
  }),
};

export default InventoryController;