import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { configuracionService } from '../modules/configuracion/configuracion.service';

// Tipo para PDFDocument
type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface CreditNoteInvoiceData {
  creditNote: any;
  originalSale: any;
  company: {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
  };
  client?: {
    nombre: string;
    documento: string;
    direccion: string;
    telefono?: string;
  };
}

export const creditNoteInvoiceService = {
  async generateCreditNoteInvoice(creditNoteId: string): Promise<PDFDocumentType> {
    // Obtener NC con todos los detalles
    const creditNote = await prisma.sale.findUnique({
      where: { id: creditNoteId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        usuario: true,
        cliente: true,
        cashMovement: true,
      },
    });

    if (!creditNote || creditNote.tipo !== 'NotaCredito') {
      throw new Error('Nota de crédito no encontrada');
    }

    // Obtener venta original
    const originalSale = await prisma.sale.findUnique({
      where: { id: creditNote.saleOriginId! },
      include: {
        items: true,
        cliente: true,
      },
    });

    if (!originalSale) {
      throw new Error('Venta original no encontrada');
    }

    // Datos del cliente
    let clientData = null;
    if (creditNote.cliente) {
      clientData = {
        nombre:
          creditNote.cliente.razonSocial ||
          `${creditNote.cliente.nombres} ${creditNote.cliente.apellidos}`,
        documento: `${creditNote.cliente.tipoDocumento}: ${creditNote.cliente.numeroDocumento}`,
        direccion: creditNote.cliente.direccion,
        telefono: creditNote.cliente.telefono || undefined,
      };
    }

    // ✅ Obtener datos de la empresa desde configuración
    const company = await configuracionService.getCompany();
    
    if (!company) {
      throw new Error('No se encontró configuración de empresa. Configure los datos en Configuración > Empresa');
    }

    const companyData = {
      nombre: company.nombreComercial || company.razonSocial,
      ruc: company.ruc,
      direccion: company.direccion,
      telefono: company.telefono,
      email: company.email,
    };

    const invoiceData: CreditNoteInvoiceData = {
      creditNote,
      originalSale,
      company: companyData,
      client: clientData || undefined,
    };

    // Generar PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Nota de Crédito ${creditNote.codigoVenta}`,
        Author: 'Alexa Tech',
        Subject: `Nota de Crédito ${creditNote.codigoVenta}`,
      },
    });

    this.generateHeader(doc, invoiceData);
    this.generateCreditNoteInfo(doc, invoiceData);
    this.generateCustomerInfo(doc, invoiceData);
    this.generateItemsTable(doc, invoiceData);
    this.generateTotals(doc, invoiceData);
    this.generateFooter(doc, invoiceData);

    doc.end();
    return doc;
  },

  generateHeader(doc: PDFDocumentType, data: CreditNoteInvoiceData) {
    // Logo y empresa (izquierda)
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(data.company.nombre.toUpperCase(), 50, 50, { align: 'left' })
      .fontSize(10)
      .font('Helvetica')
      .text(`RUC: ${data.company.ruc}`, 50, 75)
      .text(data.company.direccion, 50, 90)
      .text(`Tel: ${data.company.telefono || ''}`, 50, 105)
      .text(data.company.email, 50, 120);

    // Recuadro de NC (derecha)
    const boxX = 380;
    const boxY = 50;
    const boxWidth = 165;
    const boxHeight = 80;

    doc
      .rect(boxX, boxY, boxWidth, boxHeight)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('NOTA DE CRÉDITO', boxX, boxY + 15, {
        width: boxWidth,
        align: 'center',
      })
      .fontSize(10)
      .font('Helvetica')
      .text(data.creditNote.codigoVenta, boxX, boxY + 35, {
        width: boxWidth,
        align: 'center',
      });

    doc.moveDown(3);
  },

  generateCreditNoteInfo(doc: PDFDocumentType, data: CreditNoteInvoiceData) {
    const startY = 150;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('DOCUMENTO QUE SE MODIFICA:', 50, startY)
      .font('Helvetica')
      .text(
        `${data.originalSale.tipoComprobante}: ${data.originalSale.codigoVenta}`,
        240,
        startY
      );

    doc
      .font('Helvetica-Bold')
      .text('FECHA DE EMISIÓN NC:', 50, startY + 20)
      .font('Helvetica')
      .text(
        new Date(data.creditNote.fechaEmision).toLocaleDateString('es-PE'),
        240,
        startY + 20
      );

    doc
      .font('Helvetica-Bold')
      .text('FECHA VENTA ORIGINAL:', 50, startY + 35)
      .font('Helvetica')
      .text(
        new Date(data.originalSale.fechaEmision).toLocaleDateString('es-PE'),
        240,
        startY + 35
      );

    doc
      .font('Helvetica-Bold')
      .text('MÉTODO DE RESOLUCIÓN:', 50, startY + 50)
      .font('Helvetica')
      .text(
        this.getPaymentMethodLabel(data.creditNote.creditNotePaymentMethod),
        240,
        startY + 50
      );

    if (data.creditNote.creditNoteDescription) {
      doc
        .font('Helvetica-Bold')
        .text('OBSERVACIONES:', 50, startY + 70)
        .font('Helvetica')
        .text(data.creditNote.creditNoteDescription, 50, startY + 85, {
          width: 495,
        });
    }

    doc.moveDown(2);
  },

  generateCustomerInfo(doc: PDFDocumentType, data: CreditNoteInvoiceData) {
    const startY = data.creditNote.creditNoteDescription ? 310 : 270;

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('DATOS DEL CLIENTE', 50, startY)
      .moveDown(0.5);

    if (data.client) {
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text('Cliente:', 50, startY + 20)
        .font('Helvetica')
        .text(data.client.nombre, 120, startY + 20);

      doc
        .font('Helvetica-Bold')
        .text('Documento:', 50, startY + 35)
        .font('Helvetica')
        .text(data.client.documento, 120, startY + 35);

      doc
        .font('Helvetica-Bold')
        .text('Dirección:', 50, startY + 50)
        .font('Helvetica')
        .text(data.client.direccion, 120, startY + 50, { width: 400 });
    } else {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('CLIENTE GENERAL', 50, startY + 20);
    }

    doc.moveDown(2);
  },

  generateItemsTable(doc: PDFDocumentType, data: CreditNoteInvoiceData) {
    const tableTop = data.creditNote.creditNoteDescription ? 400 : 360;
    const itemCodeX = 50;
    const descriptionX = 120;
    const quantityX = 350;
    const priceX = 420;
    const amountX = 490;

    // Header
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('CÓDIGO', itemCodeX, tableTop)
      .text('DESCRIPCIÓN', descriptionX, tableTop)
      .text('CANT.', quantityX, tableTop)
      .text('P. UNIT.', priceX, tableTop)
      .text('TOTAL', amountX, tableTop);

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    // Items devueltos
    let position = tableTop + 25;
    doc.font('Helvetica').fontSize(9);

    data.creditNote.items.forEach((item: any) => {
      if (position > 700) {
        doc.addPage();
        position = 50;
      }

      // Obtener código del producto
      const productCode = item.product?.codigo || item.productCode || item.productId || 'N/A';

      doc
        .fillColor('#000000')
        .text(productCode, itemCodeX, position, { width: 60 })
        .text(item.nombreProducto, descriptionX, position, { width: 220 })
        .text(Math.abs(item.cantidad).toString(), quantityX, position, {
          width: 50,
          align: 'right',
        })
        .text(`S/ ${Number(Math.abs(item.precioUnitario)).toFixed(2)}`, priceX, position, {
          width: 60,
          align: 'right',
        })
        .text(`S/ ${Number(Math.abs(item.subtotal)).toFixed(2)}`, amountX, position, {
          width: 55,
          align: 'right',
        });

      position += 20;
    });

    doc.moveTo(50, position + 5).lineTo(545, position + 5).stroke();

    return position + 15;
  },

  generateTotals(doc: PDFDocumentType, data: CreditNoteInvoiceData) {
    const position = 680;

    doc.fontSize(10).font('Helvetica-Bold');

    // Subtotal
    doc
      .fillColor('#000000')
      .text('SUBTOTAL:', 380, position, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`S/ ${Number(Math.abs(data.creditNote.subtotal)).toFixed(2)}`, 490, position, {
        width: 55,
        align: 'right',
      });

    // IGV
    doc
      .font('Helvetica-Bold')
      .text('IGV (18%):', 380, position + 20, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`S/ ${Number(Math.abs(data.creditNote.igv)).toFixed(2)}`, 490, position + 20, {
        width: 55,
        align: 'right',
      });

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL A FAVOR:', 380, position + 45, {
        width: 100,
        align: 'right',
      })
      .text(`S/ ${Number(Math.abs(data.creditNote.total)).toFixed(2)}`, 490, position + 45, {
        width: 55,
        align: 'right',
      });
  },

  generateFooter(doc: PDFDocumentType, data: CreditNoteInvoiceData) {
    const footerY = 750;

    // Información de estado
    if (data.creditNote.creditNoteStatus === 'Pendiente') {
      // Generar código de barras simple con el código de NC
      const barcodeY = footerY - 35;
      const barcodeText = data.creditNote.codigoVenta;
      
      // Dibujar "barras" simuladas con rectángulos
      doc.fontSize(8).font('Helvetica').text('CÓDIGO DE VALE:', 50, barcodeY, {
        align: 'center',
        width: 495,
      });
      
      // Mostrar el código en formato grande
      doc.fontSize(16).font('Helvetica-Bold').text(barcodeText, 50, barcodeY + 15, {
        align: 'center',
        width: 495,
      });
      
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(
          '💳 VALE - Este documento representa un crédito a favor del cliente.',
          50,
          footerY,
          { align: 'center', width: 495 }
        )
        .text('Puede ser utilizado en futuras compras.', 50, footerY + 12, {
          align: 'center',
          width: 495,
        })
        .fillColor('#000000');
    } else if (data.creditNote.creditNoteStatus === 'Reembolsada') {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('✅ REEMBOLSADO - El monto ha sido devuelto al cliente.', 50, footerY, {
          align: 'center',
          width: 495,
        })
        .fillColor('#000000');
    }

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('black')
      .text(
        'Este documento es válido como nota de crédito electrónica según legislación peruana.',
        50,
        footerY + 30,
        { align: 'center', width: 495 }
      )
      .text(`Generado el ${new Date().toLocaleString('es-PE')}`, 50, footerY + 43, {
        align: 'center',
        width: 495,
      });
  },

  getReasonLabel(reason: string): string {
    const labels: Record<string, string> = {
      DevolucionTotal: 'Devolución Total',
      DevolucionParcial: 'Devolución Parcial',
    };
    return labels[reason] || reason;
  },

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Pendiente: 'Pendiente',
      Reembolsada: 'Reembolsada',
      PendientePagoBancario: 'Pago Bancario Pendiente',
      Aplicada: 'Aplicada',
      Cancelada: 'Cancelada',
    };
    return labels[status] || status;
  },

  getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      Efectivo: 'Reembolso en Efectivo',
      Transferencia: 'Transferencia Bancaria',
      Vale: 'Vale para Futuras Compras',
    };
    return labels[method] || method;
  },
};

export default creditNoteInvoiceService;
