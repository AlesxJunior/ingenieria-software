import { Injectable } from '@nestjs/common';
import { PrismaClient, PurchaseOrderStatus, Prisma } from '@prisma/client';
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

// ============================================
// TIPOS Y INTERFACES
// ============================================

interface CreatePurchaseOrderDto {
  proveedorId: string;
  almacenDestinoId: string;
  creadoPorId: string;
  fechaEntregaEstimada?: Date | string;  // ✅ Hacer opcional
  moneda?: string;
  condicionesPago?: string;  // ✅ Hacer opcional
  formaPago?: string;  // ✅ Hacer opcional
  observaciones?: string;
  items: CreatePurchaseOrderItemDto[];
}

interface CreatePurchaseOrderItemDto {
  productoId: string;
  cantidadOrdenada: number;
  precioUnitario: number;
  descuento?: number;
  incluyeIGV?: boolean;  // ✅ Si el item incluye IGV o no
}

interface UpdatePurchaseOrderDto {
  proveedorId?: string;
  almacenDestinoId?: string;
  fechaEntregaEstimada?: Date | string;
  moneda?: string;
  condicionesPago?: string;
  formaPago?: string;
  observaciones?: string;
  items?: CreatePurchaseOrderItemDto[];
}

interface FilterPurchaseOrderDto {
  estado?: PurchaseOrderStatus | PurchaseOrderStatus[];
  proveedorId?: string;
  fechaDesde?: Date | string;
  fechaHasta?: Date | string;
  almacenDestinoId?: string;
  page?: number;
  limit?: number;
}

// ============================================
// SERVICIO PRINCIPAL
// ============================================

@Injectable()
export class PurchasesService {
  /**
   * Generar código único para OC (OC-2025-0001)
   */
  private async generatePurchaseOrderCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `OC-${year}-`;

