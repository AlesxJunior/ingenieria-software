const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function test() {
  try {
    // Login
    const login = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });
    
    const token = login.data.data.accessToken;
    console.log('✅ Token obtenido');
    
    // Test entidades
    const entidades = await axios.get(`${API_BASE}/entidades?tipoEntidad=Proveedor&limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n📦 Respuesta de entidades:');
    console.log(JSON.stringify(entidades.data, null, 2));
    
    // Test almacenes
    const almacenes = await axios.get(`${API_BASE}/almacenes?activo=true&limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n📦 Respuesta de almacenes:');
    console.log(JSON.stringify(almacenes.data, null, 2));
    
    // Test productos
    const productos = await axios.get(`${API_BASE}/productos?activo=true&limit=2`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('\n📦 Respuesta de productos:');
    console.log(JSON.stringify(productos.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

test();
