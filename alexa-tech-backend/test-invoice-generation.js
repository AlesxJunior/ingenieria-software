/**
 * Script para probar generación de facturas PDF
 * Prueba los endpoints de invoice
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3001/api';

let authToken = '';
let saleId = '';
let productId = '';
let clientId = '';
let cashSessionId = '';
let cashRegisterId = '';
let warehouseId = '';

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n🧪 TEST: ${name}`, 'cyan');
    await fn();
    log(`✅ PASSED: ${name}`, 'green');
    return true;
  } catch (error) {
    log(`❌ FAILED: ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function authenticate() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@alexatech.com',
      password: 'admin123',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Auth failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  authToken = data.data.accessToken;
  log(`Token obtenido: ${authToken.substring(0, 30)}...`, 'blue');
}

async function getProduct() {
  const response = await fetch(`${BASE_URL}/products?limit=1`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get products: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.data && data.data.data && data.data.data.length > 0) {
    productId = data.data.data[0].id;
    log(`Producto obtenido: ${productId} - ${data.data.data[0].nombre}`, 'blue');
  } else {
    throw new Error('No products found');
  }
}

async function getClient() {
  const response = await fetch(`${BASE_URL}/entidades?tipo=Cliente&limit=1`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get clients: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.data && data.data.data && data.data.data.length > 0) {
    clientId = data.data.data[0].id;
    log(`Cliente obtenido: ${clientId} - ${data.data.data[0].nombre}`, 'blue');
  } else {
    throw new Error('No clients found');
  }
}

async function getCashRegister() {
  const response = await fetch(`${BASE_URL}/cash-registers?limit=1`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get cash registers: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.data && data.data.data && data.data.data.length > 0) {
    cashRegisterId = data.data.data[0].id;
    log(`Caja registradora obtenida: ${cashRegisterId} - ${data.data.data[0].codigo}`, 'blue');
  } else {
    throw new Error('No cash registers found');
  }
}

async function getWarehouse() {
  const response = await fetch(`${BASE_URL}/warehouses?limit=1`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get warehouses: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.data && data.data.data && data.data.data.length > 0) {
    warehouseId = data.data.data[0].id;
    log(`Almacén obtenido: ${warehouseId} - ${data.data.data[0].codigo}`, 'blue');
  } else {
    throw new Error('No warehouses found');
  }
}

async function openCashSession() {
  const response = await fetch(`${BASE_URL}/cash-sessions/open`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cashRegisterId: cashRegisterId,
      montoApertura: 500.00,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    // Si ya hay una sesión abierta, obtenerla
    if (error.error && error.error.includes('ya tiene una sesión')) {
      const getResponse = await fetch(`${BASE_URL}/cash-sessions/current?cashRegisterId=${cashRegisterId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });
      const getData = await getResponse.json();
      cashSessionId = getData.data.id;
      log(`Usando sesión existente: ${cashSessionId}`, 'yellow');
      return;
    }
    throw new Error(`Failed to open cash session: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  cashSessionId = data.data.id;
  log(`Sesión abierta: ${cashSessionId}`, 'blue');
}

async function createSale() {
  const response = await fetch(`${BASE_URL}/sales`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tipoComprobante: 'Factura',
      formaPago: 'Efectivo',
      clienteId: clientId,
      almacenId: warehouseId,
      cashSessionId: cashSessionId,
      observaciones: 'Venta de prueba para generación de PDF',
      items: [
        {
          productId: productId,
          cantidad: 2,
          precioUnitario: 150.00,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create sale: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  saleId = data.data.id;
  log(`Venta creada: ${saleId} - Código: ${data.data.codigoVenta}`, 'blue');
  log(`   Total: S/ ${data.data.total}`, 'blue');
}

async function completeSale() {
  const response = await fetch(`${BASE_URL}/sales/${saleId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      estado: 'Completada',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to complete sale: ${JSON.stringify(error)}`);
  }

  log(`Venta completada: ${saleId}`, 'blue');
}

async function downloadInvoice() {
  const response = await fetch(`${BASE_URL}/sales/${saleId}/invoice/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to download invoice: ${error}`);
  }

  // Guardar PDF
  const buffer = await response.buffer();
  const filePath = path.join(__dirname, `factura-${saleId}.pdf`);
  fs.writeFileSync(filePath, buffer);
  
  log(`Factura descargada: ${filePath}`, 'green');
  log(`   Tamaño: ${(buffer.length / 1024).toFixed(2)} KB`, 'blue');
}

async function previewInvoice() {
  const response = await fetch(`${BASE_URL}/sales/${saleId}/invoice/preview`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to preview invoice: ${error}`);
  }

  // Verificar que sea un PDF
  const contentType = response.headers.get('content-type');
  if (contentType !== 'application/pdf') {
    throw new Error(`Expected PDF, got ${contentType}`);
  }

  const buffer = await response.buffer();
  log(`Preview exitoso - Tamaño: ${(buffer.length / 1024).toFixed(2)} KB`, 'green');
}

async function runTests() {
  log('='.repeat(60), 'cyan');
  log('PRUEBA DE GENERACIÓN DE FACTURAS PDF', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = [];

  // Autenticación
  results.push(await test('1. Autenticar usuario', authenticate));

  // Obtener datos necesarios
  results.push(await test('2. Obtener producto', getProduct));
  results.push(await test('3. Obtener cliente', getClient));
  results.push(await test('4. Obtener caja registradora', getCashRegister));
  results.push(await test('5. Obtener almacén', getWarehouse));

  // Crear venta
  results.push(await test('6. Abrir sesión de caja', openCashSession));
  results.push(await test('7. Crear venta', createSale));
  results.push(await test('8. Completar venta', completeSale));

  // Generar PDFs
  results.push(await test('9. Descargar factura PDF', downloadInvoice));
  results.push(await test('10. Preview factura PDF', previewInvoice));

  // Resumen
  log('\n' + '='.repeat(60), 'cyan');
  const passed = results.filter(r => r).length;
  const total = results.length;
  log(`RESULTADOS: ${passed}/${total} tests pasados (${((passed/total)*100).toFixed(1)}%)`, 
    passed === total ? 'green' : 'yellow');
  log('='.repeat(60), 'cyan');

  if (saleId) {
    log(`\n📄 Sale ID para pruebas: ${saleId}`, 'blue');
    log(`🔗 Preview URL: http://localhost:3001/api/sales/${saleId}/invoice/preview`, 'blue');
    log(`⬇️  Download URL: http://localhost:3001/api/sales/${saleId}/invoice/download`, 'blue');
  }
}

runTests().catch(error => {
  log(`\n💥 Error fatal: ${error.message}`, 'red');
  process.exit(1);
});
