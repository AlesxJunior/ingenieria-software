import { Router } from 'express';
import { roleController } from './roles.controller';
import { authenticate, requirePermission } from '../../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación y permisos de usuarios (gestión de roles es parte de gestión de usuarios)

// GET /api/roles/stats - Obtener estadísticas (debe ir antes de /:id)
router.get(
  '/stats',
  authenticate,
  requirePermission('users.read'),
  roleController.getRoleStats.bind(roleController)
);

// GET /api/roles/permissions - Obtener permisos válidos (debe ir antes de /:id)
router.get(
  '/permissions',
  authenticate,
  requirePermission('users.read'),
  roleController.getValidPermissions.bind(roleController)
);

// GET /api/roles - Obtener todos los roles
router.get(
  '/',
  authenticate,
  requirePermission('users.read'),
  roleController.getAllRoles.bind(roleController)
);

// GET /api/roles/:id - Obtener un rol por ID
router.get(
  '/:id',
  authenticate,
  requirePermission('users.read'),
  roleController.getRoleById.bind(roleController)
);

// POST /api/roles - Crear un nuevo rol
router.post(
  '/',
  authenticate,
  requirePermission('users.create'),
  roleController.createRole.bind(roleController)
);

// PUT /api/roles/:id - Actualizar un rol
router.put(
  '/:id',
  authenticate,
  requirePermission('users.update'),
  roleController.updateRole.bind(roleController)
);

// PATCH /api/roles/:id/permissions - Actualizar solo permisos
router.patch(
  '/:id/permissions',
  authenticate,
  requirePermission('users.update'),
  roleController.updateRolePermissions.bind(roleController)
);

// PATCH /api/roles/:id/deactivate - Desactivar un rol
router.patch(
  '/:id/deactivate',
  authenticate,
  requirePermission('users.update'),
  roleController.deactivateRole.bind(roleController)
);

// PATCH /api/roles/:id/activate - Activar un rol
router.patch(
  '/:id/activate',
  authenticate,
  requirePermission('users.update'),
  roleController.activateRole.bind(roleController)
);

// DELETE /api/roles/:id - Eliminar un rol
router.delete(
  '/:id',
  authenticate,
  requirePermission('users.update'),
  roleController.deleteRole.bind(roleController)
);

export default router;
