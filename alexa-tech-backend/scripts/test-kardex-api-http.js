const http = require('http');

// Función para hacer petición HTTP
function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: headers
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testKardexAPI() {
  console.log('🧪 Probando API de Kardex después del arreglo...\n');

  try {
    // Primero hacer login para obtener un token válido
    console.log('🔐 Haciendo login para obtener token...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    console.log(`Login Status: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200 || !loginResponse.body.data || !loginResponse.body.data.accessToken) {
      console.log('❌ Error en login:', JSON.stringify(loginResponse.body, null, 2));
      return;
    }
    
    const token = loginResponse.body.data.accessToken;
    console.log('✅ Login exitoso, token obtenido\n');

    // Test 1: Kardex con filtros mínimos (solo warehouseId)
    console.log('📋 Test 1: Kardex con filtros mínimos');
    const response1 = await makeRequest('/api/inventory/kardex?warehouseId=WH-PRINCIPAL&page=1&limit=10', 'GET', null, token);
    console.log(`Status: ${response1.statusCode}`);
    console.log(`Respuesta:`, JSON.stringify(response1.body, null, 2));
    
    if (response1.body && response1.body.data) {
      console.log(`✅ Encontrados ${response1.body.data.rows.length} registros de kardex`);
      console.log(`📊 Total: ${response1.body.data.total}, Páginas: ${response1.body.data.pages}`);
    } else {
      console.log('❌ No se encontraron datos en la respuesta');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Kardex con filtro de tipo específico
    console.log('📋 Test 2: Kardex con filtro de tipo ENTRY');
    const response2 = await makeRequest('/api/inventory/kardex?warehouseId=WH-PRINCIPAL&tipoMovimiento=ENTRY&page=1&limit=10', 'GET', null, token);
    console.log(`Status: ${response2.statusCode}`);
    console.log(`Respuesta:`, JSON.stringify(response2.body, null, 2));
    
    if (response2.body && response2.body.data) {
      console.log(`✅ Encontrados ${response2.body.data.rows.length} registros de tipo ENTRY`);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Kardex con filtro de tipo ADJUSTMENT
    console.log('📋 Test 3: Kardex con filtro de tipo ADJUSTMENT');
    const response3 = await makeRequest('/api/inventory/kardex?warehouseId=WH-PRINCIPAL&tipoMovimiento=ADJUSTMENT&page=1&limit=10', 'GET', null, token);
    console.log(`Status: ${response3.statusCode}`);
    console.log(`Respuesta:`, JSON.stringify(response3.body, null, 2));
    
    if (response3.body && response3.body.data) {
      console.log(`✅ Encontrados ${response3.body.data.rows.length} registros de tipo ADJUSTMENT`);
    }

  } catch (error) {
    console.error('❌ Error al probar la API:', error.message);
  }
}

// Ejecutar las pruebas
testKardexAPI();