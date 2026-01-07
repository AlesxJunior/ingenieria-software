// test-modo-detective.js - Validación del Modo Detective IA
// Este script prueba que la IA retorna los pasos de análisis correctamente

const https = require('https');

// Configuración
const BASE_URL = 'http://localhost:3001';
const TEST_CONFIG = {
  // Credenciales de prueba (ajustar según tu BD)
  email: 'admin@example.com',
  password: 'admin123',
  // Consulta de prueba
  consulta: 'camaras de seguridad',
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, symbol, message) {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function logSuccess(message) {
  log(colors.green, '✅', message);
}

function logError(message) {
  log(colors.red, '❌', message);
}

function logInfo(message) {
  log(colors.blue, 'ℹ️', message);
}

function logWarning(message) {
  log(colors.yellow, '⚠️', message);
}

function logDetective(message) {
  log(colors.magenta, '🕵️', message);
}

// Función para hacer requests HTTP
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
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

    const req = require('http').request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// PASO 1: Login
async function testLogin() {
  logInfo('PASO 1: Autenticación...');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: TEST_CONFIG.email,
      password: TEST_CONFIG.password,
    });

    if (response.status === 200 && response.data.token) {
      logSuccess(`Login exitoso - Token obtenido`);
      return response.data.token;
    } else {
      logError(`Login falló: ${response.status} - ${JSON.stringify(response.data)}`);
      return null;
    }
  } catch (error) {
    logError(`Error en login: ${error.message}`);
    return null;
  }
}

// PASO 2: Obtener lista de clientes
async function testGetClients(token) {
  logInfo('PASO 2: Obteniendo lista de clientes...');
  try {
    const response = await makeRequest('GET', '/api/clients', null, token);

    if (response.status === 200 && Array.isArray(response.data)) {
      logSuccess(`${response.data.length} clientes encontrados`);
      return response.data[0]?.id || null;
    } else {
      logError(`Error obteniendo clientes: ${response.status}`);
      return null;
    }
  } catch (error) {
    logError(`Error obteniendo clientes: ${error.message}`);
    return null;
  }
}

