/**
 * TEST: Verificar endpoints auxiliares del módulo de compras
 * Prueba: Proveedores, Almacenes, Productos
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Token de prueba (reemplazar con uno válido)
let AUTH_TOKEN = null;

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

// ==========================================
// 1. LOGIN
// ==========================================
async function login() {
  try {
    log('\n📝 PASO 1: Autenticación...', 'cyan');
    
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });

    AUTH_TOKEN = response.data.data.accessToken;
    log('✅ Login exitoso', 'green');
    return true;
  } catch (error) {
    log(`❌ Error en login: ${error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// ==========================================
// 2. PROVEEDORES
// ==========================================
async function testSuppliers() {
  try {
    log('\n📦 PASO 2: Probando endpoint de Proveedores...', 'cyan');
    log(`GET ${API_BASE_URL}/entidades?tipo=Proveedor&activo=true`, 'blue');
    
    const response = await axios.get(
      `${API_BASE_URL}/entidades?tipo=Proveedor&activo=true`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );

    const suppliers = response.data.data || response.data;
    log(`✅ Proveedores encontrados: ${Array.isArray(suppliers) ? suppliers.length : 'N/A'}`, 'green');
    
    if (Array.isArray(suppliers) && suppliers.length > 0) {
      log(`   Ejemplo: ${suppliers[0].razonSocial || suppliers[0].nombres || 'Sin nombre'}`, 'yellow');
    } else {
      log('   ⚠️  No hay proveedores en la base de datos', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en proveedores: ${error.response?.status || error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data).substring(0, 200)}`, 'red');
    }
    return false;
  }
}

// ==========================================
// 3. ALMACENES
// ==========================================
async function testWarehouses() {
  try {
    log('\n🏭 PASO 3: Probando endpoint de Almacenes...', 'cyan');
    log(`GET ${API_BASE_URL}/almacenes?activo=true`, 'blue');
    
    const response = await axios.get(
      `${API_BASE_URL}/almacenes?activo=true`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );

    const warehouses = response.data.data || response.data;
    log(`✅ Almacenes encontrados: ${Array.isArray(warehouses) ? warehouses.length : 'N/A'}`, 'green');
    
    if (Array.isArray(warehouses) && warehouses.length > 0) {
      log(`   Ejemplo: ${warehouses[0].nombre || warehouses[0].codigo || 'Sin nombre'}`, 'yellow');
    } else {
      log('   ⚠️  No hay almacenes en la base de datos', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en almacenes: ${error.response?.status || error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// ==========================================
// 4. PRODUCTOS
// ==========================================
async function testProducts() {
  try {
    log('\n📦 PASO 4: Probando endpoint de Productos...', 'cyan');
    log(`GET ${API_BASE_URL}/productos?activo=true`, 'blue');
    
    const response = await axios.get(
      `${API_BASE_URL}/productos?activo=true`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );

    const products = response.data.data || response.data;
    log(`✅ Productos encontrados: ${Array.isArray(products) ? products.length : 'N/A'}`, 'green');
    
    if (Array.isArray(products) && products.length > 0) {
      log(`   Ejemplo: ${products[0].nombre || products[0].codigo || 'Sin nombre'}`, 'yellow');
    } else {
      log('   ⚠️  No hay productos en la base de datos', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en productos: ${error.response?.status || error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// ==========================================
// 5. ÓRDENES DE COMPRA
// ==========================================
async function testPurchaseOrders() {
  try {
    log('\n📋 PASO 5: Probando endpoint de Órdenes de Compra...', 'cyan');
    log(`GET ${API_BASE_URL}/compras/ordenes?page=1&limit=5`, 'blue');
    
    const response = await axios.get(
      `${API_BASE_URL}/compras/ordenes?page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    );

    const orders = response.data.data || response.data;
    log(`✅ Órdenes encontradas: ${Array.isArray(orders) ? orders.length : 'N/A'}`, 'green');
    
    if (Array.isArray(orders) && orders.length > 0) {
      const order = orders[0];
      log(`   Ejemplo:`, 'yellow');
      log(`   - Código: ${order.codigo || 'N/A'}`, 'yellow');
      log(`   - Estado: ${order.estado || 'N/A'}`, 'yellow');
      log(`   - Proveedor: ${order.proveedor?.razonSocial || 'N/A'}`, 'yellow');
      log(`   - Almacén: ${order.almacenDestino?.nombre || 'N/A'}`, 'yellow');
    } else {
      log('   ⚠️  No hay órdenes en la base de datos', 'yellow');
    }
    
    return true;
  } catch (error) {
    log(`❌ Error en órdenes: ${error.response?.status || error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

// ==========================================
// EJECUTAR TODAS LAS PRUEBAS
// ==========================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 TEST DE ENDPOINTS AUXILIARES - MÓDULO DE COMPRAS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ No se pudo autenticar. Verifica las credenciales.', 'red');
    return;
  }

  const results = {
    suppliers: await testSuppliers(),
    warehouses: await testWarehouses(),
    products: await testProducts(),
    orders: await testPurchaseOrders(),
  };

  // Resumen
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN DE PRUEBAS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`Proveedores:     ${results.suppliers ? '✅ OK' : '❌ FALLO'}`, results.suppliers ? 'green' : 'red');
  log(`Almacenes:       ${results.warehouses ? '✅ OK' : '❌ FALLO'}`, results.warehouses ? 'green' : 'red');
  log(`Productos:       ${results.products ? '✅ OK' : '❌ FALLO'}`, results.products ? 'green' : 'red');
  log(`Órdenes Compra:  ${results.orders ? '✅ OK' : '❌ FALLO'}`, results.orders ? 'green' : 'red');
  
  const allPassed = Object.values(results).every(r => r === true);
  
  if (allPassed) {
    log('\n✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE', 'green');
    log('El problema de los selects vacíos puede ser en el frontend.', 'yellow');
  } else {
    log('\n❌ ALGUNOS ENDPOINTS TIENEN PROBLEMAS', 'red');
    log('Revisar los errores anteriores para más detalles.', 'yellow');
  }
}

// Ejecutar
runAllTests().catch(error => {
  log(`\n💥 Error fatal: ${error.message}`, 'red');
  console.error(error);
});
