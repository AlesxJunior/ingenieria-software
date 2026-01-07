// Constantes de permisos del sistema
// Optimizado: Enero 2026 - Eliminados permisos obsoletos y no implementados

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD: {
    READ: 'dashboard.read',
  },
  
  // Usuarios (sin delete - se desactivan, no se eliminan)
  USERS: {
    CREATE: 'users.create',
    READ: 'users.read',
    UPDATE: 'users.update',
  },
  
  // Productos
  PRODUCTS: {
    CREATE: 'products.create',
    READ: 'products.read',
    UPDATE: 'products.update',
    DELETE: 'products.delete',
  },
  
  // Inventario (simplificado: solo read + update)
  INVENTORY: {
    READ: 'inventory.read',    // Stock, Kardex, Alertas
    UPDATE: 'inventory.update', // Ajustes, Transferencias
  },
  
  // Almacenes (CRUD completo)
  WAREHOUSES: {
    CREATE: 'warehouses.create',
    READ: 'warehouses.read',
    UPDATE: 'warehouses.update',
    DELETE: 'warehouses.delete',
  },
  
  // Compras (CRUD completo)
  PURCHASES: {
    CREATE: 'purchases.create',
    READ: 'purchases.read',
    UPDATE: 'purchases.update',
    DELETE: 'purchases.delete',
  },
  
  // Ventas (CRUD completo)
  SALES: {
    CREATE: 'sales.create',
    READ: 'sales.read',
    UPDATE: 'sales.update',
    DELETE: 'sales.delete',
  },
  
  // Clientes/Entidades Comerciales
  CLIENTS: {
    CREATE: 'clients.create',
    READ: 'clients.read',
    UPDATE: 'clients.update',
    DELETE: 'clients.delete',
  },
  
  // Cajas Registradoras (CRUD completo)
  CASH_REGISTERS: {
    CREATE: 'cash-registers.create',
    READ: 'cash-registers.read',
    UPDATE: 'cash-registers.update',
    DELETE: 'cash-registers.delete',
  },
  
  // Sesiones de Caja (sin delete - son históricas)
  CASH_SESSIONS: {
    CREATE: 'cash-sessions.create',
    READ: 'cash-sessions.read',
    UPDATE: 'cash-sessions.update',
  },
  
  // Reportes (por categoría)
  REPORTS: {
    SALES: 'reports.sales',
    INVENTORY: 'reports.inventory',
    FINANCIAL: 'reports.financial',
  },
  
  // Configuración del Sistema (permiso único)
  SYSTEM: {
    SETTINGS: 'system.settings',
  },
  
  // Motivos de Movimiento
  MOVEMENT_REASONS: {
    CREATE: 'movement_reasons.create',
    READ: 'movement_reasons.read',
    UPDATE: 'movement_reasons.update',
    DELETE: 'movement_reasons.delete',
  },
} as const;

// Tipo derivado de PERMISSIONS
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS][keyof typeof PERMISSIONS[keyof typeof PERMISSIONS]];

// Permisos por rol (actualizados)
export const ROLE_PERMISSIONS = {
  ADMIN: Object.values(PERMISSIONS).flatMap(module => Object.values(module)),
  SUPERVISOR: [
    PERMISSIONS.DASHBOARD.READ,
    ...Object.values(PERMISSIONS.PRODUCTS),
    ...Object.values(PERMISSIONS.INVENTORY),
    ...Object.values(PERMISSIONS.WAREHOUSES).filter(p => p !== PERMISSIONS.WAREHOUSES.DELETE),
    ...Object.values(PERMISSIONS.PURCHASES).filter(p => p !== PERMISSIONS.PURCHASES.DELETE),
    ...Object.values(PERMISSIONS.SALES),
    ...Object.values(PERMISSIONS.CLIENTS),
    ...Object.values(PERMISSIONS.CASH_REGISTERS).filter(p => p !== PERMISSIONS.CASH_REGISTERS.DELETE),
    ...Object.values(PERMISSIONS.CASH_SESSIONS),
    ...Object.values(PERMISSIONS.REPORTS),
  ],
  VENDEDOR: [
    PERMISSIONS.DASHBOARD.READ,
    PERMISSIONS.PRODUCTS.READ,
    PERMISSIONS.INVENTORY.READ,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.READ,
    PERMISSIONS.CLIENTS.CREATE,
    PERMISSIONS.CLIENTS.READ,
    PERMISSIONS.CLIENTS.UPDATE,
    PERMISSIONS.REPORTS.SALES,
  ],
  CAJERO: [
    PERMISSIONS.DASHBOARD.READ,
    PERMISSIONS.PRODUCTS.READ,
    PERMISSIONS.INVENTORY.READ,
    PERMISSIONS.SALES.CREATE,
    PERMISSIONS.SALES.READ,
    PERMISSIONS.CLIENTS.READ,
    PERMISSIONS.CASH_REGISTERS.READ,
    PERMISSIONS.CASH_SESSIONS.CREATE,
    PERMISSIONS.CASH_SESSIONS.READ,
    PERMISSIONS.CASH_SESSIONS.UPDATE,
  ],
} as const;
