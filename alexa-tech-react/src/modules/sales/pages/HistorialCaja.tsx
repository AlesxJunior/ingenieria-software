import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
      // Asegurar que data sea un array
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('error', 'Error', 'No se pudieron cargar las sesiones cerradas');
      console.error('Error loading closed sessions:', error);
      setSessions([]); // Resetear a array vacío en caso de error
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
    // Recargar sin filtros
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
    <Container>
      <Header>
        <Title>Historial de Arqueos de Caja</Title>
      </Header>

      {/* Filtros */}
      <FilterCard>
        <CardTitle>Filtros de Búsqueda</CardTitle>
        <FilterGrid>
          <FormGroup>
            <Label htmlFor="fechaInicio">Fecha Desde</Label>
            <Input
              type="date"
              id="fechaInicio"
              value={filters.fechaInicio}
              onChange={(e) => handleFilterChange('fechaInicio', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="fechaFin">Fecha Hasta</Label>
            <Input
              type="date"
              id="fechaFin"
              value={filters.fechaFin}
              onChange={(e) => handleFilterChange('fechaFin', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="userId">Usuario</Label>
            <Input
              type="text"
              id="userId"
              placeholder="ID del usuario"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </FormGroup>
          
          <ButtonGroup>
            <Button onClick={handleSearch} disabled={loading}>
              <span className="material-icons-outlined">search</span>
              Buscar
            </Button>
            <Button variant="secondary" onClick={handleClearFilters} disabled={loading}>
              <span className="material-icons-outlined">clear</span>
              Limpiar
            </Button>
          </ButtonGroup>
        </FilterGrid>
      </FilterCard>

      {/* Tabla de Historial */}
      <TableCard>
        <CardTitle>Historial de Cierres</CardTitle>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Cargando sesiones...</p>
          </LoadingContainer>
        ) : sessions.length === 0 ? (
          <EmptyState>
            <span className="material-icons-outlined">inbox</span>
            <p>No se encontraron sesiones cerradas</p>
          </EmptyState>
        ) : (
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
                    <Td>{session.userId}</Td>
                    <Td>{session.cashRegister?.nombre || session.cashRegisterId}</Td>
                    <Td>{formatCurrency(session.montoApertura)}</Td>
                    <Td>{formatCurrency(session.totalVentas)}</Td>
                    <Td><strong>{formatCurrency(session.montoCierre || 0)}</strong></Td>
                    <Td className={getDifferenceClass(session.diferencia)}>
                      {getDifferenceText(session.diferencia)}
                    </Td>
                    <Td>
                      <ActionButton onClick={() => handleViewDetails(session)} title="Ver detalles">
                        <span className="material-icons-outlined">visibility</span>
                      </ActionButton>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
        
        {!loading && sessions.length > 0 && (
          <PaginationFooter>
            Mostrando {sessions.length} sesión{sessions.length !== 1 ? 'es' : ''}
          </PaginationFooter>
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
  );
};

export default HistorialCaja;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: #1a1a1a;
  font-weight: 600;
`;

const FilterCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const TableCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  color: #1a1a1a;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a4a4a;
`;

const Input = styled.input`
  padding: 0.625rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'secondary' ? '#6b7280' : '#3b82f6'};
  color: white;

  &:hover:not(:disabled) {
    background: ${props => props.variant === 'secondary' ? '#4b5563' : '#2563eb'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .material-icons-outlined {
    font-size: 1.125rem;
  }
`;

const TableContainer = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a4a4a;
  border-bottom: 2px solid #e5e7eb;
`;

const Tr = styled.tr`
  &:hover {
    background: #f9fafb;
  }
`;

const Td = styled.td`
  padding: 0.75rem;
  font-size: 0.875rem;
  color: #1a1a1a;
  border-bottom: 1px solid #e5e7eb;

  &.surplus {
    color: #10b981;
    font-weight: 600;
  }

  &.shortage {
    color: #ef4444;
    font-weight: 600;
  }

  &.zero {
    color: #6b7280;
  }
`;

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border: none;
  border-radius: 4px;
  background: #e5e7eb;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #d1d5db;
    color: #1f2937;
  }

  .material-icons-outlined {
    font-size: 1.25rem;
  }
`;

const PaginationFooter = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
  color: #6b7280;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
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
  padding: 3rem;
  gap: 1rem;
  color: #9ca3af;

  .material-icons-outlined {
    font-size: 4rem;
  }

  p {
    font-size: 1rem;
    margin: 0;
  }
`;
