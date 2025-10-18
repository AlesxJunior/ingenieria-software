import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Instancia global de Prisma
const prisma: PrismaClient = createPrismaClient();

declare global {
  var __prisma: PrismaClient | undefined;
}

// Función para crear la conexión a la base de datos
export function createPrismaClient(): PrismaClient {
  if (global.__prisma) {
    return global.__prisma;
  }

  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // Configurar logging
  client.$on('query', (e) => {
    logger.debug('Query: ' + e.query);
    logger.debug('Params: ' + e.params);
    logger.debug('Duration: ' + e.duration + 'ms');
  });

  client.$on('error', (e) => {
    logger.error('Database error:', e);
  });

  client.$on('info', (e) => {
    logger.info('Database info:', e);
  });

  client.$on('warn', (e) => {
    logger.warn('Database warning:', e);
  });

  // En desarrollo, guardar la instancia globalmente para evitar múltiples conexiones
  if (process.env.NODE_ENV === 'development') {
    global.__prisma = client;
  }

  return client;
}

// Función para conectar a la base de datos
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Conexión a la base de datos establecida');
  } catch (error) {
    logger.error('❌ Error conectando a la base de datos:', error);
    throw error;
  }
}

// Función para desconectar de la base de datos
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Desconectado de la base de datos');
  } catch (error) {
    logger.error('❌ Error desconectando de la base de datos:', error);
    throw error;
  }
}



// Exportar la instancia
export { prisma };
export default prisma;
