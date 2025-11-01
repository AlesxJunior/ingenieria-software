import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ClientProvider, useClients } from '../context/ClientContext';
import * as apiModule from '../../../utils/api';
import type { ReactNode } from 'react';

// Mock de los contextos dependientes
vi.mock('../../../context/UIContext', () => ({
  useUI: () => ({
    setIsLoading: vi.fn(),
  }),
}));

vi.mock('../../../context/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('../../../utils/api', () => ({
  apiService: {
    getClients: vi.fn(),
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
    reactivateClient: vi.fn(),
  },
}));

describe('ClientContext', () => {
  const { apiService } = apiModule;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ClientProvider>{children}</ClientProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con array vacío de clientes', async () => {
      // Mock para la carga inicial automática
      vi.mocked(apiService.getClients).mockResolvedValue({
        success: true,
        data: {
          clients: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: 'Success',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar a que termine la carga inicial
      await waitFor(() => {
        expect(result.current.clients).toEqual([]);
      });

      expect(result.current.clientsPagination.totalClients).toBe(0);
    });
  });

  describe('loadClients', () => {
    it('debe cargar clientes exitosamente', async () => {
      const mockClients = [
        {
          id: '1',
          tipoEntidad: 'Cliente' as const,
          nombres: 'Juan',
          apellidos: 'Pérez',
          email: 'juan@test.com',
          telefono: '987654321',
          tipoDocumento: 'DNI' as const,
          numeroDocumento: '12345678',
          direccion: 'Av. Principal 123',
          ciudad: 'Lima',
          departamentoId: '15',
          provinciaId: '1501',
          distritoId: '150101',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: mockClients,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients).toEqual([]));

      await act(async () => {
        await result.current.loadClients();
      });

      expect(result.current.clients).toHaveLength(1);
      expect(result.current.clients[0].nombres).toBe('Juan');
      expect(result.current.clients[0].tipoEntidad).toBe('Cliente');
      expect(result.current.clientsPagination.totalClients).toBe(1);
    });

    it('debe cargar clientes con filtros', async () => {
      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients).toEqual([]));

      await act(async () => {
        await result.current.loadClients({
          tipoEntidad: 'Cliente',
          tipoDocumento: 'DNI',
          search: 'Juan',
        });
      });

      expect(apiService.getClients).toHaveBeenCalledWith({
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        search: 'Juan',
      });
    });

    it('debe manejar error al cargar clientes', async () => {
      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients).toEqual([]));

      await act(async () => {
        await result.current.loadClients();
      });

      // Debe mantener el estado anterior
      expect(result.current.clients).toEqual([]);
    });
  });

  describe('getClientById', () => {
    it('debe retornar cliente por ID', async () => {
      const mockClients = [
        {
          id: 'C001',
          tipoEntidad: 'Cliente' as const,
          nombres: 'María',
          apellidos: 'García',
          email: 'maria@test.com',
          telefono: '987654321',
          tipoDocumento: 'DNI' as const,
          numeroDocumento: '87654321',
          direccion: 'Calle Lima 456',
          ciudad: 'Lima',
          departamentoId: '15',
          provinciaId: '1501',
          distritoId: '150101',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiService.getClients).mockResolvedValue({
        success: true,
        data: {
          clients: mockClients,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: 'Success',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients.length).toBeGreaterThan(0));

      const client = result.current.getClientById('C001');
      expect(client).toBeDefined();
      expect(client?.nombres).toBe('María');
    });

    it('debe retornar undefined si no existe el cliente', async () => {
      vi.mocked(apiService.getClients).mockResolvedValue({
        success: true,
        data: {
          clients: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: 'Success',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients).toEqual([]));

      const client = result.current.getClientById('C999');
      expect(client).toBeUndefined();
    });
  });

  describe('addClient', () => {
    it('debe agregar cliente exitosamente', async () => {
      const mockClients = [
        {
          id: 'C001',
          tipoEntidad: 'Cliente' as const,
          nombres: 'Pedro',
          apellidos: 'López',
          email: 'pedro@test.com',
          telefono: '987654321',
          tipoDocumento: 'DNI' as const,
          numeroDocumento: '11111111',
          direccion: 'Av. Test 789',
          ciudad: 'Lima',
          departamentoId: '15',
          provinciaId: '1501',
          distritoId: '150101',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: mockClients,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        });

      vi.mocked(apiService.createClient).mockResolvedValue({
        success: true,
        data: mockClients[0],
        message: 'Cliente creado',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients).toEqual([]));

      const newClient = {
        tipoEntidad: 'Cliente' as const,
        nombres: 'Pedro',
        apellidos: 'López',
        email: 'pedro@test.com',
        telefono: '987654321',
        tipoDocumento: 'DNI' as const,
        numeroDocumento: '11111111',
        direccion: 'Av. Test 789',
        ciudad: 'Lima',
        departamentoId: '15',
        provinciaId: '1501',
        distritoId: '150101',
        isActive: true,
      };

      await act(async () => {
        await result.current.addClient(newClient);
      });

      expect(apiService.createClient).toHaveBeenCalledWith(newClient);
      await waitFor(() => expect(result.current.clients.length).toBe(1));
    });

    it('debe manejar error al agregar cliente', async () => {
      vi.mocked(apiService.getClients).mockResolvedValue({
        success: true,
        data: {
          clients: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
        message: 'Success',
      });

      vi.mocked(apiService.createClient).mockResolvedValue({
        success: false,
        message: 'Error al crear cliente',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients).toEqual([]));

      const newClient = {
        tipoEntidad: 'Cliente' as const,
        nombres: 'Test',
        apellidos: 'Error',
        email: 'error@test.com',
        telefono: '987654321',
        tipoDocumento: 'DNI' as const,
        numeroDocumento: '99999999',
        direccion: 'Test',
        ciudad: 'Test',
        departamentoId: '15',
        provinciaId: '1501',
        distritoId: '150101',
        isActive: true,
      };

      await expect(
        act(async () => {
          await result.current.addClient(newClient);
        })
      ).rejects.toThrow();
    });
  });

  describe('updateClient', () => {
    it('debe actualizar cliente exitosamente', async () => {
      const mockClients = [
        {
          id: 'C001',
          tipoEntidad: 'Cliente' as const,
          nombres: 'Ana',
          apellidos: 'Torres',
          email: 'ana@test.com',
          telefono: '987654321',
          tipoDocumento: 'DNI' as const,
          numeroDocumento: '22222222',
          direccion: 'Calle Vieja',
          ciudad: 'Lima',
          departamentoId: '15',
          provinciaId: '1501',
          distritoId: '150101',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      const updatedClient = {
        ...mockClients[0],
        direccion: 'Calle Nueva',
      };

      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: mockClients,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [updatedClient],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        });

      vi.mocked(apiService.updateClient).mockResolvedValue({
        success: true,
        data: updatedClient,
        message: 'Cliente actualizado',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients.length).toBe(1));

      await act(async () => {
        await result.current.updateClient('C001', { direccion: 'Calle Nueva' });
      });

      expect(apiService.updateClient).toHaveBeenCalledWith('C001', { direccion: 'Calle Nueva' });
      await waitFor(() => {
        const client = result.current.getClientById('C001');
        expect(client?.direccion).toBe('Calle Nueva');
      });
    });
  });

  describe('deleteClient', () => {
    it('debe eliminar cliente exitosamente', async () => {
      const mockClients = [
        {
          id: 'C001',
          tipoEntidad: 'Cliente' as const,
          nombres: 'Luis',
          apellidos: 'Martínez',
          email: 'luis@test.com',
          telefono: '987654321',
          tipoDocumento: 'DNI' as const,
          numeroDocumento: '33333333',
          direccion: 'Av. Delete',
          ciudad: 'Lima',
          departamentoId: '15',
          provinciaId: '1501',
          distritoId: '150101',
          isActive: true,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
        },
      ];

      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: mockClients,
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 0,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        });

      vi.mocked(apiService.deleteClient).mockResolvedValue({
        success: true,
        message: 'Cliente eliminado',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients.length).toBe(1));

      await act(async () => {
        await result.current.deleteClient('C001');
      });

      expect(apiService.deleteClient).toHaveBeenCalledWith('C001');
      await waitFor(() => expect(result.current.clients.length).toBe(0));
    });
  });

  describe('reactivateClient', () => {
    it('debe reactivar cliente exitosamente', async () => {
      const inactiveClient = {
        id: 'C001',
        tipoEntidad: 'Cliente' as const,
        nombres: 'Carlos',
        apellidos: 'Reyes',
        email: 'carlos@test.com',
        telefono: '987654321',
        tipoDocumento: 'DNI' as const,
        numeroDocumento: '44444444',
        direccion: 'Av. Reactive',
        ciudad: 'Lima',
        departamentoId: '15',
        provinciaId: '1501',
        distritoId: '150101',
        isActive: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      };

      const activeClient = {
        ...inactiveClient,
        isActive: true,
      };

      vi.mocked(apiService.getClients)
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [inactiveClient],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            clients: [activeClient],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
          },
          message: 'Success',
        });

      vi.mocked(apiService.reactivateClient).mockResolvedValue({
        success: true,
        message: 'Cliente reactivado',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.clients.length).toBe(1));
      expect(result.current.clients[0].isActive).toBe(false);

      await act(async () => {
        await result.current.reactivateClient('C001');
      });

      expect(apiService.reactivateClient).toHaveBeenCalledWith('C001');
      await waitFor(() => {
        const client = result.current.getClientById('C001');
        expect(client?.isActive).toBe(true);
      });
    });
  });

  describe('Paginación', () => {
    it('debe actualizar la información de paginación correctamente', async () => {
      vi.mocked(apiService.getClients).mockResolvedValue({
        success: true,
        data: {
          clients: [],
          pagination: {
            currentPage: 2,
            totalPages: 5,
            totalClients: 50,
            hasNextPage: true,
            hasPrevPage: true,
          },
        },
        message: 'Success',
      });

      const { result } = renderHook(() => useClients(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => {
        expect(result.current.clientsPagination.currentPage).toBe(2);
      });

      expect(result.current.clientsPagination.totalPages).toBe(5);
      expect(result.current.clientsPagination.totalClients).toBe(50);
      expect(result.current.clientsPagination.hasNextPage).toBe(true);
      expect(result.current.clientsPagination.hasPrevPage).toBe(true);
    });
  });
});
