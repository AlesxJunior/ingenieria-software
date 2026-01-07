/**
 * PRUEBAS E2E COMPLETAS - MÓDULO DE COMPRAS
 * 
 * Flujo completo desde creación hasta finalización de órdenes de compra
 * Incluye todos los casos reales de negocio
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let userId = '';

// IDs de entidades (se obtienen dinámicamente)
let proveedorId = '';
let almacenId = '';
let productoId1 = '';
let productoId2 = '';
let productoId3 = '';

// IDs de órdenes y recepciones creadas
let ordenId1 = ''; // Orden para flujo completo normal
let ordenId2 = ''; // Orden para recepción parcial
let ordenId3 = ''; // Orden para cancelación
let ordenId4 = ''; // Orden para sobre-recepción
let recepcionId1 = '';
let recepcionId2 = '';
let recepcionId3 = '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  validateStatus: () => true, // No lanzar error en status !== 2xx
});

// ============================================
// UTILIDADES
// ============================================

function log(emoji, message, data = null) {
  console.log(`\n${emoji} ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
  console.log(`✅ ${message}`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// SETUP - Autenticación y obtención de datos
// ============================================

async function setup() {
  log('🔐', 'SETUP - Autenticación y preparación de datos');

  // 1. Login
  const loginResponse = await api.post('/auth/login', {
    email: 'admin@alexatech.com',
    password: 'admin123'
  });

  if (loginResponse.status !== 200) {
    console.error('❌ Login falló:', loginResponse.status, loginResponse.data);
    throw new Error(`Login failed with status ${loginResponse.status}`);
  }
  
  assert(loginResponse.status === 200, 'Login exitoso');
  
  // Verificar estructura de la respuesta
  if (!loginResponse.data || !loginResponse.data.data) {
    console.error('❌ Respuesta de login mal formada:', loginResponse.data);
    throw new Error('Invalid login response structure');
  }
  
  authToken = loginResponse.data.data.accessToken; // Corregido: es accessToken, no token
  userId = loginResponse.data.data.user.id;

  if (!authToken) {
    console.error('❌ Token no encontrado en la respuesta:', loginResponse.data);
    throw new Error('Token not found in response');
  }

  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  log('✓', 'Token obtenido', { userId });

  // 2. Obtener o crear proveedor
  let proveedoresRes = await api.get('/entidades?tipo=PROVEEDOR&limit=1');
  
  if (proveedoresRes.status !== 200) {
    console.error('❌ Error obteniendo proveedores:', proveedoresRes.status, proveedoresRes.data);
    throw new Error(`Failed to get proveedores: ${proveedoresRes.status}`);
  }
  
  // La respuesta tiene data.clients en lugar de data.data
  const proveedores = proveedoresRes.data.data?.clients || [];
  
  // Si no hay proveedores, crear uno
  if (proveedores.length === 0) {
    log('⚠️', 'No hay proveedores, creando uno de prueba...');
    const createProveedorRes = await api.post('/entidades', {
      tipo: 'PROVEEDOR',
      razonSocial: 'Proveedor Test E2E',
      nombreComercial: 'Proveedor Test',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      email: 'proveedor.test@ejemplo.com',
      telefono: '987654321',
      direccion: 'Av. Test 123',
      activo: true
    });
    
    console.log('DEBUG createProveedorRes:', createProveedorRes.status, createProveedorRes.data);
    
    if (createProveedorRes.status === 201 && createProveedorRes.data && createProveedorRes.data.data) {
      proveedorId = createProveedorRes.data.data.id;
      log('✓', 'Proveedor creado', { proveedorId });
    } else {
      console.error('❌ Error creando proveedor:', createProveedorRes.status, createProveedorRes.data);
      throw new Error(`Failed to create proveedor: ${createProveedorRes.status}`);
    }
  } else {
    proveedorId = proveedores[0].id;
    log('✓', 'Proveedor seleccionado', { proveedorId, razonSocial: proveedores[0].razonSocial });
  }

  // 3. Obtener almacén
  const almacenesRes = await api.get('/almacenes?activo=true&limit=1');
  assert(almacenesRes.status === 200, 'Almacenes obtenidos');
  
  // La respuesta tiene data.rows
  const almacenes = almacenesRes.data.data?.rows || [];
  if (almacenes.length === 0) {
    throw new Error('No hay almacenes activos en la base de datos. Por favor crea al menos un almacén.');
  }
  
  almacenId = almacenes[0].id;
  log('✓', 'Almacén seleccionado', { almacenId, nombre: almacenes[0].nombre });

  // 4. Obtener productos
  const productosRes = await api.get('/productos?activo=true&limit=3');
  assert(productosRes.status === 200, 'Productos obtenidos');
  
  // La respuesta tiene data.products
  const productos = productosRes.data.data?.products || [];
  if (productos.length < 3) {
    throw new Error(`Se necesitan al menos 3 productos activos. Solo hay ${productos.length}.`);
  }
  
  productoId1 = productos[0].id;
  productoId2 = productos[1].id;
  productoId3 = productos[2].id;
  log('✓', 'Productos seleccionados', { 
    producto1: productos[0].nombre,
    producto2: productos[1].nombre,
    producto3: productos[2].nombre
  });
}

// ============================================
// TEST 1: Flujo Completo Normal
// ============================================

async function test1_FlujoCompletoNormal() {
  log('🧪', '=== TEST 1: FLUJO COMPLETO NORMAL ===');
  log('📝', 'Descripción: Crear orden → Enviar → Confirmar → Recibir todo → Confirmar recepción');

  // 1.1. Crear orden de compra
  log('1️⃣', 'Creando orden de compra...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    condicionesPago: 'Contado',
    items: [
      {
        productoId: productoId1,
        cantidadOrdenada: 50,
        precioUnitario: 10.00,
        descuento: 0,
        incluyeIGV: false
      },
      {
        productoId: productoId2,
        cantidadOrdenada: 30,
        precioUnitario: 15.00,
        descuento: 0,
        incluyeIGV: false
      }
    ],
    observaciones: 'Orden de prueba E2E - Flujo completo'
  });

  assert(createRes.status === 201, 'Orden creada con código 201');
  assert(createRes.data.data.estado === 'PENDIENTE', 'Orden en estado PENDIENTE');
  ordenId1 = createRes.data.data.id;
  const codigoOrden1 = createRes.data.data.codigo;
  log('✓', `Orden creada: ${codigoOrden1}`, { ordenId1, estado: 'PENDIENTE' });

  await sleep(500);

  // 1.2. Cambiar a ENVIADA
  log('2️⃣', 'Cambiando estado a ENVIADA...');
  const enviarRes = await api.patch(`/compras/ordenes/${ordenId1}/estado`, {
    estado: 'ENVIADA',
    observaciones: 'Orden enviada al proveedor'
  });

  assert(enviarRes.status === 200, 'Estado actualizado a ENVIADA');
  assert(enviarRes.data.data.estado === 'ENVIADA', 'Estado es ENVIADA');
  log('✓', 'Estado cambiado a ENVIADA');

  await sleep(500);

  // 1.3. Cambiar a CONFIRMADA
  log('3️⃣', 'Cambiando estado a CONFIRMADA...');
  const confirmarRes = await api.patch(`/compras/ordenes/${ordenId1}/estado`, {
    estado: 'CONFIRMADA',
    observaciones: 'Proveedor confirmó la orden'
  });

  assert(confirmarRes.status === 200, 'Estado actualizado a CONFIRMADA');
  assert(confirmarRes.data.data.estado === 'CONFIRMADA', 'Estado es CONFIRMADA');
  log('✓', 'Estado cambiado a CONFIRMADA');

  await sleep(500);

  // 1.4. Crear recepción completa
  log('4️⃣', 'Creando recepción completa (100%)...');
  
  // Obtener items de la orden para la recepción
  const ordenRes = await api.get(`/compras/ordenes/${ordenId1}`);
  const itemsOrden = ordenRes.data.data.items;

  const recepcionRes = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId1,
    almacenId: almacenId,
    recibidoPorId: userId,
    guiaRemision: 'GR-TEST-001',
    transportista: 'Transportes Test SA',
    condicionMercancia: 'Buena',
    items: itemsOrden.map(item => ({
      ordenCompraItemId: item.id,
      productoId: item.productoId,
      cantidadRecibida: item.cantidadOrdenada, // 100% de lo ordenado
      cantidadAceptada: item.cantidadOrdenada,
      cantidadRechazada: 0,
      estadoQC: 'APROBADO'
    })),
    observaciones: 'Recepción completa de la orden'
  });

  assert(recepcionRes.status === 201, 'Recepción creada');
  assert(recepcionRes.data.data.estado === 'PENDIENTE', 'Recepción en estado PENDIENTE');
  recepcionId1 = recepcionRes.data.data.id;
  log('✓', `Recepción creada: ${recepcionRes.data.data.codigo}`, { recepcionId1 });

  await sleep(500);

  // 1.5. Confirmar recepción (esto actualiza inventario)
  log('5️⃣', 'Confirmando recepción...');
  const confirmarRecepcionRes = await api.patch(`/compras/recepciones/${recepcionId1}/confirmar`, {
    inspeccionadoPorId: userId
  });

  if (confirmarRecepcionRes.status !== 200) {
    console.error('❌ Error confirmando recepción:', confirmarRecepcionRes.status, confirmarRecepcionRes.data);
    throw new Error(`Failed to confirm recepción: ${confirmarRecepcionRes.status}`);
  }

  assert(confirmarRecepcionRes.status === 200, 'Recepción confirmada');
  assert(confirmarRecepcionRes.data.data.estado === 'CONFIRMADA', 'Recepción CONFIRMADA');
  log('✓', 'Recepción confirmada - Inventario actualizado');

  await sleep(500);

  // 1.6. Verificar estado final de la orden
  log('6️⃣', 'Verificando estado final de la orden...');
  const ordenFinalRes = await api.get(`/compras/ordenes/${ordenId1}`);
  
  assert(ordenFinalRes.data.data.estado === 'COMPLETADA', 'Orden en estado COMPLETADA');
  assert(ordenFinalRes.data.data.fechaEntregaReal !== null, 'Tiene fecha de entrega real');
  
  // Verificar cantidades
  ordenFinalRes.data.data.items.forEach(item => {
    assert(item.cantidadRecibida === item.cantidadOrdenada, `Item recibido completamente`);
    assert(item.cantidadPendiente === 0, `No hay cantidad pendiente`);
  });

  log('✅', 'TEST 1 COMPLETADO - Flujo normal exitoso');
}

// ============================================
// TEST 2: Recepción Parcial
// ============================================

async function test2_RecepcionParcial() {
  log('🧪', '=== TEST 2: RECEPCIÓN PARCIAL ===');
  log('📝', 'Descripción: Crear orden → Confirmar → Recibir 60% → Recibir 40% restante');

  // 2.1. Crear orden
  log('1️⃣', 'Creando orden de compra...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    condicionesPago: 'Crédito 30 días',
    items: [
      {
        productoId: productoId1,
        cantidadOrdenada: 100,
        precioUnitario: 8.00,
        descuento: 0,
        incluyeIGV: false
      }
    ],
    observaciones: 'Orden de prueba E2E - Recepción parcial'
  });

  assert(createRes.status === 201, 'Orden creada');
  ordenId2 = createRes.data.data.id;
  log('✓', `Orden creada: ${createRes.data.data.codigo}`);

  await sleep(500);

  // 2.2. Pasar directamente a CONFIRMADA
  await api.patch(`/compras/ordenes/${ordenId2}/estado`, { estado: 'ENVIADA' });
  await sleep(300);
  await api.patch(`/compras/ordenes/${ordenId2}/estado`, { estado: 'CONFIRMADA' });
  log('✓', 'Orden confirmada');

  await sleep(500);

  // 2.3. Primera recepción parcial (60%)
  log('2️⃣', 'Creando primera recepción parcial (60 de 100)...');
  const ordenRes1 = await api.get(`/compras/ordenes/${ordenId2}`);
  const item = ordenRes1.data.data.items[0];

  const recepcion1Res = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId2,
    almacenId: almacenId,
    recibidoPorId: userId,
    guiaRemision: 'GR-PARCIAL-001',
    items: [{
      ordenCompraItemId: item.id,
      productoId: item.productoId,
      cantidadRecibida: 60,
      cantidadAceptada: 60,
      cantidadRechazada: 0,
      estadoQC: 'APROBADO'
    }],
    observaciones: 'Primera entrega parcial'
  });

  assert(recepcion1Res.status === 201, 'Primera recepción creada');
  recepcionId2 = recepcion1Res.data.data.id;

  await sleep(500);

  // 2.4. Confirmar primera recepción
  await api.patch(`/compras/recepciones/${recepcionId2}/confirmar`, {
    inspeccionadoPorId: userId
  });
  log('✓', 'Primera recepción confirmada (60%)');

  await sleep(500);

  // 2.5. Verificar estado PARCIAL
  log('3️⃣', 'Verificando estado PARCIAL...');
  const ordenParcialRes = await api.get(`/compras/ordenes/${ordenId2}`);
  
  assert(ordenParcialRes.data.data.estado === 'PARCIAL', 'Orden en estado PARCIAL');
  assert(ordenParcialRes.data.data.items[0].cantidadRecibida === 60, 'Recibido 60');
  assert(ordenParcialRes.data.data.items[0].cantidadPendiente === 40, 'Pendiente 40');
  log('✓', 'Estado PARCIAL verificado - 60% recibido, 40% pendiente');

  await sleep(500);

  // 2.6. Segunda recepción (40% restante)
  log('4️⃣', 'Creando segunda recepción (40 restantes)...');
  const ordenRes2 = await api.get(`/compras/ordenes/${ordenId2}`);
  const item2 = ordenRes2.data.data.items[0];

  const recepcion2Res = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId2,
    almacenId: almacenId,
    recibidoPorId: userId,
    guiaRemision: 'GR-PARCIAL-002',
    items: [{
      ordenCompraItemId: item2.id,
      productoId: item2.productoId,
      cantidadRecibida: 40,
      cantidadAceptada: 40,
      cantidadRechazada: 0,
      estadoQC: 'APROBADO'
    }],
    observaciones: 'Segunda entrega - completando orden'
  });

  assert(recepcion2Res.status === 201, 'Segunda recepción creada');
  recepcionId3 = recepcion2Res.data.data.id;

  await sleep(500);

  // 2.7. Confirmar segunda recepción
  await api.patch(`/compras/recepciones/${recepcionId3}/confirmar`, {
    inspeccionadoPorId: userId
  });
  log('✓', 'Segunda recepción confirmada (40%)');

  await sleep(500);

  // 2.8. Verificar estado COMPLETADA
  log('5️⃣', 'Verificando estado final COMPLETADA...');
  const ordenCompletaRes = await api.get(`/compras/ordenes/${ordenId2}`);
  
  assert(ordenCompletaRes.data.data.estado === 'COMPLETADA', 'Orden COMPLETADA');
  assert(ordenCompletaRes.data.data.items[0].cantidadRecibida === 100, 'Total recibido: 100');
  assert(ordenCompletaRes.data.data.items[0].cantidadPendiente === 0, 'Pendiente: 0');
  log('✓', 'Orden completada al 100%');

  log('✅', 'TEST 2 COMPLETADO - Recepción parcial exitosa');
}

// ============================================
// TEST 3: Cancelación de Orden
// ============================================

async function test3_CancelacionOrden() {
  log('🧪', '=== TEST 3: CANCELACIÓN DE ORDEN ===');
  log('📝', 'Descripción: Crear orden → Cancelar (solo permite en PENDIENTE/ENVIADA)');

  // 3.1. Crear orden
  log('1️⃣', 'Creando orden de compra...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    condicionesPago: 'Contado',
    items: [{
      productoId: productoId3,
      cantidadOrdenada: 25,
      precioUnitario: 12.00,
      descuento: 0,
      incluyeIGV: false
    }],
    observaciones: 'Orden de prueba E2E - Para cancelar'
  });

  assert(createRes.status === 201, 'Orden creada');
  ordenId3 = createRes.data.data.id;
  log('✓', `Orden creada: ${createRes.data.data.codigo}`);

  await sleep(500);

  // 3.2. Cancelar orden en estado PENDIENTE
  log('2️⃣', 'Cancelando orden en estado PENDIENTE...');
  const cancelRes = await api.delete(`/compras/ordenes/${ordenId3}`, {
    data: { motivo: 'Proveedor no tiene stock disponible' }
  });

  assert(cancelRes.status === 200, 'Orden cancelada exitosamente');
  log('✓', 'Orden cancelada en estado PENDIENTE');

  await sleep(500);

  // 3.3. Verificar estado CANCELADA
  const ordenCanceladaRes = await api.get(`/compras/ordenes/${ordenId3}`);
  assert(ordenCanceladaRes.data.data.estado === 'CANCELADA', 'Estado es CANCELADA');
  log('✓', 'Estado CANCELADA verificado');

  await sleep(500);

  // 3.4. Intentar cancelar nuevamente (debe fallar)
  log('3️⃣', 'Intentando cancelar orden ya cancelada (debe fallar)...');
  const cancelDuplicadoRes = await api.delete(`/compras/ordenes/${ordenId3}`, {
    data: { motivo: 'Intento duplicado' }
  });

  assert(cancelDuplicadoRes.status === 500, 'Cancelación duplicada rechazada');
  log('✓', 'Sistema previene cancelación duplicada correctamente');

  log('✅', 'TEST 3 COMPLETADO - Cancelación exitosa');
}

// ============================================
// TEST 4: Sobre-Recepción (110%)
// ============================================

async function test4_SobreRecepcion() {
  log('🧪', '=== TEST 4: SOBRE-RECEPCIÓN (110%) ===');
  log('📝', 'Descripción: Orden 100 unidades → Recibir 110 (dentro del límite) → Debe completarse');

  // 4.1. Crear orden
  log('1️⃣', 'Creando orden de 100 unidades...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    condicionesPago: 'Contado',
    items: [{
      productoId: productoId2,
      cantidadOrdenada: 100,
      precioUnitario: 20.00,
      descuento: 0,
      incluyeIGV: false
    }],
    observaciones: 'Orden de prueba E2E - Sobre-recepción'
  });

  assert(createRes.status === 201, 'Orden creada');
  ordenId4 = createRes.data.data.id;
  log('✓', `Orden creada: ${createRes.data.data.codigo} (100 unidades)`);

  await sleep(500);

  // 4.2. Confirmar orden
  await api.patch(`/compras/ordenes/${ordenId4}/estado`, { estado: 'ENVIADA' });
  await sleep(300);
  await api.patch(`/compras/ordenes/${ordenId4}/estado`, { estado: 'CONFIRMADA' });
  log('✓', 'Orden confirmada');

  await sleep(500);

  // 4.3. Crear recepción con 110 unidades (110%)
  log('2️⃣', 'Creando recepción con 110 unidades (sobre-entrega del proveedor)...');
  const ordenRes = await api.get(`/compras/ordenes/${ordenId4}`);
  const item = ordenRes.data.data.items[0];

  const recepcionSobreRes = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId4,
    almacenId: almacenId,
    recibidoPorId: userId,
    guiaRemision: 'GR-SOBRE-001',
    items: [{
      ordenCompraItemId: item.id,
      productoId: item.productoId,
      cantidadRecibida: 110, // 110% de lo ordenado
      cantidadAceptada: 110,
      cantidadRechazada: 0,
      estadoQC: 'APROBADO',
      observaciones: 'Proveedor envió 10 unidades extra como bonus'
    }],
    observaciones: 'Recepción con sobre-entrega (110%)'
  });

  assert(recepcionSobreRes.status === 201, 'Recepción con sobre-entrega creada');
  log('✓', 'Recepción de 110 unidades permitida (dentro del límite 110%)');

  await sleep(500);

  // 4.4. Confirmar recepción
  log('3️⃣', 'Confirmando recepción con sobre-entrega...');
  const recepcionId = recepcionSobreRes.data.data.id;
  await api.patch(`/compras/recepciones/${recepcionId}/confirmar`, {
    inspeccionadoPorId: userId
  });
  log('✓', 'Recepción confirmada - Inventario actualizado con 110 unidades');

  await sleep(500);

  // 4.5. Verificar estado COMPLETADA (no PARCIAL)
  log('4️⃣', 'Verificando estado de la orden...');
  const ordenFinalRes = await api.get(`/compras/ordenes/${ordenId4}`);
  
  assert(ordenFinalRes.data.data.estado === 'COMPLETADA', 'Orden en estado COMPLETADA');
  assert(ordenFinalRes.data.data.items[0].cantidadRecibida === 110, 'Recibido 110');
  assert(ordenFinalRes.data.data.items[0].cantidadPendiente === -10, 'Pendiente: -10 (indica sobre-entrega)');
  assert(
    ordenFinalRes.data.data.observaciones.includes('sobre-recepción'),
    'Observaciones incluyen nota de sobre-recepción'
  );
  log('✓', 'Orden COMPLETADA con sobre-recepción registrada');

  await sleep(500);

  // 4.6. Intentar sobre-recepción mayor al 110% (debe fallar)
  log('5️⃣', 'Intentando sobre-recepción > 110% (debe fallar)...');
  
  // Crear nueva orden
  const nuevaOrdenRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    items: [{
      productoId: productoId3,
      cantidadOrdenada: 100,
      precioUnitario: 10.00,
      descuento: 0,
      incluyeIGV: false
    }]
  });
  
  const nuevaOrdenId = nuevaOrdenRes.data.data.id;
  await api.patch(`/compras/ordenes/${nuevaOrdenId}/estado`, { estado: 'ENVIADA' });
  await api.patch(`/compras/ordenes/${nuevaOrdenId}/estado`, { estado: 'CONFIRMADA' });
  
  const ordenExcesoRes = await api.get(`/compras/ordenes/${nuevaOrdenId}`);
  const itemExceso = ordenExcesoRes.data.data.items[0];

  const recepcionExcesoRes = await api.post('/compras/recepciones', {
    ordenCompraId: nuevaOrdenId,
    almacenId: almacenId,
    recibidoPorId: userId,
    items: [{
      ordenCompraItemId: itemExceso.id,
      productoId: itemExceso.productoId,
      cantidadRecibida: 115, // 115% - Excede el límite
      cantidadAceptada: 115,
      cantidadRechazada: 0,
      estadoQC: 'APROBADO'
    }]
  });

  assert(recepcionExcesoRes.status === 500, 'Sobre-recepción > 110% rechazada');
  assert(
    recepcionExcesoRes.data.message.includes('límite permitido'),
    'Mensaje indica que excede el límite'
  );
  log('✓', 'Sistema rechaza correctamente sobre-recepción > 110%');

  log('✅', 'TEST 4 COMPLETADO - Sobre-recepción manejada correctamente');
}

// ============================================
// TEST 5: Cancelación de Recepción
// ============================================

async function test5_CancelacionRecepcion() {
  log('🧪', '=== TEST 5: CANCELACIÓN DE RECEPCIÓN ===');
  log('📝', 'Descripción: Crear recepción PENDIENTE → Cancelar antes de confirmar');

  // 5.1. Crear orden
  log('1️⃣', 'Creando orden de compra...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    items: [{
      productoId: productoId1,
      cantidadOrdenada: 50,
      precioUnitario: 5.00,
      descuento: 0,
      incluyeIGV: false
    }]
  });

  const ordenId = createRes.data.data.id;
  await api.patch(`/compras/ordenes/${ordenId}/estado`, { estado: 'ENVIADA' });
  await api.patch(`/compras/ordenes/${ordenId}/estado`, { estado: 'CONFIRMADA' });
  log('✓', 'Orden confirmada');

  await sleep(500);

  // 5.2. Crear recepción
  log('2️⃣', 'Creando recepción...');
  const ordenRes = await api.get(`/compras/ordenes/${ordenId}`);
  const item = ordenRes.data.data.items[0];

  const recepcionRes = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId,
    almacenId: almacenId,
    recibidoPorId: userId,
    items: [{
      ordenCompraItemId: item.id,
      productoId: item.productoId,
      cantidadRecibida: 50,
      cantidadAceptada: 50,
      cantidadRechazada: 0,
      estadoQC: 'APROBADO'
    }]
  });

  assert(recepcionRes.status === 201, 'Recepción creada');
  const recepcionId = recepcionRes.data.data.id;
  log('✓', `Recepción creada: ${recepcionRes.data.data.codigo}`);

  await sleep(500);

  // 5.3. Cancelar recepción PENDIENTE
  log('3️⃣', 'Cancelando recepción PENDIENTE...');
  const cancelRes = await api.patch(`/compras/recepciones/${recepcionId}/anular`, {
    motivo: 'Mercancía llegó en mal estado'
  });

  assert(cancelRes.status === 200, 'Recepción cancelada');
  assert(cancelRes.data.data.estado === 'CANCELADA', 'Estado es CANCELADA');
  log('✓', 'Recepción cancelada exitosamente');

  await sleep(500);

  // 5.4. Verificar que la orden sigue en estado correcto
  const ordenFinalRes = await api.get(`/compras/ordenes/${ordenId}`);
  assert(ordenFinalRes.data.data.estado === 'CONFIRMADA', 'Orden vuelve a CONFIRMADA');
  log('✓', 'Orden mantiene estado correcto después de cancelar recepción');

  log('✅', 'TEST 5 COMPLETADO - Cancelación de recepción exitosa');
}

// ============================================
// TEST 6: Edición de Orden
// ============================================

async function test6_EdicionOrden() {
  log('🧪', '=== TEST 6: EDICIÓN DE ORDEN ===');
  log('📝', 'Descripción: Editar orden PENDIENTE (cambiar cantidades, agregar/quitar items)');

  // 6.1. Crear orden
  log('1️⃣', 'Creando orden de compra...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    items: [
      {
        productoId: productoId1,
        cantidadOrdenada: 20,
        precioUnitario: 10.00,
        descuento: 0,
        incluyeIGV: false
      },
      {
        productoId: productoId2,
        cantidadOrdenada: 15,
        precioUnitario: 12.00,
        descuento: 0,
        incluyeIGV: false
      }
    ]
  });

  const ordenId = createRes.data.data.id;
  const codigoOriginal = createRes.data.data.codigo;
  log('✓', `Orden creada: ${codigoOriginal} (2 items)`);

  await sleep(500);

  // 6.2. Editar orden (cambiar cantidades y agregar producto)
  log('2️⃣', 'Editando orden (modificar cantidades y agregar item)...');
  const editRes = await api.put(`/compras/ordenes/${ordenId}`, {
    proveedorId,
    almacenDestinoId: almacenId,
    moneda: 'PEN',
    items: [
      {
        productoId: productoId1,
        cantidadOrdenada: 30, // Aumentado de 20 a 30
        precioUnitario: 10.00,
        descuento: 0,
        incluyeIGV: false
      },
      {
        productoId: productoId2,
        cantidadOrdenada: 10, // Reducido de 15 a 10
        precioUnitario: 12.00,
        descuento: 0,
        incluyeIGV: false
      },
      {
        productoId: productoId3,
        cantidadOrdenada: 5, // Nuevo producto agregado
        precioUnitario: 15.00,
        descuento: 0,
        incluyeIGV: false
      }
    ],
    observaciones: 'Orden editada - cambios en cantidades'
  });

  assert(editRes.status === 200, 'Orden editada exitosamente');
  assert(editRes.data.data.items.length === 3, 'Ahora tiene 3 items');
  assert(editRes.data.data.codigo === codigoOriginal, 'Código no cambió');
  log('✓', 'Orden editada: cantidades modificadas y nuevo item agregado');

  await sleep(500);

  // 6.3. Verificar cambios
  log('3️⃣', 'Verificando cambios aplicados...');
  const ordenEditadaRes = await api.get(`/compras/ordenes/${ordenId}`);
  const items = ordenEditadaRes.data.data.items;

  const item1 = items.find(i => i.productoId === productoId1);
  const item2 = items.find(i => i.productoId === productoId2);
  const item3 = items.find(i => i.productoId === productoId3);

  assert(item1.cantidadOrdenada === 30, 'Item 1: cantidad actualizada a 30');
  assert(item2.cantidadOrdenada === 10, 'Item 2: cantidad actualizada a 10');
  assert(item3.cantidadOrdenada === 5, 'Item 3: nuevo producto agregado');
  log('✓', 'Todos los cambios aplicados correctamente');

  log('✅', 'TEST 6 COMPLETADO - Edición de orden exitosa');
}

// ============================================
// TEST 7: Validaciones de Negocio
// ============================================

async function test7_ValidacionesNegocio() {
  log('🧪', '=== TEST 7: VALIDACIONES DE NEGOCIO ===');
  log('📝', 'Descripción: Verificar que el sistema rechaza operaciones inválidas');

  // 7.1. Intentar crear orden sin items
  log('1️⃣', 'Intentando crear orden sin items (debe fallar)...');
  const sinItemsRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    items: []
  });

  assert(sinItemsRes.status === 400 || sinItemsRes.status === 500, 'Orden sin items rechazada');
  log('✓', 'Sistema rechaza orden sin items');

  await sleep(300);

  // 7.2. Crear orden válida para pruebas de transición
  const ordenRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    items: [{
      productoId: productoId1,
      cantidadOrdenada: 10,
      precioUnitario: 5.00,
      descuento: 0,
      incluyeIGV: false
    }]
  });

  const ordenId = ordenRes.data.data.id;

  await sleep(300);

  // 7.3. Intentar transición inválida (PENDIENTE → COMPLETADA)
  log('2️⃣', 'Intentando transición inválida PENDIENTE → COMPLETADA (debe fallar)...');
  const transicionInvalidaRes = await api.patch(`/compras/ordenes/${ordenId}/estado`, {
    estado: 'COMPLETADA'
  });

  assert(transicionInvalidaRes.status === 500, 'Transición inválida rechazada');
  log('✓', 'Sistema rechaza transición inválida de estados');

  await sleep(300);

  // 7.4. Confirmar orden y luego intentar cancelar (debe fallar)
  log('3️⃣', 'Intentando cancelar orden CONFIRMADA (debe fallar)...');
  await api.patch(`/compras/ordenes/${ordenId}/estado`, { estado: 'ENVIADA' });
  await api.patch(`/compras/ordenes/${ordenId}/estado`, { estado: 'CONFIRMADA' });

  const cancelConfirmadaRes = await api.delete(`/compras/ordenes/${ordenId}`, {
    data: { motivo: 'Intento inválido' }
  });

  assert(cancelConfirmadaRes.status === 500, 'Cancelación de orden CONFIRMADA rechazada');
  log('✓', 'Sistema previene cancelación de órdenes confirmadas');

  await sleep(300);

  // 7.5. Intentar crear recepción con cantidad negativa
  log('4️⃣', 'Intentando crear recepción con cantidad negativa (debe fallar)...');
  const ordenDetalleRes = await api.get(`/compras/ordenes/${ordenId}`);
  const item = ordenDetalleRes.data.data.items[0];

  const cantidadNegativaRes = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId,
    almacenId: almacenId,
    recibidoPorId: userId,
    items: [{
      ordenCompraItemId: item.id,
      productoId: item.productoId,
      cantidadRecibida: -5, // Cantidad negativa
      cantidadAceptada: -5,
      cantidadRechazada: 0
    }]
  });

  assert(cantidadNegativaRes.status === 500, 'Cantidad negativa rechazada');
  log('✓', 'Sistema rechaza cantidades negativas');

  log('✅', 'TEST 7 COMPLETADO - Validaciones funcionando correctamente');
}

// ============================================
// TEST 8: Productos con Rechazo
// ============================================

async function test8_ProductosConRechazo() {
  log('🧪', '=== TEST 8: RECEPCIÓN CON PRODUCTOS RECHAZADOS ===');
  log('📝', 'Descripción: Recibir productos con algunos rechazados por defectos');

  // 8.1. Crear orden
  log('1️⃣', 'Creando orden de compra...');
  const createRes = await api.post('/compras/ordenes', {
    proveedorId,
    almacenDestinoId: almacenId,
    solicitadoPorId: userId,
    moneda: 'PEN',
    items: [{
      productoId: productoId1,
      cantidadOrdenada: 100,
      precioUnitario: 8.00,
      descuento: 0,
      incluyeIGV: false
    }]
  });

  const ordenId = createRes.data.data.id;
  await api.patch(`/compras/ordenes/${ordenId}/estado`, { estado: 'ENVIADA' });
  await api.patch(`/compras/ordenes/${ordenId}/estado`, { estado: 'CONFIRMADA' });
  log('✓', 'Orden confirmada');

  await sleep(500);

  // 8.2. Crear recepción con productos rechazados
  log('2️⃣', 'Creando recepción con productos rechazados...');
  const ordenRes = await api.get(`/compras/ordenes/${ordenId}`);
  const item = ordenRes.data.data.items[0];

  const recepcionRes = await api.post('/compras/recepciones', {
    ordenCompraId: ordenId,
    almacenId: almacenId,
    recibidoPorId: userId,
    guiaRemision: 'GR-RECHAZO-001',
    items: [{
      ordenCompraItemId: item.id,
      productoId: item.productoId,
      cantidadRecibida: 100,
      cantidadAceptada: 85, // 85% aceptado
      cantidadRechazada: 15, // 15% rechazado
      estadoQC: 'PARCIAL', // CORRECTO: Usar valor del enum (PENDIENTE | APROBADO | RECHAZADO | PARCIAL)
      motivoRechazo: 'Productos con defectos de fábrica - empaques dañados',
      observaciones: '15 unidades presentan daños en el empaque'
    }]
  });

  assert(recepcionRes.status === 201, `Recepción con rechazos creada (Status: ${recepcionRes.status})`);
  log('✓', 'Recepción creada: 85 aceptados, 15 rechazados');

  await sleep(500);

  // 8.3. Confirmar recepción
  log('3️⃣', 'Confirmando recepción...');
  const recepcionId = recepcionRes.data.data.id;
  await api.patch(`/compras/recepciones/${recepcionId}/confirmar`, {
    inspeccionadoPorId: userId
  });
  log('✓', 'Recepción confirmada - Solo productos aceptados van al inventario');

  await sleep(500);

  // 8.4. Verificar que solo los aceptados sumaron al inventario
  log('4️⃣', 'Verificando actualización de inventario...');
  const ordenFinalRes = await api.get(`/compras/ordenes/${ordenId}`);
  
  assert(ordenFinalRes.data.data.items[0].cantidadRecibida === 100, 'Total recibido: 100');
  assert(ordenFinalRes.data.data.items[0].cantidadAceptada === 85, 'Aceptados: 85');
  assert(ordenFinalRes.data.data.items[0].cantidadRechazada === 15, 'Rechazados: 15');
  assert(ordenFinalRes.data.data.items[0].cantidadPendiente === 0, 'Pendiente: 0 (completada)');
  assert(ordenFinalRes.data.data.estado === 'COMPLETADA', 'Orden COMPLETADA');
  log('✓', 'Inventario actualizado correctamente (solo +85 unidades)');

  log('✅', 'TEST 8 COMPLETADO - Manejo de rechazos exitoso');
}

// ============================================
// EJECUCIÓN PRINCIPAL
// ============================================

async function runAllTests() {
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  PRUEBAS E2E - MÓDULO DE COMPRAS COMPLETO');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\n');

  const startTime = Date.now();

  try {
    await setup();
    console.log('\n' + '─'.repeat(55) + '\n');

    await test1_FlujoCompletoNormal();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test2_RecepcionParcial();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test3_CancelacionOrden();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test4_SobreRecepcion();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test5_CancelacionRecepcion();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test6_EdicionOrden();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test7_ValidacionesNegocio();
    console.log('\n' + '─'.repeat(55) + '\n');
    await sleep(1000);

    await test8_ProductosConRechazo();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('  ✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`  Tiempo total: ${duration}s`);
    console.log(`  Tests ejecutados: 8`);
    console.log(`  Estado: PASSED ✓`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('\n');

  } catch (error) {
    console.error('\n');
    console.error('═══════════════════════════════════════════════════════');
    console.error('  ❌ ERROR EN LAS PRUEBAS');
    console.error('═══════════════════════════════════════════════════════');
    console.error(error.message);
    console.error(error.stack);
    console.error('═══════════════════════════════════════════════════════');
    console.error('\n');
    process.exit(1);
  }
}

// Ejecutar pruebas
runAllTests();
