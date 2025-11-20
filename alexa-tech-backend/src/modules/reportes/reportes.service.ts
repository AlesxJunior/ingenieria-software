/**
 * SERVICIO DE REPORTES - VERSIÓN FUNCIONAL
 * Implementación completa que cumple con todas las interfaces TypeScript
 */
import prisma from '../../config/database';
import {
  VentasReporte,
  ComprasReporte,
  InventarioReporte,
  FinancieroReporte,
  CajaReporte,
  ProductosVendidosReporte,
  ReporteFiltros
} from './reportes.types';

class ReportesService {
  /**
   * REPORTE DE VENTAS
   */
  async getReporteVentas(filtros: ReporteFiltros): Promise<VentasReporte> {
    const { fechaInicio, fechaFin, almacenId, usuarioId } = filtros;

    const whereClause: any = {
      estado: { notIn: ['Cancelada'] },
    };

    if (fechaInicio && fechaFin) {
      whereClause.fechaEmision = {
        gte: new Date(fechaInicio),
        lte: new Date(fechaFin),
      };
    }

    if (almacenId) whereClause.almacenId = almacenId;
    if (usuarioId) whereClause.usuarioId = usuarioId;

    const ventas = await prisma.sale.findMany({
      where: whereClause,
      include: {
        items: { include: { product: true } },
        cliente: true,
        usuario: true,
      },
    });

    const totalVentas = ventas.length;
    const ventasTotal = ventas.reduce((sum, v) => sum + Number(v.total), 0);
    const promedioVenta = totalVentas > 0 ? ventasTotal / totalVentas : 0;
    const ventasMayor = totalVentas > 0 ? Math.max(...ventas.map(v => Number(v.total))) : 0;
    const ventasMenor = totalVentas > 0 ? Math.min(...ventas.map(v => Number(v.total))) : 0;

    // Ventas por día
    const ventasPorDiaMap = new Map<string, { cantidad: number; total: number }>();
    ventas.forEach(v => {
      const fecha = v.fechaEmision.toISOString().split('T')[0] || '';
      const current = ventasPorDiaMap.get(fecha);
      ventasPorDiaMap.set(fecha, {
        cantidad: (current?.cantidad || 0) + 1,
        total: (current?.total || 0) + Number(v.total)
      });
    });

    const ventasPorDia = Array.from(ventasPorDiaMap.entries()).map(([fecha, data]) => ({
      fecha,
      cantidad: data.cantidad,
      total: data.total
    })).sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Ventas por método de pago
    const efectivo = ventas.filter(v => v.formaPago === 'Efectivo').reduce((s, v) => s + Number(v.total), 0);
    const tarjeta = ventas.filter(v => v.formaPago === 'Tarjeta').reduce((s, v) => s + Number(v.total), 0);
    const otros = ventasTotal - efectivo - tarjeta;

    const ventasPorMetodoPago = [
      {
        metodoPago: 'Efectivo',
        cantidad: ventas.filter(v => v.formaPago === 'Efectivo').length,
        total: efectivo,
        porcentaje: ventasTotal > 0 ? (efectivo / ventasTotal) * 100 : 0,
      },
      {
        metodoPago: 'Tarjeta',
        cantidad: ventas.filter(v => v.formaPago === 'Tarjeta').length,
        total: tarjeta,
        porcentaje: ventasTotal > 0 ? (tarjeta / ventasTotal) * 100 : 0,
      },
      {
        metodoPago: 'Otros',
        cantidad: ventas.filter(v => !['Efectivo', 'Tarjeta'].includes(v.formaPago)).length,
        total: otros,
        porcentaje: ventasTotal > 0 ? (otros / ventasTotal) * 100 : 0,
      },
    ];

    // Ventas por comprobante
    const boletas = ventas.filter(v => v.tipoComprobante === 'Boleta').reduce((s, v) => s + Number(v.total), 0);
    const facturas = ventas.filter(v => v.tipoComprobante === 'Factura').reduce((s, v) => s + Number(v.total), 0);

    const ventasPorComprobante = [
      {
        tipoComprobante: 'Boleta',
        cantidad: ventas.filter(v => v.tipoComprobante === 'Boleta').length,
        total: boletas,
        porcentaje: ventasTotal > 0 ? (boletas / ventasTotal) * 100 : 0,
      },
      {
        tipoComprobante: 'Factura',
        cantidad: ventas.filter(v => v.tipoComprobante === 'Factura').length,
        total: facturas,
        porcentaje: ventasTotal > 0 ? (facturas / ventasTotal) * 100 : 0,
      },
    ];

    // Top productos
    const productosMap = new Map<string, any>();
    ventas.forEach(venta => {
      venta.items.forEach((item: any) => {
        const key = item.productId;
        const existing = productosMap.get(key);
        if (existing) {
          existing.cantidadVendida += item.cantidad;
          existing.totalVendido += Number(item.subtotal);
        } else {
          productosMap.set(key, {
            productoId: item.productId,
            nombreProducto: item.product?.nombre || item.nombreProducto || 'Desconocido',
            cantidadVendida: item.cantidad,
            totalVendido: Number(item.subtotal),
          });
        }
      });
    });

    const topProductos = Array.from(productosMap.values())
      .sort((a, b) => b.totalVendido - a.totalVendido)
      .slice(0, 10);

    // Top clientes
    const clientesMap = new Map<string, any>();
    ventas.forEach(venta => {
      const key = venta.clienteId || 'sin-cliente';
      const existing = clientesMap.get(key);
      if (existing) {
        existing.cantidadCompras += 1;
        existing.totalCompras += Number(venta.total);
      } else {
        clientesMap.set(key, {
          clienteId: venta.clienteId || 'sin-cliente',
          nombreCliente: venta.cliente?.razonSocial || 'Cliente general',
          cantidadCompras: 1,
          totalCompras: Number(venta.total),
        });
      }
    });

    const topClientes = Array.from(clientesMap.values())
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 10);

