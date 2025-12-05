import React, { useState } from 'react';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useClients } from '../../clients/context/ClientContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import { Sparkles, Search, MapPin, TrendingUp, AlertTriangle, Lightbulb, ShoppingCart, Loader2, Eye, CheckCircle, Clock } from 'lucide-react';

// 🎨 ESTILOS SIGUIENDO DISEÑO ESTÁNDAR DEL SISTEMA
const AIContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #333;
  font-weight: 600;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

const SearchSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SearchGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 16px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 13px;
  color: #333;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const SearchButton = styled.button<{ $loading?: boolean }>`
  padding: 10px 24px;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${(props) => (props.$loading ? 'not-allowed' : 'pointer')};
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  opacity: ${(props) => (props.$loading ? 0.7 : 1)};

  &:hover:not(:disabled) {
    background: #2c5282;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const LoadingText = styled.p`
  color: #1e3a5f;
  font-size: 16px;
  font-weight: 600;
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const ResultsContainer = styled.div`
  display: grid;
  gap: 24px;
`;

const ClientInfoCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const ClientHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
`;

const ClientName = styled.h2`
  margin: 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
`;

const ClientDetail = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 13px;
  margin-bottom: 6px;
`;

const SectionTitle = styled.h2`
  color: #333;
  font-size: 18px;
  margin: 20px 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProductCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
`;

const ProductName = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  flex: 1;
  font-weight: 600;
`;

const ScoreBadge = styled.div<{ $score: number }>`
  background: ${(props) =>
    props.$score >= 90
      ? '#22c55e'
      : props.$score >= 70
        ? '#f59e0b'
        : '#ef4444'};
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;

const ProductPrice = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: #1e3a5f;
  margin-bottom: 12px;
`;

const InfoSection = styled.div`
  margin-bottom: 16px;
`;

const InfoTitle = styled.h4`
  font-size: 13px;
  font-weight: 700;
  color: #1e3a5f;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ReasonList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ReasonItem = styled.li`
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  padding-left: 18px;
  position: relative;
  margin-bottom: 4px;

  &::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #22c55e;
    font-weight: 700;
  }
`;

const WarningItem = styled(ReasonItem)`
  &::before {
    content: '⚠';
    color: #f59e0b;
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #1e3a5f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #2c5282;
  }
`;

const NotRecommendedSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const WarningCard = styled.div`
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const WarningTitle = styled.h4`
  margin: 0 0 6px 0;
  color: #92400e;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
`;

const WarningText = styled.p`
  margin: 0;
  color: #78350f;
  font-size: 13px;
  line-height: 1.5;
`;

const TipsSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const TipCard = styled.div`
  background: #eff6ff;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-left: 3px solid #3b82f6;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TipText = styled.p`
  margin: 0;
  color: #1e40af;
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 🕵️ ESTILOS PANEL DETECTIVE
const AnalysisPanel = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 2px solid #1e3a5f;
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
`;

const AnalysisTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #1e3a5f;
  font-weight: 700;
  flex: 1;
`;

