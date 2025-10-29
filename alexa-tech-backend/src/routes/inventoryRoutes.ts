import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { rateLimiter, generalRateLimit } from '../middleware/rateLimiter';
import InventoryController from '../controllers/inventoryController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Limitadores: 100 req/15min para GET, 30 req/15min para POST
const readLimiter = generalRateLimit; // 100 por 15min
const writeLimiter = rateLimiter({ windowMs: 15 * 60 * 1000, max: 30 });

// Listar stock por almacén
router.get(
  '/stock',
  readLimiter,
  requirePermission('inventory.read'),
  InventoryController.getStock,
);

// Consultar kardex de inventario
router.get(
  '/kardex',
  readLimiter,
  requirePermission('inventory.read'),
  InventoryController.getKardex,
);

// Alertas de inventario
router.get(
  '/alertas',
  readLimiter,
  requirePermission('inventory.read'),
  InventoryController.getAlertas,
);

// Registrar ajustes de stock
router.post(
  '/ajustes',
  writeLimiter,
  requirePermission('inventory.update'),
  InventoryController.createAjuste,
);

export default router;