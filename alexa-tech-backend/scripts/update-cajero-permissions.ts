import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  
  // Cajas Registradoras (lectura para ver las cajas disponibles)
  'cash-registers.read',
  
  // Sesiones de Caja
  'cash-sessions.create',
  'cash-sessions.read',
  'cash-sessions.update',
];

async function updateCajeroPermissions() {
  console.log('🔄 Actualizando permisos del rol Cajero...');

  try {
    // Buscar rol Cajero
    const cajeroRole = await prisma.role.findFirst({
      where: { name: 'Cajero' }
    });

    if (!cajeroRole) {
      console.log('❌ Rol Cajero no encontrado');
      return;
    }

    // Actualizar permisos del rol
    await prisma.role.update({
      where: { id: cajeroRole.id },
      data: {
        permissions: CAJERO_PERMISSIONS
      }
    });

    console.log('✅ Permisos actualizados para el rol Cajero');
    console.log('📋 Permisos:', CAJERO_PERMISSIONS);
  } catch (error) {
    console.error('❌ Error actualizando permisos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCajeroPermissions();
