const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function debugKardexQueries() {
  try {
    console.log('🔍 Analizando consultas SQL del módulo Kardex...\n');

    // 1. Verificar qué tablas existen en la base de datos
    console.log('🔍 Verificando tablas existentes...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%inventory%'
    `;
    console.log('📋 Tablas de inventario encontradas:', tables);

    // 2. Verificar estructura de la tabla inventory_movements
    console.log('\n🔍 Verificando estructura de inventory_movements...');
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'inventory_movements' 
      AND table_schema = 'public'
    `;
    console.log('📋 Estructura de inventory_movements:', tableInfo);

    // 3. Verificar estructura específica de las tablas de inventario
    console.log('\n3. Verificando estructura de tablas de inventario:');
    
    // Buscar tablas relacionadas con inventario
    const inventoryTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (table_name ILIKE '%inventory%'
      OR table_name ILIKE '%movement%'
      OR table_name ILIKE '%stock%')
      ORDER BY table_name;
    `;
    console.log('   Tablas de inventario:', inventoryTables);

    // 4. Usar Prisma para obtener datos directamente
    console.log('\n4. Probando consultas con Prisma ORM:');
    
    // Verificar movimientos de inventario
    const movementCount = await prisma.inventoryMovement.count();
    console.log(`   Total de movimientos: ${movementCount}`);

    if (movementCount > 0) {
      // Obtener algunos movimientos de ejemplo
      const sampleMovements = await prisma.inventoryMovement.findMany({
        take: 3,
        include: {
          product: true,
          warehouse: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log('\n   Movimientos de ejemplo:');
      sampleMovements.forEach((mov, index) => {
        console.log(`   ${index + 1}. ID: ${mov.id}`);
        console.log(`      Producto: ${mov.product?.nombre || 'N/A'} (${mov.product?.codigo || 'N/A'})`);
        console.log(`      Almacén: ${mov.warehouse?.nombre || 'N/A'}`);
        console.log(`      Tipo: ${mov.type}`);
        console.log(`      Cantidad: ${mov.quantity}`);
        console.log(`      Fecha: ${mov.createdAt}`);
        console.log(`      Stock antes: ${mov.stockBefore}, después: ${mov.stockAfter}`);
      });
    }

    // 5. Probar consultas básicas de kardex
    console.log('\n5. Probando consultas básicas de kardex:');
    
    // Obtener almacenes disponibles
    const warehouses = await prisma.warehouse.findMany();
    console.log('   Almacenes disponibles:', warehouses.map(w => `${w.codigo}: ${w.nombre}`));

    if (warehouses.length > 0) {
      const warehouseId = warehouses[0].codigo;
      
      // Consulta básica por almacén
      console.log(`\n   5.1 Consulta básica (warehouseId: ${warehouseId}):`);
      const basicQuery = await prisma.inventoryMovement.findMany({
        where: {
          warehouseId: warehouseId
        },
        include: {
          product: true,
          warehouse: true,
          user: true
        },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        }
      });
      console.log(`       Registros encontrados: ${basicQuery.length}`);
      
      if (basicQuery.length > 0) {
        console.log('       Primer movimiento:', {
          id: basicQuery[0].id,
          tipo: basicQuery[0].type,
          cantidad: basicQuery[0].quantity,
          product: basicQuery[0].product?.nombre,
          warehouse: basicQuery[0].warehouse?.nombre
        });
      }

      // Consulta con filtro de tipo
      console.log('\n   4.2 Consulta por tipo de movimiento:');
      const tiposMovimiento = ['ENTRADA', 'SALIDA', 'AJUSTE'];
      for (const tipo of tiposMovimiento) {
        const typeQuery = await prisma.inventoryMovement.count({
          where: {
            warehouseId: warehouseId,
            type: tipo
          }
        });
        console.log(`       ${tipo}: ${typeQuery} registros`);
      }

      // Consulta con rango de fechas
      console.log('\n   4.3 Consulta con rango de fechas (últimos 30 días):');
      const fechaDesde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const dateRangeQuery = await prisma.inventoryMovement.count({
        where: {
          warehouseId: warehouseId,
          createdAt: {
            gte: fechaDesde
          }
        }
      });
      console.log(`       Registros en últimos 30 días: ${dateRangeQuery}`);
    }

    // 5. Verificar posibles problemas de rendimiento
    console.log('\n5. Verificando posibles problemas de rendimiento:');
    
    // Verificar movimientos duplicados
    const duplicateCheck = await prisma.$queryRaw`
      SELECT "productId", "warehouseId", "createdAt", COUNT(*) as count
      FROM "inventory_movements"
      GROUP BY "productId", "warehouseId", "createdAt"
      HAVING COUNT(*) > 1
      LIMIT 5;
    `;
    console.log('   Movimientos duplicados:', duplicateCheck);

    // Verificar movimientos con fechas futuras
     const futureMovements = await prisma.$queryRaw`
       SELECT id, "productId", "warehouseId", "createdAt", tipo
       FROM "inventory_movements"
       WHERE "createdAt" > NOW()
       LIMIT 5;
     `;
     console.log('   5.2 Movimientos con fechas futuras:', futureMovements);

    // 6. Verificar integridad referencial
    console.log('\n6. Verificando integridad referencial:');
    
    const orphanedMovements = await prisma.$queryRaw`
      SELECT im.id, im."productId", im."warehouseId"
      FROM "inventory_movements" im
      LEFT JOIN "products" p ON im."productId" = p.id
      LEFT JOIN "warehouses" w ON im."warehouseId" = w.id
      WHERE p.id IS NULL OR w.id IS NULL
      LIMIT 5;
    `;
    console.log('   Movimientos huérfanos:', orphanedMovements);

    // 7. Verificar posibles bucles en consultas
    console.log('\n7. Verificando posibles bucles en consultas:');
    
    // Verificar si hay productos con muchos movimientos que podrían causar lentitud
    const heavyProducts = await prisma.$queryRaw`
      SELECT "productId", COUNT(*) as movement_count
      FROM "inventory_movements"
      GROUP BY "productId"
      ORDER BY movement_count DESC
      LIMIT 5;
    `;
    console.log('   Productos con más movimientos:', heavyProducts);

    // Verificar distribución de movimientos por fecha
    const movementsByDate = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "inventory_movements"
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
      LIMIT 10;
    `;
    console.log('   Movimientos por fecha (últimos 10 días):', movementsByDate);

    console.log('\n✅ Análisis de consultas SQL completado');

  } catch (error) {
    console.error('❌ Error en el análisis:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugKardexQueries();