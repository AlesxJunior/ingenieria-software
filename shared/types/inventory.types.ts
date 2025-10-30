// Tipos relacionados con inventario y movimientos

export interface Warehouse {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion?: string;
  capacidad?: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockByWarehouse {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  lastUpdated: Date;
}

export enum MovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE = 'AJUSTE'
}

export interface MovementReason {
  id: string;
  tipo: MovementType;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  requiereDocumento: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  reasonId?: string;
  observations?: string;
  userId?: string;
  createdAt: Date;
}

export interface CreateMovementReasonDTO {
  tipo: MovementType;
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiereDocumento?: boolean;
}

export interface UpdateMovementReasonDTO {
  nombre?: string;
  descripcion?: string;
  activo?: boolean;
  requiereDocumento?: boolean;
}

export interface StockAdjustmentDTO {
  productId: string;
  warehouseId: string;
  cantidadAjuste: number;
  reasonId?: string;
  adjustmentReason?: string;
  observaciones?: string;
}

export interface KardexEntry {
  id: string;
  fecha: Date;
  tipo: MovementType;
  motivo?: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  observaciones?: string;
  usuario?: string;
}

export interface KardexFilters {
  productId?: string;
  warehouseId?: string;
  tipo?: MovementType;
  fechaInicio?: Date;
  fechaFin?: Date;
}
