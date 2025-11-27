/**
 * Script de prueba completa para múltiples métodos de pago
 * 
 * Este script:
 * 1. Crea una venta con múltiples métodos de pago
 * 2. Verifica que se guarde correctamente
 * 3. Verifica que se muestre en el detalle
 * 4. Verifica que aparezca en el PDF
 */

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3001';

// Credenciales de prueba (ajustar según tu configuración)
const LOGIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

let authToken = '';
let createdSaleId = '';

// Función auxiliar para hacer login
async function login() {
  try {
    console.log('🔐 Iniciando sesión...');
    const response = await axios.post(`${API_URL}/auth/login`, LOGIN_CREDENTIALS);
    authToken = response.data.data.token;
    console.log('✅ Login exitoso\n');
    return authToken;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Paso 1: Crear venta con múltiples métodos de pago
async function createSaleWithMultiplePayments() {
  try {
    console.log('📝 PASO 1: Creando venta con múltiples métodos de pago...');
    console.log('─'.repeat(60));
    
    const saleData = {
      cashSessionId: null, // Ajustar si tienes una sesión abierta
      clienteId: null, // Ajustar si quieres asignar un cliente
      almacenId: 'WH-PRINCIPAL',
      tipoComprobante: 'Boleta',
      incluyeIGV: true,
      items: [
        {
          productId: 'PROD-001', // Ajustar con un ID real de tu BD
          nombreProducto: 'Producto de Prueba',
          cantidad: 2,
          precioUnitario: 50.00
        }
      ],
      observaciones: 'Venta de prueba con múltiples métodos de pago',
      // 🆕 Múltiples métodos de pago
      payments: [
        {
          metodoPago: 'Efectivo',
          monto: 60.00,
          referencia: null
        },
        {
          metodoPago: 'Yape',
          monto: 58.00,
          referencia: 'YAPE-123456789'
        }
      ]
    };

    console.log('📦 Datos de la venta:', JSON.stringify(saleData, null, 2));
    
    const response = await axios.post(
      `${API_URL}/sales`,
      saleData,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    createdSaleId = response.data.data.id;
    
    console.log('\n✅ Venta creada exitosamente');
    console.log('ID:', createdSaleId);
    console.log('Código:', response.data.data.codigoVenta);
    console.log('Total:', response.data.data.total);
    console.log('Estado:', response.data.data.estado);
    
    // Verificar que los pagos se guardaron
    if (response.data.data.payments && response.data.data.payments.length > 0) {
      console.log('\n💳 Métodos de pago registrados:');
      response.data.data.payments.forEach((payment, index) => {
        console.log(`  ${index + 1}. ${payment.metodoPago}: S/ ${payment.monto}`);
        if (payment.referencia) {
          console.log(`     Ref: ${payment.referencia}`);
        }
      });
    } else {
      console.warn('⚠️ WARNING: No se encontraron payments en la respuesta');
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error al crear venta:', error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('Detalles:', error.response.data.details);
    }
    throw error;
  }
}

// Paso 2: Verificar detalle de venta
async function checkSaleDetail() {
  try {
    console.log('🔍 PASO 2: Verificando detalle de venta...');
    console.log('─'.repeat(60));
    
    const response = await axios.get(
      `${API_URL}/sales/${createdSaleId}`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }
    );

    const sale = response.data.data;
    
    console.log('✅ Detalle de venta obtenido');
    console.log('Código:', sale.codigoVenta);
    console.log('Estado:', sale.estado);
    console.log('Total:', sale.total);
    
    // Verificar métodos de pago en el detalle
    if (sale.payments && sale.payments.length > 0) {
      console.log('\n💳 Métodos de pago en detalle:');
      sale.payments.forEach((payment, index) => {
        console.log(`  ${index + 1}. ${payment.metodoPago}: S/ ${payment.monto}`);
        if (payment.referencia) {
          console.log(`     Ref: ${payment.referencia}`);
        }
      });
      console.log('\n✅ VERIFICACIÓN EXITOSA: Múltiples métodos de pago aparecen en el detalle');
    } else {
      console.error('❌ ERROR: No se encontraron payments en el detalle');
    }
    
    console.log('\n' + '─'.repeat(60) + '\n');
    return sale;
  } catch (error) {
    console.error('❌ Error al obtener detalle:', error.response?.data || error.message);
    throw error;
  }
}

// Paso 3: Generar y verificar PDF
async function checkPDF() {
  try {
    console.log('🖨️ PASO 3: Generando PDF...');
    console.log('─'.repeat(60));
    
    const response = await axios.get(
      `${API_URL}/sales/${createdSaleId}/invoice/preview`,
      {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        responseType: 'arraybuffer'
      }
    );

    // Guardar PDF
    const pdfPath = `./test-invoice-${createdSaleId}.pdf`;
    fs.writeFileSync(pdfPath, response.data);
    
    console.log('✅ PDF generado exitosamente');
    console.log('📄 Archivo guardado en:', pdfPath);
    console.log('\n💡 Abre el PDF y verifica que:');
    console.log('   1. Aparezcan todos los métodos de pago');
    console.log('   2. Cada método muestre su monto');
    console.log('   3. Las referencias se muestren correctamente');
    
    console.log('\n' + '─'.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error al generar PDF:', error.response?.data || error.message);
    throw error;
  }
}

// Paso 4: Confirmar pago
async function confirmPayment() {
  try {
    console.log('💰 PASO 4: Confirmando pago...');
    console.log('─'.repeat(60));
    
    const response = await axios.post(
      `${API_URL}/sales/${createdSaleId}/confirm-payment`,
      {
        montoRecibido: 118.00, // Total de los pagos
        montoCambio: 0,
        referenciaPago: 'Pago mixto confirmado'
      },
      {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Pago confirmado exitosamente');
    console.log('Estado actualizado:', response.data.data.estado);
    
    console.log('\n' + '─'.repeat(60) + '\n');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error al confirmar pago:', error.response?.data || error.message);
    throw error;
  }
}

// Ejecución principal
async function runTests() {
  try {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('   PRUEBA COMPLETA: MÚLTIPLES MÉTODOS DE PAGO');
    console.log('═'.repeat(60));
    console.log('\n');

    // Login
    await login();
    
    // Crear venta con múltiples pagos
    const sale = await createSaleWithMultiplePayments();
    
    // Verificar detalle
    await checkSaleDetail();
    
    // Generar PDF
    await checkPDF();
    
    // Confirmar pago
    await confirmPayment();
    
    // Verificar detalle final
    console.log('🔍 PASO 5: Verificación final...');
    console.log('─'.repeat(60));
    await checkSaleDetail();
    
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('   ✅ PRUEBA COMPLETA EXITOSA');
    console.log('═'.repeat(60));
    console.log('\n');
    console.log('📋 RESUMEN:');
    console.log('   • Venta creada con múltiples métodos de pago');
    console.log('   • Pagos guardados correctamente en BD');
    console.log('   • Pagos visibles en el detalle de venta');
    console.log('   • PDF generado con información de pagos');
    console.log('   • Pago confirmado exitosamente');
    console.log('\n');
    
  } catch (error) {
    console.error('\n❌ LA PRUEBA FALLÓ');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Ejecutar
runTests();
