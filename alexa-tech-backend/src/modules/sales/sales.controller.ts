import { Response } from 'express';
import { ResponseHelper } from '../../utils/response';
import { salesService } from './sales.service';
import { AuthenticatedRequest } from '../../types';

const VALID_PAYMENT_METHODS = ['Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin'];
const VALID_VOUCHER_TYPES = ['Boleta', 'Factura', 'NotaVenta'];
const VALID_STATES = ['Pendiente', 'Completada', 'Cancelada'];

export const SalesController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const details: Array<{ field: string; message: string; value?: any; path?: string[] }> = [];
      const {
        cashSessionId,
        clienteId,
        almacenId,
        tipoComprobante,
        formaPago,
        incluyeIGV, // 🆕 Extraer incluyeIGV del body
        items,
      } = req.body || {};

      // Validaciones básicas
      if (!almacenId) details.push({ field: 'almacenId', message: 'almacenId es requerido', value: almacenId });
      if (!tipoComprobante) details.push({ field: 'tipoComprobante', message: 'tipoComprobante es requerido', value: tipoComprobante });
      if (!formaPago) details.push({ field: 'formaPago', message: 'formaPago es requerido', value: formaPago });
      if (!items || !Array.isArray(items) || items.length === 0) {
        details.push({ field: 'items', message: 'Mínimo 1 item requerido', value: items });
      }

      // Validar items
      if (Array.isArray(items)) {
        items.forEach((it: any, idx: number) => {
          if (!it?.productId) {
            details.push({ 
              field: `items.${idx}.productId`, 
              message: 'productId es requerido', 
              value: it?.productId, 
              path: ['items', String(idx), 'productId'] 
            });
          }
          const c = Number(it?.cantidad);
          const p = Number(it?.precioUnitario);
          if (!Number.isFinite(c) || c <= 0) {
            details.push({ 
              field: `items.${idx}.cantidad`, 
              message: 'Cantidad debe ser > 0', 
              value: it?.cantidad, 
              path: ['items', String(idx), 'cantidad'] 
            });
          }
          if (!Number.isFinite(p) || p <= 0) {
            details.push({ 
              field: `items.${idx}.precioUnitario`, 
              message: 'Precio debe ser > 0', 
              value: it?.precioUnitario, 
              path: ['items', String(idx), 'precioUnitario'] 
            });
          }
        });
      }

      // Validar valores permitidos
      if (tipoComprobante && !VALID_VOUCHER_TYPES.includes(String(tipoComprobante))) {
        details.push({ 
          field: 'tipoComprobante', 
          message: `tipoComprobante debe ser uno de: ${VALID_VOUCHER_TYPES.join(', ')}`, 
          value: tipoComprobante 
        });
      }

      if (formaPago && !VALID_PAYMENT_METHODS.includes(String(formaPago))) {
        details.push({ 
          field: 'formaPago', 
          message: `formaPago debe ser uno de: ${VALID_PAYMENT_METHODS.join(', ')}`, 
          value: formaPago 
        });
      }

      // Validar que si es Factura, se requiere cliente
      if (tipoComprobante === 'Factura' && !clienteId) {
        details.push({ 
          field: 'clienteId', 
          message: 'clienteId es requerido para Factura', 
          value: clienteId 
        });
      }

      if (details.length > 0) {
        console.error('Validación fallida en createSale:', { details, body: req.body });
        return res.status(400).json({ 
          success: false, 
          message: 'Errores de validación', 
          error: 'VALIDATION_ERROR', 
          details 
        });
      }

      const userId = req.user?.userId as string;
      const sale = await salesService.create(
        {
          cashSessionId: cashSessionId ? String(cashSessionId) : undefined,
          clienteId: clienteId ? String(clienteId) : undefined,
          almacenId: String(almacenId),
          tipoComprobante: String(tipoComprobante) as any,
          formaPago: String(formaPago) as any,
          incluyeIGV: incluyeIGV !== undefined ? Boolean(incluyeIGV) : undefined, // 🆕 Pasar incluyeIGV
          items: items.map((it: any) => ({
            productId: String(it.productId),
            nombreProducto: it.nombreProducto ? String(it.nombreProducto) : undefined,
            cantidad: Number(it.cantidad),
            precioUnitario: Number(it.precioUnitario),
          })),
          observaciones: req.body.observaciones ? String(req.body.observaciones) : undefined,
        },
        userId,
      );

      return ResponseHelper.created(res, sale, 'Venta creada exitosamente');
    } catch (error: any) {
      console.error('Error en createSale:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      const errorDetails = (error && (error.details || error.errors)) ? (error.details || error.errors) : undefined;
      return res.status(400).json({ 
        success: false, 
        message: 'Error al registrar venta', 
        error: errorMessage, 
        details: errorDetails 
      });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        estado: req.query.estado !== undefined ? String(req.query.estado) : undefined,
        cashSessionId: req.query.cashSessionId !== undefined ? String(req.query.cashSessionId) : undefined,
        clienteId: req.query.clienteId !== undefined ? String(req.query.clienteId) : undefined,
        almacenId: req.query.almacenId !== undefined ? String(req.query.almacenId) : undefined,
        fechaInicio: req.query.fechaInicio !== undefined ? String(req.query.fechaInicio) : undefined,
        fechaFin: req.query.fechaFin !== undefined ? String(req.query.fechaFin) : undefined,
        q: req.query.q !== undefined ? String(req.query.q) : undefined,
      };

      const sales = await salesService.list(filters);
      return ResponseHelper.success(res, sales, 'Ventas obtenidas');
    } catch (error: any) {
      console.error('Error en getAllSales:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({ success: false, message: 'Error al obtener ventas', error: errorMessage });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID es requerido', error: 'VALIDATION_ERROR' });
      }

      const sale = await salesService.getById(id);
      if (!sale) {
        return res.status(404).json({ success: false, message: 'Venta no encontrada', error: 'NOT_FOUND' });
      }

      return ResponseHelper.success(res, sale, 'Venta obtenida');
    } catch (error: any) {
      console.error('Error en getSaleById:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({ success: false, message: 'Error al obtener venta', error: errorMessage });
    }
  },

  async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { estado } = req.body || {};

      if (!id) {
        return res.status(400).json({ success: false, message: 'ID es requerido', error: 'VALIDATION_ERROR' });
      }

      if (!estado) {
        return res.status(400).json({ 
          success: false, 
          message: 'estado es requerido', 
          error: 'VALIDATION_ERROR',
          details: [{ field: 'estado', message: 'estado es requerido', value: estado }]
        });
      }

      if (!VALID_STATES.includes(String(estado))) {
        return res.status(400).json({ 
          success: false, 
          message: `estado debe ser uno de: ${VALID_STATES.join(', ')}`, 
          error: 'VALIDATION_ERROR',
          details: [{ field: 'estado', message: `estado debe ser uno de: ${VALID_STATES.join(', ')}`, value: estado }]
        });
      }

      const userId = req.user?.userId as string;
      const sale = await salesService.updateStatus(id, String(estado) as any, userId);
      
      return ResponseHelper.success(res, sale, 'Estado de venta actualizado');
    } catch (error: any) {
      console.error('Error en updateSaleStatus:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({ 
        success: false, 
        message: 'Error al actualizar estado de venta', 
        error: errorMessage 
      });
    }
  },

  // 🆕 NUEVO ENDPOINT: Confirmar pago de una venta
  async confirmPayment(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { montoRecibido, montoCambio, referenciaPago } = req.body || {};

      // Validaciones
      const details: Array<{ field: string; message: string; value?: any }> = [];

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de venta es requerido', 
          error: 'VALIDATION_ERROR' 
        });
      }

      if (!montoRecibido || !Number.isFinite(Number(montoRecibido)) || Number(montoRecibido) <= 0) {
        details.push({ 
          field: 'montoRecibido', 
          message: 'montoRecibido debe ser un número mayor a 0', 
          value: montoRecibido 
        });
      }

      if (montoCambio !== undefined && !Number.isFinite(Number(montoCambio))) {
        details.push({ 
          field: 'montoCambio', 
          message: 'montoCambio debe ser un número válido', 
          value: montoCambio 
        });
      }

      if (details.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Errores de validación', 
          error: 'VALIDATION_ERROR', 
          details 
        });
      }

      const userId = req.user?.userId as string;
      const sale = await salesService.confirmPayment(
        id,
        {
          montoRecibido: Number(montoRecibido),
          montoCambio: montoCambio !== undefined ? Number(montoCambio) : undefined,
          referenciaPago: referenciaPago ? String(referenciaPago) : undefined,
        },
        userId
      );

      return ResponseHelper.success(res, sale, 'Pago confirmado exitosamente');
    } catch (error: any) {
      console.error('Error en confirmPayment:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({ 
        success: false, 
        message: 'Error al confirmar pago', 
        error: errorMessage 
      });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'ID es requerido', error: 'VALIDATION_ERROR' });
      }

      const userId = req.user?.userId as string;
      await salesService.delete(id, userId);
      
      return ResponseHelper.success(res, null, 'Venta eliminada exitosamente');
    } catch (error: any) {
      console.error('Error en deleteSale:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({ 
        success: false, 
        message: 'Error al eliminar venta', 
        error: errorMessage 
      });
    }
  },
};

export default SalesController;
