import { LoginRequest, RegisterRequest, AuthResponse, UserResponse } from '../types';
import { userService } from './userService';
import { jwtService } from '../utils/jwt';
import { logger } from '../utils/logger';
import { 
  createValidationError, 
  createUnauthorizedError, 
  createConflictError,
  createNotFoundError 
} from '../middleware/errorHandler';

// Simulación de refresh tokens en memoria (en producción usar Redis o DB)
const refreshTokens = new Map<string, { userId: string; tokenVersion: number; expiresAt: Date }>();

export class AuthService {
  // Login de usuario
  static async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    logger.auth('Login attempt', undefined, email);

    // Buscar usuario por email
    const user = await userService.findByEmail(email);
    if (!user) {
      logger.auth('Login failed - user not found', undefined, email);
      throw createUnauthorizedError('Credenciales inválidas');
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      logger.auth('Login failed - user inactive', user.id, email);
      throw createUnauthorizedError('Usuario inactivo');
    }

    // Verificar contraseña
    const isPasswordValid = await userService.verifyPassword(user, password);
    if (!isPasswordValid) {
      logger.auth('Login failed - invalid password', user.id, email);
      throw createUnauthorizedError('Credenciales inválidas');
    }

    // Actualizar última hora de acceso
    await userService.updateLastAccess(user.id);

    // Generar tokens
    const tokenVersion = this.getOrCreateTokenVersion(user.id);
    const { accessToken, refreshToken } = jwtService.generateTokenPair(
      user.id,
      user.email,
      tokenVersion
    );

    // Guardar refresh token
    this.storeRefreshToken(refreshToken, user.id, tokenVersion);

    logger.auth('Login successful', user.id, email);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        permissions: user.permissions || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      accessToken,
      refreshToken
    };
  }

  // Registro de usuario
  static async register(registerData: RegisterRequest): Promise<AuthResponse> {
    const { username, email, password, confirmPassword } = registerData;

    logger.auth('Register attempt', undefined, email);

    // Verificar que las contraseñas coincidan
    if (password !== confirmPassword) {
      throw createValidationError('Las contraseñas no coinciden');
    }

    try {
      // Crear usuario
      const newUser = await userService.create({
        username,
        email,
        password,
        firstName: '',
        lastName: ''
      });

      // Generar tokens
      const tokenVersion = this.getOrCreateTokenVersion(newUser.id);
      const { accessToken, refreshToken } = jwtService.generateTokenPair(
        newUser.id,
        newUser.email,
        tokenVersion
      );

      // Guardar refresh token
      this.storeRefreshToken(refreshToken, newUser.id, tokenVersion);

      logger.auth('Register successful', newUser.id, email);

      return {
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isActive: newUser.isActive,
          permissions: newUser.permissions || [],
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt
        },
        accessToken,
        refreshToken
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          throw createConflictError('El email ya está registrado');
        }
        if (error.message.includes('username')) {
          throw createConflictError('El nombre de usuario ya está registrado');
        }
      }
      throw error;
    }
  }

  // Refresh token
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verificar refresh token
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      
      // Verificar si el token está almacenado
      const storedToken = refreshTokens.get(refreshToken);
      if (!storedToken) {
        logger.auth('Refresh failed - token not found');
        throw createUnauthorizedError('Refresh token inválido');
      }

      // Verificar si el token ha expirado
      if (storedToken.expiresAt < new Date()) {
        this.removeRefreshToken(refreshToken);
        logger.auth('Refresh failed - token expired', storedToken.userId);
        throw createUnauthorizedError('Refresh token expirado');
      }

      // Verificar versión del token
      if (storedToken.tokenVersion !== decoded.tokenVersion) {
        this.removeRefreshToken(refreshToken);
        logger.auth('Refresh failed - token version mismatch', storedToken.userId);
        throw createUnauthorizedError('Refresh token inválido');
      }

      // Buscar usuario
      const user = await userService.findById(decoded.userId);
      if (!user || !user.isActive) {
        this.removeRefreshToken(refreshToken);
        logger.auth('Refresh failed - user not found or inactive', decoded.userId);
        throw createUnauthorizedError('Usuario no encontrado o inactivo');
      }

      // Generar nuevos tokens
      const newTokenVersion = storedToken.tokenVersion + 1;
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = jwtService.generateTokenPair(
        user.id,
        user.email,
        newTokenVersion
      );

      // Remover token anterior y guardar nuevo
      this.removeRefreshToken(refreshToken);
      this.storeRefreshToken(newRefreshToken, user.id, newTokenVersion);

      logger.auth('Token refreshed', user.id, user.email);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      logger.auth('Refresh failed', undefined, undefined);
      throw createUnauthorizedError('Refresh token inválido');
    }
  }

  // Logout
  static async logout(refreshToken: string): Promise<void> {
    try {
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      this.removeRefreshToken(refreshToken);
      logger.auth('Logout successful', decoded.userId);
    } catch (error) {
      // Incluso si el token es inválido, consideramos el logout exitoso
      logger.auth('Logout with invalid token');
    }
  }

  // Logout de todos los dispositivos
  static async logoutAll(userId: string): Promise<void> {
    // Incrementar versión de token para invalidar todos los refresh tokens
    this.incrementTokenVersion(userId);
    
    // Remover todos los refresh tokens del usuario
    for (const [token, data] of refreshTokens.entries()) {
      if (data.userId === userId) {
        refreshTokens.delete(token);
      }
    }

    logger.auth('Logout all devices', userId);
  }



  // Métodos privados para manejo de refresh tokens
  private static tokenVersions = new Map<string, number>();

  private static getOrCreateTokenVersion(userId: string): number {
    if (!this.tokenVersions.has(userId)) {
      this.tokenVersions.set(userId, 1);
    }
    return this.tokenVersions.get(userId)!;
  }

  private static incrementTokenVersion(userId: string): number {
    const currentVersion = this.getOrCreateTokenVersion(userId);
    const newVersion = currentVersion + 1;
    this.tokenVersions.set(userId, newVersion);
    return newVersion;
  }

  private static storeRefreshToken(token: string, userId: string, tokenVersion: number): void {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

    refreshTokens.set(token, {
      userId,
      tokenVersion,
      expiresAt
    });
  }

  private static removeRefreshToken(token: string): void {
    refreshTokens.delete(token);
  }

  // Limpiar tokens expirados (debería ejecutarse periódicamente)
  static cleanExpiredTokens(): void {
    const now = new Date();
    for (const [token, data] of refreshTokens.entries()) {
      if (data.expiresAt < now) {
        refreshTokens.delete(token);
      }
    }
    logger.debug('Expired tokens cleaned');
  }

  // Obtener usuario actual
  static async getCurrentUser(userId: string): Promise<UserResponse> {
    const user = await userService.findById(userId);
    if (!user) {
      throw createNotFoundError('Usuario no encontrado');
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      permissions: user.permissions || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  // Verificar si un usuario existe por email
  static async userExists(email: string): Promise<boolean> {
    const user = await userService.findByEmail(email);
    return !!user;
  }

  // Obtener estadísticas de tokens activos
  static getTokenStats(): { totalTokens: number; userTokens: Map<string, number> } {
    const userTokens = new Map<string, number>();
    
    for (const data of refreshTokens.values()) {
      const count = userTokens.get(data.userId) || 0;
      userTokens.set(data.userId, count + 1);
    }

    return {
      totalTokens: refreshTokens.size,
      userTokens
    };
  }
}

// Limpiar tokens expirados cada hora
setInterval(() => {
  AuthService.cleanExpiredTokens();
}, 60 * 60 * 1000);

export default AuthService;