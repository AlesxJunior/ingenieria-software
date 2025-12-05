// alexa-tech-backend/src/modules/ai/ai-recommendations.controller.ts

import { Request, Response } from 'express';
import { aiRecommendationsService } from './ai-recommendations.service';

/**
 * Controller para endpoints de recomendaciones con IA
 */
export class AIRecommendationsController {
  /**
   * POST /api/ai/recommendations
   * Genera recomendaciones inteligentes de productos
   */
  async generateRecommendations(req: Request, res: Response) {
    try {
      const { clienteId, consulta, categoria, presupuestoMax } = req.body;

      // Validaciones
      if (!clienteId) {
        return res.status(400).json({
          success: false,
          message: 'El ID del cliente es requerido',
        });
      }

      if (!consulta || consulta.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La consulta no puede estar vacía',
        });
      }

      if (consulta.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'La consulta debe tener al menos 3 caracteres',
        });
      }

      console.log('🤖 [AI Controller] Nueva solicitud de recomendaciones');
      console.log('   Cliente:', clienteId);
      console.log('   Consulta:', consulta);

      // Generar recomendaciones
      const recomendaciones =
        await aiRecommendationsService.generateRecommendations(
          clienteId,
          consulta,
          {
            categoria,
            presupuestoMax,
          }
        );

      return res.status(200).json({
        success: true,
        message: 'Recomendaciones generadas exitosamente',
        data: recomendaciones,
      });
    } catch (error: any) {
      console.error('❌ [AI Controller] Error:', error);

      return res.status(500).json({
        success: false,
        message: 'Error al generar recomendaciones',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/ai/health
   * Verifica que el servicio de IA esté funcionando
   */
  async health(req: Request, res: Response) {
    try {
      const hasApiKey = !!process.env.GEMINI_API_KEY;

      return res.status(200).json({
        success: true,
        message: 'Servicio de IA operativo',
        data: {
          geminiConfigured: hasApiKey,
          model: 'gemini-1.5-pro',
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Error en servicio de IA',
        error: error.message,
      });
    }
  }
}

export const aiRecommendationsController = new AIRecommendationsController();
