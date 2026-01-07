/**
 * Test completo: Crear venta con múltiples pagos y verificar PDF
 */

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api';

async function testPDF() {
  try {
    console.log('\n🎯 TEST: Verificar múltiples métodos de pago en PDF\n');
    console.log('='.repeat(70) + '\n');

    // 1. Login
    console.log('🔐 1. Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login exitoso\n');

    // 2. Buscar una venta existente con múltiples pagos
    console.log('🔍 2. Buscando ventas con múltiples pagos...');
    const salesRes = await axios.get(`${API_URL}/sales`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const sales = salesRes.data.data;
    const saleWithMultiplePayments = sales.find(s => 
      s.payments && s.payments.length > 1
    );

    if (saleWithMultiplePayments) {
      console.log('✅ Venta encontrada:', saleWithMultiplePayments.codigoVenta);
      console.log('   Pagos:', saleWithMultiplePayments.payments.length);
      saleWithMultiplePayments.payments.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.metodoPago}: S/ ${p.monto}`);
      });
      console.log();

      // 3. Generar PDF
      console.log('🖨️ 3. Generando PDF...');
      const pdfRes = await axios.get(
        `${API_URL}/sales/${saleWithMultiplePayments.id}/invoice/preview`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'arraybuffer'
        }
      );

      const filename = `test-multiple-payments-${saleWithMultiplePayments.codigoVenta}.pdf`;
      fs.writeFileSync(filename, pdfRes.data);
      
      console.log('✅ PDF generado:', filename);
      console.log('\n📋 INSTRUCCIONES:');
      console.log('   1. Abre el archivo:', filename);
      console.log('   2. Verifica que en la sección de cliente se muestren:');
      console.log('      • Todos los métodos de pago con sus montos');
      console.log('   3. Si hay más de 1 método, verifica la sección "DETALLE DE PAGOS"');
      console.log('      • Tabla con: MÉTODO | REFERENCIA | MONTO');
      console.log();
    } else {
      console.log('⚠️ No hay ventas con múltiples pagos en el sistema');
      console.log('\n💡 Crea una venta con múltiples métodos desde el frontend:');
      console.log('   1. Ve a Realizar Venta');
      console.log('   2. Agrega productos');
      console.log('   3. Usa el modal de pago con 2 o más métodos');
      console.log('   4. Ejecuta este script nuevamente\n');
    }

    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testPDF();
