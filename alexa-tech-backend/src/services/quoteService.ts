import { prisma } from '../config/database';
import { $Enums } from '@prisma/client';

export interface CreateQuoteInput {
  clienteId: string;
  almacenId: string;
  usuarioId: string;
  diasValidez?: number;
  observaciones?: string;
  items: {
    productId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
}

export interface ConvertToSaleInput {
  quoteId: string;
  userId: string;
  formaPago: $Enums.SalePaymentMethod;
  tipoComprobante: $Enums.SaleVoucherType;
  cashSessionId?: string;
}

export interface QuoteFilters {
  fechaDesde?: Date;
  fechaHasta?: Date;
  estado?: $Enums.QuoteStatus;
  clienteId?: string;
  usuarioId?: string;
  page?: number;
  limit?: number;
}

export class QuoteService {
  /**
   * Generar código único de cotización (COT-0001, COT-0002, ...)
   */
  private async generateQuoteCode(): Promise<string> {
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { codigoCotizacion: 'desc' },
    });

    if (!lastQuote) {
      return 'COT-0001';
    }

    const parts = lastQuote.codigoCotizacion.split('-');
    const lastNumber = parseInt(parts[1] || '0');
    const newNumber = lastNumber + 1;
    return `COT-${newNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Crear una nueva cotización
   */
  async createQuote(data: CreateQuoteInput) {
    // Validar que el cliente exista
    const cliente = await prisma.client.findUnique({
      where: { id: data.clienteId },
    });

    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Validar que el almacén exista
    const almacen = await prisma.warehouse.findUnique({
      where: { id: data.almacenId },
    });

    if (!almacen) {
      throw new Error('Almacén no encontrado');
    }

    // Validar que haya items
    if (!data.items || data.items.length === 0) {
      throw new Error('La cotización debe tener al menos un producto');
    }

    // Obtener configuración de empresa para IGV
    const empresa = await prisma.company.findFirst();
    const igvActivo = empresa?.igvActivo ?? true; // Por defecto true si no hay configuración
    const igvPorcentaje = Number(empresa?.igvPorcentaje ?? 18); // Convertir a número, por defecto 18%
    
    // Validar y calcular totales
    let subtotal = 0;
    const quoteItems = [];

    for (const item of data.items) {
      // Verificar que el producto exista
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Producto con ID ${item.productId} no encontrado`);
      }

      if (item.cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a cero');
      }

      if (item.precioUnitario <= 0) {
        throw new Error('El precio unitario debe ser mayor a cero');
      }

      const itemSubtotal = item.cantidad * item.precioUnitario;
      subtotal += itemSubtotal;

      quoteItems.push({
        productId: item.productId,
        nombreProducto: product.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: itemSubtotal,
      });
    }

    // Calcular IGV y total según configuración de empresa
    const igv = igvActivo ? subtotal * (igvPorcentaje / 100) : 0;
    const total = subtotal + igv;

    // Calcular fecha de vencimiento
    const diasValidez = data.diasValidez || 15;
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + diasValidez);

    // Generar código de cotización
    const codigoCotizacion = await this.generateQuoteCode();

    // Crear la cotización con sus items
    const quote = await prisma.quote.create({
      data: {
        codigoCotizacion,
        clienteId: data.clienteId,
        almacenId: data.almacenId,
        usuarioId: data.usuarioId,
        fechaEmision: new Date(),
        fechaVencimiento,
        diasValidez,
        subtotal,
        igv,
        total,
        estado: $Enums.QuoteStatus.Pendiente,
        observaciones: data.observaciones,
        items: {
          create: quoteItems,
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: true,
      },
    });

    return quote;
  }

  /**
   * Obtener cotizaciones con filtros
   */
  async getQuotes(filters: QuoteFilters = {}) {
    const {
      fechaDesde,
      fechaHasta,
      estado,
      clienteId,
      usuarioId,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {};

    if (fechaDesde) {
      where.fechaEmision = { gte: fechaDesde };
    }

    if (fechaHasta) {
      where.fechaEmision = { ...where.fechaEmision, lte: fechaHasta };
    }

    if (estado) {
      where.estado = estado;
    }

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (usuarioId) {
      where.usuarioId = usuarioId;
    }

    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaEmision: 'desc' },
        include: {
          cliente: true,
          usuario: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          items: true,
        },
      }),
      prisma.quote.count({ where }),
    ]);

    return {
      quotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener una cotización por ID
   */
  async getQuoteById(quoteId: string): Promise<any> {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: {
        cliente: true,
        usuario: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!quote) {
      throw new Error('Cotización no encontrada');
    }

    return quote;
  }

  /**
   * Generar código único de venta (V-0001, V-0002, ...)
   */
  private async generateSaleCode(): Promise<string> {
    // Obtener todas las ventas y encontrar el número más alto
    const sales = await prisma.sale.findMany({
      select: { codigoVenta: true },
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limitar para performance
    });

    if (sales.length === 0) {
      return 'V-0001';
    }

    // Extraer números y encontrar el máximo
    let maxNumber = 0;
    for (const sale of sales) {
      const parts = sale.codigoVenta.split('-');
      if (parts.length === 2 && parts[0] === 'V') {
        const num = parseInt(parts[1] || '0');
        if (!isNaN(num) && num > maxNumber) {
          maxNumber = num;
        }
      }
    }

    const newNumber = maxNumber + 1;
    return `V-${newNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Convertir cotización a venta (validando stock)
   */
  async convertToSale(data: ConvertToSaleInput) {
    const quote = await this.getQuoteById(data.quoteId);

    // Validar estado de cotización
    if (quote.estado === $Enums.QuoteStatus.Convertida) {
      throw new Error('Esta cotización ya fue convertida a venta');
    }

    if (quote.estado === $Enums.QuoteStatus.Vencida) {
      throw new Error('Esta cotización está vencida');
    }

    if (quote.estado === $Enums.QuoteStatus.Rechazada) {
      throw new Error('Esta cotización fue rechazada');
    }

    if (quote.estado === $Enums.QuoteStatus.Cancelada) {
      throw new Error('Esta cotización fue cancelada');
    }

    // Validar stock disponible para cada producto
    for (const item of quote.items) {
      const stockInfo = await prisma.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: quote.almacenId,
          },
        },
      });

      const stockDisponible = stockInfo?.quantity || 0;
      
      if (stockDisponible < item.cantidad) {
        throw new Error(
          `Stock insuficiente para ${item.nombreProducto}. Disponible: ${stockDisponible}, Requerido: ${item.cantidad}`
        );
      }
    }

    // Generar código de venta
    const codigoVenta = await this.generateSaleCode();

    // Crear la venta
    const sale = await prisma.sale.create({
      data: {
        codigoVenta,
        tipo: $Enums.SaleType.Venta,
        cashSessionId: data.cashSessionId,
        clienteId: quote.clienteId,
        almacenId: quote.almacenId,
        usuarioId: data.userId,
        fechaEmision: new Date(),
        tipoComprobante: data.tipoComprobante,
        formaPago: data.formaPago,
        subtotal: quote.subtotal,
        igv: quote.igv,
        total: quote.total,
        estado: $Enums.SaleStatus.Completada,
        quoteOriginId: quote.id,
        items: {
          create: quote.items.map((item: any) => ({
            productId: item.productId,
            nombreProducto: item.nombreProducto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          })),
        },
      },
      include: {
        items: true,
        usuario: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Actualizar inventario (restar stock)
    for (const item of quote.items) {
      // Obtener stock actual antes de actualizarlo
      const stockInfo = await prisma.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: quote.almacenId,
          },
        },
      });

      const stockBefore = stockInfo?.quantity || 0;
      const stockAfter = stockBefore - item.cantidad;

      // Actualizar stock
      await prisma.stockByWarehouse.update({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: quote.almacenId,
          },
        },
        data: {
          quantity: {
            decrement: item.cantidad,
          },
        },
      });

      // Registrar movimiento de inventario
      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          warehouseId: quote.almacenId,
          type: 'SALIDA',
          quantity: item.cantidad,
          stockBefore,
          stockAfter,
          reason: 'Venta convertida desde cotización',
          documentRef: `Cotización: ${quote.codigoCotizacion}`,
          userId: data.userId,
        },
      });
    }

    // Actualizar estado de cotización
    await prisma.quote.update({
      where: { id: quote.id },
      data: {
        estado: $Enums.QuoteStatus.Convertida,
        intentosConversion: {
          increment: 1,
        },
      },
    });

    return sale;
  }

  /**
   * Actualizar estado de cotización
   */
  async updateQuoteStatus(
    quoteId: string,
    estado: $Enums.QuoteStatus,
    motivoRechazo?: string
  ) {
    const quote = await this.getQuoteById(quoteId);

    // Validar transiciones de estado
    if (quote.estado === $Enums.QuoteStatus.Convertida) {
      throw new Error('No se puede cambiar el estado de una cotización convertida');
    }

    // Si se rechaza, requerir motivo
    if (estado === $Enums.QuoteStatus.Rechazada && !motivoRechazo) {
      throw new Error('Debe proporcionar un motivo de rechazo');
    }

    const updatedQuote = await prisma.quote.update({
      where: { id: quoteId },
      data: {
        estado,
        motivoRechazo: estado === $Enums.QuoteStatus.Rechazada ? motivoRechazo : null,
      },
      include: {
        usuario: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        items: true,
      },
    });

    return updatedQuote;
  }

  /**
   * Verificar y actualizar cotizaciones vencidas
   */
  async checkExpiredQuotes() {
    const now = new Date();

    const expiredQuotes = await prisma.quote.updateMany({
      where: {
        estado: {
          in: [$Enums.QuoteStatus.Pendiente, $Enums.QuoteStatus.Aceptada],
        },
        fechaVencimiento: {
          lt: now,
        },
      },
      data: {
        estado: $Enums.QuoteStatus.Vencida,
      },
    });

    return expiredQuotes.count;
  }

  /**
   * Eliminar una cotización (solo si está en Pendiente, Rechazada o Cancelada)
   */
  async deleteQuote(quoteId: string) {
    const quote = await this.getQuoteById(quoteId);

    if (
      quote.estado !== $Enums.QuoteStatus.Pendiente &&
      quote.estado !== $Enums.QuoteStatus.Rechazada &&
      quote.estado !== $Enums.QuoteStatus.Cancelada
    ) {
      throw new Error('Solo se pueden eliminar cotizaciones Pendientes, Rechazadas o Canceladas');
    }

    await prisma.quote.delete({
      where: { id: quoteId },
    });
  }
}

export const quoteService = new QuoteService();
