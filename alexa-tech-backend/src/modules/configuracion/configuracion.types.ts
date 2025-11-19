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
