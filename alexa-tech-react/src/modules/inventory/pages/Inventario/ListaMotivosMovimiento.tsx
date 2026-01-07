import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../styles/theme';
import Layout from '../../../../components/Layout';
import { 
  StatusBadge, 
  ActionButton, 
  ButtonGroup as ActionsGroup,
  Button as SharedButton,
  StatCard,
  StatsGrid,
  StatValue,
  StatLabel
} from '../../../../components/shared';
import {
  movementReasonsApi,
  type MovementReason,
  type MovementReasonFormData,
} from '../../services/movementReasonsApi';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

const FiltersCard = styled.div`
  background: ${COLORS.background};
  padding: ${SPACING.lg};
  border-radius: ${BORDER_RADIUS.lg};
  border: 1px solid ${COLORS.neutral[200]};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.md};
`;

const FormGroupFilter = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const SearchInput = styled.input`
  padding: ${SPACING.sm};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }

  &::placeholder {
    color: ${COLORS.textLight};
  }
`;

const FilterSelect = styled.select`
  padding: ${SPACING.sm};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  background: ${COLORS.background};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const FilterButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
  margin-top: ${SPACING.lg};
`;

const TableContainer = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  overflow: hidden;
  border: 1px solid ${COLORS.neutral[200]};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background: ${COLORS.background};
  padding: ${SPACING.md};
  text-align: left;
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.textLight};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: ${SPACING.md};
  border-bottom: 1px solid ${COLORS.neutral[100]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  color: ${COLORS.text};
`;

const Tr = styled.tr`
  &:hover {
    background: ${COLORS.neutral[50]};
  }
`;

// Helper para obtener variant del StatusBadge según tipo de movimiento
const getTipoVariant = (tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE'): 'success' | 'danger' | 'info' => {
  const variants: Record<string, 'success' | 'danger' | 'info'> = {
    ENTRADA: 'success',
    SALIDA: 'danger',
    AJUSTE: 'info'
  };
  return variants[tipo] || 'info';
};

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  border: 1px solid ${COLORS.neutral[200]};
  color: ${COLORS.textLight};
  
  p {
    font-size: ${TYPOGRAPHY.fontSize.md};
    margin-top: ${SPACING.md};
  }
`;

const ErrorMessage = styled.div`
  background: ${COLOR_SCALES.danger[100]};
  color: ${COLOR_SCALES.danger[700]};
  padding: ${SPACING.md};
  border-radius: ${BORDER_RADIUS.md};
  border: 1px solid ${COLOR_SCALES.danger[200]};
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: ${SPACING.xxl};
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.md};
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

// Modal de confirmación de eliminación
const DeleteConfirmModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
`;

const DeleteConfirmContent = styled.div`
  background: ${COLORS.background};
  padding: ${SPACING.xl};
  border-radius: ${BORDER_RADIUS.lg};
  max-width: 500px;
  width: 90%;
`;

const DeleteConfirmTitle = styled.h3`
  margin: 0 0 ${SPACING.md} 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.lg};
`;

const DeleteConfirmMessage = styled.p`
  color: ${COLORS.textLight};
  margin-bottom: ${SPACING.lg};
  line-height: 1.5;
`;

const DeleteConfirmActions = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
`;

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

  // Estados del modal de confirmación de eliminación
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [reasonToDelete, setReasonToDelete] = useState<MovementReason | null>(null);

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

  const handleDeleteClick = (reason: MovementReason) => {
    setReasonToDelete(reason);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reasonToDelete) return;

    try {
      await movementReasonsApi.deleteMovementReason(reasonToDelete.id);
      setIsDeleteConfirmOpen(false);
      setReasonToDelete(null);
      await fetchReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setReasonToDelete(null);
  };

  const handleActivateReason = async (id: string) => {
    try {
      await movementReasonsApi.activateMovementReason(id);
      await fetchReasons();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <Layout title="Motivos de Movimiento">
        <Container>
          <LoadingSpinner>Cargando motivos...</LoadingSpinner>
        </Container>
      </Layout>
    );
  }

  const handleClearFilters = () => {
    setSearchTerm('');
    setTipoFilter('all');
    setStatusFilter('all');
  };

  return (
    <Layout title="Motivos de Movimiento">
      <Container>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Header>
          <TitleSection>
            <Title>Motivos de Movimiento</Title>
            <PageSubtitle>Configuración de motivos para ajustes, transferencias y movimientos de inventario</PageSubtitle>
          </TitleSection>
          <SharedButton $variant="primary" onClick={openCreateModal}>
            Nuevo Motivo
          </SharedButton>
        </Header>

        {/* Stats Cards */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{reasons.length}</StatValue>
            <StatLabel>Total Motivos</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{reasons.filter(r => r.activo).length}</StatValue>
            <StatLabel>Activos</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{reasons.filter(r => r.tipo === 'ENTRADA').length}</StatValue>
            <StatLabel>Entradas</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.danger[500]}>
            <StatValue $color={COLOR_SCALES.danger[500]}>{reasons.filter(r => r.tipo === 'SALIDA').length}</StatValue>
            <StatLabel>Salidas</StatLabel>
          </StatCard>
          <StatCard $color="#17a2d8">
            <StatValue $color="#17a2d8">{reasons.filter(r => r.tipo === 'AJUSTE').length}</StatValue>
            <StatLabel>Ajustes</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Filtros */}
        <FiltersCard>
          <FiltersGrid>
            <FormGroupFilter>
              <FilterLabel htmlFor="search">Buscar</FilterLabel>
              <SearchInput
                id="search"
                type="text"
                placeholder="Código, nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </FormGroupFilter>
            <FormGroupFilter>
              <FilterLabel htmlFor="tipo">Tipo</FilterLabel>
              <FilterSelect
                id="tipo"
                value={tipoFilter}
                onChange={(e) => setTipoFilter(e.target.value)}
              >
                <option value="all">Todos los tipos</option>
                <option value="ENTRADA">Entrada</option>
                <option value="SALIDA">Salida</option>
                <option value="AJUSTE">Ajuste</option>
              </FilterSelect>
            </FormGroupFilter>
            <FormGroupFilter>
              <FilterLabel htmlFor="status">Estado</FilterLabel>
              <FilterSelect
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </FilterSelect>
            </FormGroupFilter>
          </FiltersGrid>
          <FilterButtonGroup>
            <SharedButton onClick={handleClearFilters}>Limpiar</SharedButton>
            <SharedButton $variant="primary" onClick={fetchReasons}>Buscar</SharedButton>
          </FilterButtonGroup>
        </FiltersCard>

        {filteredReasons.length === 0 ? (
          <EmptyState>
            <p>No se encontraron motivos</p>
            {reasons.length === 0 && (
              <SharedButton $variant="primary" onClick={openCreateModal} style={{ marginTop: '1rem' }}>
                Crear primer motivo
              </SharedButton>
            )}
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>Tipo</Th>
                  <Th>Código</Th>
                  <Th>Nombre</Th>
                  <Th>Descripción</Th>
                  <Th>Movimientos</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </tr>
              </thead>
              <tbody>
                {filteredReasons.map((reason) => (
                  <Tr key={reason.id}>
                    <Td>
                      <StatusBadge variant={getTipoVariant(reason.tipo)}>
                        {reason.tipo}
                      </StatusBadge>
                    </Td>
                    <Td><strong>{reason.codigo}</strong></Td>
                    <Td>{reason.nombre}</Td>
                    <Td>{reason.descripcion || '-'}</Td>
                    <Td>{reason._count?.inventoryMovements || 0}</Td>
                    <Td>
                      <StatusBadge variant={reason.activo ? 'success' : 'danger'} dot>
                        {reason.activo ? 'Activo' : 'Inactivo'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <ActionsGroup>
                        <ActionButton $variant="edit" onClick={() => openEditModal(reason)}>
                          Editar
                        </ActionButton>
                        {reason.activo ? (
                          <ActionButton
                            $variant="delete"
                            onClick={() => handleDeleteClick(reason)}
                            disabled={reason._count && reason._count.inventoryMovements > 0}
                            title={reason._count && reason._count.inventoryMovements > 0 ? 'No se puede eliminar un motivo con movimientos asociados' : 'Eliminar motivo'}
                          >
                            Eliminar
                          </ActionButton>
                        ) : (
                          <ActionButton
                            $variant="activate"
                            onClick={() => handleActivateReason(reason.id)}
                          >
                            Activar
                          </ActionButton>
                        )}
                      </ActionsGroup>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}

        {/* Modal de Crear/Editar Motivo */}
        <ModalOverlay $isOpen={modalOpen} onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Nuevo Motivo' : 'Editar Motivo'}
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

        {/* Modal de confirmación de eliminación */}
        {isDeleteConfirmOpen && (
          <DeleteConfirmModal onClick={handleCancelDelete}>
            <DeleteConfirmContent onClick={(e) => e.stopPropagation()}>
              <DeleteConfirmTitle>Confirmar Eliminación</DeleteConfirmTitle>
              <DeleteConfirmMessage>
                ¿Está seguro que desea eliminar el motivo "{reasonToDelete?.nombre}"?
                Esta acción desactivará el motivo.
              </DeleteConfirmMessage>
              <DeleteConfirmActions>
                <ActionButton $variant="secondary" onClick={handleCancelDelete}>
                  Cancelar
                </ActionButton>
                <ActionButton $variant="delete" onClick={handleConfirmDelete}>
                  Eliminar
                </ActionButton>
              </DeleteConfirmActions>
            </DeleteConfirmContent>
          </DeleteConfirmModal>
        )}
      </Container>
    </Layout>
  );
};

export default ListaMotivosMovimiento;
