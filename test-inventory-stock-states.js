/**
 * ============================================
 * TEST E2E: Estados de Stock (CRÍTICO/BAJO/NORMAL)
 * ============================================
 * 
 * Propósito: Verificar que el sistema calcula correctamente los estados de stock
 * 
 * Lógica de estados:
 * - CRÍTICO: stock ≤ 50% del mínimo
 * - BAJO: stock < 100% del mínimo (pero > 50%)
 * - NORMAL: stock ≥ 100% del mínimo
 * 
 * Casos de prueba:
 * 1. Producto sin minStock → Estado NORMAL
 * 2. Stock ≤50% minStock → Estado CRÍTICO
 * 3. Stock entre 51-99% minStock → Estado BAJO
 * 4. Stock ≥100% minStock → Estado NORMAL
 * 5. Mismo producto en 2 almacenes con estados diferentes
 */

const axios = require('axios');
const assert = require('assert');

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
let authToken = '';
let testWarehouseIds = [];
let testProducts = [];

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function log(emoji, message, color = colors.reset) {
  console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function login() {
  log('🔐', 'Iniciando sesión...', colors.blue);
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    email: 'admin@alexatech.com',
    password: 'admin123'
  });
  authToken = response.data.data.accessToken;
  assert(authToken, 'Token debe existir');
  log('✅', 'Login exitoso', colors.green);
}

async function setupTestData() {
  log('🛠️', 'Configurando datos de prueba...', colors.blue);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  // Obtener almacenes
  const warehousesRes = await axios.get(`${BASE_URL}/warehouses`, config);
  testWarehouseIds = warehousesRes.data.data.rows.slice(0, 2).map(w => w.id);
  assert(testWarehouseIds.length >= 1, 'Debe haber al menos 1 almacén');
  log('✅', `Almacenes obtenidos: ${testWarehouseIds.length}`, colors.green);

  // Crear productos de prueba
  const productsData = [
    { nombre: 'Sin MinStock', minStock: null, stock: 10 },
    { nombre: 'Estado Crítico', minStock: 100, stock: 30 }, // 30% = CRÍTICO
    { nombre: 'Estado Bajo', minStock: 100, stock: 75 },    // 75% = BAJO
    { nombre: 'Estado Normal', minStock: 100, stock: 150 }, // 150% = NORMAL
    { nombre: 'Multi Almacén', minStock: 50, stock: 0 },    // Para test 5
  ];

  for (let i = 0; i < productsData.length; i++) {
    const data = productsData[i];
    const productRes = await axios.post(`${BASE_URL}/products`, {
      codigo: `TEST-STATE-${Date.now()}-${i}`,
      nombre: `Test ${data.nombre}`,
      precio: 100,
      minStock: data.minStock,
      trackInventory: true,
      estado: true
    }, config);
    
    const productId = productRes.data.data.id;
    testProducts.push({ id: productId, ...data });

    // Crear stock en almacén principal
    if (data.stock > 0) {
      await axios.post(`${BASE_URL}/inventory/ajuste`, {
        productId,
        warehouseId: testWarehouseIds[0],
        cantidadAjuste: data.stock,
        adjustmentReason: 'ErrorConteo',
        observaciones: `Stock inicial para ${data.nombre}`
      }, config);
    }

    log('✅', `Producto creado: ${data.nombre} (minStock=${data.minStock}, stock=${data.stock})`, colors.green);
  }
}

async function getStock(productId, warehouseId) {
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };
  
  const response = await axios.get(`${BASE_URL}/inventory/stock`, {
    ...config,
    params: { productId, warehouseId }
  });
  
  return response.data.data.rows.find(r => r.productId === productId && r.almacenId === warehouseId);
}

async function test1_SinMinStockEsNormal() {
  log('📋', 'TEST 1: Producto sin minStock debe tener estado NORMAL', colors.yellow);
  
  const product = testProducts[0]; // Sin MinStock
  const stock = await getStock(product.id, testWarehouseIds[0]);
  
  assert(stock, 'Stock debe existir');
  assert.strictEqual(stock.estado, 'NORMAL', 'Estado debe ser NORMAL cuando no hay minStock');
  log('✅', `PASS: Estado=${stock.estado} (esperado: NORMAL)`, colors.green);
}

