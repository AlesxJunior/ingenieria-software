import { Router } from 'express';
import { configuracionController } from './configuracion.controller';
import { authenticate, requirePermission } from '../../middleware/auth';

const router = Router();

// Aplicar autenticación a todas las rutas
router.use(authenticate);

// ==========================================
// EMPRESA
// ==========================================
router.get(
  '/empresa',
  requirePermission('system.settings'),
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
router.get(
  '/comprobantes',
  requirePermission('system.settings'),
  (req, res) => configuracionController.getAllComprobantes(req, res)
);

router.get(
  '/comprobantes/:id',
  requirePermission('system.settings'),
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
router.get(
  '/metodos-pago',
  requirePermission('system.settings'),
  (req, res) => configuracionController.getAllMetodosPago(req, res)
);

router.get(
  '/metodos-pago/:id',
  requirePermission('system.settings'),
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

export default router;
