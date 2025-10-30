const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMotivosKardex() {
  console.log('\n🔍 Verificando últimos movimientos de inventario...\n');

  const movements = await prisma.inventoryMovement.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      product: true,
      movementReason: true,
    }
  });

  movements.forEach((m, idx) => {
    console.log(`\n${idx + 1}. Movimiento ID: ${m.id}`);
    console.log(`   Producto: ${m.product?.nombre || 'N/A'}`);
    console.log(`   Tipo: ${m.type}`);
    console.log(`   Reason (legacy): "${m.reason}"`);
    console.log(`   ReasonId: ${m.reasonId || 'null'}`);
    console.log(`   MovementReason: ${m.movementReason ? `${m.movementReason.codigo} - ${m.movementReason.nombre}` : 'null'}`);
    console.log(`   Fecha: ${m.createdAt.toISOString()}`);
  });

  console.log('\n✅ Verificación completa\n');
}

checkMotivosKardex()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
