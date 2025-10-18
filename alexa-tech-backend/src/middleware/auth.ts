import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { jwtService } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';
import { PermissionUtils } from '../utils/permissions';

// Middleware para verificar autenticación
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'Token de acceso requerido');
      return;
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    if (!token) {
      sendUnauthorized(res, 'Token de acceso requerido');
      return;
    }

    // Verificar el token
    const decoded = jwtService.verifyAccessToken(token);

    // Agregar información del usuario al request
    req.user = decoded;

    logger.auth('Token verified', decoded.userId, decoded.email);
    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Token inválido';
    logger.warn('Authentication failed', { error: errorMessage });
    sendUnauthorized(res, errorMessage);
  }
};

// Middleware para verificar permisos específicos (cualquiera de los permisos)
export const requirePermission = (...requiredPermissions: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, 'Usuario no autenticado');
      return;
    }

    try {
      // Obtener el usuario completo con permisos
      const user = await userService.findById(req.user.userId);

      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      const hasPermission = PermissionUtils.hasAnyPermission(
        user.permissions,
        requiredPermissions,
      );

      if (!hasPermission) {
        logger.warn('Permission authorization failed', {
          userId: req.user.userId,
          userPermissions: user.permissions,
          requiredPermissions,
          endpoint: req.path,
        });
        sendForbidden(res, 'No tienes permisos para acceder a este recurso');
        return;
      }

      logger.debug('Permission authorization successful', {
        userId: req.user.userId,
        requiredPermissions,
        endpoint: req.path,
      });
      next();
    } catch (error) {
      logger.error('Error checking permissions', {
        error,
        userId: req.user.userId,
      });
      sendForbidden(res, 'Error al verificar permisos');
    }
  };
};

// Middleware para verificar que el usuario tenga TODOS los permisos especificados
export const requireAllPermissions = (...requiredPermissions: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, 'Usuario no autenticado');
      return;
    }

    try {
      const user = await userService.findById(req.user.userId);

      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      const hasAllPermissions = PermissionUtils.hasAllPermissions(
        user.permissions,
        requiredPermissions,
      );

      if (!hasAllPermissions) {
        logger.warn('All permissions authorization failed', {
          userId: req.user.userId,
          userPermissions: user.permissions,
          requiredPermissions,
          endpoint: req.path,
        });
        sendForbidden(
          res,
          'No tienes todos los permisos necesarios para acceder a este recurso',
        );
        return;
      }

      logger.debug('All permissions authorization successful', {
        userId: req.user.userId,
        requiredPermissions,
        endpoint: req.path,
      });
      next();
    } catch (error) {
      logger.error('Error checking all permissions', {
        error,
        userId: req.user.userId,
      });
      sendForbidden(res, 'Error al verificar permisos');
    }
  };
};

// Middleware para verificar permisos de administración
export const requireAdmin = requirePermission(
  'system.settings',
  'users.delete',
);

// Middleware para verificar permisos de supervisión
export const requireSupervisor = requirePermission(
  'users.update',
  'reports.sales',
);

// Middleware para verificar si es el mismo usuario o tiene permisos de administración
export const requireOwnerOrAdmin = (userIdParam: string = 'id') => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, 'Usuario no autenticado');
      return;
    }

    const requestedUserId = req.params[userIdParam];
    const currentUserId = req.user.userId;

    // Si es el mismo usuario, permitir acceso
    if (currentUserId === requestedUserId) {
      logger.debug('Owner authorization successful', {
        currentUserId,
        requestedUserId,
        endpoint: req.path,
      });
      next();
      return;
    }

    try {
      // Si no es el mismo usuario, verificar permisos de administración
      const user = await userService.findById(req.user.userId);

      if (!user) {
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      const hasAdminPermissions = PermissionUtils.hasAnyPermission(
        user.permissions,
        ['users.update', 'users.delete', 'system.settings'],
      );

      if (!hasAdminPermissions) {
        logger.warn('Owner/Admin authorization failed', {
          currentUserId,
          requestedUserId,
          userPermissions: user.permissions,
          endpoint: req.path,
        });
        sendForbidden(res, 'Solo puedes acceder a tu propia información');
        return;
      }

      logger.debug('Admin authorization successful', {
        currentUserId,
        requestedUserId,
        endpoint: req.path,
      });
      next();
    } catch (error) {
      logger.error('Error checking owner/admin permissions', {
        error,
        userId: req.user.userId,
      });
      sendForbidden(res, 'Error al verificar permisos');
    }
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        try {
          const decoded = jwtService.verifyAccessToken(token);
          req.user = decoded;
          logger.debug('Optional auth successful', { userId: decoded.userId });
        } catch (error) {
          // En auth opcional, ignoramos errores de token
          logger.debug('Optional auth failed, continuing without user', {
            error,
          });
        }
      }
    }

    next();
  } catch (error) {
    // En auth opcional, siempre continuamos
    logger.debug('Optional auth error, continuing without user', { error });
    next();
  }
};

export default {
  authenticate,
  requirePermission,
  requireAllPermissions,
  requireAdmin,
  requireSupervisor,
  requireOwnerOrAdmin,
  optionalAuth,
};
