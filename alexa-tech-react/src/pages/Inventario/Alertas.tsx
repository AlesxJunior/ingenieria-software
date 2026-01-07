import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Layout from '../../components/Layout';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../styles/theme';
import { media } from '../../styles/breakpoints';
import { exportAlertas } from '../../utils/excelExport';
import ModalAjuste from '../../components/Inventario/ModalAjuste';
import ModalNuevaTransferencia from '../../components/Inventario/ModalNuevaTransferencia';
import type { StockItem, AjusteFormData } from '../../types/inventario';
import { WAREHOUSE_OPTIONS } from '../../constants/warehouses';
import { apiService } from '../../utils/api';
import { 
  Button as SharedButton,
  StatCard as SharedStatCard,
  StatsGrid as SharedStatsGrid,
  StatValue,
  StatLabel as SharedStatLabel
} from '../../components/shared';

interface AlertaStock {
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  almacenId: string;
  cantidad: number;
  stockMinimo: number;
  tipoAlerta: 'CRITICO' | 'BAJO';
  porcentaje: number;
  diferenciaUnidades: number;
}

type FiltroTipo = 'ALL' | 'CRITICO' | 'BAJO';

const Alertas: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('ALL');
  const [filtroAlmacen, setFiltroAlmacen] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [exportando, setExportando] = useState(false);
  const [modalAjusteOpen, setModalAjusteOpen] = useState(false);
  const [modalTransferOpen, setModalTransferOpen] = useState(false);
  const [alertaSeleccionada, setAlertaSeleccionada] = useState<AlertaStock | null>(null);
  const [ajusteLoading, setAjusteLoading] = useState(false);
  
  // Almacenes dinámicos
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>(WAREHOUSE_OPTIONS);

  // Cargar almacenes desde la API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiService.getWarehouses();
        const respData = resp.data as any;
        let list: any[] = [];
        
        if (respData?.data?.rows) {
          list = respData.data.rows;
        } else if (respData?.rows) {
          list = respData.rows;
        } else if (respData?.warehouses) {
          list = respData.warehouses;
        } else if (Array.isArray(respData)) {
          list = respData;
        }
        
        if (Array.isArray(list) && list.length > 0 && mounted) {
          const activeWarehouses = list.filter((w: any) => w.activo !== false);
          setWarehouseOptions(activeWarehouses.map((w: any) => ({ 
            value: w.id, 
            label: w.nombre 
          })));
        }
      } catch (e) {
        console.error('Error loading warehouses:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    loadAlertas();
    
    // Actualizar cada 60 segundos
    const interval = setInterval(loadAlertas, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertas = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/alertas`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const alertasData = response.data.data?.rows || response.data.data || [];
      setAlertas(Array.isArray(alertasData) ? alertasData : []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading alertas:', err);
      setError(err.response?.data?.message || 'Error al cargar alertas');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const alertasFiltradas = alertas.filter(a => {
    // Filtro por tipo
    const matchTipo = filtroTipo === 'ALL' || a.tipoAlerta === filtroTipo;
    
    // Filtro por almacén
    const matchAlmacen = !filtroAlmacen || a.almacenId === filtroAlmacen;
    
    // Filtro por búsqueda (código o nombre)
    const matchBusqueda = !busqueda || 
      a.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      a.nombre.toLowerCase().includes(busqueda.toLowerCase());
    
    return matchTipo && matchAlmacen && matchBusqueda;
  });

  const countCritico = alertas.filter(a => a.tipoAlerta === 'CRITICO').length;
  const countBajo = alertas.filter(a => a.tipoAlerta === 'BAJO').length;

  const handleClearFilters = () => {
    setFiltroTipo('ALL');
    setFiltroAlmacen('');
    setBusqueda('');
  };

  const handleAjustar = (alerta: AlertaStock) => {
    setAlertaSeleccionada(alerta);
    setModalAjusteOpen(true);
  };

  const handleTransferir = (alerta: AlertaStock) => {
    setAlertaSeleccionada(alerta);
    setModalTransferOpen(true);
  };

  const handleCloseAjuste = () => {
    setModalAjusteOpen(false);
    setAlertaSeleccionada(null);
  };

  const handleCloseTransfer = () => {
    setModalTransferOpen(false);
    setAlertaSeleccionada(null);
  };

  const handleSubmitAjuste = async (data: AjusteFormData) => {
    setAjusteLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/adjust`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Recargar alertas después del ajuste exitoso
      await loadAlertas();
      handleCloseAjuste();
      alert('✅ Stock ajustado correctamente');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al ajustar stock';
      console.error('Error ajustando stock:', err);
      alert(`❌ ${errorMsg}`);
    } finally {
      setAjusteLoading(false);
    }
  };

  const handleTransferenciaSuccess = () => {
    // Recargar alertas después de crear transferencia
    loadAlertas();
    handleCloseTransfer();
  };

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportAlertas({
        tipoAlerta: filtroTipo === 'ALL' ? undefined : filtroTipo,
      });
      alert('✅ Alertas exportadas exitosamente');
    } catch (error: any) {
      console.error('Error exportando:', error);
      alert(`❌ Error al exportar: ${error.message}`);
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Alertas de Stock">
        <LoadingMessage>Cargando alertas...</LoadingMessage>
      </Layout>
    );
  }

  return (
    <Layout title="Alertas de Stock">
      <Container>
        <Header>
          <TitleSection>
            <Title>Gestión de Alertas de Stock</Title>
            <PageSubtitle>Monitoreo de productos con stock crítico o bajo mínimo establecido</PageSubtitle>
          </TitleSection>
        </Header>

        {error && (
          <ErrorBanner>
            {error}
            <button style={{ marginLeft: '1rem' }} onClick={() => setError(null)}>Cerrar</button>
          </ErrorBanner>
        )}

        {/* Stats Cards con patrón Template UI */}
        <SharedStatsGrid>
          <SharedStatCard $color="#e74c3c">
            <StatValue $color="#e74c3c">{countCritico}</StatValue>
            <SharedStatLabel>Stock Crítico</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#f39c12">
            <StatValue $color="#f39c12">{countBajo}</StatValue>
            <SharedStatLabel>Stock Bajo</SharedStatLabel>
          </SharedStatCard>
          <SharedStatCard $color="#3498db">
            <StatValue $color="#3498db">{alertas.length}</StatValue>
            <SharedStatLabel>Total Alertas</SharedStatLabel>
          </SharedStatCard>
        </SharedStatsGrid>

      {/* Filtros Inline */}
      <FiltersCard>
        <FiltersGrid>
          <FormGroup>
            <Label htmlFor="search">Buscar Producto</Label>
            <Input
              id="search"
              type="text"
              placeholder="Código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="almacen">Almacén</Label>
            <Select
              id="almacen"
              value={filtroAlmacen}
              onChange={(e) => setFiltroAlmacen(e.target.value)}
            >
              <option value="">Todos los almacenes</option>
              {warehouseOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="tipo">Tipo de Alerta</Label>
            <Select
              id="tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            >
              <option value="ALL">Todas ({alertas.length})</option>
              <option value="CRITICO">🔴 Críticas ({countCritico})</option>
              <option value="BAJO">🟡 Bajas ({countBajo})</option>
            </Select>
          </FormGroup>
        </FiltersGrid>

        <ButtonGroup>
          <SharedButton onClick={handleClearFilters}>Limpiar</SharedButton>
          <SharedButton $variant="primary" onClick={loadAlertas}>Buscar</SharedButton>
          <SharedButton $variant="primary" onClick={handleExportar} disabled={exportando || loading} style={{ background: '#28a745' }}>
            {exportando ? 'Exportando...' : 'Exportar a Excel'}
          </SharedButton>
        </ButtonGroup>
      </FiltersCard>

      {alertasFiltradas.length === 0 ? (
        <EmptyState>
          {filtroTipo === 'ALL' 
            ? 'No hay alertas de stock en este momento' 
            : `No hay alertas de tipo ${filtroTipo.toLowerCase()}`}
        </EmptyState>
      ) : (
        <AlertasGrid>
          {alertasFiltradas.map(alerta => (
            <AlertCard key={`${alerta.productId}-${alerta.almacenId}`}>
              <AlertHeader $tipo={alerta.tipoAlerta}>
                <AlertBadge $tipo={alerta.tipoAlerta}>
                  {alerta.tipoAlerta}
                </AlertBadge>
                <AlertTitle>{alerta.nombre}</AlertTitle>
                <AlertCode>{alerta.codigo}</AlertCode>
              </AlertHeader>
              
              <AlertBody>
                <InfoRow>
                  <InfoLabel>Almacén</InfoLabel>
                  <Value>{alerta.almacen}</Value>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Stock Actual</InfoLabel>
                  <Value $strong>{alerta.cantidad} un.</Value>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Stock Mínimo</InfoLabel>
                  <Value>{alerta.stockMinimo} un.</Value>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Faltante</InfoLabel>
                  <Value $highlight>{alerta.diferenciaUnidades} un.</Value>
                </InfoRow>
                
                <ProgressSection>
                  <ProgressInfo>
                    <span>Nivel de stock</span>
                    <ProgressPercent $tipo={alerta.tipoAlerta}>
                      {alerta.porcentaje.toFixed(1)}%
                    </ProgressPercent>
                  </ProgressInfo>
                  <ProgressBar>
                    <ProgressFill $width={alerta.porcentaje} $tipo={alerta.tipoAlerta} />
                  </ProgressBar>
                </ProgressSection>
              </AlertBody>
              
              <AlertActions>
                <ActionButton 
                  $variant="primary" 
                  onClick={() => handleAjustar(alerta)}
                  title="Ajustar stock"
                >
                  Ajustar Stock
                </ActionButton>
                <ActionButton 
                  $variant="secondary" 
                  onClick={() => handleTransferir(alerta)}
                  title="Transferir desde otro almacén"
                >
                  Transferir
                </ActionButton>
              </AlertActions>
            </AlertCard>
          ))}
        </AlertasGrid>
      )}

      {/* Modal de Ajuste de Stock */}
      {alertaSeleccionada && (
        <ModalAjuste
          isOpen={modalAjusteOpen}
          stockItem={{
            productId: alertaSeleccionada.productId,
            warehouseId: alertaSeleccionada.almacenId,
            codigo: alertaSeleccionada.codigo,
            nombre: alertaSeleccionada.nombre,
            cantidad: alertaSeleccionada.cantidad,
            stockMinimo: alertaSeleccionada.stockMinimo,
          } as StockItem}
          onClose={handleCloseAjuste}
          onSubmit={handleSubmitAjuste}
          loading={ajusteLoading}
        />
      )}

      {/* Modal de Nueva Transferencia */}
      {alertaSeleccionada && (
        <ModalNuevaTransferencia
          isOpen={modalTransferOpen}
          onClose={handleCloseTransfer}
          onSuccess={handleTransferenciaSuccess}
          preloadedData={{
            productId: alertaSeleccionada.productId,
            warehouseToId: alertaSeleccionada.almacenId, // Almacén de la alerta como destino
          }}
        />
      )}
      </Container>
    </Layout>
  );
};

