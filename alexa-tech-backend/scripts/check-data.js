const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 DATOS ACTUALES EN LA BASE DE DATOS\n');

  // Categorías
  const categories = await prisma.productCategory.findMany({ orderBy: { codigo: 'asc' } });
  console.log(`📦 CATEGORÍAS (${categories.length}):`);
  categories.forEach(cat => {
    console.log(`   - ${cat.codigo}: ${cat.nombre} ${cat.activo ? '✅' : '❌'}`);
  });

  console.log('');

  // Unidades
  const units = await prisma.unitOfMeasure.findMany({ orderBy: { codigo: 'asc' } });
  console.log(`📏 UNIDADES DE MEDIDA (${units.length}):`);
  units.forEach(unit => {
    console.log(`   - ${unit.codigo}: ${unit.nombre} (${unit.simbolo}) ${unit.activo ? '✅' : '❌'}`);
  });

  await prisma.$disconnect();
}

main();
