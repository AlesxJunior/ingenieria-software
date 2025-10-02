const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

// Plantillas de permisos basadas en roles actuales - Sistema CRUD unificado
const ROLE_PERMISSION_TEMPLATES = {
  ADMIN: [
    // Permisos de usuarios
    'users.create', 'users.read', 'users.update', 'users.delete',
    // Permisos de ventas
    'sales.create', 'sales.read', 'sales.update', 'sales.delete',
    // Permisos de productos
    'products.create', 'products.read', 'products.update', 'products.delete',
    // Permisos de inventario
    'inventory.read', 'inventory.update',
    // Permisos de reportes
    'reports.sales', 'reports.users'
  ],
  SUPERVISOR: [
    // Permisos de usuarios
    'users.read',
    // Permisos de ventas
    'sales.create', 'sales.read', 'sales.update',
    // Permisos de productos
    'products.create', 'products.read', 'products.update',
    // Permisos de inventario
    'inventory.read', 'inventory.update',
    // Permisos de reportes
    'reports.sales'
  ],
  VENDEDOR: [
    // Permisos de ventas
    'sales.create', 'sales.read',
    // Permisos de productos
    'products.read',
    // Permisos de inventario
    'inventory.read'
  ],
  CAJERO: [
    // Permisos de ventas
    'sales.create', 'sales.read',
    // Permisos de productos
    'products.read',
    // Permisos de inventario
    'inventory.read'
  ]
};

async function migrateRolesToPermissions() {
  try {
    console.log('Iniciando migración de roles a permisos...');
    
    // Obtener todos los usuarios con sus roles actuales
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        permissions: true
      }
    });

    console.log(`Encontrados ${users.length} usuarios para migrar`);

    for (const user of users) {
      const rolePermissions = ROLE_PERMISSION_TEMPLATES[user.role] || [];
      
      // Combinar permisos existentes con los del rol (sin duplicados)
      const existingPermissions = user.permissions || [];
      const newPermissions = [...new Set([...existingPermissions, ...rolePermissions])];

      await prisma.user.update({
        where: { id: user.id },
        data: { permissions: newPermissions }
      });

      console.log(`Usuario ${user.email}: ${user.role} -> ${newPermissions.length} permisos`);
    }

    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateRolesToPermissions();