import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import {
  movementReasonsApi,
  type MovementReason,
  type MovementReasonFormData,
} from '../../services/movementReasonsApi';

const Container = styled.div`
  padding: 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  background: ${(props) =>
    props.$variant === 'secondary' ? '#6c757d' : '#3498db'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;

  &:hover {
    background: ${(props) =>
      props.$variant === 'secondary' ? '#5a6268' : '#2980b9'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
`;

const Tr = styled.tr`
  &:hover {
    background: #f8f9fa;
  }
`;

const Badge = styled.span<{ $color: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${(props) => props.$color};
  color: white;
`;

const StatusBadge = styled.span<{ $active: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${(props) => (props.$active ? '#d4edda' : '#f8d7da')};
  color: ${(props) => (props.$active ? '#155724' : '#721c24')};
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' | 'toggle' }>`
  padding: 0.5rem 1rem;
  background: ${(props) =>
    props.$variant === 'delete'
      ? '#e74c3c'
      : props.$variant === 'toggle'
        ? '#f39c12'
        : '#3498db'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-right: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${(props) =>
      props.$variant === 'delete'
        ? '#c0392b'
        : props.$variant === 'toggle'
          ? '#e67e22'
          : '#2980b9'};
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
  padding: 3rem;
  color: #6c757d;

  p {
    font-size: 1.1rem;
    margin-top: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.2rem;
  color: #6c757d;
`;

// Estilos del Modal
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    color: #495057;
  }
`;

const ModalBody = styled.div`
  padding: 2rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const HelpText = styled.small`
  color: #6c757d;
  font-size: 0.875rem;
`;

const ModalFooter = styled.div`
  padding: 1.5rem 2rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  background: ${(props) =>
    props.$variant === 'secondary' ? '#6c757d' : '#3498db'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: ${(props) =>
      props.$variant === 'secondary' ? '#5a6268' : '#2980b9'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const FormError = styled.div`
  background: #f8d7da;
  color: #721c24;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const TIPO_COLORS = {
  ENTRADA: '#28a745',
  SALIDA: '#dc3545',
  AJUSTE: '#ffc107',
};

const ListaMotivosMovimiento: React.FC = () => {
  const [reasons, setReasons] = useState<MovementReason[]>([]);
  const [filteredReasons, setFilteredReasons] = useState<MovementReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedReason, setSelectedReason] = useState<MovementReason | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MovementReasonFormData>({
    tipo: 'ENTRADA',
    codigo: '',
    nombre: '',
    descripcion: '',
    requiereDocumento: false,
  });

  useEffect(() => {
    fetchReasons();
  }, []);

  useEffect(() => {
    filterReasons();
  }, [searchTerm, tipoFilter, statusFilter, reasons]);

  const fetchReasons = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await movementReasonsApi.getMovementReasons();
      setReasons(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterReasons = () => {
    let filtered = [...reasons];

    // Filtrar por tipo
    if (tipoFilter !== 'all') {
      filtered = filtered.filter((r) => r.tipo === tipoFilter);
    }

    // Filtrar por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter((r) => r.activo);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((r) => !r.activo);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredReasons(filtered);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedReason(null);
    setFormData({
      tipo: 'ENTRADA',
      codigo: '',
      nombre: '',
      descripcion: '',
      requiereDocumento: false,
    });
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (reason: MovementReason) => {
    setModalMode('edit');
    setSelectedReason(reason);
    setFormData({
      tipo: reason.tipo,
      codigo: reason.codigo,
      nombre: reason.nombre,
      descripcion: reason.descripcion || '',
      requiereDocumento: reason.requiereDocumento,
    });
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedReason(null);
    setModalError(null);
    setFormData({
      tipo: 'ENTRADA',
      codigo: '',
      nombre: '',
      descripcion: '',
      requiereDocumento: false,
    });
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    // Validaciones
    if (!formData.codigo.trim() || !formData.nombre.trim()) {
      setModalError('El código y el nombre son obligatorios');
      return;
    }

    try {
      setSaving(true);

      if (modalMode === 'edit' && selectedReason) {
        await movementReasonsApi.updateMovementReason(selectedReason.id, formData);
      } else {
        await movementReasonsApi.createMovementReason(formData);
      }

      await fetchReasons();
      closeModal();
    } catch (err: any) {
      setModalError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de eliminar este motivo?')) {
      return;
    }

    try {
      await movementReasonsApi.deleteMovementReason(id);
      await fetchReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await movementReasonsApi.toggleMovementReason(id);
      await fetchReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <Layout title="Motivos de Movimiento">
        <Container>
          <LoadingSpinner>⏳ Cargando motivos...</LoadingSpinner>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Motivos de Movimiento">
      <Container>
        <Header>
          <Title>Gestión de Motivos de Movimiento</Title>
          <ButtonGroup>
            <Button onClick={fetchReasons} $variant="secondary">
              🔄 Actualizar
            </Button>
            <Button onClick={openCreateModal}>➕ Nuevo Motivo</Button>
          </ButtonGroup>
        </Header>

        {error && <ErrorMessage>⚠️ {error}</ErrorMessage>}

        <FilterBar>
          <SearchInput
            type="text"
            placeholder="Buscar por código, nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value)}
          >
            <option value="all">Todos los tipos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
            <option value="AJUSTE">Ajuste</option>
          </FilterSelect>
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </FilterSelect>
        </FilterBar>

        {filteredReasons.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: '3rem' }}>📋</div>
            <p>No se encontraron motivos</p>
            {reasons.length === 0 && (
              <Button onClick={openCreateModal} style={{ marginTop: '1rem' }}>
                Crear primer motivo
              </Button>
            )}
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Tipo</Th>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Descripción</Th>
                {/* <Th>Requiere Doc.</Th> */}
                <Th>Movimientos</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </tr>
            </thead>
            <tbody>
              {filteredReasons.map((reason) => (
                <Tr key={reason.id}>
                  <Td>
                    <Badge $color={TIPO_COLORS[reason.tipo]}>
                      {reason.tipo}
                    </Badge>
                  </Td>
                  <Td>
                    <strong>{reason.codigo}</strong>
                  </Td>
                  <Td>{reason.nombre}</Td>
                  <Td>{reason.descripcion || '-'}</Td>
                  {/* <Td>{reason.requiereDocumento ? '✅ Sí' : '❌ No'}</Td> */}
                  <Td>{reason._count?.inventoryMovements || 0}</Td>
                  <Td>
                    <StatusBadge $active={reason.activo}>
                      {reason.activo ? 'Activo' : 'Inactivo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton onClick={() => openEditModal(reason)}>
                      ✏️ Editar
                    </ActionButton>
                    <ActionButton
                      $variant="toggle"
                      onClick={() => handleToggle(reason.id)}
                    >
                      {reason.activo ? '🔴 Desactivar' : '🟢 Activar'}
                    </ActionButton>
                    {reason._count && reason._count.inventoryMovements === 0 && (
                      <ActionButton
                        $variant="delete"
                        onClick={() => handleDelete(reason.id)}
                      >
                        🗑️ Eliminar
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal de Crear/Editar Motivo */}
        <ModalOverlay $isOpen={modalOpen} onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? '➕ Nuevo Motivo' : '✏️ Editar Motivo'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <ModalBody>
              {modalError && <FormError>⚠️ {modalError}</FormError>}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="tipo">Tipo de Movimiento *</Label>
                  <Select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleFormChange}
                    required
                    disabled={modalMode === 'edit'}
                  >
                    <option value="ENTRADA">Entrada</option>
                    <option value="SALIDA">Salida</option>
                    <option value="AJUSTE">Ajuste</option>
                  </Select>
                  <HelpText>
                    Tipo de movimiento al que aplica este motivo
                  </HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    name="codigo"
                    type="text"
                    value={formData.codigo}
                    onChange={handleFormChange}
                    placeholder="Ej: ENT-COMPRA"
                    required
                    maxLength={20}
                    disabled={modalMode === 'edit'}
                  />
                  <HelpText>
                    Código único del motivo (se convertirá a mayúsculas)
                  </HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    placeholder="Ej: Compra a proveedor"
                    required
                    maxLength={100}
                  />
                  <HelpText>Nombre descriptivo del motivo</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="descripcion">Descripción</Label>
                  <TextArea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleFormChange}
                    placeholder="Descripción detallada del motivo..."
                    maxLength={255}
                  />
                  <HelpText>Descripción adicional (opcional)</HelpText>
                </FormGroup>

                {/* Campo "Requiere Documento" oculto temporalmente - Funcionalidad no implementada */}
                {/* <FormGroup>
                  <CheckboxContainer>
                    <Checkbox
                      id="requiereDocumento"
                      name="requiereDocumento"
                      type="checkbox"
                      checked={formData.requiereDocumento}
                      onChange={handleFormChange}
                    />
                    <span>Requiere documento de referencia</span>
                  </CheckboxContainer>
                  <HelpText>
                    Si está marcado, se solicitará un documento al registrar el
                    movimiento
                  </HelpText>
                </FormGroup> */}

                <ModalFooter>
                  <ModalButton
                    type="button"
                    $variant="secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancelar
                  </ModalButton>
                  <ModalButton type="submit" disabled={saving}>
                    {saving
                      ? '⏳ Guardando...'
                      : modalMode === 'create'
                        ? '✅ Crear Motivo'
                        : '💾 Guardar Cambios'}
                  </ModalButton>
                </ModalFooter>
              </Form>
            </ModalBody>
          </ModalContent>
        </ModalOverlay>
      </Container>
    </Layout>
  );
};

export default ListaMotivosMovimiento;
