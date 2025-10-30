// Tipos relacionados con compras y órdenes de compra

export enum PurchaseStatus {
  Pendiente = 'Pendiente',
  Recibida = 'Recibida',
  Cancelada = 'Cancelada'
}

export enum PaymentMethod {
  Efectivo = 'Efectivo',
  Tarjeta = 'Tarjeta',
  Transferencia = 'Transferencia'
}

export enum VoucherType {
  Factura = 'Factura',
  Boleta = 'Boleta',
  GuiaRemision = 'GuiaRemision'
}

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
