import { Response } from 'express';
import { prisma } from '../config/database';
import { ResponseHelper } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const WarehouseController = {
  async list(req: AuthenticatedRequest, res: Response) {
    try {
      const warehouses = await prisma.warehouse.findMany({
        select: { id: true, codigo: true, nombre: true, activo: true },
        orderBy: { nombre: 'asc' },
      });
      return ResponseHelper.success(
        res,
        warehouses,
        'Warehouses obtenidos correctamente',
      );
    } catch (error: any) {
      return ResponseHelper.error(
        res,
        'Error al obtener warehouses',
        500,
        error?.message || String(error),
      );
    }
  },
};

export default WarehouseController;