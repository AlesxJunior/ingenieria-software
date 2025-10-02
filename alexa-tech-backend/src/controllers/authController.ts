import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AuthService } from '../services/authService';
import AuditService from '../services/auditService';
import { 
  validateLoginRequest, 
  validateRegisterRequest 
} from '../utils/validation';
import { 
  sendAuthSuccess, 
  sendSuccess, 
  sendValidationError,
  sendLogoutSuccess 
} from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthController {
  // POST /auth/login
  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Validar datos de entrada
    const validation = validateLoginRequest({ email, password });
    if (!validation.isValid) {
      sendValidationError(res, validation.errors);
      return;
    }

    // Procesar login
    const authResponse = await AuthService.login({ email, password });
    
    // Registrar login en auditoría
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    
    try {
      await AuditService.logUserLogin(authResponse.user.id, ipAddress, userAgent);
    } catch (auditError) {
      logger.error('Error al registrar login en auditoría:', auditError);
      // No fallar el login por error de auditoría
    }
    
    sendAuthSuccess(res, authResponse, 'Login exitoso');
  });

  // POST /auth/register
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { username, email, password, confirmPassword } = req.body;

    // Validar datos de entrada
    const validation = validateRegisterRequest({ 
      username, 
      email, 
      password, 
      confirmPassword 
    });
    if (!validation.isValid) {
      sendValidationError(res, validation.errors);
      return;
    }

    // Procesar registro
    const authResponse = await AuthService.register({ 
      username, 
      email, 
      password, 
      confirmPassword 
    });
    
    sendAuthSuccess(res, authResponse, 'Registro exitoso');
  });

  // POST /auth/refresh
  static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      sendValidationError(res, [{ 
        field: 'refreshToken', 
        message: 'Refresh token es requerido' 
      }]);
      return;
    }

    // Procesar refresh
    const tokens = await AuthService.refreshToken(refreshToken);
    
    sendSuccess(res, tokens, 'Token renovado exitosamente');
  });

  // POST /auth/logout
  static logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }
    
    // Registrar logout en auditoría si hay usuario autenticado
    if (req.user) {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      try {
        await AuditService.logUserLogout(req.user.userId, ipAddress, userAgent);
      } catch (auditError) {
        logger.error('Error al registrar logout en auditoría:', auditError);
        // No fallar el logout por error de auditoría
      }
    }
    
    sendLogoutSuccess(res, 'Logout exitoso');
  });

  // POST /auth/logout-all
  static logoutAll = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      sendValidationError(res, [{ 
        field: 'user', 
        message: 'Usuario no autenticado' 
      }]);
      return;
    }

    await AuthService.logoutAll(userId);
    
    sendLogoutSuccess(res, 'Logout de todos los dispositivos exitoso');
  });

  // GET /auth/me
  static getCurrentUser = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      sendValidationError(res, [{ 
        field: 'user', 
        message: 'Usuario no autenticado' 
      }]);
      return;
    }

    const user = await AuthService.getCurrentUser(userId);
    
    sendSuccess(res, user, 'Información del usuario obtenida exitosamente');
  });

  // GET /auth/check-email/:email
  static checkEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.params;

    if (!email) {
      sendValidationError(res, [{ 
        field: 'email', 
        message: 'Email es requerido' 
      }]);
      return;
    }

    const exists = await AuthService.userExists(email);
    
    sendSuccess(res, { exists }, 'Verificación de email completada');
  });

  // GET /auth/stats (solo para admins)
  static getTokenStats = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const stats = AuthService.getTokenStats();
    
    sendSuccess(res, stats, 'Estadísticas de tokens obtenidas');
  });

  // POST /auth/validate-token
  static validateToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
      sendValidationError(res, [{ 
        field: 'token', 
        message: 'Token es requerido' 
      }]);
      return;
    }

    try {
      // Intentar verificar el token
      const decoded = require('../utils/jwt').jwtService.verifyAccessToken(token);
      
      sendSuccess(res, { 
        valid: true, 
        decoded: {
          userId: decoded.userId,
          email: decoded.email,
          exp: decoded.exp
        }
      }, 'Token válido');
    } catch (error) {
      sendSuccess(res, { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Token inválido' 
      }, 'Token inválido');
    }
  });

  // GET /auth/health
  static healthCheck = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const stats = AuthService.getTokenStats();
    
    sendSuccess(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      activeTokens: stats.totalTokens,
      activeUsers: stats.userTokens.size
    }, 'Servicio de autenticación funcionando correctamente');
  });
}

export default AuthController;