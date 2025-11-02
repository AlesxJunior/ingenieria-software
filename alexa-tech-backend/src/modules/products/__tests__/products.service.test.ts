import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import productService from '../products.service';
import { prisma } from '../../../config/database';

// Mock the database module directly in the test file
vi.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: {
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      product: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
      },
      stockByWarehouse: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
      },
    })),
  },
}));

// Cast the imported prisma instance to our mock type
const prismaMock = prisma as any;

describe('Product Service', () => {
  // Reset the mock before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a list of products from the mock', async () => {
    const mockProducts = [
      {
        id: '1',
        codigo: 'LP-001',
        nombre: 'Laptop Pro',
        descripcion: 'Powerful laptop',
        categoria: 'Electronics',
        precioVenta: new Decimal(1500.0),
        stock: 100,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: 'Warehouse A',
        usuarioCreacion: 'user1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        codigo: 'KB-002',
        nombre: 'Mechanical Keyboard',
        descripcion: 'Clicky keyboard',
        categoria: 'Peripherals',
        precioVenta: new Decimal(150.0),
        stock: 250,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: 'Warehouse B',
        usuarioCreacion: 'user1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // Setup the mock to return our fake products
    prismaMock.product.findMany.mockResolvedValue(mockProducts);

    // Call the service function
    const products = await productService.list({});

    // Assertions
    expect(products).toHaveLength(2);
    expect(products[0]!.nombre).toBe('Laptop Pro');
    expect(prismaMock.product.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { nombre: 'asc' },
    });
  });

  it('should create a new product correctly', async () => {
    const now = new Date();
    const productInput = {
      codigo: 'TS-003',
      nombre: 'Test T-Shirt',
      descripcion: 'A shirt for testing',
      categoria: 'Apparel',
      precioVenta: 25.99,
      stock: 50,
      estado: true,
      unidadMedida: 'unit',
      ubicacion: 'Closet C',
    };
    const userId = 'user-test-id';
  
    const expectedProduct = {
      id: 'product-id-3',
      ...productInput,
      precioVenta: new Decimal(productInput.precioVenta),
      descripcion: productInput.descripcion ?? null,
      ubicacion: productInput.ubicacion ?? null,
      minStock: null,
      trackInventory: true,
      usuarioCreacion: userId,
      usuarioActualizacion: null,
      createdAt: now,
      updatedAt: now,
    };
  
    // Mock the transaction to call the callback and return the expected product
    prismaMock.$transaction.mockImplementation(async (callback: any) => {
      const tx = {
        product: {
          create: vi.fn().mockResolvedValue(expectedProduct),
          update: vi.fn().mockResolvedValue(expectedProduct),
        },
        stockByWarehouse: {
          aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 50 } }),
        },
      };
      return callback(tx);
    });

    // Call the service function
    const createdProduct = await productService.create(productInput, userId);

    // Assertions
    expect(createdProduct).toEqual(expectedProduct);
  });

  it('should find a product by its code', async () => {
    const mockProduct = {
      id: '1',
      codigo: 'LP-001',
      nombre: 'Laptop Pro',
      descripcion: 'Powerful laptop',
      categoria: 'Electronics',
      precioVenta: new Decimal(1500.0),
      stock: 100,
      minStock: null,
      trackInventory: true,
      estado: true,
      unidadMedida: 'unit',
      ubicacion: 'Warehouse A',
      usuarioCreacion: 'user1',
      usuarioActualizacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.product.findUnique.mockResolvedValue(mockProduct);

    const product = await productService.findByCodigo('LP-001');

    expect(product).toEqual(mockProduct);
    expect(prismaMock.product.findUnique).toHaveBeenCalledWith({ where: { codigo: 'LP-001' } });
  });

  it('should update a product by its code', async () => {
    const updateData = {
      nombre: 'Laptop Pro X',
      precioVenta: 1600.0,
    };
    const userId = 'user-test-id';

    const expectedProduct = {
      id: '1',
      codigo: 'LP-001',
      nombre: 'Laptop Pro X',
      descripcion: 'Powerful laptop',
      categoria: 'Electronics',
      precioVenta: new Decimal(1600.0),
      stock: 100,
      minStock: null,
      trackInventory: true,
      estado: true,
      unidadMedida: 'unit',
      ubicacion: 'Warehouse A',
      usuarioCreacion: 'user1',
      usuarioActualizacion: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.product.update.mockResolvedValue(expectedProduct);

    const updatedProduct = await productService.updateByCodigo('LP-001', updateData, userId);

    expect(updatedProduct).toEqual(expectedProduct);
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { codigo: 'LP-001' },
      data: {
        ...updateData,
        precioVenta: updateData.precioVenta as any,
        usuarioActualizacion: userId,
        updatedAt: expect.any(Date),
      },
    });
  });

  it('should update a product status by its code', async () => {
    const userId = 'user-test-id';
    const expectedProduct = {
      id: '1',
      codigo: 'LP-001',
      nombre: 'Laptop Pro',
      descripcion: 'Powerful laptop',
      categoria: 'Electronics',
      precioVenta: new Decimal(1500.0),
      stock: 100,
      minStock: null,
      trackInventory: true,
      estado: false,
      unidadMedida: 'unit',
      ubicacion: 'Warehouse A',
      usuarioCreacion: 'user1',
      usuarioActualizacion: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.product.update.mockResolvedValue(expectedProduct);

    const updatedProduct = await productService.updateStatusByCodigo('LP-001', false, userId);

    expect(updatedProduct.estado).toBe(false);
    expect(prismaMock.product.update).toHaveBeenCalledWith({
      where: { codigo: 'LP-001' },
      data: {
        estado: false,
        usuarioActualizacion: userId,
        updatedAt: expect.any(Date),
      },
    });
  });

  it('should list products with filters', async () => {
    const filters = {
      categoria: 'Electronics',
      estado: true,
      minPrecio: 1000,
      maxPrecio: 2000,
      minStock: 50,
      q: 'Laptop',
    };

    await productService.list(filters);

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: {
        categoria: 'Electronics',
        estado: true,
        precioVenta: {
          gte: 1000,
          lte: 2000,
        },
        stock: {
          gte: 50,
        },
        OR: [
          { nombre: { contains: 'Laptop', mode: 'insensitive' } },
          { descripcion: { contains: 'Laptop', mode: 'insensitive' } },
          { codigo: { contains: 'Laptop', mode: 'insensitive' } },
        ],
      },
      orderBy: { nombre: 'asc' },
    });
  });

  describe('create', () => {
    it('should create a product with stock initial in warehouse', async () => {
      const productInput = {
        codigo: 'PROD-001',
        nombre: 'Test Product',
        descripcion: 'Test Description',
        categoria: 'Test Category',
        precioVenta: 100.50,
        unidadMedida: 'unit',
        stockInitial: {
          cantidad: 50,
          warehouseId: 'warehouse-1',
        },
      };
      const userId = 'user-123';
      const now = new Date();

      const expectedProduct = {
        id: 'product-1',
        codigo: 'PROD-001',
        nombre: 'Test Product',
        descripcion: 'Test Description',
        categoria: 'Test Category',
        precioVenta: new Decimal(100.50),
        stock: 50,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: userId,
        usuarioActualizacion: null,
        createdAt: now,
        updatedAt: now,
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            create: vi.fn().mockResolvedValue({ ...expectedProduct, stock: 0 }),
            update: vi.fn().mockResolvedValue(expectedProduct),
          },
          stockByWarehouse: {
            upsert: vi.fn(),
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 50 } }),
          },
        };
        return callback(tx);
      });

      const result = await productService.create(productInput, userId);

      expect(result).toEqual(expectedProduct);
      expect(result.stock).toBe(50);
    });

    it('should create a product without initial stock', async () => {
      const productInput = {
        codigo: 'PROD-002',
        nombre: 'Test Product 2',
        categoria: 'Category',
        precioVenta: 50.0,
        unidadMedida: 'kg',
      };
      const userId = 'user-123';

      const expectedProduct = {
        id: 'product-2',
        codigo: 'PROD-002',
        nombre: 'Test Product 2',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(50.0),
        stock: 0,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'kg',
        ubicacion: null,
        usuarioCreacion: userId,
        usuarioActualizacion: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            create: vi.fn().mockResolvedValue(expectedProduct),
            update: vi.fn().mockResolvedValue(expectedProduct),
          },
          stockByWarehouse: {
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
          },
        };
        return callback(tx);
      });

      const result = await productService.create(productInput, userId);

      expect(result.stock).toBe(0);
      expect(result.descripcion).toBeNull();
    });

    it('should create product with minStock when provided', async () => {
      const productInput = {
        codigo: 'PROD-003',
        nombre: 'Product With Min Stock',
        categoria: 'Category',
        precioVenta: 75.0,
        unidadMedida: 'unit',
        minStock: 10,
      };

      const expectedProduct = {
        id: 'product-3',
        ...productInput,
        precioVenta: new Decimal(75.0),
        descripcion: null,
        stock: 0,
        trackInventory: true,
        estado: true,
        ubicacion: null,
        usuarioCreacion: 'user-123',
        usuarioActualizacion: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            create: vi.fn().mockResolvedValue(expectedProduct),
            update: vi.fn().mockResolvedValue(expectedProduct),
          },
          stockByWarehouse: {
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
          },
        };
        return callback(tx);
      });

      const result = await productService.create(productInput, 'user-123');

      expect(result.minStock).toBe(10);
    });

    it('should set estado to true by default', async () => {
      const productInput = {
        codigo: 'PROD-004',
        nombre: 'Default Estado Product',
        categoria: 'Category',
        precioVenta: 25.0,
        unidadMedida: 'unit',
      };

      const expectedProduct = {
        id: 'product-4',
        ...productInput,
        precioVenta: new Decimal(25.0),
        descripcion: null,
        stock: 0,
        minStock: null,
        trackInventory: true,
        estado: true,
        ubicacion: null,
        usuarioCreacion: null,
        usuarioActualizacion: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            create: vi.fn().mockResolvedValue(expectedProduct),
            update: vi.fn().mockResolvedValue(expectedProduct),
          },
          stockByWarehouse: {
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
          },
        };
        return callback(tx);
      });

      const result = await productService.create(productInput);

      expect(result.estado).toBe(true);
    });

    it('should create product without userId', async () => {
      const productInput = {
        codigo: 'PROD-005',
        nombre: 'No User Product',
        categoria: 'Category',
        precioVenta: 30.0,
        unidadMedida: 'unit',
      };

      const expectedProduct = {
        id: 'product-5',
        ...productInput,
        precioVenta: new Decimal(30.0),
        descripcion: null,
        stock: 0,
        minStock: null,
        trackInventory: true,
        estado: true,
        ubicacion: null,
        usuarioCreacion: null,
        usuarioActualizacion: null,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      };

      prismaMock.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          product: {
            create: vi.fn().mockResolvedValue(expectedProduct),
            update: vi.fn().mockResolvedValue(expectedProduct),
          },
          stockByWarehouse: {
            aggregate: vi.fn().mockResolvedValue({ _sum: { quantity: 0 } }),
          },
        };
        return callback(tx);
      });

      const result = await productService.create(productInput);

      expect(result.usuarioCreacion).toBeNull();
    });
  });

  describe('updateByCodigo', () => {
    it('should update product name and price', async () => {
      const updateData = {
        nombre: 'Updated Name',
        precioVenta: 200.0,
      };
      const userId = 'user-123';

      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Updated Name',
        descripcion: 'Description',
        categoria: 'Category',
        precioVenta: new Decimal(200.0),
        stock: 50,
        minStock: 10,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateByCodigo('PROD-001', updateData, userId);

      expect(result.nombre).toBe('Updated Name');
      expect(result.precioVenta).toEqual(new Decimal(200.0));
      expect(result.usuarioActualizacion).toBe(userId);
    });

    it('should update product category', async () => {
      const updateData = {
        categoria: 'New Category',
      };

      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Product',
        descripcion: null,
        categoria: 'New Category',
        precioVenta: new Decimal(100.0),
        stock: 20,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateByCodigo('PROD-001', updateData);

      expect(result.categoria).toBe('New Category');
    });

    it('should update minStock', async () => {
      const updateData = {
        minStock: 25,
      };
      const userId = 'user-123';

      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Product',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50,
        minStock: 25,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateByCodigo('PROD-001', updateData, userId);

      expect(result.minStock).toBe(25);
    });

    it('should update unidadMedida', async () => {
      const updateData = {
        unidadMedida: 'kg',
      };

      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Product',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'kg',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateByCodigo('PROD-001', updateData);

      expect(result.unidadMedida).toBe('kg');
    });

    it('should not update stock directly', async () => {
      const updateData = {
        nombre: 'Updated Product',
        // No incluir stock en updateData
      };

      prismaMock.product.update.mockResolvedValue({
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Updated Product',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50, // Stock permanece sin cambios
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await productService.updateByCodigo('PROD-001', updateData);

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { codigo: 'PROD-001' },
        data: expect.not.objectContaining({ stock: expect.anything() }),
      });
    });
  });

  describe('updateStatusByCodigo', () => {
    it('should deactivate a product', async () => {
      const userId = 'user-123';

      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Product',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50,
        minStock: null,
        trackInventory: true,
        estado: false,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateStatusByCodigo('PROD-001', false, userId);

      expect(result.estado).toBe(false);
      expect(result.usuarioActualizacion).toBe(userId);
    });

    it('should activate a product', async () => {
      const userId = 'user-123';

      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Product',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50,
        minStock: null,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateStatusByCodigo('PROD-001', true, userId);

      expect(result.estado).toBe(true);
    });

    it('should update status without userId', async () => {
      const expectedProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Product',
        descripcion: null,
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50,
        minStock: null,
        trackInventory: true,
        estado: false,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.update.mockResolvedValue(expectedProduct);

      const result = await productService.updateStatusByCodigo('PROD-001', false);

      expect(result.usuarioActualizacion).toBeNull();
    });
  });

  describe('list', () => {
    it('should list all products without filters', async () => {
      const mockProducts = [
        {
          id: '1',
          codigo: 'PROD-001',
          nombre: 'Product 1',
          descripcion: null,
          categoria: 'Category A',
          precioVenta: new Decimal(100.0),
          stock: 50,
          minStock: null,
          trackInventory: true,
          estado: true,
          unidadMedida: 'unit',
          ubicacion: null,
          usuarioCreacion: 'user-1',
          usuarioActualizacion: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          codigo: 'PROD-002',
          nombre: 'Product 2',
          descripcion: null,
          categoria: 'Category B',
          precioVenta: new Decimal(200.0),
          stock: 30,
          minStock: null,
          trackInventory: true,
          estado: true,
          unidadMedida: 'unit',
          ubicacion: null,
          usuarioCreacion: 'user-1',
          usuarioActualizacion: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.product.findMany.mockResolvedValue(mockProducts);

      const result = await productService.list({});

      expect(result).toHaveLength(2);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by categoria', async () => {
      await productService.list({ categoria: 'Electronics' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { categoria: 'Electronics' },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by estado true', async () => {
      await productService.list({ estado: true });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { estado: true },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by estado false', async () => {
      await productService.list({ estado: false });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { estado: false },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by unidadMedida', async () => {
      await productService.list({ unidadMedida: 'kg' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: { unidadMedida: 'kg' },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by search query (q)', async () => {
      await productService.list({ q: 'test' });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { nombre: { contains: 'test', mode: 'insensitive' } },
            { descripcion: { contains: 'test', mode: 'insensitive' } },
            { codigo: { contains: 'test', mode: 'insensitive' } },
          ],
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by minPrecio only', async () => {
      await productService.list({ minPrecio: 50 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          precioVenta: { gte: 50 },
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by maxPrecio only', async () => {
      await productService.list({ maxPrecio: 200 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          precioVenta: { lte: 200 },
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by price range', async () => {
      await productService.list({ minPrecio: 50, maxPrecio: 200 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          precioVenta: { gte: 50, lte: 200 },
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by minStock', async () => {
      await productService.list({ minStock: 10 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          stock: { gte: 10 },
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by maxStock', async () => {
      await productService.list({ maxStock: 100 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          stock: { lte: 100 },
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should filter by stock range', async () => {
      await productService.list({ minStock: 10, maxStock: 100 });

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          stock: { gte: 10, lte: 100 },
        },
        orderBy: { nombre: 'asc' },
      });
    });

    it('should combine multiple filters', async () => {
      const filters = {
        categoria: 'Electronics',
        estado: true,
        minPrecio: 100,
        maxPrecio: 500,
        minStock: 20,
        q: 'laptop',
      };

      await productService.list(filters);

      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          categoria: 'Electronics',
          estado: true,
          precioVenta: { gte: 100, lte: 500 },
          stock: { gte: 20 },
          OR: [
            { nombre: { contains: 'laptop', mode: 'insensitive' } },
            { descripcion: { contains: 'laptop', mode: 'insensitive' } },
            { codigo: { contains: 'laptop', mode: 'insensitive' } },
          ],
        },
        orderBy: { nombre: 'asc' },
      });
    });
  });

  describe('findByCodigo', () => {
    it('should find a product by codigo', async () => {
      const mockProduct = {
        id: '1',
        codigo: 'PROD-001',
        nombre: 'Test Product',
        descripcion: 'Description',
        categoria: 'Category',
        precioVenta: new Decimal(100.0),
        stock: 50,
        minStock: 10,
        trackInventory: true,
        estado: true,
        unidadMedida: 'unit',
        ubicacion: null,
        usuarioCreacion: 'user-1',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.findUnique.mockResolvedValue(mockProduct);

      const result = await productService.findByCodigo('PROD-001');

      expect(result).toEqual(mockProduct);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'PROD-001' },
      });
    });

    it('should return null if product not found', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      const result = await productService.findByCodigo('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });
});

