import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { sendSuccess, sendValidationError, sendNotFound, sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { ubigeoService } from '../services/ubigeoService';

export class UbigeoController {
  // GET /ubigeo/departamentos
  static getDepartamentos = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      try {
        const departamentos = await ubigeoService.listDepartamentos();
        sendSuccess(res, { departamentos }, 'Departamentos obtenidos exitosamente');
      } catch (error: any) {
        logger.error('Error al obtener departamentos:', error);
        sendError(res, 'Error interno del servidor al obtener departamentos');
      }
    },
  );

  // GET /ubigeo/departamentos/:departamentoId/provincias
  static getProvinciasByDepartamento = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { departamentoId } = req.params;

      if (!departamentoId) {
        sendValidationError(res, [
          { field: 'departamentoId', message: 'El departamentoId es requerido' },
        ]);
        return;
      }

      try {
        const provincias = await ubigeoService.listProvinciasByDepartamento(String(departamentoId));
        sendSuccess(res, { provincias }, 'Provincias obtenidas exitosamente');
      } catch (error: any) {
        logger.error('Error al obtener provincias:', error);
        if (typeof error?.message === 'string' && error.message.includes('Departamento no encontrado')) {
          sendNotFound(res, 'Departamento no encontrado');
          return;
        }
        sendError(res, 'Error interno del servidor al obtener provincias');
      }
    },
  );

  // GET /ubigeo/provincias/:provinciaId/distritos
  static getDistritosByProvincia = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { provinciaId } = req.params;

      if (!provinciaId) {
        sendValidationError(res, [
          { field: 'provinciaId', message: 'El provinciaId es requerido' },
        ]);
        return;
      }

      try {
        const distritos = await ubigeoService.listDistritosByProvincia(String(provinciaId));
        sendSuccess(res, { distritos }, 'Distritos obtenidos exitosamente');
      } catch (error: any) {
        logger.error('Error al obtener distritos:', error);
        if (typeof error?.message === 'string' && error.message.includes('Provincia no encontrada')) {
          sendNotFound(res, 'Provincia no encontrada');
          return;
        }
        sendError(res, 'Error interno del servidor al obtener distritos');
      }
    },
  );
}

export default UbigeoController;