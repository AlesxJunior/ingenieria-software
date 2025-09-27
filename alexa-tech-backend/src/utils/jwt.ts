import * as jwt from 'jsonwebtoken';
import { config } from '../config';
import { TokenPayload, RefreshTokenPayload } from '../types';
import { logger } from './logger';

export class JWTService {
  // Generar token de acceso
  generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    try {
      const options: any = {
        expiresIn: config.jwtExpiresIn,
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client'
      };
      return jwt.sign(payload, config.jwtSecret, options);
    } catch (error) {
      logger.error('Error generando access token', { error, payload });
      throw new Error('Error generando token de acceso');
    }
  }

  // Generar token de refresh
  generateRefreshToken(payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string {
    try {
      const options: any = {
        expiresIn: config.jwtRefreshExpiresIn,
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client'
      };
      return jwt.sign(payload, config.jwtRefreshSecret, options);
    } catch (error) {
      logger.error('Error generando refresh token', { error, payload });
      throw new Error('Error generando token de refresh');
    }
  }

  // Verificar token de acceso
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwtSecret, {
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client'
      }) as TokenPayload;
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Token inválido');
      } else {
        logger.error('Error verificando access token', { error });
        throw new Error('Error verificando token');
      }
    }
  }

  // Verificar token de refresh
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(token, config.jwtRefreshSecret, {
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client'
      }) as RefreshTokenPayload;
      
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      } else {
        logger.error('Error verificando refresh token', { error });
        throw new Error('Error verificando refresh token');
      }
    }
  }

  // Decodificar token sin verificar (para debugging)
  decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Error decodificando token', { error });
      return null;
    }
  }

  // Obtener tiempo de expiración de un token
  getTokenExpiration(token: string): Date | null {
    try {
      const decoded = this.decodeToken(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      logger.error('Error obteniendo expiración del token', { error });
      return null;
    }
  }

  // Verificar si un token está próximo a expirar (dentro de 5 minutos)
  isTokenExpiringSoon(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    
    return expiration <= fiveMinutesFromNow;
  }

  // Generar par de tokens (access + refresh)
  generateTokenPair(userId: string, email: string, role: string, tokenVersion: number = 1) {
    const accessTokenPayload: Omit<TokenPayload, 'iat' | 'exp'> = {
      userId,
      email,
      role: role as any
    };

    const refreshTokenPayload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      userId,
      tokenVersion
    };

    return {
      accessToken: this.generateAccessToken(accessTokenPayload),
      refreshToken: this.generateRefreshToken(refreshTokenPayload)
    };
  }
}

// Instancia singleton
export const jwtService = new JWTService();
export default jwtService;