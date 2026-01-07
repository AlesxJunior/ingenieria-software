import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { configuracionApi } from '../../services/configuracionApi';
import type { UnitOfMeasure } from '../../types/configuracion';
import { useNotification } from '../../context/NotificationContext';
import UnidadModal from './UnidadModal';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../styles/theme';
import { 
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  StatusBadge
} from '../shared';

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

const FiltersCard = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  padding: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FilterLabel = styled.label`
  font-size: ${TYPOGRAPHY.fontSize.sm};
  font-weight: ${TYPOGRAPHY.fontWeight.medium};
  color: ${COLORS.text.primary};
`;

const FilterSelect = styled.select`
  padding: ${SPACING.sm} ${SPACING.md};
  border: 1px solid ${COLORS.neutral[300]};
  border-radius: ${BORDER_RADIUS.md};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  background: ${COLORS.neutral.white};
  color: ${COLORS.text.primary};
  transition: ${TRANSITIONS.default};

  &:focus {
    outline: none;
    border-color: ${COLOR_SCALES.primary[500]};
  }
`;

const FilterInput = styled(Input)`
  padding: ${SPACING.sm} ${SPACING.md};
`;

const FilterButtonsRow = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
`;

const TableCard = styled.div`
  background: ${COLORS.neutral.white};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  overflow: hidden;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${SPACING.sm};
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: ${SPACING.xs} ${SPACING.sm};
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

const EmptyState = styled.div`
  text-align: center;
  padding: ${SPACING['2xl']};
  color: ${COLORS.text.secondary};
`;

const LoadingState = styled(EmptyState)`
  color: ${COLOR_SCALES.primary[500]};
`;

const UnidadesTable: React.FC = () => {
  const [unidades, setUnidades] = useState<UnitOfMeasure[]>([]);
  const [filteredUnidades, setFilteredUnidades] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<UnitOfMeasure | undefined>();
  const { showSuccess, showError } = useNotification();

  // Estados de filtros
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('activo');

  const fetchUnidades = async (status?: string, search?: string) => {
    try {
      setLoading(true);
      const statusToUse = status !== undefined ? status : filterStatus;
      const searchToUse = search !== undefined ? search : filterSearch;
      const activo = statusToUse === 'activo' ? true : statusToUse === 'inactivo' ? false : undefined;
      const data = await configuracionApi.getAllUnits({ activo });
      setUnidades(data);
      applyFilters(data, searchToUse);
    } catch (error: any) {
      showError(error.message || 'Error al cargar unidades');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: UnitOfMeasure[], search: string) => {
    let filtered = data;
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = data.filter(unit =>
        unit.codigo.toLowerCase().includes(searchLower) ||
        unit.nombre.toLowerCase().includes(searchLower) ||
        unit.simbolo.toLowerCase().includes(searchLower) ||
        (unit.descripcion && unit.descripcion.toLowerCase().includes(searchLower))
      );
    }
    setFilteredUnidades(filtered);
  };

  useEffect(() => {
    fetchUnidades('activo', '');
  }, []);

  const handleSearch = () => {
    fetchUnidades(filterStatus, filterSearch);
  };

  const handleClearFilters = () => {
    setFilterSearch('');
    setFilterStatus('activo');
    fetchUnidades('activo', '');
  };

  const handleCreate = () => {
    setSelectedUnidad(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (unidad: UnitOfMeasure) => {
    setSelectedUnidad(unidad);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Está seguro de desactivar esta unidad de medida?')) {
      return;
    }

    try {
      await configuracionApi.deleteUnit(id);
      showSuccess('Unidad desactivada correctamente');
      fetchUnidades();
    } catch (error: any) {
      showError(error.message || 'Error al desactivar unidad');
    }
  };

  const handleModalClose = (saved: boolean) => {
    setIsModalOpen(false);
    setSelectedUnidad(undefined);
    if (saved) {
      fetchUnidades();
    }
  };

  return (
    <Container>
      <Header>
        <div>
          <Title>Unidades de Medida</Title>
          <Subtitle>Gestiona las unidades de medida para tus productos</Subtitle>
        </div>
        <Button $variant="primary" onClick={handleCreate}>+ Nueva Unidad</Button>
      </Header>

      <FiltersCard>
        <FiltersGrid>
          <FilterGroup>
            <FilterLabel>Buscar</FilterLabel>
            <FilterInput
              type="text"
              placeholder="Código, nombre o símbolo..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </FilterGroup>
          <FilterGroup>
            <FilterLabel>Estado</FilterLabel>
            <FilterSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="activo">Activas</option>
              <option value="inactivo">Inactivas</option>
              <option value="todos">Todas</option>
            </FilterSelect>
          </FilterGroup>
        </FiltersGrid>
        <FilterButtonsRow>
          <Button $variant="secondary" onClick={handleClearFilters}>
            Limpiar
          </Button>
          <Button $variant="primary" onClick={handleSearch}>
            Buscar
          </Button>
        </FilterButtonsRow>
      </FiltersCard>

      {loading ? (
        <LoadingState>Cargando unidades...</LoadingState>
      ) : filteredUnidades.length === 0 ? (
        <EmptyState>
          {filterSearch ? 'No se encontraron unidades' : 'No hay unidades registradas'}
        </EmptyState>
      ) : (
        <TableCard>
          <Table>
            <Thead>
              <Tr>
                <Th>Código</Th>
                <Th>Nombre</Th>
                <Th>Símbolo</Th>
                <Th>Descripción</Th>
                <Th>Estado</Th>
                <Th>Acciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUnidades.map((unidad) => (
                <Tr key={unidad.id}>
                  <Td>{unidad.codigo}</Td>
                  <Td>{unidad.nombre}</Td>
                  <Td>{unidad.simbolo}</Td>
                  <Td>{unidad.descripcion || '-'}</Td>
                  <Td>
                    <StatusBadge variant={unidad.activo ? 'success' : 'danger'} dot>
                      {unidad.activo ? 'Activa' : 'Inactiva'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEdit(unidad)}>
                        Editar
                      </ActionButton>
                      {unidad.activo && (
                        <ActionButton $variant="danger" onClick={() => handleDelete(unidad.id)}>
                          Desactivar
                        </ActionButton>
                      )}
                    </ActionButtons>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableCard>
      )}

      {isModalOpen && (
        <UnidadModal
          unidad={selectedUnidad}
          onClose={handleModalClose}
        />
      )}
    </Container>
  );
};

export default UnidadesTable;
