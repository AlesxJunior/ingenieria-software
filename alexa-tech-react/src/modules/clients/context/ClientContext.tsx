import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../../../utils/api';
import { useUI } from '../../../context/UIContext';
import { useNotification } from '../../../context/NotificationContext';

// Definición de la interfaz Client (movida desde AppContext)
export interface Client {
  tipoEntidad: 'Cliente' | 'Proveedor' | 'Ambos';
  id: string;
  nombres?: string;
  apellidos?: string;
  razonSocial?: string;
  email: string;
  telefono: string;
  tipoDocumento: 'DNI' | 'CE' | 'RUC';
  numeroDocumento: string;
  direccion: string;
  ciudad: string;
  // Campos de Ubigeo
  departamentoId: string;
  provinciaId: string;
  distritoId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ClientContextType {
  clients: Client[];
  clientsPagination: {
    currentPage: number;
    totalPages: number;
    totalClients: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loadClients: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    tipoEntidad?: 'Cliente' | 'Proveedor' | 'Ambos';
    tipoDocumento?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    departamentoId?: string;
    provinciaId?: string;
    distritoId?: string;
  }) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  reactivateClient: (id: string) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsPagination, setClientsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalClients: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { setIsLoading } = useUI();
  const { showSuccess, showError } = useNotification();

  const loadClients = useCallback(async (params?: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.getClients(params);
      if (response.success && response.data) {
        setClients(response.data.clients.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt), updatedAt: new Date(c.updatedAt) })));
        setClientsPagination(response.data.pagination);
      } else {
        showError('Error al cargar los clientes');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      showError('Error al cargar los clientes');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showError]);

  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      const response = await apiService.createClient(clientData);
      if (!response.success) throw new Error(response.message || 'Error al registrar el cliente');
      showSuccess(`Cliente registrado exitosamente`);
      await loadClients();
    } catch (error: any) {
      console.error('Error creating client:', error);
      showError(error.message || 'Error al registrar el cliente');
      throw error; // Re-throw para que el modal pueda manejarlo
    } finally {
      setIsLoading(false);
    }
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    try {
      setIsLoading(true);
      const response = await apiService.updateClient(id, clientData);
      if (response.success) {
        showSuccess('Cliente actualizado exitosamente');
        await loadClients();
      } else {
        showError(response.message || 'Error al actualizar el cliente');
      }
    } catch (error: any) {
      console.error('Error updating client:', error);
      showError(error.message || 'Error al actualizar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.deleteClient(id);
      if (response.success) {
        showSuccess('Cliente eliminado exitosamente');
        await loadClients();
      } else {
        showError(response.message || 'Error al eliminar el cliente');
      }
    } catch (error: any) {
      console.error('Error deleting client:', error);
      showError(error.message || 'Error al eliminar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateClient = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await apiService.reactivateClient(id);
      if (response.success) {
        showSuccess('Cliente reactivado exitosamente');
        await loadClients();
      } else {
        showError(response.message || 'Error al reactivar el cliente');
      }
    } catch (error: any) {
      console.error('Error reactivating client:', error);
      showError(error.message || 'Error al reactivar el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientById = (id: string) => {
    return clients.find(c => c.id === id);
  };

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  return (
    <ClientContext.Provider value={{ clients, clientsPagination, loadClients, addClient, updateClient, deleteClient, reactivateClient, getClientById }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClients = (): ClientContextType => {
  const context = React.useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};
