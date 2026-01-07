import * as XLSX from 'xlsx';
import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface ExportFilters {
  // Filtros comunes
  productId?: string;
  warehouseId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  
  // Filtros específicos de Kardex
  tipoMovimiento?: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  
  // Filtros específicos de Alertas
  tipoAlerta?: 'CRITICO' | 'BAJO';
  
  // Filtros específicos de Transferencias
  estado?: 'PENDIENTE' | 'RECIBIDO' | 'CANCELADO';
  warehouseFromId?: string;
  warehouseToId?: string;
}

// ============================================
// UTILIDADES PARA FORMATO PROFESIONAL
// ============================================

/**
 * Crear worksheet con formato profesional:
 * - Título del reporte
 * - Fila de contexto (fecha, filtros)
 * - Headers con estilo
 */
function createProfessionalWorksheet(
  title: string,
  contextInfo: Record<string, string>,
  data: any[],
  columnWidths: number[]
): XLSX.WorkSheet {
  const ws: XLSX.WorkSheet = {};
  
  // Fila 1: Título del reporte (merged cells)
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columnWidths.length - 1 } }];
  ws['A1'] = { 
    v: title, 
    t: 's',
    s: {
      font: { bold: true, sz: 16, color: { rgb: '2C3E50' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { fgColor: { rgb: 'E8F4F8' } }
    }
  };
  
  // Fila 2: Contexto (fecha, filtros)
  let contextRow = 1;
  const contextEntries = Object.entries(contextInfo);
  const contextText = contextEntries.map(([key, val]) => `${key}: ${val}`).join(' | ');
  
  if (!ws['!merges']) ws['!merges'] = [];
  ws['!merges'].push({ s: { r: contextRow, c: 0 }, e: { r: contextRow, c: columnWidths.length - 1 } });
  const contextCell = XLSX.utils.encode_cell({ r: contextRow, c: 0 });
  ws[contextCell] = { 
    v: contextText, 
    t: 's',
    s: {
      font: { italic: true, sz: 10, color: { rgb: '7F8C8D' } },
      alignment: { horizontal: 'center' }
    }
  };
  
  // Fila 3: Vacía (separador)
  
  // Fila 4+: Datos (usando json_to_sheet offset)
  const dataStartRow = 3;
  XLSX.utils.sheet_add_json(ws, data, { 
    origin: { r: dataStartRow, c: 0 },
    skipHeader: false
  });
  
  // Aplicar estilo a headers (fila 4)
  const headerRow = dataStartRow;
  const headers = Object.keys(data[0] || {});
  headers.forEach((header, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: colIndex });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '3498DB' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
  });
  
  // Ajustar ancho de columnas
  ws['!cols'] = columnWidths.map(wch => ({ wch }));
  
  // Altura de filas especiales
  ws['!rows'] = [
    { hpt: 30 }, // Título
    { hpt: 20 }, // Contexto
    { hpt: 10 }, // Separador
    { hpt: 25 }, // Headers
  ];
  
  return ws;
}

/**
 * Formatear fecha actual para contexto
 */
function getCurrentDateString(): string {
  return new Date().toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================
// FUNCIONES DE EXPORTACIÓN
// ============================================

/**
 * Exportar Stock por Almacén a Excel
 */
export async function exportStockToExcel(filters: ExportFilters): Promise<Buffer> {
  const where: Prisma.StockByWarehouseWhereInput = {
    productId: filters.productId,
    warehouseId: filters.warehouseId,
  };

  const stocks = await prisma.stockByWarehouse.findMany({
    where,
    include: {
      product: {
        select: {
          codigo: true,
          nombre: true,
          categoria: true,
        }
      },
      warehouse: {
        select: {
          codigo: true,
          nombre: true,
        }
      }
    },
    orderBy: [
      { warehouse: { nombre: 'asc' } },
      { product: { nombre: 'asc' } }
    ]
  });

  // Preparar datos para Excel
  const excelData = stocks.map(stock => ({
    'Código Producto': stock.product.codigo,
    'Producto': stock.product.nombre,
    'Categoría': stock.product.categoria || 'N/A',
    'Almacén': stock.warehouse.nombre,
    'Código Almacén': stock.warehouse.codigo,
    'Stock Actual': stock.quantity,
    'Stock Mínimo': stock.minStock ?? 'N/A',
    'Estado': stock.quantity === 0 
      ? '❌ SIN STOCK' 
      : stock.minStock && stock.quantity <= stock.minStock 
        ? '⚠️ BAJO' 
        : '✅ NORMAL',
    'Última Actualización': new Date(stock.updatedAt).toLocaleString('es-ES')
  }));

  // Contexto del reporte
  const context: Record<string, string> = {
    'Fecha de Generación': getCurrentDateString(),
    'Total de Productos': stocks.length.toString(),
  };
  
  if (filters.warehouseId) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: filters.warehouseId } });
    context['Almacén'] = warehouse?.nombre || filters.warehouseId;
  }

  // Crear worksheet con formato profesional
  const worksheet = createProfessionalWorksheet(
    '📊 REPORTE DE STOCK POR ALMACÉN',
    context,
    excelData,
    [15, 40, 15, 25, 15, 12, 12, 15, 20]
  );

  // Crear workbook y agregar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock por Almacén');

  // Generar buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
  return excelBuffer;
}

