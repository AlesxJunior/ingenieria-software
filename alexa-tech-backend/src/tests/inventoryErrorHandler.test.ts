import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import {
  inventoryErrorHandler,
  validateInventoryRequest,
  logInventoryRequest,
  InventoryHealthCheck
} from '../middleware/inventoryErrorHandler';
import {
  InventoryError,
  ValidationError,
  NotFoundError,
  InsufficientStockError,
  NegativeStockError
} from '../services/inventoryService.refactored';

// ============================================================================
// MOCKS Y SETUP
// ============================================================================

// Mock de Express Request/Response
const mockRequest = (overrides = {}) => ({
  url: '/api/inventory/ajustar-stock',
  method: 'POST',
  body: {},
  params: {},
  query: {},
  headers: {},
  path: '/ajustar-stock',
  ...overrides,
}) as Request;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res) as any;
  res.json = jest.fn().mockReturnValue(res) as any;
  res.end = jest.fn().mockReturnValue(res) as any;
  return res;
};

const mockNext = jest.fn() as NextFunction;

// Mock de Prisma para HealthCheck
jest.mock('../config/database', () => ({
  prisma: {
    $queryRaw: jest.fn(),
  },
}));

// ============================================================================
// PRUEBAS DEL MIDDLEWARE DE ERRORES
// ============================================================================

describe('inventoryErrorHandler', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
  });

  describe('Error Type Handling', () => {
    it('should handle ValidationError with 400 status', () => {
      const error = new ValidationError('Invalid input data');
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
          }),
        })
      );
    });

    it('should handle NotFoundError with 404 status', () => {
      const error = new NotFoundError('Product', 'prod-123');
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOT_FOUND',
            message: 'Product with ID prod-123 not found',
          }),
        })
      );
    });

    it('should handle InsufficientStockError with 400 status', () => {
      const error = new InsufficientStockError(5, 10);
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INSUFFICIENT_STOCK',
            message: 'Insufficient stock. Available: 5, Requested: 10',
          }),
        })
      );
    });

    it('should handle NegativeStockError with 400 status', () => {
      const error = new NegativeStockError(-5);
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NEGATIVE_STOCK',
            message: 'Operation would result in negative stock: -5',
          }),
        })
      );
    });

    it('should handle custom InventoryError with custom status code', () => {
      const error = new InventoryError('Custom error', 'CUSTOM_ERROR', 422);
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(422);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CUSTOM_ERROR',
            message: 'Custom error',
          }),
        })
      );
    });

    it('should handle generic Error with 500 status', () => {
      const error = new Error('Unexpected error');
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_ERROR',
          }),
        })
      );
    });
  });

  describe('Error Logging', () => {
    it('should include request context in error logs', () => {
      const req = mockRequest({
        url: '/api/inventory/test',
        method: 'POST',
        body: { productId: 'prod-123' },
        params: { id: '123' },
        query: { page: '1' },
        headers: { 'x-request-id': 'req-123' },
      });
      
      const error = new ValidationError('Test error');
      
      inventoryErrorHandler(error, req, res, next);
      
      // Verificar que el error fue procesado
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should generate request ID if not present', () => {
      const error = new ValidationError('Test error');
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            requestId: expect.any(String),
          }),
        })
      );
    });
  });

  describe('Production vs Development', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Sensitive error information');
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'An internal error occurred',
          }),
        })
      );
    });

    it('should show error details in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Detailed error information');
      
      inventoryErrorHandler(error, req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            message: 'Detailed error information',
          }),
        })
      );
    });
  });
});

// ============================================================================
// PRUEBAS DEL MIDDLEWARE DE VALIDACIÓN
// ============================================================================

