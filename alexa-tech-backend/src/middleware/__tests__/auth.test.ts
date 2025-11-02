import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response, NextFunction } from 'express';
import {
  authenticate,
  requirePermission,
  requireAllPermissions,
  requireOwnerOrAdmin,
  optionalAuth,
} from '../auth';
import { AuthenticatedRequest } from '../../types';
import { jwtService } from '../../utils/jwt';
import { userService } from '../../services/userService';

// Mock dependencies
vi.mock('../../utils/jwt');
vi.mock('../../services/userService');
vi.mock('../../utils/logger', () => ({
  logger: {
    auth: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Auth Middleware', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequest = {
      headers: {},
      params: {},
      path: '/test',
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    nextFunction = vi.fn();
  });

  // ==================== AUTHENTICATE MIDDLEWARE ====================
  describe('authenticate', () => {
    it('should authenticate user with valid token', async () => {
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockDecoded);

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual(mockDecoded);
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should reject request without authorization header', async () => {
      mockRequest.headers = {};

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token de acceso requerido',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with malformed authorization header', async () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with empty token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with expired token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Token expirado');
      });

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Token expirado',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await authenticate(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  // ==================== REQUIRE PERMISSION MIDDLEWARE ====================
  describe('requirePermission', () => {
    it('should allow access when user has required permission', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        permissions: ['products.read', 'products.write'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requirePermission('products.read');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access when user has any of required permissions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        permissions: ['products.read'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requirePermission('products.read', 'products.write');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access when user lacks required permissions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        permissions: ['products.read'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requirePermission('users.delete');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permisos para acceder a este recurso',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = requirePermission('products.read');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access when user not found', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockResolvedValue(null);

      const middleware = requirePermission('products.read');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no encontrado',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockRejectedValue(new Error('Database error'));

      const middleware = requirePermission('products.read');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error al verificar permisos',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  // ==================== REQUIRE ALL PERMISSIONS MIDDLEWARE ====================
  describe('requireAllPermissions', () => {
    it('should allow access when user has all required permissions', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        permissions: ['products.read', 'products.write', 'products.delete'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requireAllPermissions('products.read', 'products.write');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user lacks one required permission', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        permissions: ['products.read'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requireAllPermissions('products.read', 'products.write');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes todos los permisos necesarios para acceder a este recurso',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', async () => {
      mockRequest.user = undefined;

      const middleware = requireAllPermissions('products.read', 'products.write');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  // ==================== REQUIRE OWNER OR ADMIN MIDDLEWARE ====================
  describe('requireOwnerOrAdmin', () => {
    it('should allow access when user is the owner', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockRequest.params = { id: 'user-123' };

      const middleware = requireOwnerOrAdmin();
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(userService.findById).not.toHaveBeenCalled(); // Should not check permissions
    });

    it('should allow access when user is admin (not owner)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'admin@example.com',
        permissions: ['users.update', 'users.delete'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'admin@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockRequest.params = { id: 'user-456' }; // Different user

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requireOwnerOrAdmin();
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is neither owner nor admin', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        permissions: ['products.read'],
      };

      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockRequest.params = { id: 'user-456' }; // Different user

      vi.mocked(userService.findById).mockResolvedValue(mockUser as any);

      const middleware = requireOwnerOrAdmin();
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Solo puedes acceder a tu propia información',
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should use custom parameter name', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockRequest.params = { userId: 'user-123' };

      const middleware = requireOwnerOrAdmin('userId');
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it('should deny access when user is not authenticated', async () => {
      mockRequest.user = undefined;
      mockRequest.params = { id: 'user-123' };

      const middleware = requireOwnerOrAdmin();
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should deny access when user not found in database', async () => {
      mockRequest.user = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };
      mockRequest.params = { id: 'user-456' };

      vi.mocked(userService.findById).mockResolvedValue(null);

      const middleware = requireOwnerOrAdmin();
      await middleware(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  // ==================== OPTIONAL AUTH MIDDLEWARE ====================
  describe('optionalAuth', () => {
    it('should authenticate user with valid token', async () => {
      const mockDecoded = {
        userId: 'user-123',
        email: 'test@example.com',
        iat: Date.now(),
        exp: Date.now() + 3600,
      };

      mockRequest.headers = {
        authorization: 'Bearer valid-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockDecoded);

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toEqual(mockDecoded);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should continue without user when no token provided', async () => {
      mockRequest.headers = {};

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user when token is invalid', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should continue without user when token is expired', async () => {
      mockRequest.headers = {
        authorization: 'Bearer expired-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Token expirado');
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should continue without user on any error', async () => {
      mockRequest.headers = {
        authorization: 'Bearer some-token',
      };

      vi.mocked(jwtService.verifyAccessToken).mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      await optionalAuth(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response,
        nextFunction
      );

      expect(mockRequest.user).toBeUndefined();
      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
