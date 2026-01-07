/**
 * Tipos y enums para el módulo de Compras
 * Alineados con el backend Prisma Schema
 */

// ==========================================
// ENUMS (Union Types para compatibilidad erasableSyntaxOnly)
// ==========================================

export type PurchaseOrderStatus = 'PENDIENTE' | 'ENVIADA' | 'CONFIRMADA' | 'EN_RECEPCION' | 'PARCIAL' | 'COMPLETADA' | 'CANCELADA';
export type PurchaseReceiptStatus = 'PENDIENTE' | 'INSPECCION' | 'CONFIRMADA' | 'CANCELADA';
export type PurchaseInvoiceStatus = 'PENDIENTE' | 'PAGADA' | 'VENCIDA' | 'ANULADA';

// Constantes de valores para uso en código
export const PurchaseOrderStatusValues = {
  PENDIENTE: 'PENDIENTE' as const,
  ENVIADA: 'ENVIADA' as const,
  CONFIRMADA: 'CONFIRMADA' as const,
  EN_RECEPCION: 'EN_RECEPCION' as const,
  PARCIAL: 'PARCIAL' as const,
  COMPLETADA: 'COMPLETADA' as const,
  CANCELADA: 'CANCELADA' as const,
} as const;

export const PurchaseReceiptStatusValues = {
  PENDIENTE: 'PENDIENTE' as const,
  INSPECCION: 'INSPECCION' as const,
  CONFIRMADA: 'CONFIRMADA' as const,
  CANCELADA: 'CANCELADA' as const,
} as const;

export const PurchaseInvoiceStatusValues = {
  PENDIENTE: 'PENDIENTE' as const,
  PAGADA: 'PAGADA' as const,
  VENCIDA: 'VENCIDA' as const,
  ANULADA: 'ANULADA' as const,
} as const;

// ==========================================
// INTERFACES - ORDEN DE COMPRA
// ==========================================

export interface PurchaseOrderItem {
  id: string;
  productoId: string;
  producto?: {
    id: string;
    codigo: string;
    nombre: string;
    unidadMedida?: string;
  };
  cantidadOrdenada: number;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  cantidadPendiente: number;
  precioUnitario: number;
  descuento: number;
  incluyeIGV?: boolean;  // ✅ Agregado para soportar IGV por item
  especificaciones?: string;
  // Campos calculados
  subtotal: number;
  // Campos legacy (para compatibilidad)
  cantidad?: number;  // Alias de cantidadOrdenada
  observaciones?: string;  // Alias de especificaciones
}

