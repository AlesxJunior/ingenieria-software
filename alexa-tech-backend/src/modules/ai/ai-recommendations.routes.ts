// alexa-tech-backend/src/modules/ai/ai-recommendations.routes.ts

import { Router } from 'express';
import { aiRecommendationsController } from './ai-recommendations.controller';
import { authenticate, requirePermission } from '../../middleware/auth';

const router = Router();

/**
 * GET /api/ai/health
 * Verificar estado del servicio de IA
 */
router.get('/health', authenticate, (req, res) => {
  aiRecommendationsController.health(req, res);
});

/**
 * POST /api/ai/recommendations
 * Generar recomendaciones inteligentes de productos
 * Requiere: sales.create (permiso para crear ventas)
 */
router.post(
  '/recommendations',
  authenticate,
  requirePermission('sales.create'),
  (req, res) => {
    aiRecommendationsController.generateRecommendations(req, res);
  }
);

export default router;
