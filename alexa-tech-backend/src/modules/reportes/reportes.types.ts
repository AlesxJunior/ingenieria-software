/**
 * Tipos e interfaces para el módulo de Reportes
 * Sistema de Gestión AlexaTech
 */

// ==========================================
// FILTROS COMUNES
// ==========================================

export interface DateRangeFilter {
  fechaInicio?: string; // ISO date
  fechaFin?: string;    // ISO date
}

// Alias para compatibilidad
export type ReporteFiltros = DateRangeFilter & {
  almacenId?: string;
  usuarioId?: string;
  clienteId?: string;
  proveedorId?: string;
};

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// ==========================================
// REPORTE DE VENTAS
// ==========================================

export interface VentasFilters extends DateRangeFilter {
  usuarioId?: string;
  tipoComprobante?: string;
  metodoPago?: string;
  clienteId?: string;
  estado?: string;
}

export interface VentasReporte {
  resumen: {
    totalVentas: number;
    cantidadVentas: number;
    ticketPromedio: number;
    ventasMayor: number;
    ventasMenor: number;
  };
  ventasPorDia: Array<{
    fecha: string;
    cantidad: number;
    total: number;
  }>;
  ventasPorMetodoPago: Array<{
    metodoPago: string;
    cantidad: number;
    total: number;
    porcentaje: number;
  }>;
  ventasPorComprobante: Array<{
    tipoComprobante: string;
    cantidad: number;
    total: number;
    porcentaje: number;
  }>;
  topProductos: Array<{
    productoId: string;
    nombreProducto: string;
    cantidadVendida: number;
    totalVendido: number;
  }>;
  topClientes: Array<{
    clienteId: string;
    nombreCliente: string;
    cantidadCompras: number;
    totalCompras: number;
  }>;
  ventasPorVendedor: Array<{
    usuarioId: string;
    nombreVendedor: string;
    cantidadVentas: number;
    totalVentas: number;
  }>;
}

// ==========================================
// REPORTE DE COMPRAS
// ==========================================

export interface ComprasFilters extends DateRangeFilter {
  proveedorId?: string;
  almacenId?: string;
  estado?: string;
}

export interface ComprasReporte {
  resumen: {
    totalCompras: number;
    cantidadCompras: number;
    compraPromedio: number;
    comprasMayor: number;
    comprasMenor: number;
  };
  comprasPorDia: Array<{
    fecha: string;
    cantidad: number;
    total: number;
  }>;
  comprasPorProveedor: Array<{
    proveedorId: string;
    nombreProveedor: string;
    cantidadCompras: number;
    totalCompras: number;
    porcentaje: number;
  }>;
  comprasPorAlmacen: Array<{
    almacenId: string;
    nombreAlmacen: string;
    cantidadCompras: number;
    totalCompras: number;
  }>;
  topProductosComprados: Array<{
    productoId: string;
    nombreProducto: string;
    cantidadComprada: number;
    totalComprado: number;
  }>;
  comprasPorEstado: Array<{
    estado: string;
    cantidad: number;
    total: number;
    porcentaje: number;
  }>;
}

// ==========================================
// REPORTE DE INVENTARIO
// ==========================================

export interface InventarioFilters {
  almacenId?: string;
  categoria?: string;
  estado?: 'ALERTA' | 'NORMAL' | 'SOBRESTOCK';
}

export interface InventarioReporte {
  resumen: {
    totalProductos: number;
    productosActivos: number;
    productosInactivos: number;
    valorTotalInventario: number;
    productosConStock: number;
    productosSinStock: number;
    productosEnAlerta: number;
  };
  stockPorAlmacen: Array<{
    almacenId: string;
    nombreAlmacen: string;
    cantidadProductos: number;
    valorInventario: number;
    productosEnAlerta: number;
  }>;
  productosMasRotacion: Array<{
    productoId: string;
    nombreProducto: string;
    cantidadMovimientos: number;
    stockActual: number;
    valorStock: number;
  }>;
  productosEnAlerta: Array<{
    productoId: string;
    nombreProducto: string;
    stockActual: number;
    stockMinimo: number;
    stockMaximo: number;
    almacenId: string;
    nombreAlmacen: string;
  }>;
  valorPorCategoria: Array<{
    categoria: string;
    cantidadProductos: number;
    valorTotal: number;
    porcentaje: number;
  }>;
  movimientosRecientes: Array<{
    fecha: string;
    tipo: string;
    cantidad: number;
    valorTotal: number;
  }>;
}

// ==========================================
// REPORTE FINANCIERO
// ==========================================

export interface FinancieroFilters extends DateRangeFilter {
  tipo?: 'INGRESO' | 'EGRESO' | 'TODOS';
}

export interface FinancieroReporte {
  resumen: {
    totalIngresos: number;
    totalEgresos: number;
    utilidadBruta: number;
    margenBruto: number; // Porcentaje
    ventasPorCobrar: number;
    comprasPorPagar: number;
  };
  ingresosPorDia: Array<{
    fecha: string;
    ventas: number;
    otrosIngresos: number;
    total: number;
  }>;
  egresosPorDia: Array<{
    fecha: string;
    compras: number;
    otrosEgresos: number;
    total: number;
  }>;
  flujoEfectivo: Array<{
    fecha: string;
    ingresos: number;
    egresos: number;
    saldo: number;
  }>;
  ingresosPorConcepto: Array<{
    concepto: string;
    cantidad: number;
    total: number;
    porcentaje: number;
  }>;
  egresosPorConcepto: Array<{
    concepto: string;
    cantidad: number;
    total: number;
    porcentaje: number;
  }>;
}

// ==========================================
// REPORTE DE CAJA
// ==========================================

export interface CajaFilters extends DateRangeFilter {
  cajaId?: string;
  usuarioId?: string;
  estado?: 'ABIERTA' | 'CERRADA';
}

export interface CajaReporte {
  resumen: {
    cajasAbiertas: number;
    cajasCerradas: number;
    totalEfectivo: number;
    totalTarjeta: number;
    totalTransferencia: number;
    totalOtros: number;
    totalGeneral: number;
  };
  movimientosPorCaja: Array<{
    cajaId: string;
    nombreCaja: string;
    usuarioId: string;
    nombreUsuario: string;
    montoApertura: number;
    totalIngresos: number;
    totalEgresos: number;
    montoCierre: number;
    estado: string;
    fechaApertura: string;
    fechaCierre?: string;
  }>;
  movimientosPorMetodo: Array<{
    metodoPago: string;
    cantidadTransacciones: number;
    montoTotal: number;
    porcentaje: number;
  }>;
  ventasPorHora: Array<{
    hora: number;
    cantidadVentas: number;
    montoTotal: number;
  }>;
}

// ==========================================
// REPORTE DE PRODUCTOS MÁS VENDIDOS
// ==========================================

export interface ProductosVendidosFilters extends DateRangeFilter, PaginationParams {
  categoria?: string;
  limit?: number;
}

export interface ProductosVendidosReporte {
  periodo: {
    fechaInicio: string;
    fechaFin: string;
  };
  productos: Array<{
    productoId: string;
    codigo: string;
    nombre: string;
    categoria: string;
    cantidadVendida: number;
    totalVendido: number;
    precioPromedio: number;
    numeroVentas: number;
    ultimaVenta: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

// ==========================================
// RESPUESTA GENÉRICA DE REPORTES
// ==========================================

export interface ReporteResponse<T> {
  success: boolean;
  message: string;
  data: T;
  generadoEn: string;
  filtrosAplicados?: Record<string, any>;
}
