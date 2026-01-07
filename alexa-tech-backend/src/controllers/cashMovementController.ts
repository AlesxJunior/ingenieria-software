import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { cashMovementService } from '../services/cashMovementService';
import { $Enums } from '@prisma/client';

export const CashMovementController = {
  /**
   * POST /api/cash-movements/ingreso
   * Crear un ingreso de efectivo
   */
  async createIngreso(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { cashSessionId, monto, motivo, descripcion } = req.body;
      const usuarioId = req.user?.userId;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!cashSessionId || !monto || !motivo) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: cashSessionId, monto, motivo',
        });
      }

      const movement = await cashMovementService.createMovement({
        cashSessionId,
        tipo: $Enums.CashMovementType.INGRESO,
        monto: Number(monto),
        motivo,
        descripcion,
        usuarioId,
      });

      res.status(201).json({
        message: 'Ingreso registrado exitosamente',
        movement,
      });
    } catch (error: any) {
      console.error('Error al crear ingreso:', error);
      res.status(400).json({
        message: error.message || 'Error al registrar el ingreso',
      });
    }
  },

  /**
   * POST /api/cash-movements/egreso
   * Crear un egreso de efectivo
   */
  async createEgreso(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { cashSessionId, monto, motivo, descripcion } = req.body;
      const usuarioId = req.user?.userId;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!cashSessionId || !monto || !motivo) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: cashSessionId, monto, motivo',
        });
      }

      const movement = await cashMovementService.createMovement({
        cashSessionId,
        tipo: $Enums.CashMovementType.EGRESO,
        monto: Number(monto),
        motivo,
        descripcion,
        usuarioId,
      });

      res.status(201).json({
        message: 'Egreso registrado exitosamente',
        movement,
      });
    } catch (error: any) {
      console.error('Error al crear egreso:', error);
      res.status(400).json({
        message: error.message || 'Error al registrar el egreso',
      });
    }
  },

  /**
   * GET /api/cash-movements?cashSessionId=xxx
   * GET /api/cash-movements/session/:sessionId
   * Obtener todos los movimientos de una sesión
   */
  async getMovementsBySession(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      // Soportar tanto query param como path param
      const sessionId = req.params.sessionId || req.query.cashSessionId as string;

      if (!sessionId) {
        return res.status(400).json({ message: 'SessionId es requerido' });
      }

      const movements = await cashMovementService.getMovementsByCashSession(sessionId);

      res.json(movements);
    } catch (error: any) {
      console.error('Error al obtener movimientos:', error);
      res.status(400).json({
        message: error.message || 'Error al obtener los movimientos',
      });
    }
  },

  /**
   * GET /api/cash-movements/summary/:sessionId
   * Obtener resumen completo de caja
   */
  async getCashSummary(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return res.status(400).json({ message: 'SessionId es requerido' });
      }

      const summary = await cashMovementService.getDetailedSummary(sessionId);

      res.json(summary);
    } catch (error: any) {
      console.error('Error al obtener resumen:', error);
      res.status(400).json({
        message: error.message || 'Error al obtener el resumen de caja',
      });
    }
  },

  /**
   * DELETE /api/cash-movements/:id
   * Eliminar un movimiento de caja
   */
  async deleteMovement(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.params;
      const usuarioId = req.user?.userId;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!id) {
        return res.status(400).json({ message: 'ID de movimiento es requerido' });
      }

      await cashMovementService.deleteMovement(id, usuarioId);

      res.json({ message: 'Movimiento eliminado exitosamente' });
    } catch (error: any) {
      console.error('Error al eliminar movimiento:', error);
      res.status(400).json({
        message: error.message || 'Error al eliminar el movimiento',
      });
    }
  },
};
