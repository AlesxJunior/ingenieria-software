/**
 * Script para probar las APIs de Cotizaciones
 * Fase 2B - Test Manual
 */

const BASE_URL = 'http://localhost:3001/api';

let authToken = '';
let clienteId = '';
let almacenId = '';
let productIds = [];

async function login() {
  console.log('\n🔐 === PASO 1: LOGIN ===');
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@alexatech.com',
      password: '123456'
    })
  });

  const data = await response.json();
  
  if (data.success) {
    authToken = data.data.token;
    console.log('✅ Login exitoso');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);
  } else {
    console.error('❌ Error en login:', data.message);
    throw new Error('Login falló');
  }
}

async function getClientes() {
  console.log('\n👥 === PASO 2: OBTENER CLIENTES ===');
  
  const response = await fetch(`${BASE_URL}/entidades?tipo=Cliente&limit=5`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  
  if (data.success && data.data && data.data.length > 0) {
    clienteId = data.data[0].id;
    console.log('✅ Cliente encontrado');
    console.log(`   ID: ${clienteId}`);
    console.log(`   Nombre: ${data.data[0].razonSocial || data.data[0].nombre}`);
  } else {
    console.log('⚠️  No hay clientes. Crear uno primero');
    throw new Error('Sin clientes');
  }
}

async function getAlmacen() {
  console.log('\n📦 === PASO 3: OBTENER ALMACÉN ===');
  
  const response = await fetch(`${BASE_URL}/warehouses`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  
  if (data.success && data.data && data.data.length > 0) {
    almacenId = data.data[0].id;
    console.log('✅ Almacén encontrado');
    console.log(`   ID: ${almacenId}`);
    console.log(`   Nombre: ${data.data[0].nombre}`);
  } else {
    console.log('⚠️  No hay almacenes');
    throw new Error('Sin almacenes');
  }
}

async function getProductos() {
  console.log('\n🛍️  === PASO 4: OBTENER PRODUCTOS ===');
  
  const response = await fetch(`${BASE_URL}/productos?limit=3`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  
  if (data.success && data.data && data.data.length > 0) {
    productIds = data.data.map(p => ({ id: p.id, nombre: p.nombre, precio: p.precioVenta }));
    console.log(`✅ ${productIds.length} productos encontrados`);
    productIds.forEach((p, idx) => {
      console.log(`   ${idx + 1}. ${p.nombre} - S/ ${p.precio}`);
    });
  } else {
    console.log('⚠️  No hay productos');
    throw new Error('Sin productos');
  }
}

async function createQuote() {
  console.log('\n📝 === PASO 5: CREAR COTIZACIÓN ===');
  
  const items = [
    {
      productId: productIds[0].id,
      cantidad: 2,
      precioUnitario: productIds[0].precio
    },
    {
      productId: productIds[1].id,
      cantidad: 3,
      precioUnitario: productIds[1].precio
    }
  ];

  const response = await fetch(`${BASE_URL}/quotes`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clienteId,
      almacenId,
      diasValidez: 15,
      observaciones: 'Cotización de prueba - Test automatizado',
      items
    })
  });

  const data = await response.json();
  
  if (response.ok && data.quote) {
    console.log('✅ Cotización creada exitosamente');
    console.log(`   Código: ${data.quote.codigoCotizacion}`);
    console.log(`   Estado: ${data.quote.estado}`);
    console.log(`   Subtotal: S/ ${data.quote.subtotal}`);
    console.log(`   IGV (18%): S/ ${data.quote.igv}`);
    console.log(`   Total: S/ ${data.quote.total}`);
    console.log(`   Válida hasta: ${new Date(data.quote.fechaVencimiento).toLocaleDateString('es-PE')}`);
    console.log(`   Items: ${data.quote.items.length} productos`);
    return data.quote.id;
  } else {
    console.error('❌ Error al crear cotización:', data.message);
    return null;
  }
}

