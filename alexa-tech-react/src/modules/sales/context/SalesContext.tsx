import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { tokenUtils } from '../../../utils/api';

const API_URL = 'http://localhost:3001/api';

// Interfaces actualizadas para coincidir con el backend
export interface CashRegister {
  id: string;
  nombre: string;
  ubicacion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CashSession {
  id: string;
  cashRegisterId: string;
  userId: string;
  fechaApertura: string;
  fechaCierre?: string;
  montoApertura: number;
  montoCierre?: number;
  totalVentas: number;
  diferencia?: number;
  estado: 'Abierta' | 'Cerrada';
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
  cashRegister?: CashRegister;
  user?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
}

export interface Sale {
  id: string;
  codigoVenta: string;
  cashSessionId?: string;
  clienteId?: string;
  almacenId: string;
  usuarioId: string;
  fechaEmision: string;
  tipoComprobante: 'Boleta' | 'Factura' | 'NotaVenta';
  formaPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
  subtotal: number;
  igv: number;
  total: number;
  estado: 'Pendiente' | 'Completada' | 'Cancelada'; // ✅ Simplificado a 3 estados
  observaciones?: string;
  
  // Campos de tracking de pago
  montoRecibido?: number;
  montoCambio?: number;
  referenciaPago?: string;
  fechaPago?: string;
  
  // 🆕 Pagos múltiples
  payments?: Array<{
    id: string;
    metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
    monto: number;
    referencia?: string;
    observaciones?: string;
    orden: number;
  }>;
  
  // Campos calculados (vienen del backend)
  montoNotaCredito?: number; // Total de NCs aplicadas
  montoEfectivo?: number; // total - montoNotaCredito
  tieneNotaCredito?: boolean; // Indicador si tiene NC
  
  // ✅ Notas de Crédito asociadas (solo en getById)
  creditNotes?: Array<{
    id: string;
    codigoVenta: string;
    creditNoteReason: string;
    creditNoteDescription?: string;
    fechaEmision: string;
    subtotal: number;
    igv: number;
    total: number;
    items: SaleItem[];
    usuario?: {
      id: string;
      nombre: string;
    };
  }>;
  
