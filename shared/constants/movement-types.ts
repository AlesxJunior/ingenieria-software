// Constantes relacionadas con movimientos de inventario

export const MOVEMENT_TYPES = {
  ENTRADA: 'ENTRADA',
  SALIDA: 'SALIDA',
  AJUSTE: 'AJUSTE',
} as const;

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
};

export const MOVEMENT_TYPE_COLORS: Record<string, string> = {
  ENTRADA: '#10b981', // verde
  SALIDA: '#ef4444',  // rojo
  AJUSTE: '#f59e0b',  // amarillo
};

// Códigos predefinidos de motivos de movimiento
export const MOVEMENT_REASON_CODES = {
  // Entradas
  ENT_COMPRA: 'ENT-COMPRA',
  ENT_DEVOLUCION: 'ENT-DEVOLUCION',
  ENT_TRANSFERENCIA: 'ENT-TRANSFERENCIA',
  ENT_PRODUCCION: 'ENT-PRODUCCION',
  
  // Salidas
  SAL_VENTA: 'SAL-VENTA',
  SAL_DEVOLUCION: 'SAL-DEVOLUCION',
  SAL_TRANSFERENCIA: 'SAL-TRANSFERENCIA',
  SAL_CONSUMO: 'SAL-CONSUMO',
  SAL_MERMA: 'SAL-MERMA',
  
  // Ajustes
  AJU_DANIO: 'AJU-DANIO',
  AJU_CORRECCION: 'AJU-CORRECCION',
  AJU_ERROR: 'AJU-ERROR',
  AJU_VENCIDO: 'AJU-VENCIDO',
  AJU_ROBO: 'AJU-ROBO',
} as const;
