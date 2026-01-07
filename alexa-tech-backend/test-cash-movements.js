/**
 * Script para probar las APIs de Cash Movements
 * Fase 2A - Test Manual
 */

const BASE_URL = 'http://localhost:3001/api';

// Token de autenticación (obtener del login)
let authToken = '';

async function login() {
  console.log('\n🔐 === PASO 1: LOGIN ===');
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@alexatech.com',
      password: '123456'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    authToken = data.data.token;
    console.log('✅ Login exitoso');
    console.log(`   Usuario: ${data.data.user.firstName} ${data.data.lastName}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
    return data.data.user.id;
  } else {
    console.error('❌ Error en login:', data.message);
    throw new Error('Login falló');
  }
}

async function getActiveCashSession() {
  console.log('\n💰 === PASO 2: OBTENER SESIÓN ACTIVA ===');
  
  const response = await fetch(`${BASE_URL}/cash-sessions/active`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  
  if (data.success && data.data) {
    console.log('✅ Sesión activa encontrada');
    console.log(`   ID: ${data.data.id}`);
    console.log(`   Estado: ${data.data.estado}`);
    console.log(`   Monto Apertura: S/ ${data.data.montoApertura}`);
    return data.data.id;
  } else {
    console.log('⚠️  No hay sesión activa');
    console.log('   Se necesita abrir una caja primero');
    return null;
  }
}

async function createIngreso(cashSessionId) {
  console.log('\n📥 === PASO 3: CREAR INGRESO ===');
  
  const response = await fetch(`${BASE_URL}/cash-movements/ingreso`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cashSessionId,
      monto: 50.00,
      motivo: 'Recuperación de cartera',
      descripcion: 'Pago de cliente con deuda pendiente'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Ingreso creado exitosamente');
    console.log(`   ID: ${data.movement.id}`);
    console.log(`   Tipo: ${data.movement.tipo}`);
    console.log(`   Monto: S/ ${data.movement.monto}`);
    console.log(`   Motivo: ${data.movement.motivo}`);
    return data.movement.id;
  } else {
    console.error('❌ Error al crear ingreso:', data.message);
    return null;
  }
}

async function createEgreso(cashSessionId) {
  console.log('\n📤 === PASO 4: CREAR EGRESO ===');
  
  const response = await fetch(`${BASE_URL}/cash-movements/egreso`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      cashSessionId,
      monto: 25.50,
      motivo: 'Pago delivery',
      descripcion: 'Servicio de mensajería del día'
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Egreso creado exitosamente');
    console.log(`   ID: ${data.movement.id}`);
    console.log(`   Tipo: ${data.movement.tipo}`);
    console.log(`   Monto: S/ ${data.movement.monto}`);
    console.log(`   Motivo: ${data.movement.motivo}`);
    return data.movement.id;
  } else {
    console.error('❌ Error al crear egreso:', data.message);
    return null;
  }
}

async function getMovements(cashSessionId) {
  console.log('\n📋 === PASO 5: LISTAR MOVIMIENTOS ===');
  
  const response = await fetch(`${BASE_URL}/cash-movements/session/${cashSessionId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const movements = await response.json();
  
  if (response.ok) {
    console.log(`✅ Movimientos encontrados: ${movements.length}`);
    
    movements.forEach((mov, idx) => {
      const tipo = mov.tipo === 'INGRESO' ? '📥' : '📤';
      const signo = mov.tipo === 'INGRESO' ? '+' : '-';
      console.log(`   ${idx + 1}. ${tipo} ${mov.motivo}`);
      console.log(`      Monto: ${signo}S/ ${mov.monto}`);
      console.log(`      Usuario: ${mov.usuario.firstName} ${mov.usuario.lastName}`);
      console.log(`      Fecha: ${new Date(mov.createdAt).toLocaleString('es-PE')}`);
    });
    
    return movements;
  } else {
    console.error('❌ Error al obtener movimientos');
    return [];
  }
}

async function getSummary(cashSessionId) {
  console.log('\n💵 === PASO 6: OBTENER RESUMEN DE CAJA ===');
  
  const response = await fetch(`${BASE_URL}/cash-movements/summary/${cashSessionId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Resumen de caja:');
    console.log(`   (+) Monto Apertura:        S/ ${data.montoApertura.toFixed(2)}`);
    console.log(`   (+) Ventas Efectivo:       S/ ${data.totalVentasEfectivo.toFixed(2)}`);
    console.log(`   (+) Ingresos Adicionales:  S/ ${data.totalIngresos.toFixed(2)}`);
    console.log(`   (-) Egresos:               S/ ${data.totalEgresos.toFixed(2)}`);
    console.log(`   ────────────────────────────────────────────`);
    console.log(`   (=) TOTAL ESPERADO:        S/ ${data.totalEsperado.toFixed(2)}`);
    
    return data;
  } else {
    console.error('❌ Error al obtener resumen');
    return null;
  }
}

async function main() {
  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  TEST: Cash Movements API - Fase 2A   ║');
    console.log('╚════════════════════════════════════════╝');
    
    // 1. Login
    await login();
    
    // 2. Obtener sesión activa
    const sessionId = await getActiveCashSession();
    
    if (!sessionId) {
      console.log('\n⚠️  Para continuar, abre una caja desde el frontend');
      console.log('   o ejecuta el endpoint POST /api/cash-sessions con:');
      console.log('   { "cashRegisterId": "...", "montoApertura": 200 }');
      return;
    }
    
    // 3. Crear ingreso
    await createIngreso(sessionId);
    
    // 4. Crear egreso
    await createEgreso(sessionId);
    
    // 5. Listar movimientos
    const movements = await getMovements(sessionId);
    
    // 6. Obtener resumen
    await getSummary(sessionId);
    
    console.log('\n✅ === TEST COMPLETADO EXITOSAMENTE ===\n');
    
    console.log('📝 Próximos pasos:');
    console.log('   1. Verificar en BD: SELECT * FROM cash_movements;');
    console.log('   2. Probar eliminar movimiento: DELETE /api/cash-movements/{id}');
    console.log('   3. Integrar con frontend GestionCaja.tsx (Fase 3)');
    
  } catch (error) {
    console.error('\n❌ === ERROR EN TEST ===');
    console.error(error.message);
  }
}

main();
