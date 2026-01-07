import { prisma } from '../config/database';
import { $Enums } from '@prisma/client';

export interface CreateCreditNoteInput {
  saleId: string;
  usuarioId: string;
  creditNoteReason: $Enums.CreditNoteReason;
  descripcion?: string;
  items: {
    saleItemId: string;
    cantidad: number;
  }[];
}

// ✅ NUEVO: Interface para datos de pago
export interface CreditNotePaymentData {
  method: 'Efectivo' | 'Transferencia' | 'Vale';
  cashSessionId?: string;
}

export class CreditNoteService {
  /**
   * Generar código único de nota de crédito (NC-0001, NC-0002, ...)
   */
  private async generateCreditNoteCode(): Promise<string> {
    const lastCreditNote = await prisma.sale.findFirst({
      where: { tipo: $Enums.SaleType.NotaCredito },
      orderBy: { codigoVenta: 'desc' },
    });

    if (!lastCreditNote) {
      return 'NC-0001';
    }

    const parts = lastCreditNote.codigoVenta.split('-');
    const lastNumber = parseInt(parts[1] || '0');
    const newNumber = lastNumber + 1;
    return `NC-${newNumber.toString().padStart(4, '0')}`;
  }

  /**
   * Validar que se puede crear una nota de crédito
   */
  async validateCreditNote(saleId: string, items: CreateCreditNoteInput['items']) {
    // Obtener la venta original
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: true,
        creditNotes: {
          include: { items: true },
        },
      },
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    // Validar que la venta está completada
    if (sale.estado !== $Enums.SaleStatus.Completada) {
      throw new Error('Solo se pueden emitir notas de crédito para ventas completadas');
    }

    // Validar que la venta original no sea ya una nota de crédito
    if (sale.tipo === $Enums.SaleType.NotaCredito) {
      throw new Error('No se puede crear una nota de crédito sobre otra nota de crédito');
    }

    // Calcular cantidades ya devueltas por item
    const devueltosPorItem = new Map<string, number>();
    
    for (const creditNote of sale.creditNotes) {
      for (const item of creditNote.items) {
        const currentDevuelto = devueltosPorItem.get(item.productId) || 0;
        devueltosPorItem.set(item.productId, currentDevuelto + item.cantidad);
      }
    }

    // Validar cada item de la nota de crédito
    for (const ncItem of items) {
      const originalItem = sale.items.find(si => si.id === ncItem.saleItemId);
      
      if (!originalItem) {
        throw new Error(`Item con ID ${ncItem.saleItemId} no encontrado en la venta original`);
      }

      const yaDevuelto = devueltosPorItem.get(originalItem.productId) || 0;
      const disponibleParaDevolver = originalItem.cantidad - yaDevuelto;

      if (ncItem.cantidad <= 0) {
        throw new Error('La cantidad a devolver debe ser mayor a cero');
      }

      if (ncItem.cantidad > disponibleParaDevolver) {
        throw new Error(
          `Cantidad a devolver de "${originalItem.nombreProducto}" excede lo disponible. ` +
          `Disponible: ${disponibleParaDevolver}, Solicitado: ${ncItem.cantidad}`
        );
      }
    }

