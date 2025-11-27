import axios from 'axios';
import type { AxiosInstance } from 'axios';

// Interfaces para las respuestas de SUNAT
export interface RucResponse {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  estado: string;
  condicion: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
}

export interface DniResponse {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto?: string;
}

export interface SunatApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// Configuración dinámica de la API
const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const currentHost = window.location.hostname;
  const apiPort = 3001;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return `http://localhost:${apiPort}/api`;
  }
  
  return `http://${currentHost}:${apiPort}/api`;
};

// Crear instancia de axios
const api: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * API para consultas a SUNAT/RENIEC
 */
export const sunatApi = {
  /**
   * Consulta información de empresa por RUC
   * @param ruc - Número de RUC (11 dígitos)
   */
  async consultarRuc(ruc: string): Promise<SunatApiResponse<RucResponse>> {
    try {
      const response = await api.get<SunatApiResponse<RucResponse>>(`/sunat/ruc/${ruc}`);
      return response.data;
    } catch (error: any) {
      console.error('Error al consultar RUC:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al consultar RUC',
      };
    }
  },

  /**
   * Consulta información de persona por DNI
   * @param dni - Número de DNI (8 dígitos)
   */
  async consultarDni(dni: string): Promise<SunatApiResponse<DniResponse>> {
    try {
      const response = await api.get<SunatApiResponse<DniResponse>>(`/sunat/dni/${dni}`);
      
      // Si la respuesta tiene datos, agregar nombre completo
      if (response.data.success && response.data.data) {
        const { nombres, apellidoPaterno, apellidoMaterno } = response.data.data;
        response.data.data.nombreCompleto = `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error al consultar DNI:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al consultar DNI',
      };
    }
  },
};

export default sunatApi;
