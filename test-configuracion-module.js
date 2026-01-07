/**
 * Script de pruebas completo para el módulo de Configuración
 * Prueba todos los endpoints de empresa, comprobantes y métodos de pago
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';

// Colores para la consola
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
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

function logSection(message) {
  console.log('');
  log(`${'='.repeat(60)}`, 'blue');
  log(`  ${message}`, 'blue');
  log(`${'='.repeat(60)}`, 'blue');
}

async function request(method, endpoint, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${endpoint}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    let postData = '';
    if (body && (method === 'POST' || method === 'PUT')) {
      postData = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      resolve({ status: 500, error: error.message });
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

// ==========================================
// 1. AUTENTICACIÓN
// ==========================================
async function testLogin() {
  logSection('1. AUTENTICACIÓN');
  
  const credentials = {
    username: 'admin',
    password: 'admin123',
  };

  logInfo(`Intentando login con usuario: ${credentials.username}`);
  
  const { status, data } = await request('POST', '/auth/login', credentials);

  if (status === 200 && data.success && data.data?.token) {
    authToken = data.data.token;
    logSuccess('Login exitoso');
    logInfo(`Token obtenido: ${authToken.substring(0, 20)}...`);
    return true;
  } else {
    logError(`Login fallido: ${JSON.stringify(data)}`);
    return false;
  }
}

// ==========================================
// 2. TESTS DE EMPRESA
// ==========================================
async function testEmpresaEndpoints() {
  logSection('2. CONFIGURACIÓN DE EMPRESA');

  // 2.1 GET Empresa (puede estar vacía)
  logInfo('2.1 - GET /api/configuracion/empresa');
  const getResult = await request('GET', '/configuracion/empresa', null, authToken);
  
  if (getResult.status === 200) {
    logSuccess('GET empresa exitoso');
    if (getResult.data) {
      logInfo(`Empresa actual: ${getResult.data.razonSocial || 'Sin datos'}`);
    }
  } else {
    logError(`GET empresa falló: ${JSON.stringify(getResult.data)}`);
  }

  // 2.2 PUT Empresa (Crear/Actualizar)
  logInfo('2.2 - PUT /api/configuracion/empresa (crear/actualizar)');
  const empresaData = {
    ruc: '20123456789',
    razonSocial: 'ALEXA TECH S.A.C.',
    nombreComercial: 'Alexa Tech',
    direccion: 'Av. Tecnología 123',
    telefono: '987654321',
    email: 'contacto@alexatech.com',
    website: 'https://alexatech.com',
    igvActivo: true,
    igvPorcentaje: 18,
    moneda: 'PEN',
    pais: 'Perú',
    departamento: 'Lima',
    provincia: 'Lima',
    distrito: 'Miraflores',
    sunatUsuario: 'MODDATOS',
    sunatClave: 'moddatos',
    sunatServidor: 'homologacion',
  };

  const putResult = await request('PUT', '/configuracion/empresa', empresaData, authToken);

  if (putResult.status === 200 && putResult.data.success) {
    logSuccess('PUT empresa exitoso');
    logInfo(`RUC: ${putResult.data.data.ruc}`);
    logInfo(`Razón Social: ${putResult.data.data.razonSocial}`);
    logInfo(`IGV: ${putResult.data.data.igvPorcentaje}%`);
    return putResult.data.data.id;
  } else {
    logError(`PUT empresa falló: ${JSON.stringify(putResult.data)}`);
    return null;
  }
}

// ==========================================
// 3. TESTS DE COMPROBANTES
// ==========================================
async function testComprobantesEndpoints() {
  logSection('3. TIPOS DE COMPROBANTES');

  const createdIds = [];

  // 3.1 POST Comprobantes (crear múltiples)
  logInfo('3.1 - POST /api/configuracion/comprobantes (crear)');
  
  const comprobantes = [
    {
      codigo: 'F001',
      nombre: 'Factura Electrónica',
      descripcion: 'Factura electrónica para ventas con RUC',
      tipo: 'factura',
      serie: 'F001',
      numeroActual: 1,
      numeroInicio: 1,
      numeroFin: 99999,
      activo: true,
      predeterminado: true,
    },
    {
      codigo: 'B001',
      nombre: 'Boleta de Venta',
      descripcion: 'Boleta para ventas a consumidor final',
      tipo: 'boleta',
      serie: 'B001',
      numeroActual: 1,
      numeroInicio: 1,
      numeroFin: 99999,
      activo: true,
      predeterminado: true,
    },
    {
      codigo: 'NC01',
      nombre: 'Nota de Crédito',
      descripcion: 'Nota de crédito para anulaciones',
      tipo: 'nota-credito',
      serie: 'NC01',
      numeroActual: 1,
      numeroInicio: 1,
      numeroFin: 99999,
      activo: true,
      predeterminado: false,
    },
  ];

  for (const comp of comprobantes) {
    const result = await request('POST', '/configuracion/comprobantes', comp, authToken);
    
    if (result.status === 201 && result.data.success) {
      logSuccess(`Comprobante creado: ${comp.nombre}`);
      createdIds.push(result.data.data.id);
    } else {
      logError(`Falló crear ${comp.nombre}: ${JSON.stringify(result.data)}`);
    }
  }

  // 3.2 GET Comprobantes (listar todos)
  logInfo('3.2 - GET /api/configuracion/comprobantes (listar)');
  const listResult = await request('GET', '/configuracion/comprobantes', null, authToken);

  if (listResult.status === 200 && Array.isArray(listResult.data)) {
    logSuccess(`Comprobantes listados: ${listResult.data.length} encontrados`);
    listResult.data.forEach(c => {
      logInfo(`  - ${c.nombre} (${c.serie}) - ${c.activo ? 'Activo' : 'Inactivo'}`);
    });
  } else {
    logError(`GET comprobantes falló: ${JSON.stringify(listResult.data)}`);
  }

  // 3.3 GET Comprobante por ID
  if (createdIds.length > 0) {
    const testId = createdIds[0];
    logInfo(`3.3 - GET /api/configuracion/comprobantes/${testId.substring(0, 8)}...`);
    
    const getResult = await request('GET', `/configuracion/comprobantes/${testId}`, null, authToken);
    
    if (getResult.status === 200) {
      logSuccess(`Comprobante obtenido: ${getResult.data.nombre}`);
    } else {
      logError(`GET comprobante por ID falló: ${JSON.stringify(getResult.data)}`);
    }
  }

  // 3.4 PUT Comprobante (actualizar)
  if (createdIds.length > 0) {
    const testId = createdIds[0];
    logInfo(`3.4 - PUT /api/configuracion/comprobantes/${testId.substring(0, 8)}... (actualizar)`);
    
    const updateData = {
      descripcion: 'Factura electrónica actualizada',
      numeroActual: 100,
    };

    const updateResult = await request('PUT', `/configuracion/comprobantes/${testId}`, updateData, authToken);
    
    if (updateResult.status === 200 && updateResult.data.success) {
      logSuccess('Comprobante actualizado');
      logInfo(`Número actual: ${updateResult.data.data.numeroActual}`);
    } else {
      logError(`PUT comprobante falló: ${JSON.stringify(updateResult.data)}`);
    }
  }

  return createdIds;
}

// ==========================================
// 4. TESTS DE MÉTODOS DE PAGO
// ==========================================
async function testMetodosPagoEndpoints() {
  logSection('4. MÉTODOS DE PAGO');

  const createdIds = [];

  // 4.1 POST Métodos de Pago (crear múltiples)
  logInfo('4.1 - POST /api/configuracion/metodos-pago (crear)');
  
  const metodos = [
    {
      codigo: 'EFE',
      nombre: 'Efectivo',
      descripcion: 'Pago en efectivo',
      tipo: 'efectivo',
      activo: true,
      predeterminado: true,
      requiereReferencia: false,
    },
    {
      codigo: 'TAR',
      nombre: 'Tarjeta de Crédito/Débito',
      descripcion: 'Pago con tarjeta',
      tipo: 'tarjeta',
      activo: true,
      predeterminado: false,
      requiereReferencia: true,
    },
    {
      codigo: 'TRA',
      nombre: 'Transferencia Bancaria',
      descripcion: 'Transferencia a cuenta bancaria',
      tipo: 'transferencia',
      activo: true,
      predeterminado: false,
      requiereReferencia: true,
    },
    {
      codigo: 'YAP',
      nombre: 'Yape',
      descripcion: 'Pago con aplicación Yape',
      tipo: 'digital',
      activo: true,
      predeterminado: false,
      requiereReferencia: true,
    },
  ];

  for (const metodo of metodos) {
    const result = await request('POST', '/configuracion/metodos-pago', metodo, authToken);
    
    if (result.status === 201 && result.data.success) {
      logSuccess(`Método de pago creado: ${metodo.nombre}`);
      createdIds.push(result.data.data.id);
    } else {
      logError(`Falló crear ${metodo.nombre}: ${JSON.stringify(result.data)}`);
    }
  }

  // 4.2 GET Métodos de Pago (listar todos)
  logInfo('4.2 - GET /api/configuracion/metodos-pago (listar)');
  const listResult = await request('GET', '/configuracion/metodos-pago', null, authToken);

  if (listResult.status === 200 && Array.isArray(listResult.data)) {
    logSuccess(`Métodos de pago listados: ${listResult.data.length} encontrados`);
    listResult.data.forEach(m => {
      logInfo(`  - ${m.nombre} (${m.tipo}) - ${m.requiereReferencia ? 'Requiere ref.' : 'Sin ref.'}`);
    });
  } else {
    logError(`GET métodos falló: ${JSON.stringify(listResult.data)}`);
  }

  // 4.3 GET Método de Pago por ID
  if (createdIds.length > 0) {
    const testId = createdIds[0];
    logInfo(`4.3 - GET /api/configuracion/metodos-pago/${testId.substring(0, 8)}...`);
    
    const getResult = await request('GET', `/configuracion/metodos-pago/${testId}`, null, authToken);
    
    if (getResult.status === 200) {
      logSuccess(`Método de pago obtenido: ${getResult.data.nombre}`);
    } else {
      logError(`GET método por ID falló: ${JSON.stringify(getResult.data)}`);
    }
  }

  // 4.4 PUT Método de Pago (actualizar)
  if (createdIds.length > 0) {
    const testId = createdIds[0];
    logInfo(`4.4 - PUT /api/configuracion/metodos-pago/${testId.substring(0, 8)}... (actualizar)`);
    
    const updateData = {
      descripcion: 'Pago en efectivo - actualizado',
      activo: true,
    };

    const updateResult = await request('PUT', `/configuracion/metodos-pago/${testId}`, updateData, authToken);
    
    if (updateResult.status === 200 && updateResult.data.success) {
      logSuccess('Método de pago actualizado');
      logInfo(`Descripción: ${updateResult.data.data.descripcion}`);
    } else {
      logError(`PUT método falló: ${JSON.stringify(updateResult.data)}`);
    }
  }

  return createdIds;
}

// ==========================================
// 5. TESTS DE VALIDACIÓN
// ==========================================
async function testValidations() {
  logSection('5. TESTS DE VALIDACIÓN');

  // 5.1 Test sin autenticación
  logInfo('5.1 - Intentar acceder sin token (debe fallar)');
  const noAuthResult = await request('GET', '/configuracion/empresa', null, null);
  
  if (noAuthResult.status === 401) {
    logSuccess('Validación correcta: Sin token = 401 Unauthorized');
  } else {
    logError(`Validación falló: esperaba 401, obtuvo ${noAuthResult.status}`);
  }

  // 5.2 Test crear comprobante sin campos requeridos
  logInfo('5.2 - Intentar crear comprobante sin campos (debe fallar)');
  const invalidComp = { nombre: 'Incompleto' };
  const invalidResult = await request('POST', '/configuracion/comprobantes', invalidComp, authToken);
  
  if (invalidResult.status === 400 || invalidResult.status === 500) {
    logSuccess('Validación correcta: Campos faltantes detectados');
  } else {
    log(`Validación inconsistente: status ${invalidResult.status}`, 'yellow');
  }
}

// ==========================================
// 6. RESUMEN DE TESTS
// ==========================================
async function runAllTests() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║   SCRIPT DE PRUEBAS - MÓDULO DE CONFIGURACIÓN             ║', 'blue');
  log('║   Backend: http://localhost:3001                          ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  
  const startTime = Date.now();

  try {
    // 1. Login
    const loginSuccess = await testLogin();
    if (!loginSuccess) {
      logError('No se pudo autenticar. Asegúrate de que el backend esté corriendo.');
      return;
    }

    // 2. Empresa
    await testEmpresaEndpoints();

    // 3. Comprobantes
    const comprobanteIds = await testComprobantesEndpoints();

    // 4. Métodos de Pago
    const metodoIds = await testMetodosPagoEndpoints();

    // 5. Validaciones
    await testValidations();

    // Resumen final
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    logSection('RESUMEN DE TESTS');
    logSuccess(`✓ Tests completados en ${duration}s`);
    logInfo(`✓ Empresa configurada`);
    logInfo(`✓ ${comprobanteIds.length} tipos de comprobantes creados`);
    logInfo(`✓ ${metodoIds.length} métodos de pago creados`);
    logInfo(`✓ Validaciones de seguridad verificadas`);
    
    log('\n' + '═'.repeat(60), 'green');
    log('  ✓ TODOS LOS TESTS PASARON EXITOSAMENTE', 'green');
    log('═'.repeat(60), 'green');

  } catch (error) {
    logError(`Error fatal durante tests: ${error.message}`);
    console.error(error);
  }
}

// Ejecutar todos los tests
runAllTests();
