import { Router } from 'express';
import { ClientController } from '../controllers/clientController';
import { authenticate, requireSupervisor } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Aplicar autenticación a todas las rutas de clientes
router.use(authenticate);

// GET /clients/stats - Obtener estadísticas de clientes
// Debe ir antes de /:id para evitar conflictos de rutas
router.get(
  '/stats',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  ClientController.getClientStats
);

// GET /clients/search/email/:email - Buscar cliente por email
router.get(
  '/search/email/:email',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 searches per 15 minutes
  ClientController.getClientByEmail
);

// GET /clients/search/document/:numeroDocumento - Buscar cliente por documento
router.get(
  '/search/document/:numeroDocumento',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 searches per 15 minutes
  ClientController.getClientByDocument
);

// GET /clients - Obtener todos los clientes (con filtros)
// Requiere permiso específico para ver clientes
router.get(
  '/',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  ClientController.getAllClients
);

// GET /clients/:id - Obtener cliente específico
// Requiere permiso específico para ver clientes
router.get(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }), // 200 requests per 15 minutes
  ClientController.getClientById
);

// POST /clients - Crear nuevo cliente
// Requiere permiso específico para crear clientes
router.post(
  '/',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 creations per 15 minutes
  ClientController.createClient
);

// PUT /clients/:id - Actualizar cliente completo
// Requiere permiso específico para editar clientes
router.put(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 updates per 15 minutes
  ClientController.updateClient
);

// PATCH /clients/:id - Actualización parcial
// Requiere permiso específico para editar clientes
router.patch(
  '/:id',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 updates per 15 minutes
  ClientController.patchClient
);

// POST /clients/:id/reactivate - Reactivar un cliente eliminado
// Requiere permiso específico para editar clientes
router.post(
  '/:id/reactivate',
  requireSupervisor,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 reactivations per 15 minutes
  ClientController.reactivateClient
);



export default router;