import { User, UserRole } from '../generated/prisma';
import { prisma } from '../config/database';
import { UserCreateInput, UserUpdateInput } from '../types';
import * as bcrypt from 'bcrypt';
import { config } from '../config';
import { logger } from '../utils/logger';

export class UserService {
  // Crear un nuevo usuario
  async create(userData: UserCreateInput): Promise<User> {
    try {
      // Verificar si el email ya existe
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUserByEmail) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el username ya existe
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: userData.username }
      });

      if (existingUserByUsername) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, config.bcryptRounds);

      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role || UserRole.VENDEDOR,
        }
      });

      // Asignar permisos por defecto según el rol
      const defaultPermissions = await this.getPermissionsByRole(user.role);
      if (defaultPermissions.length > 0) {
        await this.assignPermissions(user.id, defaultPermissions);
      }

      logger.info(`Usuario creado: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error creando usuario:', error);
      throw error;
    }
  }

  // Obtener usuario por ID
  async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por ID:', error);
      throw error;
    }
  }

  // Obtener usuario por email
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email }
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por email:', error);
      throw error;
    }
  }

  // Obtener usuario por username
  async findByUsername(username: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { username }
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por username:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios
  async findAll(): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async update(id: string, userData: UserUpdateInput): Promise<User | null> {
    try {
      // Verificar si el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return null;
      }

      // Verificar email único si se está actualizando
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: userData.email }
        });

        if (emailExists) {
          throw new Error('El email ya está registrado');
        }
      }

      // Verificar username único si se está actualizando
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await prisma.user.findUnique({
          where: { username: userData.username }
        });

        if (usernameExists) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      // Preparar datos para actualizar
      const updateData: any = { ...userData };

      // Hashear nueva contraseña si se proporciona
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, config.bcryptRounds);
      }

      // Actualizar usuario
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData
      });

      logger.info(`Usuario actualizado: ${updatedUser.email}`);
      return updatedUser;
    } catch (error) {
      logger.error('Error actualizando usuario:', error);
      throw error;
    }
  }

  // Eliminar usuario (soft delete)
  async delete(id: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return false;
      }

      // Soft delete - marcar como inactivo
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Usuario eliminado (soft delete): ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Verificar contraseña
  async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.password);
    } catch (error) {
      logger.error('Error verificando contraseña:', error);
      return false;
    }
  }

  // Obtener usuarios activos
  async findActiveUsers(): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios activos:', error);
      throw error;
    }
  }

  // Obtener usuarios con filtros y paginación
  async findAllWithFilters(options: {
    filters?: any;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<User[]> {
    try {
      const { filters = {}, search, limit = 10, offset = 0 } = options;

      // Construir condiciones WHERE
      const whereConditions: any = { ...filters };

      // Agregar búsqueda por texto si se proporciona
      if (search && search.trim()) {
        whereConditions.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }

      return await prisma.user.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
    } catch (error) {
      logger.error('Error obteniendo usuarios con filtros:', error);
      throw error;
    }
  }

  // Contar usuarios con filtros
  async countUsers(filters?: any, search?: string): Promise<number> {
    try {
      const whereConditions: any = { ...filters };

      // Agregar búsqueda por texto si se proporciona
      if (search && search.trim()) {
        whereConditions.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }

      return await prisma.user.count({
        where: whereConditions
      });
    } catch (error) {
      logger.error('Error contando usuarios:', error);
      throw error;
    }
  }

  // Soft delete mejorado que retorna el usuario
  async softDelete(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return null;
      }

      // Soft delete - marcar como inactivo
      const deletedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Usuario eliminado (soft delete): ${user.email}`);
      return deletedUser;
    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Obtener usuario por ID con permisos
  async findByIdWithPermissions(id: string): Promise<any | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      });
    } catch (error) {
      logger.error('Error obteniendo usuario con permisos por ID:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios con permisos
  async findAllWithPermissions(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
    isActive?: boolean;
  }): Promise<{ users: any[], total: number }> {
    try {
      const { page = 1, limit = 10, search, role, isActive } = options;
      const offset = (page - 1) * limit;

      // Construir condiciones WHERE
      const whereConditions: any = {};

      if (role) {
        whereConditions.role = role;
      }

      if (isActive !== undefined) {
        whereConditions.isActive = isActive;
      }

      // Agregar búsqueda por texto si se proporciona
      if (search && search.trim()) {
        whereConditions.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } }
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereConditions,
          include: {
            permissions: {
              include: {
                permission: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset
        }),
        prisma.user.count({
          where: whereConditions
        })
      ]);

      return { users, total };
    } catch (error) {
      logger.error('Error obteniendo usuarios con permisos:', error);
      throw error;
    }
  }

  // Asignar permisos a un usuario
  async assignPermissions(userId: string, permissionIds: string[]): Promise<void> {
    try {
      // Eliminar permisos existentes
      await prisma.userPermission.deleteMany({
        where: { userId }
      });

      // Asignar nuevos permisos
      if (permissionIds.length > 0) {
        await prisma.userPermission.createMany({
          data: permissionIds.map(permissionId => ({
            userId,
            permissionId
          }))
        });
      }

      logger.info(`Permisos asignados al usuario ${userId}:`, permissionIds);
    } catch (error) {
      logger.error('Error asignando permisos:', error);
      throw error;
    }
  }

  // Actualizar permisos de un usuario
  async updatePermissions(userId: string, permissionIds: string[]): Promise<void> {
    try {
      await this.assignPermissions(userId, permissionIds);
      logger.info(`Permisos actualizados para el usuario ${userId}`);
    } catch (error) {
      logger.error('Error actualizando permisos:', error);
      throw error;
    }
  }

  // Obtener todos los permisos disponibles
  async getAllPermissions(): Promise<any[]> {
    try {
      return await prisma.permission.findMany({
        orderBy: [
          { module: 'asc' },
          { submodule: 'asc' },
          { name: 'asc' }
        ]
      });
    } catch (error) {
      logger.error('Error obteniendo permisos:', error);
      throw error;
    }
  }

  // Obtener permisos por rol (para asignación automática)
  async getPermissionsByRole(role: UserRole): Promise<string[]> {
    try {
      if (role === UserRole.ADMIN) {
        // Admin tiene todos los permisos
        const allPermissions = await this.getAllPermissions();
        return allPermissions.map(p => p.id);
      }

      // Definir permisos por rol
      const rolePermissions: Record<string, string[]> = {
        [UserRole.VENDEDOR]: [
          'dashboard_view', 'clients_view', 'clients_create', 'clients_edit',
          'sales_view', 'sales_create', 'products_view'
        ],
        [UserRole.CAJERO]: [
          'dashboard_view', 'sales_view', 'sales_create', 'cash_view',
          'cash_open', 'cash_close', 'products_view'
        ],
        [UserRole.SUPERVISOR]: [
          'dashboard_view', 'users_view', 'clients_view', 'clients_create',
          'clients_edit', 'sales_view', 'sales_create', 'sales_edit',
          'products_view', 'products_create', 'products_edit',
          'inventory_view', 'cash_view', 'reports_view'
        ],

      };

      const permissionNames = rolePermissions[role] || [];
      
      // Obtener IDs de permisos por nombres
      const permissions = await prisma.permission.findMany({
        where: {
          name: {
            in: permissionNames
          }
        }
      });

      return permissions.map(p => p.id);
    } catch (error) {
      logger.error('Error obteniendo permisos por rol:', error);
      throw error;
    }
  }
}

// Instancia singleton
export const userService = new UserService();
export default userService;