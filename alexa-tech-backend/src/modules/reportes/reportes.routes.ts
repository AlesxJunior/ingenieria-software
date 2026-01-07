/**
 * Rutas del módulo de Reportes
 * Define los endpoints para generar reportes del sistema
 */

import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { rateLimiter, generalRateLimit } from '../../middleware/rateLimiter';
import { reportesController } from './reportes.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Limitadores de tasa
const readLimiter = generalRateLimit; // 100 peticiones por 15 minutos

/**
 * GET /api/reportes/resumen
 * Obtiene un resumen ejecutivo con métricas clave
 * Permisos: reports.sales, reports.inventory, reports.financial
 */
router.get('/resumen', readLimiter, (req, res) => {
  reportesController.getResumenEjecutivo(req, res);
});

/**
 * GET /api/reportes/ventas
 * Genera reporte detallado de ventas
 * Query params: fechaInicio, fechaFin, usuarioId, tipoComprobante, metodoPago, clienteId, estado
 * Permisos: reports.sales
 */
router.get('/ventas', readLimiter, requirePermission('reports.sales'), (req, res) => {
  reportesController.getReporteVentas(req, res);
});

/**
 * GET /api/reportes/compras
 * Genera reporte detallado de compras
 * Query params: fechaInicio, fechaFin, proveedorId, almacenId, estado
 * Permisos: reports.inventory (compras están relacionadas con inventario)
 */
router.get('/compras', readLimiter, requirePermission('reports.inventory'), (req, res) => {
  reportesController.getReporteCompras(req, res);
});

/**
 * GET /api/reportes/inventario
 * Genera reporte detallado de inventario
 * Query params: almacenId, categoria, estado
 * Permisos: reports.inventory
 */
router.get('/inventario', readLimiter, requirePermission('reports.inventory'), (req, res) => {
  reportesController.getReporteInventario(req, res);
});

/**
 * GET /api/reportes/financiero
 * Genera reporte financiero
 * Query params: fechaInicio, fechaFin, tipo
 * Permisos: reports.financial
 */
router.get('/financiero', readLimiter, requirePermission('reports.financial'), (req, res) => {
  reportesController.getReporteFinanciero(req, res);
});

/**
 * GET /api/reportes/caja
 * Genera reporte de movimientos de caja
 * Query params: fechaInicio, fechaFin, cajaId, usuarioId, estado
 * Permisos: reports.financial (caja es parte financiera)
 */
router.get('/caja', readLimiter, requirePermission('reports.financial'), (req, res) => {
  reportesController.getReporteCaja(req, res);
});

/**
 * GET /api/reportes/productos-vendidos
 * Genera reporte de productos más vendidos
 * Query params: fechaInicio, fechaFin, categoria, page, limit
 * Permisos: reports.sales
 */
router.get('/productos-vendidos', readLimiter, requirePermission('reports.sales'), (req, res) => {
  reportesController.getProductosMasVendidos(req, res);
});

export default router;
