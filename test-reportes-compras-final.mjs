/**
 * Script para probar el reporte de compras corregido
 * con el modelo PurchaseReceipt
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';
const CREDENTIALS = {
  email: 'admin@alexatech.com',
  password: 'admin123'
};

async function login() {
  try {
    console.log('🔐 Intentando login...');
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Login falló: ${data.message || response.statusText}`);
    }

    console.log('✅ Login exitoso:', data.user?.email);
    return data.data?.accessToken || data.accessToken || data.access_token;
  } catch (error) {
    console.error('❌ Error en login:', error.message);
    throw error;
  }
}

async function getReporteCompras(token) {
  try {
    console.log('\n📊 Obteniendo reporte de compras...');
    
    // Usar periodo de diciembre 2025 (donde están las recepciones)
    const fechaInicio = '2025-12-01';
    const fechaFin = '2025-12-31';
    
    const url = `${BASE_URL}/reportes/compras?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
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

    const responseData = await response.json();
    
    console.log('\n🔍 Estructura de respuesta:', Object.keys(responseData).join(', '));
    
    const data = responseData.data || responseData;
    
    console.log('\n✅ REPORTE DE COMPRAS OBTENIDO\n');
    console.log('═'.repeat(80));
    console.log('\n📈 RESUMEN:');
    console.log('  Total de compras:', new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(data.resumen.totalCompras));
    console.log('  Cantidad de compras:', data.resumen.cantidadCompras);
    console.log('  Compra promedio:', new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(data.resumen.compraPromedio));
    console.log('  Compra mayor:', new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(data.resumen.comprasMayor));
    console.log('  Compra menor:', new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(data.resumen.comprasMenor));
    
    console.log('\n📅 COMPRAS POR DÍA (primeros 5 días):');
    data.comprasPorDia.slice(0, 5).forEach(dia => {
      console.log(`  ${dia.fecha}: ${dia.cantidad} compras - ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(dia.total)}`);
    });
    if (data.comprasPorDia.length > 5) {
      console.log(`  ... y ${data.comprasPorDia.length - 5} días más`);
    }
    
    console.log('\n🏪 TOP 5 PROVEEDORES:');
    data.comprasPorProveedor.slice(0, 5).forEach((prov, idx) => {
      console.log(`  ${idx + 1}. ${prov.nombreProveedor}`);
      console.log(`     Compras: ${prov.cantidadCompras} - Total: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(prov.totalCompras)} (${prov.porcentaje.toFixed(1)}%)`);
    });
    
    console.log('\n📦 TOP 5 PRODUCTOS COMPRADOS:');
    data.topProductosComprados.slice(0, 5).forEach((prod, idx) => {
      console.log(`  ${idx + 1}. ${prod.nombreProducto}`);
      console.log(`     Cantidad: ${prod.cantidadComprada} - Total: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(prod.totalComprado)}`);
    });
    
    console.log('\n🏭 COMPRAS POR ALMACÉN:');
    data.comprasPorAlmacen.forEach(alm => {
      console.log(`  ${alm.nombreAlmacen}: ${alm.cantidadCompras} compras - ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(alm.totalCompras)} (${alm.porcentaje.toFixed(1)}%)`);
    });
    
    console.log('\n📊 COMPRAS POR ESTADO:');
    data.comprasPorEstado.forEach(est => {
      console.log(`  ${est.estado}: ${est.cantidad} - ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(est.total)} (${est.porcentaje.toFixed(1)}%)`);
    });
    
    console.log('\n═'.repeat(80));
    console.log('✅ TEST COMPLETADO EXITOSAMENTE\n');
    
    return data;
  } catch (error) {
    console.error('❌ Error obteniendo reporte:', error.message);
    throw error;
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando test de reportes de compras corregidos\n');
    
    const token = await login();
    const reporte = await getReporteCompras(token);
    
    // Verificaciones
    console.log('\n🔍 VERIFICACIONES:');
    
    if (reporte.resumen.cantidadCompras === 0) {
      console.log('⚠️  WARNING: No hay compras en el periodo seleccionado');
      console.log('   Verifica que existen recepciones confirmadas en diciembre 2025');
    } else {
      console.log(`✅ ${reporte.resumen.cantidadCompras} recepciones confirmadas encontradas`);
    }
    
    if (reporte.resumen.totalCompras > 0) {
      console.log(`✅ Total de compras positivo: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(reporte.resumen.totalCompras)}`);
    } else {
      console.log('⚠️  WARNING: Total de compras es 0');
    }
    
    if (reporte.topProductosComprados.length > 0) {
      console.log(`✅ ${reporte.topProductosComprados.length} productos encontrados`);
    } else {
      console.log('⚠️  WARNING: No hay productos en el reporte');
    }
    
    console.log('\n✨ Test finalizado\n');
    
  } catch (error) {
    console.error('\n💥 Error en el test:', error);
    process.exit(1);
  }
}

main();