async function listQuotes() {
  console.log('\n📋 === PASO 6: LISTAR COTIZACIONES ===');
  
  const response = await fetch(`${BASE_URL}/quotes?limit=5`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const data = await response.json();
  
  if (response.ok && data.quotes) {
    console.log(`✅ Cotizaciones encontradas: ${data.quotes.length}`);
    console.log(`   Total en BD: ${data.pagination.total}`);
    
    data.quotes.forEach((quote, idx) => {
      console.log(`\n   ${idx + 1}. ${quote.codigoCotizacion}`);
      console.log(`      Estado: ${quote.estado}`);
      console.log(`      Total: S/ ${quote.total}`);
      console.log(`      Vencimiento: ${new Date(quote.fechaVencimiento).toLocaleDateString('es-PE')}`);
    });
    
    return data.quotes;
  } else {
    console.error('❌ Error al listar cotizaciones');
    return [];
  }
}

async function getQuoteById(quoteId) {
  console.log('\n🔍 === PASO 7: VER DETALLE DE COTIZACIÓN ===');
  
  const response = await fetch(`${BASE_URL}/quotes/${quoteId}`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  const quote = await response.json();
  
  if (response.ok) {
    console.log('✅ Detalle de cotización:');
    console.log(`   Código: ${quote.codigoCotizacion}`);
    console.log(`   Cliente ID: ${quote.clienteId}`);
    console.log(`   Almacén ID: ${quote.almacenId}`);
    console.log(`   Estado: ${quote.estado}`);
    console.log(`   Días validez: ${quote.diasValidez}`);
    console.log(`   Items:`);
    
    quote.items.forEach((item, idx) => {
      console.log(`      ${idx + 1}. ${item.nombreProducto}`);
      console.log(`         Cantidad: ${item.cantidad}`);
      console.log(`         Precio: S/ ${item.precioUnitario}`);
      console.log(`         Subtotal: S/ ${item.subtotal}`);
    });
    
    return quote;
  } else {
    console.error('❌ Error al obtener detalle');
    return null;
  }
}

async function updateQuoteStatus(quoteId, estado) {
  console.log(`\n🔄 === PASO 8: CAMBIAR ESTADO A ${estado.toUpperCase()} ===`);
  
  const body = { estado };
  if (estado === 'Rechazada') {
    body.motivoRechazo = 'Precio no competitivo';
  }

  const response = await fetch(`${BASE_URL}/quotes/${quoteId}/status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  
  if (response.ok) {
    console.log('✅ Estado actualizado');
    console.log(`   Nuevo estado: ${data.quote.estado}`);
    if (data.quote.motivoRechazo) {
      console.log(`   Motivo rechazo: ${data.quote.motivoRechazo}`);
    }
  } else {
    console.error('❌ Error al actualizar estado:', data.message);
  }
}

async function convertToSale(quoteId) {
  console.log('\n💰 === PASO 9: CONVERTIR A VENTA ===');
  
  const response = await fetch(`${BASE_URL}/quotes/${quoteId}/convert`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      formaPago: 'Efectivo',
      tipoComprobante: 'Boleta'
    })
  });

  const data = await response.json();
  
  if (response.ok && data.sale) {
    console.log('✅ Cotización convertida a venta exitosamente');
    console.log(`   Código Venta: ${data.sale.codigoVenta}`);
    console.log(`   Total: S/ ${data.sale.total}`);
    console.log(`   Estado: ${data.sale.estado}`);
    console.log(`   Inventario actualizado: Sí`);
    return data.sale.id;
  } else {
    console.error('❌ Error al convertir:', data.message);
    return null;
  }
}

async function main() {
  try {
    console.log('╔════════════════════════════════════════╗');
    console.log('║  TEST: Cotizaciones API - Fase 2B     ║');
    console.log('╚════════════════════════════════════════╝');
    
    // 1. Login
    await login();
    
    // 2-4. Obtener datos necesarios
    await getClientes();
    await getAlmacen();
    await getProductos();
    
    // 5. Crear cotización
    const quoteId = await createQuote();
    
    if (!quoteId) {
      console.log('\n⚠️  No se pudo crear cotización. Fin del test.');
      return;
    }
    
    // 6. Listar cotizaciones
    await listQuotes();
    
    // 7. Ver detalle
    await getQuoteById(quoteId);
    
    // 8. Cambiar estado a Aceptada
    await updateQuoteStatus(quoteId, 'Aceptada');
    
    // 9. Convertir a venta
    const saleId = await convertToSale(quoteId);
    
    console.log('\n✅ === TEST COMPLETADO EXITOSAMENTE ===\n');
    
    console.log('📝 Próximos pasos:');
    console.log('   1. Verificar en BD: SELECT * FROM quotes;');
    console.log('   2. Verificar venta creada: SELECT * FROM sales WHERE quote_origin_id IS NOT NULL;');
    console.log('   3. Verificar inventario actualizado: SELECT * FROM stock_by_warehouse;');
    console.log('   4. Probar otros estados (Rechazada, Cancelada, Vencida)');
    console.log('   5. Integrar con frontend Cotizaciones.tsx (Fase 7)');
    
  } catch (error) {
    console.error('\n❌ === ERROR EN TEST ===');
    console.error(error.message);
  }
}

main();
