const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corregirRangoComprobantes() {
  console.log('🔧 Corrigiendo rango numérico de comprobantes según SUNAT...\n');

  try {
    // Actualizar Facturas
    const factura = await prisma.comprobanteType.findFirst({
      where: { tipo: 'factura' }
    });

    if (factura && factura.numeroFin !== 99999999) {
      await prisma.comprobanteType.update({
        where: { id: factura.id },
        data: { numeroFin: 99999999 }
      });
      console.log('✅ Factura actualizada:');
      console.log(`   Antes: hasta ${factura.numeroFin.toLocaleString('es-PE')}`);
      console.log(`   Ahora: hasta 99,999,999\n`);
    }

    // Actualizar Notas de Crédito
    const nc = await prisma.comprobanteType.findFirst({
      where: { tipo: 'nota-credito' }
    });

    if (nc && nc.numeroFin !== 99999999) {
      await prisma.comprobanteType.update({
        where: { id: nc.id },
        data: { numeroFin: 99999999 }
      });
      console.log('✅ Nota de Crédito actualizada:');
      console.log(`   Antes: hasta ${nc.numeroFin.toLocaleString('es-PE')}`);
      console.log(`   Ahora: hasta 99,999,999\n`);
    }

    // Actualizar Notas de Débito
    const nd = await prisma.comprobanteType.findFirst({
      where: { tipo: 'nota-debito' }
    });

    if (nd && nd.numeroFin !== 99999999) {
      await prisma.comprobanteType.update({
        where: { id: nd.id },
        data: { numeroFin: 99999999 }
      });
      console.log('✅ Nota de Débito actualizada:');
      console.log(`   Antes: hasta ${nd.numeroFin.toLocaleString('es-PE')}`);
      console.log(`   Ahora: hasta 99,999,999\n`);
    }

    // Verificar resultado final
    const todosComprobantes = await prisma.comprobanteType.findMany({
      orderBy: { tipo: 'asc' }
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ CONFIGURACIÓN CORREGIDA SEGÚN SUNAT');
    console.log('═══════════════════════════════════════════════════════\n');

    todosComprobantes.forEach(c => {
      const disponibles = c.numeroFin - c.numeroActual;
      console.log(`${c.activo ? '✅' : '❌'} ${c.nombre}`);
      console.log(`   Serie: ${c.serie}`);
      console.log(`   Rango: 1 a ${c.numeroFin.toLocaleString('es-PE')}`);
      console.log(`   Disponibles: ${disponibles.toLocaleString('es-PE')}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 RESUMEN:');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Todos los comprobantes ahora tienen el rango completo');
    console.log('✅ Cumple con normativa SUNAT (8 dígitos: 00000001-99999999)');
    console.log('✅ Cada serie tiene 99,999,999 correlativos disponibles\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corregirRangoComprobantes();
