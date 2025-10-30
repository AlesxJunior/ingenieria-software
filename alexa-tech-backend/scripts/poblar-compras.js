const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function poblarCompras() {
  console.log('\n🏪 Poblando base de datos con compras de prueba...\n');

  try {
    // Obtener proveedores, productos y almacenes existentes
    const proveedores = await prisma.client.findMany({
      where: { tipoEntidad: { in: ['Proveedor', 'Ambos'] } },
      take: 5,
    });

    const productos = await prisma.product.findMany({
      where: { estado: true },
      take: 20,
    });

    const almacenes = await prisma.warehouse.findMany({
      where: { activo: true },
      take: 3,
    });

    const usuarios = await prisma.user.findMany({ take: 1 });

    if (proveedores.length === 0 || productos.length === 0 || almacenes.length === 0) {
      console.log('❌ No hay suficientes datos base (proveedores, productos o almacenes)');
      return;
    }

    console.log(`📦 Datos encontrados:`);
    console.log(`   - ${proveedores.length} proveedores`);
    console.log(`   - ${productos.length} productos`);
    console.log(`   - ${almacenes.length} almacenes\n`);

    // Generar compras con diferentes estados
    const estadosCompra = ['Pendiente', 'Recibida', 'Cancelada'];
    const formasPago = ['Efectivo', 'Tarjeta', 'Transferencia'];
    const tiposComprobante = ['Factura', 'Boleta', 'GuiaRemision'];

    const comprasCreadas = [];

    for (let i = 0; i < 15; i++) {
      const proveedor = proveedores[Math.floor(Math.random() * proveedores.length)];
      const almacen = almacenes[Math.floor(Math.random() * almacenes.length)];
      const estado = estadosCompra[Math.floor(Math.random() * estadosCompra.length)];
      const formaPago = formasPago[Math.floor(Math.random() * formasPago.length)];
      const tipoComprobante = tiposComprobante[Math.floor(Math.random() * tiposComprobante.length)];

      // Generar fecha de emisión aleatoria en los últimos 30 días
      const fechaEmision = new Date();
      fechaEmision.setDate(fechaEmision.getDate() - Math.floor(Math.random() * 30));

      // Fecha de entrega estimada 7-15 días después de la emisión
      const fechaEntrega = new Date(fechaEmision);
      fechaEntrega.setDate(fechaEntrega.getDate() + 7 + Math.floor(Math.random() * 8));

      // Generar código de orden único
      const fecha = fechaEmision.toISOString().split('T')[0].replace(/-/g, '');
      const codigoOrden = `OC-${fecha}-${String(i + 1).padStart(4, '0')}`;

      // Generar 2-5 items por compra
      const numItems = 2 + Math.floor(Math.random() * 4);
      const itemsData = [];
      let subtotalCompra = 0;

      for (let j = 0; j < numItems; j++) {
        const producto = productos[Math.floor(Math.random() * productos.length)];
        const cantidad = 5 + Math.floor(Math.random() * 20); // 5-24 unidades
        const precioUnitario = parseFloat((50 + Math.random() * 450).toFixed(2)); // S/. 50-500
        const subtotalItem = parseFloat((cantidad * precioUnitario).toFixed(2));

        itemsData.push({
          productCodigo: producto.codigo,
          nombreProducto: producto.nombre,
          cantidad,
          precioUnitario,
          subtotal: subtotalItem,
        });

        subtotalCompra += subtotalItem;
      }

      // Redondear subtotal a 2 decimales
      subtotalCompra = parseFloat(subtotalCompra.toFixed(2));

      // Aplicar descuento aleatorio (0-15%)
      const descuentoPorcentaje = Math.floor(Math.random() * 16);
      const descuento = parseFloat(((subtotalCompra * descuentoPorcentaje) / 100).toFixed(2));
      const total = parseFloat((subtotalCompra - descuento).toFixed(2));

      // Crear compra
      const compra = await prisma.purchase.create({
        data: {
          codigoOrden,
          proveedorId: proveedor.id,
          almacenId: almacen.id,
          fechaEmision,
          fechaEntregaEstimada: fechaEntrega,
          tipoComprobante,
          formaPago,
          subtotal: subtotalCompra,
          descuento,
          total,
          estado,
          observaciones: i % 3 === 0 ? `Compra de prueba ${i + 1} - Entrega programada` : null,
          usuarioId: usuarios[0]?.id || null,
          items: {
            create: itemsData,
          },
        },
        include: {
          items: true,
        },
      });

      comprasCreadas.push(compra);
      console.log(`✅ Compra ${i + 1}/15: ${codigoOrden} - ${estado} - ${itemsData.length} items - S/. ${total.toFixed(2)}`);
    }

    console.log(`\n🎉 ${comprasCreadas.length} compras creadas exitosamente\n`);

    // Resumen por estado
    const resumen = comprasCreadas.reduce((acc, c) => {
      acc[c.estado] = (acc[c.estado] || 0) + 1;
      return acc;
    }, {});

    console.log('📊 Resumen por estado:');
    Object.entries(resumen).forEach(([estado, count]) => {
      console.log(`   - ${estado}: ${count} compras`);
    });

    // Resumen financiero
    const totalGeneral = comprasCreadas.reduce((sum, c) => sum + Number(c.total), 0);
    const totalDescuentos = comprasCreadas.reduce((sum, c) => sum + Number(c.descuento), 0);
    console.log(`\n💰 Resumen financiero:`);
    console.log(`   - Subtotal: S/. ${(totalGeneral + totalDescuentos).toFixed(2)}`);
    console.log(`   - Descuentos: S/. ${totalDescuentos.toFixed(2)}`);
    console.log(`   - Total: S/. ${totalGeneral.toFixed(2)}\n`);

  } catch (error) {
    console.error('❌ Error al poblar compras:', error);
    throw error;
  }
}

poblarCompras()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
