import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { SalesController } from './sales.controller';
import { InvoiceController } from './invoice.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear venta
router.post('/', requirePermission('sales.create'), SalesController.create);

// Listar ventas con filtros
router.get('/', requirePermission('sales.read'), SalesController.getAll);

// Obtener venta por ID
router.get('/:id', requirePermission('sales.read'), SalesController.getById);

// Cambiar estado (Pendiente|Completada|Cancelada)
router.patch('/:id/status', requirePermission('sales.update'), SalesController.updateStatus);

// 🆕 Confirmar pago de una venta
router.post('/:id/confirm-payment', requirePermission('sales.update'), SalesController.confirmPayment);

// Eliminar venta (solo si está Pendiente)
router.delete('/:id', requirePermission('sales.delete'), SalesController.delete);

// ==========================================
// RUTAS DE FACTURACIÓN (PDF)
// ==========================================

/**
 * @route   GET /api/sales/:id/invoice/download
 * @desc    Descargar factura en PDF
 * @access  Private (sales.read)
 */
router.get(
  '/:id/invoice/download',
  requirePermission('sales.read'),
  InvoiceController.generateInvoice
);

/**
 * @route   GET /api/sales/:id/invoice/preview
 * @desc    Previsualizar factura en navegador
 * @access  Private (sales.read)
 */
router.get(
  '/:id/invoice/preview',
  requirePermission('sales.read'),
  InvoiceController.previewInvoice
);

export default router;
