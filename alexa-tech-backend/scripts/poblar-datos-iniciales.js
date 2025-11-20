/**
 * Script: Poblar Base de Datos con Datos Iniciales
 * 
 * Crea:
 * 1. Motivos de Movimiento (Entrada/Salida)
 * 2. Proveedores de ejemplo
 * 3. Compras de ejemplo
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function poblarDatos() {
  console.log('🔄 Iniciando población de datos...\n');

  try {
    // ==================== 1. MOTIVOS DE MOVIMIENTO ====================
    console.log('📋 Creando Motivos de Movimiento...');
    
    const motivosMovimiento = [
      // ENTRADAS
      {
        codigo: 'COMPRA',
        nombre: 'Compra a Proveedor',
        descripcion: 'Ingreso de mercadería por compra',
        tipo: 'ENTRADA',
        activo: true,
        requiereDocumento: true, // Requiere factura/boleta
      },
      {
        codigo: 'DEVOLUCION_CLIENTE',
        nombre: 'Devolución de Cliente',
        descripcion: 'Ingreso por devolución de producto vendido',
        tipo: 'ENTRADA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'AJUSTE_ENTRADA',
        nombre: 'Ajuste de Inventario (Entrada)',
        descripcion: 'Corrección de stock por conteo físico',
        tipo: 'ENTRADA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'TRANSFERENCIA_ENTRADA',
        nombre: 'Transferencia entre Almacenes (Entrada)',
        descripcion: 'Recepción de mercadería desde otro almacén',
        tipo: 'ENTRADA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'PRODUCCION',
        nombre: 'Producción Interna',
        descripcion: 'Ingreso de productos fabricados internamente',
        tipo: 'ENTRADA',
        activo: true,
        requiereDocumento: false,
      },
      
      // SALIDAS
      {
        codigo: 'VENTA',
        nombre: 'Venta a Cliente',
        descripcion: 'Salida de mercadería por venta',
        tipo: 'SALIDA',
        activo: true,
        requiereDocumento: true, // Requiere factura/boleta
      },
      {
        codigo: 'DEVOLUCION_PROVEEDOR',
        nombre: 'Devolución a Proveedor',
        descripcion: 'Devolución de mercadería defectuosa o incorrecta',
        tipo: 'SALIDA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'AJUSTE_SALIDA',
        nombre: 'Ajuste de Inventario (Salida)',
        descripcion: 'Corrección de stock por merma, robo o deterioro',
        tipo: 'SALIDA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'TRANSFERENCIA_SALIDA',
        nombre: 'Transferencia entre Almacenes (Salida)',
        descripcion: 'Envío de mercadería a otro almacén',
        tipo: 'SALIDA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'CONSUMO_INTERNO',
        nombre: 'Consumo Interno',
        descripcion: 'Uso de productos para operaciones internas',
        tipo: 'SALIDA',
        activo: true,
        requiereDocumento: false,
      },
      {
        codigo: 'MERMA',
        nombre: 'Merma o Pérdida',
        descripcion: 'Pérdida de mercadería por vencimiento o deterioro',
        tipo: 'SALIDA',
        activo: true,
        requiereDocumento: false,
      },
    ];

    let motivosCreados = 0;
    for (const motivo of motivosMovimiento) {
      const existe = await prisma.movementReason.findFirst({
        where: { codigo: motivo.codigo }
      });
      
      if (!existe) {
        await prisma.movementReason.create({
          data: motivo
        });
        console.log(`   ✅ Creado: ${motivo.nombre} (${motivo.tipo})`);
        motivosCreados++;
      } else {
        console.log(`   ⏭️  Ya existe: ${motivo.nombre}`);
      }
    }

    console.log(`\n✅ Motivos de Movimiento: ${motivosCreados} creados\n`);

    // ==================== 2. VERIFICAR ALMACENES ====================
    const almacenes = await prisma.warehouse.findMany();
    if (almacenes.length === 0) {
      console.log('⚠️  NO HAY ALMACENES. Se necesita al menos un almacén para crear compras.');
      console.log('   Por favor, crea un almacén primero desde la UI.\n');
      await prisma.$disconnect();
      return;
    }
    const almacenPrincipal = almacenes[0];
    console.log(`📦 Usando almacén: ${almacenPrincipal.nombre}\n`);

    // ==================== 3. VERIFICAR PRODUCTOS ====================
    const productos = await prisma.product.findMany({ take: 5 });
    if (productos.length === 0) {
      console.log('⚠️  NO HAY PRODUCTOS. Se necesitan productos para crear compras.');
      console.log('   Por favor, crea productos primero desde la UI.\n');
      await prisma.$disconnect();
      return;
    }
    console.log(`📦 Productos disponibles: ${productos.length}\n`);

    // ==================== 4. OBTENER PROVEEDORES REALES ====================
    console.log('👥 Consultando proveedores...');
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

    if (proveedores.length === 0) {
      console.log('⚠️  NO HAY PROVEEDORES. Se necesitan proveedores para crear compras.');
      console.log('   Por favor, crea proveedores primero desde la UI.\n');
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Proveedores encontrados: ${proveedores.length}`);
    proveedores.forEach(p => console.log(`   - ${p.razonSocial}`));
    console.log('');

    // Mapear proveedores por nombre
    const proveedorMap = {};
    proveedores.forEach(p => {
      proveedorMap[p.razonSocial] = p.id;
    });

    // ==================== 5. CREAR COMPRAS DE EJEMPLO ====================
    console.log('🛒 Creando Compras de Ejemplo...');

    // Verificar si ya hay compras
    const comprasExistentes = await prisma.purchase.count();
    if (comprasExistentes > 0) {
      console.log(`   ⏭️  Ya existen ${comprasExistentes} compras. Saltando creación.\n`);
    } else {
      const comprasData = [
        {
          codigoOrden: 'ORD-2025-001',
          razonSocialProveedor: 'Global Supplies S.R.L.',
          fechaEmision: new Date('2025-11-15'),
          fechaEntregaEstimada: new Date('2025-11-25'),
          tipoComprobante: 'Factura',
          formaPago: 'Transferencia',
          productos: productos.slice(0, 3),
        },
        {
          codigoOrden: 'ORD-2025-002',
          razonSocialProveedor: 'Distribuidora del Norte S.A.C.',
          fechaEmision: new Date('2025-11-18'),
          fechaEntregaEstimada: new Date('2025-11-28'),
          tipoComprobante: 'Factura',
          formaPago: 'Efectivo',
          productos: productos.slice(1, 4),
        },
        {
          codigoOrden: 'ORD-2025-003',
          razonSocialProveedor: 'Importaciones Rápidas E.I.R.L.',
          fechaEmision: new Date('2025-11-20'),
          fechaEntregaEstimada: new Date('2025-12-01'),
          tipoComprobante: 'Boleta',
          formaPago: 'Tarjeta',
          productos: productos.slice(2, 5),
        },
      ];

      for (const compra of comprasData) {
        const proveedorId = proveedorMap[compra.razonSocialProveedor];
        
        if (!proveedorId) {
          console.log(`   ⚠️  Proveedor "${compra.razonSocialProveedor}" no encontrado. Saltando ${compra.codigoOrden}`);
          continue;
        }

        const items = compra.productos.map(prod => ({
          productCodigo: prod.codigo,
          nombreProducto: prod.nombre,
          cantidad: Math.floor(Math.random() * 50) + 10, // 10-60 unidades
          precioUnitario: Number(prod.precioVenta) * 0.65, // 65% del precio venta (margen)
          subtotal: 0, // Se calculará después
        }));

        // Calcular subtotales
        items.forEach(item => {
          item.subtotal = item.cantidad * item.precioUnitario;
        });

        const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
        const descuento = 0;
        const total = subtotal - descuento;

        await prisma.purchase.create({
          data: {
            codigoOrden: compra.codigoOrden,
            proveedorId: proveedorId,
            almacenId: almacenPrincipal.id,
            tipoComprobante: compra.tipoComprobante,
            formaPago: compra.formaPago,
            fechaEmision: compra.fechaEmision,
            fechaEntregaEstimada: compra.fechaEntregaEstimada,
            subtotal,
            descuento,
            total,
            estado: 'Recibida',
            observaciones: `Orden de compra a ${compra.razonSocialProveedor}`,
            items: {
              create: items,
            },
          },
        });

        console.log(`   ✅ Compra creada: ${compra.codigoOrden} - ${compra.razonSocialProveedor} - S/ ${total.toFixed(2)}`);
      }

      console.log(`\n✅ Compras creadas: ${comprasData.length}\n`);
    }

    // ==================== RESUMEN FINAL ====================
    const resumen = {
      motivos: await prisma.movementReason.count(),
      compras: await prisma.purchase.count(),
      almacenes: await prisma.warehouse.count(),
      productos: await prisma.product.count(),
    };

    console.log('='.repeat(60));
    console.log('📊 RESUMEN FINAL');
    console.log('='.repeat(60));
    console.log(`Motivos de Movimiento: ${resumen.motivos}`);
    console.log(`Compras: ${resumen.compras}`);
    console.log(`Almacenes: ${resumen.almacenes}`);
    console.log(`Productos: ${resumen.productos}`);
    console.log('\n✅ Población de datos completada exitosamente!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

poblarDatos()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
