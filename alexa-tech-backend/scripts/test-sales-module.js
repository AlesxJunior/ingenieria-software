/**
 * Script de testing manual para el módulo de Ventas
 * Prueba todos los endpoints: Cash Registers, Cash Sessions y Sales
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let cashRegisterId = '';
let cashSessionId = '';
let saleId = '';
let warehouseId = 'WH-PRINCIPAL';
let productId = '';

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

function logTest(name) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`TEST: ${name}`, 'cyan');
  log('='.repeat(60), 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function request(method, endpoint, data = null, token = null) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data: result,
    };
  } catch (error) {
    logError(`Error en petición: ${error.message}`);
    return { status: 0, ok: false, data: null, error };
  }
}

// ============================================
// 1. AUTENTICACIÓN
// ============================================
async function testAuth() {
  logTest('1. Autenticación - Login como Admin');

  const response = await request('POST', '/auth/login', {
    email: 'admin@alexatech.com',
    password: 'admin123',
  });

  if (response.ok && response.data.data?.accessToken) {
    authToken = response.data.data.accessToken;
    logSuccess(`Login exitoso. Token obtenido.`);
    logInfo(`Usuario: ${response.data.data.user.firstName} ${response.data.data.user.lastName}`);
    logInfo(`Email: ${response.data.data.user.email}`);
    return true;
  } else {
    logError(`Login fallido: ${JSON.stringify(response.data)}`);
    return false;
  }
}

// ============================================
// 2. OBTENER DATOS NECESARIOS
// ============================================
async function getInitialData() {
  logTest('2. Obtener datos iniciales (Almacén y Producto)');

  // Obtener primer producto
  const productsResponse = await request('GET', '/products?limit=1', null, authToken);
  if (productsResponse.ok && productsResponse.data.data?.length > 0) {
    productId = productsResponse.data.data[0].id;
    logSuccess(`Producto obtenido: ${productsResponse.data.data[0].nombre} (ID: ${productId})`);
  } else {
    logError('No se pudo obtener productos');
    return false;
  }

  logInfo(`Almacén: WH-PRINCIPAL`);
  return true;
}

// ============================================
// 3. CASH REGISTERS
// ============================================
async function testCashRegisters() {
  logTest('3. Cash Registers - Listar cajas registradoras');

  const response = await request('GET', '/cash-registers', null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`${response.data.data.length} cajas registradoras encontradas`);
    if (response.data.data.length > 0) {
      cashRegisterId = response.data.data[0].id;
      logInfo(`Caja seleccionada: ${response.data.data[0].nombre} (${response.data.data[0].codigo})`);
      response.data.data.forEach(caja => {
        logInfo(`  - ${caja.codigo}: ${caja.nombre} (${caja.activo ? 'Activa' : 'Inactiva'})`);
      });
      return true;
    }
  }

  logError(`Error al listar cajas: ${JSON.stringify(response.data)}`);
  return false;
}

async function testGetCashRegisterById() {
  logTest('4. Cash Registers - Obtener caja por ID');

  const response = await request('GET', `/cash-registers/${cashRegisterId}`, null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`Caja obtenida exitosamente`);
    logInfo(`Código: ${response.data.data.codigo}`);
    logInfo(`Nombre: ${response.data.data.nombre}`);
    logInfo(`Ubicación: ${response.data.data.ubicacion || 'N/A'}`);
    return true;
  }

  logError(`Error al obtener caja: ${JSON.stringify(response.data)}`);
  return false;
}

// ============================================
// 5. CASH SESSIONS
// ============================================
async function testOpenCashSession() {
  logTest('5. Cash Sessions - Abrir sesión de caja');

  const response = await request('POST', '/cash-sessions/open', {
    cashRegisterId: cashRegisterId,
    montoApertura: 100.00,
    observaciones: 'Apertura para testing',
  }, authToken);

  if (response.ok && response.data.data) {
    cashSessionId = response.data.data.id;
    logSuccess(`Sesión abierta exitosamente`);
    logInfo(`Session ID: ${cashSessionId}`);
    logInfo(`Monto apertura: S/ ${response.data.data.montoApertura}`);
    logInfo(`Estado: ${response.data.data.estado}`);
    logInfo(`Fecha: ${new Date(response.data.data.fechaApertura).toLocaleString()}`);
    return true;
  }

  logError(`Error al abrir sesión: ${JSON.stringify(response.data)}`);
  return false;
}

async function testGetCurrentSession() {
  logTest('6. Cash Sessions - Obtener sesión actual');

  const response = await request('GET', `/cash-sessions/current?cashRegisterId=${cashRegisterId}`, null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`Sesión actual obtenida`);
    logInfo(`Session ID: ${response.data.data.id}`);
    logInfo(`Estado: ${response.data.data.estado}`);
    logInfo(`Total ventas: S/ ${response.data.data.totalVentas}`);
    return true;
  }

  logError(`Error al obtener sesión actual: ${JSON.stringify(response.data)}`);
  return false;
}

// ============================================
// 7. SALES
// ============================================
async function testCreateSale() {
  logTest('7. Sales - Crear venta');

  const response = await request('POST', '/sales', {
    cashSessionId: cashSessionId,
    almacenId: warehouseId,
    tipoComprobante: 'Boleta',
    formaPago: 'Efectivo',
    items: [
      {
        productId: productId,
        cantidad: 2,
        precioUnitario: 99.99,
      }
    ],
    observaciones: 'Venta de prueba desde script de testing',
  }, authToken);

  if (response.ok && response.data.data) {
    saleId = response.data.data.id;
    logSuccess(`Venta creada exitosamente`);
    logInfo(`Código venta: ${response.data.data.codigoVenta}`);
    logInfo(`Sale ID: ${saleId}`);
    logInfo(`Subtotal: S/ ${response.data.data.subtotal.toFixed(2)}`);
    logInfo(`IGV (18%): S/ ${response.data.data.igv.toFixed(2)}`);
    logInfo(`Total: S/ ${response.data.data.total.toFixed(2)}`);
    logInfo(`Estado: ${response.data.data.estado}`);
    logInfo(`Items: ${response.data.data.items.length}`);
    return true;
  }

  logError(`Error al crear venta: ${JSON.stringify(response.data)}`);
  return false;
}

async function testListSales() {
  logTest('8. Sales - Listar ventas');

  const response = await request('GET', '/sales', null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`${response.data.data.length} ventas encontradas`);
    response.data.data.forEach(sale => {
      logInfo(`  - ${sale.codigoVenta}: S/ ${sale.total} (${sale.estado})`);
    });
    return true;
  }

  logError(`Error al listar ventas: ${JSON.stringify(response.data)}`);
  return false;
}

async function testGetSaleById() {
  logTest('9. Sales - Obtener venta por ID');

  const response = await request('GET', `/sales/${saleId}`, null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`Venta obtenida exitosamente`);
    logInfo(`Código: ${response.data.data.codigoVenta}`);
    logInfo(`Total: S/ ${response.data.data.total.toFixed(2)}`);
    logInfo(`Estado: ${response.data.data.estado}`);
    logInfo(`Items: ${response.data.data.items.length}`);
    return true;
  }

  logError(`Error al obtener venta: ${JSON.stringify(response.data)}`);
  return false;
}

async function testUpdateSaleStatus() {
  logTest('10. Sales - Completar venta (actualizar estado)');

  const response = await request('PATCH', `/sales/${saleId}/status`, {
    estado: 'Completada',
  }, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`Estado de venta actualizado exitosamente`);
    logInfo(`Nuevo estado: ${response.data.data.estado}`);
    logInfo(`Esta acción debería haber decrementado el inventario`);
    return true;
  }

  logError(`Error al actualizar estado: ${JSON.stringify(response.data)}`);
  return false;
}

async function testVerifyInventoryMovement() {
  logTest('11. Inventory - Verificar movimiento de inventario');

  const response = await request('GET', `/inventory/movements?productId=${productId}&limit=5`, null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`Movimientos de inventario obtenidos`);
    const salidas = response.data.data.filter(m => m.tipo === 'SALIDA');
    if (salidas.length > 0) {
      logSuccess(`✓ Se encontraron ${salidas.length} movimientos de SALIDA`);
      salidas.forEach(mov => {
        logInfo(`  - ${mov.tipo}: ${mov.cantidad} unidades (${mov.motivo})`);
        logInfo(`    Stock antes: ${mov.stockAntes}, después: ${mov.stockDespues}`);
      });
    } else {
      log(`⚠️  No se encontraron movimientos de SALIDA recientes`, 'yellow');
    }
    return true;
  }

  logError(`Error al verificar inventario: ${JSON.stringify(response.data)}`);
  return false;
}

async function testCloseCashSession() {
  logTest('12. Cash Sessions - Cerrar sesión de caja');

  // Obtener sesión actual para ver el total de ventas
  const currentSession = await request('GET', `/cash-sessions/${cashSessionId}`, null, authToken);
  
  if (currentSession.ok) {
    const totalVentas = currentSession.data.data.totalVentas;
    const montoApertura = currentSession.data.data.montoApertura;
    const montoEsperado = parseFloat(montoApertura) + parseFloat(totalVentas);
    
    logInfo(`Monto apertura: S/ ${montoApertura}`);
    logInfo(`Total ventas: S/ ${totalVentas}`);
    logInfo(`Monto esperado: S/ ${montoEsperado.toFixed(2)}`);

    const response = await request('POST', `/cash-sessions/${cashSessionId}/close`, {
      montoCierre: montoEsperado,
      observaciones: 'Cierre de testing - cuadra perfecto',
    }, authToken);

    if (response.ok && response.data.data) {
      logSuccess(`Sesión cerrada exitosamente`);
      logInfo(`Estado: ${response.data.data.estado}`);
      logInfo(`Monto cierre: S/ ${response.data.data.montoCierre}`);
      logInfo(`Diferencia: S/ ${response.data.data.diferencia.toFixed(2)}`);
      
      if (Math.abs(response.data.data.diferencia) < 0.01) {
        logSuccess(`✓ La caja cuadra perfectamente (diferencia: S/ ${response.data.data.diferencia})`);
      } else {
        log(`⚠️  Hay diferencia en caja: S/ ${response.data.data.diferencia}`, 'yellow');
      }
      return true;
    }
  }

  logError(`Error al cerrar sesión: ${JSON.stringify(response.data)}`);
  return false;
}

async function testListCashSessions() {
  logTest('13. Cash Sessions - Listar sesiones de caja');

  const response = await request('GET', '/cash-sessions', null, authToken);

  if (response.ok && response.data.data) {
    logSuccess(`${response.data.data.length} sesiones encontradas`);
    response.data.data.forEach(session => {
      const fecha = new Date(session.fechaApertura).toLocaleDateString();
      logInfo(`  - ${fecha}: S/ ${session.totalVentas} en ventas (${session.estado})`);
    });
    return true;
  }

  logError(`Error al listar sesiones: ${JSON.stringify(response.data)}`);
  return false;
}

// ============================================
// EJECUTAR TODAS LAS PRUEBAS
// ============================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 INICIANDO TESTING DEL MÓDULO DE VENTAS', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const tests = [
    { name: 'Autenticación', fn: testAuth },
    { name: 'Obtener datos iniciales', fn: getInitialData },
    { name: 'Listar cajas registradoras', fn: testCashRegisters },
    { name: 'Obtener caja por ID', fn: testGetCashRegisterById },
    { name: 'Abrir sesión de caja', fn: testOpenCashSession },
    { name: 'Obtener sesión actual', fn: testGetCurrentSession },
    { name: 'Crear venta', fn: testCreateSale },
    { name: 'Listar ventas', fn: testListSales },
    { name: 'Obtener venta por ID', fn: testGetSaleById },
    { name: 'Completar venta', fn: testUpdateSaleStatus },
    { name: 'Verificar inventario', fn: testVerifyInventoryMovement },
    { name: 'Cerrar sesión de caja', fn: testCloseCashSession },
    { name: 'Listar sesiones', fn: testListCashSessions },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      logError(`Test '${test.name}' falló con error: ${error.message}`);
      failed++;
    }
  }

  // Resumen final
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN DE TESTING', 'cyan');
  log('='.repeat(60), 'cyan');
  logSuccess(`Tests pasados: ${passed}`);
  if (failed > 0) {
    logError(`Tests fallidos: ${failed}`);
  } else {
    logSuccess('✨ ¡Todos los tests pasaron exitosamente!');
  }
  log('\n' + '='.repeat(60) + '\n', 'cyan');

  // IDs generados para referencia
  if (saleId) {
    log('📋 IDs GENERADOS (para pruebas manuales):', 'blue');
    logInfo(`Cash Register ID: ${cashRegisterId}`);
    logInfo(`Cash Session ID: ${cashSessionId}`);
    logInfo(`Sale ID: ${saleId}`);
    logInfo(`Product ID: ${productId}`);
    log('');
  }
}

// Ejecutar
runAllTests().catch(error => {
  logError(`Error fatal: ${error.message}`);
  console.error(error);
});
