import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { logger } from './utils/logger';
import { requestLogger, parseErrorLogger } from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { connectDatabase } from './config/database';
import routes from './routes';

// Crear aplicación Express
const app = express();

// Configuración de seguridad
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configuración de CORS dinámica
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (como Postman, aplicaciones móviles nativas)
    if (!origin) return callback(null, true);
    
    // En desarrollo, permitir cualquier IP local
    if (config.isDevelopment) {
      // Permitir localhost en cualquier puerto
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Permitir cualquier IP privada (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
      const privateIPRegex = /^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)[\d.]+:\d+$/;
      if (privateIPRegex.test(origin)) {
        return callback(null, true);
      }
    }
    
    // En producción o si no coincide con IPs privadas, usar configuración específica
    if (origin === config.corsOrigin) {
      return callback(null, true);
    }
    
    // Rechazar otros orígenes
    callback(new Error('No permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Middleware de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging
if (config.isDevelopment) {
  app.use(morgan('dev'));
}

// Middleware de logging de requests
app.use(requestLogger);

// Middleware para errores de parsing JSON
app.use(parseErrorLogger);

// Configurar trust proxy para obtener IP real
app.set('trust proxy', 1);

// Rutas principales
app.use('/api', routes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Alexa Tech Backend API',
    data: {
      name: 'Alexa Tech Backend',
      version: '1.0.0',
      status: 'running',
      environment: config.nodeEnv,
      timestamp: new Date().toISOString(),
      endpoints: {
        api: '/api',
        auth: '/api/auth',
        health: '/api/health'
      }
    }
  });
});

// Middleware para rutas no encontradas
app.use(notFoundHandler);

// Middleware global de manejo de errores
app.use(errorHandler);

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;