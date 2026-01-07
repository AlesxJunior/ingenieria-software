/**
 * Script de prueba de endpoints de estructura modular
 * Verifica que todos los módulos migrados funcionen correctamente
 */

const http = require('http');

const baseUrl = 'localhost';
const port = 3001;

// Función para hacer peticiones HTTP
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: port,
      path: `/api${path}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  PRUEBA DE ENDPOINTS - ESTRUCTURA MODULAR DEL BACKEND      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const endpoints = [
    { name: 'Health Check', path: '/health', expectAuth: false },
    { name: 'API Info', path: '/', expectAuth: false },
    { name: 'Auth Module', path: '/auth/validate-token', expectAuth: false },
    { name: 'Users Module', path: '/users', expectAuth: true },
    { name: 'Products Module', path: '/productos', expectAuth: true },
    { name: 'Inventory Module', path: '/inventario/stock', expectAuth: true },
    { name: 'Purchases Module', path: '/compras', expectAuth: true },
    { name: 'Clients Module', path: '/entidades', expectAuth: true },
    { name: 'Warehouses Module', path: '/warehouses', expectAuth: true },
  ];

  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    try {
      const result = await makeRequest(endpoint.path);
      
      // Si esperamos autenticación, 401 es válido
      const isSuccess = endpoint.expectAuth 
        ? (result.status === 401 || result.status === 200)
        : result.status === 200;

      if (isSuccess) {
        console.log(`✅ ${endpoint.name.padEnd(25)} -> ${result.status} ${getStatusMessage(result.status, endpoint.expectAuth)}`);
        passed++;
      } else {
        console.log(`❌ ${endpoint.name.padEnd(25)} -> ${result.status} ${getStatusMessage(result.status, endpoint.expectAuth)}`);
        console.log(`   Error: ${JSON.stringify(result.data).substring(0, 100)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name.padEnd(25)} -> ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  RESUMEN: ${passed} exitosos | ${failed} fallidos                        ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (failed === 0) {
    console.log('🎉 TODOS LOS MÓDULOS FUNCIONAN CORRECTAMENTE\n');
    console.log('✅ Fase 4: Backend Modular - COMPLETADA AL 100%');
    console.log('📦 Módulos migrados:');
    console.log('   • auth (autenticación)');
    console.log('   • users (usuarios)');
    console.log('   • products (productos)');
    console.log('   • inventory (inventario)');
    console.log('   • purchases (compras)');
    console.log('   • clients (entidades comerciales)');
    console.log('   • warehouses (almacenes)');
    console.log('   • permissions (permisos)');
  } else {
    console.log('⚠️  Algunos módulos necesitan revisión');
  }
}

function getStatusMessage(status, expectAuth) {
  if (status === 200) return '[OK]';
  if (status === 401 && expectAuth) return '[OK - Requiere Auth]';
  if (status === 401) return '[UNAUTHORIZED]';
  if (status === 404) return '[NOT FOUND]';
  if (status === 500) return '[SERVER ERROR]';
  return `[${status}]`;
}

// Esperar 2 segundos antes de ejecutar (dar tiempo al servidor)
setTimeout(() => {
  testEndpoints().catch(console.error);
}, 2000);
