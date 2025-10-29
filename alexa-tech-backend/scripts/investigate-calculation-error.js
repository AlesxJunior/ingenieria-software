const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function investigateCalculationError() {
  console.log('🔍 Investigando error de cálculo en movimiento de ajuste...\n');

  try {
    // Buscar el movimiento problemático
    const problematicMovement = await prisma.inventoryMovement.findUnique({
      where: {
        id: 'cmh2f13a80020o1lsb0rewuto'
      },
      include: {
        product: true,
        warehouse: true,
        user: true
      }
    });

    if (!problematicMovement) {
      console.log('❌ No se encontró el movimiento problemático');
      return;
    }

    console.log('📋 Detalles del movimiento problemático:');
    console.log(`   ID: ${problematicMovement.id}`);
    console.log(`   Producto: ${problematicMovement.product.name} (${problematicMovement.product.code})`);
    console.log(`   Almacén: ${problematicMovement.warehouse.name}`);
    console.log(`   Tipo: ${problematicMovement.type}`);
    console.log(`   Cantidad: ${problematicMovement.quantity}`);
    console.log(`   Stock antes: ${problematicMovement.stockBefore}`);
    console.log(`   Stock después: ${problematicMovement.stockAfter}`);
    console.log(`   Motivo: ${problematicMovement.reason}`);
    console.log(`   Documento: ${problematicMovement.documentRef || 'N/A'}`);
    console.log(`   Usuario: ${problematicMovement.user?.name || 'N/A'}`);
    console.log(`   Fecha: ${problematicMovement.createdAt}`);

    // Analizar el problema
    console.log('\n🔍 Análisis del problema:');
    
    // Para ajustes, necesitamos entender la lógica correcta
    console.log('   📊 Cálculo esperado para AJUSTE:');
    console.log(`      Stock antes: ${problematicMovement.stockBefore}`);
    console.log(`      Cantidad del ajuste: ${problematicMovement.quantity}`);
    
    // Verificar si es un ajuste positivo o negativo
    if (problematicMovement.quantity > 0) {
      console.log('      Tipo de ajuste: POSITIVO (incremento)');
      console.log(`      Stock después esperado: ${problematicMovement.stockBefore} + ${problematicMovement.quantity} = ${problematicMovement.stockBefore + problematicMovement.quantity}`);
    } else {
      console.log('      Tipo de ajuste: NEGATIVO (decremento)');
      console.log(`      Stock después esperado: ${problematicMovement.stockBefore} + (${problematicMovement.quantity}) = ${problematicMovement.stockBefore + problematicMovement.quantity}`);
    }
    
    console.log(`      Stock después real: ${problematicMovement.stockAfter}`);

    // Verificar si hay otros movimientos para este producto/almacén
    console.log('\n📈 Historial completo de movimientos para este producto/almacén:');
    
    const allMovements = await prisma.inventoryMovement.findMany({
      where: {
        productId: problematicMovement.productId,
        warehouseId: problematicMovement.warehouseId
      },
      orderBy: {
        createdAt: 'asc'
      },
      include: {
        user: true
      }
    });

    for (let i = 0; i < allMovements.length; i++) {
      const movement = allMovements[i];
      const isProblematic = movement.id === problematicMovement.id;
      const marker = isProblematic ? '❌' : '✅';
      
      console.log(`   ${marker} ${i + 1}. ${movement.type} - Cantidad: ${movement.quantity}`);
      console.log(`      Stock: ${movement.stockBefore} → ${movement.stockAfter}`);
      console.log(`      Fecha: ${movement.createdAt.toISOString()}`);
      console.log(`      Motivo: ${movement.reason}`);
      
      if (isProblematic) {
        console.log('      ⚠️  ESTE ES EL MOVIMIENTO PROBLEMÁTICO');
      }
      console.log('');
    }

    // Verificar el stock actual
    console.log('📊 Stock actual en la base de datos:');
    
    const currentStock = await prisma.stockByWarehouse.findFirst({
      where: {
        productId: problematicMovement.productId,
        warehouseId: problematicMovement.warehouseId
      }
    });

    if (currentStock) {
      console.log(`   Stock actual: ${currentStock.quantity}`);
      console.log(`   Última actualización: ${currentStock.updatedAt}`);
      
      // Verificar si el stock actual coincide con el último movimiento
      const lastMovement = allMovements[allMovements.length - 1];
      if (currentStock.quantity === lastMovement.stockAfter) {
        console.log('   ✅ Stock actual coincide con último movimiento');
      } else {
        console.log('   ❌ Stock actual NO coincide con último movimiento');
        console.log(`      Stock según último movimiento: ${lastMovement.stockAfter}`);
        console.log(`      Stock actual en tabla: ${currentStock.quantity}`);
      }
    } else {
      console.log('   ❌ No se encontró registro de stock para este producto/almacén');
    }

    // Sugerir corrección
    console.log('\n💡 Sugerencias de corrección:');
    
    if (problematicMovement.type === 'AJUSTE') {
      console.log('   1. Para movimientos de AJUSTE, verificar la lógica de cálculo:');
      console.log('      - Si quantity es positivo: stockAfter = stockBefore + quantity');
      console.log('      - Si quantity es negativo: stockAfter = stockBefore + quantity');
      console.log('      - O si quantity representa el nuevo stock total: stockAfter = quantity');
      
      console.log('\n   2. Verificar en el código del servicio de inventario:');
      console.log('      - ¿Cómo se calcula stockAfter para ajustes?');
      console.log('      - ¿Se está interpretando correctamente el tipo de ajuste?');
      
      console.log('\n   3. Posibles causas del error:');
      console.log('      - Lógica incorrecta en el cálculo de ajustes');
      console.log('      - Confusión entre cantidad de ajuste vs stock final');
      console.log('      - Error en la actualización del registro');
    }

  } catch (error) {
    console.error('❌ Error durante la investigación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigateCalculationError();