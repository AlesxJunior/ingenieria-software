/**
 * Verificar credenciales del usuario admin
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCredentials() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@alexatech.com' }
    });

    if (admin) {
      console.log('✅ Usuario encontrado:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Activo: ${admin.isActive}`);
      console.log(`\n🔐 Nota: La contraseña está hasheada en la BD`);
      console.log(`   Hash: ${admin.password.substring(0, 20)}...`);
    } else {
      console.log('❌ Usuario no encontrado');
      
      // Buscar cualquier usuario
      const users = await prisma.user.findMany({ take: 3 });
      console.log(`\n📋 Usuarios disponibles: ${users.length}`);
      users.forEach(u => {
        console.log(`   - ${u.email} (${u.username})`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCredentials();
