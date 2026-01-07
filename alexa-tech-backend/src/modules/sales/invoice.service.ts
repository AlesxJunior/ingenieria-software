import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { salesService } from './sales.service';
import { prisma } from '../../config/database';
import { configuracionService } from '../configuracion/configuracion.service';

// Tipo para PDFDocument
type PDFDocumentType = InstanceType<typeof PDFDocument>;

interface InvoiceData {
  sale: any;
  company: {
    nombre: string;
    razonSocial: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    departamento?: string;
    provincia?: string;
    distrito?: string;
  };
  client?: {
    nombre: string;
    documento: string;
    tipoDocumento: string;
    direccion: string;
    telefono?: string;
  };
  payments?: Array<{
    metodoPago: string;
    monto: number;
    referencia?: string;
  }>;
}

// Función para convertir número a letras (formato SUNAT)
function numeroALetras(numero: number): string {
  const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
  const decenas = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

  function convertirGrupo(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    
    let resultado = '';
    
    if (n >= 100) {
      resultado += centenas[Math.floor(n / 100)] + ' ';
      n = n % 100;
    }
    
    if (n >= 20) {
      resultado += decenas[Math.floor(n / 10)];
      if (n % 10 > 0) {
        resultado += ' Y ' + unidades[n % 10];
      }
    } else if (n >= 10) {
      resultado += especiales[n - 10];
    } else if (n > 0) {
      resultado += unidades[n];
    }
    
    return resultado.trim();
  }

  const parteEntera = Math.floor(numero);
  const parteDecimal = Math.round((numero - parteEntera) * 100);
  
  let resultado = '';
  
  if (parteEntera === 0) {
    resultado = 'CERO';
  } else if (parteEntera === 1) {
    resultado = 'UNO';
  } else if (parteEntera < 1000) {
    resultado = convertirGrupo(parteEntera);
  } else if (parteEntera < 1000000) {
    const miles = Math.floor(parteEntera / 1000);
    const resto = parteEntera % 1000;
    
    if (miles === 1) {
      resultado = 'MIL';
    } else {
      resultado = convertirGrupo(miles) + ' MIL';
    }
    
    if (resto > 0) {
      resultado += ' ' + convertirGrupo(resto);
    }
  } else {
    const millones = Math.floor(parteEntera / 1000000);
    const resto = parteEntera % 1000000;
    
    if (millones === 1) {
      resultado = 'UN MILLÓN';
    } else {
      resultado = convertirGrupo(millones) + ' MILLONES';
    }
    
    if (resto > 0) {
      if (resto < 1000) {
        resultado += ' ' + convertirGrupo(resto);
      } else {
        const miles = Math.floor(resto / 1000);
        const restoMiles = resto % 1000;
        if (miles === 1) {
          resultado += ' MIL';
        } else {
          resultado += ' ' + convertirGrupo(miles) + ' MIL';
        }
        if (restoMiles > 0) {
          resultado += ' ' + convertirGrupo(restoMiles);
        }
      }
    }
  }
  
  const decimalStr = parteDecimal.toString().padStart(2, '0');
  return `SON: ${resultado.trim()} Y ${decimalStr}/100 SOLES`;
}

