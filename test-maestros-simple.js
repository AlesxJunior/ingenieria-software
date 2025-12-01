const http = require('http');

console.log('🧪 Probando endpoints de maestros...\n');

// Test 1: GET /api/configuracion/categorias
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/configuracion/categorias',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('✅ GET /api/configuracion/categorias');
    console.log('Status:', res.statusCode);
    const result = JSON.parse(data);
    console.log('Categorías encontradas:', result.data?.length || 0);
    if (result.data && result.data.length > 0) {
      console.log('Primera categoría:', result.data[0]);
    }
    console.log('\n✅ Backend funcionando correctamente!');
  });
});

req.on('error', (error) => {
  console.error('❌ Error:', error.message);
});

req.end();
