const axios = require('axios');

async function testOpenSession() {
  try {
    // Login primero
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    const token = loginRes.data.data.accessToken;
    
    // Intentar abrir sesión
    const response = await axios.post('http://localhost:3001/api/cash-sessions/open', {
      cashRegisterId: 'cmhtupodi001io19ske5kswsg',
      montoApertura: 200.00,
      observaciones: 'Test'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Éxito:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

testOpenSession();
