const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificacionFinal() {
  console.log('\n✅ ===== VERIFICACIÓN FINAL: REORGANIZACIÓN DE MOTIVOS =====\n');

  try {
    // 1. Verificar que tenemos exactamente 13 motivos activos
    const motivosActivos = await prisma.movementReason.count({
      where: { activo: true }
    });

    console.log('📊 Verificación 1: Cantidad de motivos activos');
    if (motivosActivos === 13) {
      console.log(`   ✅ CORRECTO: ${motivosActivos} motivos activos (esperado: 13)\n`);
    } else {
      console.log(`   ❌ ERROR: ${motivosActivos} motivos activos (esperado: 13)\n`);
      return;
    }

    // 2. Verificar distribución por tipo
    const porTipo = await prisma.movementReason.groupBy({
      by: ['tipo'],
      where: { activo: true },
      _count: true
    });

    console.log('📊 Verificación 2: Distribución por tipo');
    const distribucion = {};
    porTipo.forEach(g => {
      distribucion[g.tipo] = g._count;
    });

    const esperado = { ENTRADA: 4, SALIDA: 4, AJUSTE: 5 };
    let todoOk = true;

    Object.entries(esperado).forEach(([tipo, cant]) => {
      const actual = distribucion[tipo] || 0;
      if (actual === cant) {
        console.log(`   ✅ ${tipo}: ${actual} motivos (esperado: ${cant})`);
      } else {
        console.log(`   ❌ ${tipo}: ${actual} motivos (esperado: ${cant})`);
        todoOk = false;
      }
    });

    if (!todoOk) {
      console.log('\n❌ ERROR: Distribución incorrecta\n');
      return;
    }

    console.log('');

    // 3. Verificar que todos los códigos siguen la convención
    console.log('📊 Verificación 3: Convención de códigos');
    
    const motivosActivosDetalle = await prisma.movementReason.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { codigo: 'asc' }]
    });

    let convencionOk = true;
    motivosActivosDetalle.forEach(m => {
      const prefijo = m.codigo.substring(0, 3);
      const esperadoPrefijo = m.tipo === 'ENTRADA' ? 'ENT' : m.tipo === 'SALIDA' ? 'SAL' : 'AJU';
      
      if (prefijo === esperadoPrefijo) {
        console.log(`   ✅ [${m.codigo}] ${m.nombre}`);
      } else {
        console.log(`   ❌ [${m.codigo}] ${m.nombre} (esperaba prefijo ${esperadoPrefijo}-*)`);
        convencionOk = false;
      }
    });

    if (!convencionOk) {
      console.log('\n⚠️  ADVERTENCIA: Algunos códigos no siguen la convención\n');
    } else {
      console.log('\n   ✅ Todos los códigos siguen la convención ENT-*, SAL-*, AJU-*\n');
    }

    // 4. Verificar motivos obsoletos desactivados
    console.log('📊 Verificación 4: Motivos obsoletos desactivados');
    
    const obsoletos = [
      'AJUSTE_ENTRADA',
      'AJUSTE_SALIDA',
      'MERMA',
      'AJU-CORRECCION',
      'AJU-DANIO'
    ];

    let todosInactivos = true;
    for (const codigo of obsoletos) {
      const motivo = await prisma.movementReason.findUnique({
        where: { codigo }
      });

      if (motivo && !motivo.activo) {
        console.log(`   ✅ ${codigo} está INACTIVO`);
      } else if (motivo && motivo.activo) {
        console.log(`   ❌ ${codigo} está ACTIVO (debería estar inactivo)`);
        todosInactivos = false;
      } else {
        console.log(`   ⚪ ${codigo} no existe (OK)`);
      }
    }

    if (!todosInactivos) {
      console.log('\n⚠️  ADVERTENCIA: Algunos motivos obsoletos siguen activos\n');
    } else {
      console.log('');
    }

    // 5. Verificar nuevos motivos creados
    console.log('📊 Verificación 5: Nuevos motivos creados');
    
    const ajuSistema = await prisma.movementReason.findUnique({
      where: { codigo: 'AJU-SISTEMA' }
    });

    const ajuMerma = await prisma.movementReason.findUnique({
      where: { codigo: 'AJU-MERMA' }
    });

    if (ajuSistema && ajuSistema.activo) {
      console.log(`   ✅ AJU-SISTEMA existe y está activo`);
    } else {
      console.log(`   ❌ AJU-SISTEMA no existe o está inactivo`);
      todoOk = false;
    }

    if (ajuMerma && ajuMerma.activo) {
      console.log(`   ✅ AJU-MERMA existe y está activo`);
    } else {
      console.log(`   ❌ AJU-MERMA no existe o está inactivo`);
      todoOk = false;
    }

    console.log('');

    // 6. Resumen final
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  RESUMEN FINAL                                                 ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    if (todoOk && convencionOk) {
      console.log('✅ ¡REORGANIZACIÓN VERIFICADA EXITOSAMENTE!\n');
      console.log('📋 Sistema de motivos:');
      console.log('   ✅ 13 motivos activos (4 ENTRADA, 4 SALIDA, 5 AJUSTE)');
      console.log('   ✅ 5 motivos obsoletos desactivados');
      console.log('   ✅ Convención ENT-*, SAL-*, AJU-* aplicada');
      console.log('   ✅ Nuevos motivos AJU-SISTEMA y AJU-MERMA creados');
      console.log('   ✅ Sin errores de clasificación (MERMA corregida)\n');
      
      console.log('🎯 Próximos pasos:');
      console.log('   1. Probar frontend: Alertas → "Ajustar Stock" → Verificar dropdown');
      console.log('   2. Exportar Excel del kardex → Verificar columna de motivos');
      console.log('   3. Actualizar documentación si hay referencias a códigos antiguos\n');
    } else {
      console.log('⚠️  VERIFICACIÓN COMPLETADA CON ADVERTENCIAS\n');
      console.log('   → Revisar mensajes anteriores para identificar problemas\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA VERIFICACIÓN:\n');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

verificacionFinal();
