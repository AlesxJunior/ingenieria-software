import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JWTService } from '../jwt';
import * as jwt from 'jsonwebtoken';
import { config } from '../../config';

// Mock del logger
vi.mock('../logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('JWTService', () => {
  let jwtService: JWTService;

  beforeEach(() => {
    vi.clearAllMocks();
    jwtService = new JWTService();
  });

  // ==================== GENERATE ACCESS TOKEN ====================
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwtService.generateAccessToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should include correct claims in access token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwtService.generateAccessToken(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.iss).toBe('alexa-tech-api');
      expect(decoded.aud).toBe('alexa-tech-client');
      expect(decoded.exp).toBeTruthy();
      expect(decoded.iat).toBeTruthy();
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userId: 'user-1', email: 'user1@example.com' };
      const payload2 = { userId: 'user-2', email: 'user2@example.com' };

      const token1 = jwtService.generateAccessToken(payload1);
      const token2 = jwtService.generateAccessToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('should throw error if JWT secret is missing', () => {
      const originalSecret = config.jwtSecret;
      (config as any).jwtSecret = '';

      const payload = { userId: 'user-123', email: 'test@example.com' };

      expect(() => jwtService.generateAccessToken(payload)).toThrow(
        'Error generando token de acceso'
      );

      (config as any).jwtSecret = originalSecret;
    });
  });

  // ==================== GENERATE REFRESH TOKEN ====================
  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = {
        userId: 'user-123',
        tokenVersion: 1,
      };

      const token = jwtService.generateRefreshToken(payload);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should include correct claims in refresh token', () => {
      const payload = {
        userId: 'user-123',
        tokenVersion: 1,
      };

      const token = jwtService.generateRefreshToken(payload);
      const decoded = jwt.decode(token) as any;

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.tokenVersion).toBe(payload.tokenVersion);
      expect(decoded.iss).toBe('alexa-tech-api');
      expect(decoded.aud).toBe('alexa-tech-client');
    });

    it('should generate different tokens for different versions', () => {
      const payload1 = { userId: 'user-123', tokenVersion: 1 };
      const payload2 = { userId: 'user-123', tokenVersion: 2 };

      const token1 = jwtService.generateRefreshToken(payload1);
      const token2 = jwtService.generateRefreshToken(payload2);

      expect(token1).not.toBe(token2);
    });

    it('should throw error if refresh secret is missing', () => {
      const originalSecret = config.jwtRefreshSecret;
      (config as any).jwtRefreshSecret = '';

      const payload = { userId: 'user-123', tokenVersion: 1 };

      expect(() => jwtService.generateRefreshToken(payload)).toThrow(
        'Error generando token de refresh'
      );

      (config as any).jwtRefreshSecret = originalSecret;
    });
  });

  // ==================== VERIFY ACCESS TOKEN ====================
  describe('verifyAccessToken', () => {
    it('should verify and decode a valid access token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
      };

      const token = jwtService.generateAccessToken(payload);
      const decoded = jwtService.verifyAccessToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should throw error for expired token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '-1s', // Token already expired
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client',
      });

      expect(() => jwtService.verifyAccessToken(expiredToken)).toThrow(
        'Token expirado'
      );
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => jwtService.verifyAccessToken(invalidToken)).toThrow(
        'Token inválido'
      );
    });

    it('should throw error for token with wrong secret', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const tokenWithWrongSecret = jwt.sign(payload, 'wrong-secret', {
        expiresIn: '1h',
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client',
      });

      expect(() => jwtService.verifyAccessToken(tokenWithWrongSecret)).toThrow(
        'Token inválido'
      );
    });

    it('should throw error for token with wrong issuer', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const tokenWithWrongIssuer = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '1h',
        issuer: 'wrong-issuer',
        audience: 'alexa-tech-client',
      });

      expect(() => jwtService.verifyAccessToken(tokenWithWrongIssuer)).toThrow(
        'Token inválido'
      );
    });

    it('should throw error for token with wrong audience', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const tokenWithWrongAudience = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '1h',
        issuer: 'alexa-tech-api',
        audience: 'wrong-audience',
      });

      expect(() => jwtService.verifyAccessToken(tokenWithWrongAudience)).toThrow(
        'Token inválido'
      );
    });
  });

  // ==================== VERIFY REFRESH TOKEN ====================
  describe('verifyRefreshToken', () => {
    it('should verify and decode a valid refresh token', () => {
      const payload = {
        userId: 'user-123',
        tokenVersion: 1,
      };

      const token = jwtService.generateRefreshToken(payload);
      const decoded = jwtService.verifyRefreshToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.tokenVersion).toBe(payload.tokenVersion);
    });

    it('should throw error for expired refresh token', () => {
      const payload = { userId: 'user-123', tokenVersion: 1 };
      const expiredToken = jwt.sign(payload, config.jwtRefreshSecret, {
        expiresIn: '-1s',
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client',
      });

      expect(() => jwtService.verifyRefreshToken(expiredToken)).toThrow(
        'Refresh token expirado'
      );
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';

      expect(() => jwtService.verifyRefreshToken(invalidToken)).toThrow(
        'Refresh token inválido'
      );
    });

    it('should not accept access token as refresh token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const accessToken = jwtService.generateAccessToken(payload);

      expect(() => jwtService.verifyRefreshToken(accessToken)).toThrow();
    });
  });

  // ==================== DECODE TOKEN ====================
  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = jwtService.generateAccessToken(payload);

      const decoded = jwtService.decodeToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
    });

    it('should decode expired token without throwing error', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '-1s',
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client',
      });

      const decoded = jwtService.decodeToken(expiredToken);

      expect(decoded).toBeTruthy();
      expect(decoded.userId).toBe(payload.userId);
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'not-a-valid-token';

      const decoded = jwtService.decodeToken(invalidToken);

      expect(decoded).toBeNull();
    });
  });

  // ==================== GET TOKEN EXPIRATION ====================
  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = jwtService.generateAccessToken(payload);

      const expiration = jwtService.getTokenExpiration(token);

      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for token without expiration', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const tokenNoExp = jwt.sign(payload, config.jwtSecret); // No expiresIn

      const expiration = jwtService.getTokenExpiration(tokenNoExp);

      expect(expiration).toBeNull();
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token';

      const expiration = jwtService.getTokenExpiration(invalidToken);

      expect(expiration).toBeNull();
    });
  });

  // ==================== IS TOKEN EXPIRING SOON ====================
  describe('isTokenExpiringSoon', () => {
    it('should return false for fresh token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const token = jwtService.generateAccessToken(payload);

      const expiringSoon = jwtService.isTokenExpiringSoon(token);

      expect(expiringSoon).toBe(false);
    });

    it('should return true for token expiring in less than 5 minutes', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const tokenExpiringSoon = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '3m', // 3 minutes
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client',
      });

      const expiringSoon = jwtService.isTokenExpiringSoon(tokenExpiringSoon);

      expect(expiringSoon).toBe(true);
    });

    it('should return true for expired token', () => {
      const payload = { userId: 'user-123', email: 'test@example.com' };
      const expiredToken = jwt.sign(payload, config.jwtSecret, {
        expiresIn: '-1s',
        issuer: 'alexa-tech-api',
        audience: 'alexa-tech-client',
      });

      const expiringSoon = jwtService.isTokenExpiringSoon(expiredToken);

      expect(expiringSoon).toBe(true);
    });

    it('should return true for invalid token', () => {
      const invalidToken = 'invalid.token';

      const expiringSoon = jwtService.isTokenExpiringSoon(invalidToken);

      expect(expiringSoon).toBe(true);
    });
  });

  // ==================== GENERATE TOKEN PAIR ====================
  describe('generateTokenPair', () => {
    it('should generate both access and refresh tokens', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const tokenVersion = 1;

      const tokens = jwtService.generateTokenPair(userId, email, tokenVersion);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });

    it('should generate tokens with correct payloads', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const tokenVersion = 1;

      const tokens = jwtService.generateTokenPair(userId, email, tokenVersion);

      const decodedAccess = jwt.decode(tokens.accessToken) as any;
      const decodedRefresh = jwt.decode(tokens.refreshToken) as any;

      expect(decodedAccess.userId).toBe(userId);
      expect(decodedAccess.email).toBe(email);
      expect(decodedRefresh.userId).toBe(userId);
      expect(decodedRefresh.tokenVersion).toBe(tokenVersion);
    });

    it('should use default tokenVersion if not provided', () => {
      const userId = 'user-123';
      const email = 'test@example.com';

      const tokens = jwtService.generateTokenPair(userId, email);

      const decodedRefresh = jwt.decode(tokens.refreshToken) as any;
      expect(decodedRefresh.tokenVersion).toBe(1);
    });

    it('should generate valid tokens that can be verified', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const tokenVersion = 1;

      const tokens = jwtService.generateTokenPair(userId, email, tokenVersion);

      expect(() => jwtService.verifyAccessToken(tokens.accessToken)).not.toThrow();
      expect(() => jwtService.verifyRefreshToken(tokens.refreshToken)).not.toThrow();
    });
  });
});
