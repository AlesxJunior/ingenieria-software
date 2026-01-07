import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { WarehouseController } from './warehouses.controller';

const router = Router();

// Todas las rutas de almacenes requieren autenticación
router.use(authenticate);

// GET /api/almacenes - Listar todos los almacenes
router.get('/', requirePermission('warehouses.read'), WarehouseController.list);

// GET /api/almacenes/:id - Obtener un almacén
router.get('/:id', requirePermission('warehouses.read'), WarehouseController.getById);

// POST /api/almacenes - Crear nuevo almacén
router.post('/', requirePermission('warehouses.create'), WarehouseController.create);

// PUT /api/almacenes/:id - Actualizar almacén
router.put('/:id', requirePermission('warehouses.update'), WarehouseController.update);

// DELETE /api/almacenes/:id - Desactivar almacén
router.delete('/:id', requirePermission('warehouses.delete'), WarehouseController.delete);

// POST /api/almacenes/:id/activate - Activar almacén
router.post('/:id/activate', requirePermission('warehouses.update'), WarehouseController.activate);

export default router;