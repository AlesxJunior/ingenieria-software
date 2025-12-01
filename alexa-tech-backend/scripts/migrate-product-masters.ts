/**
 * SCRIPT DE MIGRACIÓN: Categorías y Unidades de Medida
 * 
 * Este script migra los datos existentes de productos para usar las nuevas tablas maestras:
 * - ProductCategory
 * - UnitOfMeasure
 * 
 * Pasos:
 * 1. Extrae valores únicos de categoria y unidadMedida de productos existentes
 * 2. Crea registros en las tablas maestras
 * 3. Actualiza cada producto con los IDs correspondientes
 * 
 * IMPORTANTE: Ejecutar DESPUÉS de correr la migración de Prisma
 * 
 * Uso: npx ts-node scripts/migrate-product-masters.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CategoryMapping {
  nombre: string;
  id: string;
}

interface UnitMapping {
  nombre: string;
  id: string;
}

async function migrateProductMasters() {
  console.log('🚀 Iniciando migración de maestros de productos...\n');

  try {
    // ============================================
    // PASO 1: Verificar si ya existen datos en las tablas maestras
    // ============================================
    const existingCategories = await prisma.productCategory.count();
    const existingUnits = await prisma.unitOfMeasure.count();

    if (existingCategories > 0 || existingUnits > 0) {
      console.warn('⚠️  ADVERTENCIA: Ya existen datos en las tablas maestras');
      console.warn(`   - Categorías existentes: ${existingCategories}`);
      console.warn(`   - Unidades existentes: ${existingUnits}`);
      
      const continuar = process.env.FORCE_MIGRATION === 'true';
      if (!continuar) {
        console.log('\n❌ Migración cancelada. Use FORCE_MIGRATION=true para forzar.');
        return;
      }
    }

    // ============================================
    // PASO 2: Obtener todos los productos con sus categorías y unidades actuales
    // ============================================
    console.log('📋 Extrayendo datos de productos existentes...');
    
    const products = await prisma.$queryRaw<Array<{
      id: string;
      codigo: string;
      nombre: string;
      categoria: string | null;
      unidadMedida: string | null;
    }>>`
      SELECT id, codigo, nombre, categoria, "unidadMedida"
      FROM products
      WHERE categoria IS NOT NULL OR "unidadMedida" IS NOT NULL
    `;

    console.log(`   ✅ ${products.length} productos encontrados\n`);

    if (products.length === 0) {
      console.log('ℹ️  No hay productos para migrar. Script finalizado.');
      return;
    }

    // ============================================
    // PASO 3: Extraer valores únicos de categorías
    // ============================================
    const uniqueCategories = Array.from(
      new Set(
        products
          .map(p => p.categoria)
          .filter((c): c is string => c !== null && c.trim() !== '')
      )
    ).sort();

    console.log(`📦 Categorías únicas encontradas: ${uniqueCategories.length}`);
    uniqueCategories.forEach(cat => console.log(`   - ${cat}`));
    console.log('');

    // ============================================
    // PASO 4: Crear registros de categorías
    // ============================================
    console.log('🔨 Creando categorías en la BD...');
    const categoryMappings: CategoryMapping[] = [];

    for (const categoryName of uniqueCategories) {
      // Generar código automático (primeras 3 letras en mayúsculas)
      if (!categoryName) continue; // Skip null/empty
      
      let codigo = categoryName
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      
      // Asegurar unicidad del código
      let suffix = 1;
      let finalCodigo = codigo;
      while (categoryMappings.some(m => m.id === finalCodigo)) {
        finalCodigo = `${codigo}${suffix}`;
        suffix++;
      }

      const category = await prisma.productCategory.create({
        data: {
          codigo: finalCodigo,
          nombre: categoryName,
          descripcion: `Categoría migrada automáticamente: ${categoryName}`,
          activo: true,
        },
      });

      categoryMappings.push({
        nombre: categoryName as string,
        id: category.id,
      });

      console.log(`   ✅ Creada: ${categoryName} (${finalCodigo}) → ID: ${category.id}`);
    }

    console.log(`\n✅ ${categoryMappings.length} categorías creadas\n`);

    // ============================================
    // PASO 5: Extraer valores únicos de unidades de medida
    // ============================================
    const uniqueUnits = Array.from(
      new Set(
        products
          .map(p => p.unidadMedida)
          .filter((u): u is string => u !== null && u.trim() !== '')
          // Normalizar a Title Case para evitar duplicados
          .map(u => u.charAt(0).toUpperCase() + u.slice(1).toLowerCase())
      )
    ).sort();

    console.log(`📏 Unidades de medida únicas encontradas: ${uniqueUnits.length}`);
    uniqueUnits.forEach(unit => console.log(`   - ${unit}`));
    console.log('');

    // ============================================
    // PASO 6: Crear registros de unidades de medida
    // ============================================
    console.log('🔨 Creando unidades de medida en la BD...');
    const unitMappings: UnitMapping[] = [];

    // Mapeo de símbolos comunes
    const symbolMap: Record<string, string> = {
      'Unidad': 'un',
      'Kilogramo': 'kg',
      'Gramo': 'g',
      'Litro': 'lt',
      'Mililitro': 'ml',
      'Caja': 'cj',
      'Paquete': 'pq',
      'Botella': 'bot',
      'Lata': 'lata',
      'Bolsa': 'bls',
      'Metro': 'm',
      'Centímetro': 'cm',
    };

    for (const unitName of uniqueUnits) {
      // Generar código automático (primeras 2-3 letras en mayúsculas)
      let codigo = unitName
        .substring(0, 3)
        .toUpperCase()
        .replace(/[^A-Z]/g, '');
      
      if (codigo.length < 2) {
        codigo = unitName.substring(0, 2).toUpperCase();
      }

      // Asegurar unicidad del código
      let suffix = 1;
      let finalCodigo = codigo;
      while (unitMappings.some(m => m.id === finalCodigo)) {
        finalCodigo = `${codigo}${suffix}`;
        suffix++;
      }

      // Obtener símbolo si existe en el mapeo
      const simbolo = symbolMap[unitName] || null;

      const unit = await prisma.unitOfMeasure.create({
        data: {
          codigo: finalCodigo,
          nombre: unitName,
          simbolo,
          descripcion: `Unidad migrada automáticamente: ${unitName}`,
          activo: true,
        },
      });

      unitMappings.push({
        nombre: unitName,
        id: unit.id,
      });

      console.log(`   ✅ Creada: ${unitName} (${finalCodigo}${simbolo ? ` - ${simbolo}` : ''}) → ID: ${unit.id}`);
    }

    console.log(`\n✅ ${unitMappings.length} unidades de medida creadas\n`);

    // ============================================
    // PASO 7: Actualizar productos con los nuevos IDs
    // ============================================
    console.log('🔄 Actualizando productos con los nuevos IDs...');
    
    let updated = 0;
    let errors = 0;

    for (const product of products) {
      try {
        const categoryMapping = categoryMappings.find(m => m.nombre === product.categoria);
        // Buscar unidad normalizando a Title Case
        const normalizedUnit = product.unidadMedida ? 
          product.unidadMedida.charAt(0).toUpperCase() + product.unidadMedida.slice(1).toLowerCase() : 
          null;
        const unitMapping = unitMappings.find(m => m.nombre === normalizedUnit);

        if (!categoryMapping || !unitMapping) {
          console.warn(`   ⚠️  Producto ${product.codigo} - ${product.nombre}:`);
          if (!categoryMapping) console.warn(`      - Categoría no encontrada: "${product.categoria}"`);
          if (!unitMapping) console.warn(`      - Unidad no encontrada: "${product.unidadMedida}"`);
          errors++;
          continue;
        }

        await prisma.$executeRaw`
          UPDATE products
          SET "categoriaId" = ${categoryMapping.id},
              "unidadMedidaId" = ${unitMapping.id}
          WHERE id = ${product.id}
        `;

        updated++;
        if (updated % 10 === 0) {
          console.log(`   📝 ${updated} productos actualizados...`);
        }
      } catch (error) {
        console.error(`   ❌ Error actualizando producto ${product.codigo}:`, error);
        errors++;
      }
    }

    console.log(`\n✅ Migración completada:`);
    console.log(`   - ${categoryMappings.length} categorías creadas`);
    console.log(`   - ${unitMappings.length} unidades de medida creadas`);
    console.log(`   - ${updated} productos actualizados`);
    if (errors > 0) {
      console.log(`   - ⚠️  ${errors} errores encontrados`);
    }

    // ============================================
    // PASO 8: Verificación final
    // ============================================
    console.log('\n🔍 Verificando migración...');
    
    const productsWithoutCategory = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM products
      WHERE "categoriaId" IS NULL
    `;

    const productsWithoutUnit = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count
      FROM products
      WHERE "unidadMedidaId" IS NULL
    `;

    const missingCategory = Number(productsWithoutCategory[0].count);
    const missingUnit = Number(productsWithoutUnit[0].count);

    if (missingCategory > 0) {
      console.warn(`   ⚠️  ${missingCategory} productos sin categoría asignada`);
    }
    if (missingUnit > 0) {
      console.warn(`   ⚠️  ${missingUnit} productos sin unidad de medida asignada`);
    }

    if (missingCategory === 0 && missingUnit === 0) {
      console.log('   ✅ Todos los productos tienen categoría y unidad asignada');
    }

    console.log('\n🎉 Migración finalizada exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateProductMasters()
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
