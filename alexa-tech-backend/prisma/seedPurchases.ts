// @ts-nocheck
import { PrismaClient, TipoEntidad, PurchaseOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// DATOS DEMO - MÓDULO DE COMPRAS
// ============================================================================

const PROVEEDORES = [
  {
    tipoEntidad: TipoEntidad.Proveedor,
    tipoDocumento: 'RUC',
    numeroDocumento: '20123456789',
    razonSocial: 'Importadora Tech Solutions S.A.C.',
    email: 'ventas@techsolutions.com',
    telefono: '016234567',
    direccion: 'Av. Javier Prado 5820, San Isidro',
  },
  {
    tipoEntidad: TipoEntidad.Proveedor,
    tipoDocumento: 'RUC',
    numeroDocumento: '20987654321',
    razonSocial: 'Distribuidora Office Pro E.I.R.L.',
    email: 'contacto@officepro.pe',
    telefono: '014567890',
    direccion: 'Jr. Lampa 345, Cercado de Lima',
  },
  {
    tipoEntidad: TipoEntidad.Proveedor,
    tipoDocumento: 'RUC',
    numeroDocumento: '20456789123',
    razonSocial: 'Suministros Industriales del Norte S.A.',
    email: 'ventas@suminorte.com',
    telefono: '044251234',
    direccion: 'Av. América Sur 2458, Trujillo',
  },
  {
    tipoEntidad: TipoEntidad.Proveedor,
    tipoDocumento: 'RUC',
    numeroDocumento: '20789123456',
    razonSocial: 'Mayorista Digital Store S.A.C.',
    email: 'pedidos@digitalstore.pe',
    telefono: '015678901',
    direccion: 'Av. Angamos Este 1234, Surquillo',
  },
  {
    tipoEntidad: TipoEntidad.Proveedor,
    tipoDocumento: 'RUC',
    numeroDocumento: '20321654987',
    razonSocial: 'Proveedor Global Imports S.A.C.',
    email: 'importaciones@globalimports.com',
    telefono: '017890123',
    direccion: 'Calle Las Begonias 441, San Isidro',
  },
];

const ALMACENES = [
  {
    codigo: 'ALM-CENTRAL',
    nombre: 'Almacén Central',
    ubicacion: 'Lima - Cercado, Av. Colonial 1234',
    capacidad: 5000,
    activo: true,
  },
  {
    codigo: 'ALM-NORTE',
    nombre: 'Almacén Sucursal Norte',
    ubicacion: 'Trujillo - La Libertad, Av. España 890',
    capacidad: 2000,
    activo: true,
  },
  {
    codigo: 'ALM-TEMP',
    nombre: 'Almacén Temporal',
    ubicacion: 'Lima - Callao, Av. Argentina 567',
    capacidad: 1000,
    activo: true,
  },
];

const PRODUCTOS = [
  {
    codigo: 'PROD-LAPTOP-001',
    nombre: 'Laptop Dell Inspiron 15 3000',
    descripcion: 'Intel Core i5-1135G7, 8GB RAM, 256GB SSD, 15.6" FHD',
    precioVenta: 2399.00,
    stock: 15,
    minStock: 5,
  },
  {
    codigo: 'PROD-MOUSE-001',
    nombre: 'Mouse Logitech M185 Inalámbrico',
    descripcion: 'Mouse inalámbrico 2.4GHz, batería 12 meses, negro',
    precioVenta: 29.90,
    stock: 50,
    minStock: 20,
  },
  {
    codigo: 'PROD-TECLADO-001',
    nombre: 'Teclado Mecánico Redragon K552',
    descripcion: 'RGB, switches rojos, TKL, español',
    precioVenta: 149.90,
    stock: 30,
    minStock: 10,
  },
  {
    codigo: 'PROD-PAPEL-001',
    nombre: 'Resma Papel Bond A4 75g',
    descripcion: 'Papel bond A4, 500 hojas, blanco',
    precioVenta: 12.50,
    stock: 100,
    minStock: 50,
  },
  {
    codigo: 'PROD-LAPICERO-001',
    nombre: 'Lapiceros Faber Castell x50',
    descripcion: 'Lapiceros azul/negro, punta fina 0.7mm, caja 50 unidades',
    precioVenta: 45.00,
    stock: 80,
    minStock: 30,
  },
  {
    codigo: 'PROD-SILLA-001',
    nombre: 'Silla Ergonómica Officeline Pro',
    descripcion: 'Silla ejecutiva, respaldo alto, brazos ajustables',
    precioVenta: 389.00,
    stock: 12,
    minStock: 5,
  },
  {
    codigo: 'PROD-ESCRITORIO-001',
    nombre: 'Escritorio 120x60cm Nogal',
    descripcion: 'Escritorio melamina, 120x60x75cm, color nogal',
    precioVenta: 259.00,
    stock: 8,
    minStock: 3,
  },
  {
    codigo: 'PROD-CABLE-HDMI-001',
    nombre: 'Cable HDMI 3 metros',
    descripcion: 'Cable HDMI 2.0, 4K 60Hz, 3 metros',
    precioVenta: 25.00,
    stock: 60,
    minStock: 25,
  },
  {
    codigo: 'PROD-HUB-USB-001',
    nombre: 'Hub USB 3.0 7 Puertos',
    descripcion: 'Hub USB 3.0, 7 puertos, alimentación externa',
    precioVenta: 69.90,
    stock: 25,
    minStock: 10,
  },
  {
    codigo: 'PROD-MONITOR-001',
    nombre: 'Monitor Samsung 24" FHD',
    descripcion: 'Monitor LED 24 pulgadas, 1920x1080, HDMI/VGA',
    precioVenta: 489.00,
    stock: 18,
    minStock: 8,
  },
];

async function seedPurchases() {
  console.log('🌱 Iniciando seed del módulo de compras...\n');

  try {
    // ========================================================================
    // 1. VERIFICAR DATOS PREVIOS
    // ========================================================================
    const existingProveedores = await prisma.client.count({
      where: { tipoEntidad: TipoEntidad.Proveedor },
    });

    const existingAlmacenes = await prisma.warehouse.count();
    const existingOrdenes = await prisma.purchaseOrder.count();

    if (existingProveedores >= 5 && existingAlmacenes >= 3 && existingOrdenes >= 3) {
      console.log('✅ Ya existen datos de compras completos:');
      console.log(`   - ${existingProveedores} proveedores`);
      console.log(`   - ${existingAlmacenes} almacenes`);
      console.log(`   - ${existingOrdenes} órdenes de compra`);
      console.log('   Saltando seed.\n');
      return;
    }

    // ========================================================================
    // 2. OBTENER O CREAR UBICACIÓN POR DEFECTO (LIMA)
    // ========================================================================
    console.log('📍 Obteniendo ubicación por defecto (Lima)...');
    
    let departamento = await prisma.departamento.findFirst({
      where: { nombre: 'Lima' },
    });

    if (!departamento) {
      console.log('⚠️  Departamento Lima no encontrado. Creando ubicación por defecto...');
      departamento = await prisma.departamento.create({
        data: {
          codigo: '15',
          nombre: 'Lima',
        },
      });
    }

    let provincia = await prisma.provincia.findFirst({
      where: { 
        nombre: 'Lima',
        departamentoId: departamento.id,
      },
    });

    if (!provincia) {
      provincia = await prisma.provincia.create({
        data: {
          codigo: '1501',
          nombre: 'Lima',
          departamentoId: departamento.id,
        },
      });
    }

    let distrito = await prisma.distrito.findFirst({
      where: { 
        nombre: 'Lima',
        provinciaId: provincia.id,
      },
    });

    if (!distrito) {
      distrito = await prisma.distrito.create({
        data: {
          codigo: '150101',
          nombre: 'Lima',
          provinciaId: provincia.id,
        },
      });
    }

    console.log(`✅ Ubicación: ${distrito.nombre}, ${provincia.nombre}, ${departamento.nombre}\n`);

    // ========================================================================
    // 3. CREAR PROVEEDORES
    // ========================================================================
    console.log('🏢 Creando proveedores...');
    const proveedoresCreados = [];

    for (const proveedor of PROVEEDORES) {
      const existing = await prisma.client.findUnique({
        where: { numeroDocumento: proveedor.numeroDocumento },
      });

      if (existing) {
        console.log(`   ⏭️  ${proveedor.razonSocial} (ya existe)`);
        proveedoresCreados.push(existing);
        continue;
      }

      const created = await prisma.client.create({
        data: {
          ...proveedor,
          departamentoId: departamento.id,
          provinciaId: provincia.id,
          distritoId: distrito.id,
          isActive: true,
        },
      });

      console.log(`   ✅ ${created.razonSocial} (RUC: ${created.numeroDocumento})`);
      proveedoresCreados.push(created);
    }

    console.log(`\n✅ ${proveedoresCreados.length} proveedores listos\n`);

    // ========================================================================
    // 4. CREAR ALMACENES
    // ========================================================================
    console.log('🏭 Creando almacenes...');
    const almacenesCreados = [];

    for (const almacen of ALMACENES) {
      const existing = await prisma.warehouse.findUnique({
        where: { codigo: almacen.codigo },
      });

      if (existing) {
        console.log(`   ⏭️  ${almacen.nombre} (ya existe)`);
        almacenesCreados.push(existing);
        continue;
      }

      const created = await prisma.warehouse.create({
        data: almacen,
      });

      console.log(`   ✅ ${created.codigo} - ${created.nombre}`);
      almacenesCreados.push(created);
    }

    console.log(`\n✅ ${almacenesCreados.length} almacenes listos\n`);

    // ========================================================================
    // 5. CREAR/ACTUALIZAR PRODUCTOS
    // ========================================================================
    console.log('📦 Creando/actualizando productos...');
    const productosCreados = [];

    // Obtener categoría y unidad de medida por defecto
    let categoria = await prisma.productCategory.findFirst({
      where: { nombre: 'General' },
    });

    if (!categoria) {
      categoria = await prisma.productCategory.create({
        data: {
          codigo: 'CAT-GEN',
          nombre: 'General',
          descripcion: 'Categoría general',
        },
      });
    }

    let unidadMedida = await prisma.unitOfMeasure.findFirst({
      where: { codigo: 'UND' },
    });

    if (!unidadMedida) {
      unidadMedida = await prisma.unitOfMeasure.create({
        data: {
          codigo: 'UND',
          nombre: 'Unidad',
          abreviatura: 'Und',
        },
      });
    }

    for (const producto of PRODUCTOS) {
      const existing = await prisma.product.findUnique({
        where: { codigo: producto.codigo },
      });

      if (existing) {
        console.log(`   ⏭️  ${producto.nombre} (ya existe)`);
        productosCreados.push(existing);
        continue;
      }

      const created = await prisma.product.create({
        data: {
          ...producto,
          categoriaId: categoria.id,
          unidadMedidaId: unidadMedida.id,
          trackInventory: true,
          estado: true,
        },
      });

      console.log(`   ✅ ${created.codigo} - ${created.nombre}`);
      productosCreados.push(created);
    }

    console.log(`\n✅ ${productosCreados.length} productos listos\n`);

    // ========================================================================
    // 6. OBTENER USUARIO ADMINISTRADOR
    // ========================================================================
    console.log('👤 Obteniendo usuario administrador...');
    
    const adminUser = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@alexatech.com' },
          { username: 'admin' },
        ],
      },
    });

    if (!adminUser) {
      console.log('⚠️  Usuario administrador no encontrado. Las órdenes no tendrán usuario asignado.');
    } else {
      console.log(`✅ Usuario: ${adminUser.username}\n`);
    }

    // ========================================================================
    // 7. CREAR ÓRDENES DE COMPRA
    // ========================================================================
    console.log('📋 Creando órdenes de compra de ejemplo...\n');

    // ---- ORDEN 1: PENDIENTE ----
    const orden1Exists = await prisma.purchaseOrder.findUnique({
      where: { codigo: 'OC-2025-0001' },
    });

    if (!orden1Exists) {
      const orden1 = await prisma.purchaseOrder.create({
        data: {
          codigo: 'OC-2025-0001',
          estado: PurchaseOrderStatus.PENDIENTE,
          proveedorId: proveedoresCreados[0].id,
          almacenDestinoId: almacenesCreados[0].id,
          fechaOrden: new Date('2025-12-01'),
          fechaEntregaEsperada: new Date('2025-12-15'),
          subtotal: 10550.00,
          descuento: 0,
          igv: 1899.00,
          total: 12449.00,
          observaciones: 'Orden de tecnología - Entregar en horario de oficina (9am-6pm)',
          creadoPorId: adminUser?.id,
          items: {
            create: [
              {
                productoId: productosCreados[0].id, // Laptop Dell
                cantidadOrdenada: 5,
                cantidadRecibida: 0,
                cantidadPendiente: 5,
                precioUnitario: 2000.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 10000.00,
                igv: 1800.00,
                total: 11800.00,
              },
              {
                productoId: productosCreados[2].id, // Teclado Mecánico
                cantidadOrdenada: 5,
                cantidadRecibida: 0,
                cantidadPendiente: 5,
                precioUnitario: 110.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 550.00,
                igv: 99.00,
                total: 649.00,
              },
            ],
          },
        },
      });
      console.log(`✅ ${orden1.codigo} - ${orden1.estado} (Total: S/ ${orden1.total})`);
    } else {
      console.log(`   ⏭️  OC-2025-0001 (ya existe)`);
    }

    // ---- ORDEN 2: ENVIADA ----
    const orden2Exists = await prisma.purchaseOrder.findUnique({
      where: { codigo: 'OC-2025-0002' },
    });

    if (!orden2Exists) {
      const orden2 = await prisma.purchaseOrder.create({
        data: {
          codigo: 'OC-2025-0002',
          estado: PurchaseOrderStatus.ENVIADA,
          proveedorId: proveedoresCreados[1].id,
          almacenDestinoId: almacenesCreados[0].id,
          fechaOrden: new Date('2025-12-02'),
          fechaEntregaEsperada: new Date('2025-12-10'),
          subtotal: 6949.15,
          descuento: 0,
          igv: 1250.85,
          total: 8200.00,
          observaciones: 'Material de oficina - Confirmar disponibilidad antes de envío',
          creadoPorId: adminUser?.id,
          items: {
            create: [
              {
                productoId: productosCreados[5].id, // Silla Ergonómica
                cantidadOrdenada: 10,
                cantidadRecibida: 0,
                cantidadPendiente: 10,
                precioUnitario: 320.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 3200.00,
                igv: 576.00,
                total: 3776.00,
              },
              {
                productoId: productosCreados[6].id, // Escritorio
                cantidadOrdenada: 15,
                cantidadRecibida: 0,
                cantidadPendiente: 15,
                precioUnitario: 220.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 3300.00,
                igv: 594.00,
                total: 3894.00,
              },
              {
                productoId: productosCreados[3].id, // Resma Papel
                cantidadOrdenada: 50,
                cantidadRecibida: 0,
                cantidadPendiente: 50,
                precioUnitario: 8.90,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 445.00,
                igv: 80.10,
                total: 525.10,
              },
            ],
          },
        },
      });
      console.log(`✅ ${orden2.codigo} - ${orden2.estado} (Total: S/ ${orden2.total})`);
    } else {
      console.log(`   ⏭️  OC-2025-0002 (ya existe)`);
    }

    // ---- ORDEN 3: COMPLETADA (con recepción) ----
    const orden3Exists = await prisma.purchaseOrder.findUnique({
      where: { codigo: 'OC-2025-0003' },
    });

    if (!orden3Exists) {
      const orden3 = await prisma.purchaseOrder.create({
        data: {
          codigo: 'OC-2025-0003',
          estado: PurchaseOrderStatus.COMPLETADA,
          proveedorId: proveedoresCreados[3].id,
          almacenDestinoId: almacenesCreados[0].id,
          fechaOrden: new Date('2025-11-25'),
          fechaEntregaEsperada: new Date('2025-12-01'),
          subtotal: 13389.83,
          descuento: 0,
          igv: 2410.17,
          total: 15800.00,
          observaciones: 'Pedido para inventario - Todo recibido y verificado',
          creadoPorId: adminUser?.id,
          items: {
            create: [
              {
                productoId: productosCreados[9].id, // Monitor Samsung
                cantidadOrdenada: 20,
                cantidadRecibida: 20,
                cantidadPendiente: 0,
                precioUnitario: 410.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 8200.00,
                igv: 1476.00,
                total: 9676.00,
              },
              {
                productoId: productosCreados[1].id, // Mouse Logitech
                cantidadOrdenada: 100,
                cantidadRecibida: 100,
                cantidadPendiente: 0,
                precioUnitario: 22.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 2200.00,
                igv: 396.00,
                total: 2596.00,
              },
              {
                productoId: productosCreados[7].id, // Cable HDMI
                cantidadOrdenada: 80,
                cantidadRecibida: 80,
                cantidadPendiente: 0,
                precioUnitario: 18.00,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 1440.00,
                igv: 259.20,
                total: 1699.20,
              },
              {
                productoId: productosCreados[8].id, // Hub USB
                cantidadOrdenada: 25,
                cantidadRecibida: 25,
                cantidadPendiente: 0,
                precioUnitario: 59.90,
                descuento: 0,
                incluyeIGV: true,
                subtotal: 1497.50,
                igv: 269.55,
                total: 1767.05,
              },
            ],
          },
        },
      });
      console.log(`✅ ${orden3.codigo} - ${orden3.estado} (Total: S/ ${orden3.total})`);

      // Crear recepción para orden 3
      const recepcion1 = await prisma.purchaseReceipt.create({
        data: {
          codigo: 'RC-2025-0001',
          ordenCompraId: orden3.id,
          almacenId: almacenesCreados[0].id,
          fechaRecepcion: new Date('2025-12-01'),
          estado: 'COMPLETADA',
          observaciones: 'Recepción completa - Todos los productos en buen estado',
          recibidoPorId: adminUser?.id,
          items: {
            create: [
              {
                itemOrdenCompraId: (await prisma.purchaseOrderItem.findFirst({
                  where: { 
                    ordenCompraId: orden3.id,
                    productoId: productosCreados[9].id,
                  },
                }))!.id,
                cantidadRecibida: 20,
                estadoCalidad: 'APROBADO',
              },
              {
                itemOrdenCompraId: (await prisma.purchaseOrderItem.findFirst({
                  where: { 
                    ordenCompraId: orden3.id,
                    productoId: productosCreados[1].id,
                  },
                }))!.id,
                cantidadRecibida: 100,
                estadoCalidad: 'APROBADO',
              },
              {
                itemOrdenCompraId: (await prisma.purchaseOrderItem.findFirst({
                  where: { 
                    ordenCompraId: orden3.id,
                    productoId: productosCreados[7].id,
                  },
                }))!.id,
                cantidadRecibida: 80,
                estadoCalidad: 'APROBADO',
              },
              {
                itemOrdenCompraId: (await prisma.purchaseOrderItem.findFirst({
                  where: { 
                    ordenCompraId: orden3.id,
                    productoId: productosCreados[8].id,
                  },
                }))!.id,
                cantidadRecibida: 25,
                estadoCalidad: 'APROBADO',
              },
            ],
          },
        },
      });
      console.log(`✅ ${recepcion1.codigo} - Recepción vinculada a ${orden3.codigo}`);
    } else {
      console.log(`   ⏭️  OC-2025-0003 (ya existe)`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ SEED DEL MÓDULO DE COMPRAS COMPLETADO');
    console.log('='.repeat(60));
    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ ${proveedoresCreados.length} proveedores`);
    console.log(`   ✅ ${almacenesCreados.length} almacenes`);
    console.log(`   ✅ ${productosCreados.length} productos`);
    console.log(`   ✅ 3 órdenes de compra`);
    console.log(`   ✅ 1 recepción`);
    console.log('\n🎯 El módulo de compras está listo para demostración!\n');

  } catch (error) {
    console.error('\n❌ ERROR al ejecutar seed de compras:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Exportar para uso en seed.ts principal
export { seedPurchases };

// Ejecutar si se llama directamente
if (require.main === module) {
  seedPurchases()
    .then(() => {
      console.log('✅ Seed completado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}
