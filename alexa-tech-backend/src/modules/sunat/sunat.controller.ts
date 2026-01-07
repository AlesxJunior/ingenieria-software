import { Request, Response } from 'express';
import { sunatService } from './sunat.service';

export const sunatController = {
  /**
   * GET /api/sunat/ruc/:numero
   * Consulta información de empresa por RUC
   */
  async consultarRuc(req: Request, res: Response) {
    try {
      const { numero } = req.params;

      if (!numero) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un número de RUC',
        });
      }

      const result = await sunatService.consultarRuc(numero);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Error en consultarRuc:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  },

  /**
   * GET /api/sunat/dni/:numero
   * Consulta información de persona por DNI
   */
  async consultarDni(req: Request, res: Response) {
    try {
      const { numero } = req.params;

      if (!numero) {
        return res.status(400).json({
          success: false,
          message: 'Debe proporcionar un número de DNI',
        });
      }

      const result = await sunatService.consultarDni(numero);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.json(result);
    } catch (error) {
      console.error('Error en consultarDni:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  },
};

export default sunatController;
