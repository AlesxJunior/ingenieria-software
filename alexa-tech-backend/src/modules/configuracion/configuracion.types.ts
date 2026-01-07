export interface CompanyData {
  id?: string;
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  email: string;
  website?: string;
  logo?: string;
  igvActivo: boolean;
  igvPorcentaje: number;
  moneda: string;
  pais: string;
  departamento: string;
  provincia: string;
  distrito: string;
  codigoPostal?: string;
  sunatUsuario?: string;
  sunatClave?: string;
  sunatServidor: 'produccion' | 'homologacion';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ComprobanteTypeData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'factura' | 'boleta' | 'nota-credito' | 'nota-debito';
  serie: string;
  numeroActual: number;
  numeroInicio: number;
  numeroFin: number;
  activo: boolean;
  predeterminado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PaymentMethodData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin' | 'otro';
  activo: boolean;
  predeterminado: boolean;
  requiereReferencia: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================
// MAESTROS DE PRODUCTOS
// ============================================

export interface ProductCategoryData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductCategoryInput {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface ProductCategoryResponse extends ProductCategoryData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitOfMeasureData {
  id?: string;
  codigo: string;
  nombre: string;
  simbolo?: string;
  descripcion?: string;
  activo: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UnitOfMeasureInput {
  codigo: string;
  nombre: string;
  simbolo?: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UnitOfMeasureResponse extends UnitOfMeasureData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
