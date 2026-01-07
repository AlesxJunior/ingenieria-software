const axios = require('axios');

async function testGetCashRegisters() {
  try {
    // Login primero
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.accessToken;
    
    // Obtener cajas registradoras
    const response = await axios.get('http://localhost:3001/api/cash-registers', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Cajas registradoras:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

testGetCashRegisters();