  items: SaleItem[];
  createdAt: string;
  updatedAt: string;
  cliente?: any;
  almacen?: any;
}

export interface SaleItem {
  id: string;  // ✅ CRÍTICO: ID del SaleItem (necesario para NC)
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CreateSaleInput {
  cashSessionId?: string;
  clienteId?: string;
  almacenId: string;
  tipoComprobante: 'Boleta' | 'Factura' | 'NotaVenta';
  formaPago?: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin'; // ✅ Opcional si usa payments
  incluyeIGV?: boolean; // 🆕 Para indicar si se aplica IGV o no
  comprobanteId?: string; // 🆕 ID del comprobante específico a usar
  // 🆕 Pagos múltiples
  payments?: Array<{
    metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
    monto: number;
    referencia?: string;
    observaciones?: string;
  }>;
  items: Array<{
    productId: string;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  observaciones?: string;
}

// 🆕 Interfaces para Notas de Crédito
export interface CreditNote {
  id: string;
  codigoVenta: string;
  saleOriginId: string;
  fechaEmision: string;
  creditNoteReason: string;
  creditNoteDescription?: string;
  total: number;
  subtotal: number;
  igv: number;
  items: SaleItem[];
  usuario?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  saleOrigin?: {
    id: string;
    codigoVenta: string;
    total: number;
  };
}

export interface CreateCreditNoteInput {
  saleId: string;
  creditNoteReason: string;
  descripcion?: string;
  items: Array<{
    saleItemId: string;
    cantidad: number;
  }>;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Vale';
  cashSessionId?: string;
}

// Nuevas interfaces para Cash Movements
export interface CashMovement {
  id: string;
  cashSessionId: string;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number | string; // Prisma Decimal viene como string desde el backend
  motivo: string;
  descripcion?: string;
  usuarioId: string;
  createdAt: string;
  updatedAt: string;
  usuario?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CashSummary {
  montoApertura: number | string; // Prisma Decimal viene como string
  totalVentas: number | string; // Cambio: totalVentasEfectivo → totalVentas (todas las formas de pago)
  totalIngresos: number | string;
  totalEgresos: number | string;
  totalEsperado: number | string;
  movements?: CashMovement[];
}

interface SalesContextType {
  // Cash Registers
  cashRegisters: CashRegister[];
  loadCashRegisters: () => Promise<void>;
  
  // Cash Sessions
  cashSessions: CashSession[];
  activeCashSession: CashSession | null;
  openCashSession: (cashRegisterId: string, montoApertura: number, observaciones?: string) => Promise<CashSession>;
  closeCashSession: (sessionId: string, montoCierre: number, observaciones?: string) => Promise<CashSession>;
  loadCashSessions: () => Promise<void>;
  
  // 🆕 Cash Session History (Historial de Caja)
  getClosedSessions: (filters?: { fechaInicio?: string; fechaFin?: string; userId?: string }) => Promise<CashSession[]>;
  getSessionById: (sessionId: string) => Promise<CashSession>;
  
  // Cash Movements (NUEVO)
  cashMovements: CashMovement[];
  cashSummary: CashSummary | null;
  createCashMovement: (tipo: 'INGRESO' | 'EGRESO', data: { cashSessionId: string; monto: number; motivo: string; descripcion?: string }) => Promise<CashMovement>;
  loadCashMovements: (sessionId: string) => Promise<void>;
  loadCashSummary: (sessionId: string) => Promise<void>;
  deleteCashMovement: (movementId: string) => Promise<void>;
  
  // Sales
  sales: Sale[];
  createSale: (saleData: CreateSaleInput) => Promise<Sale>;
  confirmPayment: (saleId: string, paymentData: { montoRecibido: number; montoCambio?: number; referenciaPago?: string }) => Promise<Sale>; // 🆕
  completeSale: (saleId: string) => Promise<Sale>;
  cancelSale: (saleId: string, motivo: string) => Promise<Sale>;
  getSaleById: (saleId: string) => Promise<Sale>;
  loadSales: (filters?: any) => Promise<void>;
  
  // 🆕 Credit Notes (Notas de Crédito)
  createCreditNote: (creditNoteData: CreateCreditNoteInput) => Promise<CreditNote>;
  getCreditNotesBySale: (saleId: string) => Promise<CreditNote[]>;
  
  // Quotes (Cotizaciones) - NUEVO
  createQuote: (quoteData: CreateSaleInput) => Promise<any>;
  
  // Invoice
  previewInvoice: (saleId: string) => void;
  downloadInvoice: (saleId: string) => void;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([]);
  const [cashSessions, setCashSessions] = useState<CashSession[]>([]);
  const [activeCashSession, setActiveCashSession] = useState<CashSession | null>(null);
  const [cashMovements, setCashMovements] = useState<CashMovement[]>([]);
  const [cashSummary, setCashSummary] = useState<CashSummary | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function para hacer fetch con autenticación
  const fetchAPI = async (endpoint: string, options?: RequestInit) => {
    const token = tokenUtils.getAccessToken();
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      
      // 🐛 Debug: mostrar error completo del backend
      console.error('❌ Error del backend:', {
        status: response.status,
        statusText: response.statusText,
        url: `${API_URL}${endpoint}`,
        errorData: errorData
      });
      console.error('❌ ErrorData completo (JSON):', JSON.stringify(errorData, null, 2));
      
      throw new Error(errorData.message || `Error ${response.status}`);
    }

    return response.json();
  };

  // ==================== CASH REGISTERS ====================
  const loadCashRegisters = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/cash-registers');
      setCashRegisters(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar cajas registradoras';
      setError(message);
      console.error('Error loading cash registers:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== CASH SESSIONS ====================
  const loadCashSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAPI('/cash-sessions');
      setCashSessions(data.data || []);
      
      // Buscar sesión activa
      const active = (data.data || []).find((session: CashSession) => session.estado === 'Abierta');
      setActiveCashSession(active || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar sesiones de caja';
      setError(message);
      console.error('Error loading cash sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCashSession = async (
    cashRegisterId: string,
    montoApertura: number,
    observaciones?: string
  ): Promise<CashSession> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchAPI('/cash-sessions/open', {
        method: 'POST',
        body: JSON.stringify({ cashRegisterId, montoApertura, observaciones }),
      });

      const newSession = data.data;
      setCashSessions(prev => [...prev, newSession]);
      setActiveCashSession(newSession);
      
      return newSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al abrir sesión de caja';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const closeCashSession = async (
    sessionId: string,
    montoCierre: number,
    observaciones?: string
  ): Promise<CashSession> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchAPI(`/cash-sessions/${sessionId}/close`, {
        method: 'POST',
        body: JSON.stringify({ montoCierre, observaciones }),
      });

      const closedSession = data.data;
      setCashSessions(prev => prev.map(s => s.id === sessionId ? closedSession : s));
      setActiveCashSession(null);
      
      return closedSession;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cerrar sesión de caja';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== CASH SESSION HISTORY (HISTORIAL DE CAJA) ====================
  
  /**
   * Obtener sesiones cerradas con filtros opcionales
   */
  const getClosedSessions = async (filters?: { 
    fechaInicio?: string; 
    fechaFin?: string; 
    userId?: string;
  }): Promise<CashSession[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query string
      const queryParams = new URLSearchParams();
      queryParams.append('estado', 'Cerrada'); // Solo sesiones cerradas
      
      if (filters?.fechaInicio) {
        queryParams.append('fechaInicio', filters.fechaInicio);
      }
      if (filters?.fechaFin) {
        queryParams.append('fechaFin', filters.fechaFin);
      }
      if (filters?.userId) {
        queryParams.append('userId', filters.userId);
      }
      
      const response = await fetchAPI(`/cash-sessions?${queryParams.toString()}`);
      // Backend devuelve { success: true, data: [...] }
      return response.data || response || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar historial de sesiones';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener detalle completo de una sesión por ID
   */
  const getSessionById = async (sessionId: string): Promise<CashSession> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetchAPI(`/cash-sessions/${sessionId}`);
      // Backend devuelve { success: true, data: {...} }
      return response.data || response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar detalle de sesión';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== CASH MOVEMENTS ====================
  const createCashMovement = async (
    tipo: 'INGRESO' | 'EGRESO',
    data: { cashSessionId: string; monto: number; motivo: string; descripcion?: string }
  ): Promise<CashMovement> => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = tipo === 'INGRESO' ? '/cash-movements/ingreso' : '/cash-movements/egreso';
      const response = await fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Backend devuelve { message, movement }
      const newMovement = response.movement;
      setCashMovements(prev => [...prev, newMovement]);
      
      // Recargar resumen después de crear movimiento
      if (data.cashSessionId) {
        await loadCashSummary(data.cashSessionId);
      }
      
      return newMovement;
    } catch (err) {
      const message = err instanceof Error ? err.message : `Error al registrar ${tipo.toLowerCase()}`;
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadCashMovements = async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend devuelve array directamente
      const movements = await fetchAPI(`/cash-movements?cashSessionId=${sessionId}`);
      setCashMovements(movements);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar movimientos de caja';
      setError(message);
      console.error('Error loading cash movements:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCashSummary = async (sessionId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend devuelve { montoApertura, totalVentasEfectivo, totalIngresos, totalEgresos, totalEsperado, movements }
      const summary = await fetchAPI(`/cash-movements/summary/${sessionId}`);
      setCashSummary(summary);
      
      // También actualizar movimientos si vienen en el resumen
      if (summary.movements) {
        setCashMovements(summary.movements);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar resumen de caja';
      setError(message);
      console.error('Error loading cash summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCashMovement = async (movementId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      await fetchAPI(`/cash-movements/${movementId}`, {
        method: 'DELETE',
      });

      setCashMovements(prev => prev.filter(m => m.id !== movementId));
      
      // Recargar resumen si hay sesión activa
      if (activeCashSession?.id) {
        await loadCashSummary(activeCashSession.id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al eliminar movimiento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== SALES ====================
  const loadSales = async (filters?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (filters?.estado) queryParams.append('estado', filters.estado);
      if (filters?.fechaInicio) queryParams.append('fechaInicio', filters.fechaInicio);
      if (filters?.fechaFin) queryParams.append('fechaFin', filters.fechaFin);
      
      const queryString = queryParams.toString();
      const endpoint = queryString ? `/sales?${queryString}` : '/sales';
      
      const data = await fetchAPI(endpoint);
      setSales(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar ventas';
      setError(message);
      console.error('Error loading sales:', err);
    } finally {
      setLoading(false);
    }
  };

  // ==================== QUOTES (Cotizaciones) ====================
  const createQuote = async (quoteData: CreateSaleInput): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      
      const quotePayload = {
        ...quoteData,
        validoHasta: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 días de validez
      };
      
      // 🐛 Debug: mostrar datos enviados
      console.log('🚀 Enviando cotización al backend:', quotePayload);
      
      const response = await fetchAPI('/quotes', {
        method: 'POST',
        body: JSON.stringify(quotePayload),
      });

      return response;
    } catch (err: any) {
      // 🐛 Mejorar logging de errores
      console.error('❌ Error al crear cotización:', err);
      console.error('❌ Detalles del error:', err.message);
      if (err.response) {
        console.error('❌ Respuesta del servidor:', await err.response.json().catch(() => err.response.text()));
      }
      
      const message = err instanceof Error ? err.message : 'Error al crear cotización';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: CreateSaleInput): Promise<Sale> => {
    try {
      setLoading(true);
      setError(null);
      
      // 🐛 Debug: mostrar datos enviados
      console.log('🚀 Enviando venta al backend:', saleData);
      
      const data = await fetchAPI('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData),
      });

      const newSale = data.data;
      setSales(prev => [...prev, newSale]);
      
      return newSale;
    } catch (err: any) {
      // 🐛 Mejorar logging de errores
      console.error('❌ Error al crear venta:', err);
      console.error('❌ Detalles del error:', err.message);
      if (err.response) {
        console.error('❌ Respuesta del servidor:', await err.response.json().catch(() => err.response.text()));
      }
      
      const message = err instanceof Error ? err.message : 'Error al crear venta';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🆕 NUEVA FUNCIÓN: Confirmar pago de una venta
  const confirmPayment = async (
    saleId: string,
    paymentData: {
      montoRecibido: number;
      montoCambio?: number;
      referenciaPago?: string;
    }
  ): Promise<Sale> => {
    try {
      setLoading(true);
      setError(null);

      console.log('💰 Confirmando pago de venta:', { saleId, paymentData });

      const data = await fetchAPI(`/sales/${saleId}/confirm-payment`, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });

      const updatedSale = data.data;
      setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));

      console.log('✅ Pago confirmado exitosamente:', updatedSale);
      return updatedSale;
    } catch (err: any) {
      console.error('❌ Error al confirmar pago:', err);
      const message = err instanceof Error ? err.message : 'Error al confirmar pago';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeSale = async (saleId: string): Promise<Sale> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchAPI(`/sales/${saleId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: 'Completada' }),
      });

      const updatedSale = data.data;
      setSales(prev => prev.map(s => s.id === saleId ? updatedSale : s));
      
      return updatedSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al completar venta';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelSale = async (saleId: string, motivo: string): Promise<Sale> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchAPI(`/sales/${saleId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: 'Cancelada', observaciones: motivo }),
      });

      const canceledSale = data.data;
      setSales(prev => prev.map(s => s.id === saleId ? canceledSale : s));
      
      return canceledSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cancelar venta';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSaleById = async (saleId: string): Promise<Sale> => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchAPI(`/sales/${saleId}`);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener venta';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== CREDIT NOTES ====================
  const createCreditNote = async (creditNoteData: CreateCreditNoteInput): Promise<CreditNote> => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAPI('/credit-notes', {
        method: 'POST',
        body: JSON.stringify(creditNoteData),
      });

      // Recargar ventas para actualizar la lista
      await loadSales();

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear nota de crédito';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getCreditNotesBySale = async (saleId: string): Promise<CreditNote[]> => {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchAPI(`/credit-notes/sale/${saleId}`);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al obtener notas de crédito';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ==================== INVOICE ====================
  const previewInvoice = async (saleId: string) => {
    try {
      const token = tokenUtils.getAccessToken();
      const response = await fetch(`${API_URL}/sales/${saleId}/invoice/preview`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar vista previa de factura');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva ventana y ejecutar impresión
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Fallback: iframe si el popup está bloqueado
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.src = url;
        document.body.appendChild(iframe);
        
        iframe.onload = () => {
          try {
            iframe.contentWindow?.print();
          } catch (e) {
            console.error('Error al imprimir:', e);
          }
          setTimeout(() => {
            document.body.removeChild(iframe);
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al previsualizar factura';
      setError(message);
      console.error('Error previewing invoice:', err);
    }
  };

  const downloadInvoice = async (saleId: string) => {
    try {
      const token = tokenUtils.getAccessToken();
      const response = await fetch(`${API_URL}/sales/${saleId}/invoice/download`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar factura');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${saleId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al descargar factura';
      setError(message);
      console.error('Error downloading invoice:', err);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const token = tokenUtils.getAccessToken();
    if (token) {
      loadCashRegisters();
      loadCashSessions();
      loadSales();
    }
  }, []);

  return (
    <SalesContext.Provider
      value={{
        cashRegisters,
        loadCashRegisters,
        cashSessions,
        activeCashSession,
        openCashSession,
        closeCashSession,
        loadCashSessions,
        getClosedSessions, // 🆕
        getSessionById, // 🆕
        cashMovements,
        cashSummary,
        createCashMovement,
        loadCashMovements,
        loadCashSummary,
        deleteCashMovement,
        sales,
        createSale,
        confirmPayment, // 🆕
        completeSale,
        cancelSale,
        getSaleById,
        loadSales,
        createCreditNote, // 🆕
        getCreditNotesBySale, // 🆕
        createQuote,
        previewInvoice,
        downloadInvoice,
        loading,
        error,
      }}
    >
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextType => {
  const context = React.useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
