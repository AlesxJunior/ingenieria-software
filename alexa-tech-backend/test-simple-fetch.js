const BASE_URL = 'http://localhost:3001/api';

async function testPasswordChange() {
  try {
    // 1. Login para obtener token
    console.log('1. Haciendo login...');
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@alexatech.com',
        password: 'admin123'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.accessToken;
    console.log('✅ Login exitoso, token obtenido');
    
    // 2. Cambiar contraseña
    console.log('2. Cambiando contraseña...');
    const passwordResponse = await fetch(`${BASE_URL}/users/cmg8lsn6z0001o1twm5v21h3t/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        currentPassword: 'TestPassword456',
        newPassword: 'NuevaPass123'
      })
    });
    
    console.log('Response status:', passwordResponse.status);
    const passwordData = await passwordResponse.json();
    console.log('Response data:', passwordData);
    
    if (passwordResponse.ok) {
      console.log('✅ Contraseña cambiada exitosamente');
    } else {
      console.log('❌ Error al cambiar contraseña:', passwordData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.data) {
      console.error('Error data:', error.data);
    }
  }
}

testPasswordChange();