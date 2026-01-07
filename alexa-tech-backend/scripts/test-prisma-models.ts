/**
 * Script de prueba para verificar que los modelos Prisma están disponibles
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testModels() {
  console.log('🧪 Verificando modelos Prisma...\n');

  try {
    // Test ProductCategory
    const categoryCount = await prisma.productCategory.count();
    console.log(`✅ ProductCategory disponible: ${categoryCount} registros`);

    // Test UnitOfMeasure
    const unitCount = await prisma.unitOfMeasure.count();
    console.log(`✅ UnitOfMeasure disponible: ${unitCount} registros`);

    // Test Product
    const productCount = await prisma.product.count();
    console.log(`✅ Product disponible: ${productCount} registros`);

    console.log('\n🎉 Todos los modelos están correctamente generados!');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testModels();
