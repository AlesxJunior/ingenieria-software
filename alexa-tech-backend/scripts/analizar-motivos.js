const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analizarMotivos() {
  console.log('\n📊 ===== ANÁLISIS DE MOTIVOS DE MOVIMIENTO =====\n');

  try {
    const motivos = await prisma.movementReason.findMany({
      orderBy: [{ tipo: 'asc' }, { codigo: 'asc' }]
    });

    const grupos = { ENTRADA: [], SALIDA: [], AJUSTE: [] };
    motivos.forEach(m => grupos[m.tipo].push(m));

    // Mostrar por tipo
    Object.entries(grupos).forEach(([tipo, items]) => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`${tipo} (${items.length} motivos)`);
      console.log('='.repeat(60));
      
      items.forEach(m => {
        console.log(`\n[${m.codigo}] ${m.nombre}`);
        console.log(`  📝 Descripción: ${m.descripcion || 'N/A'}`);
        console.log(`  📄 Requiere documento: ${m.requiereDocumento ? 'SÍ' : 'NO'}`);
        console.log(`  ${m.activo ? '✅' : '❌'} Estado: ${m.activo ? 'ACTIVO' : 'INACTIVO'}`);
      });
    });

    // Resumen
    console.log(`\n${'='.repeat(60)}`);
    console.log('RESUMEN');
    console.log('='.repeat(60));
    console.log(`📊 Total motivos: ${motivos.length}`);
    console.log(`  ├─ ENTRADA: ${grupos.ENTRADA.length}`);
    console.log(`  ├─ SALIDA: ${grupos.SALIDA.length}`);
    console.log(`  └─ AJUSTE: ${grupos.AJUSTE.length}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

analizarMotivos();
