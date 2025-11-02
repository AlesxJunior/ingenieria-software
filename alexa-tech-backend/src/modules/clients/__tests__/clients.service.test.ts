import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient, Client } from '@prisma/client';
import { clientService, CreateClientData } from '../clients.service';
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

describe('Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
      razonSocial: null,
      isActive: true,
      usuarioCreacion: 'user-123',
      usuarioActualizacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Client;

    prismaMock.departamento.findUnique.mockResolvedValue({ id: 'dep-1', nombre: 'Dep 1' } as any);
    prismaMock.provincia.findUnique.mockResolvedValue({ id: 'prov-1', nombre: 'Prov 1', departamentoId: 'dep-1' } as any);
    prismaMock.distrito.findUnique.mockResolvedValue({ id: 'dist-1', nombre: 'Dist 1', provinciaId: 'prov-1' } as any);

    prismaMock.client.create.mockResolvedValue(createdClient);

    const client = await clientService.createClient(clientDniData, 'user-123');

    expect(client).toEqual(createdClient);
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
      razonSocial: null,
      isActive: true,
      usuarioCreacion: 'user-456',
      usuarioActualizacion: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Client;

    prismaMock.departamento.findUnique.mockResolvedValue({ id: 'dep-1', nombre: 'Dep 1' } as any);
    prismaMock.provincia.findUnique.mockResolvedValue({ id: 'prov-1', nombre: 'Prov 1', departamentoId: 'dep-1' } as any);
    prismaMock.distrito.findUnique.mockResolvedValue({ id: 'dist-1', nombre: 'Dist 1', provinciaId: 'prov-1' } as any);

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
});
