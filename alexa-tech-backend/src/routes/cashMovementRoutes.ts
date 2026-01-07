import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { rateLimiter, generalRateLimit } from '../middleware/rateLimiter';
import { CashMovementController } from '../controllers/cashMovementController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Limitadores: 100 req/15min para GET, 30 req/15min para POST
const readLimiter = generalRateLimit; // 100 por 15min
const writeLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

// Crear ingreso de efectivo
router.post(
  '/ingreso',
  writeLimiter,
  requirePermission('sales.create'), // Usar permiso plural consistente con seed
  CashMovementController.createIngreso,
);

// Crear egreso de efectivo
router.post(
  '/egreso',
  writeLimiter,
  requirePermission('sales.create'),
  CashMovementController.createEgreso,
);

// Obtener movimientos de una sesión (por query param o path param)
router.get(
  '/',
  readLimiter,
  requirePermission('sales.read'),
  CashMovementController.getMovementsBySession,
);

// Obtener movimientos de una sesión (alternativa por path)
router.get(
  '/session/:sessionId',
  readLimiter,
  requirePermission('sales.read'),
  CashMovementController.getMovementsBySession,
);

// Obtener resumen completo de caja
router.get(
  '/summary/:sessionId',
  readLimiter,
  requirePermission('sales.read'),
  CashMovementController.getCashSummary,
);

// Eliminar un movimiento
router.delete(
  '/:id',
  writeLimiter,
  requirePermission('sales.create'),
  CashMovementController.deleteMovement,
);

export default router;
