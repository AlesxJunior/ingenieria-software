import { describe, it, expect, beforeEach, vi } from 'vitest';
import { inventoryService } from '../inventory.service';
import { prisma } from '../../../config/database';

// Mock Prisma
vi.mock('../../../config/database', () => ({
  prisma: {
    stockByWarehouse: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      upsert: vi.fn(),
      aggregate: vi.fn(),
    },
    inventoryMovement: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    warehouse: {
      findUnique: vi.fn(),
    },
    movementReason: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const prismaMock = prisma as any;

describe('InventoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStock', () => {
    const mockStockData = [
      {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        quantity: 50,
        minStock: 20,
        product: {
          id: 'prod-1',
          codigo: 'PROD001',
          nombre: 'Producto 1',
          minStock: 20,
          trackInventory: true,
        },
        warehouse: {
          id: 'wh-1',
          nombre: 'Almacén Principal',
        },
      },
      {
        productId: 'prod-2',
        warehouseId: 'wh-1',
        quantity: 5,
        minStock: 15,
        product: {
          id: 'prod-2',
          codigo: 'PROD002',
          nombre: 'Producto 2',
          minStock: 15,
          trackInventory: true,
        },
        warehouse: {
          id: 'wh-1',
          nombre: 'Almacén Principal',
        },
      },
    ];

    it('should return stock list without filters', async () => {
      // Arrange
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(mockStockData);

      // Act
      const result = await inventoryService.getStock({});

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        productId: 'prod-1',
        codigo: 'PROD001',
        nombre: 'Producto 1',
        almacen: 'Almacén Principal',
        cantidad: 50,
        stockMinimo: 20,
        estado: 'NORMAL',
      });
      expect(prismaMock.stockByWarehouse.findMany).toHaveBeenCalledTimes(1);
    });

    it('should filter by warehouse ID', async () => {
      // Arrange
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([mockStockData[0]]);

      // Act
      const result = await inventoryService.getStock({ almacenId: 'wh-1' });

      // Assert
      expect(result).toHaveLength(1);
      expect(prismaMock.stockByWarehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            warehouseId: 'wh-1',
          }),
        }),
      );
    });

    it('should search by product code or name', async () => {
      // Arrange
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([mockStockData[0]]);

      // Act
      const result = await inventoryService.getStock({ q: 'PROD001' });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].codigo).toBe('PROD001');
      expect(prismaMock.stockByWarehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            product: expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ codigo: expect.any(Object) }),
                expect.objectContaining({ nombre: expect.any(Object) }),
              ]),
            }),
          }),
        }),
      );
    });

    it('should filter by estado CRITICO', async () => {
      // Arrange
      const criticalStock = {
        ...mockStockData[1],
        quantity: 5,
        minStock: 20,
      };
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([criticalStock]);

      // Act
      const result = await inventoryService.getStock({ estado: 'CRITICO' });

      // Assert
      expect(result.every((r) => r.estado === 'CRITICO')).toBe(true);
    });

    it('should apply pagination', async () => {
      // Arrange
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([mockStockData[0]]);

      // Act
      await inventoryService.getStock({ page: 2, pageSize: 10 });

      // Assert
      expect(prismaMock.stockByWarehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('should calculate NORMAL estado when stock is above minimum', async () => {
      // Arrange
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([mockStockData[0]]);

      // Act
      const result = await inventoryService.getStock({});

      // Assert
      expect(result[0].estado).toBe('NORMAL');
    });

    it('should calculate BAJO estado when stock is below minimum', async () => {
      // Arrange
      const lowStock = {
        ...mockStockData[0],
        quantity: 15,
        minStock: 20,
      };
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([lowStock]);

      // Act
      const result = await inventoryService.getStock({});

      // Assert
      expect(result[0].estado).toBe('BAJO');
    });

    it('should calculate CRITICO estado when stock is at 50% or below minimum', async () => {
      // Arrange
      const criticalStock = {
        ...mockStockData[0],
        quantity: 5,
        minStock: 20,
      };
      prismaMock.stockByWarehouse.findMany.mockResolvedValue([criticalStock]);

      // Act
      const result = await inventoryService.getStock({});

      // Assert
      expect(result[0].estado).toBe('CRITICO');
    });
  });

  describe('getStockByWarehouse', () => {
    const mockStockData = [
      {
        id: 'stock-1',
        productId: 'prod-1',
        warehouseId: 'wh-1',
        quantity: 50,
        minStock: 20,
        updatedAt: new Date('2024-01-01'),
        product: {
          id: 'prod-1',
          codigo: 'PROD001',
          nombre: 'Producto 1',
          minStock: 20,
        },
        warehouse: {
          id: 'wh-1',
          nombre: 'Almacén Principal',
        },
      },
    ];

    it('should return paginated stock by warehouse', async () => {
      // Arrange
      prismaMock.stockByWarehouse.count.mockResolvedValue(1);
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(mockStockData);

      // Act
      const result = await inventoryService.getStockByWarehouse({});

      // Assert
      expect(result).toMatchObject({
        total: 1,
        page: 1,
        limit: 20,
        pages: 1,
      });
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toMatchObject({
        stockByWarehouseId: 'stock-1',
        productId: 'prod-1',
        codigo: 'PROD001',
        cantidad: 50,
      });
    });

    it('should filter by warehouse and product', async () => {
      // Arrange
      prismaMock.stockByWarehouse.count.mockResolvedValue(1);
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(mockStockData);

      // Act
      await inventoryService.getStockByWarehouse({
        almacenId: 'wh-1',
        productId: 'prod-1',
      });

      // Assert
      expect(prismaMock.stockByWarehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            warehouseId: 'wh-1',
            productId: 'prod-1',
          },
        }),
      );
    });

    it('should sort by different fields', async () => {
      // Arrange
      prismaMock.stockByWarehouse.count.mockResolvedValue(1);
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(mockStockData);

      // Act
      await inventoryService.getStockByWarehouse({
        sortBy: 'updatedAt',
        order: 'asc',
      });

      // Assert
      expect(prismaMock.stockByWarehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { updatedAt: 'asc' },
        }),
      );
    });
  });

  describe('getKardex', () => {
    const mockKardexData = [
      {
        id: 'mov-1',
        productId: 'prod-1',
        warehouseId: 'wh-1',
        type: 'ENTRADA',
        quantity: 10,
        stockBefore: 40,
        stockAfter: 50,
        reason: 'Compra',
        documentRef: 'COMP-001',
        userId: 'user-1',
        createdAt: new Date('2024-01-01'),
        product: {
          codigo: 'PROD001',
          nombre: 'Producto 1',
        },
        warehouse: {
          nombre: 'Almacén Principal',
        },
        user: {
          username: 'admin',
        },
        movementReason: {
          nombre: 'Compra de mercadería',
        },
      },
    ];

    it('should return paginated kardex movements', async () => {
      // Arrange
      prismaMock.inventoryMovement.count.mockResolvedValue(1);
      prismaMock.inventoryMovement.findMany.mockResolvedValue(mockKardexData);

      // Act
      const result = await inventoryService.getKardex({});

      // Assert
      expect(result).toMatchObject({
        total: 1,
        page: 1,
        limit: 50,
        pages: 1,
      });
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toMatchObject({
        id: 'mov-1',
        tipo: 'ENTRADA',
        cantidad: 10,
        stockAntes: 40,
        stockDespues: 50,
        motivo: 'Compra de mercadería',
        usuario: 'admin',
      });
    });

    it('should filter by product ID', async () => {
      // Arrange
      prismaMock.inventoryMovement.count.mockResolvedValue(1);
      prismaMock.inventoryMovement.findMany.mockResolvedValue(mockKardexData);

      // Act
      await inventoryService.getKardex({ productId: 'prod-1' });

      // Assert
      expect(prismaMock.inventoryMovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            productId: 'prod-1',
          }),
        }),
      );
    });

    it('should filter by movement type', async () => {
      // Arrange
      prismaMock.inventoryMovement.count.mockResolvedValue(1);
      prismaMock.inventoryMovement.findMany.mockResolvedValue(mockKardexData);

      // Act
      await inventoryService.getKardex({ tipoMovimiento: 'ENTRADA' });

      // Assert
      expect(prismaMock.inventoryMovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'ENTRADA',
          }),
        }),
      );
    });

    it('should filter by date range', async () => {
      // Arrange
      prismaMock.inventoryMovement.count.mockResolvedValue(1);
      prismaMock.inventoryMovement.findMany.mockResolvedValue(mockKardexData);

      // Act
      await inventoryService.getKardex({
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-12-31',
      });

      // Assert
      expect(prismaMock.inventoryMovement.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        }),
      );
    });
  });

  describe('ajustarStock', () => {
    const mockProduct = {
      id: 'prod-1',
      codigo: 'PROD001',
      nombre: 'Producto 1',
      trackInventory: true,
      minStock: 20,
      stock: 50,
    };

    const mockExistingStock = {
      productId: 'prod-1',
      warehouseId: 'wh-1',
      quantity: 50,
      minStock: 20,
      product: mockProduct,
    };

    it('should increment stock successfully', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.stockByWarehouse.findUnique.mockResolvedValue(mockExistingStock);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          stockByWarehouse: {
            upsert: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 60 } }),
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      // Act
      const result = await inventoryService.ajustarStock(
        {
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: 10,
          adjustmentDirection: 'INCREMENT',
        },
        'user-1',
      );

      // Assert
      expect(result).toEqual({
        success: true,
        stockBefore: 50,
        stockAfter: 60,
      });
    });

    it('should decrement stock successfully', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.stockByWarehouse.findUnique.mockResolvedValue(mockExistingStock);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          stockByWarehouse: {
            upsert: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 40 } }),
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      // Act
      const result = await inventoryService.ajustarStock(
        {
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: 10,
          adjustmentDirection: 'DECREMENT',
        },
        'user-1',
      );

      // Assert
      expect(result).toEqual({
        success: true,
        stockBefore: 50,
        stockAfter: 40,
      });
    });

    it('should throw error when product not found', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        inventoryService.ajustarStock({
          productId: 'invalid-id',
          warehouseId: 'wh-1',
          cantidadAjuste: 10,
          adjustmentDirection: 'INCREMENT',
        }),
      ).rejects.toThrow('Producto no encontrado');
    });

    it('should throw error when product does not track inventory', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue({
        ...mockProduct,
        trackInventory: false,
      });

      // Act & Assert
      await expect(
        inventoryService.ajustarStock({
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: 10,
          adjustmentDirection: 'INCREMENT',
        }),
      ).rejects.toThrow('Producto no gestionado por inventario');
    });

    it('should throw error when adjustment results in negative stock', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.stockByWarehouse.findUnique.mockResolvedValue(mockExistingStock);

      // Act & Assert
      await expect(
        inventoryService.ajustarStock({
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: 100,
          adjustmentDirection: 'DECREMENT',
        }),
      ).rejects.toThrow('El ajuste resultaría en stock negativo');
    });

    it('should throw error for missing required fields', async () => {
      // Act & Assert
      await expect(
        inventoryService.ajustarStock({
          productId: '',
          warehouseId: 'wh-1',
          cantidadAjuste: 10,
          adjustmentDirection: 'INCREMENT',
        }),
      ).rejects.toThrow('productId y warehouseId son requeridos');
    });

    it('should throw error for invalid quantity', async () => {
      // Act & Assert
      await expect(
        inventoryService.ajustarStock({
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: -5,
          adjustmentDirection: 'INCREMENT',
        }),
      ).rejects.toThrow('cantidadAjuste debe ser > 0');
    });
  });

  describe('createAjuste', () => {
    const mockProduct = {
      id: 'prod-1',
      codigo: 'PROD001',
      nombre: 'Producto 1',
      trackInventory: true,
      minStock: 20,
      stock: 50,
    };

    const mockExistingStock = {
      productId: 'prod-1',
      warehouseId: 'wh-1',
      quantity: 50,
      minStock: 20,
      product: mockProduct,
    };

    it('should create positive adjustment', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.stockByWarehouse.findUnique.mockResolvedValue(mockExistingStock);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          stockByWarehouse: {
            upsert: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 60 } }),
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      // Act
      const result = await inventoryService.createAjuste(
        {
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: 10,
        },
        'user-1',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.stockAfter).toBe(60);
    });

    it('should create negative adjustment', async () => {
      // Arrange
      prismaMock.product.findUnique.mockResolvedValue(mockProduct);
      prismaMock.stockByWarehouse.findUnique.mockResolvedValue(mockExistingStock);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          stockByWarehouse: {
            upsert: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 45 } }),
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      // Act
      const result = await inventoryService.createAjuste(
        {
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: -5,
        },
        'user-1',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.stockAfter).toBe(45);
    });

    it('should throw error for zero adjustment', async () => {
      // Act & Assert
      await expect(
        inventoryService.createAjuste({
          productId: 'prod-1',
          warehouseId: 'wh-1',
          cantidadAjuste: 0,
        }),
      ).rejects.toThrow('Cantidad ajuste no puede ser 0');
    });
  });

  describe('applyPurchaseEntrada', () => {
    const mockWarehouse = {
      id: 'wh-1',
      nombre: 'Almacén Principal',
    };

    const mockProduct = {
      id: 'prod-1',
      codigo: 'PROD001',
      nombre: 'Producto 1',
      trackInventory: true,
      minStock: 20,
    };

    const mockMovementReason = {
      id: 'reason-1',
      codigo: 'ENT-COMPRA',
      nombre: 'Entrada por compra',
      activo: true,
    };

    it('should apply purchase entrada successfully', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      prismaMock.movementReason.findFirst.mockResolvedValue(mockMovementReason);
      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            findUnique: vi.fn().mockResolvedValue(mockProduct),
            update: vi.fn().mockResolvedValue({}),
          },
          stockByWarehouse: {
            findUnique: vi.fn().mockResolvedValue({
              quantity: 50,
              minStock: 20,
            }),
            upsert: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 60 } }),
          },
          inventoryMovement: {
            create: vi.fn().mockResolvedValue({
              id: 'mov-1',
              productId: 'prod-1',
              quantity: 10,
              stockBefore: 50,
              stockAfter: 60,
            }),
          },
        };
        return callback(tx);
      });

      // Act
      const result = await inventoryService.applyPurchaseEntrada(
        'COMP-001',
        [{ productId: 'prod-1', cantidad: 10 }],
        'wh-1',
        'user-1',
      );

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'mov-1',
        productId: 'prod-1',
        cantidad: 10,
        stockAntes: 50,
        stockDespues: 60,
      });
    });

    it('should throw error when warehouse not found', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        inventoryService.applyPurchaseEntrada(
          'COMP-001',
          [{ productId: 'prod-1', cantidad: 10 }],
          'invalid-wh',
        ),
      ).rejects.toThrow('Warehouse no encontrado');
    });

    it('should throw error for missing purchaseId', async () => {
      // Act & Assert
      await expect(
        inventoryService.applyPurchaseEntrada(
          '',
          [{ productId: 'prod-1', cantidad: 10 }],
          'wh-1',
        ),
      ).rejects.toThrow('purchaseId es requerido');
    });

    it('should throw error for empty items array', async () => {
      // Act & Assert
      await expect(
        inventoryService.applyPurchaseEntrada('COMP-001', [], 'wh-1'),
      ).rejects.toThrow('items es requerido');
    });
  });

  describe('getAlertas', () => {
    const mockStockData = [
      {
        productId: 'prod-1',
        warehouseId: 'wh-1',
        quantity: 5,
        minStock: 20,
        updatedAt: new Date('2024-01-01'),
        product: {
          codigo: 'PROD001',
          nombre: 'Producto 1',
          minStock: 20,
        },
        warehouse: {
          nombre: 'Almacén Principal',
        },
      },
      {
        productId: 'prod-2',
        warehouseId: 'wh-1',
        quantity: 15,
        minStock: 20,
        updatedAt: new Date('2024-01-01'),
        product: {
          codigo: 'PROD002',
          nombre: 'Producto 2',
          minStock: 20,
        },
        warehouse: {
          nombre: 'Almacén Principal',
        },
      },
    ];

    it('should return alerts for low stock', async () => {
      // Arrange
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(mockStockData);

      // Act
      const result = await inventoryService.getAlertas();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        productId: 'prod-1',
        codigo: 'PROD001',
        tipoAlerta: 'CRITICO',
      });
      expect(result[1]).toMatchObject({
        productId: 'prod-2',
        codigo: 'PROD002',
        tipoAlerta: 'BAJO',
      });
    });

    it('should return CRITICO alert when stock is at 50% or below', async () => {
      // Arrange
      const criticalStock = [
        {
          ...mockStockData[0],
          quantity: 5,
          minStock: 20,
        },
      ];
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(criticalStock);

      // Act
      const result = await inventoryService.getAlertas();

      // Assert
      expect(result[0].tipoAlerta).toBe('CRITICO');
    });

    it('should return BAJO alert when stock is below minimum but above 50%', async () => {
      // Arrange
      const lowStock = [
        {
          ...mockStockData[0],
          quantity: 15,
          minStock: 20,
        },
      ];
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(lowStock);

      // Act
      const result = await inventoryService.getAlertas();

      // Assert
      expect(result[0].tipoAlerta).toBe('BAJO');
    });

    it('should not return alerts for normal stock', async () => {
      // Arrange
      const normalStock = [
        {
          ...mockStockData[0],
          quantity: 50,
          minStock: 20,
        },
      ];
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(normalStock);

      // Act
      const result = await inventoryService.getAlertas();

      // Assert
      expect(result).toHaveLength(0);
    });

    it('should limit results to 100 items', async () => {
      // Arrange
      const manyAlerts = Array.from({ length: 150 }, (_, i) => ({
        ...mockStockData[0],
        productId: `prod-${i}`,
        product: {
          ...mockStockData[0].product,
          codigo: `PROD${i}`,
        },
      }));
      prismaMock.stockByWarehouse.findMany.mockResolvedValue(manyAlerts);

      // Act
      const result = await inventoryService.getAlertas();

      // Assert
      expect(result.length).toBeLessThanOrEqual(100);
    });
  });
});
