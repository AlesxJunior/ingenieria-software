/**
 * Test: Nueva lógica de pagos
 * - Verifica que SIEMPRE se creen registros SalePayment
 * - Prueba con 1 método de pago
 * - Prueba con múltiples métodos de pago
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function testSinglePayment(token) {
  console.log('\n📝 TEST 1: Venta con UN SOLO método de pago');
  console.log('=' .repeat(60));
  
  try {
    const saleData = {
      almacenId: '1', // Ajustar según tu BD
      tipoComprobante: 'Boleta',
      // NO enviar formaPago - debe usar "Efectivo" por defecto
      items: [
        {
          productId: '1', // Ajustar según tu BD
          cantidad: 1,
          precioUnitario: 50
        }
      ]
    };

    console.log('📤 Enviando venta SIN formaPago (debe crear SalePayment con Efectivo)...');
    
    const response = await axios.post(`${BASE_URL}/sales`, saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Venta creada:', {
      id: response.data.id,
      codigoVenta: response.data.codigoVenta,
      formaPago: response.data.formaPago,
      total: response.data.total,
      payments: response.data.payments
    });

    // Verificar que se creó el SalePayment
    if (!response.data.payments || response.data.payments.length === 0) {
      console.error('❌ ERROR: No se crearon registros SalePayment');
      return null;
    }

    console.log('✅ SalePayment creado correctamente:', response.data.payments);
    return response.data.id;

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function testMultiplePayments(token) {
  console.log('\n📝 TEST 2: Venta con MÚLTIPLES métodos de pago');
  console.log('=' .repeat(60));
  
  try {
    const saleData = {
      almacenId: '1', // Ajustar según tu BD
      tipoComprobante: 'Boleta',
      items: [
        {
          productId: '1', // Ajustar según tu BD
          cantidad: 1,
          precioUnitario: 100
        }
      ],
      payments: [
        {
          metodoPago: 'Efectivo',
          monto: 60,
          referencia: null
        },
        {
          metodoPago: 'Yape',
          monto: 40,
          referencia: '123456789'
        }
      ]
    };

    console.log('📤 Enviando venta con múltiples pagos...');
    
    const response = await axios.post(`${BASE_URL}/sales`, saleData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Venta creada:', {
      id: response.data.id,
      codigoVenta: response.data.codigoVenta,
      formaPago: response.data.formaPago,
      total: response.data.total,
      payments: response.data.payments
    });

    // Verificar que se crearon MÚLTIPLES SalePayment
    if (!response.data.payments || response.data.payments.length !== 2) {
      console.error('❌ ERROR: No se crearon 2 registros SalePayment');
      return null;
    }

    console.log('✅ SalePayments creados correctamente:', response.data.payments);
    return response.data.id;

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return null;
  }
}

async function verifyPDF(token, saleId) {
  console.log('\n📄 Verificando PDF para venta:', saleId);
  console.log('=' .repeat(60));
  
  try {
    const response = await axios.get(`${BASE_URL}/sales/${saleId}/invoice`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'arraybuffer'
    });

    console.log('✅ PDF generado correctamente');
    console.log('📊 Tamaño del PDF:', response.data.length, 'bytes');
    
    return true;
  } catch (error) {
    console.error('❌ Error generando PDF:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 INICIANDO TESTS DE NUEVA LÓGICA DE PAGOS');
  console.log('=' .repeat(60));
  
  try {
    // Login
    console.log('🔐 Autenticando...');
    const token = await login();
    console.log('✅ Autenticado correctamente');

    // Test 1: Un solo pago
    const saleId1 = await testSinglePayment(token);
    if (saleId1) {
      await verifyPDF(token, saleId1);
    }

    // Test 2: Múltiples pagos
    const saleId2 = await testMultiplePayments(token);
    if (saleId2) {
      await verifyPDF(token, saleId2);
    }

    console.log('\n✅ TESTS COMPLETADOS');
    console.log('=' .repeat(60));
    console.log('\n📋 RESUMEN:');
    console.log('- Venta con 1 pago:', saleId1 ? '✅' : '❌');
    console.log('- Venta con múltiples pagos:', saleId2 ? '✅' : '❌');
    
  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error);
  }
}

// Ejecutar tests
runTests();
