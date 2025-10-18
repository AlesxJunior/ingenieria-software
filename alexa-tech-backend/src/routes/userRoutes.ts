import { Router } from 'express';
import { UserController } from '../controllers/userController';
import {
  authenticate,
  requireAdmin,
  requireSupervisor,
} from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Aplicar autenticación a todas las rutas de usuarios
router.use(authenticate);

// GET /users - Obtener todos los usuarios (con filtros y paginación)
// Requiere permiso específico para ver usuarios
router.get(
  '/',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  UserController.getAllUsers,
);

// GET /users/:id - Obtener usuario específico
// Los usuarios pueden ver su propio perfil, admins y moderadores pueden ver cualquiera
router.get(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }), // 200 requests per 15 minutes
  UserController.getUserById,
);

// POST /users - Crear nuevo usuario
// Requiere permiso específico para crear usuarios
router.post(
  '/',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 creations per 15 minutes
  UserController.createUser,
);

// PUT /users/:id - Actualizar usuario completo
// Requiere permiso específico para editar usuarios
router.put(
  '/:id',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 updates per 15 minutes
  UserController.updateUser,
);

// PATCH /users/:id - Actualización parcial
// Requiere permiso específico para editar usuarios
router.patch(
  '/:id',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 updates per 15 minutes
  UserController.patchUser,
);

// PATCH /users/:id/status - Cambiar estado del usuario
// Requiere permiso específico para editar usuarios (Admin o Supervisor)
router.patch(
  '/:id/status',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 status changes per 15 minutes
  UserController.updateUserStatus,
);

// PATCH /users/:id/change-password - Cambiar contraseña del usuario
// Los usuarios pueden cambiar su propia contraseña, admins pueden cambiar cualquiera
router.patch(
  '/:id/change-password',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }),
  UserController.changePassword,
);

// DELETE /users/:id - Eliminar usuario (soft delete)
// Requiere permiso específico para eliminar usuarios
router.delete(
  '/:id',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 deletions per 15 minutes
  UserController.deleteUser,
);

export default router;
