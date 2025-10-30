const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listarProveedores() {
  try {
    const proveedores = await prisma.client.findMany({
      where: { tipoEntidad: { in: ['Proveedor', 'Ambos'] } },
    });

    console.log(`\n📋 Proveedores encontrados: ${proveedores.length}\n`);
    proveedores.forEach(p => {
      const nombre = p.razonSocial || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Sin nombre';
      console.log(`  • ${nombre}`);
      console.log(`    ID: ${p.id}`);
      console.log(`    Doc: ${p.tipoDocumento} - ${p.numeroDocumento}`);
      console.log(`    Tipo: ${p.tipoEntidad}\n`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

listarProveedores();
