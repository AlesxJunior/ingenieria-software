const https = require('https');
const http = require('http');

function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(reqOptions, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testInventoryAPI() {
  console.log('🔐 Probando API de Inventario con autenticación...\n');

  try {
    // Paso 1: Login para obtener token
    console.log('1️⃣ Intentando login...');
    const loginResponse = await makeRequest(
      'http://localhost:3001/api/auth/login',
      { method: 'POST' },
      {
        correo: 'admin@alexatech.com',
        password: 'Admin123!@#'
      }
    );

    const token = loginResponse.data.data?.accessToken;
    if (!token) {
      console.error('❌ No se pudo obtener el token');
      console.log('Respuesta:', loginResponse.data);
      return;
    }
    console.log('✅ Login exitoso, token obtenido\n');

    // Paso 2: Llamar al endpoint de stock
    console.log('2️⃣ Llamando a GET /api/inventario/stock...');
    const stockResponse = await makeRequest(
      'http://localhost:3001/api/inventario/stock?almacenId=WH-PRINCIPAL&page=1&limit=10',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✅ Respuesta recibida:\n');
    console.log('Success:', stockResponse.data.success);
    console.log('Message:', stockResponse.data.message);
    console.log('Total items:', stockResponse.data.data.total);
    console.log('Page:', stockResponse.data.data.page);
    console.log('Limit:', stockResponse.data.data.limit);
    console.log('Items:', stockResponse.data.data.rows.length);
    console.log('\n📦 Primeros 3 items:');
    stockResponse.data.data.rows.slice(0, 3).forEach((item, i) => {
      console.log(`${i + 1}. ${item.nombre} - ${item.almacen} - Cantidad: ${item.cantidad}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testInventoryAPI();
