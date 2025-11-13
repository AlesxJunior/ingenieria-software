import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/auth';
import { CashRegisterController } from './cash-register.controller';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// Crear caja registradora
router.post('/', requirePermission('cash-registers.create'), CashRegisterController.create);

// Listar cajas registradoras
router.get('/', requirePermission('cash-registers.read'), CashRegisterController.getAll);

// Obtener caja por ID
router.get('/:id', requirePermission('cash-registers.read'), CashRegisterController.getById);

// Actualizar caja registradora
router.put('/:id', requirePermission('cash-registers.update'), CashRegisterController.update);
router.patch('/:id', requirePermission('cash-registers.update'), CashRegisterController.update);

// Eliminar caja registradora
router.delete('/:id', requirePermission('cash-registers.delete'), CashRegisterController.delete);

export default router;
