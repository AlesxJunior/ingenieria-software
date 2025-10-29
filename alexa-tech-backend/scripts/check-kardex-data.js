const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkKardexData() {
  try {
    console.log('🔍 Verificando datos de kardex en la base de datos...\n');

    // Verificar movimientos de inventario
    const movimientos = await prisma.inventoryMovement.findMany({
      include: {
        product: true,
        warehouse: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    console.log(`📊 Total de movimientos encontrados: ${movimientos.length}`);
    
    if (movimientos.length > 0) {
      console.log('\n📋 Últimos 10 movimientos:');
      movimientos.forEach((mov, index) => {
        console.log(`${index + 1}. ${mov.createdAt.toISOString().split('T')[0]} - ${mov.type} - ${mov.product.nombre} - Cantidad: ${mov.quantity} - Almacén: ${mov.warehouse.nombre}`);
      });
    } else {
      console.log('❌ No se encontraron movimientos de inventario');
    }

    // Verificar almacenes
    const almacenes = await prisma.warehouse.findMany();
    console.log(`\n🏪 Almacenes disponibles: ${almacenes.length}`);
    almacenes.forEach(almacen => {
      console.log(`- ${almacen.codigo}: ${almacen.nombre}`);
    });

    // Verificar stock actual
    const stock = await prisma.stockByWarehouse.findMany({
      include: {
        product: true,
        warehouse: true
      },
      take: 5
    });

    console.log(`\n📦 Registros de stock: ${stock.length}`);
    if (stock.length > 0) {
      console.log('Primeros 5 registros de stock:');
      stock.forEach((s, index) => {
        console.log(`${index + 1}. ${s.product.nombre} - ${s.warehouse.nombre} - Cantidad: ${s.quantity}`);
      });
    }

  } catch (error) {
    console.error('❌ Error verificando datos de kardex:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKardexData();