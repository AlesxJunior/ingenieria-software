import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useQuotes } from '../context/QuotesContext';
import type { Quote, QuoteStatus } from '../context/QuotesContext';
import { useNotification } from '../../../context/NotificationContext';
import { useSales } from '../context/SalesContext';
import { useAuth } from '../../../context/AuthContext';

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

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ color: string }>`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
  border-left: 4px solid ${props => props.color};
`;

const StatValue = styled.div<{ color: string }>`
  font-size: 2rem;
  font-weight: bold;
  color: ${props => props.color};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
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

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
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

const ButtonsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.variant === 'danger') {
      return `
        background-color: #e74c3c;
        color: white;
        &:hover {
          background-color: #c0392b;
        }
      `;
    }
    if (props.variant === 'secondary') {
      return `
        background-color: #95a5a6;
        color: white;
        &:hover {
          background-color: #7f8c8d;
        }
      `;
    }
    return `
      background-color: #3498db;
      color: white;
      &:hover {
        background-color: #2980b9;
      }
    `;
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: #34495e;
  color: white;
`;

const Th = styled.th`
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.9rem;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid #ecf0f1;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }
`;

const Td = styled.td`
  padding: 1rem;
  font-size: 0.95rem;
  color: #2c3e50;
`;

const StatusBadge = styled.span<{ status: QuoteStatus }>`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  
  ${props => {
    switch (props.status) {
      case 'Pendiente':
        return 'background: #fff3cd; color: #856404;';
      case 'Aceptada':
        return 'background: #d4edda; color: #155724;';
      case 'Convertida':
        return 'background: #d1ecf1; color: #0c5460;';
      case 'Rechazada':
        return 'background: #f8d7da; color: #721c24;';
      case 'Vencida':
        return 'background: #e2e3e5; color: #383d41;';
      case 'Cancelada':
        return 'background: #e2e3e5; color: #383d41;';
      default:
        return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ color?: string }>`
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.color || '#3498db'};
  color: white;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #7f8c8d;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: 1.2rem;
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Modal para ver detalle
const ModalOverlay = styled.div`
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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #2c3e50;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
`;

const DetailSection = styled.div`
  margin-bottom: 1.5rem;
`;

const DetailTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #34495e;
  font-size: 1.1rem;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DetailLabel = styled.span`
  font-size: 0.85rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const DetailValue = styled.span`
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 600;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 0.5rem;
`;

const TotalsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #ecf0f1;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-weight: 600;
`;

const TotalLabel = styled.span`
  color: #7f8c8d;
`;

const TotalValue = styled.span<{ highlight?: boolean }>`
  color: ${props => props.highlight ? '#27ae60' : '#2c3e50'};
  font-size: ${props => props.highlight ? '1.3rem' : '1rem'};
`;