export interface PurchaseOrder {
  id: string;
  codigo: string;
  proveedorId: string;
  proveedor?: {
    id: string;
    razonSocial: string;
    numeroDocumento: string;
    tipoDocumento: string;
  };
  almacenDestinoId: string;
  almacenDestino?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  solicitadoPorId: string;
  solicitadoPor?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  solicitudCompraId?: string;
  fecha: string;
  fechaEntregaEsperada?: string;
  estado: PurchaseOrderStatus;
  condicionesPago?: string;
  formaPago?: string;
  lugarEntrega?: string;
  observaciones?: string;
  subtotal: number;
  descuento: number;
  igv: number;
  total: number;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// INTERFACES - RECEPCIÓN DE COMPRA
// ==========================================

export interface PurchaseReceiptItem {
  id: string;
  productoId: string;
  producto?: {
    id: string;
    codigo: string;
    nombre: string;
  };
  ordenCompraItemId: string;
  ordenCompraItem?: {
    cantidadOrdenada: number;
    cantidadRecibida: number;
    cantidadPendiente: number;
  };
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  observaciones?: string;
}

export interface PurchaseReceipt {
  id: string;
  codigo: string;
  ordenCompraId: string;
  ordenCompra?: PurchaseOrder;
  almacenId: string;
  almacen?: {
    id: string;
    codigo: string;
    nombre: string;
  };
  fechaRecepcion: string;
  fecha?: string;
  estado: PurchaseReceiptStatus;
  observaciones?: string;
  recibidoPorId: string;
  recibidoPor?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  items: PurchaseReceiptItem[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// DTOs - CREAR/ACTUALIZAR
// ==========================================

export interface CreatePurchaseOrderItemDto {
  productoId: string;
  cantidad?: number;  // Cantidad del item (legacy)
  cantidadOrdenada: number;
  precioUnitario: number;
  descuento?: number;
  incluyeIGV?: boolean;  // ✅ Soporte para IGV por item
  especificaciones?: string;
  observaciones?: string;  // Alias de especificaciones (legacy)
}

export interface CreatePurchaseOrderDto {
  proveedorId: string;
  almacenDestinoId: string;
  solicitadoPorId: string;
  solicitudCompraId?: string;
  fechaEntregaEsperada?: string;
  moneda?: string; // 'PEN' | 'USD'
  condicionesPago?: string;
  formaPago?: string;
  lugarEntrega?: string;
  observaciones?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderDto {
  proveedorId?: string;
  almacenDestinoId?: string;
  fechaEntregaEsperada?: string;
  moneda?: string; // 'PEN' | 'USD'
  condicionesPago?: string;
  formaPago?: string;
  lugarEntrega?: string;
  observaciones?: string;
  items?: CreatePurchaseOrderItemDto[];
}

export interface UpdatePurchaseOrderStatusDto {
  estado: PurchaseOrderStatus;
  observaciones?: string;
  userId?: string;
}

// ==========================================
// DTOs - RECEPCIONES
// ==========================================

export interface CreatePurchaseReceiptItemDto {
  ordenCompraItemId: string;
  productoId: string;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  estadoQC: string; // 'APROBADO' | 'RECHAZADO' | 'PENDIENTE'
  numeroLote?: string;
  fechaVencimiento?: string;
  observaciones?: string;
}

export interface CreatePurchaseReceiptDto {
  ordenCompraId: string;
  almacenId: string;
  recibidoPorId: string;
  fechaRecepcion: string;
  guiaRemision?: string;
  transportista?: string;
  condicionMercancia?: string;
  observaciones?: string;
  items: CreatePurchaseReceiptItemDto[];
}

export interface ConfirmReceiptDto {
  inspeccionadoPorId: string;
  items?: CreatePurchaseReceiptItemDto[];
  observaciones?: string;
}

// ==========================================
// FILTROS Y PAGINACIÓN
// ==========================================

export interface FilterPurchaseOrderDto {
  page?: number;
  limit?: number;
  estado?: PurchaseOrderStatus;
  proveedorId?: string;
  almacenDestinoId?: string;
  fechaInicio?: string;
  fechaFin?: string;
  search?: string;
}

export interface FilterPurchaseReceiptDto {
  page?: number;
  limit?: number;
  estado?: PurchaseReceiptStatus;
  ordenCompraId?: string;
  almacenId?: string;
  search?: string; // Búsqueda por código o proveedor
  fechaInicio?: string;
  fechaFin?: string;
}

// ==========================================
// RESPUESTAS API
// ==========================================

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PurchaseOrderStatistics {
  totalOrdenes: number;
  montoTotal: number;
  porEstado: {
    PENDIENTE: number;
    ENVIADA: number;
  };
  ultimasOrdenes: PurchaseOrder[];
}

// ==========================================
// TIPOS AUXILIARES
// ==========================================

export interface Supplier {
  id: string;
  razonSocial: string;
  numeroDocumento: string;
  tipoDocumento: string;
  email?: string;
  telefono?: string;
}

export interface Warehouse {
  id: string;
  nombre: string;
  codigo: string;
  direccion?: string;
  activo: boolean;
}

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precioVenta: number;
  stock: number;
  unidadMedida?: string;
  categoriaId?: string;
  activo: boolean;
}

// ==========================================
// CONSTANTES
// ==========================================

export const PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  PENDIENTE: 'Pendiente',
  ENVIADA: 'Enviada',
  CONFIRMADA: 'Confirmada',
  EN_RECEPCION: 'En Recepción',
  PARCIAL: 'Parcial',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

export const PURCHASE_ORDER_STATUS_COLORS: Record<PurchaseOrderStatus, string> = {
  PENDIENTE: '#ffc107',     // Amarillo
  ENVIADA: '#17a2b8',       // Cyan
  CONFIRMADA: '#007bff',    // Azul
  EN_RECEPCION: '#6f42c1',  // Púrpura
  PARCIAL: '#fd7e14',       // Naranja
  COMPLETADA: '#28a745',    // Verde
  CANCELADA: '#dc3545',     // Rojo
};

export const PURCHASE_RECEIPT_STATUS_LABELS: Record<PurchaseReceiptStatus, string> = {
  PENDIENTE: 'Pendiente',
  INSPECCION: 'En Inspección',
  CONFIRMADA: 'Confirmada',
  CANCELADA: 'Cancelada',
};

export const PURCHASE_RECEIPT_STATUS_COLORS: Record<PurchaseReceiptStatus, string> = {
  PENDIENTE: '#ffc107',     // Amarillo (warning)
  INSPECCION: '#17a2b8',    // Cyan (info)
  CONFIRMADA: '#28a745',    // Verde (success)
  CANCELADA: '#dc3545',     // Rojo (error)
};
