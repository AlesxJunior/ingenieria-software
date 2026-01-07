/**
 * Agregar permiso reports.sales al rol Admin
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addReportSalesPermission() {
  try {
    console.log('🔧 AGREGANDO PERMISO reports.sales...\n');

    // Buscar rol Admin
    const adminRole = await prisma.role.findFirst({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.log('❌ Rol Admin no encontrado');
      return;
    }

    console.log(`✅ Rol encontrado: ${adminRole.name}`);
    console.log(`   Permisos actuales: ${adminRole.permissions.length}`);

    // Verificar si ya tiene el permiso
    if (adminRole.permissions.includes('reports.sales')) {
      console.log(`\n✅ El rol ya tiene el permiso reports.sales`);
      return;
    }

    // Agregar el permiso
    const updatedPermissions = [...adminRole.permissions, 'reports.sales', 'reports.inventory', 'reports.financial'];

    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        permissions: updatedPermissions
      }
    });

    console.log(`\n✅ Permisos agregados exitosamente:`);
    console.log(`   - reports.sales`);
    console.log(`   - reports.inventory`);
    console.log(`   - reports.financial`);
    console.log(`\n📊 Total de permisos: ${updatedPermissions.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addReportSalesPermission();
