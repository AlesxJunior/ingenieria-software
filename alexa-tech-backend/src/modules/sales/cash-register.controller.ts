import { Response } from 'express';
import { ResponseHelper } from '../../utils/response';
import { cashRegisterService } from './cash-register.service';
import { AuthenticatedRequest } from '../../types';

export const CashRegisterController = {
  async create(req: AuthenticatedRequest, res: Response) {
    try {
      const { codigo, nombre, ubicacion, activo } = req.body || {};

      if (!codigo) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          error: 'VALIDATION_ERROR',
          details: [{ field: 'codigo', message: 'codigo es requerido', value: codigo }],
        });
      }

      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación',
          error: 'VALIDATION_ERROR',
          details: [{ field: 'nombre', message: 'nombre es requerido', value: nombre }],
        });
      }

      const userId = req.user?.userId as string;
      const cashRegister = await cashRegisterService.create(
        {
          codigo: String(codigo),
          nombre: String(nombre),
          ubicacion: ubicacion ? String(ubicacion) : undefined,
          activo: activo !== undefined ? Boolean(activo) : undefined,
        },
        userId
      );

      return ResponseHelper.created(res, cashRegister, 'Caja registradora creada exitosamente');
    } catch (error: any) {
      console.error('Error en createCashRegister:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({
        success: false,
        message: 'Error al crear caja registradora',
        error: errorMessage,
      });
    }
  },

  async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const filters = {
        activo: req.query.activo,
        q: req.query.q !== undefined ? String(req.query.q) : undefined,
      };

      const registers = await cashRegisterService.list(filters);
      return ResponseHelper.success(res, registers, 'Cajas registradoras obtenidas');
    } catch (error: any) {
      console.error('Error en getAllCashRegisters:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener cajas registradoras',
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

      const register = await cashRegisterService.getById(id);

      if (!register) {
        return res.status(404).json({
          success: false,
          message: 'Caja registradora no encontrada',
          error: 'NOT_FOUND',
        });
      }

      return ResponseHelper.success(res, register, 'Caja registradora obtenida');
    } catch (error: any) {
      console.error('Error en getCashRegisterById:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener caja registradora',
        error: errorMessage,
      });
    }
  },

  async update(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido',
          error: 'VALIDATION_ERROR',
        });
      }

      const { codigo, nombre, ubicacion, activo } = req.body || {};

      const userId = req.user?.userId as string;
      const register = await cashRegisterService.update(
        id,
        {
          codigo: codigo ? String(codigo) : undefined,
          nombre: nombre ? String(nombre) : undefined,
          ubicacion: ubicacion !== undefined ? String(ubicacion) : undefined,
          activo: activo !== undefined ? Boolean(activo) : undefined,
        },
        userId
      );

      return ResponseHelper.success(res, register, 'Caja registradora actualizada');
    } catch (error: any) {
      console.error('Error en updateCashRegister:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({
        success: false,
        message: 'Error al actualizar caja registradora',
        error: errorMessage,
      });
    }
  },

  async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID es requerido',
          error: 'VALIDATION_ERROR',
        });
      }

      const userId = req.user?.userId as string;
      await cashRegisterService.delete(id, userId);

      return ResponseHelper.success(res, null, 'Caja registradora eliminada exitosamente');
    } catch (error: any) {
      console.error('Error en deleteCashRegister:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      return res.status(400).json({
        success: false,
        message: 'Error al eliminar caja registradora',
        error: errorMessage,
      });
    }
  },
};

export default CashRegisterController;
