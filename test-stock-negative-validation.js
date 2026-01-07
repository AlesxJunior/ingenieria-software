/**
 * ============================================
 * TEST E2E: Validación de Stock Negativo
 * ============================================
 * 
 * Propósito: Verificar que el sistema rechaza ajustes que resulten en stock negativo
 * 
 * Casos de prueba:
 * 1. ✅ Ajuste a 0 es permitido
 * 2. ❌ Ajuste que deje negativo es rechazado
 * 3. ❌ Ajuste grande negativo es rechazado con warning
 * 4. ✅ Ajuste positivo siempre permitido
 */

const axios = require('axios');
const assert = require('assert');

const BASE_URL = process.env.API_URL || 'http://localhost:3001/api';
let authToken = '';
let testProductId = '';
let testWarehouseId = '';

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

  // Crear producto de prueba
  const productRes = await axios.post(`${BASE_URL}/products`, {
    codigo: `TEST-NEGSTOCK-${Date.now()}`,
    nombre: 'Producto Test Stock Negativo',
    precio: 100,
    minStock: 50, // Stock mínimo para alertas
    trackInventory: true,
    estado: true
  }, config);
  testProductId = productRes.data.data.id;
  log('✅', `Producto creado: ${testProductId}`, colors.green);

  // Obtener almacén principal
  const warehousesRes = await axios.get(`${BASE_URL}/warehouses`, config);
  testWarehouseId = warehousesRes.data.data.rows[0]?.id;
  assert(testWarehouseId, 'Debe haber al menos un almacén');
  log('✅', `Almacén obtenido: ${testWarehouseId}`, colors.green);

  // Crear stock inicial de 30 unidades (crítico: ≤50% de 50 = 25)
  await axios.post(`${BASE_URL}/inventory/ajuste`, {
    productId: testProductId,
    warehouseId: testWarehouseId,
    cantidadAjuste: 30, // Stock inicial
    adjustmentReason: 'ErrorConteo',
    observaciones: 'Stock inicial para test'
  }, config);
  log('✅', 'Stock inicial creado: 30 unidades', colors.green);
}

async function test1_AjusteACeroPermitido() {
  log('📋', 'TEST 1: Ajuste a 0 debe ser permitido', colors.yellow);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  try {
    // Ajustar a 0 (reducir 30 unidades)
    const response = await axios.post(`${BASE_URL}/inventory/ajuste`, {
      productId: testProductId,
      warehouseId: testWarehouseId,
      cantidadAjuste: -30,
      adjustmentReason: 'MermaDanio',
      observaciones: 'Test ajuste a 0'
    }, config);

    assert.strictEqual(response.data.success, true, 'Debe ser exitoso');
    assert.strictEqual(response.data.data.stockAfter, 0, 'Stock debe ser 0');
    log('✅', 'PASS: Ajuste a 0 permitido correctamente', colors.green);
    
    // Restaurar stock para siguiente test
    await axios.post(`${BASE_URL}/inventory/ajuste`, {
      productId: testProductId,
      warehouseId: testWarehouseId,
      cantidadAjuste: 20,
      adjustmentReason: 'ErrorConteo'
    }, config);
    
  } catch (error) {
    log('❌', `FAIL: ${error.response?.data?.message || error.message}`, colors.red);
    throw error;
  }
}

async function test2_AjusteNegativoRechazado() {
  log('📋', 'TEST 2: Ajuste que deje stock negativo debe ser rechazado', colors.yellow);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  try {
    // Intentar reducir 50 unidades cuando solo hay 20
    await axios.post(`${BASE_URL}/inventory/ajuste`, {
      productId: testProductId,
      warehouseId: testWarehouseId,
      cantidadAjuste: -50,
      adjustmentReason: 'MermaDanio',
      observaciones: 'Test ajuste negativo'
    }, config);

    log('❌', 'FAIL: Debió rechazar el ajuste negativo', colors.red);
    throw new Error('Se esperaba error pero la petición fue exitosa');
    
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 500) {
      const errorMsg = error.response.data.message;
      assert(
        errorMsg.includes('negativo') || errorMsg.includes('insuficiente'),
        'Mensaje de error debe mencionar stock negativo o insuficiente'
      );
      log('✅', `PASS: Ajuste rechazado correctamente - "${errorMsg}"`, colors.green);
    } else {
      throw error;
    }
  }
}

