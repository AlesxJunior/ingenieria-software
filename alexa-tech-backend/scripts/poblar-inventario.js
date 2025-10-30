// Script para poblar datos de prueba y verificar inventario
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function poblarDatosInventario() {
  try {
    console.log('🚀 Iniciando población de datos de inventario...\n');

    // 1. Verificar almacenes
    let almacenes = await prisma.warehouse.findMany();
    console.log(`📦 Almacenes encontrados: ${almacenes.length}`);
    
    if (almacenes.length === 0) {
      console.log('⚠️  No hay almacenes. Creando almacenes de prueba...');
      almacenes = await Promise.all([
        prisma.warehouse.create({
          data: {
            codigo: 'ALM-01',
            nombre: 'Almacén Principal',
            direccion: 'Av. Principal 123',
            activo: true
          }
        }),
        prisma.warehouse.create({
          data: {
            codigo: 'ALM-02',
            nombre: 'Almacén Secundario',
            direccion: 'Calle Secundaria 456',
            activo: true
          }
        })
      ]);
      console.log('✅ Almacenes creados');
    }

    // 2. Verificar productos
    const productos = await prisma.product.findMany({ take: 5 });
    console.log(`📦 Productos encontrados: ${productos.length}`);
    
    if (productos.length === 0) {
      console.log('❌ No hay productos. Por favor ejecuta el seed primero.');
      return;
    }

    // 3. Crear/actualizar stock para cada producto en cada almacén
    console.log('\n📊 Creando registros de stock...');
    const primerUsuario = await prisma.user.findFirst();
    
    for (const producto of productos) {
      for (const almacen of almacenes) {
        // Verificar si ya existe
        const stockExistente = await prisma.stockByWarehouse.findUnique({
          where: {
            productId_warehouseId: {
              productId: producto.id,
              warehouseId: almacen.id
            }
          }
        });

        const cantidadAleatoria = Math.floor(Math.random() * 50) + 10;
        const stockAnterior = stockExistente?.quantity || 0;

        if (!stockExistente) {
          await prisma.stockByWarehouse.create({
            data: {
              productId: producto.id,
              warehouseId: almacen.id,
              quantity: cantidadAleatoria,
              minStock: 5
            }
          });
          console.log(`✅ Stock creado: ${producto.nombre} en ${almacen.nombre} - Cantidad: ${cantidadAleatoria}`);
        } else {
          await prisma.stockByWarehouse.update({
            where: {
              productId_warehouseId: {
                productId: producto.id,
                warehouseId: almacen.id
              }
            },
            data: {
              quantity: cantidadAleatoria
            }
          });
          console.log(`🔄 Stock actualizado: ${producto.nombre} en ${almacen.nombre} - Cantidad: ${cantidadAleatoria}`);
        }

        // Crear movimiento de entrada
        await prisma.inventoryMovement.create({
          data: {
            productId: producto.id,
            warehouseId: almacen.id,
            type: 'ENTRADA',
            quantity: cantidadAleatoria,
            stockBefore: stockAnterior,
            stockAfter: cantidadAleatoria,
            reason: 'Población inicial de datos',
            documentRef: null,
            userId: primerUsuario?.id || null
          }
        });
      }
    }

    // 4. Verificar resultados
    console.log('\n📋 Resumen de datos creados:');
    const totalStock = await prisma.inventory.count();
    const totalMovimientos = await prisma.inventoryMovement.count();
    const totalAlmacenes = await prisma.warehouse.count();
    
    console.log(`✅ Total de almacenes: ${totalAlmacenes}`);
    console.log(`✅ Total de registros de stock: ${totalStock}`);
    console.log(`✅ Total de movimientos: ${totalMovimientos}`);

    console.log('\n🎉 Población completada exitosamente!');
    console.log('\n📌 Ahora puedes:');
    console.log('1. Abrir el frontend en http://localhost:5173');
    console.log('2. Ir a Inventario → Stock o Kardex');
    console.log('3. Ver los datos poblados');

  } catch (error) {
    console.error('❌ Error poblando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

poblarDatosInventario();