/**
 * Exportar Kardex (movimientos de inventario) a Excel
 */
export async function exportKardexToExcel(filters: ExportFilters): Promise<Buffer> {
  const where: Prisma.InventoryMovementWhereInput = {
    productId: filters.productId,
    warehouseId: filters.warehouseId,
    ...(filters.tipoMovimiento && { type: filters.tipoMovimiento }),
    createdAt: {
      gte: filters.fechaDesde ? new Date(filters.fechaDesde) : undefined,
      lte: filters.fechaHasta ? new Date(filters.fechaHasta) : undefined,
    },
  };

  const movements = await prisma.inventoryMovement.findMany({
    where,
    include: {
      product: {
        select: {
          codigo: true,
          nombre: true,
        }
      },
      warehouse: {
        select: {
          codigo: true,
          nombre: true,
        }
      },
      user: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
        }
      },
      movementReason: {
        select: {
          nombre: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10000 // Límite de seguridad
  });

  // Preparar datos para Excel
  const excelData = movements.map(mov => ({
    'Fecha': new Date(mov.createdAt).toLocaleString('es-ES'),
    'Código Producto': mov.product.codigo,
    'Producto': mov.product.nombre,
    'Almacén': mov.warehouse.nombre,
    'Tipo': mov.type,
    'Cantidad': mov.quantity,
    'Stock Antes': mov.stockBefore,
    'Stock Después': mov.stockAfter,
    'Motivo': mov.movementReason?.nombre || mov.reason || 'N/A',
    'Usuario': mov.user ? `${mov.user.firstName} ${mov.user.lastName}` : 'Sistema',
    'Documento Ref.': mov.documentRef ?? 'N/A',
  }));

  // Contexto del reporte
  const context: Record<string, string> = {
    'Fecha de Generación': getCurrentDateString(),
    'Total de Movimientos': movements.length.toString(),
  };
  
  if (filters.warehouseId) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: filters.warehouseId } });
    context['Almacén'] = warehouse?.nombre || filters.warehouseId;
  }
  
  if (filters.tipoMovimiento) {
    context['Tipo de Movimiento'] = filters.tipoMovimiento;
  }
  
  if (filters.fechaDesde || filters.fechaHasta) {
    const desde = filters.fechaDesde ? new Date(filters.fechaDesde).toLocaleDateString('es-ES') : '...';
    const hasta = filters.fechaHasta ? new Date(filters.fechaHasta).toLocaleDateString('es-ES') : '...';
    context['Período'] = `${desde} - ${hasta}`;
  }

  // Crear worksheet con formato profesional
  const worksheet = createProfessionalWorksheet(
    '📋 REPORTE DE KARDEX DE INVENTARIO',
    context,
    excelData,
    [18, 15, 40, 25, 10, 10, 12, 12, 30, 20, 15]
  );

  // Crear workbook y agregar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Kardex de Inventario');

  // Generar buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
  return excelBuffer;
}

/**
 * Exportar Alertas de Stock a Excel
 */
export async function exportAlertasToExcel(filters: ExportFilters): Promise<Buffer> {
  const where: Prisma.StockByWarehouseWhereInput = {
    productId: filters.productId,
    warehouseId: filters.warehouseId,
    product: {
      trackInventory: true,
    },
    OR: [
      { quantity: 0 }, // SIN STOCK
      {
        AND: [
          { minStock: { not: null } },
          { quantity: { lte: prisma.stockByWarehouse.fields.minStock } }
        ]
      }
    ]
  };

  const alertas = await prisma.stockByWarehouse.findMany({
    where,
    include: {
      product: {
        select: {
          codigo: true,
          nombre: true,
          categoria: true,
        }
      },
      warehouse: {
        select: {
          codigo: true,
          nombre: true,
        }
      }
    },
    orderBy: [
      { quantity: 'asc' },
      { product: { nombre: 'asc' } }
    ]
  });

  // Filtrar por tipo de alerta si se especifica
  let alertasFiltradas = alertas;
  if (filters.tipoAlerta === 'CRITICO') {
    alertasFiltradas = alertas.filter(a => a.quantity === 0);
  } else if (filters.tipoAlerta === 'BAJO') {
    alertasFiltradas = alertas.filter(a => a.quantity > 0 && a.minStock && a.quantity <= a.minStock);
  }

  // Preparar datos para Excel
  const excelData = alertasFiltradas.map(alerta => {
    const tipoAlerta = alerta.quantity === 0 ? 'CRITICO' : 'BAJO';
    const diferencia = alerta.minStock ? alerta.quantity - alerta.minStock : 0;

    return {
      'Tipo': tipoAlerta === 'CRITICO' ? '🔴 CRÍTICO' : '🟡 BAJO',
      'Código Producto': alerta.product.codigo,
      'Producto': alerta.product.nombre,
      'Categoría': alerta.product.categoria || 'N/A',
      'Almacén': alerta.warehouse.nombre,
      'Stock Actual': alerta.quantity,
      'Stock Mínimo': alerta.minStock ?? 'N/A',
      'Diferencia': tipoAlerta === 'CRITICO' ? 'SIN STOCK' : diferencia,
      'Mensaje': tipoAlerta === 'CRITICO' 
        ? '⚠️ PRODUCTO SIN STOCK - REABASTECER URGENTE' 
        : `Stock por debajo del mínimo en ${Math.abs(diferencia)} unidades`,
      'Última Actualización': new Date(alerta.updatedAt).toLocaleString('es-ES')
    };
  });

  // Contexto del reporte
  const countCritico = alertasFiltradas.filter(a => a.quantity === 0).length;
  const countBajo = alertasFiltradas.filter(a => a.quantity > 0 && a.minStock && a.quantity <= a.minStock).length;
  
  const context: Record<string, string> = {
    'Fecha de Generación': getCurrentDateString(),
    'Total de Alertas': alertasFiltradas.length.toString(),
    'Críticas': countCritico.toString(),
    'Bajas': countBajo.toString(),
  };
  
  if (filters.warehouseId) {
    const warehouse = await prisma.warehouse.findUnique({ where: { id: filters.warehouseId } });
    context['Almacén'] = warehouse?.nombre || filters.warehouseId;
  }
  
  if (filters.tipoAlerta) {
    context['Tipo de Alerta'] = filters.tipoAlerta;
  }

  // Crear worksheet con formato profesional
  const worksheet = createProfessionalWorksheet(
    '⚠️ REPORTE DE ALERTAS DE STOCK',
    context,
    excelData,
    [12, 15, 40, 15, 25, 12, 12, 12, 50, 20]
  );

  // Crear workbook y agregar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Alertas de Stock');

  // Generar buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
  return excelBuffer;
}

/**
 * Exportar Transferencias entre Almacenes a Excel
 */
