/**
 * Script de Sincronización de Stock Legacy
 * 
 * Este script actualiza el campo Product.stock (legacy) 
 * con el valor real calculado desde StockByWarehouse.
 * 
 * ⚠️ ADVERTENCIA: Este es un parche temporal.
 * La solución real es deprecar Product.stock y usar siempre stockByWarehouses.
 * 
 * USO:
 *   node sincronizar-stock-legacy.js [--dry-run] [--product=CODIGO]
 * 
 * OPCIONES:
 *   --dry-run       : Simula la operación sin hacer cambios
 *   --product=CODE  : Sincroniza solo el producto especificado
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function sincronizarStockLegacy(options = {}) {
  const { dryRun = false, productCode = null } = options;
  
  console.log('🔄 Sincronización de Stock Legacy\n');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  if (dryRun) {
    console.log('⚠️  MODO SIMULACIÓN (--dry-run): No se realizarán cambios\n');
  }
  
  try {
    // 1. Obtener productos a sincronizar
    const where = productCode 
      ? { codigo: productCode, estado: true }
      : { estado: true };
    
    const products = await prisma.product.findMany({
      where,
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

    if (products.length === 0) {
      if (productCode) {
        console.log(`❌ No se encontró el producto con código: ${productCode}\n`);
      } else {
        console.log('❌ No hay productos activos para sincronizar\n');
      }
      return { success: false, actualizados: 0 };
    }

    console.log(`📦 Productos a procesar: ${products.length}\n`);
    console.log('Analizando discrepancias...\n');

    // 2. Identificar productos con discrepancias
    const actualizaciones = [];
    
    for (const product of products) {
      const stockReal = product.stockByWarehouses.reduce(
        (sum, stock) => sum + stock.quantity, 
        0
      );
      
      const stockLegacy = product.stock;
      
      if (stockReal !== stockLegacy) {
        actualizaciones.push({
          id: product.id,
          codigo: product.codigo,
          nombre: product.nombre,
          stockLegacy,
          stockReal,
          diferencia: stockReal - stockLegacy
        });
      }
    }

    // 3. Mostrar resumen
    if (actualizaciones.length === 0) {
      console.log('✅ ¡Perfecto! Todos los productos están sincronizados\n');
      console.log(`✓ ${products.length} productos verificados\n`);
      return { success: true, actualizados: 0 };
    }

    console.log(`⚠️  Productos con discrepancias: ${actualizaciones.length}\n`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // Mostrar tabla con los primeros 20
    const muestra = actualizaciones.slice(0, 20);
    console.table(muestra.map(p => ({
      'Código': p.codigo,
      'Nombre': p.nombre.substring(0, 35),
      'Stock Actual (BD)': p.stockLegacy,
      'Stock Real': p.stockReal,
      'Diferencia': p.diferencia
    })));

    if (actualizaciones.length > 20) {
      console.log(`\n... y ${actualizaciones.length - 20} productos más\n`);
    }

    // 4. Realizar actualizaciones
    if (!dryRun) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('💾 Actualizando base de datos...\n');
      
      let actualizados = 0;
      let errores = 0;

      for (const item of actualizaciones) {
        try {
          await prisma.product.update({
            where: { id: item.id },
            data: { 
              stock: item.stockReal,
              updatedAt: new Date()
            }
          });
          actualizados++;
          
          if (actualizados % 10 === 0) {
            process.stdout.write(`\r   Procesando: ${actualizados}/${actualizaciones.length}`);
          }
        } catch (error) {
          console.error(`\n❌ Error actualizando ${item.codigo}:`, error.message);
          errores++;
        }
      }

      console.log(`\r✅ Actualización completada: ${actualizados}/${actualizaciones.length}`);
      
      if (errores > 0) {
        console.log(`⚠️  Errores encontrados: ${errores}`);
      }
      
      console.log('\n═══════════════════════════════════════════════════════════\n');
      console.log('📊 RESUMEN:');
      console.log(`   • Productos verificados: ${products.length}`);
      console.log(`   • Actualizaciones exitosas: ${actualizados}`);
      console.log(`   • Errores: ${errores}`);
      console.log(`   • Productos ya sincronizados: ${products.length - actualizaciones.length}\n`);

      // 5. Verificar actualizaciones
      console.log('🔍 Verificando actualizaciones...\n');
      
      const productosActualizados = await prisma.product.findMany({
        where: { 
          id: { in: actualizaciones.map(p => p.id) }
        },
        include: {
          stockByWarehouses: {
            select: { quantity: true }
          }
        }
      });

      const todosOk = productosActualizados.every(p => {
        const stockReal = p.stockByWarehouses.reduce((sum, s) => sum + s.quantity, 0);
        return p.stock === stockReal;
      });

      if (todosOk) {
        console.log('✅ Verificación exitosa: Todos los stocks están sincronizados\n');
      } else {
        console.log('⚠️  Advertencia: Algunos productos aún tienen discrepancias\n');
      }

      return { 
        success: true, 
        actualizados, 
        errores,
        total: products.length 
      };

    } else {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('ℹ️  SIMULACIÓN: No se realizaron cambios\n');
      console.log('Para aplicar los cambios, ejecutar sin --dry-run:\n');
      console.log('   node sincronizar-stock-legacy.js\n');
      
      return { 
        success: true, 
        actualizados: 0,
        pendientes: actualizaciones.length 
      };
    }

  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Parsear argumentos de línea de comandos
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    productCode: null
  };

  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--product=')) {
      options.productCode = arg.split('=')[1];
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Script de Sincronización de Stock Legacy

USO:
  node sincronizar-stock-legacy.js [opciones]

OPCIONES:
  --dry-run              Simula la operación sin hacer cambios
  --product=CODIGO       Sincroniza solo el producto especificado
  --help, -h             Muestra esta ayuda

EJEMPLOS:
  # Simular sincronización de todos los productos
  node sincronizar-stock-legacy.js --dry-run

  # Sincronizar todos los productos
  node sincronizar-stock-legacy.js

  # Sincronizar un producto específico
  node sincronizar-stock-legacy.js --product=AP-TPL-001

  # Simular sincronización de un producto
  node sincronizar-stock-legacy.js --dry-run --product=AP-TPL-001
      `);
      process.exit(0);
    }
  }

  return options;
}

// Ejecutar script
if (require.main === module) {
  const options = parseArgs();
  
  sincronizarStockLegacy(options)
    .then((result) => {
      if (result.success) {
        console.log('✅ Script ejecutado exitosamente\n');
        process.exit(0);
      } else {
        console.log('⚠️  Script finalizado con advertencias\n');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { sincronizarStockLegacy };
