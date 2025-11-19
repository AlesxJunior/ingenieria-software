import PDFDocument from 'pdfkit';
import { quoteService } from './quoteService';
import { prisma } from '../config/database';

// Tipo para PDFDocument
type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface QuoteInvoiceData {
  quote: any;
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

export const quoteInvoiceService = {
  async generateQuoteInvoice(quoteId: string): Promise<PDFDocumentType> {
    // Obtener cotización con todos los detalles
    const quote: any = await quoteService.getQuoteById(quoteId);
    if (!quote) {
      throw new Error('Cotización no encontrada');
    }

    // Usar datos del cliente que ya vienen en quote.cliente
    let clientData = null;
    if (quote.cliente) {
      clientData = {
        nombre: quote.cliente.razonSocial || `${quote.cliente.nombres} ${quote.cliente.apellidos}`,
        documento: `${quote.cliente.tipoDocumento}: ${quote.cliente.numeroDocumento}`,
        direccion: quote.cliente.direccion,
        telefono: quote.cliente.telefono || undefined,
      };
    }

    // Datos de la empresa
    const companyData = {
      nombre: 'ALEXA TECH S.A.C.',
      ruc: '20123456789',
      direccion: 'Av. Tecnología 123, Lima, Perú',
      telefono: '+51 999 888 777',
      email: 'ventas@alexatech.com',
    };

    const invoiceData: QuoteInvoiceData = {
      quote,
      company: companyData,
      client: clientData || undefined,
    };

    // Generar PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `Cotización ${quote.codigoCotizacion}`,
        Author: 'Alexa Tech',
        Subject: `Cotización ${quote.codigoCotizacion}`,
      }
    });

    // Header - Logo y datos de empresa
    this.generateHeader(doc, invoiceData);

    // Información de la cotización
    this.generateQuoteInfo(doc, invoiceData);

    // Información del cliente
    this.generateCustomerInfo(doc, invoiceData);

    // Tabla de items
    this.generateItemsTable(doc, invoiceData);

    // Totales
    this.generateTotals(doc, invoiceData);

    // Footer
    this.generateFooter(doc, invoiceData);

    // Finalizar documento
    doc.end();

    return doc;
  },

  generateHeader(doc: PDFDocumentType, data: QuoteInvoiceData) {
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(data.company.nombre, 50, 50, { align: 'left' })
      .fontSize(10)
      .font('Helvetica')
      .text(`RUC: ${data.company.ruc}`, 50, 75)
      .text(data.company.direccion, 50, 90)
      .text(`Tel: ${data.company.telefono}`, 50, 105)
      .text(data.company.email, 50, 120);

    // Recuadro del tipo de documento (derecha)
    const boxX = 400;
    const boxY = 50;
    const boxWidth = 145;
    const boxHeight = 80;

    doc
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('COTIZACIÓN', boxX, boxY + 15, {
        width: boxWidth,
        align: 'center',
      })
      .fontSize(10)
      .font('Helvetica')
      .text(data.quote.codigoCotizacion, boxX, boxY + 35, {
        width: boxWidth,
        align: 'center',
      });

    doc.moveDown(3);
  },

  generateQuoteInfo(doc: PDFDocumentType, data: QuoteInvoiceData) {
    const startY = 150;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('FECHA DE EMISIÓN:', 50, startY)
      .font('Helvetica')
      .text(new Date(data.quote.fechaEmision).toLocaleDateString('es-PE'), 180, startY);

    doc
      .font('Helvetica-Bold')
      .text('FECHA DE VENCIMIENTO:', 50, startY + 15)
      .font('Helvetica')
      .text(new Date(data.quote.fechaVencimiento).toLocaleDateString('es-PE'), 180, startY + 15);

    doc
      .font('Helvetica-Bold')
      .text('ESTADO:', 50, startY + 30)
      .font('Helvetica');

    // Color según estado
    const estado = data.quote.estado;
    let estadoColor = '#000000';
    if (estado === 'Pendiente') estadoColor = '#F39C12';
    if (estado === 'Convertida') estadoColor = '#27AE60';
    if (estado === 'Vencida') estadoColor = '#E74C3C';
    if (estado === 'Cancelada') estadoColor = '#95A5A6';

    doc
      .fillColor(estadoColor)
      .text(estado, 180, startY + 30)
      .fillColor('#000000');

    doc
      .font('Helvetica-Bold')
      .text('VENDEDOR:', 50, startY + 45)
      .font('Helvetica')
      .text(`${data.quote.usuario.firstName} ${data.quote.usuario.lastName}`, 180, startY + 45);

    doc.moveDown(2);
  },

  generateCustomerInfo(doc: PDFDocumentType, data: QuoteInvoiceData) {
    const startY = 240;

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

      if (data.client.telefono) {
        doc
          .font('Helvetica-Bold')
          .text('Teléfono:', 50, startY + 65)
          .font('Helvetica')
          .text(data.client.telefono, 120, startY + 65);
      }
    } else {
      doc
        .fontSize(10)
        .font('Helvetica')
        .text('CLIENTE GENERAL', 50, startY + 20);
    }

    doc.moveDown(2);
  },

  generateItemsTable(doc: PDFDocumentType, data: QuoteInvoiceData) {
    const tableTop = 350;
    const itemCodeX = 50;
    const descriptionX = 120;
    const quantityX = 350;
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

    data.quote.items.forEach((item: any) => {
      // Verificar si hay espacio suficiente, si no, agregar nueva página
      if (position > 700) {
        doc.addPage();
        position = 50;
      }

      // Obtener código del producto
      const productCode = item.product?.codigo || item.productCode || 'N/A';

      doc
        .text(productCode, itemCodeX, position, { width: 60 })
        .text(item.nombreProducto, descriptionX, position, { width: 220 })
        .text(item.cantidad.toString(), quantityX, position, { width: 50, align: 'right' })
        .text(`S/ ${parseFloat(item.precioUnitario).toFixed(2)}`, priceX, position, { width: 60, align: 'right' })
        .text(`S/ ${parseFloat(item.subtotal).toFixed(2)}`, amountX, position, { width: 55, align: 'right' });

      position += 20;
    });

    // Línea después de items
    doc
      .moveTo(50, position + 5)
      .lineTo(545, position + 5)
      .stroke();

    return position + 15;
  },

  generateTotals(doc: PDFDocumentType, data: QuoteInvoiceData) {
    const position = 680;

    doc
      .fontSize(10)
      .font('Helvetica-Bold');

    // Subtotal
    doc
      .text('SUBTOTAL:', 380, position, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`S/ ${parseFloat(data.quote.subtotal).toFixed(2)}`, 490, position, { width: 55, align: 'right' });

    // IGV (18%)
    doc
      .font('Helvetica-Bold')
      .text('IGV (18%):', 380, position + 20, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`S/ ${parseFloat(data.quote.igv).toFixed(2)}`, 490, position + 20, { width: 55, align: 'right' });

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', 380, position + 45, { width: 100, align: 'right' })
      .text(`S/ ${parseFloat(data.quote.total).toFixed(2)}`, 490, position + 45, { width: 55, align: 'right' });

    // Observaciones si existen
    if (data.quote.observaciones) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('OBSERVACIONES:', 50, position + 70)
        .font('Helvetica')
        .text(data.quote.observaciones, 50, position + 85, { width: 495 });
    }
  },

  generateFooter(doc: PDFDocumentType, data: QuoteInvoiceData) {
    const validityDays = Math.ceil(
      (new Date(data.quote.fechaVencimiento).getTime() - new Date(data.quote.fechaEmision).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .text(
        `Esta cotización tiene una validez de ${validityDays} días.`,
        50,
        740,
        { align: 'center', width: 495 }
      )
      .font('Helvetica')
      .text(
        'Los precios están sujetos a cambios sin previo aviso.',
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
  },
};

export default quoteInvoiceService;
