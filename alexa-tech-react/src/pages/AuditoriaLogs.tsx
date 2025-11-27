import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import { auditoriaApi, type AuditLog } from '../services/auditoriaApi';

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  userId: string;
  action: string;
}

const Container = styled.div`
  padding: 1rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const ExportButton = styled.button`
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #229954;
  }
`;

const FilterSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const FilterActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  ${props => props.$variant === 'primary' ? `
    background: #3498db;
    color: white;
    &:hover {
      background: #2980b9;
    }
  ` : `
    background: #95a5a6;
    color: white;
    &:hover {
      background: #7f8c8d;
    }
  `}
`;

const LogsSection = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const LogsHeader = styled.div`
  background: #f8f9fa;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LogsTitle = styled.h2`
  color: #2c3e50;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const LogsCount = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const LogsTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e1e8ed;

  &:hover {
    background: #f8f9fa;
  }
`;

const TableHeaderCell = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  white-space: nowrap;
`;

const TableCell = styled.td`
  padding: 1rem;
  color: #2c3e50;
  font-size: 0.9rem;
  vertical-align: top;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: #e2e3e5;
  color: #383d41;
`;

const ActionBadge = styled.span<{ action: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
`;

const DetailsCell = styled(TableCell)`
  max-width: 300px;
  word-wrap: break-word;
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e1e8ed;
`;

const PaginationInfo = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const PaginationControls = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button<{ $isActive?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #e1e8ed;
  background: ${props => props.$isActive ? '#3498db' : 'white'};
  color: ${props => props.$isActive ? 'white' : '#2c3e50'};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$isActive ? '#2980b9' : '#f8f9fa'};
  }

  &:disabled {
    background: #f8f9fa;
    color: #bdc3c7;
    cursor: not-allowed;
  }
`;

const AuditoriaLogs: React.FC = () => {
  const { showSuccess, showError } = useNotification();

  const [filters, setFilters] = useState<FilterOptions>({
    dateFrom: '',
    dateTo: '',
    userId: '',
    action: ''
  });

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Cargar logs al montar el componente
  useEffect(() => {
    loadLogs();
  }, [currentPage]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditoriaApi.getAuditLogs({
        page: currentPage,
        limit: itemsPerPage,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        userId: filters.userId || undefined,
        action: filters.action || undefined,
      });

      setLogs(response.logs);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.totalPages);
    } catch (error: any) {
      console.error('Error al cargar logs:', error);
      showError(
        error.response?.data?.message || 'Error al cargar los logs de auditoría'
      );
    } finally {
      setLoading(false);
    }
  };

  const actions = ['Todos', 'LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'CHANGE_PASSWORD', 'UPDATE_PROFILE'];

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = async () => {
    setCurrentPage(1);
    await loadLogs();
    showSuccess('Filtros aplicados exitosamente');
  };

  const clearFilters = async () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      userId: '',
      action: ''
    });
    setCurrentPage(1);
    await loadLogs();
    showSuccess('Filtros limpiados');
  };

  const exportLogs = () => {
    auditoriaApi.exportLogsToCSV(logs);
    showSuccess('Logs exportados exitosamente');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
        return { bg: '#d1ecf1', color: '#0c5460' };
      case 'LOGOUT':
        return { bg: '#f8d7da', color: '#721c24' };
      case 'CREATE':
      case 'CREATE_USER':
        return { bg: '#d4edda', color: '#155724' };
      case 'UPDATE':
      case 'UPDATE_USER':
      case 'UPDATE_PROFILE':
        return { bg: '#fff3cd', color: '#856404' };
      case 'DELETE':
      case 'DELETE_USER':
        return { bg: '#f8d7da', color: '#721c24' };
      case 'CHANGE_PASSWORD':
        return { bg: '#e3f2fd', color: '#1565c0' };
      default:
        return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  return (
    <Layout title="Auditoría y Logs">
      <Container>
        <Header>
          <Title>Auditoría y Logs del Sistema</Title>
          <ExportButton onClick={exportLogs}>
            Exportar Logs
          </ExportButton>
        </Header>

        <FilterSection>
          <FilterTitle>Filtros de Búsqueda</FilterTitle>
          <FilterGrid>
            <FilterGroup>
              <Label htmlFor="dateFrom">Fecha Desde</Label>
              <Input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="dateTo">Fecha Hasta</Label>
              <Input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="userId">Usuario</Label>
              <Input
                type="text"
                id="userId"
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                placeholder="Buscar por usuario..."
              />
            </FilterGroup>

            <FilterGroup>
              <Label htmlFor="action">Acción</Label>
              <Select
                id="action"
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
              >
                {actions.map(action => (
                  <option key={action} value={action === 'Todos' ? '' : action}>
                    {action}
                  </option>
                ))}
              </Select>
            </FilterGroup>
          </FilterGrid>

          <FilterActions>
            <Button $variant="secondary" onClick={clearFilters} disabled={loading}>
              Limpiar Filtros
            </Button>
            <Button $variant="primary" onClick={applyFilters} disabled={loading}>
              {loading ? 'Cargando...' : 'Aplicar Filtros'}
            </Button>
          </FilterActions>
        </FilterSection>

        <LogsSection>
          <LogsHeader>
            <LogsTitle>Registro de Actividades</LogsTitle>
            <LogsCount>{totalItems} registros encontrados</LogsCount>
          </LogsHeader>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Cargando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>No se encontraron registros</p>
            </div>
          ) : (
            <>
              <LogsTable>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHeaderCell>Fecha/Hora</TableHeaderCell>
                      <TableHeaderCell>Usuario</TableHeaderCell>
                      <TableHeaderCell>Acción</TableHeaderCell>
                      <TableHeaderCell>Detalles</TableHeaderCell>
                    </TableRow>
                  </TableHeader>
                  <tbody>
                    {logs.map(log => {
                      const actionColors = getActionBadgeColor(log.action);
                      return (
                        <TableRow key={log.id}>
                          <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell>{log.user}</TableCell>
                          <TableCell>
                            <ActionBadge 
                              action={log.action}
                              style={{ 
                                background: actionColors.bg, 
                                color: actionColors.color 
                              }}
                            >
                              {log.action}
                            </ActionBadge>
                          </TableCell>
                          <DetailsCell>{log.details || '-'}</DetailsCell>
                        </TableRow>
                      );
                    })}
                  </tbody>
                </Table>
              </LogsTable>

              <Pagination>
                <PaginationInfo>
                  Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} registros
                </PaginationInfo>
                <PaginationControls>
                  <PaginationButton
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Anterior
                  </PaginationButton>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <PaginationButton
                        key={page}
                        $isActive={currentPage === page}
                        onClick={() => setCurrentPage(page)}
                        disabled={loading}
                      >
                        {page}
                      </PaginationButton>
                    );
                  })}
                  <PaginationButton
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Siguiente
                  </PaginationButton>
                </PaginationControls>
              </Pagination>
            </>
          )}
        </LogsSection>
      </Container>
    </Layout>
  );
};

export default AuditoriaLogs;