    return { sale, devueltosPorItem };
  }

  /**
   * Reversar inventario (devolver productos al almacén)
   */
  private async reversarInventario(
    almacenId: string,
    items: Array<{ productId: string; nombreProducto: string; cantidad: number }>,
    creditNoteCode: string,
    usuarioId: string
  ) {
    for (const item of items) {
      // Obtener stock actual
      const stockInfo = await prisma.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: almacenId,
          },
        },
      });

      const stockBefore = stockInfo?.quantity || 0;
      const stockAfter = stockBefore + item.cantidad;

      // Actualizar stock (incrementar)
      await prisma.stockByWarehouse.upsert({
        where: {
          productId_warehouseId: {
            productId: item.productId,
            warehouseId: almacenId,
          },
        },
        update: {
          quantity: {
            increment: item.cantidad,
          },
        },
        create: {
          productId: item.productId,
          warehouseId: almacenId,
          quantity: item.cantidad,
        },
      });

      // Registrar movimiento de inventario (ENTRADA)
      await prisma.inventoryMovement.create({
        data: {
          productId: item.productId,
          warehouseId: almacenId,
          type: 'ENTRADA',
          quantity: item.cantidad,
          stockBefore,
          stockAfter,
          reason: 'Devolución por nota de crédito',
          documentRef: `Nota de Crédito: ${creditNoteCode}`,
          userId: usuarioId,
        },
      });
    }
  }

  /**
   * Crear una nota de crédito
   */
  async createCreditNote(data: CreateCreditNoteInput, paymentData: CreditNotePaymentData) {
    // Validar que se puede crear la nota de crédito
    const { sale } = await this.validateCreditNote(data.saleId, data.items);

    // Construir items de la nota de crédito
    const creditNoteItems: Array<{
      productId: string;
      nombreProducto: string;
      cantidad: number;
      precioUnitario: any;
      subtotal: number;
    }> = [];
    let subtotal = 0;

    for (const ncItem of data.items) {
      const originalItem = sale.items.find(si => si.id === ncItem.saleItemId);
      
      if (!originalItem) continue;

      const itemSubtotal = ncItem.cantidad * Number(originalItem.precioUnitario);
      subtotal += itemSubtotal;

      creditNoteItems.push({
        productId: originalItem.productId,
        nombreProducto: originalItem.nombreProducto,
        cantidad: ncItem.cantidad,
        precioUnitario: originalItem.precioUnitario,
        subtotal: itemSubtotal,
      });
    }

    // ✅ Calcular IGV y total RESPETANDO el IGV de la venta original
    const igvOriginal = Number(sale.igv);
    const tieneIGV = igvOriginal > 0;
    const igv = tieneIGV ? subtotal * 0.18 : 0;
    const total = subtotal + igv;

    // Generar código de nota de crédito
    const codigoCreditNote = await this.generateCreditNoteCode();

    // ✅ NUEVO: Determinar estado y método según paymentData
    let creditNoteStatus: $Enums.CreditNoteStatus;
    let creditNotePaymentMethod: $Enums.CreditNotePaymentMethod;

    switch (paymentData.method) {
      case 'Efectivo':
        creditNoteStatus = $Enums.CreditNoteStatus.Reembolsada;
        creditNotePaymentMethod = $Enums.CreditNotePaymentMethod.Efectivo;
        break;
      case 'Transferencia':
        creditNoteStatus = $Enums.CreditNoteStatus.PendientePagoBancario;
        creditNotePaymentMethod = $Enums.CreditNotePaymentMethod.Transferencia;
        break;
      case 'Vale':
        creditNoteStatus = $Enums.CreditNoteStatus.Pendiente;
        creditNotePaymentMethod = $Enums.CreditNotePaymentMethod.Vale;
        break;
    }

    // ✅ NUEVO: Crear NC y movimiento de caja en transacción
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear la nota de crédito
      const creditNote = await tx.sale.create({
        data: {
          codigoVenta: codigoCreditNote,
          tipo: $Enums.SaleType.NotaCredito,
          saleOriginId: data.saleId,
          clienteId: sale.clienteId,
          almacenId: sale.almacenId,
          usuarioId: data.usuarioId,
          fechaEmision: new Date(),
          tipoComprobante: sale.tipoComprobante,
          formaPago: sale.formaPago,
          subtotal: subtotal,
          igv: igv,
          total: total,
          estado: $Enums.SaleStatus.Completada,
          creditNoteReason: data.creditNoteReason,
          creditNoteDescription: data.descripcion,
          creditNoteStatus: creditNoteStatus,
          creditNotePaymentMethod: creditNotePaymentMethod,
          items: {
            create: creditNoteItems,
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
          saleOrigin: {
            select: {
              id: true,
              codigoVenta: true,
              total: true,
            },
          },
        },
      });

      // 2. Si es reembolso en efectivo, crear movimiento de caja automático
      if (paymentData.method === 'Efectivo' && paymentData.cashSessionId) {
        const cashMovement = await tx.cashMovement.create({
          data: {
            cashSessionId: paymentData.cashSessionId,
            tipo: $Enums.CashMovementType.EGRESO,
            monto: total,
            motivo: `Reembolso por NC ${codigoCreditNote}`,
            descripcion: `Devolución ${data.creditNoteReason}: ${data.descripcion || 'Sin descripción'}`,
            usuarioId: data.usuarioId,
          },
        });

        // Vincular NC con el movimiento de caja
        await tx.sale.update({
          where: { id: creditNote.id },
          data: {
            cashMovementId: cashMovement.id,
            creditNoteRefundDate: new Date(),
          },
        });
      }

      // ✅ 2.5 Actualizar totalVentas en la sesión de caja de la venta original
      if (sale.cashSessionId) {
        await tx.cashSession.update({
          where: { id: sale.cashSessionId },
          data: {
            totalVentas: {
              decrement: total, // Decrementar el total por la devolución
            },
          },
        });
        console.log(`✅ CashSession ${sale.cashSessionId} actualizada por NC: -S/ ${total.toFixed(2)}`);
      }

      // 3. Reversar inventario (siempre, porque son devoluciones físicas)
      await this.reversarInventario(
        sale.almacenId,
        creditNoteItems,
        codigoCreditNote,
        data.usuarioId
      );

      return creditNote;
    });

    return result;
  }

  /**
   * Obtener notas de crédito de una venta
   */
  async getCreditNotesBySale(saleId: string) {
    const creditNotes = await prisma.sale.findMany({
      where: {
        tipo: $Enums.SaleType.NotaCredito,
        saleOriginId: saleId,
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
      orderBy: { fechaEmision: 'desc' },
    });

    return creditNotes;
  }

  /**
   * Obtener resumen de devoluciones de una venta
   */
  async getSaleWithCreditNotes(saleId: string) {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: true,
        creditNotes: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    // Calcular totales
    const totalCreditNotes = sale.creditNotes.reduce(
      (sum, cn) => sum + Math.abs(Number(cn.total)),
      0
    );

    const totalNeto = Number(sale.total) - totalCreditNotes;

    return {
      sale,
      summary: {
        totalOriginal: Number(sale.total),
        totalCreditNotes,
        totalNeto,
        creditNotesCount: sale.creditNotes.length,
      },
    };
  }
}

export const creditNoteService = new CreditNoteService();
