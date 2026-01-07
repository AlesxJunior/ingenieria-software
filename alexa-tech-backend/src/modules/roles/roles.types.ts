// Types y DTOs para el módulo de Roles

export interface RoleCreateInput {
  name: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
  isSystem?: boolean;
}

export interface RoleUpdateInput {
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    users: number;
  };
}

export interface RoleWithUsers extends RoleResponse {
  users?: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
  }[];
}

// Permisos válidos del sistema (43 permisos únicos)
export const VALID_PERMISSIONS = [
  // Dashboard (1)
  'dashboard.read',
  
  // Usuarios (4)
  'users.create',
  'users.read',
  'users.update',
  'users.delete',
  
  // Roles (4)
  'roles.create',
  'roles.read',
  'roles.update',
  'roles.delete',
  
  // Clientes/Entidades Comerciales (4)
  'clients.create',
  'clients.read',
  'clients.update',
  'clients.delete',
  
  // Ventas (4)
  'sales.create',
  'sales.read',
  'sales.update',
  'sales.delete',
  
  // Productos (4)
  'products.create',
  'products.read',
  'products.update',
  'products.delete',
  
  // Inventario (2)
  'inventory.read',
  'inventory.update',
  
  // Almacenes (4)
  'warehouses.create',
  'warehouses.read',
  'warehouses.update',
  'warehouses.delete',
  
  // Compras (4)
  'purchases.create',
  'purchases.read',
  'purchases.update',
  'purchases.delete',
  
  // Cajas Registradoras (4)
  'cash-registers.create',
  'cash-registers.read',
  'cash-registers.update',
  'cash-registers.delete',
  
  // Sesiones de Caja (4)
  'cash-sessions.create',
  'cash-sessions.read',
  'cash-sessions.update',
  'cash-sessions.delete',
  
  // Configuración (2)
  'settings.read',
  'settings.update',
  
  // Auditoría (1)
  'audit.read',
  
  // Reportes (1)
  'reports.read',
] as const;

export type Permission = typeof VALID_PERMISSIONS[number];
