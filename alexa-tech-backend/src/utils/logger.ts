import { config } from '../config';

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (config.isProduction) {
      return level === LogLevel.ERROR || level === LogLevel.WARN;
    }
    return true; // En desarrollo, mostrar todos los logs
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(LogLevel.INFO, message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  // Métodos específicos para casos comunes
  request(method: string, url: string, statusCode?: number, duration?: number): void {
    const message = `${method} ${url}`;
    const meta = { statusCode, duration: duration ? `${duration}ms` : undefined };
    this.info(message, meta);
  }

  database(operation: string, table?: string, duration?: number): void {
    const message = `DB ${operation}`;
    const meta = { table, duration: duration ? `${duration}ms` : undefined };
    this.debug(message, meta);
  }

  auth(action: string, userId?: string, email?: string): void {
    const message = `AUTH ${action}`;
    const meta = { userId, email };
    this.info(message, meta);
  }
}

export const logger = new Logger();
export default logger;