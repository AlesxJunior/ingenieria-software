const BASE_URL = 'http://localhost:3001/api';

async function makeRequest(url, options = {}) {
  console.log(`🔍 Making request to: ${url}`);
  console.log(`🔍 Method: ${options.method || 'GET'}`);
  console.log(`🔍 Headers:`, options.headers);
  console.log(`🔍 Body:`, options.body);
  
  // Construir headers correctamente
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: headers,
    body: options.body
  });
  
  console.log(`🔍 Response status: ${response.status}`);
  
  const data = await response.json();
  
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  
  return data;
}

async function testPasswordChange() {
  try {
    console.log('🔐 Iniciando prueba de cambio de contraseña...');
    
    // 1. Login como admin
    console.log('1. Autenticando como admin...');
    const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@alexatech.com',
        password: 'admin123'
      })
    });
    
    const token = loginResponse.data.accessToken;
    console.log('✅ Login exitoso');
    
    // 2. Obtener lista de usuarios
    console.log('2. Obteniendo lista de usuarios...');
    const usersResponse = await makeRequest(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const vendedorUser = usersResponse.data.users.find(user => user.username === 'vendedor');
    if (!vendedorUser) {
      throw new Error('Usuario vendedor no encontrado');
    }
    
    console.log(`✅ Usuario encontrado: ${vendedorUser.username} (ID: ${vendedorUser.id})`);
    
    // 3. Cambiar contraseña
    console.log('3. Cambiando contraseña...');
    const passwordChangeResponse = await makeRequest(
      `${BASE_URL}/users/${vendedorUser.id}/change-password`,
      {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: 'NuevaPass123',
          newPassword: 'TestPassword456'
        })
      }
    );
    
    console.log('✅ Contraseña cambiada exitosamente');
    console.log('Respuesta:', passwordChangeResponse);
    
    // 4. Verificar login con nueva contraseña
    console.log('4. Verificando login con nueva contraseña...');
    const verifyLoginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        email: vendedorUser.email,
        password: 'TestPassword456'
      })
    });
    
    console.log('✅ Login con nueva contraseña exitoso');
    console.log(`Usuario: ${verifyLoginResponse.data.user.username}`);
    
    console.log('\n🎉 ¡Prueba de cambio de contraseña completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.data || error.message);
    if (error.status === 429) {
      console.log('⚠️  Rate limit alcanzado. Espera unos minutos antes de intentar nuevamente.');
    }
  }
}

testPasswordChange();