import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export interface CreateAuditLogData {
  action: string;
  userId?: string;
  targetId?: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateUserActivityData {
  userId: string;
  action: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateSystemEventData {
  type: string;
  details?: string;
  metadata?: any;
}

export class AuditService {
  // Crear log de auditoría
  static async createAuditLog(data: CreateAuditLogData) {
    return await prisma.auditLog.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  // Obtener logs de auditoría con paginación
  static async getAuditLogs(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.auditLog.count()
    ]);

    return {
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Crear actividad de usuario
  static async createUserActivity(data: CreateUserActivityData) {
    return await prisma.userActivity.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });
  }

  // Obtener actividades de un usuario específico
  static async getUserActivities(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.userActivity.count({ where: { userId } })
    ]);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Obtener actividades de todos los usuarios (solo admin)
  static async getAllUserActivities(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [activities, total] = await Promise.all([
      prisma.userActivity.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              firstName: true,
              lastName: true
            }
          }
        }
      }),
      prisma.userActivity.count()
    ]);

    return {
      activities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Crear evento del sistema
  static async createSystemEvent(data: CreateSystemEventData) {
    return await prisma.systemEvent.create({
      data
    });
  }

  // Obtener eventos del sistema
  static async getSystemEvents(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [events, total] = await Promise.all([
      prisma.systemEvent.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.systemEvent.count()
    ]);

    return {
      events,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  // Registrar login de usuario
  static async logUserLogin(userId: string, ipAddress?: string, userAgent?: string) {
    await Promise.all([
      this.createAuditLog({
        action: 'LOGIN',
        userId,
        details: 'Usuario inició sesión',
        ipAddress,
        userAgent
      }),
      this.createUserActivity({
        userId,
        action: 'Inicio de sesión',
        details: 'Acceso exitoso al sistema',
        ipAddress,
        userAgent
      })
    ]);
  }

  // Registrar logout de usuario
  static async logUserLogout(userId: string, ipAddress?: string, userAgent?: string) {
    await Promise.all([
      this.createAuditLog({
        action: 'LOGOUT',
        userId,
        details: 'Usuario cerró sesión',
        ipAddress,
        userAgent
      }),
      this.createUserActivity({
        userId,
        action: 'Cierre de sesión',
        details: 'Sesión cerrada correctamente',
        ipAddress,
        userAgent
      })
    ]);
  }

  // Registrar actualización de perfil
  static async logProfileUpdate(userId: string, ipAddress?: string, userAgent?: string) {
    await Promise.all([
      this.createAuditLog({
        action: 'UPDATE_PROFILE',
        userId,
        targetId: userId,
        details: 'Información de perfil actualizada',
        ipAddress,
        userAgent
      }),
      this.createUserActivity({
        userId,
        action: 'Actualización de perfil',
        details: 'Información personal actualizada',
        ipAddress,
        userAgent
      })
    ]);
  }

  // Registrar cambio de contraseña
  static async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string) {
    await Promise.all([
      this.createAuditLog({
        action: 'CHANGE_PASSWORD',
        userId,
        targetId: userId,
        details: 'Contraseña actualizada',
        ipAddress,
        userAgent
      }),
      this.createUserActivity({
        userId,
        action: 'Cambio de contraseña',
        details: 'Contraseña actualizada exitosamente',
        ipAddress,
        userAgent
      })
    ]);
  }
}

export default AuditService;