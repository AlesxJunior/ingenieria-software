/**
 * Script para comparar alertas entre reporte de inventario y página de alertas
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';
const CREDENTIALS = {
  email: 'admin@alexatech.com',
  password: 'admin123'
};

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS)
  });
  const data = await response.json();
  return data.data?.accessToken || data.accessToken || data.access_token;
}

async function getAlertasReporte(token) {
  const response = await fetch(`${BASE_URL}/reportes/inventario`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data?.productosEnAlerta || [];
}

async function getAlertasPagina(token) {
  const response = await fetch(`${BASE_URL}/inventory/alertas`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) {
    console.log('  ⚠️  Response status:', response.status);
    const text = await response.text();
    console.log('  Error:', text.substring(0, 200));
    return [];
  }
  
  const data = await response.json();
  console.log('  Estructura:', Object.keys(data).join(', '));
  const alerts = data.data?.rows || data.data || data.alerts || data;
  return Array.isArray(alerts) ? alerts : [];
}

async function getWarehouses(token) {
  const response = await fetch(`${BASE_URL}/warehouses`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  const warehouses = data.data || data.warehouses || data;
  return Array.isArray(warehouses) ? warehouses : [];
}

async function main() {
  try {
    const token = await login();
    console.log('✅ Login exitoso\n');
    
    // 1. Obtener almacenes
    console.log('🏭 ALMACENES DISPONIBLES:');
    const warehouses = await getWarehouses(token);
    console.log(`Total: ${warehouses.length}`);
    warehouses.forEach(w => {
      console.log(`  - ${w.nombre} (${w.id})`);
    });
    
    // 2. Obtener alertas del reporte
    console.log('\n📊 ALERTAS DEL REPORTE DE INVENTARIO:');
    const alertasReporte = await getAlertasReporte(token);
    console.log(`Total: ${alertasReporte.length}`);
    alertasReporte.forEach((a, idx) => {
      console.log(`  ${idx + 1}. ${a.nombreProducto}`);
      console.log(`     Stock Actual: ${a.stockActual} | Stock Mínimo: ${a.stockMinimo}`);
      console.log(`     Almacén: ${a.nombreAlmacen || a.almacenId}`);
    });
    
    // 3. Obtener alertas de la página
    console.log('\n🚨 ALERTAS DE LA PÁGINA DE STOCK (/inventory/alertas):');
    const alertasPagina = await getAlertasPagina(token);
    console.log(`Total: ${alertasPagina.length}`);
    if (alertasPagina.length > 0) {
      console.log('  Primera alerta completa:', JSON.stringify(alertasPagina[0], null, 2));
    }
    alertasPagina.forEach((a, idx) => {
      console.log(`  ${idx + 1}. ${a.nombre || a.product?.nombre || a.productName || 'N/A'}`);
      console.log(`     Stock Actual: ${a.cantidad || a.stockActual || a.currentStock} | Stock Mínimo: ${a.stockMinimo || a.minStock}`);
      console.log(`     Almacén: ${a.almacen || a.warehouse?.nombre || a.warehouseName || 'N/A'}`);
      console.log(`     Tipo: ${a.tipoAlerta || a.alertType || 'N/A'}`);
    });
    
    // 4. Análisis de diferencia
    console.log('\n🔍 ANÁLISIS:');
    if (alertasReporte.length !== alertasPagina.length) {
      console.log(`⚠️  DISCREPANCIA: Reporte tiene ${alertasReporte.length} alertas, Página tiene ${alertasPagina.length}`);
      console.log('\nPosibles causas:');
      console.log('  - El reporte agrupa stock por producto total, la página por almacén');
      console.log('  - Los criterios de alerta pueden ser diferentes');
      console.log('  - Filtros diferentes aplicados en cada endpoint');
    } else {
      console.log('✅ Ambos endpoints reportan la misma cantidad de alertas');
    }
    
    console.log('\n✨ Análisis completado\n');
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    process.exit(1);
  }
}

main();
