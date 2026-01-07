/**
 * Script de Migración: Recalcular diferencia en CashSessions
 * 
 * Propósito:
 * - Recalcular el campo diferencia de todas las sesiones de caja cerradas
 * - Considerar: montoApertura + totalVentas + ingresos - egresos
 * - Corregir datos históricos con diferencias incorrectas
 * 
 * Fórmula: diferencia = montoCierre - (montoApertura + totalVentas + ingresos - egresos)
 * 
 * Uso: node scripts/recalcular-diferencia-caja.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function recalcularDiferenciaCaja() {
  console.log('🔄 Iniciando recálculo de diferencias en sesiones de caja...\n');

  try {
    // Obtener solo sesiones CERRADAS
    const sessions = await prisma.cashSession.findMany({
      where: {
        estado: 'Cerrada',
      },
      include: {
        cashRegister: true,
      },
      orderBy: { fechaCierre: 'desc' },
    });

    console.log(`📊 Total de sesiones cerradas encontradas: ${sessions.length}\n`);

    const stats = [];
    let sesionesActualizadas = 0;
    let errores = 0;

    for (const session of sessions) {
      try {
        // Obtener movimientos de caja (ingresos y egresos)
        const movimientos = await prisma.cashMovement.findMany({
          where: {
            cashSessionId: session.id,
          },
        });

        // Calcular ingresos y egresos
        const totalIngresos = movimientos
          .filter(m => m.tipo === 'INGRESO')
          .reduce((sum, m) => sum + Number(m.monto), 0);

        const totalEgresos = movimientos
          .filter(m => m.tipo === 'EGRESO')
          .reduce((sum, m) => sum + Number(m.monto), 0);

        // Calcular monto esperado
        const montoEsperado = 
          Number(session.montoApertura) + 
          Number(session.totalVentas) + 
          totalIngresos - 
          totalEgresos;

        // Calcular diferencia real
        const montoCierre = Number(session.montoCierre || 0);
        const diferenciaCalculada = montoCierre - montoEsperado;
        const diferenciaActual = Number(session.diferencia || 0);

        // Guardar estadísticas
        stats.push({
          sessionId: session.id,
          codigoCaja: session.cashRegister?.nombre || session.cashRegisterId,
          fechaCierre: session.fechaCierre,
          montoApertura: Number(session.montoApertura),
          totalVentas: Number(session.totalVentas),
          totalIngresos,
          totalEgresos,
          montoEsperado,
          montoCierre,
          diferenciaActual,
          diferenciaCalculada,
          cambio: diferenciaCalculada - diferenciaActual,
          cantidadMovimientos: movimientos.length,
        });

        // Actualizar solo si hay diferencia
        if (Math.abs(diferenciaCalculada - diferenciaActual) > 0.01) {
          await prisma.cashSession.update({
            where: { id: session.id },
            data: { diferencia: diferenciaCalculada },
          });

          console.log(`✅ Sesión ${session.cashRegister?.nombre || session.id}:`);
          console.log(`   Fecha Cierre: ${session.fechaCierre?.toLocaleDateString()}`);
          console.log(`   Monto Apertura: S/ ${Number(session.montoApertura).toFixed(2)}`);
          console.log(`   Total Ventas: S/ ${Number(session.totalVentas).toFixed(2)}`);
          console.log(`   Ingresos: S/ ${totalIngresos.toFixed(2)}`);
          console.log(`   Egresos: S/ ${totalEgresos.toFixed(2)}`);
          console.log(`   Monto Esperado: S/ ${montoEsperado.toFixed(2)}`);
          console.log(`   Monto Cierre: S/ ${montoCierre.toFixed(2)}`);
          console.log(`   Diferencia Anterior: S/ ${diferenciaActual.toFixed(2)}`);
          console.log(`   Diferencia Nueva: S/ ${diferenciaCalculada.toFixed(2)}`);
          console.log(`   Cambio: S/ ${(diferenciaCalculada - diferenciaActual).toFixed(2)}\n`);

          sesionesActualizadas++;
        }
      } catch (error) {
        console.error(`❌ Error en sesión ${session.id}:`, error.message);
        errores++;
      }
    }

    // Resumen final
    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMEN DEL RECÁLCULO DE DIFERENCIAS');
    console.log('='.repeat(70));
    console.log(`Total sesiones cerradas: ${sessions.length}`);
    console.log(`Sesiones actualizadas: ${sesionesActualizadas}`);
    console.log(`Sesiones sin cambios: ${sessions.length - sesionesActualizadas - errores}`);
    console.log(`Errores: ${errores}`);

    // Análisis de diferencias
    const conSobrante = stats.filter(s => s.diferenciaCalculada > 0);
    const conFaltante = stats.filter(s => s.diferenciaCalculada < 0);
    const exactas = stats.filter(s => Math.abs(s.diferenciaCalculada) < 0.01);

    console.log(`\n📈 Análisis de Diferencias:`);
    console.log(`   Sobrantes (dinero de más): ${conSobrante.length}`);
    console.log(`   Faltantes (dinero de menos): ${conFaltante.length}`);
    console.log(`   Exactas (sin diferencia): ${exactas.length}`);

    // Diferencias significativas
    const diferenciasSignificativas = stats.filter(s => Math.abs(s.diferenciaCalculada) > 50);
    if (diferenciasSignificativas.length > 0) {
      console.log(`\n⚠️  Sesiones con diferencias > S/ 50: ${diferenciasSignificativas.length}`);
      diferenciasSignificativas.forEach(s => {
        const tipo = s.diferenciaCalculada > 0 ? 'Sobrante' : 'Faltante';
        console.log(`   - ${s.codigoCaja} (${s.fechaCierre?.toLocaleDateString()}): ${tipo} S/ ${Math.abs(s.diferenciaCalculada).toFixed(2)}`);
      });
    }

    // Resumen de movimientos
    const totalMovimientos = stats.reduce((sum, s) => sum + s.cantidadMovimientos, 0);
    console.log(`\n💰 Totales Generales:`);
    console.log(`   Total Ingresos: S/ ${stats.reduce((sum, s) => sum + s.totalIngresos, 0).toFixed(2)}`);
    console.log(`   Total Egresos: S/ ${stats.reduce((sum, s) => sum + s.totalEgresos, 0).toFixed(2)}`);
    console.log(`   Total Movimientos: ${totalMovimientos}`);

    console.log('\n✅ Migración completada exitosamente');

  } catch (error) {
    console.error('\n❌ Error fatal en la migración:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
recalcularDiferenciaCaja()
  .then(() => {
    console.log('\n👋 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script terminado con errores:', error);
    process.exit(1);
  });
