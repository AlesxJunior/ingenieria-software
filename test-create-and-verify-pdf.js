/**
 * Script para crear una venta con múltiples pagos Y verificar el PDF
 */

const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3001/api';

async function createAndTestSale() {
  try {
    console.log('\n🎯 CREAR VENTA CON MÚLTIPLES PAGOS Y VERIFICAR PDF\n');
    console.log('='.repeat(70) + '\n');

    // 1. Login
    console.log('🔐 1. Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    const token = loginRes.data.data.accessToken;
    console.log('✅ Login exitoso\n');

    // 2. Buscar productos y almacenes
    console.log('📦 2. Buscando productos...');
    const productsRes = await axios.get(`${API_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const products = productsRes.data.data?.products || productsRes.data.data || [];
    
    const warehousesRes = await axios.get(`${API_URL}/warehouses`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    let warehouses = warehousesRes.data.data;
    if (!Array.isArray(warehouses)) {
      warehouses = warehousesRes.data;
    }
    if (!Array.isArray(warehouses)) {
      // Si aún no es array, usar un almacén por defecto
      warehouses = [{ id: 'cmi0iixps0000c3uixg6thbso', nombre: 'Almacén Principal' }];
      console.log('   ⚠️ Usando almacén por defecto');
    }
    
    console.log(`   Productos: ${products.length}`);
    console.log(`   Almacenes: ${warehouses.length}`);
    
    if (products.length === 0 || warehouses.length === 0) {
      console.error('❌ No hay productos o almacenes disponibles');
      return;
    }
    
    const product = products[0];
    const warehouse = warehouses[0];
    console.log(`   Usando producto: ${product.nombre || product.productName}`);
    console.log(`   Almacén: ${warehouse.nombre || warehouse.name}\n`);

    // 3. Crear venta con múltiples pagos
    console.log('💰 3. Creando venta con 2 métodos de pago...');
    
    const saleData = {
      almacenId: warehouse.id,
      tipoComprobante: 'Boleta',
      incluyeIGV: true,
      items: [
        {
          productId: product.id || product.codigo,
          nombreProducto: product.nombre || product.productName,
          cantidad: 1,
          precioUnitario: 100.00
        }
      ],
      observaciones: 'TEST: Venta con múltiples métodos de pago',
      // ⭐ MÚLTIPLES MÉTODOS DE PAGO
      payments: [
        {
          metodoPago: 'Efectivo',
          monto: 60.00,
          referencia: null
        },
        {
          metodoPago: 'Yape',
          monto: 58.00,
          referencia: 'YAPE-TEST-987654'
        }
      ]
    };

    console.log('   Datos de venta:');
    console.log('   - Total items: 1');
    console.log('   - Subtotal: S/ 100.00');
    console.log('   - IGV (18%): S/ 18.00');
    console.log('   - Total: S/ 118.00');
    console.log('   - Métodos de pago: 2');
    console.log('     • Efectivo: S/ 60.00');
    console.log('     • Yape: S/ 58.00\n');

    let sale;
    try {
      const saleRes = await axios.post(`${API_URL}/sales`, saleData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      sale = saleRes.data.data;
      console.log('✅ Venta creada:', sale.codigoVenta);
      console.log('   ID:', sale.id);
      console.log('   Estado:', sale.estado);
      
      if (sale.payments && sale.payments.length > 0) {
        console.log('   Pagos guardados:');
        sale.payments.forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.metodoPago}: S/ ${p.monto}`);
          if (p.referencia) console.log(`        Ref: ${p.referencia}`);
        });
      }
      console.log();
    } catch (error) {
      console.error('❌ Error creando venta:', error.response?.data || error.message);
      if (error.response?.data?.details) {
        console.error('   Detalles:', error.response.data.details);
      }
      
      // Intentar con trackInventory = false en el producto
      console.log('\n⚠️ Probando sin control de inventario...');
      try {
        // Obtener productos sin control de inventario
        const noTrackProduct = products.find(p => !p.trackInventory);
        if (noTrackProduct) {
          saleData.items[0].productId = noTrackProduct.id || noTrackProduct.codigo;
          saleData.items[0].nombreProducto = noTrackProduct.nombre || noTrackProduct.productName;
          
          const retryRes = await axios.post(`${API_URL}/sales`, saleData, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          sale = retryRes.data.data;
          console.log('✅ Venta creada con producto sin inventario:', sale.codigoVenta);
        } else {
          console.error('❌ No hay productos sin control de inventario');
          return;
        }
      } catch (retryError) {
        console.error('❌ Error en segundo intento:', retryError.response?.data || retryError.message);
        return;
      }
    }

    // 4. Confirmar pago
    console.log('💳 4. Confirmando pago...');
    await axios.post(
      `${API_URL}/sales/${sale.id}/confirm-payment`,
      {
        montoRecibido: 118.00,
        montoCambio: 0,
        referenciaPago: 'Pago mixto completado'
      },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log('✅ Pago confirmado\n');

    // 5. Generar PDF
    console.log('🖨️ 5. Generando PDF...');
    const pdfRes = await axios.get(
      `${API_URL}/sales/${sale.id}/invoice/preview`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'arraybuffer'
      }
    );

    const filename = `venta-multiple-pagos-${sale.codigoVenta}.pdf`;
    fs.writeFileSync(filename, pdfRes.data);
    
    console.log('✅ PDF generado:', filename);
    console.log();
    console.log('='.repeat(70));
    console.log('  ✅ PRUEBA COMPLETADA');
    console.log('='.repeat(70));
    console.log();
    console.log('📋 VERIFICA EL PDF:');
    console.log('   1. Abre:', filename);
    console.log('   2. En "DATOS DEL ADQUIRENTE" verifica:');
    console.log('      • MÉTODO(S) DE PAGO muestra ambos métodos con montos');
    console.log('   3. Más abajo debe aparecer "DETALLE DE PAGOS":');
    console.log('      • Tabla con MÉTODO | REFERENCIA | MONTO');
    console.log('      • Fila 1: Efectivo | - | S/ 60.00');
    console.log('      • Fila 2: Yape | YAPE-TEST-987654 | S/ 58.00');
    console.log();

  } catch (error) {
    console.error('\n❌ Error general:', error.response?.data || error.message);
  }
}

createAndTestSale();
