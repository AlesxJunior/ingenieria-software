import { Request, Response } from 'express';
import { configuracionService } from './configuracion.service';
import { ResponseHelper } from '../../utils/response';

export class ConfiguracionController {
  // ==========================================
  // EMPRESA
  // ==========================================

  async getEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const empresa = await configuracionService.getCompany();
      res.json(empresa);
    } catch (error: any) {
      ResponseHelper.error(res, 'Error al obtener datos de empresa', error.message);
    }
  }

  async updateEmpresa(req: Request, res: Response): Promise<void> {
    try {
      const empresa = await configuracionService.updateCompany(req.body);
      ResponseHelper.success(res, empresa, 'Datos de empresa actualizados');
    } catch (error: any) {
      ResponseHelper.error(res, 'Error al actualizar empresa', error.message);
    }
  }

  // ==========================================
  // TIPOS DE COMPROBANTES
  // ==========================================

  async getAllComprobantes(req: Request, res: Response): Promise<void> {
    try {
      const comprobantes = await configuracionService.getAllComprobanteTypes();
      res.json(comprobantes);
    } catch (error: any) {
      ResponseHelper.error(res, 'Error al obtener comprobantes', error.message);
    }
  }

  async getComprobanteById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const comprobante = await configuracionService.getComprobanteTypeById(id);
      
      if (!comprobante) {
        return ResponseHelper.notFound(res, 'Tipo de comprobante no encontrado');
      }
      
      return res.json(comprobante);
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al obtener comprobante', error.message);
    }
  }

  async createComprobante(req: Request, res: Response): Promise<Response> {
    try {
      const comprobante = await configuracionService.createComprobanteType(req.body);
      return ResponseHelper.created(res, comprobante, 'Comprobante creado');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al crear comprobante', error.message);
    }
  }

  async updateComprobante(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const comprobante = await configuracionService.updateComprobanteType(id, req.body);
      return ResponseHelper.success(res, comprobante, 'Comprobante actualizado');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al actualizar comprobante', error.message);
    }
  }

  async deleteComprobante(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      await configuracionService.deleteComprobanteType(id);
      return res.status(204).send();
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al eliminar comprobante', error.message);
    }
  }

  // ==========================================
  // MÉTODOS DE PAGO
  // ==========================================

  async getAllMetodosPago(req: Request, res: Response): Promise<void> {
    try {
      const metodos = await configuracionService.getAllPaymentMethods();
      res.json(metodos);
    } catch (error: any) {
      ResponseHelper.error(res, 'Error al obtener métodos de pago', error.message);
    }
  }

  async getMetodoPagoById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const metodo = await configuracionService.getPaymentMethodById(id);
      
      if (!metodo) {
        return ResponseHelper.notFound(res, 'Método de pago no encontrado');
      }
      
      return res.json(metodo);
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al obtener método de pago', error.message);
    }
  }

  async createMetodoPago(req: Request, res: Response): Promise<Response> {
    try {
      const metodo = await configuracionService.createPaymentMethod(req.body);
      return ResponseHelper.created(res, metodo, 'Método de pago creado');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al crear método de pago', error.message);
    }
  }

  async updateMetodoPago(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const metodo = await configuracionService.updatePaymentMethod(id, req.body);
      return ResponseHelper.success(res, metodo, 'Método de pago actualizado');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al actualizar método de pago', error.message);
    }
  }

  async deleteMetodoPago(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      await configuracionService.deletePaymentMethod(id);
      return res.status(204).send();
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al eliminar método de pago', error.message);
    }
  }
}

export const configuracionController = new ConfiguracionController();
