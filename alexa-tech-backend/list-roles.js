const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listRoles() {
  try {
    console.log('📋 Listando todos los roles...\n');

    const roles = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        permissions: true,
        isActive: true
      }
    });

    roles.forEach((role, index) => {
      console.log(`${index + 1}. ${role.name}`);
      console.log(`   ID: ${role.id}`);
      console.log(`   Descripción: ${role.description}`);
      console.log(`   Activo: ${role.isActive}`);
      console.log(`   Permisos (${role.permissions.length}): ${role.permissions.slice(0, 5).join(', ')}...`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listRoles();
