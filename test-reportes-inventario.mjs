/**
 * Script para probar el reporte de inventario
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

async function getReporteInventario(token) {
  const url = `${BASE_URL}/reportes/inventario`;
  console.log('🔗 URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Error ${response.status}: ${errorData}`);
  }

  const data = await response.json();
  
  console.log('\n✅ REPORTE DE INVENTARIO OBTENIDO\n');
  console.log('═'.repeat(80));
  
  // Mostrar estructura completa
  console.log('\n📊 ESTRUCTURA DE RESPUESTA:');
  console.log(JSON.stringify(data, null, 2).substring(0, 2000));
  
  console.log('\n═'.repeat(80));
  
  // Si tiene data, mostrar resumen
  if (data.data) {
    const reporte = data.data;
    console.log('\n📈 RESUMEN:');
    console.log('  Valor Total Inventario:', reporte.resumen?.valorTotalInventario || 'N/A');
    console.log('  Total Productos:', reporte.resumen?.totalProductos || 0);
    console.log('  Productos en Alerta:', reporte.resumen?.productosEnAlerta || 0);
    console.log('  Stock por Almacén (cantidad):', (reporte.stockPorAlmacen || []).length);
    console.log('  Valor por Categoría (cantidad):', (reporte.valorPorCategoria || []).length);
    
    if (reporte.stockPorAlmacen && reporte.stockPorAlmacen.length > 0) {
      console.log('\n🏭 STOCK POR ALMACÉN:');
      reporte.stockPorAlmacen.forEach((alm, idx) => {
        console.log(`  ${idx + 1}. ${alm.nombreAlmacen || alm.almacen}`);
        console.log(`     Cantidad: ${alm.cantidadProductos || alm._sum?.quantity || 0}`);
        console.log(`     Valor: S/ ${(alm.valorInventario || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
      });
    }
    
    if (reporte.valorPorCategoria && reporte.valorPorCategoria.length > 0) {
      console.log('\n📦 VALOR POR CATEGORÍA (Top 5):');
      reporte.valorPorCategoria.slice(0, 5).forEach((cat, idx) => {
        console.log(`  ${idx + 1}. ${cat.categoria}`);
        console.log(`     Productos: ${cat.cantidadProductos || 0}`);
        console.log(`     Valor Total: S/ ${(cat.valorTotal || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
        console.log(`     Porcentaje: ${(cat.porcentaje || 0).toFixed(2)}%`);
      });
    }
  }
  
  return data;
}

async function main() {
  try {
    console.log('🚀 Iniciando test de reportes de inventario\n');
    
    const token = await login();
    console.log('✅ Login exitoso\n');
    
    const reporte = await getReporteInventario(token);
    
    console.log('\n✨ Test finalizado\n');
    
  } catch (error) {
    console.error('\n💥 Error en el test:', error.message);
    process.exit(1);
  }
}

main();
