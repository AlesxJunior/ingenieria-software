import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import configuracionApi, { type ComprobanteData } from '../services/configuracionApi';
import Layout from '../../../components/Layout';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { 
  Button,
  Input,
  Select,
  Label,
  FormGroup,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatusBadge
} from '../../../components/shared';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  gap: ${SPACING.lg};
  flex-wrap: wrap;
`;

const Title = styled.h1`
  font-size: ${TYPOGRAPHY.fontSize.xxl};
  color: ${COLORS.text};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  margin: 0;
`;

const Subtitle = styled.p`
  color: ${COLORS.text.secondary};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin: 0;
`;

const TableCard = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${SPACING.xs} ${SPACING.sm};
  margin: 0 ${SPACING.xs};
  border: none;
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  cursor: pointer;
  transition: ${TRANSITIONS.default};
  background-color: ${props => props.$variant === 'danger' ? COLOR_SCALES.danger[500] : COLOR_SCALES.primary[500]};
  color: ${COLORS.neutral.white};

  &:hover {
    opacity: 0.8;
  }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.md};
  padding: ${SPACING['2xl']};
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
`;

const ModalTitle = styled.h2`
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text.primary};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${TYPOGRAPHY.fontSize['2xl']};
  cursor: pointer;
  color: ${COLORS.text.secondary};
  
  &:hover {
    color: ${COLORS.text.primary};
  }
`;

const Checkbox = styled.input`
  margin-right: ${SPACING.sm};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.primary};
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md};
  margin-top: ${SPACING.xl};
`;

const HelpText = styled.small`
  display: block;
  margin-top: ${SPACING.xs};
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.secondary};
  font-style: italic;
`;

const WarningText = styled(HelpText)`
  color: ${COLOR_SCALES.warning[600]};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
`;

const DisponiblesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
  min-width: 180px;
`;

const DisponiblesNumber = styled.div`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  font-size: ${TYPOGRAPHY.fontSize.base};
  display: flex;
  align-items: center;
  gap: ${SPACING.xs};
`;

const DisponiblesInfo = styled.div`
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${COLORS.text.secondary};
  font-weight: ${TYPOGRAPHY.fontWeight.normal};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: ${COLORS.neutral[200]};
  border-radius: ${BORDER_RADIUS.sm};
  overflow: hidden;
  margin-top: ${SPACING.xs};
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => Math.min(props.$percentage, 100)}%;
  background-color: ${props => props.$color};
  transition: ${TRANSITIONS.default};
  border-radius: ${BORDER_RADIUS.sm};
