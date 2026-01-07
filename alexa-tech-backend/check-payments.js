const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const sale = await prisma.sale.findFirst({
      where: { codigoVenta: { startsWith: 'B001-00000' } },
      include: { payments: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('=== ÚLTIMA VENTA ===');
    console.log('Código:', sale.codigoVenta);
    console.log('formaPago:', sale.formaPago);
    console.log('Número de payments:', sale.payments?.length || 0);
    console.log('payments:', JSON.stringify(sale.payments, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
})();
