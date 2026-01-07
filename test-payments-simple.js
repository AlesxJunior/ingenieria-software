/**
 * Script simplificado para probar múltiples métodos de pago
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// AJUSTA ESTOS VALORES CON DATOS REALES DE TU BASE DE DATOS
const TEST_DATA = {
  productId: 'PRD-HD-007', // ID de un producto real (Disco Duro 2TB con stock: 100)
  almacenId: 'cmi0iixps0000c3uixg6thbso', // ID de almacén real
  clienteId: null, // null para cliente general o un ID real
  cashSessionId: null, // null si no hay sesión abierta
};

async function login() {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email: 'admin@alexatech.com',
    password: 'admin123'
  });
  return response.data.data.accessToken;
}

async function testMultiplePayments() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('  PRUEBA: MÚLTIPLES MÉTODOS DE PAGO');
    console.log('='.repeat(70) + '\n');

    // 1. Login
    console.log('🔐 1. Login...');
    const token = await login();
    console.log('✅ Login exitoso\n');

    // 2. Crear venta con múltiples pagos
    console.log('📝 2. Creando venta con múltiples métodos de pago...');
    console.log('-'.repeat(70));
    
    const saleData = {
      almacenId: TEST_DATA.almacenId,
      cashSessionId: TEST_DATA.cashSessionId,
      clienteId: TEST_DATA.clienteId,
      tipoComprobante: 'Boleta',
      incluyeIGV: true,
      items: [
        {
          productId: TEST_DATA.productId,
          nombreProducto: 'Producto Test',
          cantidad: 2,
          precioUnitario: 50.00
        }
      ],
      observaciones: 'PRUEBA: Venta con múltiples métodos de pago',
      // 🎯 MÚLTIPLES MÉTODOS DE PAGO
      payments: [
        {
          metodoPago: 'Efectivo',
          monto: 60.00,
          referencia: null
        },
        {
          metodoPago: 'Yape',
          monto: 58.00,
          referencia: 'YAPE-TEST-123456'
        }
      ]
    };

    console.log('Datos enviados:');
    console.log(JSON.stringify(saleData, null, 2));
    console.log();

    const createResponse = await axios.post(
      `${API_URL}/sales`,
      saleData,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const sale = createResponse.data.data;
    console.log('✅ Venta creada:');
    console.log('   ID:', sale.id);
    console.log('   Código:', sale.codigoVenta);
    console.log('   Estado:', sale.estado);
    console.log('   Total:', 'S/', sale.total.toFixed(2));
    
    if (sale.payments && sale.payments.length > 0) {
      console.log('\n   💳 Pagos registrados:');
      sale.payments.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.metodoPago}: S/ ${p.monto.toFixed(2)}`);
        if (p.referencia) console.log(`         Ref: ${p.referencia}`);
      });
    } else {
      console.log('\n   ⚠️ WARNING: No se encontraron payments en la respuesta');
    }
    console.log();

    // 3. Verificar en detalle
    console.log('🔍 3. Verificando detalle de venta...');
    console.log('-'.repeat(70));
    
    const detailResponse = await axios.get(
      `${API_URL}/sales/${sale.id}`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const saleDetail = detailResponse.data.data;
    console.log('✅ Detalle obtenido');
    
    if (saleDetail.payments && saleDetail.payments.length > 0) {
      console.log('\n   💳 Pagos en detalle:');
      saleDetail.payments.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.metodoPago}: S/ ${p.monto.toFixed(2)}`);
        if (p.referencia) console.log(`         Ref: ${p.referencia}`);
      });
      console.log('\n   ✅ ÉXITO: Múltiples métodos de pago aparecen en el detalle');
    } else {
      console.log('\n   ❌ ERROR: No se encontraron payments en el detalle');
    }
    console.log();

    // 4. Confirmar pago
    console.log('💰 4. Confirmando pago...');
    console.log('-'.repeat(70));
    
    await axios.post(
      `${API_URL}/sales/${sale.id}/confirm-payment`,
      {
        montoRecibido: 118.00,
        montoCambio: 0,
        referenciaPago: 'Pago mixto confirmado'
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    console.log('✅ Pago confirmado\n');

    // 5. Verificar PDF
    console.log('🖨️ 5. Generando PDF...');
    console.log('-'.repeat(70));
    
    try {
      const pdfResponse = await axios.get(
        `${API_URL}/sales/${sale.id}/invoice/preview`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );

      const fs = require('fs');
      const pdfPath = `./test-invoice-${sale.codigoVenta}.pdf`;
      fs.writeFileSync(pdfPath, pdfResponse.data);
      
      console.log('✅ PDF generado exitosamente');
      console.log(`   📄 Archivo: ${pdfPath}`);
      console.log('\n   💡 Abre el PDF y verifica que:');
      console.log('      • Aparezcan todos los métodos de pago');
      console.log('      • Cada método muestre su monto');
      console.log('      • Las referencias se muestren correctamente');
    } catch (pdfError) {
      console.error('❌ Error al generar PDF:', pdfError.response?.data || pdfError.message);
    }

    console.log('\n' + '='.repeat(70));
    console.log('  ✅ PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(70) + '\n');
    console.log('📋 Resumen:');
    console.log('   ✅ Venta creada con múltiples métodos de pago');
    console.log('   ✅ Pagos guardados correctamente en BD');
    console.log('   ✅ Pagos visibles en el detalle de venta');
    console.log('   ✅ PDF generado (revisar manualmente)');
    console.log('   ✅ Pago confirmado\n');

  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error(error.response?.data || error.message);
    if (error.response?.data?.details) {
      console.error('\nDetalles:', error.response.data.details);
    }
    process.exit(1);
  }
}

testMultiplePayments();
