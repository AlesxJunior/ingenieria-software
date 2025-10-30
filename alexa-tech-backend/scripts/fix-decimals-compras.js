const { PrismaClient } = require('@prisma/client');
const { Decimal } = require('@prisma/client/runtime/library');
const prisma = new PrismaClient();

async function fixDecimales() {
  console.log('\n🔧 Corrigiendo decimales en compras...\n');

  try {
    // Obtener todas las compras con sus items
    const compras = await prisma.purchase.findMany({
      include: {
        items: true,
      },
    });

    console.log(`📦 Procesando ${compras.length} compras...\n`);

    let comprasActualizadas = 0;
    let itemsActualizados = 0;

    for (const compra of compras) {
      // Actualizar items primero
      for (const item of compra.items) {
        const precioUnitario = new Decimal(Number(item.precioUnitario).toFixed(2));
        const subtotalItem = new Decimal((item.cantidad * Number(precioUnitario)).toFixed(2));

        await prisma.purchaseItem.update({
          where: { id: item.id },
          data: {
            precioUnitario,
            subtotal: subtotalItem,
          },
        });

        itemsActualizados++;
      }

      // Recalcular totales de la compra
      const itemsActualizadosCompra = await prisma.purchaseItem.findMany({
        where: { purchaseId: compra.id },
      });

      let subtotalCompra = 0;
      itemsActualizadosCompra.forEach(item => {
        subtotalCompra += Number(item.subtotal);
      });

      // Redondear a 2 decimales
      subtotalCompra = Number(subtotalCompra.toFixed(2));
      
      // Recalcular descuento manteniendo el porcentaje aproximado
      const descuentoOriginal = Number(compra.descuento);
      const subtotalOriginal = Number(compra.subtotal);
      const porcentajeDescuento = subtotalOriginal > 0 ? (descuentoOriginal / subtotalOriginal) : 0;
      
      const descuento = Number((subtotalCompra * porcentajeDescuento).toFixed(2));
      const total = Number((subtotalCompra - descuento).toFixed(2));

      // Actualizar compra usando Decimal
      await prisma.purchase.update({
        where: { id: compra.id },
        data: {
          subtotal: new Decimal(subtotalCompra.toFixed(2)),
          descuento: new Decimal(descuento.toFixed(2)),
          total: new Decimal(total.toFixed(2)),
        },
      });

      comprasActualizadas++;
      console.log(`✅ ${compra.codigoOrden}: Subtotal: S/. ${subtotalCompra.toFixed(2)}, Descuento: S/. ${descuento.toFixed(2)}, Total: S/. ${total.toFixed(2)}`);
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   - ${comprasActualizadas} compras actualizadas`);
    console.log(`   - ${itemsActualizados} items actualizados`);
    console.log(`   - Todos los valores ahora tienen 2 decimales\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

fixDecimales()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
