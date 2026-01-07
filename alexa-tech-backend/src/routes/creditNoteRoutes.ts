import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { rateLimiter, generalRateLimit } from '../middleware/rateLimiter';
import { CreditNoteController } from '../controllers/creditNoteController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Limitadores: 100 req/15min para GET, 20 req/15min para POST (más restrictivo)
const readLimiter = generalRateLimit; // 100 por 15min
const writeLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });

// Crear nota de crédito
router.post(
  '/',
  writeLimiter,
  requirePermission('sales.create'), // 🔧 Corregido: usar plural consistente
  CreditNoteController.createCreditNote,
);

// ✅ NUEVO: Generar PDF de nota de crédito
router.get(
  '/:id/pdf',
  readLimiter,
  requirePermission('sales.read'),
  CreditNoteController.generatePDF,
);

// Obtener notas de crédito de una venta
router.get(
  '/sale/:saleId',
  readLimiter,
  requirePermission('sales.read'), // 🔧 Corregido: usar plural consistente
  CreditNoteController.getCreditNotesBySale,
);

// Obtener venta con resumen de devoluciones
router.get(
  '/sale/:saleId/summary',
  readLimiter,
  requirePermission('sales.read'), // 🔧 Corregido: usar plural consistente
  CreditNoteController.getSaleWithCreditNotes,
);

export default router;
