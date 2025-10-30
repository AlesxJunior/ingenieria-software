const http = require('http');

function makeRequest(url, options = {}, data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
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

    const req = http.request(reqOptions, (res) => {
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

async function testEntidadesAPI() {
  console.log('🔐 Probando API de Entidades Comerciales...\n');

  try {
    // Paso 1: Login
    console.log('1️⃣ Haciendo login...');
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
      // Intentar con otro formato de email
      console.log('   Intentando con email alternativo...');
      const loginResponse2 = await makeRequest(
        'http://localhost:3001/api/auth/login',
        { method: 'POST' },
        {
          email: 'admin@alexatech.com',
          password: 'Admin123!@#'
        }
      );
      
      if (!loginResponse2.data.data?.accessToken) {
        console.error('❌ No se pudo obtener el token');
        console.log('Respuesta 1:', loginResponse.data);
        console.log('Respuesta 2:', loginResponse2.data);
        return;
      }
    }
    console.log('✅ Login exitoso\n');

    // Paso 2: Obtener entidades
    console.log('2️⃣ Obteniendo entidades comerciales...');
    const entidadesResponse = await makeRequest(
      'http://localhost:3001/api/entidades?page=1&limit=10',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token || loginResponse2.data.data.accessToken}`
        }
      }
    );

    if (entidadesResponse.status === 200) {
      console.log('✅ Respuesta exitosa\n');
      console.log('Success:', entidadesResponse.data.success);
      console.log('Message:', entidadesResponse.data.message);
      
      if (entidadesResponse.data.data) {
        const data = entidadesResponse.data.data;
        console.log('Total:', data.total || data.length);
        console.log('Página:', data.page || 1);
        
        const items = data.rows || data.data || data;
        if (Array.isArray(items)) {
          console.log('Items:', items.length);
          console.log('\n📋 Primeras 3 entidades:');
          items.slice(0, 3).forEach((e, i) => {
            const nombre = e.razonSocial || `${e.nombres} ${e.apellidos}`;
            console.log(`${i + 1}. [${e.tipoEntidad}] ${nombre}`);
            console.log(`   Doc: ${e.tipoDocumento} - ${e.numeroDocumento}`);
            console.log(`   📧 ${e.email}`);
          });
        }
      }
    } else {
      console.error('❌ Error en la respuesta:', entidadesResponse.status);
      console.log('Datos:', entidadesResponse.data);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testEntidadesAPI();
