import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { prisma } from '../config/database';
import { ResponseHelper } from '../utils/response';
import { asyncHandler } from '../middleware/errorHandler';

export const movementReasonController = {
  // GET /api/movement-reasons - Listar todos los motivos
  getAll: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { tipo, activo } = req.query;

    const where: any = {};

    if (tipo) {
      where.tipo = tipo;
    }

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    const reasons = await prisma.movementReason.findMany({
      where,
      include: {
        _count: {
          select: {
            inventoryMovements: true,
          },
        },
      },
      orderBy: [
        { tipo: 'asc' },
        { nombre: 'asc' },
      ],
    });

    return ResponseHelper.success(
      res,
      { rows: reasons, total: reasons.length },
      'Motivos obtenidos correctamente',
    );
  }),

  // GET /api/movement-reasons/:id - Obtener un motivo por ID
  getById: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const reason = await prisma.movementReason.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventoryMovements: true,
          },
        },
      },
    });

    if (!reason) {
      return ResponseHelper.error(res, 'Motivo no encontrado', 404);
    }

    return ResponseHelper.success(res, reason, 'Motivo obtenido');
  }),

  // POST /api/movement-reasons - Crear nuevo motivo
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { tipo, codigo, nombre, descripcion, requiereDocumento } = req.body;

    // Validaciones
    if (!tipo || !codigo || !nombre) {
      return ResponseHelper.validationError(res, [
        { field: 'tipo', message: 'El tipo es requerido' },
        { field: 'codigo', message: 'El código es requerido' },
        { field: 'nombre', message: 'El nombre es requerido' },
      ]);
    }

    // Validar que el tipo sea válido
    if (!['ENTRADA', 'SALIDA', 'AJUSTE'].includes(tipo)) {
      return ResponseHelper.error(
        res,
        'El tipo debe ser ENTRADA, SALIDA o AJUSTE',
        400,
      );
    }

    // Verificar si ya existe el código
    const existingReason = await prisma.movementReason.findUnique({
      where: { codigo },
    });

    if (existingReason) {
      return ResponseHelper.error(
        res,
        'Ya existe un motivo con ese código',
        400,
      );
    }

    const reason = await prisma.movementReason.create({
      data: {
        tipo,
        codigo: codigo.toUpperCase(),
        nombre,
        descripcion: descripcion || null,
        requiereDocumento: requiereDocumento === true,
      },
    });

    return ResponseHelper.success(
      res,
      reason,
      'Motivo creado exitosamente',
      201,
    );
  }),

  // PUT /api/movement-reasons/:id - Actualizar motivo
  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;
    const { tipo, codigo, nombre, descripcion, requiereDocumento, activo } =
      req.body;

    // Verificar que existe
    const existingReason = await prisma.movementReason.findUnique({
      where: { id },
    });

    if (!existingReason) {
      return ResponseHelper.error(res, 'Motivo no encontrado', 404);
    }

    // Si cambia el código, verificar que no exista otro con ese código
    if (codigo && codigo !== existingReason.codigo) {
      const duplicateReason = await prisma.movementReason.findUnique({
        where: { codigo },
      });

      if (duplicateReason) {
        return ResponseHelper.error(
          res,
          'Ya existe un motivo con ese código',
          400,
        );
      }
    }

    // Validar tipo si se proporciona
    if (tipo && !['ENTRADA', 'SALIDA', 'AJUSTE'].includes(tipo)) {
      return ResponseHelper.error(
        res,
        'El tipo debe ser ENTRADA, SALIDA o AJUSTE',
        400,
      );
    }

    const reason = await prisma.movementReason.update({
      where: { id },
      data: {
        ...(tipo && { tipo }),
        ...(codigo && { codigo: codigo.toUpperCase() }),
        ...(nombre && { nombre }),
        ...(descripcion !== undefined && { descripcion: descripcion || null }),
        ...(requiereDocumento !== undefined && {
          requiereDocumento: Boolean(requiereDocumento),
        }),
        ...(activo !== undefined && { activo: Boolean(activo) }),
      },
    });

    return ResponseHelper.success(
      res,
      reason,
      'Motivo actualizado exitosamente',
    );
  }),

  // DELETE /api/movement-reasons/:id - Eliminar (desactivar) motivo
  delete: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    // Verificar que existe
    const existingReason = await prisma.movementReason.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inventoryMovements: true,
          },
        },
      },
    });

    if (!existingReason) {
      return ResponseHelper.error(res, 'Motivo no encontrado', 404);
    }

    // Verificar si tiene movimientos asociados
    if (existingReason._count.inventoryMovements > 0) {
      return ResponseHelper.error(
        res,
        `No se puede eliminar el motivo porque tiene ${existingReason._count.inventoryMovements} movimientos asociados. Solo puede desactivarlo.`,
        400,
      );
    }

    // Si no tiene movimientos, se puede eliminar físicamente
    await prisma.movementReason.delete({
      where: { id },
    });

    return ResponseHelper.success(res, null, 'Motivo eliminado exitosamente');
  }),

  // PATCH /api/movement-reasons/:id/toggle - Activar/Desactivar motivo
  toggle: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { id } = req.params;

    const existingReason = await prisma.movementReason.findUnique({
      where: { id },
    });

    if (!existingReason) {
      return ResponseHelper.error(res, 'Motivo no encontrado', 404);
    }

    const reason = await prisma.movementReason.update({
      where: { id },
      data: {
        activo: !existingReason.activo,
      },
    });

    return ResponseHelper.success(
      res,
      reason,
      `Motivo ${reason.activo ? 'activado' : 'desactivado'} exitosamente`,
    );
  }),
};
