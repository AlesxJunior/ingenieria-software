const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdminPermissions() {
  try {
    console.log('🔧 Actualizando permisos del rol Administrador...');

    const adminPermissions = [
      // Dashboard
      'dashboard.read',
      
      // Usuarios
      'users.create',
      'users.read',
      'users.update',
      'users.delete',
      
      // Roles
      'roles.create',
      'roles.read',
      'roles.update',
      'roles.delete',
      
      // Clientes/Entidades Comerciales
      'clients.create',
      'clients.read',
      'clients.update',
      'clients.delete',
      
      // Ventas
      'sales.create',
      'sales.read',
      'sales.update',
      'sales.delete',
      
      // Productos
      'products.create',
      'products.read',
      'products.update',
      'products.delete',
      
      // Inventario
      'inventory.read',
      'inventory.update',
      
      // Almacenes
      'warehouses.create',
      'warehouses.read',
      'warehouses.update',
      'warehouses.delete',
      
      // Compras
      'purchases.create',
      'purchases.read',
      'purchases.update',
      'purchases.delete',
      
      // Cajas Registradoras
      'cash-registers.create',
      'cash-registers.read',
      'cash-registers.update',
      'cash-registers.delete',
      
      // Configuración
      'settings.read',
      'settings.update',
      
      // Auditoría
      'audit.read',
      
      // Reportes
      'reports.read',
    ];

    // Buscar el rol de Administrador
    const adminRole = await prisma.role.findFirst({
      where: {
        name: 'Administrador'
      }
    });

    if (!adminRole) {
      console.log('❌ No se encontró el rol Administrador');
      return;
    }

    // Actualizar permisos
    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        permissions: adminPermissions
      }
    });

    console.log('✅ Permisos del rol Administrador actualizados exitosamente');
    console.log(`📊 Total de permisos: ${adminPermissions.length}`);
    
  } catch (error) {
    console.error('❌ Error al actualizar permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPermissions();
