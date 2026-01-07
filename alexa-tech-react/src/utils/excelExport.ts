import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

/**
 * Interfaz para parámetros de exportación
 */
export interface ExportParams {
  productId?: string;
  warehouseId?: string;
  warehouseFromId?: string;
  warehouseToId?: string;
  tipoMovimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  tipoAlerta?: 'CRITICO' | 'BAJO';
  estado?: 'PENDIENTE' | 'RECIBIDO' | 'CANCELADO';
  fechaDesde?: string;
  fechaHasta?: string;
  [key: string]: string | undefined; // Permitir parámetros adicionales
}

/**
 * Descargar archivo Excel desde un endpoint
 * @param endpoint - Ruta del endpoint (ej: '/inventory/export/stock')
 * @param params - Parámetros de filtrado opcionales
 * @param filename - Nombre personalizado del archivo (opcional)
 */
export async function downloadExcel(
  endpoint: string,
  params?: ExportParams,
  filename?: string
): Promise<void> {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    // Construir query string solo con parámetros definidos
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });
    }

    const url = `${API_BASE_URL}${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    // Hacer la petición con responseType blob
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob', // Importante para archivos binarios
    });

    // Obtener nombre del archivo del header Content-Disposition
    let downloadFilename = filename;
    if (!downloadFilename) {
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          downloadFilename = filenameMatch[1];
        }
      }
    }

    // Fallback si no hay nombre
    if (!downloadFilename) {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadFilename = `export_${timestamp}.xlsx`;
    }

    // Crear blob y descargar
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Crear elemento <a> temporal para descargar
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();

    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);

    console.log(`✅ Archivo descargado: ${downloadFilename}`);
  } catch (error: any) {
    console.error('Error descargando Excel:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response?.status === 401) {
      throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
    } else if (error.response?.status === 403) {
      throw new Error('No tienes permisos para exportar.');
    } else if (error.response?.status === 404) {
      throw new Error('Endpoint de exportación no encontrado.');
    } else {
      throw new Error(error.message || 'Error al descargar el archivo Excel');
    }
  }
}

/**
 * Funciones específicas para cada tipo de exportación
 */

export async function exportStock(params?: ExportParams): Promise<void> {
  return downloadExcel('/inventory/export/stock', params);
}

export async function exportKardex(params?: ExportParams): Promise<void> {
  return downloadExcel('/inventory/export/kardex', params);
}

export async function exportAlertas(params?: ExportParams): Promise<void> {
  return downloadExcel('/inventory/export/alertas', params);
}

export async function exportTransferencias(params?: ExportParams): Promise<void> {
  return downloadExcel('/inventory/export/transferencias', params);
}
