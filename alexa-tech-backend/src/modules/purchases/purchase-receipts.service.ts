import { Injectable } from '@nestjs/common';
import { PrismaClient, PurchaseReceiptStatus, QualityControlStatus } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// ============================================
// TIPOS Y INTERFACES
// ============================================

interface CreatePurchaseReceiptDto {
  ordenCompraId: string;
  almacenId: string;
  recibidoPorId: string;
  guiaRemision?: string;
  transportista?: string;
  condicionMercancia?: string;
  observaciones?: string;
  items: CreatePurchaseReceiptItemDto[];
}

interface CreatePurchaseReceiptItemDto {
  ordenCompraItemId: string;
  productoId: string;
  cantidadRecibida: number;
  cantidadAceptada: number;
  cantidadRechazada: number;
  estadoQC?: QualityControlStatus;
  motivoRechazo?: string;
  numeroLote?: string;
  fechaVencimiento?: Date | string;
  observaciones?: string;
}

interface ConfirmReceiptDto {
  inspeccionadoPorId: string;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

@Injectable()
export class PurchaseReceiptsService {
  /**
   * Generar código único para RC (RC-2025-0001)
   */
  private async generateReceiptCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `RC-${year}-`;

    const lastReceipt = await prisma.purchaseReceipt.findFirst({
      where: {
        codigo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        codigo: 'desc',
      },
    });

