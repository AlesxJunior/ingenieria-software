import { Response } from 'express';
import { prisma } from '../../config/database';
import { ResponseHelper } from '../../utils/response';
import { AuthenticatedRequest } from '../../types';
import { asyncHandler } from '../../middleware/errorHandler';

export const WarehouseController = {
  // GET /almacenes - Listar todos los almacenes
  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { activo, q } = req.query;

    const where: any = {};
    
    // Filtrar por estado activo/inactivo
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Búsqueda por nombre o código
    if (q) {
      where.OR = [
        { nombre: { contains: String(q), mode: 'insensitive' } },
        { codigo: { contains: String(q), mode: 'insensitive' } },
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
          }
        }
      }
    });

    return ResponseHelper.success(
      res,
      { rows: warehouses, total: warehouses.length },
      'Almacenes obtenidos correctamente',
    );
  }),

  // GET /almacenes/:id - Obtener un almacén por ID
  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const warehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stockByWarehouses: true,
            inventoryMovements: true,
          }
        }
      }
    });

    if (!warehouse) {
      return ResponseHelper.error(res, 'Almacén no encontrado', 404);
    }

    return ResponseHelper.success(res, warehouse, 'Almacén obtenido');
  }),

  // POST /almacenes - Crear nuevo almacén
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { codigo, nombre, ubicacion, capacidad } = req.body;

    // Validaciones
    if (!codigo || !nombre) {
      return ResponseHelper.validationError(res, [
        { field: 'codigo', message: 'El código es requerido' },
        { field: 'nombre', message: 'El nombre es requerido' },
      ]);
    }

    // Verificar si ya existe el código
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { codigo },
    });

    if (existingWarehouse) {
      return ResponseHelper.error(
        res,
        'Ya existe un almacén con ese código',
        400,
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        codigo: codigo.toUpperCase(),
        nombre,
        ubicacion: ubicacion || null,
        capacidad: capacidad ? parseInt(capacidad) : null,
      },
    });

    return ResponseHelper.success(
      res,
      warehouse,
      'Almacén creado exitosamente',
      201,
    );
  }),

  // PUT /almacenes/:id - Actualizar almacén
  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { codigo, nombre, ubicacion, capacidad, activo } = req.body;

    // Verificar que existe
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
    });

    if (!existingWarehouse) {
      return ResponseHelper.error(res, 'Almacén no encontrado', 404);
    }

    // Si cambia el código, verificar que no exista otro con ese código
    if (codigo && codigo !== existingWarehouse.codigo) {
      const duplicateWarehouse = await prisma.warehouse.findUnique({
        where: { codigo },
      });

      if (duplicateWarehouse) {
        return ResponseHelper.error(
          res,
          'Ya existe un almacén con ese código',
          400,
        );
      }
    }

    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(codigo && { codigo: codigo.toUpperCase() }),
        ...(nombre && { nombre }),
        ...(ubicacion !== undefined && { ubicacion: ubicacion || null }),
        ...(capacidad !== undefined && { capacidad: capacidad ? parseInt(capacidad) : null }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
      },
    });

    return ResponseHelper.success(
      res,
      warehouse,
      'Almacén actualizado exitosamente',
    );
  }),

  // DELETE /almacenes/:id - Eliminar (desactivar) almacén
  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Verificar que existe
    const existingWarehouse = await prisma.warehouse.findUnique({
      where: { id },
      include: {
        _count: {
          select: { stockByWarehouses: true }
        }
      }
    });

    if (!existingWarehouse) {
      return ResponseHelper.error(res, 'Almacén no encontrado', 404);
    }

    // No permitir eliminar si tiene stock
    if (existingWarehouse._count.stockByWarehouses > 0) {
      return ResponseHelper.error(
        res,
        'No se puede eliminar un almacén con stock. Desactívelo en su lugar.',
        400,
      );
    }

    // Soft delete - solo desactivar
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: { activo: false },
    });

    return ResponseHelper.success(
      res,
      warehouse,
      'Almacén desactivado exitosamente',
    );
  }),
};

export default WarehouseController;