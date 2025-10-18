// Prueba de autenticación y permisos del módulo de Usuarios
// Ejecutar con: npm run test:users (o usando alias con cuentas)

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_EMAIL = process.env.AUTH_EMAIL || 'admin@alexatech.com';
const DEFAULT_PASSWORD = process.env.AUTH_PASSWORD || 'admin123';

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
    console.error(`❌ ${message}`);
    process.exit(1);
  }
}

async function login(email, password) {
  const { ok, body } = await request('POST', '/auth/login', { email, password });
  assert(ok && body?.data?.accessToken, `Login fallido o sin accessToken para ${email}`);
  console.log(`🔐 Login ok: ${email}`);
  return body.data.accessToken;
}

async function run() {
  console.log('🚀 Iniciando pruebas del módulo de Usuarios...');

  // 1) Verificación sin token (debe fallar 401)
  const noToken = await request('GET', '/users', null, null);
  assert(noToken.status === 401, `Acceso sin token debería ser 401, recibido ${noToken.status}`);
  console.log('🔒 Acceso sin token correctamente bloqueado (401)');

  // 2) Login Admin y listado de usuarios (debe funcionar 200)
  const adminToken = await login(DEFAULT_EMAIL, DEFAULT_PASSWORD);
  // Confirmar /auth/me devuelve el perfil actual
  const adminMe = await request('GET', '/auth/me', null, adminToken);
  assert(adminMe.ok && adminMe.body?.data?.email === DEFAULT_EMAIL, 'Admin: /auth/me falló');
  console.log('👤 Admin: /auth/me ok');
  const adminList = await request('GET', '/users', null, adminToken);
  assert(adminList.ok && Array.isArray(adminList.body?.data?.users), 'Admin: listado de usuarios falló');
  console.log(`📚 Admin: listado ok con ${adminList.body.data.users.length} usuarios`);

  // 3) Login Cajero y verificación de permisos (debe ser 403)
  const cajeroToken = await login('cajero@alexatech.com', 'cajero123');
  const cajeroList = await request('GET', '/users', null, cajeroToken);
  assert(cajeroList.status === 403, `Cajero debería recibir 403 al listar usuarios, recibido ${cajeroList.status}`);
  console.log('🔒 Cajero: permiso denegado correctamente (403)');

  // 4) Ver usuario por ID propio con supervisor
  const supervisorToken = await login('supervisor@alexatech.com', 'supervisor123');
  // Obtener lista para conseguir un ID válido
  const supList = await request('GET', '/users', null, supervisorToken);
  assert(supList.ok && Array.isArray(supList.body?.data?.users), 'Supervisor: listado de usuarios falló');
  console.log(`📚 Supervisor: listado ok con ${supList.body.data.users.length} usuarios`);
  const someUser = supList.body.data.users[0];
  const supGet = await request('GET', `/users/${someUser.id}`, null, supervisorToken);
  // El controlador de usuarios devuelve el usuario directamente en data, no envuelve bajo data.user
  assert(supGet.ok && supGet.body?.data?.id === someUser.id, 'Supervisor: get usuario por ID falló');
  console.log('📍 Supervisor: get usuario por ID ok');

  console.log('🎉 Pruebas del módulo de Usuarios completadas exitosamente');
}

run().catch((err) => {
  console.error('❌ Error en pruebas de usuarios:', err);
  process.exit(1);
});