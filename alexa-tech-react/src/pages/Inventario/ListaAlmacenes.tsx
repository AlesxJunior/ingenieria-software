import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Layout from '../../components/Layout';
import { almacenesApi, type Almacen, type AlmacenFormData } from '../../services/almacenesApi';

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
  background: ${props => props.$variant === 'secondary' ? '#6c757d' : '#3498db'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.$variant === 'secondary' ? '#5a6268' : '#2980b9'};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const SearchBar = styled.div`
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
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

const Badge = styled.span<{ $active: boolean }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  background: ${props => props.$active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$active ? '#155724' : '#721c24'};
`;

const ActionButton = styled.button<{ $variant?: 'edit' | 'delete' }>`
  padding: 0.5rem 1rem;
  background: ${props => props.$variant === 'delete' ? '#e74c3c' : '#3498db'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  margin-right: 0.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.$variant === 'delete' ? '#c0392b' : '#2980b9'};
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
  background: ${props => props.$variant === 'secondary' ? '#6c757d' : '#3498db'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.$variant === 'secondary' ? '#5a6268' : '#2980b9'};
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
  
  const [formData, setFormData] = useState<AlmacenFormData>({
    codigo: '',
    nombre: '',
    ubicacion: '',
    capacidad: undefined,
  });

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

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de desactivar este almacén?')) {
      return;
    }

    try {
      await almacenesApi.deleteAlmacen(id);
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
          <LoadingSpinner>⏳ Cargando almacenes...</LoadingSpinner>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout title="Almacenes">
      <Container>
        <Header>
          <Title>Gestión de Almacenes</Title>
          <ButtonGroup>
            <Button onClick={fetchAlmacenes} $variant="secondary">
              🔄 Actualizar
            </Button>
            <Button onClick={handleCreate}>
              ➕ Nuevo Almacén
            </Button>
          </ButtonGroup>
        </Header>

        {error && (
          <ErrorMessage>
            ⚠️ {error}
          </ErrorMessage>
        )}

        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Buscar por nombre, código o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </FilterSelect>
        </SearchBar>

        {filteredAlmacenes.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: '3rem' }}>🏪</div>
            <p>No se encontraron almacenes</p>
            {almacenes.length === 0 && (
              <Button onClick={handleCreate} style={{ marginTop: '1rem' }}>
                Crear primer almacén
              </Button>
            )}
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Ubicación</Th>
                {/* <Th>Capacidad</Th> */}
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
                  {/* <Td>{almacen.capacidad || '-'}</Td> */}
                  <Td>{almacen._count?.stockByWarehouses || 0}</Td>
                  <Td>{almacen._count?.inventoryMovements || 0}</Td>
                  <Td>
                    <Badge $active={almacen.activo}>
                      {almacen.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </Td>
                  <Td>
                    <ActionButton onClick={() => handleEdit(almacen)}>
                      ✏️ Editar
                    </ActionButton>
                    {almacen.activo && (
                      <ActionButton 
                        $variant="delete"
                        onClick={() => handleDelete(almacen.id)}
                        disabled={almacen._count && almacen._count.stockByWarehouses > 0}
                        title={almacen._count && almacen._count.stockByWarehouses > 0 ? 'No se puede desactivar un almacén con stock' : 'Desactivar almacén'}
                      >
                        🗑️ Desactivar
                      </ActionButton>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Modal de Crear/Editar Almacén */}
        <ModalOverlay $isOpen={modalOpen} onClick={closeModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? '➕ Nuevo Almacén' : '✏️ Editar Almacén'}
              </ModalTitle>
              <CloseButton onClick={closeModal}>&times;</CloseButton>
            </ModalHeader>

            <ModalBody>
              {modalError && (
                <FormError>⚠️ {modalError}</FormError>
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
                  <ModalButton
                    type="button"
                    $variant="secondary"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancelar
                  </ModalButton>
                  <ModalButton
                    type="submit"
                    disabled={saving}
                  >
                    {saving ? '⏳ Guardando...' : modalMode === 'create' ? '✅ Crear Almacén' : '💾 Guardar Cambios'}
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

export default ListaAlmacenes;
