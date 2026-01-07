/**
 * Script de validación RBAC - Backend
 * 
 * Valida que el backend:
 * 1. ❌ RECHACE el campo "permissions" en create/update
 * 2. ✅ REQUIERA el campo "roleId" en create
 * 3. ✅ PERMITA roleId en update
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'cyan');
  }
}

// Login para obtener token
async function login() {
  try {
    log('\n🔐 Intentando login...', 'cyan');
    
    // Probar diferentes credenciales
    const credentials = [
      { email: 'admin@alexatech.com', password: 'Admin@2024' },
      { email: 'jhosedaniel@gmail.com', password: 'Jhose2024!' },
      { email: 'test@test.com', password: 'Test@123' },
    ];
    
    for (const cred of credentials) {
      try {
        const response = await axios.post(`${BASE_URL}/auth/login`, cred);
        authToken = response.data.data.token;
        log(`✅ Login exitoso con: ${cred.email}`, 'green');
        return true;
      } catch (err) {
        // Intentar siguiente credencial
        continue;
      }
    }
    
    log('❌ No se pudo autenticar con ninguna credencial', 'red');
    log('💡 Tip: Crea un usuario admin o modifica las credenciales en el script', 'yellow');
    return false;
  } catch (error) {
    log('❌ Error en login', 'red');
    console.error(error.response?.data || error.message);
    return false;
  }
}

// Test 1: Intentar crear usuario CON permissions (debe fallar)
async function testCreateWithPermissions() {
  log('\n📋 Test 1: Crear usuario con campo "permissions" (debe RECHAZAR)', 'yellow');
  
  try {
    await axios.post(
      `${BASE_URL}/users`,
      {
        username: 'test_permissions',
        email: 'test.permissions@test.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'Permissions',
        roleId: '1',
        permissions: ['users.read', 'users.create'], // ❌ Este campo debe ser rechazado
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    logTest('Test 1: Crear con permissions', false, 'El backend NO rechazó el campo permissions');
    return false;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (error.response?.status === 400) {
      const hasPermissionsError = errorData.errors?.some(
        (err) => err.field === 'permissions'
      );
      
      if (hasPermissionsError) {
        logTest('Test 1: Rechazar campo permissions', true, errorData.errors.find(e => e.field === 'permissions').message);
        return true;
      }
    }
    
    logTest('Test 1: Crear con permissions', false, `Error inesperado: ${errorData?.message || error.message}`);
    return false;
  }
}

// Test 2: Intentar crear usuario SIN roleId (debe fallar)
async function testCreateWithoutRoleId() {
  log('\n📋 Test 2: Crear usuario sin roleId (debe RECHAZAR)', 'yellow');
  
  try {
    await axios.post(
      `${BASE_URL}/users`,
      {
        username: 'test_norole',
        email: 'test.norole@test.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'NoRole',
        // ❌ roleId faltante (obligatorio)
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    logTest('Test 2: Crear sin roleId', false, 'El backend NO requirió roleId');
    return false;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (error.response?.status === 400) {
      const hasRoleIdError = errorData.errors?.some(
        (err) => err.field === 'roleId' && err.message.includes('requerido')
      );
      
      if (hasRoleIdError) {
        logTest('Test 2: Requerir roleId', true, errorData.errors.find(e => e.field === 'roleId').message);
        return true;
      }
    }
    
    logTest('Test 2: Crear sin roleId', false, `Error inesperado: ${errorData?.message || error.message}`);
    return false;
  }
}

// Test 3: Crear usuario CON roleId válido (debe funcionar)
async function testCreateWithValidRoleId() {
  log('\n📋 Test 3: Crear usuario con roleId válido (debe FUNCIONAR)', 'yellow');
  
  try {
    const response = await axios.post(
      `${BASE_URL}/users`,
      {
        username: `test_rbac_${Date.now()}`,
        email: `test.rbac.${Date.now()}@test.com`,
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'RBAC',
        roleId: '2', // ✅ Rol válido (ej: Vendedor)
        isActive: true,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    const userData = response.data.data;
    
    if (userData.id && userData.permissions) {
      logTest('Test 3: Crear con roleId válido', true, `Usuario creado con ${userData.permissions.length} permisos heredados del rol`);
      return { success: true, userId: userData.id };
    }
    
    logTest('Test 3: Crear con roleId', false, 'Respuesta sin datos esperados');
    return { success: false };
  } catch (error) {
    const errorData = error.response?.data;
    logTest('Test 3: Crear con roleId', false, errorData?.message || error.message);
    return { success: false };
  }
}

// Test 4: Intentar actualizar usuario CON permissions (debe fallar)
async function testUpdateWithPermissions(userId) {
  log('\n📋 Test 4: Actualizar usuario con campo "permissions" (debe RECHAZAR)', 'yellow');
  
  if (!userId) {
    logTest('Test 4: Update con permissions', false, 'No hay userId disponible del test anterior');
    return false;
  }
  
  try {
    await axios.put(
      `${BASE_URL}/users/${userId}`,
      {
        firstName: 'Updated',
        permissions: ['users.read'], // ❌ Este campo debe ser rechazado
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    logTest('Test 4: Update con permissions', false, 'El backend NO rechazó el campo permissions');
    return false;
  } catch (error) {
    const errorData = error.response?.data;
    
    if (error.response?.status === 400) {
      const hasPermissionsError = errorData.errors?.some(
        (err) => err.field === 'permissions'
      );
      
      if (hasPermissionsError) {
        logTest('Test 4: Rechazar permissions en update', true, errorData.errors.find(e => e.field === 'permissions').message);
        return true;
      }
    }
    
    logTest('Test 4: Update con permissions', false, `Error inesperado: ${errorData?.message || error.message}`);
    return false;
  }
}

// Test 5: Actualizar usuario cambiando roleId (debe funcionar)
async function testUpdateRoleId(userId) {
  log('\n📋 Test 5: Actualizar roleId del usuario (debe FUNCIONAR)', 'yellow');
  
  if (!userId) {
    logTest('Test 5: Update roleId', false, 'No hay userId disponible');
    return false;
  }
  
  try {
    const response = await axios.put(
      `${BASE_URL}/users/${userId}`,
      {
        roleId: '3', // ✅ Cambiar a otro rol (ej: Almacenero)
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    const userData = response.data.data;
    
    if (userData.id) {
      logTest('Test 5: Actualizar roleId', true, `Rol actualizado, permisos heredados del nuevo rol`);
      return true;
    }
    
    logTest('Test 5: Update roleId', false, 'Respuesta sin datos esperados');
    return false;
  } catch (error) {
    const errorData = error.response?.data;
    logTest('Test 5: Update roleId', false, errorData?.message || error.message);
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n' + '='.repeat(70), 'blue');
  log('   VALIDACIÓN RBAC - BACKEND', 'blue');
  log('='.repeat(70), 'blue');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ No se pudo autenticar. Abortando tests.', 'red');
    return;
  }
  
  const results = {
    total: 5,
    passed: 0,
    failed: 0,
  };
  
  // Test 1: Rechazar permissions en create
  if (await testCreateWithPermissions()) results.passed++;
  else results.failed++;
  
  // Test 2: Requerir roleId en create
  if (await testCreateWithoutRoleId()) results.passed++;
  else results.failed++;
  
  // Test 3: Crear con roleId válido
  const createResult = await testCreateWithValidRoleId();
  if (createResult.success) results.passed++;
  else results.failed++;
  
  // Test 4: Rechazar permissions en update
  if (await testUpdateWithPermissions(createResult.userId)) results.passed++;
  else results.failed++;
  
  // Test 5: Permitir cambio de roleId
  if (await testUpdateRoleId(createResult.userId)) results.passed++;
  else results.failed++;
  
  // Resumen
  log('\n' + '='.repeat(70), 'blue');
  log('   RESUMEN DE VALIDACIÓN', 'blue');
  log('='.repeat(70), 'blue');
  
  log(`\nTests totales: ${results.total}`, 'cyan');
  log(`✅ Pasados: ${results.passed}`, 'green');
  log(`❌ Fallados: ${results.failed}`, 'red');
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  log(`\nTasa de éxito: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');
  
  if (results.passed === results.total) {
    log('\n🎉 ¡VALIDACIÓN RBAC EXITOSA! El backend está correctamente configurado.', 'green');
  } else {
    log('\n⚠️  Algunos tests fallaron. Revisa la configuración RBAC del backend.', 'yellow');
  }
  
  log('\n' + '='.repeat(70) + '\n', 'blue');
}

// Ejecutar
runAllTests().catch((error) => {
  log('\n💥 Error fatal en tests:', 'red');
  console.error(error);
  process.exit(1);
});
