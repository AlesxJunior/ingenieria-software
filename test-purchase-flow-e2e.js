/**
 * TEST E2E: Flujo Completo de Órdenes de Compra
 * 
 * Este script prueba el flujo completo desde la creación hasta el cierre
 * de una orden de compra, validando cada transición de estado.
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';
let testOrderId = '';
let testReceiptId = '';

// Configurar axios con token
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

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

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logStep(step, message) {
  log(`\n📍 PASO ${step}: ${message}`, 'yellow');
}

// Función auxiliar para esperar
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * TEST 1: Autenticación
 */
async function testLogin() {
  logStep(1, 'Autenticación de Usuario');
  
  try {
    const response = await api.post('/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });
    
    if (response.data.success && response.data.data.accessToken) {
      authToken = response.data.data.accessToken;
      logSuccess('Login exitoso');
      logInfo(`Usuario: ${response.data.data.user.email}`);
      logInfo(`Token obtenido: ${authToken.substring(0, 30)}...`);
      return true;
    }
    
    logError('Login falló: No se obtuvo token');
    return false;
  } catch (error) {
    logError(`Login falló: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 2: Crear Orden de Compra (Estado: PENDIENTE)
 */
async function testCreateOrder() {
  logStep(2, 'Crear Orden de Compra - Estado Inicial: PENDIENTE');
  
  try {
    // Obtener proveedores
    const proveedores = await api.get('/entidades?tipoEntidad=Proveedor&activo=true&limit=1');
    const proveedorId = proveedores.data.data[0]?.id;
    
    if (!proveedorId) {
      logError('No hay proveedores disponibles');
      return false;
    }
    
    // Obtener almacenes
    const almacenes = await api.get('/almacenes?activo=true&limit=1');
    const almacenId = almacenes.data.data[0]?.id;
    
    if (!almacenId) {
      logError('No hay almacenes disponibles');
      return false;
    }
    
    // Obtener productos
    const productos = await api.get('/productos?activo=true&limit=2');
    const producto1 = productos.data.data[0];
    const producto2 = productos.data.data[1];
    
    if (!producto1 || !producto2) {
      logError('No hay suficientes productos disponibles');
      return false;
    }
    
    // Crear orden
    const orderData = {
      proveedorId,
      almacenDestinoId: almacenId,
      moneda: 'PEN',
      condicionesPago: 'TEST - Pago contra entrega',
      observaciones: 'TEST E2E - Orden de prueba para flujo completo',
      items: [
        {
          productoId: producto1.id,
          cantidadOrdenada: 10,
          precioUnitario: 50.00,
          descuento: 0,
          incluyeIGV: true,
        },
        {
          productoId: producto2.id,
          cantidadOrdenada: 5,
          precioUnitario: 100.00,
          descuento: 0,
          incluyeIGV: false,
        },
      ],
    };
    
    const response = await api.post('/compras/ordenes', orderData);
    
    if (response.data.success && response.data.data) {
      testOrderId = response.data.data.id;
      logSuccess(`Orden creada: ${response.data.data.codigo}`);
      logInfo(`Estado: ${response.data.data.estado}`);
      logInfo(`Total: S/ ${response.data.data.total}`);
      logInfo(`Items: ${response.data.data.items.length} productos`);
      
      // Validar estado
      if (response.data.data.estado === 'PENDIENTE') {
        logSuccess('Estado correcto: PENDIENTE');
        return true;
      } else {
        logError(`Estado incorrecto: Esperado PENDIENTE, recibido ${response.data.data.estado}`);
        return false;
      }
    }
    
    logError('Creación falló: No se recibió data');
    return false;
  } catch (error) {
    logError(`Creación falló: ${error.response?.data?.message || error.message}`);
    console.error(error.response?.data);
    return false;
  }
}

/**
 * TEST 3: Cambiar a ENVIADA
 */
async function testTransitionToEnviada() {
  logStep(3, 'Transición: PENDIENTE → ENVIADA');
  
  try {
    const response = await api.patch(`/compras/ordenes/${testOrderId}/estado`, {
      estado: 'ENVIADA',
      observaciones: 'TEST - Orden enviada al proveedor',
    });
    
    if (response.data.success) {
      logSuccess('Transición exitosa a ENVIADA');
      logInfo(`Estado actual: ${response.data.data.estado}`);
      return response.data.data.estado === 'ENVIADA';
    }
    
    logError('Transición falló');
    return false;
  } catch (error) {
    logError(`Transición falló: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 4: Cambiar a CONFIRMADA
 */
async function testTransitionToConfirmada() {
  logStep(4, 'Transición: ENVIADA → CONFIRMADA');
  
  await wait(1000);
  
  try {
    const response = await api.patch(`/compras/ordenes/${testOrderId}/estado`, {
      estado: 'CONFIRMADA',
      observaciones: 'TEST - Proveedor confirmó la orden',
    });
    
    if (response.data.success) {
      logSuccess('Transición exitosa a CONFIRMADA');
      logInfo(`Estado actual: ${response.data.data.estado}`);
      return response.data.data.estado === 'CONFIRMADA';
    }
    
    logError('Transición falló');
    return false;
  } catch (error) {
    logError(`Transición falló: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 5: Crear Recepción (Transición a EN_RECEPCION)
 */
async function testCreateReceipt() {
  logStep(5, 'Crear Recepción - Transición a EN_RECEPCION');
  
  await wait(1000);
  
  try {
    // Obtener orden actualizada
    const orderResponse = await api.get(`/compras/ordenes/${testOrderId}`);
    const order = orderResponse.data.data;
    
    logInfo(`Orden tiene ${order.items.length} items`);
    
    // Crear recepción COMPLETA (100% de cantidades)
    const receiptData = {
      ordenCompraId: testOrderId,
      fechaRecepcion: new Date().toISOString(),
      observaciones: 'TEST - Recepción completa de productos',
      items: order.items.map(item => ({
        productoId: item.productoId,
        ordenCompraItemId: item.id,
        cantidadRecibida: item.cantidadOrdenada, // 100%
        cantidadAceptada: item.cantidadOrdenada,
        cantidadRechazada: 0,
        observaciones: 'TEST - Producto recibido OK',
      })),
    };
    
    const response = await api.post('/compras/recepciones', receiptData);
    
    if (response.data.success) {
      testReceiptId = response.data.data.id;
      logSuccess(`Recepción creada: ${response.data.data.codigo}`);
      logInfo(`Items recibidos: ${response.data.data.items.length}`);
      
      // Verificar estado de la orden
      const updatedOrder = await api.get(`/compras/ordenes/${testOrderId}`);
      const newEstado = updatedOrder.data.data.estado;
      
      logInfo(`Estado de orden después de recepción: ${newEstado}`);
      
      if (newEstado === 'COMPLETADA') {
        logSuccess('Estado cambió automáticamente a COMPLETADA (100% recibido)');
        return true;
      } else if (newEstado === 'EN_RECEPCION') {
        logSuccess('Estado cambió a EN_RECEPCION');
        return true;
      } else {
        logError(`Estado inesperado: ${newEstado}`);
        return false;
      }
    }
    
    logError('Creación de recepción falló');
    return false;
  } catch (error) {
    logError(`Creación de recepción falló: ${error.response?.data?.message || error.message}`);
    console.error(error.response?.data);
    return false;
  }
}

/**
 * TEST 6: Cerrar Orden
 */
async function testCloseOrder() {
  logStep(6, 'Transición: COMPLETADA → CERRADA');
  
  await wait(1000);
  
  try {
    // Verificar estado actual
    const orderResponse = await api.get(`/compras/ordenes/${testOrderId}`);
    const currentEstado = orderResponse.data.data.estado;
    
    logInfo(`Estado actual: ${currentEstado}`);
    
    if (currentEstado !== 'COMPLETADA') {
      logError(`No se puede cerrar: Estado debe ser COMPLETADA, actual es ${currentEstado}`);
      return false;
    }
    
    const response = await api.patch(`/compras/ordenes/${testOrderId}/estado`, {
      estado: 'CERRADA',
      observaciones: 'TEST - Orden cerrada, proceso completado',
    });
    
    if (response.data.success) {
      logSuccess('Orden cerrada exitosamente');
      logInfo(`Estado final: ${response.data.data.estado}`);
      return response.data.data.estado === 'CERRADA';
    }
    
    logError('Cierre falló');
    return false;
  } catch (error) {
    logError(`Cierre falló: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * TEST 7: Verificar Estado Final
 */
async function testVerifyFinalState() {
  logStep(7, 'Verificación de Estado Final');
  
  try {
    const response = await api.get(`/compras/ordenes/${testOrderId}`);
    const order = response.data.data;
    
    log('\n📊 RESUMEN FINAL:', 'blue');
    log(`Orden: ${order.codigo}`, 'cyan');
    log(`Estado: ${order.estado}`, 'cyan');
    log(`Total: S/ ${order.total}`, 'cyan');
    log(`Items: ${order.items.length}`, 'cyan');
    log(`Proveedor: ${order.proveedor?.razonSocial}`, 'cyan');
    log(`Almacén: ${order.almacenDestino?.nombre}`, 'cyan');
    
    // Verificar recepciones
    const recepciones = await api.get(`/compras/recepciones?ordenCompraId=${testOrderId}`);
    log(`Recepciones: ${recepciones.data.data.length}`, 'cyan');
    
    if (order.estado === 'CERRADA') {
      logSuccess('Flujo completado correctamente');
      return true;
    } else {
      logError(`Estado final incorrecto: ${order.estado}`);
      return false;
    }
  } catch (error) {
    logError(`Verificación falló: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

/**
 * EJECUTAR TODOS LOS TESTS
 */
async function runAllTests() {
  log('\n🚀 INICIANDO TESTING E2E - MÓDULO DE COMPRAS\n', 'blue');
  log('═══════════════════════════════════════════════\n', 'blue');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };
  
  const tests = [
    { name: 'Autenticación', fn: testLogin },
    { name: 'Crear Orden (PENDIENTE)', fn: testCreateOrder },
    { name: 'Transición a ENVIADA', fn: testTransitionToEnviada },
    { name: 'Transición a CONFIRMADA', fn: testTransitionToConfirmada },
    { name: 'Crear Recepción (EN_RECEPCION/COMPLETADA)', fn: testCreateReceipt },
    { name: 'Cerrar Orden (CERRADA)', fn: testCloseOrder },
    { name: 'Verificación Final', fn: testVerifyFinalState },
  ];
  
  for (const test of tests) {
    results.total++;
    const success = await test.fn();
    
    if (success) {
      results.passed++;
    } else {
      results.failed++;
      log(`\n⚠️  Test "${test.name}" FALLÓ - Deteniendo ejecución\n`, 'red');
      break;
    }
    
    await wait(500);
  }
  
  log('\n═══════════════════════════════════════════════', 'blue');
  log('📊 RESULTADOS FINALES:', 'blue');
  log(`Total: ${results.total}`, 'cyan');
  log(`Pasados: ${results.passed}`, 'green');
  log(`Fallados: ${results.failed}`, 'red');
  
  if (results.failed === 0) {
    log('\n🎉 TODOS LOS TESTS PASARON EXITOSAMENTE\n', 'green');
  } else {
    log('\n❌ ALGUNOS TESTS FALLARON\n', 'red');
  }
}

// Ejecutar
runAllTests().catch(error => {
  logError(`Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
