import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { PermissionUtils } from '../utils/permissions';
import { sendSuccess, sendValidationError } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';

export class PermissionController {
  // GET /permissions - Obtener todos los permisos disponibles
  static getAllPermissions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const permissions = PermissionUtils.getAvailablePermissions();

      // Agrupar permisos por categoría
      const groupedPermissions = permissions.reduce(
        (acc, permission) => {
          const [category] = permission.split('.');
          if (category) {
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(permission);
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );

      sendSuccess(
        res,
        {
          permissions,
          groupedPermissions,
          totalCount: permissions.length,
        },
        'Permisos obtenidos exitosamente',
      );
    },
  );

  // GET /permissions/categories - Obtener permisos agrupados por categoría
  static getPermissionsByCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const permissions = PermissionUtils.getAvailablePermissions();

      // Agrupar permisos por categoría
      const groupedPermissions = permissions.reduce(
        (acc, permission) => {
          const [category] = permission.split('.');
          if (category) {
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(permission);
          }
          return acc;
        },
        {} as Record<string, string[]>,
      );

      sendSuccess(
        res,
        groupedPermissions,
        'Permisos por categoría obtenidos exitosamente',
      );
    },
  );

  // GET /permissions/validate/:permission - Validar si un permiso específico existe
  static validatePermission = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { permission } = req.params;

      if (!permission) {
        sendValidationError(res, [
          { field: 'permission', message: 'Permiso requerido' },
        ]);
        return;
      }

      const isValid = PermissionUtils.isValidPermission(permission);

      sendSuccess(
        res,
        {
          permission,
          isValid,
          availablePermissions: isValid
            ? undefined
            : PermissionUtils.getAvailablePermissions(),
        },
        `Validación de permiso ${permission} completada`,
      );
    },
  );

  // POST /permissions/validate - Validar si un usuario tiene permisos específicos
  static validateUserPermissions = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const {
        userPermissions,
        requiredPermissions,
        requireAll = false,
      } = req.body;

      if (
        !Array.isArray(userPermissions) ||
        !Array.isArray(requiredPermissions)
      ) {
        sendValidationError(res, [
          {
            field: 'userPermissions',
            message: 'userPermissions debe ser un array',
          },
          {
            field: 'requiredPermissions',
            message: 'requiredPermissions debe ser un array',
          },
        ]);
        return;
      }

      const hasPermission = requireAll
        ? PermissionUtils.hasAllPermissions(
            userPermissions,
            requiredPermissions,
          )
        : PermissionUtils.hasAnyPermission(
            userPermissions,
            requiredPermissions,
          );

      const missingPermissions = requireAll
        ? requiredPermissions.filter((p) => !userPermissions.includes(p))
        : [];

      sendSuccess(
        res,
        {
          hasPermission,
          userPermissions,
          requiredPermissions,
          requireAll,
          missingPermissions: requireAll ? missingPermissions : undefined,
        },
        'Validación de permisos completada',
      );
    },
  );

  // GET /permissions/check/:permissionId - Verificar si el usuario actual tiene un permiso específico
  static checkCurrentUserPermission = asyncHandler(
    async (req: AuthenticatedRequest, res: Response): Promise<void> => {
      const { permissionId } = req.params;
      const currentUser = req.user;

      if (!currentUser) {
        sendValidationError(res, [
          { field: 'user', message: 'Usuario no autenticado' },
        ]);
        return;
      }

      if (!permissionId) {
        sendValidationError(res, [
          { field: 'permissionId', message: 'ID de permiso requerido' },
        ]);
        return;
      }

      // Verificar si el permiso existe en el sistema
      const isValidPermission = PermissionUtils.isValidPermission(permissionId);
      if (!isValidPermission) {
        sendValidationError(res, [
          { field: 'permissionId', message: 'Permiso no válido' },
        ]);
        return;
      }

      try {
        // Obtener los permisos del usuario desde la base de datos
        const user = await userService.findById(currentUser.userId);

        if (!user) {
          sendValidationError(res, [
            { field: 'user', message: 'Usuario no encontrado' },
          ]);
          return;
        }

        const hasPermission = PermissionUtils.hasPermission(
          user.permissions || [],
          permissionId,
        );

        sendSuccess(
          res,
          {
            hasPermission,
            permissionId,
            isValidPermission,
            userId: currentUser.userId,
          },
          `Verificación de permiso ${permissionId} completada`,
        );
      } catch (error) {
        logger.error('Error checking user permission', {
          error,
          userId: currentUser.userId,
          permissionId,
        });
        sendValidationError(res, [
          {
            field: 'system',
            message: 'Error al verificar permisos del usuario',
          },
        ]);
      }
    },
  );
}

export default PermissionController;
