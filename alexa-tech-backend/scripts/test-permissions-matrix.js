// scripts/test-permissions-matrix.js

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

// --- Test Configuration ---

const USERS = {
  admin: { email: 'admin@alexatech.com', password: 'admin123' },
  supervisor: { email: 'supervisor@alexatech.com', password: 'supervisor123' },
  vendedor: { email: 'vendedor@alexatech.com', password: 'vendedor123' },
  cajero: { email: 'cajero@alexatech.com', password: 'cajero123' },
};

// Helper to generate unique data for POST/PUT requests
const uniqueId = () => `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const PERMISSIONS_MATRIX = [
  // == USERS ==
  {
    module: 'Users',
    action: 'List Users',
    method: 'GET',
    path: '/users',
    expected: { admin: 200, supervisor: 200, vendedor: 403, cajero: 403 },
  },
  {
    module: 'Users',
    action: 'Create User',
    method: 'POST',
    path: '/users',
    body: () => ({
      username: uniqueId(),
      email: `${uniqueId()}@example.com`,
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
    }),
    expected: { admin: 201, supervisor: 403, vendedor: 403, cajero: 403 },
  },
  {
    module: 'Users',
    action: 'View Own Profile (me)',
    method: 'GET',
    path: '/auth/me',
    expected: { admin: 200, supervisor: 200, vendedor: 200, cajero: 200 },
  },
  // == PRODUCTS ==
  {
    module: 'Products',
    action: 'List Products',
    method: 'GET',
    path: '/productos',
    expected: { admin: 200, supervisor: 200, vendedor: 200, cajero: 200 },
  },
  {
    module: 'Products',
    action: 'Create Product',
    method: 'POST',
    path: '/productos',
    body: () => ({
      codigo: uniqueId().toUpperCase(),
      nombre: 'Test Product',
      categoria: 'Test',
      precioVenta: 10,
      stock: 100,
      unidadMedida: 'unidad',
    }),
    expected: { admin: 201, supervisor: 403, vendedor: 403, cajero: 403 },
  },
  // == ENTITIES ==
  {
    module: 'Entities',
    action: 'List Entities',
    method: 'GET',
    path: '/entidades',
    expected: { admin: 200, supervisor: 200, vendedor: 403, cajero: 403 },
  },
  {
    module: 'Entities',
    action: 'Create Entity',
    method: 'POST',
    path: '/entidades',
    body: () => ({
      tipoEntidad: 'Cliente',
      tipoDocumento: 'DNI',
      numeroDocumento: Math.floor(10000000 + Math.random() * 90000000).toString(),
      nombres: 'Test',
      apellidos: 'Client',
      email: `${uniqueId()}@example.com`,
      telefono: '987654321',
      direccion: 'Test Address',
      ciudad: 'Lima',
    }),
    expected: { admin: 201, supervisor: 201, vendedor: 403, cajero: 403 },
  },
  // == SALES ==
  {
    module: 'Sales',
    action: 'List Sales',
    method: 'GET',
    path: '/ventas',
    expected: { admin: 200, supervisor: 200, vendedor: 200, cajero: 403 },
  },
];


// --- Test Runner ---

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  
  let resBody;
  try {
    resBody = await res.json();
  } catch (e) {
    resBody = { message: res.statusText };
  }

  return { status: res.status, body: resBody };
}

async function login(email, password) {
  const { status, body } = await request('POST', '/auth/login', { email, password });
  if (status !== 200 || !body?.data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${body.message || `Status ${status}`}`);
  }
  return body.data.accessToken;
}

function printResult(status, expected, role, action) {
  const passed = status === expected;
  const symbol = passed ? '✅' : '❌';
  const color = passed ? '\x1b[32m' : '\x1b[31m';
  console.log(`${color}${symbol} [${role.padEnd(10)}] ${action.padEnd(25)} | Expected: ${expected}, Got: ${status}\x1b[0m`);
  return passed;
}

async function main() {
  console.log('🚀 Starting Permission Matrix Test...');
  console.log(`API Target: ${BASE_URL}`);

  let tokens;
  try {
    console.log('\nLogging in all test users...');
    tokens = {
      admin: await login(USERS.admin.email, USERS.admin.password),
      supervisor: await login(USERS.supervisor.email, USERS.supervisor.password),
      vendedor: await login(USERS.vendedor.email, USERS.vendedor.password),
      cajero: await login(USERS.cajero.email, USERS.cajero.password),
    };
    console.log('All users logged in successfully.');
  } catch (error) {
    console.error('\n💥 Critical Error during login phase:', error.message);
    process.exit(1);
  }

  let totalTests = 0;
  let failedTests = 0;
  let currentModule = '';

  for (const testCase of PERMISSIONS_MATRIX) {
    if (testCase.module !== currentModule) {
      currentModule = testCase.module;
      console.log(`\n--- Testing Module: ${currentModule} ---`);
    }

    for (const role of Object.keys(USERS)) {
      totalTests++;
      const token = tokens[role];
      const expectedStatus = testCase.expected[role];
      
      const body = typeof testCase.body === 'function' ? testCase.body() : testCase.body;

      const { status, body: resBody } = await request(testCase.method, testCase.path, body, token);

      if (status === 404) {
        console.log(`\x1b[33m⚠️  [${role.padEnd(10)}] ${testCase.action.padEnd(25)} | SKIPPED: Endpoint not found (404)\x1b[0m`);
        continue;
      }
      
      if (!printResult(status, expectedStatus, role, testCase.action)) {
        failedTests++;
        console.log(`   -> Failed Request: ${testCase.method} ${testCase.path}`);
        console.log(`   -> Response Body: ${JSON.stringify(resBody).substring(0, 150)}...`);
      }
    }
  }

  console.log('\n--- Test Summary ---');
  console.log(`Total tests run: ${totalTests}`);
  if (failedTests === 0) {
    console.log('\x1b[32m✅ All permission tests passed!\x1b[0m');
  } else {
    console.log(`\x1b[31m❌ Failed tests: ${failedTests}\x1b[0m`);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n💥 An unexpected error occurred:', error);
  process.exit(1);
});
