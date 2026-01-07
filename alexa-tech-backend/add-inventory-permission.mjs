/**
 * Verificar y agregar permiso reports.inventory (para reportes de compras)
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkInventoryPermission() {
  try {
    const adminRole = await prisma.role.findFirst({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.log('❌ Rol Admin no encontrado');
      return;
    }

    console.log(`📋 Permisos actuales: ${adminRole.permissions.length}`);
    console.log(`   Permisos de reportes:`);
    
    const reportPerms = adminRole.permissions.filter(p => p.startsWith('reports.'));
    reportPerms.forEach(p => console.log(`   - ${p}`));

    if (!adminRole.permissions.includes('reports.inventory')) {
      console.log(`\n🔧 Agregando permiso reports.inventory...`);
      
      await prisma.role.update({
        where: { id: adminRole.id },
        data: {
          permissions: [...adminRole.permissions, 'reports.inventory']
        }
      });

      console.log(`✅ Permiso reports.inventory agregado`);
    } else {
      console.log(`\n✅ El rol ya tiene permiso reports.inventory`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkInventoryPermission();
