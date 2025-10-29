const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkBusinessLogic() {
  console.log('🔍 Verificando lógica de negocio del módulo Kardex...\n');

  try {
    // 1. Verificar consistencia de stock
    console.log('1. Verificando consistencia de stock:');
    
    // Obtener todos los registros de stock
    const stockRecords = await prisma.stockByWarehouse.findMany({
      include: {
        product: true,
        warehouse: true
      }
    });

    console.log(`   📊 Total de registros de stock: ${stockRecords.length}`);

    // Verificar cada registro de stock contra los movimientos
    for (const stock of stockRecords) {
      const movements = await prisma.inventoryMovement.findMany({
        where: {
          productId: stock.productId,
          warehouseId: stock.warehouseId
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (movements.length > 0) {
        const lastMovement = movements[movements.length - 1];
        if (stock.quantity !== lastMovement.stockAfter) {
          console.log(`   ⚠️  Inconsistencia detectada:`);
          console.log(`       Producto: ${stock.product.name}`);
          console.log(`       Almacén: ${stock.warehouse.name}`);
          console.log(`       Stock actual: ${stock.quantity}`);
          console.log(`       Stock según último movimiento: ${lastMovement.stockAfter}`);
        }
      }
    }

    // 2. Verificar secuencia de movimientos
    console.log('\n2. Verificando secuencia de movimientos:');
    
    const allMovements = await prisma.inventoryMovement.findMany({
      orderBy: [
        { productId: 'asc' },
        { warehouseId: 'asc' },
        { createdAt: 'asc' }
      ],
      include: {
        product: true,
        warehouse: true
      }
    });

    console.log(`   📈 Total de movimientos: ${allMovements.length}`);

    // Agrupar movimientos por producto y almacén
    const movementsByProductWarehouse = {};
    
    for (const movement of allMovements) {
      const key = `${movement.productId}-${movement.warehouseId}`;
      if (!movementsByProductWarehouse[key]) {
        movementsByProductWarehouse[key] = [];
      }
      movementsByProductWarehouse[key].push(movement);
    }

    // Verificar secuencia de cada grupo
    let sequenceErrors = 0;
    for (const [key, movements] of Object.entries(movementsByProductWarehouse)) {
      for (let i = 1; i < movements.length; i++) {
        const prevMovement = movements[i - 1];
        const currentMovement = movements[i];
        
        if (prevMovement.stockAfter !== currentMovement.stockBefore) {
          sequenceErrors++;
          console.log(`   ❌ Error de secuencia detectado:`);
          console.log(`       Producto: ${currentMovement.product.name}`);
          console.log(`       Almacén: ${currentMovement.warehouse.name}`);
          console.log(`       Movimiento anterior: stock final ${prevMovement.stockAfter}`);
          console.log(`       Movimiento actual: stock inicial ${currentMovement.stockBefore}`);
        }
      }
    }

    if (sequenceErrors === 0) {
      console.log('   ✅ Secuencia de movimientos correcta');
    } else {
      console.log(`   ❌ ${sequenceErrors} errores de secuencia encontrados`);
    }

    // 3. Verificar cálculos de stock
    console.log('\n3. Verificando cálculos de stock:');
    
    let calculationErrors = 0;
    for (const movement of allMovements) {
      let expectedStockAfter;
      
      switch (movement.type) {
        case 'ENTRADA':
          expectedStockAfter = movement.stockBefore + movement.quantity;
          break;
        case 'SALIDA':
          expectedStockAfter = movement.stockBefore - movement.quantity;
          break;
        case 'AJUSTE':
          // Para ajustes, el stock después debería ser el stock antes más/menos la cantidad
          expectedStockAfter = movement.stockBefore + movement.quantity;
          break;
        default:
          console.log(`   ⚠️  Tipo de movimiento desconocido: ${movement.type}`);
          continue;
      }

      if (expectedStockAfter !== movement.stockAfter) {
        calculationErrors++;
        console.log(`   ❌ Error de cálculo detectado:`);
        console.log(`       ID: ${movement.id}`);
        console.log(`       Tipo: ${movement.type}`);
        console.log(`       Stock antes: ${movement.stockBefore}`);
        console.log(`       Cantidad: ${movement.quantity}`);
        console.log(`       Stock después esperado: ${expectedStockAfter}`);
        console.log(`       Stock después actual: ${movement.stockAfter}`);
      }
    }

    if (calculationErrors === 0) {
      console.log('   ✅ Cálculos de stock correctos');
    } else {
      console.log(`   ❌ ${calculationErrors} errores de cálculo encontrados`);
    }

    // 4. Verificar stocks negativos
    console.log('\n4. Verificando stocks negativos:');
    
    const negativeStocks = await prisma.stockByWarehouse.findMany({
      where: {
        quantity: {
          lt: 0
        }
      },
      include: {
        product: true,
        warehouse: true
      }
    });

    if (negativeStocks.length === 0) {
      console.log('   ✅ No se encontraron stocks negativos');
    } else {
      console.log(`   ⚠️  ${negativeStocks.length} stocks negativos encontrados:`);
      for (const stock of negativeStocks) {
        console.log(`       ${stock.product.name} en ${stock.warehouse.name}: ${stock.quantity}`);
      }
    }

    // 5. Verificar movimientos con cantidades cero o negativas
    console.log('\n5. Verificando movimientos con cantidades inválidas:');
    
    const invalidQuantityMovements = await prisma.inventoryMovement.findMany({
      where: {
        quantity: {
          lte: 0
        }
      },
      include: {
        product: true,
        warehouse: true
      }
    });

    if (invalidQuantityMovements.length === 0) {
      console.log('   ✅ No se encontraron movimientos con cantidades inválidas');
    } else {
      console.log(`   ⚠️  ${invalidQuantityMovements.length} movimientos con cantidades inválidas:`);
      for (const movement of invalidQuantityMovements) {
        console.log(`       ${movement.product.name} - ${movement.type}: ${movement.quantity}`);
      }
    }

    // 6. Verificar posibles condiciones de bucle en consultas
    console.log('\n6. Verificando posibles condiciones de bucle:');
    
    // Simular consulta con filtros complejos
    const startTime = Date.now();
    
    try {
      const complexQuery = await prisma.inventoryMovement.findMany({
        where: {
          AND: [
            {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
              }
            },
            {
              OR: [
                { type: 'ENTRADA' },
                { type: 'SALIDA' }
              ]
            }
          ]
        },
        include: {
          product: true,
          warehouse: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100
      });

      const queryTime = Date.now() - startTime;
      console.log(`   ✅ Consulta compleja ejecutada en ${queryTime}ms`);
      console.log(`   📊 Resultados: ${complexQuery.length} registros`);

      if (queryTime > 5000) {
        console.log('   ⚠️  Consulta lenta detectada (>5s)');
      }

    } catch (error) {
      console.log(`   ❌ Error en consulta compleja: ${error.message}`);
    }

    // 7. Resumen final
    console.log('\n7. Resumen de verificación:');
    console.log(`   📊 Registros de stock verificados: ${stockRecords.length}`);
    console.log(`   📈 Movimientos verificados: ${allMovements.length}`);
    console.log(`   ❌ Errores de secuencia: ${sequenceErrors}`);
    console.log(`   ❌ Errores de cálculo: ${calculationErrors}`);
    console.log(`   ⚠️  Stocks negativos: ${negativeStocks.length}`);
    console.log(`   ⚠️  Movimientos con cantidades inválidas: ${invalidQuantityMovements.length}`);

    const totalErrors = sequenceErrors + calculationErrors + negativeStocks.length + invalidQuantityMovements.length;
    
    if (totalErrors === 0) {
      console.log('\n✅ Lógica de negocio verificada - No se encontraron problemas');
    } else {
      console.log(`\n⚠️  Se encontraron ${totalErrors} problemas en la lógica de negocio`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkBusinessLogic();