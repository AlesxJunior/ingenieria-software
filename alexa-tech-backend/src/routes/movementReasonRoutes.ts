import { Router } from 'express';
import { movementReasonController } from '../controllers/movementReasonController';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// GET /api/movement-reasons - Listar todos los motivos
router.get(
  '/',
  requirePermission('inventory.read'),
  movementReasonController.getAll,
);

// GET /api/movement-reasons/:id - Obtener un motivo por ID
router.get(
  '/:id',
  requirePermission('inventory.read'),
  movementReasonController.getById,
);

// POST /api/movement-reasons - Crear nuevo motivo
router.post(
  '/',
  requirePermission('inventory.update'),
  movementReasonController.create,
);

// PUT /api/movement-reasons/:id - Actualizar motivo
router.put(
  '/:id',
  requirePermission('inventory.update'),
  movementReasonController.update,
);

// DELETE /api/movement-reasons/:id - Eliminar motivo
router.delete(
  '/:id',
  requirePermission('inventory.update'),
  movementReasonController.delete,
);

// PATCH /api/movement-reasons/:id/toggle - Activar/Desactivar motivo
router.patch(
  '/:id/toggle',
  requirePermission('inventory.update'),
  movementReasonController.toggle,
);

export default router;
