import { Router } from 'express';
import { authenticate, requireSupervisor } from '../middleware/auth';
import PurchaseController from '../controllers/purchaseController';

const router = Router();

// Todas las rutas requieren autenticación y permiso de supervisor
router.use(authenticate, requireSupervisor);

// Crear orden de compra
router.post('/', PurchaseController.create);

// Listar órdenes de compra con filtros
router.get('/', PurchaseController.getAll);

// Obtener orden por ID
router.get('/:id', PurchaseController.getById);

// Actualizar orden de compra (solo estado Pendiente)
router.put('/:id', PurchaseController.update);
router.patch('/:id', PurchaseController.update);

// Cambiar estado (Pendiente|Recibida|Cancelada)
router.patch('/:id/status', PurchaseController.updateStatus);

// Eliminar orden de compra (solo si está Pendiente)
router.delete('/:id', PurchaseController.delete);

export default router;