import axios, { type AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Función auxiliar para obtener el token
const getAccessToken = (): string | null => {
  return localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
};

export interface MovementReason {
  id: string;
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  requiereDocumento: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    inventoryMovements: number;
  };
}

export interface MovementReasonFormData {
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  codigo: string;
  nombre: string;
  descripcion?: string;
  requiereDocumento?: boolean;
}

class MovementReasonsApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token en cada petición
    this.api.interceptors.request.use(
      (config) => {
        const token = getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Obtener todos los motivos
  async getMovementReasons(filters?: {
    tipo?: string;
    activo?: boolean;
  }): Promise<MovementReason[]> {
    const params = new URLSearchParams();

    if (filters?.tipo) params.append('tipo', filters.tipo);
    if (filters?.activo !== undefined)
      params.append('activo', String(filters.activo));

    const response = await this.api.get(
      `/movement-reasons?${params.toString()}`
    );

    return response.data.data.rows || response.data.data || [];
  }

  // Obtener motivo por ID
  async getMovementReasonById(id: string): Promise<MovementReason> {
    const response = await this.api.get(`/movement-reasons/${id}`);
    return response.data.data;
  }

  // Crear motivo
  async createMovementReason(
    data: MovementReasonFormData,
  ): Promise<MovementReason> {
    const response = await this.api.post(`/movement-reasons`, data);
    return response.data.data;
  }

  // Actualizar motivo
  async updateMovementReason(
    id: string,
    data: Partial<MovementReasonFormData>,
  ): Promise<MovementReason> {
    const response = await this.api.put(`/movement-reasons/${id}`, data);
    return response.data.data;
  }

  // Eliminar motivo
  async deleteMovementReason(id: string): Promise<void> {
    await this.api.delete(`/movement-reasons/${id}`);
  }

  // Activar/Desactivar motivo
  async toggleMovementReason(id: string): Promise<MovementReason> {
    const response = await this.api.patch(
      `/movement-reasons/${id}/toggle`,
      {}
    );
    return response.data.data;
  }
}

export const movementReasonsApi = new MovementReasonsApiService();
