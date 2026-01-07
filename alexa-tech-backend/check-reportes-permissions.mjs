/**
 * Verificar permisos del usuario admin para reportes
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPermissions() {
  try {
    console.log('🔍 VERIFICANDO PERMISOS DE REPORTES...\n');

    // 1. Buscar usuario admin
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@alexatech.com' },
      include: {
        role: true
      }
    });

    if (!admin) {
      console.log('❌ Usuario admin no encontrado');
      return;
    }

    console.log(`✅ Usuario encontrado: ${admin.firstName} ${admin.lastName}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Rol: ${admin.role?.name || 'Sin rol'}`);

    if (admin.role?.permissions) {
      console.log(`\n📋 PERMISOS DEL ROL (${admin.role.permissions.length} total):`);
      
      const reportePerms = admin.role.permissions.filter(p => p.startsWith('reports.'));
      
      if (reportePerms.length > 0) {
        console.log(`\n✅ Permisos de reportes encontrados (${reportePerms.length}):`);
        reportePerms.forEach(p => {
          console.log(`   - ${p}`);
        });
      } else {
        console.log(`\n⚠️  NO tiene permisos de reportes`);
        console.log(`\n🔧 Agregando permisos de reportes...`);
        
        // Agregar permisos al rol
        const currentPermissions = admin.role.permissions;
        const newPermissions = [
          ...currentPermissions,
          'reports.sales',
          'reports.inventory',
          'reports.financial'
        ];

        await prisma.role.update({
          where: { id: admin.roleId },
          data: {
            permissions: newPermissions
          }
        });

        console.log(`   ✅ Permisos agregados al rol ${admin.role.name}`);
      }

      // Verificar permisos de ventas
      const ventasPerms = admin.role.permissions.filter(p => p.startsWith('sales.'));
      console.log(`\n💰 Permisos de ventas: ${ventasPerms.length}`);
      ventasPerms.slice(0, 5).forEach(p => {
        console.log(`   - ${p}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPermissions();
