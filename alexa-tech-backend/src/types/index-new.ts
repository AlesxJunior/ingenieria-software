// Re-exportar tipos desde shared
export * from '@alexa-tech/shared';

// Tipos específicos del backend que no están en shared
import { Request } from 'express';

// Token payload específico del backend con JWT
export interface TokenPayload {
  userId: string;
  email: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// Request extendido con usuario autenticado (específico de Express)
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Tipos de error específicos del backend
export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}
