/**
 * Script para probar el reporte de caja
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

async function getReporteCaja(token) {
  const fechaInicio = '2025-12-01';
  const fechaFin = '2025-12-31';
  
  const url = `${BASE_URL}/reportes/caja?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
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
  
  console.log('\n✅ REPORTE DE CAJA OBTENIDO\n');
  console.log('═'.repeat(80));
  
  if (data.data) {
    const reporte = data.data;
    console.log('\n💰 RESUMEN DE CAJA:');
    console.log(`  Cajas Abiertas: ${reporte.resumen.cajasAbiertas}`);
    console.log(`  Cajas Cerradas: ${reporte.resumen.cajasCerradas}`);
    console.log(`  Total Efectivo: S/ ${reporte.resumen.totalEfectivo.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Tarjeta: S/ ${reporte.resumen.totalTarjeta.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Transferencia: S/ ${reporte.resumen.totalTransferencia.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    console.log(`  Total Otros: S/ ${reporte.resumen.totalOtros.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    console.log(`  TOTAL GENERAL: S/ ${reporte.resumen.totalGeneral.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
    
    console.log('\n💳 MOVIMIENTOS POR MÉTODO DE PAGO:');
    if (reporte.movimientosPorMetodo && reporte.movimientosPorMetodo.length > 0) {
      reporte.movimientosPorMetodo.forEach((m, idx) => {
        console.log(`  ${idx + 1}. ${m.metodoPago}`);
        console.log(`     Transacciones: ${m.cantidadTransacciones}`);
        console.log(`     Monto: S/ ${m.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
        console.log(`     Porcentaje: ${m.porcentaje.toFixed(2)}%`);
      });
    } else {
      console.log('  No hay datos de métodos de pago');
    }
    
    console.log('\n🏪 MOVIMIENTOS POR CAJA:');
    if (reporte.movimientosPorCaja && reporte.movimientosPorCaja.length > 0) {
      reporte.movimientosPorCaja.slice(0, 5).forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.nombreCaja} - ${c.nombreUsuario}`);
        console.log(`     Estado: ${c.estado}`);
        console.log(`     Apertura: S/ ${c.montoApertura.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
        console.log(`     Ingresos: S/ ${c.totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
        if (c.montoCierre) {
          console.log(`     Cierre: S/ ${c.montoCierre.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
        }
      });
      if (reporte.movimientosPorCaja.length > 5) {
        console.log(`  ... y ${reporte.movimientosPorCaja.length - 5} sesiones más`);
      }
    } else {
      console.log('  No hay sesiones de caja en el periodo');
    }
    
    console.log('\n⏰ VENTAS POR HORA (Top 5):');
    if (reporte.ventasPorHora) {
      const ventasConDatos = reporte.ventasPorHora.filter(v => v.cantidadVentas > 0);
      ventasConDatos
        .sort((a, b) => b.montoTotal - a.montoTotal)
        .slice(0, 5)
        .forEach((v, idx) => {
          const horaStr = `${v.hora.toString().padStart(2, '0')}:00`;
          console.log(`  ${idx + 1}. ${horaStr} - ${v.cantidadVentas} ventas - S/ ${v.montoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`);
        });
    }
    
    console.log('\n🔍 VERIFICACIONES:');
    if (reporte.resumen.totalGeneral > 0) {
      console.log('  ✅ Hay movimientos de caja en el periodo');
    } else {
      console.log('  ⚠️  No hay movimientos de caja en el periodo');
    }
    
    if (reporte.movimientosPorCaja && reporte.movimientosPorCaja.length > 0) {
      console.log(`  ✅ ${reporte.movimientosPorCaja.length} sesiones de caja encontradas`);
    } else {
      console.log('  ⚠️  No hay sesiones de caja');
    }
  }
  
  console.log('\n═'.repeat(80));
  console.log('✨ Test completado\n');
  
  return data;
}

async function main() {
  try {
    console.log('🚀 Iniciando test de reportes de caja\n');
    
    const token = await login();
    console.log('✅ Login exitoso\n');
    
    await getReporteCaja(token);
    
  } catch (error) {
    console.error('\n💥 Error en el test:', error.message);
    process.exit(1);
  }
}

main();
