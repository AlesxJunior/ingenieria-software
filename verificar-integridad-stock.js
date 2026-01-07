/**
 * Script de Verificación de Integridad de Stock
 * 
 * Este script compara:
 * 1. Product.stock (campo legacy en BD)
 * 2. Stock agregado calculado desde StockByWarehouse
 * 3. Stock mostrado en el endpoint /api/productos
 * 
 * Identifica productos con discrepancias y genera un reporte.
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function verificarIntegridadStock() {
  console.log('🔍 Iniciando verificación de integridad de stock...\n');
  
  try {
    // 1. Obtener todos los productos con su stock legacy y stock por almacén
    const products = await prisma.product.findMany({
      where: { estado: true },
      include: {
        stockByWarehouses: {
          select: {
            warehouseId: true,
            quantity: true
          }
        }
      },
      orderBy: { codigo: 'asc' }
    });

    console.log(`📦 Total de productos activos: ${products.length}\n`);

    // 2. Analizar cada producto
    const discrepancias = [];
    const productos_ok = [];

    for (const product of products) {
      // Calcular stock real agregado
      const stockReal = product.stockByWarehouses.reduce(
        (sum, stock) => sum + stock.quantity, 
        0
      );
      
      const stockLegacy = product.stock;
      const diferencia = stockReal - stockLegacy;

      if (diferencia !== 0) {
        discrepancias.push({
          codigo: product.codigo,
          nombre: product.nombre,
          stockLegacy,
          stockReal,
          diferencia,
          almacenes: product.stockByWarehouses.map(s => ({
            warehouseId: s.warehouseId,
            cantidad: s.quantity
          }))
        });
      } else {
        productos_ok.push({
          codigo: product.codigo,
          stock: stockReal
        });
      }
    }

    // 3. Generar reporte
    console.log('═══════════════════════════════════════════════════════════\n');
    
    if (discrepancias.length === 0) {
      console.log('✅ ¡EXCELENTE! No se encontraron discrepancias.\n');
      console.log(`✓ ${productos_ok.length} productos con stock sincronizado correctamente\n`);
    } else {
      console.log(`⚠️  DISCREPANCIAS ENCONTRADAS: ${discrepancias.length} productos\n`);
      console.log('═══════════════════════════════════════════════════════════\n');
      
      // Mostrar los 10 primeros
      const top10 = discrepancias.slice(0, 10);
      
      console.table(top10.map(d => ({
        'Código': d.codigo,
        'Nombre': d.nombre.substring(0, 40),
        'Stock Legacy (BD)': d.stockLegacy,
        'Stock Real (Agregado)': d.stockReal,
        'Diferencia': d.diferencia
      })));

      if (discrepancias.length > 10) {
        console.log(`\n... y ${discrepancias.length - 10} productos más con discrepancias\n`);
      }

      // Estadísticas
      const maxDiscrepancia = Math.max(...discrepancias.map(d => Math.abs(d.diferencia)));
      const promedioDiferencia = discrepancias.reduce((sum, d) => sum + Math.abs(d.diferencia), 0) / discrepancias.length;
      
      console.log('\n📊 ESTADÍSTICAS:');
      console.log(`   • Máxima discrepancia: ${maxDiscrepancia} unidades`);
      console.log(`   • Promedio de diferencia: ${promedioDiferencia.toFixed(2)} unidades`);
      console.log(`   • Productos correctos: ${productos_ok.length}/${products.length}\n`);
    }

    // 4. Verificar endpoint de API
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🌐 Verificando endpoint /api/productos...\n');
    
    try {
      const response = await axios.get('http://localhost:3001/api/productos?limit=5', {
        headers: {
          'Authorization': `Bearer ${process.env.TEST_TOKEN || ''}`
        }
      });

      if (response.data.success && response.data.data?.products) {
        const apiProducts = response.data.data.products;
        console.log(`✅ Endpoint respondió correctamente con ${apiProducts.length} productos\n`);
        
        // Verificar que el stock devuelto sea el correcto
        console.log('📋 Muestra de productos del endpoint:\n');
        console.table(apiProducts.map(p => ({
          'Código': p.codigo,
          'Nombre': p.nombre?.substring(0, 30),
          'initialStock': p.initialStock || 0,
          'currentStock': p.currentStock || 0,
          'stock (legacy)': p.stock || 0
        })));
        
        console.log('\n💡 Verificar que initialStock/currentStock coincidan con el stock real\n');
      }
    } catch (error) {
      console.log('⚠️  No se pudo verificar el endpoint (servidor no disponible o sin autenticación)\n');
      console.log(`   Error: ${error.message}\n`);
    }

    // 5. Recomendaciones
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📝 RECOMENDACIONES:\n');
    
    if (discrepancias.length > 0) {
      console.log('1. ⚠️  Se detectaron discrepancias entre Product.stock y StockByWarehouse');
      console.log('   → Esto es NORMAL si ha habido movimientos de inventario');
      console.log('   → El campo Product.stock es LEGACY y NO se sincroniza automáticamente\n');
      
      console.log('2. ✅ SOLUCIÓN: El backend ya calcula el stock correcto');
      console.log('   → productService.listPaginated() agrega el stock desde stockByWarehouses');
      console.log('   → El frontend debe usar product.initialStock, NO product.stock\n');
      
      console.log('3. 🔧 ACCIÓN SUGERIDA: Ejecutar script de sincronización');
      console.log('   → Crear script para actualizar Product.stock con el valor real');
      console.log('   → O deprecar definitivamente el campo Product.stock\n');
      
      console.log('4. 📊 VERIFICAR: Páginas del frontend');
      console.log('   → Lista de Productos: debe usar product.initialStock ✓');
      console.log('   → Stock de Inventario: usa stockByWarehouse.quantity ✓\n');
    } else {
      console.log('1. ✅ Todos los stocks están sincronizados correctamente\n');
      console.log('2. 💡 Mantener vigilancia sobre futuras discrepancias\n');
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    // 6. Generar archivo JSON con resultados
    const reporte = {
      fecha: new Date().toISOString(),
      totalProductos: products.length,
      productosOk: productos_ok.length,
      discrepancias: discrepancias.length,
      detalleDiscrepancias: discrepancias,
      estadisticas: discrepancias.length > 0 ? {
        maxDiscrepancia: Math.max(...discrepancias.map(d => Math.abs(d.diferencia))),
        promedioDiferencia: discrepancias.reduce((sum, d) => sum + Math.abs(d.diferencia), 0) / discrepancias.length
      } : null
    };

    const fs = require('fs');
    const reportePath = './reporte-integridad-stock.json';
    fs.writeFileSync(reportePath, JSON.stringify(reporte, null, 2), 'utf-8');
    console.log(`📄 Reporte detallado guardado en: ${reportePath}\n`);

    return reporte;

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
if (require.main === module) {
  verificarIntegridadStock()
    .then(() => {
      console.log('✅ Verificación completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { verificarIntegridadStock };
