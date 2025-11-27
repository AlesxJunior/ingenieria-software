const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔄 Reseteando contraseña del administrador...\n');

  try {
    // Buscar usuario admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@alexatech.com' }
    });

    if (!admin) {
      console.log('❌ No se encontró el usuario admin@alexatech.com');
      return;
    }

    // Hash de la nueva contraseña
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });

    console.log('✅ Contraseña actualizada correctamente');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Nueva contraseña: ${newPassword}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
