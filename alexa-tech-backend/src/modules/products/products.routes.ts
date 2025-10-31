import { Router } from 'express';
import { authenticate, requireSupervisor } from '../../middleware/auth';
import { ProductController } from './products.controller';

const router = Router();

// Todas las rutas requieren autenticación y permisos de supervisor
router.use(authenticate, requireSupervisor);

// RF-15: Registrar producto nuevo
router.post('/', ProductController.create);

// Listado y filtros
router.get('/', ProductController.getAll);

// Consulta por código
router.get('/:codigo', ProductController.getByCodigo);

// RF-16: Editar información de producto (PUT y PATCH)
router.put('/:codigo', ProductController.updateByCodigo);
router.patch('/:codigo', ProductController.updateByCodigo);

// RF-17: Estado de productos (activo/inactivo)
router.patch('/:codigo/status', ProductController.updateStatus);

export default router;
