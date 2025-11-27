import { Router } from 'express';
import { sunatController } from './sunat.controller';
import authMiddleware from '../../middleware/auth';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware.authenticate);

/**
 * @route   GET /api/sunat/ruc/:numero
 * @desc    Consulta información de empresa por RUC
 * @access  Private
 */
router.get('/ruc/:numero', sunatController.consultarRuc);

/**
 * @route   GET /api/sunat/dni/:numero
 * @desc    Consulta información de persona por DNI
 * @access  Private
 */
router.get('/dni/:numero', sunatController.consultarDni);

export default router;
