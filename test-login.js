const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    console.log('✅ Respuesta completa:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testLogin();
