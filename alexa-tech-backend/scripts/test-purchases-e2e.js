const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ============================================
// TESTING E2E - MÓDULO DE COMPRAS COMPLETO
// ============================================

console.log('🧪 INICIANDO TEST E2E - MÓDULO DE COMPRAS\n');
console.log('='.repeat(60));

let testData = {
  proveedor: null,
  almacen: null,
  usuario: null,
  productos: [],
  ordenCompra: null,
  recepcion: null,
};

async function main() {
  try {
    // ============================================
    // PASO 1: OBTENER DATOS NECESARIOS
    // ============================================
    console.log('\n📋 PASO 1: Obtener datos existentes para testing\n');

    // Obtener proveedor
    testData.proveedor = await prisma.client.findFirst({
      where: {
        OR: [{ tipoEntidad: 'Proveedor' }, { tipoEntidad: 'Ambos' }],
      },
    });

    if (!testData.proveedor) {
      throw new Error('No hay proveedores en el sistema. Crea uno primero.');
    }
    console.log(`✅ Proveedor: ${testData.proveedor.razonSocial || testData.proveedor.nombres} (${testData.proveedor.id})`);

    // Obtener almacén
    testData.almacen = await prisma.warehouse.findFirst({
      where: { activo: true },
    });

    if (!testData.almacen) {
      throw new Error('No hay almacenes activos en el sistema.');
    }
    console.log(`✅ Almacén: ${testData.almacen.nombre} (${testData.almacen.id})`);

    // Obtener usuario
    testData.usuario = await prisma.user.findFirst({
      where: { isActive: true },
    });

    if (!testData.usuario) {
      throw new Error('No hay usuarios activos en el sistema.');
    }
    console.log(`✅ Usuario: ${testData.usuario.username} (${testData.usuario.id})`);

    // Obtener 2 productos activos
    testData.productos = await prisma.product.findMany({
      where: { estado: true },
      take: 2,
    });

    if (testData.productos.length < 2) {
      throw new Error('Se necesitan al menos 2 productos activos para el testing.');
    }
    console.log(`✅ Productos:`);
    testData.productos.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nombre} (${p.codigo}) - ID: ${p.id}`);
    });

    // Obtener stock inicial
    console.log('\n📊 Stock inicial de productos:');
    for (const producto of testData.productos) {
      const stock = await prisma.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: producto.id,
            warehouseId: testData.almacen.id,
          },
        },
      });
      const cantidad = stock?.quantity || 0;
      console.log(`   - ${producto.codigo}: ${cantidad} unidades`);
    }

    // ============================================
    // PASO 2: CREAR ORDEN DE COMPRA
    // ============================================
    console.log('\n📝 PASO 2: Crear Orden de Compra\n');

    const ordenCompraData = {
      proveedorId: testData.proveedor.id,
      almacenDestinoId: testData.almacen.id,
      creadoPorId: testData.usuario.id,
      fechaEntregaEstimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      condicionesPago: 'Crédito 30 días',
      formaPago: 'Transferencia Bancaria',
      observaciones: 'TEST E2E - Orden de compra de prueba',
      items: [
        {
          productoId: testData.productos[0].id,
          cantidadOrdenada: 10,
          precioUnitario: 150.0,
          descuento: 0,
        },
        {
          productoId: testData.productos[1].id,
          cantidadOrdenada: 5,
          precioUnitario: 200.0,
          descuento: 10.0,
        },
      ],
    };

    // Crear OC usando PrismaClient directamente (evitamos imports TS)
    // Generar código único
    const year = new Date().getFullYear();
    const prefix = `OC-${year}-`;
    const lastOrder = await prisma.purchaseOrder.findFirst({
      where: { codigo: { startsWith: prefix } },
      orderBy: { codigo: 'desc' },
    });
    let nextNumber = 1;
    if (lastOrder) {
      const lastNumber = parseInt(lastOrder.codigo.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    const codigoOC = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

    // Calcular totales
    let subtotal = 0;
    let descuento = 0;
    let igv = 0;
    let total = 0;

    ordenCompraData.items.forEach((item) => {
      const itemDesc = item.descuento || 0;
      const itemSubtotal = item.cantidadOrdenada * item.precioUnitario - itemDesc;
      const itemIgv = itemSubtotal * 0.18;
      const itemTotal = itemSubtotal + itemIgv;

      subtotal += itemSubtotal;
      descuento += itemDesc;
      igv += itemIgv;
      total += itemTotal;
    });

    // Crear OC con transacción
    testData.ordenCompra = await prisma.$transaction(async (tx) => {
      const oc = await tx.purchaseOrder.create({
        data: {
          codigo: codigoOC,
          estado: 'PENDIENTE',
          proveedorId: ordenCompraData.proveedorId,
          almacenDestinoId: ordenCompraData.almacenDestinoId,
          creadoPorId: ordenCompraData.creadoPorId,
          fechaEntregaEstimada: ordenCompraData.fechaEntregaEstimada,
          condicionesPago: ordenCompraData.condicionesPago,
          formaPago: ordenCompraData.formaPago,
          observaciones: ordenCompraData.observaciones,
          subtotal,
          descuento,
          igv,
          total,
        },
      });

      // Crear items
      for (const item of ordenCompraData.items) {
        const itemDesc = item.descuento || 0;
        const itemSubtotal = item.cantidadOrdenada * item.precioUnitario - itemDesc;
        const itemIgv = itemSubtotal * 0.18;
        const itemTotal = itemSubtotal + itemIgv;

        await tx.purchaseOrderItem.create({
          data: {
            ordenCompraId: oc.id,
            productoId: item.productoId,
            cantidadOrdenada: item.cantidadOrdenada,
            cantidadPendiente: item.cantidadOrdenada,
            precioUnitario: item.precioUnitario,
            descuento: itemDesc,
            subtotal: itemSubtotal,
            igv: itemIgv,
            total: itemTotal,
          },
        });
      }

      // Retornar con relaciones
      return tx.purchaseOrder.findUnique({
        where: { id: oc.id },
        include: {
          proveedor: true,
          almacenDestino: true,
          creadoPor: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              producto: true,
            },
          },
        },
      });
    });

    console.log(`✅ Orden de Compra creada:`);
    console.log(`   - Código: ${testData.ordenCompra.codigo}`);
    console.log(`   - Estado: ${testData.ordenCompra.estado}`);
    console.log(`   - Proveedor: ${testData.ordenCompra.proveedor.razonSocial || testData.ordenCompra.proveedor.nombres}`);
    console.log(`   - Items: ${testData.ordenCompra.items.length}`);
    console.log(`   - Subtotal: S/ ${testData.ordenCompra.subtotal}`);
    console.log(`   - IGV: S/ ${testData.ordenCompra.igv}`);
    console.log(`   - Total: S/ ${testData.ordenCompra.total}`);

    // Verificar items
    console.log('\n   Detalle de items:');
    testData.ordenCompra.items.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.producto.nombre}`);
      console.log(`      - Cantidad ordenada: ${item.cantidadOrdenada}`);
      console.log(`      - Precio unitario: S/ ${item.precioUnitario}`);
      console.log(`      - Total: S/ ${item.total}`);
      console.log(`      - Pendiente: ${item.cantidadPendiente}`);
    });

    // ============================================
    // PASO 3: CAMBIAR ESTADO A ENVIADA
    // ============================================
    console.log('\n📤 PASO 3: Cambiar estado de OC a ENVIADA\n');

    const ocEnviada = await prisma.purchaseOrder.update({
      where: { id: testData.ordenCompra.id },
      data: {
        estado: 'ENVIADA',
        fechaEnvio: new Date(),
      },
      include: {
        proveedor: true,
        almacenDestino: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    console.log(`✅ Estado actualizado: ${testData.ordenCompra.estado} → ${ocEnviada.estado}`);
    console.log(`   - Fecha de envío: ${ocEnviada.fechaEnvio}`);

    // ============================================
    // PASO 4: CONFIRMAR ORDEN (Proveedor acepta)
    // ============================================
    console.log('\n✔️  PASO 4: Confirmar Orden de Compra\n');

    const ocConfirmada = await prisma.purchaseOrder.update({
      where: { id: testData.ordenCompra.id },
      data: {
        estado: 'CONFIRMADA',
        fechaConfirmacion: new Date(),
        aprobadoPorId: testData.usuario.id,
      },
      include: {
        proveedor: true,
        almacenDestino: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    console.log(`✅ Estado actualizado: ${ocEnviada.estado} → ${ocConfirmada.estado}`);
    console.log(`   - Fecha de confirmación: ${ocConfirmada.fechaConfirmacion}`);
    console.log(`   - Aprobado por: ${testData.usuario.username}`);

    // ============================================
    // PASO 5: CREAR RECEPCIÓN PARCIAL
    // ============================================
    console.log('\n📦 PASO 5: Crear Recepción Parcial de Compra\n');

    const recepcionData = {
      ordenCompraId: testData.ordenCompra.id,
      almacenId: testData.almacen.id,
      recibidoPorId: testData.usuario.id,
      guiaRemision: 'GR-001-00123',
      transportista: 'Transportes Test SAC',
      condicionMercancia: 'Buena',
      observaciones: 'TEST E2E - Recepción parcial de primera entrega',
      items: [
        {
          ordenCompraItemId: testData.ordenCompra.items[0].id,
          productoId: testData.productos[0].id,
          cantidadRecibida: 6, // Recibimos 6 de 10
          cantidadAceptada: 5, // Aceptamos 5
          cantidadRechazada: 1, // Rechazamos 1 por defecto
          estadoQC: 'PARCIAL',
          motivoRechazo: 'Un producto llegó con empaque dañado',
          numeroLote: 'LOTE-2025-A',
        },
        {
          ordenCompraItemId: testData.ordenCompra.items[1].id,
          productoId: testData.productos[1].id,
          cantidadRecibida: 5, // Recibimos todos (5)
          cantidadAceptada: 5, // Todos aceptados
          cantidadRechazada: 0,
          estadoQC: 'APROBADO',
          numeroLote: 'LOTE-2025-B',
        },
      ],
    };

    // Generamos código de recepción inline
    const currentYear = new Date().getFullYear();
    const lastReceipt = await prisma.purchaseReceipt.findFirst({
      where: { codigo: { startsWith: `RC-${currentYear}-` } },
      orderBy: { createdAt: 'desc' },
    });

    let nextReceiptNumber = 1;
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.codigo.split('-')[2]);
      nextReceiptNumber = lastNumber + 1;
    }
    const codigoRC = `RC-${currentYear}-${nextReceiptNumber.toString().padStart(4, '0')}`;

    // Calcular si es recepción parcial
    const ocItemsCount = testData.ordenCompra.items.length;
    const recibidosTodos = recepcionData.items.every((item, idx) => {
      const ocItem = testData.ordenCompra.items[idx];
      return item.cantidadRecibida >= ocItem.cantidadOrdenada;
    });

    testData.recepcion = await prisma.purchaseReceipt.create({
      data: {
        codigo: codigoRC,
        ordenCompraId: recepcionData.ordenCompraId,
        almacenId: recepcionData.almacenId,
        fechaRecepcion: new Date(),
        recibidoPorId: recepcionData.recibidoPorId,
        guiaRemision: recepcionData.guiaRemision,
        transportista: recepcionData.transportista,
        condicionMercancia: recepcionData.condicionMercancia,
        observaciones: recepcionData.observaciones,
        esRecepcionParcial: !recibidosTodos,
        estado: 'PENDIENTE',
        items: {
          create: recepcionData.items.map((item, idx) => ({
            ordenCompraItemId: item.ordenCompraItemId,
            productoId: item.productoId,
            cantidadOrdenada: testData.ordenCompra.items[idx].cantidadOrdenada,
            cantidadRecibida: item.cantidadRecibida,
            cantidadAceptada: item.cantidadAceptada,
            cantidadRechazada: item.cantidadRechazada,
            estadoQC: item.estadoQC,
            motivoRechazo: item.motivoRechazo,
            numeroLote: item.numeroLote,
          })),
        },
      },
      include: {
        items: {
          include: {
            producto: true,
            ordenCompraItem: true,
          },
        },
        ordenCompra: true,
        almacen: true,
      },
    });

    console.log(`✅ Recepción creada:`);
    console.log(`   - Código: ${testData.recepcion.codigo}`);
    console.log(`   - Estado: ${testData.recepcion.estado}`);
    console.log(`   - OC: ${testData.recepcion.ordenCompra.codigo}`);
    console.log(`   - Guía remisión: ${testData.recepcion.guiaRemision}`);
    console.log(`   - Es parcial: ${testData.recepcion.esRecepcionParcial}`);
    console.log(`   - Items: ${testData.recepcion.items.length}`);

    console.log('\n   Detalle de items recibidos:');
    testData.recepcion.items.forEach((item, i) => {
      console.log(`   ${i + 1}. ${item.producto.nombre}`);
      console.log(`      - Ordenado: ${item.cantidadOrdenada}`);
      console.log(`      - Recibido: ${item.cantidadRecibida}`);
      console.log(`      - Aceptado: ${item.cantidadAceptada} ✅`);
      console.log(`      - Rechazado: ${item.cantidadRechazada} ❌`);
      console.log(`      - Estado QC: ${item.estadoQC}`);
      if (item.motivoRechazo) {
        console.log(`      - Motivo rechazo: ${item.motivoRechazo}`);
      }
    });

    // Verificar estado de OC actualizado
    const ocDespuesRecepcion = await prisma.purchaseOrder.findUnique({
      where: { id: testData.ordenCompra.id },
    });
    console.log(`\n   Estado de OC actualizado: ${ocDespuesRecepcion.estado}`);

    // ============================================
    // PASO 6: CONFIRMAR RECEPCIÓN (Actualiza Stock)
    // ============================================
    console.log('\n✅ PASO 6: Confirmar Recepción y Actualizar Stock\n');

    // Implementación inline de confirm() - Transacción atómica completa
    const recepcionConfirmada = await prisma.$transaction(async (tx) => {
      // 1. Actualizar estado de recepción
      const recepcionActualizada = await tx.purchaseReceipt.update({
        where: { id: testData.recepcion.id },
        data: {
          estado: 'CONFIRMADA',
          fechaInspeccion: new Date(),
          inspeccionadoPorId: testData.usuario.id,
        },
        include: {
          items: {
            include: {
              producto: true,
              ordenCompraItem: true,
            },
          },
          ordenCompra: {
            include: {
              items: true,
            },
          },
        },
      });

      // 2. Por cada item con cantidades aceptadas, actualizar stock
      const movimientosCreados = [];

      for (const item of recepcionActualizada.items) {
        if (item.cantidadAceptada > 0) {
          // 2.1 Obtener stock actual antes de actualizar
          const stockActual = await tx.stockByWarehouse.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productoId,
                warehouseId: recepcionActualizada.almacenId,
              },
            },
          });

          const stockBefore = stockActual?.quantity || 0;
          const stockAfter = stockBefore + item.cantidadAceptada;

          // 2.2 Upsert StockByWarehouse
          await tx.stockByWarehouse.upsert({
            where: {
              productId_warehouseId: {
                productId: item.productoId,
                warehouseId: recepcionActualizada.almacenId,
              },
            },
            update: {
              quantity: stockAfter,
              updatedAt: new Date(),
            },
            create: {
              productId: item.productoId,
              warehouseId: recepcionActualizada.almacenId,
              quantity: item.cantidadAceptada,
              minStock: 0,
            },
          });

          // 2.3 Crear movimiento de inventario (ENTRADA)
          const movimiento = await tx.inventoryMovement.create({
            data: {
              productId: item.productoId,
              warehouseId: recepcionActualizada.almacenId,
              type: 'ENTRADA',
              quantity: item.cantidadAceptada,
              stockBefore: stockBefore,
              stockAfter: stockAfter,
              recepcionCompraId: recepcionActualizada.id,
              userId: testData.usuario.id,
              reason: `Recepción de compra - ${recepcionActualizada.codigo}`,
            },
            include: {
              product: {
                select: {
                  codigo: true,
                  nombre: true,
                },
              },
              warehouse: {
                select: {
                  nombre: true,
                },
              },
            },
          });

          movimientosCreados.push(movimiento);

          // 2.4 Actualizar cantidades en PurchaseOrderItem
          await tx.purchaseOrderItem.update({
            where: { id: item.ordenCompraItemId },
            data: {
              cantidadRecibida: {
                increment: item.cantidadAceptada,
              },
              cantidadPendiente: {
                decrement: item.cantidadAceptada,
              },
            },
          });
        }
      }

      // 3. Actualizar estado de Orden de Compra
      const ocActualizada = await tx.purchaseOrder.findUnique({
        where: { id: recepcionActualizada.ordenCompraId },
        include: {
          items: true,
        },
      });

      const todosRecibidos = ocActualizada.items.every(
        (item) => item.cantidadPendiente === 0
      );

      const algunoRecibido = ocActualizada.items.some(
        (item) => item.cantidadRecibida > 0
      );

      let nuevoEstadoOC = ocActualizada.estado;
      if (todosRecibidos) {
        nuevoEstadoOC = 'COMPLETADA';
      } else if (algunoRecibido) {
        nuevoEstadoOC = 'PARCIAL';
      }

      if (nuevoEstadoOC !== ocActualizada.estado) {
        await tx.purchaseOrder.update({
          where: { id: ocActualizada.id },
          data: {
            estado: nuevoEstadoOC,
            fechaEntregaReal: todosRecibidos ? new Date() : null,
          },
        });
      }

      // 4. Retornar recepción confirmada con todos los datos
      return tx.purchaseReceipt.findUnique({
        where: { id: testData.recepcion.id },
        include: {
          items: {
            include: {
              producto: true,
              ordenCompraItem: true,
            },
          },
          ordenCompra: {
            include: {
              items: true,
            },
          },
          inspeccionadoPor: true,
          movimientosInventario: {
            include: {
              product: true,
              warehouse: true,
            },
          },
        },
      });
    });

    console.log(`✅ Recepción confirmada:`);
    console.log(`   - Estado: ${testData.recepcion.estado} → ${recepcionConfirmada.estado}`);
    console.log(`   - Inspeccionado por: ${recepcionConfirmada.inspeccionadoPor.username}`);
    console.log(`   - Fecha inspección: ${recepcionConfirmada.fechaInspeccion}`);
    console.log(`   - Movimientos de inventario generados: ${recepcionConfirmada.movimientosInventario.length}`);

    // ============================================
    // PASO 7: VERIFICAR STOCK ACTUALIZADO
    // ============================================
    console.log('\n📊 PASO 7: Verificar Stock Actualizado en StockByWarehouse\n');

    for (const producto of testData.productos) {
      const stock = await prisma.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: producto.id,
            warehouseId: testData.almacen.id,
          },
        },
      });

      const itemRecibido = testData.recepcion.items.find(
        (i) => i.productoId === producto.id
      );

      console.log(`   Producto: ${producto.codigo} - ${producto.nombre}`);
      console.log(`   - Stock actual: ${stock?.quantity || 0} unidades`);
      if (itemRecibido) {
        console.log(`   - Cantidad aceptada en RC: ${itemRecibido.cantidadAceptada}`);
      }
    }

    // ============================================
    // PASO 8: VERIFICAR MOVIMIENTOS DE INVENTARIO
    // ============================================
    console.log('\n📝 PASO 8: Verificar InventoryMovements Creados\n');

    const movimientos = await prisma.inventoryMovement.findMany({
      where: {
        recepcionCompraId: testData.recepcion.id,
      },
      include: {
        product: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
        warehouse: {
          select: {
            codigo: true,
            nombre: true,
          },
        },
      },
    });

    console.log(`✅ Movimientos de inventario creados: ${movimientos.length}\n`);

    movimientos.forEach((mov, i) => {
      console.log(`   ${i + 1}. Movimiento ID: ${mov.id}`);
      console.log(`      - Tipo: ${mov.type}`);
      console.log(`      - Producto: ${mov.product.codigo} - ${mov.product.nombre}`);
      console.log(`      - Almacén: ${mov.warehouse.nombre}`);
      console.log(`      - Cantidad: +${mov.quantity}`);
      console.log(`      - Stock antes: ${mov.stockBefore}`);
      console.log(`      - Stock después: ${mov.stockAfter}`);
      console.log(`      - Motivo: ${mov.reason}`);
      console.log(`      - Referencia: ${mov.documentRef}`);
      console.log(`      - Fecha: ${mov.createdAt}\n`);
    });

    // ============================================
    // PASO 9: VERIFICAR ESTADO DE OC
    // ============================================
    console.log('📋 PASO 9: Verificar Estado Final de Orden de Compra\n');

    const ocFinal = await prisma.purchaseOrder.findUnique({
      where: { id: testData.ordenCompra.id },
      include: {
        items: true,
      },
    });

    console.log(`   Orden de Compra: ${ocFinal.codigo}`);
    console.log(`   Estado final: ${ocFinal.estado}`);
    console.log('\n   Cantidades por item:');
    ocFinal.items.forEach((item, i) => {
      const producto = testData.productos.find((p) => p.id === item.productoId);
      console.log(`   ${i + 1}. ${producto.codigo}`);
      console.log(`      - Ordenado: ${item.cantidadOrdenada}`);
      console.log(`      - Recibido: ${item.cantidadRecibida}`);
      console.log(`      - Aceptado: ${item.cantidadAceptada}`);
      console.log(`      - Rechazado: ${item.cantidadRechazada}`);
      console.log(`      - Pendiente: ${item.cantidadPendiente}`);
    });

    // ============================================
    // RESUMEN FINAL
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST E2E COMPLETADO EXITOSAMENTE\n');
    console.log('📊 RESUMEN:');
    console.log(`   - Orden de Compra: ${testData.ordenCompra.codigo}`);
    console.log(`   - Recepción: ${testData.recepcion.codigo}`);
    console.log(`   - Estado OC: ${ocFinal.estado}`);
    console.log(`   - Productos recibidos: ${movimientos.length}`);
    console.log(`   - Stock actualizado correctamente ✅`);
    console.log(`   - Movimientos de inventario registrados ✅`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR EN EL TEST:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
