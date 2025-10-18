// Prueba integral del módulo de Entidades Comerciales vía API
// Ejecutar con: npm run test:clients (o alias específico con admin)

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
  assert(ok && body?.data?.accessToken, 'Login fallido o sin accessToken');
  console.log(`🔐 Login ok: ${email}`);
  return body.data.accessToken;
}

function randomSuffix() {
  return Math.floor(Math.random() * 1e9).toString(36);
}

async function run() {
  console.log('🚀 Iniciando pruebas del módulo de Entidades Comerciales...');

  // 1) Login con usuario Admin (por defecto)
  const token = await login(DEFAULT_EMAIL, DEFAULT_PASSWORD);

  // 2) Crear clientes de prueba (DNI / RUC)
  const suffix = randomSuffix();
  const dniEmail = `cliente.${suffix}@example.com`;
  const rucEmail = `proveedor.${suffix}@example.com`;

  // Generadores de documentos válidos
  const genDni = () => String(Math.floor(10000000 + Math.random() * 90000000)); // 8 dígitos
  const genRuc = () => '20' + String(Math.floor(100000000 + Math.random() * 900000000)); // 11 dígitos
  const genCe = () => String(Math.floor(100000000000 + Math.random() * 900000000000)); // 12 dígitos

  const clienteDniPayload = {
    tipoEntidad: 'Cliente',
    tipoDocumento: 'DNI',
    numeroDocumento: genDni(),
    email: dniEmail,
    telefono: '999999999',
    direccion: 'Calle Test 123',
    ciudad: 'Lima',
    nombres: 'Pedro',
    apellidos: 'Prueba'
  };

  const clienteRucPayload = {
    tipoEntidad: 'Proveedor',
    tipoDocumento: 'RUC',
    numeroDocumento: genRuc(),
    email: rucEmail,
    telefono: '999999998',
    direccion: 'Av Proveedor 456',
    ciudad: 'Lima',
    razonSocial: 'Proveedor Test SAC'
  };

  const createDni = await request('POST', '/entidades', clienteDniPayload, token);
  assert(createDni.ok && createDni.body?.data?.client?.id, `Crear DNI falló: ${createDni.body?.message}`);
  const clienteDni = createDni.body.data.client;
  console.log(`✅ Cliente DNI creado: ${clienteDni.id}`);

  const createRuc = await request('POST', '/entidades', clienteRucPayload, token);
  assert(createRuc.ok && createRuc.body?.data?.client?.id, `Crear RUC falló: ${createRuc.body?.message}`);
  const clienteRuc = createRuc.body.data.client;
  console.log(`✅ Cliente RUC creado: ${clienteRuc.id}`);

  // Crear cliente CE válido (12 dígitos)
  const ceEmail = `ce.${suffix}@example.com`;
  const clienteCePayload = {
    tipoEntidad: 'Cliente',
    tipoDocumento: 'CE',
    numeroDocumento: genCe(),
    email: ceEmail,
    telefono: '997777777',
    direccion: 'Calle CE 321',
    ciudad: 'Lima',
    nombres: 'Ana',
    apellidos: 'Extranjeria'
  };
  const createCe = await request('POST', '/entidades', clienteCePayload, token);
  assert(createCe.ok && createCe.body?.data?.client?.id, `Crear CE falló: ${createCe.body?.message}`);
  const clienteCe = createCe.body.data.client;
  console.log(`✅ Cliente CE creado: ${clienteCe.id}`);

  // 3) Listado con filtros (tipoEntidad)
  const listClientes = await request('GET', '/entidades?tipoEntidad=Cliente', null, token);
  assert(listClientes.ok && Array.isArray(listClientes.body?.data?.clients), 'Listado de clientes falló');
  console.log(`📚 Listado (Cliente) ok: ${listClientes.body.data.clients.length} registros`);

  // 4) Búsquedas por email y documento
  const byEmail = await request('GET', `/entidades/search/email/${encodeURIComponent(dniEmail)}`, null, token);
  assert(byEmail.ok && byEmail.body?.data?.client?.id === clienteDni.id, 'Búsqueda por email falló');
  console.log('🔎 Búsqueda por email ok');

  const byDoc = await request('GET', `/entidades/search/document/${clienteRuc.numeroDocumento}`, null, token);
  assert(byDoc.ok && byDoc.body?.data?.client?.id === clienteRuc.id, 'Búsqueda por documento falló');
  console.log('🔎 Búsqueda por documento ok');

  // 5) Obtener por ID
  const getById = await request('GET', `/entidades/${clienteDni.id}`, null, token);
  assert(getById.ok && getById.body?.data?.client?.id === clienteDni.id, 'Get por ID falló');
  console.log('📍 Get por ID ok');

  // 6) Actualización completa (PUT) y parcial (PATCH)
  const putUpdate = await request('PUT', `/entidades/${clienteDni.id}`, { telefono: '988888888', tipoEntidad: 'Ambos' }, token);
  assert(putUpdate.ok && putUpdate.body?.data?.client?.telefono === '988888888', 'PUT update falló');
  console.log('🛠️  PUT update ok');

  const patchUpdate = await request('PATCH', `/entidades/${clienteDni.id}`, { ciudad: 'Arequipa' }, token);
  assert(patchUpdate.ok && patchUpdate.body?.data?.client?.ciudad === 'Arequipa', 'PATCH update falló');
  console.log('🩹 PATCH update ok');

  // 7) Desactivar y reactivar (via update + reactivate)
  const deactivate = await request('PUT', `/entidades/${clienteDni.id}`, { isActive: false }, token);
  assert(deactivate.ok && deactivate.body?.data?.client?.isActive === false, 'Desactivar cliente falló');
  console.log('⛔ Desactivación ok');

  const reactivate = await request('POST', `/entidades/${clienteDni.id}/reactivate`, null, token);
  assert(reactivate.ok && reactivate.body?.data?.client?.isActive === true, 'Reactivación cliente falló');
  console.log('✅ Reactivación ok');

  // 8) Estadísticas del módulo
  const stats = await request('GET', '/entidades/stats', null, token);
  assert(stats.ok && stats.body?.data?.stats?.total >= 2, 'Stats de clientes falló');
  console.log(`📈 Stats ok: total=${stats.body.data.stats.total}, activos=${stats.body.data.stats.active}`);

  // 9) Crear combinaciones adicionales para filtros
  const proveedorCuscoPayload = {
    tipoEntidad: 'Proveedor',
    tipoDocumento: 'RUC',
    numeroDocumento: genRuc(), // 11 dígitos válidos
    email: `proveedor.cusco.${suffix}@example.com`,
    telefono: '987654321',
    direccion: 'Av Cusco 789',
    ciudad: 'Cusco',
    razonSocial: 'Proveedor Cusco SAC'
  };

  const ambosDniPayload = {
    tipoEntidad: 'Ambos',
    tipoDocumento: 'DNI',
    numeroDocumento: genDni(), // 8 dígitos válidos
    email: `ambos.${suffix}@example.com`,
    telefono: '912345678',
    direccion: 'Calle Ambos 111',
    ciudad: 'Arequipa',
    nombres: 'Lucia',
    apellidos: 'Combos'
  };

  const createProvCusco = await request('POST', '/entidades', proveedorCuscoPayload, token);
  assert(createProvCusco.ok && createProvCusco.body?.data?.client?.id, 'Crear Proveedor Cusco falló');
  const proveedorCusco = createProvCusco.body.data.client;

  const createAmbosDni = await request('POST', '/entidades', ambosDniPayload, token);
  assert(createAmbosDni.ok && createAmbosDni.body?.data?.client?.id, 'Crear Ambos DNI falló');
  const ambosDni = createAmbosDni.body.data.client;

  // 10) Filtros combinados
  const listProvRucCusco = await request('GET', `/entidades?tipoEntidad=Proveedor&tipoDocumento=RUC&ciudad=Cusco`, null, token);
  assert(listProvRucCusco.ok && listProvRucCusco.body?.data?.clients?.some(c => c.id === proveedorCusco.id), 'Filtro Proveedor+RUC+Cusco no contiene el creado');
  console.log('🧩 Filtro Proveedor+RUC+Cusco ok');

  const listDniArequipa = await request('GET', `/entidades?tipoDocumento=DNI&ciudad=Arequipa`, null, token);
  assert(listDniArequipa.ok && listDniArequipa.body?.data?.clients?.some(c => c.id === ambosDni.id), 'Filtro DNI+Arequipa no contiene el creado');
  console.log('🧩 Filtro DNI+Arequipa ok');

  const searchProveedor = await request('GET', `/entidades?search=proveedor`, null, token);
  assert(searchProveedor.ok && searchProveedor.body?.data?.clients?.length >= 1, 'Filtro search=proveedor sin resultados');
  console.log('🔎 Filtro por búsqueda parcial ok');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const listDateRange = await request('GET', `/entidades?fechaDesde=${yesterday}&fechaHasta=${tomorrow}`, null, token);
  assert(listDateRange.ok && listDateRange.body?.data?.clients?.some(c => c.id === proveedorCusco.id || c.id === ambosDni.id), 'Filtro por rango de fechas no incluye recientes');
  console.log('📅 Filtro por rango de fechas ok');

  // 11) Validaciones de datos inválidos
  const invalidDniNames = await request('POST', '/entidades', {
    tipoEntidad: 'Cliente', tipoDocumento: 'DNI', numeroDocumento: genDni(),
    email: `invalid.${suffix}@example.com`, telefono: '999999999', direccion: 'Dir 1', ciudad: 'Lima', nombres: 'A',
  }, token);
  assert(!invalidDniNames.ok && invalidDniNames.status === 400, 'Crear DNI con nombres/apellidos inválidos debería fallar (400)');
  console.log('⚠️ Validación DNI (nombres/apellidos) inválido ok');

  const invalidDniLetters = await request('POST', '/entidades', {
    tipoEntidad: 'Cliente', tipoDocumento: 'DNI', numeroDocumento: '12AB3456',
    email: `invalid.dni.letters.${suffix}@example.com`, telefono: '999999996', direccion: 'Dir 1', ciudad: 'Lima', nombres: 'Mario', apellidos: 'Lopez'
  }, token);
  assert(!invalidDniLetters.ok && invalidDniLetters.status === 400, 'DNI con letras debería fallar (400)');
  console.log('⚠️ Validación DNI con letras ok');

  const invalidDniLength = await request('POST', '/entidades', {
    tipoEntidad: 'Cliente', tipoDocumento: 'DNI', numeroDocumento: '123456789',
    email: `invalid.dni.length.${suffix}@example.com`, telefono: '999999995', direccion: 'Dir 1', ciudad: 'Lima', nombres: 'Mario', apellidos: 'Lopez'
  }, token);
  assert(!invalidDniLength.ok && invalidDniLength.status === 400, 'DNI con longitud distinta a 8 debería fallar (400)');
  console.log('⚠️ Validación DNI longitud != 8 ok');

  const invalidRuc = await request('POST', '/entidades', {
    tipoEntidad: 'Proveedor', tipoDocumento: 'RUC', numeroDocumento: '2012345678', // 10 dígitos
    email: `invalid.ruc.${suffix}@example.com`, telefono: '999999997', direccion: 'Dir 2', ciudad: 'Cusco'
  }, token); // sin razonSocial
  assert(!invalidRuc.ok && invalidRuc.status === 400, 'Crear RUC sin razón social debería fallar (400)');
  console.log('⚠️ Validación RUC inválido ok');

  // CE inválido (no 12 dígitos)
  const invalidCe = await request('POST', '/entidades', {
    tipoEntidad: 'Cliente', tipoDocumento: 'CE', numeroDocumento: '12345678901', // 11 dígitos
    email: `invalid.ce.${suffix}@example.com`, telefono: '999999994', direccion: 'Dir 3', ciudad: 'Lima', nombres: 'Luis', apellidos: 'Perez'
  }, token);
  assert(!invalidCe.ok && invalidCe.status === 400, 'Crear CE con longitud distinta a 12 debería fallar (400)');
  console.log('⚠️ Validación CE inválido ok');

  // 12) Conflictos por duplicado (email/documento)
  const dupEmailCreate = await request('POST', '/entidades', { ...clienteDniPayload, email: dniEmail, numeroDocumento: `99999${suffix}` }, token);
  assert(!dupEmailCreate.ok && dupEmailCreate.status === 400, 'Crear con email duplicado debería fallar (400)');
  console.log('🚫 Conflicto por email duplicado (create) ok');

  const dupEmailUpdate = await request('PUT', `/entidades/${clienteRuc.id}`, { email: dniEmail }, token);
  assert(!dupEmailUpdate.ok && dupEmailUpdate.status === 400, 'Actualizar con email duplicado debería fallar (400)');
  console.log('🚫 Conflicto por email duplicado (update) ok');

  // 13) Permisos negativos con Cajero
  const cajeroToken = await login('cajero@alexatech.com', 'cajero123');
  const cajeroList = await request('GET', '/entidades', null, cajeroToken);
  assert(cajeroList.status === 403, 'Cajero debería recibir 403 al listar');
  console.log('🔒 Permiso denegado (cajero listar) ok');

  const cajeroCreate = await request('POST', '/entidades', clienteDniPayload, cajeroToken);
  assert(cajeroCreate.status === 403, 'Cajero debería recibir 403 al crear');
  console.log('🔒 Permiso denegado (cajero crear) ok');

  // 14) Reactivación negativa
  const reactivateActive = await request('POST', `/entidades/${clienteRuc.id}/reactivate`, null, token);
  assert(!reactivateActive.ok && reactivateActive.status === 400, 'Reactivar activo debería fallar (400)');
  console.log('♻️ Reactivación de activo inválida ok');

  // 15) Intento de duplicado tras desactivar (bloqueado por restricción única)
  const deactivateA = await request('PUT', `/entidades/${clienteDni.id}`, { isActive: false }, token);
  assert(deactivateA.ok, 'No se pudo desactivar cliente A');
  const createBsameEmail = await request('POST', '/entidades', { ...clienteDniPayload, email: dniEmail, numeroDocumento: `88888${suffix}` }, token);
  assert(!createBsameEmail.ok, 'Crear B con mismo email debería fallar por unicidad');
  console.log('🚫 Duplicado de email bloqueado aun con A inactivo ok');

  console.log('🎉 Pruebas del módulo de Entidades Comerciales completadas exitosamente');
}

run().catch((err) => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});