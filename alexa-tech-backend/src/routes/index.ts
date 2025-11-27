import { Router } from 'express';
// Importar módulos migrados
import { authRoutes } from '../modules/auth';
import { usersRoutes } from '../modules/users';
import rolesRoutes from '../modules/roles/routes';
import { productsRoutes } from '../modules/products';
import { inventoryRoutes } from '../modules/inventory';
import { purchasesRoutes } from '../modules/purchases';
import { clientsRoutes } from '../modules/clients';
import { warehousesRoutes } from '../modules/warehouses';
import salesRoutes from '../modules/sales/sales.routes';
import cashRegisterRoutes from '../modules/sales/cash-register.routes';
import cashSessionRoutes from '../modules/sales/cash-session.routes';
import configuracionRoutes from '../modules/configuracion/configuracion.routes';
import reportesRoutes from '../modules/reportes/reportes.routes';
import { sunatRoutes } from '../modules/sunat';
// Rutas que aún no se han migrado a módulos
import auditRoutes from './auditRoutes';
import ubigeoRoutes from './ubigeoRoutes';
import movementReasonRoutes from './movementReasonRoutes';
import cashMovementRoutes from './cashMovementRoutes';
import quoteRoutes from './quoteRoutes';
import creditNoteRoutes from './creditNoteRoutes';

const router = Router();

// ==========================================
// MÓDULOS MIGRADOS (estructura modular)
// ==========================================

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', usersRoutes);

// Rutas de roles (gestión de roles y permisos)
router.use('/roles', rolesRoutes);

// Rutas de entidades comerciales (clientes y proveedores)
router.use('/entidades', clientsRoutes);

// Rutas de productos
router.use('/productos', productsRoutes);
// Alias en inglés para compatibilidad
router.use('/products', productsRoutes);

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

// Rutas de ventas
router.use('/ventas', salesRoutes);
// Alias en inglés para compatibilidad Frontend
router.use('/sales', salesRoutes);

// Rutas de cajas registradoras
router.use('/cash-registers', cashRegisterRoutes);
router.use('/cajas-registradoras', cashRegisterRoutes); // Alias en español

// Rutas de sesiones de caja
router.use('/cash-sessions', cashSessionRoutes);
router.use('/sesiones-caja', cashSessionRoutes); // Alias en español

// Rutas de movimientos de caja (ingresos/egresos)
router.use('/cash-movements', cashMovementRoutes);
router.use('/movimientos-caja', cashMovementRoutes); // Alias en español

// Rutas de cotizaciones
router.use('/quotes', quoteRoutes);
router.use('/cotizaciones', quoteRoutes); // Alias en español

// Rutas de notas de crédito
router.use('/credit-notes', creditNoteRoutes);
router.use('/notas-credito', creditNoteRoutes); // Alias en español

// Rutas de configuración
router.use('/configuracion', configuracionRoutes);

// Rutas de reportes
router.use('/reportes', reportesRoutes);
// Alias en inglés para compatibilidad Frontend
router.use('/reports', reportesRoutes);

// Rutas de SUNAT (consulta RUC/DNI)
router.use('/sunat', sunatRoutes);

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
        roles: '/api/roles',
        entidades: '/api/entidades',
        productos: '/api/productos',
        compras: '/api/compras',
        purchases: '/api/purchases',
        ventas: '/api/ventas',
        sales: '/api/sales',
        invoices: '/api/sales/:id/invoice/{download|preview}',
        cashRegisters: '/api/cash-registers',
        cajasRegistradoras: '/api/cajas-registradoras',
        cashSessions: '/api/cash-sessions',
        sesionesCaja: '/api/sesiones-caja',
        cashMovements: '/api/cash-movements',
        movimientosCaja: '/api/movimientos-caja',
        quotes: '/api/quotes',
        cotizaciones: '/api/cotizaciones',
        creditNotes: '/api/credit-notes',
        notasCredito: '/api/notas-credito',
        configuracion: '/api/configuracion',
        reportes: '/api/reportes',
        reports: '/api/reports',
        sunat: '/api/sunat',
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