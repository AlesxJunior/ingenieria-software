import { Role } from '@prisma/client';
import { prisma } from '../../config/database';
import { 
  RoleCreateInput, 
  RoleUpdateInput, 
  RoleResponse,
  RoleWithUsers,
  VALID_PERMISSIONS 
} from './roles.types';
import { logger } from '../../utils/logger';

export class RoleService {
  
  // Validar permisos
  private validatePermissions(permissions: string[]): void {
    const invalidPermissions = permissions.filter(
      p => !VALID_PERMISSIONS.includes(p as any)
    );

    if (invalidPermissions.length > 0) {
      throw new Error(
        `Permisos inválidos: ${invalidPermissions.join(', ')}`
      );
    }
  }

  // Crear un nuevo rol
  async create(roleData: RoleCreateInput): Promise<RoleResponse> {
    try {
      // Validar que el nombre no esté vacío
      if (!roleData.name || roleData.name.trim() === '') {
        throw new Error('El nombre del rol es requerido');
      }

      // Verificar si el rol ya existe
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (existingRole) {
        throw new Error(`El rol "${roleData.name}" ya existe`);
      }

      // Validar permisos
      this.validatePermissions(roleData.permissions);

      // Crear el rol
      const role = await prisma.role.create({
        data: {
          name: roleData.name,
          description: roleData.description || null,
          permissions: roleData.permissions,
          isActive: roleData.isActive ?? true,
          isSystem: roleData.isSystem ?? false,
        },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      logger.info(`Rol creado: ${role.name}`);
      return role;
    } catch (error) {
      logger.error('Error creando rol:', error);
      throw error;
    }
  }

  // Obtener todos los roles
  async findAll(includeInactive: boolean = false): Promise<RoleResponse[]> {
    try {
      const roles = await prisma.role.findMany({
        where: includeInactive ? {} : { isActive: true },
        include: {
          _count: {
            select: { users: true },
          },
        },
        orderBy: [
          { isSystem: 'desc' }, // Roles del sistema primero
          { name: 'asc' },      // Luego alfabéticamente
        ],
      });

      return roles;
    } catch (error) {
      logger.error('Error obteniendo roles:', error);
      throw error;
    }
  }

  // Obtener un rol por ID
  async findById(id: string, includeUsers: boolean = false): Promise<RoleWithUsers | null> {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true },
          },
          users: includeUsers
            ? {
                select: {
                  id: true,
                  email: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                },
              }
            : false,
        },
      });

      return role;
    } catch (error) {
      logger.error('Error obteniendo rol por ID:', error);
      throw error;
    }
  }

  // Obtener un rol por nombre
  async findByName(name: string): Promise<Role | null> {
    try {
      const role = await prisma.role.findUnique({
        where: { name },
      });

      return role;
    } catch (error) {
      logger.error('Error obteniendo rol por nombre:', error);
      throw error;
    }
  }

  // Actualizar un rol
  async update(id: string, roleData: RoleUpdateInput): Promise<RoleResponse> {
    try {
      // Verificar que el rol existe
      const existingRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new Error('Rol no encontrado');
      }

      // Verificar que no sea un rol del sistema al intentar cambiar isSystem
      if (existingRole.isSystem) {
        throw new Error(
          'Los roles del sistema no pueden ser modificados. Solo se pueden actualizar permisos.'
        );
      }

      // Si se está cambiando el nombre, verificar que no exista otro rol con ese nombre
      if (roleData.name && roleData.name !== existingRole.name) {
        const roleWithSameName = await prisma.role.findUnique({
          where: { name: roleData.name },
        });

        if (roleWithSameName) {
          throw new Error(`El rol "${roleData.name}" ya existe`);
        }
      }

      // Validar permisos si se están actualizando
      if (roleData.permissions) {
        this.validatePermissions(roleData.permissions);
      }

      // Actualizar el rol
      const updatedRole = await prisma.role.update({
        where: { id },
        data: {
          name: roleData.name,
          description: roleData.description,
          permissions: roleData.permissions,
          isActive: roleData.isActive,
        },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      logger.info(`Rol actualizado: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      logger.error('Error actualizando rol:', error);
      throw error;
    }
  }

  // Actualizar solo permisos de un rol (permitido para roles del sistema)
  async updatePermissions(id: string, permissions: string[]): Promise<RoleResponse> {
    try {
      // Verificar que el rol existe
      const existingRole = await prisma.role.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new Error('Rol no encontrado');
      }

      // Validar permisos
      this.validatePermissions(permissions);

      // Actualizar permisos
      const updatedRole = await prisma.role.update({
        where: { id },
        data: { permissions },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      logger.info(`Permisos actualizados para rol: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      logger.error('Error actualizando permisos del rol:', error);
      throw error;
    }
  }

  // Eliminar un rol
  async delete(id: string): Promise<void> {
    try {
      // Verificar que el rol existe
      const role = await prisma.role.findUnique({
        where: { id },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      // Verificar que no sea un rol del sistema
      if (role.isSystem) {
        throw new Error(
          'Los roles del sistema no se pueden eliminar'
        );
      }

      // Verificar que no tenga usuarios asignados
      if (role._count.users > 0) {
        throw new Error(
          `No se puede eliminar el rol. ${role._count.users} usuario(s) asignado(s)`
        );
      }

      // Eliminar el rol
      await prisma.role.delete({
        where: { id },
      });

      logger.info(`Rol eliminado: ${role.name}`);
    } catch (error) {
      logger.error('Error eliminando rol:', error);
      throw error;
    }
  }

  // Desactivar un rol (soft delete)
  async deactivate(id: string): Promise<RoleResponse> {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      if (role.isSystem) {
        throw new Error(
          'Los roles del sistema no se pueden desactivar'
        );
      }

      const updatedRole = await prisma.role.update({
        where: { id },
        data: { isActive: false },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      logger.info(`Rol desactivado: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      logger.error('Error desactivando rol:', error);
      throw error;
    }
  }

  // Activar un rol
  async activate(id: string): Promise<RoleResponse> {
    try {
      const role = await prisma.role.findUnique({
        where: { id },
      });

      if (!role) {
        throw new Error('Rol no encontrado');
      }

      const updatedRole = await prisma.role.update({
        where: { id },
        data: { isActive: true },
        include: {
          _count: {
            select: { users: true },
          },
        },
      });

      logger.info(`Rol activado: ${updatedRole.name}`);
      return updatedRole;
    } catch (error) {
      logger.error('Error activando rol:', error);
      throw error;
    }
  }

  // Obtener lista de permisos válidos
  getValidPermissions(): string[] {
    return [...VALID_PERMISSIONS];
  }

  // Obtener estadísticas de roles
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    system: number;
    custom: number;
    totalUsers: number;
    usersWithoutRole: number;
  }> {
    try {
      const [total, active, inactive, system, custom, usersWithRole, totalUsers] = await Promise.all([
        prisma.role.count(),
        prisma.role.count({ where: { isActive: true } }),
        prisma.role.count({ where: { isActive: false } }),
        prisma.role.count({ where: { isSystem: true } }),
        prisma.role.count({ where: { isSystem: false } }),
        prisma.user.count({ where: { roleId: { not: null } } }),
        prisma.user.count(),
      ]);

      return {
        total,
        active,
        inactive,
        system,
        custom,
        totalUsers: usersWithRole,
        usersWithoutRole: totalUsers - usersWithRole,
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de roles:', error);
      throw error;
    }
  }
}

export const roleService = new RoleService();
