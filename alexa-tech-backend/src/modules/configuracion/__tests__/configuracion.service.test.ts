import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { configuracionService } from '../configuracion.service';
import { prisma } from '../../../config/database';

// Mock the database module
vi.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: {
    productCategory: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    unitOfMeasure: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    product: {
      count: vi.fn(),
    },
  },
}));

const prismaMock = prisma as any;

describe('Configuracion Service - Product Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          codigo: 'ABR',
          nombre: 'Abarrotes',
          descripcion: 'Productos de abarrotes',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          codigo: 'BEB',
          nombre: 'Bebidas',
          descripcion: 'Bebidas',
          activo: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.productCategory.findMany.mockResolvedValue(mockCategories);

      const result = await configuracionService.getAllCategories();

      expect(result).toEqual(mockCategories);
      expect(prismaMock.productCategory.findMany).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
      });
    });

    it('should return empty array when no categories exist', async () => {
      prismaMock.productCategory.findMany.mockResolvedValue([]);

      const result = await configuracionService.getAllCategories();

      expect(result).toEqual([]);
    });
  });

  describe('getActiveCategories', () => {
    it('should return only active categories', async () => {
      const mockActiveCategories = [
        {
          id: '1',
          codigo: 'ABR',
          nombre: 'Abarrotes',
          descripcion: 'Productos de abarrotes',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.productCategory.findMany.mockResolvedValue(mockActiveCategories);

      const result = await configuracionService.getActiveCategories();

      expect(result).toEqual(mockActiveCategories);
      expect(prismaMock.productCategory.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      });
    });
  });

  describe('getCategoryById', () => {
    it('should return a category by id', async () => {
      const mockCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: 'Productos de abarrotes',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await configuracionService.getCategoryById('1');

      expect(result).toEqual(mockCategory);
      expect(prismaMock.productCategory.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when category does not exist', async () => {
      prismaMock.productCategory.findUnique.mockResolvedValue(null);

      const result = await configuracionService.getCategoryById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getCategoryByCodigo', () => {
    it('should return a category by codigo', async () => {
      const mockCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: 'Productos de abarrotes',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(mockCategory);

      const result = await configuracionService.getCategoryByCodigo('ABR');

      expect(result).toEqual(mockCategory);
      expect(prismaMock.productCategory.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'ABR' },
      });
    });

    it('should return null when codigo does not exist', async () => {
      prismaMock.productCategory.findUnique.mockResolvedValue(null);

      const result = await configuracionService.getCategoryByCodigo('XXX');

      expect(result).toBeNull();
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', async () => {
      const input = {
        codigo: 'TEC',
        nombre: 'Tecnología',
        descripcion: 'Productos electrónicos',
      };

      const mockCreated = {
        id: '3',
        ...input,
        activo: true,
        createdBy: 'user123',
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(null); // No existe
      prismaMock.productCategory.create.mockResolvedValue(mockCreated);

      const result = await configuracionService.createCategory(input, 'user123');

      expect(result).toEqual(mockCreated);
      expect(prismaMock.productCategory.create).toHaveBeenCalledWith({
        data: {
          codigo: 'TEC',
          nombre: 'Tecnología',
          descripcion: 'Productos electrónicos',
          activo: true,
          createdBy: 'user123',
        },
      });
    });

    it('should throw error when codigo already exists', async () => {
      const input = {
        codigo: 'ABR',
        nombre: 'Abarrotes Nuevo',
      };

      const existingCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(existingCategory);

      await expect(
        configuracionService.createCategory(input)
      ).rejects.toThrow('Ya existe una categoría con el código ABR');

      expect(prismaMock.productCategory.create).not.toHaveBeenCalled();
    });

    it('should throw error when nombre already exists', async () => {
      const input = {
        codigo: 'ABR2',
        nombre: 'Abarrotes',
      };

      prismaMock.productCategory.findUnique
        .mockResolvedValueOnce(null) // No existe por código
        .mockResolvedValueOnce({
          // Existe por nombre
          id: '1',
          codigo: 'ABR',
          nombre: 'Abarrotes',
          descripcion: null,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await expect(
        configuracionService.createCategory(input)
      ).rejects.toThrow('Ya existe una categoría con el nombre Abarrotes');

      expect(prismaMock.productCategory.create).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      const updateData = {
        nombre: 'Abarrotes Actualizados',
        descripcion: 'Nueva descripción',
      };

      const existingCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: 'Vieja descripción',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedCategory = {
        ...existingCategory,
        ...updateData,
        updatedBy: 'user123',
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(existingCategory);
      prismaMock.productCategory.update.mockResolvedValue(updatedCategory);

      const result = await configuracionService.updateCategory('1', updateData, 'user123');

      expect(result).toEqual(updatedCategory);
      expect(prismaMock.productCategory.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          nombre: 'Abarrotes Actualizados',
          descripcion: 'Nueva descripción',
          updatedBy: 'user123',
        },
      });
    });

    it('should throw error when updating codigo to existing one', async () => {
      const updateData = {
        codigo: 'BEB',
      };

      const conflictCategory = {
        id: '2',
        codigo: 'BEB',
        nombre: 'Bebidas',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock: findUnique por código devuelve la categoría en conflicto
      prismaMock.productCategory.findUnique.mockResolvedValue(conflictCategory);

      await expect(
        configuracionService.updateCategory('1', updateData)
      ).rejects.toThrow('Ya existe otra categoría con el código BEB');

      expect(prismaMock.productCategory.update).not.toHaveBeenCalled();
    });

    it('should throw error when updating nombre to existing one', async () => {
      const updateData = {
        nombre: 'Bebidas',
      };

      const conflictCategory = {
        id: '2',
        codigo: 'BEB',
        nombre: 'Bebidas',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock: findUnique por nombre devuelve la categoría en conflicto
      prismaMock.productCategory.findUnique.mockResolvedValue(conflictCategory);

      await expect(
        configuracionService.updateCategory('1', updateData)
      ).rejects.toThrow('Ya existe otra categoría con el nombre Bebidas');

      expect(prismaMock.productCategory.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory (soft delete)', () => {
    it('should soft delete a category successfully', async () => {
      const existingCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const deletedCategory = {
        ...existingCategory,
        activo: false,
        updatedBy: 'user123',
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValueOnce(existingCategory);
      prismaMock.productCategory.update.mockResolvedValueOnce(deletedCategory);

      const result = await configuracionService.deleteCategory('1', 'user123');

      expect(result).toEqual(deletedCategory);
      expect(prismaMock.productCategory.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          activo: false,
          updatedBy: 'user123',
        },
      });
    });

    it('should throw error when category does not exist', async () => {
      prismaMock.productCategory.findUnique.mockResolvedValue(null);

      await expect(
        configuracionService.deleteCategory('non-existent')
      ).rejects.toThrow('Categoría no encontrada');

      expect(prismaMock.productCategory.update).not.toHaveBeenCalled();
    });
  });

  describe('hardDeleteCategory', () => {
    it('should hard delete a category when no products reference it', async () => {
      const existingCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(existingCategory);
      prismaMock.product.count.mockResolvedValue(0); // No hay productos
      prismaMock.productCategory.delete.mockResolvedValue(existingCategory);

      const result = await configuracionService.hardDeleteCategory('1');

      expect(result).toBeUndefined(); // void return
      expect(prismaMock.product.count).toHaveBeenCalledWith({
        where: { categoriaId: '1' },
      });
      expect(prismaMock.productCategory.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw error when products reference the category', async () => {
      const existingCategory = {
        id: '1',
        codigo: 'ABR',
        nombre: 'Abarrotes',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.productCategory.findUnique.mockResolvedValue(existingCategory);
      prismaMock.product.count.mockResolvedValue(5); // 5 productos

      await expect(
        configuracionService.hardDeleteCategory('1')
      ).rejects.toThrow('No se puede eliminar la categoría porque tiene 5 productos asociados');

      expect(prismaMock.productCategory.delete).not.toHaveBeenCalled();
    });

    it('should throw error when category does not exist', async () => {
      prismaMock.productCategory.findUnique.mockResolvedValue(null);

      await expect(
        configuracionService.hardDeleteCategory('non-existent')
      ).rejects.toThrow('Categoría no encontrada');

      expect(prismaMock.product.count).not.toHaveBeenCalled();
    });
  });
});

describe('Configuracion Service - Units of Measure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAllUnits', () => {
    it('should return all units', async () => {
      const mockUnits = [
        {
          id: '1',
          codigo: 'KG',
          nombre: 'Kilogramo',
          simbolo: 'kg',
          descripcion: 'Kilogramo',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          codigo: 'LT',
          nombre: 'Litro',
          simbolo: 'lt',
          descripcion: 'Litro',
          activo: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.unitOfMeasure.findMany.mockResolvedValue(mockUnits);

      const result = await configuracionService.getAllUnits();

      expect(result).toEqual(mockUnits);
      expect(prismaMock.unitOfMeasure.findMany).toHaveBeenCalledWith({
        orderBy: { nombre: 'asc' },
      });
    });

    it('should return empty array when no units exist', async () => {
      prismaMock.unitOfMeasure.findMany.mockResolvedValue([]);

      const result = await configuracionService.getAllUnits();

      expect(result).toEqual([]);
    });
  });

  describe('getActiveUnits', () => {
    it('should return only active units', async () => {
      const mockActiveUnits = [
        {
          id: '1',
          codigo: 'KG',
          nombre: 'Kilogramo',
          simbolo: 'kg',
          descripcion: 'Kilogramo',
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.unitOfMeasure.findMany.mockResolvedValue(mockActiveUnits);

      const result = await configuracionService.getActiveUnits();

      expect(result).toEqual(mockActiveUnits);
      expect(prismaMock.unitOfMeasure.findMany).toHaveBeenCalledWith({
        where: { activo: true },
        orderBy: { nombre: 'asc' },
      });
    });
  });

  describe('getUnitById', () => {
    it('should return a unit by id', async () => {
      const mockUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: 'Kilogramo',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(mockUnit);

      const result = await configuracionService.getUnitById('1');

      expect(result).toEqual(mockUnit);
      expect(prismaMock.unitOfMeasure.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null when unit does not exist', async () => {
      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(null);

      const result = await configuracionService.getUnitById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getUnitByCodigo', () => {
    it('should return a unit by codigo', async () => {
      const mockUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: 'Kilogramo',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(mockUnit);

      const result = await configuracionService.getUnitByCodigo('KG');

      expect(result).toEqual(mockUnit);
      expect(prismaMock.unitOfMeasure.findUnique).toHaveBeenCalledWith({
        where: { codigo: 'KG' },
      });
    });

    it('should return null when codigo does not exist', async () => {
      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(null);

      const result = await configuracionService.getUnitByCodigo('XXX');

      expect(result).toBeNull();
    });
  });

  describe('createUnit', () => {
    it('should create a new unit successfully', async () => {
      const input = {
        codigo: 'GR',
        nombre: 'Gramo',
        simbolo: 'g',
        descripcion: 'Unidad de masa',
      };

      const mockCreated = {
        id: '3',
        ...input,
        activo: true,
        createdBy: 'user123',
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(null); // No existe
      prismaMock.unitOfMeasure.create.mockResolvedValue(mockCreated);

      const result = await configuracionService.createUnit(input, 'user123');

      expect(result).toEqual(mockCreated);
      expect(prismaMock.unitOfMeasure.create).toHaveBeenCalledWith({
        data: {
          codigo: 'GR',
          nombre: 'Gramo',
          simbolo: 'g',
          descripcion: 'Unidad de masa',
          activo: true,
          createdBy: 'user123',
        },
      });
    });

    it('should throw error when codigo already exists', async () => {
      const input = {
        codigo: 'KG',
        nombre: 'Kilogramo Nuevo',
      };

      const existingUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(existingUnit);

      await expect(
        configuracionService.createUnit(input)
      ).rejects.toThrow('Ya existe una unidad de medida con el código KG');

      expect(prismaMock.unitOfMeasure.create).not.toHaveBeenCalled();
    });

    it('should throw error when nombre already exists', async () => {
      const input = {
        codigo: 'KG2',
        nombre: 'Kilogramo',
      };

      prismaMock.unitOfMeasure.findUnique
        .mockResolvedValueOnce(null) // No existe por código
        .mockResolvedValueOnce({
          // Existe por nombre
          id: '1',
          codigo: 'KG',
          nombre: 'Kilogramo',
          simbolo: 'kg',
          descripcion: null,
          activo: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      await expect(
        configuracionService.createUnit(input)
      ).rejects.toThrow('Ya existe una unidad de medida con el nombre Kilogramo');

      expect(prismaMock.unitOfMeasure.create).not.toHaveBeenCalled();
    });

    it('should create unit without simbolo', async () => {
      const input = {
        codigo: 'UNI',
        nombre: 'Unidad',
      };

      const mockCreated = {
        id: '4',
        ...input,
        simbolo: null,
        descripcion: null,
        activo: true,
        createdBy: null,
        updatedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(null);
      prismaMock.unitOfMeasure.create.mockResolvedValue(mockCreated);

      const result = await configuracionService.createUnit(input);

      expect(result).toEqual(mockCreated);
      expect(prismaMock.unitOfMeasure.create).toHaveBeenCalledWith({
        data: {
          codigo: 'UNI',
          nombre: 'Unidad',
          activo: true,
          createdBy: undefined,
        },
      });
    });
  });

  describe('updateUnit', () => {
    it('should update a unit successfully', async () => {
      const updateData = {
        nombre: 'Kilogramo Actualizado',
        simbolo: 'kgs',
        descripcion: 'Nueva descripción',
      };

      const existingUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: 'Vieja descripción',
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUnit = {
        ...existingUnit,
        ...updateData,
        updatedBy: 'user123',
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(existingUnit);
      prismaMock.unitOfMeasure.update.mockResolvedValue(updatedUnit);

      const result = await configuracionService.updateUnit('1', updateData, 'user123');

      expect(result).toEqual(updatedUnit);
      expect(prismaMock.unitOfMeasure.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          nombre: 'Kilogramo Actualizado',
          simbolo: 'kgs',
          descripcion: 'Nueva descripción',
          updatedBy: 'user123',
        },
      });
    });

    it('should throw error when updating codigo to existing one', async () => {
      const updateData = {
        codigo: 'LT',
      };

      const conflictUnit = {
        id: '2',
        codigo: 'LT',
        nombre: 'Litro',
        simbolo: 'lt',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock: findUnique por código devuelve la unidad en conflicto
      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(conflictUnit);

      await expect(
        configuracionService.updateUnit('1', updateData)
      ).rejects.toThrow('Ya existe otra unidad de medida con el código LT');

      expect(prismaMock.unitOfMeasure.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteUnit (soft delete)', () => {
    it('should soft delete a unit successfully', async () => {
      const existingUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const deletedUnit = {
        ...existingUnit,
        activo: false,
        updatedBy: 'user123',
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(existingUnit);
      prismaMock.unitOfMeasure.update.mockResolvedValue(deletedUnit);

      const result = await configuracionService.deleteUnit('1', 'user123');

      expect(result).toEqual(deletedUnit);
      expect(prismaMock.unitOfMeasure.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          activo: false,
          updatedBy: 'user123',
        },
      });
    });

    it('should throw error when unit does not exist', async () => {
      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(null);

      await expect(
        configuracionService.deleteUnit('non-existent')
      ).rejects.toThrow('Unidad de medida no encontrada');

      expect(prismaMock.unitOfMeasure.update).not.toHaveBeenCalled();
    });
  });

  describe('hardDeleteUnit', () => {
    it('should hard delete a unit when no products reference it', async () => {
      const existingUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(existingUnit);
      prismaMock.product.count.mockResolvedValue(0); // No hay productos
      prismaMock.unitOfMeasure.delete.mockResolvedValue(existingUnit);

      const result = await configuracionService.hardDeleteUnit('1');

      expect(result).toBeUndefined(); // void return
      expect(prismaMock.product.count).toHaveBeenCalledWith({
        where: { unidadMedidaId: '1' },
      });
      expect(prismaMock.unitOfMeasure.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw error when products reference the unit', async () => {
      const existingUnit = {
        id: '1',
        codigo: 'KG',
        nombre: 'Kilogramo',
        simbolo: 'kg',
        descripcion: null,
        activo: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(existingUnit);
      prismaMock.product.count.mockResolvedValue(3); // 3 productos

      await expect(
        configuracionService.hardDeleteUnit('1')
      ).rejects.toThrow('No se puede eliminar la unidad de medida porque tiene 3 productos asociados');

      expect(prismaMock.unitOfMeasure.delete).not.toHaveBeenCalled();
    });

    it('should throw error when unit does not exist', async () => {
      prismaMock.unitOfMeasure.findUnique.mockResolvedValue(null);

      await expect(
        configuracionService.hardDeleteUnit('non-existent')
      ).rejects.toThrow('Unidad de medida no encontrada');

      expect(prismaMock.product.count).not.toHaveBeenCalled();
    });
  });
});
