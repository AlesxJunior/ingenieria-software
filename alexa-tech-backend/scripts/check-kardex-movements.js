const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkKardexMovements() {
  try {
    console.log('🔍 Verificando movimientos de kardex...\n');

    // Contar total de movimientos
    const total = await prisma.inventoryMovement.count();
    console.log(`📊 Total de movimientos: ${total}\n`);

    // Movimientos por almacén
    const warehouses = await prisma.warehouse.findMany();
    for (const warehouse of warehouses) {
      const count = await prisma.inventoryMovement.count({
        where: { warehouseId: warehouse.id }
      });
      if (count > 0) {
        console.log(`🏪 ${warehouse.nombre} (${warehouse.id}): ${count} movimientos`);
      }
    }

    // Últimos 5 movimientos del almacén principal
    console.log('\n📋 Últimos 5 movimientos en WH-PRINCIPAL:');
    const movements = await prisma.inventoryMovement.findMany({
      where: { warehouseId: 'WH-PRINCIPAL' },
      include: { product: true, warehouse: true },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    if (movements.length === 0) {
      console.log('❌ No hay movimientos en WH-PRINCIPAL');
    } else {
      movements.forEach((m, i) => {
        console.log(`${i + 1}. ${m.type} - ${m.product.nombre} - Cantidad: ${m.quantity} - Fecha: ${m.createdAt.toISOString().split('T')[0]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkKardexMovements();