const ModalFooter = styled.div`
  padding: 1.5rem;
  border-top: 1px solid #ecf0f1;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

// Modal para convertir a venta
const ConvertModalContent = styled(ModalContent)`
  max-width: 600px;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Cotizaciones: React.FC = () => {
  const { quotes, loading, stats, fetchQuotes, deleteQuote, approveQuote, rejectQuote, convertToSale, setFilters } = useQuotes();
  const { cashSessions, loadCashSessions: fetchCashSessions } = useSales();
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados locales
  const [localFilters, setLocalFilters] = useState({
    estado: 'Todas' as QuoteStatus | 'Todas',
    fechaDesde: '',
    fechaHasta: '',
    search: ''
  });

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertData, setConvertData] = useState({
    formaPago: 'Efectivo',
    tipoComprobante: 'Boleta',
    cashSessionId: ''
  });

  // Cargar datos al montar SOLO UNA VEZ
  useEffect(() => {
    fetchQuotes();
    fetchCashSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⚠️ Array vacío = solo se ejecuta al montar

  // Aplicar filtros
  const handleApplyFilters = () => {
    const newFilters = {
      estado: localFilters.estado === 'Todas' ? undefined : localFilters.estado,
      fechaDesde: localFilters.fechaDesde || undefined,
      fechaHasta: localFilters.fechaHasta || undefined,
      search: localFilters.search || undefined
    };
    setFilters(newFilters);
    // Esperar un momento para que los filtros se actualicen en el contexto
    setTimeout(() => {
      fetchQuotes();
    }, 100);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setLocalFilters({
      estado: 'Todas',
      fechaDesde: '',
      fechaHasta: '',
      search: ''
    });
    setFilters({});
    // Esperar un momento para que los filtros se actualicen en el contexto
    setTimeout(() => {
      fetchQuotes();
    }, 100);
  };

  // Ver detalle
  const handleViewDetail = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetailModal(true);
  };

  // Abrir modal de conversión
  const handleOpenConvertModal = (quote: Quote) => {
    // Validar que haya sesión de caja abierta
    const openSession = cashSessions.find((session: any) => session.estado === 'Abierta');
    if (!openSession) {
      showNotification('warning', 'Advertencia', 'Debe abrir una sesión de caja primero');
      return;
    }

    setSelectedQuote(quote);
    setConvertData({
      ...convertData,
      cashSessionId: openSession.id
    });
    setShowConvertModal(true);
  };

  // Convertir a venta
  const handleConvertToSale = async () => {
    if (!selectedQuote || !user) return;

    try {
      const result = await convertToSale({
        quoteId: selectedQuote.id,
        userId: user.id,
        formaPago: convertData.formaPago,
        tipoComprobante: convertData.tipoComprobante,
        cashSessionId: convertData.cashSessionId
      });

      setShowConvertModal(false);
      showNotification('success', 'Éxito', 'Cotización convertida a venta exitosamente');
      
      // Redirigir al detalle de la venta creada
      if (result.sale) {
        navigate(`/ventas/detalle/${result.sale.id}`);
      }
    } catch (error) {
      console.error('Error al convertir:', error);
    }
  };

  // Aprobar cotización
  const handleApprove = async (id: string) => {
    if (window.confirm('¿Está seguro de aprobar esta cotización?')) {
      try {
        await approveQuote(id);
      } catch (error) {
        console.error('Error al aprobar:', error);
      }
    }
  };

  // Rechazar cotización
  const handleReject = async (id: string) => {
    const motivo = window.prompt('Motivo de rechazo (opcional):');
    if (motivo !== null) {
      try {
        await rejectQuote(id, motivo);
      } catch (error) {
        console.error('Error al rechazar:', error);
      }
    }
  };

  // Eliminar cotización
  const handleDelete = async (id: string) => {
    if (window.confirm('¿Está seguro de eliminar esta cotización? Esta acción no se puede deshacer.')) {
      try {
        await deleteQuote(id);
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return `S/ ${amount.toFixed(2)}`;
  };

  // Obtener nombre del cliente
  const getClientName = (quote: Quote) => {
    if (!quote.cliente) return 'Cliente General';
    if (quote.cliente.razonSocial) return quote.cliente.razonSocial;
    return `${quote.cliente.nombres} ${quote.cliente.apellidos}`.trim();
  };

  return (
    <Layout title="Cotizaciones">
      <Container>
        <Header>
          <Title>📝 Cotizaciones</Title>
        </Header>

        {/* Estadísticas */}
        <StatsContainer>
          <StatCard color="#f39c12">
            <StatValue color="#f39c12">{stats.totalQuotes}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatCard>
          <StatCard color="#f39c12">
            <StatValue color="#f39c12">{stats.pendientes}</StatValue>
            <StatLabel>Pendientes</StatLabel>
          </StatCard>
          <StatCard color="#27ae60">
            <StatValue color="#27ae60">{stats.aceptadas}</StatValue>
            <StatLabel>Aprobadas</StatLabel>
          </StatCard>
          <StatCard color="#3498db">
            <StatValue color="#3498db">{stats.convertidas}</StatValue>
            <StatLabel>Convertidas</StatLabel>
          </StatCard>
          <StatCard color="#e74c3c">
            <StatValue color="#e74c3c">{stats.rechazadas}</StatValue>
            <StatLabel>Rechazadas</StatLabel>
          </StatCard>
          <StatCard color="#95a5a6">
            <StatValue color="#95a5a6">{stats.vencidas}</StatValue>
            <StatLabel>Vencidas</StatLabel>
          </StatCard>
        </StatsContainer>

        {/* Filtros */}
        <FiltersContainer>
          <FiltersTitle>Filtros de Búsqueda</FiltersTitle>
          <FiltersGrid>
            <FilterGroup>
              <Label>Estado</Label>
              <Select
                value={localFilters.estado}
                onChange={(e) => setLocalFilters({ ...localFilters, estado: e.target.value as QuoteStatus | 'Todas' })}
              >
                <option value="Todas">Todas</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aceptada">Aprobada</option>
                <option value="Convertida">Convertida</option>
                <option value="Rechazada">Rechazada</option>
                <option value="Vencida">Vencida</option>
                <option value="Cancelada">Cancelada</option>
              </Select>
            </FilterGroup>

            <FilterGroup>
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={localFilters.fechaDesde}
                onChange={(e) => setLocalFilters({ ...localFilters, fechaDesde: e.target.value })}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={localFilters.fechaHasta}
                onChange={(e) => setLocalFilters({ ...localFilters, fechaHasta: e.target.value })}
              />
            </FilterGroup>

            <FilterGroup>
              <Label>Buscar por Código</Label>
              <Input
                type="text"
                placeholder="COT-001..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
              />
            </FilterGroup>

            <ButtonsContainer>
              <Button variant="primary" onClick={handleApplyFilters}>
                🔍 Buscar
              </Button>
              <Button variant="secondary" onClick={handleClearFilters}>
                🔄 Limpiar
              </Button>
            </ButtonsContainer>
          </FiltersGrid>
        </FiltersContainer>

        {/* Tabla de cotizaciones */}
        <TableContainer>
          {loading ? (
            <LoadingContainer>
              <Spinner />
            </LoadingContainer>
          ) : quotes.length === 0 ? (
            <EmptyState>
              <EmptyIcon>📋</EmptyIcon>
              <EmptyText>No hay cotizaciones registradas</EmptyText>
            </EmptyState>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Código</Th>
                  <Th>Cliente</Th>
                  <Th>Fecha Emisión</Th>
                  <Th>Fecha Vencimiento</Th>
                  <Th>Total</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {quotes.map((quote) => (
                  <Tr key={quote.id}>
                    <Td><strong>{quote.codigoCotizacion}</strong></Td>
                    <Td>{getClientName(quote)}</Td>
                    <Td>{formatDate(quote.fechaEmision)}</Td>
                    <Td>{formatDate(quote.fechaVencimiento)}</Td>
                    <Td><strong>{formatCurrency(quote.total)}</strong></Td>
                    <Td>
                      <StatusBadge status={quote.estado}>{quote.estado}</StatusBadge>
                    </Td>
                    <Td>
                      <ActionButtons>
                        <ActionButton 
                          color="#3498db"
                          onClick={() => handleViewDetail(quote)}
                        >
                          👁️ Ver
                        </ActionButton>

                        {(quote.estado === 'Pendiente' || quote.estado === 'Aceptada') && (
                          <ActionButton 
                            color="#9b59b6"
                            onClick={() => handleOpenConvertModal(quote)}
                          >
                            🛒 Convertir
                          </ActionButton>
                        )}

                        {quote.estado === 'Pendiente' && (
                          <>
                            <ActionButton 
                              color="#27ae60"
                              onClick={() => handleApprove(quote.id)}
                            >
                              ✅ Aprobar
                            </ActionButton>
                            <ActionButton 
                              color="#e74c3c"
                              onClick={() => handleReject(quote.id)}
                            >
                              ❌ Rechazar
                            </ActionButton>
                          </>
                        )}

                        {quote.estado !== 'Convertida' && (
                          <ActionButton 
                            color="#e74c3c"
                            onClick={() => handleDelete(quote.id)}
                          >
                            🗑️ Eliminar
                          </ActionButton>
                        )}
                      </ActionButtons>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          )}
        </TableContainer>

        {/* Modal de detalle */}
        {showDetailModal && selectedQuote && (
          <ModalOverlay onClick={() => setShowDetailModal(false)}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Detalle de Cotización: {selectedQuote.codigoCotizacion}</ModalTitle>
                <CloseButton onClick={() => setShowDetailModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                <DetailSection>
                  <DetailTitle>Información General</DetailTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Código</DetailLabel>
                      <DetailValue>{selectedQuote.codigoCotizacion}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Estado</DetailLabel>
                      <DetailValue>
                        <StatusBadge status={selectedQuote.estado}>{selectedQuote.estado}</StatusBadge>
                      </DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Cliente</DetailLabel>
                      <DetailValue>{getClientName(selectedQuote)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Fecha Emisión</DetailLabel>
                      <DetailValue>{formatDate(selectedQuote.fechaEmision)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Fecha Vencimiento</DetailLabel>
                      <DetailValue>{formatDate(selectedQuote.fechaVencimiento)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Días de Validez</DetailLabel>
                      <DetailValue>{selectedQuote.diasValidez} días</DetailValue>
                    </DetailItem>
                  </DetailGrid>

                  {selectedQuote.observaciones && (
                    <div style={{ marginTop: '1rem' }}>
                      <DetailLabel>Observaciones</DetailLabel>
                      <DetailValue>{selectedQuote.observaciones}</DetailValue>
                    </div>
                  )}

                  {selectedQuote.motivoRechazo && (
                    <div style={{ marginTop: '1rem' }}>
                      <DetailLabel>Motivo de Rechazo</DetailLabel>
                      <DetailValue style={{ color: '#e74c3c' }}>{selectedQuote.motivoRechazo}</DetailValue>
                    </div>
                  )}
                </DetailSection>

                <DetailSection>
                  <DetailTitle>Productos</DetailTitle>
                  <ItemsTable>
                    <thead>
                      <Tr>
                        <Th>Producto</Th>
                        <Th>Cantidad</Th>
                        <Th>Precio Unit.</Th>
                        <Th>Subtotal</Th>
                      </Tr>
                    </thead>
                    <tbody>
                      {selectedQuote.items.map((item) => (
                        <Tr key={item.id}>
                          <Td>{item.nombreProducto}</Td>
                          <Td>{item.cantidad}</Td>
                          <Td>{formatCurrency(item.precioUnitario)}</Td>
                          <Td>{formatCurrency(item.subtotal)}</Td>
                        </Tr>
                      ))}
                    </tbody>
                  </ItemsTable>

                  <TotalsGrid>
                    <div></div>
                    <div>
                      <TotalRow>
                        <TotalLabel>Subtotal:</TotalLabel>
                        <TotalValue>{formatCurrency(selectedQuote.subtotal)}</TotalValue>
                      </TotalRow>
                      <TotalRow>
                        <TotalLabel>IGV (18%):</TotalLabel>
                        <TotalValue>{formatCurrency(selectedQuote.igv)}</TotalValue>
                      </TotalRow>
                      <TotalRow>
                        <TotalLabel>TOTAL:</TotalLabel>
                        <TotalValue highlight>{formatCurrency(selectedQuote.total)}</TotalValue>
                      </TotalRow>
                    </div>
                  </TotalsGrid>
                </DetailSection>

                {selectedQuote.salesConverted && selectedQuote.salesConverted.length > 0 && (
                  <DetailSection>
                    <DetailTitle>Ventas Generadas</DetailTitle>
                    {selectedQuote.salesConverted.map((sale) => (
                      <DetailItem key={sale.id}>
                        <DetailLabel>Venta:</DetailLabel>
                        <DetailValue>
                          {sale.codigoVenta} - {formatCurrency(sale.total)} - {formatDate(sale.createdAt)}
                        </DetailValue>
                      </DetailItem>
                    ))}
                  </DetailSection>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Cerrar
                </Button>
              </ModalFooter>
            </ModalContent>
          </ModalOverlay>
        )}

        {/* Modal de conversión a venta */}
        {showConvertModal && selectedQuote && (
          <ModalOverlay onClick={() => setShowConvertModal(false)}>
            <ConvertModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Convertir a Venta: {selectedQuote.codigoCotizacion}</ModalTitle>
                <CloseButton onClick={() => setShowConvertModal(false)}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                <DetailSection>
                  <DetailTitle>Resumen de Cotización</DetailTitle>
                  <DetailGrid>
                    <DetailItem>
                      <DetailLabel>Cliente</DetailLabel>
                      <DetailValue>{getClientName(selectedQuote)}</DetailValue>
                    </DetailItem>
                    <DetailItem>
                      <DetailLabel>Total</DetailLabel>
                      <DetailValue style={{ color: '#27ae60' }}>{formatCurrency(selectedQuote.total)}</DetailValue>
                    </DetailItem>
                  </DetailGrid>
                </DetailSection>

                <FormGroup>
                  <Label>Método de Pago</Label>
                  <Select
                    value={convertData.formaPago}
                    onChange={(e) => setConvertData({ ...convertData, formaPago: e.target.value })}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Tipo de Comprobante</Label>
                  <Select
                    value={convertData.tipoComprobante}
                    onChange={(e) => setConvertData({ ...convertData, tipoComprobante: e.target.value })}
                  >
                    <option value="Boleta">Boleta</option>
                    <option value="Factura">Factura</option>
                    <option value="NotaVenta">Nota de Venta</option>
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>Caja Registradora</Label>
                  <Select
                    value={convertData.cashSessionId}
                    onChange={(e) => setConvertData({ ...convertData, cashSessionId: e.target.value })}
                  >
                    {cashSessions.filter((s: any) => s.estado === 'Abierta').map((session: any) => (
                      <option key={session.id} value={session.id}>
                        {session.cashRegister?.nombre || 'Caja'} - Abierta
                      </option>
                    ))}
                  </Select>
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button variant="secondary" onClick={() => setShowConvertModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  onClick={handleConvertToSale}
                  disabled={!convertData.cashSessionId}
                >
                  🛒 Confirmar Conversión
                </Button>
              </ModalFooter>
            </ConvertModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Layout>
  );
};

export default Cotizaciones;
