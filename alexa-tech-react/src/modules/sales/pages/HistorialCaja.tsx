import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useSales } from '../context/SalesContext';
import type { CashSession } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';
import { SessionDetailModal } from '../components';

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

  return (
    <Layout title="Historial de Caja">
      <Container>
        <Header>
          <Title>Historial de Arqueos de Caja</Title>
        </Header>

        {/* Filtros */}
        <FiltersContainer>
          <FiltersTitle>Filtros de Búsqueda</FiltersTitle>
          <FiltersGrid>
            <FilterGroup>
              <Label htmlFor="fechaInicio">Fecha Desde</Label>
              <DateInput
                type="date"
                id="fechaInicio"
                value={filters.fechaInicio}
                onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <Label htmlFor="fechaFin">Fecha Hasta</Label>
              <DateInput
                type="date"
                id="fechaFin"
                value={filters.fechaFin}
                onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
              />
            </FilterGroup>
            
            <FilterGroup>
              <Label htmlFor="userId">Usuario</Label>
              <Input
                type="text"
                id="userId"
                placeholder="ID del usuario"
                value={filters.userId}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </FilterGroup>
            
            <ButtonGroup>
              <Button onClick={handleSearch} disabled={loading}>
                <i className="fas fa-search"></i>
                Buscar
              </Button>
              <ButtonSecondary onClick={handleClearFilters} disabled={loading}>
                <i className="fas fa-times"></i>
                Limpiar
              </ButtonSecondary>
            </ButtonGroup>
          </FiltersGrid>
        </FiltersContainer>

        {/* Tabla de Historial */}
        <TableCard>
          <CardTitle>Historial de Cierres ({sessions.length})</CardTitle>
          
          {loading ? (
            <LoadingContainer>
              <LoadingSpinner />
              <p>Cargando sesiones...</p>
            </LoadingContainer>
          ) : sessions.length === 0 ? (
            <EmptyState>
              <i className="fas fa-inbox" style={{ fontSize: '4rem' }}></i>
              <p>No se encontraron sesiones cerradas</p>
              <small>Intenta ajustar los filtros o verifica que haya sesiones cerradas</small>
            </EmptyState>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <Th>Fecha Cierre</Th>
                      <Th>Usuario</Th>
                      <Th>Caja</Th>
                      <Th>M. Apertura</Th>
                      <Th>Total Ventas</Th>
                      <Th>M. Cierre</Th>
                      <Th>Diferencia</Th>
                      <Th>Acciones</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session) => (
                      <Tr key={session.id}>
                        <Td>{formatDate(session.fechaCierre || session.updatedAt)}</Td>
                        <Td>
                          {session.user 
                            ? `${session.user.firstName} ${session.user.lastName}`
                            : session.userId}
                        </Td>
                        <Td>{session.cashRegister?.nombre || session.cashRegisterId}</Td>
                        <Td>{formatCurrency(session.montoApertura)}</Td>
                        <Td className="sales">{formatCurrency(session.totalVentas)}</Td>
                        <Td><strong>{formatCurrency(session.montoCierre || 0)}</strong></Td>
                        <Td className={getDifferenceClass(session.diferencia)}>
                          <strong>{getDifferenceText(session.diferencia)}</strong>
                        </Td>
                        <Td>
                          <ActionButton onClick={() => handleViewDetails(session)} title="Ver detalles">
                            <i className="fas fa-eye"></i>
                          </ActionButton>
                        </Td>
                      </Tr>
                    ))}
                  </tbody>
                </Table>
              </TableContainer>
              
              <PaginationFooter>
                Mostrando {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}
              </PaginationFooter>
            </>
          )}
        </TableCard>

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
  padding: 1rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
`;

const FiltersContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FiltersTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.25rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: #34495e;
  font-weight: 500;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const DateInput = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #2980b9;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  i {
    font-size: 1rem;
  }
`;

const ButtonSecondary = styled(Button)`
  background: #95a5a6;

  &:hover:not(:disabled) {
    background: #7f8c8d;
    box-shadow: 0 4px 8px rgba(149, 165, 166, 0.3);
  }
`;

const TableCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  overflow: hidden;
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #2c3e50;
  font-size: 1.25rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  margin: 0 -1.5rem;
  padding: 0 1.5rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px;
`;

const Th = styled.th`
  text-align: left;
  padding: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 2px solid #e1e8ed;
  background: #f8f9fa;
`;

const Tr = styled.tr`
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.9rem;
  color: #2c3e50;
  border-bottom: 1px solid #e1e8ed;

  &.sales {
    color: #3498db;
    font-weight: 600;
  }

  &.surplus {
    color: #27ae60;
    font-weight: 600;
  }

  &.shortage {
    color: #e74c3c;
    font-weight: 600;
  }

  &.zero {
    color: #95a5a6;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2980b9;
    transform: scale(1.1);
  }

  i {
    font-size: 1rem;
  }
`;

const PaginationFooter = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e8ed;
  font-size: 0.875rem;
  color: #7f8c8d;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: #7f8c8d;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #e1e8ed;
  border-top-color: #3498db;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: #95a5a6;
  text-align: center;

  i {
    color: #bdc3c7;
  }

  p {
    font-size: 1.25rem;
    font-weight: 500;
    margin: 0;
    color: #7f8c8d;
  }

  small {
    font-size: 0.875rem;
    color: #95a5a6;
  }
`;
