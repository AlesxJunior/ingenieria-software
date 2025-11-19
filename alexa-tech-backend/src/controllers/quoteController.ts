import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { quoteService } from '../services/quoteService';
import { quoteInvoiceService } from '../services/quoteInvoiceService';
import { $Enums } from '@prisma/client';

export const QuoteController = {
  /**
   * POST /api/quotes
   * Crear una nueva cotización
   */
  async createQuote(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { clienteId, almacenId, diasValidez, observaciones, items } = req.body;
      const usuarioId = req.user?.userId;

      if (!usuarioId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!clienteId || !almacenId) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: clienteId, almacenId',
        });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          message: 'Debe incluir al menos un producto',
        });
      }

      const quote = await quoteService.createQuote({
        clienteId,
        almacenId,
        usuarioId,
        diasValidez,
        observaciones,
        items,
      });

      res.status(201).json({
        message: 'Cotización creada exitosamente',
        quote,
      });
    } catch (error: any) {
      console.error('Error al crear cotización:', error);
      res.status(400).json({
        message: error.message || 'Error al crear la cotización',
      });
    }
  },

  /**
   * GET /api/quotes
   * Listar cotizaciones con filtros
   */
  async getQuotes(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const {
        fechaDesde,
        fechaHasta,
        estado,
        clienteId,
        usuarioId,
        page,
        limit,
      } = req.query;

      const filters: any = {};

      if (fechaDesde) {
        filters.fechaDesde = new Date(fechaDesde as string);
      }

      if (fechaHasta) {
        filters.fechaHasta = new Date(fechaHasta as string);
      }

      if (estado) {
        filters.estado = estado as $Enums.QuoteStatus;
      }

      if (clienteId) {
        filters.clienteId = clienteId as string;
      }

      if (usuarioId) {
        filters.usuarioId = usuarioId as string;
      }

      if (page) {
        filters.page = parseInt(page as string);
      }

      if (limit) {
        filters.limit = parseInt(limit as string);
      }

      const result = await quoteService.getQuotes(filters);

      res.json({
        success: true,
        data: result.quotes,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error('Error al obtener cotizaciones:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener las cotizaciones',
      });
    }
  },

  /**
   * GET /api/quotes/:id
   * Obtener una cotización por ID
   */
  async getQuoteById(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ID de cotización es requerido' });
      }

      const quote = await quoteService.getQuoteById(id);

      res.json(quote);
    } catch (error: any) {
      console.error('Error al obtener cotización:', error);
      res.status(404).json({
        message: error.message || 'Cotización no encontrada',
      });
    }
  },

  /**
   * POST /api/quotes/:id/convert
   * Convertir cotización a venta
   */
  async convertToSale(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.params;
      const { formaPago, tipoComprobante, cashSessionId } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado' });
      }

      if (!id) {
        return res.status(400).json({ message: 'ID de cotización es requerido' });
      }

      if (!formaPago || !tipoComprobante) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: formaPago, tipoComprobante',
        });
      }

      const sale = await quoteService.convertToSale({
        quoteId: id,
        userId,
        formaPago,
        tipoComprobante,
        cashSessionId,
      });

      res.status(201).json({
        message: 'Cotización convertida a venta exitosamente',
        sale,
      });
    } catch (error: any) {
      console.error('Error al convertir cotización:', error);
      res.status(400).json({
        message: error.message || 'Error al convertir la cotización',
      });
    }
  },

  /**
   * PATCH /api/quotes/:id/status
   * Actualizar estado de cotización
   */
  async updateStatus(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.params;
      const { estado, motivoRechazo } = req.body;

      if (!id) {
        return res.status(400).json({ message: 'ID de cotización es requerido' });
      }

      if (!estado) {
        return res.status(400).json({ message: 'Estado es requerido' });
      }

      const quote = await quoteService.updateQuoteStatus(id, estado, motivoRechazo);

      res.json({
        message: 'Estado actualizado exitosamente',
        quote,
      });
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      res.status(400).json({
        message: error.message || 'Error al actualizar el estado',
      });
    }
  },

  /**
   * DELETE /api/quotes/:id
   * Eliminar una cotización
   */
  async deleteQuote(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ID de cotización es requerido' });
      }

      await quoteService.deleteQuote(id);

      res.json({ message: 'Cotización eliminada exitosamente' });
    } catch (error: any) {
      console.error('Error al eliminar cotización:', error);
      res.status(400).json({
        message: error.message || 'Error al eliminar la cotización',
      });
    }
  },

  /**
   * POST /api/quotes/check-expired
   * Verificar y actualizar cotizaciones vencidas
   */
  async checkExpiredQuotes(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const count = await quoteService.checkExpiredQuotes();

      res.json({
        message: `${count} cotizaciones actualizadas a estado Vencida`,
        count,
      });
    } catch (error: any) {
      console.error('Error al verificar cotizaciones vencidas:', error);
      res.status(400).json({
        message: error.message || 'Error al verificar cotizaciones',
      });
    }
  },

  /**
   * GET /api/quotes/:id/pdf
   * Generar PDF de cotización
   */
  async generateQuotePDF(req: AuthenticatedRequest, res: Response): Promise<void | Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: 'ID de cotización es requerido' });
      }

      const pdfDoc = await quoteInvoiceService.generateQuoteInvoice(id);

      // Configurar headers para descarga de PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="cotizacion-${id}.pdf"`);

      // Stream del PDF a la respuesta
      pdfDoc.pipe(res);
    } catch (error: any) {
      console.error('Error al generar PDF de cotización:', error);
      res.status(400).json({
        message: error.message || 'Error al generar el PDF',
      });
    }
  },
};
