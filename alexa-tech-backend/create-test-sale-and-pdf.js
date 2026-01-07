/**
 * Script para crear una venta de prueba directamente en la base de datos
 * y luego probar la generación de PDF
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001/api';

let authToken = '';

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
  authToken = data.data.accessToken;
  console.log(`✅ Token obtenido\n`);
}

async function createTestSale() {
  try {
    console.log('🔍 Obteniendo datos necesarios...\n');

    // Obtener producto
    const productRes = await fetch(`${BASE_URL}/products?limit=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const productData = await productRes.json();
    
    if (!productData.data || !productData.data.products || productData.data.products.length === 0) {
      throw new Error('No hay productos disponibles');
    }
    
    // Buscar producto con stock
    const product = productData.data.products.find(p => p.stock > 2) || productData.data.products[0];
    console.log(`✅ Producto: ${product.nombre} (ID: ${product.id}, Stock: ${product.stock})`);

    // Obtener cliente
    const clientRes = await fetch(`${BASE_URL}/entidades?tipo=Cliente&limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const clientData = await clientRes.json();
    
    if (!clientData.data || !clientData.data.clients || clientData.data.clients.length === 0) {
      throw new Error('No hay clientes disponibles');
    }
    
    const client = clientData.data.clients[0];
    console.log(`✅ Cliente: ${client.nombre} (ID: ${client.id})`);

    // Obtener almacén
    const warehouseRes = await fetch(`${BASE_URL}/warehouses?limit=1`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    const warehouseData = await warehouseRes.json();
    
    if (!warehouseData.data || !warehouseData.data.rows || warehouseData.data.rows.length === 0) {
      throw new Error('No hay almacenes disponibles');
    }
    
    const warehouse = warehouseData.data.rows[0];
    console.log(`✅ Almacén: ${warehouse.nombre} (ID: ${warehouse.id})\n`);

    // Crear venta
    console.log('💰 Creando venta de prueba...');
    const saleRes = await fetch(`${BASE_URL}/sales`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tipoComprobante: 'Factura',
        formaPago: 'Efectivo',
        clienteId: client.id,
        almacenId: warehouse.id,
        // cashSessionId: null, // Opcional
        observaciones: 'Venta de prueba para generación de PDF',
        items: [{
          productId: product.id,
          cantidad: 1,
          precioUnitario: 150.00,
        }],
      }),
    });

    if (!saleRes.ok) {
      const error = await saleRes.json();
      throw new Error(`Error al crear venta: ${JSON.stringify(error)}`);
    }

    const saleData = await saleRes.json();
    const sale = saleData.data;
    console.log(`✅ Venta creada: ${sale.codigoVenta} (ID: ${sale.id})`);
    console.log(`   Total: S/ ${sale.total.toFixed(2)}\n`);

    // Completar venta
    console.log('✔️  Completando venta...');
    const completeRes = await fetch(`${BASE_URL}/sales/${sale.id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ estado: 'Completada' }),
    });

    if (!completeRes.ok) {
      const error = await completeRes.json();
      throw new Error(`Error al completar venta: ${JSON.stringify(error)}`);
    }

    console.log(`✅ Venta completada\n`);

    return sale.id;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

async function testPDF(saleId) {
  try {
    // Probar preview
    console.log('📄 Generando PDF...');
    const pdfResponse = await fetch(`${BASE_URL}/sales/${saleId}/invoice/preview`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    if (!pdfResponse.ok) {
      const error = await pdfResponse.text();
      throw new Error(`Error al generar PDF: ${error}`);
    }

    const contentType = pdfResponse.headers.get('content-type');
    if (contentType !== 'application/pdf') {
      throw new Error(`Tipo de contenido incorrecto: ${contentType}`);
    }

    const buffer = await pdfResponse.buffer();
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, `factura-${saleId}.pdf`);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ PDF generado exitosamente`);
    console.log(`   Archivo: ${filePath}`);
    console.log(`   Tamaño: ${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`\n🎉 ÉXITO! La generación de PDFs funciona correctamente\n`);
    console.log(`📎 URLs de prueba:`);
    console.log(`   Preview: http://localhost:3001/api/sales/${saleId}/invoice/preview`);
    console.log(`   Download: http://localhost:3001/api/sales/${saleId}/invoice/download`);
    console.log(`\n⚠️  Nota: Necesitas incluir el header Authorization con el token\n`);

  } catch (error) {
    console.error('❌ Error al probar PDF:', error.message);
    throw error;
  }
}

async function main() {
  console.log('\n================================================================================');
  console.log('PRUEBA DE GENERACIÓN DE FACTURAS PDF');
  console.log('================================================================================\n');

  try {
    console.log('🔐 Autenticando...');
    await authenticate();
    const saleId = await createTestSale();
    await testPDF(saleId);
  } catch (error) {
    console.error('\n💥 Error fatal:', error.message);
    process.exit(1);
  }
}

main();
