/**
 * TEST E2E SIMPLIFICADO - MÓDULO DE USUARIOS
 * ===========================================
 * 
 * INSTRUCCIONES:
 * 1. Inicia sesión en el frontend (http://localhost:5173)
 * 2. Abre la consola del navegador (F12)
 * 3. Ejecuta: localStorage.getItem('alexatech_token')
 * 4. Copia el token
 * 5. Pega el token en la línea 20 de este archivo (TOKEN_FROM_BROWSER)
 * 6. Ejecuta: node test-users-e2e-simple.js
 */

const axios = require('axios');

// ============================================================================
// ⚠️ CONFIGURA TU TOKEN AQUÍ ⚠️
// ============================================================================
// Obtenerlo desde: localStorage.getItem('alexatech_token') en consola del navegador
const TOKEN_FROM_BROWSER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWh4OWxnODQwMDAwbzFwNDhpdHRqYWNhIiwiZW1haWwiOiJhZG1pbkBhbGV4YXRlY2guY29tIiwiaWF0IjoxNzY0NDA0MTI4LCJleHAiOjE3NjQ0OTA1MjgsImF1ZCI6ImFsZXhhLXRlY2gtY2xpZW50IiwiaXNzIjoiYWxleGEtdGVjaC1hcGkifQ.YDJOCch9lVqXSe0heJgaqfxWWI0LkXHIFHVDu3QKrgY';

const API_URL = 'http://localhost:3001/api';

// ============================================================================
// UTILIDADES
// ============================================================================

function success(msg) { console.log(`✅ ${msg}`); }
function error(msg) { console.log(`❌ ${msg}`); }
function log(emoji, msg) { console.log(`${emoji} ${msg}`); }
function section(title) { console.log(`\n${'='.repeat(80)}\n${title}\n${'='.repeat(80)}`); }

function assert(condition, message) {
  if (!condition) {
    error(`ASSERTION FAILED: ${message}`);
    throw new Error(message);
  }
  success(`PASS: ${message}`);
}

// ============================================================================
// TESTS
// ============================================================================

const testData = { roleId: null, userId: null };

async function test1_VerifyToken() {
  section('🔐 TEST 1: VERIFICAR TOKEN');
  
  if (TOKEN_FROM_BROWSER === 'PEGA_TU_TOKEN_AQUI') {
    error('No has configurado el token');
    error('Pasos:');
    error('1. Abre http://localhost:5173 e inicia sesión');
    error('2. Abre consola (F12)');
    error('3. Ejecuta: localStorage.getItem("alexatech_token")');
    error('4. Copia el token y pégalo en línea 20 de este archivo');
    throw new Error('Token no configurado');
  }
  
  try {
    const res = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
    });
    
    // La respuesta es: {success, message, data: {users: [], pagination: {}}}
    const users = res.data.data?.users || res.data.users || res.data;
    assert(Array.isArray(users), 'Token es válido (obtiene usuarios)');
    log('📊', `Usuarios en sistema: ${users.length}`);
  } catch (err) {
    error(`Error al verificar token: ${err.message}`);
    if (err.response) {
      error(`Status: ${err.response.status}`);
      error(`Response:`, JSON.stringify(err.response.data, null, 2));
    }
    throw err;
  }
}

async function test2_CreateRole() {
  section('🎨 TEST 2: CREAR ROL PERSONALIZADO');
  
  const newRole = {
    name: `E2E Test Role ${Date.now()}`,
    description: 'Rol de prueba E2E',
    permissions: ['dashboard.read', 'sales.read', 'clients.read']
  };
  
  const res = await axios.post(`${API_URL}/roles`, newRole, {
    headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
  });
  
  testData.roleId = res.data.data.id;
  
  assert(res.data.success, 'Rol creado exitosamente');
  assert(res.data.data.id, 'Rol tiene ID');
  assert(res.data.data.isSystem === false, 'Rol es personalizado');
  log('🆔', `Rol creado: ${testData.roleId}`);
}

async function test3_CreateUserWithRole() {
  section('👤 TEST 3: CREAR USUARIO CON ROL (RBAC)');
  
  const timestamp = Date.now();
  const newUser = {
    username: `e2euser_${timestamp}`,
    email: `e2euser_${timestamp}@test.com`,
    password: 'Test123!@#',
    firstName: 'E2E',
    lastName: 'Usuario',
    roleId: testData.roleId, // ✅ Usando roleId
    isActive: true
  };
  
  log('📤', 'Payload (sin permissions):');
  console.log(JSON.stringify({ ...newUser, password: '***' }, null, 2));
  
  const res = await axios.post(`${API_URL}/users`, newUser, {
    headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
  });
  
  testData.userId = res.data.data.id;
  
  assert(res.data.success, 'Usuario creado exitosamente');
  assert(Array.isArray(res.data.data.permissions), 'Usuario tiene permisos heredados del rol');
  assert(res.data.data.permissions.length === 3, 'Usuario heredó 3 permisos');
  log('🆔', `Usuario creado: ${testData.userId}`);
  log('📋', `Permisos heredados: ${res.data.data.permissions.join(', ')}`);
}

async function test4_VerifyPermissionsInherited() {
  section('🔍 TEST 4: VERIFICAR HERENCIA DE PERMISOS');
  
  const res = await axios.get(`${API_URL}/users/${testData.userId}`, {
    headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
  });
  
  const user = res.data.data || res.data;
  
  log('📥', 'Usuario obtenido:');
  console.log(JSON.stringify(user, null, 2));
  
  // El backend puede devolver los permisos directamente o a través del rol
  assert(Array.isArray(user.permissions), 'Usuario tiene permisos');
  assert(user.permissions.length === 3, 'Tiene 3 permisos heredados');
  log('📋', `Permisos verificados: ${user.permissions.join(', ')}`);
}