    const lastOrder = await prisma.purchaseOrder.findFirst({
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
    if (lastOrder && lastOrder.codigo) {
      const lastNumber = parseInt(lastOrder.codigo.split('-')[2] || '0');
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Calcular totales de un item de OC
   */
  private calculateItemTotals(item: CreatePurchaseOrderItemDto) {
    const descuento = item.descuento || 0;
    const base = item.cantidadOrdenada * item.precioUnitario - descuento;
    
    // ✅ Si incluyeIGV es false, no calcular IGV
    if (item.incluyeIGV === false) {
      return {
        subtotal: base,
        igv: 0,
        total: base,
      };
    }
    
    // Con IGV (18%)
    const subtotal = base / 1.18;
    const igv = subtotal * 0.18;
    const total = base;

    return {
      subtotal,
      igv,
      total,
    };
  }

  /**
   * Calcular totales de la OC completa
   */
  private calculateOrderTotals(items: CreatePurchaseOrderItemDto[]) {
    let subtotal = 0;
    let descuento = 0;
    let igv = 0;
    let total = 0;

    items.forEach((item) => {
      const itemTotals = this.calculateItemTotals(item);
      subtotal += itemTotals.subtotal;
      descuento += item.descuento || 0;
      igv += itemTotals.igv;
      total += itemTotals.total;
    });

    return {
      subtotal,
      descuento,
      igv,
      total,
    };
  }

  /**
   * Crear nueva Orden de Compra
   */
  async create(data: CreatePurchaseOrderDto) {
    // Validaciones
    if (!data.items || data.items.length === 0) {
      throw new Error('La orden de compra debe tener al menos un item');
    }

    // Validar que el proveedor exista
    const proveedor = await prisma.client.findUnique({
      where: { id: data.proveedorId },
    });

    if (!proveedor) {
      throw new Error('Proveedor no encontrado');
    }

    if (!['Proveedor', 'Ambos'].includes(proveedor.tipoEntidad)) {
      throw new Error('La entidad seleccionada no es un proveedor');
    }

    // Validar que el almacén exista
    const almacen = await prisma.warehouse.findUnique({
      where: { id: data.almacenDestinoId },
    });

    if (!almacen || !almacen.activo) {
      throw new Error('Almacén no encontrado o inactivo');
    }

    // Validar que el usuario exista
    const usuario = await prisma.user.findUnique({
      where: { id: data.creadoPorId },
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Validar productos
    for (const item of data.items) {
      const producto = await prisma.product.findUnique({
        where: { id: item.productoId },
      });

      if (!producto || !producto.estado) {
        throw new Error(`Producto ${item.productoId} no encontrado o inactivo`);
      }

      if (item.cantidadOrdenada <= 0) {
        throw new Error('La cantidad ordenada debe ser mayor a 0');
      }

      if (item.precioUnitario <= 0) {
        throw new Error('El precio unitario debe ser mayor a 0');
      }
    }

    // Generar código
    const codigo = await this.generatePurchaseOrderCode();

    // Calcular totales
    const totals = this.calculateOrderTotals(data.items);

    // Crear OC con sus items en transacción
    const ordenCompra = await prisma.$transaction(async (tx) => {
      // Crear OC
      const oc = await tx.purchaseOrder.create({
        data: {
          codigo,
          estado: 'PENDIENTE',
          proveedorId: data.proveedorId,
          almacenDestinoId: data.almacenDestinoId,
          creadoPorId: data.creadoPorId,
          fechaEntregaEstimada: data.fechaEntregaEstimada 
            ? new Date(data.fechaEntregaEstimada) 
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),  // ✅ Default: 7 días desde hoy
          moneda: data.moneda || 'PEN',
          condicionesPago: data.condicionesPago || 'Por definir',  // ✅ Valor por defecto
          formaPago: data.formaPago || 'Por definir',  // ✅ Valor por defecto
          observaciones: data.observaciones,
          subtotal: totals.subtotal,
          descuento: totals.descuento,
          igv: totals.igv,
          total: totals.total,
        },
      });

      // Crear items
      for (const item of data.items) {
        const itemTotals = this.calculateItemTotals(item);

        await tx.purchaseOrderItem.create({
          data: {
            ordenCompraId: oc.id,
            productoId: item.productoId,
            cantidadOrdenada: item.cantidadOrdenada,
            cantidadPendiente: item.cantidadOrdenada,
            precioUnitario: item.precioUnitario,
            descuento: item.descuento || 0,
            incluyeIGV: item.incluyeIGV !== undefined ? item.incluyeIGV : true,  // ✅ Persistir incluyeIGV
            subtotal: itemTotals.subtotal,
            igv: itemTotals.igv,
            total: itemTotals.total,
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

    return ordenCompra;
  }

  /**
   * Listar Órdenes de Compra con filtros y paginación
   */
  async findAll(filters: FilterPurchaseOrderDto = {}) {
    const {
      estado,
      proveedorId,
      fechaDesde,
      fechaHasta,
      almacenDestinoId,
      page = 1,
      limit = 20,
    } = filters;

    // Construir filtros
    const where: Prisma.PurchaseOrderWhereInput = {
      deletedAt: null, // Excluir eliminados (soft delete)
    };

    if (estado) {
      if (Array.isArray(estado)) {
        where.estado = { in: estado };
      } else {
        where.estado = estado;
      }
    }

    if (proveedorId) {
      where.proveedorId = proveedorId;
    }

    if (almacenDestinoId) {
      where.almacenDestinoId = almacenDestinoId;
    }

    if (fechaDesde || fechaHasta) {
      where.fechaEmision = {};
      if (fechaDesde) {
        where.fechaEmision.gte = new Date(fechaDesde);
      }
      if (fechaHasta) {
        where.fechaEmision.lte = new Date(fechaHasta);
      }
    }

    // Paginación
    const skip = (page - 1) * limit;

    // Consulta con paginación
    const [ordenes, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          proveedor: {
            select: {
              id: true,
              razonSocial: true,
              nombres: true,
              apellidos: true,
              numeroDocumento: true,
            },
          },
          almacenDestino: {
            select: {
              id: true,
              codigo: true,
              nombre: true,
            },
          },
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
              producto: {
                select: {
                  id: true,
                  codigo: true,
                  nombre: true,
                },
              },
            },
          },
        },
        orderBy: {
          fechaEmision: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: ordenes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener Orden de Compra por ID
   */
  async findOne(id: string) {
    const ordenCompra = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        proveedor: true,
        almacenDestino: true,
        creadoPor: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        aprobadoPor: {
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
        recepciones: {
          include: {
            recibidoPor: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        factura: true,
      },
    });

    if (!ordenCompra) {
      throw new Error('Orden de compra no encontrada');
    }

    return ordenCompra;
  }

  /**
   * Actualizar Orden de Compra (solo si está en estado PENDIENTE)
   */
  async update(id: string, data: UpdatePurchaseOrderDto) {
    const ordenCompra = await this.findOne(id);

    if (ordenCompra.estado !== 'PENDIENTE') {
      throw new Error(
        'Solo se pueden editar órdenes de compra en estado PENDIENTE'
      );
    }

    // Validaciones similares a create
    if (data.items && data.items.length > 0) {
      // Validar productos
      for (const item of data.items) {
        const producto = await prisma.product.findUnique({
          where: { id: item.productoId },
        });

        if (!producto || !producto.estado) {
          throw new Error(`Producto ${item.productoId} no encontrado o inactivo`);
        }
      }

      // Calcular nuevos totales
      const totals = this.calculateOrderTotals(data.items);

      // Actualizar con transacción
      const updatedOC = await prisma.$transaction(async (tx) => {
        // Eliminar items existentes
        await tx.purchaseOrderItem.deleteMany({
          where: { ordenCompraId: id },
        });

        // Crear nuevos items
        if (data.items && data.items.length > 0) {
          for (const item of data.items) {
            const itemTotals = this.calculateItemTotals(item);

          await tx.purchaseOrderItem.create({
            data: {
              ordenCompraId: id,
              productoId: item.productoId,
              cantidadOrdenada: item.cantidadOrdenada,
              cantidadPendiente: item.cantidadOrdenada,
              precioUnitario: item.precioUnitario,
              descuento: item.descuento || 0,
              incluyeIGV: item.incluyeIGV !== undefined ? item.incluyeIGV : true,  // ✅ Persistir incluyeIGV
              subtotal: itemTotals.subtotal,
              igv: itemTotals.igv,
              total: itemTotals.total,
            },
          });
          }
        }

        // Calcular totales actualizados
        const totals = data.items
          ? this.calculateOrderTotals(data.items)
          : { subtotal: 0, descuento: 0, igv: 0, total: 0 };

        // Actualizar OC
        const updateData: any = { ...data };
        delete updateData.items; // Remover items del update directo
        
        return tx.purchaseOrder.update({
          where: { id },
          data: {
            ...updateData,
            subtotal: totals.subtotal,
            descuento: totals.descuento,
            igv: totals.igv,
            total: totals.total,
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
      });

      return updatedOC;
    }

    // Si no hay items, solo actualizar campos básicos
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        proveedorId: data.proveedorId,
        almacenDestinoId: data.almacenDestinoId,
        fechaEntregaEstimada: data.fechaEntregaEstimada
          ? new Date(data.fechaEntregaEstimada)
          : undefined,
        moneda: data.moneda,
        condicionesPago: data.condicionesPago,
        formaPago: data.formaPago,
        observaciones: data.observaciones,
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
  }

  /**
   * Cambiar estado de Orden de Compra
   */
  async updateStatus(
    id: string,
    newStatus: PurchaseOrderStatus,
    observaciones?: string,
    userId?: string
  ) {
    const ordenCompra = await this.findOne(id);
    
    console.log(`[updateStatus] ID: ${id}, Estado actual: ${ordenCompra.estado}, Nuevo estado: ${newStatus}, Observaciones: ${observaciones}`);

    // Validar transiciones de estado permitidas
    const validTransitions: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
      PENDIENTE: ['ENVIADA', 'CANCELADA'],
      ENVIADA: ['CONFIRMADA', 'CANCELADA'],
      CONFIRMADA: ['EN_RECEPCION', 'CANCELADA'],
      EN_RECEPCION: ['PARCIAL', 'COMPLETADA'],
      PARCIAL: ['EN_RECEPCION', 'COMPLETADA'],
      COMPLETADA: ['CERRADA'],
      CERRADA: [],
      CANCELADA: [],
    };

    const allowedTransitions = validTransitions[ordenCompra.estado];

    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `No se puede cambiar de estado ${ordenCompra.estado} a ${newStatus}`
      );
    }

    // Datos de actualización
    const updateData: any = {
      estado: newStatus,
    };
    
    // Agregar observaciones si se proporcionan
    if (observaciones) {
      updateData.observaciones = observaciones;
    }

    // Actualizar fechas según estado
    if (newStatus === 'ENVIADA') {
      updateData.fechaEnvio = new Date();
    } else if (newStatus === 'CONFIRMADA') {
      updateData.fechaConfirmacion = new Date();
    } else if (newStatus === 'COMPLETADA') {
      updateData.fechaEntregaReal = new Date();
    }

    // Actualizar aprobadoPor si se proporciona userId
    if (userId && ['CONFIRMADA', 'CERRADA'].includes(newStatus)) {
      updateData.aprobadoPorId = userId;
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: updateData,
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
  }

  /**
   * Eliminar Orden de Compra (soft delete)
   */
  async delete(id: string) {
    const ordenCompra = await this.findOne(id);

    // Solo se pueden eliminar OC en estado PENDIENTE
    if (ordenCompra.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden eliminar órdenes en estado PENDIENTE');
    }

    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Obtener estadísticas de órdenes de compra
   */
  async getStatistics() {
    const [
      totalPendientes,
      totalEnviadas,
      totalConfirmadas,
      totalCompletadas,
      montoTotalMes,
    ] = await Promise.all([
      prisma.purchaseOrder.count({
        where: { estado: 'PENDIENTE', deletedAt: null },
      }),
      prisma.purchaseOrder.count({
        where: { estado: 'ENVIADA', deletedAt: null },
      }),
      prisma.purchaseOrder.count({
        where: { estado: 'CONFIRMADA', deletedAt: null },
      }),
      prisma.purchaseOrder.count({
        where: { estado: 'COMPLETADA', deletedAt: null },
      }),
      prisma.purchaseOrder.aggregate({
        where: {
          fechaEmision: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
          deletedAt: null,
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    return {
      totalPendientes,
      totalEnviadas,
      totalConfirmadas,
      totalCompletadas,
      montoTotalMes: montoTotalMes._sum.total || 0,
    };
  }

  /**
   * Generar PDF de Orden de Compra con formato profesional
   */
  async generatePDF(id: string): Promise<Buffer> {
    const orden = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        proveedor: true,
        almacenDestino: true,
        items: {
          include: {
            producto: true,
          },
        },
        creadoPor: true,
      },
    });

    if (!orden) {
      throw new Error('Orden de compra no encontrada');
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

      // Generar cada sección del PDF
      this.generateHeader(doc, empresa, orden);
      this.generateOrderInfo(doc, orden);
      this.generateSupplierInfo(doc, orden);
      const itemsEndY = this.generateItemsTable(doc, orden);
      this.generateTotals(doc, orden, itemsEndY);
      this.generateFooter(doc, orden);

      doc.end();
    });
  }

  private generateHeader(doc: PDFKit.PDFDocument, empresa: any, orden: any) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(empresa.razonSocial, 50, 50, { align: 'left' })
      .fontSize(10)
      .font('Helvetica')
      .text(`RUC: ${empresa.ruc}`, 50, 75)
      .text(empresa.direccion || '', 50, 90)
      .text(`Tel: ${empresa.telefono || ''}`, 50, 105)
      .text(empresa.email || '', 50, 120);

    // Recuadro del tipo de documento (derecha)
    const boxX = 380;
    const boxY = 50;
    const boxWidth = 165;
    const boxHeight = 80;

    doc
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('ORDEN DE COMPRA', boxX, boxY + 15, {
        width: boxWidth,
        align: 'center',
      })
      .fontSize(10)
      .font('Helvetica')
      .text(orden.codigo, boxX, boxY + 35, {
        width: boxWidth,
        align: 'center',
      });

    doc.moveDown(3);
  }

  private generateOrderInfo(doc: PDFKit.PDFDocument, orden: any) {
    const startY = 150;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('FECHA DE EMISIÓN:', 50, startY)
      .font('Helvetica')
      .text(new Date(orden.fechaEmision).toLocaleDateString('es-PE'), 200, startY);

    if (orden.fechaEntregaEstimada) {
      doc
        .font('Helvetica-Bold')
        .text('FECHA DE ENTREGA:', 50, startY + 15)
        .font('Helvetica')
        .text(new Date(orden.fechaEntregaEstimada).toLocaleDateString('es-PE'), 200, startY + 15);
    }

    doc
      .font('Helvetica-Bold')
      .text('ESTADO:', 50, startY + 30)
      .font('Helvetica');

    // Color según estado
    let estadoColor = '#000000';
    if (orden.estado === 'PENDIENTE') estadoColor = '#F39C12';
    if (orden.estado === 'ENVIADA') estadoColor = '#3498DB';
    if (orden.estado === 'CONFIRMADA') estadoColor = '#9B59B6';
    if (orden.estado === 'EN_RECEPCION') estadoColor = '#1ABC9C';
    if (orden.estado === 'RECEPCIONADA') estadoColor = '#16A085';
    if (orden.estado === 'PARCIALMENTE_RECIBIDA') estadoColor = '#F1C40F';
    if (orden.estado === 'COMPLETADA') estadoColor = '#27AE60';
    if (orden.estado === 'CANCELADA') estadoColor = '#E74C3C';

    doc
      .fillColor(estadoColor)
      .text(orden.estado.replace(/_/g, ' '), 200, startY + 30)
      .fillColor('#000000');

    doc
      .font('Helvetica-Bold')
      .text('RESPONSABLE:', 50, startY + 45)
      .font('Helvetica')
      .text(`${orden.creadoPor.firstName} ${orden.creadoPor.lastName}`, 200, startY + 45);

    doc
      .font('Helvetica-Bold')
      .text('MONEDA:', 50, startY + 60)
      .font('Helvetica')
      .text(orden.moneda, 200, startY + 60);

    if (orden.condicionesPago) {
      doc
        .font('Helvetica-Bold')
        .text('CONDICIONES DE PAGO:', 50, startY + 75)
        .font('Helvetica')
        .text(orden.condicionesPago, 200, startY + 75, { width: 345 });
    }

    if (orden.formaPago) {
      doc
        .font('Helvetica-Bold')
        .text('FORMA DE PAGO:', 50, startY + 90)
        .font('Helvetica')
        .text(orden.formaPago, 200, startY + 90);
    }

    doc.moveDown(2);
  }

  private generateSupplierInfo(doc: PDFKit.PDFDocument, orden: any) {
    const startY = 290;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('DATOS DEL PROVEEDOR', 50, startY)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Proveedor:', 50, startY + 20)
      .font('Helvetica')
      .text(orden.proveedor.razonSocial || orden.proveedor.nombre || '', 130, startY + 20, { width: 400 });

    doc
      .font('Helvetica-Bold')
      .text('RUC/DNI:', 50, startY + 35)
      .font('Helvetica')
      .text(orden.proveedor.numeroDocumento, 130, startY + 35);

    if (orden.proveedor.direccion) {
      doc
        .font('Helvetica-Bold')
        .text('Dirección:', 50, startY + 50)
        .font('Helvetica')
        .text(orden.proveedor.direccion, 130, startY + 50, { width: 400 });
    }

    if (orden.proveedor.telefono) {
      doc
        .font('Helvetica-Bold')
        .text('Teléfono:', 50, startY + 65)
        .font('Helvetica')
        .text(orden.proveedor.telefono, 130, startY + 65);
    }

    if (orden.proveedor.email) {
      doc
        .font('Helvetica-Bold')
        .text('Email:', 50, startY + 80)
        .font('Helvetica')
        .text(orden.proveedor.email, 130, startY + 80);
    }

    // Almacén destino
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('ALMACÉN DESTINO', 50, startY + 105)
      .moveDown(0.5);

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Almacén:', 50, startY + 125)
      .font('Helvetica')
      .text(orden.almacenDestino.nombre, 130, startY + 125);

    if (orden.almacenDestino.ubicacion) {
      doc
        .font('Helvetica-Bold')
        .text('Ubicación:', 50, startY + 140)
        .font('Helvetica')
        .text(orden.almacenDestino.ubicacion, 130, startY + 140, { width: 400 });
    }

    doc.moveDown(2);
  }

  private generateItemsTable(doc: PDFKit.PDFDocument, orden: any): number {
    const tableTop = 480;
    const itemCodeX = 50;
    const descriptionX = 120;
    const quantityX = 320;
    const unitX = 370;
    const priceX = 420;
    const amountX = 490;

    // Header de la tabla
    doc
      .fontSize(10)
      .font('Helvetica-Bold');

    doc
      .text('CÓDIGO', itemCodeX, tableTop)
      .text('DESCRIPCIÓN', descriptionX, tableTop)
      .text('CANT.', quantityX, tableTop)
      .text('UNIDAD', unitX, tableTop)
      .text('P. UNIT.', priceX, tableTop)
      .text('TOTAL', amountX, tableTop);

    // Línea debajo del header
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(545, tableTop + 15)
      .stroke();

    // Items
    let position = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    orden.items.forEach((item: any) => {
      // Verificar si hay espacio suficiente, si no, agregar nueva página
      if (position > 680) {
        doc.addPage();
        position = 50;
      }

      const productCode = item.producto?.codigo || 'N/A';
      const unidad = item.unidadMedida || 'UND';

      doc
        .text(productCode, itemCodeX, position, { width: 60 })
        .text(item.producto.nombre, descriptionX, position, { width: 190 })
        .text(item.cantidadOrdenada.toString(), quantityX, position, { width: 40, align: 'right' })
        .text(unidad, unitX, position, { width: 40, align: 'center' })
        .text(`${orden.moneda} ${parseFloat(item.precioUnitario).toFixed(2)}`, priceX, position, { width: 60, align: 'right' })
        .text(`${orden.moneda} ${parseFloat(item.subtotal).toFixed(2)}`, amountX, position, { width: 55, align: 'right' });

      position += 20;
    });

    // Línea después de items
    doc
      .moveTo(50, position + 5)
      .lineTo(545, position + 5)
      .stroke();

    return position + 15;
  }

  private generateTotals(doc: PDFKit.PDFDocument, orden: any, startY: number) {
    const position = Math.max(startY, 620);

    doc
      .fontSize(10)
      .font('Helvetica-Bold');

    // Subtotal
    doc
      .text('SUBTOTAL:', 380, position, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`${orden.moneda} ${parseFloat(orden.subtotal).toFixed(2)}`, 490, position, { width: 55, align: 'right' });

    // Descuento
    if (orden.descuento && orden.descuento > 0) {
      doc
        .font('Helvetica-Bold')
        .text('DESCUENTO:', 380, position + 20, { width: 100, align: 'right' })
        .font('Helvetica')
        .text(`- ${orden.moneda} ${parseFloat(orden.descuento).toFixed(2)}`, 490, position + 20, { width: 55, align: 'right' });
    }

    // IGV
    const igvY = orden.descuento > 0 ? position + 40 : position + 20;
    doc
      .font('Helvetica-Bold')
      .text('IGV (18%):', 380, igvY, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`${orden.moneda} ${parseFloat(orden.igv).toFixed(2)}`, 490, igvY, { width: 55, align: 'right' });

    // Total
    const totalY = igvY + 25;
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', 380, totalY, { width: 100, align: 'right' })
      .text(`${orden.moneda} ${parseFloat(orden.total).toFixed(2)}`, 490, totalY, { width: 55, align: 'right' });

    // Observaciones si existen
    if (orden.observaciones) {
      const obsY = totalY + 40;
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('OBSERVACIONES:', 50, obsY)
        .font('Helvetica')
        .text(orden.observaciones, 50, obsY + 15, { width: 495 });
    }
  }

  private generateFooter(doc: PDFKit.PDFDocument, orden: any) {
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(
        'Esta orden de compra es un documento oficial y debe ser firmado por ambas partes.',
        50,
        740,
        { align: 'center', width: 495 }
      )
      .font('Helvetica')
      .text(
        'Para cualquier consulta comunicarse con el departamento de compras.',
        50,
        755,
        { align: 'center', width: 495 }
      )
      .text(
        `Generado el ${new Date().toLocaleString('es-PE')}`,
        50,
        770,
        { align: 'center', width: 495 }
      );
  }
}

export const purchasesService = new PurchasesService();
