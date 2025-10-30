// Constantes de permisos del sistema

export const PERMISSIONS = {
  USERS: {
    CREATE: 'users.create',
    READ: 'users.read',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE_PERMISSIONS: 'users.manage_permissions',
  },
  PRODUCTS: {
    CREATE: 'products.create',
    READ: 'products.read',
    UPDATE: 'products.update',
    DELETE: 'products.delete',
  },
  INVENTORY: {
    CREATE: 'inventory.create',
    READ: 'inventory.read',
    UPDATE: 'inventory.update',
    DELETE: 'inventory.delete',
    ADJUST: 'inventory.adjust',
    VIEW_KARDEX: 'inventory.view_kardex',
  },
  WAREHOUSES: {
    CREATE: 'warehouses.create',
    READ: 'warehouses.read',
    UPDATE: 'warehouses.update',
    DELETE: 'warehouses.delete',
  },
  PURCHASES: {
    CREATE: 'purchases.create',
    READ: 'purchases.read',
    UPDATE: 'purchases.update',
    DELETE: 'purchases.delete',
    APPROVE: 'purchases.approve',
    RECEIVE: 'purchases.receive',
  },
  SALES: {
    CREATE: 'sales.create',
    READ: 'sales.read',
    UPDATE: 'sales.update',
    DELETE: 'sales.delete',
    REFUND: 'sales.refund',
  },
  CLIENTS: {
    CREATE: 'clients.create',
    READ: 'clients.read',
    UPDATE: 'clients.update',
    DELETE: 'clients.delete',
  },
  REPORTS: {
    VIEW: 'reports.view',
    EXPORT: 'reports.export',
  },
  MOVEMENT_REASONS: {
    CREATE: 'movement_reasons.create',
    READ: 'movement_reasons.read',
    UPDATE: 'movement_reasons.update',
    DELETE: 'movement_reasons.delete',
  },
} as const;

// Tipo derivado de PERMISSIONS
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Permisos por rol
export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS).flatMap(module => Object.values(module)),
  MODERATOR: [
    ...Object.values(PERMISSIONS.PRODUCTS),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.PURCHASES),
    ...Object.values(PERMISSIONS.SALES),
    ...Object.values(PERMISSIONS.CLIENTS),
    PERMISSIONS.WAREHOUSES.READ,
    PERMISSIONS.REPORTS.VIEW,
  ],
  USER: [
    PERMISSIONS.PRODUCTS.READ,
    PERMISSIONS.INVENTORY.READ,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.READ,
    PERMISSIONS.CLIENTS.READ,
  ],
} as const;
