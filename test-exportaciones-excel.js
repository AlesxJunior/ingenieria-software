import axios from 'axios';
import fs from 'fs';
import path from 'path';

// ============================================
// CONFIGURACIÓN
// ============================================

const API_URL = 'http://localhost:3001/api/inventory';
const OUTPUT_DIR = './exports_test';

// Credenciales de prueba
const CREDENTIALS = {
  email: 'admin@alexatech.com',
  password: 'admin123'
};

let authToken = '';

// ============================================
// FUNCIONES DE PRUEBA
// ============================================

async function login() {
  console.log('\n🔐 Iniciando sesión...');
  try {
    const response = await axios.post('http://localhost:3001/api/auth/login', CREDENTIALS);
    authToken = response.data.data.accessToken;
    console.log('✅ Login exitoso\n');
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

async function testExportStock() {
  console.log('📋 TEST 1: Exportar Stock a Excel');
  console.log('─'.repeat(60));

  try {
    const response = await axios.get(`${API_URL}/export/stock`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'arraybuffer'
    });

    // Guardar archivo
    const filename = 'stock_test.xlsx';
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, response.data);

    console.log(`✅ Archivo generado: ${filepath}`);
    console.log(`   Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Content-Disposition: ${response.headers['content-disposition']}`);
    console.log('\n✨ Test superado: Stock exportado correctamente\n');
  } catch (error) {
    console.error('❌ Error exportando stock:', error.response?.data || error.message);
    throw error;
  }
}

async function testExportKardex() {
  console.log('📋 TEST 2: Exportar Kardex a Excel');
  console.log('─'.repeat(60));

  try {
    // Exportar últimos movimientos
    const response = await axios.get(`${API_URL}/export/kardex`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'arraybuffer'
    });

    // Guardar archivo
    const filename = 'kardex_test.xlsx';
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, response.data);

    console.log(`✅ Archivo generado: ${filepath}`);
    console.log(`   Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log('\n✨ Test superado: Kardex exportado correctamente\n');
  } catch (error) {
    console.error('❌ Error exportando kardex:', error.response?.data || error.message);
    throw error;
  }
}

async function testExportAlertas() {
  console.log('📋 TEST 3: Exportar Alertas a Excel');
  console.log('─'.repeat(60));

  try {
    const response = await axios.get(`${API_URL}/export/alertas`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'arraybuffer'
    });

    // Guardar archivo
    const filename = 'alertas_test.xlsx';
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, response.data);

    console.log(`✅ Archivo generado: ${filepath}`);
    console.log(`   Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log('\n✨ Test superado: Alertas exportadas correctamente\n');
  } catch (error) {
    console.error('❌ Error exportando alertas:', error.response?.data || error.message);
    throw error;
  }
}

async function testExportTransferencias() {
  console.log('📋 TEST 4: Exportar Transferencias a Excel');
  console.log('─'.repeat(60));

  try {
    const response = await axios.get(`${API_URL}/export/transferencias`, {
      headers: { Authorization: `Bearer ${authToken}` },
      responseType: 'arraybuffer'
    });

    // Guardar archivo
    const filename = 'transferencias_test.xlsx';
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, response.data);

    console.log(`✅ Archivo generado: ${filepath}`);
    console.log(`   Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log('\n✨ Test superado: Transferencias exportadas correctamente\n');
  } catch (error) {
    console.error('❌ Error exportando transferencias:', error.response?.data || error.message);
    throw error;
  }
}

async function testExportWithFilters() {
  console.log('📋 TEST 5: Exportar Kardex con Filtros de Fecha');
  console.log('─'.repeat(60));

  try {
    const fechaHoy = new Date().toISOString().split('T')[0];
    const fechaHace7Dias = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const response = await axios.get(`${API_URL}/export/kardex`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        fechaDesde: fechaHace7Dias,
        fechaHasta: fechaHoy
      },
      responseType: 'arraybuffer'
    });

    // Guardar archivo
    const filename = 'kardex_ultimos_7_dias.xlsx';
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, response.data);

    console.log(`✅ Archivo generado: ${filepath}`);
    console.log(`   Filtro: ${fechaHace7Dias} a ${fechaHoy}`);
    console.log(`   Tamaño: ${(response.data.length / 1024).toFixed(2)} KB`);
    console.log('\n✨ Test superado: Filtros funcionando correctamente\n');
  } catch (error) {
    console.error('❌ Error exportando con filtros:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// EJECUTAR TESTS
// ============================================

async function runTests() {
  console.log('\n============================================================');
  console.log('🧪 TEST E2E: Sistema de Exportación a Excel');
  console.log('============================================================\n');

  // Crear directorio de salida
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    await login();
    await testExportStock();
    await testExportKardex();
    await testExportAlertas();
    await testExportTransferencias();
    await testExportWithFilters();

    console.log('\n============================================================');
    console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('============================================================\n');
    console.log('📊 Resumen:');
    console.log('   ✓ Exportar Stock');
    console.log('   ✓ Exportar Kardex');
    console.log('   ✓ Exportar Alertas');
    console.log('   ✓ Exportar Transferencias');
    console.log('   ✓ Exportar con Filtros de Fecha\n');
    console.log(`📁 Archivos generados en: ${OUTPUT_DIR}\n`);

    process.exit(0);
  } catch (error) {
    console.log('\n============================================================');
    console.log('❌ TESTS FALLARON');
    console.log('============================================================\n');
    process.exit(1);
  }
}

// Ejecutar
runTests();
