import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { PurchaseController } from './purchases.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear orden de compra
router.post('/', requirePermission('purchases.create'), PurchaseController.create);

// Listar órdenes de compra con filtros
router.get('/', requirePermission('purchases.read'), PurchaseController.getAll);

// Obtener orden por ID
router.get('/:id', requirePermission('purchases.read'), PurchaseController.getById);

// Actualizar orden de compra (solo estado Pendiente)
router.put('/:id', requirePermission('purchases.update'), PurchaseController.update);
router.patch('/:id', requirePermission('purchases.update'), PurchaseController.update);

// Cambiar estado (Pendiente|Recibida|Cancelada)
router.patch('/:id/status', requirePermission('purchases.update'), PurchaseController.updateStatus);

// Eliminar orden de compra (solo si está Pendiente)
router.delete('/:id', requirePermission('purchases.delete'), PurchaseController.delete);

export default router;