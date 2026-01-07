const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🗑️  LIMPIANDO UNIDADES INNECESARIAS...\n');

  // Unidades INCORRECTAS que deben eliminarse
  const wrongUnits = ['BLS', 'BOT', 'GR', 'KG', 'LT', 'ML', 'MT2', 'PQ'];

  let deleted = 0;
  for (const codigo of wrongUnits) {
    try {
      const result = await prisma.unitOfMeasure.deleteMany({
        where: { codigo: codigo }
      });
      if (result.count > 0) {
        console.log(`   ✅ Eliminada: ${codigo}`);
        deleted++;
      }
    } catch (error) {
      console.log(`   ⚠️  No se pudo eliminar ${codigo}:`, error.message);
    }
  }

  console.log(`\n✅ ${deleted} unidades innecesarias eliminadas\n`);

  // Agregar la unidad LIC (Licencia)
  console.log('📏 Agregando unidad LICENCIA...');
  try {
    const existing = await prisma.unitOfMeasure.findUnique({
      where: { codigo: 'LIC' }
    });

    if (!existing) {
      await prisma.unitOfMeasure.create({
        data: {
          codigo: 'LIC',
          nombre: 'Licencia',
          simbolo: 'lic',
          activo: true,
          descripcion: 'Licencias de software y sistemas VMS'
        }
      });
      console.log('   ✅ Creada: Licencia (LIC)');
    } else {
      console.log('   ⏭️  Ya existe: Licencia (LIC)');
    }
  } catch (error) {
    console.log('   ⚠️  Error al crear Licencia:', error.message);
  }

  // Verificar unidades finales
  const remaining = await prisma.unitOfMeasure.findMany({ orderBy: { codigo: 'asc' } });
  console.log(`\n📏 UNIDADES FINALES (${remaining.length}):`);
  remaining.forEach(unit => {
    console.log(`   - ${unit.codigo}: ${unit.nombre} (${unit.simbolo})`);
  });

  await prisma.$disconnect();
}

main()
  .then(() => {
    console.log('\n✅ Limpieza completada!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
