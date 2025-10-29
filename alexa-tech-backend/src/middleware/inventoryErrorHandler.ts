import { Request, Response, NextFunction } from 'express';
import { InventoryError, ValidationError, NotFoundError, InsufficientStockError, NegativeStockError } from '../services/inventoryService.refactored';

// ============================================================================
// ERROR LOGGING UTILITY
// ============================================================================

interface ErrorLog {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO';
  message: string;
  stack?: string;
  context?: any;
  userId?: string;
  requestId?: string;
}

class ErrorLogger {
  private static logs: ErrorLog[] = [];
  private static readonly MAX_LOGS = 1000;

  static log(level: ErrorLog['level'], message: string, error?: Error, context?: any, userId?: string, requestId?: string): void {
    const logEntry: ErrorLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      stack: error?.stack,
      context,
      userId,
      requestId
    };

    this.logs.unshift(logEntry);
    
    // Mantener solo los últimos MAX_LOGS registros
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Log a consola en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level}] ${message}`, context || '');
      if (error?.stack) {
        console.error(error.stack);
      }
    }
  }

  static getLogs(limit: number = 50): ErrorLog[] {
    return this.logs.slice(0, limit);
  }

  static getErrorStats(): { total: number; byLevel: Record<string, number>; recent: number } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const recent = this.logs.filter(log => new Date(log.timestamp) > oneHourAgo).length;
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      byLevel,
      recent
    };
  }
}

// ============================================================================
// ERROR RESPONSE FORMATTER
// ============================================================================

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

class ErrorResponseFormatter {
  static format(error: Error, requestId?: string): ErrorResponse {
    const timestamp = new Date().toISOString();
    
    if (error instanceof InventoryError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          timestamp,
          requestId
        }
      };
    }

    // Error genérico
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'An internal error occurred' 
          : error.message,
        timestamp,
        requestId
      }
    };
  }

  static formatValidationError(errors: string[]): ErrorResponse {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { errors },
        timestamp: new Date().toISOString()
      }
    };
  }
}

// ============================================================================
// MIDDLEWARE DE MANEJO DE ERRORES
// ============================================================================

export function inventoryErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  const userId = (req as any).user?.id;
  
  // Log del error
  ErrorLogger.log(
    'ERROR',
    `Inventory error: ${error.message}`,
    error,
    {
      url: req.url,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query
    },
    userId,
    requestId
  );

  // Determinar código de estado HTTP
  let statusCode = 500;
  if (error instanceof ValidationError || error instanceof InsufficientStockError || error instanceof NegativeStockError) {
    statusCode = 400;
  } else if (error instanceof NotFoundError) {
    statusCode = 404;
  } else if (error instanceof InventoryError) {
    statusCode = error.statusCode;
  }

  // Formatear y enviar respuesta
  const response = ErrorResponseFormatter.format(error, requestId);
  res.status(statusCode).json(response);
}

// ============================================================================
// MIDDLEWARE DE VALIDACIÓN DE REQUESTS
// ============================================================================

export function validateInventoryRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors: string[] = [];
  
  // Validaciones específicas por ruta
  if (req.path.includes('/ajustar-stock')) {
    const { productId, warehouseId, cantidadAjuste } = req.body;
    
    if (!productId || typeof productId !== 'string') {
      errors.push('productId is required and must be a string');
    }
    
    if (!warehouseId || typeof warehouseId !== 'string') {
      errors.push('warehouseId is required and must be a string');
    }
    
    if (typeof cantidadAjuste !== 'number' || cantidadAjuste === 0) {
      errors.push('cantidadAjuste is required and must be a non-zero number');
    }
  }
  
  if (req.path.includes('/kardex')) {
    const { fechaDesde, fechaHasta } = req.query;
    
    if (fechaDesde && isNaN(Date.parse(fechaDesde as string))) {
      errors.push('fechaDesde must be a valid date');
    }
    
    if (fechaHasta && isNaN(Date.parse(fechaHasta as string))) {
      errors.push('fechaHasta must be a valid date');
    }
  }
  
  // Validaciones de paginación
  const { page, pageSize } = req.query;
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    errors.push('page must be a positive integer');
  }
  
  if (pageSize && (isNaN(Number(pageSize)) || Number(pageSize) < 1 || Number(pageSize) > 100)) {
    errors.push('pageSize must be between 1 and 100');
  }
  
  if (errors.length > 0) {
    const response = ErrorResponseFormatter.formatValidationError(errors);
    res.status(400).json(response);
    return;
  }
  
  next();
}

// ============================================================================
// MIDDLEWARE DE LOGGING DE REQUESTS
// ============================================================================

export function logInventoryRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = generateRequestId();
  req.headers['x-request-id'] = requestId;
  
  const startTime = Date.now();
  const userId = (req as any).user?.id;
  
  ErrorLogger.log(
    'INFO',
    `Inventory request started: ${req.method} ${req.path}`,
    undefined,
    {
      requestId,
      method: req.method,
      path: req.path,
      query: req.query,
      userAgent: req.headers['user-agent']
    },
    userId,
    requestId
  );
  
  // Override del método end para capturar la respuesta
  const originalEnd = res.end;
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - startTime;
    
    ErrorLogger.log(
      'INFO',
      `Inventory request completed: ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      undefined,
      {
        requestId,
        statusCode: res.statusCode,
        duration
      },
      userId,
      requestId
    );
    
    return originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

// ============================================================================
// UTILIDADES
// ============================================================================

function generateRequestId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// HEALTH CHECK Y MONITORING
// ============================================================================

export class InventoryHealthCheck {
  static async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: Record<string, { status: 'pass' | 'fail'; message?: string; duration?: number }>;
    timestamp: string;
  }> {
    const checks: Record<string, { status: 'pass' | 'fail'; message?: string; duration?: number }> = {};
    
    // Check database connectivity
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      checks.database = { 
        status: 'pass', 
        duration: Date.now() - start 
      };
    } catch (error) {
      checks.database = { 
        status: 'fail', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
    
    // Check error rates
    const errorStats = ErrorLogger.getErrorStats();
    const errorRate = errorStats.recent / Math.max(1, errorStats.total) * 100;
    
    checks.errorRate = {
      status: errorRate < 10 ? 'pass' : 'fail',
      message: `${errorRate.toFixed(2)}% error rate in last hour`
    };
    
    // Determine overall status
    const failedChecks = Object.values(checks).filter(check => check.status === 'fail').length;
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    if (failedChecks > 0) {
      status = failedChecks === Object.keys(checks).length ? 'unhealthy' : 'degraded';
    }
    
    return {
      status,
      checks,
      timestamp: new Date().toISOString()
    };
  }
  
  static getErrorLogs(limit: number = 50): ErrorLog[] {
    return ErrorLogger.getLogs(limit);
  }
  
  static getErrorStats() {
    return ErrorLogger.getErrorStats();
  }
}

// Importar prisma
import { prisma } from '../config/database';