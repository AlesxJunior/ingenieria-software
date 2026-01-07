import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WarehousesService } from '../warehouses.service';
import { prisma } from '../../../config/database';

// Mock Prisma
vi.mock('../../../config/database', () => ({
  prisma: {
    warehouse: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const prismaMock = prisma as any;

describe('WarehousesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('list', () => {
    const mockWarehouses = [
      {
        id: 'wh-1',
        codigo: 'ALM001',
        nombre: 'Almacén Principal',
        ubicacion: 'Planta Baja',
        capacidad: 1000,
        activo: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: {
          stockByWarehouses: 50,
          inventoryMovements: 200,
        },
      },
      {
        id: 'wh-2',
        codigo: 'ALM002',
        nombre: 'Almacén Secundario',
        ubicacion: 'Primer Piso',
        capacidad: 500,
        activo: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        _count: {
          stockByWarehouses: 30,
          inventoryMovements: 100,
        },
      },
    ];

    it('should list all warehouses without filters', async () => {
      // Arrange
      prismaMock.warehouse.findMany.mockResolvedValue(mockWarehouses);

      // Act
      const result = await WarehousesService.list();

      // Assert
      expect(prismaMock.warehouse.findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { nombre: 'asc' },
        include: {
          _count: {
            select: {
              stockByWarehouses: true,
              inventoryMovements: true,
            },
          },
        },
      });
      expect(result).toEqual({
        rows: mockWarehouses,
        total: 2,
      });
    });

    it('should filter warehouses by activo=true', async () => {
      // Arrange
      prismaMock.warehouse.findMany.mockResolvedValue([mockWarehouses[0]]);

      // Act
      const result = await WarehousesService.list({ activo: true });

      // Assert
      expect(prismaMock.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { activo: true },
        }),
      );
      expect(result.total).toBe(1);
    });

    it('should filter warehouses by activo=false', async () => {
      // Arrange
      const inactiveWarehouse = { ...mockWarehouses[0], activo: false };
      prismaMock.warehouse.findMany.mockResolvedValue([inactiveWarehouse]);

      // Act
      const result = await WarehousesService.list({ activo: false });

      // Assert
      expect(prismaMock.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { activo: false },
        }),
      );
      expect(result.rows[0]?.activo).toBe(false);
    });

    it('should search warehouses by query string (nombre or codigo)', async () => {
      // Arrange
      prismaMock.warehouse.findMany.mockResolvedValue([mockWarehouses[0]]);

      // Act
      const result = await WarehousesService.list({ q: 'Principal' });

      // Assert
      expect(prismaMock.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { nombre: { contains: 'Principal', mode: 'insensitive' } },
              { codigo: { contains: 'Principal', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should combine activo filter and search query', async () => {
      // Arrange
      prismaMock.warehouse.findMany.mockResolvedValue([mockWarehouses[0]]);

      // Act
      const result = await WarehousesService.list({ activo: true, q: 'ALM001' });

      // Assert
      expect(prismaMock.warehouse.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            activo: true,
            OR: [
              { nombre: { contains: 'ALM001', mode: 'insensitive' } },
              { codigo: { contains: 'ALM001', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should return empty array when no warehouses found', async () => {
      // Arrange
      prismaMock.warehouse.findMany.mockResolvedValue([]);

      // Act
      const result = await WarehousesService.list();

      // Assert
      expect(result).toEqual({
        rows: [],
        total: 0,
      });
    });
  });

  describe('getById', () => {
    const mockWarehouse = {
      id: 'wh-1',
      codigo: 'ALM001',
      nombre: 'Almacén Principal',
      ubicacion: 'Planta Baja',
      capacidad: 1000,
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: {
        stockByWarehouses: 50,
        inventoryMovements: 200,
      },
    };

    it('should get warehouse by id successfully', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockWarehouse);

      // Act
      const result = await WarehousesService.getById('wh-1');

      // Assert
      expect(prismaMock.warehouse.findUnique).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        include: {
          _count: {
            select: {
              stockByWarehouses: true,
              inventoryMovements: true,
            },
          },
        },
      });
      expect(result).toEqual(mockWarehouse);
    });

    it('should throw error when warehouse not found', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(WarehousesService.getById('invalid-id')).rejects.toThrow(
        'Almacén no encontrado',
      );
    });
  });

  describe('create', () => {
    const mockNewWarehouse = {
      id: 'wh-new',
      codigo: 'ALM003',
      nombre: 'Nuevo Almacén',
      ubicacion: 'Segundo Piso',
      capacidad: 750,
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create warehouse successfully', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);
      prismaMock.warehouse.create.mockResolvedValue(mockNewWarehouse);

      // Act
      const result = await WarehousesService.create({
        codigo: 'alm003',
        nombre: 'Nuevo Almacén',
        ubicacion: 'Segundo Piso',
        capacidad: 750,
      });

      // Assert
      expect(prismaMock.warehouse.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'ALM003' },
      });
      expect(prismaMock.warehouse.create).toHaveBeenCalledWith({
        data: {
          codigo: 'ALM003',
          nombre: 'Nuevo Almacén',
          ubicacion: 'Segundo Piso',
          capacidad: 750,
        },
      });
      expect(result).toEqual(mockNewWarehouse);
    });

    it('should create warehouse without optional fields', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);
      prismaMock.warehouse.create.mockResolvedValue({
        ...mockNewWarehouse,
        ubicacion: null,
        capacidad: null,
      });

      // Act
      const result = await WarehousesService.create({
        codigo: 'ALM003',
        nombre: 'Nuevo Almacén',
      });

      // Assert
      expect(prismaMock.warehouse.create).toHaveBeenCalledWith({
        data: {
          codigo: 'ALM003',
          nombre: 'Nuevo Almacén',
          ubicacion: null,
          capacidad: null,
        },
      });
      expect(result.ubicacion).toBeNull();
      expect(result.capacidad).toBeNull();
    });

    it('should throw error when codigo is missing', async () => {
      // Act & Assert
      await expect(
        WarehousesService.create({
          codigo: '',
          nombre: 'Nuevo Almacén',
        }),
      ).rejects.toThrow('El código y nombre son requeridos');
    });

    it('should throw error when nombre is missing', async () => {
      // Act & Assert
      await expect(
        WarehousesService.create({
          codigo: 'ALM003',
          nombre: '',
        }),
      ).rejects.toThrow('El código y nombre son requeridos');
    });

    it('should throw error when codigo already exists', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue({
        id: 'wh-1',
        codigo: 'ALM001',
        nombre: 'Almacén Existente',
      });

      // Act & Assert
      await expect(
        WarehousesService.create({
          codigo: 'ALM001',
          nombre: 'Nuevo Almacén',
        }),
      ).rejects.toThrow('Ya existe un almacén con ese código');
      expect(prismaMock.warehouse.create).not.toHaveBeenCalled();
    });

    it('should convert codigo to uppercase', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);
      prismaMock.warehouse.create.mockResolvedValue(mockNewWarehouse);

      // Act
      await WarehousesService.create({
        codigo: 'alm003',
        nombre: 'Nuevo Almacén',
      });

      // Assert
      expect(prismaMock.warehouse.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            codigo: 'ALM003',
          }),
        }),
      );
    });
  });

  describe('update', () => {
    const mockExistingWarehouse = {
      id: 'wh-1',
      codigo: 'ALM001',
      nombre: 'Almacén Principal',
      ubicacion: 'Planta Baja',
      capacidad: 1000,
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    it('should update warehouse successfully', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockExistingWarehouse);
      prismaMock.warehouse.update.mockResolvedValue({
        ...mockExistingWarehouse,
        nombre: 'Almacén Principal Actualizado',
        ubicacion: 'Nueva Ubicación',
        capacidad: 1500,
      });

      // Act
      const result = await WarehousesService.update('wh-1', {
        nombre: 'Almacén Principal Actualizado',
        ubicacion: 'Nueva Ubicación',
        capacidad: 1500,
      });

      // Assert
      expect(prismaMock.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: {
          nombre: 'Almacén Principal Actualizado',
          ubicacion: 'Nueva Ubicación',
          capacidad: 1500,
        },
      });
      expect(result.nombre).toBe('Almacén Principal Actualizado');
    });

    it('should update only specified fields', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockExistingWarehouse);
      prismaMock.warehouse.update.mockResolvedValue({
        ...mockExistingWarehouse,
        nombre: 'Nuevo Nombre',
      });

      // Act
      const result = await WarehousesService.update('wh-1', {
        nombre: 'Nuevo Nombre',
      });

      // Assert
      expect(prismaMock.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: {
          nombre: 'Nuevo Nombre',
        },
      });
    });

    it('should update activo status', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockExistingWarehouse);
      prismaMock.warehouse.update.mockResolvedValue({
        ...mockExistingWarehouse,
        activo: false,
      });

      // Act
      const result = await WarehousesService.update('wh-1', {
        activo: false,
      });

      // Assert
      expect(prismaMock.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: {
          activo: false,
        },
      });
      expect(result.activo).toBe(false);
    });

    it('should update codigo and convert to uppercase', async () => {
      // Arrange
      prismaMock.warehouse.findUnique
        .mockResolvedValueOnce(mockExistingWarehouse)
        .mockResolvedValueOnce(null);
      prismaMock.warehouse.update.mockResolvedValue({
        ...mockExistingWarehouse,
        codigo: 'ALM999',
      });

      // Act
      const result = await WarehousesService.update('wh-1', {
        codigo: 'alm999',
      });

      // Assert
      expect(prismaMock.warehouse.findUnique).toHaveBeenCalledTimes(2);
      expect(prismaMock.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: {
          codigo: 'ALM999',
        },
      });
      expect(result.codigo).toBe('ALM999');
    });

    it('should throw error when warehouse not found', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        WarehousesService.update('invalid-id', {
          nombre: 'Nuevo Nombre',
        }),
      ).rejects.toThrow('Almacén no encontrado');
      expect(prismaMock.warehouse.update).not.toHaveBeenCalled();
    });

    it('should throw error when updating to existing codigo', async () => {
      // Arrange
      prismaMock.warehouse.findUnique
        .mockResolvedValueOnce(mockExistingWarehouse)
        .mockResolvedValueOnce({
          id: 'wh-2',
          codigo: 'ALM002',
          nombre: 'Otro Almacén',
        });

      // Act & Assert
      await expect(
        WarehousesService.update('wh-1', {
          codigo: 'ALM002',
        }),
      ).rejects.toThrow('Ya existe un almacén con ese código');
      expect(prismaMock.warehouse.update).not.toHaveBeenCalled();
    });

    it('should clear optional fields when set to null', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockExistingWarehouse);
      prismaMock.warehouse.update.mockResolvedValue({
        ...mockExistingWarehouse,
        ubicacion: null,
        capacidad: null,
      });

      // Act
      const result = await WarehousesService.update('wh-1', {
        ubicacion: null,
        capacidad: null,
      });

      // Assert
      expect(prismaMock.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: {
          ubicacion: null,
          capacidad: null,
        },
      });
      expect(result.ubicacion).toBeNull();
      expect(result.capacidad).toBeNull();
    });
  });

  describe('delete', () => {
    const mockWarehouse = {
      id: 'wh-1',
      codigo: 'ALM001',
      nombre: 'Almacén Principal',
      ubicacion: 'Planta Baja',
      capacidad: 1000,
      activo: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      _count: {
        stockByWarehouses: 0,
      },
    };

    it('should delete (deactivate) warehouse successfully', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(mockWarehouse);
      prismaMock.warehouse.update.mockResolvedValue({
        ...mockWarehouse,
        activo: false,
      });

      // Act
      const result = await WarehousesService.delete('wh-1');

      // Assert
      expect(prismaMock.warehouse.findUnique).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        include: {
          _count: {
            select: { stockByWarehouses: true },
          },
        },
      });
      expect(prismaMock.warehouse.update).toHaveBeenCalledWith({
        where: { id: 'wh-1' },
        data: { activo: false },
      });
      expect(result.activo).toBe(false);
    });

    it('should throw error when warehouse not found', async () => {
      // Arrange
      prismaMock.warehouse.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(WarehousesService.delete('invalid-id')).rejects.toThrow(
        'Almacén no encontrado',
      );
      expect(prismaMock.warehouse.update).not.toHaveBeenCalled();
    });

    it('should throw error when warehouse has stock', async () => {
      // Arrange
      const warehouseWithStock = {
        ...mockWarehouse,
        _count: {
          stockByWarehouses: 50,
        },
      };
      prismaMock.warehouse.findUnique.mockResolvedValue(warehouseWithStock);

      // Act & Assert
      await expect(WarehousesService.delete('wh-1')).rejects.toThrow(
        'No se puede eliminar un almacén con stock. Desactívelo en su lugar.',
      );
      expect(prismaMock.warehouse.update).not.toHaveBeenCalled();
    });
  });
});
