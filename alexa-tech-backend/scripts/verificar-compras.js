const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarCompras() {
  console.log('\n📋 Verificando compras en la base de datos...\n');

  try {
    const compras = await prisma.purchase.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        usuario: true,
      },
      orderBy: { fechaEmision: 'desc' },
    });

    console.log(`✅ Total de compras encontradas: ${compras.length}\n`);

    if (compras.length === 0) {
      console.log('⚠️  No hay compras en la base de datos');
      return;
    }

    // Obtener proveedores y almacenes para mostrar nombres
    const proveedoresMap = {};
    const almacenesMap = {};

    const proveedores = await prisma.client.findMany();
    proveedores.forEach(p => { 
      const nombre = p.razonSocial || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Sin nombre';
      proveedoresMap[p.id] = nombre; 
    });

    const almacenes = await prisma.warehouse.findMany();
    almacenes.forEach(a => { almacenesMap[a.id] = a.nombre; });

    console.log('📦 Detalles de las compras:\n');
    compras.forEach((compra, index) => {
      console.log(`${index + 1}. ${compra.codigoOrden}`);
      console.log(`   Estado: ${compra.estado}`);
      console.log(`   Proveedor: ${proveedoresMap[compra.proveedorId] || 'N/A'}`);
      console.log(`   Almacén: ${almacenesMap[compra.almacenId] || 'N/A'}`);
      console.log(`   Fecha: ${compra.fechaEmision.toLocaleDateString()}`);
      console.log(`   Tipo Comprobante: ${compra.tipoComprobante || 'N/A'}`);
      console.log(`   Forma de Pago: ${compra.formaPago || 'N/A'}`);
      console.log(`   Items: ${compra.items.length}`);
      console.log(`   Total: S/. ${Number(compra.total).toFixed(2)}`);
      console.log('');
    });

    // Resumen por estado
    const resumenEstado = compras.reduce((acc, c) => {
      acc[c.estado] = (acc[c.estado] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Resumen por estado:');
    Object.entries(resumenEstado).forEach(([estado, count]) => {
      console.log(`   - ${estado}: ${count} compras`);
    });

    // Resumen por forma de pago
    const resumenPago = compras.reduce((acc, c) => {
      const forma = c.formaPago || 'Sin especificar';
      acc[forma] = (acc[forma] || 0) + 1;
      return acc;
    }, {});

    console.log('\n💳 Resumen por forma de pago:');
    Object.entries(resumenPago).forEach(([forma, count]) => {
      console.log(`   - ${forma}: ${count} compras`);
    });

    // Total de items
    const totalItems = compras.reduce((sum, c) => sum + c.items.length, 0);
    const totalGeneral = compras.reduce((sum, c) => sum + Number(c.total), 0);

    console.log(`\n📦 Total de items: ${totalItems}`);
    console.log(`💰 Total general: S/. ${totalGeneral.toFixed(2)}\n`);

  } catch (error) {
    console.error('❌ Error al verificar compras:', error);
    throw error;
  }
}

verificarCompras()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
