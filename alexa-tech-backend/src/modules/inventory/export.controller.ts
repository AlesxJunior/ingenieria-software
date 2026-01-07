import { Response } from 'express';
import { AuthenticatedRequest } from '../../types';
import { asyncHandler } from '../../middleware/errorHandler';
import * as exportService from './export.service';

// ============================================
// CONTROLADOR DE EXPORTACIONES
// ============================================

export const ExportController = {
  /**
   * GET /api/inventory/export/stock
   * Exportar stock actual por almacén a Excel
   * Query params: productId, warehouseId
   */
  exportStock: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, warehouseId } = req.query;

    try {
      const excelBuffer = await exportService.exportStockToExcel({
        productId: productId ? String(productId) : undefined,
        warehouseId: warehouseId ? String(warehouseId) : undefined,
      });

      const filename = exportService.generateExcelFilename('stock');

      // Configurar headers para descarga de archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length.toString());

      return res.send(excelBuffer);
    } catch (error: any) {
      console.error('Error exporting stock:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al exportar stock a Excel',
        error: error.message
      });
    }
  }),

  /**
   * GET /api/inventory/export/kardex
   * Exportar movimientos de inventario (kardex) a Excel
   * Query params: productId, warehouseId, tipoMovimiento, fechaDesde, fechaHasta
   */
  exportKardex: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, warehouseId, tipoMovimiento, fechaDesde, fechaHasta } = req.query;

    try {
      const excelBuffer = await exportService.exportKardexToExcel({
        productId: productId ? String(productId) : undefined,
        warehouseId: warehouseId ? String(warehouseId) : undefined,
        tipoMovimiento: tipoMovimiento as any,
        fechaDesde: fechaDesde ? String(fechaDesde) : undefined,
        fechaHasta: fechaHasta ? String(fechaHasta) : undefined,
      });

      const filename = exportService.generateExcelFilename('kardex');

      // Configurar headers para descarga de archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length.toString());

      return res.send(excelBuffer);
    } catch (error: any) {
      console.error('Error exporting kardex:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al exportar kardex a Excel',
        error: error.message
      });
    }
  }),

  /**
   * GET /api/inventory/export/alertas
   * Exportar alertas de stock a Excel
   * Query params: productId, warehouseId, tipoAlerta
   */
  exportAlertas: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, warehouseId, tipoAlerta } = req.query;

    try {
      const excelBuffer = await exportService.exportAlertasToExcel({
        productId: productId ? String(productId) : undefined,
        warehouseId: warehouseId ? String(warehouseId) : undefined,
        tipoAlerta: tipoAlerta as any,
      });

      const filename = exportService.generateExcelFilename('alertas');

      // Configurar headers para descarga de archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length.toString());

      return res.send(excelBuffer);
    } catch (error: any) {
      console.error('Error exporting alertas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al exportar alertas a Excel',
        error: error.message
      });
    }
  }),

  /**
   * GET /api/inventory/export/transferencias
   * Exportar transferencias entre almacenes a Excel
   * Query params: productId, warehouseFromId, warehouseToId, estado, fechaDesde, fechaHasta
   */
  exportTransferencias: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { productId, warehouseFromId, warehouseToId, estado, fechaDesde, fechaHasta } = req.query;

    try {
      const excelBuffer = await exportService.exportTransferenciasToExcel({
        productId: productId ? String(productId) : undefined,
        warehouseFromId: warehouseFromId ? String(warehouseFromId) : undefined,
        warehouseToId: warehouseToId ? String(warehouseToId) : undefined,
        estado: estado as any,
        fechaDesde: fechaDesde ? String(fechaDesde) : undefined,
        fechaHasta: fechaHasta ? String(fechaHasta) : undefined,
      });

      const filename = exportService.generateExcelFilename('transferencias');

      // Configurar headers para descarga de archivo
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length.toString());

      return res.send(excelBuffer);
    } catch (error: any) {
      console.error('Error exporting transferencias:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al exportar transferencias a Excel',
        error: error.message
      });
    }
  }),
};
