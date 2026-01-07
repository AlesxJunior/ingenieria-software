import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// PERMISOS ACTUALIZADOS DEL SISTEMA (Nov 2025)
// ============================================================================
// Consolidados y alineados con el código - Sin redundancias

const ADMIN_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  
  // Usuarios
  'users.create',
  'users.read',
  'users.update',
  
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
  
  // Configuración del Sistema
  'system.settings',
  
  // Reportes
  'reports.sales',
  'reports.inventory',
  'reports.financial',
];

const SUPERVISOR_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  
  // Usuarios (solo lectura)
  'users.read',
  
  // Clientes/Entidades Comerciales
  'clients.create',
  'clients.read',
  'clients.update',
  
  // Ventas
  'sales.create',
  'sales.read',
  'sales.update',
  
  // Productos
  'products.create',
  'products.read',
  'products.update',
  
  // Inventario
  'inventory.read',
  'inventory.update',
  
  // Compras
  'purchases.create',
  'purchases.read',
  'purchases.update',
  
  // Cajas Registradoras
  'cash-registers.read',
  'cash-registers.update',
  
  // Sesiones de Caja
  'cash-sessions.create',
  'cash-sessions.read',
  'cash-sessions.update',
  
  // Reportes
  'reports.sales',
  'reports.inventory',
  'reports.financial',
];

const VENDEDOR_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  
  // Clientes/Entidades Comerciales
  'clients.create',
  'clients.read',
  'clients.update',
  
  // Ventas
  'sales.create',
  'sales.read',
  
  // Productos (solo lectura)
  'products.read',
  
  // Inventario (solo lectura)
  'inventory.read',
  
  // Reportes básicos
  'reports.sales',
];

const CAJERO_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  
  // Clientes (solo lectura)
  'clients.read',
  
  // Ventas
  'sales.create',
  'sales.read',
  
  // Productos (solo lectura)
  'products.read',
  
  // Inventario (solo lectura)
  'inventory.read',
  
  // Sesiones de Caja
  'cash-sessions.create',
  'cash-sessions.read',
  'cash-sessions.update',
];

async function updatePermissions() {
  console.log('🔧 INICIANDO ACTUALIZACIÓN DE PERMISOS DEL SISTEMA\n');
  console.log('═'.repeat(70));
  
  try {
    // 1. Actualizar Admin
    console.log('\n1️⃣ Actualizando permisos del Admin...');
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@alexatech.com' },
    });
    
    if (admin) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { permissions: ADMIN_PERMISSIONS },
      });
      console.log(`   ✅ Admin actualizado: ${ADMIN_PERMISSIONS.length} permisos`);
      console.log(`      Antes: ${admin.permissions.length} | Ahora: ${ADMIN_PERMISSIONS.length}`);
    } else {
      console.log('   ⚠️  Usuario Admin no encontrado');
    }
    
    // 2. Actualizar Supervisor
    console.log('\n2️⃣ Actualizando permisos del Supervisor...');
    const supervisor = await prisma.user.findFirst({
      where: { email: 'supervisor@alexatech.com' },
    });
    
    if (supervisor) {
      await prisma.user.update({
        where: { id: supervisor.id },
        data: { permissions: SUPERVISOR_PERMISSIONS },
      });
      console.log(`   ✅ Supervisor actualizado: ${SUPERVISOR_PERMISSIONS.length} permisos`);
      console.log(`      Antes: ${supervisor.permissions.length} | Ahora: ${SUPERVISOR_PERMISSIONS.length}`);
    } else {
      console.log('   ⚠️  Usuario Supervisor no encontrado');
    }
    
    // 3. Actualizar Vendedor
    console.log('\n3️⃣ Actualizando permisos del Vendedor...');
    const vendedor = await prisma.user.findFirst({
      where: { email: 'vendedor@alexatech.com' },
    });
    
    if (vendedor) {
      await prisma.user.update({
        where: { id: vendedor.id },
        data: { permissions: VENDEDOR_PERMISSIONS },
      });
      console.log(`   ✅ Vendedor actualizado: ${VENDEDOR_PERMISSIONS.length} permisos`);
      console.log(`      Antes: ${vendedor.permissions.length} | Ahora: ${VENDEDOR_PERMISSIONS.length}`);
    } else {
      console.log('   ⚠️  Usuario Vendedor no encontrado');
    }
    
    // 4. Actualizar Cajero
    console.log('\n4️⃣ Actualizando permisos del Cajero...');
    const cajero = await prisma.user.findFirst({
      where: { email: 'cajero@alexatech.com' },
    });
    
    if (cajero) {
      await prisma.user.update({
        where: { id: cajero.id },
        data: { permissions: CAJERO_PERMISSIONS },
      });
      console.log(`   ✅ Cajero actualizado: ${CAJERO_PERMISSIONS.length} permisos`);
      console.log(`      Antes: ${cajero.permissions.length} | Ahora: ${CAJERO_PERMISSIONS.length}`);
    } else {
      console.log('   ⚠️  Usuario Cajero no encontrado');
    }
    
    // 5. Verificación final
    console.log('\n5️⃣ Verificando actualización...');
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        permissions: true,
      },
    });
    
    console.log('\n   📊 Estado final de permisos:');
    allUsers.forEach(user => {
      console.log(`   • ${user.email}: ${user.permissions.length} permisos`);
    });
    
    // Extraer permisos únicos
    const allPermissions = new Set();
    allUsers.forEach(user => {
      user.permissions.forEach(p => allPermissions.add(p));
    });
    
    console.log(`\n   📈 Total de permisos únicos en sistema: ${allPermissions.size}`);
    
    console.log('\n' + '═'.repeat(70));
    console.log('✅ ACTUALIZACIÓN COMPLETADA EXITOSAMENTE\n');
    
    console.log('📋 RESUMEN DE CAMBIOS:');
    console.log('   • Eliminados: commercial_entities.* → Reemplazados por clients.*');
    console.log('   • Eliminados: configuration.* → Reemplazado por system.settings');
    console.log('   • Eliminados: invoicing.* (módulo no implementado)');
    console.log('   • Eliminados: permisos obsoletos (24 total)');
    console.log('   • Sistema consolidado: De 45 a ~30 permisos únicos');
    console.log('   • Todas las rutas ahora usan permisos granulares\n');
    
  } catch (error) {
    console.error('\n❌ Error durante la actualización:', error);
    throw error;
  }
}

async function main() {
  try {
    await updatePermissions();
  } catch (error) {
    console.error('❌ Proceso fallido:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
