import { Request, Response } from 'express';
import { roleService } from './roles.service';
import { RoleCreateInput, RoleUpdateInput } from './roles.types';
import {
  sendSuccess,
  sendCreated,
  sendError,
  sendNotFound,
} from '../../utils/response';
import { logger } from '../../utils/logger';

export class RoleController {
  
  // GET /api/roles - Obtener todos los roles
  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const roles = await roleService.findAll(includeInactive);
      
      sendSuccess(res, roles, 'Roles obtenidos correctamente');
    } catch (error) {
      logger.error('Error en getAllRoles:', error);
      sendError(res, 'Error al obtener los roles');
    }
  }

  // GET /api/roles/stats - Obtener estadísticas de roles
  async getRoleStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await roleService.getStats();
      sendSuccess(res, stats, 'Estadísticas obtenidas correctamente');
    } catch (error) {
      logger.error('Error en getRoleStats:', error);
      sendError(res, 'Error al obtener estadísticas');
    }
  }

  // GET /api/roles/permissions - Obtener permisos válidos
  async getValidPermissions(req: Request, res: Response): Promise<void> {
    try {
      const permissions = roleService.getValidPermissions();
      sendSuccess(res, permissions, 'Permisos obtenidos correctamente');
    } catch (error) {
      logger.error('Error en getValidPermissions:', error);
      sendError(res, 'Error al obtener permisos');
    }
  }

  // GET /api/roles/:id - Obtener un rol por ID
  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        sendError(res, 'ID de rol requerido', 400);
        return;
      }
      
      const includeUsers = req.query.includeUsers === 'true';
      
      const role = await roleService.findById(id, includeUsers);
      
      if (!role) {
        sendNotFound(res, 'Rol no encontrado');
        return;
      }
      
      sendSuccess(res, role, 'Rol obtenido correctamente');
    } catch (error) {
      logger.error('Error en getRoleById:', error);
      sendError(res, 'Error al obtener el rol');
    }
  }

  // POST /api/roles - Crear un nuevo rol
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const roleData: RoleCreateInput = req.body;

      // Validaciones básicas
      if (!roleData.name) {
        sendError(res, 'El nombre del rol es requerido', 400);
        return;
      }

      if (!roleData.permissions || roleData.permissions.length === 0) {
        sendError(res, 'El rol debe tener al menos un permiso', 400);
        return;
      }

      const role = await roleService.create(roleData);
      sendCreated(res, role, 'Rol creado exitosamente');
    } catch (error: any) {
      logger.error('Error en createRole:', error);
      
      if (error.message.includes('ya existe')) {
        sendError(res, error.message, 400);
      } else if (error.message.includes('inválidos')) {
        sendError(res, error.message, 400);
      } else {
        sendError(res, 'Error al crear el rol');
      }
    }
  }

  // PUT /api/roles/:id - Actualizar un rol
  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        sendError(res, 'ID de rol requerido', 400);
        return;
      }
      
      const roleData: RoleUpdateInput = req.body;

      const updatedRole = await roleService.update(id, roleData);
      sendSuccess(res, updatedRole, 'Rol actualizado exitosamente');
    } catch (error: any) {
      logger.error('Error en updateRole:', error);
      
      if (error.message.includes('no encontrado')) {
        sendNotFound(res, error.message);
      } else if (error.message.includes('sistema')) {
        sendError(res, error.message, 400);
      } else if (error.message.includes('ya existe')) {
        sendError(res, error.message, 400);
      } else if (error.message.includes('inválidos')) {
        sendError(res, error.message, 400);
      } else {
        sendError(res, 'Error al actualizar el rol');
      }
    }
  }

  // PATCH /api/roles/:id/permissions - Actualizar solo permisos
  async updateRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        sendError(res, 'ID de rol requerido', 400);
        return;
      }
      
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        sendError(res, 'Los permisos deben ser un array', 400);
        return;
      }

      if (permissions.length === 0) {
        sendError(res, 'El rol debe tener al menos un permiso', 400);
        return;
      }

      const updatedRole = await roleService.updatePermissions(id, permissions);
      sendSuccess(res, updatedRole, 'Permisos actualizados exitosamente');
    } catch (error: any) {
      logger.error('Error en updateRolePermissions:', error);
      
      if (error.message.includes('no encontrado')) {
        sendNotFound(res, error.message);
      } else if (error.message.includes('inválidos')) {
        sendError(res, error.message, 400);
      } else {
        sendError(res, 'Error al actualizar permisos');
      }
    }
  }

  // DELETE /api/roles/:id - Eliminar un rol
  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        sendError(res, 'ID de rol requerido', 400);
        return;
      }
      
      await roleService.delete(id);
      sendSuccess(res, null, 'Rol eliminado exitosamente');
    } catch (error: any) {
      logger.error('Error en deleteRole:', error);
      
      if (error.message.includes('no encontrado')) {
        sendNotFound(res, error.message);
      } else if (error.message.includes('sistema')) {
        sendError(res, error.message, 400);
      } else if (error.message.includes('usuario(s) asignado(s)')) {
        sendError(res, error.message, 400);
      } else {
        sendError(res, 'Error al eliminar el rol');
      }
    }
  }

  // PATCH /api/roles/:id/deactivate - Desactivar un rol
  async deactivateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        sendError(res, 'ID de rol requerido', 400);
        return;
      }
      
      const updatedRole = await roleService.deactivate(id);
      sendSuccess(res, updatedRole, 'Rol desactivado exitosamente');
    } catch (error: any) {
      logger.error('Error en deactivateRole:', error);
      
      if (error.message.includes('no encontrado')) {
        sendNotFound(res, error.message);
      } else if (error.message.includes('sistema')) {
        sendError(res, error.message, 400);
      } else {
        sendError(res, 'Error al desactivar el rol');
      }
    }
  }

  // PATCH /api/roles/:id/activate - Activar un rol
  async activateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      if (!id) {
        sendError(res, 'ID de rol requerido', 400);
        return;
      }
      
      const updatedRole = await roleService.activate(id);
      sendSuccess(res, updatedRole, 'Rol activado exitosamente');
    } catch (error: any) {
      logger.error('Error en activateRole:', error);
      
      if (error.message.includes('no encontrado')) {
        sendNotFound(res, error.message);
      } else {
        sendError(res, 'Error al activar el rol');
      }
    }
  }
}

export const roleController = new RoleController();
