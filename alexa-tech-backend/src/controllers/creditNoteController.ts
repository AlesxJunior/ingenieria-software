import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { creditNoteService } from '../services/creditNoteService';
import { creditNoteInvoiceService } from '../services/creditNoteInvoiceService';

export const CreditNoteController = {
  /**
   * POST /api/credit-notes
   * Crear una nota de crédito
   */
  async createCreditNote(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { 
        saleId, 
        creditNoteReason, 
        descripcion, 
        items, 
        paymentMethod,      // ✅ NUEVO
        cashSessionId       // ✅ NUEVO
      } = req.body;
      const usuarioId = req.user?.userId;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!saleId || !creditNoteReason) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: saleId, creditNoteReason',
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: 'Debe incluir al menos un producto para devolver',
        });
      }

      // ✅ NUEVO: Validar método de pago
      if (!paymentMethod || !['Efectivo', 'Transferencia', 'Vale'].includes(paymentMethod)) {
        return res.status(400).json({
          message: 'Método de pago inválido. Debe ser: Efectivo, Transferencia o Vale',
        });
      }

      // ✅ NUEVO: Si es efectivo, validar que hay cashSessionId
      if (paymentMethod === 'Efectivo' && !cashSessionId) {
        return res.status(400).json({
          message: 'Se requiere sesión de caja activa para reembolsos en efectivo',
        });
      }

      const creditNote = await creditNoteService.createCreditNote(
        {
          saleId,
          usuarioId,
          creditNoteReason,
          descripcion,
          items,
        },
        {
          method: paymentMethod,
          cashSessionId: cashSessionId,
        }
      );

      res.status(201).json({
        message: 'Nota de crédito creada exitosamente',
        creditNote,
      });
    } catch (error: any) {
      console.error('Error al crear nota de crédito:', error);
      res.status(400).json({
        message: error.message || 'Error al crear la nota de crédito',
      });
    }
  },

  /**
   * GET /api/credit-notes/:id/pdf
   * Generar PDF de una nota de crédito
   */
  async generatePDF(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          message: 'ID de nota de crédito es requerido',
        });
        return;
      }

      const pdfDoc = await creditNoteInvoiceService.generateCreditNoteInvoice(id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="nc-${id}.pdf"`);

      pdfDoc.pipe(res);

    } catch (error: any) {
      console.error('Error al generar PDF de NC:', error);
      
      if (res.headersSent) {
        res.end();
      } else {
        res.status(400).json({
          message: error.message || 'Error al generar PDF de nota de crédito',
        });
      }
    }
  },

  /**
   * GET /api/credit-notes/sale/:saleId
   * Obtener notas de crédito de una venta
   */
  async getCreditNotesBySale(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { saleId } = req.params;

      if (!saleId) {
        return res.status(400).json({ message: 'SaleId es requerido' });
      }

      const creditNotes = await creditNoteService.getCreditNotesBySale(saleId);

      res.json(creditNotes);
    } catch (error: any) {
      console.error('Error al obtener notas de crédito:', error);
      res.status(400).json({
        message: error.message || 'Error al obtener las notas de crédito',
      });
    }
  },

  /**
   * GET /api/credit-notes/sale/:saleId/summary
   * Obtener venta con resumen de devoluciones
   */
  async getSaleWithCreditNotes(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { saleId } = req.params;

      if (!saleId) {
        return res.status(400).json({ message: 'SaleId es requerido' });
      }

      const result = await creditNoteService.getSaleWithCreditNotes(saleId);

      res.json(result);
    } catch (error: any) {
      console.error('Error al obtener resumen:', error);
      res.status(400).json({
        message: error.message || 'Error al obtener el resumen',
      });
    }
  },
};
