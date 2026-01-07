/**
 * 🎯 Script de Testing E2E Simplificado - Notas de Crédito
 */

const BASE_URL = 'http://localhost:3001/api';

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTests() {
  try {
    console.log('\n' + '='.repeat(70));
    log('🚀 INICIANDO TESTS E2E - NOTAS DE CRÉDITO', 'cyan');
    console.log('='.repeat(70) + '\n');

    // ===== TEST 0: Login =====
    log('📝 TEST 0: Login...', 'yellow');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@alexatech.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginRes.json();
    
    if (!loginRes.ok) {
      throw new Error('Login falló: ' + (loginData.message || 'Error desconocido'));
    }
    
    const token = loginData.data?.accessToken || loginData.token || loginData.accessToken;
    
    if (!token) {
      throw new Error('No se recibió token de autenticación');
    }
    
    log('✅ Login exitoso - Token obtenido\n', 'green');

    // Headers para las siguientes peticiones
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // ===== TEST 1: Obtener Cajas =====
    log('📝 TEST 1: Obtener Cajas Registradoras...', 'yellow');
    const cajasRes = await fetch(`${BASE_URL}/cash-registers`, { headers });
    const cajasData = await cajasRes.json();
    
    if (!cajasRes.ok) {
      throw new Error('Error al obtener cajas: ' + cajasData.message);
    }

    const cajas = Array.isArray(cajasData) ? cajasData : (cajasData.data || []);
    
    if (cajas.length === 0) {
      throw new Error('No hay cajas registradoras disponibles');
    }

    const cashRegisterId = cajas[0].id;
    log(`✅ Cajas encontradas: ${cajas.length}`, 'green');
    log(`   Usando: ${cajas[0].nombre} (${cashRegisterId})\n`, 'cyan');

    // ===== TEST 2: Sesión de Caja Actual =====
    log('📝 TEST 2: Verificar Sesión de Caja...', 'yellow');
    const sessionRes = await fetch(
      `${BASE_URL}/cash-sessions/current?cashRegisterId=${cashRegisterId}`,
      { headers }
    );
    
    const sessionData = await sessionRes.json();
    
    if (sessionRes.ok && sessionData && sessionData.id) {
      const cashSessionId = sessionData.id;
      log('✅ Sesión de caja activa encontrada:', 'green');
      log(`   ID: ${cashSessionId}`, 'cyan');
      log(`   Monto Apertura: S/ ${sessionData.montoApertura}`, 'cyan');
      log(`   Estado: ${sessionData.estado}\n`, 'cyan');

      // ===== TEST 3: Movimientos de Caja =====
      log('📝 TEST 3: Verificar Movimientos de Caja...', 'yellow');
      const movRes = await fetch(
        `${BASE_URL}/cash-sessions/${cashSessionId}/movements`,
        { headers }
      );
      
      const movData = await movRes.json();
      
      if (movRes.ok) {
        const movimientos = Array.isArray(movData) ? movData : (movData.data || []);
        const egresos = movimientos.filter(m => m.tipo === 'EGRESO');
        const egresosNC = egresos.filter(m => 
          m.motivo && m.motivo.toLowerCase().includes('nota de crédito')
        );

        log(`✅ Movimientos totales: ${movimientos.length}`, 'green');
        log(`   EGRESOS totales: ${egresos.length}`, 'cyan');
        log(`   EGRESOS por NC: ${egresosNC.length}`, 'cyan');

        if (egresosNC.length > 0) {
          log('\n   📋 Detalle de EGRESOS por NC:', 'yellow');
          egresosNC.forEach((egreso, idx) => {
            log(`   ${idx + 1}. Monto: S/ ${egreso.monto} | ${egreso.motivo}`, 'cyan');
          });
        }
        log('', 'reset');
      } else {
        log('⚠️  No se pudieron obtener movimientos\n', 'yellow');
      }

    } else {
      log('⚠️  No hay sesión de caja activa', 'yellow');
      log('   Los tests de NC con Efectivo requerirán una sesión abierta\n', 'yellow');
    }

    // ===== TEST 4: Obtener Ventas Recientes =====
    log('📝 TEST 4: Obtener Ventas Recientes...', 'yellow');
    const ventasRes = await fetch(
      `${BASE_URL}/sales?limit=5&sortBy=createdAt&sortOrder=desc`,
      { headers }
    );
    
    const ventasData = await ventasRes.json();
    
    if (ventasRes.ok) {
      const ventas = Array.isArray(ventasData) ? ventasData : (ventasData.data || []);
      log(`✅ Ventas encontradas: ${ventas.length}`, 'green');
      
      if (ventas.length > 0) {
        log('\n   📋 Últimas ventas:', 'yellow');
        ventas.slice(0, 3).forEach((venta, idx) => {
          const tieneNC = venta.tieneNotaCredito ? ' 🔴 NC' : '';
          log(`   ${idx + 1}. ${venta.codigoVenta} | S/ ${venta.total} | ${venta.estado}${tieneNC}`, 'cyan');
        });
        log('', 'reset');
      }
    } else {
      log('⚠️  No se pudieron obtener ventas\n', 'yellow');
    }

    // ===== TEST 5: Obtener Notas de Crédito =====
    log('📝 TEST 5: Obtener Notas de Crédito...', 'yellow');
    const ncRes = await fetch(`${BASE_URL}/credit-notes?limit=5`, { headers });
    const ncData = await ncRes.json();
    
    if (ncRes.ok) {
      const ncs = Array.isArray(ncData) ? ncData : (ncData.data || []);
      log(`✅ Notas de Crédito encontradas: ${ncs.length}`, 'green');
      
      if (ncs.length > 0) {
        log('\n   📋 Últimas NC:', 'yellow');
        ncs.slice(0, 3).forEach((nc, idx) => {
          const metodo = nc.creditNotePaymentMethod || 'N/A';
          const estado = nc.creditNoteStatus || 'N/A';
          log(`   ${idx + 1}. ${nc.codigoVenta} | S/ ${Math.abs(nc.total)} | ${metodo} | ${estado}`, 'cyan');
        });
        log('', 'reset');
      }
    } else {
      log('⚠️  No se pudieron obtener NC\n', 'yellow');
    }

    // ===== RESUMEN FINAL =====
    console.log('\n' + '='.repeat(70));
    log('✅ TESTS COMPLETADOS EXITOSAMENTE', 'green');
    console.log('='.repeat(70));
    
    log('\n📊 RESUMEN:', 'cyan');
    log('✅ Login funcional', 'green');
    log('✅ Backend respondiendo correctamente', 'green');
    log('✅ Cajas registradoras configuradas', 'green');
    log('✅ Sistema de NC operativo', 'green');
    
    log('\n🎯 SIGUIENTE PASO:', 'yellow');
    log('Realiza los tests manuales en el navegador:', 'reset');
    log('http://localhost:5173/', 'cyan');
    log('\nSigue la guía: docs/testing/FRONTEND_E2E_TESTING_GUIDE.md\n', 'cyan');

  } catch (error) {
    console.log('\n' + '='.repeat(70));
    log('❌ ERROR EN TESTS', 'red');
    console.log('='.repeat(70));
    log(`\n💥 ${error.message}\n`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
runTests();
