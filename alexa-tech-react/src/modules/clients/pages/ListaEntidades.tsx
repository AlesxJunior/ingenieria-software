import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useClients } from '../context/ClientContext';
import { useUI } from '../../../context/UIContext';
import { useAuth } from '../../../hooks/useAuth';
import { useNotification } from '../../../context/NotificationContext';
import NuevaEntidadModal from '../components/NuevaEntidadModal';
import EditarEntidadModal from '../components/EditarEntidadModal';
import { media } from '../../../styles/breakpoints';
import UbigeoSelector from '../components/UbigeoSelector';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '../../../styles/theme';
import { Button, ActionButton, Input, StatusBadge, StatCard, StatsGrid, StatValue, StatLabel, PaginationContainer, PageButton, PaginationInfo, Select } from '../../../components/shared';

const TableContainer = styled.div`
  background-color: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xl};
  box-shadow: ${SHADOWS.sm};
`;

const TableHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  gap: ${SPACING.lg};

  ${media.tablet} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: ${SPACING.xs} 0 0 0;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  i {
    position: absolute;
    right: ${SPACING.md};
    color: ${COLORS.text.secondary};
    pointer-events: none;
  }
`;

const AdvancedSearchContainer = styled.div<{ $show: boolean }>`
  background: ${COLORS.neutral[50]};
  padding: ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  display: ${props => props.$show ? 'block' : 'none'};
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${SPACING.md};
  align-items: center;
  margin-bottom: ${SPACING.md};
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.secondary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${SPACING.xl};

  th, td {
    padding: ${SPACING.md};
    text-align: left;
    border-bottom: 1px solid ${COLORS.neutral[200]};
  }

  th {
    background-color: ${COLORS.neutral[50]};
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
    color: ${COLORS.text.primary};
    font-size: ${TYPOGRAPHY.fontSize.sm};
  }

  tbody tr:hover {
    background-color: ${COLORS.neutral[50]};
  }
  
  ${media.mobile} {
    display: none;
  }
`;

const MobileCardContainer = styled.div`
  display: none;
  
  ${media.mobile} {
    display: block;
    padding: ${SPACING.md};
    margin-top: ${SPACING.xl};
  }
`;

const MobileCard = styled.div`
  background: ${COLORS.neutral.white};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.md};
  box-shadow: ${SHADOWS.sm};
`;

const MobileCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.md};
`;

const MobileCardTitle = styled.h3`
  margin: 0;
  font-size: ${TYPOGRAPHY.fontSize.md};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const MobileCardBody = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.sm};
  margin-bottom: ${SPACING.md};
`;

const MobileCardField = styled.div`
  display: flex;
  flex-direction: column;
`;

const MobileCardLabel = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.secondary};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  margin-bottom: ${SPACING.xs};
`;

const MobileCardValue = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
`;

const MobileCardActions = styled.div`
  display: flex;
  gap: ${SPACING.sm};
  justify-content: flex-end;
  border-top: 1px solid ${COLORS.neutral[200]};
  padding-top: ${SPACING.md};
`;

const ResponsiveTable = styled.div`
  overflow-x: auto;
  margin-top: 0;
`;

const DeleteConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const DeleteConfirmContent = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.xl};
  max-width: 400px;
  width: 90%;
  box-shadow: ${SHADOWS.lg};
`;

const DeleteConfirmTitle = styled.h3`
  margin: 0 0 ${SPACING.md} 0;
  color: ${COLORS.text.primary};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const DeleteConfirmMessage = styled.p`
  margin: 0 0 ${SPACING.xl} 0;
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.md};
  line-height: 1.5;
`;

const DeleteConfirmActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
`;


const ListaEntidades: React.FC = () => {
  const { clients, loadClients, updateClient, deleteClient } = useClients();
  const { isLoading } = useUI();
  const { hasPermission } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [isNuevoClienteModalOpen, setIsNuevoClienteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
  
  // Verificar permisos
  const canDelete = hasPermission('clients.delete');
  const canUpdate = hasPermission('clients.update');
  
  // Estados para filtros avanzados
  const [tipoEntidadFilter, setTipoEntidadFilter] = useState('');
  const [tipoDocumentoFilter, setTipoDocumentoFilter] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [departamentoIdFilter, setDepartamentoIdFilter] = useState('');
  const [provinciaIdFilter, setProvinciaIdFilter] = useState('');
  const [distritoIdFilter, setDistritoIdFilter] = useState('');

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = clients.length;
    const clientes = clients.filter(c => c.tipoEntidad === 'Cliente').length;
    const proveedores = clients.filter(c => c.tipoEntidad === 'Proveedor').length;
    const ambos = clients.filter(c => c.tipoEntidad === 'Ambos').length;
    return { total, clientes, proveedores, ambos };
  }, [clients]);

  // Clientes paginados
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return clients.slice(startIndex, startIndex + itemsPerPage);
  }, [clients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(clients.length / itemsPerPage);
  // Función para aplicar filtros
  const applyFilters = () => {
    const params: any = {};
    
    if (searchTerm) params.search = searchTerm;
    if (tipoEntidadFilter) params.tipoEntidad = tipoEntidadFilter;
    if (tipoDocumentoFilter) params.tipoDocumento = tipoDocumentoFilter;
    if (fechaDesde) params.fechaDesde = fechaDesde;
    if (fechaHasta) params.fechaHasta = fechaHasta;
    if (departamentoIdFilter) params.departamentoId = departamentoIdFilter;
    if (provinciaIdFilter) params.provinciaId = provinciaIdFilter;
    if (distritoIdFilter) params.distritoId = distritoIdFilter;
    
    // Siempre incluir entidades inactivas para poder ver las eliminadas
    params.includeInactive = true;
    
    loadClients(params);
  };

  // Aplicar filtros cuando cambien los valores
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchTerm, tipoEntidadFilter, tipoDocumentoFilter, fechaDesde, fechaHasta, departamentoIdFilter, provinciaIdFilter, distritoIdFilter]);

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

  const handleDeleteClick = (client: any) => {
    setClientToDelete(client);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (clientToDelete) {
      try {
        await deleteClient(clientToDelete.id);
        showSuccess('Entidad comercial eliminada exitosamente');
        setIsDeleteConfirmOpen(false);
        setClientToDelete(null);
      } catch (error) {
        console.error('Error deleting client:', error);
        showError('Error al eliminar la entidad comercial');
      }
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setClientToDelete(null);
  };

  const handleActivateClient = async (client: any) => {
    try {
      await updateClient(client.id, { isActive: true });
      showSuccess('Entidad comercial activada exitosamente');
    } catch (error) {
      console.error('Error activating client:', error);
      showError('No se pudo activar la entidad comercial');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTipoEntidadFilter('');
    setTipoDocumentoFilter('');
    setFechaDesde('');
    setFechaHasta('');
    setDepartamentoIdFilter('');
    setProvinciaIdFilter('');
    setDistritoIdFilter('');
    // Cargar todos los clientes sin filtros
    loadClients();
  };

  return (
    <Layout title="Entidades Comerciales">
      <TableContainer>
        <TableHeader>
          <div>
            <PageTitle>Entidades Comerciales</PageTitle>
            <PageSubtitle>Gestión de clientes, proveedores y otras entidades comerciales</PageSubtitle>
          </div>
          <SearchBox>
            <Input
              type="text"
              placeholder="Buscar entidad..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              style={{ width: '300px' }}
            />
            <i className="fas fa-search"></i>
          </SearchBox>
          <div style={{ display: 'flex', gap: SPACING.sm }}>
            <Button $variant="outline" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
              {showAdvancedSearch ? 'Ocultar Filtros' : 'Filtros Avanzados'}
            </Button>
            <Button $variant="primary" onClick={handleNuevoCliente}>
              <i className="fas fa-plus"></i>
              Nueva Entidad
            </Button>
          </div>
        </TableHeader>

        {/* Tarjetas de Estadísticas */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.total}</StatValue>
            <StatLabel>Total Entidades</StatLabel>
          </StatCard>
          <StatCard $color="#28a745">
            <StatValue $color="#28a745">{stats.clientes}</StatValue>
            <StatLabel>Clientes</StatLabel>
          </StatCard>
          <StatCard $color="#f0ad4e">
            <StatValue $color="#f0ad4e">{stats.proveedores}</StatValue>
            <StatLabel>Proveedores</StatLabel>
          </StatCard>
          <StatCard $color="#17a2b8">
            <StatValue $color="#17a2b8">{stats.ambos}</StatValue>
            <StatLabel>Cliente y Proveedor</StatLabel>
          </StatCard>
        </StatsGrid>

        <AdvancedSearchContainer $show={showAdvancedSearch}>
          <FilterRow>
            <FilterGroup>
              <FilterLabel>Tipo de Entidad</FilterLabel>
              <Input
                as="select"
                value={tipoEntidadFilter} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipoEntidadFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="Cliente">Cliente</option>
                <option value="Proveedor">Proveedor</option>
                <option value="Ambos">Ambos</option>
              </Input>
            </FilterGroup>
            <FilterGroup>
              <FilterLabel>Tipo de Documento</FilterLabel>
              <Input
                as="select"
                value={tipoDocumentoFilter} 
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipoDocumentoFilter(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">CE</option>
                <option value="Pasaporte">Pasaporte</option>
              </Input>
            </FilterGroup>
          </FilterRow>

          {/* Ubigeo: Departamento, Provincia, Distrito */}
          <FilterRow>
            <UbigeoSelector
              compact
              value={{
                departamentoId: departamentoIdFilter || '',
                provinciaId: provinciaIdFilter || '',
                distritoId: distritoIdFilter || ''
              }}
              onChange={(v) => {
                setDepartamentoIdFilter(v.departamentoId || '');
                setProvinciaIdFilter(v.provinciaId || '');
                setDistritoIdFilter(v.distritoId || '');
              }}
            />
          </FilterRow>

          <FilterRow>
            <FilterGroup>
              <FilterLabel>Fecha Desde</FilterLabel>
              <Input
                type="date"
                value={fechaDesde}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaDesde(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>Fecha Hasta</FilterLabel>
              <Input
                type="date"
                value={fechaHasta}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaHasta(e.target.value)}
              />
            </FilterGroup>

            <FilterGroup>
              <Button $variant="outline" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </FilterGroup>
          </FilterRow>
        </AdvancedSearchContainer>

        <ResponsiveTable>
          <Table>
            <thead>
              <tr>
                <th>Tipo</th>
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
                  <td colSpan={7} style={{ textAlign: 'center', padding: SPACING.xl, color: COLORS.text.secondary }}>
                    Cargando entidades...
                  </td>
                </tr>
              ) : paginatedClients.length > 0 ? (
                paginatedClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <StatusBadge 
                        variant={
                          client.tipoEntidad === 'Cliente' ? 'info' :
                          client.tipoEntidad === 'Proveedor' ? 'warning' :
                          'default'
                        }
                      >
                        {client.tipoEntidad === 'Cliente' ? '👤 Cliente' :
                         client.tipoEntidad === 'Proveedor' ? '🏭 Proveedor' :
                         '🤝 Ambos'}
                      </StatusBadge>
                    </td>
                    <td>
                      {client.tipoDocumento === 'RUC' 
                        ? client.razonSocial || ''
                        : `${client.nombres || ''} ${client.apellidos || ''}`.trim()
                      }
                    </td>
                    <td>{client.email}</td>
                    <td>{client.telefono}</td>
                    <td>{client.tipoDocumento} {formatNumeroDocumento(client.numeroDocumento)}</td>
                    <td>{client.direccion}</td>
                    <td>
                      <div style={{ display: 'flex', gap: SPACING.xs }}>
                        {canUpdate && (
                          <ActionButton 
                            onClick={() => handleEdit(client.id)}
                            $variant="edit"
                          >
                            Editar
                          </ActionButton>
                        )}
                        {canDelete && (
                          client.isActive ? (
                            <ActionButton 
                              onClick={() => handleDeleteClick(client)}
                              $variant="delete"
                            >
                              Eliminar
                            </ActionButton>
                          ) : (
                            <ActionButton 
                              onClick={() => handleActivateClient(client)}
                              $variant="activate"
                            >
                              Activar
                            </ActionButton>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: SPACING.xl, color: COLORS.text.secondary }}>
                    No se encontraron entidades que coincidan con la búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </ResponsiveTable>

        {/* Paginación */}
        {clients.length > 0 && (
          <PaginationContainer>
            <PaginationInfo>
              Mostrando {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, clients.length)} de {clients.length} resultados
            </PaginationInfo>
            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
              <Select
                value={itemsPerPage}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{ width: 'auto' }}
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
              </Select>
              <div style={{ display: 'flex', gap: SPACING.xs }}>
                <PageButton
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </PageButton>
                {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage <= 2) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 1) {
                    pageNum = totalPages - 2 + i;
                  } else {
                    pageNum = currentPage - 1 + i;
                  }
                  return (
                    <PageButton
                      key={pageNum}
                      $active={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PageButton>
                  );
                })}
                <PageButton
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                </PageButton>
              </div>
            </div>
          </PaginationContainer>
        )}

        <MobileCardContainer>
          {paginatedClients.length > 0 ? (
            paginatedClients.map((client: any) => (
              <MobileCard key={client.id}>
                <MobileCardHeader>
                  <MobileCardTitle>
                    {client.tipoDocumento === 'RUC' 
                      ? client.razonSocial || ''
                      : `${client.nombres || ''} ${client.apellidos || ''}`.trim()
                    }
                  </MobileCardTitle>
                  <StatusBadge 
                    variant={
                      client.tipoEntidad === 'Cliente' ? 'info' :
                      client.tipoEntidad === 'Proveedor' ? 'warning' :
                      'default'
                    }
                  >
                    {client.tipoEntidad === 'Cliente' ? '👤' :
                     client.tipoEntidad === 'Proveedor' ? '🏭' :
                     '🤝'}
                  </StatusBadge>
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
                    <MobileCardValue>{client.direccion}</MobileCardValue>
                  </MobileCardField>
                </MobileCardBody>
                
                <MobileCardActions>
                  {canUpdate && (
                    <ActionButton 
                      onClick={() => handleEdit(client.id)}
                      $variant="edit"
                    >
                      Editar
                    </ActionButton>
                  )}
                  {canDelete && (
                    client.isActive ? (
                      <ActionButton 
                        onClick={() => handleDeleteClick(client)}
                        $variant="delete"
                      >
                        Eliminar
                      </ActionButton>
                    ) : (
                      <ActionButton 
                        onClick={() => handleActivateClient(client)}
                        $variant="activate"
                      >
                        Activar
                      </ActionButton>
                    )
                  )}
                </MobileCardActions>
              </MobileCard>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: SPACING.xl, color: COLORS.text.secondary }}>
              No se encontraron entidades que coincidan con la búsqueda
            </div>
          )}
        </MobileCardContainer>
      </TableContainer>

      {/* Modal de Confirmación de Eliminación */}
      {isDeleteConfirmOpen && clientToDelete && (
        <DeleteConfirmModal>
          <DeleteConfirmContent>
            <DeleteConfirmTitle>¿Eliminar Entidad Comercial?</DeleteConfirmTitle>
            <DeleteConfirmMessage>
              ¿Estás seguro de que deseas eliminar a{' '}
              <strong>
                {clientToDelete.tipoDocumento === 'RUC'
                  ? clientToDelete.razonSocial
                  : `${clientToDelete.nombres} ${clientToDelete.apellidos}`}
              </strong>
              ? Esta acción desactivará la entidad comercial.
            </DeleteConfirmMessage>
            <DeleteConfirmActions>
              <Button $variant="outline" onClick={handleCancelDelete}>
                Cancelar
              </Button>
              <Button $variant="danger" onClick={handleConfirmDelete}>
                Eliminar
              </Button>
            </DeleteConfirmActions>
          </DeleteConfirmContent>
        </DeleteConfirmModal>
      )}
      
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