import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { CashSessionController } from './cash-session.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Abrir sesión de caja
router.post('/open', requirePermission('cash-sessions.create'), CashSessionController.openSession);

// Cerrar sesión de caja
router.post('/:id/close', requirePermission('cash-sessions.update'), CashSessionController.closeSession);

// Obtener sesión actual abierta de una caja
router.get('/current', requirePermission('cash-sessions.read'), CashSessionController.getCurrentOpenSession);

// Listar sesiones de caja
router.get('/', requirePermission('cash-sessions.read'), CashSessionController.getAll);

// Obtener sesión por ID
router.get('/:id', requirePermission('cash-sessions.read'), CashSessionController.getById);

export default router;
