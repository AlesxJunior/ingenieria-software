import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { configuracionApi } from '../../services/configuracionApi';
import type { UnitOfMeasure } from '../../types/configuracion';
import { useNotification } from '../../context/NotificationContext';
import UnidadModal from './UnidadModal';
import { media } from '../../styles/breakpoints';

const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  
  ${media.mobile} {
    padding: 16px;
    border-radius: 6px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
  
  ${media.mobile} {
    margin-bottom: 16px;
  }
`;

const Title = styled.h2`
  font-size: 20px;
  color: #333;
  margin: 0;
  
  ${media.mobile} {
    font-size: 18px;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  
  ${media.mobile} {
    width: 100%;
    flex-direction: column;
    gap: 8px;
  }
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border: 1px solid ${props => props.$active ? '#007bff' : '#ddd'};
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#666'};
  border-radius: 5px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    color: ${props => props.$active ? 'white' : '#007bff'};
  }
  
  ${media.mobile} {
    flex: 1;
    width: 100%;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #218838;
  }
  
  ${media.mobile} {
    width: 100%;
  }
`;

const SearchBar = styled.input`
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  min-width: 250px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
  
  ${media.mobile} {
    width: 100%;
    min-width: unset;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  ${media.mobile} {
    display: block;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const Thead = styled.thead`
  background-color: #f8f9fa;
  
  ${media.mobile} {
    display: none;
  }
`;

const Th = styled.th`
  padding: 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #dee2e6;
`;

const Tbody = styled.tbody``;

const Tr = styled.tr`
  border-bottom: 1px solid #dee2e6;

  &:hover {
    background-color: #f8f9fa;
  }
  
  ${media.mobile} {
    display: block;
    margin-bottom: 16px;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 12px;
    background-color: white;
    
    &:hover {
      background-color: #f8f9fa;
    }
  }
`;

const Td = styled.td`
  padding: 12px;
  font-size: 14px;
  color: #333;
  
  ${media.mobile} {
    display: block;
    padding: 8px 0;
    border: none;
    
    &:before {
      content: attr(data-label);
      font-weight: 600;
      display: inline-block;
      width: 120px;
      color: #555;
    }
  }
`;

const Badge = styled.span<{ $active: boolean }>`
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.$active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$active ? '#155724' : '#721c24'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'edit' ? `
    background-color: #007bff;
    color: white;
    &:hover { background-color: #0056b3; }
  ` : `
    background-color: #dc3545;
    color: white;
    &:hover { background-color: #c82333; }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  
  ${media.mobile} {
    padding: 30px 20px;
  }
`;

const LoadingState = styled(EmptyState)`
  color: #007bff;
`;

const UnidadesTable: React.FC = () => {
  const [unidades, setUnidades] = useState<UnitOfMeasure[]>([]);
  const [filteredUnidades, setFilteredUnidades] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActive, setShowActive] = useState<boolean | undefined>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<UnitOfMeasure | undefined>();
  const { showSuccess, showError } = useNotification();

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const data = await configuracionApi.getAllUnits({ activo: showActive });
      setUnidades(data);
      setFilteredUnidades(data);
    } catch (error: any) {
      showError(error.message || 'Error al cargar unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, [showActive]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = unidades.filter(unit =>
        unit.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.simbolo.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUnidades(filtered);
    } else {
      setFilteredUnidades(unidades);
    }
  }, [searchTerm, unidades]);

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
        <Title>Unidades de Medida</Title>
        <HeaderActions>
          <SearchBar
            type="text"
            placeholder="Buscar unidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FilterButton
            $active={showActive === true}
            onClick={() => setShowActive(true)}
          >
            Activas
          </FilterButton>
          <FilterButton
            $active={showActive === false}
            onClick={() => setShowActive(false)}
          >
            Inactivas
          </FilterButton>
          <FilterButton
            $active={showActive === undefined}
            onClick={() => setShowActive(undefined)}
          >
            Todas
          </FilterButton>
          <Button onClick={handleCreate}>+ Nueva Unidad</Button>
        </HeaderActions>
      </Header>

      {loading ? (
        <LoadingState>Cargando unidades...</LoadingState>
      ) : filteredUnidades.length === 0 ? (
        <EmptyState>
          {searchTerm ? 'No se encontraron unidades' : 'No hay unidades registradas'}
        </EmptyState>
      ) : (
        <Table>
          <Thead>
            <tr>
              <Th>Código</Th>
              <Th>Nombre</Th>
              <Th>Símbolo</Th>
              <Th>Descripción</Th>
              <Th>Estado</Th>
              <Th>Acciones</Th>
            </tr>
          </Thead>
          <Tbody>
            {filteredUnidades.map((unidad) => (
              <Tr key={unidad.id}>
                <Td data-label="Código">{unidad.codigo}</Td>
                <Td data-label="Nombre">{unidad.nombre}</Td>
                <Td data-label="Símbolo">{unidad.simbolo}</Td>
                <Td data-label="Descripción">{unidad.descripcion || '-'}</Td>
                <Td data-label="Estado">
                  <Badge $active={unidad.activo}>
                    {unidad.activo ? 'Activa' : 'Inactiva'}
                  </Badge>
                </Td>
                <Td data-label="Acciones">
                  <ActionButtons>
                    <ActionButton variant="edit" onClick={() => handleEdit(unidad)}>
                      Editar
                    </ActionButton>
                    {unidad.activo && (
                      <ActionButton variant="delete" onClick={() => handleDelete(unidad.id)}>
                        Desactivar
                      </ActionButton>
                    )}
                  </ActionButtons>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
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
