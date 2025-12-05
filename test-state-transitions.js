/**
 * TEST: Transiciones de Estado - Órdenes de Compra
 * Test simplificado que usa una orden existente para probar las transiciones
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * 1. Login
 */
async function login() {
  log('\n📍 PASO 1: Autenticación', 'yellow');
  try {
    const response = await api.post('/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });
    authToken = response.data.data.accessToken;
    log('✅ Login exitoso', 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * 2. Obtener o crear orden de prueba
 */
async function getOrCreateTestOrder() {
  log('\n📍 PASO 2: Obtener orden de prueba', 'yellow');
  try {
    // Buscar órdenes PENDIENTES
    const response = await api.get('/compras/ordenes?estado=PENDIENTE&limit=1');
    
    if (response.data.data.length > 0) {
      const order = response.data.data[0];
      log(`✅ Orden encontrada: ${order.codigo}`, 'green');
      log(`   Estado: ${order.estado}`, 'cyan');
      log(`   Total: S/ ${order.total}`, 'cyan');
      return order.id;
    }
    
    log('ℹ️  No hay órdenes PENDIENTES, intentando crear una...', 'cyan');
    
    // Obtener proveedor
    const proveedores = await api.get('/entidades?tipoEntidad=Proveedor&limit=1');
    if (!proveedores.data.data[0]) {
      log('❌ No hay proveedores disponibles', 'red');
      return null;
    }
    
    // Obtener almacén
    const almacenes = await api.get('/almacenes?limit=1');
    if (!almacenes.data.data[0]) {
      log('❌ No hay almacenes disponibles', 'red');
      return null;
    }
    
    // Obtener productos
    const productos = await api.get('/productos?limit=2');
    if (productos.data.data.length < 2) {
      log('❌ No hay suficientes productos', 'red');
      return null;
    }
    
    // Crear orden
    const newOrder = await api.post('/compras/ordenes', {
      proveedorId: proveedores.data.data[0].id,
      almacenDestinoId: almacenes.data.data[0].id,
      moneda: 'PEN',
      condicionesPago: 'TEST - Transiciones de estado',
      observaciones: 'Orden de prueba para testing E2E',
      items: [
        {
          productoId: productos.data.data[0].id,
          cantidadOrdenada: 10,
          precioUnitario: 50.00,
          descuento: 0,
          incluyeIGV: true,
        },
        {
          productoId: productos.data.data[1].id,
          cantidadOrdenada: 5,
          precioUnitario: 100.00,
          descuento: 0,
          incluyeIGV: false,
        },
      ],
    });
    
    log(`✅ Orden creada: ${newOrder.data.data.codigo}`, 'green');
    return newOrder.data.data.id;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

/**
 * 3. Probar transiciones de estado
 */
async function testStateTransitions(orderId) {
  log('\n📍 PASO 3: Probando Transiciones de Estado', 'yellow');
  log('═'.repeat(60), 'cyan');
  
  const transitions = [
    { from: 'PENDIENTE', to: 'ENVIADA', label: 'Enviar a Proveedor' },
    { from: 'ENVIADA', to: 'CONFIRMADA', label: 'Confirmar Orden' },
    { from: 'CONFIRMADA', to: 'EN_RECEPCION', label: 'Iniciar Recepción' },
    { from: 'EN_RECEPCION', to: 'COMPLETADA', label: 'Marcar Completa' },
    { from: 'COMPLETADA', to: 'CERRADA', label: 'Cerrar Orden' },
  ];
  
  for (const transition of transitions) {
    try {
      log(`\n🔄 Transición: ${transition.from} → ${transition.to}`, 'magenta');
      log(`   Acción: "${transition.label}"`, 'cyan');
      
      const response = await api.patch(`/compras/ordenes/${orderId}/estado`, {
        estado: transition.to,
        observaciones: `TEST: ${transition.label}`,
      });
      
      if (response.data.success) {
        log(`   ✅ Éxito: Estado = ${response.data.data.estado}`, 'green');
        
        // Log de backend esperado
        log(`   📋 Log Backend Esperado:`, 'cyan');
        log(`      [PATCH /ordenes/:id/estado] ID: ${orderId}`, 'cyan');
        log(`      Estado: ${transition.to}, Observaciones: TEST: ${transition.label}`, 'cyan');
        log(`      [updateStatus] Estado actual: ${transition.from}, Nuevo estado: ${transition.to}`, 'cyan');
      } else {
        log(`   ❌ Falló: ${response.data.message}`, 'red');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      log(`   ❌ Error: ${error.response?.data?.message || error.message}`, 'red');
      log(`   ⚠️  Deteniendo pruebas`, 'yellow');
      break;
    }
  }
  
  log('\n═'.repeat(60), 'cyan');
}

/**
 * 4. Verificar estado final
 */
async function verifyFinalState(orderId) {
  log('\n📍 PASO 4: Verificación Final', 'yellow');
  try {
    const response = await api.get(`/compras/ordenes/${orderId}`);
    const order = response.data.data;
    
    log('\n📊 ESTADO FINAL DE LA ORDEN:', 'cyan');
    log(`   Código: ${order.codigo}`, 'cyan');
    log(`   Estado: ${order.estado}`, 'cyan');
    log(`   Total: S/ ${order.total}`, 'cyan');
    log(`   Proveedor: ${order.proveedor?.razonSocial || 'N/A'}`, 'cyan');
    log(`   Almacén: ${order.almacenDestino?.nombre || 'N/A'}`, 'cyan');
    log(`   Items: ${order.items?.length || 0} productos`, 'cyan');
    
    if (order.estado === 'CERRADA') {
      log('\n🎉 ÉXITO: Flujo completo ejecutado correctamente', 'green');
      return true;
    } else {
      log(`\n⚠️  Flujo incompleto. Estado actual: ${order.estado}`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Ejecutar tests
 */
async function runTests() {
  log('\n🚀 TEST DE TRANSICIONES DE ESTADO - MÓDULO DE COMPRAS', 'cyan');
  log('═'.repeat(60), 'cyan');
  log('Este test probará todas las transiciones de estado:', 'cyan');
  log('PENDIENTE → ENVIADA → CONFIRMADA → EN_RECEPCION → COMPLETADA → CERRADA', 'cyan');
  log('═'.repeat(60), 'cyan');
  
  // 1. Login
  if (!await login()) {
    log('\n❌ Test abortado: No se pudo autenticar', 'red');
    return;
  }
  
  // 2. Obtener/crear orden
  const orderId = await getOrCreateTestOrder();
  if (!orderId) {
    log('\n❌ Test abortado: No se pudo obtener orden de prueba', 'red');
    return;
  }
  
  // 3. Probar transiciones
  await testStateTransitions(orderId);
  
  // 4. Verificar resultado
  await verifyFinalState(orderId);
  
  log('\n═'.repeat(60), 'cyan');
  log('📝 NOTA: Revisa la ventana del backend para ver los logs detallados', 'yellow');
  log('═'.repeat(60), 'cyan');
}

runTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
