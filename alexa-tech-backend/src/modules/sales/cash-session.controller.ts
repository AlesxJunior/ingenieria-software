import { Response } from 'express';
import { ResponseHelper } from '../../utils/response';
import { cashSessionService } from './cash-session.service';
import { AuthenticatedRequest } from '../../types';

export const CashSessionController = {
  async openSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { cashRegisterId, montoApertura, observaciones } = req.body || {};

      const details: Array<{ field: string; message: string; value?: any }> = [];

      if (!cashRegisterId) {
        details.push({ field: 'cashRegisterId', message: 'cashRegisterId es requerido', value: cashRegisterId });
      }
      if (montoApertura === undefined || montoApertura === null) {
        details.push({ field: 'montoApertura', message: 'montoApertura es requerido', value: montoApertura });
      } else {
        const monto = Number(montoApertura);
        if (!Number.isFinite(monto) || monto < 0) {
          details.push({ field: 'montoApertura', message: 'montoApertura debe ser >= 0', value: montoApertura });
        }
      }

      if (details.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          error: 'VALIDATION_ERROR',
          details,
        });
      }

      const userId = req.user?.userId as string;
      const session = await cashSessionService.openSession(
        {
          cashRegisterId: String(cashRegisterId),
          montoApertura: Number(montoApertura),
          observaciones: observaciones ? String(observaciones) : undefined,
        },
        userId
      );

      return ResponseHelper.created(res, session, 'Sesión de caja abierta exitosamente');
    } catch (error: any) {
      console.error('Error en openCashSession:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({
        success: false,
        message: 'Error al abrir sesión de caja',
        error: errorMessage,
      });
    }
  },

  async closeSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido',
          error: 'VALIDATION_ERROR',
        });
      }

      const { montoCierre, observaciones } = req.body || {};

      if (montoCierre === undefined || montoCierre === null) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          error: 'VALIDATION_ERROR',
          details: [{ field: 'montoCierre', message: 'montoCierre es requerido', value: montoCierre }],
        });
      }

      const monto = Number(montoCierre);
      if (!Number.isFinite(monto) || monto < 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          error: 'VALIDATION_ERROR',
          details: [{ field: 'montoCierre', message: 'montoCierre debe ser >= 0', value: montoCierre }],
        });
      }

      const userId = req.user?.userId as string;
      const session = await cashSessionService.closeSession(
        id,
        {
          montoCierre: Number(montoCierre),
          observaciones: observaciones ? String(observaciones) : undefined,
        },
        userId
      );

      return ResponseHelper.success(res, session, 'Sesión de caja cerrada exitosamente');
    } catch (error: any) {
      console.error('Error en closeCashSession:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({
        success: false,
        message: 'Error al cerrar sesión de caja',
        error: errorMessage,
      });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        cashRegisterId: req.query.cashRegisterId !== undefined ? String(req.query.cashRegisterId) : undefined,
        userId: req.query.userId !== undefined ? String(req.query.userId) : undefined,
        estado: req.query.estado !== undefined ? String(req.query.estado) : undefined,
        fechaInicio: req.query.fechaInicio !== undefined ? String(req.query.fechaInicio) : undefined,
        fechaFin: req.query.fechaFin !== undefined ? String(req.query.fechaFin) : undefined,
      };

      const sessions = await cashSessionService.list(filters);
      return ResponseHelper.success(res, sessions, 'Sesiones de caja obtenidas');
    } catch (error: any) {
      console.error('Error en getAllCashSessions:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener sesiones de caja',
        error: errorMessage,
      });
    }
  },

  async getById(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido',
          error: 'VALIDATION_ERROR',
        });
      }

      const session = await cashSessionService.getById(id);

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Sesión de caja no encontrada',
          error: 'NOT_FOUND',
        });
      }

      return ResponseHelper.success(res, session, 'Sesión de caja obtenida');
    } catch (error: any) {
      console.error('Error en getCashSessionById:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener sesión de caja',
        error: errorMessage,
      });
    }
  },

  async getCurrentOpenSession(req: AuthenticatedRequest, res: Response) {
    try {
      const { cashRegisterId } = req.query;
      if (!cashRegisterId) {
        return res.status(400).json({
          success: false,
          message: 'cashRegisterId es requerido',
          error: 'VALIDATION_ERROR',
        });
      }

      const session = await cashSessionService.getCurrentOpenSession(String(cashRegisterId));

      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'No hay sesión abierta en esta caja',
          error: 'NOT_FOUND',
        });
      }

      return ResponseHelper.success(res, session, 'Sesión actual obtenida');
    } catch (error: any) {
      console.error('Error en getCurrentOpenSession:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener sesión actual',
        error: errorMessage,
      });
    }
  },
};

export default CashSessionController;
