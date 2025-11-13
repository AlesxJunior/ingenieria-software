/**
 * Script para verificar datos en la base de datos
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

async function authenticate() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@alexatech.com',
      password: 'admin123',
    }),
  });

  const data = await response.json();
  return data.data.accessToken;
}

async function checkData() {
  console.log('🔐 Autenticando...');
  const token = await authenticate();
  console.log('✅ Autenticado\n');

  // Verificar productos
  console.log('📦 Verificando productos...');
  const productsRes = await fetch(`${BASE_URL}/products`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const products = await productsRes.json();
  console.log(`   Total: ${products.data?.total || 0} productos`);
  if (products.data?.data && products.data.data.length > 0) {
    console.log(`   Primer producto: ${products.data.data[0].id} - ${products.data.data[0].nombre}`);
  }

  // Verificar clientes
  console.log('\n👤 Verificando clientes...');
  const clientsRes = await fetch(`${BASE_URL}/entidades?tipo=Cliente`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const clients = await clientsRes.json();
  console.log(`   Total: ${clients.data?.total || 0} clientes`);
  if (clients.data?.data && clients.data.data.length > 0) {
    console.log(`   Primer cliente: ${clients.data.data[0].id} - ${clients.data.data[0].nombre}`);
  }

  // Verificar cajas registradoras
  console.log('\n💰 Verificando cajas registradoras...');
  const cashRegRes = await fetch(`${BASE_URL}/cash-registers`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const cashRegisters = await cashRegRes.json();
  console.log(`   Total: ${cashRegisters.data?.total || 0} cajas`);
  if (cashRegisters.data?.data && cashRegisters.data.data.length > 0) {
    console.log(`   Primera caja: ${cashRegisters.data.data[0].codigo} - ${cashRegisters.data.data[0].nombre}`);
  }

  // Verificar almacenes
  console.log('\n🏬 Verificando almacenes...');
  const warehousesRes = await fetch(`${BASE_URL}/warehouses`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const warehouses = await warehousesRes.json();
  console.log(`   Total: ${warehouses.data?.total || 0} almacenes`);
  if (warehouses.data?.data && warehouses.data.data.length > 0) {
    console.log(`   Primer almacén: ${warehouses.data.data[0].codigo} - ${warehouses.data.data[0].nombre}`);
  }
}

checkData().catch(console.error);
