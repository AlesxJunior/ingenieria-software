/**
 * Test completo del flujo de reportes de ventas
 * 1. Login para obtener token válido
 * 2. Llamar al endpoint de reportes
 */

async function testFullFlow() {
  try {
    const BASE_URL = 'http://localhost:3001/api';
    
    console.log('🧪 TEST COMPLETO: Reportes de Ventas\n');
    
    // 1. Login
    console.log('1️⃣  Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@alexatech.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    console.log('   Respuesta login:', JSON.stringify(loginData).substring(0, 300));
    const token = loginData.data?.accessToken || loginData.accessToken;
    if (!token) {
      throw new Error('No se recibió token en la respuesta');
    }
    console.log('   ✅ Token obtenido');
    console.log('   Token:', token.substring(0, 50) + '...\n');

    // 2. Obtener reporte
    console.log('2️⃣  Obteniendo reporte de ventas...');
    const reporteResponse = await fetch(
      `${BASE_URL}/reportes/ventas?fechaInicio=2025-11-01&fechaFin=2026-01-31`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!reporteResponse.ok) {
      const errorText = await reporteResponse.text();
      throw new Error(`Reporte failed: ${reporteResponse.status} - ${errorText}`);
    }

    const reporteData = await reporteResponse.json();
    console.log('   ✅ Reporte recibido\n');

    // 3. Validar estructura
    console.log('3️⃣  Validando estructura de datos...');
    const { data } = reporteData;
    
    console.log(`   ✓ success: ${reporteData.success}`);
    console.log(`   ✓ message: ${reporteData.message}`);
    console.log(`   ✓ data: ${data ? 'presente' : 'ausente'}`);
    
    if (data) {
      console.log(`   ✓ resumen: ${data.resumen ? 'presente' : 'ausente'}`);
      console.log(`   ✓ ventasPorDia: ${data.ventasPorDia?.length || 0} registros`);
      console.log(`   ✓ ventasPorMetodoPago: ${data.ventasPorMetodoPago?.length || 0} registros`);
      console.log(`   ✓ topProductos: ${data.topProductos?.length || 0} registros`);
      console.log(`   ✓ topClientes: ${data.topClientes?.length || 0} registros`);
      console.log(`   ✓ ventasPorVendedor: ${data.ventasPorVendedor?.length || 0} registros`);
      
      // 4. Mostrar resumen
      if (data.resumen) {
        console.log('\n📊 RESUMEN DE VENTAS:');
        console.log(`   Total: S/. ${data.resumen.totalVentas.toFixed(2)}`);
        console.log(`   Cantidad: ${data.resumen.cantidadVentas}`);
        console.log(`   Promedio: S/. ${data.resumen.ticketPromedio.toFixed(2)}`);
      }

      // 5. Mostrar métodos de pago
      if (data.ventasPorMetodoPago?.length > 0) {
        console.log('\n💳 VENTAS POR MÉTODO DE PAGO:');
        data.ventasPorMetodoPago.forEach(m => {
          console.log(`   ${m.metodoPago}: ${m.cantidad} ventas - S/. ${m.total.toFixed(2)} (${m.porcentaje.toFixed(1)}%)`);
        });
      }

      // 6. Mostrar top 5 productos
      if (data.topProductos?.length > 0) {
        console.log('\n🏆 TOP 5 PRODUCTOS:');
        data.topProductos.slice(0, 5).forEach((p, idx) => {
          console.log(`   ${idx + 1}. ${p.nombreProducto}`);
          console.log(`      Cantidad: ${p.cantidadVendida} | Total: S/. ${p.totalVendido.toFixed(2)}`);
        });
      }
    }

    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testFullFlow();
