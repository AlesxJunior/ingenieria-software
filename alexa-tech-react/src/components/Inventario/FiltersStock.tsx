import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { StockFilters } from '../../types/inventario';
import { WAREHOUSE_OPTIONS } from '../../constants/warehouses';

const FiltersContainer = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;

  @media (max-width: 768px) {
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  ` : `
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

interface FiltersStockProps {
  onFilterChange: (filters: StockFilters) => void;
  loading?: boolean;
  defaultWarehouseId?: string;
}

const FiltersStock: React.FC<FiltersStockProps> = ({ onFilterChange, loading = false, defaultWarehouseId }) => {
  const [filters, setFilters] = useState<StockFilters>({
    almacenId: '',
    q: '',
    estado: undefined,
    page: 1,
    limit: 10,
    sortBy: 'producto',
    order: 'asc'
  });

  // Prefill almacén por defecto si no está seleccionado
  useEffect(() => {
    if (!filters.almacenId) {
      const def = defaultWarehouseId || 'WH-PRINCIPAL';
      setFilters(prev => ({ ...prev, almacenId: def }));
    }
  }, [defaultWarehouseId]);

  // Manejar cambios en los filtros
  const handleFilterChange = (key: keyof StockFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));
  };

  // Aplicar filtros
  const handleSearch = () => {
    // Limpiar valores vacíos
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        acc[key as keyof StockFilters] = value;
      }
      return acc;
    }, {} as StockFilters);

    onFilterChange(cleanFilters);
  };

  // Limpiar filtros
  const handleClear = () => {
    const defaultFilters: StockFilters = {
      almacenId: '',
      q: '',
      estado: undefined,
      page: 1,
      limit: 10,
      sortBy: 'producto',
      order: 'asc'
    };
    
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  // Auto-search cuando se cambia el almacén (filtro principal)
  useEffect(() => {
    if (filters.almacenId) {
      handleSearch();
    }
  }, [filters.almacenId]);

  return (
    <FiltersContainer>
      <FiltersGrid>
        <FormGroup>
          <Label htmlFor="search">Buscar Producto</Label>
          <Input
            id="search"
            type="text"
            placeholder="Código o nombre del producto..."
            value={filters.q || ''}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            data-testid="stock-filter-search"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="almacen">Almacén</Label>
          <Select
            id="almacen"
            value={filters.almacenId || ''}
            onChange={(e) => handleFilterChange('almacenId', e.target.value)}
            data-testid="stock-filter-warehouse"
          >
            <option value="">Todos los almacenes</option>
            {WAREHOUSE_OPTIONS.map(warehouse => (
              <option key={warehouse.value} value={warehouse.value}>
                {warehouse.label}
              </option>
            ))}
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="estado">Estado del Stock</Label>
          <Select
            id="estado"
            value={filters.estado || ''}
            onChange={(e) => handleFilterChange('estado', e.target.value || undefined)}
            data-testid="stock-filter-status"
          >
            <option value="">Todos los estados</option>
            <option value="NORMAL">Normal</option>
            <option value="BAJO">Stock Bajo</option>
            <option value="CRITICO">Stock Crítico</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="sortBy">Ordenar por</Label>
          <Select
            id="sortBy"
            value={filters.sortBy || 'producto'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            data-testid="stock-filter-sortby"
          >
            <option value="producto">Producto</option>
            <option value="cantidad">Cantidad</option>
            <option value="estado">Estado</option>
            <option value="updatedAt">Última actualización</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="order">Orden</Label>
          <Select
            id="order"
            value={filters.order || 'asc'}
            onChange={(e) => handleFilterChange('order', e.target.value as 'asc' | 'desc')}
            data-testid="stock-filter-order"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="limit">Elementos por página</Label>
          <Select
            id="limit"
            value={filters.limit || 10}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            data-testid="stock-filter-limit"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </FormGroup>
      </FiltersGrid>

      <ButtonGroup>
        <Button 
          type="button" 
          $variant="secondary" 
          onClick={handleClear}
          disabled={loading}
          data-testid="stock-filter-clear"
        >
          Limpiar
        </Button>
        <Button 
          type="button" 
          $variant="primary" 
          onClick={handleSearch}
          disabled={loading}
          data-testid="stock-filter-search-button"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </ButtonGroup>
    </FiltersContainer>
  );
};

export default FiltersStock;