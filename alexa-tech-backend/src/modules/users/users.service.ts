import { User } from '@prisma/client';
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
        where: { email: userData.email },
      });

      if (existingUserByEmail) {
        throw new Error('El email ya está registrado');
      }

      // Verificar si el username ya existe
      const existingUserByUsername = await prisma.user.findUnique({
        where: { username: userData.username },
      });

      if (existingUserByUsername) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(
        userData.password,
        config.bcryptRounds,
      );

      // Crear el usuario
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          permissions: userData.permissions || [],
        },
      });

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
        where: { id },
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
        where: { email },
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
        where: { username },
      });
    } catch (error) {
      logger.error('Error obteniendo usuario por username:', error);
      throw error;
    }
  }

  // Actualizar usuario
  async update(id: string, userData: UserUpdateInput): Promise<User | null> {
    try {
      // Verificar si el usuario existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return null;
      }

      // Verificar email único si se está actualizando
      if (userData.email && userData.email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (emailExists) {
          throw new Error('El email ya está registrado');
        }
      }

      // Verificar username único si se está actualizando
      if (userData.username && userData.username !== existingUser.username) {
        const usernameExists = await prisma.user.findUnique({
          where: { username: userData.username },
        });

        if (usernameExists) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      // Preparar datos para actualizar
      const updateData: any = { ...userData };

      // Hashear nueva contraseña si se proporciona
      if (userData.password) {
        updateData.password = await bcrypt.hash(
          userData.password,
          config.bcryptRounds,
        );
      }

      // Actualizar usuario
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
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
        where: { id },
      });

      if (!user) {
        return false;
      }

      // Soft delete - marcar como inactivo
      await prisma.user.update({
        where: { id },
        data: { isActive: false },
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
        orderBy: { createdAt: 'desc' },
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
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      return await prisma.user.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
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
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      return await prisma.user.count({
        where: whereConditions,
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
        where: { id },
      });

      if (!user) {
        return null;
      }

      // Soft delete - marcar como inactivo
      const deletedUser = await prisma.user.update({
        where: { id },
        data: { isActive: false },
      });

      logger.info(`Usuario eliminado (soft delete): ${user.email}`);
      return deletedUser;
    } catch (error) {
      logger.error('Error eliminando usuario:', error);
      throw error;
    }
  }

  // Obtener todos los usuarios
  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<{ users: User[]; total: number }> {
    try {
      const { page = 1, limit = 10, search, isActive } = options;
      const offset = (page - 1) * limit;

      // Construir condiciones WHERE
      const whereConditions: any = {};

      if (isActive !== undefined) {
        whereConditions.isActive = isActive;
      }

      // Agregar búsqueda por texto si se proporciona
      if (search && search.trim()) {
        whereConditions.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereConditions,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.user.count({
          where: whereConditions,
        }),
      ]);

      return { users, total };
    } catch (error) {
      logger.error('Error obteniendo usuarios:', error);
      throw error;
    }
  }

  // Actualizar última hora de acceso
  async updateLastAccess(userId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { lastAccess: new Date() },
      });
      logger.info('Last access updated', { userId });
    } catch (error) {
      logger.error('Error actualizando última hora de acceso:', error);
      // No lanzamos error para no interrumpir el login
    }
  }
}

// Instancia singleton
export const userService = new UserService();
export default userService;
