/**
 * Script: Consultar Proveedores Reales
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function consultarDatos() {
  try {
    console.log('🔍 Consultando proveedores en la tabla Client...\n');

    const proveedores = await prisma.client.findMany({
      where: {
        OR: [
          { tipoEntidad: 'Proveedor' },
          { tipoEntidad: 'Ambos' }
        ]
      },
      select: {
        id: true,
        tipoEntidad: true,
        tipoDocumento: true,
        numeroDocumento: true,
        razonSocial: true,
        nombres: true,
        apellidos: true,
        email: true,
        telefono: true,
        direccion: true,
      }
    });

    console.log(`✅ Proveedores encontrados: ${proveedores.length}\n`);
    console.log('=' .repeat(80));
    
    proveedores.forEach((prov, index) => {
      const nombre = prov.razonSocial || `${prov.nombres} ${prov.apellidos}`;
      console.log(`${index + 1}. ${nombre}`);
      console.log(`   ID: ${prov.id}`);
      console.log(`   Tipo: ${prov.tipoEntidad}`);
      console.log(`   Doc: ${prov.tipoDocumento} - ${prov.numeroDocumento}`);
      console.log(`   Email: ${prov.email}`);
      console.log(`   Teléfono: ${prov.telefono}`);
      console.log('   ' + '-'.repeat(70));
    });

    console.log('\n🔍 Consultando compras actuales...\n');

    const compras = await prisma.purchase.findMany({
      select: {
        id: true,
        codigoOrden: true,
        proveedorId: true,
        total: true,
        estado: true,
      },
      orderBy: { codigoOrden: 'asc' }
    });

    console.log(`📦 Compras encontradas: ${compras.length}\n`);
    console.log('=' .repeat(80));
    
    compras.forEach((compra, index) => {
      console.log(`${index + 1}. ${compra.codigoOrden}`);
      console.log(`   Proveedor ID: ${compra.proveedorId}`);
      console.log(`   Total: S/ ${Number(compra.total).toFixed(2)}`);
      console.log(`   Estado: ${compra.estado}`);
      console.log('   ' + '-'.repeat(70));
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

consultarDatos();
