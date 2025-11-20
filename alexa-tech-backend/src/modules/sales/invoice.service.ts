import PDFDocument from 'pdfkit';
import { salesService } from './sales.service';
import { prisma } from '../../config/database';
import { configuracionService } from '../configuracion/configuracion.service';

// Tipo para PDFDocument
type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface InvoiceData {
  sale: any;
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

export const invoiceService = {
  async generateInvoice(saleId: string): Promise<PDFDocumentType> {
    // ✅ Obtener venta con todos los detalles (ya incluye cliente, usuario, items con producto)
    const sale = await salesService.getById(saleId);
    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    // ✅ Usar datos del cliente que ya vienen en sale.cliente (no hacer query adicional)
    let clientData = null;
    if (sale.cliente) {
      clientData = {
        nombre: sale.cliente.razonSocial || `${sale.cliente.nombres} ${sale.cliente.apellidos}`,
        documento: `${sale.cliente.tipoDocumento}: ${sale.cliente.numeroDocumento}`,
        direccion: sale.cliente.direccion,
        telefono: sale.cliente.telefono || undefined,
      };
    }

    // Obtener datos del almacén
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: sale.almacenId },
    });

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

    const invoiceData: InvoiceData = {
      sale,
      company: companyData,
      client: clientData || undefined,
    };

    // Generar PDF
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      info: {
        Title: `Factura ${sale.codigoVenta}`,
        Author: 'Alexa Tech',
        Subject: `Factura de venta ${sale.codigoVenta}`,
      }
    });

    // Header - Logo y datos de empresa
    this.generateHeader(doc, invoiceData);

    // Información del comprobante
    this.generateInvoiceInfo(doc, invoiceData);

    // Información del cliente
    this.generateCustomerInfo(doc, invoiceData);

    // Tabla de items
    this.generateItemsTable(doc, invoiceData);

    // Totales
    this.generateTotals(doc, invoiceData);

    // Footer
    this.generateFooter(doc);

    // Finalizar documento
    doc.end();

    return doc;
  },

  generateHeader(doc: PDFDocumentType, data: InvoiceData) {
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

    // Recuadro del tipo de comprobante (derecha)
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
      .text(data.sale.tipoComprobante.toUpperCase(), boxX, boxY + 15, {
        width: boxWidth,
        align: 'center',
      })
      .fontSize(10)
      .font('Helvetica')
      .text(data.sale.codigoVenta, boxX, boxY + 35, {
        width: boxWidth,
        align: 'center',
      });

    doc.moveDown(3);
  },

  generateInvoiceInfo(doc: PDFDocumentType, data: InvoiceData) {
    const startY = 150;

    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('FECHA DE EMISIÓN:', 50, startY)
      .font('Helvetica')
      .text(new Date(data.sale.fechaEmision).toLocaleDateString('es-PE'), 180, startY);

    doc
      .font('Helvetica-Bold')
      .text('FORMA DE PAGO:', 50, startY + 15)
      .font('Helvetica')
      .text(data.sale.formaPago, 180, startY + 15);

    doc
      .font('Helvetica-Bold')
      .text('ESTADO:', 50, startY + 30)
      .font('Helvetica')
      .text(data.sale.estado, 180, startY + 30);

    doc.moveDown(2);
  },

  generateCustomerInfo(doc: PDFDocumentType, data: InvoiceData) {
    const startY = 220;

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

  generateItemsTable(doc: PDFDocumentType, data: InvoiceData) {
    const tableTop = 330;
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

    data.sale.items.forEach((item: any, index: number) => {
      // Verificar si hay espacio suficiente, si no, agregar nueva página
      if (position > 700) {
        doc.addPage();
        position = 50;
      }

      // ✅ Obtener código del producto desde el item (ya viene del backend)
      const productCode = item.productCode || 'N/A';

      doc
        .text(productCode, itemCodeX, position, { width: 60 })
        .text(item.nombreProducto, descriptionX, position, { width: 220 })
        .text(item.cantidad.toString(), quantityX, position, { width: 50, align: 'right' })
        .text(`S/ ${item.precioUnitario.toFixed(2)}`, priceX, position, { width: 60, align: 'right' })
        .text(`S/ ${item.subtotal.toFixed(2)}`, amountX, position, { width: 55, align: 'right' });

      position += 20;
    });

    // Línea después de items
    doc
      .moveTo(50, position + 5)
      .lineTo(545, position + 5)
      .stroke();

    return position + 15;
  },

  generateTotals(doc: PDFDocumentType, data: InvoiceData) {
    const position = 680;

    doc
      .fontSize(10)
      .font('Helvetica-Bold');

    // Subtotal
    doc
      .text('SUBTOTAL:', 380, position, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`S/ ${data.sale.subtotal.toFixed(2)}`, 490, position, { width: 55, align: 'right' });

    // IGV (18%)
    doc
      .font('Helvetica-Bold')
      .text('IGV (18%):', 380, position + 20, { width: 100, align: 'right' })
      .font('Helvetica')
      .text(`S/ ${data.sale.igv.toFixed(2)}`, 490, position + 20, { width: 55, align: 'right' });

    // Total
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text('TOTAL:', 380, position + 45, { width: 100, align: 'right' })
      .text(`S/ ${data.sale.total.toFixed(2)}`, 490, position + 45, { width: 55, align: 'right' });

    // Observaciones si existen
    if (data.sale.observaciones) {
      doc
        .fontSize(9)
        .font('Helvetica-Bold')
        .text('OBSERVACIONES:', 50, position + 70)
        .font('Helvetica')
        .text(data.sale.observaciones, 50, position + 85, { width: 495 });
    }
  },

  generateFooter(doc: PDFDocumentType) {
    doc
      .fontSize(8)
      .font('Helvetica')
      .text(
        'Gracias por su compra. Este documento es válido como comprobante de pago electrónico.',
        50,
        750,
        { align: 'center', width: 495 }
      )
      .text(
        `Generado el ${new Date().toLocaleString('es-PE')}`,
        50,
        765,
        { align: 'center', width: 495 }
      );
  },
};

export default invoiceService;
