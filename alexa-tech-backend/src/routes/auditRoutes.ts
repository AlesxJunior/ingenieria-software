import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { rateLimiter } from '../middleware/rateLimiter';
import AuditService from '../services/auditService';

const router = Router();

// Aplicar autenticación a todas las rutas de auditoría
router.use(authenticate);

// GET /audit/logs - Obtener logs de auditoría
// Solo admins pueden ver los logs de auditoría
router.get(
  '/logs',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  async (req, res): Promise<void> => {
    try {
      const { page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const result = await AuditService.getAuditLogs(pageNum, limitNum);
      
      res.json({
        success: true,
        message: 'Logs de auditoría obtenidos exitosamente',
        data: {
          logs: result.logs.map(log => ({
            id: log.id,
            action: log.action,
            user: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : 'Sistema',
            timestamp: log.createdAt.toISOString(),
            details: log.details,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener logs de auditoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

// GET /audit/user-activity/:userId - Obtener actividad de un usuario específico
// Solo admins pueden ver la actividad de otros usuarios
router.get(
  '/user-activity/:userId',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  async (req, res): Promise<void> => {
    try {
      const { userId } = req.params;
      const { page = '1', limit = '10' } = req.query;
      
      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
        return;
      }
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const result = await AuditService.getUserActivities(userId, pageNum, limitNum);
      
      res.json({
        success: true,
        message: `Actividad del usuario obtenida exitosamente`,
        data: {
          activities: result.activities.map(activity => ({
            id: activity.id,
            action: activity.action,
            timestamp: activity.createdAt.toISOString(),
            details: activity.details,
            ipAddress: activity.ipAddress
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          },
          user: result.activities.length > 0 && result.activities[0]?.user ? {
            id: result.activities[0].user.id,
            name: `${result.activities[0].user?.firstName || ''} ${result.activities[0].user?.lastName || ''}`.trim(),
            email: result.activities[0].user?.email || ''
          } : null
        }
      });
    } catch (error) {
      console.error('Error al obtener actividad del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

// GET /audit/my-activity - Obtener mi propia actividad
router.get(
  '/my-activity',
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  async (req: any, res): Promise<void> => {
    try {
      const { page = '1', limit = '10' } = req.query;
      const userId = req.user?.userId;
      
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const result = await AuditService.getUserActivities(userId, pageNum, limitNum);
      
      res.json({
        success: true,
        message: 'Mi actividad obtenida exitosamente',
        data: {
          activities: result.activities.map(activity => ({
            id: activity.id,
            action: activity.action,
            timestamp: activity.createdAt.toISOString(),
            details: activity.details,
            ipAddress: activity.ipAddress
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener mi actividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

// GET /audit/system-events - Obtener eventos del sistema
// Solo admins pueden ver los eventos del sistema
router.get(
  '/system-events',
  requireAdmin,
  rateLimiter({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  async (req, res): Promise<void> => {
    try {
      const { page = '1', limit = '10' } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      
      const result = await AuditService.getSystemEvents(pageNum, limitNum);
      
      res.json({
        success: true,
        message: 'Eventos del sistema obtenidos exitosamente',
        data: {
          events: result.events.map(event => ({
            id: event.id,
            type: event.type,
            timestamp: event.createdAt.toISOString(),
            details: event.details,
            metadata: event.metadata
          })),
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages
          }
        }
      });
    } catch (error) {
      console.error('Error al obtener eventos del sistema:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
);

export default router;