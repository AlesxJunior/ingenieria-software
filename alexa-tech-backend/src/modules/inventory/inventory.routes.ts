import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { rateLimiter, generalRateLimit } from '../../middleware/rateLimiter';
import { InventoryController } from './inventory.controller';
import { TransferController } from './transfer.controller';
import { ExportController } from './export.controller';

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

// ============================================
// RUTAS DE TRANSFERENCIAS ENTRE ALMACENES
// ============================================

// Listar transferencias con filtros
router.get(
  '/transfers',
  readLimiter,
  requirePermission('inventory.read'),
  TransferController.listTransfers,
);

// Obtener detalle de una transferencia
router.get(
  '/transfers/:id',
  readLimiter,
  requirePermission('inventory.read'),
  TransferController.getTransferById,
);

// Crear nueva transferencia (estado PENDIENTE)
router.post(
  '/transfers',
  writeLimiter,
  requirePermission('inventory.update'),
  TransferController.createTransfer,
);

// Aprobar transferencia (ejecuta movimientos SALIDA + ENTRADA)
router.put(
  '/transfers/:id/aprobar',
  writeLimiter,
  requirePermission('inventory.update'),
  TransferController.aprobarTransfer,
);

// Cancelar transferencia (solo si está PENDIENTE)
router.put(
  '/transfers/:id/cancelar',
  writeLimiter,
  requirePermission('inventory.update'),
  TransferController.cancelarTransfer,
);

// ============================================
// RUTAS DE EXPORTACIÓN A EXCEL
// ============================================

// Exportar stock actual a Excel
router.get(
  '/export/stock',
  readLimiter,
  requirePermission('inventory.read'),
  ExportController.exportStock,
);

// Exportar kardex (movimientos) a Excel
router.get(
  '/export/kardex',
  readLimiter,
  requirePermission('inventory.read'),
  ExportController.exportKardex,
);

// Exportar alertas de stock a Excel
router.get(
  '/export/alertas',
  readLimiter,
  requirePermission('inventory.read'),
  ExportController.exportAlertas,
);

// Exportar transferencias a Excel
router.get(
  '/export/transferencias',
  readLimiter,
  requirePermission('inventory.read'),
  ExportController.exportTransferencias,
);

export default router;