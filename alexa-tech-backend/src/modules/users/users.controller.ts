import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { userService } from '../../services/userService';
import {
  validateUserCreate,
  validateUserUpdate,
  validateUserStatusUpdate,
} from '../../utils/validation';
import {
  sendSuccess,
  sendValidationError,
  sendNotFound,
  sendForbidden,
} from '../../utils/response';
import { asyncHandler } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

export class UserController {
  // GET /users - Obtener todos los usuarios (con filtros y paginación)
  static getAllUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { page = 1, limit = 10, status, search } = req.query;
      const currentUser = req.user;

      // Verificar permisos para ver usuarios
      const fullUser = await userService.findById(currentUser?.userId || '');
      if (!fullUser || !fullUser.permissions.includes('users.read')) {
        sendForbidden(res, 'No tienes permisos para ver la lista de usuarios');
        return;
      }

      try {
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);


        // Construir filtros
        const filters: any = {};

        // Filtrar por estado solo si se especifica
        if (status && status !== 'all') {
          filters.isActive = status === 'activo';
        }
        // No filtrar por defecto - mostrar todos los usuarios (activos e inactivos)

        // Buscar usuarios
        const { users, total: totalUsers } = await userService.findAll({
          page: pageNum,
          limit: limitNum,
          search: search as string,
          isActive: filters.isActive,
        });
        const totalPages = Math.ceil(totalUsers / limitNum);

        logger.info(`Users retrieved by ${currentUser?.email}`, {
          page: pageNum,
          limit: limitNum,
          total: totalUsers,
          filters,
        });

