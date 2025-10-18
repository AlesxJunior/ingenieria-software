import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const config = {
  // Servidor
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Base de datos
  databaseUrl: process.env.DATABASE_URL || '',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Bcrypt
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),

  // Logging
  logLevel:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === 'production' ? 'warn' : 'info'),

  // Validaciones
  get isDevelopment() {
    return this.nodeEnv === 'development';
  },

  get isProduction() {
    return this.nodeEnv === 'production';
  },
};

// Validar configuración crítica
if (!config.jwtSecret || config.jwtSecret === 'fallback-secret') {
  console.warn('⚠️  JWT_SECRET no está configurado correctamente');
}

if (!config.databaseUrl) {
  console.warn('⚠️  DATABASE_URL no está configurado');
}

export default config;
