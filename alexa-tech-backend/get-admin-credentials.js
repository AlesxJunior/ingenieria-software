/**
 * HELPER: Obtener credenciales de usuario admin
 * 
 * Ejecutar: node get-admin-credentials.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getAdminCredentials() {
  try {
    console.log('🔍 Buscando usuario admin en la base de datos...\n');
    
    // Buscar usuarios con rol Admin
    const admins = await prisma.user.findMany({
      where: {
        role: {
          name: {
            contains: 'Admin',
            mode: 'insensitive'
          }
        }
      },
      include: {
        role: {
          select: {
            name: true,
            permissions: true
          }
        }
      },
      take: 5
    });
    
    if (admins.length === 0) {
      console.error('❌ No se encontraron usuarios con rol Admin');
      console.log('\n💡 Opciones:');
      console.log('1. Ejecutar seed: cd alexa-tech-backend && npm run seed');
      console.log('2. Crear usuario admin manualmente en la BD');
      process.exit(1);
    }
    
    console.log(`✅ Encontrados ${admins.length} usuario(s) admin:\n`);
    
    admins.forEach((user, idx) => {
      console.log(`${idx + 1}. Usuario:`);
      console.log(`   Email:     ${user.email}`);
      console.log(`   Username:  ${user.username}`);
      console.log(`   Nombre:    ${user.firstName} ${user.lastName}`);
      console.log(`   Rol:       ${user.role.name}`);
      console.log(`   Permisos:  ${user.role.permissions.length}`);
      console.log(`   Activo:    ${user.isActive ? '✅' : '❌'}`);
      console.log('');
    });
    
    const firstAdmin = admins[0];
    
    console.log('═'.repeat(80));
    console.log('CREDENCIALES PARA TESTS:');
    console.log('═'.repeat(80));
    console.log('\n⚠️  NOTA: La contraseña está hasheada en la BD.');
    console.log('Si no conoces la contraseña, opciones:\n');
    console.log('1. Usar credenciales del seed (si ejecutaste npm run seed):');
    console.log('   {\n     email: "admin@alexatech.com",');
    console.log('     password: "Admin123!@#"\n   }');
    console.log('');
    console.log('2. O actualizar manualmente en test-users-module-e2e.js:');
    console.log('   const CREDENTIALS = {');
    console.log('     admin: {');
    console.log(`       email: "${firstAdmin.email}",`);
    console.log('       password: "TU_PASSWORD_AQUI" // Contraseña sin hashear');
    console.log('     }');
    console.log('   };');
    console.log('');
    console.log('3. O resetear password del admin en la BD:');
    console.log('   - Ejecutar script de reset password');
    console.log('   - O ejecutar npm run seed para recrear usuarios');
    console.log('═'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getAdminCredentials();
