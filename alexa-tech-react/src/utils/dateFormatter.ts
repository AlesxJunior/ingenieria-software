/**
 * Formatea una fecha UTC a hora local de Perú (UTC-5)
 * @param dateString - Fecha en formato ISO string desde backend
 * @returns Fecha formateada en formato DD/MM/YYYY HH:mm:ss
 */
export function formatDateToLocal(dateString: string | Date): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) return '-';
  
  // Opciones para formatear en timezone de Lima (UTC-5)
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  
  const formatter = new Intl.DateTimeFormat('es-PE', options);
  const parts = formatter.formatToParts(date);
  
  // Extraer partes
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  const hour = parts.find(p => p.type === 'hour')?.value || '';
  const minute = parts.find(p => p.type === 'minute')?.value || '';
  const second = parts.find(p => p.type === 'second')?.value || '';
  
  return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
}

/**
 * Formatea solo la fecha (sin hora)
 */
export function formatDateOnly(dateString: string | Date): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  
  const formatter = new Intl.DateTimeFormat('es-PE', options);
  const parts = formatter.formatToParts(date);
  
  const day = parts.find(p => p.type === 'day')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const year = parts.find(p => p.type === 'year')?.value || '';
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea solo la hora
 */
export function formatTimeOnly(dateString: string | Date): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'America/Lima',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };
  
  return new Intl.DateTimeFormat('es-PE', options).format(date);
}
