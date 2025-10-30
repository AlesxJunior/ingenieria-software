import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import entidadRoutes from './entidadRoutes';
import inventoryRoutes from './inventoryRoutes';
import auditRoutes from './auditRoutes';
import productRoutes from './productRoutes';
import purchaseRoutes from './purchaseRoutes';
import ubigeoRoutes from './ubigeoRoutes';
import warehouseRoutes from './warehouseRoutes';
import movementReasonRoutes from './movementReasonRoutes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Rutas de entidades comerciales
router.use('/entidades', entidadRoutes);

// Rutas de productos
router.use('/productos', productRoutes);

// Rutas de compras
router.use('/compras', purchaseRoutes);
// Alias en inglés para compatibilidad Frontend
router.use('/purchases', purchaseRoutes);

// Rutas de ubigeo
router.use('/ubigeo', ubigeoRoutes);

// Rutas de almacenes
router.use('/warehouses', warehouseRoutes);
router.use('/almacenes', warehouseRoutes); // Alias en español

// Rutas de motivos de movimiento
router.use('/movement-reasons', movementReasonRoutes);
router.use('/motivos-movimiento', movementReasonRoutes); // Alias en español

// Rutas de auditoría
router.use('/audit', auditRoutes);
// Rutas de inventario
router.use('/inventario', inventoryRoutes);
// Alias en inglés para compatibilidad Frontend
router.use('/inventory', inventoryRoutes);

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