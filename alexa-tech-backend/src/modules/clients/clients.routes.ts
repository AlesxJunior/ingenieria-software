import { Router } from 'express';
import { ClientController } from '../controllers/entidadController';
import { authenticate, requireSupervisor } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Aplicar autenticación a todas las rutas de entidades comerciales
router.use(authenticate);

// GET /entidades/stats - Obtener estadísticas de entidades comerciales
// Debe ir antes de /:id para evitar conflictos de rutas
router.get(
  '/stats',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  ClientController.getClientStats,
);

// GET /entidades/search/email/:email - Buscar entidad por email
router.get(
  '/search/email/:email',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 searches per 15 minutes
  ClientController.getClientByEmail,
);

// GET /entidades/search/document/:numeroDocumento - Buscar entidad por documento
router.get(
  '/search/document/:numeroDocumento',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 searches per 15 minutes
  ClientController.getClientByDocument,
);

// GET /entidades - Obtener todas las entidades comerciales (con filtros)
// Requiere permiso específico para ver entidades
router.get(
  '/',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  ClientController.getAllClients,
);

// GET /entidades/:id - Obtener entidad específica
// Requiere permiso específico para ver entidades
router.get(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }), // 200 requests per 15 minutes
  ClientController.getClientById,
);

// POST /entidades - Crear nueva entidad
// Requiere permiso específico para crear entidades
router.post(
  '/',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 creations per 15 minutes
  ClientController.createClient,
);

// PUT /entidades/:id - Actualizar entidad completa
// Requiere permiso específico para editar entidades
router.put(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 updates per 15 minutes
  ClientController.updateClient,
);

// PATCH /entidades/:id - Actualización parcial
// Requiere permiso específico para editar entidades
router.patch(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 updates per 15 minutes
  ClientController.patchClient,
);

// POST /entidades/:id/reactivate - Reactivar una entidad eliminada
// Requiere permiso específico para editar entidades
router.post(
  '/:id/reactivate',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 reactivations per 15 minutes
  ClientController.reactivateClient,
);

export default router;