async function test2_CriticoMenorIgual50Porciento() {
  log('📋', 'TEST 2: Stock ≤50% minStock debe ser CRÍTICO', colors.yellow);
  
  const product = testProducts[1]; // Estado Crítico (30 de 100 = 30%)
  const stock = await getStock(product.id, testWarehouseIds[0]);
  
  assert(stock, 'Stock debe existir');
  assert.strictEqual(stock.estado, 'CRITICO', 'Estado debe ser CRÍTICO');
  
  const porcentaje = (stock.cantidad / product.minStock) * 100;
  log('ℹ️', `Stock: ${stock.cantidad}/${product.minStock} = ${porcentaje}%`, colors.blue);
  assert(porcentaje <= 50, 'Porcentaje debe ser ≤50%');
  log('✅', `PASS: Estado=${stock.estado}, ${porcentaje}% ≤ 50%`, colors.green);
}

async function test3_BajoEntre51y99Porciento() {
  log('📋', 'TEST 3: Stock entre 51-99% minStock debe ser BAJO', colors.yellow);
  
  const product = testProducts[2]; // Estado Bajo (75 de 100 = 75%)
  const stock = await getStock(product.id, testWarehouseIds[0]);
  
  assert(stock, 'Stock debe existir');
  assert.strictEqual(stock.estado, 'BAJO', 'Estado debe ser BAJO');
  
  const porcentaje = (stock.cantidad / product.minStock) * 100;
  log('ℹ️', `Stock: ${stock.cantidad}/${product.minStock} = ${porcentaje}%`, colors.blue);
  assert(porcentaje > 50 && porcentaje < 100, 'Porcentaje debe estar entre 51-99%');
  log('✅', `PASS: Estado=${stock.estado}, 51% < ${porcentaje}% < 100%`, colors.green);
}

async function test4_NormalMayorIgual100Porciento() {
  log('📋', 'TEST 4: Stock ≥100% minStock debe ser NORMAL', colors.yellow);
  
  const product = testProducts[3]; // Estado Normal (150 de 100 = 150%)
  const stock = await getStock(product.id, testWarehouseIds[0]);
  
  assert(stock, 'Stock debe existir');
  assert.strictEqual(stock.estado, 'NORMAL', 'Estado debe ser NORMAL');
  
  const porcentaje = (stock.cantidad / product.minStock) * 100;
  log('ℹ️', `Stock: ${stock.cantidad}/${product.minStock} = ${porcentaje}%`, colors.blue);
  assert(porcentaje >= 100, 'Porcentaje debe ser ≥100%');
  log('✅', `PASS: Estado=${stock.estado}, ${porcentaje}% ≥ 100%`, colors.green);
}

async function test5_MismoProductoDiferentesAlmacenes() {
  log('📋', 'TEST 5: Mismo producto en 2 almacenes con estados diferentes', colors.yellow);
  
  if (testWarehouseIds.length < 2) {
    log('⚠️', 'SKIP: Se requieren al menos 2 almacenes', colors.yellow);
    return;
  }
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };
  
  const product = testProducts[4]; // Multi Almacén (minStock=50)
  
  // Almacén 1: Stock crítico (20 de 50 = 40%)
  await axios.post(`${BASE_URL}/inventory/ajuste`, {
    productId: product.id,
    warehouseId: testWarehouseIds[0],
    cantidadAjuste: 20,
    adjustmentReason: 'ErrorConteo'
  }, config);
  
  // Almacén 2: Stock normal (60 de 50 = 120%)
  await axios.post(`${BASE_URL}/inventory/ajuste`, {
    productId: product.id,
    warehouseId: testWarehouseIds[1],
    cantidadAjuste: 60,
    adjustmentReason: 'ErrorConteo'
  }, config);
  
  const stock1 = await getStock(product.id, testWarehouseIds[0]);
  const stock2 = await getStock(product.id, testWarehouseIds[1]);
  
  assert(stock1, 'Stock en almacén 1 debe existir');
  assert(stock2, 'Stock en almacén 2 debe existir');
  
  log('ℹ️', `Almacén 1: ${stock1.cantidad}/${product.minStock} = Estado ${stock1.estado}`, colors.blue);
  log('ℹ️', `Almacén 2: ${stock2.cantidad}/${product.minStock} = Estado ${stock2.estado}`, colors.blue);
  
  assert.strictEqual(stock1.estado, 'CRITICO', 'Almacén 1 debe ser CRÍTICO');
  assert.strictEqual(stock2.estado, 'NORMAL', 'Almacén 2 debe ser NORMAL');
  
  log('✅', 'PASS: Mismo producto con estados diferentes por almacén', colors.green);
}

