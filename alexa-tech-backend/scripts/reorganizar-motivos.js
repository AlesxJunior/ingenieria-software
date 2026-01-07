const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reorganizarMotivos() {
  console.log('\n🚀 ===== REORGANIZACIÓN DE MOTIVOS DE MOVIMIENTO =====\n');
  console.log('⏱️  Inicio: ' + new Date().toLocaleTimeString() + '\n');

  try {
    // ============================================
    // FASE 1: CREAR NUEVOS MOTIVOS
    // ============================================
    console.log('📝 FASE 1: Creando nuevos motivos...\n');

    // 1. Crear AJU-SISTEMA
    try {
      await prisma.movementReason.create({
        data: {
          tipo: 'AJUSTE',
          codigo: 'AJU-SISTEMA',
          nombre: 'Ajuste de sistema',
          descripcion: 'Corrección técnica por migración o integración de datos',
          requiereDocumento: false,
          activo: true,
        }
      });
      console.log('✅ Creado: AJU-SISTEMA');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⏭️  Ya existe: AJU-SISTEMA');
      } else {
        throw error;
      }
    }

    // 2. Crear AJU-MERMA (unificado)
    try {
      await prisma.movementReason.create({
        data: {
          tipo: 'AJUSTE',
          codigo: 'AJU-MERMA',
          nombre: 'Merma operativa',
          descripcion: 'Pérdida física por daño, deterioro, rotura o manipulación',
          requiereDocumento: false,
          activo: true,
        }
      });
      console.log('✅ Creado: AJU-MERMA');
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('⏭️  Ya existe: AJU-MERMA');
      } else {
        throw error;
      }
    }

    console.log('');

    // ============================================
    // FASE 2: RENOMBRAR CÓDIGOS PARA SEGUIR CONVENCIÓN
    // ============================================
    console.log('📝 FASE 2: Renombrando códigos a convención ENT-*, SAL-*, AJU-*...\n');

    const renombramientos = [
      // ENTRADA
      { old: 'COMPRA', new: 'ENT-COMPRA', nombre: 'Compra a proveedor' },
      { old: 'DEVOLUCION_CLIENTE', new: 'ENT-DEVOLUCION', nombre: 'Devolución de cliente' },
      { old: 'PRODUCCION', new: 'ENT-PRODUCCION', nombre: 'Producción interna' },
      { old: 'TRANSFERENCIA_ENTRADA', new: 'ENT-TRANSFERENCIA', nombre: 'Transferencia entre almacenes (entrada)' },
      
      // SALIDA
      { old: 'VENTA', new: 'SAL-VENTA', nombre: 'Venta a cliente' },
      { old: 'DEVOLUCION_PROVEEDOR', new: 'SAL-DEVOLUCION', nombre: 'Devolución a proveedor' },
      { old: 'TRANSFERENCIA_SALIDA', new: 'SAL-TRANSFERENCIA', nombre: 'Transferencia entre almacenes (salida)' },
      { old: 'CONSUMO_INTERNO', new: 'SAL-CONSUMO', nombre: 'Consumo interno' },
      
      // AJUSTE
      { old: 'AJU-ERROR', new: 'AJU-CONTEO', nombre: 'Error de conteo' },
    ];

    for (const { old, new: newCode, nombre } of renombramientos) {
      try {
        const motivo = await prisma.movementReason.findUnique({
          where: { codigo: old }
        });

        if (motivo) {
          await prisma.movementReason.update({
            where: { codigo: old },
            data: { codigo: newCode }
          });
          console.log(`✅ Renombrado: ${old} → ${newCode}`);
        } else {
          console.log(`⏭️  No existe: ${old} (probablemente ya renombrado)`);
        }
      } catch (error) {
        console.log(`⚠️  Error renombrando ${old}:`, error.message);
      }
    }

    console.log('');

    // ============================================
    // FASE 3: DESACTIVAR MOTIVOS OBSOLETOS
    // ============================================
    console.log('📝 FASE 3: Desactivando motivos obsoletos...\n');

    const motivosObsoletos = [
      'AJUSTE_ENTRADA',
      'AJUSTE_SALIDA',
      'MERMA',
      'AJU-CORRECCION',
      'AJU-DANIO'
    ];

    for (const codigo of motivosObsoletos) {
      try {
        const motivo = await prisma.movementReason.findUnique({
          where: { codigo }
        });

        if (motivo && motivo.activo) {
          await prisma.movementReason.update({
            where: { codigo },
            data: { activo: false }
          });
          console.log(`✅ Desactivado: ${codigo}`);
        } else if (motivo && !motivo.activo) {
          console.log(`⏭️  Ya desactivado: ${codigo}`);
        } else {
          console.log(`⏭️  No existe: ${codigo}`);
        }
      } catch (error) {
        console.log(`⚠️  Error desactivando ${codigo}:`, error.message);
      }
    }

    console.log('');

    // ============================================
    // FASE 4: VERIFICACIÓN FINAL
    // ============================================
    console.log('📝 FASE 4: Verificación final...\n');

    const motivosActivos = await prisma.movementReason.findMany({
      where: { activo: true },
      orderBy: [
        { tipo: 'asc' },
        { codigo: 'asc' }
      ]
    });

    const grupos = {
      ENTRADA: motivosActivos.filter(m => m.tipo === 'ENTRADA'),
      SALIDA: motivosActivos.filter(m => m.tipo === 'SALIDA'),
      AJUSTE: motivosActivos.filter(m => m.tipo === 'AJUSTE')
    };

    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║  MOTIVOS ACTIVOS DESPUÉS DE REORGANIZACIÓN                     ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    Object.entries(grupos).forEach(([tipo, items]) => {
      console.log(`\n📦 ${tipo} (${items.length} motivos)`);
      console.log('─'.repeat(60));
      items.forEach(m => {
        const doc = m.requiereDocumento ? '📄' : '  ';
        console.log(`  ${doc} [${m.codigo}] ${m.nombre}`);
      });
    });

    console.log('\n' + '═'.repeat(60));
    console.log(`📊 TOTAL MOTIVOS ACTIVOS: ${motivosActivos.length}`);
    console.log('═'.repeat(60) + '\n');

    // Verificar que tenemos exactamente 13 motivos activos
    if (motivosActivos.length === 13) {
      console.log('✅ ÉXITO: Sistema tiene exactamente 13 motivos activos (esperado)');
    } else {
      console.log(`⚠️  ADVERTENCIA: Se esperaban 13 motivos activos, hay ${motivosActivos.length}`);
    }

    // Verificar distribución
    const esperado = { ENTRADA: 4, SALIDA: 4, AJUSTE: 5 };
    let todoOk = true;

    Object.entries(esperado).forEach(([tipo, cant]) => {
      if (grupos[tipo].length === cant) {
        console.log(`✅ ${tipo}: ${cant} motivos (correcto)`);
      } else {
        console.log(`⚠️  ${tipo}: ${grupos[tipo].length} motivos (se esperaban ${cant})`);
        todoOk = false;
      }
    });

    console.log('');

    if (todoOk) {
      console.log('🎉 ¡REORGANIZACIÓN COMPLETADA CON ÉXITO!\n');
      console.log('📋 Siguiente paso: Verificar que el frontend muestra correctamente los motivos');
      console.log('   → Ir a página de Alertas → Click "Ajustar Stock" → Verificar dropdown\n');
    } else {
      console.log('⚠️  REORGANIZACIÓN COMPLETADA CON ADVERTENCIAS\n');
      console.log('   → Revisar manualmente los motivos en la base de datos\n');
    }

    console.log('⏱️  Fin: ' + new Date().toLocaleTimeString());
    console.log('');

  } catch (error) {
    console.error('\n❌ ERROR DURANTE LA REORGANIZACIÓN:\n');
    console.error(error);
    console.log('\n⚠️  Revertir cambios manualmente si es necesario\n');
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
reorganizarMotivos();
