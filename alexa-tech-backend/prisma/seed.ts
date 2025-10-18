import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Definir permisos para cada tipo de usuario
const ADMIN_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Usuarios
  'users.create', 'users.read', 'users.update', 'users.delete',
  // Entidades Comerciales
  'commercial_entities.create', 'commercial_entities.read', 'commercial_entities.update',
  // Ventas
  'sales.create', 'sales.read', 'sales.update', 'sales.delete',
  // Productos
  'products.create', 'products.read', 'products.update', 'products.delete',
  // Inventario
  'inventory.read', 'inventory.update',
  // Compras
  'purchases.create', 'purchases.read', 'purchases.update', 'purchases.delete',
  // Facturación
  'invoicing.create', 'invoicing.read', 'invoicing.update', 'invoicing.delete',
  // Configuración
  'configuration.read', 'configuration.update',
  // Reportes
  'reports.sales', 'reports.users', 'reports.inventory', 'reports.financial'
];

const SUPERVISOR_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Usuarios (solo lectura)
  'users.read',
  // Entidades Comerciales
  'commercial_entities.create', 'commercial_entities.read', 'commercial_entities.update',
  // Ventas
  'sales.create', 'sales.read', 'sales.update',
  // Productos
  'products.create', 'products.read', 'products.update',
  // Inventario
  'inventory.read', 'inventory.update',
  // Compras
  'purchases.create', 'purchases.read', 'purchases.update',
  // Facturación
  'invoicing.create', 'invoicing.read', 'invoicing.update',
  // Configuración (solo lectura)
  'configuration.read',
  // Reportes
  'reports.sales', 'reports.inventory', 'reports.financial'
];

const VENDEDOR_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Entidades Comerciales
  'commercial_entities.create', 'commercial_entities.read', 'commercial_entities.update',
  // Ventas
  'sales.create', 'sales.read',
  // Productos (solo lectura)
  'products.read',
  // Inventario (solo lectura)
  'inventory.read',
  // Facturación
  'invoicing.create', 'invoicing.read',
  // Reportes básicos
  'reports.sales'
];

const CAJERO_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Entidades Comerciales (solo lectura)
  'commercial_entities.read',
  // Ventas
  'sales.create', 'sales.read',
  // Productos (solo lectura)
  'products.read',
  // Inventario (solo lectura)
  'inventory.read',
  // Facturación
  'invoicing.create', 'invoicing.read'
];

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.user.deleteMany();
  console.log('🗑️  Datos existentes eliminados');

  // Hashear contraseñas
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const hashedVendedorPassword = await bcrypt.hash('vendedor123', 12);
  const hashedCajeroPassword = await bcrypt.hash('cajero123', 12);
  const hashedSupervisorPassword = await bcrypt.hash('supervisor123', 12);

  console.log('👤 Creando usuarios...');
  
  // Crear usuarios iniciales
  const admin = await prisma.user.create({
    data: {
      email: 'admin@alexatech.com',
      username: 'admin',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      permissions: ADMIN_PERMISSIONS,
      isActive: true,
    },
  });

  const vendedor = await prisma.user.create({
    data: {
      email: 'vendedor@alexatech.com',
      username: 'vendedor',
      password: hashedVendedorPassword,
      firstName: 'Juan',
      lastName: 'Vendedor',
      permissions: VENDEDOR_PERMISSIONS,
      isActive: true,
    },
  });

  const cajero = await prisma.user.create({
    data: {
      email: 'cajero@alexatech.com',
      username: 'cajero',
      password: hashedCajeroPassword,
      firstName: 'María',
      lastName: 'Cajero',
      permissions: CAJERO_PERMISSIONS,
      isActive: true,
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@alexatech.com',
      username: 'supervisor',
      password: hashedSupervisorPassword,
      firstName: 'Carlos',
      lastName: 'Supervisor',
      permissions: SUPERVISOR_PERMISSIONS,
      isActive: true,
    },
  });

  console.log('👤 Usuarios creados:');
  console.log(`   Admin: ${admin.email} (${admin.permissions.length} permisos)`);
  console.log(`   Vendedor: ${vendedor.email} (${vendedor.permissions.length} permisos)`);
  console.log(`   Cajero: ${cajero.email} (${cajero.permissions.length} permisos)`);
  console.log(`   Supervisor: ${supervisor.email} (${supervisor.permissions.length} permisos)`);

  console.log('✅ Seed completado exitosamente - Sistema basado en permisos');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });