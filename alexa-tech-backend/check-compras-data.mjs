/**
 * Verificar si existen datos de compras para el reporte
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCompras() {
  try {
    console.log('🔍 VERIFICANDO DATOS DE COMPRAS...\n');

    // Total de compras
    const totalCompras = await prisma.purchase.count();
    console.log(`📦 Total de compras en BD: ${totalCompras}`);

    // Compras recientes
    const compras = await prisma.purchase.findMany({
      take: 5,
      include: {
        items: { include: { product: true } },
        usuario: true
      },
      orderBy: { fechaEmision: 'desc' }
    });

    console.log(`\n📅 Compras recientes (últimas 5):`);
    for (const c of compras) {
      // Obtener proveedor manualmente
      const proveedor = await prisma.client.findUnique({
        where: { id: c.proveedorId },
        select: { razonSocial: true, nombres: true, apellidos: true }
      });
      
      const nombreProveedor = proveedor?.razonSocial || `${proveedor?.nombres || ''} ${proveedor?.apellidos || ''}`.trim() || 'Sin proveedor';
      
      console.log(`  - ID: ${c.id.substring(0, 10)}... | Fecha: ${c.fechaEmision.toISOString().split('T')[0]} | Total: S/. ${c.total}`);
      console.log(`    Proveedor: ${nombreProveedor} | Estado: ${c.estado || 'N/A'}`);
      console.log(`    Items: ${c.items.length} productos`);
    }

    // Rango de fechas
    const primera = await prisma.purchase.findFirst({
      orderBy: { fechaEmision: 'asc' }
    });
    
    const ultima = await prisma.purchase.findFirst({
      orderBy: { fechaEmision: 'desc' }
    });

    if (primera && ultima) {
      console.log(`\n📅 Rango de fechas disponible:`);
      console.log(`  Desde: ${primera.fechaEmision.toISOString().split('T')[0]}`);
      console.log(`  Hasta: ${ultima.fechaEmision.toISOString().split('T')[0]}`);
    }

    // Resumen
    const total = compras.reduce((sum, c) => sum + Number(c.total), 0);
    console.log(`\n💰 Resumen:`);
    console.log(`  Total compras (últimas 5): S/. ${total.toFixed(2)}`);
    console.log(`  Promedio: S/. ${(total / Math.max(compras.length, 1)).toFixed(2)}`);

    // Estados
    const estados = await prisma.purchase.groupBy({
      by: ['estado'],
      _count: true
    });

    console.log(`\n📋 Compras por estado:`);
    estados.forEach(e => {
      console.log(`  ${e.estado}: ${e._count} compras`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCompras();
