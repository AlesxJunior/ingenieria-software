/**
 * Script para actualizar órdenes con estado CERRADA a COMPLETADA
 * Ejecutar antes de aplicar la migración que elimina CERRADA del enum
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando órdenes de compra con estado CERRADA...');
  
  const ordenesConCerrada = await prisma.purchaseOrder.findMany({
    where: {
      estado: 'CERRADA'
    },
    select: {
      id: true,
      codigo: true,
      estado: true
    }
  });

  console.log(`📊 Encontradas ${ordenesConCerrada.length} órdenes con estado CERRADA`);

  if (ordenesConCerrada.length === 0) {
    console.log('✅ No hay órdenes con estado CERRADA. Puede aplicar la migración.');
    return;
  }

  console.log('🔄 Actualizando órdenes a COMPLETADA...');
  
  const resultado = await prisma.purchaseOrder.updateMany({
    where: {
      estado: 'CERRADA'
    },
    data: {
      estado: 'COMPLETADA'
    }
  });

  console.log(`✅ ${resultado.count} órdenes actualizadas de CERRADA a COMPLETADA`);
  console.log('✅ Ahora puede aplicar la migración de Prisma');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
