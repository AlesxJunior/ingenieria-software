import { Router } from 'express';
import { InvoiceController } from './invoice.controller';
import { authenticate, requirePermission } from '../../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

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
