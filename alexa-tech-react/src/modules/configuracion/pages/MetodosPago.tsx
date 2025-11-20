import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import configuracionApi, { type MetodoPagoData } from '../services/configuracionApi';
import Layout from '../../../components/Layout';

const Container = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 24px;
`;

// Título desde Layout

const Subtitle = styled.p`
  color: #6b7280;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 8px 16px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2563eb;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
`;

const Badge = styled.span<{ $active: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${props => props.$active ? '#d1fae5' : '#fee2e2'};
  color: ${props => props.$active ? '#065f46' : '#991b1b'};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 4px 8px;
  margin: 0 2px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  background-color: ${props => props.$variant === 'danger' ? '#ef4444' : '#3b82f6'};
  color: white;

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
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6b7280;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Checkbox = styled.input`
  margin-right: 8px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const ButtonSecondary = styled(Button)`
  background-color: #6b7280;

  &:hover {
    background-color: #4b5563;
  }
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
          <Button onClick={openNewModal}>
            Nuevo Método de Pago
          </Button>
        </Header>
        <Subtitle>Configura los métodos de pago disponibles para tus ventas</Subtitle>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Código</Th>
              <Th>Nombre</Th>
              <Th>Tipo</Th>
              <Th>Estado</Th>
              <Th>Predet.</Th>
              <Th>Req. Ref.</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {metodosPago.map((metodo) => (
              <tr key={metodo.id}>
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
                  <Badge $active={metodo.activo}>
                    {metodo.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </Td>
                <Td>
                  {metodo.predeterminado && (
                    <Badge $active={true}>Sí</Badge>
                  )}
                </Td>
                <Td>
                  {metodo.requiereReferencia && (
                    <Badge $active={true}>Sí</Badge>
                  )}
                </Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(metodo)}>
                    ✏️ Editar
                  </ActionButton>
                  <ActionButton 
                    $variant={metodo.activo ? 'danger' : 'primary'} 
                    onClick={() => handleToggleActivo(metodo)}
                    title={metodo.activo ? 'Desactivar método' : 'Activar método'}
                  >
                    {metodo.activo ? '🚫 Desactivar' : '✅ Activar'}
                  </ActionButton>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

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
              <Button type="button" onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <ButtonSecondary type="button" onClick={closeModal}>
                Cancelar
              </ButtonSecondary>
            </ButtonGroup>
          </form>
        </ModalContent>
      </Modal>
      </Container>
    </Layout>
  );
};

export default MetodosPago;