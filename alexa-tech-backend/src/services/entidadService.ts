import { Client, TipoEntidad, Prisma } from '@prisma/client';
import { AuditService } from './auditService';
import { prisma } from '../config/database';

// Utilidades de validación/sanitización de documentos
const onlyDigits = (str: string = '') => str.replace(/\D+/g, '');
const expectedLengthFor = (tipo: string): number | null => {
  if (tipo === 'DNI') return 8;
  if (tipo === 'CE') return 12;
  if (tipo === 'RUC') return 11;
  return null;
};

export interface CreateClientData {
  tipoEntidad: TipoEntidad | 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  direccion: string;
  // Ubicación (ubigeo)
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  // Campos condicionales según tipo de documento
  nombres?: string; // Para DNI, CE y Pasaporte
  apellidos?: string; // Para DNI, CE y Pasaporte
  razonSocial?: string; // Para RUC
}

export interface UpdateClientData {
  tipoEntidad?: TipoEntidad | 'Cliente' | 'Proveedor' | 'Ambos';
  tipoDocumento?: string;
  numeroDocumento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  // Ubicación (ubigeo)
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  isActive?: boolean;
  // Campos condicionales según tipo de documento
  nombres?: string; // Para DNI, CE y Pasaporte
  apellidos?: string; // Para DNI, CE y Pasaporte
  razonSocial?: string; // Para RUC
}

export interface ClientFilters {
  search?: string;
  // Ubicación (ubigeo)
  departamentoId?: string;
  provinciaId?: string;
  distritoId?: string;
  tipoDocumento?: string;
  tipoEntidad?: TipoEntidad | 'Cliente' | 'Proveedor' | 'Ambos';
  fechaDesde?: string;
  fechaHasta?: string;
}

