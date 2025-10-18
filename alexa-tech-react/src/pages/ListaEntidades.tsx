import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useClients } from '../context/ClientContext';
import { useUI } from '../context/UIContext';
import NuevaEntidadModal from '../components/NuevaEntidadModal';
import EditarEntidadModal from '../components/EditarEntidadModal';
import { media } from '../styles/breakpoints';

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

  ${media.tablet} {
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

    ${media.tablet} {
      width: 100%;
    }
    
    ${media.mobile} {
      font-size: 16px; /* Evita zoom en iOS */
      padding: 12px 40px 12px 15px;
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

const AdvancedSearchContainer = styled.div<{ $show: boolean }>`
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: ${props => props.$show ? 'block' : 'none'};
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
  
  ${media.mobile} {
    display: none;
  }
`;

const MobileCardContainer = styled.div`
  display: none;
  
  ${media.mobile} {
    display: block;
    padding: 12px;
    margin-top: 20px;
  }
`;

const MobileCard = styled.div`
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const MobileCardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
`;



const MobileCardBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileCardLabel = styled.span`
  font-size: 12px;
  color: #666;
  font-weight: 500;
  margin-bottom: 2px;
`;

const MobileCardValue = styled.span`
  font-size: 14px;
  color: #333;
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  border-top: 1px solid #dee2e6;
  padding-top: 12px;
`;

const ResponsiveTable = styled.div`
  overflow-x: auto;
`;



const ActionButton = styled.button<{ $color: string }>`
  background-color: ${props => props.$color};
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







const ListaEntidades: React.FC = () => {
  const { clients, loadClients, updateClient } = useClients();
  const { isLoading } = useUI();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // Estados para filtros avanzados
  const [tipoEntidadFilter, setTipoEntidadFilter] = useState('');
  const [tipoDocumentoFilter, setTipoDocumentoFilter] = useState('');
  const [ciudadFilter, setCiudadFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  // Función para aplicar filtros
  const applyFilters = () => {
    const params: any = {};
    
    if (searchTerm) params.search = searchTerm;
    if (tipoEntidadFilter) params.tipoEntidad = tipoEntidadFilter;
    if (tipoDocumentoFilter) params.tipoDocumento = tipoDocumentoFilter;
    if (ciudadFilter) params.ciudad = ciudadFilter;
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    
    loadClients(params);
  };

  // Aplicar filtros cuando cambien los valores
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, tipoEntidadFilter, tipoDocumentoFilter, ciudadFilter, fechaDesde, fechaHasta]);

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


  // Normalizar visualmente el número de documento: mostrar solo dígitos
  const formatNumeroDocumento = (doc: string): string => {
    if (!doc) return '';
    const sanitized = doc.replace(/\D/g, '');
    return sanitized || doc;
  };



  const handleSaveClient = async (clientData: any) => {
    if (selectedClient) {
      try {
        await updateClient(selectedClient.id, clientData);
        setIsEditModalOpen(false);
        setSelectedClient(null);
      } catch (error) {
        console.error('Error updating client:', error);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTipoEntidadFilter('');
    setTipoDocumentoFilter('');
    setCiudadFilter('');
    setFechaDesde('');
    setFechaHasta('');
    // Cargar todos los clientes sin filtros
    loadClients();
  };

  return (
    <Layout title="Entidades Comerciales">
      <TableContainer>
        <TableHeader>
          <SearchBox>
            <input
              type="text"
              placeholder="Buscar entidad..."
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
            Nueva Entidad
          </NewClientButton>
        </TableHeader>

        <AdvancedSearchContainer $show={showAdvancedSearch}>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Tipo de Entidad</FilterLabel>
              <select 
                value={tipoEntidadFilter} 
                onChange={(e) => setTipoEntidadFilter(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todos</option>
                <option value="Cliente">Cliente</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Ambos">Ambos</option>
              </select>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Tipo de Documento</FilterLabel>
              <select 
                value={tipoDocumentoFilter} 
                onChange={(e) => setTipoDocumentoFilter(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todos</option>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">CE</option>
              </select>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Ciudad</FilterLabel>
              <input
                type="text"
                value={ciudadFilter}
                onChange={(e) => setCiudadFilter(e.target.value)}
                placeholder="Filtrar por ciudad"
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  width: '150px'
                }}
              />
            </FilterGroup>
          </FilterRow>

          <FilterRow>
            <FilterGroup>
              <FilterLabel>Fecha Desde</FilterLabel>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha Hasta</FilterLabel>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterButton onClick={clearFilters}>
                Limpiar Filtros
              </FilterButton>
            </FilterGroup>
          </FilterRow>
        </AdvancedSearchContainer>

        <ResponsiveTable>
          <Table>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Documento</th>
                <th>Dirección</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Cargando entidades...
                  </td>
                </tr>
              ) : clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      {client.tipoDocumento === 'RUC' 
                        ? client.razonSocial || ''
                        : `${client.nombres || ''} ${client.apellidos || ''}`.trim()
                      }
                    </td>
                    <td>{client.email}</td>
                    <td>{client.telefono}</td>
                    <td>{client.tipoDocumento} {formatNumeroDocumento(client.numeroDocumento)}</td>
                    <td>{client.direccion}, {client.ciudad}</td>
                    <td>
                      <ActionButton 
                        onClick={() => handleEdit(client.id)}
                        $color="#007bff"
                      >
                        Editar
                      </ActionButton>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    No se encontraron entidades que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ResponsiveTable>

        <MobileCardContainer>
          {clients.length > 0 ? (
            clients.map((client: any) => (
              <MobileCard key={client.id}>
                <MobileCardHeader>
                  <MobileCardTitle>
                    {client.tipoDocumento === 'RUC' 
                      ? client.razonSocial || ''
                      : `${client.nombres || ''} ${client.apellidos || ''}`.trim()
                    }
                  </MobileCardTitle>
                </MobileCardHeader>
                
                <MobileCardBody>
                  <MobileCardField>
                    <MobileCardLabel>Email</MobileCardLabel>
                    <MobileCardValue>{client.email}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Teléfono</MobileCardLabel>
                    <MobileCardValue>{client.telefono}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Documento</MobileCardLabel>
                    <MobileCardValue>{client.tipoDocumento} {formatNumeroDocumento(client.numeroDocumento)}</MobileCardValue>
                  </MobileCardField>
                  
                  <MobileCardField>
                    <MobileCardLabel>Dirección</MobileCardLabel>
                    <MobileCardValue>{client.direccion}, {client.ciudad}</MobileCardValue>
                  </MobileCardField>
                </MobileCardBody>
                
                <MobileCardActions>
                  <ActionButton 
                    onClick={() => handleEdit(client.id)}
                    $color="#007bff"
                  >
                    Editar
                  </ActionButton>
                </MobileCardActions>
              </MobileCard>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              No se encontraron entidades que coincidan con la búsqueda
            </div>
          )}
        </MobileCardContainer>
      </TableContainer>


      
      <NuevaEntidadModal
        isOpen={isNuevoClienteModalOpen}
        onClose={handleCloseNuevoClienteModal}
      />
      
      <EditarEntidadModal
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

export default ListaEntidades;