import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNotification } from '../../../context/NotificationContext';
import { useConfiguracion } from '../context/ConfiguracionContext';
import configuracionApi, { type ComprobanteData } from '../services/configuracionApi';
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
  max-width: 600px;
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
    box-shadow: 0 0  0 3px rgba(59, 130, 246, 0.1);
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
    <Layout title="Configuración: Comprobantes">
      <Container>
        <Header>
          <Button onClick={openNewModal}>
            Nuevo Comprobante
          </Button>
        </Header>
        <Subtitle>Configura los tipos de comprobantes y series para tus ventas</Subtitle>

      <Card>
        <Table>
          <thead>
            <tr>
              <Th>Código</Th>
              <Th>Nombre</Th>
              <Th>Tipo</Th>
              <Th>Serie</Th>
              <Th>Número Actual</Th>
              <Th>Disponibles</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {comprobantes.map((comprobante) => (
              <tr key={comprobante.id}>
                <Td>{comprobante.codigo}</Td>
                <Td>{comprobante.nombre}</Td>
                <Td>
                  {comprobante.tipo === 'factura' && 'Factura'}
                  {comprobante.tipo === 'boleta' && 'Boleta'}
                  {comprobante.tipo === 'nota-credito' && 'Nota de Crédito'}
                  {comprobante.tipo === 'nota-debito' && 'Nota de Débito'}
                </Td>
                <Td>{comprobante.serie}</Td>
                <Td>{comprobante.numeroActual}</Td>
                <Td>
                  {(() => {
                    const disponibles = comprobante.numeroFin - comprobante.numeroActual;
                    const total = comprobante.numeroFin - comprobante.numeroInicio;
                    const usados = comprobante.numeroActual - comprobante.numeroInicio;
                    const porcentajeUsado = (usados / total) * 100;
                    
                    // Colores según el uso
                    let color = '#10b981'; // Verde (bajo uso)
                    let emoji = '✅';
                    
                    if (porcentajeUsado >= 95) {
                      color = '#dc2626'; // Rojo crítico
                      emoji = '🔴';
                    } else if (porcentajeUsado >= 80) {
                      color = '#f59e0b'; // Naranja alto
                      emoji = '⚠️';
                    } else if (porcentajeUsado >= 50) {
                      color = '#f59e0b'; // Amarillo medio
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
                  <Badge $active={comprobante.activo}>
                    {comprobante.activo ? 'Activo' : 'Inactivo'}
                  </Badge>
                </Td>
                <Td>
                  <ActionButton onClick={() => handleEdit(comprobante)}>
                    ✏️ Editar
                  </ActionButton>
                  <ActionButton 
                    $variant={comprobante.activo ? 'danger' : 'primary'} 
                    onClick={() => handleToggleActivo(comprobante)}
                    title={comprobante.activo ? 'Desactivar comprobante' : 'Activar comprobante'}
                  >
                    {comprobante.activo ? '🚫 Desactivar' : '✅ Activar'}
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
                <option value="factura">Factura</option>
                <option value="boleta">Boleta</option>
                <option value="nota-credito">Nota de Crédito</option>
                <option value="nota-debito">Nota de Débito</option>
              </Select>
              <HelpText>Tipo de comprobante SUNAT</HelpText>
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

export default Comprobantes;

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

const WarningText = styled(HelpText)`
  color: #f59e0b;
  font-weight: 500;
`;

const DisponiblesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
`;

const DisponiblesNumber = styled.div`
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const DisponiblesInfo = styled.div`
  font-size: 11px;
  color: #6b7280;
  font-weight: 400;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 2px;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: ${props => props.$color};
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 3px;
`;