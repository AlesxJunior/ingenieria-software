import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';
import { logger } from './logger';

export class ResponseHelper {
  // Respuesta exitosa
  static success<T>(
    res: Response,
    data: T,
    message: string = 'Operación exitosa',
    statusCode: number = 200,
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
    };

    logger.info(`Response: ${statusCode} - ${message}`);
    return res.status(statusCode).json(response);
  }

  // Respuesta de error
  static error(
    res: Response,
    message: string = 'Error interno del servidor',
    statusCode: number = 500,
    error?: string,
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error,
    };

    logger.error(`Error Response: ${statusCode} - ${message}`, { error });
    return res.status(statusCode).json(response);
  }

  // Respuesta de validación
  static validationError(
    res: Response,
    errors: any[],
    message: string = 'Errores de validación',
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      error: Array.isArray(errors) ? errors.join(', ') : errors,
    };

    logger.warn(`Validation Error: ${message}`, { errors });
    return res.status(400).json(response);
  }

  // Respuesta no autorizada
  static unauthorized(
    res: Response,
    message: string = 'No autorizado',
  ): Response {
    return this.error(res, message, 401);
  }

  // Respuesta prohibida
  static forbidden(
    res: Response,
    message: string = 'Acceso prohibido',
  ): Response {
    return this.error(res, message, 403);
  }

  // Respuesta no encontrado
  static notFound(
    res: Response,
    message: string = 'Recurso no encontrado',
  ): Response {
    return this.error(res, message, 404);
  }

  // Respuesta de conflicto
  static conflict(
    res: Response,
    message: string = 'Conflicto con el estado actual del recurso',
  ): Response {
    return this.error(res, message, 409);
  }

  // Respuesta paginada
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Datos obtenidos exitosamente',
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<PaginatedResponse<T>> = {
      success: true,
      message,
      data: {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };

    logger.info(`Paginated Response: ${message}`, {
      page,
      limit,
      total,
      totalPages,
    });

    return res.status(200).json(response);
  }

  // Respuesta de creación exitosa
  static created<T>(
    res: Response,
    data: T,
    message: string = 'Recurso creado exitosamente',
  ): Response {
    return this.success(res, data, message, 201);
  }

  // Respuesta sin contenido
  static noContent(
    res: Response,
    message: string = 'Operación exitosa sin contenido',
  ): Response {
    logger.info(`No Content Response: ${message}`);
    return res.status(204).json({
      success: true,
      message,
    });
  }

  // Respuesta de autenticación exitosa
  static authSuccess(
    res: Response,
    data: any,
    message: string = 'Autenticación exitosa',
  ): Response {
    // Log removido para evitar duplicación (ya se loggea en authService)
    return this.success(res, data, message);
  }

  // Respuesta de logout exitoso
  static logoutSuccess(
    res: Response,
    message: string = 'Logout exitoso',
  ): Response {
    logger.auth('Logout successful');
    return this.success(res, null, message);
  }
}

// Funciones de utilidad para casos específicos
export const sendSuccess = ResponseHelper.success.bind(ResponseHelper);
export const sendError = ResponseHelper.error.bind(ResponseHelper);
export const sendValidationError =
  ResponseHelper.validationError.bind(ResponseHelper);
export const sendUnauthorized =
  ResponseHelper.unauthorized.bind(ResponseHelper);
export const sendForbidden = ResponseHelper.forbidden.bind(ResponseHelper);
export const sendNotFound = ResponseHelper.notFound.bind(ResponseHelper);
export const sendConflict = ResponseHelper.conflict.bind(ResponseHelper);
export const sendPaginated = ResponseHelper.paginated.bind(ResponseHelper);
export const sendCreated = ResponseHelper.created.bind(ResponseHelper);
export const sendNoContent = ResponseHelper.noContent.bind(ResponseHelper);
export const sendAuthSuccess = ResponseHelper.authSuccess.bind(ResponseHelper);
export const sendLogoutSuccess =
  ResponseHelper.logoutSuccess.bind(ResponseHelper);

export default ResponseHelper;
