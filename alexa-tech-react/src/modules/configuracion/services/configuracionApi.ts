import { apiService } from '../../../utils/api';

export interface EmpresaData {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface ComprobanteData {
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
  createdAt?: string;
  updatedAt?: string;
}

export interface MetodoPagoData {
  id?: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: 'efectivo' | 'tarjeta' | 'transferencia' | 'yape' | 'plin' | 'otro';
  activo: boolean;
  predeterminado: boolean;
  requiereReferencia: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const configuracionApi = {
  // Empresa
  getEmpresa: async (): Promise<EmpresaData> => {
    const response = await apiService.get<EmpresaData>('/configuracion/empresa');
    return (response as any).data ?? (response as any);
  },

  updateEmpresa: async (data: Partial<EmpresaData>): Promise<EmpresaData> => {
    const response = await apiService.request<EmpresaData>('/configuracion/empresa', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  // Comprobantes
  getComprobantes: async (): Promise<ComprobanteData[]> => {
    const response = await apiService.get<ComprobanteData[]>('/configuracion/comprobantes');
    return (response as any).data ?? (response as any);
  },

  createComprobante: async (data: ComprobanteData): Promise<ComprobanteData> => {
    const response = await apiService.request<ComprobanteData>('/configuracion/comprobantes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  updateComprobante: async (id: string, data: Partial<ComprobanteData>): Promise<ComprobanteData> => {
    const response = await apiService.request<ComprobanteData>(`/configuracion/comprobantes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  deleteComprobante: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/comprobantes/${id}`, { method: 'DELETE' });
  },

  // Métodos de Pago
  getMetodosPago: async (): Promise<MetodoPagoData[]> => {
    const response = await apiService.get<MetodoPagoData[]>('/configuracion/metodos-pago');
    return (response as any).data ?? (response as any);
  },

  createMetodoPago: async (data: MetodoPagoData): Promise<MetodoPagoData> => {
    const response = await apiService.request<MetodoPagoData>('/configuracion/metodos-pago', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  updateMetodoPago: async (id: string, data: Partial<MetodoPagoData>): Promise<MetodoPagoData> => {
    const response = await apiService.request<MetodoPagoData>(`/configuracion/metodos-pago/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return (response as any).data ?? (response as any);
  },

  deleteMetodoPago: async (id: string): Promise<void> => {
    await apiService.request(`/configuracion/metodos-pago/${id}`, { method: 'DELETE' });
  },
};

export default configuracionApi;