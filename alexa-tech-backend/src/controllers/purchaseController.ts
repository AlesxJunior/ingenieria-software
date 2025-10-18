import { Response } from 'express';
import { ResponseHelper } from '../utils/response';
import {
  validatePurchaseCreate,
  validatePurchaseUpdate,
  validatePurchaseStatusUpdate,
  validatePurchaseQueryFilters,
} from '../utils/validation';
import { purchaseService } from '../services/purchaseService';
import { AuthenticatedRequest } from '../types';

export const PurchaseController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = validatePurchaseCreate(req.body);
      if (!validation.isValid) {
        return ResponseHelper.validationError(res, validation.errors);
      }

      const userId = req.user?.userId as string;
      const purchase = await purchaseService.create(
        {
          proveedorId: String(req.body.proveedorId),
          almacenId: String(req.body.almacenId),
          fechaEmision: String(req.body.fechaEmision),
          tipoComprobante: req.body.tipoComprobante
            ? String(req.body.tipoComprobante)
            : undefined,
          items: Array.isArray(req.body.items)
            ? req.body.items.map((it: any) => ({
                productoId: String(it.productoId),
                nombreProducto: it.nombreProducto
                  ? String(it.nombreProducto)
                  : undefined,
                cantidad: Number(it.cantidad),
                precioUnitario: Number(it.precioUnitario),
              }))
            : [],
          formaPago: req.body.formaPago
            ? String(req.body.formaPago)
            : undefined,
          observaciones: req.body.observaciones
            ? String(req.body.observaciones)
            : undefined,
          fechaEntregaEstimada: req.body.fechaEntregaEstimada
            ? String(req.body.fechaEntregaEstimada)
            : undefined,
        },
        userId,
      );

      return ResponseHelper.created(res, purchase, 'Orden de compra creada');
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al crear orden de compra',
        500,
        error?.message || String(error),
      );
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = validatePurchaseQueryFilters(req.query);
      if (!validation.isValid) {
        return ResponseHelper.validationError(res, validation.errors);
      }

      const filters = {
        estado:
          req.query.estado !== undefined ? String(req.query.estado) : undefined,
        proveedorId:
          req.query.proveedorId !== undefined
            ? String(req.query.proveedorId)
            : undefined,
        almacenId:
          req.query.almacenId !== undefined
            ? String(req.query.almacenId)
            : undefined,
        fechaInicio:
          req.query.fechaInicio !== undefined
            ? String(req.query.fechaInicio)
            : undefined,
        fechaFin:
          req.query.fechaFin !== undefined
            ? String(req.query.fechaFin)
            : undefined,
        q: req.query.q !== undefined ? String(req.query.q) : undefined,
      };

      const purchases = await purchaseService.list(filters);
      return ResponseHelper.success(
        res,
        { purchases, total: purchases.length, filters },
        'Compras obtenidas',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al listar compras',
        500,
        error?.message || String(error),
      );
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params?.id);
      const purchase = await purchaseService.getById(id);
      if (!purchase) {
        return ResponseHelper.notFound(res, 'Orden de compra no encontrada');
      }
      return ResponseHelper.success(
        res,
        purchase,
        'Orden de compra encontrada',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al obtener orden de compra',
        500,
        error?.message || String(error),
      );
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = validatePurchaseUpdate(req.body);
      if (!validation.isValid) {
        return ResponseHelper.validationError(res, validation.errors);
      }
      const id = String(req.params?.id);
      const userId = req.user?.userId as string;

      const purchase = await purchaseService.update(
        id,
        {
          proveedorId:
            req.body.proveedorId !== undefined
              ? String(req.body.proveedorId)
              : undefined,
          almacenId:
            req.body.almacenId !== undefined
              ? String(req.body.almacenId)
              : undefined,
          fechaEmision:
            req.body.fechaEmision !== undefined
              ? String(req.body.fechaEmision)
              : undefined,
          tipoComprobante:
            req.body.tipoComprobante !== undefined
              ? String(req.body.tipoComprobante)
              : undefined,
          items: Array.isArray(req.body.items)
            ? req.body.items.map((it: any) => ({
                productoId: String(it.productoId),
                nombreProducto: it.nombreProducto
                  ? String(it.nombreProducto)
                  : undefined,
                cantidad: Number(it.cantidad),
                precioUnitario: Number(it.precioUnitario),
              }))
            : undefined,
          formaPago:
            req.body.formaPago !== undefined
              ? String(req.body.formaPago)
              : undefined,
          observaciones:
            req.body.observaciones !== undefined
              ? String(req.body.observaciones)
              : undefined,
          fechaEntregaEstimada:
            req.body.fechaEntregaEstimada !== undefined
              ? String(req.body.fechaEntregaEstimada)
              : undefined,
        },
        userId,
      );

      return ResponseHelper.success(
        res,
        purchase,
        'Orden de compra actualizada',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al actualizar orden de compra',
        500,
        error?.message || String(error),
      );
    }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const validation = validatePurchaseStatusUpdate(req.body);
      if (!validation.isValid) {
        return ResponseHelper.validationError(res, validation.errors);
      }
      const id = String(req.params?.id);
      const userId = req.user?.userId as string;
      const purchase = await purchaseService.updateStatus(
        id,
        { estado: String(req.body.estado) as any },
        userId,
      );
      return ResponseHelper.success(
        res,
        purchase,
        'Estado de orden de compra actualizado',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al cambiar estado de la orden',
        500,
        error?.message || String(error),
      );
    }
  },
};

export default PurchaseController;