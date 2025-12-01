// ==========================================
// TIPOS PARA CONFIGURACIÓN DE PRODUCTOS
// ==========================================

// Categoría de Productos
export interface ProductCategory {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CategoryInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface CategoryResponse {
  success: boolean;
  data?: ProductCategory;
  error?: string;
  message?: string;
}

export interface CategoriesListResponse {
  success: boolean;
  data?: ProductCategory[];
  error?: string;
  message?: string;
}

// Unidad de Medida
export interface UnitOfMeasure {
  id: string;
  codigo: string;
  nombre: string;
  simbolo: string;
  descripcion: string | null;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface UnitInput {
  codigo: string;
  nombre: string;
  simbolo: string;
  descripcion?: string;
}

export interface UnitResponse {
  success: boolean;
  data?: UnitOfMeasure;
  error?: string;
  message?: string;
}

export interface UnitsListResponse {
  success: boolean;
  data?: UnitOfMeasure[];
  error?: string;
  message?: string;
}

// Filtros
export interface ConfiguracionFilters {
  activo?: boolean;
  q?: string;
}
