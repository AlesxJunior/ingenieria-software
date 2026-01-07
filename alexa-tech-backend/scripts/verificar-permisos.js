const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarPermisos() {
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@alexatech.com' },
    include: {
      role: true
    }
  });

  console.log('\n👤 USUARIO ADMIN:\n');
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role?.name || 'Sin rol'}`);
  console.log(`Permisos directos: ${JSON.stringify(admin.permissions)}`);
  
  if (admin.role) {
    console.log(`\n📋 PERMISOS DEL ROL ${admin.role.name}:\n`);
    console.log(`Permissions array: ${JSON.stringify(admin.role.permissions)}`);
  }

  await prisma.$disconnect();
}

verificarPermisos();
