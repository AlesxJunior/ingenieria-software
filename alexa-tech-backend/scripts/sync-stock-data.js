const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function syncStockData() {
  console.log('🔄 Iniciando sincronización de datos de stock...\n');

  try {
    // 1. Obtener todos los productos con seguimiento de inventario
    const products = await prisma.product.findMany({
      where: {
        trackInventory: true
      },
      include: {
        stockByWarehouses: true
      }
    });

    // 2. Obtener todos los almacenes activos
    const warehouses = await prisma.warehouse.findMany({
      where: {
        activo: true
      }
    });

    console.log(`📊 Productos a sincronizar: ${products.length}`);
    console.log(`🏪 Almacenes activos: ${warehouses.length}\n`);

    let syncActions = {
      created: 0,
      updated: 0,
      errors: 0
    };

    // 3. Para cada producto, asegurar que tenga registros en stockByWarehouse para todos los almacenes
    for (const product of products) {
      console.log(`🔍 Procesando producto: ${product.name} (${product.code})`);
      
      for (const warehouse of warehouses) {
        try {
          // Verificar si existe el registro stockByWarehouse
          const existingStock = product.stockByWarehouses.find(
            stock => stock.warehouseId === warehouse.id
          );

          if (!existingStock) {
            // Crear registro faltante con stock 0
            await prisma.stockByWarehouse.create({
              data: {
                productId: product.id,
                warehouseId: warehouse.id,
                quantity: 0,
                minStock: product.minStock,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
            
            console.log(`   ✅ Creado registro para almacén: ${warehouse.name}`);
            syncActions.created++;
          }
        } catch (error) {
          console.log(`   ❌ Error procesando almacén ${warehouse.name}: ${error.message}`);
          syncActions.errors++;
        }
      }
    }

    // 4. Recalcular y sincronizar stock global basado en stockByWarehouse
    console.log('\n🔄 Recalculando stock global...');
    
    for (const product of products) {
      try {
        // Obtener todos los stocks actualizados del producto
        const stockRecords = await prisma.stockByWarehouse.findMany({
          where: {
            productId: product.id
          }
        });

        // Calcular stock total
        const calculatedStock = stockRecords.reduce((sum, stock) => sum + stock.quantity, 0);
        
        // Actualizar stock global si es diferente
        if (product.stock !== calculatedStock) {
          await prisma.product.update({
            where: { id: product.id },
            data: { 
              stock: calculatedStock,
              updatedAt: new Date()
            }
          });
          
          console.log(`   🔄 ${product.name}: ${product.stock} → ${calculatedStock}`);
          syncActions.updated++;
        } else {
          console.log(`   ✅ ${product.name}: Stock ya sincronizado (${calculatedStock})`);
        }
      } catch (error) {
        console.log(`   ❌ Error actualizando ${product.name}: ${error.message}`);
        syncActions.errors++;
      }
    }

    // 5. Verificar y corregir timestamps inconsistentes
    console.log('\n🕐 Verificando timestamps...');
    
    const stockRecords = await prisma.stockByWarehouse.findMany({
      include: {
        product: true,
        warehouse: true
      }
    });

    let timestampFixes = 0;
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

      if (lastMovement && stock.updatedAt < lastMovement.createdAt) {
        // Actualizar timestamp del stock para que sea posterior al último movimiento
        await prisma.stockByWarehouse.update({
          where: {
            productId_warehouseId: {
              productId: stock.productId,
              warehouseId: stock.warehouseId
            }
          },
          data: {
            updatedAt: new Date(lastMovement.createdAt.getTime() + 1000) // 1 segundo después
          }
        });
        
        console.log(`   🕐 Corregido timestamp: ${stock.product.name} en ${stock.warehouse.name}`);
        timestampFixes++;
      }
    }

    // 6. Verificación final
    console.log('\n🔍 Verificación final...');
    
    const finalProducts = await prisma.product.findMany({
      where: {
        trackInventory: true
      },
      include: {
        stockByWarehouses: true
      }
    });

    let finalSyncErrors = 0;
    for (const product of finalProducts) {
      const calculatedStock = product.stockByWarehouses.reduce((sum, stock) => sum + stock.quantity, 0);
      
      if (product.stock !== calculatedStock) {
        finalSyncErrors++;
        console.log(`   ❌ Aún desincronizado: ${product.name} (${product.stock} vs ${calculatedStock})`);
      }
    }

    // 7. Resumen final
    console.log('\n📋 Resumen de sincronización:');
    console.log(`   ✅ Registros creados: ${syncActions.created}`);
    console.log(`   🔄 Productos actualizados: ${syncActions.updated}`);
    console.log(`   🕐 Timestamps corregidos: ${timestampFixes}`);
    console.log(`   ❌ Errores: ${syncActions.errors}`);
    console.log(`   ❌ Productos aún desincronizados: ${finalSyncErrors}`);

    if (finalSyncErrors === 0 && syncActions.errors === 0) {
      console.log('\n🎉 ¡Sincronización completada exitosamente!');
    } else if (finalSyncErrors === 0) {
      console.log('\n✅ Sincronización completada con algunos errores menores');
    } else {
      console.log('\n⚠️  Sincronización completada pero quedan problemas por resolver');
    }

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Función para ejecutar sincronización con confirmación
async function runSyncWithConfirmation() {
  console.log('⚠️  ADVERTENCIA: Este script modificará datos en la base de datos.');
  console.log('   - Creará registros faltantes en stockByWarehouse');
  console.log('   - Actualizará stock global de productos');
  console.log('   - Corregirá timestamps inconsistentes\n');
  
  // En un entorno de producción, aquí se podría agregar confirmación del usuario
  console.log('🚀 Iniciando sincronización...\n');
  
  await syncStockData();
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSyncWithConfirmation().catch(console.error);
}

module.exports = { syncStockData };