export async function exportTransferenciasToExcel(filters: ExportFilters): Promise<Buffer> {
  const where: Prisma.StockTransferWhereInput = {
    productId: filters.productId,
    warehouseFromId: filters.warehouseFromId,
    warehouseToId: filters.warehouseToId,
    ...(filters.estado && { estado: filters.estado }),
    createdAt: {
      gte: filters.fechaDesde ? new Date(filters.fechaDesde) : undefined,
      lte: filters.fechaHasta ? new Date(filters.fechaHasta) : undefined,
    },
  };

  const transferencias = await prisma.stockTransfer.findMany({
    where,
    include: {
      product: {
        select: {
          codigo: true,
          nombre: true,
        }
      },
      warehouseFrom: {
        select: {
          codigo: true,
          nombre: true,
        }
      },
      warehouseTo: {
        select: {
          codigo: true,
          nombre: true,
        }
      },
      solicitante: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      aprobador: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      receptor: {
        select: {
          firstName: true,
          lastName: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10000 // Límite de seguridad
  });

  // Preparar datos para Excel
  const excelData = transferencias.map(transfer => ({
    'Código': transfer.codigo,
    'Estado': transfer.estado === 'PENDIENTE' 
      ? '🟡 PENDIENTE' 
      : transfer.estado === 'RECIBIDO' 
        ? '✅ RECIBIDO' 
        : '❌ CANCELADO',
    'Fecha Solicitud': new Date(transfer.createdAt).toLocaleString('es-ES'),
    'Código Producto': transfer.product.codigo,
    'Producto': transfer.product.nombre,
    'Cantidad': transfer.cantidad,
    'Almacén Origen': transfer.warehouseFrom.nombre,
    'Código Origen': transfer.warehouseFrom.codigo,
    'Almacén Destino': transfer.warehouseTo.nombre,
    'Código Destino': transfer.warehouseTo.codigo,
    'Solicitante': `${transfer.solicitante.firstName} ${transfer.solicitante.lastName}`,
    'Aprobador': transfer.aprobador 
      ? `${transfer.aprobador.firstName} ${transfer.aprobador.lastName}` 
      : 'N/A',
    'Fecha Aprobación': transfer.fechaAprobacion 
      ? new Date(transfer.fechaAprobacion).toLocaleString('es-ES') 
      : 'N/A',
    'Receptor': transfer.receptor 
      ? `${transfer.receptor.firstName} ${transfer.receptor.lastName}` 
      : 'N/A',
    'Fecha Recepción': transfer.fechaRecepcion 
      ? new Date(transfer.fechaRecepcion).toLocaleString('es-ES') 
      : 'N/A',
    'Motivo': transfer.motivoTransferencia || 'N/A',
    'Observaciones': transfer.observaciones || 'N/A',
  }));

  // Contexto del reporte
  const countPendiente = transferencias.filter(t => t.estado === 'PENDIENTE').length;
  const countRecibido = transferencias.filter(t => t.estado === 'RECIBIDO').length;
  const countCancelado = transferencias.filter(t => t.estado === 'CANCELADO').length;
  
  const context: Record<string, string> = {
    'Fecha de Generación': getCurrentDateString(),
    'Total de Transferencias': transferencias.length.toString(),
    'Pendientes': countPendiente.toString(),
    'Recibidas': countRecibido.toString(),
    'Canceladas': countCancelado.toString(),
  };
  
  if (filters.estado) {
    context['Estado Filtrado'] = filters.estado;
  }
  
  if (filters.fechaDesde || filters.fechaHasta) {
    const desde = filters.fechaDesde ? new Date(filters.fechaDesde).toLocaleDateString('es-ES') : '...';
    const hasta = filters.fechaHasta ? new Date(filters.fechaHasta).toLocaleDateString('es-ES') : '...';
    context['Período'] = `${desde} - ${hasta}`;
  }

  // Crear worksheet con formato profesional
  const worksheet = createProfessionalWorksheet(
    '🔄 REPORTE DE TRANSFERENCIAS ENTRE ALMACENES',
    context,
    excelData,
    [15, 12, 18, 15, 40, 10, 25, 15, 25, 15, 20, 20, 18, 20, 18, 30, 40]
  );

  // Crear workbook y agregar worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transferencias');

  // Generar buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
  return excelBuffer;
}

/**
 * Generar nombre de archivo con timestamp
 */
export function generateExcelFilename(tipo: 'stock' | 'kardex' | 'alertas' | 'transferencias'): string {
  const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const horaCompleta = new Date().toTimeString().split(' ')[0];
  const hora = horaCompleta ? horaCompleta.replace(/:/g, '-') : '00-00-00'; // HH-MM-SS
  return `${tipo}_${fecha}_${hora}.xlsx`;
}
