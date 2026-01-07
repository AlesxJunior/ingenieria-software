// Constantes relacionadas con compras

export const PURCHASE_STATUS = {
  PENDIENTE: 'Pendiente',
  RECIBIDA: 'Recibida',
  CANCELADA: 'Cancelada',
} as const;

export const PURCHASE_STATUS_LABELS: Record<string, string> = {
  Pendiente: 'Pendiente',
  Recibida: 'Recibida',
  Cancelada: 'Cancelada',
};

export const PURCHASE_STATUS_COLORS: Record<string, string> = {
  Pendiente: '#f59e0b',  // amarillo
  Recibida: '#10b981',   // verde
  Cancelada: '#ef4444',  // rojo
};

export const PAYMENT_METHODS = [
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Tarjeta', label: 'Tarjeta' },
  { value: 'Transferencia', label: 'Transferencia' },
] as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  Efectivo: 'Efectivo',
  Tarjeta: 'Tarjeta',
  Transferencia: 'Transferencia',
};

export const VOUCHER_TYPES = [
  { value: 'Factura', label: 'Factura' },
  { value: 'Boleta', label: 'Boleta' },
  { value: 'GuiaRemision', label: 'Guía de Remisión' },
] as const;

export const VOUCHER_TYPE_LABELS: Record<string, string> = {
  Factura: 'Factura',
  Boleta: 'Boleta',
  GuiaRemision: 'Guía de Remisión',
};
