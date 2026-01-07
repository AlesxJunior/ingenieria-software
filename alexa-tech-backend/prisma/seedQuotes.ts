import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de Cotizaciones de prueba
 */
async function seedQuotes() {
  console.log('🔄 Iniciando seed de cotizaciones...');

  try {
    // Buscar usuario administrador
    const admin = await prisma.user.findFirst({
      where: { email: 'admin@alexatech.com' },
    });

    if (!admin) {
      console.log('⚠️  Usuario administrador no encontrado. Saltando seed.');
      return;
    }

    // Buscar almacén principal
    const warehouse = await prisma.warehouse.findFirst({
      where: { id: 'WH-PRINCIPAL' },
    });

    if (!warehouse) {
      console.log('⚠️  Almacén principal no encontrado. Saltando seed.');
      return;
    }

    // Buscar productos
    const products = await prisma.product.findMany({
      where: { estado: true },
      take: 3,
    });

    if (products.length === 0) {
      console.log('⚠️  No hay productos disponibles. Saltando seed.');
      return;
    }

    // Verificar si ya existen cotizaciones
    const existingQuotes = await prisma.quote.count();

    if (existingQuotes > 0) {
      console.log(`⚠️  Ya existen ${existingQuotes} cotizaciones. Saltando seed.`);
      return;
    }

    // Crear cotizaciones de prueba
    const quotes = [
      {
        codigoCotizacion: 'COT-0001',
        almacenId: warehouse.id,
        usuarioId: admin.id,
        fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
        diasValidez: 15,
        estado: 'Pendiente' as const,
        observaciones: 'Cotización para cliente corporativo',
        items: [
          {
            productId: products[0].id,
            nombreProducto: products[0].nombre,
            cantidad: 5,
            precioUnitario: Number(products[0].precioVenta),
            subtotal: Number(products[0].precioVenta) * 5,
          },
        ],
      },
      {
        codigoCotizacion: 'COT-0002',
        almacenId: warehouse.id,
        usuarioId: admin.id,
        fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        diasValidez: 30,
        estado: 'Aceptada' as const,
        observaciones: 'Cliente acepta, pendiente de convertir a venta',
        items: products.slice(0, 2).map((product, index) => ({
          productId: product.id,
          nombreProducto: product.nombre,
          cantidad: index + 2,
          precioUnitario: Number(product.precioVenta),
          subtotal: Number(product.precioVenta) * (index + 2),
        })),
      },
      {
        codigoCotizacion: 'COT-0003',
        almacenId: warehouse.id,
        usuarioId: admin.id,
        fechaVencimiento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Vencida hace 5 días
        diasValidez: 15,
        estado: 'Vencida' as const,
        motivoRechazo: 'Cliente no respondió a tiempo',
        items: [
          {
            productId: products[products.length - 1].id,
            nombreProducto: products[products.length - 1].nombre,
            cantidad: 10,
            precioUnitario: Number(products[products.length - 1].precioVenta),
            subtotal: Number(products[products.length - 1].precioVenta) * 10,
          },
        ],
      },
    ];

    for (const quoteData of quotes) {
      // Calcular totales
      const subtotal = quoteData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      await prisma.quote.create({
        data: {
          codigoCotizacion: quoteData.codigoCotizacion,
          almacenId: quoteData.almacenId,
          usuarioId: quoteData.usuarioId,
          fechaVencimiento: quoteData.fechaVencimiento,
          diasValidez: quoteData.diasValidez,
          estado: quoteData.estado,
          observaciones: quoteData.observaciones,
          motivoRechazo: quoteData.motivoRechazo,
          subtotal,
          igv,
          total,
          items: {
            create: quoteData.items,
          },
        },
      });
    }

    console.log(`✅ ${quotes.length} cotizaciones creadas exitosamente`);

    // Mostrar resumen
    const allQuotes = await prisma.quote.findMany({
      include: { items: true },
    });

    console.log(`📊 Resumen de Cotizaciones:`);
    allQuotes.forEach((quote) => {
      console.log(`   📋 ${quote.codigoCotizacion} - ${quote.estado} - S/ ${Number(quote.total).toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Error al crear cotizaciones:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedQuotes()
    .then(() => {
      console.log('✅ Seed de cotizaciones completado');
      prisma.$disconnect();
    })
    .catch((error) => {
      console.error('❌ Error en seed de cotizaciones:', error);
      prisma.$disconnect();
      process.exit(1);
    });
}

export default seedQuotes;
