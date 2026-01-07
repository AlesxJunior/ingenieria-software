import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useSales } from '../context/SalesContext';
import type { CashSession } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS, Z_INDEX } from '../../../styles/theme';
import { Button as SharedButton } from '../../../components/shared/Button';

interface SessionDetailModalProps {
  sessionId: string;
  onClose: () => void;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({ sessionId, onClose }) => {
  const { getSessionById, loadCashMovements, loadCashSummary, cashMovements, loading } = useSales();
  const { showNotification } = useNotification();
  
  const [session, setSession] = useState<CashSession | null>(null);

  useEffect(() => {
    loadSessionData();
  }, [sessionId]);

  const loadSessionData = async () => {
    try {
      const sessionData = await getSessionById(sessionId);
      setSession(sessionData);
      
      // Cargar movimientos y resumen
      await loadCashMovements(sessionId);
      await loadCashSummary(sessionId);
    } catch (error) {
      showNotification('error', 'Error', 'No se pudo cargar el detalle de la sesión');
      console.error('Error loading session details:', error);
    }
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

  if (loading || !session) {
    return (
      <Overlay onClick={onClose}>
        <ModalContainer onClick={(e) => e.stopPropagation()}>
          <LoadingContainer>
            <LoadingSpinner />
            <p>Cargando detalles...</p>
          </LoadingContainer>
        </ModalContainer>
      </Overlay>
    );
  }

  const totalIngresos = cashMovements.filter(m => m.tipo === 'INGRESO').reduce((sum, m) => sum + Number(m.monto), 0);
  const totalEgresos = cashMovements.filter(m => m.tipo === 'EGRESO').reduce((sum, m) => sum + Number(m.monto), 0);
  const montoEsperado = session.montoApertura + session.totalVentas + totalIngresos - totalEgresos;

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Detalle de Sesión de Caja</ModalTitle>
          <CloseButton onClick={onClose}>
            <span className="material-icons-outlined">close</span>
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Información General */}
          <Section>
            <SectionTitle>Información General</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Caja:</InfoLabel>
                <InfoValue>{session.cashRegister?.nombre || session.cashRegisterId}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Usuario:</InfoLabel>
                <InfoValue>
                  {session.user 
                    ? `${session.user.firstName} ${session.user.lastName}`
                    : session.userId}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Fecha Apertura:</InfoLabel>
                <InfoValue>{formatDate(session.fechaApertura)}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Fecha Cierre:</InfoLabel>
                <InfoValue>{formatDate(session.fechaCierre || session.updatedAt)}</InfoValue>
              </InfoItem>
              {session.observaciones && (
                <InfoItem style={{ gridColumn: '1 / -1' }}>
                  <InfoLabel>Observaciones:</InfoLabel>
                  <InfoValue>{session.observaciones}</InfoValue>
                </InfoItem>
              )}
            </InfoGrid>
          </Section>

          {/* Resumen Financiero */}
          <Section>
            <SectionTitle>Resumen Financiero</SectionTitle>
            <SummaryGrid>
              <SummaryItem>
                <SummaryLabel>Monto Apertura</SummaryLabel>
                <SummaryValue>{formatCurrency(session.montoApertura)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Total Ventas</SummaryLabel>
                <SummaryValue className="sales">{formatCurrency(session.totalVentas)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Ingresos Adicionales</SummaryLabel>
                <SummaryValue className="income">{formatCurrency(totalIngresos)}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>Egresos</SummaryLabel>
                <SummaryValue className="expense">{formatCurrency(totalEgresos)}</SummaryValue>
              </SummaryItem>
              <SummaryItem className="highlight">
                <SummaryLabel>Monto Esperado (Sistema)</SummaryLabel>
                <SummaryValue>{formatCurrency(montoEsperado)}</SummaryValue>
              </SummaryItem>
              <SummaryItem className="highlight">
                <SummaryLabel>Monto Contado (Real)</SummaryLabel>
                <SummaryValue>{formatCurrency(session.montoCierre || 0)}</SummaryValue>
              </SummaryItem>
              <SummaryItem className={`total ${getDifferenceClass(session.diferencia)}`}>
                <SummaryLabel>Diferencia</SummaryLabel>
                <SummaryValue>
                  {session.diferencia && session.diferencia > 0 && '+'}
                  {formatCurrency(session.diferencia || 0)}
                </SummaryValue>
              </SummaryItem>
            </SummaryGrid>
          </Section>

          {/* Movimientos de Caja */}
          <Section>
            <SectionTitle>Movimientos de Caja ({cashMovements.length})</SectionTitle>
            {cashMovements.length === 0 ? (
              <EmptyState>
                <span className="material-icons-outlined">receipt_long</span>
                <p>No hay movimientos registrados</p>
              </EmptyState>
            ) : (
              <MovementsTable>
                <thead>
                  <tr>
                    <Th>Fecha</Th>
                    <Th>Tipo</Th>
                    <Th>Motivo</Th>
                    <Th>Descripción</Th>
                    <Th>Monto</Th>
                  </tr>
                </thead>
                <tbody>
                  {cashMovements.map((movement) => (
                    <Tr key={movement.id}>
                      <Td>{formatDate(movement.createdAt)}</Td>
                      <Td>
                        <TypeBadge type={movement.tipo}>
                          {movement.tipo === 'INGRESO' ? 'Ingreso' : 'Egreso'}
                        </TypeBadge>
                      </Td>
                      <Td>{movement.motivo}</Td>
                      <Td>{movement.descripcion || '-'}</Td>
                      <Td className={movement.tipo === 'INGRESO' ? 'income' : 'expense'}>
                        {movement.tipo === 'INGRESO' ? '+' : '-'}
                        {formatCurrency(Number(movement.monto))}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </MovementsTable>
            )}
          </Section>
        </ModalBody>

        <ModalFooter>
          <SharedButton $variant="outline" onClick={onClose}>
            Cerrar
          </SharedButton>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

// ==================== STYLED COMPONENTS ====================

const Overlay = styled.div`
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
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: #1a1a1a;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  .material-icons-outlined {
    font-size: 1.5rem;
  }
`;

const ModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
`;

const Section = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.25rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 1rem 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const InfoValue = styled.span`
  font-size: 0.875rem;
  color: #1a1a1a;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
`;

const SummaryLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const SummaryValue = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;

  &.sales {
    color: #3b82f6;
  }

  &.income {
    color: #10b981;
  }

  &.expense {
    color: #ef4444;
  }
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;

  &.highlight {
    background: #eff6ff;
    border-color: #3b82f6;
  }

  &.total {
    grid-column: 1 / -1;
    background: #f3f4f6;
    border: 2px solid #1f2937;
    
    ${SummaryLabel}, ${SummaryValue} {
      font-size: 1.125rem;
      font-weight: 700;
    }
  }

  &.surplus {
    background: #f0fdf4;
    border-color: #10b981;
    
    ${SummaryValue} {
      color: #10b981;
    }
  }

  &.shortage {
    background: #fef2f2;
    border-color: #ef4444;
    
    ${SummaryValue} {
      color: #ef4444;
    }
  }

  &.zero {
    ${SummaryValue} {
      color: #6b7280;
    }
  }
`;

const MovementsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 6px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
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

  &.income {
    color: #10b981;
    font-weight: 600;
  }

  &.expense {
    color: #ef4444;
    font-weight: 600;
  }
`;

const TypeBadge = styled.span<{ type: 'INGRESO' | 'EGRESO' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.type === 'INGRESO' ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.type === 'INGRESO' ? '#065f46' : '#991b1b'};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.variant === 'secondary' ? '#6b7280' : '#3b82f6'};
  color: white;

  &:hover {
    background: ${props => props.variant === 'secondary' ? '#4b5563' : '#2563eb'};
  }
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
  padding: 2rem;
  gap: 0.75rem;
  color: #9ca3af;
  background: white;
  border-radius: 6px;

  .material-icons-outlined {
    font-size: 3rem;
  }

  p {
    font-size: 0.875rem;
    margin: 0;
  }
`;
