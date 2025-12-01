const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('\n🗑️  LIMPIANDO CATEGORÍAS INCORRECTAS...\n');

  // Categorías INCORRECTAS que deben eliminarse
  const wrongCategories = ['ROPA', 'ALIM', 'HOGAR', 'DEPORT', 'JUGUET', 'LIBRO', 'SALUD', 'ELEC', 
                           'ABR', 'BEB', 'CAR', 'FRU', 'LAC', 'LIM', 'PER', 'TEC'];

  let deleted = 0;
  for (const codigo of wrongCategories) {
    try {
      const result = await prisma.productCategory.deleteMany({
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

  console.log(`\n✅ ${deleted} categorías incorrectas eliminadas\n`);

  // Verificar categorías restantes
  const remaining = await prisma.productCategory.findMany({ orderBy: { codigo: 'asc' } });
  console.log(`📦 CATEGORÍAS RESTANTES (${remaining.length}):`);
  remaining.forEach(cat => {
    console.log(`   - ${cat.codigo}: ${cat.nombre}`);
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
