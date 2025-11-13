import { prisma } from '../../config/database';
import { AuditService } from '../../services/auditService';

interface CashSession {
  id: string;
  cashRegisterId: string;
  userId: string;
  fechaApertura: string;
  fechaCierre?: string;
  montoApertura: number;
  montoCierre?: number;
  totalVentas: number;
  diferencia?: number;
  estado: 'Abierta' | 'Cerrada';
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

interface CashSessionOpenInput {
  cashRegisterId: string;
  montoApertura: number;
  observaciones?: string;
}

interface CashSessionCloseInput {
  montoCierre: number;
  observaciones?: string;
}

export const cashSessionService = {
  async openSession(data: CashSessionOpenInput, userId: string): Promise<CashSession> {
    // Verificar que la caja exista y esté activa
    const cashRegister = await prisma.cashRegister.findUnique({
      where: { id: data.cashRegisterId },
    });

    if (!cashRegister) {
      throw new Error('Caja registradora no encontrada');
    }

    if (!cashRegister.activo) {
      throw new Error('La caja registradora no está activa');
    }

    // Verificar que no haya una sesión abierta en esta caja
    const openSession = await prisma.cashSession.findFirst({
      where: {
        cashRegisterId: data.cashRegisterId,
        estado: 'Abierta',
      },
    });

    if (openSession) {
      throw new Error('Ya existe una sesión abierta en esta caja registradora');
    }

    const now = new Date();
    const created = await prisma.cashSession.create({
      data: {
        cashRegisterId: data.cashRegisterId,
        userId,
        fechaApertura: now,
        montoApertura: data.montoApertura as any,
        totalVentas: 0 as any,
        estado: 'Abierta',
        observaciones: data.observaciones ?? null,
        createdAt: now,
        updatedAt: now,
      },
    });

    await AuditService.createAuditLog({
      action: 'OPEN_CASH_SESSION',
      userId,
      targetId: created.id,
      details: `Sesión de caja abierta en ${cashRegister.nombre} con monto inicial ${data.montoApertura}`,
    });

    return {
      id: created.id,
      cashRegisterId: created.cashRegisterId,
      userId: created.userId,
      fechaApertura: created.fechaApertura.toISOString(),
      fechaCierre: created.fechaCierre?.toISOString(),
      montoApertura: Number(created.montoApertura),
      montoCierre: created.montoCierre ? Number(created.montoCierre) : undefined,
      totalVentas: Number(created.totalVentas),
      diferencia: created.diferencia ? Number(created.diferencia) : undefined,
      estado: created.estado as any,
      observaciones: created.observaciones ?? undefined,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async closeSession(id: string, data: CashSessionCloseInput, userId: string): Promise<CashSession> {
    const session = await prisma.cashSession.findUnique({
      where: { id },
    });

    if (!session) {
      throw new Error('Sesión de caja no encontrada');
    }

    if (session.estado !== 'Abierta') {
      throw new Error('La sesión ya está cerrada');
    }

    // Calcular diferencia: montoCierre - (montoApertura + totalVentas)
    const expectedAmount = Number(session.montoApertura) + Number(session.totalVentas);
    const diferencia = data.montoCierre - expectedAmount;

    const now = new Date();
    const updated = await prisma.cashSession.update({
      where: { id },
      data: {
        fechaCierre: now,
        montoCierre: data.montoCierre as any,
        diferencia: diferencia as any,
        estado: 'Cerrada',
        observaciones: data.observaciones ?? session.observaciones,
        updatedAt: now,
      },
    });

    await AuditService.createAuditLog({
      action: 'CLOSE_CASH_SESSION',
      userId,
      targetId: id,
      details: `Sesión de caja cerrada. Monto cierre: ${data.montoCierre}, Total ventas: ${session.totalVentas}, Diferencia: ${diferencia}`,
    });

    return {
      id: updated.id,
      cashRegisterId: updated.cashRegisterId,
      userId: updated.userId,
      fechaApertura: updated.fechaApertura.toISOString(),
      fechaCierre: updated.fechaCierre?.toISOString(),
      montoApertura: Number(updated.montoApertura),
      montoCierre: updated.montoCierre ? Number(updated.montoCierre) : undefined,
      totalVentas: Number(updated.totalVentas),
      diferencia: updated.diferencia ? Number(updated.diferencia) : undefined,
      estado: updated.estado as any,
      observaciones: updated.observaciones ?? undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async list(filters: any = {}): Promise<CashSession[]> {
    const where: any = {};
    if (filters.cashRegisterId) {
      where.cashRegisterId = String(filters.cashRegisterId);
    }
    if (filters.userId) {
      where.userId = String(filters.userId);
    }
    if (filters.estado) {
      where.estado = String(filters.estado);
    }
    if (filters.fechaInicio || filters.fechaFin) {
      const start = filters.fechaInicio ? new Date(filters.fechaInicio) : undefined;
      const end = filters.fechaFin ? new Date(filters.fechaFin) : undefined;
      where.fechaApertura = {};
      if (start) (where.fechaApertura as any).gte = start;
      if (end) (where.fechaApertura as any).lte = end;
    }

    const sessions = await prisma.cashSession.findMany({
      where,
      orderBy: { fechaApertura: 'desc' },
    });

    return sessions.map((s) => ({
      id: s.id,
      cashRegisterId: s.cashRegisterId,
      userId: s.userId,
      fechaApertura: s.fechaApertura.toISOString(),
      fechaCierre: s.fechaCierre?.toISOString(),
      montoApertura: Number(s.montoApertura),
      montoCierre: s.montoCierre ? Number(s.montoCierre) : undefined,
      totalVentas: Number(s.totalVentas),
      diferencia: s.diferencia ? Number(s.diferencia) : undefined,
      estado: s.estado as any,
      observaciones: s.observaciones ?? undefined,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    }));
  },

  async getById(id: string): Promise<CashSession | null> {
    const session = await prisma.cashSession.findUnique({
      where: { id },
      include: {
        cashRegister: true,
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) return null;

    return {
      id: session.id,
      cashRegisterId: session.cashRegisterId,
      userId: session.userId,
      fechaApertura: session.fechaApertura.toISOString(),
      fechaCierre: session.fechaCierre?.toISOString(),
      montoApertura: Number(session.montoApertura),
      montoCierre: session.montoCierre ? Number(session.montoCierre) : undefined,
      totalVentas: Number(session.totalVentas),
      diferencia: session.diferencia ? Number(session.diferencia) : undefined,
      estado: session.estado as any,
      observaciones: session.observaciones ?? undefined,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  },

  async getCurrentOpenSession(cashRegisterId: string): Promise<CashSession | null> {
    const session = await prisma.cashSession.findFirst({
      where: {
        cashRegisterId,
        estado: 'Abierta',
      },
    });

    if (!session) return null;

    return {
      id: session.id,
      cashRegisterId: session.cashRegisterId,
      userId: session.userId,
      fechaApertura: session.fechaApertura.toISOString(),
      fechaCierre: session.fechaCierre?.toISOString(),
      montoApertura: Number(session.montoApertura),
      montoCierre: session.montoCierre ? Number(session.montoCierre) : undefined,
      totalVentas: Number(session.totalVentas),
      diferencia: session.diferencia ? Number(session.diferencia) : undefined,
      estado: session.estado as any,
      observaciones: session.observaciones ?? undefined,
      createdAt: session.createdAt.toISOString(),
      updatedAt: session.updatedAt.toISOString(),
    };
  },
};

export default cashSessionService;
