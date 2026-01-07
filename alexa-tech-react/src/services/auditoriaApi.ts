import axios, { type AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Función auxiliar para obtener el token
const getAccessToken = (): string | null => {
  return localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
};

export interface AuditLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface SystemEvent {
  id: string;
  type: string;
  timestamp: string;
  details?: string;
  metadata?: any;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: PaginationData;
}

export interface UserActivitiesResponse {
  activities: UserActivity[];
  pagination: PaginationData;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SystemEventsResponse {
  events: SystemEvent[];
  pagination: PaginationData;
}

export interface AuditFilters {
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

class AuditoriaApiService {
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

  // Obtener logs de auditoría (solo admin)
  async getAuditLogs(filters?: AuditFilters): Promise<AuditLogsResponse> {
    const params = new URLSearchParams();

    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);

    const response = await this.api.get(`/audit/logs?${params.toString()}`);

    return response.data.data;
  }

  // Obtener actividad de un usuario específico (solo admin)
  async getUserActivity(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<UserActivitiesResponse> {
    const response = await this.api.get(
      `/audit/user-activity/${userId}?page=${page}&limit=${limit}`
    );

    return response.data.data;
  }

  // Obtener mi propia actividad
  async getMyActivity(
    page: number = 1,
    limit: number = 10
  ): Promise<UserActivitiesResponse> {
    const response = await this.api.get(
      `/audit/my-activity?page=${page}&limit=${limit}`
    );

    return response.data.data;
  }

  // Obtener eventos del sistema (solo admin)
  async getSystemEvents(
    page: number = 1,
    limit: number = 10
  ): Promise<SystemEventsResponse> {
    const response = await this.api.get(
      `/audit/system-events?page=${page}&limit=${limit}`
    );

    return response.data.data;
  }

  // Exportar logs a CSV
  exportLogsToCSV(logs: AuditLog[]): void {
    const headers = [
      'Fecha/Hora',
      'Usuario',
      'Acción',
      'Detalles',
      'IP',
      'User Agent',
    ];

    const csvContent = [
      headers.join(','),
      ...logs.map((log) =>
        [
          log.timestamp,
          log.user,
          log.action,
          `"${log.details || ''}"`,
          log.ipAddress || '',
          `"${log.userAgent || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `auditoria_logs_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Exportar actividades a CSV
  exportActivitiesToCSV(activities: UserActivity[]): void {
    const headers = ['Fecha/Hora', 'Acción', 'Detalles', 'IP'];

    const csvContent = [
      headers.join(','),
      ...activities.map((activity) =>
        [
          activity.timestamp,
          activity.action,
          `"${activity.details || ''}"`,
          activity.ipAddress || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `actividad_usuario_${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const auditoriaApi = new AuditoriaApiService();
