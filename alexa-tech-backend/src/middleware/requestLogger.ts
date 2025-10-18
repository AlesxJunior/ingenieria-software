import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Middleware para logging de requests
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();



  // Log del request entrante
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.userId,
  });

  // Interceptar el final de la respuesta
  const originalSend = res.send;
  res.send = function (body: any) {
    const duration = Date.now() - startTime;

    // Log de la respuesta
    logger.request(req.method, req.originalUrl, res.statusCode, duration);

    // Log adicional para errores
    if (res.statusCode >= 400) {
      logger.warn(`Request failed: ${req.method} ${req.originalUrl}`, {
        statusCode: res.statusCode,
        duration,
        ip: req.ip,
        userId: (req as any).user?.userId,
      });
    }

    // Llamar al método original
    return originalSend.call(this, body);
  };

  next();
};

// Middleware para logging detallado (solo en desarrollo)
export const detailedRequestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const startTime = Date.now();

  // Log detallado del request
  logger.debug('Detailed Request Info', {
    method: req.method,
    url: req.originalUrl,
    headers: req.headers,
    query: req.query,
    params: req.params,
    body: req.body,
    ip: req.ip,
    protocol: req.protocol,
    secure: req.secure,
  });

  // Interceptar la respuesta
  const originalJson = res.json;
  res.json = function (body: any) {
    const duration = Date.now() - startTime;

    logger.debug('Detailed Response Info', {
      statusCode: res.statusCode,
      duration,
      headers: res.getHeaders(),
      body: body,
    });

    return originalJson.call(this, body);
  };

  next();
};

// Middleware para logging de errores de parsing
export const parseErrorLogger = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (error instanceof SyntaxError && 'body' in error) {
    logger.error('JSON Parse Error', {
      error: error.message,
      method: req.method,
      url: req.originalUrl,
      body: (req as any).rawBody || 'No raw body available',
      contentType: req.get('Content-Type'),
    });
  }
  next(error);
};

export default {
  requestLogger,
  detailedRequestLogger,
  parseErrorLogger,
};
