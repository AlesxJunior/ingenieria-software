import { Response } from 'express';
import { invoiceService } from './invoice.service';
import { AuthenticatedRequest } from '../../types';

export const InvoiceController = {
  async generateInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de venta es requerido',
          error: 'VALIDATION_ERROR',
        });
        return;
      }

      // Generar PDF
      const pdfDoc = await invoiceService.generateInvoice(id);

      // Configurar headers para descarga de PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="factura-${id}.pdf"`);

      // Pipe del PDF a la respuesta
      pdfDoc.pipe(res);

    } catch (error: any) {
      console.error('Error al generar factura:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      
      // Si ya se empezó a enviar la respuesta, no podemos enviar JSON
      if (res.headersSent) {
        res.end();
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al generar factura',
          error: errorMessage,
        });
      }
    }
  },

  async previewInvoice(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de venta es requerido',
          error: 'VALIDATION_ERROR',
        });
        return;
      }

      // Generar PDF
      const pdfDoc = await invoiceService.generateInvoice(id);

      // Configurar headers para visualización en navegador
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="factura-${id}.pdf"`);

      // Pipe del PDF a la respuesta
      pdfDoc.pipe(res);

    } catch (error: any) {
      console.error('Error al previsualizar factura:', error);
      const errorMessage = typeof error?.message === 'string' ? error.message : String(error);
      
      if (res.headersSent) {
        res.end();
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al previsualizar factura',
          error: errorMessage,
        });
      }
    }
  },
};

export default InvoiceController;
