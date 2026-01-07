#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const codigo = process.argv[2] || 'TEST-STOCK-002';
  console.log('Verifying product:', codigo);

  const product = await prisma.product.findUnique({
    where: { codigo },
    include: { categoria: true, unidadMedida: true }
  });

  if (!product) {
    console.error('Product not found:', codigo);
    process.exit(2);
  }

  console.log('Product found:');
  console.log({ id: product.id, codigo: product.codigo, nombre: product.nombre });
  console.log('Categoria relation:', product.categoria ? { id: product.categoria.id, nombre: product.categoria.nombre } : null);
  console.log('Unidad relation:', product.unidadMedida ? { id: product.unidadMedida.id, nombre: product.unidadMedida.nombre } : null);

  const stocks = await prisma.stockByWarehouse.findMany({ where: { productId: product.id } });
  console.log('StockByWarehouse entries:', stocks.length);
  stocks.forEach(s => console.log({ warehouseId: s.warehouseId, quantity: s.quantity }));

  const movements = await prisma.inventoryMovement.findMany({ where: { productId: product.id }, orderBy: { createdAt: 'desc' } });
  console.log('InventoryMovements:', movements.length);
  movements.slice(0,10).forEach(m => console.log({ id: m.id, type: m.type || m.tipo || m.movementType, quantity: m.quantity || m.cantidad, reason: m.reason || m.motivo, stockBefore: m.stockBefore || m.stockAntes, stockAfter: m.stockAfter || m.stockDespues, createdAt: m.createdAt }));

  // Basic validations
  const hasStock = stocks.reduce((acc, s) => acc + (s.quantity || 0), 0);
  console.log('Total stock across warehouses:', hasStock);

  if (hasStock > 0 && movements.length === 0) {
    console.error('ERROR: Stock present but no inventory movement recorded');
    process.exit(3);
  }

  console.log('Verification complete.');
  process.exit(0);
}

main().catch(e => {
  console.error('Error running verification:', e);
  process.exit(1);
});
