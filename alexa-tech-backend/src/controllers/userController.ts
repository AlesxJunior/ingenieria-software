import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { userService } from '../services/userService';
import { UserRole } from '../generated/prisma';
import { 
  validateUserCreate, 
  validateUserUpdate,
  validateUserStatusUpdate 
} from '../utils/validation';
import { 
  sendSuccess, 
  sendValidationError,
  sendNotFound,
  sendForbidden 
} from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class UserController {
  // GET /users - Obtener todos los usuarios (con filtros y paginación)
  static getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const currentUser = req.user;

    // Solo admins y supervisores pueden ver todos los usuarios
    if (currentUser?.role === UserRole.VENDEDOR || currentUser?.role === UserRole.CAJERO) {
      sendForbidden(res, 'No tienes permisos para ver la lista de usuarios');
      return;
    }

    try {
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      // Construir filtros
      const filters: any = {};
      
      if (role && role !== 'all') {
        filters.role = role as UserRole;
      }
      
      if (status && status !== 'all') {
        filters.isActive = status === 'active';
      }

      // Buscar usuarios
      const { users, total: totalUsers } = await userService.findAllWithPermissions({
        page: pageNum,
        limit: limitNum,
        search: search as string,
        role: filters.role,
        isActive: filters.isActive
      });
      const totalPages = Math.ceil(totalUsers / limitNum);

      logger.info(`Users retrieved by ${currentUser?.email}`, {
        page: pageNum,
        limit: limitNum,
        total: totalUsers,
        filters
      });

      sendSuccess(res, {
        users: users.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isActive: user.isActive,
          permissions: user.permissions.map((up: any) => ({
          id: up.permission.id,
          module: up.permission.module,
          submodule: up.permission.submodule,
          name: up.permission.name,
          description: up.permission.description
        })),
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        })),
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalUsers,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }, 'Usuarios obtenidos exitosamente');
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  });

  // GET /users/:id - Obtener usuario específico
  static getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!id) {
      sendValidationError(res, [{ field: 'id', message: 'ID de usuario requerido' }]);
      return;
    }

    // Los vendedores y cajeros solo pueden ver su propio perfil, admins y supervisores pueden ver cualquiera
    if ((currentUser?.role === UserRole.VENDEDOR || currentUser?.role === UserRole.CAJERO) && currentUser.userId !== id) {
      sendForbidden(res, 'No tienes permisos para ver este usuario');
      return;
    }

    const user = await userService.findByIdWithPermissions(id);
    if (!user) {
      sendNotFound(res, 'Usuario no encontrado');
      return;
    }

    logger.info(`User ${id} retrieved by ${currentUser?.email}`);

    sendSuccess(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions.map((up: any) => ({
        id: up.permission.id,
        module: up.permission.module,
        submodule: up.permission.submodule,
        name: up.permission.name,
        description: up.permission.description
      })),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }, 'Usuario obtenido exitosamente');
  });

  // POST /users - Crear nuevo usuario (solo admins)
  static createUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const currentUser = req.user;

    // Solo admins pueden crear usuarios
    if (currentUser?.role !== UserRole.ADMIN) {
      sendForbidden(res, 'Solo los administradores pueden crear usuarios');
      return;
    }

    // Validar datos
    const validation = validateUserCreate(req.body);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors);
      return;
    }

    try {
      const newUser = await userService.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.firstName || '',
        lastName: req.body.lastName || '',
        role: req.body.role || UserRole.VENDEDOR
      });

      // Asignar permisos si se proporcionan
      if (req.body.permissions && Array.isArray(req.body.permissions)) {
        await userService.assignPermissions(newUser.id, req.body.permissions);
      }

      // Obtener el usuario con permisos
      const userWithPermissions = await userService.findByIdWithPermissions(newUser.id);

      logger.info(`User created by ${currentUser.email}`, {
        newUserId: newUser.id,
        newUserEmail: newUser.email,
        permissions: req.body.permissions
      });

      sendSuccess(res, {
        id: userWithPermissions!.id,
        username: userWithPermissions!.username,
        email: userWithPermissions!.email,
        firstName: userWithPermissions!.firstName,
        lastName: userWithPermissions!.lastName,
        role: userWithPermissions!.role,
        isActive: userWithPermissions!.isActive,
        permissions: userWithPermissions!.permissions.map((up: any) => ({
          id: up.permission.id,
          module: up.permission.module,
          submodule: up.permission.submodule,
          name: up.permission.name,
          description: up.permission.description
        })),
        createdAt: userWithPermissions!.createdAt,
        updatedAt: userWithPermissions!.updatedAt
      }, 'Usuario creado exitosamente', 201);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  });

  // PUT /users/:id - Actualizar usuario completo
  static updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!id) {
      sendValidationError(res, [{ field: 'id', message: 'ID de usuario requerido' }]);
      return;
    }

    // Verificar permisos
    const canEdit = await UserController.canEditUser(currentUser, id);
    if (!canEdit.allowed) {
      sendForbidden(res, canEdit.reason);
      return;
    }

    // Validar datos
    const validation = validateUserUpdate(req.body);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors);
      return;
    }

    try {
      const updatedUser = await userService.update(id, {
        username: req.body.username,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        role: req.body.role,
        password: req.body.password // Solo si se proporciona
      });

      if (!updatedUser) {
        sendNotFound(res, 'Usuario no encontrado');
        return;
      }

      // Actualizar permisos si se proporcionan
      if (req.body.permissions && Array.isArray(req.body.permissions)) {
        await userService.updatePermissions(id, req.body.permissions);
      }

      // Obtener el usuario con permisos actualizados
      const userWithPermissions = await userService.findByIdWithPermissions(id);

      logger.info(`User ${id} updated by ${currentUser?.email}`, {
        permissions: req.body.permissions
      });

      sendSuccess(res, {
        id: userWithPermissions!.id,
        username: userWithPermissions!.username,
        email: userWithPermissions!.email,
        firstName: userWithPermissions!.firstName,
        lastName: userWithPermissions!.lastName,
        role: userWithPermissions!.role,
        isActive: userWithPermissions!.isActive,
        permissions: userWithPermissions!.permissions.map((up: any) => ({
          id: up.permission.id,
          module: up.permission.module,
          submodule: up.permission.submodule,
          name: up.permission.name,
          description: up.permission.description
        })),
        createdAt: userWithPermissions!.createdAt,
        updatedAt: userWithPermissions!.updatedAt
      }, 'Usuario actualizado exitosamente');
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  });

  // PATCH /users/:id - Actualización parcial
  static patchUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!id) {
      sendValidationError(res, [{ field: 'id', message: 'ID de usuario requerido' }]);
      return;
    }

    // Verificar permisos
    const canEdit = await UserController.canEditUser(currentUser, id);
    if (!canEdit.allowed) {
      sendForbidden(res, canEdit.reason);
      return;
    }

    // Validar solo los campos proporcionados
    const updateData: any = {};
    const allowedFields = ['username', 'email', 'firstName', 'lastName', 'role', 'password'];
    
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      sendValidationError(res, [{ field: 'body', message: 'No se proporcionaron campos para actualizar' }]);
      return;
    }

    // Validar datos parciales
    const validation = validateUserUpdate(updateData);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors);
      return;
    }

    try {
      const updatedUser = await userService.update(id, updateData);

      if (!updatedUser) {
        sendNotFound(res, 'Usuario no encontrado');
        return;
      }

      logger.info(`User ${id} patched by ${currentUser?.email}`, { updatedFields: Object.keys(updateData) });

      sendSuccess(res, {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }, 'Usuario actualizado exitosamente');
    } catch (error) {
      logger.error('Error patching user:', error);
      throw error;
    }
  });

  // PATCH /users/:id/status - Cambiar estado del usuario
  static updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!id) {
      sendValidationError(res, [{ field: 'id', message: 'ID de usuario requerido' }]);
      return;
    }

    // Solo admins y supervisores pueden cambiar estados
    if (currentUser?.role === UserRole.VENDEDOR || currentUser?.role === UserRole.CAJERO) {
      sendForbidden(res, 'No tienes permisos para cambiar el estado de usuarios');
      return;
    }

    // No se puede desactivar a sí mismo
    if (currentUser?.userId === id) {
      sendForbidden(res, 'No puedes cambiar tu propio estado');
      return;
    }

    // Validar datos
    const validation = validateUserStatusUpdate(req.body);
    if (!validation.isValid) {
      sendValidationError(res, validation.errors);
      return;
    }

    try {
      const updatedUser = await userService.update(id, {
        isActive: req.body.isActive
      });

      if (!updatedUser) {
        sendNotFound(res, 'Usuario no encontrado');
        return;
      }

      logger.info(`User ${id} status changed to ${req.body.isActive} by ${currentUser?.email}`);

      sendSuccess(res, {
        id: updatedUser.id,
        isActive: updatedUser.isActive
      }, `Usuario ${req.body.isActive ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      logger.error('Error updating user status:', error);
      throw error;
    }
  });

  // DELETE /users/:id - Eliminar usuario (soft delete)
  static deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUser = req.user;

    if (!id) {
      sendValidationError(res, [{ field: 'id', message: 'ID de usuario requerido' }]);
      return;
    }

    // Solo admins pueden eliminar usuarios
    if (currentUser?.role !== UserRole.ADMIN) {
      sendForbidden(res, 'Solo los administradores pueden eliminar usuarios');
      return;
    }

    // No se puede eliminar a sí mismo
    if (currentUser.userId === id) {
      sendForbidden(res, 'No puedes eliminar tu propia cuenta');
      return;
    }

    try {
      const deletedUser = await userService.softDelete(id);

      if (!deletedUser) {
        sendNotFound(res, 'Usuario no encontrado');
        return;
      }

      logger.info(`User ${id} deleted by ${currentUser.email}`);

      sendSuccess(res, {
        id: deletedUser.id,
        deleted: true
      }, 'Usuario eliminado exitosamente');
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  });

  // GET /permissions - Obtener todos los permisos disponibles
  static getAllPermissions = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const currentUser = req.user;

    // Solo admins y supervisores pueden ver todos los permisos
    if (currentUser?.role === UserRole.VENDEDOR || currentUser?.role === UserRole.CAJERO) {
      sendForbidden(res, 'No tienes permisos para ver los permisos disponibles');
      return;
    }

    try {
      const permissions = await userService.getAllPermissions();

      // Agrupar permisos por módulo y submódulo
      const groupedPermissions = permissions.reduce((acc: any, permission: any) => {
        if (!acc[permission.module]) {
          acc[permission.module] = {};
        }
        if (!acc[permission.module][permission.submodule]) {
          acc[permission.module][permission.submodule] = [];
        }
        acc[permission.module][permission.submodule].push({
          id: permission.id,
          name: permission.name,
          description: permission.description
        });
        return acc;
      }, {});

      logger.info(`Permissions retrieved by ${currentUser?.email}`);

      sendSuccess(res, {
        permissions: groupedPermissions,
        total: permissions.length
      }, 'Permisos obtenidos exitosamente');
    } catch (error) {
      logger.error('Error getting permissions:', error);
      throw error;
    }
  });

  // Método auxiliar para verificar permisos de edición
  private static async canEditUser(currentUser: any, targetUserId: string): Promise<{ allowed: boolean; reason?: string }> {
    if (!currentUser) {
      return { allowed: false, reason: 'Usuario no autenticado' };
    }

    // Los admins pueden editar a cualquiera
    if (currentUser.role === UserRole.ADMIN) {
      return { allowed: true };
    }

    // Los supervisores pueden editar vendedores y cajeros, pero no otros supervisores o admins
    if (currentUser.role === UserRole.SUPERVISOR) {
      const targetUser = await userService.findById(targetUserId);
      if (!targetUser) {
        return { allowed: false, reason: 'Usuario no encontrado' };
      }

      if (targetUser.role === UserRole.VENDEDOR || targetUser.role === UserRole.CAJERO || currentUser.userId === targetUserId) {
        return { allowed: true };
      }

      return { allowed: false, reason: 'No puedes editar usuarios con rol de supervisor o administrador' };
    }

    // Los vendedores y cajeros solo pueden editarse a sí mismos
    if ((currentUser.role === UserRole.VENDEDOR || currentUser.role === UserRole.CAJERO) && currentUser.userId === targetUserId) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'No tienes permisos para editar este usuario' };
  }
}

export default UserController;