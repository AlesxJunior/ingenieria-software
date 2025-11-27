/**
 * Verificar registros de SalePayment en la base de datos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSalePayments() {
  console.log('🔍 Verificando registros de SalePayment...\n');

  try {
    // Obtener la última venta creada
    const lastSale = await prisma.sale.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        payments: true,
      }
    });

    if (!lastSale) {
      console.log('❌ No se encontraron ventas');
      return;
    }

    console.log('📊 Última venta:');
    console.log(`  ID: ${lastSale.id}`);
    console.log(`  Código: ${lastSale.codigoVenta}`);
    console.log(`  Total: S/ ${lastSale.total}`);
    console.log(`  FormaPago: ${lastSale.formaPago || 'null'}`);
    console.log(`\n💳 SalePayments encontrados: ${lastSale.payments?.length || 0}`);

    if (lastSale.payments && lastSale.payments.length > 0) {
      lastSale.payments.forEach((p, i) => {
        console.log(`\n  [${i + 1}]:`);
        console.log(`    ID: ${p.id}`);
        console.log(`    Método: ${p.metodoPago}`);
        console.log(`    Monto: S/ ${p.monto}`);
        console.log(`    Referencia: ${p.referencia || 'N/A'}`);
        console.log(`    Orden: ${p.orden}`);
      });
    } else {
      console.log('\n⚠️ Esta venta NO tiene registros de SalePayment');
    }

    // Contar todas las ventas y sus pagos
    const totalSales = await prisma.sale.count();
    const totalPayments = await prisma.salePayment.count();

    console.log('\n' + '='.repeat(60));
    console.log(`📈 ESTADÍSTICAS GENERALES:`);
    console.log(`   Total ventas: ${totalSales}`);
    console.log(`   Total SalePayments: ${totalPayments}`);
    console.log(`   Promedio pagos por venta: ${(totalPayments / totalSales).toFixed(2)}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSalePayments();