async function testAlertas() {
  log('📋', 'TEST BONUS: Endpoint /alertas debe retornar solo CRÍTICO y BAJO', colors.yellow);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };
  
  const response = await axios.get(`${BASE_URL}/inventory/alertas`, config);
  const alertas = response.data.data;
  
  log('ℹ️', `Total alertas encontradas: ${alertas.length}`, colors.blue);
  
  // Verificar que no hay alertas NORMAL
  const alertasNormal = alertas.filter(a => a.tipoAlerta === 'NORMAL');
  assert.strictEqual(alertasNormal.length, 0, 'No debe haber alertas con estado NORMAL');
  
  // Contar críticas y bajas
  const criticas = alertas.filter(a => a.tipoAlerta === 'CRITICO').length;
  const bajas = alertas.filter(a => a.tipoAlerta === 'BAJO').length;
  
  log('ℹ️', `Alertas CRÍTICO: ${criticas}`, colors.blue);
  log('ℹ️', `Alertas BAJO: ${bajas}`, colors.blue);
  
  // Verificar ordenamiento (CRÍTICO primero)
  if (alertas.length > 0 && criticas > 0) {
    const firstAlert = alertas[0];
    assert.strictEqual(firstAlert.tipoAlerta, 'CRITICO', 'Primera alerta debe ser CRÍTICO (orden correcto)');
    log('ℹ️', `Primera alerta: ${firstAlert.nombre} (${firstAlert.tipoAlerta})`, colors.blue);
  }
  
  log('✅', 'PASS: Endpoint alertas funciona correctamente', colors.green);
}

async function cleanup() {
  log('🧹', 'Limpiando datos de prueba...', colors.blue);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  for (const product of testProducts) {
    try {
      await axios.delete(`${BASE_URL}/products/${product.id}`, config);
    } catch (error) {
      // Ignorar errores de limpieza
    }
  }
  
  log('✅', 'Datos de prueba eliminados', colors.green);
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪', 'TEST E2E: ESTADOS DE STOCK', colors.bold);
  console.log('='.repeat(60) + '\n');

  try {
    await login();
    await setupTestData();
    
    console.log('\n' + '-'.repeat(60));
    await test1_SinMinStockEsNormal();
    
    console.log('\n' + '-'.repeat(60));
    await test2_CriticoMenorIgual50Porciento();
    
    console.log('\n' + '-'.repeat(60));
    await test3_BajoEntre51y99Porciento();
    
    console.log('\n' + '-'.repeat(60));
    await test4_NormalMayorIgual100Porciento();
    
    console.log('\n' + '-'.repeat(60));
    await test5_MismoProductoDiferentesAlmacenes();
    
    console.log('\n' + '-'.repeat(60));
    await testAlertas();
    
    console.log('\n' + '='.repeat(60));
    log('🎉', 'TODOS LOS TESTS PASARON', colors.green + colors.bold);
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    log('💥', 'TESTS FALLARON', colors.red + colors.bold);
    console.log('='.repeat(60));
    console.error(error);
    process.exit(1);
  } finally {
    await cleanup();
  }
}

// Ejecutar tests
runTests();
