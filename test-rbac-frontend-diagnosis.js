/**
 * DIAGNÓSTICO RBAC - FRONTEND
 * ============================
 * Script para identificar problemas en el módulo de usuarios
 * 
 * Ejecutar: node test-rbac-frontend-diagnosis.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Credenciales de prueba (ajustar según tu usuario admin)
const TEST_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

let authToken = '';

// ============================================================================
// UTILIDADES
// ============================================================================

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function success(message) {
  console.log(`✅ ${message}`);
}

function error(message) {
  console.log(`❌ ${message}`);
}

function warning(message) {
  console.log(`⚠️  ${message}`);
}

function section(title) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${title}`);
  console.log('='.repeat(80));
}

// ============================================================================
// TESTS
// ============================================================================

async function login() {
  section('🔐 1. AUTENTICACIÓN');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, TEST_CREDENTIALS);
    
    if (response.data.success && response.data.data.token) {
      authToken = response.data.data.token;
      success(`Login exitoso con usuario: ${TEST_CREDENTIALS.username}`);
      log('🎟️ ', `Token: ${authToken.substring(0, 20)}...`);
      
      // Verificar permisos del usuario
      if (response.data.data.user) {
        const user = response.data.data.user;
        log('👤', `Usuario: ${user.firstName} ${user.lastName} (@${user.username})`);
        log('🔑', `Rol: ${user.role?.name || 'N/A'}`);
        log('📋', `Permisos: ${user.permissions?.length || 0} permisos`);
        
        // Verificar permiso específico users.create
        if (user.permissions?.includes('users.create')) {
          success('Tiene permiso "users.create" - Verá botón "Nuevo Rol"');
        } else {
          warning('NO tiene permiso "users.create" - NO verá botón "Nuevo Rol"');
          warning('Solución: Asignar rol con permiso users.create');
        }
      }
      
      return true;
    } else {
      error('Respuesta de login sin token');
      console.log('Response:', response.data);
      return false;
    }
  } catch (err) {
    error(`Error en login: ${err.message}`);
    if (err.response) {
      console.log('Response data:', err.response.data);
    }
    return false;
  }
}

async function checkRolesEndpoint() {
  section('📊 2. VERIFICAR ENDPOINT /roles');
  try {
    const response = await axios.get(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const roles = response.data?.data || response.data;
    
    if (Array.isArray(roles)) {
      success(`Endpoint /roles retorna array con ${roles.length} roles`);
      
      if (roles.length === 0) {
        error('⚠️  NO HAY ROLES EN EL SISTEMA');
        warning('Solución: Ejecutar seed de datos o crear roles manualmente');
        warning('Comando: cd alexa-tech-backend && npm run seed');
        return false;
      }
      
      // Contar roles activos
      const activeRoles = roles.filter(r => r.isActive);
      log('✔️ ', `Roles activos: ${activeRoles.length} de ${roles.length}`);
      
      if (activeRoles.length === 0) {
        error('⚠️  NO HAY ROLES ACTIVOS');
        warning('Solución: Activar al menos 1 rol en la base de datos');
        return false;
      }
      
      // Mostrar roles disponibles
      console.log('\nRoles disponibles:');
      activeRoles.forEach((role, idx) => {
        const systemBadge = role.isSystem ? '🔒 Sistema' : '👤 Personalizado';
        console.log(`  ${idx + 1}. ${role.name} - ${systemBadge} - ${role.permissions?.length || 0} permisos`);
        console.log(`     "${role.description}"`);
      });
      
      return true;
    } else {
      error('⚠️  Endpoint /roles NO retorna un array');
      console.log('Response:', response.data);
      return false;
    }
  } catch (err) {
    error(`Error al consultar /roles: ${err.message}`);
    if (err.response) {
      console.log('Response status:', err.response.status);
      console.log('Response data:', err.response.data);
    }
    return false;
  }
}

async function checkUsersEndpoint() {
  section('👥 3. VERIFICAR ENDPOINT /users');
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const users = response.data?.data || response.data;
    
    if (Array.isArray(users)) {
      success(`Endpoint /users retorna array con ${users.length} usuarios`);
      
      // Verificar estructura de usuarios
      console.log('\nPrimeros 3 usuarios:');
      users.slice(0, 3).forEach((user, idx) => {
        console.log(`  ${idx + 1}. ${user.firstName} ${user.lastName} (@${user.username})`);
        console.log(`     Rol: ${user.role?.name || 'N/A'} | roleId: ${user.roleId || 'N/A'}`);
        console.log(`     Permisos: ${user.permissions?.length || user.role?.permissions?.length || 0}`);
        console.log(`     Estado: ${user.isActive ? '✅ Activo' : '❌ Inactivo'}`);
        
        // Verificar que NO tenga campo permissions directo (debe venir del rol)
        if (user.permissions && !user.role) {
          warning(`   ⚠️  Usuario tiene permisos directos (debería heredar del rol)`);
        }
      });
      
      return true;
    } else {
      error('⚠️  Endpoint /users NO retorna un array');
      console.log('Response:', response.data);
      return false;
    }
  } catch (err) {
    error(`Error al consultar /users: ${err.message}`);
    if (err.response) {
      console.log('Response status:', err.response.status);
      console.log('Response data:', err.response.data);
    }
    return false;
  }
}

async function testCreateUserPayload() {
  section('🧪 4. SIMULAR CREACIÓN DE USUARIO');
  
  try {
    // Primero obtener un rol disponible
    const rolesResponse = await axios.get(`${API_URL}/roles`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const roles = rolesResponse.data?.data || rolesResponse.data;
    const firstActiveRole = roles.find(r => r.isActive);
    
    if (!firstActiveRole) {
      error('No hay roles activos para crear usuario de prueba');
      return false;
    }
    
    log('🎯', `Usando rol: ${firstActiveRole.name} (${firstActiveRole.id})`);
    
    // Payload de prueba (SIN permissions, SOLO roleId)
    const testPayload = {
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'Test123!',
      firstName: 'Usuario',
      lastName: 'Prueba',
      roleId: firstActiveRole.id,
      isActive: true
    };
    
    log('📤', 'Payload de prueba:');
    console.log(JSON.stringify(testPayload, null, 2));
    
    log('⏳', 'Enviando solicitud POST /users...');
    
    const response = await axios.post(`${API_URL}/users`, testPayload, {
      headers: { 
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.success) {
      success('✅ Usuario de prueba creado exitosamente');
      const newUser = response.data.data;
      console.log(`   ID: ${newUser.id}`);
      console.log(`   Username: @${newUser.username}`);
      console.log(`   Rol asignado: ${newUser.role?.name || 'N/A'}`);
      console.log(`   Permisos heredados: ${newUser.role?.permissions?.length || 0}`);
      
      // Intentar eliminar el usuario de prueba
      try {
        await axios.delete(`${API_URL}/users/${newUser.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        log('🗑️ ', 'Usuario de prueba eliminado');
      } catch (delErr) {
        warning('No se pudo eliminar usuario de prueba (normal si no tienes permiso)');
      }
      
      return true;
    } else {
      error('Error al crear usuario');
      console.log('Response:', response.data);
      return false;
    }
  } catch (err) {
    error(`Error en test de creación: ${err.message}`);
    if (err.response) {
      console.log('Response status:', err.response.status);
      console.log('Response data:', err.response.data);
      
      // Verificar si es error de validación RBAC
      if (err.response.status === 400 && err.response.data.errors) {
        const permissionsError = err.response.data.errors.find(e => e.field === 'permissions');
        if (permissionsError) {
          success('✅ Backend está rechazando campo "permissions" correctamente (RBAC funcionando)');
        }
      }
    }
    return false;
  }
}

async function checkRBACIntegrity() {
  section('🔒 5. VERIFICAR INTEGRIDAD RBAC');
  
  try {
    // Intentar crear usuario CON permissions (debe fallar)
    const invalidPayload = {
      username: 'testinvalid',
      email: 'invalid@test.com',
      password: 'Test123!',
      firstName: 'Invalid',
      lastName: 'User',
      permissions: ['users.read', 'users.create'], // ❌ No debería aceptarse
      isActive: true
    };
    
    log('🧪', 'Probando payload inválido (con permissions directos)...');
    
    try {
      await axios.post(`${API_URL}/users`, invalidPayload, {
        headers: { 
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      error('⚠️  ¡PROBLEMA! Backend aceptó campo "permissions" (debería rechazarlo)');
      error('Backend NO está validando correctamente RBAC');
      return false;
    } catch (err) {
      if (err.response?.status === 400) {
        const errors = err.response.data.errors || [];
        const permissionsError = errors.find(e => e.field === 'permissions');
        
        if (permissionsError) {
          success('✅ Backend rechaza campo "permissions" correctamente');
          success('✅ Validación RBAC funcionando en backend');
          return true;
        } else {
          warning('Backend retorna 400 pero no específicamente por "permissions"');
          console.log('Errors:', errors);
          return false;
        }
      } else {
        warning(`Error inesperado: ${err.message}`);
        return false;
      }
    }
  } catch (err) {
    error(`Error en verificación RBAC: ${err.message}`);
    return false;
  }
}

// ============================================================================
// REPORTE FINAL
// ============================================================================

async function generateReport(results) {
  section('📝 REPORTE FINAL');
  
  console.log('\n' + '─'.repeat(80));
  console.log('RESUMEN DE DIAGNÓSTICO:');
  console.log('─'.repeat(80));
  
  const tests = [
    { name: 'Autenticación', status: results.login },
    { name: 'Endpoint /roles', status: results.roles },
    { name: 'Endpoint /users', status: results.users },
    { name: 'Creación de usuario', status: results.create },
    { name: 'Validación RBAC', status: results.rbac }
  ];
  
  tests.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    console.log(`${icon} ${test.name.padEnd(30)} ${test.status ? 'PASS' : 'FAIL'}`);
  });
  
  const passedTests = tests.filter(t => t.status).length;
  const totalTests = tests.length;
  
  console.log('─'.repeat(80));
  console.log(`Resultado: ${passedTests}/${totalTests} tests pasados`);
  console.log('─'.repeat(80));
  
  // Diagnóstico específico para RoleSelector
  console.log('\n🔍 DIAGNÓSTICO ROLESELECTOR:');
  if (!results.roles) {
    error('Problema: El dropdown de RoleSelector no funciona porque:');
    error('  1. El endpoint /roles no retorna datos, O');
    error('  2. No hay roles activos en el sistema');
    console.log('\n🛠️  SOLUCIONES:');
    console.log('  1. Ejecutar seed de datos:');
    console.log('     cd alexa-tech-backend && npm run seed');
    console.log('  2. Crear roles manualmente en la base de datos');
    console.log('  3. Verificar que los roles existentes tengan isActive = true');
  } else {
    success('El endpoint /roles funciona correctamente');
    success('RoleSelector debería funcionar si el componente está correcto');
    console.log('\n🛠️  PASOS SIGUIENTES:');
    console.log('  1. Abrir consola del navegador (F12)');
    console.log('  2. Ir a módulo de Usuarios > Nuevo Usuario');
    console.log('  3. Buscar logs del RoleSelector:');
    console.log('     - "🔍 [RoleSelector] Response from /roles"');
    console.log('     - "✅ [RoleSelector] Loaded X active roles"');
    console.log('  4. Verificar que no haya errores de CORS o 401/403');
  }
  
  // Diagnóstico para botón "Nuevo Rol"
  console.log('\n🔍 DIAGNÓSTICO BOTÓN "NUEVO ROL":');
  if (results.login) {
    console.log('El botón "Nuevo Rol" solo aparece si tienes permiso "users.create"');
    console.log('Revisa el log de autenticación arriba para verificar tus permisos');
  }
  
  console.log('\n' + '='.repeat(80));
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'DIAGNÓSTICO RBAC - FRONTEND' + ' '.repeat(31) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  
  const results = {
    login: false,
    roles: false,
    users: false,
    create: false,
    rbac: false
  };
  
  // Test 1: Login
  results.login = await login();
  if (!results.login) {
    error('\n⛔ No se pudo autenticar. Verifica las credenciales y que el backend esté corriendo.');
    error('Ajusta TEST_CREDENTIALS en el archivo si es necesario.');
    process.exit(1);
  }
  
  // Test 2: Roles endpoint
  results.roles = await checkRolesEndpoint();
  
  // Test 3: Users endpoint
  results.users = await checkUsersEndpoint();
  
  // Test 4: Create user
  results.create = await testCreateUserPayload();
  
  // Test 5: RBAC validation
  results.rbac = await checkRBACIntegrity();
  
  // Reporte final
  await generateReport(results);
  
  console.log('\n✨ Diagnóstico completado.\n');
}

main().catch(err => {
  console.error('\n💥 Error fatal:', err.message);
  process.exit(1);
});
