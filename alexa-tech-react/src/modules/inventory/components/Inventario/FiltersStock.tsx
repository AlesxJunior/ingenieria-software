import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../../../styles/theme';
import { Input as SharedInput, Select as SharedSelect, Label as SharedLabel, Button as SharedButton } from '../../../../components/shared';
import type { StockFilters } from '../../../../types/inventario';
import { WAREHOUSE_OPTIONS } from '../../../../constants/warehouses';
import { apiService } from '../../../../utils/api';

const FiltersContainer = styled.div`
  background: ${COLORS.neutral.white};
  padding: ${SPACING.xl};
  border-radius: ${BORDER_RADIUS.lg};
  box-shadow: ${SHADOWS.sm};
  margin-bottom: ${SPACING.xl};
`;

const FiltersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${SPACING.md};
  justify-content: flex-end;
  flex-wrap: wrap;
  margin-top: ${SPACING.lg};

  @media (max-width: 768px) {
    width: 100%;
    justify-content: stretch;
    
    button {
      flex: 1;
    }
  }
`;

interface FiltersStockProps {
  onFilterChange: (filters: StockFilters) => void;
  loading?: boolean;
  defaultWarehouseId?: string;
  onExport?: () => void;
  exportando?: boolean;
}

const FiltersStock: React.FC<FiltersStockProps> = ({ onFilterChange, loading = false, defaultWarehouseId, onExport, exportando }) => {
  const [filters, setFilters] = useState<StockFilters>({
    almacenId: '',
    q: '',
    estado: undefined,
    page: 1,
    limit: 10,
    sortBy: 'producto',
    order: 'asc'
  });

  // Estado para almacenes dinámicos
  const [warehouseOptions, setWarehouseOptions] = useState<{ value: string; label: string }[]>(
    WAREHOUSE_OPTIONS // Fallback inicial
  );

  // Cargar almacenes desde la API
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiService.getWarehouses();
        console.log('[FiltersStock] Warehouses full response:', resp);
        console.log('[FiltersStock] Warehouses resp.data:', resp.data);
        
        const respData = resp.data as any;
        let list: any[] = [];
        
        if (respData?.data?.rows) {
          list = respData.data.rows;
        } else if (respData?.rows) {
          list = respData.rows;
        } else if (respData?.warehouses) {
          list = respData.warehouses;
        } else if (Array.isArray(respData)) {
          list = respData;
        }
        
        console.log('[FiltersStock] Parsed warehouse list:', list);
        
        if (Array.isArray(list) && list.length > 0 && mounted) {
          const activeWarehouses = list.filter((w: any) => w.activo !== false);
          setWarehouseOptions(activeWarehouses.map((w: any) => ({ 
            value: w.id, 
            label: w.nombre 
          })));
          console.log('[FiltersStock] Warehouses loaded:', activeWarehouses.length);
        }
      } catch (e) {
        console.error('[FiltersStock] Error loading warehouses:', e);
        console.warn('[FiltersStock] Usando fallback warehouses');
      }
    })();
    return () => { mounted = false; };
  }, []);

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
          <SharedLabel htmlFor="search">Buscar Producto</SharedLabel>
          <SharedInput
            id="search"
            type="text"
            placeholder="Código o nombre del producto..."
            value={filters.q || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('q', e.target.value)}
            data-testid="stock-filter-search"
          />
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="almacen">Almacén</SharedLabel>
          <SharedSelect
            id="almacen"
            value={filters.almacenId || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('almacenId', e.target.value)}
            data-testid="stock-filter-warehouse"
          >
            <option value="">Todos los almacenes</option>
            {warehouseOptions.map(warehouse => (
              <option key={warehouse.value} value={warehouse.value}>
                {warehouse.label}
              </option>
            ))}
          </SharedSelect>
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="estado">Estado del Stock</SharedLabel>
          <SharedSelect
            id="estado"
            value={filters.estado || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('estado', e.target.value || undefined)}
            data-testid="stock-filter-status"
          >
            <option value="">Todos los estados</option>
            <option value="NORMAL">Normal</option>
            <option value="BAJO">Stock Bajo</option>
            <option value="CRITICO">Stock Crítico</option>
          </SharedSelect>
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="sortBy">Ordenar por</SharedLabel>
          <SharedSelect
            id="sortBy"
            value={filters.sortBy || 'producto'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('sortBy', e.target.value)}
            data-testid="stock-filter-sortby"
          >
            <option value="producto">Producto</option>
            <option value="cantidad">Cantidad</option>
            <option value="estado">Estado</option>
            <option value="updatedAt">Última actualización</option>
          </SharedSelect>
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="order">Orden</SharedLabel>
          <SharedSelect
            id="order"
            value={filters.order || 'asc'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('order', e.target.value as 'asc' | 'desc')}
            data-testid="stock-filter-order"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </SharedSelect>
        </FormGroup>
      </FiltersGrid>

      <ButtonGroup>
        <SharedButton 
          type="button" 
          $variant="secondary" 
          onClick={handleClear}
          disabled={loading}
          data-testid="stock-filter-clear"
        >
          Limpiar
        </SharedButton>
        <SharedButton 
          type="button" 
          $variant="primary" 
          onClick={handleSearch}
          disabled={loading}
          data-testid="stock-filter-search-button"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </SharedButton>
        {onExport && (
          <SharedButton 
            type="button" 
            $variant="primary" 
            onClick={onExport}
            disabled={exportando || loading}
            style={{ background: '#28a745' }}
            data-testid="stock-filter-export"
          >
            {exportando ? 'Exportando...' : 'Exportar a Excel'}
          </SharedButton>
        )}
      </ButtonGroup>
    </FiltersContainer>
  );
};

export default FiltersStock;