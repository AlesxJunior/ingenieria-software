
import { PrismaClient, Client } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { clientService, CreateClientData } from './entidadService';
import { prisma } from '../config/database';
import { AuditService } from './auditService';

jest.mock('../config/database', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

jest.mock('./auditService', () => ({
  __esModule: true,
  AuditService: {
    createAuditLog: jest.fn().mockResolvedValue(undefined),
  },
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
  (AuditService.createAuditLog as jest.Mock).mockClear();
});

describe('Client Service', () => {
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
