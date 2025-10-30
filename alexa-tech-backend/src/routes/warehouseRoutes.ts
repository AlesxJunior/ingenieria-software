import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import WarehouseController from '../controllers/warehouseController';

const router = Router();

// Todas las rutas de almacenes requieren autenticación
router.use(authenticate);

// GET /api/almacenes - Listar todos los almacenes
router.get('/', WarehouseController.list);

// GET /api/almacenes/:id - Obtener un almacén
router.get('/:id', WarehouseController.getById);

// POST /api/almacenes - Crear nuevo almacén
router.post('/', WarehouseController.create);

// PUT /api/almacenes/:id - Actualizar almacén
router.put('/:id', WarehouseController.update);

// DELETE /api/almacenes/:id - Desactivar almacén
router.delete('/:id', WarehouseController.delete);

export default router;