// Test automatizado E2E para Notas de Crédito
// Ejecutar: node test-nc-e2e.js

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let cashSessionId = '';
let saleId = '';
let saleItemId = '';
let creditNoteId = '';

// Colores para console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function request(method, endpoint, body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return { status: response.status, data };
}

async function test(name, fn) {
  try {
    log(`\n🧪 ${name}`, 'cyan');
    await fn();
    log(`✅ PASSED`, 'green');
  } catch (error) {
    log(`❌ FAILED: ${error.message}`, 'red');
    throw error;
  }
}

async function main() {
  log('\n🚀 Iniciando Tests E2E de Notas de Crédito\n', 'yellow');

  // TEST 1: Login
  await test('Login con admin', async () => {
    const { status, data } = await request('POST', '/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    if (status !== 200) throw new Error(`Login falló: ${JSON.stringify(data)}`);
    if (!data.data.accessToken) throw new Error('No se recibió token');
    
    authToken = data.data.accessToken;
    log(`  Token obtenido: ${authToken.substring(0, 20)}...`);
  });

  // TEST 2: Obtener cajas
  await test('Obtener cajas registradoras', async () => {
    const { status, data } = await request('GET', '/cash-registers');
    
    if (status !== 200) throw new Error('No se pudieron obtener cajas');
    if (!data.data || data.data.length === 0) throw new Error('No hay cajas disponibles');
    
    log(`  Cajas encontradas: ${data.data.length}`);
  });

  // TEST 3: Abrir sesión de caja
  await test('Abrir sesión de caja', async () => {
    const { status, data } = await request('POST', '/cash-sessions/open', {
      cashRegisterId: 'cmhtupodi001io19ske5kswsg', // CAJA-01
      montoApertura: 300
    });
    
    if (status !== 201) throw new Error(`No se pudo abrir sesión: ${JSON.stringify(data)}`);
    if (!data.data.id) throw new Error('No se recibió cashSessionId');
    
    cashSessionId = data.data.id;
    log(`  Sesión abierta: ${cashSessionId}`);
    log(`  Monto inicial: S/ ${data.data.montoApertura}`);
  });

  // TEST 4: Obtener productos
  let productId = '';
  await test('Obtener productos disponibles', async () => {
    const { status, data } = await request('GET', '/products?limit=1');
    
    if (status !== 200) throw new Error('No se pudieron obtener productos');
    if (!data.data.products || data.data.products.length === 0) {
      throw new Error('No hay productos disponibles');
    }
    
    productId = data.data.products[0].id;
    log(`  Producto: ${data.data.products[0].nombre} (${productId})`);
    log(`  Precio: S/ ${data.data.products[0].precioVenta}`);
  });

  // TEST 5: Crear venta
  await test('Crear venta con 5 unidades', async () => {
    const { status, data } = await request('POST', '/sales', {
      almacenId: 'WH-PRINCIPAL',
      tipoComprobante: 'Boleta',
      formaPago: 'Efectivo',
      cashSessionId: cashSessionId,
      items: [{
        productId: productId,
        cantidad: 5,
        precioUnitario: 49.99
      }]
    });
    
    if (status !== 201) throw new Error(`Venta falló: ${JSON.stringify(data)}`);
    if (!data.data.id) throw new Error('No se recibió saleId');
    
    saleId = data.data.id;
    saleItemId = data.data.items[0].id;
    log(`  Venta creada: ${data.data.codigoVenta}`);
    log(`  Total: S/ ${data.data.total}`);
    log(`  Item ID: ${saleItemId}`);
  });

  // TEST 6: Actualizar venta a Completada
  await test('Actualizar venta a Completada', async () => {
    const { status, data } = await request('PATCH', `/sales/${saleId}/status`, {
      estado: 'Completada'
    });
    
    if (status !== 200) throw new Error('No se pudo actualizar estado');
    log(`  Estado: ${data.data.estado}`);
  });

  // TEST 7: Emitir NC con Efectivo
  await test('Emitir NC con Efectivo (2 unidades)', async () => {
    const { status, data } = await request('POST', '/credit-notes', {
      saleId: saleId,
      creditNoteReason: 'DevolucionParcial',
      descripcion: 'Test E2E - Devolución por defecto',
      items: [{
        saleItemId: saleItemId,
        cantidad: 2
      }],
      paymentMethod: 'Efectivo',
      cashSessionId: cashSessionId
    });
    
    if (status !== 201) throw new Error(`NC falló: ${JSON.stringify(data)}`);
    if (!data.creditNote || !data.creditNote.id) throw new Error('No se recibió NC');
    
    creditNoteId = data.creditNote.id;
    log(`  NC creada: ${data.creditNote.codigoVenta}`);
    log(`  Total: S/ ${data.creditNote.total}`);
    log(`  Estado: ${data.creditNote.creditNoteStatus}`);
    
    // Verificar fecha
    const fechaEmision = new Date(data.creditNote.fechaEmision);
    const ahora = new Date();
    const diffMinutos = Math.abs((ahora - fechaEmision) / 1000 / 60);
    
    log(`  Fecha NC: ${fechaEmision.toISOString()}`);
    log(`  Fecha actual: ${ahora.toISOString()}`);
    log(`  Diferencia: ${diffMinutos.toFixed(2)} minutos`);
    
    if (diffMinutos > 10) {
      log(`  ⚠️ WARNING: Fecha de NC tiene más de 10 minutos de diferencia`, 'yellow');
    }
  });

  // TEST 8: Verificar EGRESO en caja
  await test('Verificar EGRESO en movimientos de caja', async () => {
    const { status, data } = await request('GET', `/cash-movements?cashSessionId=${cashSessionId}`);
    
    if (status !== 200) throw new Error('No se pudieron obtener movimientos');
    
    const egresos = Array.isArray(data) 
      ? data.filter(m => m.tipo === 'EGRESO')
      : (data.data && Array.isArray(data.data) ? data.data.filter(m => m.tipo === 'EGRESO') : []);
    
    log(`  Total movimientos: ${Array.isArray(data) ? data.length : (data.data ? data.data.length : 0)}`);
    log(`  EGRESOs encontrados: ${egresos.length}`);
    
    if (egresos.length === 0) {
      throw new Error('No se generó EGRESO para NC con Efectivo');
    }
    
    const ultimoEgreso = egresos[egresos.length - 1];
    log(`  Último EGRESO: S/ ${ultimoEgreso.monto}`);
    log(`  Motivo: ${ultimoEgreso.motivo}`);
  });

  // TEST 9: Emitir NC con Vale
  await test('Emitir NC con Vale (1 unidad)', async () => {
    const { status, data } = await request('POST', '/credit-notes', {
      saleId: saleId,
      creditNoteReason: 'DevolucionParcial',
      descripcion: 'Test E2E - Cliente prefiere vale',
      items: [{
        saleItemId: saleItemId,
        cantidad: 1
      }],
      paymentMethod: 'Vale'
    });
    
    if (status !== 201) throw new Error(`NC Vale falló: ${JSON.stringify(data)}`);
    
    log(`  NC Vale creada: ${data.creditNote.codigoVenta}`);
    log(`  Estado: ${data.creditNote.creditNoteStatus}`);
    
    if (data.creditNote.creditNoteStatus !== 'Pendiente') {
      throw new Error(`Estado incorrecto. Esperado: Pendiente, Recibido: ${data.creditNote.creditNoteStatus}`);
    }
  });

  // TEST 10: Verificar que Vale NO generó EGRESO
  await test('Verificar que Vale NO generó EGRESO', async () => {
    const { status, data } = await request('GET', `/cash-movements?cashSessionId=${cashSessionId}`);
    
    const egresos = Array.isArray(data) 
      ? data.filter(m => m.tipo === 'EGRESO')
      : (data.data && Array.isArray(data.data) ? data.data.filter(m => m.tipo === 'EGRESO') : []);
    
    log(`  EGRESOs totales: ${egresos.length}`);
    
    if (egresos.length !== 1) {
      throw new Error(`Se esperaba 1 EGRESO (solo del Efectivo), se encontraron ${egresos.length}`);
    }
    
    log(`  ✓ Vale NO generó EGRESO adicional`);
  });

  // TEST 11: Descargar PDF
  await test('Descargar PDF de NC', async () => {
    const response = await fetch(`${BASE_URL}/credit-notes/${creditNoteId}/pdf`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (response.status !== 200) throw new Error('No se pudo descargar PDF');
    
    const buffer = await response.arrayBuffer();
    log(`  PDF descargado: ${buffer.byteLength} bytes`);
    
    if (buffer.byteLength < 1000) {
      throw new Error('PDF parece estar corrupto (muy pequeño)');
    }
  });

  // TEST 12: Validar error sin cashSessionId
  await test('Validar error NC Efectivo sin cashSessionId', async () => {
    const { status, data } = await request('POST', '/credit-notes', {
      saleId: saleId,
      creditNoteReason: 'DevolucionParcial',
      descripcion: 'Test error',
      items: [{
        saleItemId: saleItemId,
        cantidad: 1
      }],
      paymentMethod: 'Efectivo'
      // Sin cashSessionId
    });
    
    if (status !== 400) {
      throw new Error(`Se esperaba error 400, se recibió ${status}`);
    }
    
    log(`  Error correcto: ${data.message}`);
  });

  // TEST 13: Validar cantidad excedida
  await test('Validar error cantidad excedida', async () => {
    const { status, data } = await request('POST', '/credit-notes', {
      saleId: saleId,
      creditNoteReason: 'DevolucionParcial',
      descripcion: 'Test cantidad excedida',
      items: [{
        saleItemId: saleItemId,
        cantidad: 10 // Solo quedan 2 de 5 (3 ya devueltos)
      }],
      paymentMethod: 'Vale'
    });
    
    if (status !== 400) {
      throw new Error(`Se esperaba error 400, se recibió ${status}`);
    }
    
    log(`  Error correcto: ${data.message}`);
  });

  log('\n\n🎉 TODOS LOS TESTS PASARON 🎉\n', 'green');
  log('Resumen:', 'yellow');
  log('✅ 13 tests ejecutados', 'green');
  log('✅ Backend funcionando correctamente', 'green');
  log('✅ NC con Efectivo genera EGRESO', 'green');
  log('✅ NC con Vale NO genera EGRESO', 'green');
  log('✅ PDFs se generan correctamente', 'green');
  log('✅ Validaciones funcionando', 'green');
}

main().catch(error => {
  log('\n\n💥 TEST SUITE FAILED\n', 'red');
  console.error(error);
  process.exit(1);
});
