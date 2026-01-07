const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificar() {
  const motivos = await prisma.movementReason.findMany({
    where: { tipo: 'AJUSTE', activo: true }
  });

  console.log('\n📋 Motivos AJUSTE activos:', motivos.length);
  motivos.forEach((m, i) => {
    console.log(`  ${i + 1}. [${m.codigo}] ${m.nombre}`);
  });
  console.log('');

  await prisma.$disconnect();
}

verificar();
