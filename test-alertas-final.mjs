/**
 * Test del endpoint de reporte de inventario
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@alexatech.com', password: 'admin123' })
  });
  const data = await response.json();
  return data.data?.accessToken || data.accessToken;
}

async function testReporte(token) {
  const response = await fetch(`${BASE_URL}/reportes/inventario`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  
  console.log('\n📊 REPORTE DE INVENTARIO:');
  console.log(`Productos en Alerta: ${data.data.resumen.productosEnAlerta}`);
  console.log(`\nDetalle de alertas (${data.data.productosEnAlerta.length}):`);
  data.data.productosEnAlerta.forEach((a, idx) => {
    console.log(`  ${idx + 1}. ${a.nombreProducto}`);
    console.log(`     Stock: ${a.stockActual} | Mínimo: ${a.stockMinimo} | Tipo: ${a.tipoAlerta || 'N/A'}`);
    console.log(`     Almacén: ${a.nombreAlmacen} (${a.almacenId})`);
  });
}

async function testPagina(token) {
  const response = await fetch(`${BASE_URL}/inventory/alertas`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  const alertas = data.data.rows;
  
  console.log('\n🚨 PÁGINA DE ALERTAS:');
  console.log(`Total: ${alertas.length}`);
  alertas.forEach((a, idx) => {
    console.log(`  ${idx + 1}. ${a.nombre}`);
    console.log(`     Stock: ${a.cantidad} | Mínimo: ${a.stockMinimo} | Tipo: ${a.tipoAlerta}`);
    console.log(`     Almacén: ${a.almacen} | ProductId: ${a.productId}`);
  });
}

async function main() {
  const token = await login();
  await testReporte(token);
  await testPagina(token);
}

main();
