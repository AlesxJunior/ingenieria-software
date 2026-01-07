// Tipos relacionados con compras y órdenes de compra

// Estado de compra - const object en vez de enum para compatibilidad
export const PurchaseStatus = {
  Pendiente: 'Pendiente',
  Recibida: 'Recibida',
  Cancelada: 'Cancelada'
} as const;

export type PurchaseStatus = typeof PurchaseStatus[keyof typeof PurchaseStatus];

// Método de pago - const object en vez de enum para compatibilidad
export const PaymentMethod = {
  Efectivo: 'Efectivo',
  Tarjeta: 'Tarjeta',
  Transferencia: 'Transferencia'
} as const;

export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

// Tipo de comprobante - const object en vez de enum para compatibilidad
export const VoucherType = {
  Factura: 'Factura',
  Boleta: 'Boleta',
  GuiaRemision: 'GuiaRemision'
} as const;

export type VoucherType = typeof VoucherType[keyof typeof VoucherType];

export interface Purchase {
  id: string;
  codigoOrden: string;
  proveedorId: string;
  almacenId: string;
  fechaEmision: Date;
  fechaEntregaEstimada?: Date;
  tipoComprobante?: VoucherType;
  formaPago?: PaymentMethod;
  subtotal: number;
  descuento: number;
  total: number;
  estado: PurchaseStatus;
  observaciones?: string;
  usuarioId?: string;
  items: PurchaseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productCodigo: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CreatePurchaseDTO {
  proveedorId: string;
  almacenId: string;
  fechaEmision: Date;
  fechaEntregaEstimada?: Date;
  tipoComprobante?: VoucherType;
  formaPago?: PaymentMethod;
  subtotal: number;
  descuento: number;
  total: number;
  observaciones?: string;
  items: CreatePurchaseItemDTO[];
}

export interface CreatePurchaseItemDTO {
  productCodigo: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface UpdatePurchaseDTO {
  estado?: PurchaseStatus;
  fechaEntregaEstimada?: Date;
  observaciones?: string;
}

export interface PurchaseFilters {
  estado?: PurchaseStatus;
  formaPago?: PaymentMethod;
  proveedorId?: string;
  almacenId?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
}
