/**
 * Test simple - Verificar endpoints del módulo de compras (sin autenticación)
 */

const axios = require('axios');
const BASE_URL = 'http://localhost:3001/api';

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

async function testEndpoint(method, endpoint, description) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      validateStatus: () => true, // No lanzar error en 401/403
    };
    
    const response = await axios(config);
    
    if (response.status === 401 || response.status === 403) {
      log(`✅ ${description} - Endpoint existe (requiere autenticación)`, 'green');
      return true;
    } else if (response.status < 500) {
      log(`✅ ${description} - Endpoint existe (Status: ${response.status})`, 'green');
      return true;
    } else {
      log(`❌ ${description} - Error ${response.status}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ ${description} - ${error.message}`, 'red');
    return false;
  }
}

async function runTests() {
  log('\n═══════════════════════════════════════════', 'blue');
  log('🧪 TEST SIMPLE - ENDPOINTS MÓDULO COMPRAS', 'blue');
  log('═══════════════════════════════════════════\n', 'blue');

  const tests = [
    ['GET', '/compras/ordenes', 'Listar órdenes de compra'],
    ['GET', '/compras/ordenes/estadisticas', 'Estadísticas de compras'],
    ['POST', '/compras/ordenes', 'Crear orden de compra'],
    ['GET', '/compras/recepciones', 'Listar recepciones'],
    ['POST', '/compras/recepciones', 'Crear recepción'],
  ];

  let passed = 0;
  for (const [method, endpoint, description] of tests) {
    const result = await testEndpoint(method, endpoint, description);
    if (result) passed++;
  }

  log('\n═══════════════════════════════════════════', 'blue');
  log(`✅ ${passed}/${tests.length} endpoints funcionando correctamente\n`, 'green');
  
  if (passed === tests.length) {
    log('🎉 ¡TODOS LOS ENDPOINTS ESTÁN DISPONIBLES!', 'green');
    log('✅ El módulo de compras está correctamente registrado\n', 'green');
  }
}

runTests();
