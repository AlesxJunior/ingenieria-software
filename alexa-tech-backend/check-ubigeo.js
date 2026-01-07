const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUbigeo() {
  try {
    // Buscar Callao
    const callao = await prisma.departamento.findMany({
      where: { nombre: { contains: 'Callao', mode: 'insensitive' } },
      include: {
        provincias: {
          take: 1,
          include: {
            distritos: { take: 1 }
          }
        }
      }
    });
    
    console.log('Departamentos de Callao encontrados:');
    console.log(JSON.stringify(callao, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUbigeo();
