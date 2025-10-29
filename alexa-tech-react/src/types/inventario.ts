export interface StockItem {
  stockByWarehouseId: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  warehouseId: string;
  cantidad: number;
  stockMinimo: number;
  estado: 'NORMAL' | 'BAJO' | 'CRITICO';
  updatedAt: string;
}

export interface MovimientoKardex {
  id: string;
  fecha: string;
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  stockAntes: number;
  stockDespues: number;
  motivo: string;
  usuario: string;
  documentoReferencia?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Filter interfaces
export interface StockFilters {
  almacenId?: string;
  productId?: string;
  estado?: 'NORMAL' | 'BAJO' | 'CRITICO';
  q?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface KardexFilters {
  warehouseId: string;
  productId?: string;
  tipoMovimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  fechaDesde?: string;
  fechaHasta?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// API Response interfaces
export interface StockResponse {
  data: StockItem[];
  pagination: PaginationData;
}

export interface KardexResponse {
  data: MovimientoKardex[];
  pagination: PaginationData;
}

// Adjustment interfaces
export interface AjusteData {
  productId: string;
  warehouseId: string;
  cantidadAjuste: number;
  adjustmentReason?: string;
  observaciones?: string;
}

// Stats interface
export interface StockStats {
  totalProductos: number;
  stockBajo: number;
  stockCritico: number;
}

// Warehouse interface
export interface Warehouse {
  id: string;
  label: string;
}

// Adjustment reasons
export const ADJUSTMENT_REASONS = [
  'Merma por daño',
  'Merma por rotura', 
  'Devolución',
  'Error de conteo'
] as const;

export type AdjustmentReason = typeof ADJUSTMENT_REASONS[number];
export type AjusteFormData = AjusteData;