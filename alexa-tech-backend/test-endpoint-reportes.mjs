/**
 * Prueba directa del endpoint de reportes de ventas
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

async function testEndpoint() {
  try {
    console.log('🧪 PROBANDO ENDPOINT /api/reportes/ventas\n');

    // 1. Obtener token de autenticación
    console.log('1️⃣  Obteniendo token de autenticación...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'Admin123!'
    });

    const token = loginResponse.data.data.token;
    console.log('   ✅ Token obtenido\n');

    // 2. Llamar al endpoint de reportes
    console.log('2️⃣  Llamando a /api/reportes/ventas...');
    
    const response = await axios.get(`${BASE_URL}/api/reportes/ventas`, {
      params: {
        fechaInicio: '2025-11-01',
        fechaFin: '2026-01-31'
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('   ✅ Respuesta recibida\n');
    console.log('📊 ESTRUCTURA DE RESPUESTA:');
    console.log(JSON.stringify(response.data, null, 2).substring(0, 2000));
    
    if (response.data.data) {
      const data = response.data.data;
      
      console.log('\n✅ DATOS RECIBIDOS:');
      console.log(`   - Resumen: ${data.resumen ? '✓' : '✗'}`);
      console.log(`   - Ventas por día: ${data.ventasPorDia?.length || 0} registros`);
      console.log(`   - Ventas por método de pago: ${data.ventasPorMetodoPago?.length || 0} registros`);
      console.log(`   - Top productos: ${data.topProductos?.length || 0} registros`);
      console.log(`   - Top clientes: ${data.topClientes?.length || 0} registros`);
      console.log(`   - Ventas por vendedor: ${data.ventasPorVendedor?.length || 0} registros`);

      if (data.resumen) {
        console.log('\n📈 RESUMEN:');
        console.log(`   Total ventas: S/. ${data.resumen.totalVentas}`);
        console.log(`   Cantidad: ${data.resumen.cantidadVentas}`);
        console.log(`   Ticket promedio: S/. ${data.resumen.ticketPromedio?.toFixed(2)}`);
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error.response?.data || error.message);
  }
}

testEndpoint();
