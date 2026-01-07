const axios = require('axios');

async function createTestProducts() {
  try {
    console.log('🔐 Iniciando sesión...\n');
    
    // Login
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });

    const token = loginRes.data.data.accessToken;
    console.log('✅ Sesión iniciada correctamente\n');

    // Obtener categoría
    console.log('📋 Obteniendo categoría...\n');
    
    const categoriasRes = await axios.get('http://localhost:3001/api/configuracion/categorias', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const categorias = categoriasRes.data.data?.rows || categoriasRes.data.data || [];
    const categoryId = categorias[0]?.id;
    console.log(`   Categorías encontradas: ${categorias.length}\n`);

    if (!categoryId) {
      console.error('❌ No se encontró ninguna categoría');
      return;
    }

    console.log('📦 Buscando productos de prueba existentes...\n');

    // Buscar productos de prueba existentes
    const productsRes = await axios.get('http://localhost:3001/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    let allProducts = [];
    if (productsRes.data.data?.rows) {
      allProducts = productsRes.data.data.rows;
    } else if (Array.isArray(productsRes.data.data)) {
      allProducts = productsRes.data.data;
    }
    
    let createdProducts = allProducts.filter(p => p.codigo && p.codigo.startsWith('TEST-'));

    if (createdProducts.length === 0) {
      console.log('No hay productos de prueba. Creando...\n');
      
      const testProducts = [
        {
          codigo: 'TEST-CRIT-001',
          nombre: 'Producto Crítico Test',
          descripcion: 'Stock crítico para alertas',
          precio: 100,
          costo: 50,
          stockMinimo: 100,
          trackInventory: true
        },
        {
          codigo: 'TEST-BAJO-001',
          nombre: 'Producto Bajo Test',
          descripcion: 'Stock bajo para alertas',
          precio: 150,
          costo: 75,
          stockMinimo: 50,
          trackInventory: true
        }
      ];

      createdProducts = [];
      for (const product of testProducts) {
        try {
          const res = await axios.post('http://localhost:3001/api/products', {
            ...product,
            categoryId,
            estado: true
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          createdProducts.push(res.data.data);
          console.log(`✅ ${product.nombre}`);
        } catch (err) {
          console.error(`❌ Error: ${err.response?.data?.message || err.message}`);
        }
      }
    } else {
      console.log(`✅ Encontrados ${createdProducts.length} productos de prueba\n`);
    }

    // Configurar stock objetivo
    createdProducts = createdProducts.map(p => ({
      ...p,
      targetStock: p.codigo === 'TEST-CRIT-001' ? 40 : 30
    }));

    // Obtener almacén
    const warehousesRes = await axios.get('http://localhost:3001/api/warehouses', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const warehouse = warehousesRes.data.data.rows[0];

    console.log(`\n🏪 Almacén: ${warehouse.nombre}\n`);
    console.log('⚙️  Ajustando stock...\n');

    // Ajustar stock
    for (const product of createdProducts) {
      try {
        await axios.post('http://localhost:3001/api/inventory/ajuste', {
          productId: product.id,
          warehouseId: warehouse.id,
          cantidad: product.targetStock,
          razon: 'AJUSTE_INVENTARIO',
          observaciones: 'Datos de prueba para alertas'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const percentage = Math.round((product.targetStock / product.stockMinimo) * 100);
        const emoji = product.targetStock <= product.stockMinimo * 0.5 ? '🔴' : '🟡';
        console.log(`${emoji} ${product.nombre}: ${product.targetStock}/${product.stockMinimo} (${percentage}%)`);
      } catch (err) {
        console.error(`❌ Error ajustando ${product.nombre}:`, err.response?.data?.message || err.message);
      }
    }

    // Verificar alertas
    console.log('\n🚨 Verificando alertas...\n');
    const alertasRes = await axios.get('http://localhost:3001/api/inventory/alertas', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const alertas = alertasRes.data.data.rows || alertasRes.data.data;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📊 RESUMEN DE ALERTAS`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔴 CRÍTICAS: ${alertas.filter(a => a.tipoAlerta === 'CRITICO').length}`);
    console.log(`🟡 BAJAS: ${alertas.filter(a => a.tipoAlerta === 'BAJO').length}`);
    console.log(`📢 TOTAL: ${alertas.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (alertas.length > 0) {
      alertas.forEach(a => {
        const emoji = a.tipoAlerta === 'CRITICO' ? '🔴' : '🟡';
        console.log(`${emoji} ${a.nombre}`);
        console.log(`   Stock: ${a.cantidad}/${a.stockMinimo} (${a.porcentaje}%)`);
        console.log(`   Faltan: ${a.diferenciaUnidades} unidades\n`);
      });
    }

    console.log('✅ VERIFICACIÓN COMPLETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Badge se actualizará en 2 minutos');
    console.log('🌐 http://localhost:5173');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Error:', err.response?.data?.message || err.message);
    process.exit(1);
  }
}

createTestProducts();