const TotalTimeBadge = styled.div`
  background: #1e3a5f;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepCard = styled.div<{ $completed?: boolean }>`
  background: ${props => props.$completed ? '#f0fdf4' : '#f9fafb'};
  border: 2px solid ${props => props.$completed ? '#22c55e' : '#e5e7eb'};
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${props => !props.$completed && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #1e3a5f, #3b82f6, #1e3a5f);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const StepNumber = styled.div<{ $completed?: boolean }>`
  background: ${props => props.$completed ? '#22c55e' : '#1e3a5f'};
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
`;

const StepTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 600;
  flex: 1;
`;

const StepTime = styled.div`
  color: #666;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StepDescription = styled.p`
  margin: 0 0 12px 44px;
  color: #666;
  font-size: 13px;
  line-height: 1.5;
`;

const StepData = styled.div`
  margin-left: 44px;
  background: white;
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #e0e0e0;
`;

const DataRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const DataLabel = styled.span`
  font-weight: 700;
  color: #1e3a5f;
  min-width: 140px;
`;

const DataValue = styled.span`
  color: #666;
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 8px;
  padding: 64px 32px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.4;
`;

const EmptyStateText = styled.p`
  color: #666;
  font-size: 15px;
  margin: 0;
  line-height: 1.5;
`;

// Interfaces
interface ProductRecommendation {
  productoId: string;
  nombre: string;
  precio: number;
  stock: number;
  score: number;
  razones: string[];
  ventajas: string[];
  consideraciones: string[];
}

interface PasoAnalisis {
  paso: number;
  titulo: string;
  descripcion: string;
  datos: any;
  timestamp: string;
}

interface AIResponse {
  recomendaciones?: ProductRecommendation[];  // Backend usa "recomendaciones"
  recomendados?: ProductRecommendation[];     // Compatibilidad
  productosNoRecomendados?: Array<{
    tipo?: string;
    nombre?: string;
    razon: string;
  }>;
  noRecomendados?: Array<{
    tipo?: string;
    nombre?: string;
    razon: string;
  }>;
  productosComplementarios?: ProductRecommendation[];
  tips?: string[];                            // Backend usa "tips"
  tipsExperto?: string[];                     // Compatibilidad
  contextoCliente?: {
    ubicacion: string;
    clima: string;
    historialCompras: number;
  };
  pasosAnalisis?: PasoAnalisis[];
}

const AsistenteVentas: React.FC = () => {
  const { clients } = useClients();
  const { showNotification } = useNotification();

  const [selectedClient, setSelectedClient] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIResponse | null>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const handleSearch = async () => {
    if (!selectedClient) {
      showNotification('warning', 'Selección Requerida', 'Por favor selecciona un cliente');
      return;
    }

    if (searchQuery.trim().length < 3) {
      showNotification('warning', 'Búsqueda Inválida', 'Ingresa al menos 3 caracteres para buscar');
      return;
    }

    // Prevenir múltiples requests simultáneos
    if (loading) {
      console.log('⚠️ Request ya en progreso, ignorando...');
      return;
    }

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    try {
      const response = await apiService.post<AIResponse>('/ai/recommendations', {
        clienteId: selectedClient,
        consulta: searchQuery.trim(),
      });

      console.log('🔍 [DEBUG] Respuesta completa del backend:', response);
      console.log('🔍 [DEBUG] Datos recibidos:', response?.data);

      if (response?.data) {
        setRecommendations(response.data);
        showNotification('success', 'Recomendaciones Generadas', '✨ Las recomendaciones han sido generadas exitosamente');
      }
    } catch (error: any) {
      // Ignorar errores de abort
      if (error.name === 'AbortError') {
        console.log('⚠️ Request cancelado');
        return;
      }

      console.error('Error al obtener recomendaciones:', error);
      showNotification(
        'error',
        'Error de IA',
        error.response?.data?.message || 'No se pudieron obtener recomendaciones de IA'
      );
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleAddToCart = (product: ProductRecommendation) => {
    // TODO: Integrar con el carrito de ventas
    showNotification('success', 'Producto Agregado', `${product.nombre} agregado al carrito`);
  };

  const selectedClientData = clients.find((c) => c.id === selectedClient);

  // Helper: Obtener productos recomendados (backend puede usar "recomendaciones" o "recomendados")
  const getRecommendations = () => {
    if (!recommendations) return [];
    return recommendations.recomendaciones || recommendations.recomendados || [];
  };

  // Helper: Obtener tips (backend puede usar "tips" o "tipsExperto")
  const getTips = () => {
    if (!recommendations) return [];
    return recommendations.tips || recommendations.tipsExperto || [];
  };

  // Helper: Obtener productos no recomendados
  const getNoRecomendados = () => {
    if (!recommendations) return [];
    return recommendations.productosNoRecomendados || recommendations.noRecomendados || [];
  };

  // Función para renderizar datos de análisis de forma estructurada
  const renderAnalysisData = (datos: any) => {
    if (!datos) return null;

    const entries = Object.entries(datos);
    return entries.map(([key, value], index) => {
      // Formatear el label
      const label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase());

      // Formatear el valor
      let displayValue = value;
      if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value, null, 2);
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      }

      return (
        <DataRow key={index}>
          <DataLabel>{label}:</DataLabel>
          <DataValue>{String(displayValue)}</DataValue>
        </DataRow>
      );
    });
  };

  // Calcular tiempo total de análisis
  const getTotalTime = () => {
    if (!recommendations?.pasosAnalisis || recommendations.pasosAnalisis.length === 0) return '0ms';
    const lastStep = recommendations.pasosAnalisis[recommendations.pasosAnalisis.length - 1];
    return lastStep.datos?.tiempoTotal || lastStep.datos?.tiempoAnalisis || 'N/A';
  };

  return (
    <Layout title="Asistente de Ventas IA">
      <AIContainer>
        <Header>
          <Title>
            <Sparkles size={36} />
            Asistente de Ventas Inteligente
          </Title>
          <Subtitle>
            Obtén recomendaciones personalizadas basadas en la ubicación, clima y necesidades del
            cliente usando inteligencia artificial de última generación.
          </Subtitle>
        </Header>

        <SearchSection>
          <SearchGrid>
            <FormGroup>
              <Label>Cliente</Label>
              <Select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecciona un cliente...</option>
                {clients.map((client) => {
                  // Mostrar razónSocial para RUC o nombres+apellidos para DNI/CE/Pasaporte
                  const displayName = client.razonSocial || 
                    `${client.nombres || ''} ${client.apellidos || ''}`.trim();
                  
                  return (
                    <option key={client.id} value={client.id}>
                      {displayName} - {client.numeroDocumento}
                    </option>
                  );
                })}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>¿Qué necesita el cliente?</Label>
              <Input
                type="text"
                placeholder="Ej: cámaras de seguridad"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                disabled={loading}
              />
            </FormGroup>

            <SearchButton onClick={handleSearch} disabled={loading || !selectedClient} $loading={loading}>
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Buscar
                </>
              )}
            </SearchButton>
          </SearchGrid>
        </SearchSection>

        {loading && (
          <LoadingContainer>
            <Loader2 size={48} className="animate-spin" style={{ color: '#1e3a5f' }} />
            <LoadingText>
              <Sparkles size={20} />
              La IA está analizando las mejores opciones para tu cliente...
            </LoadingText>
          </LoadingContainer>
        )}

        {!loading && recommendations && (
          <ResultsContainer>
            {/* 🕵️ PANEL DE ANÁLISIS DETECTIVE */}
            {recommendations.pasosAnalisis && recommendations.pasosAnalisis.length > 0 && (
              <AnalysisPanel>
                <AnalysisHeader>
                  <Eye size={24} style={{ color: '#1e3a5f' }} />
                  <AnalysisTitle>🕵️ Proceso de Análisis de la IA</AnalysisTitle>
                  <TotalTimeBadge>
                    <Clock size={14} />
                    {getTotalTime()}
                  </TotalTimeBadge>
                </AnalysisHeader>

                <StepsContainer>
                  {recommendations.pasosAnalisis.map((paso) => (
                    <StepCard key={paso.paso} $completed={true}>
                      <StepHeader>
                        <StepNumber $completed={true}>
                          <CheckCircle size={16} />
                        </StepNumber>
                        <StepTitle>{paso.titulo}</StepTitle>
                        {paso.datos?.tiempoAnalisis && (
                          <StepTime>
                            <Clock size={12} />
                            {paso.datos.tiempoAnalisis}
                          </StepTime>
                        )}
                      </StepHeader>
                      <StepDescription>{paso.descripcion}</StepDescription>
                      {paso.datos && Object.keys(paso.datos).length > 0 && (
                        <StepData>
                          {renderAnalysisData(paso.datos)}
                        </StepData>
                      )}
                    </StepCard>
                  ))}
                </StepsContainer>
              </AnalysisPanel>
            )}
            {/* Información del Cliente */}
            {selectedClientData && recommendations.contextoCliente && (
              <ClientInfoCard>
                <ClientHeader>
                  <ClientName>
                    {selectedClientData.razonSocial || 
                      `${selectedClientData.nombres || ''} ${selectedClientData.apellidos || ''}`.trim()}
                  </ClientName>
                </ClientHeader>
                <ClientDetail>
                  <MapPin size={16} />
                  <strong>Ubicación:</strong> {recommendations.contextoCliente.ubicacion}
                </ClientDetail>
                <ClientDetail>
                  <TrendingUp size={16} />
                  <strong>Clima:</strong> {recommendations.contextoCliente.clima}
                </ClientDetail>
                <ClientDetail>
                  <ShoppingCart size={16} />
                  <strong>Compras anteriores:</strong>{' '}
                  {recommendations.contextoCliente.historialCompras} productos
                </ClientDetail>
              </ClientInfoCard>
            )}

            {/* Mensaje cuando no hay productos en stock */}
            {getRecommendations().length === 0 && (
              <WarningCard style={{ marginBottom: '24px' }}>
                <WarningTitle>
                  <AlertTriangle size={20} />
                  No hay productos en inventario
                </WarningTitle>
                <WarningText>
                  Actualmente no tenemos productos que coincidan con tu búsqueda, pero la IA 
                  ha generado recomendaciones útiles basadas en el clima y ubicación del cliente.
                </WarningText>
              </WarningCard>
            )}

            {/* Productos Recomendados */}
            {getRecommendations().length > 0 && (
              <>
                <SectionTitle>
                  <TrendingUp size={28} />
                  Productos Recomendados
                </SectionTitle>
                <RecommendationsGrid>
                  {getRecommendations().map((product) => (
                    <ProductCard key={product.productoId}>
                      <ProductHeader>
                        <ProductName>{product.nombre}</ProductName>
                        <ScoreBadge $score={product.score}>{product.score}%</ScoreBadge>
                      </ProductHeader>

                      <ProductPrice>S/ {product.precio ? product.precio.toFixed(2) : '0.00'}</ProductPrice>

                      {product.razones && product.razones.length > 0 && (
                        <InfoSection>
                          <InfoTitle>
                            <Sparkles size={16} />
                            Por qué te lo recomendamos
                          </InfoTitle>
                          <ReasonList>
                            {product.razones.map((razon, idx) => (
                              <ReasonItem key={idx}>{razon}</ReasonItem>
                            ))}
                          </ReasonList>
                        </InfoSection>
                      )}

                      {product.ventajas && product.ventajas.length > 0 && (
                        <InfoSection>
                          <InfoTitle>
                            <TrendingUp size={16} />
                            Ventajas
                          </InfoTitle>
                          <ReasonList>
                            {product.ventajas.map((ventaja, idx) => (
                              <ReasonItem key={idx}>{ventaja}</ReasonItem>
                            ))}
                          </ReasonList>
                        </InfoSection>
                      )}

                      {product.consideraciones && product.consideraciones.length > 0 && (
                        <InfoSection>
                          <InfoTitle>
                            <AlertTriangle size={16} />
                            Consideraciones
                          </InfoTitle>
                          <ReasonList>
                            {product.consideraciones.map((consideracion, idx) => (
                              <WarningItem key={idx}>{consideracion}</WarningItem>
                            ))}
                          </ReasonList>
                        </InfoSection>
                      )}

                      <AddToCartButton onClick={() => handleAddToCart(product)}>
                        <ShoppingCart size={18} />
                        Agregar al Carrito
                      </AddToCartButton>
                    </ProductCard>
                  ))}
                </RecommendationsGrid>
              </>
            )}

            {/* Productos No Recomendados */}
            {getNoRecomendados().length > 0 && (
              <NotRecommendedSection>
                <SectionTitle style={{ color: '#333' }}>
                  <AlertTriangle size={28} />
                  Productos No Recomendados
                </SectionTitle>
                {getNoRecomendados().map((item, idx) => (
                  <WarningCard key={`no-recomendado-${idx}-${item.tipo || item.nombre}`}>
                    <WarningTitle>
                      <AlertTriangle size={18} />
                      {item.nombre || item.tipo || 'Producto No Recomendado'}
                    </WarningTitle>
                    <WarningText>{item.razon}</WarningText>
                  </WarningCard>
                ))}
              </NotRecommendedSection>
            )}

            {/* Productos Complementarios */}
            {recommendations.productosComplementarios &&
              recommendations.productosComplementarios.length > 0 && (
                <>
                  <SectionTitle>
                    <ShoppingCart size={28} />
                    También te puede interesar
                  </SectionTitle>
                  <RecommendationsGrid>
                    {recommendations.productosComplementarios.map((product) => (
                      <ProductCard key={product.productoId}>
                        <ProductHeader>
                          <ProductName>{product.nombre}</ProductName>
                          <ScoreBadge $score={product.score}>{product.score}%</ScoreBadge>
                        </ProductHeader>
                        <ProductPrice>S/ {product.precio ? product.precio.toFixed(2) : '0.00'}</ProductPrice>
                        {product.razones && product.razones.length > 0 && (
                          <InfoSection>
                            <ReasonList>
                              {product.razones.map((razon, idx) => (
                                <ReasonItem key={idx}>{razon}</ReasonItem>
                              ))}
                            </ReasonList>
                          </InfoSection>
                        )}
                        <AddToCartButton onClick={() => handleAddToCart(product)}>
                          <ShoppingCart size={18} />
                          Agregar al Carrito
                        </AddToCartButton>
                      </ProductCard>
                    ))}
                  </RecommendationsGrid>
                </>
              )}

            {/* Tips del Experto */}
            {getTips().length > 0 && (
              <TipsSection>
                <SectionTitle style={{ color: '#333' }}>
                  <Lightbulb size={28} />
                  Tips del Experto
                </SectionTitle>
                {getTips().map((tip, idx) => (
                  <TipCard key={`tip-${idx}-${tip.substring(0, 20)}`}>
                    <TipText>
                      <Lightbulb size={18} />
                      {tip}
                    </TipText>
                  </TipCard>
                ))}
              </TipsSection>
            )}
          </ResultsContainer>
        )}

        {!loading && !recommendations && (
          <EmptyState>
            <EmptyStateIcon>🤖</EmptyStateIcon>
            <EmptyStateText>
              Selecciona un cliente y describe qué necesita para obtener recomendaciones
              inteligentes
            </EmptyStateText>
          </EmptyState>
        )}
      </AIContainer>
    </Layout>
  );
};

export default AsistenteVentas;