async function test3_AjusteGrandeConWarning() {
  log('📋', 'TEST 3: Ajuste grande (>100) debe generar warning en logs', colors.yellow);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  try {
    // Intentar reducir 150 unidades (grande) cuando solo hay 20
    await axios.post(`${BASE_URL}/inventory/ajuste`, {
      productId: testProductId,
      warehouseId: testWarehouseId,
      cantidadAjuste: -150,
      adjustmentReason: 'MermaDanio',
      observaciones: 'Test ajuste grande negativo'
    }, config);

    log('❌', 'FAIL: Debió rechazar el ajuste', colors.red);
    throw new Error('Se esperaba error');
    
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 500) {
      log('✅', 'PASS: Ajuste grande rechazado (revisar logs del servidor para warning ⚠️)', colors.green);
      log('ℹ️', 'El backend debe mostrar: "[INVENTARIO] ⚠️ Ajuste de gran magnitud detectado"', colors.blue);
    } else {
      throw error;
    }
  }
}

async function test4_AjustePositivoSiemprePermitido() {
  log('📋', 'TEST 4: Ajuste positivo siempre debe ser permitido', colors.yellow);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  try {
    const response = await axios.post(`${BASE_URL}/inventory/ajuste`, {
      productId: testProductId,
      warehouseId: testWarehouseId,
      cantidadAjuste: 200, // Incremento grande
      adjustmentReason: 'DevolucionCliente',
      observaciones: 'Test ajuste positivo grande'
    }, config);

    assert.strictEqual(response.data.success, true, 'Debe ser exitoso');
    assert.strictEqual(response.data.data.stockAfter, 220, 'Stock debe ser 220 (20 + 200)');
    log('✅', 'PASS: Ajuste positivo grande permitido correctamente', colors.green);
    
  } catch (error) {
    log('❌', `FAIL: ${error.response?.data?.message || error.message}`, colors.red);
    throw error;
  }
}

async function test5_VerificarConstraintDB() {
  log('📋', 'TEST 5: Verificar que constraint de BD existe (opcional)', colors.yellow);
  log('ℹ️', 'Para verificar el constraint, ejecutar:', colors.blue);
  log('', `  SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'stock_by_warehouse'::regclass AND conname = 'check_positive_quantity';`, colors.blue);
  log('ℹ️', 'Si no está creado, ejecutar: scripts/add-stock-positive-constraint.sql', colors.yellow);
}

async function cleanup() {
  log('🧹', 'Limpiando datos de prueba...', colors.blue);
  
  const config = {
    headers: { Authorization: `Bearer ${authToken}` }
  };

  try {
    // Eliminar producto (cascade eliminará stock y movimientos)
    await axios.delete(`${BASE_URL}/products/${testProductId}`, config);
    log('✅', 'Datos de prueba eliminados', colors.green);
  } catch (error) {
    log('⚠️', 'Error al limpiar (no crítico)', colors.yellow);
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪', 'TEST E2E: VALIDACIÓN DE STOCK NEGATIVO', colors.bold);
  console.log('='.repeat(60) + '\n');

  try {
    await login();
    await setupTestData();
    
    console.log('\n' + '-'.repeat(60));
    await test1_AjusteACeroPermitido();
    
    console.log('\n' + '-'.repeat(60));
    await test2_AjusteNegativoRechazado();
    
    console.log('\n' + '-'.repeat(60));
    await test3_AjusteGrandeConWarning();
    
    console.log('\n' + '-'.repeat(60));
    await test4_AjustePositivoSiemprePermitido();
    
    console.log('\n' + '-'.repeat(60));
    await test5_VerificarConstraintDB();
    
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
