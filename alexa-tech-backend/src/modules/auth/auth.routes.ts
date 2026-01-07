import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate, requireAdmin } from '../../middleware/auth';

const router = Router();

// Rutas públicas (no requieren autenticación)
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/refresh', AuthController.refreshToken);
router.post('/validate-token', AuthController.validateToken);
router.get('/check-email/:email', AuthController.checkEmail);
router.get('/health', AuthController.healthCheck);

// Rutas protegidas (requieren autenticación)
router.use(authenticate); // Middleware de autenticación para todas las rutas siguientes

router.get('/me', AuthController.getCurrentUser);
router.post('/logout', AuthController.logout);
router.post('/logout-all', AuthController.logoutAll);

// Rutas de administrador
router.get('/stats', requireAdmin, AuthController.getTokenStats);

export default router;
