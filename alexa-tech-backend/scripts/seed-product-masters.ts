/**
 * Script para poblar datos iniciales de categorías y unidades de medida
 * Ejecutar: npx tsx scripts/seed-product-masters.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProductMasters() {
  console.log('🌱 Poblando tablas maestras de productos...\n');

  try {
    // ============================================
    // CATEGORÍAS DE PRODUCTOS
    // ============================================
    console.log('📦 Creando categorías...');
    
    const categories = [
      { codigo: 'ABR', nombre: 'Abarrotes', descripcion: 'Productos de abarrotes y alimentos secos' },
      { codigo: 'BEB', nombre: 'Bebidas', descripcion: 'Bebidas alcohólicas y no alcohólicas' },
      { codigo: 'LAC', nombre: 'Lácteos', descripcion: 'Productos lácteos y derivados' },
      { codigo: 'CAR', nombre: 'Carnes', descripcion: 'Carnes y embutidos' },
      { codigo: 'FRU', nombre: 'Frutas y Verduras', descripcion: 'Productos frescos' },
      { codigo: 'LIM', nombre: 'Limpieza', descripcion: 'Productos de limpieza e higiene' },
      { codigo: 'PER', nombre: 'Cuidado Personal', descripcion: 'Productos de cuidado e higiene personal' },
      { codigo: 'TEC', nombre: 'Tecnología', descripcion: 'Productos electrónicos y tecnológicos' },
    ];

    let createdCategories = 0;
    for (const cat of categories) {
      const existing = await prisma.productCategory.findUnique({
        where: { codigo: cat.codigo }
      });

      if (!existing) {
        await prisma.productCategory.create({
          data: {
            ...cat,
            activo: true,
          }
        });
        console.log(`   ✅ Creada: ${cat.nombre} (${cat.codigo})`);
        createdCategories++;
      } else {
        console.log(`   ⏭️  Ya existe: ${cat.nombre} (${cat.codigo})`);
      }
    }

    console.log(`\n✅ ${createdCategories} categorías nuevas creadas\n`);

    // ============================================
    // UNIDADES DE MEDIDA
    // ============================================
    console.log('📏 Creando unidades de medida...');
    
    const units = [
      { codigo: 'UND', nombre: 'Unidad', simbolo: 'un', descripcion: 'Unidad individual' },
      { codigo: 'KG', nombre: 'Kilogramo', simbolo: 'kg', descripcion: 'Kilogramo' },
      { codigo: 'GR', nombre: 'Gramo', simbolo: 'g', descripcion: 'Gramo' },
      { codigo: 'LT', nombre: 'Litro', simbolo: 'lt', descripcion: 'Litro' },
      { codigo: 'ML', nombre: 'Mililitro', simbolo: 'ml', descripcion: 'Mililitro' },
      { codigo: 'CJ', nombre: 'Caja', simbolo: 'cj', descripcion: 'Caja' },
      { codigo: 'PQ', nombre: 'Paquete', simbolo: 'pq', descripcion: 'Paquete' },
      { codigo: 'BOT', nombre: 'Botella', simbolo: 'bot', descripcion: 'Botella' },
      { codigo: 'BLS', nombre: 'Bolsa', simbolo: 'bls', descripcion: 'Bolsa' },
      { codigo: 'MT', nombre: 'Metro', simbolo: 'm', descripcion: 'Metro' },
    ];

    let createdUnits = 0;
    for (const unit of units) {
      const existing = await prisma.unitOfMeasure.findUnique({
        where: { codigo: unit.codigo }
      });

      if (!existing) {
        await prisma.unitOfMeasure.create({
          data: {
            ...unit,
            activo: true,
          }
        });
        console.log(`   ✅ Creada: ${unit.nombre} (${unit.codigo} - ${unit.simbolo})`);
        createdUnits++;
      } else {
        console.log(`   ⏭️  Ya existe: ${unit.nombre} (${unit.codigo})`);
      }
    }

    console.log(`\n✅ ${createdUnits} unidades de medida nuevas creadas\n`);

    // ============================================
    // MIGRAR PRODUCTOS EXISTENTES (si los hay)
    // ============================================
    console.log('🔄 Verificando productos existentes...');
    
    const productsToMigrate = await prisma.$queryRaw<Array<{
      id: string;
      codigo: string;
      nombre: string;
      categoria: string | null;
      unidadMedida: string | null;
    }>>`
      SELECT id, codigo, nombre, categoria, "unidadMedida"
      FROM products
      WHERE (categoria IS NOT NULL OR "unidadMedida" IS NOT NULL)
        AND ("categoriaId" IS NULL OR "unidadMedidaId" IS NULL)
    `;

    if (productsToMigrate.length > 0) {
      console.log(`   📋 ${productsToMigrate.length} productos necesitan migración`);
      
      // Obtener todas las categorías y unidades creadas
      const allCategories = await prisma.productCategory.findMany();
      const allUnits = await prisma.unitOfMeasure.findMany();

      let updated = 0;
      let errors = 0;

      for (const product of productsToMigrate) {
        try {
          // Buscar categoría (case-insensitive)
          const category = allCategories.find(
            (c: { nombre: string }) => c.nombre.toLowerCase() === product.categoria?.toLowerCase()
          );

          // Buscar unidad (case-insensitive y normalizando)
          const normalizedUnit = product.unidadMedida
            ? product.unidadMedida.charAt(0).toUpperCase() + product.unidadMedida.slice(1).toLowerCase()
            : null;
          const unit = allUnits.find(
            (u: { nombre: string }) => u.nombre.toLowerCase() === normalizedUnit?.toLowerCase()
          );

          if (category && unit) {
            await prisma.$executeRaw`
              UPDATE products
              SET "categoriaId" = ${category.id},
                  "unidadMedidaId" = ${unit.id}
              WHERE id = ${product.id}
            `;
            updated++;
            console.log(`   ✅ Migrado: ${product.codigo} - ${product.nombre}`);
          } else {
            console.warn(`   ⚠️  No se pudo migrar ${product.codigo}:`);
            if (!category) console.warn(`      - Categoría no encontrada: "${product.categoria}"`);
            if (!unit) console.warn(`      - Unidad no encontrada: "${product.unidadMedida}"`);
            errors++;
          }
        } catch (error) {
          console.error(`   ❌ Error migrando ${product.codigo}:`, error);
          errors++;
        }
      }

      console.log(`\n   📊 Resultado migración:`);
      console.log(`      - ✅ ${updated} productos migrados`);
      if (errors > 0) {
        console.log(`      - ⚠️  ${errors} productos con errores`);
      }
    } else {
      console.log('   ℹ️  No hay productos pendientes de migración');
    }

    // ============================================
    // RESUMEN FINAL
    // ============================================
    const finalCategories = await prisma.productCategory.count();
    const finalUnits = await prisma.unitOfMeasure.count();
    const productsWithMastersResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM products
      WHERE "categoriaId" IS NOT NULL AND "unidadMedidaId" IS NOT NULL
    `;
    const productsWithMasters = Number(productsWithMastersResult[0].count);
    const totalProducts = await prisma.product.count();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 RESUMEN FINAL');
    console.log('='.repeat(50));
    console.log(`📦 Categorías en BD: ${finalCategories}`);
    console.log(`📏 Unidades en BD: ${finalUnits}`);
    console.log(`📊 Productos migrados: ${productsWithMasters}/${totalProducts}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar seed
seedProductMasters()
  .then(() => {
    console.log('✅ Seed completado exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
