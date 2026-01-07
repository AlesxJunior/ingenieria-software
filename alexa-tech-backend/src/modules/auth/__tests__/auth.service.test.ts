import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from '../auth.service';
import { userService } from '../../../services/userService';
import { jwtService } from '../../../utils/jwt';
import { logger } from '../../../utils/logger';
import {
  createValidationError,
  createUnauthorizedError,
  createConflictError,
  createNotFoundError,
} from '../../../middleware/errorHandler';

// Mock dependencies
vi.mock('../../../services/userService');
vi.mock('../../../utils/jwt');
vi.mock('../../../utils/logger');
vi.mock('../../../middleware/errorHandler');

// Create mock objects
const userServiceMock = userService as any;
const jwtServiceMock = jwtService as any;
const loggerMock = logger as any;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default logger mocks
    loggerMock.auth = vi.fn();
    loggerMock.debug = vi.fn();
    loggerMock.error = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      permissions: ['users.read', 'products.read'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      // Arrange
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      userServiceMock.verifyPassword.mockResolvedValue(true);
      userServiceMock.updateLastAccess.mockResolvedValue(undefined);
      jwtServiceMock.generateTokenPair.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Act
      const result = await AuthService.login(loginData);

      // Assert
      expect(result).toEqual({
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          isActive: mockUser.isActive,
          permissions: mockUser.permissions,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(userServiceMock.verifyPassword).toHaveBeenCalledWith(
        mockUser,
        loginData.password,
      );
      expect(userServiceMock.updateLastAccess).toHaveBeenCalledWith(mockUser.id);
      expect(jwtServiceMock.generateTokenPair).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        expect.any(Number),
      );
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Login successful',
        mockUser.id,
        loginData.email,
      );
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      userServiceMock.findByEmail.mockResolvedValue(null);
      (createUnauthorizedError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'UnauthorizedError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow(
        'Credenciales inválidas',
      );

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Login failed - user not found',
        undefined,
        loginData.email,
      );
    });

    it('should throw error when user is inactive', async () => {
      // Arrange
      const inactiveUser = { ...mockUser, isActive: false };
      userServiceMock.findByEmail.mockResolvedValue(inactiveUser);
      (createUnauthorizedError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'UnauthorizedError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow(
        'Usuario inactivo',
      );

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Login failed - user inactive',
        inactiveUser.id,
        loginData.email,
      );
    });

    it('should throw error when password is invalid', async () => {
      // Arrange
      userServiceMock.findByEmail.mockResolvedValue(mockUser);
      userServiceMock.verifyPassword.mockResolvedValue(false);
      (createUnauthorizedError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'UnauthorizedError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.login(loginData)).rejects.toThrow(
        'Credenciales inválidas',
      );

      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(loginData.email);
      expect(userServiceMock.verifyPassword).toHaveBeenCalledWith(
        mockUser,
        loginData.password,
      );
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Login failed - invalid password',
        mockUser.id,
        loginData.email,
      );
    });
  });

  describe('register', () => {
    const registerData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const mockNewUser = {
      id: 'new-user-123',
      username: registerData.username,
      email: registerData.email,
      firstName: '',
      lastName: '',
      isActive: true,
      permissions: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should register a new user successfully', async () => {
      // Arrange
      userServiceMock.create.mockResolvedValue(mockNewUser);
      jwtServiceMock.generateTokenPair.mockReturnValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      // Act
      const result = await AuthService.register(registerData);

      // Assert
      expect(result).toEqual({
        user: {
          id: mockNewUser.id,
          username: mockNewUser.username,
          email: mockNewUser.email,
          firstName: mockNewUser.firstName,
          lastName: mockNewUser.lastName,
          isActive: mockNewUser.isActive,
          permissions: mockNewUser.permissions,
          createdAt: mockNewUser.createdAt,
          updatedAt: mockNewUser.updatedAt,
        },
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      });

      expect(userServiceMock.create).toHaveBeenCalledWith({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        firstName: '',
        lastName: '',
      });
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Register successful',
        mockNewUser.id,
        registerData.email,
      );
    });

    it('should throw error when passwords do not match', async () => {
      // Arrange
      const invalidData = {
        ...registerData,
        confirmPassword: 'different-password',
      };
      (createValidationError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'ValidationError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.register(invalidData)).rejects.toThrow(
        'Las contraseñas no coinciden',
      );

      expect(userServiceMock.create).not.toHaveBeenCalled();
    });

    it('should throw error when email is already registered', async () => {
      // Arrange
      const emailError = new Error('Unique constraint failed on email');
      userServiceMock.create.mockRejectedValue(emailError);
      (createConflictError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'ConflictError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.register(registerData)).rejects.toThrow(
        'El email ya está registrado',
      );
    });

    it('should throw error when username is already registered', async () => {
      // Arrange
      const usernameError = new Error('Unique constraint failed on username');
      userServiceMock.create.mockRejectedValue(usernameError);
      (createConflictError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'ConflictError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.register(registerData)).rejects.toThrow(
        'El nombre de usuario ya está registrado',
      );
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'mock-refresh-token';
    const mockUserId = 'user-123';
    const mockDecodedToken = {
      userId: mockUserId,
      tokenVersion: 1,
    };

    const mockUser = {
      id: mockUserId,
      username: 'testuser',
      email: 'test@example.com',
      isActive: true,
    };

    it('should refresh token successfully', async () => {
      // Arrange
      jwtServiceMock.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      userServiceMock.findById.mockResolvedValue(mockUser);
      jwtServiceMock.generateTokenPair.mockReturnValue({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      // Store a valid refresh token first
      await AuthService.login({
        email: 'test@example.com',
        password: 'password123',
      }).catch(() => {});

      // Manually setup the refresh token map for testing
      const storedToken = {
        userId: mockUserId,
        tokenVersion: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
      (AuthService as any).storeRefreshToken(
        mockRefreshToken,
        mockUserId,
        1,
      );

      // Act
      const result = await AuthService.refreshToken(mockRefreshToken);

      // Assert
      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });

      expect(jwtServiceMock.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(userServiceMock.findById).toHaveBeenCalledWith(mockUserId);
      expect(jwtServiceMock.generateTokenPair).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email,
        2, // incremented version
      );
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Token refreshed',
        mockUser.id,
        mockUser.email,
      );
    });

    it('should throw error when refresh token is not found in storage', async () => {
      // Arrange
      jwtServiceMock.verifyRefreshToken.mockReturnValue(mockDecodedToken);
      (createUnauthorizedError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'UnauthorizedError';
        return error;
      });

      // Act & Assert
      await expect(
        AuthService.refreshToken('invalid-token'),
      ).rejects.toThrow('Refresh token inválido');
    });

    it('should throw error when refresh token is expired', async () => {
      // Arrange
      const expiredToken = 'expired-token';
      jwtServiceMock.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Refresh token expirado');
      });
      (createUnauthorizedError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'UnauthorizedError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.refreshToken(expiredToken)).rejects.toThrow();
      
      // Verify the logger was called
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Refresh failed',
        undefined,
        undefined,
      );
    });

    it('should throw error when user is not found or inactive', async () => {
      // Arrange
      jwtServiceMock.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Usuario no encontrado o inactivo');
      });
      (createUnauthorizedError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'UnauthorizedError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.refreshToken('some-token')).rejects.toThrow();
      
      // Verify the logger was called
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Refresh failed',
        undefined,
        undefined,
      );
    });
  });

  describe('logout', () => {
    const mockRefreshToken = 'mock-refresh-token';
    const mockUserId = 'user-123';

    it('should logout successfully with valid token', async () => {
      // Arrange
      jwtServiceMock.verifyRefreshToken.mockReturnValue({
        userId: mockUserId,
        tokenVersion: 1,
      });

      // Act
      await AuthService.logout(mockRefreshToken);

      // Assert
      expect(jwtServiceMock.verifyRefreshToken).toHaveBeenCalledWith(
        mockRefreshToken,
      );
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Logout successful',
        mockUserId,
      );
    });

    it('should logout successfully even with invalid token', async () => {
      // Arrange
      jwtServiceMock.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act
      await AuthService.logout('invalid-token');

      // Assert
      expect(loggerMock.auth).toHaveBeenCalledWith('Logout with invalid token');
    });
  });

  describe('logoutAll', () => {
    const mockUserId = 'user-123';

    it('should logout from all devices successfully', async () => {
      // Act - just verify the method executes without errors
      await expect(AuthService.logoutAll(mockUserId)).resolves.toBeUndefined();

      // Assert - verify logger was called
      expect(loggerMock.auth).toHaveBeenCalledWith(
        'Logout all devices',
        mockUserId,
      );
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: 'user-123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      isActive: true,
      permissions: ['users.read'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should return current user successfully', async () => {
      // Arrange
      userServiceMock.findById.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.getCurrentUser('user-123');

      // Assert
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        isActive: mockUser.isActive,
        permissions: mockUser.permissions,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(userServiceMock.findById).toHaveBeenCalledWith('user-123');
    });

    it('should throw error when user is not found', async () => {
      // Arrange
      userServiceMock.findById.mockResolvedValue(null);
      (createNotFoundError as any).mockImplementation((msg: string) => {
        const error = new Error(msg);
        error.name = 'NotFoundError';
        return error;
      });

      // Act & Assert
      await expect(AuthService.getCurrentUser('invalid-id')).rejects.toThrow(
        'Usuario no encontrado',
      );
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      userServiceMock.findByEmail.mockResolvedValue(mockUser);

      // Act
      const result = await AuthService.userExists('test@example.com');

      // Assert
      expect(result).toBe(true);
      expect(userServiceMock.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
    });

    it('should return false when user does not exist', async () => {
      // Arrange
      userServiceMock.findByEmail.mockResolvedValue(null);

      // Act
      const result = await AuthService.userExists('nonexistent@example.com');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('cleanExpiredTokens', () => {
    it('should execute without errors', () => {
      // Act - just verify the method executes
      expect(() => AuthService.cleanExpiredTokens()).not.toThrow();

      // Assert - verify logger was called
      expect(loggerMock.debug).toHaveBeenCalledWith('Expired tokens cleaned');
    });
  });

  describe('getTokenStats', () => {
    it('should return token statistics', () => {
      // Act
      const stats = AuthService.getTokenStats();

      // Assert - just verify it returns the expected structure
      expect(stats).toHaveProperty('totalTokens');
      expect(stats).toHaveProperty('userTokens');
      expect(typeof stats.totalTokens).toBe('number');
      expect(stats.userTokens).toBeInstanceOf(Map);
    });

    it('should return stats with totalTokens as number', () => {
      // Act
      const stats = AuthService.getTokenStats();

      // Assert
      expect(stats.totalTokens).toBeGreaterThanOrEqual(0);
      expect(stats.userTokens.size).toBeGreaterThanOrEqual(0);
    });
  });
});
