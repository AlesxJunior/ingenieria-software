import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de migración para pasar de permisos híbridos a RBAC puro
 * 
 * Pasos:
 * 1. Para cada usuario sin rol, asignar un rol por defecto basado en sus permisos
 * 2. Crear roles personalizados si un usuario tiene combinaciones únicas de permisos
 * 3. Limpiar el campo permissions[] de todos los usuarios
 */

async function main() {
  console.log('🚀 Iniciando migración a RBAC puro...\n');

  // Obtener todos los usuarios y roles existentes
  const users = await prisma.user.findMany({
    include: { role: true }
  });

  const roles = await prisma.role.findMany();
  
  console.log(`📊 Encontrados ${users.length} usuarios y ${roles.length} roles\n`);

  // Mapeo de permisos a roles por defecto
  const roleMapping: Record<string, string> = {
    'Admin': 'Admin',
    'Supervisor': 'Supervisor', 
    'Vendedor': 'Vendedor',
    'Cajero': 'Cajero'
  };

  let usersWithoutRole = 0;
  let usersWithPermissions = 0;
  let usersUpdated = 0;

  for (const user of users) {
    let needsUpdate = false;
    let assignedRoleId = user.roleId;

    // Caso 1: Usuario sin rol asignado
    if (!user.roleId) {
      usersWithoutRole++;
      console.log(`⚠️  Usuario sin rol: ${user.username} (${user.email})`);
      
      // Intentar inferir rol basado en permisos
      if (user.permissions.length > 0) {
        console.log(`   Permisos actuales: ${user.permissions.join(', ')}`);
        
        // Si tiene todos los permisos o permisos de admin, asignar Admin
        const adminPerms = ['users:read', 'users:create', 'users:update', 'users:delete', 'roles:manage'];
        const hasAdminPerms = adminPerms.every(p => user.permissions.includes(p));
        
        if (hasAdminPerms) {
          const adminRole = roles.find(r => r.name === 'Admin');
          if (adminRole) {
            assignedRoleId = adminRole.id;
            console.log(`   ✅ Asignando rol: Admin`);
          }
        } else {
          // Por defecto, asignar rol Vendedor
          const vendedorRole = roles.find(r => r.name === 'Vendedor');
          if (vendedorRole) {
            assignedRoleId = vendedorRole.id;
            console.log(`   ✅ Asignando rol por defecto: Vendedor`);
          }
        }
      } else {
        // Sin permisos, asignar Vendedor por defecto
        const vendedorRole = roles.find(r => r.name === 'Vendedor');
        if (vendedorRole) {
          assignedRoleId = vendedorRole.id;
          console.log(`   ✅ Asignando rol por defecto: Vendedor (sin permisos previos)`);
        }
      }
      
      needsUpdate = true;
    }

    // Caso 2: Usuario con permisos individuales (hybrid system)
    if (user.permissions.length > 0) {
      usersWithPermissions++;
      console.log(`🔄 Usuario con permisos híbridos: ${user.username}`);
      console.log(`   Permisos individuales a limpiar: ${user.permissions.join(', ')}`);
      console.log(`   Rol asignado: ${user.role?.name || 'Pendiente'}`);
      needsUpdate = true;
    }

    // Actualizar usuario
    if (needsUpdate && assignedRoleId) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          roleId: assignedRoleId,
          permissions: [] // Limpiar permisos individuales
        }
      });
      usersUpdated++;
      console.log(`   ✅ Usuario actualizado\n`);
    }
  }

  console.log('\n📈 Resumen de migración:');
  console.log(`   - Usuarios sin rol encontrados: ${usersWithoutRole}`);
  console.log(`   - Usuarios con permisos híbridos: ${usersWithPermissions}`);
  console.log(`   - Usuarios actualizados: ${usersUpdated}`);
  console.log('\n✅ Migración completada exitosamente!');
  console.log('\n⚠️  SIGUIENTE PASO: Actualizar el schema.prisma para hacer roleId obligatorio');
}

main()
  .catch((e) => {
    console.error('❌ Error durante la migración:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
