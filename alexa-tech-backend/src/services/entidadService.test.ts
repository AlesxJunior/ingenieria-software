
import { PrismaClient, Client, TipoEntidad } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { clientService, CreateClientData, ClientFilters } from './entidadService';
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

describe('Client Service', () => {
  it('should create a new client with DNI successfully', async () => {
    const clientDniData: CreateClientData = {
      tipoEntidad: 'Cliente',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      email: 'test@example.com',
      telefono: '987654321',
      direccion: 'Test Address 123',
      ciudad: 'Test City',
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

    prismaMock.$transaction.mockResolvedValue([createdClient]);

    const client = await clientService.createClient(clientDniData, 'user-123');

    expect(client).toEqual(createdClient);
    expect(AuditService.createAuditLog).toHaveBeenCalledTimes(1);
  });
});
