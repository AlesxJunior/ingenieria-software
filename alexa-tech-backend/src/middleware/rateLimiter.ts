import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

export const rateLimiter = (
  options: RateLimiterOptions,
): RateLimitRequestHandler | ((req: Request, res: Response, next: NextFunction) => void) => {
  if (process.env.NODE_ENV === 'test') {
    return (req: Request, res: Response, next: NextFunction) => next();
  }
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: options.message || {
      error:
        'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
      code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: options.standardHeaders ?? true,
    legacyHeaders: options.legacyHeaders ?? false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error:
          'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.round(options.windowMs / 1000),
      });
    },
  });
};

// Rate limiters predefinidos para casos comunes
export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos por IP
  message:
    'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.',
});

export const generalRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por IP
});

export const strictRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // 10 requests por IP
});