    // Top vendedores
    const vendedoresMap = new Map<string, any>();
    ventas.forEach(venta => {
      const key = venta.usuarioId;
      const existing = vendedoresMap.get(key);
      const nombre = `${venta.usuario?.firstName || ''} ${venta.usuario?.lastName || ''}`.trim() || 'Usuario';
      if (existing) {
        existing.cantidadVentas += 1;
        existing.totalVentas += Number(venta.total);
      } else {
        vendedoresMap.set(key, {
          usuarioId: venta.usuarioId,
          nombreVendedor: nombre,
          cantidadVentas: 1,
          totalVentas: Number(venta.total),
        });
      }
    });

    const ventasPorVendedor = Array.from(vendedoresMap.values())
      .sort((a, b) => b.totalVentas - a.totalVentas)
      .slice(0, 10);

    return {
      resumen: {
        totalVentas: ventasTotal,
        cantidadVentas: totalVentas,
        ticketPromedio: promedioVenta,
        ventasMayor,
        ventasMenor,
      },
      ventasPorDia,
      ventasPorMetodoPago,
      ventasPorComprobante,
      topProductos,
      topClientes,
      ventasPorVendedor,
    };
  }

  /**
   * REPORTE DE COMPRAS
   */
  async getReporteCompras(filtros: ReporteFiltros): Promise<ComprasReporte> {
    const whereClause: any = {};
    if (filtros.fechaInicio && filtros.fechaFin) {
      whereClause.fechaEmision = {
        gte: new Date(filtros.fechaInicio),
        lte: new Date(filtros.fechaFin),
      };
    }

    const compras = await prisma.purchase.findMany({
      where: whereClause,
      include: { 
        items: { include: { product: true } }
      },
    });

    const totalCompras = compras.length;
    const comprasTotal = compras.reduce((sum, c) => sum + Number(c.total), 0);
    const compraMayor = totalCompras > 0 ? Math.max(...compras.map(c => Number(c.total))) : 0;
    const compraMenor = totalCompras > 0 ? Math.min(...compras.map(c => Number(c.total))) : 0;

    const comprasPorDiaMap = new Map<string, { cantidad: number; total: number }>();
    compras.forEach(c => {
      const fecha = c.fechaEmision.toISOString().split('T')[0] || '';
      const current = comprasPorDiaMap.get(fecha);
      comprasPorDiaMap.set(fecha, {
        cantidad: (current?.cantidad || 0) + 1,
        total: (current?.total || 0) + Number(c.total)
      });
    });

    const comprasPorDia = Array.from(comprasPorDiaMap.entries()).map(([fecha, data]) => ({
      fecha,
      cantidad: data.cantidad,
      total: data.total
    })).sort((a, b) => a.fecha.localeCompare(b.fecha));

    // Top productos comprados
    const productosMap = new Map<string, any>();
    compras.forEach(compra => {
      compra.items.forEach((item: any) => {
        const key = item.productCodigo;
        const existing = productosMap.get(key);
        if (existing) {
          existing.cantidadComprada += item.cantidad;
          existing.totalComprado += Number(item.subtotal);
        } else {
          productosMap.set(key, {
            productoId: item.productCodigo,
            nombreProducto: item.product?.nombre || item.nombreProducto || 'Desconocido',
            cantidadComprada: item.cantidad,
            totalComprado: Number(item.subtotal),
          });
        }
      });
    });

    const topProductosComprados = Array.from(productosMap.values())
      .sort((a, b) => b.totalComprado - a.totalComprado)
      .slice(0, 10);

    // Obtener proveedores únicos de las compras y consultar sus datos reales
    const proveedorIds = [...new Set(compras.map(c => c.proveedorId).filter(Boolean))];
    const proveedoresData = await prisma.client.findMany({
      where: {
        id: { in: proveedorIds }
      },
      select: {
        id: true,
        razonSocial: true,
        nombres: true,
        apellidos: true,
        numeroDocumento: true,
        tipoDocumento: true
      }
    });

    // Mapear proveedores
    const proveedoresMap = new Map(proveedoresData.map(p => [p.id, p]));

    // Agrupar compras por proveedor
    const comprasPorProveedorMap = new Map<string, { cantidadCompras: number; totalCompras: number }>();
    compras.forEach(c => {
      const key = c.proveedorId || 'sin-proveedor';
      const current = comprasPorProveedorMap.get(key);
      comprasPorProveedorMap.set(key, {
        cantidadCompras: (current?.cantidadCompras || 0) + 1,
        totalCompras: (current?.totalCompras || 0) + Number(c.total)
      });
    });

    const comprasPorProveedor = Array.from(comprasPorProveedorMap.entries()).map(([provId, data]) => {
      const prov = proveedoresMap.get(provId);
      const nombreProveedor = prov?.razonSocial || `${prov?.nombres || ''} ${prov?.apellidos || ''}`.trim() || 'Proveedor sin nombre';
      return {
        proveedorId: provId,
        nombreProveedor,
        cantidadCompras: data.cantidadCompras,
        totalCompras: data.totalCompras,
        porcentaje: comprasTotal > 0 ? (data.totalCompras / comprasTotal) * 100 : 0
      };
    }).sort((a, b) => b.totalCompras - a.totalCompras);

    // Compras por almacén
    const comprasPorAlmacenMap = new Map<string, { cantidadCompras: number; totalCompras: number }>();
    compras.forEach(c => {
      const key = c.almacenId || 'sin-almacen';
      const current = comprasPorAlmacenMap.get(key);
      comprasPorAlmacenMap.set(key, {
        cantidadCompras: (current?.cantidadCompras || 0) + 1,
        totalCompras: (current?.totalCompras || 0) + Number(c.total)
      });
    });

    // Obtener nombres de almacenes
    const almacenIds = [...comprasPorAlmacenMap.keys()].filter(id => id !== 'sin-almacen');
    const almacenesData = await prisma.warehouse.findMany({
      where: { id: { in: almacenIds } },
      select: { id: true, nombre: true }
    });
    const almacenesMap = new Map(almacenesData.map(a => [a.id, a.nombre]));

    const comprasPorAlmacen = Array.from(comprasPorAlmacenMap.entries()).map(([almId, data]) => ({
      almacenId: almId,
      nombreAlmacen: almacenesMap.get(almId) || 'Sin almacén',
      cantidadCompras: data.cantidadCompras,
      totalCompras: data.totalCompras,
      porcentaje: comprasTotal > 0 ? (data.totalCompras / comprasTotal) * 100 : 0
    }));

    // Compras por estado
    const comprasPorEstadoMap = new Map<string, { cantidad: number; total: number }>();
    compras.forEach(c => {
      const estado = c.estado || 'Sin estado';
      const current = comprasPorEstadoMap.get(estado);
      comprasPorEstadoMap.set(estado, {
        cantidad: (current?.cantidad || 0) + 1,
        total: (current?.total || 0) + Number(c.total)
      });
    });

    const comprasPorEstado = Array.from(comprasPorEstadoMap.entries()).map(([estado, data]) => ({
      estado,
      cantidad: data.cantidad,
      total: data.total,
      porcentaje: comprasTotal > 0 ? (data.total / comprasTotal) * 100 : 0
    }));

    return {
      resumen: {
        totalCompras: comprasTotal,
        cantidadCompras: totalCompras,
        compraPromedio: totalCompras > 0 ? comprasTotal / totalCompras : 0,
        comprasMayor: compraMayor,
        comprasMenor: compraMenor,
      },
      comprasPorDia,
      comprasPorProveedor,
      comprasPorAlmacen,
      topProductosComprados,
      comprasPorEstado,
    };
  }

  /**
   * REPORTE DE INVENTARIO
   */
  async getReporteInventario(filtros: ReporteFiltros): Promise<InventarioReporte> {
    // 1. Obtener todos los productos con sus datos básicos
    const productos = await prisma.product.findMany({
      select: {
        id: true,
        nombre: true,
        stock: true,
        precioVenta: true,
        estado: true,
        minStock: true,
        categoria: true
      }
    });

    const totalProductos = productos.length;
    const productosActivos = productos.filter(p => p.estado).length;

    // Calcular valor total del inventario (Stock * Precio Venta)
    // NOTA: Idealmente sería Costo, pero usamos Precio Venta por ahora
    const valorTotalInventario = productos.reduce((sum, p) => sum + (p.stock * Number(p.precioVenta)), 0);

    // 2. Obtener stock por almacén usando stockByWarehouses
    const stockPorAlmacen = await prisma.stockByWarehouse.groupBy({
      by: ['warehouseId'],
      _sum: {
        quantity: true
      }
    });

    // Obtener nombres de almacenes y calcular valores
    const almacenesIds = stockPorAlmacen.map(s => s.warehouseId);
    const almacenesData = await prisma.warehouse.findMany({
      where: { id: { in: almacenesIds } },
      select: {
        id: true,
        nombre: true,
        stockByWarehouses: {
          include: { product: true }
        }
      }
    });

    const stockPorAlmacenDetallado = almacenesData.map(almacen => {
      const valorInventario = almacen.stockByWarehouses.reduce(
        (sum, s) => sum + (s.quantity * Number(s.product.precioVenta)),
        0
      );
      const cantidadProductos = almacen.stockByWarehouses.reduce(
        (sum, s) => sum + s.quantity,
        0
      );
      const productosEnAlerta = almacen.stockByWarehouses.filter(
        s => s.minStock && s.quantity <= s.minStock
      ).length;

      return {
        almacenId: almacen.id,
        nombreAlmacen: almacen.nombre,
        cantidadProductos,
        valorInventario,
        productosEnAlerta
      };
    });

    // 3. Productos en alerta (stock bajo)
    const productosEnAlertaDetalle = productos
      .filter(p => p.minStock && p.stock <= p.minStock)
      .map(p => ({
        productoId: p.id,
        nombreProducto: p.nombre,
        stockActual: p.stock,
        stockMinimo: p.minStock || 0,
        stockMaximo: 0, // No implementado a\u00fan
        almacenId: 'general',
        nombreAlmacen: 'General'
      }))
      .sort((a, b) => a.stockActual - b.stockActual);

    const productosConStock = productos.filter(p => p.stock > 0).length;
    const productosSinStock = productos.filter(p => p.stock <= 0).length;
    const productosEnAlerta = productosEnAlertaDetalle.length;

    // 3. Calcular rotación (basado en ventas recientes)
    // Top 10 productos con más movimiento en ventas
    const ventasRecientes = await prisma.saleItem.groupBy({
      by: ['productId'],
      _sum: {
        cantidad: true
      },
      orderBy: {
        _sum: {
          cantidad: 'desc'
        }
      },
      take: 10
    });

    // Mapear IDs a nombres
    const productosMasRotacion = await Promise.all(ventasRecientes.map(async (v) => {
      const prod = productos.find(p => p.id === v.productId);
      const stockActual = prod?.stock || 0;
      const precioVenta = Number(prod?.precioVenta || 0);
      return {
        productoId: v.productId,
        nombreProducto: prod?.nombre || 'Desconocido',
        cantidadMovimientos: v._sum.cantidad || 0,
        stockActual,
        valorStock: stockActual * precioVenta
      };
    }));

    // 4. Valor por categoría
    const valorPorCategoriaMap = new Map<string, { cantidad: number; valor: number }>();
    productos.forEach(p => {
      const cat = p.categoria || 'Sin Categoría';
      const val = p.stock * Number(p.precioVenta);
      const current = valorPorCategoriaMap.get(cat);
      valorPorCategoriaMap.set(cat, {
        cantidad: (current?.cantidad || 0) + 1,
        valor: (current?.valor || 0) + val
      });
    });

    const totalValor = Array.from(valorPorCategoriaMap.values()).reduce((sum, v) => sum + v.valor, 0);
    const valorPorCategoria = Array.from(valorPorCategoriaMap.entries()).map(([categoria, data]) => ({
      categoria,
      cantidadProductos: data.cantidad,
      valorTotal: data.valor,
      porcentaje: totalValor > 0 ? (data.valor / totalValor) * 100 : 0
    })).sort((a, b) => b.valorTotal - a.valorTotal);

    return {
      resumen: {
        totalProductos,
        productosActivos,
        productosInactivos: totalProductos - productosActivos,
        valorTotalInventario,
        productosConStock,
        productosSinStock,
        productosEnAlerta,
      },
      stockPorAlmacen: stockPorAlmacenDetallado,
      productosMasRotacion,
      productosEnAlerta: productosEnAlertaDetalle,
      valorPorCategoria,
      movimientosRecientes: [], // Se puede implementar con InventoryMovement
    };
  }

  /**
   * REPORTE FINANCIERO
   */
  async getReporteFinanciero(filtros: ReporteFiltros): Promise<FinancieroReporte> {
    const whereClause: any = {};
    if (filtros.fechaInicio && filtros.fechaFin) {
      whereClause.fechaEmision = {
        gte: new Date(filtros.fechaInicio),
        lte: new Date(filtros.fechaFin),
      };
    }

    // Obtener Ventas y Compras
    const ventas = await prisma.sale.findMany({ where: whereClause });
    const compras = await prisma.purchase.findMany({ where: whereClause });

    // Calcular totales
    const totalIngresos = ventas
      .filter(v => v.estado !== 'Cancelada')
      .reduce((s, v) => s + Number(v.total), 0);

    const totalEgresos = compras
      .filter(c => c.estado !== 'Cancelada')
      .reduce((s, c) => s + Number(c.total), 0);

    const utilidadBruta = totalIngresos - totalEgresos;

    // Cuentas por cobrar/pagar
    const ventasPorCobrar = ventas
      .filter(v => v.estado === 'Pendiente')
      .reduce((s, v) => s + (Number(v.total) - Number(v.montoRecibido || 0)), 0);

    const comprasPorPagar = compras
      .filter(c => c.estado === 'Pendiente')
      .reduce((s, c) => s + Number(c.total), 0);

    // Flujo por día (Ingresos vs Egresos)
    const flujoMap = new Map<string, { ingresos: number; egresos: number }>();

    ventas.forEach(v => {
      if (v.estado === 'Cancelada') return;
      const fecha = v.fechaEmision.toISOString().split('T')[0] || '';
      const current = flujoMap.get(fecha);
      flujoMap.set(fecha, {
        ingresos: (current?.ingresos || 0) + Number(v.total),
        egresos: current?.egresos || 0
      });
    });

    compras.forEach(c => {
      if (c.estado === 'Cancelada') return;
      const fecha = c.fechaEmision.toISOString().split('T')[0] || '';
      const current = flujoMap.get(fecha);
      flujoMap.set(fecha, {
        ingresos: current?.ingresos || 0,
        egresos: (current?.egresos || 0) + Number(c.total)
      });
    });

    const flujoEfectivo = Array.from(flujoMap.entries())
      .map(([fecha, data]) => ({
        fecha,
        ingresos: data.ingresos,
        egresos: data.egresos,
        saldo: data.ingresos - data.egresos
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const ingresosPorDia = flujoEfectivo.map(f => ({
      fecha: f.fecha,
      ventas: f.ingresos,
      otrosIngresos: 0,
      total: f.ingresos
    }));

    const egresosPorDia = flujoEfectivo.map(f => ({
      fecha: f.fecha,
      compras: f.egresos,
      otrosEgresos: 0,
      total: f.egresos
    }));

    return {
      resumen: {
        totalIngresos,
        totalEgresos,
        utilidadBruta,
        margenBruto: totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0,
        ventasPorCobrar,
        comprasPorPagar,
      },
      ingresosPorDia,
      egresosPorDia,
      flujoEfectivo,
      ingresosPorConcepto: [],
      egresosPorConcepto: [],
    };
  }

  /**
   * REPORTE DE CAJA
   */
  async getReporteCaja(filtros: ReporteFiltros): Promise<CajaReporte> {
    const whereClause: any = {};
    if (filtros.fechaInicio && filtros.fechaFin) {
      whereClause.fechaApertura = {
        gte: new Date(filtros.fechaInicio),
        lte: new Date(filtros.fechaFin),
      };
    }

    // 1. Obtener Sesiones de Caja
    const sesiones = await prisma.cashSession.findMany({
      where: whereClause,
      include: {
        cashRegister: true,
        user: true
      }
    });

    const cajasAbiertas = sesiones.filter(s => s.estado === 'Abierta').length;
    const cajasCerradas = sesiones.filter(s => s.estado === 'Cerrada').length;

    // 2. Obtener Movimientos de Caja (Ingresos/Egresos manuales + Ventas)
    // Nota: Para simplificar, sumaremos las ventas del periodo
    const ventasWhere: any = {};
    if (filtros.fechaInicio && filtros.fechaFin) {
      ventasWhere.fechaEmision = {
        gte: new Date(filtros.fechaInicio),
        lte: new Date(filtros.fechaFin),
      };
    }
    const ventas = await prisma.sale.findMany({ where: ventasWhere });

    const efectivo = ventas.filter(v => v.formaPago === 'Efectivo').reduce((s, v) => s + Number(v.total), 0);
    const tarjeta = ventas.filter(v => v.formaPago === 'Tarjeta').reduce((s, v) => s + Number(v.total), 0);
    const transferencia = ventas.filter(v => v.formaPago === 'Transferencia').reduce((s, v) => s + Number(v.total), 0);
    const yape = ventas.filter(v => v.formaPago === 'Yape').reduce((s, v) => s + Number(v.total), 0);
    const plin = ventas.filter(v => v.formaPago === 'Plin').reduce((s, v) => s + Number(v.total), 0);

    const totalGeneral = efectivo + tarjeta + transferencia + yape + plin;

    const movimientosPorMetodo = [
      { metodoPago: 'Efectivo', cantidadTransacciones: ventas.filter(v => v.formaPago === 'Efectivo').length, montoTotal: efectivo, porcentaje: totalGeneral > 0 ? (efectivo / totalGeneral) * 100 : 0 },
      { metodoPago: 'Tarjeta', cantidadTransacciones: ventas.filter(v => v.formaPago === 'Tarjeta').length, montoTotal: tarjeta, porcentaje: totalGeneral > 0 ? (tarjeta / totalGeneral) * 100 : 0 },
      { metodoPago: 'Transferencia', cantidadTransacciones: ventas.filter(v => v.formaPago === 'Transferencia').length, montoTotal: transferencia, porcentaje: totalGeneral > 0 ? (transferencia / totalGeneral) * 100 : 0 },
      { metodoPago: 'Yape', cantidadTransacciones: ventas.filter(v => v.formaPago === 'Yape').length, montoTotal: yape, porcentaje: totalGeneral > 0 ? (yape / totalGeneral) * 100 : 0 },
      { metodoPago: 'Plin', cantidadTransacciones: ventas.filter(v => v.formaPago === 'Plin').length, montoTotal: plin, porcentaje: totalGeneral > 0 ? (plin / totalGeneral) * 100 : 0 },
    ].filter(m => m.montoTotal > 0);

    // Ventas por hora
    const ventasPorHoraMap = new Array(24).fill(0).map(() => ({ cantidad: 0, total: 0 }));
    ventas.forEach(v => {
      const hora = v.fechaEmision.getHours();
      if (ventasPorHoraMap[hora]) {
        ventasPorHoraMap[hora].cantidad++;
        ventasPorHoraMap[hora].total += Number(v.total);
      }
    });

    const ventasPorHora = ventasPorHoraMap.map((data, hora) => ({
      hora,
      cantidadVentas: data.cantidad,
      montoTotal: data.total
    }));

    return {
      resumen: {
        cajasAbiertas,
        cajasCerradas,
        totalEfectivo: efectivo,
        totalTarjeta: tarjeta,
        totalTransferencia: transferencia,
        totalOtros: yape + plin,
        totalGeneral,
      },
      movimientosPorCaja: sesiones.map(s => ({
        cajaId: s.cashRegisterId,
        nombreCaja: s.cashRegister?.nombre || 'Caja',
        usuarioId: s.userId,
        nombreUsuario: `${s.user?.firstName || ''} ${s.user?.lastName || ''}`.trim() || 'Usuario',
        montoApertura: Number(s.montoApertura || 0),
        totalIngresos: Number(s.totalVentas || 0),
        totalEgresos: 0,
        montoCierre: Number(s.montoCierre || 0),
        estado: s.estado,
        fechaApertura: s.fechaApertura.toISOString(),
        fechaCierre: s.fechaCierre?.toISOString()
      })),
      movimientosPorMetodo,
      ventasPorHora,
    };
  }

  /**
   * PRODUCTOS MÁS VENDIDOS
   */
  async getProductosMasVendidos(filtros: ReporteFiltros): Promise<ProductosVendidosReporte> {
    const whereClause: any = {};
    if (filtros.fechaInicio && filtros.fechaFin) {
      whereClause.fechaEmision = {
        gte: new Date(filtros.fechaInicio),
        lte: new Date(filtros.fechaFin),
      };
    }

    const ventas = await prisma.sale.findMany({
      where: whereClause,
      include: { items: { include: { product: true } } },
      take: 50,
    });

    const productosMap = new Map<string, any>();
    ventas.forEach(venta => {
      venta.items.forEach((item: any) => {
        const key = item.productId;
        const existing = productosMap.get(key);
        if (existing) {
          existing.cantidadVendida += item.cantidad;
          existing.totalVentas += Number(item.subtotal);
        } else {
          productosMap.set(key, {
            productoId: item.productId,
            nombreProducto: item.product?.nombre || 'Desconocido',
            cantidadVendida: item.cantidad,
            totalVentas: Number(item.subtotal),
            precioPromedio: Number(item.precioUnitario),
            ultimaVenta: venta.fechaEmision,
          });
        }
      });
    });

    const productos = Array.from(productosMap.values())
      .sort((a, b) => b.totalVentas - a.totalVentas)
      .slice(0, 50);

    return {
      productos,
      periodo: {
        fechaInicio: filtros.fechaInicio || '',
        fechaFin: filtros.fechaFin || '',
      },
      total: productos.length,
      page: 1,
      limit: 50,
    };
  }
}

export default new ReportesService();
