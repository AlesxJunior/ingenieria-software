/**
 * Script de prueba para reportes de ventas usando import
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testReportesVentas() {
  try {
    console.log('🔍 VERIFICANDO DATOS DE VENTAS EN LA BASE DE DATOS...\n');

    // 1. Verificar ventas
    const ventas = await prisma.sale.findMany({
      take: 5,
      include: {
        items: { include: { product: true } },
        cliente: true,
        usuario: true,
      },
      orderBy: { fechaEmision: 'desc' }
    });

    console.log(`📊 Total de ventas en BD: ${await prisma.sale.count()}`);
    console.log(`📅 Ventas recientes (últimas 5):`);
    ventas.forEach(v => {
      console.log(`  - ID: ${v.id} | Fecha: ${v.fechaEmision.toISOString().split('T')[0]} | Total: S/. ${v.total} | Estado: ${v.estado}`);
      console.log(`    Cliente: ${v.cliente?.razonSocial || 'N/A'} | Vendedor: ${v.usuario?.firstName || 'N/A'} ${v.usuario?.lastName || ''}`);
      console.log(`    Forma de pago: ${v.formaPago || 'No especificado'} | Comprobante: ${v.tipoComprobante}`);
      console.log(`    Items: ${v.items.length}`);
    });

    // 2. Obtener rango de fechas
    const primeraVenta = await prisma.sale.findFirst({
      orderBy: { fechaEmision: 'asc' },
      where: { estado: { notIn: ['Cancelada'] } }
    });
    
    const ultimaVenta = await prisma.sale.findFirst({
      orderBy: { fechaEmision: 'desc' },
      where: { estado: { notIn: ['Cancelada'] } }
    });

    console.log(`\n📅 Rango de fechas disponible:`);
    if (primeraVenta && ultimaVenta) {
      const fechaInicio = primeraVenta.fechaEmision.toISOString().split('T')[0];
      const fechaFin = ultimaVenta.fechaEmision.toISOString().split('T')[0];
      console.log(`  Desde: ${fechaInicio}`);
      console.log(`  Hasta: ${fechaFin}`);

      // 3. Simular llamada al servicio
      console.log(`\n🎯 Probando endpoint con fechas del sistema...`);
      
      const whereClause = {
        estado: { notIn: ['Cancelada'] },
        fechaEmision: {
          gte: primeraVenta.fechaEmision,
          lte: ultimaVenta.fechaEmision,
        }
      };

      const ventasEnRango = await prisma.sale.findMany({
        where: whereClause,
        include: {
          items: { include: { product: true } },
          cliente: true,
          usuario: true,
        },
      });

      console.log(`  ✅ Ventas encontradas: ${ventasEnRango.length}`);

      // 4. Calcular resumen
      const totalVentas = ventasEnRango.length;
      const ventasTotal = ventasEnRango.reduce((sum, v) => sum + Number(v.total), 0);
      const promedioVenta = totalVentas > 0 ? ventasTotal / totalVentas : 0;

      console.log(`\n📈 RESUMEN CALCULADO:`);
      console.log(`  Total ventas: S/. ${ventasTotal.toFixed(2)}`);
      console.log(`  Cantidad de ventas: ${totalVentas}`);
      console.log(`  Ticket promedio: S/. ${promedioVenta.toFixed(2)}`);

      // 5. Métodos de pago
      const efectivo = ventasEnRango.filter(v => v.formaPago === 'Efectivo').length;
      const tarjeta = ventasEnRango.filter(v => v.formaPago === 'Tarjeta').length;
      const otros = ventasEnRango.filter(v => !['Efectivo', 'Tarjeta'].includes(v.formaPago || '')).length;

      console.log(`\n💳 MÉTODOS DE PAGO:`);
      console.log(`  Efectivo: ${efectivo} ventas`);
      console.log(`  Tarjeta: ${tarjeta} ventas`);
      console.log(`  Otros/Sin especificar: ${otros} ventas`);

      // 6. Top productos
      const productosMap = new Map();
      ventasEnRango.forEach(venta => {
        venta.items.forEach(item => {
          const key = item.productId;
          const existing = productosMap.get(key);
          if (existing) {
            existing.cantidadVendida += item.cantidad;
            existing.totalVendido += Number(item.subtotal);
          } else {
            productosMap.set(key, {
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

      console.log(`\n🏆 TOP 10 PRODUCTOS MÁS VENDIDOS:`);
      topProductos.forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.nombreProducto}`);
        console.log(`     Cantidad: ${p.cantidadVendida} | Total: S/. ${p.totalVendido.toFixed(2)}`);
      });

    } else {
      console.log(`  ⚠️  No se encontraron ventas en el sistema`);
    }

    // 7. Verificar estados de ventas
    const ventasPorEstado = await prisma.sale.groupBy({
      by: ['estado'],
      _count: true
    });

    console.log(`\n📋 VENTAS POR ESTADO:`);
    ventasPorEstado.forEach(e => {
      console.log(`  ${e.estado}: ${e._count} ventas`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testReportesVentas();
