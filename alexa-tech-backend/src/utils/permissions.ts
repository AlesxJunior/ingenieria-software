/**
 * Utilidades para manejo de permisos
 */
export class PermissionUtils {
  /**
   * Mapa de alias para compatibilidad entre permisos antiguos (clients.*)
   * y los nuevos del módulo Entidades Comerciales (commercial_entities.*)
   */
  private static LEGACY_ALIASES: Record<string, string> = {
    'commercial_entities.read': 'clients.read',
    'commercial_entities.create': 'clients.create',
    'commercial_entities.update': 'clients.update',
  };

  /**
   * Verifica con compatibilidad de alias si el usuario posee el permiso
   */
  private static checkPermissionWithAliases(
    userPermissions: string[],
    permission: string,
  ): boolean {
    if (userPermissions.includes(permission)) {
      return true;
    }

    // Si el permiso es nuevo, probar contra su alias legacy
    const legacy = this.LEGACY_ALIASES[permission];
    if (legacy && userPermissions.includes(legacy)) {
      return true;
    }

    // Si el permiso es legacy, probar contra el nuevo equivalente
    const reverse = Object.entries(this.LEGACY_ALIASES).find(
      ([, oldPerm]) => oldPerm === permission,
    );
    if (reverse && userPermissions.includes(reverse[0])) {
      return true;
    }

    return false;
  }
  /**
   * Verifica si el usuario tiene al menos uno de los permisos requeridos
   * @param userPermissions - Array de permisos del usuario
   * @param requiredPermissions - Array de permisos requeridos
   * @returns true si el usuario tiene al menos uno de los permisos requeridos
   */
  static hasAnyPermission(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }

    if (
      !requiredPermissions ||
      !Array.isArray(requiredPermissions) ||
      requiredPermissions.length === 0
    ) {
      return true; // Si no se requieren permisos específicos, permitir acceso
    }

    return requiredPermissions.some((permission) =>
      this.checkPermissionWithAliases(userPermissions, permission),
    );
  }

  /**
   * Verifica si el usuario tiene todos los permisos requeridos
   * @param userPermissions - Array de permisos del usuario
   * @param requiredPermissions - Array de permisos requeridos
   * @returns true si el usuario tiene todos los permisos requeridos
   */
  static hasAllPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }

    if (
      !requiredPermissions ||
      !Array.isArray(requiredPermissions) ||
      requiredPermissions.length === 0
    ) {
      return true; // Si no se requieren permisos específicos, permitir acceso
    }

    return requiredPermissions.every((permission) =>
      this.checkPermissionWithAliases(userPermissions, permission),
    );
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param userPermissions - Array de permisos del usuario
   * @param permission - Permiso específico a verificar
   * @returns true si el usuario tiene el permiso
   */
  static hasPermission(userPermissions: string[], permission: string): boolean {
    if (!userPermissions || !Array.isArray(userPermissions)) {
      return false;
    }

    if (!permission) {
      return true;
    }

    return this.checkPermissionWithAliases(userPermissions, permission);
  }

  /**
   * Obtiene la lista de permisos disponibles en el sistema
   * @returns Array con todos los permisos disponibles
   */
  static getAvailablePermissions(): string[] {
    return [
      // Permisos de usuarios
      'users.create',
      'users.read',
      'users.update',
      'users.delete',

      // Permisos de entidades comerciales (módulo actual)
      'commercial_entities.create',
      'commercial_entities.read',
      'commercial_entities.update',

      // Permisos de ventas
      'sales.create',
      'sales.read',
      'sales.update',
      'sales.delete',

      // Permisos de productos
      'products.create',
      'products.read',
      'products.update',
      'products.delete',

      // Permisos de inventario
      'inventory.read',
      'inventory.update',

      // Permisos de reportes
      'reports.sales',
      'reports.inventory',
      'reports.users',

      // Permisos de caja
      'cash.open',
      'cash.close',
      'cash.read',

      // Permisos de sistema
      'system.settings',
      'system.backup',
      'system.logs',
    ];
  }

  /**
   * Valida si un permiso existe en el sistema
   * @param permission - Permiso a validar
   * @returns true si el permiso existe
   */
  static isValidPermission(permission: string): boolean {
    return this.getAvailablePermissions().includes(permission);
  }

  /**
   * Filtra permisos válidos de una lista
   * @param permissions - Array de permisos a filtrar
   * @returns Array con solo los permisos válidos
   */
  static filterValidPermissions(permissions: string[]): string[] {
    if (!permissions || !Array.isArray(permissions)) {
      return [];
    }

    const availablePermissions = this.getAvailablePermissions();
    return permissions.filter((permission) =>
      availablePermissions.includes(permission),
    );
  }
}
