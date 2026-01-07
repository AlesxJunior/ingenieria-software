import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useNotification } from '../context/NotificationContext';
import { auditoriaApi, type AuditLog } from '../services/auditoriaApi';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../styles/theme';
import {
  Button,
  Input,
  Select,
  StatCard,
  StatsGrid,
  StatValue,
  StatLabel,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatusBadge,
  PaginationContainer,
  PaginationInfo,
  PaginationButtons,
  PageButton,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText
} from '../components/shared';

// ============================================================================
// INTERFACES
// ============================================================================

interface FilterOptions {
  dateFrom: string;
  dateTo: string;
  userId: string;
  action: string;
}

// ============================================================================
// STYLED COMPONENTS
// ============================================================================

const Container = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const FiltersCard = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.md};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.small};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: ${SPACING.lg};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const DetailsCell = styled.span`
  display: block;
  max-width: 300px;
  word-wrap: break-word;
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.textLight};
`;

const PageSizeSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.small};
  color: ${COLORS.text};
  background: ${COLORS.background};
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: ${COLOR_SCALES.primary[300]};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const PaginationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${SPACING.md};
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  color: ${COLORS.textLight};
`;

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

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
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Cargar logs al montar el componente
  useEffect(() => {
    loadLogs();
  }, [currentPage, itemsPerPage]);

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

  const handlePageSizeChange = (newSize: number) => {
    setItemsPerPage(newSize);
    setCurrentPage(1); // Reset to first page when changing page size
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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Calcular estadísticas
  const stats = useMemo(() => {
    const loginCount = logs.filter(l => l.action === 'LOGIN' || l.action === 'LOGOUT').length;
    const createCount = logs.filter(l => l.action.includes('CREATE')).length;
    const updateCount = logs.filter(l => l.action.includes('UPDATE') || l.action === 'CHANGE_PASSWORD').length;
    const deleteCount = logs.filter(l => l.action.includes('DELETE')).length;
    return { loginCount, createCount, updateCount, deleteCount };
  }, [logs]);

  // Mapear acción a variante de StatusBadge
  const getActionVariant = (action: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (action.toUpperCase()) {
      case 'LOGIN':
      case 'LOGOUT':
        return 'info';
      case 'CREATE':
      case 'CREATE_USER':
        return 'success';
      case 'UPDATE':
      case 'UPDATE_USER':
      case 'UPDATE_PROFILE':
      case 'CHANGE_PASSWORD':
        return 'warning';
      case 'DELETE':
      case 'DELETE_USER':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <Layout title="Auditoría y Logs">
      <Container>
        {/* Header con patrón Template UI */}
        <PageHeader>
          <TitleSection>
            <PageTitle>Auditoría y Logs del Sistema</PageTitle>
            <PageSubtitle>
              Registro de actividades, accesos y cambios realizados en el sistema
            </PageSubtitle>
          </TitleSection>
        </PageHeader>

        {/* Stats Cards con patrón Template UI */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{totalItems}</StatValue>
            <StatLabel>Total Registros</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.info[500]}>
            <StatValue $color={COLOR_SCALES.info[500]}>{stats.loginCount}</StatValue>
            <StatLabel>Accesos</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{stats.createCount}</StatValue>
            <StatLabel>Creaciones</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.warning[500]}>
            <StatValue $color={COLOR_SCALES.warning[500]}>{stats.updateCount}</StatValue>
            <StatLabel>Actualizaciones</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.danger[500]}>
            <StatValue $color={COLOR_SCALES.danger[500]}>{stats.deleteCount}</StatValue>
            <StatLabel>Eliminaciones</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filtros con patrón Template UI */}
        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel htmlFor="dateFrom">Fecha Desde</FilterLabel>
              <Input
                type="date"
                id="dateFrom"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="dateTo">Fecha Hasta</FilterLabel>
              <Input
                type="date"
                id="dateTo"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel htmlFor="userId">Usuario</FilterLabel>
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
              <FilterLabel htmlFor="action">Acción</FilterLabel>
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
          </FiltersGrid>

          <ButtonGroup>
            <Button onClick={clearFilters} disabled={loading}>
              Limpiar
            </Button>
            <Button $variant="primary" onClick={applyFilters} disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
            <Button $variant="success" onClick={exportLogs} disabled={loading}>
              Exportar a Excel
            </Button>
          </ButtonGroup>
        </FiltersCard>

        {/* Tabla con patrón Template UI */}
        <TableContainer>
          {loading ? (
            <LoadingContainer>
              <p>Cargando logs...</p>
            </LoadingContainer>
          ) : logs.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📭</EmptyIcon>
              <EmptyTitle>No se encontraron registros</EmptyTitle>
              <EmptyText>Ajusta los filtros para ver los logs de auditoría</EmptyText>
            </EmptyState>
          ) : (
            <>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Fecha/Hora</Th>
                    <Th>Usuario</Th>
                    <Th>Acción</Th>
                    <Th>Detalles</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.map(log => (
                    <Tr key={log.id}>
                      <Td>{formatTimestamp(log.timestamp)}</Td>
                      <Td>{log.user}</Td>
                      <Td>
                        <StatusBadge variant={getActionVariant(log.action)}>
                          {log.action}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <DetailsCell>{log.details || '-'}</DetailsCell>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>

              <PaginationContainer>
                <PaginationInfo>
                  Mostrando {startIndex + 1} - {Math.min(endIndex, totalItems)} de {totalItems} registros
                </PaginationInfo>
                <PaginationWrapper>
                  <PageSizeSelect
                    value={itemsPerPage}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  >
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                    <option value={100}>100 por página</option>
                  </PageSizeSelect>
                  <PaginationButtons>
                    <PageButton
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || loading}
                    >
                      Anterior
                    </PageButton>
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
                        <PageButton
                          key={page}
                          $active={currentPage === page}
                          onClick={() => setCurrentPage(page)}
                          disabled={loading}
                        >
                          {page}
                        </PageButton>
                      );
                    })}
                    <PageButton
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || loading}
                    >
                      Siguiente
                    </PageButton>
                  </PaginationButtons>
                </PaginationWrapper>
              </PaginationContainer>
            </>
          )}
        </TableContainer>
      </Container>
    </Layout>
  );
};

export default AuditoriaLogs;