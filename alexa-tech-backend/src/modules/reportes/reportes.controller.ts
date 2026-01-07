/**
 * Controlador de Reportes
 * Maneja las peticiones HTTP para el módulo de reportes
 */

import { Request, Response } from 'express';
import reportesService from './reportes.service';
import { logger } from '../../utils/logger';

export class ReportesController {
  /**
   * GET /api/reportes/ventas
   * Genera reporte de ventas con filtros opcionales
   */
  async getReporteVentas(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        usuarioId: req.query.usuarioId as string,
        tipoComprobante: req.query.tipoComprobante as string,
        metodoPago: req.query.metodoPago as string,
        clienteId: req.query.clienteId as string,
        estado: req.query.estado as string,
      };

      const reporte = await reportesService.getReporteVentas(filters);

      res.json({
        success: true,
        message: 'Reporte de ventas generado exitosamente',
        data: reporte,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando reporte de ventas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de ventas',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/reportes/compras
   * Genera reporte de compras con filtros opcionales
   */
  async getReporteCompras(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        proveedorId: req.query.proveedorId as string,
        almacenId: req.query.almacenId as string,
        estado: req.query.estado as string,
      };

      const reporte = await reportesService.getReporteCompras(filters);

      res.json({
        success: true,
        message: 'Reporte de compras generado exitosamente',
        data: reporte,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando reporte de compras:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de compras',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/reportes/inventario
   * Genera reporte de inventario con filtros opcionales
   */
  async getReporteInventario(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        almacenId: req.query.almacenId as string,
        categoria: req.query.categoria as string,
        estado: req.query.estado as 'ALERTA' | 'NORMAL' | 'SOBRESTOCK' | undefined,
      };

      const reporte = await reportesService.getReporteInventario(filters);

      res.json({
        success: true,
        message: 'Reporte de inventario generado exitosamente',
        data: reporte,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando reporte de inventario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de inventario',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/reportes/financiero
   * Genera reporte financiero con filtros opcionales
   */
  async getReporteFinanciero(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        tipo: req.query.tipo as 'INGRESO' | 'EGRESO' | 'TODOS' | undefined,
      };

      const reporte = await reportesService.getReporteFinanciero(filters);

      res.json({
        success: true,
        message: 'Reporte financiero generado exitosamente',
        data: reporte,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando reporte financiero:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte financiero',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/reportes/caja
   * Genera reporte de caja con filtros opcionales
   */
  async getReporteCaja(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        cajaId: req.query.cajaId as string,
        usuarioId: req.query.usuarioId as string,
        estado: req.query.estado as 'ABIERTA' | 'CERRADA' | undefined,
      };

      const reporte = await reportesService.getReporteCaja(filters);

      res.json({
        success: true,
        message: 'Reporte de caja generado exitosamente',
        data: reporte,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando reporte de caja:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de caja',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/reportes/productos-vendidos
   * Genera reporte de productos más vendidos
   */
  async getProductosMasVendidos(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
        categoria: req.query.categoria as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const reporte = await reportesService.getProductosMasVendidos(filters);

      res.json({
        success: true,
        message: 'Reporte de productos más vendidos generado exitosamente',
        data: reporte,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando reporte de productos más vendidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar reporte de productos más vendidos',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/reportes/resumen
   * Genera un resumen ejecutivo con métricas clave
   */
  async getResumenEjecutivo(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        fechaInicio: req.query.fechaInicio as string,
        fechaFin: req.query.fechaFin as string,
      };

      // Obtener múltiples reportes en paralelo
      const [ventas, compras, inventario, financiero] = await Promise.all([
        reportesService.getReporteVentas(filters),
        reportesService.getReporteCompras(filters),
        reportesService.getReporteInventario({}),
        reportesService.getReporteFinanciero(filters),
      ]);

      const resumen = {
        ventas: {
          total: ventas.resumen.totalVentas,
          cantidad: ventas.resumen.cantidadVentas,
          ticketPromedio: ventas.resumen.ticketPromedio,
        },
        compras: {
          total: compras.resumen.totalCompras,
          cantidad: compras.resumen.cantidadCompras,
          compraPromedio: compras.resumen.compraPromedio,
        },
        inventario: {
          valorTotal: inventario.resumen.valorTotalInventario,
          productosEnAlerta: inventario.resumen.productosEnAlerta,
          productosActivos: inventario.resumen.productosActivos,
        },
        financiero: {
          ingresos: financiero.resumen.totalIngresos,
          egresos: financiero.resumen.totalEgresos,
          utilidad: financiero.resumen.utilidadBruta,
          margen: financiero.resumen.margenBruto,
        },
      };

      res.json({
        success: true,
        message: 'Resumen ejecutivo generado exitosamente',
        data: resumen,
        generadoEn: new Date().toISOString(),
        filtrosAplicados: filters,
      });
    } catch (error: any) {
      logger.error('Error generando resumen ejecutivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar resumen ejecutivo',
        error: error.message,
      });
    }
  }
}

export const reportesController = new ReportesController();