`;

const Comprobantes: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { comprobantes, setComprobantes, loading, setLoading, reloadComprobantes } = useConfiguracion();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingComprobante, setEditingComprobante] = useState<ComprobanteData | null>(null);
  
  const [formData, setFormData] = useState<ComprobanteData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: 'factura',
    serie: '',
    numeroActual: 0,
    numeroInicio: 1,
    numeroFin: 99999999,
    activo: true,
    predeterminado: false,
  });

  useEffect(() => {
    loadComprobantes();
  }, []);

  const loadComprobantes = async () => {
    setLoading(true);
    try {
      await reloadComprobantes(); // ✅ Usar función del context
    } catch (error) {
      showError('Error al cargar comprobantes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else if (name === 'numeroActual' || name === 'numeroInicio' || name === 'numeroFin') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // ✅ Validar que series tengan formato correcto
      if (!formData.serie || formData.serie.length !== 4) {
        showError('La serie debe tener exactamente 4 caracteres');
        setLoading(false);
        return;
      }
      
      // ✅ Validar números de inicio y fin
      if (formData.numeroInicio >= formData.numeroFin) {
        showError('El número de inicio debe ser menor que el número final');
        setLoading(false);
        return;
      }
      
      // ✅ Si se marca como predeterminado, desmarcar los demás del mismo tipo
      let dataToSave = { ...formData };
      
      if (formData.predeterminado) {
        // Desmarcar otros del mismo tipo
        const otrosComprobantes = comprobantes.filter((c: ComprobanteData) => 
          c.id !== editingComprobante?.id && 
          c.tipo === formData.tipo && 
          c.predeterminado
        );
        
        for (const comprobante of otrosComprobantes) {
          await configuracionApi.updateComprobante(comprobante.id!, { predeterminado: false });
        }
      }
      
      if (editingComprobante) {
        await configuracionApi.updateComprobante(editingComprobante.id!, dataToSave);
        await reloadComprobantes(); // ✅ Recargar para sincronizar con otros componentes
        showSuccess('Comprobante actualizado exitosamente');
      } else {
        await configuracionApi.createComprobante(dataToSave);
        await reloadComprobantes(); // ✅ Recargar para sincronizar con otros componentes
        showSuccess('Comprobante creado exitosamente');
      }
      closeModal();
    } catch (error) {
      showError('Error al guardar comprobante');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (comprobante: ComprobanteData) => {
    setEditingComprobante(comprobante);
    setFormData(comprobante);
    setIsModalOpen(true);
  };

  // ✅ Cambiar a toggle activar/desactivar en lugar de eliminar
  const handleToggleActivo = async (comprobante: ComprobanteData) => {
    const nuevoEstado = !comprobante.activo;
    
    // ✅ Validar que no sea el último activo del mismo tipo
    if (!nuevoEstado) {
      const comprobantesActivosMismoTipo = comprobantes.filter((c: ComprobanteData) => 
        c.activo && c.tipo === comprobante.tipo && c.id !== comprobante.id
      );
      
      if (comprobantesActivosMismoTipo.length === 0) {
        showError(`No se puede desactivar el único comprobante de tipo ${comprobante.tipo} activo`);
        return;
      }
    }
    
    const confirmMessage = nuevoEstado 
      ? `¿Activar el comprobante "${comprobante.nombre}"?`
      : `¿Desactivar el comprobante "${comprobante.nombre}"? No estará disponible en nuevas ventas.`;
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      try {
        await configuracionApi.updateComprobante(comprobante.id!, { 
          activo: nuevoEstado,
          // Si se desactiva y era predeterminado, quitar predeterminado
          predeterminado: nuevoEstado ? comprobante.predeterminado : false
        });
        await reloadComprobantes(); // ✅ Recargar para sincronizar con otros componentes
        showSuccess(`Comprobante ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      } catch (error: any) {
        showError(error.message || 'Error al actualizar comprobante');
      } finally {
        setLoading(false);
      }
    }
  };

  const openNewModal = () => {
    setEditingComprobante(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: 'factura',
      serie: '',
      numeroActual: 0,
      numeroInicio: 1,
      numeroFin: 99999999,
      activo: true,
      predeterminado: false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingComprobante(null);
  };

  return (
    <Layout title="Comprobantes">
      <Container>
        <Header>
          <div>
            <Title>Series de Comprobantes</Title>
            <Subtitle>Configura los tipos de comprobantes y series para tus ventas</Subtitle>
          </div>
          <Button $variant="primary" onClick={openNewModal}>
            + Nuevo Comprobante
          </Button>
        </Header>

        <TableCard>
          <Table>
            <Thead>
              <Tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Tipo</Th>
                <Th>Serie</Th>
                <Th>Número Actual</Th>
                <Th>Disponibles</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {comprobantes.map((comprobante) => (
                <Tr key={comprobante.id}>
                  <Td>{comprobante.codigo}</Td>
                  <Td><strong>{comprobante.nombre}</strong></Td>
                  <Td>
                  {comprobante.tipo === 'factura' && 'Factura'}
                  {comprobante.tipo === 'boleta' && 'Boleta'}
                  {comprobante.tipo === 'nota-credito' && 'Nota de Crédito'}
                  {comprobante.tipo === 'nota-debito' && 'Nota de Débito'}
                  {comprobante.tipo === 'orden-compra' && 'Orden de Compra'}
                  {comprobante.tipo === 'recepcion-compra' && 'Recepción de Compra'}
                </Td>
                <Td>{comprobante.serie}</Td>
                <Td>{comprobante.numeroActual}</Td>
                <Td>
                  {(() => {
                    // ✅ LÓGICA CORRECTA: 
                    // - usados: números ya consumidos desde numeroInicio
                    // - disponibles: números que aún quedan por usar
                    // - total: capacidad total del rango
                    const usados = comprobante.numeroActual - comprobante.numeroInicio + 1;
                    const disponibles = comprobante.numeroFin - comprobante.numeroActual;
                    const total = comprobante.numeroFin - comprobante.numeroInicio + 1;
                    const porcentajeUsado = (usados / total) * 100;
                    
                    // Colores según el porcentaje usado
                    let color = '#10b981'; // Verde (bajo uso: 0-50%)
                    let emoji = '✅';
                    
                    if (porcentajeUsado >= 95) {
                      color = '#dc2626'; // Rojo crítico (95-100%)
                      emoji = '🔴';
                    } else if (porcentajeUsado >= 80) {
                      color = '#f59e0b'; // Naranja alto (80-95%)
                      emoji = '⚠️';
                    } else if (porcentajeUsado >= 50) {
                      color = '#fbbf24'; // Amarillo medio (50-80%)
                      emoji = '🟡';
                    }
                    
                    return (
                      <DisponiblesContainer>
                        <DisponiblesNumber style={{ color }}>
                          {emoji} {disponibles.toLocaleString('es-PE')}
                        </DisponiblesNumber>
                        <DisponiblesInfo>
                          Usado: {usados.toLocaleString('es-PE')} / {total.toLocaleString('es-PE')}
                        </DisponiblesInfo>
                        <ProgressBar>
                          <ProgressFill $percentage={porcentajeUsado} $color={color} />
                        </ProgressBar>
                      </DisponiblesContainer>
                    );
                  })()}
                </Td>
                <Td>
                  <StatusBadge variant={comprobante.activo ? 'success' : 'danger'} dot>
                    {comprobante.activo ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(comprobante)}>
                    Editar
                  </ActionButton>
                  <ActionButton 
                    $variant={comprobante.activo ? 'danger' : 'primary'} 
                    onClick={() => handleToggleActivo(comprobante)}
                    title={comprobante.activo ? 'Desactivar comprobante' : 'Activar comprobante'}
                  >
                    {comprobante.activo ? 'Desactivar' : 'Activar'}
                  </ActionButton>
                </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableCard>

      <Modal $isOpen={isModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>
              {editingComprobante ? 'Editar Comprobante' : 'Nuevo Comprobante'}
            </ModalTitle>
            <CloseButton onClick={closeModal}>×</CloseButton>
          </ModalHeader>

          <form>
            <FormGroup>
              <Label>Código *</Label>
              <Input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleInputChange}
                placeholder="FAC001"
              />
            </FormGroup>

            <FormGroup>
              <Label>Nombre *</Label>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Factura Electrónica"
              />
            </FormGroup>

            <FormGroup>
              <Label>Descripción</Label>
              <Input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del comprobante"
              />
            </FormGroup>

            <FormGroup>
              <Label>Tipo *</Label>
              <Select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
              >
                <optgroup label="Ventas">
                  <option value="factura">Factura</option>
                  <option value="boleta">Boleta</option>
                  <option value="nota-credito">Nota de Crédito</option>
                  <option value="nota-debito">Nota de Débito</option>
                </optgroup>
                <optgroup label="Compras">
                  <option value="orden-compra">Orden de Compra</option>
                  <option value="recepcion-compra">Recepción de Compra</option>
                </optgroup>
              </Select>
              <HelpText>Tipo de documento interno o comprobante SUNAT</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Serie *</Label>
              <Input
                type="text"
                name="serie"
                value={formData.serie}
                onChange={handleInputChange}
                placeholder="F001"
                maxLength={4}
              />
              <HelpText>Serie de 4 caracteres (Ej: F001, B001)</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Número Actual *</Label>
              <Input
                type="number"
                name="numeroActual"
                value={formData.numeroActual}
                onChange={handleInputChange}
                min="0"
              />
              <HelpText>Número del último comprobante emitido</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>Número Inicio *</Label>
              <Input
                type="number"
                name="numeroInicio"
                value={formData.numeroInicio}
                onChange={handleInputChange}
                min="1"
              />
            </FormGroup>

            <FormGroup>
              <Label>Número Fin *</Label>
              <Input
                type="number"
                name="numeroFin"
                value={formData.numeroFin}
                onChange={handleInputChange}
                min="1"
              />
              <WarningText>⚠️ Se desactivará automáticamente al alcanzar este número</WarningText>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  name="activo"
                  checked={formData.activo}
                  onChange={handleInputChange}
                />
                Activo
              </CheckboxLabel>
              <HelpText>Solo los comprobantes activos estarán disponibles</HelpText>
            </FormGroup>

            <ButtonGroup>
              <Button $variant="primary" type="button" onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button $variant="secondary" type="button" onClick={closeModal}>
                Cancelar
              </Button>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>
      </Container>
    </Layout>
  );
};

export default Comprobantes;