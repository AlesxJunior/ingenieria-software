import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useApp } from '../hooks/useApp';
import NuevoClienteModal from '../components/NuevoClienteModal';
import EditarClienteModal from '../components/EditarClienteModal';

const TableContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding: 10px 40px 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    width: 300px;
    
    &:focus {
      outline: none;
      border-color: #007bff;
    }

    @media (max-width: 768px) {
      width: 100%;
    }
  }

  i {
    position: absolute;
    right: 15px;
    color: #666;
    pointer-events: none;
  }
`;

const NewClientButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const AdvancedSearchContainer = styled.div<{ show: boolean }>`
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: ${props => props.show ? 'block' : 'none'};
`;

const FilterRow = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #007bff;
  border-radius: 4px;
  background: white;
  color: #007bff;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #007bff;
    color: white;
  }
`;

const ToggleButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #6c757d;
  border-radius: 4px;
  background: white;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  margin-left: 10px;

  &:hover {
    background: #6c757d;
    color: white;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;

  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  th {
    background-color: #f8f9fa;
    font-weight: 600;
    color: #333;
  }

  tbody tr:hover {
    background-color: #f8f9fa;
  }
`;

const ResponsiveTable = styled.div`
  overflow-x: auto;
`;



const ActionButton = styled.button<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 8px;
  font-size: 12px;

  &:hover {
    opacity: 0.8;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;

  h3 {
    margin: 0 0 16px 0;
    color: #333;
  }

  p {
    margin: 0 0 24px 0;
    color: #666;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button<{ color: string }>`
  background-color: ${props => props.color};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    opacity: 0.8;
  }
`;





const ListaClientes: React.FC = () => {
  const { clients, deleteClient, showSuccess, showError } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Filtrar clientes basado en el término de búsqueda
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleNuevoCliente = () => {
    setIsNuevoClienteModalOpen(true);
  };

  const handleCloseNuevoClienteModal = () => {
    setIsNuevoClienteModalOpen(false);
  };

  const handleEdit = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (clientId: string) => {
    setClientToDelete(clientId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      try {
        deleteClient(clientToDelete);
        showSuccess('Cliente eliminado exitosamente');
        setShowDeleteModal(false);
        setClientToDelete(null);
      } catch {
        showError('Error al eliminar el cliente. Por favor, inténtalo de nuevo.');
        setShowDeleteModal(false);
        setClientToDelete(null);
      }
    }
  };

  const handleSaveClient = (clientData: any) => {
    try {
      // Aquí se implementaría la lógica para guardar los cambios del cliente
      // TODO: Usar clientData para actualizar el cliente
      console.log('Datos del cliente a guardar:', clientData);
      showSuccess('Cliente actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedClient(null);
    } catch {
      showError('Error al actualizar el cliente. Por favor, inténtalo de nuevo.');
    }
  };



  const clearFilters = () => {
    setSearchTerm('');
  };

  return (
    <Layout title="Lista de Clientes">
      <TableContainer>
        <TableHeader>
          <SearchBox>
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="fas fa-search"></i>
            <ToggleButton onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              {showAdvancedSearch ? 'Ocultar Filtros' : 'Filtros Avanzados'}
            </ToggleButton>
          </SearchBox>

          <NewClientButton onClick={handleNuevoCliente}>
            <i className="fas fa-plus"></i>
            Nuevo Cliente
          </NewClientButton>
        </TableHeader>

        <AdvancedSearchContainer show={showAdvancedSearch}>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Búsqueda Avanzada</FilterLabel>
              <p style={{fontSize: '14px', color: '#666', margin: '5px 0'}}>
                La búsqueda actual incluye nombre, email y teléfono
              </p>
            </FilterGroup>

            <FilterButton onClick={clearFilters}>
              Limpiar Filtros
            </FilterButton>
          </FilterRow>
        </AdvancedSearchContainer>

        <ResponsiveTable>
          <Table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th>Fecha de Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>{client.name}</td>
                    <td>{client.email}</td>
                    <td>{client.phone}</td>
                    <td>{client.address}</td>
                    <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                    <td>
                      <ActionButton 
                        onClick={() => handleEdit(client.id)}
                        color="#007bff"
                      >
                        Editar
                      </ActionButton>
                      <ActionButton 
                        onClick={() => handleDelete(client.id)}
                        color="#dc3545"
                      >
                        Eliminar
                      </ActionButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No se encontraron clientes que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ResponsiveTable>
      </TableContainer>

      {showDeleteModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>Confirmar Eliminación</h3>
            <p>¿Estás seguro de que deseas eliminar este cliente?</p>
            <ModalButtons>
              <ModalButton 
                onClick={() => setShowDeleteModal(false)}
                color="#6c757d"
              >
                Cancelar
              </ModalButton>
              <ModalButton 
                onClick={confirmDelete}
                color="#dc3545"
              >
                Eliminar
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
      
      <NuevoClienteModal
        isOpen={isNuevoClienteModalOpen}
        onClose={handleCloseNuevoClienteModal}
      />
      
      <EditarClienteModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        client={selectedClient}
        onSave={handleSaveClient}
      />
    </Layout>
  );
};

export default ListaClientes;