// Styled Components siguiendo el estándar del proyecto

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
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const PageSubtitle = styled.p`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.small};
  margin: ${SPACING.xs} 0 0 0;
`;

const ErrorBanner = styled.div`
  background: ${COLOR_SCALES.danger[50]};
  color: ${COLOR_SCALES.danger[700]};
  border: 1px solid ${COLOR_SCALES.danger[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.md} ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LoadingMessage = styled.div`
  background: ${COLORS.neutral[100]};
  color: ${COLORS.textLight};
  border: 1px solid ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING.xxl};
  text-align: center;
`;

// Filtros Inline - Estándar del proyecto
const FiltersCard = styled.div`
  background: ${COLORS.background};
  padding: ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: ${SPACING.lg};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
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

  &::placeholder {
    color: #95a5a6;
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const AlertasGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  
  ${media.tablet} {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
  }
  
  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const AlertCard = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  ${media.mobile} {
    padding: 16px;
  }
`;

const AlertHeader = styled.div<{ $tipo: 'CRITICO' | 'BAJO' }>`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${props => props.$tipo === 'CRITICO' ? '#fee2e2' : '#fef3c7'};
`;

const AlertBadge = styled.div<{ $tipo: 'CRITICO' | 'BAJO' }>`
  display: inline-block;
  padding: 4px 12px;
  background: ${props => props.$tipo === 'CRITICO' ? '#dc2626' : '#f59e0b'};
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const AlertTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const AlertCode = styled.div`
  font-size: 13px;
  color: #666;
  font-family: 'Courier New', monospace;
`;

const AlertBody = styled.div`
  margin-bottom: 16px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-of-type {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #666;
  font-weight: 500;
`;

const Value = styled.span<{ $strong?: boolean; $highlight?: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$strong ? '700' : '400'};
  color: ${props => props.$highlight ? '#dc2626' : '#333'};
`;

const ProgressSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const ProgressInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
`;

const ProgressPercent = styled.span<{ $tipo: 'CRITICO' | 'BAJO' }>`
  font-weight: 700;
  color: ${props => props.$tipo === 'CRITICO' ? '#dc2626' : '#f59e0b'};
`;

const ProgressBar = styled.div`
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $width: number; $tipo: 'CRITICO' | 'BAJO' }>`
  height: 100%;
  width: ${props => Math.min(props.$width, 100)}%;
  background: ${props => props.$tipo === 'CRITICO' ? '#dc2626' : '#f59e0b'};
  transition: width 0.3s ease;
  border-radius: 4px;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
`;

const ActionButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 10px 16px;
  background: ${props => props.$variant === 'primary' ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'primary' ? '#0056b3' : '#5a6268'};
  }
`;

const EmptyState = styled.div`
  background: #f1f3f5;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 3rem 1rem;
  text-align: center;
  font-size: 16px;
`;

export default Alertas;
