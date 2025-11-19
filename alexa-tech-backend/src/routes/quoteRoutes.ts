import { Router } from 'express';
import { authenticate, requirePermission, authenticateWithQueryToken } from '../middleware/auth';
import { rateLimiter, generalRateLimit } from '../middleware/rateLimiter';
import { QuoteController } from '../controllers/quoteController';

const router = Router();

// Limitadores: 100 req/15min para GET, 30 req/15min para POST/PATCH/DELETE
const readLimiter = generalRateLimit; // 100 por 15min
const writeLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

// ⚠️ IMPORTANTE: Esta ruta debe estar ANTES de router.use(authenticate)
// porque usa authenticateWithQueryToken en lugar de authenticate
// Generar PDF de cotización
router.get(
  '/:id/pdf',
  readLimiter,
  authenticateWithQueryToken,
  requirePermission('sales.read'),
  QuoteController.generateQuotePDF,
);

// Todas las demás rutas requieren autenticación por header
router.use(authenticate);

// Crear cotización
router.post(
  '/',
  writeLimiter,
  requirePermission('sales.create'), // 🔧 Corregido: usar plural consistente
  QuoteController.createQuote,
);

// Listar cotizaciones
router.get(
  '/',
  readLimiter,
  requirePermission('sales.read'), // 🔧 Corregido: usar plural consistente
  QuoteController.getQuotes,
);

// Verificar cotizaciones vencidas (endpoint utilitario)
router.post(
  '/check-expired',
  writeLimiter,
  requirePermission('sales.read'), // 🔧 Corregido: usar plural consistente
  QuoteController.checkExpiredQuotes,
);

// Obtener cotización por ID
router.get(
  '/:id',
  readLimiter,
  requirePermission('sales.read'), // 🔧 Corregido: usar plural consistente
  QuoteController.getQuoteById,
);

// Convertir cotización a venta
router.post(
  '/:id/convert',
  writeLimiter,
  requirePermission('sales.create'), // 🔧 Corregido: usar plural consistente
  QuoteController.convertToSale,
);

// Actualizar estado de cotización
router.patch(
  '/:id/status',
  writeLimiter,
  requirePermission('sales.update'), // 🔧 Corregido: usar plural consistente
  QuoteController.updateStatus,
);

// Eliminar cotización
router.delete(
  '/:id',
  writeLimiter,
  requirePermission('sales.delete'), // 🔧 Corregido: usar plural consistente
  QuoteController.deleteQuote,
);

export default router;
