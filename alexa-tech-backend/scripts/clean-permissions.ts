import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando campo permissions de todos los usuarios...');
  
  const result = await prisma.user.updateMany({
    data: {
      permissions: []
    }
  });
  
  console.log(`✅ ${result.count} usuarios actualizados`);
  
  // Verificar
  const usersWithPerms = await prisma.user.findMany({
    where: {
      permissions: {
        isEmpty: false
      }
    },
    select: {
      username: true,
      permissions: true
    }
  });
  
  if (usersWithPerms.length > 0) {
    console.log('⚠️  Usuarios con permisos todavía:');
    usersWithPerms.forEach(u => console.log(`   - ${u.username}: ${u.permissions}`));
  } else {
    console.log('✅ Todos los usuarios tienen permissions vacío');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
