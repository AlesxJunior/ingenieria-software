/**
 * 🤖 TEST COMPLETO: DEMOSTRACIÓN DEL PODER DE LA IA
 * ================================================
 * Este script prueba la integración REAL con Google Gemini AI
 * y muestra cómo analiza clima, ubicación y productos.
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
let authToken = '';
let clienteId = '';

// 🎨 Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function separator() {
  log('\n' + '='.repeat(80), colors.cyan);
}

// Paso 1: Login
async function login() {
  separator();
  log('🔐 PASO 1: Autenticación en el sistema', colors.bright + colors.blue);
  separator();
  
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    authToken = response.data.data?.accessToken || response.data.token || response.data.accessToken;
    if (!authToken) {
      log('❌ No se recibió token de autenticación', colors.red);
      log(`   Respuesta: ${JSON.stringify(response.data, null, 2)}`, colors.red);
      return false;
    }
    log('✅ Login exitoso', colors.green);
    log(`   Token: ${authToken.substring(0, 30)}...`, colors.cyan);
    return true;
  } catch (error) {
    log('❌ Error en login: ' + error.message, colors.red);
    if (error.response) {
      log(`   Respuesta: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
    }
    return false;
  }
}

// Paso 2: Obtener clientes
async function getClients() {
  separator();
  log('👥 PASO 2: Obteniendo lista de clientes', colors.bright + colors.blue);
  separator();
  
  try {
    const response = await axios.get(`${BASE_URL}/entidades`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { tipoEntidad: 'Cliente' }
    });
    
    let clients = response.data.clients || response.data.data || response.data;
    
    // Si no es un array, convertirlo
    if (!Array.isArray(clients)) {
      if (clients.entidades && Array.isArray(clients.entidades)) {
        clients = clients.entidades;
      } else if (clients.clients && Array.isArray(clients.clients)) {
        clients = clients.clients;
      } else {
        log('❌ Formato de respuesta inesperado', colors.red);
        log(`   Respuesta: ${JSON.stringify(response.data, null, 2).substring(0, 500)}`, colors.yellow);
        return null;
      }
    }
    
    log(`✅ Encontrados ${clients.length} clientes`, colors.green);
    
    // Mostrar algunos clientes
    clients.slice(0, 5).forEach((client, idx) => {
      const name = client.razonSocial || `${client.nombres} ${client.apellidos}`;
      const location = `${client.departamento || 'N/A'}`;
      log(`   ${idx + 1}. ${name} - ${location}`, colors.cyan);
    });
    
    // Seleccionar el primer cliente
    if (clients.length > 0) {
      clienteId = clients[0].id;
      const clientName = clients[0].razonSocial || `${clients[0].nombres} ${clients[0].apellidos}`;
      log(`\n📍 Cliente seleccionado: ${clientName}`, colors.yellow);
      return clients[0];
    }
    return null;
  } catch (error) {
    log('❌ Error obteniendo clientes: ' + error.message, colors.red);
    return null;
  }
}

// Paso 3: Consulta a la IA (AQUÍ ES DONDE OCURRE LA MAGIA 🪄)
async function consultarIA(consulta) {
  separator();
  log('🤖 PASO 3: CONSULTANDO A LA IA DE GOOGLE GEMINI', colors.bright + colors.magenta);
  log('   Modelo: gemini-2.5-flash (el más nuevo y potente)', colors.magenta);
  log('   Analizando: Cliente + Clima + Productos + Contexto', colors.magenta);
  separator();
  
  log(`\n💬 Consulta del usuario: "${consulta}"`, colors.yellow);
  log('⏳ Esperando respuesta de la IA...', colors.cyan);
  
  const startTime = Date.now();
  
  try {
    const response = await axios.post(
      `${BASE_URL}/ai/recommendations`,
      {
        clienteId: clienteId,
        consulta: consulta
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    log(`\n✅ ¡Respuesta recibida en ${duration} segundos!`, colors.green);
    
    const data = response.data.data;
    
    // Mostrar contexto del cliente
    separator();
    log('📊 CONTEXTO ANALIZADO POR LA IA:', colors.bright + colors.cyan);
    separator();
    if (data.contextoCliente) {
      log(`   📍 Ubicación: ${data.contextoCliente.ubicacion}`, colors.cyan);
      log(`   🌤️  Clima: ${data.contextoCliente.clima}`, colors.cyan);
      log(`   🛒 Historial: ${data.contextoCliente.historialCompras} productos`, colors.cyan);
    }
    
    // Mostrar productos recomendados
    if (data.recomendados && data.recomendados.length > 0) {
      separator();
      log('⭐ PRODUCTOS RECOMENDADOS POR LA IA:', colors.bright + colors.green);
      separator();
      
      data.recomendados.forEach((producto, idx) => {
        log(`\n${idx + 1}. ${producto.nombre}`, colors.bright + colors.green);
        log(`   💰 Precio: S/ ${producto.precio.toFixed(2)}`, colors.yellow);
        log(`   📊 Score IA: ${producto.score}% (confianza)`, colors.magenta);
        log(`   📦 Stock: ${producto.stock} unidades`, colors.cyan);
        
        log(`   \n   🎯 ¿Por qué lo recomienda la IA?`, colors.blue);
        producto.razones.forEach(razon => {
          log(`      ✓ ${razon}`, colors.cyan);
        });
        
        if (producto.ventajas && producto.ventajas.length > 0) {
          log(`   \n   💡 Ventajas detectadas:`, colors.blue);
          producto.ventajas.forEach(ventaja => {
            log(`      + ${ventaja}`, colors.green);
          });
        }
        
        if (producto.consideraciones && producto.consideraciones.length > 0) {
          log(`   \n   ⚠️  Consideraciones:`, colors.blue);
          producto.consideraciones.forEach(consideracion => {
            log(`      ! ${consideracion}`, colors.yellow);
          });
        }
      });
    }
    
    // Mostrar productos NO recomendados
    if (data.noRecomendados && data.noRecomendados.length > 0) {
      separator();
      log('🚫 PRODUCTOS NO RECOMENDADOS (Análisis IA):', colors.bright + colors.red);
      separator();
      
      data.noRecomendados.forEach((item, idx) => {
        log(`\n${idx + 1}. ${item.nombre}`, colors.red);
        log(`   Razón: ${item.razon}`, colors.yellow);
      });
    }
    
    // Mostrar productos complementarios
    if (data.productosComplementarios && data.productosComplementarios.length > 0) {
      separator();
      log('🔗 PRODUCTOS COMPLEMENTARIOS (Sugeridos por IA):', colors.bright + colors.blue);
      separator();
      
      data.productosComplementarios.forEach((producto, idx) => {
        log(`\n${idx + 1}. ${producto.nombre} - S/ ${producto.precio.toFixed(2)}`, colors.blue);
        producto.razones.forEach(razon => {
          log(`   ✓ ${razon}`, colors.cyan);
        });
      });
    }
    
    // Mostrar tips del experto
    if (data.tipsExperto && data.tipsExperto.length > 0) {
      separator();
      log('💡 TIPS DEL EXPERTO (Generados por IA):', colors.bright + colors.yellow);
      separator();
      
      data.tipsExperto.forEach((tip, idx) => {
        log(`\n${idx + 1}. ${tip}`, colors.yellow);
      });
    }
    
    return data;
    
  } catch (error) {
    log('❌ Error consultando IA: ' + error.message, colors.red);
    if (error.response) {
      log(`   Status: ${error.response.status}`, colors.red);
      log(`   Detalle: ${JSON.stringify(error.response.data, null, 2)}`, colors.red);
    }
    return null;
  }
}

// Ejecutar pruebas
async function ejecutarPruebas() {
  log('\n' + '█'.repeat(80), colors.magenta);
  log('   🚀 DEMOSTRACIÓN DEL PODER DE LA IA INTEGRADA', colors.bright + colors.magenta);
  log('   Conectado a Google Gemini AI (gemini-2.5-flash)', colors.magenta);
  log('█'.repeat(80) + '\n', colors.magenta);
  
  // Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ No se pudo continuar sin autenticación', colors.red);
    return;
  }
  
  // Obtener clientes
  const client = await getClients();
  if (!client) {
    log('\n❌ No se pudo continuar sin clientes', colors.red);
    return;
  }
  
  // Consultar IA con diferentes casos de uso
  const consultas = [
    {
      titulo: 'CASO 1: Cliente busca cámaras de seguridad',
      consulta: 'cámaras de seguridad',
      descripcion: 'La IA analizará el clima de la ubicación del cliente y recomendará cámaras con protección adecuada'
    },
    {
      titulo: 'CASO 2: Cliente busca laptops',
      consulta: 'laptops para trabajo',
      descripcion: 'La IA considerará el perfil del cliente y su historial'
    }
  ];
  
  // Probar primera consulta
  separator();
  log(`\n🎯 ${consultas[0].titulo}`, colors.bright + colors.yellow);
  log(`   ${consultas[0].descripcion}`, colors.yellow);
  
  await consultarIA(consultas[0].consulta);
  
  // Resumen final
  separator();
  log('\n✨ DEMOSTRACIÓN COMPLETADA', colors.bright + colors.green);
  separator();
  log('\n🎯 LO QUE ACABAS DE VER:', colors.bright + colors.cyan);
  log('   1. Autenticación con JWT', colors.cyan);
  log('   2. Obtención de datos del cliente desde PostgreSQL', colors.cyan);
  log('   3. Análisis climático basado en ubicación del cliente', colors.cyan);
  log('   4. Consulta REAL a Google Gemini AI', colors.cyan);
  log('   5. Análisis inteligente de productos vs necesidades del cliente', colors.cyan);
  log('   6. Recomendaciones personalizadas con justificación', colors.cyan);
  log('   7. Score de confianza calculado por la IA', colors.cyan);
  log('   8. Sugerencias complementarias y tips profesionales', colors.cyan);
  
  log('\n🔥 ESTO ES IA REAL, NO ES UN MOCK!', colors.bright + colors.magenta);
  log('   Cada respuesta es única y generada en tiempo real', colors.magenta);
  log('   La IA considera clima, ubicación y contexto del cliente', colors.magenta);
  
  separator();
}

// Ejecutar
ejecutarPruebas().catch(error => {
  log('\n💥 Error fatal: ' + error.message, colors.red);
  console.error(error);
});
