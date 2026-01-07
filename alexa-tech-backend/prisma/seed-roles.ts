import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// PERMISOS POR ROL - BASADOS EN EL SISTEMA ACTUAL
// ============================================================================
// Estos permisos coinciden exactamente con los definidos en seed.ts

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

// ============================================================================
// FUNCIÓN PRINCIPAL: MIGRACIÓN A RBAC
// ============================================================================

async function main() {
  console.log('🔄 Iniciando migración a sistema RBAC...\n');

  // ============================================================================
  // PASO 1: CREAR ROLES DEL SISTEMA
  // ============================================================================
  console.log('1️⃣  Creando roles del sistema...');

  const adminRole = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {
      permissions: ADMIN_PERMISSIONS,
      description: 'Administrador del sistema con acceso completo a todas las funcionalidades',
    },
    create: {
      name: 'Admin',
      description: 'Administrador del sistema con acceso completo a todas las funcionalidades',
      permissions: ADMIN_PERMISSIONS,
      isSystem: true,
      isActive: true,
    },
  });

  const supervisorRole = await prisma.role.upsert({
    where: { name: 'Supervisor' },
    update: {
      permissions: SUPERVISOR_PERMISSIONS,
      description: 'Supervisor con acceso a gestión de operaciones y reportes',
    },
    create: {
      name: 'Supervisor',
      description: 'Supervisor con acceso a gestión de operaciones y reportes',
      permissions: SUPERVISOR_PERMISSIONS,
      isSystem: true,
      isActive: true,
    },
  });

  const vendedorRole = await prisma.role.upsert({
    where: { name: 'Vendedor' },
    update: {
      permissions: VENDEDOR_PERMISSIONS,
      description: 'Vendedor con acceso a ventas y gestión de clientes',
    },
    create: {
      name: 'Vendedor',
      description: 'Vendedor con acceso a ventas y gestión de clientes',
      permissions: VENDEDOR_PERMISSIONS,
      isSystem: true,
      isActive: true,
    },
  });

  const cajeroRole = await prisma.role.upsert({
    where: { name: 'Cajero' },
    update: {
      permissions: CAJERO_PERMISSIONS,
      description: 'Cajero con acceso a operaciones de caja y ventas básicas',
    },
    create: {
      name: 'Cajero',
      description: 'Cajero con acceso a operaciones de caja y ventas básicas',
      permissions: CAJERO_PERMISSIONS,
      isSystem: true,
      isActive: true,
    },
  });

  console.log('   ✅ Roles creados:');
  console.log(`      - Admin (${ADMIN_PERMISSIONS.length} permisos)`);
  console.log(`      - Supervisor (${SUPERVISOR_PERMISSIONS.length} permisos)`);
  console.log(`      - Vendedor (${VENDEDOR_PERMISSIONS.length} permisos)`);
  console.log(`      - Cajero (${CAJERO_PERMISSIONS.length} permisos)\n`);

  // ============================================================================
  // PASO 2: MIGRAR USUARIOS EXISTENTES
  // ============================================================================
  console.log('2️⃣  Migrando usuarios existentes a roles...');

  const users = await prisma.user.findMany({
    where: { isActive: true },
  });

  console.log(`   📋 Usuarios encontrados: ${users.length}`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const user of users) {
    // Usuarios que ya tienen rol asignado
    if (user.roleId) {
      console.log(`   ⏭️  ${user.username} - Ya tiene rol asignado (${user.roleId})`);
      skippedCount++;
      continue;
    }

    // Inferir rol basándose en permisos actuales
    const permCount = user.permissions.length;
    let assignedRole: { id: string; name: string } | null = null;

    // Lógica de inferencia:
    // - Admin: 33 permisos (todos)
    // - Supervisor: 24 permisos
    // - Vendedor: 9 permisos
    // - Cajero: 9 permisos (distinguir por tipo de permisos)

    if (permCount >= 30) {
      // Usuario con muchos permisos = Admin
      assignedRole = adminRole;
    } else if (permCount >= 20) {
      // Usuario con permisos moderados = Supervisor
      assignedRole = supervisorRole;
    } else if (permCount >= 8 && permCount <= 12) {
      // Distinguir entre Vendedor y Cajero
      const hasCashPermissions = user.permissions.some(p => p.includes('cash-sessions'));
      const hasSalesPermissions = user.permissions.some(p => p.includes('sales'));

      if (hasCashPermissions && hasSalesPermissions) {
        // Tiene permisos de caja y ventas = Cajero
        assignedRole = cajeroRole;
      } else if (hasSalesPermissions) {
        // Solo ventas = Vendedor
        assignedRole = vendedorRole;
      } else {
        // Por defecto vendedor
        assignedRole = vendedorRole;
      }
    } else if (permCount > 0) {
      // Pocos permisos = Vendedor por defecto
      assignedRole = vendedorRole;
    }

    if (assignedRole) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: assignedRole.id },
      });

      console.log(`   ✅ ${user.username.padEnd(15)} → ${assignedRole.name.padEnd(12)} (${permCount} permisos)`);
      migratedCount++;
    } else {
      console.log(`   ⚠️  ${user.username} - No se pudo inferir rol (${permCount} permisos)`);
      skippedCount++;
    }
  }

  console.log('\n   📊 Resumen de migración:');
  console.log(`      - Usuarios migrados: ${migratedCount}`);
  console.log(`      - Usuarios omitidos: ${skippedCount}`);
  console.log(`      - Total procesados: ${users.length}\n`);

  // ============================================================================
  // PASO 3: VALIDACIÓN
  // ============================================================================
  console.log('3️⃣  Validando migración...');

  const usersWithoutRole = await prisma.user.count({
    where: {
      isActive: true,
      roleId: null,
    },
  });

  const usersWithRole = await prisma.user.count({
    where: {
      isActive: true,
      roleId: { not: null },
    },
  });

  console.log(`   ✅ Usuarios con rol asignado: ${usersWithRole}`);
  console.log(`   ⚠️  Usuarios sin rol: ${usersWithoutRole}`);

  // Mostrar distribución de usuarios por rol
  const roleDistribution = await prisma.user.groupBy({
    by: ['roleId'],
    where: { isActive: true, roleId: { not: null } },
    _count: { id: true },
  });

  console.log('\n   📊 Distribución de usuarios por rol:');
  for (const dist of roleDistribution) {
    const role = await prisma.role.findUnique({ where: { id: dist.roleId! } });
    if (role) {
      console.log(`      - ${role.name.padEnd(12)}: ${dist._count.id} usuarios`);
    }
  }

  // ============================================================================
  // PASO 4: INFORMACIÓN FINAL
  // ============================================================================
  console.log('\n✅ Migración a RBAC completada exitosamente!\n');
  console.log('📝 Notas importantes:');
  console.log('   1. Los permisos legacy (user.permissions) se mantienen por compatibilidad');
  console.log('   2. El middleware auth.ts priorizará role.permissions sobre user.permissions');
  console.log('   3. Los roles del sistema (isSystem=true) no pueden ser eliminados');
  console.log('   4. Nuevos usuarios deben crearse con roleId, no con permissions directos\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
