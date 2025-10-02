import { PrismaClient, Client } from '../generated/prisma';
import { AuditService } from './auditService';

const prisma = new PrismaClient();

export interface CreateClientData {
  tipoDocumento: string;
  numeroDocumento: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  // Campos condicionales según tipo de documento
  nombres?: string;      // Para DNI y CE
  apellidos?: string;    // Para DNI y CE
  razonSocial?: string;  // Para RUC
}

export interface UpdateClientData {
  tipoDocumento?: string;
  numeroDocumento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  // Campos condicionales según tipo de documento
  nombres?: string;      // Para DNI y CE
  apellidos?: string;    // Para DNI y CE
  razonSocial?: string;  // Para RUC
}

export interface ClientFilters {
  search?: string;
  ciudad?: string;
  tipoDocumento?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export const clientService = {
  // Crear un nuevo cliente
  async createClient(data: CreateClientData, userId?: string): Promise<Client> {
    try {
      // Validar campos según tipo de documento
      if (['DNI', 'CE'].includes(data.tipoDocumento)) {
        if (!data.nombres || !data.apellidos) {
          throw new Error('Para DNI y CE son requeridos nombres y apellidos');
        }
      } else if (data.tipoDocumento === 'RUC') {
        if (!data.razonSocial) {
          throw new Error('Para RUC es requerida la razón social');
        }
      }

      // Verificar si el email ya existe
      const existingClientByEmail = await prisma.client.findFirst({
        where: {
          email: data.email,
          isActive: true
        }
      });

      if (existingClientByEmail) {
        throw new Error('Ya existe un cliente con este email');
      }

      // Verificar si el número de documento ya existe
      const existingClientByDocument = await prisma.client.findFirst({
        where: {
          numeroDocumento: data.numeroDocumento,
          isActive: true
        }
      });

      if (existingClientByDocument) {
        throw new Error('Ya existe un cliente con este número de documento');
      }

      // Preparar datos para crear el cliente
      const clientData: any = {
        tipoDocumento: data.tipoDocumento,
        numeroDocumento: data.numeroDocumento.trim(),
        email: data.email.toLowerCase().trim(),
        telefono: data.telefono.trim(),
        direccion: data.direccion.trim(),
        ciudad: data.ciudad.trim(),
      };

      // Agregar campos condicionales según tipo de documento
      if (['DNI', 'CE'].includes(data.tipoDocumento)) {
        clientData.nombres = data.nombres!.trim();
        clientData.apellidos = data.apellidos!.trim();
      } else if (data.tipoDocumento === 'RUC') {
        clientData.razonSocial = data.razonSocial!.trim();
      }

      // Crear el cliente
      const client = await prisma.client.create({
        data: clientData
      });

      // Registrar en auditoría
      if (userId) {
        const clientName = client.razonSocial || `${client.nombres} ${client.apellidos}`;
        await AuditService.createAuditLog({
          action: 'CREATE_CLIENT',
          userId,
          targetId: client.id,
          details: `Cliente creado: ${clientName} (${client.email})`
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
      const where: any = {
        isActive: true
      };

      // Filtro de búsqueda por nombres, apellidos, razón social, email o documento
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        where.OR = [
          { nombres: { contains: searchTerm, mode: 'insensitive' } },
          { apellidos: { contains: searchTerm, mode: 'insensitive' } },
          { razonSocial: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { numeroDocumento: { contains: searchTerm, mode: 'insensitive' } }
        ];
      }

      // Filtro por ciudad
      if (filters.ciudad) {
        where.ciudad = { contains: filters.ciudad, mode: 'insensitive' };
      }

      // Filtro por tipo de documento
      if (filters.tipoDocumento) {
        where.tipoDocumento = filters.tipoDocumento;
      }

      // Filtro por rango de fechas
      if (filters.fechaDesde || filters.fechaHasta) {
        where.createdAt = {};
        
        if (filters.fechaDesde) {
          where.createdAt.gte = new Date(filters.fechaDesde);
        }
        
        if (filters.fechaHasta) {
          // Agregar 23:59:59 para incluir todo el día
          const fechaHasta = new Date(filters.fechaHasta);
          fechaHasta.setHours(23, 59, 59, 999);
          where.createdAt.lte = fechaHasta;
        }
      }

      const clients = await prisma.client.findMany({
        where,
        orderBy: [
          { apellidos: 'asc' },
          { nombres: 'asc' },
          { razonSocial: 'asc' }
        ]
      });

      return clients;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw new Error('Error al obtener la lista de clientes');
    }
  },

  // Obtener un cliente por ID
  async getClientById(id: string): Promise<Client | null> {
    try {
      const client = await prisma.client.findFirst({
        where: {
          id,
          isActive: true
        }
      });

      return client;
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      throw new Error('Error al obtener el cliente');
    }
  },

  // Obtener un cliente por email
  async getClientByEmail(email: string): Promise<Client | null> {
    try {
      const client = await prisma.client.findFirst({
        where: {
          email: email.toLowerCase(),
          isActive: true
        }
      });

      return client;
    } catch (error) {
      console.error('Error al obtener cliente por email:', error);
      throw new Error('Error al obtener el cliente');
    }
  },

  // Obtener un cliente por número de documento
  async getClientByDocument(numeroDocumento: string): Promise<Client | null> {
    try {
      const client = await prisma.client.findFirst({
        where: {
          numeroDocumento,
          isActive: true
        }
      });

      return client;
    } catch (error) {
      console.error('Error al obtener cliente por documento:', error);
      throw new Error('Error al obtener el cliente');
    }
  },

  // Actualizar un cliente
  async updateClient(id: string, data: UpdateClientData, userId?: string): Promise<Client> {
    try {
      // Verificar que el cliente existe
      const existingClient = await this.getClientById(id);
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      // Verificar email único si se está actualizando
      if (data.email && data.email !== existingClient.email) {
        const clientWithEmail = await prisma.client.findFirst({
          where: {
            email: data.email.toLowerCase(),
            isActive: true,
            NOT: { id }
          }
        });

        if (clientWithEmail) {
          throw new Error('Ya existe un cliente con este email');
        }
      }

      // Verificar documento único si se está actualizando
      if (data.numeroDocumento && data.numeroDocumento !== existingClient.numeroDocumento) {
        const clientWithDocument = await prisma.client.findFirst({
          where: {
            numeroDocumento: data.numeroDocumento,
            isActive: true,
            NOT: { id }
          }
        });

        if (clientWithDocument) {
          throw new Error('Ya existe un cliente con este número de documento');
        }
      }

      // Validar campos según tipo de documento si se está cambiando
      const tipoDocumento = data.tipoDocumento || existingClient.tipoDocumento;
      if (['DNI', 'CE'].includes(tipoDocumento)) {
        if (data.nombres !== undefined && !data.nombres) {
          throw new Error('Para DNI y CE son requeridos nombres');
        }
        if (data.apellidos !== undefined && !data.apellidos) {
          throw new Error('Para DNI y CE son requeridos apellidos');
        }
      } else if (tipoDocumento === 'RUC') {
        if (data.razonSocial !== undefined && !data.razonSocial) {
          throw new Error('Para RUC es requerida la razón social');
        }
      }

      // Preparar datos para actualización
      const updateData: any = {};
      if (data.tipoDocumento) updateData.tipoDocumento = data.tipoDocumento;
      if (data.numeroDocumento) updateData.numeroDocumento = data.numeroDocumento.trim();
      if (data.email) updateData.email = data.email.toLowerCase().trim();
      if (data.telefono) updateData.telefono = data.telefono.trim();
      if (data.direccion) updateData.direccion = data.direccion.trim();
      if (data.ciudad) updateData.ciudad = data.ciudad.trim();
      
      // Campos condicionales según tipo de documento
      if (data.nombres !== undefined) updateData.nombres = data.nombres.trim();
      if (data.apellidos !== undefined) updateData.apellidos = data.apellidos.trim();
      if (data.razonSocial !== undefined) updateData.razonSocial = data.razonSocial.trim();

      // Actualizar el cliente
      const updatedClient = await prisma.client.update({
        where: { id },
        data: updateData
      });

      // Registrar en auditoría
      if (userId) {
        const clientName = updatedClient.razonSocial || `${updatedClient.nombres} ${updatedClient.apellidos}`;
        await AuditService.createAuditLog({
          action: 'UPDATE_CLIENT',
          userId,
          targetId: id,
          details: `Cliente actualizado: ${clientName}`
        });
      }

      return updatedClient;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },



  // Reactivar un cliente
  async reactivateClient(id: string, userId?: string): Promise<Client> {
    try {
      // Verificar que el cliente existe (incluso inactivos)
      const existingClient = await prisma.client.findUnique({
        where: { id }
      });

      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      if (existingClient.isActive) {
        throw new Error('El cliente ya está activo');
      }

      // Verificar que no haya conflictos con email o documento
      const conflictEmail = await prisma.client.findFirst({
        where: {
          email: existingClient.email,
          isActive: true,
          NOT: { id }
        }
      });

      if (conflictEmail) {
        throw new Error('No se puede reactivar: ya existe un cliente activo con este email');
      }

      const conflictDocument = await prisma.client.findFirst({
        where: {
          numeroDocumento: existingClient.numeroDocumento,
          isActive: true,
          NOT: { id }
        }
      });

      if (conflictDocument) {
        throw new Error('No se puede reactivar: ya existe un cliente activo con este documento');
      }

      // Reactivar el cliente
      const reactivatedClient = await prisma.client.update({
        where: { id },
        data: { isActive: true }
      });

      // Registrar en auditoría
      if (userId) {
        await AuditService.createAuditLog({
        action: 'REACTIVATE_CLIENT',
          userId,
          targetId: id,
          details: `Cliente reactivado: ${reactivatedClient.tipoDocumento === 'RUC' 
            ? reactivatedClient.razonSocial || ''
            : `${reactivatedClient.nombres || ''} ${reactivatedClient.apellidos || ''}`.trim()}`
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
    byCity: { ciudad: string; count: number }[];
    byDocumentType: { tipoDocumento: string; count: number }[];
  }> {
    try {
      const [total, active, inactive, byCity, byDocumentType] = await Promise.all([
        prisma.client.count(),
        prisma.client.count({ where: { isActive: true } }),
        prisma.client.count({ where: { isActive: false } }),
        prisma.client.groupBy({
          by: ['ciudad'],
          where: { isActive: true },
          _count: { ciudad: true },
          orderBy: { _count: { ciudad: 'desc' } }
        }),
        prisma.client.groupBy({
          by: ['tipoDocumento'],
          where: { isActive: true },
          _count: { tipoDocumento: true },
          orderBy: { _count: { tipoDocumento: 'desc' } }
        })
      ]);

      return {
        total,
        active,
        inactive,
        byCity: byCity.map(item => ({
          ciudad: item.ciudad,
          count: item._count.ciudad
        })),
        byDocumentType: byDocumentType.map(item => ({
          tipoDocumento: item.tipoDocumento,
          count: item._count.tipoDocumento
        }))
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de clientes:', error);
      throw new Error('Error al obtener estadísticas');
    }
  }
};