export const clientService = {
  // Crear un nuevo cliente
  async createClient(data: CreateClientData, userId?: string): Promise<Client> {
    try {
      // Validar tipoEntidad
      const allowedEntityTypes = ['Cliente', 'Proveedor', 'Ambos'];
      if (
        !data.tipoEntidad ||
        !allowedEntityTypes.includes(String(data.tipoEntidad))
      ) {
        throw new Error(
          'El tipo de entidad es obligatorio y debe ser Cliente, Proveedor o Ambos',
        );
      }

      // Normalizar número de documento
      const normalizedDocument = String(data.numeroDocumento).trim().toUpperCase();

      // Validar formato de número de documento por tipo
      if (data.tipoDocumento === 'DNI') {
        if (!/^\d{8}$/.test(normalizedDocument)) {
          throw new Error('El DNI debe tener exactamente 8 dígitos numéricos');
        }
      } else if (data.tipoDocumento === 'CE') {
        if (!/^\d{12}$/.test(normalizedDocument)) {
          throw new Error('El CE debe tener exactamente 12 dígitos numéricos');
        }
      } else if (data.tipoDocumento === 'RUC') {
        if (!/^\d{11}$/.test(normalizedDocument)) {
          throw new Error('El RUC debe tener exactamente 11 dígitos numéricos');
        }
      } else if (data.tipoDocumento === 'Pasaporte') {
        if (!/^[A-Z][0-9]{7}$/.test(normalizedDocument)) {
          throw new Error('El Pasaporte debe tener el formato: 1 letra seguida de 7 dígitos (ej: A1234567)');
        }
      }

      // Validar campos según tipo de documento
      if (['DNI', 'CE', 'Pasaporte'].includes(data.tipoDocumento)) {
        if (!data.nombres || !data.apellidos) {
          throw new Error('Para DNI, CE y Pasaporte son requeridos nombres y apellidos');
        }
        if (
          typeof data.nombres !== 'string' ||
          data.nombres.trim().length < 2
        ) {
          throw new Error(
            'Para DNI, CE y Pasaporte, los nombres deben tener al menos 2 caracteres',
          );
        }
        if (
          typeof data.apellidos !== 'string' ||
          data.apellidos.trim().length < 2
        ) {
          throw new Error(
            'Para DNI, CE y Pasaporte, los apellidos deben tener al menos 2 caracteres',
          );
        }
      } else if (data.tipoDocumento === 'RUC') {
        if (!data.razonSocial) {
          throw new Error('Para RUC es requerida la razón social');
        }
        if (
          typeof data.razonSocial !== 'string' ||
          data.razonSocial.trim().length < 2
        ) {
          throw new Error(
            'Para RUC, la razón social debe tener al menos 2 caracteres',
          );
        }
      }

      // Validar ubigeo (existencia y consistencia)
      const departamento = await prisma.departamento.findUnique({
        where: { id: data.departamentoId },
      });
      if (!departamento) {
        throw new Error('Departamento inválido');
      }
      const provincia = await prisma.provincia.findUnique({
        where: { id: data.provinciaId },
      });
      if (!provincia) {
        throw new Error('Provincia inválida');
      }
      if (provincia.departamentoId !== data.departamentoId) {
        throw new Error('La provincia no pertenece al departamento seleccionado');
      }
      const distrito = await prisma.distrito.findUnique({
        where: { id: data.distritoId },
      });
      if (!distrito) {
        throw new Error('Distrito inválido');
      }
      if (distrito.provinciaId !== data.provinciaId) {
        throw new Error('El distrito no pertenece a la provincia seleccionada');
      }

      // Verificar si el email ya existe
      const existingClientByEmail = await prisma.client.findFirst({
        where: {
          email: data.email,
          isActive: true,
        },
      });

      if (existingClientByEmail) {
        throw new Error('Ya existe un cliente con este email');
      }

      // Verificar si el número de documento ya existe
      const existingClientByDocument = await prisma.client.findFirst({
        where: {
          numeroDocumento: data.numeroDocumento,
          isActive: true,
        },
      });

      if (existingClientByDocument) {
        throw new Error('Ya existe un cliente con este número de documento');
      }

      // Preparar datos para crear el cliente
      const clientData: any = {
        tipoEntidad: data.tipoEntidad as TipoEntidad,
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: normalizedDocument,
        email: data.email.toLowerCase().trim(),
        telefono: data.telefono.trim(),
        direccion: data.direccion.trim(),
        // Ubigeo
        departamentoId: data.departamentoId,
        provinciaId: data.provinciaId,
        distritoId: data.distritoId,
        usuarioCreacion: userId || null,
      };

      // Agregar campos condicionales según tipo de documento
      if (['DNI', 'CE', 'Pasaporte'].includes(data.tipoDocumento)) {
        clientData.nombres = data.nombres!.trim();
        clientData.apellidos = data.apellidos!.trim();
      } else if (data.tipoDocumento === 'RUC') {
        clientData.razonSocial = data.razonSocial!.trim();
      }

      // Crear el cliente
      const client = await prisma.client.create({
        data: clientData,
      });

      // Registrar en auditoría
      if (userId) {
        const clientName =
          client.razonSocial || `${client.nombres} ${client.apellidos}`;
        await AuditService.createAuditLog({
          action: 'CREATE_CLIENT',
          userId,
          targetId: client.id,
          details: `Cliente creado: ${clientName} (${client.email})`,
        });
      }

      return client;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },

  // Obtener todos los clientes con filtros
  async getClients(filters: ClientFilters = {}): Promise<Client[]> {
    try {
      const where: Prisma.ClientWhereInput = {
        isActive: true,
      };

      // Filtro de búsqueda por nombres, apellidos, razón social, email o documento
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        where.OR = [
          { nombres: { contains: searchTerm, mode: 'insensitive' } },
          { apellidos: { contains: searchTerm, mode: 'insensitive' } },
          { razonSocial: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { numeroDocumento: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      // Filtro por ubicación (ubigeo)
      if (filters.departamentoId) {
        where.departamentoId = filters.departamentoId;
      }
      if (filters.provinciaId) {
        where.provinciaId = filters.provinciaId;
      }
      if (filters.distritoId) {
        where.distritoId = filters.distritoId;
      }

      // Filtro por tipo de documento
      if (filters.tipoDocumento) {
        where.tipoDocumento = filters.tipoDocumento;
      }

      // Filtro por tipo de entidad
      if (filters.tipoEntidad) {
        where.tipoEntidad = filters.tipoEntidad as TipoEntidad;
      }

      // Filtro por rango de fechas
      if (filters.fechaDesde || filters.fechaHasta) {
        where.createdAt = {} as any;

        if (filters.fechaDesde) {
          (where.createdAt as any).gte = new Date(filters.fechaDesde);
        }
        if (filters.fechaHasta) {
          (where.createdAt as any).lte = new Date(filters.fechaHasta);
        }
      }

      // Obtener lista de clientes
      const clients = await prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return clients;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },

  // Actualizar un cliente
  async updateClient(id: string, data: UpdateClientData, userId?: string): Promise<Client> {
    try {
      // Validar existencia del cliente
      const existingClient = await prisma.client.findUnique({ where: { id } });
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      const tipoDocumento = data.tipoDocumento ?? existingClient.tipoDocumento;
      const numeroDocumento = data.numeroDocumento ?? existingClient.numeroDocumento;

      // Validaciones de documento si se actualiza
      if (tipoDocumento) {
        const expected = expectedLengthFor(tipoDocumento);
        const digitsDoc = onlyDigits(numeroDocumento);
        if (expected && digitsDoc.length !== expected) {
          throw new Error(
            `El ${tipoDocumento} debe tener exactamente ${expected} dígitos`,
          );
        }
      }

      // Validar campos condicionales
      if (['DNI', 'CE', 'Pasaporte'].includes(tipoDocumento)) {
        if (data.nombres !== undefined && !data.nombres) {
          throw new Error('Para DNI, CE y Pasaporte son requeridos nombres');
        }
        if (data.apellidos !== undefined && !data.apellidos) {
          throw new Error('Para DNI, CE y Pasaporte son requeridos apellidos');
        }
      } else if (tipoDocumento === 'RUC') {
        if (data.razonSocial !== undefined && !data.razonSocial) {
          throw new Error('Para RUC es requerida la razón social');
        }
      }

      // Validar ubigeo si se actualiza
      const nextDepartamentoId = data.departamentoId ?? existingClient.departamentoId;
      const nextProvinciaId = data.provinciaId ?? existingClient.provinciaId;
      const nextDistritoId = data.distritoId ?? existingClient.distritoId;

      if (data.departamentoId || data.provinciaId || data.distritoId) {
        const dep = await prisma.departamento.findUnique({ where: { id: nextDepartamentoId } });
        if (!dep) throw new Error('Departamento inválido');
        const prov = await prisma.provincia.findUnique({ where: { id: nextProvinciaId } });
        if (!prov) throw new Error('Provincia inválida');
        if (prov.departamentoId !== nextDepartamentoId) {
          throw new Error('La provincia no pertenece al departamento seleccionado');
        }
        const dist = await prisma.distrito.findUnique({ where: { id: nextDistritoId } });
        if (!dist) throw new Error('Distrito inválido');
        if (dist.provinciaId !== nextProvinciaId) {
          throw new Error('El distrito no pertenece a la provincia seleccionada');
        }
      }

      // Preparar datos para actualización
      const updateData: any = {};
      if (data.tipoEntidad)
        updateData.tipoEntidad = data.tipoEntidad as TipoEntidad;
      if (data.tipoDocumento) updateData.tipoDocumento = data.tipoDocumento;
      if (data.numeroDocumento)
        updateData.numeroDocumento = data.numeroDocumento.trim();
      if (data.email) updateData.email = data.email.toLowerCase().trim();
      if (data.telefono) updateData.telefono = data.telefono.trim();
      if (data.direccion) updateData.direccion = data.direccion.trim();
      // Ubigeo
      if (data.departamentoId) updateData.departamentoId = data.departamentoId;
      if (data.provinciaId) updateData.provinciaId = data.provinciaId;
      if (data.distritoId) updateData.distritoId = data.distritoId;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;

      // Campos condicionales según tipo de documento
      if (data.nombres !== undefined) updateData.nombres = data.nombres.trim();
      if (data.apellidos !== undefined)
        updateData.apellidos = data.apellidos.trim();
      if (data.razonSocial !== undefined)
        updateData.razonSocial = data.razonSocial.trim();

      // Actualizar el cliente
      const updatedClient = await prisma.client.update({
        where: { id },
        data: { ...updateData, usuarioActualizacion: userId || null },
      });

      // Registrar en auditoría
      if (userId) {
        const clientName =
          updatedClient.razonSocial ||
          `${updatedClient.nombres} ${updatedClient.apellidos}`;
        await AuditService.createAuditLog({
          action: 'UPDATE_CLIENT',
          userId,
          targetId: id,
          details: `Cliente actualizado: ${clientName}`,
        });
      }

      return updatedClient;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },

  // Reactivar cliente (sin cambios de ubicación)
  async reactivateClient(id: string, userId?: string): Promise<Client> {
    try {
      const existingClient = await prisma.client.findUnique({ where: { id } });
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar y sanear documento
      const expected = expectedLengthFor(existingClient.tipoDocumento);
      const digitsDoc = onlyDigits(existingClient.numeroDocumento);
      if (expected && digitsDoc.length !== expected) {
        throw new Error(
          `No se puede reactivar: el ${existingClient.tipoDocumento} debe tener exactamente ${expected} dígitos`,
        );
      }
      // Si tras sanear cambia el valor, validar que no genere conflicto
      if (expected && digitsDoc !== existingClient.numeroDocumento) {
        const conflictSanitized = await prisma.client.findFirst({
          where: {
            numeroDocumento: digitsDoc,
            isActive: true,
            NOT: { id },
          },
        });
        if (conflictSanitized) {
          throw new Error(
            'No se puede reactivar: el documento saneado ya está en uso por otro cliente activo',
          );
        }
        await prisma.client.update({
          where: { id },
          data: { numeroDocumento: digitsDoc },
        });
      }

      // Reactivar el cliente
      const reactivatedClient = await prisma.client.update({
        where: { id },
        data: { isActive: true },
      });

      // Registrar en auditoría
      if (userId) {
        await AuditService.createAuditLog({
          action: 'REACTIVATE_CLIENT',
          userId,
          targetId: id,
          details: `Cliente reactivado: ${
            reactivatedClient.tipoDocumento === 'RUC'
              ? reactivatedClient.razonSocial || ''
              : `${reactivatedClient.nombres || ''} ${reactivatedClient.apellidos || ''}`.trim()
          }`,
        });
      }

      return reactivatedClient;
    } catch (error) {
      console.error('Error al reactivar cliente:', error);
      throw error;
    }
  },

  // Obtener estadísticas de clientes
  async getClientStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byDepartamento: { departamentoId: string; count: number }[];
    byDocumentType: { tipoDocumento: string; count: number }[];
  }> {
    try {
      const [total, active, inactive, byDepartamento, byDocumentType] =
        await Promise.all([
          prisma.client.count(),
          prisma.client.count({ where: { isActive: true } }),
          prisma.client.count({ where: { isActive: false } }),
          prisma.client.groupBy({
            by: ['departamentoId'],
            where: { isActive: true },
            _count: { departamentoId: true },
            orderBy: { _count: { departamentoId: 'desc' } },
          }),
          prisma.client.groupBy({
            by: ['tipoDocumento'],
            where: { isActive: true },
            _count: { tipoDocumento: true },
            orderBy: { _count: { tipoDocumento: 'desc' } },
          }),
        ]);

      return {
        total,
        active,
        inactive,
        byDepartamento: byDepartamento.map((item) => ({
          departamentoId: item.departamentoId,
          count: (item as any)._count.departamentoId,
        })),
        byDocumentType: byDocumentType.map((item) => ({
          tipoDocumento: item.tipoDocumento,
          count: (item as any)._count.tipoDocumento,
        })),
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de clientes:', error);
      throw new Error('Error al obtener estadísticas');
    }
  },

  // Obtener cliente por ID
  async getClientById(id: string): Promise<Client | null> {
    try {
      return await prisma.client.findUnique({ where: { id } });
    } catch (error) {
      console.error('Error al obtener cliente por ID:', error);
      throw error;
    }
  },

  // Obtener cliente por email
  async getClientByEmail(email: string): Promise<Client | null> {
    try {
      const normalized = email.toLowerCase().trim();
      return await prisma.client.findUnique({ where: { email: normalized } });
    } catch (error) {
      console.error('Error al obtener cliente por email:', error);
      throw error;
    }
  },

  // Obtener cliente por número de documento
  async getClientByDocument(numeroDocumento: string): Promise<Client | null> {
    try {
      const normalized = String(numeroDocumento).trim().toUpperCase();
      return await prisma.client.findFirst({
        where: { numeroDocumento: normalized },
      });
    } catch (error) {
      console.error('Error al obtener cliente por documento:', error);
      throw error;
    }
  },
};
