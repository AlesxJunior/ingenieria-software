import { Router } from 'express';
// Importar módulos migrados
import { authRoutes } from '../modules/auth';
import { usersRoutes } from '../modules/users';
import { productsRoutes } from '../modules/products';
import { inventoryRoutes } from '../modules/inventory';
import { purchasesRoutes } from '../modules/purchases';
import { clientsRoutes } from '../modules/clients';
import { warehousesRoutes } from '../modules/warehouses';
// Rutas que aún no se han migrado a módulos
import auditRoutes from './auditRoutes';
import ubigeoRoutes from './ubigeoRoutes';
import movementReasonRoutes from './movementReasonRoutes';

const router = Router();

// ==========================================
// MÓDULOS MIGRADOS (estructura modular)
// ==========================================

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', usersRoutes);

// Rutas de entidades comerciales (clientes y proveedores)
router.use('/entidades', clientsRoutes);

// Rutas de productos
router.use('/productos', productsRoutes);

// Rutas de compras
router.use('/compras', purchasesRoutes);
// Alias en inglés para compatibilidad Frontend
router.use('/purchases', purchasesRoutes);

// Rutas de almacenes
router.use('/warehouses', warehousesRoutes);
router.use('/almacenes', warehousesRoutes); // Alias en español

// Rutas de inventario
router.use('/inventario', inventoryRoutes);
// Alias en inglés para compatibilidad Frontend
router.use('/inventory', inventoryRoutes);

// ==========================================
// RUTAS PENDIENTES DE MIGRACIÓN
// ==========================================

// Rutas de ubigeo (módulo de soporte)
router.use('/ubigeo', ubigeoRoutes);

// Rutas de motivos de movimiento
router.use('/movement-reasons', movementReasonRoutes);
router.use('/motivos-movimiento', movementReasonRoutes); // Alias en español

// Rutas de auditoría
router.use('/audit', auditRoutes);

// Ruta de salud general de la API
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// Ruta de información de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Alexa Tech API',
    data: {
      name: 'Alexa Tech Backend API',
      version: '1.0.0',
      description: 'API REST para el sistema de gestión Alexa Tech',
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        entidades: '/api/entidades',
        productos: '/api/productos',
        compras: '/api/compras',
        purchases: '/api/purchases',
        warehouses: '/api/warehouses',
        almacenes: '/api/almacenes',
        movementReasons: '/api/movement-reasons',
        motivosMovimiento: '/api/motivos-movimiento',
        inventario: '/api/inventario',
        inventory: '/api/inventory',
        audit: '/api/audit',
        ubigeo: '/api/ubigeo',
        health: '/api/health',
      },
      documentation: 'En desarrollo',
    },
  });
});

export default router;