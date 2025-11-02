import { prisma } from '../../config/database';

export interface WarehouseFilters {
  activo?: boolean;
  q?: string;
}

export interface CreateWarehouseData {
  codigo: string;
  nombre: string;
  ubicacion?: string | null;
  capacidad?: number | null;
}

export interface UpdateWarehouseData {
  codigo?: string;
  nombre?: string;
  ubicacion?: string | null;
  capacidad?: number | null;
  activo?: boolean;
}

export const WarehousesService = {
  /**
   * Listar todos los almacenes con filtros opcionales
   */
  async list(filters: WarehouseFilters = {}) {
    const where: any = {};

    // Filtrar por estado activo/inactivo
    if (filters.activo !== undefined) {
      where.activo = filters.activo;
    }

    // Búsqueda por nombre o código
    if (filters.q) {
      where.OR = [
        { nombre: { contains: filters.q, mode: 'insensitive' } },
        { codigo: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    const warehouses = await prisma.warehouse.findMany({
      where,
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

    return {
      rows: warehouses,
      total: warehouses.length,
    };
  },

  /**
   * Obtener un almacén por ID
   */
  async getById(id: string) {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stockByWarehouses: true,
            inventoryMovements: true,
          },
        },
      },
    });

    if (!warehouse) {
      throw new Error('Almacén no encontrado');
    }

    return warehouse;
  },

  /**
   * Crear nuevo almacén
   */
  async create(data: CreateWarehouseData) {
    // Validaciones
    if (!data.codigo || !data.nombre) {
      throw new Error('El código y nombre son requeridos');
    }

    // Verificar si ya existe el código
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { codigo: data.codigo.toUpperCase() },
    });

    if (existingWarehouse) {
      throw new Error('Ya existe un almacén con ese código');
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        codigo: data.codigo.toUpperCase(),
        nombre: data.nombre,
        ubicacion: data.ubicacion || null,
        capacidad: data.capacidad || null,
      },
    });

    return warehouse;
  },

  /**
   * Actualizar almacén existente
   */
  async update(id: string, data: UpdateWarehouseData) {
    // Verificar que existe
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      throw new Error('Almacén no encontrado');
    }

    // Si cambia el código, verificar que no exista otro con ese código
    if (data.codigo && data.codigo.toUpperCase() !== existingWarehouse.codigo) {
      const duplicateWarehouse = await prisma.warehouse.findUnique({
        where: { codigo: data.codigo.toUpperCase() },
      });

      if (duplicateWarehouse) {
        throw new Error('Ya existe un almacén con ese código');
      }
    }

    // Construir datos de actualización
    const updateData: any = {};
    if (data.codigo) updateData.codigo = data.codigo.toUpperCase();
    if (data.nombre) updateData.nombre = data.nombre;
    if (data.ubicacion !== undefined)
      updateData.ubicacion = data.ubicacion || null;
    if (data.capacidad !== undefined)
      updateData.capacidad = data.capacidad || null;
    if (data.activo !== undefined) updateData.activo = data.activo;

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: updateData,
    });

    return warehouse;
  },

  /**
   * Eliminar (desactivar) almacén
   */
  async delete(id: string) {
    // Verificar que existe
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stockByWarehouses: true },
        },
      },
    });

    if (!existingWarehouse) {
      throw new Error('Almacén no encontrado');
    }

    // No permitir eliminar si tiene stock
    if (existingWarehouse._count.stockByWarehouses > 0) {
      throw new Error(
        'No se puede eliminar un almacén con stock. Desactívelo en su lugar.',
      );
    }

    // Soft delete - solo desactivar
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { activo: false },
    });

    return warehouse;
  },
};

export default WarehousesService;
