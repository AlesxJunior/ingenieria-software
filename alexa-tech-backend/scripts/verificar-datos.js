const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarDatos() {
  console.log('='.repeat(60));
  console.log('VERIFICACIÓN DE DATOS');
  console.log('='.repeat(60));
  
  // 1. Motivos de Movimiento
  const motivos = await prisma.movementReason.findMany();
  console.log(`\n📋 Motivos de Movimiento: ${motivos.length}`);
  if (motivos.length === 0) {
    console.log('   ❌ NO HAY MOTIVOS DE MOVIMIENTO');
  } else {
    motivos.forEach(m => console.log(`   - ${m.codigo}: ${m.nombre} (${m.tipo})`));
  }
  
  // 2. Compras
  const compras = await prisma.purchase.findMany();
  console.log(`\n🛒 Compras: ${compras.length}`);
  if (compras.length === 0) {
    console.log('   ❌ NO HAY COMPRAS');
  } else {
    compras.slice(0, 5).forEach(c => console.log(`   - ${c.codigoCompra}: S/ ${Number(c.total).toFixed(2)} (${c.estado})`));
    if (compras.length > 5) console.log(`   ... y ${compras.length - 5} más`);
  }
  
  // 3. Proveedores
  const proveedores = await prisma.entidad.findMany({
    where: { tipo: 'Proveedor' }
  });
  console.log(`\n👥 Proveedores: ${proveedores.length}`);
  if (proveedores.length === 0) {
    console.log('   ❌ NO HAY PROVEEDORES');
  }
  
  // 4. Almacenes
  const almacenes = await prisma.warehouse.findMany();
  console.log(`\n🏢 Almacenes: ${almacenes.length}`);
  if (almacenes.length === 0) {
    console.log('   ❌ NO HAY ALMACENES');
  }
  
  await prisma.$disconnect();
}

verificarDatos().catch(console.error);
