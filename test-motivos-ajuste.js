const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5ZjA5YzMyZS00YmFjLTQ1ZTAtOGFkYi0yZDRhNGI1MDE4YzgiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZUlkIjoiM2Y0ZWFmNjQtMjNiMy00ODg1LWEzYWQtYzA5ODY1ZTM1M2IyIiwiaWF0IjoxNzMzNzU1NTkzfQ.Qc8w5yQCy5bOxC4DCMBCnGjJMvGRqZMnSR7DxXbUWWg'; // Usa tu token

async function testMotivosAjuste() {
  console.log('\n🧪 ===== TEST: Motivos de Ajuste =====\n');

  try {
    // Test 1: Obtener todos los motivos
    console.log('📋 Test 1: GET /api/movement-reasons');
    const response1 = await axios.get(`${API_BASE_URL}/movement-reasons`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    console.log('✅ Respuesta completa:', JSON.stringify(response1.data, null, 2));
    const allMotivos = response1.data.data?.rows || response1.data.data || [];
    console.log(`✅ Total motivos encontrados: ${allMotivos.length}`);
    
    // Test 2: Filtrar solo AJUSTE activos
    console.log('\n📋 Test 2: GET /api/movement-reasons?tipo=AJUSTE&activo=true');
    const response2 = await axios.get(`${API_BASE_URL}/movement-reasons`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      params: { tipo: 'AJUSTE', activo: true }
    });
    const motivosAjuste = response2.data.data?.rows || response2.data.data || [];
    console.log(`✅ Motivos de AJUSTE activos: ${motivosAjuste.length}`);
    
    if (motivosAjuste.length > 0) {
      console.log('\n📝 Motivos disponibles:');
      motivosAjuste.forEach((m, i) => {
        console.log(`  ${i + 1}. [${m.codigo}] ${m.nombre} (${m.tipo})`);
      });
    } else {
      console.log('\n⚠️  NO HAY MOTIVOS DE AJUSTE ACTIVOS EN LA BASE DE DATOS');
      console.log('   Necesitas crear motivos de ajuste primero.');
      
      // Sugerencia de creación
      console.log('\n💡 Puedes crear motivos ejecutando:');
      console.log('   POST /api/movement-reasons');
      console.log('   Body: { tipo: "AJUSTE", codigo: "ADJ-001", nombre: "Corrección de inventario" }');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      console.log('\n⚠️  Token inválido o expirado. Actualiza el TOKEN en el script.');
    }
  }

  console.log('\n🧪 ===== FIN TEST =====\n');
}

testMotivosAjuste();
