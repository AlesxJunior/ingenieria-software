import { PermissionUtils } from '../../utils/permissions';
import { userService } from '../../services/userService';

export interface GroupedPermissions {
  [category: string]: string[];
}

export interface PermissionValidationResult {
  permission: string;
  isValid: boolean;
  availablePermissions?: string[];
}

export interface UserPermissionValidationResult {
  hasPermission: boolean;
  userPermissions: string[];
  requiredPermissions: string[];
  requireAll: boolean;
  missingPermissions?: string[];
}

export interface UserPermissionCheckResult {
  hasPermission: boolean;
  permissionId: string;
  isValidPermission: boolean;
  userId: string;
}

export const PermissionsService = {
  /**
   * Obtener todos los permisos disponibles en el sistema
   */
  getAllPermissions(): {
    permissions: string[];
    groupedPermissions: GroupedPermissions;
    totalCount: number;
  } {
    const permissions = PermissionUtils.getAvailablePermissions();

    // Agrupar permisos por categoría
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const [category] = permission.split('.');
      if (category) {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(permission);
      }
      return acc;
    }, {} as GroupedPermissions);

    return {
      permissions,
      groupedPermissions,
      totalCount: permissions.length,
    };
  },

  /**
   * Obtener permisos agrupados por categoría
   */
  getPermissionsByCategory(): GroupedPermissions {
    const permissions = PermissionUtils.getAvailablePermissions();

    // Agrupar permisos por categoría
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const [category] = permission.split('.');
      if (category) {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(permission);
      }
      return acc;
    }, {} as GroupedPermissions);

    return groupedPermissions;
  },

  /**
   * Validar si un permiso específico existe en el sistema
   */
  validatePermission(permission: string): PermissionValidationResult {
    if (!permission) {
      throw new Error('Permiso requerido');
    }

    const isValid = PermissionUtils.isValidPermission(permission);

    return {
      permission,
      isValid,
      availablePermissions: isValid
        ? undefined
        : PermissionUtils.getAvailablePermissions(),
    };
  },

  /**
   * Validar si un usuario tiene permisos específicos
   */
  validateUserPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
    requireAll: boolean = false,
  ): UserPermissionValidationResult {
    if (
      !Array.isArray(userPermissions) ||
      !Array.isArray(requiredPermissions)
    ) {
      throw new Error('userPermissions y requiredPermissions deben ser arrays');
    }

    const hasPermission = requireAll
      ? PermissionUtils.hasAllPermissions(userPermissions, requiredPermissions)
      : PermissionUtils.hasAnyPermission(userPermissions, requiredPermissions);

    const missingPermissions = requireAll
      ? requiredPermissions.filter((p) => !userPermissions.includes(p))
      : [];

    return {
      hasPermission,
      userPermissions,
      requiredPermissions,
      requireAll,
      missingPermissions: requireAll ? missingPermissions : undefined,
    };
  },

  /**
   * Verificar si un usuario específico tiene un permiso
   */
  async checkUserPermission(
    userId: string,
    permissionId: string,
  ): Promise<UserPermissionCheckResult> {
    if (!userId) {
      throw new Error('Usuario no autenticado');
    }

    if (!permissionId) {
      throw new Error('ID de permiso requerido');
    }

    // Verificar si el permiso existe en el sistema
    const isValidPermission = PermissionUtils.isValidPermission(permissionId);
    if (!isValidPermission) {
      throw new Error('Permiso no válido');
    }

    // Obtener los permisos del usuario desde la base de datos
    const user = await userService.findById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const hasPermission = PermissionUtils.hasPermission(
      user.role?.permissions || [], // RBAC: Permisos del rol
      permissionId,
    );

    return {
      hasPermission,
      permissionId,
      isValidPermission,
      userId,
    };
  },

  /**
   * Obtener permisos de un usuario específico
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    const user = await userService.findById(userId);

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user.role?.permissions || []; // RBAC: Permisos del rol
  },

  /**
   * Filtrar permisos válidos de una lista
   */
  filterValidPermissions(permissions: string[]): string[] {
    return PermissionUtils.filterValidPermissions(permissions);
  },

  /**
   * Verificar si el usuario tiene todos los permisos requeridos
   */
  hasAllPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    return PermissionUtils.hasAllPermissions(
      userPermissions,
      requiredPermissions,
    );
  },

  /**
   * Verificar si el usuario tiene al menos uno de los permisos requeridos
   */
  hasAnyPermission(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    return PermissionUtils.hasAnyPermission(
      userPermissions,
      requiredPermissions,
    );
  },
};

export default PermissionsService;
