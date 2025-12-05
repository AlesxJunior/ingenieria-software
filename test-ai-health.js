// Test del endpoint de salud del módulo de IA
// Se debe ejecutar con el backend corriendo

const http = require('http');

// Primero necesitamos obtener un token válido
// Para simplificar, vamos a probar solo la estructura de la ruta

const testAIHealth = () => {
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/ai/health',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // Necesitarás agregar un token de autenticación válido aquí
      // 'Authorization': 'Bearer TU_TOKEN_AQUI'
    }
  };

  console.log('🧪 Testeando endpoint: GET http://localhost:3001/api/ai/health\n');

  const req = http.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📋 Headers:`, JSON.stringify(res.headers, null, 2));
    
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log('\n📦 Response Body:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (res.statusCode === 401) {
          console.log('\n⚠️  Endpoint requiere autenticación (esperado)');
          console.log('✅ La ruta /api/ai/health está correctamente registrada');
        } else if (res.statusCode === 200) {
          console.log('\n✅ Endpoint funcionando correctamente');
        }
      } catch (e) {
        console.log(data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error en la solicitud:', error.message);
    console.log('\n⚠️  Asegúrate de que el backend esté corriendo en el puerto 3001');
  });

  req.end();
};

// Esperar 2 segundos para que el backend termine de iniciar
console.log('⏳ Esperando que el backend inicie...\n');
setTimeout(testAIHealth, 2000);
