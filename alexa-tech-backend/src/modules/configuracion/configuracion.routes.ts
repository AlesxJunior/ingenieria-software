import { Router } from 'express';
import { configuracionController } from './configuracion.controller';
import { authenticate, requirePermission } from '../../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// ==========================================
// EMPRESA
// ==========================================
// Lectura: Permitida para todos los usuarios autenticados (necesario para documentos/reportes)
router.get(
  '/empresa',
  (req, res) => configuracionController.getEmpresa(req, res)
);

router.put(
  '/empresa',
  requirePermission('system.settings'),
  (req, res) => configuracionController.updateEmpresa(req, res)
);

// ==========================================
// TIPOS DE COMPROBANTES
// ==========================================
// Lectura: Permitida para todos los usuarios autenticados (necesario para ventas)
router.get(
  '/comprobantes',
  (req, res) => configuracionController.getAllComprobantes(req, res)
);

router.get(
  '/comprobantes/:id',
  (req, res) => configuracionController.getComprobanteById(req, res)
);

router.post(
  '/comprobantes',
  requirePermission('system.settings'),
  (req, res) => configuracionController.createComprobante(req, res)
);

router.put(
  '/comprobantes/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.updateComprobante(req, res)
);

router.delete(
  '/comprobantes/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.deleteComprobante(req, res)
);

// ==========================================
// MÉTODOS DE PAGO
// ==========================================
// Lectura: Permitida para todos los usuarios autenticados (necesario para ventas)
router.get(
  '/metodos-pago',
  (req, res) => configuracionController.getAllMetodosPago(req, res)
);

router.get(
  '/metodos-pago/:id',
  (req, res) => configuracionController.getMetodoPagoById(req, res)
);

router.post(
  '/metodos-pago',
  requirePermission('system.settings'),
  (req, res) => configuracionController.createMetodoPago(req, res)
);

router.put(
  '/metodos-pago/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.updateMetodoPago(req, res)
);

router.delete(
  '/metodos-pago/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.deleteMetodoPago(req, res)
);

// ==========================================
// CATEGORÍAS DE PRODUCTOS
// ==========================================
router.get(
  '/categorias',
  requirePermission('system.settings'),
  (req, res) => configuracionController.getAllCategories(req, res)
);

router.get(
  '/categorias/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.getCategoryById(req, res)
);

router.post(
  '/categorias',
  requirePermission('system.settings'),
  (req, res) => configuracionController.createCategory(req, res)
);

router.put(
  '/categorias/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.updateCategory(req, res)
);

router.delete(
  '/categorias/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.deleteCategory(req, res)
);

router.delete(
  '/categorias/:id/hard',
  requirePermission('system.settings'),
  (req, res) => configuracionController.hardDeleteCategory(req, res)
);

// ==========================================
// UNIDADES DE MEDIDA
// ==========================================
router.get(
  '/unidades',
  requirePermission('system.settings'),
  (req, res) => configuracionController.getAllUnits(req, res)
);

router.get(
  '/unidades/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.getUnitById(req, res)
);

router.post(
  '/unidades',
  requirePermission('system.settings'),
  (req, res) => configuracionController.createUnit(req, res)
);

router.put(
  '/unidades/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.updateUnit(req, res)
);

router.delete(
  '/unidades/:id',
  requirePermission('system.settings'),
  (req, res) => configuracionController.deleteUnit(req, res)
);

router.delete(
  '/unidades/:id/hard',
  requirePermission('system.settings'),
  (req, res) => configuracionController.hardDeleteUnit(req, res)
);

export default router;
