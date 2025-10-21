import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import { UbigeoController } from '../controllers/ubigeoController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Listar departamentos
router.get(
  '/departamentos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 200 }),
  UbigeoController.getDepartamentos,
);

// Listar provincias por departamento
router.get(
  '/departamentos/:departamentoId/provincias',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 300 }),
  UbigeoController.getProvinciasByDepartamento,
);

// Listar distritos por provincia
router.get(
  '/provincias/:provinciaId/distritos',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 300 }),
  UbigeoController.getDistritosByProvincia,
);

export default router;