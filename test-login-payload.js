/**
 * Test de payload de login
 * Verificar qué se envía al backend
 */

const axios = require('axios');

async function testLogin() {
  const payload = {
    email: 'admin@alexa.com',
    password: 'admin123',
  };

  console.log('📤 Payload a enviar:', payload);
  console.log('📤 Payload serializado:', JSON.stringify(payload));

  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Login exitoso:', response.data);
  } catch (error) {
    console.error('❌ Error en login:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
