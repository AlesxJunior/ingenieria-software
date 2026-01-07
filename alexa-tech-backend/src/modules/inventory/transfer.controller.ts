import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { ResponseHelper } from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import * as transferService from './transfer.service';
import { TransferStatus } from '@prisma/client';

export const TransferController = {
  /**
   * POST /api/inventory/transfers
   * Crear nueva transferencia (estado PENDIENTE)
   */
  createTransfer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    if (!userId) {
      return ResponseHelper.error(res, 'Usuario no autenticado', 401);
    }

    const {
      productId,
      cantidad,
      warehouseFromId,
      warehouseToId,
      motivoTransferencia,
      observaciones
    } = req.body;

    // Validar campos requeridos
    if (!productId || !cantidad || !warehouseFromId || !warehouseToId) {
      return ResponseHelper.error(
        res,
        'Campos requeridos: productId, cantidad, warehouseFromId, warehouseToId',
        400
      );
    }

    try {
      const transferencia = await transferService.createTransfer({
        productId,
        cantidad: Number(cantidad),
        warehouseFromId,
        warehouseToId,
        motivoTransferencia,
        observaciones,
        solicitadoPor: userId
      });

      return ResponseHelper.success(
        res,
        transferencia,
        'Transferencia creada exitosamente',
        201
      );
    } catch (error: any) {
      console.error('Error creating transfer:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }),

  /**
   * PUT /api/inventory/transfers/:id/aprobar
   * Aprobar transferencia (ejecuta transacción atómica)
   */
  aprobarTransfer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    if (!userId) {
      return ResponseHelper.error(res, 'Usuario no autenticado', 401);
    }

    const { id } = req.params;

    if (!id) {
      return ResponseHelper.error(res, 'ID de transferencia requerido', 400);
    }
    const { recibidoPor } = req.body;

    try {
      const transferencia = await transferService.aprobarTransfer({
        transferId: id as string,
        aprobadoPor: userId,
        recibidoPor: req.body.recibidoPor || userId
      });

      return ResponseHelper.success(
        res,
        transferencia,
        'Transferencia aprobada y ejecutada exitosamente'
      );
    } catch (error: any) {
      console.error('Error approving transfer:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }),

  /**
   * PUT /api/inventory/transfers/:id/cancelar
   * Cancelar transferencia (solo si está PENDIENTE)
   */
  cancelarTransfer: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.userId;

    if (!userId) {
      return ResponseHelper.error(res, 'Usuario no autenticado', 401);
    }

    const { id } = req.params;

    if (!id) {
      return ResponseHelper.error(res, 'ID de transferencia requerido', 400);
    }

    try {
      const transferencia = await transferService.cancelarTransfer(id as string, userId);

      return ResponseHelper.success(
        res,
        transferencia,
        'Transferencia cancelada exitosamente'
      );
    } catch (error: any) {
      console.error('Error canceling transfer:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }),

  /**
   * GET /api/inventory/transfers
   * Listar transferencias con filtros y paginación
   */
  listTransfers: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const {
      estado,
      warehouseFromId,
      warehouseToId,
      productId,
      solicitadoPor,
      fechaDesde,
      fechaHasta,
      q,
      page,
      limit,
      sortBy,
      order
    } = req.query as any;

    try {
      const result = await transferService.listTransfers({
        estado: estado ? (estado as TransferStatus) : undefined,
        warehouseFromId: warehouseFromId ? String(warehouseFromId) : undefined,
        warehouseToId: warehouseToId ? String(warehouseToId) : undefined,
        productId: productId ? String(productId) : undefined,
        solicitadoPor: solicitadoPor ? String(solicitadoPor) : undefined,
        fechaDesde: fechaDesde ? new Date(fechaDesde) : undefined,
        fechaHasta: fechaHasta ? new Date(fechaHasta) : undefined,
        q: q ? String(q) : undefined,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sortBy: sortBy ? String(sortBy) as any : undefined,
        order: order ? String(order) as any : undefined
      });

      return ResponseHelper.success(res, result, 'Transferencias obtenidas exitosamente');
    } catch (error: any) {
      console.error('Error listing transfers:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  }),

  /**
   * GET /api/inventory/transfers/:id
   * Obtener detalle de una transferencia
   */
  getTransferById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    if (!id) {
      return ResponseHelper.error(res, 'ID de transferencia requerido', 400);
    }

    try {
      const transferencia = await transferService.getTransferById(id as string);

      if (!transferencia) {
        return ResponseHelper.error(res, 'Transferencia no encontrada', 404);
      }

      return ResponseHelper.success(
        res,
        transferencia,
        'Transferencia obtenida exitosamente'
      );
    } catch (error: any) {
      console.error('Error getting transfer:', error);
      return ResponseHelper.error(res, error.message, 400);
    }
  })
};
