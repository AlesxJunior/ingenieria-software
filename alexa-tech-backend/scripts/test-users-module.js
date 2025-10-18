// Prueba de autenticación y permisos del módulo de Usuarios
// Ejecutar con: npm run test:users (o usando alias con cuentas)

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

// --- Helpers ---
async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let json;
  try {
    json = await res.json();
  } catch (e) {
    json = { success: false, message: 'Respuesta no JSON', status: res.status };
  }

  return { status: res.status, ok: res.ok, body: json };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
}

async function login(email, password) {
  const { ok, body, status } = await request('POST', '/auth/login', { email, password });
  if (!ok || !body?.data?.accessToken) {
    console.error(`Login failed for ${email}. Status: ${status}. Body: ${JSON.stringify(body)}`);
  }
  assert(ok && body?.data?.accessToken, `Login fallido o sin accessToken para ${email}`);
  console.log(`   - 🔐 Login ok: ${email}`);
  return { token: body.data.accessToken, refreshToken: body.data.refreshToken, userId: body.data.user.id };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTest(name, testFn) {
  console.log(`
🧪 Ejecutando: ${name}`);
  try {
    await testFn();
    console.log(`✅ Prueba pasada: ${name}`);
  } catch (error) {
    console.error(`💥 Prueba fallida: ${name}`);
    console.error(error);
    process.exit(1);
  }
}

// --- Pruebas ---
async function run() {
  console.log('🚀 Iniciando pruebas del módulo de Usuarios...');

  // --- Roles y Tokens ---
  const admin = await login('admin@alexatech.com', 'admin123');
  await sleep(5000);
  const supervisor = await login('supervisor@alexatech.com', 'supervisor123');
  await sleep(5000);
  const vendedor = await login('vendedor@alexatech.com', 'vendedor123');
  await sleep(5000);
  const cajero = await login('cajero@alexatech.com', 'cajero123');
  await sleep(5000);

  await runTest('Acceso sin token', async () => {
    const res = await request('GET', '/users', null, null);
    assert(res.status === 401, 'Acceso sin token debería ser 401');
  });
  await sleep(5000);

  await runTest('Admin: Acceso total', async () => {
    // Puede listar
    const listRes = await request('GET', '/users', null, admin.token);
    assert(listRes.ok && Array.isArray(listRes.body?.data?.users), 'Admin no pudo listar usuarios');
    await sleep(1000);

    // Puede crear
    const vendedorPermissions = (await request('GET', `/users/${vendedor.userId}`, null, admin.token)).body.data.permissions;
    const username = `testuser${Date.now()}`;
    const newUserEmail = `${username}@example.com`;
    const createRes = await request('POST', '/users', {
      username: username,
      email: newUserEmail,
      password: 'Password123!',
      firstName: 'Testlongname',
      lastName: 'Userlongname',
      permissions: vendedorPermissions
    }, admin.token);
    if (!createRes.ok) {
      console.log('User creation failed. Response:', JSON.stringify(createRes));
    }
    assert(createRes.ok && createRes.body?.data?.email === newUserEmail, `Admin no pudo crear usuario: ${createRes.body?.message}`);
    const newUserId = createRes.body.data.id;
    await sleep(1000);

    // Puede ver
    const getRes = await request('GET', `/users/${newUserId}`, null, admin.token);
    assert(getRes.ok && getRes.body?.data?.id === newUserId, 'Admin no pudo ver usuario creado');
    await sleep(1000);

    // Puede actualizar
    const updateRes = await request('PUT', `/users/${newUserId}`, { firstName: 'Updated' }, admin.token);
    assert(updateRes.ok && updateRes.body?.data?.firstName === 'Updated', 'Admin no pudo actualizar usuario');
    await sleep(1000);

    // Puede eliminar (desactivar)
    const deleteRes = await request('DELETE', `/users/${newUserId}`, null, admin.token);
    assert(deleteRes.ok && deleteRes.body?.data?.deleted === true, 'Admin no pudo desactivar usuario');
  });
  await sleep(5000);

  await runTest('Supervisor: Acceso de lectura', async () => {
    // Puede listar
    const listRes = await request('GET', '/users', null, supervisor.token);
    assert(listRes.ok, 'Supervisor no pudo listar usuarios');
    await sleep(1000);

    // Puede ver perfiles
    const getRes = await request('GET', `/users/${admin.userId}`, null, supervisor.token);
    assert(getRes.ok, 'Supervisor no pudo ver perfil de admin');
    await sleep(1000);

    // NO puede crear
    const createRes = await request('POST', '/users', { username: 'fail.user', email: 'fail@test.com', password: 'p' }, supervisor.token);
    assert(createRes.status === 403, 'Supervisor no debería poder crear usuarios (esperado 403)');
    await sleep(1000);

    // NO puede editar
    const updateRes = await request('PUT', `/users/${admin.userId}`, { firstName: 'Fail' }, supervisor.token);
    assert(updateRes.status === 403, 'Supervisor no debería poder editar usuarios (esperado 403)');
  });
  await sleep(5000);

  await runTest('Vendedor: Sin acceso al módulo de usuarios', async () => {
    const listRes = await request('GET', '/users', null, vendedor.token);
    assert(listRes.status === 403, 'Vendedor no debería poder listar usuarios');
    await sleep(1000);

    const getRes = await request('GET', `/users/${admin.userId}`, null, vendedor.token);
    assert(getRes.status === 403, 'Vendedor no debería poder ver otros usuarios');
    await sleep(1000);

    // Puede ver su propio perfil
    const meRes = await request('GET', '/auth/me', null, vendedor.token);
    assert(meRes.ok && meRes.body?.data?.id === vendedor.userId, 'Vendedor no pudo ver su propio perfil');
  });
  await sleep(5000);

  await runTest('Cajero: Sin acceso al módulo de usuarios', async () => {
    const listRes = await request('GET', '/users', null, cajero.token);
    assert(listRes.status === 403, 'Cajero no debería poder listar usuarios');
    await sleep(1000);

    const getRes = await request('GET', `/users/${admin.userId}`, null, cajero.token);
    assert(getRes.status === 403, 'Cajero no debería poder ver otros usuarios');
  });
  await sleep(5000);

  await runTest('Edge Case: Permiso revocado dinámicamente', async () => {
    // 1. Admin crea un usuario de prueba con permisos de supervisor
    const tempUsername = `revoketest${Date.now()}`;
    const tempUserEmail = `${tempUsername}@example.com`;
    const supervisorPermissions = (await request('GET', `/users/${supervisor.userId}`, null, admin.token)).body.data.permissions;
    console.log('Supervisor Permissions:', supervisorPermissions);

    const createRes = await request('POST', '/users', {
      username: tempUsername,
      email: tempUserEmail,
      password: 'Password123!',
      firstName: 'Revoke',
      lastName: 'Test',
      permissions: supervisorPermissions
    }, admin.token);
    assert(createRes.ok, 'No se pudo crear usuario para prueba de revocación');
    const tempUserId = createRes.body.data.id;
    await sleep(1000);

    // 2. Iniciar sesión como el nuevo usuario para obtener un token
    const tempUser = await login(tempUserEmail, 'Password123!');
    await sleep(1000);
    
    // 3. Verificar que el usuario puede acceder a un recurso de supervisor
    const initialAccess = await request('GET', '/users', null, tempUser.token);
    assert(initialAccess.ok, 'El usuario temporal (Supervisor) no pudo listar usuarios inicialmente');
    await sleep(1000);

    // 4. Admin cambia los permisos del usuario a los de un Cajero
    const cajeroPermissions = (await request('GET', `/users/${cajero.userId}`, null, admin.token)).body.data.permissions;
    const revokeRes = await request('PUT', `/users/${tempUserId}`, { permissions: cajeroPermissions }, admin.token);
    assert(revokeRes.ok, 'Admin no pudo cambiar el rol del usuario para revocar permisos');
    await sleep(1000);

    // 5. Intentar acceder al mismo recurso con el token ANTIGUO
    const afterRevokeAccess = await request('GET', '/users', null, tempUser.token);
    assert(afterRevokeAccess.status === 403, 'El acceso no fue revocado dinámicamente tras el cambio de rol (esperado 403)');
  });

  console.log('Todas las pruebas del modulo de Usuarios completadas exitosamente');
}

run().catch((err) => {
  console.error('Error fatal en las pruebas de usuarios:', err.message);
  process.exit(1);
});
