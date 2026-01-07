/**
 * Script: Actualizar Proveedores en Compras Existentes
 * 
 * Actualiza las 3 compras con los IDs reales de proveedores de la tabla Client
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function actualizarProveedores() {
  console.log('🔄 Actualizando proveedores en compras existentes...\n');

  try {
    // Obtener los proveedores reales
    const proveedores = await prisma.client.findMany({
      where: {
        OR: [
          { tipoEntidad: 'Proveedor' },
          { tipoEntidad: 'Ambos' }
        ]
      },
      select: {
        id: true,
        razonSocial: true,
      }
    });

    console.log('📋 Proveedores encontrados:');
    proveedores.forEach(p => console.log(`   - ${p.razonSocial}: ${p.id}`));
    console.log('');

    // Mapear por razón social
    const proveedorMap = {};
    proveedores.forEach(p => {
      proveedorMap[p.razonSocial] = p.id;
    });

    const actualizaciones = [
      {
        codigoOrden: 'ORD-2025-001',
        razonSocial: 'Global Supplies S.R.L.',
      },
      {
        codigoOrden: 'ORD-2025-002',
        razonSocial: 'Distribuidora del Norte S.A.C.',
      },
      {
        codigoOrden: 'ORD-2025-003',
        razonSocial: 'Importaciones Rápidas E.I.R.L.',
      },
    ];

    let actualizadas = 0;

    for (const update of actualizaciones) {
      const proveedorId = proveedorMap[update.razonSocial];
      
      if (!proveedorId) {
        console.log(`❌ ${update.codigoOrden}: Proveedor "${update.razonSocial}" no encontrado`);
        continue;
      }

      const compra = await prisma.purchase.findFirst({
        where: { codigoOrden: update.codigoOrden }
      });

      if (compra) {
        await prisma.purchase.update({
          where: { id: compra.id },
          data: { proveedorId: proveedorId }
        });
        
        console.log(`✅ ${update.codigoOrden}: ${compra.proveedorId} → ${update.razonSocial}`);
        actualizadas++;
      } else {
        console.log(`⏭️  ${update.codigoOrden}: No encontrada`);
      }
    }

    console.log(`\n✅ Compras actualizadas: ${actualizadas}/3`);

    // Verificación con nombres
    console.log('\n📋 Verificando cambios...\n');
    const compras = await prisma.purchase.findMany({
      where: {
        codigoOrden: {
          in: ['ORD-2025-001', 'ORD-2025-002', 'ORD-2025-003']
        }
      },
      orderBy: { codigoOrden: 'asc' }
    });

    for (const compra of compras) {
      const proveedor = await prisma.client.findUnique({
        where: { id: compra.proveedorId },
        select: { razonSocial: true }
      });
      
      const nombreProveedor = proveedor ? proveedor.razonSocial : compra.proveedorId;
      console.log(`${compra.codigoOrden}: ${nombreProveedor} - S/ ${Number(compra.total).toFixed(2)}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

actualizarProveedores()
  .then(() => {
    console.log('\n🎉 ¡Actualización completada!');
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
