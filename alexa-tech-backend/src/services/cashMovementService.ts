import { prisma } from '../config/database';
import { $Enums } from '@prisma/client';

export interface CreateCashMovementInput {
  cashSessionId: string;
  tipo: $Enums.CashMovementType;
  monto: number;
  motivo: string;
  descripcion?: string;
  usuarioId: string;
}

export interface CashSummary {
  montoApertura: number;
  totalVentas: number; // Cambio: totalVentasEfectivo → totalVentas (incluye todas las formas de pago)
  totalIngresos: number;
  totalEgresos: number;
  totalEsperado: number;
}

export class CashMovementService {
  /**
   * Crear un movimiento de caja (ingreso o egreso)
   */
  async createMovement(data: CreateCashMovementInput) {
    // Validar que la sesión exista y esté abierta
    const session = await prisma.cashSession.findUnique({
      where: { id: data.cashSessionId },
    });

    if (!session) {
      throw new Error('Sesión de caja no encontrada');
    }

    if (session.estado !== 'Abierta') {
      throw new Error('La caja no está abierta. No se pueden registrar movimientos.');
    }

    // Validar monto positivo
    if (data.monto <= 0) {
      throw new Error('El monto debe ser mayor a cero');
    }

    // Crear el movimiento
    const movement = await prisma.cashMovement.create({
      data: {
        cashSessionId: data.cashSessionId,
        tipo: data.tipo,
        monto: data.monto,
        motivo: data.motivo,
        descripcion: data.descripcion,
        usuarioId: data.usuarioId,
      },
      include: {
        usuario: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return movement;
  }

  /**
   * Obtener todos los movimientos de una sesión de caja
   */
  async getMovementsByCashSession(cashSessionId: string) {
    const movements = await prisma.cashMovement.findMany({
      where: { cashSessionId },
      include: {
        usuario: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return movements;
  }

  /**
   * Calcular resumen completo de caja (con movimientos)
   */
  async calculateCashSummary(cashSessionId: string): Promise<CashSummary> {
    const session = await prisma.cashSession.findUnique({
      where: { id: cashSessionId },
      include: {
        sales: {
          where: {
            estado: 'Completada', // Incluir TODAS las ventas completadas (efectivo, tarjeta, etc.)
          },
        },
        movements: true,
      },
    });

    if (!session) {
      throw new Error('Sesión de caja no encontrada');
    }

    // Calcular total de TODAS las ventas (no solo efectivo)
    const totalVentas = session.sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0
    );

    // Calcular total de ingresos adicionales
    const totalIngresos = session.movements
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    // Calcular total de egresos
    const totalEgresos = session.movements
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    // Calcular total esperado en caja
    const totalEsperado =
      Number(session.montoApertura) +
      totalVentas +
      totalIngresos -
      totalEgresos;

    return {
      montoApertura: Number(session.montoApertura),
      totalVentas, // Cambio de nombre: totalVentasEfectivo → totalVentas
      totalIngresos,
      totalEgresos,
      totalEsperado,
    };
  }

  /**
   * Obtener resumen detallado con lista de movimientos
   */
  async getDetailedSummary(cashSessionId: string) {
    const summary = await this.calculateCashSummary(cashSessionId);
    const movements = await this.getMovementsByCashSession(cashSessionId);

    return {
      ...summary,
      movements,
    };
  }

  /**
   * Eliminar un movimiento de caja (solo si la caja está abierta)
   */
  async deleteMovement(movementId: string, usuarioId: string): Promise<void> {
    const movement = await prisma.cashMovement.findUnique({
      where: { id: movementId },
      include: { cashSession: true },
    });

    if (!movement) {
      throw new Error('Movimiento no encontrado');
    }

    if (movement.cashSession.estado !== 'Abierta') {
      throw new Error('No se pueden eliminar movimientos de una caja cerrada');
    }

    // Solo el usuario que creó el movimiento o un admin puede eliminarlo
    if (movement.usuarioId !== usuarioId) {
      throw new Error('No tienes permiso para eliminar este movimiento');
    }

    await prisma.cashMovement.delete({
      where: { id: movementId },
    });
  }
}

export const cashMovementService = new CashMovementService();