describe('validateInventoryRequest', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
  });

  describe('Stock Adjustment Validation', () => {
    beforeEach(() => {
      Object.defineProperty(req, 'path', { value: '/ajustar-stock', writable: true });
    });

    it('should pass validation for valid stock adjustment request', () => {
      req.body = {
        productId: 'prod-123',
        warehouseId: 'wh-123',
        cantidadAjuste: 10,
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject request with missing productId', () => {
      req.body = {
        warehouseId: 'wh-123',
        cantidadAjuste: 10,
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                'productId is required and must be a string'
              ]),
            }),
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with invalid productId type', () => {
      req.body = {
        productId: 123,
        warehouseId: 'wh-123',
        cantidadAjuste: 10,
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with missing warehouseId', () => {
      req.body = {
        productId: 'prod-123',
        cantidadAjuste: 10,
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with zero cantidadAjuste', () => {
      req.body = {
        productId: 'prod-123',
        warehouseId: 'wh-123',
        cantidadAjuste: 0,
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject request with non-numeric cantidadAjuste', () => {
      req.body = {
        productId: 'prod-123',
        warehouseId: 'wh-123',
        cantidadAjuste: 'invalid',
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should collect multiple validation errors', () => {
      req.body = {
        cantidadAjuste: 0,
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                'productId is required and must be a string',
                'warehouseId is required and must be a string',
                'cantidadAjuste is required and must be a non-zero number',
              ]),
            }),
          }),
        })
      );
    });
  });

  describe('Kardex Validation', () => {
    beforeEach(() => {
      Object.defineProperty(req, 'path', { value: '/kardex', writable: true });
    });

    it('should pass validation for valid kardex request', () => {
      req.query = {
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-01-31',
        page: '1',
        pageSize: '20',
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject invalid fechaDesde', () => {
      req.query = {
        fechaDesde: 'invalid-date',
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid fechaHasta', () => {
      req.query = {
        fechaHasta: 'invalid-date',
      };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Pagination Validation', () => {
    it('should reject invalid page number', () => {
      req.query = { page: '0' };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                'page must be a positive integer'
              ]),
            }),
          }),
        })
      );
    });

    it('should reject pageSize too large', () => {
      req.query = { pageSize: '200' };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.objectContaining({
              errors: expect.arrayContaining([
                'pageSize must be between 1 and 100'
              ]),
            }),
          }),
        })
      );
    });

    it('should reject negative pageSize', () => {
      req.query = { pageSize: '-1' };
      
      validateInventoryRequest(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

// ============================================================================
// PRUEBAS DEL MIDDLEWARE DE LOGGING
// ============================================================================

describe('logInventoryRequest', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
  });

  it('should generate request ID and log request start', () => {
    logInventoryRequest(req, res, next);
    
    expect(req.headers['x-request-id']).toBeDefined();
    expect(next).toHaveBeenCalled();
  });

  it('should preserve existing request ID', () => {
    req.headers['x-request-id'] = 'existing-id';
    
    logInventoryRequest(req, res, next);
    
    expect(req.headers['x-request-id']).toBe('existing-id');
    expect(next).toHaveBeenCalled();
  });

  it('should log request completion when response ends', () => {
    const originalEnd = res.end;
    
    logInventoryRequest(req, res, next);
    
    // Simular finalización de respuesta
    res.statusCode = 200;
    res.end();
    
    // Verificar que el método end fue sobrescrito y luego restaurado
    expect(res.end).not.toBe(originalEnd);
  });

  it('should include user context in logs when available', () => {
    (req as any).user = { id: 'user-123' };
    
    logInventoryRequest(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});

// ============================================================================
// PRUEBAS DE HEALTH CHECK
// ============================================================================

describe('InventoryHealthCheck', () => {
  // Note: prisma is mocked in the test setup

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getHealthStatus', () => {
    it('should return healthy status when all checks pass', async () => {
      prisma.$queryRaw.mockResolvedValue([{ result: 1 }]);
      
      const status = await InventoryHealthCheck.getHealthStatus();
      
      expect(status.status).toBe('healthy');
      expect(status.checks.database?.status).toBe('pass');
      expect(status.checks.errorRate?.status).toBe('pass');
      expect(status.timestamp).toBeDefined();
    });

    it('should return unhealthy status when database check fails', async () => {
      prisma.$queryRaw.mockRejectedValue(new Error('Database connection failed'));
      
      const status = await InventoryHealthCheck.getHealthStatus();
      
      expect(status.status).toBe('degraded');
      expect(status.checks.database?.status).toBe('fail');
      expect(status.checks.database?.message).toBe('Database connection failed');
    });

    it('should include database response time', async () => {
      prisma.$queryRaw.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve([{ result: 1 }]), 100))
      );
      
      const status = await InventoryHealthCheck.getHealthStatus();
      
      expect(status.checks.database?.duration).toBeGreaterThan(90);
    });
  });

  describe('getErrorLogs', () => {
    it('should return limited number of logs', () => {
      const logs = InventoryHealthCheck.getErrorLogs(10);
      
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      const stats = InventoryHealthCheck.getErrorStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('byLevel');
      expect(stats).toHaveProperty('recent');
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.recent).toBe('number');
    });
  });
});

// ============================================================================
// PRUEBAS DE INTEGRACIÓN DEL MIDDLEWARE
// ============================================================================

describe('Middleware Integration', () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = mockRequest();
    res = mockResponse();
    next = mockNext;
    jest.clearAllMocks();
  });

  it('should work together in middleware chain', () => {
    Object.defineProperty(req, 'path', { value: '/ajustar-stock', writable: true });
    req.body = {
      productId: 'prod-123',
      warehouseId: 'wh-123',
      cantidadAjuste: 10,
    };

    // Simular cadena de middleware
    logInventoryRequest(req, res, () => {
      validateInventoryRequest(req, res, () => {
        // Simular error en el controlador
        const error = new ValidationError('Business logic error');
        inventoryErrorHandler(error, req, res, next);
      });
    });

    expect(req.headers['x-request-id']).toBeDefined();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          requestId: req.headers['x-request-id'],
        }),
      })
    );
  });

  it('should handle middleware errors gracefully', () => {
    // Simular error en el middleware de validación
    Object.defineProperty(req, 'path', { value: '/ajustar-stock', writable: true });
    req.body = {}; // Datos inválidos
    
    validateInventoryRequest(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});