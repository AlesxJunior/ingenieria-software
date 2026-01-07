import React, { useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../../../../styles/theme';
import Layout from '../../../../components/Layout';
import { almacenesApi, type Almacen, type AlmacenFormData } from '../../services/almacenesApi';
import { StatCard, StatsGrid, StatValue, StatLabel, Button as SharedButton, StatusBadge, ActionButton, ButtonGroup as ActionsGroup } from '../../../../components/shared';

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
  font-size: ${TYPOGRAPHY.fontSize.lg};
  color: ${COLORS.textLight};
`;

// Paginación
const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${SPACING.md} 0;
`;

const PaginationInfo = styled.div`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

// Estilos del Modal
const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${SPACING.md};
`;

const ModalContent = styled.div`
  background: ${COLORS.background};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-bottom: 1px solid ${COLORS.neutral[200]};
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${COLORS.neutral[50]};
  border-radius: ${BORDER_RADIUS.lg} ${BORDER_RADIUS.lg} 0 0;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.lg};
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${TYPOGRAPHY.fontSize.lg};
  cursor: pointer;
  color: ${COLORS.textLight};
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;

  &:hover {
    background: ${COLORS.neutral[200]};
    color: ${COLORS.text};
  }
`;

const ModalBody = styled.div`
  padding: ${SPACING.xl};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const Label = styled.label`
  font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  color: ${COLORS.text};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const Input = styled.input`
  padding: ${SPACING.sm};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }

  &:disabled {
    background: ${COLORS.neutral[100]};
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: ${SPACING.sm};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.base};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const HelpText = styled.small`
  color: ${COLORS.textLight};
  font-size: ${TYPOGRAPHY.fontSize.sm};
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

const ModalFooter = styled.div`
  padding: ${SPACING.lg} ${SPACING.xl};
  border-top: 1px solid ${COLORS.neutral[200]};
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
  background: ${COLORS.neutral[50]};
  border-radius: 0 0 ${BORDER_RADIUS.lg} ${BORDER_RADIUS.lg};
`;

const FormError = styled.div`
  background: ${COLOR_SCALES.danger[100]};
  color: ${COLOR_SCALES.danger[700]};
  padding: ${SPACING.sm} ${SPACING.md};
  border-radius: ${BORDER_RADIUS.md};
  margin-bottom: ${SPACING.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
`;

const ListaAlmacenes: React.FC = () => {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [filteredAlmacenes, setFilteredAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Estados del modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedAlmacen, setSelectedAlmacen] = useState<Almacen | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Estados del modal de confirmación de eliminación
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [almacenToDelete, setAlmacenToDelete] = useState<Almacen | null>(null);
  
  const [formData, setFormData] = useState<AlmacenFormData>({
    codigo: '',
    nombre: '',
    ubicacion: '',
    capacidad: undefined,
  });

  // Stats calculados
  const stats = useMemo(() => {
    const total = almacenes.length;
    const activos = almacenes.filter(a => a.activo).length;
    const inactivos = almacenes.filter(a => !a.activo).length;
    const totalProductos = almacenes.reduce((sum, a) => sum + (a._count?.stockByWarehouses || 0), 0);
    return { total, activos, inactivos, totalProductos };
  }, [almacenes]);

  // Handler para limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  useEffect(() => {
    fetchAlmacenes();
  }, []);

  useEffect(() => {
    filterAlmacenes();
  }, [searchTerm, statusFilter, almacenes]);

  const fetchAlmacenes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await almacenesApi.getAlmacenes();
      setAlmacenes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAlmacenes = () => {
    let filtered = [...almacenes];

    // Filtrar por estado
    if (statusFilter === 'active') {
      filtered = filtered.filter(a => a.activo);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(a => !a.activo);
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlmacenes(filtered);
  };

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedAlmacen(null);
    setFormData({
      codigo: '',
      nombre: '',
      ubicacion: '',
      capacidad: undefined,
    });
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (almacen: Almacen) => {
    setModalMode('edit');
    setSelectedAlmacen(almacen);
    setFormData({
      codigo: almacen.codigo,
      nombre: almacen.nombre,
      ubicacion: almacen.ubicacion || '',
      capacidad: almacen.capacidad || undefined,
    });
    setModalError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedAlmacen(null);
    setModalError(null);
    setFormData({
      codigo: '',
      nombre: '',
      ubicacion: '',
      capacidad: undefined,
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacidad' ? (value ? parseInt(value) : undefined) : value
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
      
      if (modalMode === 'edit' && selectedAlmacen) {
        await almacenesApi.updateAlmacen(selectedAlmacen.id, formData);
      } else {
        await almacenesApi.createAlmacen(formData);
      }

      await fetchAlmacenes();
      closeModal();
    } catch (err: any) {
      setModalError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (almacen: Almacen) => {
    openEditModal(almacen);
  };

  const handleDeleteClick = (almacen: Almacen) => {
    setAlmacenToDelete(almacen);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!almacenToDelete) return;

    try {
      await almacenesApi.deleteAlmacen(almacenToDelete.id);
      setIsDeleteConfirmOpen(false);
      setAlmacenToDelete(null);
      await fetchAlmacenes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setAlmacenToDelete(null);
  };

  const handleActivateAlmacen = async (id: string) => {
    try {
      await almacenesApi.activateAlmacen(id);
      await fetchAlmacenes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreate = () => {
    openCreateModal();
  };

  if (loading) {
    return (
      <Layout title="Almacenes">
        <Container>
          <LoadingSpinner>Cargando almacenes...</LoadingSpinner>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Almacenes">
      <Container>
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}

        <Header>
          <TitleSection>
            <Title>Gestión de Almacenes</Title>
            <PageSubtitle>Administración de almacenes, ubicaciones y capacidad de almacenamiento</PageSubtitle>
          </TitleSection>
          <SharedButton $variant="primary" onClick={handleCreate}>
            Nuevo Almacén
          </SharedButton>
        </Header>

        {/* Stats Cards */}
        <StatsGrid>
          <StatCard $color="#3498db">
            <StatValue $color="#3498db">{stats.total}</StatValue>
            <StatLabel>Total Almacenes</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.success[500]}>
            <StatValue $color={COLOR_SCALES.success[500]}>{stats.activos}</StatValue>
            <StatLabel>Activos</StatLabel>
          </StatCard>
          <StatCard $color={COLOR_SCALES.danger[500]}>
            <StatValue $color={COLOR_SCALES.danger[500]}>{stats.inactivos}</StatValue>
            <StatLabel>Inactivos</StatLabel>
          </StatCard>
          <StatCard $color="#9b59b6">
            <StatValue $color="#9b59b6">{stats.totalProductos}</StatValue>
            <StatLabel>Total Productos</StatLabel>
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
                placeholder="Nombre, código o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
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
            <SharedButton $variant="primary" onClick={fetchAlmacenes}>
              Buscar
            </SharedButton>
          </FilterButtonGroup>
        </FiltersCard>

        {filteredAlmacenes.length === 0 ? (
          <EmptyState>
            <p>No se encontraron almacenes</p>
            {almacenes.length === 0 && (
              <SharedButton $variant="primary" onClick={handleCreate} style={{ marginTop: '1rem' }}>
                Crear primer almacén
              </SharedButton>
            )}
          </EmptyState>
        ) : (
          <>
            <TableContainer>
              <Table>
                <thead>
                  <tr>
                    <Th>Código</Th>
                    <Th>Nombre</Th>
                    <Th>Ubicación</Th>
                    <Th>Productos</Th>
                    <Th>Movimientos</Th>
                    <Th>Estado</Th>
                    <Th>Acciones</Th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlmacenes.map((almacen) => (
                    <Tr key={almacen.id}>
                      <Td><strong>{almacen.codigo}</strong></Td>
                      <Td>{almacen.nombre}</Td>
                      <Td>{almacen.ubicacion || '-'}</Td>
                      <Td>{almacen._count?.stockByWarehouses || 0}</Td>
                      <Td>{almacen._count?.inventoryMovements || 0}</Td>
                      <Td>
                        <StatusBadge variant={almacen.activo ? 'success' : 'danger'} dot>
                          {almacen.activo ? 'Activo' : 'Inactivo'}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <ActionsGroup>
                          <ActionButton $variant="edit" onClick={() => handleEdit(almacen)}>
                            Editar
                          </ActionButton>
                          {almacen.activo ? (
                            <ActionButton 
                              $variant="delete"
                              onClick={() => handleDeleteClick(almacen)}
                              disabled={almacen._count && almacen._count.stockByWarehouses > 0}
                              title={almacen._count && almacen._count.stockByWarehouses > 0 ? 'No se puede eliminar un almacén con stock' : 'Eliminar almacén'}
                            >
                              Eliminar
                            </ActionButton>
                          ) : (
                            <ActionButton 
                              $variant="activate"
                              onClick={() => handleActivateAlmacen(almacen.id)}
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

            {/* Paginación */}
            <Pagination>
              <PaginationInfo>
                Mostrando {filteredAlmacenes.length} de {almacenes.length} almacenes
              </PaginationInfo>
            </Pagination>
          </>
        )}

        {/* Modal de Crear/Editar Almacén */}
        <ModalOverlay $isOpen={modalOpen} onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Nuevo Almacén' : 'Editar Almacén'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <ModalBody>
              {modalError && (
                <FormError>{modalError}</FormError>
              )}

              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    name="codigo"
                    type="text"
                    value={formData.codigo}
                    onChange={handleFormChange}
                    placeholder="Ej: ALM-001"
                    required
                    maxLength={20}
                    disabled={modalMode === 'edit'}
                  />
                  <HelpText>
                    Código único del almacén (se convertirá a mayúsculas)
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
                    placeholder="Ej: Almacén Principal"
                    required
                    maxLength={100}
                  />
                  <HelpText>
                    Nombre descriptivo del almacén
                  </HelpText>
                </FormGroup>

                <FormGroup>
                  <Label htmlFor="ubicacion">Ubicación</Label>
                  <TextArea
                    id="ubicacion"
                    name="ubicacion"
                    value={formData.ubicacion}
                    onChange={handleFormChange}
                    placeholder="Ej: Av. Principal 123, Miraflores, Lima"
                    maxLength={255}
                  />
                  <HelpText>
                    Dirección física del almacén (opcional)
                  </HelpText>
                </FormGroup>

                {/* Campo de capacidad oculto temporalmente - Funcionalidad en desarrollo
                <FormGroup>
                  <Label htmlFor="capacidad">Capacidad</Label>
                  <Input
                    id="capacidad"
                    name="capacidad"
                    type="number"
                    value={formData.capacidad || ''}
                    onChange={handleFormChange}
                    placeholder="Ej: 1000"
                    min="0"
                  />
                  <HelpText>
                    Capacidad máxima en unidades (opcional)
                  </HelpText>
                </FormGroup>
                */}

                <ModalFooter>
                  <SharedButton
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancelar
                  </SharedButton>
                  <SharedButton
                    type="submit"
                    $variant="primary"
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : modalMode === 'create' ? 'Crear Almacén' : 'Guardar Cambios'}
                  </SharedButton>
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
                ¿Está seguro que desea eliminar el almacén "{almacenToDelete?.nombre}"?
                Esta acción desactivará el almacén.
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

export default ListaAlmacenes;
