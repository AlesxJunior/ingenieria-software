const axios = require('axios');

const API_URL = 'http://localhost:3001/api';
let token = '';

// Función para login
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    token = response.data.accessToken; // Usar accessToken en lugar de token
    console.log('✅ Login exitoso\n');
    return true;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return false;
  }
}

// Función para obtener comprobantes
async function obtenerComprobantes() {
  try {
    const response = await axios.get(`${API_URL}/configuracion/comprobantes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📋 COMPROBANTES CONFIGURADOS:\n');
    response.data.forEach(c => {
      const siguiente = `${c.serie}-${String(c.numeroActual + 1).padStart(8, '0')}`;
      console.log(`${c.activo ? '✅' : '❌'} ${c.nombre}`);
      console.log(`   Serie: ${c.serie}`);
      console.log(`   Próximo: ${siguiente}`);
      console.log(`   Actual: ${c.numeroActual}`);
      console.log(`   Predeterminado: ${c.predeterminado ? 'Sí' : 'No'}`);
      console.log('');
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error obteniendo comprobantes:', error.response?.data || error.message);
    return [];
  }
}

// Función para crear venta de prueba con Boleta
async function crearVentaBoleta(comprobanteId) {
  try {
    const ventaData = {
      tipoComprobante: 'Boleta',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      cliente: 'Cliente de Prueba Boleta',
      items: [
        {
          producto: 'Producto Test 1',
          cantidad: 2,
          precio: 50.00
        }
      ],
      subtotal: 100.00,
      igv: 18.00,
      total: 118.00,
      metodoPago: 'Efectivo',
      montoPagado: 120.00,
      vuelto: 2.00,
      comprobanteId: comprobanteId
    };

    console.log('🔄 Creando venta con BOLETA...');
    const response = await axios.post(`${API_URL}/sales`, ventaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ VENTA CREADA:');
    console.log(`   Código: ${response.data.codigoVenta}`);
    console.log(`   Cliente: ${response.data.cliente}`);
    console.log(`   Total: S/ ${response.data.total}`);
    console.log(`   Tipo: ${response.data.tipoComprobante}\n`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creando venta:', error.response?.data || error.message);
    return null;
  }
}

// Función para crear venta de prueba con Factura
async function crearVentaFactura(comprobanteId) {
  try {
    const ventaData = {
      tipoComprobante: 'Factura',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      cliente: 'Empresa Test SAC',
      direccion: 'Av. Principal 123',
      items: [
        {
          producto: 'Producto Test 2',
          cantidad: 1,
          precio: 200.00
        }
      ],
      subtotal: 200.00,
      igv: 36.00,
      total: 236.00,
      metodoPago: 'Transferencia',
      montoPagado: 236.00,
      vuelto: 0.00,
      comprobanteId: comprobanteId
    };

    console.log('🔄 Creando venta con FACTURA...');
    const response = await axios.post(`${API_URL}/sales`, ventaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ VENTA CREADA:');
    console.log(`   Código: ${response.data.codigoVenta}`);
    console.log(`   Cliente: ${response.data.cliente}`);
    console.log(`   Total: S/ ${response.data.total}`);
    console.log(`   Tipo: ${response.data.tipoComprobante}\n`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error creando venta:', error.response?.data || error.message);
    return null;
  }
}

// Función principal
async function testSeriesImplementacion() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 TEST: IMPLEMENTACIÓN DE SERIES PROFESIONALES SUNAT');
  console.log('═══════════════════════════════════════════════════════\n');

  // 1. Login
  const loginOk = await login();
  if (!loginOk) {
    console.log('❌ No se pudo hacer login. Abortando test.');
    return;
  }

  // 2. Obtener comprobantes configurados
  const comprobantes = await obtenerComprobantes();
  
  const boletaComprobante = comprobantes.find(c => c.tipo === 'boleta' && c.activo);
  const facturaComprobante = comprobantes.find(c => c.tipo === 'factura' && c.activo);

  if (!boletaComprobante || !facturaComprobante) {
    console.log('❌ No se encontraron comprobantes activos. Configurar primero.');
    return;
  }

  // 3. Crear venta con Boleta
  console.log('─────────────────────────────────────────────────────────');
  console.log('TEST 1: Crear venta con BOLETA');
  console.log('─────────────────────────────────────────────────────────\n');
  
  const numeroActualBoleta = boletaComprobante.numeroActual;
  const venta1 = await crearVentaBoleta(boletaComprobante.id);
  
  if (venta1) {
    const expectedCodigo = `${boletaComprobante.serie}-${String(numeroActualBoleta + 1).padStart(8, '0')}`;
    if (venta1.codigoVenta === expectedCodigo) {
      console.log(`✅ CORRECTO: El código generado es ${venta1.codigoVenta}`);
    } else {
      console.log(`❌ ERROR: Se esperaba ${expectedCodigo} pero se obtuvo ${venta1.codigoVenta}`);
    }
  }

  // Esperar 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 4. Crear venta con Factura
  console.log('─────────────────────────────────────────────────────────');
  console.log('TEST 2: Crear venta con FACTURA');
  console.log('─────────────────────────────────────────────────────────\n');
  
  const numeroActualFactura = facturaComprobante.numeroActual;
  const venta2 = await crearVentaFactura(facturaComprobante.id);
  
  if (venta2) {
    const expectedCodigo = `${facturaComprobante.serie}-${String(numeroActualFactura + 1).padStart(8, '0')}`;
    if (venta2.codigoVenta === expectedCodigo) {
      console.log(`✅ CORRECTO: El código generado es ${venta2.codigoVenta}`);
    } else {
      console.log(`❌ ERROR: Se esperaba ${expectedCodigo} pero se obtuvo ${venta2.codigoVenta}`);
    }
  }

  // Esperar 2 segundos
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 5. Crear otra venta con Boleta para verificar incremento
  console.log('─────────────────────────────────────────────────────────');
  console.log('TEST 3: Verificar INCREMENTO de correlativo en Boleta');
  console.log('─────────────────────────────────────────────────────────\n');
  
  const venta3 = await crearVentaBoleta(boletaComprobante.id);
  
  if (venta3) {
    const expectedCodigo = `${boletaComprobante.serie}-${String(numeroActualBoleta + 2).padStart(8, '0')}`;
    if (venta3.codigoVenta === expectedCodigo) {
      console.log(`✅ CORRECTO: El correlativo se incrementó correctamente a ${venta3.codigoVenta}`);
    } else {
      console.log(`❌ ERROR: Se esperaba ${expectedCodigo} pero se obtuvo ${venta3.codigoVenta}`);
    }
  }

  // 6. Verificar estado final de comprobantes
  console.log('\n─────────────────────────────────────────────────────────');
  console.log('ESTADO FINAL DE COMPROBANTES:');
  console.log('─────────────────────────────────────────────────────────\n');
  await obtenerComprobantes();

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ TEST COMPLETADO');
  console.log('═══════════════════════════════════════════════════════');
}

// Ejecutar
testSeriesImplementacion()
  .then(() => {
    console.log('\n🎉 Pruebas finalizadas!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
