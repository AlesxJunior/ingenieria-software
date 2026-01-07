const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analizarImpacto() {
  console.log('\n📊 ===== ANÁLISIS DE IMPACTO: Cambios en Motivos =====\n');

  try {
    // 1. Contar movimientos por motivo
    console.log('🔍 Analizando uso de cada motivo en movimientos históricos...\n');
    
    const motivos = await prisma.movementReason.findMany({
      include: {
        _count: {
          select: {
            inventoryMovements: true
          }
        }
      },
      orderBy: [
        { tipo: 'asc' },
        { codigo: 'asc' }
      ]
    });

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  MOTIVOS ACTUALES Y SU USO EN MOVIMIENTOS                      ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    let tipoActual = '';
    let totalMovimientos = 0;

    motivos.forEach(m => {
      if (m.tipo !== tipoActual) {
        if (tipoActual !== '') console.log('');
        console.log(`\n📦 ${m.tipo}`);
        console.log('─'.repeat(60));
        tipoActual = m.tipo;
      }

      const cantMov = m._count.inventoryMovements;
      totalMovimientos += cantMov;

      const emoji = cantMov === 0 ? '⚪' : cantMov < 10 ? '🟢' : '🔴';
      const estado = m.activo ? '✅' : '❌';
      
      console.log(`${emoji} [${m.codigo}] ${m.nombre}`);
      console.log(`   Movimientos: ${cantMov} | Activo: ${estado}`);
    });

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 TOTAL DE MOVIMIENTOS: ${totalMovimientos}`);
    console.log('═'.repeat(60) + '\n');

    // 2. Identificar motivos para cambiar
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  IMPACTO DE CAMBIOS PROPUESTOS                                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const motivosAfectados = [
      'AJUSTE_ENTRADA',
      'AJUSTE_SALIDA', 
      'MERMA',
      'AJU-CORRECCION',
      'AJU-DANIO',
      'AJU-ERROR'
    ];

    console.log('🔴 Motivos que serán MODIFICADOS/ELIMINADOS:\n');

    for (const codigo of motivosAfectados) {
      const motivo = motivos.find(m => m.codigo === codigo);
      if (motivo) {
        const cantMov = motivo._count.inventoryMovements;
        const impacto = cantMov === 0 ? '✅ BAJO' : cantMov < 10 ? '⚠️  MEDIO' : '🔴 ALTO';
        
        console.log(`${impacto} [${codigo}]`);
        console.log(`   Nombre: ${motivo.nombre}`);
        console.log(`   Tipo actual: ${motivo.tipo}`);
        console.log(`   Movimientos afectados: ${cantMov}`);
        console.log('');
      }
    }

    // 3. Resumen de acciones
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  ACCIONES RECOMENDADAS                                         ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const ajusteEntrada = motivos.find(m => m.codigo === 'AJUSTE_ENTRADA');
    const ajusteSalida = motivos.find(m => m.codigo === 'AJUSTE_SALIDA');
    const merma = motivos.find(m => m.codigo === 'MERMA');
    const ajuCorreccion = motivos.find(m => m.codigo === 'AJU-CORRECCION');
    const ajuDanio = motivos.find(m => m.codigo === 'AJU-DANIO');
    const ajuError = motivos.find(m => m.codigo === 'AJU-ERROR');

    console.log('📝 FASE 1: Cambios Seguros (No afectan datos)');
    console.log('─'.repeat(60));
    console.log('✅ Crear nuevo motivo: AJU-SISTEMA');
    console.log('✅ Crear nuevo motivo: AJU-MERMA (unificado)');
    console.log('✅ Renombrar códigos para seguir convención (ENT-*, SAL-*, AJU-*)');
    console.log('');

    console.log('📝 FASE 2: Migración de Datos');
    console.log('─'.repeat(60));
    
    if (ajusteEntrada && ajusteEntrada._count.inventoryMovements > 0) {
      console.log(`⚠️  Migrar ${ajusteEntrada._count.inventoryMovements} movimientos de AJUSTE_ENTRADA → AJU-CONTEO`);
    } else {
      console.log('✅ AJUSTE_ENTRADA: Sin movimientos, eliminar directamente');
    }

    if (ajusteSalida && ajusteSalida._count.inventoryMovements > 0) {
      console.log(`⚠️  Migrar ${ajusteSalida._count.inventoryMovements} movimientos de AJUSTE_SALIDA → AJU-MERMA`);
    } else {
      console.log('✅ AJUSTE_SALIDA: Sin movimientos, eliminar directamente');
    }

    if (merma && merma._count.inventoryMovements > 0) {
      console.log(`🔴 Migrar ${merma._count.inventoryMovements} movimientos de MERMA (SALIDA) → AJU-MERMA (AJUSTE)`);
      console.log('   ⚠️  Requiere cambiar tipo de movimiento: SALIDA → AJUSTE');
    } else {
      console.log('✅ MERMA: Sin movimientos, reclasificar directamente');
    }

    if (ajuCorreccion && ajuCorreccion._count.inventoryMovements > 0) {
      console.log(`⚠️  Migrar ${ajuCorreccion._count.inventoryMovimientos} movimientos de AJU-CORRECCION → AJU-CONTEO`);
    } else {
      console.log('✅ AJU-CORRECCION: Sin movimientos, eliminar directamente');
    }

    if (ajuDanio && ajuDanio._count.inventoryMovements > 0) {
      console.log(`⚠️  Migrar ${ajuDanio._count.inventoryMovements} movimientos de AJU-DANIO → AJU-MERMA`);
    } else {
      console.log('✅ AJU-DANIO: Sin movimientos, renombrar directamente');
    }

    if (ajuError && ajuError._count.inventoryMovements > 0) {
      console.log(`⚠️  Renombrar ${ajuError._count.inventoryMovements} movimientos de AJU-ERROR → AJU-CONTEO`);
    } else {
      console.log('✅ AJU-ERROR: Sin movimientos, renombrar directamente');
    }

    console.log('');

    console.log('📝 FASE 3: Desactivar Obsoletos');
    console.log('─'.repeat(60));
    console.log('✅ Desactivar (NO eliminar) motivos obsoletos para mantener historial');
    console.log('');

    // 4. Verificar si hay productos con fechaVencimiento
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║  VERIFICACIÓN: ¿Sistema usa fechaVencimiento?                  ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const recepcionesConVencimiento = await prisma.purchaseReceiptItem.count({
      where: {
        fechaVencimiento: { not: null }
      }
    });

    if (recepcionesConVencimiento > 0) {
      console.log(`✅ SÍ: ${recepcionesConVencimiento} items de recepción tienen fechaVencimiento`);
      console.log('   → AJU-VENCIDO es NECESARIO y debe MANTENERSE');
    } else {
      console.log('⚪ NO: Ningún item de recepción tiene fechaVencimiento (aún)');
      console.log('   → AJU-VENCIDO es útil para futuro, mantener de todas formas');
    }

    console.log('\n' + '═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analizarImpacto();
