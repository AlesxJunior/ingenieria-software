import { Response } from 'express';
import { ResponseHelper } from '../../utils/response';
import {
  validatePurchaseCreate,
  validatePurchaseUpdate,
  validatePurchaseStatusUpdate,
  validatePurchaseQueryFilters,
} from '../../utils/validation';
import { purchaseService } from '../../services/purchaseService';
import { AuthenticatedRequest } from '../../types';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';

// Métodos de pago permitidos actualizados
const VALID_PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia'];

export const PurchaseController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      // Validaciones explícitas con mensajes claros
      const details: Array<{ field: string; message: string; value?: any; path?: string[] }> = [];
      const {
        proveedorId,
        almacenId,
        fechaEmision,
        tipoComprobante,
        formaPago,
        fechaEntregaEstimada,
        items,
      } = req.body || {};

      if (!proveedorId) details.push({ field: 'proveedorId', message: 'proveedorId es requerido', value: proveedorId });
      if (!almacenId) details.push({ field: 'almacenId', message: 'almacenId es requerido', value: almacenId });
      if (!fechaEmision) details.push({ field: 'fechaEmision', message: 'fechaEmision es requerido', value: fechaEmision });
      if (!items || !Array.isArray(items) || items.length === 0) details.push({ field: 'items', message: 'Mínimo 1 item requerido', value: items });

      if (Array.isArray(items)) {
        items.forEach((it: any, idx: number) => {
          const c = Number(it?.cantidad);
          const p = Number(it?.precioUnitario);
          if (!Number.isFinite(c) || c <= 0) {
            details.push({ field: `items.${idx}.cantidad`, message: 'Cantidad debe ser > 0', value: it?.cantidad, path: ['items', String(idx), 'cantidad'] });
          }
          if (!Number.isFinite(p) || p <= 0) {
            details.push({ field: `items.${idx}.precioUnitario`, message: 'Precio debe ser > 0', value: it?.precioUnitario, path: ['items', String(idx), 'precioUnitario'] });
          }
        });
      }

      if (details.length > 0) {
        console.error('Validación fallida en createPurchase:', { details, body: req.body });
        return res.status(400).json({ success: false, message: 'Errores de validación', error: 'VALIDATION_ERROR', details });
      }

      // Validación adicional: fechaEntregaEstimada > fechaEmision si ambas existen
      if (fechaEntregaEstimada) {
        const fe = new Date(String(fechaEntregaEstimada));
        const fm = new Date(String(fechaEmision));
        if (isNaN(fe.getTime())) {
          details.push({ field: 'fechaEntregaEstimada', message: 'fechaEntregaEstimada inválida', value: fechaEntregaEstimada });
        } else if (!isNaN(fm.getTime()) && fe.getTime() <= fm.getTime()) {
          details.push({ field: 'fechaEntregaEstimada', message: 'fechaEntregaEstimada debe ser posterior a fechaEmision', value: fechaEntregaEstimada });
        }
      }

      // Validación de valores permitidos (opcional, mensajes explícitos)
      if (tipoComprobante) {
        const permitidosTC = ['Factura', 'Boleta', 'GuiaRemision'];
        if (!permitidosTC.includes(String(tipoComprobante))) {
          details.push({ field: 'tipoComprobante', message: 'tipoComprobante debe ser uno de: Factura, Boleta, GuiaRemision', value: tipoComprobante });
        }
      }
      if (formaPago) {
        if (!VALID_PAYMENT_METHODS.includes(String(formaPago))) {
          details.push({ field: 'formaPago', message: `formaPago debe ser uno de: ${VALID_PAYMENT_METHODS.join(', ')}`, value: formaPago });
        }
      }

      if (details.length > 0) {
        console.error('Validación fallida en createPurchase (adicional):', { details });
        return res.status(400).json({ success: false, message: 'Errores de validación', error: 'VALIDATION_ERROR', details });
      }

      // Validación general existente (mantener por compatibilidad)
      const validation = validatePurchaseCreate(req.body);
      if (!validation.isValid) {
        console.error('Validación general fallida en createPurchase:', validation.errors);
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
          descuento:
            req.body.descuento !== undefined
              ? Number(req.body.descuento)
              : undefined,
        },
        userId,
      );

      return ResponseHelper.created(res, purchase, 'Orden de compra creada');
    } catch (error: any) {
      console.error('Error en createPurchase:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      const errorDetails = (error && (error.details || error.errors)) ? (error.details || error.errors) : undefined;
      return res.status(400).json({ success: false, message: 'Error al registrar compra', error: errorMessage, details: errorDetails });
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
          descuento:
            req.body.descuento !== undefined
              ? Number(req.body.descuento)
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
      // Obtener estado previo para detectar transición
      const prevPurchase = await purchaseService.getById(id);
      const purchase = await purchaseService.updateStatus(
        id,
        { estado: String(req.body.estado) as any },
        userId,
      );
      // Integrar entrada de inventario si pasó a 'Recibida'
      if (String(req.body.estado) === 'Recibida' && prevPurchase && prevPurchase.estado !== 'Recibida') {
        const itemsForInventory: { productId: string; cantidad: number }[] = [];
        for (const it of purchase.items) {
          const prod = await productService.findByCodigo(it.productoId);
          if (prod?.id) {
            itemsForInventory.push({ productId: String(prod.id), cantidad: Number(it.cantidad) });
          }
        }
        if (itemsForInventory.length > 0 && purchase.almacenId) {
          await inventoryService.applyPurchaseEntrada(purchase.id, itemsForInventory, purchase.almacenId, userId);
        }
      }
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
  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const id = String(req.params?.id);
      const userId = req.user?.userId as string;
      await purchaseService.delete(id, userId);
      return ResponseHelper.success(
        res,
        { id },
        'Orden de compra eliminada',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al eliminar orden de compra',
        500,
        error?.message || String(error),
      );
    }
  },
};

export default PurchaseController;