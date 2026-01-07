import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProducts() {
  const productos = await prisma.product.findMany({
    select: { codigo: true, nombre: true }
  });
  
  console.log('Productos disponibles:');
  productos.forEach(p => console.log(`  ${p.codigo} - ${p.nombre}`));
  
  await prisma.$disconnect();
}

checkProducts();
