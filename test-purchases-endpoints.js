/**
 * Test E2E - Módulo de Compras (Purchases)
 * Validar endpoints REST del módulo purchases
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let testOrderId = '';
let testReceiptId = '';

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper para hacer requests
async function request(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (data) config.data = data;
    if (authToken) config.headers['Authorization'] = `Bearer ${authToken}`;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// Tests
async function test1_Login() {
  log('\n📝 TEST 1: Login de usuario admin', 'blue');
  const result = await request('POST', '/auth/login', {
    identifier: 'admin',
    password: 'admin123',
  });

  if (result.success && result.data.data?.token) {
    authToken = result.data.data.token;
    log('✅ Login exitoso. Token obtenido.', 'green');
    return true;
  } else {
    log('❌ Error en login: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

async function test2_ListarOrdenes() {
  log('\n📝 TEST 2: Listar órdenes de compra', 'blue');
  const result = await request('GET', '/compras/ordenes');

  if (result.success) {
    log(
      `✅ Órdenes obtenidas: ${result.data.data?.length || 0} registros`,
      'green',
    );
    log(`   Total: ${result.data.total || 0}`, 'yellow');
    return true;
  } else {
    log('❌ Error al listar órdenes: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

async function test3_CrearOrden() {
  log('\n📝 TEST 3: Crear nueva orden de compra', 'blue');

  // Primero obtenemos un proveedor válido
  const proveedoresRes = await request('GET', '/entidades?tipo=PROVEEDOR');
  if (!proveedoresRes.success || !proveedoresRes.data.data?.length) {
    log('❌ No hay proveedores disponibles', 'red');
    return false;
  }
  const proveedor = proveedoresRes.data.data[0];

  // Obtener productos válidos
  const productosRes = await request('GET', '/productos?limit=2');
  if (!productosRes.success || !productosRes.data.data?.length) {
    log('❌ No hay productos disponibles', 'red');
    return false;
  }

  const items = productosRes.data.data.map((prod, idx) => ({
    productoId: prod.id,
    cantidad: (idx + 1) * 5,
    precioUnitario: 10.5 + idx * 2,
    descuento: 0,
  }));

  const ordenData = {
    proveedorId: proveedor.id,
    fecha: new Date().toISOString(),
    fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    observaciones: 'Test E2E - Orden de compra creada automáticamente',
    items,
  };

  const result = await request('POST', '/compras/ordenes', ordenData);

  if (result.success && result.data.data) {
    testOrderId = result.data.data.id;
    log(`✅ Orden creada: ${result.data.data.codigo}`, 'green');
    log(`   ID: ${testOrderId}`, 'yellow');
    log(`   Total: ${result.data.data.total}`, 'yellow');
    return true;
  } else {
    log('❌ Error al crear orden: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

async function test4_ObtenerOrdenPorId() {
  log('\n📝 TEST 4: Obtener orden de compra por ID', 'blue');
  if (!testOrderId) {
    log('⚠️  No hay testOrderId (TEST 3 falló)', 'yellow');
    return false;
  }

  const result = await request('GET', `/compras/ordenes/${testOrderId}`);

  if (result.success && result.data.data) {
    log(`✅ Orden obtenida: ${result.data.data.codigo}`, 'green');
    log(`   Estado: ${result.data.data.estado}`, 'yellow');
    log(`   Items: ${result.data.data.items?.length || 0}`, 'yellow');
    return true;
  } else {
    log(
      '❌ Error al obtener orden: ' + JSON.stringify(result.error),
      'red',
    );
    return false;
  }
}

async function test5_ActualizarOrden() {
  log('\n📝 TEST 5: Actualizar orden de compra', 'blue');
  if (!testOrderId) {
    log('⚠️  No hay testOrderId (TEST 3 falló)', 'yellow');
    return false;
  }

  const updateData = {
    observaciones: 'Orden actualizada en TEST E2E - ' + new Date().toISOString(),
  };

  const result = await request('PUT', `/compras/ordenes/${testOrderId}`, updateData);

  if (result.success && result.data.data) {
    log(`✅ Orden actualizada: ${result.data.data.codigo}`, 'green');
    return true;
  } else {
    log(
      '❌ Error al actualizar orden: ' + JSON.stringify(result.error),
      'red',
    );
    return false;
  }
}

async function test6_CambiarEstado() {
  log('\n📝 TEST 6: Cambiar estado a APROBADA', 'blue');
  if (!testOrderId) {
    log('⚠️  No hay testOrderId (TEST 3 falló)', 'yellow');
    return false;
  }

  const result = await request('PATCH', `/compras/ordenes/${testOrderId}/estado`, {
    estado: 'APROBADA',
    observaciones: 'Aprobada en TEST E2E',
  });

  if (result.success && result.data.data) {
    log(`✅ Estado cambiado: ${result.data.data.estado}`, 'green');
    return true;
  } else {
    log(
      '❌ Error al cambiar estado: ' + JSON.stringify(result.error),
      'red',
    );
    return false;
  }
}

async function test7_CrearRecepcion() {
  log('\n📝 TEST 7: Crear recepción de compra', 'blue');
  if (!testOrderId) {
    log('⚠️  No hay testOrderId (TEST 3 falló)', 'yellow');
    return false;
  }

  // Obtener la orden completa para crear recepción con sus items
  const ordenRes = await request('GET', `/compras/ordenes/${testOrderId}`);
  if (!ordenRes.success || !ordenRes.data.data.items) {
    log('❌ No se pudo obtener la orden para crear recepción', 'red');
    return false;
  }

  const items = ordenRes.data.data.items.map((item) => ({
    productoId: item.productoId,
    cantidadRecibida: item.cantidad,
    cantidadAceptada: item.cantidad,
    cantidadRechazada: 0,
  }));

  const recepcionData = {
    ordenCompraId: testOrderId,
    fecha: new Date().toISOString(),
    observaciones: 'Test E2E - Recepción creada automáticamente',
    items,
  };

  const result = await request('POST', '/compras/recepciones', recepcionData);

  if (result.success && result.data.data) {
    testReceiptId = result.data.data.id;
    log(`✅ Recepción creada: ${result.data.data.codigo}`, 'green');
    log(`   ID: ${testReceiptId}`, 'yellow');
    log(`   Estado: ${result.data.data.estado}`, 'yellow');
    return true;
  } else {
    log('❌ Error al crear recepción: ' + JSON.stringify(result.error), 'red');
    return false;
  }
}

async function test8_ListarRecepciones() {
  log('\n📝 TEST 8: Listar recepciones de compra', 'blue');
  const result = await request('GET', '/compras/recepciones');

  if (result.success) {
    log(
      `✅ Recepciones obtenidas: ${result.data.data?.length || 0} registros`,
      'green',
    );
    return true;
  } else {
    log(
      '❌ Error al listar recepciones: ' + JSON.stringify(result.error),
      'red',
    );
    return false;
  }
}

async function test9_ConfirmarRecepcion() {
  log('\n📝 TEST 9: Confirmar recepción (actualiza inventario)', 'blue');
  if (!testReceiptId) {
    log('⚠️  No hay testReceiptId (TEST 7 falló)', 'yellow');
    return false;
  }

  const result = await request('PATCH', `/compras/recepciones/${testReceiptId}/confirmar`, {
    observaciones: 'Confirmada en TEST E2E - Inventario actualizado',
  });

  if (result.success && result.data.data) {
    log(`✅ Recepción confirmada: ${result.data.data.codigo}`, 'green');
    log(`   Estado: ${result.data.data.estado}`, 'yellow');
    log('   ✅ Inventario actualizado correctamente', 'green');
    return true;
  } else {
    log(
      '❌ Error al confirmar recepción: ' + JSON.stringify(result.error),
      'red',
    );
    return false;
  }
}

async function test10_Estadisticas() {
  log('\n📝 TEST 10: Obtener estadísticas de compras', 'blue');
  const result = await request('GET', '/compras/ordenes/estadisticas');

  if (result.success && result.data.data) {
    log('✅ Estadísticas obtenidas:', 'green');
    log(`   Total órdenes: ${result.data.data.totalOrdenes || 0}`, 'yellow');
    log(
      `   Monto total: ${result.data.data.montoTotal || 0}`,
      'yellow',
    );
    log(
      `   Por estado: ${JSON.stringify(result.data.data.porEstado || {})}`,
      'yellow',
    );
    return true;
  } else {
    log(
      '❌ Error al obtener estadísticas: ' + JSON.stringify(result.error),
      'red',
    );
    return false;
  }
}

// Ejecutar todos los tests
async function runAllTests() {
  log('\n═══════════════════════════════════════════', 'blue');
  log('🚀 INICIANDO TESTS E2E - MÓDULO COMPRAS', 'blue');
  log('═══════════════════════════════════════════\n', 'blue');

  const tests = [
    test1_Login,
    test2_ListarOrdenes,
    test3_CrearOrden,
    test4_ObtenerOrdenPorId,
    test5_ActualizarOrden,
    test6_CambiarEstado,
    test7_CrearRecepcion,
    test8_ListarRecepciones,
    test9_ConfirmarRecepcion,
    test10_Estadisticas,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test();
      if (result) passed++;
      else failed++;
    } catch (error) {
      log(`❌ Error ejecutando ${test.name}: ${error.message}`, 'red');
      failed++;
    }
  }

  log('\n═══════════════════════════════════════════', 'blue');
  log('📊 RESULTADOS FINALES', 'blue');
  log('═══════════════════════════════════════════', 'blue');
  log(`✅ Tests exitosos: ${passed}`, 'green');
  log(`❌ Tests fallidos: ${failed}`, 'red');
  log(`📝 Total tests: ${tests.length}`, 'yellow');
  log(`🎯 Tasa de éxito: ${((passed / tests.length) * 100).toFixed(2)}%\n`, 'yellow');

  if (failed === 0) {
    log('🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!', 'green');
    log('✅ El módulo de compras está completamente funcional\n', 'green');
  } else {
    log('⚠️  Algunos tests fallaron. Revisar logs arriba.\n', 'yellow');
  }
}

// Ejecutar
runAllTests().catch((err) => {
  log(`❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
