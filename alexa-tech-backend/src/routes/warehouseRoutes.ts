import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import WarehouseController from '../controllers/warehouseController';

const router = Router();

// Todas las rutas de warehouses requieren autenticación
router.use(authenticate);

// GET /api/warehouses
router.get('/', WarehouseController.list);

export default router;