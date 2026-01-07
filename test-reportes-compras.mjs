/**
 * Test del endpoint de reportes de compras
 */

async function testReporteCompras() {
  try {
    const BASE_URL = 'http://localhost:3001/api';
    
    console.log('🧪 TEST: Reporte de Compras\n');
    
    // 1. Login
    console.log('1️⃣  Login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@alexatech.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data?.accessToken;
    if (!token) {
      throw new Error('No se recibió token');
    }
    console.log('   ✅ Token obtenido\n');

    // 2. Obtener reporte de compras
    console.log('2️⃣  Obteniendo reporte de compras...');
    const reporteResponse = await fetch(
      `${BASE_URL}/reportes/compras?fechaInicio=2025-11-01&fechaFin=2025-12-31`,
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
    console.log('3️⃣  Validando datos...');
    const { data } = reporteData;
    
    if (data) {
      console.log(`   ✓ resumen: ${data.resumen ? 'presente' : 'ausente'}`);
      console.log(`   ✓ comprasPorDia: ${data.comprasPorDia?.length || 0} registros`);
      console.log(`   ✓ comprasPorProveedor: ${data.comprasPorProveedor?.length || 0} registros`);
      console.log(`   ✓ topProductosComprados: ${data.topProductosComprados?.length || 0} registros`);
      console.log(`   ✓ comprasPorAlmacen: ${data.comprasPorAlmacen?.length || 0} registros`);
      console.log(`   ✓ comprasPorEstado: ${data.comprasPorEstado?.length || 0} registros`);
      
      // Mostrar resumen
      if (data.resumen) {
        console.log('\n📊 RESUMEN DE COMPRAS:');
        console.log(`   Total: S/. ${data.resumen.totalCompras.toFixed(2)}`);
        console.log(`   Cantidad: ${data.resumen.cantidadCompras}`);
        console.log(`   Promedio: S/. ${data.resumen.compraPromedio.toFixed(2)}`);
      }

      // Mostrar proveedores
      if (data.comprasPorProveedor?.length > 0) {
        console.log('\n🏢 TOP PROVEEDORES:');
        data.comprasPorProveedor.slice(0, 5).forEach((p, idx) => {
          console.log(`   ${idx + 1}. ${p.nombreProveedor}`);
          console.log(`      ${p.cantidadCompras} compras - S/. ${p.totalCompras.toFixed(2)} (${p.porcentaje.toFixed(1)}%)`);
        });
      }

      // Mostrar productos
      if (data.topProductosComprados?.length > 0) {
        console.log('\n📦 TOP PRODUCTOS COMPRADOS:');
        data.topProductosComprados.slice(0, 5).forEach((p, idx) => {
          console.log(`   ${idx + 1}. ${p.nombreProducto}`);
          console.log(`      Cantidad: ${p.cantidadComprada} | Total: S/. ${p.totalComprado.toFixed(2)}`);
        });
      }
    }

    console.log('\n✅ TEST COMPLETADO EXITOSAMENTE');
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
  }
}

testReporteCompras();
