const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeDataFlow() {
  try {
    console.log('🔍 Analizando flujo de datos del módulo Kardex...\n');

    // 1. Verificar datos en la base de datos
    console.log('1. Verificando datos en la base de datos:');
    
    // Productos
    const products = await prisma.product.findMany({
      where: { estado: true },
      take: 5
    });
    console.log(`   📦 Productos activos: ${products.length}`);
    if (products.length > 0) {
      console.log(`   - Primer producto: ${products[0].codigo} - ${products[0].nombre}`);
    }

    // Almacenes
    const warehouses = await prisma.warehouse.findMany({
      where: { activo: true },
      take: 5
    });
    console.log(`   🏪 Almacenes activos: ${warehouses.length}`);
    if (warehouses.length > 0) {
      console.log(`   - Primer almacén: ${warehouses[0].codigo} - ${warehouses[0].nombre}`);
    }

    // Movimientos de inventario
    const movements = await prisma.inventoryMovement.findMany({
      include: {
        product: true,
        warehouse: true,
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    console.log(`   📊 Movimientos de inventario: ${movements.length}`);
    if (movements.length > 0) {
      const movement = movements[0];
      console.log(`   - Último movimiento: ${movement.product?.nombre || 'Producto desconocido'} en ${movement.warehouse?.nombre || 'Almacén desconocido'} (${movement.tipo})`);
    }

    // Stock por almacén
    const stockRecords = await prisma.stockByWarehouse.findMany({
      include: {
        product: true,
        warehouse: true
      },
      take: 5
    });
    console.log(`   📈 Registros de stock: ${stockRecords.length}`);
    if (stockRecords.length > 0) {
      const stock = stockRecords[0];
      console.log(`   - Primer stock: ${stock.product?.nombre || 'Producto desconocido'} en ${stock.warehouse?.nombre || 'Almacén desconocido'} (${stock.quantity} unidades)`);
    }

    // 2. Verificar el servicio de inventario
    console.log('\n2. Verificando servicio de inventario:');
    
    try {
      // Simular la lógica del servicio getKardex directamente con Prisma
      const testFilters = {
        page: 1,
        pageSize: 10
      };
      
      const skip = (testFilters.page - 1) * testFilters.pageSize;
      
      // Contar total de registros
      const total = await prisma.inventoryMovement.count();
      
      // Obtener registros paginados
      const data = await prisma.inventoryMovement.findMany({
        include: {
          product: true,
          warehouse: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: skip,
        take: testFilters.pageSize
      });
      
      const totalPages = Math.ceil(total / testFilters.pageSize);
      
      console.log(`   📋 Resultado simulado del servicio getKardex:`);
      console.log(`   - Total de registros: ${total}`);
      console.log(`   - Registros en página actual: ${data.length}`);
      console.log(`   - Página actual: ${testFilters.page}`);
      console.log(`   - Total de páginas: ${totalPages}`);
      
      if (data.length > 0) {
        const firstRecord = data[0];
        console.log(`   - Primer registro: ${firstRecord.product?.nombre || 'N/A'} - ${firstRecord.tipo} - ${firstRecord.cantidad}`);
      }
      
    } catch (serviceError) {
      console.log(`   ❌ Error simulando el servicio: ${serviceError.message}`);
    }

    // 3. Verificar disponibilidad del servicio
    console.log('\n3. Verificando disponibilidad del servicio:');
    console.log('   📝 Nota: Para verificar el endpoint HTTP, el servidor debe estar ejecutándose');
    console.log('   📝 Endpoint esperado: GET /api/inventory/kardex');

    // 4. Verificar filtros y parámetros
    console.log('\n4. Verificando filtros y parámetros:');
    
    // Probar diferentes combinaciones de filtros
    const filterTests = [
      { name: 'Sin filtros', filters: {} },
      { name: 'Por tipo ENTRADA', filters: { type: 'ENTRADA' } },
      { name: 'Por tipo SALIDA', filters: { type: 'SALIDA' } },
      { name: 'Por tipo AJUSTE', filters: { type: 'AJUSTE' } }
    ];
    
    if (warehouses.length > 0) {
      filterTests.push({ 
        name: `Por almacén ${warehouses[0].codigo}`, 
        filters: { warehouseId: warehouses[0].id } 
      });
    }
    
    if (products.length > 0) {
      filterTests.push({ 
        name: `Por producto ${products[0].codigo}`, 
        filters: { productId: products[0].id } 
      });
    }

    for (const test of filterTests) {
      try {
        const result = await prisma.inventoryMovement.findMany({
          where: test.filters,
          include: {
            product: true,
            warehouse: true
          },
          take: 5
        });
        console.log(`   🔍 ${test.name}: ${result.length} registros`);
      } catch (filterError) {
        console.log(`   ❌ Error en filtro '${test.name}': ${filterError.message}`);
      }
    }

    // 5. Verificar posibles problemas de datos
    console.log('\n5. Verificando posibles problemas de datos:');
    
    // Verificar productos sin movimientos
    const productsWithoutMovements = await prisma.product.findMany({
      where: {
        estado: true,
        inventoryMovements: {
          none: {}
        }
      },
      take: 5
    });
    console.log(`   📦 Productos sin movimientos: ${productsWithoutMovements.length}`);
    
    // Verificar almacenes sin movimientos
    const warehousesWithoutMovements = await prisma.warehouse.findMany({
      where: {
        activo: true,
        inventoryMovements: {
          none: {}
        }
      },
      take: 5
    });
    console.log(`   🏪 Almacenes sin movimientos: ${warehousesWithoutMovements.length}`);
    
    // Verificar movimientos sin referencias válidas (usando SQL directo)
  try {
    const invalidRefs = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM inventory_movements 
      WHERE "productId" IS NULL OR "warehouseId" IS NULL
    `;
    console.log(`   ⚠️  Movimientos con referencias inválidas: ${invalidRefs[0]?.count || 0}`);
  } catch (error) {
    console.log(`   ⚠️  No se pudo verificar referencias inválidas: ${error.message}`);
  }

    // 6. Resumen del análisis
    console.log('\n6. Resumen del análisis:');
    console.log(`   📊 Total de productos activos: ${products.length}`);
    console.log(`   🏪 Total de almacenes activos: ${warehouses.length}`);
    console.log(`   📈 Total de movimientos: ${movements.length}`);
    console.log(`   📋 Total de registros de stock: ${stockRecords.length}`);
    
    // Identificar posibles problemas
    const issues = [];
    if (movements.length === 0) {
      issues.push('No hay movimientos de inventario registrados');
    }
    if (products.length === 0) {
      issues.push('No hay productos activos');
    }
    if (warehouses.length === 0) {
      issues.push('No hay almacenes activos');
    }
    if (stockRecords.length === 0) {
      issues.push('No hay registros de stock');
    }
    
    if (issues.length > 0) {
      console.log('\n⚠️  PROBLEMAS IDENTIFICADOS:');
      issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n✅ No se identificaron problemas evidentes en los datos');
    }

    console.log('\n✅ Análisis de flujo de datos completado');

  } catch (error) {
    console.error('❌ Error al analizar flujo de datos:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeDataFlow();