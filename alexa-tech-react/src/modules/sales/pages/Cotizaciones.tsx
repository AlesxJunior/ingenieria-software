import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button as SharedButton,
  Input as SharedInput,
  Select as SharedSelect,
  Label as SharedLabel,
  Table as SharedTable,
  Thead as SharedThead,
  Th as SharedTh,
  Tbody as SharedTbody,
  Tr as SharedTr,
  Td as SharedTd,
  PaginationContainer as SharedPaginationContainer,
  PaginationInfo as SharedPaginationInfo,
  PaginationButtons as SharedPaginationButtons,
  PageButton,
  StatCard,
  StatsGrid,
  StatValue,
  StatLabel
} from '../../../components/shared';
import Layout from '../../../components/Layout';
import { useQuotes } from '../context/QuotesContext';
import type { Quote, QuoteStatus } from '../context/QuotesContext';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../../configuracion/context/ConfiguracionContext';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
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

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text.primary};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const FiltersContainer = styled.div`
  background: ${COLORS.neutral.white};
  padding: ${SPACING.xl};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  margin-bottom: ${SPACING.xl};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm};
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

const TableContainer = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

const PageSizeSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text.primary};
  background: ${COLORS.background};
  cursor: pointer;
  transition: ${TRANSITIONS.default};

  &:hover {
    border-color: ${COLOR_SCALES.primary[300]};
  }

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const StatusBadge = styled.span<{ $status: QuoteStatus }>`
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  
  ${props => {
    switch (props.$status) {
      case 'Pendiente':
        return 'background: #fff3cd; color: #856404;';
      case 'Convertida':
        return 'background: #d1ecf1; color: #0c5460;';
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
  gap: ${SPACING.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ color?: string }>`
  background: ${props => props.color || COLOR_SCALES.primary[500]};
  color: ${COLORS.neutral.white};
  border: none;
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.xs} ${SPACING.sm};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${SPACING.xs};
  transition: ${TRANSITIONS.default};
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['4xl']} ${SPACING.xl};
  color: ${COLORS.text.secondary};
`;

const EmptyIcon = styled.div`
  font-size: ${TYPOGRAPHY.fontSize['4xl']};
  margin-bottom: ${SPACING.lg};
`;

const EmptyText = styled.p`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  margin: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${SPACING['4xl']};
`;

const Spinner = styled.div`
  border: 4px solid ${COLORS.neutral[200]};
  border-top: 4px solid ${COLOR_SCALES.primary[500]};
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
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${SHADOWS.lg};
`;

const ModalHeader = styled.div`
  padding: ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${COLORS.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${TYPOGRAPHY.fontSize.xl};
  cursor: pointer;
  color: ${COLORS.text.secondary};
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: ${TRANSITIONS.default};

  &:hover {
    color: ${COLORS.text.primary};
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

const Cotizaciones: React.FC = () => {
  const { quotes, loading, stats, fetchQuotes, deleteQuote, setFilters } = useQuotes();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { empresa } = useConfiguracion();

  // Estados locales
  const [localFilters, setLocalFilters] = useState<{
    estado: QuoteStatus | 'Todas';
    fechaDesde: string;
    fechaHasta: string;
    search: string;
  }>({
    estado: 'Todas',
    fechaDesde: '',
    fechaHasta: '',
    search: ''
  });

  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Paginación de quotes
  const paginatedQuotes = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return quotes.slice(startIndex, startIndex + pageSize);
  }, [quotes, currentPage, pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(quotes.length / pageSize);
  }, [quotes.length, pageSize]);

  // Cargar datos al montar SOLO UNA VEZ
  useEffect(() => {
    fetchQuotes();
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
    setCurrentPage(1); // Reset página al aplicar filtros
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
    setCurrentPage(1); // Reset página al limpiar filtros
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
  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `S/ ${numAmount.toFixed(2)}`;
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
          <TitleSection>
            <Title>Cotizaciones</Title>
            <PageSubtitle>Gestión de cotizaciones, seguimiento de estados y conversión a ventas</PageSubtitle>
          </TitleSection>
        </Header>

        {/* Estadísticas */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.totalQuotes}</StatValue>
            <StatLabel>Total</StatLabel>
          </StatCard>
          <StatCard $color="#f39c12">
            <StatValue $color="#f39c12">{stats.pendientes}</StatValue>
            <StatLabel>Pendientes</StatLabel>
          </StatCard>
          <StatCard $color="#27ae60">
            <StatValue $color="#27ae60">{stats.convertidas}</StatValue>
            <StatLabel>Convertidas</StatLabel>
          </StatCard>
          <StatCard $color="#95a5a6">
            <StatValue $color="#95a5a6">{stats.vencidas}</StatValue>
            <StatLabel>Vencidas</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filtros */}
        <FiltersContainer>
          <FiltersGrid>
            <FilterGroup>
              <SharedLabel htmlFor="estado">Estado</SharedLabel>
              <SharedSelect
                id="estado"
                value={localFilters.estado}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLocalFilters({ ...localFilters, estado: e.target.value as QuoteStatus | 'Todas' })}
              >
                <option value="Todas">Todos los Estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Convertida">Convertida</option>
                <option value="Vencida">Vencida</option>
                <option value="Cancelada">Cancelada</option>
              </SharedSelect>
            </FilterGroup>

            <FilterGroup>
              <SharedLabel htmlFor="fechaDesde">Fecha Desde</SharedLabel>
              <SharedInput
                id="fechaDesde"
                type="date"
                value={localFilters.fechaDesde}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalFilters({ ...localFilters, fechaDesde: e.target.value })}
              />
            </FilterGroup>

            <FilterGroup>
              <SharedLabel htmlFor="fechaHasta">Fecha Hasta</SharedLabel>
              <SharedInput
                id="fechaHasta"
                type="date"
                value={localFilters.fechaHasta}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalFilters({ ...localFilters, fechaHasta: e.target.value })}
              />
            </FilterGroup>

            <FilterGroup>
              <SharedLabel htmlFor="search">Buscar por Código</SharedLabel>
              <SharedInput
                id="search"
                type="text"
                placeholder="COT-001..."
                value={localFilters.search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLocalFilters({ ...localFilters, search: e.target.value })}
              />
            </FilterGroup>
          </FiltersGrid>
          <ButtonGroup>
            <SharedButton $variant="secondary" onClick={handleClearFilters}>
              Limpiar
            </SharedButton>
            <SharedButton $variant="primary" onClick={handleApplyFilters}>
              Buscar
            </SharedButton>
            <SharedButton $variant="primary" style={{ background: '#28a745' }}>
              Exportar a Excel
            </SharedButton>
          </ButtonGroup>
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
            <SharedTable>
              <SharedThead>
                <tr>
                  <SharedTh>Código</SharedTh>
                  <SharedTh>Cliente</SharedTh>
                  <SharedTh>Fecha Emisión</SharedTh>
                  <SharedTh>Fecha Vencimiento</SharedTh>
                  <SharedTh>Total</SharedTh>
                  <SharedTh>Estado</SharedTh>
                  <SharedTh>Acciones</SharedTh>
                </tr>
              </SharedThead>
              <SharedTbody>
                {paginatedQuotes.map((quote) => (
                  <SharedTr key={quote.id}>
                    <SharedTd><strong>{quote.codigoCotizacion}</strong></SharedTd>
                    <SharedTd>{getClientName(quote)}</SharedTd>
                    <SharedTd>{formatDate(quote.fechaEmision)}</SharedTd>
                    <SharedTd>{formatDate(quote.fechaVencimiento)}</SharedTd>
                    <SharedTd><strong>{formatCurrency(quote.total)}</strong></SharedTd>
                    <SharedTd>
                      <StatusBadge $status={quote.estado}>{quote.estado}</StatusBadge>
                    </SharedTd>
                    <SharedTd>
                      <ActionButtons>
                        <ActionButton 
                          color="#3498db"
                          onClick={() => handleViewDetail(quote)}
                        >
                          Ver
                        </ActionButton>

                        <ActionButton 
                          color="#16a085"
                          onClick={async () => {
                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                            const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
                            if (!token) {
                              showNotification('error', 'Error', 'No se encontró el token de autenticación');
                              return;
                            }
                            
                            try {
                              showNotification('info', 'Cargando...', 'Preparando PDF para imprimir');
                              
                              // Descargar el PDF como blob
                              const response = await fetch(`${API_URL}/quotes/${quote.id}/pdf?token=${encodeURIComponent(token)}`);
                              if (!response.ok) {
                                throw new Error('Error al obtener el PDF');
                              }
                              
                              const blob = await response.blob();
                              const blobUrl = window.URL.createObjectURL(blob);
                              
                              // Abrir en nueva ventana y auto-imprimir
                              const printWindow = window.open(blobUrl, '_blank');
                              
                              if (printWindow) {
                                printWindow.onload = function() {
                                  setTimeout(() => {
                                    printWindow.print();
                                    // Limpiar después de un tiempo
                                    setTimeout(() => {
                                      window.URL.revokeObjectURL(blobUrl);
                                    }, 1000);
                                  }, 250);
                                };
                              } else {
                                showNotification('error', 'Error', 'Por favor permite las ventanas emergentes para imprimir');
                                window.URL.revokeObjectURL(blobUrl);
                              }
                            } catch (error) {
                              console.error('Error al imprimir:', error);
                              showNotification('error', 'Error', 'No se pudo obtener el PDF para imprimir');
                            }
                          }}
                        >
                          Imprimir
                        </ActionButton>

                        {quote.estado === 'Pendiente' && (
                          <ActionButton 
                            color="#9b59b6"
                            onClick={() => {
                              // Redirigir a Realizar Venta con los datos de la cotización
                              navigate('/ventas/realizar', { 
                                state: { 
                                  fromQuote: true,
                                  quoteId: quote.id,
                                  quoteCode: quote.codigoCotizacion,
                                  clienteId: quote.clienteId,
                                  items: quote.items.map(item => ({
                                    productId: item.productId,
                                    nombreProducto: item.nombreProducto,
                                    cantidad: Number(item.cantidad),
                                    precioUnitario: Number(item.precioUnitario),
                                  }))
                                }
                              });
                            }}
                          >
                            Convertir a Venta
                          </ActionButton>
                        )}

                        {quote.estado !== 'Convertida' && (
                          <ActionButton 
                            color="#e74c3c"
                            onClick={() => handleDelete(quote.id)}
                          >
                            Eliminar
                          </ActionButton>
                        )}
                      </ActionButtons>
                    </SharedTd>
                  </SharedTr>
                ))}
              </SharedTbody>
            </SharedTable>
          )}

          {/* Paginación */}
          {quotes.length > 0 && (
            <SharedPaginationContainer>
              <SharedPaginationInfo>
                Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, quotes.length)} de {quotes.length} cotizaciones
              </SharedPaginationInfo>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <PageSizeSelect
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </PageSizeSelect>

                <SharedPaginationButtons>
                  <PageButton
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </PageButton>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <PageButton
                        key={pageNum}
                        $active={pageNum === currentPage}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </PageButton>
                    );
                  })}

                  <PageButton
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </PageButton>
                </SharedPaginationButtons>
              </div>
            </SharedPaginationContainer>
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
                        <StatusBadge $status={selectedQuote.estado}>{selectedQuote.estado}</StatusBadge>
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
                      {empresa?.igvActivo && (
                        <TotalRow>
                          <TotalLabel>IGV ({empresa.igvPorcentaje}%):</TotalLabel>
                          <TotalValue>{formatCurrency(selectedQuote.igv)}</TotalValue>
                        </TotalRow>
                      )}
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
      </Container>
    </Layout>
  );
};

export default Cotizaciones;
