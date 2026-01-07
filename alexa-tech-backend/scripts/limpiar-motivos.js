const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limpiarMotivos() {
  console.log('\n🔍 ===== ANÁLISIS Y LIMPIEZA DE MOTIVOS =====\n');

  try {
    // 1. Ver todos los motivos actuales
    const todos = await prisma.movementReason.findMany({
      orderBy: [{ tipo: 'asc' }, { codigo: 'asc' }]
    });

    console.log('📋 MOTIVOS ACTUALES EN BASE DE DATOS:\n');
    todos.forEach((m, i) => {
      const estado = m.activo ? '✅ ACTIVO' : '❌ INACTIVO';
      console.log(`${i + 1}. [${m.codigo}] ${m.nombre}`);
      console.log(`   Tipo: ${m.tipo} | ${estado}`);
    });

    console.log(`\n📊 Total: ${todos.length} motivos\n`);
    console.log('─'.repeat(60) + '\n');

    // 2. Definir los 13 motivos que DEBEN existir y estar activos
    const motivosEsperados = [
      // ENTRADA (4)
      { codigo: 'ENT-COMPRA', tipo: 'ENTRADA' },
      { codigo: 'ENT-DEVOLUCION', tipo: 'ENTRADA' },
      { codigo: 'ENT-PRODUCCION', tipo: 'ENTRADA' },
      { codigo: 'ENT-TRANSFERENCIA', tipo: 'ENTRADA' },
      
      // SALIDA (4)
      { codigo: 'SAL-VENTA', tipo: 'SALIDA' },
      { codigo: 'SAL-DEVOLUCION', tipo: 'SALIDA' },
      { codigo: 'SAL-TRANSFERENCIA', tipo: 'SALIDA' },
      { codigo: 'SAL-CONSUMO', tipo: 'SALIDA' },
      
      // AJUSTE (5)
      { codigo: 'AJU-CONTEO', tipo: 'AJUSTE' },
      { codigo: 'AJU-MERMA', tipo: 'AJUSTE' },
      { codigo: 'AJU-VENCIDO', tipo: 'AJUSTE' },
      { codigo: 'AJU-ROBO', tipo: 'AJUSTE' },
      { codigo: 'AJU-SISTEMA', tipo: 'AJUSTE' },
    ];

    const codigosEsperados = motivosEsperados.map(m => m.codigo);

    // 3. Identificar motivos que NO deberían estar activos
    const paraDesactivar = todos.filter(m => 
      m.activo && !codigosEsperados.includes(m.codigo)
    );

    if (paraDesactivar.length > 0) {
      console.log('⚠️  MOTIVOS QUE SERÁN DESACTIVADOS:\n');
      paraDesactivar.forEach(m => {
        console.log(`   ❌ [${m.codigo}] ${m.nombre} (${m.tipo})`);
      });
      console.log('');

      // Desactivar
      for (const motivo of paraDesactivar) {
        await prisma.movementReason.update({
          where: { id: motivo.id },
          data: { activo: false }
        });
        console.log(`   ✅ Desactivado: ${motivo.codigo}`);
      }
      console.log('');
    } else {
      console.log('✅ No hay motivos extra para desactivar\n');
    }

    // 4. Identificar motivos que deberían estar activos pero no lo están
    const paraActivar = todos.filter(m => 
      !m.activo && codigosEsperados.includes(m.codigo)
    );

    if (paraActivar.length > 0) {
      console.log('⚠️  MOTIVOS QUE SERÁN ACTIVADOS:\n');
      paraActivar.forEach(m => {
        console.log(`   ✅ [${m.codigo}] ${m.nombre} (${m.tipo})`);
      });
      console.log('');

      // Activar
      for (const motivo of paraActivar) {
        await prisma.movementReason.update({
          where: { id: motivo.id },
          data: { activo: true }
        });
        console.log(`   ✅ Activado: ${motivo.codigo}`);
      }
      console.log('');
    } else {
      console.log('✅ Todos los motivos esperados ya están activos\n');
    }

    // 5. Verificación final
    console.log('─'.repeat(60) + '\n');
    console.log('📊 VERIFICACIÓN FINAL:\n');

    const activosFinales = await prisma.movementReason.findMany({
      where: { activo: true },
      orderBy: [{ tipo: 'asc' }, { codigo: 'asc' }]
    });

    const porTipo = {
      ENTRADA: activosFinales.filter(m => m.tipo === 'ENTRADA'),
      SALIDA: activosFinales.filter(m => m.tipo === 'SALIDA'),
      AJUSTE: activosFinales.filter(m => m.tipo === 'AJUSTE')
    };

    console.log('📦 ENTRADA (4 esperados):');
    porTipo.ENTRADA.forEach(m => console.log(`   ✅ [${m.codigo}] ${m.nombre}`));
    if (porTipo.ENTRADA.length !== 4) {
      console.log(`   ⚠️  ADVERTENCIA: ${porTipo.ENTRADA.length} motivos (esperados: 4)`);
    }

    console.log('\n📦 SALIDA (4 esperados):');
    porTipo.SALIDA.forEach(m => console.log(`   ✅ [${m.codigo}] ${m.nombre}`));
    if (porTipo.SALIDA.length !== 4) {
      console.log(`   ⚠️  ADVERTENCIA: ${porTipo.SALIDA.length} motivos (esperados: 4)`);
    }

    console.log('\n📦 AJUSTE (5 esperados):');
    porTipo.AJUSTE.forEach(m => console.log(`   ✅ [${m.codigo}] ${m.nombre}`));
    if (porTipo.AJUSTE.length !== 5) {
      console.log(`   ⚠️  ADVERTENCIA: ${porTipo.AJUSTE.length} motivos (esperados: 5)`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 TOTAL MOTIVOS ACTIVOS: ${activosFinales.length}`);
    console.log('═'.repeat(60) + '\n');

    if (activosFinales.length === 13 && 
        porTipo.ENTRADA.length === 4 && 
        porTipo.SALIDA.length === 4 && 
        porTipo.AJUSTE.length === 5) {
      console.log('🎉 ¡BASE DE DATOS LIMPIA Y CORRECTA!\n');
      console.log('✅ 13 motivos activos (4 ENTRADA + 4 SALIDA + 5 AJUSTE)');
      console.log('✅ Todos los motivos siguen la convención ENT-*, SAL-*, AJU-*\n');
    } else {
      console.log('⚠️  ADVERTENCIA: La base de datos NO coincide con lo esperado\n');
      console.log('   → Revisar manualmente los motivos\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:\n', error);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarMotivos();
