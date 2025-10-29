import { describe, it, expect, beforeEach, jest, beforeAll, afterAll } from '@jest/globals';
import { 
  InventoryService, 
  ValidationError, 
  NotFoundError, 
  NegativeStockError,
  InventoryError
} from '../services/inventoryService.refactored';
import { prisma } from '../config/database';
import { Prisma } from '@prisma/client';

// ============================================================================
// MOCKS Y SETUP
// ============================================================================

// Mock de Prisma
jest.mock('../config/database', () => ({
  prisma: {
    product: {
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    warehouse: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    stockByWarehouse: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      aggregate: jest.fn(),
    },
    inventoryMovement: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    $queryRaw: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ============================================================================
// DATOS DE PRUEBA
// ============================================================================

const mockProduct = {
  id: 'prod-123',
  codigo: 'P001',
  nombre: 'Producto Test',
  descripcion: 'Descripción del producto test',
  categoria: 'Categoria Test',
  precioVenta: new Prisma.Decimal(100.00),
  unidadMedida: 'unidad',
  minStock: 10,
  trackInventory: true,
  estado: true,
  stock: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
  usuarioCreacion: 'user-123',
  usuarioActualizacion: 'user-123',
};

const mockWarehouse = {
  id: 'wh-123',
  codigo: 'WH001',
  nombre: 'Almacén Test',
  ubicacion: 'Ubicación Test',
  capacidad: 1000,
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUser = {
  id: 'user-123',
  email: 'testuser@example.com',
  password: 'hashedpassword',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  lastAccess: new Date(),
  permissions: ['inventory:read', 'inventory:write'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStockByWarehouse = {
  id: 'stock-123',
  productId: 'prod-123',
  warehouseId: 'wh-123',
  quantity: 50,
  minStock: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  product: mockProduct,
  warehouse: mockWarehouse,
};

const mockInventoryMovement = {
  id: 'mov-123',
  productId: 'prod-123',
  warehouseId: 'wh-123',
  type: 'AJUSTE',
  quantity: 5,
  stockBefore: 50,
  stockAfter: 55,
  reason: 'ErrorConteo',
  userId: 'user-123',
  documentRef: null,
  createdAt: new Date(),
  product: mockProduct,
  warehouse: mockWarehouse,
  user: mockUser,
};

// ============================================================================
// SUITE DE PRUEBAS PRINCIPALES
// ============================================================================

describe('InventoryService', () => {
  let inventoryService: InventoryService;

  beforeEach(() => {
    inventoryService = new InventoryService();
    jest.clearAllMocks();
  });

  // ==========================================================================
  // PRUEBAS DE VALIDACIÓN
  // ==========================================================================

  describe('Validation Tests', () => {
    describe('ajustarStock - Input Validation', () => {
      it('should throw ValidationError for empty productId', async () => {
        await expect(
          inventoryService.ajustarStock(
            { productId: '', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for empty warehouseId', async () => {
        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: '', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for zero quantity', async () => {
        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 0 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for empty userId', async () => {
        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
            ''
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for non-numeric quantity', async () => {
        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: NaN },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });
    });

    describe('Entity Existence Validation', () => {
      it('should throw NotFoundError for non-existent product', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(null);

        await expect(
          inventoryService.ajustarStock(
            { productId: 'non-existent', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(NotFoundError);
      });

      it('should throw NotFoundError for non-existent warehouse', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.warehouse.findUnique.mockResolvedValue(null);

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'non-existent', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(NotFoundError);
      });

      it('should throw NotFoundError for non-existent user', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'non-existent'
          )
        ).rejects.toThrow(NotFoundError);
      });
    });

    describe('Business Rules Validation', () => {
      it('should throw ValidationError for inactive product', async () => {
        mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, estado: false });

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for product that does not track inventory', async () => {
        mockPrisma.product.findUnique.mockResolvedValue({ ...mockProduct, trackInventory: false });

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for inactive warehouse', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.warehouse.findUnique.mockResolvedValue({ ...mockWarehouse, activo: false });

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError for inactive user', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
        mockPrisma.user.findUnique.mockResolvedValue({ ...mockUser, isActive: false });

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
            'user-123'
          )
        ).rejects.toThrow(ValidationError);
      });

      it('should throw NegativeStockError when adjustment would result in negative stock', async () => {
        mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
        mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
        mockPrisma.user.findUnique.mockResolvedValue(mockUser);
        mockPrisma.stockByWarehouse.findUnique.mockResolvedValue({ ...mockStockByWarehouse, quantity: 5 });

        await expect(
          inventoryService.ajustarStock(
            { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: -10 },
            'user-123'
          )
        ).rejects.toThrow(NegativeStockError);
      });
    });
  });

  // ==========================================================================
  // PRUEBAS DE CASOS NORMALES
  // ==========================================================================

  describe('Normal Use Cases', () => {
    beforeEach(() => {
      // Setup mocks para casos exitosos
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    });

    it('should successfully adjust stock with positive quantity', async () => {
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(mockStockByWarehouse);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          stockByWarehouse: {
            upsert: jest.fn().mockResolvedValue({ ...mockStockByWarehouse, quantity: 55 }),
            aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 155 } }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue(mockInventoryMovement),
          },
          product: {
            update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 155 }),
          },
        });
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await inventoryService.ajustarStock(
        { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 5 },
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.data.stockBefore).toBe(50);
      expect(result.data.stockAfter).toBe(55);
      expect(result.data.delta).toBe(5);
    });

    it('should successfully adjust stock with negative quantity', async () => {
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(mockStockByWarehouse);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          stockByWarehouse: {
            upsert: jest.fn().mockResolvedValue({ ...mockStockByWarehouse, quantity: 45 }),
            aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 95 } }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue({ ...mockInventoryMovement, quantity: -5, stockAfter: 45 }),
          },
          product: {
            update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 95 }),
          },
        });
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await inventoryService.ajustarStock(
        { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: -5 },
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.data.stockBefore).toBe(50);
      expect(result.data.stockAfter).toBe(45);
      expect(result.data.delta).toBe(-5);
    });

    it('should create new stock record when none exists', async () => {
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(null);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          stockByWarehouse: {
            upsert: jest.fn().mockResolvedValue({ ...mockStockByWarehouse, quantity: 10 }),
            aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 110 } }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue({ ...mockInventoryMovement, quantity: 10, stockBefore: 0, stockAfter: 10 }),
          },
          product: {
            update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 110 }),
          },
        });
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await inventoryService.ajustarStock(
        { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.data.stockBefore).toBe(0);
      expect(result.data.stockAfter).toBe(10);
    });
  });

  // ==========================================================================
  // PRUEBAS DE CASOS LÍMITE
  // ==========================================================================

  describe('Edge Cases', () => {
    beforeEach(() => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
    });

    it('should handle very large positive adjustments', async () => {
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(mockStockByWarehouse);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          stockByWarehouse: {
            upsert: jest.fn().mockResolvedValue({ ...mockStockByWarehouse, quantity: 1000050 }),
            aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 1000100 } }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue({ ...mockInventoryMovement, quantity: 1000000 }),
          },
          product: {
            update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 1000100 }),
          },
        });
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await inventoryService.ajustarStock(
        { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 1000000 },
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.data.delta).toBe(1000000);
    });

    it('should handle adjustment that brings stock to exactly zero', async () => {
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(mockStockByWarehouse);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          stockByWarehouse: {
            upsert: jest.fn().mockResolvedValue({ ...mockStockByWarehouse, quantity: 0 }),
            aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 50 } }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue({ ...mockInventoryMovement, quantity: -50, stockAfter: 0 }),
          },
          product: {
            update: jest.fn().mockResolvedValue({ ...mockProduct, stock: 50 }),
          },
        });
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await inventoryService.ajustarStock(
        { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: -50 },
        'user-123'
      );

      expect(result.success).toBe(true);
      expect(result.data.stockAfter).toBe(0);
    });

    it('should handle product with null minStock', async () => {
      const productWithNullMinStock = { ...mockProduct, minStock: null };
      mockPrisma.product.findUnique.mockResolvedValue(productWithNullMinStock);
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(null);
      
      const mockTransaction = jest.fn().mockImplementation(async (callback) => {
        return await callback({
          stockByWarehouse: {
            upsert: jest.fn().mockResolvedValue({ ...mockStockByWarehouse, quantity: 10, minStock: null }),
            aggregate: jest.fn().mockResolvedValue({ _sum: { quantity: 110 } }),
          },
          inventoryMovement: {
            create: jest.fn().mockResolvedValue(mockInventoryMovement),
          },
          product: {
            update: jest.fn().mockResolvedValue(productWithNullMinStock),
          },
        });
      });
      
      mockPrisma.$transaction.mockImplementation(mockTransaction);

      const result = await inventoryService.ajustarStock(
        { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
        'user-123'
      );

      expect(result.success).toBe(true);
    });
  });

  // ==========================================================================
  // PRUEBAS DE MANEJO DE ERRORES
  // ==========================================================================

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      mockPrisma.product.findUnique.mockRejectedValue(new Error('Database connection failed'));

      await expect(
        inventoryService.ajustarStock(
          { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
          'user-123'
        )
      ).rejects.toThrow(InventoryError);
    });

    it('should handle transaction rollback on error', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(mockProduct);
      mockPrisma.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.stockByWarehouse.findUnique.mockResolvedValue(mockStockByWarehouse);
      
      mockPrisma.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        inventoryService.ajustarStock(
          { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
          'user-123'
        )
      ).rejects.toThrow(InventoryError);
    });

    it('should preserve original error types', async () => {
      mockPrisma.product.findUnique.mockResolvedValue(null);

      await expect(
        inventoryService.ajustarStock(
          { productId: 'prod-123', warehouseId: 'wh-123', cantidadAjuste: 10 },
          'user-123'
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  // ==========================================================================
  // PRUEBAS DE CONSULTAS
  // ==========================================================================

  describe('Query Methods', () => {
    describe('getStock', () => {
      it('should return paginated stock data', async () => {
        const mockStockRecords = [
          {
            productId: 'prod-123',
            warehouseId: 'wh-123',
            quantity: 50,
            minStock: 10,
            product: mockProduct,
            warehouse: mockWarehouse,
          },
        ];

        mockPrisma.stockByWarehouse.findMany.mockResolvedValue(mockStockRecords);

        const result = await inventoryService.getStock({ page: 1, pageSize: 20 });

        expect(result).toHaveLength(1);
        expect(result[0].productId).toBe('prod-123');
        expect(result[0].cantidad).toBe(50);
        expect(result[0].estado).toBe('NORMAL');
      });

      it('should filter by warehouse', async () => {
        mockPrisma.stockByWarehouse.findMany.mockResolvedValue([]);

        await inventoryService.getStock({ almacenId: 'wh-123' });

        expect(mockPrisma.stockByWarehouse.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              warehouseId: 'wh-123',
            }),
          })
        );
      });

      it('should filter by search query', async () => {
        mockPrisma.stockByWarehouse.findMany.mockResolvedValue([]);

        await inventoryService.getStock({ q: 'test' });

        expect(mockPrisma.stockByWarehouse.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              product: expect.objectContaining({
                OR: expect.arrayContaining([
                  { codigo: { contains: 'test', mode: 'insensitive' } },
                  { nombre: { contains: 'test', mode: 'insensitive' } },
                ]),
              }),
            }),
          })
        );
      });
    });

    describe('getKardex', () => {
      it('should return paginated kardex data', async () => {
        const mockMovements = [mockInventoryMovement];
        
        mockPrisma.inventoryMovement.count.mockResolvedValue(1);
        mockPrisma.inventoryMovement.findMany.mockResolvedValue(mockMovements);

        const result = await inventoryService.getKardex({ page: 1, pageSize: 20 });

        expect(result.rows).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(result.page).toBe(1);
        expect(result.pages).toBe(1);
      });

      it('should validate date range', async () => {
        await expect(
          inventoryService.getKardex({ fechaDesde: 'invalid-date' })
        ).rejects.toThrow(ValidationError);
      });

      it('should filter by date range', async () => {
        mockPrisma.inventoryMovement.count.mockResolvedValue(0);
        mockPrisma.inventoryMovement.findMany.mockResolvedValue([]);

        await inventoryService.getKardex({
          fechaDesde: '2024-01-01',
          fechaHasta: '2024-01-31',
        });

        expect(mockPrisma.inventoryMovement.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              createdAt: expect.objectContaining({
                gte: expect.any(Date),
                lte: expect.any(Date),
              }),
            }),
          })
        );
      });
    });
  });

  // ==========================================================================
  // PRUEBAS DE CONSISTENCIA
  // ==========================================================================

  describe('Stock Consistency', () => {
    describe('validateStockConsistency', () => {
      it('should detect inconsistent stock', async () => {
        const mockProducts = [
          {
            id: 'prod-123',
            codigo: 'P001',
            stock: 100,
            trackInventory: true,
            stockByWarehouses: [
              { quantity: 30 },
              { quantity: 40 },
            ],
          },
        ];

        mockPrisma.product.findMany.mockResolvedValue(mockProducts);

        const result = await inventoryService.validateStockConsistency();

        expect(result.consistent).toBe(false);
        expect(result.issues).toHaveLength(1);
        expect(result.issues[0]).toContain('Global stock (100) != Calculated stock (70)');
      });

      it('should report consistent stock', async () => {
        const mockProducts = [
          {
            id: 'prod-123',
            codigo: 'P001',
            stock: 70,
            trackInventory: true,
            stockByWarehouses: [
              { quantity: 30 },
              { quantity: 40 },
            ],
          },
        ];

        mockPrisma.product.findMany.mockResolvedValue(mockProducts);

        const result = await inventoryService.validateStockConsistency();

        expect(result.consistent).toBe(true);
        expect(result.issues).toHaveLength(0);
      });
    });
  });
});

// ============================================================================
// PRUEBAS DE INTEGRACIÓN
// ============================================================================

describe('Integration Tests', () => {
  // Estas pruebas requieren una base de datos de prueba real
  // Se pueden ejecutar con NODE_ENV=test y una base de datos separada
  
  describe.skip('Real Database Integration', () => {
    beforeAll(async () => {
      // Setup de base de datos de prueba
      // await setupTestDatabase();
    });

    afterAll(async () => {
      // Cleanup de base de datos de prueba
      // await cleanupTestDatabase();
    });

    it('should perform end-to-end stock adjustment', async () => {
      // Prueba de integración real con base de datos
      // Esta prueba se ejecutaría solo en entorno de testing
    });
  });
});

// ============================================================================
// PRUEBAS DE RENDIMIENTO
// ============================================================================

describe('Performance Tests', () => {
  describe.skip('Load Testing', () => {
    it('should handle concurrent stock adjustments', async () => {
      // Pruebas de carga para operaciones concurrentes
      // Simular múltiples ajustes simultáneos
    });

    it('should maintain performance with large datasets', async () => {
      // Pruebas con grandes volúmenes de datos
      // Verificar que las consultas se mantengan eficientes
    });
  });
});