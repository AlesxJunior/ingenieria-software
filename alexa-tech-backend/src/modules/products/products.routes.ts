import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { ProductController } from './products.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// RF-15: Registrar producto nuevo
router.post('/', requirePermission('products.create'), ProductController.create);

// Listado y filtros
router.get('/', requirePermission('products.read'), ProductController.getAll);

// Consulta por código
router.get('/:codigo', requirePermission('products.read'), ProductController.getByCodigo);

// RF-16: Editar información de producto (PUT y PATCH)
router.put('/:codigo', requirePermission('products.update'), ProductController.updateByCodigo);
router.patch('/:codigo', requirePermission('products.update'), ProductController.updateByCodigo);

// RF-17: Estado de productos (activo/inactivo)
router.patch('/:codigo/status', requirePermission('products.update'), ProductController.updateStatus);

// RF-18: Eliminar producto (soft delete)
router.delete('/:codigo', requirePermission('products.delete'), ProductController.delete);

export default router;
