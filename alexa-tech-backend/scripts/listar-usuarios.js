const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listarUsuarios() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      isActive: true
    }
  });

  console.log('\n📋 USUARIOS EN EL SISTEMA:\n');
  users.forEach(u => {
    console.log(`${u.isActive ? '✅' : '❌'} ${u.firstName} ${u.lastName}`);
    console.log(`   Email: ${u.email}`);
    console.log(`   Username: ${u.username}`);
    console.log('');
  });

  await prisma.$disconnect();
}

listarUsuarios();
