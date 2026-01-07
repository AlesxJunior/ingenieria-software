import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import type { CashSession } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';
import { SessionDetailModal } from '../components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button,
  ActionButton,
  Input,
  Select,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  PaginationContainer,
  PaginationInfo,
  PageButton,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyText,
  StatusBadge,
  StatCard,
  StatsGrid,
  StatValue,
  StatLabel
} from '../../../components/shared';

interface Filters {
  fechaInicio: string;
  fechaFin: string;
  userId: string;
}

const HistorialCaja: React.FC = () => {
  const { getClosedSessions, loading } = useSales();
  const { showNotification } = useNotification();
  
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [filters, setFilters] = useState<Filters>({
    fechaInicio: '',
    fechaFin: '',
    userId: '',
  });
  
  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Cargar sesiones cerradas al montar el componente
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const filterParams = {
        ...(filters.fechaInicio && { fechaInicio: filters.fechaInicio }),
        ...(filters.fechaFin && { fechaFin: filters.fechaFin }),
        ...(filters.userId && { userId: filters.userId }),
      };
      
      const data = await getClosedSessions(filterParams);
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('error', 'Error', 'No se pudieron cargar las sesiones cerradas');
      console.error('Error loading closed sessions:', error);
      setSessions([]);
    }
  };

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    loadSessions();
  };

  const handleClearFilters = () => {
    setFilters({
      fechaInicio: '',
      fechaFin: '',
      userId: '',
    });
    setTimeout(() => {
      getClosedSessions({}).then(data => {
        setSessions(Array.isArray(data) ? data : []);
      }).catch(() => {
        setSessions([]);
      });
    }, 0);
  };

  const handleViewDetails = (session: CashSession) => {
    setSelectedSession(session);
    setShowDetailModal(true);
  };

  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDifferenceClass = (difference?: number) => {
    if (!difference) return 'zero';
    if (difference > 0) return 'surplus';
    if (difference < 0) return 'shortage';
    return 'zero';
  };

  const getDifferenceText = (difference?: number) => {
    if (!difference) return 'S/ 0.00';
    if (difference > 0) return `+${formatCurrency(difference)}`;
    return formatCurrency(difference);
  };

  // Paginación calculada
  const totalSessions = sessions.length;
  const totalPages = Math.ceil(totalSessions / pageSize);
  
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return sessions.slice(start, end);
  }, [sessions, currentPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const totalSesiones = sessions.length;
    const totalVentas = sessions.reduce((sum, s) => sum + (s.totalVentas || 0), 0);
    const totalDiferencia = sessions.reduce((sum, s) => sum + (s.diferencia || 0), 0);
    const sesionesConSobrante = sessions.filter(s => (s.diferencia || 0) > 0).length;
    const sesionesConFaltante = sessions.filter(s => (s.diferencia || 0) < 0).length;
    return { totalSesiones, totalVentas, totalDiferencia, sesionesConSobrante, sesionesConFaltante };
  }, [sessions]);

  return (
    <Layout title="Historial de Caja">
      <Container>
        <PageHeader>
          <TitleSection>
            <PageTitle>Historial de Arqueos de Caja</PageTitle>
            <PageSubtitle>Consulta y análisis de sesiones de caja cerradas</PageSubtitle>
          </TitleSection>
        </PageHeader>

        {/* Tarjetas Estadísticas */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.totalSesiones}</StatValue>
            <StatLabel>Total Arqueos</StatLabel>
          </StatCard>
          <StatCard $color="#27ae60">
            <StatValue $color="#27ae60">S/ {stats.totalVentas.toFixed(2)}</StatValue>
            <StatLabel>Total Ventas</StatLabel>
          </StatCard>
          <StatCard $color="#2ecc71">
            <StatValue $color="#2ecc71">{stats.sesionesConSobrante}</StatValue>
            <StatLabel>Con Sobrante</StatLabel>
          </StatCard>
          <StatCard $color="#e74c3c">
            <StatValue $color="#e74c3c">{stats.sesionesConFaltante}</StatValue>
            <StatLabel>Con Faltante</StatLabel>
          </StatCard>
          <StatCard $color={stats.totalDiferencia >= 0 ? '#27ae60' : '#e74c3c'}>
            <StatValue $color={stats.totalDiferencia >= 0 ? '#27ae60' : '#e74c3c'}>
              {stats.totalDiferencia >= 0 ? '+' : ''}S/ {stats.totalDiferencia.toFixed(2)}
            </StatValue>
            <StatLabel>Diferencia Total</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filtros */}
        <FiltersCard>
          <FiltersGrid>
            <FilterGroup>
              <FilterLabel>Fecha Desde</FilterLabel>
              <Input
                type="date"
                value={filters.fechaInicio}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaInicio', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Fecha Hasta</FilterLabel>
              <Input
                type="date"
                value={filters.fechaFin}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaFin', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Usuario</FilterLabel>
              <Input
                type="text"
                placeholder="Buscar por usuario..."
                value={filters.userId}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('userId', e.target.value)}
              />
            </FilterGroup>
          </FiltersGrid>
          
          <ButtonGroup>
            <Button onClick={handleClearFilters} disabled={loading} $variant="secondary">
              Limpiar
            </Button>
            <Button onClick={handleSearch} disabled={loading} $variant="primary">
              Buscar
            </Button>
            <Button onClick={() => {}} disabled={loading || sessions.length === 0} $variant="success">
              Exportar a Excel
            </Button>
          </ButtonGroup>
        </FiltersCard>

        {/* Tabla de Historial */}
        <ContentCard>
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <p>Cargando sesiones...</p>
            </LoadingContainer>
          ) : sessions.length === 0 ? (
            <EmptyState>
              <EmptyIcon className="fas fa-inbox" />
              <EmptyTitle>No se encontraron sesiones cerradas</EmptyTitle>
              <EmptyText>Intenta ajustar los filtros o verifica que haya sesiones cerradas</EmptyText>
            </EmptyState>
          ) : (
            <TableContainer>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Fecha Cierre</Th>
                    <Th>Usuario</Th>
                    <Th>Caja</Th>
                    <Th>M. Apertura</Th>
                    <Th>Total Ventas</Th>
                    <Th>M. Cierre</Th>
                    <Th>Diferencia</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {paginatedSessions.map((session) => (
                    <Tr key={session.id}>
                      <Td>{formatDate(session.fechaCierre || session.updatedAt)}</Td>
                      <Td>
                        {session.user 
                          ? `${session.user.firstName} ${session.user.lastName}`
                          : session.userId}
                      </Td>
                      <Td>{session.cashRegister?.nombre || session.cashRegisterId}</Td>
                      <Td>{formatCurrency(session.montoApertura)}</Td>
                      <Td>
                        <SalesAmount>{formatCurrency(session.totalVentas)}</SalesAmount>
                      </Td>
                      <Td><strong>{formatCurrency(session.montoCierre || 0)}</strong></Td>
                      <Td>
                        <DifferenceAmount className={getDifferenceClass(session.diferencia)}>
                          {getDifferenceText(session.diferencia)}
                        </DifferenceAmount>
                      </Td>
                      <Td>
                        <ActionButton 
                          onClick={() => handleViewDetails(session)} 
                          $variant="view"
                        >
                          Ver
                        </ActionButton>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
              
              {/* Paginación */}
              <PaginationContainer>
                <PaginationInfo>
                  Mostrando {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalSessions)} de {totalSessions} resultados
                </PaginationInfo>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.md }}>
                  <Select
                    value={pageSize}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handlePageSizeChange(Number(e.target.value))}
                    style={{ width: 'auto' }}
                  >
                    <option value={5}>5 por página</option>
                    <option value={10}>10 por página</option>
                    <option value={20}>20 por página</option>
                    <option value={50}>50 por página</option>
                  </Select>
                  
                  <div style={{ display: 'flex', gap: SPACING.xs }}>
                    <PageButton
                      onClick={() => handlePageChange(currentPage - 1)}
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
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PageButton>
                      );
                    })}
                    
                    <PageButton
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Siguiente
                    </PageButton>
                  </div>
                </div>
              </PaginationContainer>
            </TableContainer>
          )}
        </ContentCard>

        {/* Modal de Detalles */}
        {showDetailModal && selectedSession && (
          <SessionDetailModal
            sessionId={selectedSession.id}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedSession(null);
            }}
          />
        )}
      </Container>
    </Layout>
  );
};

