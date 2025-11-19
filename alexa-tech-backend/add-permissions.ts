import { prisma } from './src/config/database';

async function addPermissions() {
  try {
    const admin = await prisma.user.findFirst({
      where: { username: 'admin' }
    });

    if (!admin) {
      console.log('✗ Usuario admin no encontrado');
      return;
    }

    // Agregar permisos de configuración
    const currentPermissions = admin.permissions;
    const newPermissions = [
      ...currentPermissions,
      'system.settings',
      'system.configuration',
      'system.backup',
      'system.logs',
      'reports.view'
    ];

    // Eliminar duplicados
    const uniquePermissions = [...new Set(newPermissions)];

    await prisma.user.update({
      where: { id: admin.id },
      data: { permissions: uniquePermissions }
    });

    console.log('✓ Permisos agregados al usuario admin');
    console.log('  Permisos anteriores:', currentPermissions.length);
    console.log('  Permisos actuales:', uniquePermissions.length);
    console.log('  Nuevos permisos:', uniquePermissions.filter(p => !currentPermissions.includes(p)).join(', '));

    await prisma.$disconnect();
  } catch (error) {
    console.error('✗ Error:', error);
    await prisma.$disconnect();
  }
}

addPermissions();
