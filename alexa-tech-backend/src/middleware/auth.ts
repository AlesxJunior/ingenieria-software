import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserRole } from '../generated/prisma';
import { jwtService } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import { logger } from '../utils/logger';
import { userService } from '../services/userService';

// Middleware para verificar autenticación
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
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
    const errorMessage = error instanceof Error ? error.message : 'Token inválido';
    logger.warn('Authentication failed', { error: errorMessage });
    sendUnauthorized(res, errorMessage);
  }
};

// Middleware para verificar roles específicos
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Usuario no autenticado');
      return;
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      logger.warn('Authorization failed', {
        userId: req.user.userId,
        userRole,
        allowedRoles,
        endpoint: req.path
      });
      sendForbidden(res, 'No tienes permisos para acceder a este recurso');
      return;
    }

    logger.debug('Authorization successful', {
      userId: req.user.userId,
      userRole,
      endpoint: req.path
    });
    next();
  };
};

// Middleware para verificar si es admin
export const requireAdmin = authorize(UserRole.ADMIN);

// Middleware para verificar si es admin o supervisor
export const requireSupervisor = authorize(UserRole.ADMIN, UserRole.SUPERVISOR);

// Middleware para verificar si es el mismo usuario o admin
export const requireOwnerOrAdmin = (userIdParam: string = 'id') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendUnauthorized(res, 'Usuario no autenticado');
      return;
    }

    const requestedUserId = req.params[userIdParam];
    const currentUserId = req.user.userId;
    const isAdmin = req.user.role === UserRole.ADMIN;

    if (currentUserId !== requestedUserId && !isAdmin) {
      logger.warn('Owner/Admin authorization failed', {
        currentUserId,
        requestedUserId,
        userRole: req.user.role,
        endpoint: req.path
      });
      sendForbidden(res, 'Solo puedes acceder a tu propia información');
      return;
    }

    logger.debug('Owner/Admin authorization successful', {
      currentUserId,
      requestedUserId,
      userRole: req.user.role,
      endpoint: req.path
    });
    next();
  };
};

// Middleware para verificar permisos específicos
export const requirePermissions = (...requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendUnauthorized(res, 'Usuario no autenticado');
      return;
    }

    try {
      // Los administradores tienen todos los permisos
      if (req.user.role === UserRole.ADMIN) {
        logger.debug('Permission check bypassed for admin', {
          userId: req.user.userId,
          requiredPermissions,
          endpoint: req.path
        });
        next();
        return;
      }

      // Obtener permisos del usuario desde la base de datos
      const userWithPermissions = await userService.findByIdWithPermissions(req.user.userId);
      
      if (!userWithPermissions) {
        logger.warn('User not found during permission check', {
          userId: req.user.userId,
          endpoint: req.path
        });
        sendUnauthorized(res, 'Usuario no encontrado');
        return;
      }

      // Extraer los nombres de permisos del usuario
      const userPermissionNames = userWithPermissions.permissions.map((up: any) => up.permission.name);

      // Verificar si el usuario tiene todos los permisos requeridos
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissionNames.includes(permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(permission => 
          !userPermissionNames.includes(permission)
        );

        logger.warn('Permission check failed', {
          userId: req.user.userId,
          userRole: req.user.role,
          requiredPermissions,
          userPermissions: userPermissionNames,
          missingPermissions,
          endpoint: req.path
        });

        sendForbidden(res, 'No tienes los permisos necesarios para acceder a este recurso');
        return;
      }

      logger.debug('Permission check successful', {
        userId: req.user.userId,
        requiredPermissions,
        endpoint: req.path
      });

      next();
    } catch (error) {
      logger.error('Error during permission check', {
        userId: req.user.userId,
        requiredPermissions,
        endpoint: req.path,
        error
      });
      sendForbidden(res, 'Error verificando permisos');
    }
  };
};

// Middleware opcional de autenticación (no falla si no hay token)
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
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
          logger.debug('Optional auth failed, continuing without user', { error });
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
  authorize,
  requireAdmin,
  requireSupervisor,
  requireOwnerOrAdmin,
  requirePermissions,
  optionalAuth
};