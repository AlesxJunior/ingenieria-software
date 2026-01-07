/**
 * Script para agregar permisos de configuración (categorías y unidades) al rol Admin
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Agregando permisos de configuración al rol Admin\n');
  
  try {
    // 1. Buscar el rol Admin
    const adminRole = await prisma.role.findFirst({
      where: { name: 'Admin' }
    });

    if (!adminRole) {
      console.error('❌ Rol Admin no encontrado');
      return;
    }

    console.log(`✅ Rol encontrado: ${adminRole.name} (${adminRole.id})`);
    console.log(`   Permisos actuales: ${adminRole.permissions.length}\n`);

    // 2. Permisos a agregar
    const permisosNecesarios = [
      'system.settings',         // Acceso a configuración general
      'categories.read',         // Leer categorías
      'categories.create',       // Crear categorías
      'categories.update',       // Actualizar categorías
      'categories.delete',       // Eliminar categorías
      'units.read',             // Leer unidades
      'units.create',           // Crear unidades
      'units.update',           // Actualizar unidades
      'units.delete',           // Eliminar unidades
    ];

    // 3. Verificar cuáles ya existen
    const permisosExistentes = adminRole.permissions || [];
    const permisosAAgregar = permisosNecesarios.filter(p => !permisosExistentes.includes(p));

    if (permisosAAgregar.length === 0) {
      console.log('✅ Todos los permisos ya están asignados\n');
      console.log('Permisos de configuración actuales:');
      permisosExistentes
        .filter(p => p.includes('system') || p.includes('categories') || p.includes('units'))
        .forEach(p => console.log(`  ✓ ${p}`));
      return;
    }

    console.log('📋 Permisos a agregar:');
    permisosAAgregar.forEach(p => console.log(`   - ${p}`));
    console.log('');

    // 4. Agregar permisos al array
    const nuevosPermisos = [...permisosExistentes, ...permisosAAgregar];
    
    await prisma.role.update({
      where: { id: adminRole.id },
      data: { permissions: nuevosPermisos }
    });

    console.log(`✅ ${permisosAAgregar.length} permisos agregados exitosamente al rol Admin\n`);

    // 5. Verificar
    const updated = await prisma.role.findUnique({
      where: { id: adminRole.id }
    });

    console.log('📊 Resumen final:');
    console.log(`   Total de permisos: ${updated.permissions.length}`);
    console.log(`   Permisos de configuración:`);
    updated.permissions
      .filter(p => p.includes('system') || p.includes('categories') || p.includes('units'))
      .forEach(p => console.log(`     ✓ ${p}`));

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getDescripcion(nombre) {
  const descripciones = {
    'system.settings': 'Acceso a configuración general del sistema',
    'categories.read': 'Ver categorías de productos',
    'categories.create': 'Crear nuevas categorías',
    'categories.update': 'Actualizar categorías existentes',
    'categories.delete': 'Eliminar categorías',
    'units.read': 'Ver unidades de medida',
    'units.create': 'Crear nuevas unidades',
    'units.update': 'Actualizar unidades existentes',
    'units.delete': 'Eliminar unidades',
  };
  return descripciones[nombre] || nombre;
}

function getModulo(nombre) {
  if (nombre.includes('categories')) return 'Productos';
  if (nombre.includes('units')) return 'Productos';
  if (nombre.includes('system')) return 'Sistema';
  return 'Configuración';
}

main()
  .then(() => {
    console.log('\n✨ Proceso completado\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
