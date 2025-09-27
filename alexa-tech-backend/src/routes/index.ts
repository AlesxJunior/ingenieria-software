import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import auditRoutes from './auditRoutes';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

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
      environment: process.env.NODE_ENV || 'development'
    }
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
        audit: '/api/audit',
        health: '/api/health'
      },
      documentation: 'En desarrollo'
    }
  });
});

export default router;