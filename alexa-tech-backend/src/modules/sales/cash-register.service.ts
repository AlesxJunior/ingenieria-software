import { prisma } from '../../config/database';
import { AuditService } from '../../services/auditService';

interface CashRegister {
  id: string;
  codigo: string;
  nombre: string;
  ubicacion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CashRegisterCreateInput {
  codigo: string;
  nombre: string;
  ubicacion?: string;
  activo?: boolean;
}

export const cashRegisterService = {
  async create(data: CashRegisterCreateInput, userId: string): Promise<CashRegister> {
    // Verificar que el código sea único
    const existing = await prisma.cashRegister.findUnique({
      where: { codigo: data.codigo },
    });

    if (existing) {
      throw new Error(`Ya existe una caja con el código ${data.codigo}`);
    }

    const now = new Date();
    const created = await prisma.cashRegister.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        ubicacion: data.ubicacion ?? null,
        activo: data.activo ?? true,
        createdAt: now,
        updatedAt: now,
      },
    });

    await AuditService.createAuditLog({
      action: 'CREATE_CASH_REGISTER',
      userId,
      targetId: created.id,
      details: `Caja registradora creada: ${created.nombre} (${created.codigo})`,
    });

    return {
      id: created.id,
      codigo: created.codigo,
      nombre: created.nombre,
      ubicacion: created.ubicacion ?? undefined,
      activo: created.activo,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  async list(filters: any = {}): Promise<CashRegister[]> {
    const where: any = {};
    if (filters.activo !== undefined) {
      where.activo = filters.activo === 'true' || filters.activo === true;
    }
    if (filters.q) {
      const q = String(filters.q);
      where.OR = [
        { codigo: { contains: q, mode: 'insensitive' } },
        { nombre: { contains: q, mode: 'insensitive' } },
        { ubicacion: { contains: q, mode: 'insensitive' } },
      ];
    }

    const registers = await prisma.cashRegister.findMany({
      where,
      orderBy: { nombre: 'asc' },
    });

    return registers.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      ubicacion: r.ubicacion ?? undefined,
      activo: r.activo,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },

  async getById(id: string): Promise<CashRegister | null> {
    const register = await prisma.cashRegister.findUnique({
      where: { id },
    });

    if (!register) return null;

    return {
      id: register.id,
      codigo: register.codigo,
      nombre: register.nombre,
      ubicacion: register.ubicacion ?? undefined,
      activo: register.activo,
      createdAt: register.createdAt.toISOString(),
      updatedAt: register.updatedAt.toISOString(),
    };
  },

  async update(id: string, data: Partial<CashRegisterCreateInput>, userId: string): Promise<CashRegister> {
    const existing = await prisma.cashRegister.findUnique({ where: { id } });
    if (!existing) {
      throw new Error('Caja registradora no encontrada');
    }

    // Si se cambia el código, verificar que no exista otro con el mismo código
    if (data.codigo && data.codigo !== existing.codigo) {
      const codeExists = await prisma.cashRegister.findUnique({
        where: { codigo: data.codigo },
      });
      if (codeExists) {
        throw new Error(`Ya existe una caja con el código ${data.codigo}`);
      }
    }

    const updated = await prisma.cashRegister.update({
      where: { id },
      data: {
        codigo: data.codigo ?? existing.codigo,
        nombre: data.nombre ?? existing.nombre,
        ubicacion: data.ubicacion !== undefined ? data.ubicacion : existing.ubicacion,
        activo: data.activo !== undefined ? data.activo : existing.activo,
        updatedAt: new Date(),
      },
    });

    await AuditService.createAuditLog({
      action: 'UPDATE_CASH_REGISTER',
      userId,
      targetId: id,
      details: `Caja registradora actualizada: ${updated.nombre} (${updated.codigo})`,
    });

    return {
      id: updated.id,
      codigo: updated.codigo,
      nombre: updated.nombre,
      ubicacion: updated.ubicacion ?? undefined,
      activo: updated.activo,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.cashRegister.findUnique({ 
      where: { id },
      include: { cashSessions: true },
    });
    
    if (!existing) {
      throw new Error('Caja registradora no encontrada');
    }

    // Verificar que no tenga sesiones abiertas
    const openSessions = existing.cashSessions.filter(s => s.estado === 'Abierta');
    if (openSessions.length > 0) {
      throw new Error('No se puede eliminar una caja con sesiones abiertas');
    }

    await prisma.cashRegister.delete({ where: { id } });

    await AuditService.createAuditLog({
      action: 'DELETE_CASH_REGISTER',
      userId,
      targetId: id,
      details: `Caja registradora eliminada: ${existing.nombre} (${existing.codigo})`,
    });
  },
};

export default cashRegisterService;
