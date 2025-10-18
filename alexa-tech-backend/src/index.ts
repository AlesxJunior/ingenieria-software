import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import AuditService from './services/auditService';

// Función para iniciar el servidor
const startServer = async (): Promise<void> => {
  try {
    // Conectar a la base de datos
    await connectDatabase();
    logger.info('✅ Base de datos conectada exitosamente');

    // Validar configuración crítica
    if (!config.jwtSecret || config.jwtSecret === 'fallback-secret') {
      logger.warn(
        '⚠️  JWT_SECRET no está configurado correctamente. Usando valor por defecto.',
      );
    }

    if (!config.databaseUrl) {
      logger.warn('⚠️  DATABASE_URL no está configurado. Usando datos mock.');
    }

    // Iniciar servidor
    const server = app.listen(config.port, async () => {
      logger.info(`🚀 Servidor iniciado exitosamente`);
      logger.info(`📍 Puerto: ${config.port}`);
      logger.info(`🌍 Entorno: ${config.nodeEnv}`);
      logger.info(`🔗 URL: http://localhost:${config.port}`);
      logger.info(`📚 API: http://localhost:${config.port}/api`);
      logger.info(`🔐 Auth: http://localhost:${config.port}/api/auth`);
      logger.info(`❤️  Health: http://localhost:${config.port}/api/health`);

      if (config.isDevelopment) {
        logger.info(`🔧 Modo desarrollo activado`);
        logger.info(`🌐 CORS origen: ${config.corsOrigin}`);
      }

      // Registrar evento del sistema
      try {
        await AuditService.createSystemEvent({
          type: 'SERVER_START',
          details: 'Servidor iniciado exitosamente',
          metadata: {
            port: config.port,
            environment: config.nodeEnv,
            version: process.env.npm_package_version || '1.0.0',
          },
        });
      } catch (error) {
        logger.error('Error al registrar evento del sistema:', error);
      }
    });

    // Configurar timeout del servidor
    server.timeout = 30000; // 30 segundos

    // Manejo de errores del servidor
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${config.port} ya está en uso`);
        process.exit(1);
      } else {
        logger.error('❌ Error del servidor', { error: error.message });
        process.exit(1);
      }
    });

    // Manejo de cierre graceful
    const gracefulShutdown = (signal: string) => {
      logger.info(`📡 Señal ${signal} recibida, cerrando servidor...`);

      server.close((error) => {
        if (error) {
          logger.error('❌ Error cerrando servidor', { error: error.message });
          process.exit(1);
        } else {
          logger.info('✅ Servidor cerrado exitosamente');
          process.exit(0);
        }
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        logger.error('⏰ Forzando cierre del servidor');
        process.exit(1);
      }, 10000);
    };

    // Registrar manejadores de señales
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Error iniciando servidor', { error });
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Exportar para testing
export default app;
