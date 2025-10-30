// Tipos relacionados con productos

export interface Product {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioVenta: number;
  stock: number;
  minStock?: number;
  trackInventory: boolean;
  estado: boolean;
  unidadMedida: string;
  usuarioCreacion?: string;
  usuarioActualizacion?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  codigo: string;
  nombre: string;
  descripcion?: string;
  categoria: string;
  precioVenta: number;
  minStock?: number;
  trackInventory?: boolean;
  unidadMedida: string;
}

export interface UpdateProductDTO {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  precioVenta?: number;
  minStock?: number;
  trackInventory?: boolean;
  estado?: boolean;
  unidadMedida?: string;
}

export interface ProductFilters {
  categoria?: string;
  estado?: boolean;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
}

export type ProductCategory = 
  | 'ELECTRONICS'
  | 'CLOTHING'
  | 'FOOD'
  | 'BOOKS'
  | 'TOYS'
  | 'SPORTS'
  | 'HOME'
  | 'BEAUTY'
  | 'OTHER';

export type ProductUnit = 
  | 'UNIT'
  | 'KG'
  | 'LITER'
  | 'METER'
  | 'BOX'
  | 'PACK';
