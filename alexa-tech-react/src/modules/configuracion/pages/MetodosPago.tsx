import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import configuracionApi, { type MetodoPagoData } from '../services/configuracionApi';
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

const ModalFormGroup = styled.div`
  margin-bottom: ${SPACING.lg};
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
  max-width: 500px;
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
  gap: 12px;
  margin-top: 24px;
`;

const HelpText = styled.small`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
`;

const MetodosPago: React.FC = () => {
  const { showSuccess, showError } = useNotification();
  const { metodosPago, setMetodosPago, loading, setLoading, reloadMetodosPago } = useConfiguracion();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMetodo, setEditingMetodo] = useState<MetodoPagoData | null>(null);
  
  const [formData, setFormData] = useState<MetodoPagoData>({
    codigo: '',
    nombre: '',
    descripcion: '',
    tipo: 'efectivo',
    activo: true,
    predeterminado: false,
    requiereReferencia: false,
  });

  useEffect(() => {
    loadMetodosPago();
  }, []);

  const loadMetodosPago = async () => {
    setLoading(true);
    try {
      await reloadMetodosPago(); // ✅ Usar función del context
    } catch (error) {
      showError('Error al cargar métodos de pago');
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
      // ✅ Si se marca como predeterminado, desmarcar los demás del mismo tipo
      let dataToSave = { ...formData };
      
      if (formData.predeterminado) {
        // Actualizar los demás métodos activos para quitarles predeterminado
        const otrosMetodos = metodosPago.filter((m: MetodoPagoData) => 
          m.id !== editingMetodo?.id && m.predeterminado
        );
        
        for (const metodo of otrosMetodos) {
          await configuracionApi.updateMetodoPago(metodo.id!, { predeterminado: false });
        }
      }
      
      if (editingMetodo) {
        await configuracionApi.updateMetodoPago(editingMetodo.id!, dataToSave);
        await reloadMetodosPago(); // ✅ Recargar para sincronizar con otros componentes
        showSuccess('Método de pago actualizado exitosamente');
      } else {
        await configuracionApi.createMetodoPago(dataToSave);
        await reloadMetodosPago(); // ✅ Recargar para sincronizar con otros componentes
        showSuccess('Método de pago creado exitosamente');
      }
      closeModal();
    } catch (error) {
      showError('Error al guardar método de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (metodo: MetodoPagoData) => {
    setEditingMetodo(metodo);
    setFormData(metodo);
    setIsModalOpen(true);
  };

  // ✅ Cambiar a toggle activar/desactivar en lugar de eliminar
  const handleToggleActivo = async (metodo: MetodoPagoData) => {
    const nuevoEstado = !metodo.activo;
    
    // ✅ Validar que no sea el último activo
    if (!nuevoEstado) {
      const metodosActivos = metodosPago.filter((m: MetodoPagoData) => m.activo && m.id !== metodo.id);
      if (metodosActivos.length === 0) {
        showError('No se puede desactivar el único método de pago activo');
        return;
      }
    }
    
    const confirmMessage = nuevoEstado 
      ? `¿Activar el método de pago "${metodo.nombre}"?`
      : `¿Desactivar el método de pago "${metodo.nombre}"? No estará disponible en nuevas ventas.`;
    
    if (window.confirm(confirmMessage)) {
      setLoading(true);
      try {
        await configuracionApi.updateMetodoPago(metodo.id!, { 
          activo: nuevoEstado,
          // Si se desactiva y era predeterminado, quitar predeterminado
          predeterminado: nuevoEstado ? metodo.predeterminado : false
        });
        await reloadMetodosPago(); // ✅ Recargar para sincronizar con otros componentes
        showSuccess(`Método de pago ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      } catch (error: any) {
        showError(error.message || 'Error al actualizar método de pago');
      } finally {
        setLoading(false);
      }
    }
  };

  const openNewModal = () => {
    setEditingMetodo(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      tipo: 'efectivo',
      activo: true,
      predeterminado: false,
      requiereReferencia: false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMetodo(null);
  };

  return (
    <Layout title="Configuración: Métodos de Pago">
      <Container>
        <Header>
          <div>
            <Title>Métodos de Pago</Title>
            <Subtitle>Configura los métodos de pago disponibles para tus ventas</Subtitle>
          </div>
          <Button $variant="primary" onClick={openNewModal}>
            Nuevo Método de Pago
          </Button>
        </Header>

      <TableCard>
        <Table>
          <Thead>
            <Tr>
              <Th>Código</Th>
              <Th>Nombre</Th>
              <Th>Tipo</Th>
              <Th>Estado</Th>
              <Th>Predet.</Th>
              <Th>Req. Ref.</Th>
              <Th>Acciones</Th>
            </Tr>
          </Thead>
          <Tbody>
            {metodosPago.map((metodo) => (
              <Tr key={metodo.id}>
                <Td>{metodo.codigo}</Td>
                <Td>{metodo.nombre}</Td>
                <Td>
                  {metodo.tipo === 'efectivo' && 'Efectivo'}
                  {metodo.tipo === 'tarjeta' && 'Tarjeta'}
                  {metodo.tipo === 'transferencia' && 'Transferencia'}
                  {metodo.tipo === 'yape' && 'Yape'}
                  {metodo.tipo === 'plin' && 'Plin'}
                  {metodo.tipo === 'otro' && 'Otro'}
                </Td>
                <Td>
                  <StatusBadge variant={metodo.activo ? 'success' : 'danger'} dot>
                    {metodo.activo ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </Td>
                <Td>
                  {metodo.predeterminado && (
                    <StatusBadge variant="success" dot>Sí</StatusBadge>
                  )}
                </Td>
                <Td>
                  {metodo.requiereReferencia && (
                    <StatusBadge variant="success" dot>Sí</StatusBadge>
                  )}
                </Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(metodo)}>
                    Editar
                  </ActionButton>
                  <ActionButton 
                    $variant={metodo.activo ? 'danger' : 'primary'} 
                    onClick={() => handleToggleActivo(metodo)}
                    title={metodo.activo ? 'Desactivar método' : 'Activar método'}
                  >
                    {metodo.activo ? 'Desactivar' : 'Activar'}
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
              {editingMetodo ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
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
                placeholder="EFE001"
              />
            </FormGroup>

            <FormGroup>
              <Label>Nombre *</Label>
              <Input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Efectivo"
              />
            </FormGroup>

            <FormGroup>
              <Label>Descripción</Label>
              <Input
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del método de pago"
              />
            </FormGroup>

            <FormGroup>
              <Label>Tipo *</Label>
              <Select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
                <option value="otro">Otro</option>
              </Select>
              <HelpText>Categoría técnica del método (define el ícono y comportamiento)</HelpText>
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
              <HelpText>Solo los métodos activos estarán disponibles en ventas</HelpText>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  name="predeterminado"
                  checked={formData.predeterminado}
                  onChange={handleInputChange}
                />
                Predeterminado
              </CheckboxLabel>
              <HelpText>Se seleccionará automáticamente al crear una venta</HelpText>
            </FormGroup>

            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  name="requiereReferencia"
                  checked={formData.requiereReferencia}
                  onChange={handleInputChange}
                />
                Requiere Referencia (N° Operación)
              </CheckboxLabel>
              <HelpText>Si está marcado, solicitará número de operación/voucher en la venta</HelpText>
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

export default MetodosPago;