    let nextNumber = 1;
    if (lastReceipt && lastReceipt.codigo) {
      const lastNumber = parseInt(lastReceipt.codigo.split('-')[2] || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Validar cantidades de un item de recepción
   */
  private validateReceiptItem(
    item: CreatePurchaseReceiptItemDto,
    ocItem: any
  ): void {
    // cantidadAceptada + cantidadRechazada debe = cantidadRecibida
    if (item.cantidadAceptada + item.cantidadRechazada !== item.cantidadRecibida) {
      throw new Error(
        `Item ${item.productoId}: La suma de aceptados (${item.cantidadAceptada}) y rechazados (${item.cantidadRechazada}) debe ser igual a recibidos (${item.cantidadRecibida})`
      );
    }

    // No puede recibir más de lo pendiente
    const cantidadPendiente = ocItem.cantidadPendiente;
    if (item.cantidadRecibida > cantidadPendiente) {
      throw new Error(
        `Item ${item.productoId}: Se intenta recibir ${item.cantidadRecibida} pero solo hay ${cantidadPendiente} pendientes`
      );
    }

    // Si hay productos rechazados, debe tener motivo
    if (item.cantidadRechazada > 0 && !item.motivoRechazo) {
      throw new Error(
        `Item ${item.productoId}: Debe especificar el motivo de rechazo`
      );
    }

    // Validar cantidades positivas
    if (item.cantidadRecibida <= 0) {
      throw new Error('La cantidad recibida debe ser mayor a 0');
    }
    if (item.cantidadAceptada < 0) {
      throw new Error('La cantidad aceptada no puede ser negativa');
    }
    if (item.cantidadRechazada < 0) {
      throw new Error('La cantidad rechazada no puede ser negativa');
    }
  }

  /**
   * Crear nueva Recepción de Compra
   */
  async create(data: CreatePurchaseReceiptDto) {
    // Validaciones
    if (!data.items || data.items.length === 0) {
      throw new Error('La recepción debe tener al menos un item');
    }

    // Validar que la OC exista
    const ordenCompra = await prisma.purchaseOrder.findUnique({
      where: { id: data.ordenCompraId },
      include: {
        items: true,
      },
    });

    if (!ordenCompra) {
      throw new Error('Orden de compra no encontrada');
    }

    // Validar que la OC esté en estado válido
    if (!['CONFIRMADA', 'EN_RECEPCION', 'PARCIAL'].includes(ordenCompra.estado)) {
      throw new Error(
        `La orden de compra está en estado ${ordenCompra.estado}. Solo se pueden crear recepciones para órdenes CONFIRMADAS, EN_RECEPCION o PARCIAL`
      );
    }

    // Validar que el almacén exista y coincida con la OC
    const almacen = await prisma.warehouse.findUnique({
      where: { id: data.almacenId },
    });

    if (!almacen || !almacen.activo) {
      throw new Error('Almacén no encontrado o inactivo');
    }

    if (data.almacenId !== ordenCompra.almacenDestinoId) {
      throw new Error(
        'El almacén de recepción debe coincidir con el almacén destino de la orden de compra'
      );
    }

    // Validar que el usuario exista
    const usuario = await prisma.user.findUnique({
      where: { id: data.recibidoPorId },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Validar items
    for (const item of data.items) {
      const ocItem = ordenCompra.items.find((i) => i.id === item.ordenCompraItemId);

      if (!ocItem) {
        throw new Error(
          `Item de orden de compra ${item.ordenCompraItemId} no encontrado`
        );
      }

      this.validateReceiptItem(item, ocItem);
    }

    // Generar código
    const codigo = await this.generateReceiptCode();

    // Determinar si es recepción completa
    let esRecepcionCompleta = true;
    for (const item of data.items) {
      const ocItem = ordenCompra.items.find((i) => i.id === item.ordenCompraItemId);
      if (ocItem) {
        const nuevoPendiente = ocItem.cantidadPendiente - item.cantidadRecibida;
        if (nuevoPendiente > 0) {
          esRecepcionCompleta = false;
          break;
        }
      }
    }

    const esRecepcionParcial = !esRecepcionCompleta;

    // Crear recepción con transacción
    const recepcion = await prisma.$transaction(async (tx) => {
      // Crear recepción
      const rc = await tx.purchaseReceipt.create({
        data: {
          codigo,
          estado: 'PENDIENTE',
          ordenCompraId: data.ordenCompraId,
          almacenId: data.almacenId,
          recibidoPorId: data.recibidoPorId,
          guiaRemision: data.guiaRemision,
          transportista: data.transportista,
          condicionMercancia: data.condicionMercancia,
          observaciones: data.observaciones,
          esRecepcionCompleta,
          esRecepcionParcial,
        },
      });

      // Crear items de recepción
      for (const item of data.items) {
        const ocItem = ordenCompra.items.find((i) => i.id === item.ordenCompraItemId);

        await tx.purchaseReceiptItem.create({
          data: {
            recepcionId: rc.id,
            ordenCompraItemId: item.ordenCompraItemId,
            productoId: item.productoId,
            cantidadOrdenada: ocItem!.cantidadOrdenada,
            cantidadRecibida: item.cantidadRecibida,
            cantidadAceptada: item.cantidadAceptada,
            cantidadRechazada: item.cantidadRechazada,
            estadoQC: item.estadoQC || 'PENDIENTE',
            motivoRechazo: item.motivoRechazo,
            numeroLote: item.numeroLote,
            fechaVencimiento: item.fechaVencimiento
              ? new Date(item.fechaVencimiento)
              : null,
            observaciones: item.observaciones,
          },
        });
      }

      // Actualizar estado de OC a EN_RECEPCION si es la primera recepción
      if (ordenCompra.estado === 'CONFIRMADA') {
        await tx.purchaseOrder.update({
          where: { id: data.ordenCompraId },
          data: {
            estado: 'EN_RECEPCION',
          },
        });
      }

      // Retornar con relaciones
      return tx.purchaseReceipt.findUnique({
        where: { id: rc.id },
        include: {
          ordenCompra: {
            include: {
              proveedor: true,
            },
          },
          almacen: true,
          recibidoPor: {
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
              ordenCompraItem: true,
            },
          },
        },
      });
    });

    return recepcion;
  }

  /**
   * Confirmar recepción y actualizar stock
   */
  async confirm(id: string, data: ConfirmReceiptDto) {
    const recepcion = await prisma.purchaseReceipt.findUnique({
      where: { id },
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
        almacen: true,
      },
    });

    if (!recepcion) {
      throw new Error('Recepción no encontrada');
    }

    if (recepcion.estado !== 'PENDIENTE') {
      throw new Error('La recepción ya fue confirmada o cancelada');
    }

    // Validar que el inspector exista
    const inspector = await prisma.user.findUnique({
      where: { id: data.inspeccionadoPorId },
    });

    if (!inspector) {
      throw new Error('Inspector no encontrado');
    }

    // Confirmar recepción y actualizar stock en transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Confirmar recepción
      await tx.purchaseReceipt.update({
        where: { id },
        data: {
          estado: 'CONFIRMADA',
          inspeccionadoPorId: data.inspeccionadoPorId,
          fechaInspeccion: new Date(),
        },
      });

      // 2. Por cada item ACEPTADO, actualizar stock
      for (const item of recepcion.items) {
        if (item.cantidadAceptada > 0) {
          // 2.1. Obtener stock actual
          const stockActual = await tx.stockByWarehouse.findUnique({
            where: {
              productId_warehouseId: {
                productId: item.productoId,
                warehouseId: recepcion.almacenId,
              },
            },
          });

          const stockBefore = stockActual?.quantity ?? 0;
          const stockAfter = stockBefore + item.cantidadAceptada;

          // 2.2. Actualizar StockByWarehouse
          await tx.stockByWarehouse.upsert({
            where: {
              productId_warehouseId: {
                productId: item.productoId,
                warehouseId: recepcion.almacenId,
              },
            },
            update: {
              quantity: stockAfter,
              updatedAt: new Date(),
            },
            create: {
              productId: item.productoId,
              warehouseId: recepcion.almacenId,
              quantity: item.cantidadAceptada,
            },
          });

          // 2.3. Crear InventoryMovement
          await tx.inventoryMovement.create({
            data: {
              type: 'ENTRADA',
              productId: item.productoId,
              warehouseId: recepcion.almacenId,
              quantity: item.cantidadAceptada,
              stockBefore: stockBefore,
              stockAfter: stockAfter,
              reason: 'Recepción de Compra',
              documentRef: `OC: ${recepcion.ordenCompra.codigo}, RC: ${recepcion.codigo}`,
              userId: data.inspeccionadoPorId,
              recepcionCompraId: recepcion.id,
            },
          });

          // 2.4. [COMENTADO] Actualizar precio de compra del producto
          // ⚠️ NOTA: El modelo Product no tiene campo precioCompra en el schema actual
          // TODO: Si se necesita trackear precio de compra, agregar campo al schema:
          //   - precioCompra Decimal? (último precio de compra)
          //   - fechaUltimaCompra DateTime? (fecha de la última compra)
          // await tx.product.update({
          //   where: { id: item.productoId },
          //   data: {
          //     precioCompra: item.ordenCompraItem.precioUnitario,
          //     updatedAt: new Date(),
          //   },
          // });

          // 2.5. Actualizar cantidades en OC Item
          await tx.purchaseOrderItem.update({
            where: { id: item.ordenCompraItemId },
            data: {
              cantidadRecibida: { increment: item.cantidadRecibida },
              cantidadAceptada: { increment: item.cantidadAceptada },
              cantidadRechazada: { increment: item.cantidadRechazada },
              cantidadPendiente: { decrement: item.cantidadRecibida },
            },
          });
        }
      }

      // 3. Verificar si la OC está completada
      const ocItems = await tx.purchaseOrderItem.findMany({
        where: { ordenCompraId: recepcion.ordenCompraId },
      });

      const todosRecibidos = ocItems.every(
        (item) => item.cantidadPendiente === 0
      );

      // 4. Actualizar estado de OC
      if (todosRecibidos) {
        await tx.purchaseOrder.update({
          where: { id: recepcion.ordenCompraId },
          data: {
            estado: 'COMPLETADA',
            fechaEntregaReal: new Date(),
          },
        });
      } else {
        await tx.purchaseOrder.update({
          where: { id: recepcion.ordenCompraId },
          data: {
            estado: 'PARCIAL',
          },
        });
      }

      // 5. Retornar recepción actualizada
      return tx.purchaseReceipt.findUnique({
        where: { id },
        include: {
          ordenCompra: {
            include: {
              proveedor: true,
              items: true,
            },
          },
          almacen: true,
          recibidoPor: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          inspeccionadoPor: {
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
              ordenCompraItem: true,
            },
          },
          movimientosInventario: true,
        },
      });
    });

