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

// Permisos válidos del sistema (33 permisos únicos)
export const VALID_PERMISSIONS = [
  // Dashboard (1)
  'dashboard.read',
  
  // Usuarios (3)
  'users.create',
  'users.read',
  'users.update',
  
  // Clientes (4)
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
  
  // Sesiones de Caja (3)
  'cash-sessions.create',
  'cash-sessions.read',
  'cash-sessions.update',
  
  // Sistema (1)
  'system.settings',
  
  // Reportes (3)
  'reports.sales',
  'reports.inventory',
  'reports.financial',
] as const;

export type Permission = typeof VALID_PERMISSIONS[number];
