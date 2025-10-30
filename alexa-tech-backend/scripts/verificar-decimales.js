const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarDecimales() {
  console.log('\n🔍 Verificando decimales en compras...\n');

  try {
    const compras = await prisma.purchase.findMany({
      take: 5,
      orderBy: { fechaEmision: 'desc' },
      include: { items: true },
    });

    console.log('📋 Muestra de 5 compras recientes:\n');
    
    compras.forEach(c => {
      console.log(`${c.codigoOrden}:`);
      console.log(`  Subtotal: S/. ${c.subtotal}`);
      console.log(`  Descuento: S/. ${c.descuento}`);
      console.log(`  Total: S/. ${c.total}`);
      console.log(`  Items:`);
      c.items.forEach(i => {
        console.log(`    - ${i.nombreProducto}: ${i.cantidad} x S/. ${i.precioUnitario} = S/. ${i.subtotal}`);
      });
      console.log('');
    });

    // Verificar que todos tengan máximo 2 decimales
    const todasLasCompras = await prisma.purchase.findMany({
      include: { items: true },
    });

    let errores = 0;
    todasLasCompras.forEach(c => {
      const checkDecimal = (valor, campo, codigo) => {
        const str = valor.toString();
        const decimals = str.includes('.') ? str.split('.')[1].length : 0;
        if (decimals > 2) {
          console.log(`⚠️  ${codigo} - ${campo}: ${decimals} decimales (${valor})`);
          errores++;
        }
      };

      checkDecimal(c.subtotal, 'Subtotal', c.codigoOrden);
      checkDecimal(c.descuento, 'Descuento', c.codigoOrden);
      checkDecimal(c.total, 'Total', c.codigoOrden);

      c.items.forEach(i => {
        checkDecimal(i.precioUnitario, 'Precio Unit.', `${c.codigoOrden} - Item`);
        checkDecimal(i.subtotal, 'Subtotal Item', `${c.codigoOrden} - Item`);
      });
    });

    if (errores === 0) {
      console.log('✅ Todos los valores tienen máximo 2 decimales\n');
    } else {
      console.log(`\n⚠️  Se encontraron ${errores} valores con más de 2 decimales\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

verificarDecimales()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
