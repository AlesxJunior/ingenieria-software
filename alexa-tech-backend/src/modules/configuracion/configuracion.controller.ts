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

  // ==========================================
  // CATEGORÍAS DE PRODUCTOS
  // ==========================================

  async getAllCategories(req: Request, res: Response): Promise<Response> {
    try {
      const activoParam = req.query.activo;
      let categories;
      
      if (activoParam === 'true') {
        categories = await configuracionService.getActiveCategories();
      } else if (activoParam === 'false') {
        categories = await configuracionService.getInactiveCategories();
      } else {
        categories = await configuracionService.getAllCategories();
      }
      
      return ResponseHelper.success(res, categories, 'Categorías obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al obtener categorías', error.message);
    }
  }

  async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const category = await configuracionService.getCategoryById(id);
      
      if (!category) {
        return ResponseHelper.notFound(res, 'Categoría no encontrada');
      }
      
      return res.json(category);
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al obtener categoría', error.message);
    }
  }

  async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { codigo, nombre } = req.body;
      
      // Validaciones
      const errors: string[] = [];
      if (!codigo || codigo.trim() === '') errors.push('Código es requerido');
      if (!nombre || nombre.trim() === '') errors.push('Nombre es requerido');
      if (codigo && codigo.length > 10) errors.push('Código no puede exceder 10 caracteres');
      if (nombre && nombre.length > 100) errors.push('Nombre no puede exceder 100 caracteres');
      
      if (errors.length > 0) {
        return ResponseHelper.validationError(res, errors);
      }
      
      const category = await configuracionService.createCategory(req.body);
      return ResponseHelper.created(res, category, 'Categoría creada exitosamente');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al crear categoría', error.message);
    }
  }

  async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const category = await configuracionService.updateCategory(id, req.body);
      return ResponseHelper.success(res, category, 'Categoría actualizada exitosamente');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al actualizar categoría', error.message);
    }
  }

  async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      await configuracionService.deleteCategory(id);
      return res.status(204).send();
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al eliminar categoría', error.message);
    }
  }

  async hardDeleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      await configuracionService.hardDeleteCategory(id);
      return res.status(204).send();
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al eliminar categoría permanentemente', error.message);
    }
  }

  // ==========================================
  // UNIDADES DE MEDIDA
  // ==========================================

  async getAllUnits(req: Request, res: Response): Promise<Response> {
    try {
      const activoParam = req.query.activo;
      let units;
      
      if (activoParam === 'true') {
        units = await configuracionService.getActiveUnits();
      } else if (activoParam === 'false') {
        units = await configuracionService.getInactiveUnits();
      } else {
        units = await configuracionService.getAllUnits();
      }
      
      return ResponseHelper.success(res, units, 'Unidades obtenidas exitosamente');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al obtener unidades de medida', error.message);
    }
  }

  async getUnitById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const unit = await configuracionService.getUnitById(id);
      
      if (!unit) {
        return ResponseHelper.notFound(res, 'Unidad de medida no encontrada');
      }
      
      return res.json(unit);
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al obtener unidad de medida', error.message);
    }
  }

  async createUnit(req: Request, res: Response): Promise<Response> {
    try {
      const { codigo, nombre } = req.body;
      
      // Validaciones
      const errors: string[] = [];
      if (!codigo || codigo.trim() === '') errors.push('Código es requerido');
      if (!nombre || nombre.trim() === '') errors.push('Nombre es requerido');
      if (codigo && codigo.length > 10) errors.push('Código no puede exceder 10 caracteres');
      if (nombre && nombre.length > 100) errors.push('Nombre no puede exceder 100 caracteres');
      
      if (errors.length > 0) {
        return ResponseHelper.validationError(res, errors);
      }
      
      const unit = await configuracionService.createUnit(req.body);
      return ResponseHelper.created(res, unit, 'Unidad de medida creada exitosamente');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al crear unidad de medida', error.message);
    }
  }

  async updateUnit(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      const unit = await configuracionService.updateUnit(id, req.body);
      return ResponseHelper.success(res, unit, 'Unidad de medida actualizada exitosamente');
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al actualizar unidad de medida', error.message);
    }
  }

  async deleteUnit(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      await configuracionService.deleteUnit(id);
      return res.status(204).send();
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al eliminar unidad de medida', error.message);
    }
  }

  async hardDeleteUnit(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return ResponseHelper.validationError(res, ['ID requerido']);
      }
      
      await configuracionService.hardDeleteUnit(id);
      return res.status(204).send();
    } catch (error: any) {
      return ResponseHelper.error(res, 'Error al eliminar unidad de medida permanentemente', error.message);
    }
  }
}

export const configuracionController = new ConfiguracionController();