        sendSuccess(
          res,
          {
            users: users.map((user) => ({
              id: user.id,
              username: user.username,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              isActive: user.isActive,
              lastAccess: user.lastAccess,
              permissions: user.permissions || [],
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            })),
            pagination: {
              currentPage: pageNum,
              totalPages,
              totalUsers,
              hasNextPage: pageNum < totalPages,
              hasPrevPage: pageNum > 1,
            },
          },
          'Usuarios obtenidos exitosamente',
        );
      } catch (error) {
        logger.error('Error getting users:', error);
        throw error;
      }
    },
  );

  // GET /users/:id - Obtener usuario específico
  static getUserById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      if (!id) {
        sendValidationError(res, [
          { field: 'id', message: 'ID de usuario requerido' },
        ]);
        return;
      }

      // Verificar permisos: pueden ver su propio perfil o tener permiso users.read
      const fullUser = await userService.findById(currentUser?.userId || '');
      if (
        currentUser?.userId !== id &&
        (!fullUser || !fullUser.permissions.includes('users.read'))
      ) {
        sendForbidden(res, 'No tienes permisos para ver este usuario');
        return;
      }

      const user = await userService.findById(id);
      if (!user) {
        sendNotFound(res, 'Usuario no encontrado');
        return;
      }

      logger.info(`User ${id} retrieved by ${currentUser?.email}`);

      sendSuccess(
        res,
        {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
          permissions: user.permissions,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        'Usuario obtenido exitosamente',
      );
    },
  );

  // POST /users - Crear nuevo usuario
  static createUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const currentUser = req.user;

      // Verificar permisos para crear usuarios
      const fullUser = await userService.findById(currentUser?.userId || '');
      if (!fullUser || !fullUser.permissions.includes('users.create')) {
        sendForbidden(res, 'No tienes permisos para crear usuarios');
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
          permissions: req.body.permissions || [],
        });

        logger.info(`User created by ${fullUser.email}`, {
          newUserId: newUser.id,
          newUserEmail: newUser.email,
        });

        sendSuccess(
          res,
          {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            isActive: newUser.isActive,
            permissions: newUser.permissions,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
          },
          'Usuario creado exitosamente',
          201,
        );
      } catch (error) {
        logger.error('Error creating user:', error);
        throw error;
      }
    },
  );

  // PUT /users/:id - Actualizar usuario completo
  static updateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      if (!id) {
        sendValidationError(res, [
          { field: 'id', message: 'ID de usuario requerido' },
        ]);
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
          password: req.body.password, // Solo si se proporciona
          permissions: req.body.permissions,
        });

        if (!updatedUser) {
          sendNotFound(res, 'Usuario no encontrado');
          return;
        }

        logger.info(`User ${id} updated by ${currentUser?.email}`);

        sendSuccess(
          res,
          {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            isActive: updatedUser.isActive,
            permissions: updatedUser.permissions || [],
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
          },
          'Usuario actualizado exitosamente',
        );
      } catch (error) {
        logger.error('Error updating user:', error);
        throw error;
      }
    },
  );

  // PATCH /users/:id - Actualización parcial
  static patchUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      if (!id) {
        sendValidationError(res, [
          { field: 'id', message: 'ID de usuario requerido' },
        ]);
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
      const allowedFields = [
        'username',
        'email',
        'firstName',
        'lastName',
        'password',
        'permissions',
      ];

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        sendValidationError(res, [
          {
            field: 'body',
            message: 'No se proporcionaron campos para actualizar',
          },
        ]);
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

        logger.info(`User ${id} patched by ${currentUser?.email}`, {
          updatedFields: Object.keys(updateData),
        });

        sendSuccess(
          res,
          {
            id: updatedUser.id,
            username: updatedUser.username,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            isActive: updatedUser.isActive,
            permissions: updatedUser.permissions || [],
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
          },
          'Usuario actualizado exitosamente',
        );
      } catch (error) {
        logger.error('Error patching user:', error);
        throw error;
      }
    },
  );

  // PATCH /users/:id/status - Cambiar estado del usuario
  static updateUserStatus = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      if (!id) {
        sendValidationError(res, [
          { field: 'id', message: 'ID de usuario requerido' },
        ]);
        return;
      }

      // Verificar permisos para cambiar estados de usuarios
      const fullUser = await userService.findById(currentUser?.userId || '');
      if (!fullUser || !fullUser.permissions.includes('users.update')) {
        sendForbidden(
          res,
          'No tienes permisos para cambiar el estado de usuarios',
        );
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
          isActive: req.body.isActive,
        });

        if (!updatedUser) {
          sendNotFound(res, 'Usuario no encontrado');
          return;
        }

        logger.info(
          `User ${id} status changed to ${req.body.isActive} by ${currentUser?.email}`,
        );

        sendSuccess(
          res,
          {
            id: updatedUser.id,
            isActive: updatedUser.isActive,
          },
          `Usuario ${req.body.isActive ? 'activado' : 'desactivado'} exitosamente`,
        );
      } catch (error) {
        logger.error('Error updating user status:', error);
        throw error;
      }
    },
  );

  // DELETE /users/:id - Eliminar usuario (soft delete)
  static deleteUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const currentUser = req.user;

      if (!id) {
        sendValidationError(res, [
          { field: 'id', message: 'ID de usuario requerido' },
        ]);
        return;
      }

      // Verificar permisos para eliminar usuarios
      const fullUser = await userService.findById(currentUser?.userId || '');
      if (!fullUser || !fullUser.permissions.includes('users.delete')) {
        sendForbidden(res, 'No tienes permisos para eliminar usuarios');
        return;
      }

      // No se puede eliminar a sí mismo
      if (currentUser?.userId === id) {
        sendForbidden(res, 'No puedes eliminar tu propia cuenta');
        return;
      }

      try {
        const deletedUser = await userService.softDelete(id);

        if (!deletedUser) {
          sendNotFound(res, 'Usuario no encontrado');
          return;
        }

        logger.info(`User ${id} deleted by ${fullUser.email}`);

        sendSuccess(
          res,
          {
            id: deletedUser.id,
            deleted: true,
          },
          'Usuario eliminado exitosamente',
        );
      } catch (error) {
        logger.error('Error deleting user:', error);
        throw error;
      }
    },
  );

  // Método auxiliar para verificar permisos de edición
  private static async canEditUser(
    currentUser: any,
    targetUserId: string,
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (!currentUser) {
      return { allowed: false, reason: 'Usuario no autenticado' };
    }

    // Si es el mismo usuario, puede editarse a sí mismo
    if (currentUser?.userId === targetUserId) {
      return { allowed: true };
    }

    // Obtener permisos del usuario actual
    const fullUser = await userService.findById(currentUser?.userId || '');
    if (!fullUser) {
      return { allowed: false, reason: 'Usuario no encontrado' };
    }

    // Verificar si tiene permisos para editar usuarios
    if (fullUser.permissions.includes('users.update')) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'No tienes permisos para editar este usuario',
    };
  }

  static changePassword = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const { currentPassword, newPassword } = req.body;
      const currentUser = req.user;

      if (!id) {
        sendValidationError(res, [
          { field: 'id', message: 'ID de usuario requerido' },
        ]);
        return;
      }

      if (!currentPassword || !newPassword) {
        sendValidationError(res, [
          {
            field: 'password',
            message: 'Se requiere la contraseña actual y la nueva contraseña',
          },
        ]);
        return;
      }

      // Verificar permisos para cambiar contraseña
      const permissionCheck = await UserController.canEditUser(currentUser, id);
      if (!permissionCheck.allowed) {
        sendForbidden(
          res,
          permissionCheck.reason ||
            'No tienes permisos para cambiar la contraseña de este usuario',
        );
        return;
      }

      // Obtener el usuario objetivo
      const targetUser = await userService.findById(id);
      if (!targetUser) {
        sendNotFound(res, 'Usuario no encontrado');
        return;
      }

      // Verificar la contraseña actual solo si el usuario está cambiando su propia contraseña
      if (currentUser?.userId === id) {
        const isCurrentPasswordValid = await userService.verifyPassword(
          targetUser,
          currentPassword,
        );
        if (!isCurrentPasswordValid) {
          sendValidationError(res, [
            {
              field: 'currentPassword',
              message: 'La contraseña actual es incorrecta',
            },
          ]);
          return;
        }
      }

      try {
        // Cambiar la contraseña (el userService.update ya se encarga del hashing)
        await userService.update(id, { password: newPassword });

        logger.info(`Password changed for user ${id} by ${currentUser?.email}`);

        sendSuccess(res, null, 'Contraseña actualizada exitosamente');
      } catch (error) {
        logger.error('Error changing password:', error);
        throw error;
      }
    },
  );
}

export default UserController;
