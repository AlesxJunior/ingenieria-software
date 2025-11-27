/**
 * Script para obtener datos de prueba de la base de datos
 */

const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function login() {
  try {
    console.log('🔐 Intentando login con admin@alexatech.com...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    console.log('Respuesta de login:', JSON.stringify(response.data, null, 2));
    const token = response.data.accessToken || response.data.data?.accessToken || response.data.data?.token;
    if (!token) {
      throw new Error('No se pudo obtener el token');
    }
    return token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function getData() {
  try {
    const token = await login();
    console.log('✅ Login exitoso\n');

    // Obtener productos
    console.log('📦 Obteniendo productos...');
    const productsRes = await axios.get(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = productsRes.data.data;
    
    if (products.length > 0) {
      console.log(`✅ Productos encontrados: ${products.length}`);
      console.log('   Primer producto:', {
        id: products[0].id,
        name: products[0].productName,
        code: products[0].productCode,
        price: products[0].price,
        stock: products[0].currentStock
      });
    }

    // Obtener almacenes
    console.log('\n🏪 Obteniendo almacenes...');
    const warehousesRes = await axios.get(`${API_URL}/warehouses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const warehouses = warehousesRes.data.data;
    
    if (warehouses.length > 0) {
      console.log(`✅ Almacenes encontrados: ${warehouses.length}`);
      console.log('   Primer almacén:', {
        id: warehouses[0].id,
        name: warehouses[0].nombre,
        code: warehouses[0].codigo
      });
    }

    // Obtener clientes
    console.log('\n👥 Obteniendo clientes...');
    const clientsRes = await axios.get(`${API_URL}/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const clients = clientsRes.data.data;
    
    if (clients.length > 0) {
      console.log(`✅ Clientes encontrados: ${clients.length}`);
      console.log('   Primer cliente:', {
        id: clients[0].id,
        name: clients[0].razonSocial || `${clients[0].nombres} ${clients[0].apellidos}`,
        document: clients[0].numeroDocumento
      });
    }

    // Obtener sesiones de caja
    console.log('\n💰 Obteniendo sesiones de caja...');
    const cashSessionsRes = await axios.get(`${API_URL}/cash-sessions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const cashSessions = cashSessionsRes.data.data;
    
    const activeSessions = cashSessions.filter(s => s.estado === 'Abierta');
    console.log(`✅ Sesiones de caja encontradas: ${cashSessions.length}`);
    console.log(`   Sesiones activas: ${activeSessions.length}`);
    
    if (activeSessions.length > 0) {
      console.log('   Primera sesión activa:', {
        id: activeSessions[0].id,
        user: activeSessions[0].usuario?.firstName,
        opened: activeSessions[0].fechaApertura
      });
    }

    console.log('\n📋 DATOS PARA EL SCRIPT DE PRUEBA:');
    console.log('───────────────────────────────────');
    console.log('productId:', products[0]?.id || 'NO_DISPONIBLE');
    console.log('almacenId:', warehouses[0]?.id || 'NO_DISPONIBLE');
    console.log('clienteId:', clients[0]?.id || 'null');
    console.log('cashSessionId:', activeSessions[0]?.id || 'null');
    console.log('───────────────────────────────────');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

getData();
