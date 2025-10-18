import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { Decimal } from '@prisma/client/runtime/library';
import productService from './productService';
import { prisma } from '../config/database';

// Mock the database module directly in the test file
jest.mock('../config/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

// Cast the imported prisma instance to our mock type
const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe('Product Service', () => {
  // Reset the mock before each test
  beforeEach(() => {
    mockReset(prismaMock);
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
      usuarioCreacion: userId,
      usuarioActualizacion: null,
      createdAt: now,
      updatedAt: now,
    };

    // Setup the mock to return the expected product
    prismaMock.product.create.mockResolvedValue(expectedProduct);

    // Call the service function
    const createdProduct = await productService.create(productInput, userId);

    // Assertions
    expect(createdProduct).toEqual(expectedProduct);
    expect(prismaMock.product.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.product.create).toHaveBeenCalledWith({
      data: {
        ...productInput,
        precioVenta: productInput.precioVenta as any,
        descripcion: productInput.descripcion ?? null,
        ubicacion: productInput.ubicacion ?? null,
        usuarioCreacion: userId,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });
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
});