export default HistorialCaja;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 0;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${SPACING.xl};
  flex-wrap: wrap;
  gap: ${SPACING.lg};
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: ${SPACING.xs} 0 0 0;
`;

const FiltersCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING.xl};
  margin-bottom: ${SPACING.xl};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.textSecondary};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.sm};
  margin-top: ${SPACING.lg};
`;

const ContentCard = styled.div`
  background: ${COLORS.surface};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING.xl};
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.lg};
`;

const CardTitle = styled.h3`
  margin: 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const ResultCount = styled.span`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.textSecondary};
  background: ${COLORS.backgroundAlt};
  padding: ${SPACING.xs} ${SPACING.sm};
  border-radius: ${BORDER_RADIUS.full};
`;

const SalesAmount = styled.span`
  color: ${COLOR_SCALES.primary[600]};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const DifferenceAmount = styled.span`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  
  &.surplus {
    color: ${COLOR_SCALES.success[600]};
  }
  
  &.shortage {
    color: ${COLOR_SCALES.danger[600]};
  }
  
  &.zero {
    color: ${COLORS.textSecondary};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${SPACING['4xl']} ${SPACING.xl};
  gap: ${SPACING.lg};
  color: ${COLORS.textSecondary};
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid ${COLORS.border};
  border-top-color: ${COLOR_SCALES.primary[500]};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;
