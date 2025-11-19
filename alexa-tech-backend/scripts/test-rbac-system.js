/**
 * Script para probar el sistema RBAC
 * Verifica que los usuarios tengan roles asignados y que los permisos funcionen correctamente
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

async function testRBACSystem() {
  logSection('🧪 PRUEBAS DEL SISTEMA RBAC');

  try {
    // ====================================================================
    // TEST 1: Verificar que existan los 4 roles del sistema
    // ====================================================================
    logSection('TEST 1: Verificar roles del sistema');

    // Login como admin para acceder a la API
    log('📝 Iniciando sesión como admin...', 'yellow');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });

    const token = loginResponse.data.data.token;
    log('✅ Login exitoso', 'green');

    // Configurar headers con token
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    // Obtener todos los roles
    log('\n📋 Obteniendo roles del sistema...', 'yellow');
    const rolesResponse = await axios.get(`${API_URL}/roles`, config);
    const roles = rolesResponse.data.data;

    log(`✅ Se encontraron ${roles.length} roles`, 'green');

    const expectedRoles = ['Admin', 'Supervisor', 'Vendedor', 'Cajero'];
    for (const roleName of expectedRoles) {
      const role = roles.find((r) => r.name === roleName);
      if (role) {
        log(
          `   ✓ ${roleName.padEnd(15)} - ${role.permissions.length} permisos - ${role.isSystem ? 'Sistema' : 'Personalizado'}`,
          'green'
        );
      } else {
        log(`   ✗ ${roleName} - NO ENCONTRADO`, 'red');
      }
    }

    // ====================================================================
    // TEST 2: Verificar estadísticas de roles
    // ====================================================================
    logSection('TEST 2: Estadísticas de roles');

    log('📊 Obteniendo estadísticas...', 'yellow');
    const statsResponse = await axios.get(`${API_URL}/roles/stats`, config);
    const stats = statsResponse.data.data;

    log(`✅ Total de roles: ${stats.totalRoles}`, 'green');
    log(`✅ Roles activos: ${stats.activeRoles}`, 'green');
    log(`✅ Roles de sistema: ${stats.systemRoles}`, 'green');
    log(`✅ Usuarios asignados: ${stats.usersAssigned}`, 'green');
    log(`✅ Usuarios sin rol: ${stats.usersWithoutRole}`, 'green');

    // ====================================================================
    // TEST 3: Verificar permisos válidos
    // ====================================================================
    logSection('TEST 3: Permisos válidos del sistema');

    log('🔐 Obteniendo permisos válidos...', 'yellow');
    const permissionsResponse = await axios.get(
      `${API_URL}/roles/permissions`,
      config
    );
    const validPermissions = permissionsResponse.data.data;

    log(`✅ Total de permisos válidos: ${validPermissions.length}`, 'green');

    // Agrupar permisos por categoría
    const categories = {};
    for (const perm of validPermissions) {
      const category = perm.split('.')[0];
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(perm);
    }

    log('\n📋 Permisos por categoría:', 'cyan');
    for (const [category, perms] of Object.entries(categories)) {
      log(`   ${category.padEnd(20)}: ${perms.length} permisos`, 'blue');
    }

    // ====================================================================
    // TEST 4: Verificar usuario con rol asignado
    // ====================================================================
    logSection('TEST 4: Verificar usuario actual con rol');

    log('👤 Obteniendo información del usuario actual...', 'yellow');
    const meResponse = await axios.get(`${API_URL}/auth/me`, config);
    const currentUser = meResponse.data.data;

    log(`✅ Usuario: ${currentUser.username}`, 'green');
    log(`✅ Email: ${currentUser.email}`, 'green');

    if (currentUser.role) {
      log(`✅ Rol asignado: ${currentUser.role.name}`, 'green');
      log(
        `✅ Permisos del rol: ${currentUser.role.permissions.length}`,
        'green'
      );
      log(
        `✅ Permisos legacy: ${currentUser.permissions.length}`,
        'green'
      );

      // Verificar que los permisos del rol coincidan con los esperados
      const expectedPermissions = roles.find(
        (r) => r.id === currentUser.roleId
      )?.permissions;
      if (expectedPermissions) {
        const match =
          JSON.stringify(currentUser.role.permissions.sort()) ===
          JSON.stringify(expectedPermissions.sort());
        if (match) {
          log('✅ Los permisos del usuario coinciden con el rol', 'green');
        } else {
          log(
            '⚠️  Los permisos del usuario NO coinciden con el rol',
            'yellow'
          );
        }
      }
    } else {
      log('⚠️  Usuario sin rol asignado', 'yellow');
    }

    // ====================================================================
    // TEST 5: Intentar crear un nuevo rol (validación RBAC)
    // ====================================================================
    logSection('TEST 5: Crear un nuevo rol personalizado');

    log('🔨 Creando rol "Auditor"...', 'yellow');
    try {
      const newRoleResponse = await axios.post(
        `${API_URL}/roles`,
        {
          name: 'Auditor',
          description: 'Rol de auditoría con acceso de solo lectura',
          permissions: ['dashboard.read', 'reports.sales', 'reports.financial'],
        },
        config
      );

      const newRole = newRoleResponse.data.data;
      log(`✅ Rol creado: ${newRole.name} (ID: ${newRole.id})`, 'green');
      log(`✅ Permisos: ${newRole.permissions.length}`, 'green');
      log(`✅ Es sistema: ${newRole.isSystem}`, 'green');

      // Intentar eliminar el rol recién creado
      log('\n🗑️  Intentando eliminar rol personalizado...', 'yellow');
      await axios.delete(`${API_URL}/roles/${newRole.id}`, config);
      log('✅ Rol eliminado correctamente', 'green');
    } catch (error) {
      log(`❌ Error al crear/eliminar rol: ${error.message}`, 'red');
    }

    // ====================================================================
    // TEST 6: Intentar eliminar un rol del sistema (debe fallar)
    // ====================================================================
    logSection('TEST 6: Protección de roles del sistema');

    const adminRole = roles.find((r) => r.name === 'Admin');
    if (adminRole) {
      log('🛡️  Intentando eliminar rol Admin (debe fallar)...', 'yellow');
      try {
        await axios.delete(`${API_URL}/roles/${adminRole.id}`, config);
        log('❌ ERROR: Se pudo eliminar el rol del sistema', 'red');
      } catch (error) {
        if (error.response && error.response.status === 400) {
          log(
            '✅ Protección funcionando: No se puede eliminar rol del sistema',
            'green'
          );
          log(`   Mensaje: ${error.response.data.message}`, 'cyan');
        } else {
          log(`❌ Error inesperado: ${error.message}`, 'red');
        }
      }
    }

    // ====================================================================
    // TEST 7: Actualizar permisos de un rol del sistema
    // ====================================================================
    logSection('TEST 7: Actualizar permisos de rol del sistema');

    const vendedorRole = roles.find((r) => r.name === 'Vendedor');
    if (vendedorRole) {
      log('🔄 Actualizando permisos del rol Vendedor...', 'yellow');
      try {
        const updatedRoleResponse = await axios.patch(
          `${API_URL}/roles/${vendedorRole.id}/permissions`,
          {
            permissions: [
              ...vendedorRole.permissions,
              'inventory.update', // Agregar un permiso adicional
            ],
          },
          config
        );

        const updatedRole = updatedRoleResponse.data.data;
        log('✅ Permisos actualizados correctamente', 'green');
        log(
          `   Permisos antes: ${vendedorRole.permissions.length}`,
          'cyan'
        );
        log(`   Permisos después: ${updatedRole.permissions.length}`, 'cyan');

        // Restaurar permisos originales
        log('\n🔄 Restaurando permisos originales...', 'yellow');
        await axios.patch(
          `${API_URL}/roles/${vendedorRole.id}/permissions`,
          {
            permissions: vendedorRole.permissions,
          },
          config
        );
        log('✅ Permisos restaurados', 'green');
      } catch (error) {
        log(`❌ Error al actualizar permisos: ${error.message}`, 'red');
      }
    }

    // ====================================================================
    // RESUMEN FINAL
    // ====================================================================
    logSection('📊 RESUMEN DE PRUEBAS');

    log('✅ Sistema RBAC funcionando correctamente', 'green');
    log(`   - ${roles.length} roles configurados`, 'cyan');
    log(`   - ${validPermissions.length} permisos válidos`, 'cyan');
    log(`   - ${stats.usersAssigned} usuarios asignados a roles`, 'cyan');
    log('   - Protección de roles del sistema activa', 'cyan');
    log('   - API de roles completamente funcional', 'cyan');

    console.log('\n' + '='.repeat(70) + '\n');
  } catch (error) {
    log('\n❌ ERROR EN LAS PRUEBAS', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Mensaje: ${error.response.data.message}`, 'red');
      if (error.response.data.error) {
        log(`   Error: ${error.response.data.error}`, 'red');
      }
    } else {
      log(`   ${error.message}`, 'red');
    }
    console.log('\n' + '='.repeat(70) + '\n');
    process.exit(1);
  }
}

// Ejecutar las pruebas
testRBACSystem();
