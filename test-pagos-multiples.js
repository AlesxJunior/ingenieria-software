const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let token = '';

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@alexatech.com',
    password: 'admin123'
  });
  token = response.data.accessToken;
  console.log('✅ Login exitoso\n');
}

async function testPagoSimple() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 1: PAGO SIMPLE (Compatibilidad con sistema anterior)');
  console.log('═══════════════════════════════════════════════════════\n');

  const ventaSimple = {
    tipoComprobante: 'Boleta',
    formaPago: 'Efectivo', // ✅ Pago simple tradicional
    almacenId: 'cm9r6cq840001vkhk5bfz8dxl',
    items: [
      {
        productId: 'cm9r6dt3q0005vkhk01j4iwh6',
        cantidad: 1,
        precioUnitario: 100.00
      }
    ]
  };

  try {
    const response = await axios.post(`${API_URL}/sales`, ventaSimple, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ VENTA CREADA CON PAGO SIMPLE:');
    console.log(`   Código: ${response.data.codigoVenta}`);
    console.log(`   Total: S/ ${response.data.total}`);
    console.log(`   Forma de Pago: ${response.data.formaPago}`);
    console.log(`   Pagos registrados: ${response.data.payments?.length || 0}`);
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testPagosMultiples() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 2: PAGOS MÚLTIPLES (Nueva funcionalidad)');
  console.log('═══════════════════════════════════════════════════════\n');

  const ventaMultiple = {
    tipoComprobante: 'Boleta',
    almacenId: 'cm9r6cq840001vkhk5bfz8dxl',
    payments: [ // 🆕 Array de pagos múltiples
      {
        metodoPago: 'Efectivo',
        monto: 150.00,
        observaciones: 'Pago en efectivo'
      },
      {
        metodoPago: 'Tarjeta',
        monto: 100.00,
        referencia: 'VISA-4532',
        observaciones: 'Pago con tarjeta VISA'
      }
    ],
    items: [
      {
        productId: 'cm9r6dt3q0005vkhk01j4iwh6',
        cantidad: 1,
        precioUnitario: 211.86 // Total = 250 (211.86 + IGV 18%)
      }
    ]
  };

  try {
    const response = await axios.post(`${API_URL}/sales`, ventaMultiple, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ VENTA CREADA CON PAGOS MÚLTIPLES:');
    console.log(`   Código: ${response.data.codigoVenta}`);
    console.log(`   Total: S/ ${response.data.total.toFixed(2)}`);
    console.log(`   Forma de Pago Principal: ${response.data.formaPago}`);
    console.log(`   Cantidad de pagos: ${response.data.payments.length}`);
    console.log('');
    console.log('   DETALLE DE PAGOS:');
    response.data.payments.forEach((pago, index) => {
      console.log(`   ${index + 1}. ${pago.metodoPago}: S/ ${pago.monto.toFixed(2)}`);
      if (pago.referencia) console.log(`      Ref: ${pago.referencia}`);
      if (pago.observaciones) console.log(`      Obs: ${pago.observaciones}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testPagosMultiplesYape() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 3: YAPE + EFECTIVO (Caso real común)');
  console.log('═══════════════════════════════════════════════════════\n');

  const ventaYape = {
    tipoComprobante: 'Boleta',
    almacenId: 'cm9r6cq840001vkhk5bfz8dxl',
    payments: [
      {
        metodoPago: 'Yape',
        monto: 200.00,
        referencia: '987654321', // Número de celular o código de operación
        observaciones: 'Pago por Yape'
      },
      {
        metodoPago: 'Efectivo',
        monto: 50.00,
        observaciones: 'Complemento en efectivo'
      }
    ],
    items: [
      {
        productId: 'cm9r6dt3q0005vkhk01j4iwh6',
        cantidad: 1,
        precioUnitario: 211.86 // Total = 250
      }
    ]
  };

  try {
    const response = await axios.post(`${API_URL}/sales`, ventaYape, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ VENTA CREADA CON YAPE + EFECTIVO:');
    console.log(`   Código: ${response.data.codigoVenta}`);
    console.log(`   Total: S/ ${response.data.total.toFixed(2)}`);
    console.log('');
    console.log('   DESGLOSE DE PAGOS:');
    response.data.payments.forEach((pago, index) => {
      console.log(`   ${index + 1}. ${pago.metodoPago.padEnd(15)} S/ ${pago.monto.toFixed(2)}`);
      if (pago.referencia) console.log(`      📱 Referencia: ${pago.referencia}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

async function testValidacionMontos() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('TEST 4: VALIDACIÓN - Suma incorrecta de pagos');
  console.log('═══════════════════════════════════════════════════════\n');

  const ventaInvalida = {
    tipoComprobante: 'Boleta',
    almacenId: 'cm9r6cq840001vkhk5bfz8dxl',
    payments: [
      {
        metodoPago: 'Efectivo',
        monto: 100.00 // Total de pagos = 150, pero venta = 250
      },
      {
        metodoPago: 'Tarjeta',
        monto: 50.00
      }
    ],
    items: [
      {
        productId: 'cm9r6dt3q0005vkhk01j4iwh6',
        cantidad: 1,
        precioUnitario: 211.86 // Total = 250
      }
    ]
  };

  try {
    await axios.post(`${API_URL}/sales`, ventaInvalida, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('❌ ERROR: La validación no funcionó (esto no debería pasar)');
  } catch (error) {
    console.log('✅ VALIDACIÓN CORRECTA:');
    console.log(`   ${error.response?.data?.message || error.message}`);
    console.log('');
  }
}

async function runTests() {
  console.log('\n🧪 PRUEBAS: IMPLEMENTACIÓN DE PAGOS MÚLTIPLES\n');

  await login();
  
  await testPagoSimple();
  await new Promise(r => setTimeout(r, 1000));
  
  await testPagosMultiples();
  await new Promise(r => setTimeout(r, 1000));
  
  await testPagosMultiplesYape();
  await new Promise(r => setTimeout(r, 1000));
  
  await testValidacionMontos();

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
  console.log('═══════════════════════════════════════════════════════');
}

runTests().catch(console.error);
