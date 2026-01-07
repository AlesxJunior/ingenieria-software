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
      
      // Sesiones de Caja
      'cash-sessions.create',
      'cash-sessions.read',
      'cash-sessions.update',
      'cash-sessions.delete',
      
      // Configuración
      'settings.read',
      'settings.update',
      
      // Auditoría
      'audit.read',
      
      // Reportes
      'reports.read',
    ];

    // Buscar el rol de Admin
    const adminRole = await prisma.role.findFirst({
      where: {
        name: 'Admin'
      }
    });

    if (!adminRole) {
      console.log('❌ No se encontró el rol Administrador');
      return;
    }

    console.log(`📋 Rol encontrado: ${adminRole.name} (ID: ${adminRole.id})`);
    console.log(`📊 Permisos actuales: ${adminRole.permissions.length}`);

    // Actualizar permisos
    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        permissions: adminPermissions
      }
    });

    console.log('✅ Permisos del rol Administrador actualizados exitosamente');
    console.log(`📊 Nuevos permisos: ${adminPermissions.length}`);
    
  } catch (error) {
    console.error('❌ Error al actualizar permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminPermissions();
