import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY, TRANSITIONS } from '../../../../styles/theme';
import { Input as SharedInput, Select as SharedSelect, Label as SharedLabel, Button as SharedButton } from '../../../../components/shared';
import type { KardexFilters } from '../../../../types/inventario';
import { WAREHOUSE_OPTIONS } from '../../../../constants/warehouses';
import { inventarioApi } from '../../services/inventarioApi';
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

const AutocompleteContainer = styled.div`
  position: relative;
`;

const AutocompleteList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${COLORS.neutral.white};
  border: 2px solid ${COLORS.neutral[200]};
  border-top: none;
  border-radius: 0 0 ${BORDER_RADIUS.md} ${BORDER_RADIUS.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
  box-shadow: ${SHADOWS.md};
`;

const AutocompleteItem = styled.li`
  padding: ${SPACING.md};
  cursor: pointer;
  border-bottom: 1px solid ${COLORS.neutral[100]};
  transition: ${TRANSITIONS.fast};
  
  &:hover {
    background: ${COLORS.neutral[50]};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  strong {
    color: ${COLOR_SCALES.primary[500]};
  }
`;

const ErrorMessage = styled.span`
  color: ${COLOR_SCALES.danger[500]};
  font-size: ${TYPOGRAPHY.fontSize.sm};
  margin-top: ${SPACING.xs};
  display: block;
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

interface FiltersKardexProps {
  onFilterChange: (filters: KardexFilters) => void;
  loading?: boolean;
  defaultWarehouseId?: string;
  onExport?: () => void;
  exportando?: boolean;
}

const FiltersKardex: React.FC<FiltersKardexProps> = ({ onFilterChange, loading = false, defaultWarehouseId, onExport, exportando }) => {
  const [filters, setFilters] = useState<KardexFilters>({
    warehouseId: '',
    productId: '',
    tipoMovimiento: undefined,
    fechaDesde: '',
    fechaHasta: '',
    page: 1,
    pageSize: 20,
    sortBy: 'fecha',
    order: 'desc'
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
        console.log('[FiltersKardex] Warehouses full response:', resp);
        console.log('[FiltersKardex] Warehouses resp.data:', resp.data);
        
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
        
        console.log('[FiltersKardex] Parsed warehouse list:', list);
        
        if (Array.isArray(list) && list.length > 0 && mounted) {
          const activeWarehouses = list.filter((w: any) => w.activo !== false);
          setWarehouseOptions(activeWarehouses.map((w: any) => ({ 
            value: w.id, 
            label: w.nombre 
          })));
          console.log('[FiltersKardex] Warehouses loaded:', activeWarehouses.length);
        }
      } catch (e) {
        console.error('[FiltersKardex] Error loading warehouses:', e);
        console.warn('[FiltersKardex] Usando fallback warehouses');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Prefill almacén por defecto si no está seleccionado
  useEffect(() => {
    if (!filters.warehouseId) {
      const def = defaultWarehouseId || 'WH-PRINCIPAL';
      setFilters(prev => ({ ...prev, warehouseId: def }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultWarehouseId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productSearch, setProductSearch] = useState('');
  const [productSuggestions, setProductSuggestions] = useState<{ id: string; codigo: string; nombre: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Manejar cambios en los filtros
  const handleFilterChange = (key: keyof KardexFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset page when other filters change
    }));

    // Limpiar error del campo
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  // Validar filtros
  const validateFilters = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!filters.warehouseId) {
      newErrors.warehouseId = 'El almacén es requerido';
    }

    if (filters.fechaDesde && filters.fechaHasta) {
      const fechaDesde = new Date(filters.fechaDesde);
      const fechaHasta = new Date(filters.fechaHasta);
      
      if (fechaDesde > fechaHasta) {
        newErrors.fechaHasta = 'La fecha hasta debe ser mayor o igual a la fecha desde';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Buscar productos para autocomplete
  const searchProducts = async (query: string) => {
    if (query.length < 2) {
      setProductSuggestions([]);
      return;
    }

    try {
      const products = await inventarioApi.searchProducts(query);
      setProductSuggestions(products);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setProductSuggestions([]);
    }
  };

  // Manejar cambio en búsqueda de producto
  const handleProductSearchChange = (value: string) => {
    setProductSearch(value);
    
    // Si se limpia el campo, limpiar también el productId
    if (!value) {
      handleFilterChange('productId', '');
      setProductSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchProducts(value);
    }, 300);
  };

  // Seleccionar producto del autocomplete
  const handleProductSelect = (product: { id: string; codigo: string; nombre: string }) => {
    setProductSearch(`${product.codigo} - ${product.nombre}`);
    handleFilterChange('productId', product.id);
    setShowSuggestions(false);
    setProductSuggestions([]);
  };

  // Aplicar filtros
  const handleSearch = () => {
    if (!validateFilters()) {
      return;
    }

    // Limpiar valores vacíos
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined && value !== null) {
        (acc as Partial<KardexFilters>)[key as keyof KardexFilters] = value as any;
      }
      return acc;
    }, {} as Partial<KardexFilters>) as KardexFilters;

    onFilterChange(cleanFilters);
  };

  // Limpiar filtros
  const handleClear = () => {
    const defaultFilters: KardexFilters = {
      warehouseId: '',
      productId: '',
      tipoMovimiento: undefined,
      fechaDesde: '',
      fechaHasta: '',
      page: 1,
      pageSize: 20,
      sortBy: 'fecha',
      order: 'desc'
    };
    
    setFilters(defaultFilters);
    setProductSearch('');
    setErrors({});
    setProductSuggestions([]);
    setShowSuggestions(false);
  };

  // Cerrar autocomplete al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <FiltersContainer>
      <FiltersGrid>
        <FormGroup>
          <SharedLabel htmlFor="warehouseId">Almacén *</SharedLabel>
          <SharedSelect
            id="warehouseId"
            value={filters.warehouseId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('warehouseId', e.target.value)}
            $hasError={!!errors.warehouseId}
            data-testid="kardex-filter-warehouse"
          >
            <option value="">Seleccionar almacén</option>
            {warehouseOptions.map(warehouse => (
              <option key={warehouse.value} value={warehouse.value}>
                {warehouse.label}
              </option>
            ))}
          </SharedSelect>
          {errors.warehouseId && <ErrorMessage>{errors.warehouseId}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="productSearch">Producto</SharedLabel>
          <AutocompleteContainer ref={autocompleteRef}>
            <SharedInput
              id="productSearch"
              type="text"
              placeholder="Buscar por código o nombre..."
              value={productSearch}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleProductSearchChange(e.target.value)}
              data-testid="kardex-filter-product-input"
            />
            {showSuggestions && productSuggestions.length > 0 && (
              <AutocompleteList data-testid="kardex-filter-product-suggestions">
                {productSuggestions.map(product => (
                  <AutocompleteItem
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    data-testid={`kardex-filter-product-option-${product.id}`}
                  >
                    <strong>{product.codigo}</strong> - {product.nombre}
                  </AutocompleteItem>
                ))}
              </AutocompleteList>
            )}
          </AutocompleteContainer>
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="tipoMovimiento">Tipo de Movimiento</SharedLabel>
          <SharedSelect
            id="tipoMovimiento"
            value={filters.tipoMovimiento || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleFilterChange('tipoMovimiento', e.target.value || undefined)}
            data-testid="kardex-filter-tipo"
          >
            <option value="">Todos los tipos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
            <option value="AJUSTE">Ajuste</option>
          </SharedSelect>
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="fechaDesde">Fecha Desde</SharedLabel>
          <SharedInput
            id="fechaDesde"
            type="date"
            value={filters.fechaDesde || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaDesde', e.target.value)}
            data-testid="kardex-filter-fecha-desde"
          />
        </FormGroup>

        <FormGroup>
          <SharedLabel htmlFor="fechaHasta">Fecha Hasta</SharedLabel>
          <SharedInput
            id="fechaHasta"
            type="date"
            value={filters.fechaHasta || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('fechaHasta', e.target.value)}
            $hasError={!!errors.fechaHasta}
            data-testid="kardex-filter-fecha-hasta"
          />
          {errors.fechaHasta && <ErrorMessage>{errors.fechaHasta}</ErrorMessage>}
        </FormGroup>
      </FiltersGrid>

      <ButtonGroup>
        <SharedButton 
          type="button" 
          onClick={handleClear}
          disabled={loading}
          data-testid="kardex-filter-clear"
        >
          Limpiar
        </SharedButton>
        <SharedButton 
          type="button" 
          $variant="primary" 
          onClick={handleSearch}
          disabled={loading || !filters.warehouseId}
          data-testid="kardex-filter-search-button"
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
            data-testid="kardex-filter-export"
          >
            {exportando ? 'Exportando...' : 'Exportar a Excel'}
          </SharedButton>
        )}
      </ButtonGroup>
    </FiltersContainer>
  );
};

export default FiltersKardex;