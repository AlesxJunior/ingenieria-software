const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCacheAndSync() {
  console.log('🔍 Verificando problemas de caché y sincronización...\n');

  try {
    // 1. Verificar sincronización entre stock global y stock por almacén
    console.log('1. Verificando sincronización de stock global:');
    
    const products = await prisma.product.findMany({
      where: {
        trackInventory: true
      },
      include: {
        stockByWarehouses: true
      }
    });

    let syncErrors = 0;
    for (const product of products) {
      const calculatedStock = product.stockByWarehouses.reduce((sum, stock) => sum + stock.quantity, 0);
      
      if (product.stock !== calculatedStock) {
        syncErrors++;
        console.log(`   ❌ Desincronización detectada:`);
        console.log(`       Producto: ${product.name} (${product.code})`);
        console.log(`       Stock global: ${product.stock}`);
        console.log(`       Stock calculado: ${calculatedStock}`);
        console.log(`       Diferencia: ${product.stock - calculatedStock}`);
      }
    }

    if (syncErrors === 0) {
      console.log('   ✅ Stock global sincronizado correctamente');
    } else {
      console.log(`   ❌ ${syncErrors} productos con desincronización de stock`);
    }

    // 2. Verificar timestamps de actualización
    console.log('\n2. Verificando timestamps de actualización:');
    
    const recentUpdates = await prisma.stockByWarehouse.findMany({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
        }
      },
      include: {
        product: true,
        warehouse: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    console.log(`   📊 Actualizaciones de stock en últimas 24h: ${recentUpdates.length}`);
    
    if (recentUpdates.length > 0) {
      console.log('   📋 Últimas actualizaciones:');
      for (const update of recentUpdates.slice(0, 3)) {
        console.log(`       ${update.product.name} en ${update.warehouse.name}: ${update.quantity} (${update.updatedAt.toISOString()})`);
      }
    }

    // 3. Verificar consistencia temporal entre movimientos y stock
    console.log('\n3. Verificando consistencia temporal:');
    
    const stockRecords = await prisma.stockByWarehouse.findMany({
      include: {
        product: true,
        warehouse: true
      }
    });

    let temporalInconsistencies = 0;
    for (const stock of stockRecords) {
      // Buscar el último movimiento para este producto/almacén
      const lastMovement = await prisma.inventoryMovement.findFirst({
        where: {
          productId: stock.productId,
          warehouseId: stock.warehouseId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (lastMovement) {
        // Verificar si el stock fue actualizado después del último movimiento
        if (stock.updatedAt < lastMovement.createdAt) {
          temporalInconsistencies++;
          console.log(`   ⚠️  Inconsistencia temporal:`);
          console.log(`       Producto: ${stock.product.name}`);
          console.log(`       Almacén: ${stock.warehouse.name}`);
          console.log(`       Último movimiento: ${lastMovement.createdAt.toISOString()}`);
          console.log(`       Actualización stock: ${stock.updatedAt.toISOString()}`);
        }
      }
    }

    if (temporalInconsistencies === 0) {
      console.log('   ✅ Consistencia temporal correcta');
    } else {
      console.log(`   ⚠️  ${temporalInconsistencies} inconsistencias temporales encontradas`);
    }

    // 4. Verificar posibles problemas de concurrencia
    console.log('\n4. Verificando indicadores de problemas de concurrencia:');
    
    // Buscar movimientos muy cercanos en tiempo para el mismo producto/almacén
    const allMovements = await prisma.inventoryMovement.findMany({
      orderBy: [
        { productId: 'asc' },
        { warehouseId: 'asc' },
        { createdAt: 'asc' }
      ]
    });

    let concurrencyWarnings = 0;
    for (let i = 1; i < allMovements.length; i++) {
      const prev = allMovements[i - 1];
      const curr = allMovements[i];
      
      if (prev.productId === curr.productId && 
          prev.warehouseId === curr.warehouseId) {
        
        const timeDiff = curr.createdAt.getTime() - prev.createdAt.getTime();
        
        // Si hay movimientos muy cercanos (menos de 1 segundo)
        if (timeDiff < 1000) {
          concurrencyWarnings++;
          console.log(`   ⚠️  Movimientos muy cercanos en tiempo:`);
          console.log(`       Diferencia: ${timeDiff}ms`);
          console.log(`       Movimiento 1: ${prev.type} - ${prev.createdAt.toISOString()}`);
          console.log(`       Movimiento 2: ${curr.type} - ${curr.createdAt.toISOString()}`);
        }
      }
    }

    if (concurrencyWarnings === 0) {
      console.log('   ✅ No se detectaron indicadores de problemas de concurrencia');
    } else {
      console.log(`   ⚠️  ${concurrencyWarnings} posibles indicadores de concurrencia`);
    }

    // 5. Verificar integridad de transacciones
    console.log('\n5. Verificando integridad de transacciones:');
    
    // Verificar que cada movimiento tenga su correspondiente actualización de stock
    let transactionErrors = 0;
    for (const movement of allMovements) {
      const stockRecord = await prisma.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: movement.productId,
            warehouseId: movement.warehouseId
          }
        }
      });

      if (!stockRecord) {
        transactionErrors++;
        console.log(`   ❌ Movimiento sin registro de stock correspondiente:`);
        console.log(`       ID: ${movement.id}`);
        console.log(`       Producto: ${movement.productId}`);
        console.log(`       Almacén: ${movement.warehouseId}`);
      }
    }

    if (transactionErrors === 0) {
      console.log('   ✅ Integridad de transacciones correcta');
    } else {
      console.log(`   ❌ ${transactionErrors} errores de integridad de transacciones`);
    }

    // 6. Resumen final
    console.log('\n6. Resumen de verificación de caché y sincronización:');
    console.log(`   📊 Productos verificados: ${products.length}`);
    console.log(`   📈 Registros de stock verificados: ${stockRecords.length}`);
    console.log(`   🔄 Movimientos verificados: ${allMovements.length}`);
    console.log(`   ❌ Errores de sincronización: ${syncErrors}`);
    console.log(`   ⚠️  Inconsistencias temporales: ${temporalInconsistencies}`);
    console.log(`   ⚠️  Advertencias de concurrencia: ${concurrencyWarnings}`);
    console.log(`   ❌ Errores de transacción: ${transactionErrors}`);

    const totalIssues = syncErrors + temporalInconsistencies + concurrencyWarnings + transactionErrors;
    
    if (totalIssues === 0) {
      console.log('\n✅ No se detectaron problemas de caché o sincronización');
    } else {
      console.log(`\n⚠️  Se detectaron ${totalIssues} posibles problemas de caché/sincronización`);
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCacheAndSync();