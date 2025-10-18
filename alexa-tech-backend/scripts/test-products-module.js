// Pruebas del módulo de Productos (RF-15, RF-16, RF-17)
// Ejecutar con: npm run test:productos (o usando alias con cuentas)

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const DEFAULT_EMAIL = process.env.AUTH_EMAIL || 'admin@alexatech.com';
const DEFAULT_PASSWORD = process.env.AUTH_PASSWORD || 'admin123';

// Generar códigos únicos por ejecución para evitar conflictos en re-runs
const RUN_ID = `${Date.now()}`.slice(-6);
const CODE1 = `PRD-${RUN_ID}-001`;
const CODE2 = `PRD-${RUN_ID}-002`;
const CODE3 = `PRD-${RUN_ID}-003`;

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
  console.log('🚀 Iniciando pruebas del módulo de Productos...');

  // 1) Verificación sin token (debe fallar 401)
  const noToken = await request('GET', `/productos/${CODE1}`, null, null);
  assert(noToken.status === 401, `Acceso sin token debería ser 401, recibido ${noToken.status}`);
  console.log('🔒 Acceso sin token correctamente bloqueado (401)');

  // 2) Login Admin y creación de producto (RF-15)
  const adminToken = await login(DEFAULT_EMAIL, DEFAULT_PASSWORD);
  const productoNuevo = {
    codigo: CODE1,
    nombre: 'Laptop Pro 14',
    descripcion: 'Equipo profesional para trabajo exigente',
    categoria: 'Computo',
    precioVenta: 2999.99,
    stock: 10,
    unidadMedida: 'unidad',
    ubicacion: 'Almacen A1',
  };
  const creacion = await request('POST', '/productos', productoNuevo, adminToken);
  if (!creacion.ok) {
    console.log('➡️ Respuesta creación:', creacion.status, creacion.body);
  }
  assert(creacion.ok && creacion.body?.data?.codigo === CODE1, 'Admin: creación de producto falló');
  console.log('🆕 Admin: producto creado correctamente');

  // Consultar por código
  const get1 = await request('GET', `/productos/${CODE1}`, null, adminToken);
  assert(get1.ok && get1.body?.data?.codigo === CODE1, 'Admin: get producto por código falló');
  console.log('📍 Admin: get producto por código ok');

  // 3) Edición de producto (RF-16)
  const updateFull = {
    nombre: 'Laptop Pro 14 2025',
    precioVenta: 3099.5,
    stock: 12,
    ubicacion: 'Almacen B2',
  };
  const putRes = await request('PUT', `/productos/${CODE1}`, updateFull, adminToken);
  assert(putRes.ok && putRes.body?.data?.nombre === updateFull.nombre, 'Admin: actualización completa falló');
  console.log('✏️ Admin: actualización completa ok');

  // 4) Cambio de estado (RF-17) -> inactivar
  const patchEstado = await request('PATCH', `/productos/${CODE1}/status`, { estado: false }, adminToken);
  assert(patchEstado.ok && patchEstado.body?.data?.estado === false, 'Admin: cambio de estado (inactivar) falló');
  console.log('⏸️ Admin: estado cambiado a inactivo');

  // 5) Duplicado por código debe generar conflicto (409)
  const duplicado = await request('POST', '/productos', productoNuevo, adminToken);
  assert(duplicado.status === 409, `Admin: duplicado debería ser 409, recibido ${duplicado.status}`);
  console.log('🔁 Admin: conflicto por código duplicado detectado (409)');

  // 6) Permisos: Cajero no debe poder crear (403)
  const cajeroToken = await login('cajero@alexatech.com', 'cajero123');
  const cajeroCrear = await request('POST', '/productos', {
    codigo: 'PRD-002',
    nombre: 'Mouse Gamer',
    categoria: 'Accesorios',
    precioVenta: 99.9,
    unidadMedida: 'unidad',
  }, cajeroToken);
  assert(cajeroCrear.status === 403, `Cajero debería recibir 403 al crear, recibido ${cajeroCrear.status}`);
  console.log('🔒 Cajero: permiso denegado correctamente (403)');

  // 7) Supervisor puede editar y consultar
  const supervisorToken = await login('supervisor@alexatech.com', 'supervisor123');
  const supGet = await request('GET', `/productos/${CODE1}`, null, supervisorToken);
  assert(supGet.ok && supGet.body?.data?.codigo === CODE1, 'Supervisor: get por código falló');
  console.log('📚 Supervisor: get producto por código ok');
  const supPatch = await request('PATCH', `/productos/${CODE1}/status`, { estado: true }, supervisorToken);
  assert(supPatch.ok && supPatch.body?.data?.estado === true, 'Supervisor: reactivar producto falló');
  console.log('▶️ Supervisor: reactivación ok');

  // 8) Crear productos adicionales para pruebas de filtros y búsqueda
  const adminCreate2 = await request('POST', '/productos', {
    codigo: CODE2,
    nombre: 'Mouse Gamer X',
    descripcion: 'Ratón de alto rendimiento',
    categoria: 'Accesorios',
    precioVenta: 79.99,
    stock: 25,
    unidadMedida: 'unidad',
    ubicacion: 'Almacen A2',
  }, adminToken);
  assert(adminCreate2.ok, 'Admin: creación PRD-002 falló');

  const adminCreate3 = await request('POST', '/productos', {
    codigo: CODE3,
    nombre: 'Monitor 24" IPS',
    descripcion: 'Pantalla IPS Full HD',
    categoria: 'Computo',
    precioVenta: 499.5,
    stock: 0,
    unidadMedida: 'caja',
    ubicacion: 'Almacen C1',
  }, adminToken);
  assert(adminCreate3.ok, 'Admin: creación PRD-003 falló');

  // 9) Listado general
  const listAll = await request('GET', '/productos', null, adminToken);
  assert(listAll.ok && Array.isArray(listAll.body?.data?.products), 'Listado: respuesta inválida');
  assert(listAll.body.data.products.length >= 3, `Listado: se esperaban >=3 productos, recibidos ${listAll.body.data.products.length}`);
  console.log('🗂️ Listado general ok');

  // 10) Búsqueda por texto (q)
  const searchLaptop = await request('GET', '/productos?q=Laptop', null, adminToken);
  assert(searchLaptop.ok && searchLaptop.body?.data?.products?.some((p) => (p.nombre || '').toLowerCase().includes('laptop')), 'Búsqueda: no encontró producto con nombre que contenga Laptop');
  console.log('🔎 Búsqueda por texto q ok');

  // 11) Filtro por categoría
  const filterComputo = await request('GET', '/productos?categoria=Computo', null, adminToken);
  assert(filterComputo.ok, 'Filtro categoría: respuesta falló');
  const codsComputo = (filterComputo.body?.data?.products || []).map((p) => p.codigo);
  assert(codsComputo.includes(CODE1) && codsComputo.includes(CODE3), 'Filtro categoría: faltan productos esperados');
  console.log('🏷️ Filtro por categoría ok');

  // 12) Rango de precio
  const filterPrice = await request('GET', '/productos?minPrecio=100&maxPrecio=1000', null, adminToken);
  assert(filterPrice.ok, 'Filtro precio: respuesta falló');
  const codsPrice = (filterPrice.body?.data?.products || []).map((p) => p.codigo);
  assert(!codsPrice.includes(CODE1) && codsPrice.includes(CODE3), 'Filtro precio: resultados no coinciden');
  console.log('💲 Filtro por rango de precio ok');

  // 13) Cambiar estado PRD-002 a inactivo y filtrar por estado
  const inactivate2 = await request('PATCH', `/productos/${CODE2}/status`, { estado: false }, adminToken);
  assert(inactivate2.ok && inactivate2.body?.data?.estado === false, 'Inactivación PRD-002 falló');
  const filterInactive = await request('GET', '/productos?estado=false', null, adminToken);
  assert(filterInactive.ok && filterInactive.body?.data?.products?.some((p) => p.codigo === CODE2), 'Filtro estado=false: no encontró PRD-002');
  console.log('⛔ Filtro por estado inactivo ok');

  // 14) Filtro por unidad de medida
  const filterUnidad = await request('GET', '/productos?unidadMedida=caja', null, adminToken);
  assert(filterUnidad.ok && filterUnidad.body?.data?.products?.some((p) => p.codigo === CODE3), 'Filtro unidadMedida=caja: no encontró PRD-003');
  console.log('📦 Filtro por unidad de medida ok');

  // 15) Filtro por ubicación (contains)
  const filterUbic = await request('GET', '/productos?ubicacion=Almacen B2', null, adminToken);
  assert(filterUbic.ok && filterUbic.body?.data?.products?.some((p) => p.codigo === CODE1), 'Filtro ubicacion: no encontró PRD-001');
  console.log('📍 Filtro por ubicación ok');

  // 16) Filtro por stock mínimo
  const filterStock = await request('GET', '/productos?minStock=1', null, adminToken);
  assert(filterStock.ok, 'Filtro stock: respuesta falló');
  const codsStock = (filterStock.body?.data?.products || []).map((p) => p.codigo);
  assert(codsStock.includes(CODE1) && !codsStock.includes(CODE3), 'Filtro minStock=1: resultados no coinciden');
  console.log('📈 Filtro por stock mínimo ok');

  // 17) Validaciones de filtros (errores esperados)
  const badMinPrecio = await request('GET', '/productos?minPrecio=abc', null, adminToken);
  assert(badMinPrecio.status === 400, `Validación minPrecio=abc debería 400, recibido ${badMinPrecio.status}`);
  const badMinStock = await request('GET', '/productos?minStock=-1', null, adminToken);
  assert(badMinStock.status === 400, `Validación minStock=-1 debería 400, recibido ${badMinStock.status}`);
  console.log('🧪 Validaciones de filtros: errores esperados ok');

  console.log('🎉 Pruebas del módulo de Productos completadas exitosamente');
}

run().catch((err) => {
  console.error('❌ Error en pruebas de productos:', err);
  process.exit(1);
});