    return result;
  }

  /**
   * Listar recepciones con filtros
   */
  async findAll(filters: {
    ordenCompraId?: string;
    estado?: PurchaseReceiptStatus;
    almacenId?: string;
    fechaDesde?: Date | string;
    fechaHasta?: Date | string;
    page?: number;
    limit?: number;
  } = {}) {
    const {
      ordenCompraId,
      estado,
      almacenId,
      fechaDesde,
      fechaHasta,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      deletedAt: null,
    };

    if (ordenCompraId) {
      where.ordenCompraId = ordenCompraId;
    }

    if (estado) {
      where.estado = estado;
    }

    if (almacenId) {
      where.almacenId = almacenId;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaRecepcion = {};
      if (fechaDesde) {
        where.fechaRecepcion.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaRecepcion.lte = new Date(fechaHasta);
      }
    }

    const skip = (page - 1) * limit;

    const [recepciones, total] = await Promise.all([
      prisma.purchaseReceipt.findMany({
        where,
        include: {
          ordenCompra: {
            select: {
              codigo: true,
              proveedor: {
                select: {
                  razonSocial: true,
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
          almacen: {
            select: {
              codigo: true,
              nombre: true,
            },
          },
          recibidoPor: {
            select: {
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              producto: {
                select: {
                  codigo: true,
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: {
          fechaRecepcion: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.purchaseReceipt.count({ where }),
    ]);

    return {
      data: recepciones,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener recepción por ID
   */
  async findOne(id: string) {
    const recepcion = await prisma.purchaseReceipt.findUnique({
      where: { id },
      include: {
        ordenCompra: {
          include: {
            proveedor: true,
            items: true,
          },
        },
        almacen: true,
        recibidoPor: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        inspeccionadoPor: {
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
            ordenCompraItem: true,
          },
        },
        movimientosInventario: true,
      },
    });

    if (!recepcion) {
      throw new Error('Recepción no encontrada');
    }

    return recepcion;
  }

  /**
   * Cancelar recepción (solo si está PENDIENTE)
   */
  async cancel(id: string) {
    const recepcion = await this.findOne(id);

    if (recepcion.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden cancelar recepciones en estado PENDIENTE');
    }

    return prisma.purchaseReceipt.update({
      where: { id },
      data: {
        estado: 'CANCELADA',
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Generar PDF de recepción de compra
   */
  async generatePDF(id: string): Promise<Buffer> {
    const recepcion = await prisma.purchaseReceipt.findUnique({
      where: { id },
      include: {
        ordenCompra: {
          include: {
            proveedor: true,
          },
        },
        almacen: true,
        recibidoPor: true,
        inspeccionadoPor: true,
        items: {
          include: {
            producto: true,
          },
        },
      },
    });

    if (!recepcion) {
      throw new Error('Recepción no encontrada');
    }

    // Obtener datos de la empresa
    const empresa = await prisma.company.findFirst();
    if (!empresa) {
      throw new Error('Configuración de empresa no encontrada');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ===== ENCABEZADO =====
      doc
        .fontSize(20)
        .font('Helvetica-Bold')
        .text(empresa.razonSocial, 50, 50, { align: 'left' })
        .fontSize(10)
        .font('Helvetica')
        .text(`RUC: ${empresa.ruc}`, 50, 75)
        .text(empresa.direccion || '', 50, 90)
        .text(`Tel: ${empresa.telefono || ''}`, 50, 105);

      // Recuadro del tipo de documento
      const boxX = 380;
      const boxY = 50;
      doc
        .rect(boxX, boxY, 165, 80)
        .stroke()
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('RECEPCIÓN DE COMPRA', boxX, boxY + 15, { width: 165, align: 'center' })
        .fontSize(10)
        .font('Helvetica')
        .text(recepcion.codigo, boxX, boxY + 35, { width: 165, align: 'center' });

      // ===== INFORMACIÓN DE LA RECEPCIÓN =====
      let yPos = 150;
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('FECHA DE RECEPCIÓN:', 50, yPos)
        .font('Helvetica')
        .text(new Date(recepcion.fechaRecepcion).toLocaleDateString('es-PE'), 200, yPos);

      yPos += 15;
      doc
        .font('Helvetica-Bold')
        .text('ESTADO:', 50, yPos)
        .font('Helvetica')
        .text(recepcion.estado, 200, yPos);

      yPos += 15;
      doc
        .font('Helvetica-Bold')
        .text('ORDEN DE COMPRA:', 50, yPos)
        .font('Helvetica')
        .text(recepcion.ordenCompra.codigo, 200, yPos);

      yPos += 15;
      doc
        .font('Helvetica-Bold')
        .text('PROVEEDOR:', 50, yPos)
        .font('Helvetica')
        .text(recepcion.ordenCompra.proveedor.razonSocial || 'N/A', 200, yPos);

      yPos += 15;
      doc
        .font('Helvetica-Bold')
        .text('ALMACÉN:', 50, yPos)
        .font('Helvetica')
        .text(recepcion.almacen.nombre, 200, yPos);

      yPos += 15;
      doc
        .font('Helvetica-Bold')
        .text('RECIBIDO POR:', 50, yPos)
        .font('Helvetica')
        .text(`${recepcion.recibidoPor.firstName} ${recepcion.recibidoPor.lastName}`, 200, yPos);

      if (recepcion.guiaRemision) {
        yPos += 15;
        doc
          .font('Helvetica-Bold')
          .text('GUÍA DE REMISIÓN:', 50, yPos)
          .font('Helvetica')
          .text(recepcion.guiaRemision, 200, yPos);
      }

      if (recepcion.transportista) {
        yPos += 15;
        doc
          .font('Helvetica-Bold')
          .text('TRANSPORTISTA:', 50, yPos)
          .font('Helvetica')
          .text(recepcion.transportista, 200, yPos);
      }

      // ===== TABLA DE PRODUCTOS =====
      yPos += 30;
      const tableTop = yPos;
      const tableHeaders = ['Producto', 'Ordenado', 'Recibido', 'Aceptado', 'Rechazado'];
      const colWidths = [200, 65, 65, 65, 65];
      let xPos = 50;

      // Headers
      doc.fontSize(9).font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, tableTop, { width: colWidths[i] || 65, align: 'center' });
        xPos += colWidths[i] || 65;
      });

      // Línea debajo de headers
      yPos += 15;
      doc
        .moveTo(50, yPos)
        .lineTo(545, yPos)
        .stroke();

      // Items
      yPos += 10;
      doc.font('Helvetica').fontSize(8);
      recepcion.items.forEach((item) => {
        xPos = 50;
        const rowData = [
          `${item.producto.codigo} - ${item.producto.nombre}`,
          item.cantidadOrdenada.toString(),
          item.cantidadRecibida.toString(),
          item.cantidadAceptada.toString(),
          item.cantidadRechazada.toString(),
        ];

        rowData.forEach((data, i) => {
          doc.text(data, xPos, yPos, {
            width: colWidths[i] || 65,
            align: i === 0 ? 'left' : 'center',
          });
          xPos += colWidths[i] || 65;
        });

        yPos += 20;
      });

      // ===== OBSERVACIONES =====
      if (recepcion.observaciones) {
        yPos += 20;
        doc
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('OBSERVACIONES:', 50, yPos)
          .font('Helvetica')
          .fontSize(9)
          .text(recepcion.observaciones, 50, yPos + 15, { width: 495 });
      }

      // ===== FIRMA =====
      yPos = 700;
      doc
        .moveTo(200, yPos)
        .lineTo(400, yPos)
        .stroke()
        .fontSize(10)
        .font('Helvetica')
        .text('Firma del Responsable', 200, yPos + 10, {
          width: 200,
          align: 'center',
        });

      doc.end();
    });
  }
}

export const purchaseReceiptsService = new PurchaseReceiptsService();