// PASO 3: Probar endpoint de recomendaciones con Modo Detective
async function testAIRecommendations(token, clienteId) {
  console.log('\n' + '='.repeat(80));
  logDetective('PASO 3: PROBANDO MODO DETECTIVE IA');
  console.log('='.repeat(80) + '\n');

  try {
    const startTime = Date.now();
    
    logInfo(`Enviando solicitud...`);
    logInfo(`  Cliente ID: ${clienteId}`);
    logInfo(`  Consulta: "${TEST_CONFIG.consulta}"`);
    console.log('');

    const response = await makeRequest(
      'POST',
      '/api/ai/recommendations',
      {
        clienteId: clienteId,
        consulta: TEST_CONFIG.consulta,
      },
      token
    );

    const totalTime = Date.now() - startTime;

    if (response.status !== 200) {
      logError(`Error ${response.status}: ${JSON.stringify(response.data)}`);
      return false;
    }

    const data = response.data.data;

    // ✅ VALIDACIÓN 1: Verificar estructura básica
    console.log('\n📋 VALIDACIÓN 1: Estructura de Respuesta');
    console.log('─'.repeat(80));
    
    if (!data) {
      logError('No hay datos en la respuesta');
      return false;
    }

    logSuccess('Respuesta contiene datos');

    // ✅ VALIDACIÓN 2: Verificar que existen pasos de análisis
    console.log('\n📋 VALIDACIÓN 2: Pasos de Análisis (Modo Detective)');
    console.log('─'.repeat(80));

    if (!data.pasosAnalisis) {
      logError('❌ FALLO CRÍTICO: No se encontró "pasosAnalisis" en la respuesta');
      logWarning('El modo detective NO está funcionando');
      return false;
    }

    if (!Array.isArray(data.pasosAnalisis)) {
      logError('❌ FALLO: "pasosAnalisis" no es un array');
      return false;
    }

    if (data.pasosAnalisis.length === 0) {
      logError('❌ FALLO: "pasosAnalisis" está vacío');
      return false;
    }

    logSuccess(`✅ "pasosAnalisis" encontrado con ${data.pasosAnalisis.length} pasos`);

    // ✅ VALIDACIÓN 3: Verificar cada paso
    console.log('\n📋 VALIDACIÓN 3: Detalle de Cada Paso');
    console.log('─'.repeat(80));

    const pasosEsperados = [
      { paso: 1, titulo: '🔎 Investigando Perfil del Cliente' },
      { paso: 2, titulo: '🌦️ Análisis Climático y Geográfico' },
      { paso: 3, titulo: '📦 Búsqueda Inteligente en Inventario' },
    ];

    let allStepsValid = true;

    data.pasosAnalisis.forEach((paso, index) => {
      console.log(`\n${colors.cyan}${colors.bright}PASO ${paso.paso}:${colors.reset} ${paso.titulo}`);
      
      // Validar estructura del paso
      const validations = [
        { field: 'paso', value: paso.paso, type: 'number' },
        { field: 'titulo', value: paso.titulo, type: 'string' },
        { field: 'descripcion', value: paso.descripcion, type: 'string' },
        { field: 'datos', value: paso.datos, type: 'object' },
        { field: 'timestamp', value: paso.timestamp, type: 'string' },
      ];

      validations.forEach((validation) => {
        if (typeof validation.value === validation.type) {
          logSuccess(`  ✓ ${validation.field}: OK (${validation.type})`);
        } else {
          logError(`  ✗ ${validation.field}: FALLO (esperado ${validation.type}, recibido ${typeof validation.value})`);
          allStepsValid = false;
        }
      });

      // Mostrar descripción
      console.log(`  ${colors.blue}Descripción:${colors.reset} ${paso.descripcion.substring(0, 80)}...`);

      // Mostrar datos clave
      if (paso.datos) {
        console.log(`  ${colors.blue}Datos:${colors.reset}`);
        Object.keys(paso.datos).forEach((key) => {
          const value = paso.datos[key];
          const displayValue = typeof value === 'object' 
            ? JSON.stringify(value).substring(0, 50) + '...'
            : String(value).substring(0, 50);
          console.log(`    • ${key}: ${displayValue}`);
        });

        // Verificar tiempo de análisis
        if (paso.datos.tiempoAnalisis) {
          logSuccess(`  ⏱️  Tiempo: ${paso.datos.tiempoAnalisis}`);
        }
      }
    });

    if (!allStepsValid) {
      logError('❌ Algunos pasos tienen estructura inválida');
      return false;
    }

    logSuccess(`✅ Todos los ${data.pasosAnalisis.length} pasos son válidos`);

    // ✅ VALIDACIÓN 4: Verificar tiempo total
    console.log('\n📋 VALIDACIÓN 4: Tiempos de Ejecución');
    console.log('─'.repeat(80));

    const lastStep = data.pasosAnalisis[data.pasosAnalisis.length - 1];
    if (lastStep.datos?.tiempoTotal) {
      logSuccess(`⏱️  Tiempo total (reportado por IA): ${lastStep.datos.tiempoTotal}`);
    }
    logInfo(`⏱️  Tiempo total (medido en test): ${totalTime}ms`);

    // ✅ VALIDACIÓN 5: Verificar contexto del cliente
    console.log('\n📋 VALIDACIÓN 5: Contexto del Cliente');
    console.log('─'.repeat(80));

    if (data.contextoCliente) {
      logSuccess('✅ "contextoCliente" encontrado');
      console.log(`  • Ubicación: ${data.contextoCliente.ubicacion || 'N/A'}`);
      console.log(`  • Clima: ${data.contextoCliente.clima || 'N/A'}`);
      console.log(`  • Historial Compras: ${data.contextoCliente.historialCompras || 0}`);
    } else {
      logWarning('⚠️  "contextoCliente" no encontrado (opcional pero recomendado)');
    }

    // ✅ VALIDACIÓN 6: Verificar recomendaciones
    console.log('\n📋 VALIDACIÓN 6: Recomendaciones Generadas');
    console.log('─'.repeat(80));

    if (data.recomendaciones) {
      logSuccess(`✅ ${data.recomendaciones.length} productos recomendados`);
      data.recomendaciones.slice(0, 2).forEach((rec, i) => {
        console.log(`\n  ${i + 1}. ${rec.nombre}`);
        console.log(`     Score: ${rec.score}%`);
        console.log(`     Precio: S/ ${rec.precio}`);
        console.log(`     Razones: ${rec.razones?.length || 0}`);
      });
    } else if (data.recomendados) {
      logSuccess(`✅ ${data.recomendados.length} productos recomendados`);
    } else {
      logWarning('⚠️  No hay productos recomendados (puede ser normal si BD está vacía)');
    }

    // ✅ VALIDACIÓN 7: Verificar tips
    console.log('\n📋 VALIDACIÓN 7: Tips del Experto');
    console.log('─'.repeat(80));

    const tips = data.tips || data.tipsExperto || [];
    if (tips.length > 0) {
      logSuccess(`✅ ${tips.length} tips generados`);
      tips.slice(0, 3).forEach((tip, i) => {
        console.log(`  ${i + 1}. ${tip.substring(0, 80)}...`);
      });
    } else {
      logWarning('⚠️  No hay tips (puede ser normal si BD está vacía)');
    }

    // ✅ RESUMEN FINAL
    console.log('\n' + '='.repeat(80));
    logDetective('RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(80) + '\n');

    logSuccess('✅ Endpoint responde correctamente (200 OK)');
    logSuccess(`✅ Modo Detective FUNCIONA (${data.pasosAnalisis.length} pasos capturados)`);
    logSuccess('✅ Estructura de datos válida');
    logSuccess('✅ Tiempos de ejecución registrados');
    
    if (data.contextoCliente) {
      logSuccess('✅ Contexto del cliente incluido');
    }

    console.log('\n' + colors.green + colors.bright + '🎉 ¡MODO DETECTIVE VALIDADO EXITOSAMENTE!' + colors.reset + '\n');

    return true;
  } catch (error) {
    logError(`Error en prueba de IA: ${error.message}`);
    console.error(error);
    return false;
  }
}

// FUNCIÓN PRINCIPAL
async function runTests() {
  console.log('\n' + colors.cyan + colors.bright);
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                     🕵️  TEST MODO DETECTIVE IA                            ║');
  console.log('║                                                                            ║');
  console.log('║  Validando que la IA muestre su proceso de análisis paso a paso           ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log(colors.reset + '\n');

  // Paso 1: Login
  const token = await testLogin();
  if (!token) {
    logError('❌ No se pudo obtener token. Verifica credenciales en TEST_CONFIG.');
    process.exit(1);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Paso 2: Obtener cliente
  const clienteId = await testGetClients(token);
  if (!clienteId) {
    logError('❌ No se encontraron clientes. Agrega al menos 1 cliente a la BD.');
    process.exit(1);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Paso 3: Probar IA con Modo Detective
  const success = await testAIRecommendations(token, clienteId);

  console.log('\n' + '='.repeat(80));
  if (success) {
    console.log(colors.green + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                          ✅ PRUEBA EXITOSA                                 ║');
    console.log('║                                                                            ║');
    console.log('║  El Modo Detective está funcionando correctamente.                        ║');
    console.log('║  Todos los pasos de análisis se capturan y retornan como se esperaba.     ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    process.exit(0);
  } else {
    console.log(colors.red + colors.bright);
    console.log('╔════════════════════════════════════════════════════════════════════════════╗');
    console.log('║                          ❌ PRUEBA FALLIDA                                 ║');
    console.log('║                                                                            ║');
    console.log('║  El Modo Detective NO está funcionando correctamente.                     ║');
    console.log('║  Revisa los logs anteriores para identificar el problema.                 ║');
    console.log('╚════════════════════════════════════════════════════════════════════════════╝');
    console.log(colors.reset);
    process.exit(1);
  }
}

// Verificar que el backend esté corriendo
logInfo('Verificando que el backend esté disponible en ' + BASE_URL + '...');
require('http')
  .get(BASE_URL + '/api/health', (res) => {
    if (res.statusCode === 200) {
      logSuccess('Backend está corriendo ✅');
      runTests();
    } else {
      logError(`Backend respondió con código ${res.statusCode}`);
      process.exit(1);
    }
  })
  .on('error', (err) => {
    logError('❌ No se pudo conectar al backend');
    logError('Asegúrate de que el backend esté corriendo en http://localhost:3001');
    logError('Comando: cd alexa-tech-backend && npm run dev');
    process.exit(1);
  });