// Función para generar código hash para QR (simulado)
function generarHashQR(data: InvoiceData): string {
  const info = `${data.company.ruc}|${data.sale.tipoComprobante}|${data.sale.codigoVenta}|${data.sale.igv.toFixed(2)}|${data.sale.total.toFixed(2)}|${new Date(data.sale.fechaEmision).toISOString().split('T')[0]}`;
  // En producción, esto debería ser un hash criptográfico
  return Buffer.from(info).toString('base64').substring(0, 20);
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
        documento: sale.cliente.numeroDocumento,
        tipoDocumento: sale.cliente.tipoDocumento,
        direccion: sale.cliente.direccion || '-',
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
      razonSocial: company.razonSocial,
      ruc: company.ruc,
      direccion: company.direccion,
      telefono: company.telefono,
      email: company.email,
      departamento: company.departamento || undefined,
      provincia: company.provincia || undefined,
      distrito: company.distrito || undefined,
    };

    // Obtener pagos si existen (payments viene del servicio)
    let paymentsData: Array<{ metodoPago: string; monto: number; referencia?: string }> = [];
    if (sale.payments && sale.payments.length > 0) {
      paymentsData = sale.payments.map((p: any) => ({
        metodoPago: p.metodoPago,
        monto: typeof p.monto === 'number' ? p.monto : parseFloat(p.monto),
        referencia: p.referencia || undefined,
      }));
      
      console.log('🖨️ [PDF] Pagos detectados para factura:', {
        cantidad: paymentsData.length,
        pagos: paymentsData
      });
    } else {
      console.log('⚠️ [PDF] No se encontraron pagos para la venta:', saleId);
    }

    const invoiceData: InvoiceData = {
      sale,
      company: companyData,
      client: clientData || undefined,
      payments: paymentsData.length > 0 ? paymentsData : undefined,
    };

    // Generar PDF con formato profesional SUNAT
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 40,
      info: {
        Title: `${sale.tipoComprobante} ${sale.codigoVenta}`,
        Author: company.razonSocial,
        Subject: `${sale.tipoComprobante} de venta ${sale.codigoVenta}`,
        Creator: 'Sistema de Facturación Electrónica',
      }
    });

    // Header - Datos de empresa + Recuadro comprobante (formato SUNAT)
    this.generateHeader(doc, invoiceData);

    // Información del cliente (en recuadro)
    this.generateCustomerInfo(doc, invoiceData);

    // Tabla de items
    const tableEndY = this.generateItemsTable(doc, invoiceData);

    // Totales + Monto en letras (inmediatamente después de la tabla)
    const totalsEndY = this.generateTotals(doc, invoiceData, tableEndY);

    // Sección de pagos (si hay múltiples) - usar posición dinámica
    const paymentsEndY = this.generatePaymentsSection(doc, invoiceData, totalsEndY);

    // QR y Footer - usar posición dinámica
    await this.generateFooter(doc, invoiceData, paymentsEndY);

    // Finalizar documento
    doc.end();

    return doc;
  },

  generateHeader(doc: PDFDocumentType, data: InvoiceData) {
    const pageWidth = doc.page.width;
    const margin = 40;
    
    // === LADO IZQUIERDO: Datos de la empresa ===
    const leftColumnWidth = 280;
    
    // Nombre de la empresa (grande y negrita)
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(data.company.razonSocial || data.company.nombre, margin, 50, { width: leftColumnWidth });
    
    // RUC
    let currentY = 75;
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(`RUC: ${data.company.ruc}`, margin, currentY, { width: leftColumnWidth });
    currentY += 15;
    
    // Dirección
    doc
      .text(data.company.direccion, margin, currentY, { width: leftColumnWidth });
    currentY += 15;
    
    // Teléfono
    doc.text(`Tel: ${data.company.telefono || ''}`, margin, currentY);
    currentY += 15;
    
    // Email
    doc.text(data.company.email || '', margin, currentY);
    
    // === LADO DERECHO: Recuadro del comprobante ===
    const boxWidth = 165;
    const boxHeight = 80;
    const boxX = pageWidth - margin - boxWidth;
    const boxY = 50;
    
    // Recuadro con borde negro
    doc
      .rect(boxX, boxY, boxWidth, boxHeight)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();
    
    // Tipo de comprobante
    const tipoComprobante = data.sale.tipoComprobante.toUpperCase();
    const esFactura = tipoComprobante.includes('FACTURA');
    const esBoleta = tipoComprobante.includes('BOLETA');
    
    let tipoTexto = tipoComprobante;
    if (esFactura) {
      tipoTexto = 'FACTURA ELECTRÓNICA';
    } else if (esBoleta) {
      tipoTexto = 'BOLETA ELECTRÓNICA';
    }
    
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text(tipoTexto, boxX, boxY + 15, {
        width: boxWidth,
        align: 'center',
      });
    
    // Serie y Número
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text(data.sale.codigoVenta, boxX, boxY + 35, {
        width: boxWidth,
        align: 'center',
      });
    
    doc.moveDown(3);
  },

  generateCustomerInfo(doc: PDFDocumentType, data: InvoiceData) {
    const pageWidth = doc.page.width;
    const margin = 40;
    const startY = 160;
    
    // Recuadro para datos del cliente
    // 🆕 Ajustar altura si hay múltiples pagos sin cliente
    let boxHeight = data.client ? 70 : 45;
    if (!data.client && data.payments && data.payments.length > 1) {
      // Aumentar altura para múltiples métodos de pago
      boxHeight = 45 + (data.payments.length * 10);
    }
    
    // Título
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('DATOS DEL ADQUIRENTE O USUARIO', margin + 10, startY + 4);
    
    // Fecha de emisión (derecha)
    const fechaEmision = new Date(data.sale.fechaEmision).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    doc
      .text(`FECHA DE EMISIÓN: ${fechaEmision}`, pageWidth - margin - 180, startY + 4, {
        width: 170,
        align: 'right'
      });
    
    if (data.client) {
      const dataY = startY + 25;
      const col1 = margin + 10;
      const col2 = margin + 300;
      
      // Columna 1: Tipo y número de documento
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text(data.client.tipoDocumento + ':', col1, dataY);
      
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(data.client.documento, col1 + 30, dataY);
      
      // Columna 2: Método(s) de pago
      doc
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('MÉTODO(S) DE PAGO:', col2, dataY);
      
      // ✅ Mostrar todos los métodos de pago con sus montos
      if (data.payments && data.payments.length > 0) {
        if (data.payments.length === 1) {
          // Un solo método
          const payment = data.payments[0];
          if (payment) {
            doc
              .font('Helvetica')
              .fillColor('#000000')
              .text(payment.metodoPago, col2 + 100, dataY);
          }
        } else {
          // Múltiples métodos: mostrar cada uno con su monto
          let paymentY = dataY;
          data.payments.forEach((payment) => {
            if (payment) {
              const metodoPagoText = `${payment.metodoPago}: S/ ${Number(payment.monto).toFixed(2)}`;
              doc
                .font('Helvetica')
                .fontSize(8)
                .fillColor('#000000')
                .text(metodoPagoText, col2 + 100, paymentY);
              paymentY += 10;
            }
          });
        }
      } else {
        // ⚠️ Sin datos de pago (no debería ocurrir con nueva lógica)
        doc
          .font('Helvetica')
          .fillColor('#000000')
          .text('Sin información', col2 + 100, dataY);
      }
      
      // Fila 2: Razón social / Nombre
      doc
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('APELLIDOS Y NOMBRES / RAZÓN SOCIAL:', col1, dataY + 15);
      
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(data.client.nombre, col1 + 180, dataY + 15, { width: 330 });
      
      // Fila 3: Dirección
      doc
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('DIRECCIÓN:', col1, dataY + 30);
      
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(data.client.direccion, col1 + 55, dataY + 30, { width: 450 });
    } else {
      // Cliente general (CLIENTE VARIOS)
      const dataY = startY + 25;
      const col1 = margin + 10;
      const col2 = margin + 300;
      
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#000000')
        .text('CLIENTE VARIOS', col1, dataY);
      
      // ✅ Mostrar métodos de pago (SIEMPRE existen con nueva lógica)
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('MÉTODO(S) DE PAGO:', col2, dataY);
      
      if (data.payments && data.payments.length === 1) {
        // Un solo método
        const payment = data.payments[0];
        if (payment) {
          doc
            .font('Helvetica')
            .fillColor('#000000')
            .text(payment.metodoPago, col2 + 100, dataY);
        }
      } else if (data.payments && data.payments.length > 1) {
        // Múltiples métodos: mostrar cada uno con su monto
        let paymentY = dataY;
        data.payments.forEach((payment) => {
          if (payment) {
            const metodoPagoText = `${payment.metodoPago}: S/ ${Number(payment.monto).toFixed(2)}`;
            doc
              .font('Helvetica')
              .fontSize(8)
              .fillColor('#000000')
              .text(metodoPagoText, col2 + 100, paymentY);
            paymentY += 10;
          }
        });
      }
    }
    
    return startY + boxHeight + 10;
  },

  generateItemsTable(doc: PDFDocumentType, data: InvoiceData): number {
    const pageWidth = doc.page.width;
    const margin = 40;
    const tableTop = 250;
    
    // Columnas de la tabla
    const columns = {
      item: { x: margin, width: 30 },
      codigo: { x: margin + 30, width: 70 },
      descripcion: { x: margin + 100, width: 200 },
      unidad: { x: margin + 300, width: 45 },
      cantidad: { x: margin + 345, width: 50 },
      precioUnit: { x: margin + 395, width: 70 },
      total: { x: margin + 465, width: 60 },
    };
    
    // Header de la tabla con borde
    doc
      .rect(margin, tableTop, pageWidth - (margin * 2), 20)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();
    
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#000000');
    
    doc.text('ITEM', columns.item.x + 5, tableTop + 6, { width: columns.item.width, align: 'center' });
    doc.text('CÓDIGO', columns.codigo.x, tableTop + 6, { width: columns.codigo.width, align: 'center' });
    doc.text('DESCRIPCIÓN', columns.descripcion.x, tableTop + 6, { width: columns.descripcion.width, align: 'left' });
    doc.text('U.M.', columns.unidad.x, tableTop + 6, { width: columns.unidad.width, align: 'center' });
    doc.text('CANT.', columns.cantidad.x, tableTop + 6, { width: columns.cantidad.width, align: 'center' });
    doc.text('P. UNIT.', columns.precioUnit.x, tableTop + 6, { width: columns.precioUnit.width, align: 'center' });
    doc.text('TOTAL', columns.total.x, tableTop + 6, { width: columns.total.width, align: 'center' });
    
    // Items
    let position = tableTop + 25;
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    
    data.sale.items.forEach((item: any, index: number) => {
      // Verificar si hay espacio suficiente, si no, agregar nueva página
      if (position > 650) {
        doc.addPage();
        position = 50;
        
        // Re-dibujar header de tabla en nueva página
        doc
          .rect(margin, 40, pageWidth - (margin * 2), 20)
          .lineWidth(1)
          .strokeColor('#000000')
          .stroke();
        
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#000000');
        doc.text('ITEM', columns.item.x + 5, 46, { width: columns.item.width, align: 'center' });
        doc.text('CÓDIGO', columns.codigo.x, 46, { width: columns.codigo.width, align: 'center' });
        doc.text('DESCRIPCIÓN', columns.descripcion.x, 46, { width: columns.descripcion.width, align: 'left' });
        doc.text('U.M.', columns.unidad.x, 46, { width: columns.unidad.width, align: 'center' });
        doc.text('CANT.', columns.cantidad.x, 46, { width: columns.cantidad.width, align: 'center' });
        doc.text('P. UNIT.', columns.precioUnit.x, 46, { width: columns.precioUnit.width, align: 'center' });
        doc.text('TOTAL', columns.total.x, 46, { width: columns.total.width, align: 'center' });
        
        doc.font('Helvetica').fontSize(8).fillColor('#000000');
        position = 70;
      }
      
      const productCode = item.productCode || item.producto?.codigo || 'N/A';
      const unidadMedida = item.producto?.unidadMedida || 'UND';
      
      doc.fillColor('#000000');
      doc.text((index + 1).toString().padStart(2, '0'), columns.item.x + 5, position, { width: columns.item.width, align: 'center' });
      doc.text(productCode, columns.codigo.x, position, { width: columns.codigo.width, align: 'center' });
      doc.text(item.nombreProducto, columns.descripcion.x, position, { width: columns.descripcion.width, align: 'left' });
      doc.text(unidadMedida, columns.unidad.x, position, { width: columns.unidad.width, align: 'center' });
      doc.text(item.cantidad.toString(), columns.cantidad.x, position, { width: columns.cantidad.width, align: 'center' });
      doc.text(`S/ ${item.precioUnitario.toFixed(2)}`, columns.precioUnit.x, position, { width: columns.precioUnit.width, align: 'right' });
      doc.text(`S/ ${item.subtotal.toFixed(2)}`, columns.total.x, position, { width: columns.total.width, align: 'right' });
      
      position += 18;
    });
    
    // Línea final de la tabla
    doc
      .moveTo(margin, position + 5)
      .lineTo(pageWidth - margin, position + 5)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();
    
    return position + 15;
  },

  generateTotals(doc: PDFDocumentType, data: InvoiceData, startY: number): number {
    const pageWidth = doc.page.width;
    const margin = 40;
    const totalsX = pageWidth - margin - 200;
    const valuesX = pageWidth - margin - 70;
    
    // Usar posición dinámica (añadir pequeño espacio después de la tabla)
    let position = startY + 5;
    
    // Monto en letras
    const montoLetras = numeroALetras(data.sale.total);
    
    doc
      .fontSize(7)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('IMPORTE EN LETRAS', margin + 5, position + 3);
    
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#000000')
      .text(montoLetras, margin + 5, position + 18, { width: 290 });
    
    // Totales (lado derecho)
    const totalsStartY = position;
    
    doc.fontSize(9).font('Helvetica').fillColor('#000000');
    
    // Op. Gravada
    doc
      .text('OP. GRAVADA:', totalsX, totalsStartY + 8)
      .text(`S/ ${data.sale.subtotal.toFixed(2)}`, valuesX, totalsStartY + 8, { width: 60, align: 'right' });
    
    // Op. Inafecta
    doc
      .text('OP. INAFECTA:', totalsX, totalsStartY + 23)
      .text('S/ 0.00', valuesX, totalsStartY + 23, { width: 60, align: 'right' });
    
    // Op. Exonerada
    doc
      .text('OP. EXONERADA:', totalsX, totalsStartY + 38)
      .text('S/ 0.00', valuesX, totalsStartY + 38, { width: 60, align: 'right' });
    
    // IGV 18%
    doc
      .font('Helvetica-Bold')
      .text('IGV 18%:', totalsX, totalsStartY + 53)
      .font('Helvetica')
      .text(`S/ ${data.sale.igv.toFixed(2)}`, valuesX, totalsStartY + 53, { width: 60, align: 'right' });
    
    // ✅ Calcular redondeo (según Ley N° 29607 - SUNAT)
    const subtotalSinRedondeo = Number(data.sale.subtotal) + Number(data.sale.igv);
    const totalConRedondeo = Number(data.sale.total);
    const redondeo = totalConRedondeo - subtotalSinRedondeo;
    const tieneRedondeo = Math.abs(redondeo) >= 0.01;
    
    let currentY = totalsStartY + 53;
    
    // Mostrar redondeo solo si existe (mayor o igual a 1 céntimo)
    if (tieneRedondeo) {
      currentY += 15;
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#000000')
        .text('REDONDEO:', totalsX, currentY)
        .text(`S/ ${redondeo >= 0 ? '+' : ''}${redondeo.toFixed(2)}`, valuesX, currentY, { width: 60, align: 'right' });
    }
    
    // Línea antes del total
    currentY += 15;
    doc
      .moveTo(totalsX, currentY)
      .lineTo(pageWidth - margin, currentY)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();
    
    // TOTAL (destacado)
    currentY += 5;
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('IMPORTE TOTAL:', totalsX, currentY)
      .text(`S/ ${data.sale.total.toFixed(2)}`, valuesX - 10, currentY, { width: 70, align: 'right' });
    
    // Observaciones si existen
    if (data.sale.observaciones) {
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#000000')
        .text('OBSERVACIONES:', margin, currentY + 30);
      
      doc
        .font('Helvetica')
        .fillColor('#000000')
        .text(data.sale.observaciones, margin, currentY + 42, { width: 290 });
    }
    
    return currentY + 75;
  },
  
  generatePaymentsSection(doc: PDFDocumentType, data: InvoiceData, startY: number): number {
    // 🆕 Mostrar sección de pagos si hay MÁS de 1 método (múltiples)
    if (!data.payments || data.payments.length < 2) {
      return startY; // Retornar posición actual si no hay pagos múltiples
    }
    
    const pageWidth = doc.page.width;
    const margin = 40;
    let position = startY + 10;
    
    // Verificar si hay espacio
    if (position > 700) {
      doc.addPage();
      position = 50;
    }
    
    // Título
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('DETALLE DE PAGOS', margin, position);
    
    position += 15;
    
    // Tabla de pagos
    doc
      .fontSize(8)
      .font('Helvetica-Bold')
      .fillColor('#000000');
    
    doc.text('MÉTODO', margin + 10, position + 5, { width: 150 });
    doc.text('REFERENCIA', margin + 170, position + 5, { width: 200 });
    doc.text('MONTO', pageWidth - margin - 80, position + 5, { width: 70, align: 'right' });
    
    position += 20;
    
    data.payments.forEach((payment, index) => {
      doc
        .fontSize(8)
        .font('Helvetica')
        .fillColor('#000000');
      
      doc.text(payment.metodoPago, margin + 10, position, { width: 150 });
      doc.text(payment.referencia || '-', margin + 170, position, { width: 200 });
      doc.text(`S/ ${payment.monto.toFixed(2)}`, pageWidth - margin - 80, position, { width: 70, align: 'right' });
      
      position += 16;
    });
    
    // Línea final
    doc
      .moveTo(margin, position + 2)
      .lineTo(pageWidth - margin, position + 2)
      .lineWidth(0.5)
      .strokeColor('#000000')
      .stroke();
    
    return position + 10;
  },

  async generateFooter(doc: PDFDocumentType, data: InvoiceData, startY: number) {
    const pageWidth = doc.page.width;
    const margin = 40;
    
    // Calcular posición del footer dinámicamente
    // Si queda poco espacio (menos de 120px), añadir nueva página
    let footerY = startY + 15;
    if (footerY > 680) {
      doc.addPage();
      footerY = 50;
    }
    
    // Área del QR
    const qrSize = 60;
    const qrX = margin;
    const qrY = footerY;
    
    // Generar QR real
    const hashQR = generarHashQR(data);
    try {
      const qrDataUrl = await QRCode.toDataURL(hashQR, { 
        width: qrSize * 3, // Mayor resolución
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      const base64Data = qrDataUrl.split(',')[1];
      if (base64Data) {
        const qrBuffer = Buffer.from(base64Data, 'base64');
        doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      }
    } catch (error) {
      // Si falla, mostrar el hash como texto
      doc
        .fontSize(6)
        .font('Helvetica')
        .fillColor('#000000')
        .text(hashQR, qrX + 5, qrY + 5, { width: qrSize - 10 });
    }
    
    // Información junto al QR
    const infoX = qrX + qrSize + 15;
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Representación impresa de la', infoX, qrY + 5)
      .text(`${data.sale.tipoComprobante.toUpperCase()} ELECTRÓNICA`, infoX, qrY + 15)
      .text('Autorizado mediante Resolución', infoX, qrY + 30)
      .text('de Superintendencia N° 203-2015/SUNAT', infoX, qrY + 40);
    
    // Hash del documento
    doc
      .fontSize(6)
      .text(`Hash: ${hashQR}`, infoX, qrY + 55);
    
    // Línea separadora
    doc
      .moveTo(margin, footerY + qrSize + 10)
      .lineTo(pageWidth - margin, footerY + qrSize + 10)
      .lineWidth(0.5)
      .strokeColor('#000000')
      .stroke();
    
    // Mensaje final
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor('#000000')
      .text(
        'Gracias por su preferencia. Consulte su comprobante electrónico en www.sunat.gob.pe',
        margin,
        footerY + qrSize + 15,
        { align: 'center', width: pageWidth - (margin * 2) }
      );
    
    doc
      .fontSize(7)
      .fillColor('#000000')
      .text(
        `Documento generado el ${new Date().toLocaleString('es-PE')} | Sistema de Facturación Electrónica`,
        margin,
        footerY + qrSize + 30,
        { align: 'center', width: pageWidth - (margin * 2) }
      );
  },
};

export default invoiceService;
