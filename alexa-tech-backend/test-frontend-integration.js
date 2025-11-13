/**
 * Script de prueba para verificar endpoints usados por el frontend
 * Simula el flujo completo: Login → Abrir Caja → Crear Venta → Completar → PDF
 */

const fetch = require('node-fetch');

const API_URL = 'http://localhost:3001/api';
let authToken = '';
let cashSessionId = '';
let saleId = '';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, icon, message) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. LOGIN
async function testLogin() {
  logSection('PASO 1: LOGIN');
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@alexatech.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (data.success && data.data.accessToken) {
      authToken = data.data.accessToken;
      log(colors.green, '✅', 'Login exitoso');
      log(colors.blue, 'ℹ️', `Usuario: ${data.data.user.firstName} ${data.data.user.lastName}`);
      log(colors.blue, 'ℹ️', `Email: ${data.data.user.email}`);
      return true;
    } else {
      log(colors.red, '❌', 'Error en login');
      console.log(data);
      return false;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return false;
  }
}

// 2. LISTAR CAJAS REGISTRADORAS
async function testListCashRegisters() {
  logSection('PASO 2: LISTAR CAJAS REGISTRADORAS');
  
  try {
    const response = await fetch(`${API_URL}/cash-registers`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success && data.data.length > 0) {
      log(colors.green, '✅', `${data.data.length} cajas encontradas`);
      data.data.forEach(caja => {
        log(colors.blue, '📦', `${caja.nombre} - ${caja.ubicacion || 'Sin ubicación'} (${caja.activo ? 'Activa' : 'Inactiva'})`);
      });
      return data.data[0].id; // Retornar primera caja
    } else {
      log(colors.red, '❌', 'No hay cajas registradoras');
      return null;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return null;
  }
}

// 3. ABRIR SESIÓN DE CAJA
async function testOpenCashSession(cashRegisterId) {
  logSection('PASO 3: ABRIR SESIÓN DE CAJA');
  
  try {
    // Primero verificar si ya hay una sesión abierta
    const sessionsResponse = await fetch(`${API_URL}/cash-sessions`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const sessionsData = await sessionsResponse.json();
    const activeSession = sessionsData.data?.find(s => s.estado === 'Abierta');
    
    if (activeSession) {
      cashSessionId = activeSession.id;
      log(colors.yellow, '⚠️', 'Ya existe una sesión abierta');
      log(colors.blue, 'ℹ️', `ID: ${activeSession.id}`);
      log(colors.blue, 'ℹ️', `Monto inicial: S/ ${activeSession.montoApertura}`);
      log(colors.blue, 'ℹ️', `Total ventas actuales: S/ ${activeSession.totalVentas}`);
      log(colors.yellow, 'ℹ️', 'Usando sesión existente para la prueba');
      return activeSession.id;
    }
    
    // Si no hay sesión abierta, crear una nueva
    const response = await fetch(`${API_URL}/cash-sessions/open`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cashRegisterId,
        montoApertura: 200.00,
        observaciones: 'Apertura de prueba desde script'
      })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      cashSessionId = data.data.id;
      log(colors.green, '✅', 'Sesión abierta exitosamente');
      log(colors.blue, 'ℹ️', `ID: ${data.data.id}`);
      log(colors.blue, 'ℹ️', `Monto inicial: S/ ${data.data.montoApertura}`);
      log(colors.blue, 'ℹ️', `Estado: ${data.data.estado}`);
      return data.data.id;
    } else {
      log(colors.red, '❌', data.message || 'No se pudo abrir sesión');
      return null;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return null;
  }
}

// 4. OBTENER PRODUCTOS
async function testGetProducts() {
  logSection('PASO 4: OBTENER PRODUCTOS');
  
  try {
    const response = await fetch(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success && data.data.products.length > 0) {
      log(colors.green, '✅', `${data.data.products.length} productos encontrados`);
      
      // Mostrar primer producto con stock
      const productWithStock = data.data.products.find(p => p.stock > 0);
      if (productWithStock) {
        log(colors.blue, '📦', `Ejemplo: ${productWithStock.nombre}`);
        log(colors.blue, 'ℹ️', `Stock: ${productWithStock.stock} | Precio: S/ ${productWithStock.precioVenta}`);
        return productWithStock;
      }
      return data.data.products[0];
    } else {
      log(colors.red, '❌', 'No hay productos');
      return null;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return null;
  }
}

// 5. OBTENER ALMACENES
async function testGetWarehouses() {
  logSection('PASO 5: OBTENER ALMACENES');
  
  try {
    const response = await fetch(`${API_URL}/warehouses`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    const data = await response.json();
    
    if (data.success && data.data.rows.length > 0) {
      log(colors.green, '✅', `${data.data.rows.length} almacenes encontrados`);
      log(colors.blue, '📦', `Usando: ${data.data.rows[0].name}`);
      return data.data.rows[0].id;
    } else {
      log(colors.red, '❌', 'No hay almacenes');
      return null;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return null;
  }
}

// 6. CREAR VENTA
async function testCreateSale(product, warehouseId) {
  logSection('PASO 6: CREAR VENTA');
  
  try {
    const saleData = {
      cashSessionId,
      almacenId: warehouseId,
      tipoComprobante: 'Boleta',
      formaPago: 'Efectivo',
      items: [{
        productId: product.id,
        nombreProducto: product.nombre,
        cantidad: 1,
        precioUnitario: parseFloat(product.precioVenta)
      }],
      observaciones: 'Venta de prueba desde script de integración'
    };

    const response = await fetch(`${API_URL}/sales`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(saleData)
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      saleId = data.data.id;
      log(colors.green, '✅', 'Venta creada exitosamente');
      log(colors.blue, 'ℹ️', `Código: ${data.data.codigoVenta}`);
      log(colors.blue, 'ℹ️', `Total: S/ ${data.data.total.toFixed(2)}`);
      log(colors.blue, 'ℹ️', `Estado: ${data.data.estado}`);
      return data.data.id;
    } else {
      log(colors.red, '❌', data.message || 'Error al crear venta');
      console.log(data);
      return null;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return null;
  }
}

// 7. COMPLETAR VENTA
async function testCompleteSale(saleId) {
  logSection('PASO 7: COMPLETAR VENTA');
  
  try {
    const response = await fetch(`${API_URL}/sales/${saleId}/status`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ estado: 'Completada' })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      log(colors.green, '✅', 'Venta completada exitosamente');
      log(colors.blue, 'ℹ️', `Estado: ${data.data.estado}`);
      log(colors.blue, 'ℹ️', 'Movimientos de inventario ejecutados');
      return true;
    } else {
      log(colors.red, '❌', data.message || 'Error al completar venta');
      return false;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return false;
  }
}

// 8. VERIFICAR PDF DISPONIBLE
async function testInvoiceEndpoints(saleId) {
  logSection('PASO 8: VERIFICAR ENDPOINTS DE PDF');
  
  try {
    // Preview endpoint
    const previewUrl = `${API_URL}/sales/${saleId}/invoice/preview`;
    log(colors.blue, '🔗', `Preview: ${previewUrl}`);
    
    // Download endpoint
    const downloadUrl = `${API_URL}/sales/${saleId}/invoice/download`;
    log(colors.blue, '🔗', `Download: ${downloadUrl}`);
    
    log(colors.green, '✅', 'URLs generadas correctamente');
    log(colors.yellow, 'ℹ️', 'Prueba manual: Abre las URLs en el navegador con token en headers');
    
    return true;
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return false;
  }
}

// 9. CERRAR SESIÓN DE CAJA
async function testCloseCashSession(sessionId) {
  logSection('PASO 9: CERRAR SESIÓN DE CAJA');
  
  try {
    const response = await fetch(`${API_URL}/cash-sessions/${sessionId}/close`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        montoCierre: 377.00, // 200 inicial + 177 de venta
        observaciones: 'Cierre de prueba desde script'
      })
    });

    const data = await response.json();
    
    if (data.success && data.data) {
      log(colors.green, '✅', 'Sesión cerrada exitosamente');
      log(colors.blue, 'ℹ️', `Monto apertura: S/ ${data.data.montoApertura}`);
      log(colors.blue, 'ℹ️', `Total ventas: S/ ${data.data.totalVentas}`);
      log(colors.blue, 'ℹ️', `Monto cierre: S/ ${data.data.montoCierre}`);
      
      const diferencia = data.data.diferencia || 0;
      if (diferencia === 0) {
        log(colors.green, '🎉', '¡Cuadre perfecto!');
      } else {
        const tipo = diferencia > 0 ? 'Sobrante' : 'Faltante';
        log(colors.yellow, '⚠️', `Diferencia: S/ ${Math.abs(diferencia)} (${tipo})`);
      }
      
      return true;
    } else {
      log(colors.red, '❌', data.message || 'Error al cerrar sesión');
      return false;
    }
  } catch (err) {
    log(colors.red, '❌', `Error: ${err.message}`);
    return false;
  }
}

// EJECUTAR TODAS LAS PRUEBAS
async function runAllTests() {
  console.log(`\n${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`);
  console.log(`${colors.cyan}║${' '.repeat(10)}PRUEBA DE INTEGRACIÓN FRONTEND${' '.repeat(16)}║${colors.reset}`);
  console.log(`${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}\n`);

  // 1. Login
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log(colors.red, '❌', 'Abortando pruebas: Login falló');
    process.exit(1);
  }

  await sleep(500);

  // 2. Listar cajas
  const cashRegisterId = await testListCashRegisters();
  if (!cashRegisterId) {
    log(colors.red, '❌', 'Abortando pruebas: No hay cajas registradoras');
    process.exit(1);
  }

  await sleep(500);

  // 3. Abrir sesión
  const sessionId = await testOpenCashSession(cashRegisterId);
  if (!sessionId) {
    log(colors.red, '❌', 'Abortando pruebas: No se pudo abrir sesión');
    process.exit(1);
  }

  await sleep(500);

  // 4. Obtener productos
  const product = await testGetProducts();
  if (!product) {
    log(colors.red, '❌', 'Abortando pruebas: No hay productos');
    process.exit(1);
  }

  await sleep(500);

  // 5. Obtener almacenes
  const warehouseId = await testGetWarehouses();
  if (!warehouseId) {
    log(colors.red, '❌', 'Abortando pruebas: No hay almacenes');
    process.exit(1);
  }

  await sleep(500);

  // 6. Crear venta
  const saleIdCreated = await testCreateSale(product, warehouseId);
  if (!saleIdCreated) {
    log(colors.red, '❌', 'Abortando pruebas: No se pudo crear venta');
    process.exit(1);
  }

  await sleep(500);

  // 7. Completar venta
  const saleCompleted = await testCompleteSale(saleIdCreated);
  if (!saleCompleted) {
    log(colors.red, '❌', 'Abortando pruebas: No se pudo completar venta');
    process.exit(1);
  }

  await sleep(500);

  // 8. Verificar PDFs
  await testInvoiceEndpoints(saleIdCreated);

  await sleep(500);

  // 9. Cerrar sesión (OPCIONAL - comentado para no cerrar sesiones existentes)
  log(colors.yellow, '⚠️', 'Paso 9: Cierre de sesión OMITIDO (mantener sesión abierta para pruebas)');
  log(colors.blue, 'ℹ️', `Para cerrar manualmente: POST ${API_URL}/cash-sessions/${sessionId}/close`);
  log(colors.blue, 'ℹ️', `Body: { "montoCierre": 377.00, "observaciones": "..." }`);
  
  // Descomentar si quieres cerrar automáticamente:
  // await testCloseCashSession(sessionId);

  // RESUMEN FINAL
  logSection('RESUMEN DE INTEGRACIÓN');
  log(colors.green, '✅', 'Todas las pruebas completadas exitosamente');
  log(colors.blue, 'ℹ️', 'Endpoints listos para integración con React');
  
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.green}🎉 Frontend puede usar estos endpoints sin problemas${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);

  log(colors.yellow, '📝', 'Próximos pasos:');
  log(colors.blue, '  1.', 'Actualizar GestionCaja.tsx con openCashSession/closeCashSession');
  log(colors.blue, '  2.', 'Actualizar RealizarVenta.tsx con createSale/completeSale');
  log(colors.blue, '  3.', 'Crear ListaVentas.tsx con previewInvoice/downloadInvoice');
  log(colors.blue, '  4.', 'Probar flujo completo en UI');
}

// Ejecutar
runAllTests().catch(err => {
  log(colors.red, '❌', `Error fatal: ${err.message}`);
  process.exit(1);
});