async function test5_UpdateUserRole() {
  section('🔄 TEST 5: CAMBIAR ROL DE USUARIO');
  
  // Obtener otro rol
  const rolesRes = await axios.get(`${API_URL}/roles`, {
    headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
  });
  
  const roles = rolesRes.data.data || rolesRes.data;
  const adminRole = roles.find(r => r.name.toLowerCase().includes('admin'));
  
  assert(adminRole, 'Existe rol admin');
  
  const permisosAntes = 3;
  
  // Actualizar rol
  const updateRes = await axios.put(`${API_URL}/users/${testData.userId}`, 
    { roleId: adminRole.id },
    { headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` } }
  );
  
  assert(updateRes.data.success, 'Rol actualizado');
  
  // Verificar cambio
  const userRes = await axios.get(`${API_URL}/users/${testData.userId}`, {
    headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
  });
  
  const user = userRes.data.data || userRes.data;
  
  assert(Array.isArray(user.permissions), 'Usuario tiene permisos');
  assert(user.permissions.length > permisosAntes, 'Permisos actualizados automáticamente');
  log('📈', `Permisos: ${permisosAntes} → ${user.permissions.length}`);
}

async function test6_RejectPermissionsField() {
  section('❌ TEST 6: RECHAZAR CAMPO PERMISSIONS');
  
  const invalidPayload = {
    permissions: ['users.read'] // ❌ Debe ser rechazado
  };
  
  try {
    await axios.put(`${API_URL}/users/${testData.userId}`, invalidPayload, {
      headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
    });
    
    error('Backend aceptó campo permissions (DEBERÍA RECHAZARLO)');
    throw new Error('Validación RBAC falla');
  } catch (err) {
    if (err.response?.status === 400) {
      success('Backend rechazó campo permissions correctamente');
    } else {
      throw err;
    }
  }
}

async function test7_ToggleUserStatus() {
  section('🔘 TEST 7: ACTIVAR/DESACTIVAR USUARIO');
  
  try {
    // Intentar endpoint específico de status
    await axios.patch(`${API_URL}/users/${testData.userId}/status`, 
      { isActive: false },
      { headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` } }
    );
    
    let userRes = await axios.get(`${API_URL}/users/${testData.userId}`, {
      headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
    });
    
    assert(userRes.data.data.isActive === false, 'Usuario desactivado');
    
    // Activar
    await axios.patch(`${API_URL}/users/${testData.userId}/status`, 
      { isActive: true },
      { headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` } }
    );
    
    userRes = await axios.get(`${API_URL}/users/${testData.userId}`, {
      headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
    });
    
    assert(userRes.data.data.isActive === true, 'Usuario activado');
    log('✨', 'Toggle de estado funciona correctamente');
  } catch (err) {
    if (err.response?.status === 404) {
      log('⏭️', 'Endpoint /status no disponible, test omitido');
    } else {
      throw err;
    }
  }
}

async function test8_Cleanup() {
  section('🧹 TEST 8: LIMPIEZA');
  
  try {
    await axios.delete(`${API_URL}/users/${testData.userId}`, {
      headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
    });
    success('Usuario eliminado');
    
    await axios.delete(`${API_URL}/roles/${testData.roleId}`, {
      headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
    });
    success('Rol eliminado');
  } catch (err) {
    if (err.response?.status === 429) {
      log('⚠️', 'Rate limit alcanzado, datos de prueba quedan en DB');
      log('📝', `Usuario: ${testData.userId}`);
      log('📝', `Rol: ${testData.roleId}`);
    } else {
      throw err;
    }
  }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + 'TEST E2E - MÓDULO USUARIOS (SIMPLE)' + ' '.repeat(21) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');
  
  const results = {};
  
  try {
    results.test1 = await test1_VerifyToken();
    results.test2 = await test2_CreateRole();
    results.test3 = await test3_CreateUserWithRole();
    results.test4 = await test4_VerifyPermissionsInherited();
    results.test5 = await test5_UpdateUserRole();
    results.test6 = await test6_RejectPermissionsField();
    results.test7 = await test7_ToggleUserStatus();
    
    // Pequeño delay antes del cleanup para evitar rate limiting
    log('⏳', 'Esperando 2 segundos antes del cleanup...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    results.test8 = await test8_Cleanup();
    
    console.log('\n' + '='.repeat(80));
    console.log('🎉 TODOS LOS TESTS PASARON 🎉');
    console.log('='.repeat(80));
    console.log('✅ RBAC funcionando correctamente');
    console.log('✅ Backend rechaza campo permissions');
    console.log('✅ Herencia de permisos desde roles');
    console.log('✅ Actualización de roles funciona');
    console.log('='.repeat(80));
    
  } catch (err) {
    error(`\n⛔ Test falló: ${err.message}`);
    if (err.response?.data) {
      console.log('\nResponse:', err.response.data);
    }
    
    // Cleanup de emergencia
    if (testData.userId) {
      try {
        await axios.delete(`${API_URL}/users/${testData.userId}`, {
          headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
        });
      } catch (e) {}
    }
    if (testData.roleId) {
      try {
        await axios.delete(`${API_URL}/roles/${testData.roleId}`, {
          headers: { Authorization: `Bearer ${TOKEN_FROM_BROWSER}` }
        });
      } catch (e) {}
    }
    
    process.exit(1);
  }
}

main();
