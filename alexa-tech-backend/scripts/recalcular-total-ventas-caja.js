/**
 * Script de Migración: Recalcular totalVentas en CashSessions
 * 
 * Uso: node scripts/recalcular-total-ventas-caja.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recalcularTotalVentas() {
  console.log('🔄 Iniciando recálculo de totalVentas en sesiones de caja...\n');

  try {
    // Obtener todas las sesiones de caja
    const sessions = await prisma.cashSession.findMany({
      include: {
        cashRegister: true,
      },
      orderBy: { fechaApertura: 'desc' },
    });

    console.log(`📊 Total de sesiones encontradas: ${sessions.length}\n`);

    const stats = [];
    let sesionesActualizadas = 0;
    let errores = 0;

    for (const session of sessions) {
      try {
        // Calcular total de ventas completadas (excluyendo NCs)
        const ventas = await prisma.sale.findMany({
          where: {
            cashSessionId: session.id,
            tipo: 'Venta',
            estado: 'Completada',
          },
        });

        const totalVentas = ventas.reduce((sum, venta) => {
          return sum + Number(venta.total);
        }, 0);

        // Calcular total de Notas de Crédito (reducen el total)
        const notasCredito = await prisma.sale.findMany({
          where: {
            tipo: 'NotaCredito',
            estado: 'Completada',
            saleOrigin: {
              cashSessionId: session.id,
            },
          },
        });

        const totalNotasCredito = notasCredito.reduce((sum, nc) => {
          return sum + Number(nc.total);
        }, 0);

        // Total neto = ventas - notas de crédito
        const totalVentasCalculado = totalVentas - totalNotasCredito;
        const totalVentasActual = Number(session.totalVentas);

        // Guardar estadísticas
        stats.push({
          sessionId: session.id,
          codigoCaja: session.cashRegister?.nombre || session.cashRegisterId,
          estado: session.estado,
          fechaApertura: session.fechaApertura,
          totalVentasActual,
          totalVentasCalculado,
          cantidadVentas: ventas.length,
          cantidadNotasCredito: notasCredito.length,
          diferencia: totalVentasCalculado - totalVentasActual,
        });

        // Actualizar solo si hay diferencia
        if (Math.abs(totalVentasCalculado - totalVentasActual) > 0.01) {
          await prisma.cashSession.update({
            where: { id: session.id },
            data: { totalVentas: totalVentasCalculado },
          });

          console.log(`✅ Sesión ${session.cashRegister?.nombre || session.id}:`);
          console.log(`   Fecha: ${session.fechaApertura.toLocaleDateString()}`);
          console.log(`   Ventas: ${ventas.length} | NCs: ${notasCredito.length}`);
          console.log(`   Antes: S/ ${totalVentasActual.toFixed(2)}`);
          console.log(`   Ahora: S/ ${totalVentasCalculado.toFixed(2)}`);
          console.log(`   Diff: S/ ${(totalVentasCalculado - totalVentasActual).toFixed(2)}\n`);

          sesionesActualizadas++;
        }
      } catch (error) {
        console.error(`❌ Error en sesión ${session.id}:`, error.message);
        errores++;
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DEL RECÁLCULO');
    console.log('='.repeat(60));
    console.log(`Total sesiones procesadas: ${sessions.length}`);
    console.log(`Sesiones actualizadas: ${sesionesActualizadas}`);
    console.log(`Sesiones sin cambios: ${sessions.length - sesionesActualizadas - errores}`);
    console.log(`Errores: ${errores}`);

    // Estadísticas por estado
    const sesionesAbiertas = stats.filter(s => s.estado === 'Abierta');
    const sesionesCerradas = stats.filter(s => s.estado === 'Cerrada');

    console.log(`\nSesiones Abiertas: ${sesionesAbiertas.length}`);
    console.log(`Sesiones Cerradas: ${sesionesCerradas.length}`);

    // Diferencias significativas
    const diferenciasSignificativas = stats.filter(s => Math.abs(s.diferencia) > 10);
    if (diferenciasSignificativas.length > 0) {
      console.log(`\n⚠️  Sesiones con diferencias > S/ 10: ${diferenciasSignificativas.length}`);
      diferenciasSignificativas.forEach(s => {
        console.log(`   - ${s.codigoCaja} (${s.fechaApertura.toLocaleDateString()}): S/ ${s.diferencia.toFixed(2)}`);
      });
    }

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('\n❌ Error fatal en la migración:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
recalcularTotalVentas()
  .then(() => {
    console.log('\n👋 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script terminado con errores:', error);
    process.exit(1);
  });
