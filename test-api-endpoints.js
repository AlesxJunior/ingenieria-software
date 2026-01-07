/**
 * Script rápido para verificar endpoints de la API
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testEndpoints() {
  try {
    // 1. Autenticar
    console.log('🔐 Autenticando...');
    const authResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    const token = authResponse.data.data.accessToken;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Autenticado\n');

    // 2. Productos
    console.log('📦 Consultando productos...');
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('Estructura de respuesta:', JSON.stringify(productsResponse.data, null, 2));
    console.log(`Total productos: ${productsResponse.data?.data?.length || productsResponse.data?.length || 0}\n`);

    // 3. Clientes
    console.log('👥 Consultando clientes...');
    const clientsResponse = await axios.get(`${BASE_URL}/entidades`);
    console.log('Estructura de respuesta:', JSON.stringify(clientsResponse.data, null, 2));
    console.log(`Total clientes: ${clientsResponse.data?.data?.length || clientsResponse.data?.length || 0}\n`);

    // 4. Almacenes
    console.log('🏬 Consultando almacenes...');
    const warehousesResponse = await axios.get(`${BASE_URL}/warehouses`);
    console.log('Estructura de respuesta:', JSON.stringify(warehousesResponse.data, null, 2));
    console.log(`Total almacenes: ${warehousesResponse.data?.data?.length || warehousesResponse.data?.length || 0}\n`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEndpoints();
