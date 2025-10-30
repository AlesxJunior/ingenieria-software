// Tipos relacionados con clientes y proveedores (entidades comerciales)

export enum TipoEntidad {
  Cliente = 'Cliente',
  Proveedor = 'Proveedor',
  Ambos = 'Ambos'
}

export enum TipoDocumento {
  DNI = 'DNI',
  RUC = 'RUC',
  CE = 'CE',
  Pasaporte = 'Pasaporte'
}

export interface Client {
  id: string;
  tipoEntidad: TipoEntidad;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  
  // Para personas naturales (DNI, CE, Pasaporte)
  nombres?: string;
  apellidos?: string;
  
  // Para personas jurídicas (RUC)
  razonSocial?: string;
  
  // Campos comunes
  email: string;
  telefono: string;
  direccion: string;
  
  // Ubicación
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientDTO {
  tipoEntidad: TipoEntidad;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email: string;
  telefono: string;
  direccion: string;
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
}

export interface UpdateClientDTO {
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  isActive?: boolean;
}

export interface ClientFilters {
  tipoEntidad?: TipoEntidad;
  tipoDocumento?: TipoDocumento;
  search?: string;
  isActive?: boolean;
}
