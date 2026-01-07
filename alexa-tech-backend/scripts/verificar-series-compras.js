// Script temporal para verificar series de compras
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificar() {
  const comprobantes = await prisma.comprobanteType.findMany({
    where: {
      tipo: {
        in: ['orden-compra', 'recepcion-compra']
      }
    }
  });

  console.log('\n📋 SERIES DE COMPRAS CONFIGURADAS:\n');
  comprobantes.forEach(c => {
    const proximo = `${c.serie}-${String(c.numeroActual + 1).padStart(4, '0')}`;
    console.log(`✅ ${c.nombre}`);
    console.log(`   Serie: ${c.serie}`);
    console.log(`   Próximo: ${proximo}`);
    console.log(`   Activo: ${c.activo ? 'Sí' : 'No'}`);
    console.log(`   Predeterminado: ${c.predeterminado ? 'Sí' : 'No'}`);
    console.log('');
  });

  await prisma.$disconnect();
}

verificar();
