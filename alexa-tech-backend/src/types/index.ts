import { Request } from 'express';

// Interfaces de usuario
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  permissions?: string[];
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  permissions?: string[];
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  permissions?: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
  iat?: number;
  exp?: number;
}

// Request extendido con usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// Respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Tipos de error
export interface ApiError {
  message: string;
  statusCode: number;
  code?: string;
  details?: any;
}

// Tipos de validación
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Tipos de Productos
export interface ProductCreateInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioVenta: number;
  stock?: number; // solo para compatibilidad temporal
  minStock?: number;
  estado?: boolean;
  unidadMedida: string;
  stockInitial?: {
    warehouseId: string;
    cantidad: number;
  };
}

export interface ProductUpdateInput {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  precioVenta?: number;
  minStock?: number;
  // stock se gestiona por inventario; evitar actualizar directamente
  estado?: boolean;
  unidadMedida?: string;
}

export interface ProductStatusUpdateInput {
  estado: boolean;
}

// Compras
export interface PurchaseItemInput {
  productoId: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
}

export type PurchaseEstado = 'Pendiente' | 'Recibida' | 'Cancelada';

export interface PurchaseCreateInput {
  proveedorId: string;
  almacenId: string;
  fechaEmision: string; // ISO date string
  tipoComprobante?: string;
  items: PurchaseItemInput[];
  formaPago?: string;
  observaciones?: string;
  fechaEntregaEstimada?: string; // ISO date string
  descuento?: number;
}

export interface PurchaseUpdateInput {
  proveedorId?: string;
  almacenId?: string;
  fechaEmision?: string;
  tipoComprobante?: string;
  items?: PurchaseItemInput[];
  formaPago?: string;
  observaciones?: string;
  fechaEntregaEstimada?: string;
  descuento?: number;
}

export interface PurchaseStatusUpdateInput {
  estado: PurchaseEstado;
}

export interface Purchase {
  id: string;
  codigoOrden: string;
  proveedorId: string;
  almacenId: string;
  fechaEmision: string;
  tipoComprobante?: string;
  items: Array<{
    productoId: string;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }>;
  subtotal: number;
  descuento: number;
  total: number;
  formaPago?: string;
  fechaEntregaEstimada?: string;
  observaciones?: string;
  usuarioId: string;
  estado: PurchaseEstado;
  createdAt: string;
  updatedAt: string;
}