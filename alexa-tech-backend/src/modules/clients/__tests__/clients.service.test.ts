import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient, Client, TipoEntidad } from '@prisma/client';
import { clientService, CreateClientData, UpdateClientData } from '../clients.service';
import { prisma } from '../../../config/database';
import { AuditService } from '../../../services/auditService';

vi.mock('../../../config/database', () => ({
  __esModule: true,
  prisma: {
    client: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
    departamento: {
      findUnique: vi.fn(),
    },
    provincia: {
      findUnique: vi.fn(),
    },
    distrito: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('../../../services/auditService', () => ({
  __esModule: true,
  AuditService: {
    createAuditLog: vi.fn().mockResolvedValue(undefined),
  },
}));

const prismaMock = prisma as any;

// Helper function to mock valid ubigeo
const mockValidUbigeo = () => {
  prismaMock.departamento.findUnique.mockResolvedValue({ 
    id: 'dep-1', 
    nombre: 'Lima' 
  });
  prismaMock.provincia.findUnique.mockResolvedValue({ 
    id: 'prov-1', 
    nombre: 'Lima', 
    departamentoId: 'dep-1' 
  });
  prismaMock.distrito.findUnique.mockResolvedValue({ 
    id: 'dist-1', 
    nombre: 'Miraflores', 
    provinciaId: 'prov-1' 
  });
};

describe('Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== CREATE CLIENT TESTS ====================
  describe('createClient', () => {
    it('should create a new client with DNI successfully', async () => {
      const clientDniData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address 123',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      const createdClient = {
        id: 'client-123',
        ...clientDniData,
        email: 'test@example.com',
        razonSocial: null,
        isActive: true,
        usuarioCreacion: 'user-123',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Client;

      mockValidUbigeo();
      prismaMock.client.findFirst.mockResolvedValue(null); // No duplicates
      prismaMock.client.create.mockResolvedValue(createdClient);

      const client = await clientService.createClient(clientDniData, 'user-123');

      expect(client).toEqual(createdClient);
      expect(prismaMock.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            numeroDocumento: '12345678',
            email: 'test@example.com',
          }),
        }),
      );
      expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
    });

    it('should create a new client with Pasaporte and normalize documento', async () => {
      const clientPassportData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'Pasaporte',
        numeroDocumento: 'a1234567',
        email: 'passport@example.com',
        telefono: '987654321',
        direccion: 'Test Address 123',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'John',
        apellidos: 'Doe',
      };

      const createdClientPassport = {
        id: 'client-456',
        ...clientPassportData,
        numeroDocumento: 'A1234567',
        email: 'passport@example.com',
        razonSocial: null,
        isActive: true,
        usuarioCreacion: 'user-456',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Client;

      mockValidUbigeo();
      prismaMock.client.findFirst.mockResolvedValue(null);
      prismaMock.client.create.mockResolvedValue(createdClientPassport);

      const client = await clientService.createClient(clientPassportData, 'user-456');

      expect(client).toEqual(createdClientPassport);
      expect(prismaMock.client.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ numeroDocumento: 'A1234567' }),
        }),
      );
      expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
    });

    it('should create a new client with RUC successfully', async () => {
      const clientRucData: CreateClientData = {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        email: 'empresa@example.com',
        telefono: '014445566',
        direccion: 'Av. Empresarial 456',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        razonSocial: 'Empresa Test SAC',
      };

      const createdClient = {
        id: 'client-ruc',
        ...clientRucData,
        nombres: null,
        apellidos: null,
        email: 'empresa@example.com',
        isActive: true,
        usuarioCreacion: 'user-123',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Client;

      mockValidUbigeo();
      prismaMock.client.findFirst.mockResolvedValue(null);
      prismaMock.client.create.mockResolvedValue(createdClient);

      const client = await clientService.createClient(clientRucData, 'user-123');

      expect(client.razonSocial).toBe('Empresa Test SAC');
      expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
    });

    it('should create a new client with CE successfully', async () => {
      const clientCeData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'CE',
        numeroDocumento: '123456789012',
        email: 'ce@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Extranjero',
        apellidos: 'Test',
      };

      const createdClient = {
        id: 'client-ce',
        ...clientCeData,
        razonSocial: null,
        email: 'ce@example.com',
        isActive: true,
        usuarioCreacion: 'user-123',
        usuarioActualizacion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Client;

      mockValidUbigeo();
      prismaMock.client.findFirst.mockResolvedValue(null);
      prismaMock.client.create.mockResolvedValue(createdClient);

      const client = await clientService.createClient(clientCeData, 'user-123');

      expect(client.tipoDocumento).toBe('CE');
      expect(client.numeroDocumento).toBe('123456789012');
    });

    it('should fail if tipoEntidad is missing or invalid', async () => {
      const invalidData: any = {
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      await expect(clientService.createClient(invalidData)).rejects.toThrow(
        'El tipo de entidad es obligatorio y debe ser Cliente, Proveedor o Ambos'
      );
    });

    it('should fail if DNI format is invalid', async () => {
      const invalidDni: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '1234567', // Solo 7 dígitos
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      await expect(clientService.createClient(invalidDni)).rejects.toThrow(
        'El DNI debe tener exactamente 8 dígitos numéricos'
      );
    });

    it('should fail if CE format is invalid', async () => {
      const invalidCe: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'CE',
        numeroDocumento: '12345678901', // Solo 11 dígitos
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      await expect(clientService.createClient(invalidCe)).rejects.toThrow(
        'El CE debe tener exactamente 12 dígitos numéricos'
      );
    });

    it('should fail if RUC format is invalid', async () => {
      const invalidRuc: CreateClientData = {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '2012345678', // Solo 10 dígitos
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        razonSocial: 'Test SAC',
      };

      await expect(clientService.createClient(invalidRuc)).rejects.toThrow(
        'El RUC debe tener exactamente 11 dígitos numéricos'
      );
    });

    it('should fail if Pasaporte format is invalid', async () => {
      const invalidPassport: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'Pasaporte',
        numeroDocumento: '12345678', // Sin letra inicial
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      await expect(clientService.createClient(invalidPassport)).rejects.toThrow(
        'El Pasaporte debe tener el formato: 1 letra seguida de 7 dígitos'
      );
    });

    it('should fail if nombres/apellidos are missing for DNI', async () => {
      const missingNames: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
      };

      await expect(clientService.createClient(missingNames)).rejects.toThrow(
        'Para DNI, CE y Pasaporte son requeridos nombres y apellidos'
      );
    });

    it('should fail if razonSocial is missing for RUC', async () => {
      const missingRazonSocial: CreateClientData = {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
      };

      await expect(clientService.createClient(missingRazonSocial)).rejects.toThrow(
        'Para RUC es requerida la razón social'
      );
    });

    it('should fail if departamento does not exist', async () => {
      const clientData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-invalid',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      prismaMock.departamento.findUnique.mockResolvedValue(null);

      await expect(clientService.createClient(clientData)).rejects.toThrow(
        'Departamento inválido'
      );
    });

    it('should fail if provincia does not belong to departamento', async () => {
      const clientData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      prismaMock.departamento.findUnique.mockResolvedValue({ id: 'dep-1', nombre: 'Lima' });
      prismaMock.provincia.findUnique.mockResolvedValue({ 
        id: 'prov-1', 
        nombre: 'Callao', 
        departamentoId: 'dep-2' // Diferente departamento
      });

      await expect(clientService.createClient(clientData)).rejects.toThrow(
        'La provincia no pertenece al departamento seleccionado'
      );
    });

    it('should fail if distrito does not belong to provincia', async () => {
      const clientData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      prismaMock.departamento.findUnique.mockResolvedValue({ id: 'dep-1', nombre: 'Lima' });
      prismaMock.provincia.findUnique.mockResolvedValue({ 
        id: 'prov-1', 
        nombre: 'Lima', 
        departamentoId: 'dep-1' 
      });
      prismaMock.distrito.findUnique.mockResolvedValue({ 
        id: 'dist-1', 
        nombre: 'Miraflores', 
        provinciaId: 'prov-2' // Diferente provincia
      });

      await expect(clientService.createClient(clientData)).rejects.toThrow(
        'El distrito no pertenece a la provincia seleccionada'
      );
    });

    it('should fail if email already exists', async () => {
      const clientData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'duplicate@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      mockValidUbigeo();
      prismaMock.client.findFirst.mockResolvedValueOnce({
        id: 'existing-client',
        email: 'duplicate@example.com',
        isActive: true,
      });

      await expect(clientService.createClient(clientData)).rejects.toThrow(
        'Ya existe un cliente con este email'
      );
    });

    it('should fail if document already exists', async () => {
      const clientData: CreateClientData = {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'test@example.com',
        telefono: '987654321',
        direccion: 'Test Address',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
        nombres: 'Test',
        apellidos: 'User',
      };

      mockValidUbigeo();
      prismaMock.client.findFirst
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce({     // Document check
          id: 'existing-client',
          numeroDocumento: '12345678',
          isActive: true,
        });

      await expect(clientService.createClient(clientData)).rejects.toThrow(
        'Ya existe un cliente con este número de documento'
      );
    });
  });

  // ==================== GET CLIENTS TESTS ====================
  describe('getClients', () => {
    it('should return all active clients', async () => {
      const mockClients = [
        { id: 'client-1', nombres: 'Juan', apellidos: 'Perez', isActive: true },
        { id: 'client-2', nombres: 'Maria', apellidos: 'Lopez', isActive: true },
      ];

      prismaMock.client.findMany.mockResolvedValue(mockClients);

      const clients = await clientService.getClients();

      expect(clients).toEqual(mockClients);
      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        })
      );
    });

    it('should filter clients by search term', async () => {
      const mockClients = [
        { id: 'client-1', nombres: 'Juan', apellidos: 'Perez', isActive: true },
      ];

      prismaMock.client.findMany.mockResolvedValue(mockClients);

      const clients = await clientService.getClients({ search: 'Juan' });

      expect(clients).toEqual(mockClients);
      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
          }),
        })
      );
    });

    it('should filter clients by departamento', async () => {
      prismaMock.client.findMany.mockResolvedValue([]);

      await clientService.getClients({ departamentoId: 'dep-1' });

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ departamentoId: 'dep-1' }),
        })
      );
    });

    it('should filter clients by tipo de documento', async () => {
      prismaMock.client.findMany.mockResolvedValue([]);

      await clientService.getClients({ tipoDocumento: 'DNI' });

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tipoDocumento: 'DNI' }),
        })
      );
    });

    it('should filter clients by tipo de entidad', async () => {
      prismaMock.client.findMany.mockResolvedValue([]);

      await clientService.getClients({ tipoEntidad: 'Cliente' });

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ tipoEntidad: 'Cliente' }),
        })
      );
    });

    it('should filter clients by date range', async () => {
      prismaMock.client.findMany.mockResolvedValue([]);

      await clientService.getClients({
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-12-31',
      });

      expect(prismaMock.client.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.any(Object),
          }),
        })
      );
    });
  });

  // ==================== UPDATE CLIENT TESTS ====================
  describe('updateClient', () => {
    it('should update client successfully', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
      };

      const updateData: UpdateClientData = {
        telefono: '999888777',
        direccion: 'Nueva Direccion 123',
      };

      const updatedClient = {
        ...existingClient,
        ...updateData,
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);
      prismaMock.client.update.mockResolvedValue(updatedClient);

      const result = await clientService.updateClient('client-1', updateData, 'user-123');

      expect(result.telefono).toBe('999888777');
      expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
    });

    it('should fail if client does not exist', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      await expect(
        clientService.updateClient('non-existent', { telefono: '123456789' })
      ).rejects.toThrow('Cliente no encontrado');
    });

    it('should validate document length when updating tipoDocumento', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);

      await expect(
        clientService.updateClient('client-1', {
          tipoDocumento: 'RUC',
          numeroDocumento: '123456', // Too short for RUC
        })
      ).rejects.toThrow('El RUC debe tener exactamente 11 dígitos');
    });

    it('should validate nombres for DNI when updating', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);

      await expect(
        clientService.updateClient('client-1', { nombres: '' })
      ).rejects.toThrow('Para DNI, CE y Pasaporte son requeridos nombres');
    });

    it('should validate ubigeo consistency when updating', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1',
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);
      prismaMock.departamento.findUnique.mockResolvedValue({ id: 'dep-2', nombre: 'Cusco' });
      prismaMock.provincia.findUnique.mockResolvedValue({ 
        id: 'prov-1', 
        nombre: 'Lima', 
        departamentoId: 'dep-1' // Different from dep-2
      });

      await expect(
        clientService.updateClient('client-1', { departamentoId: 'dep-2' })
      ).rejects.toThrow('La provincia no pertenece al departamento seleccionado');
    });
  });

  // ==================== REACTIVATE CLIENT TESTS ====================
  describe('reactivateClient', () => {
    it('should reactivate a client successfully', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        isActive: false,
      };

      const reactivatedClient = {
        ...existingClient,
        isActive: true,
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);
      prismaMock.client.update.mockResolvedValue(reactivatedClient);

      const result = await clientService.reactivateClient('client-1', 'user-123');

      expect(result.isActive).toBe(true);
      expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
    });

    it('should fail if client does not exist', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      await expect(
        clientService.reactivateClient('non-existent')
      ).rejects.toThrow('Cliente no encontrado');
    });

    it('should fail if document format is invalid during reactivation', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '1234567', // Invalid DNI length
        isActive: false,
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);

      await expect(
        clientService.reactivateClient('client-1')
      ).rejects.toThrow('No se puede reactivar: el DNI debe tener exactamente 8 dígitos');
    });

    it('should sanitize document and check for conflicts', async () => {
      const existingClient = {
        id: 'client-1',
        tipoDocumento: 'DNI',
        numeroDocumento: '12-345-678', // Needs sanitization
        isActive: false,
      };

      prismaMock.client.findUnique.mockResolvedValue(existingClient);
      prismaMock.client.findFirst.mockResolvedValue({
        id: 'client-2',
        numeroDocumento: '12345678',
        isActive: true,
      });

      await expect(
        clientService.reactivateClient('client-1')
      ).rejects.toThrow('No se puede reactivar: el documento saneado ya está en uso por otro cliente activo');
    });
  });

  // ==================== GET CLIENT STATS TESTS ====================
  describe('getClientStats', () => {
    it('should return client statistics', async () => {
      prismaMock.client.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85)  // active
        .mockResolvedValueOnce(15); // inactive

      prismaMock.client.groupBy
        .mockResolvedValueOnce([
          { departamentoId: 'dep-1', _count: { departamentoId: 50 } },
          { departamentoId: 'dep-2', _count: { departamentoId: 35 } },
        ])
        .mockResolvedValueOnce([
          { tipoDocumento: 'DNI', _count: { tipoDocumento: 60 } },
          { tipoDocumento: 'RUC', _count: { tipoDocumento: 25 } },
        ]);

      const stats = await clientService.getClientStats();

      expect(stats.total).toBe(100);
      expect(stats.active).toBe(85);
      expect(stats.inactive).toBe(15);
      expect(stats.byDepartamento).toHaveLength(2);
      expect(stats.byDocumentType).toHaveLength(2);
    });

    it('should handle errors in getClientStats', async () => {
      prismaMock.client.count.mockRejectedValue(new Error('Database error'));

      await expect(clientService.getClientStats()).rejects.toThrow('Error al obtener estadísticas');
    });
  });

  // ==================== GET CLIENT BY ID TESTS ====================
  describe('getClientById', () => {
    it('should return client by ID', async () => {
      const mockClient = {
        id: 'client-1',
        nombres: 'Juan',
        apellidos: 'Perez',
      };

      prismaMock.client.findUnique.mockResolvedValue(mockClient);

      const client = await clientService.getClientById('client-1');

      expect(client).toEqual(mockClient);
      expect(prismaMock.client.findUnique).toHaveBeenCalledWith({
        where: { id: 'client-1' },
      });
    });

    it('should return null if client does not exist', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      const client = await clientService.getClientById('non-existent');

      expect(client).toBeNull();
    });
  });

  // ==================== GET CLIENT BY EMAIL TESTS ====================
  describe('getClientByEmail', () => {
    it('should return client by email', async () => {
      const mockClient = {
        id: 'client-1',
        email: 'test@example.com',
      };

      prismaMock.client.findUnique.mockResolvedValue(mockClient);

      const client = await clientService.getClientByEmail('test@example.com');

      expect(client).toEqual(mockClient);
    });

    it('should normalize email to lowercase', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      await clientService.getClientByEmail('TEST@EXAMPLE.COM');

      expect(prismaMock.client.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null if client with email does not exist', async () => {
      prismaMock.client.findUnique.mockResolvedValue(null);

      const client = await clientService.getClientByEmail('nonexistent@example.com');

      expect(client).toBeNull();
    });
  });

  // ==================== GET CLIENT BY DOCUMENT TESTS ====================
  describe('getClientByDocument', () => {
    it('should return client by document number', async () => {
      const mockClient = {
        id: 'client-1',
        numeroDocumento: '12345678',
      };

      prismaMock.client.findFirst.mockResolvedValue(mockClient);

      const client = await clientService.getClientByDocument('12345678');

      expect(client).toEqual(mockClient);
    });

    it('should normalize document to uppercase', async () => {
      prismaMock.client.findFirst.mockResolvedValue(null);

      await clientService.getClientByDocument('a1234567');

      expect(prismaMock.client.findFirst).toHaveBeenCalledWith({
        where: { numeroDocumento: 'A1234567' },
      });
    });

    it('should return null if client with document does not exist', async () => {
      prismaMock.client.findFirst.mockResolvedValue(null);

      const client = await clientService.getClientByDocument('99999999');

      expect(client).toBeNull();
    });
  });
});
