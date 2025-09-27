import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';
import { config } from '../config';

// Clase personalizada para errores de API
export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any;

  constructor(message: string, statusCode: number = 500, code?: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    if (code !== undefined) {
      this.code = code;
    }
    if (details !== undefined) {
      this.details = details;
    }
    this.name = 'AppError';

    // Mantener el stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware global de manejo de errores
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Error interno del servidor';
  let code: string | undefined;
  let details: any;

  // Si es un error personalizado de la aplicación
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  }
  // Errores de validación de Mongoose/Prisma
  else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Errores de validación';
    details = error.message;
  }
  // Errores de duplicado (MongoDB/PostgreSQL)
  else if (error.name === 'MongoError' && (error as any).code === 11000) {
    statusCode = 409;
    message = 'Recurso duplicado';
    details = 'Ya existe un registro con estos datos';
  }
  // Errores de cast (MongoDB)
  else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
    details = 'El ID proporcionado no es válido';
  }
  // Errores de JWT
  else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }
  else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }
  // Errores de sintaxis JSON
  else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    message = 'JSON inválido en el cuerpo de la petición';
  }
  // Otros errores conocidos
  else if (error.message) {
    message = error.message;
  }

  // Log del error
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    statusCode,
    code,
    details,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.userId
  };

  if (statusCode >= 500) {
    logger.error('Server Error', errorInfo);
  } else {
    logger.warn('Client Error', errorInfo);
  }

  // En desarrollo, incluir stack trace
  const errorResponse: any = {
    success: false,
    message,
    ...(code && { code }),
    ...(details && { details })
  };

  if (config.isDevelopment && error.stack) {
    errorResponse.stack = error.stack;
  }

  res.status(statusCode).json(errorResponse);
};

// Middleware para manejar rutas no encontradas
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  );
  next(error);
};

// Wrapper para funciones async que automáticamente captura errores
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Funciones de utilidad para crear errores específicos
export const createValidationError = (message: string, details?: any): AppError => {
  return new AppError(message, 400, 'VALIDATION_ERROR', details);
};

export const createNotFoundError = (resource: string = 'Recurso'): AppError => {
  return new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND');
};

export const createUnauthorizedError = (message: string = 'No autorizado'): AppError => {
  return new AppError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Acceso prohibido'): AppError => {
  return new AppError(message, 403, 'FORBIDDEN');
};

export const createConflictError = (message: string, details?: any): AppError => {
  return new AppError(message, 409, 'CONFLICT', details);
};

export const createInternalError = (message: string = 'Error interno del servidor'): AppError => {
  return new AppError(message, 500, 'INTERNAL_ERROR');
};

export default {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
  createConflictError,
  createInternalError
};