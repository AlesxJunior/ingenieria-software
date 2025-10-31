import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import type { KardexFilters } from '../../../../types/inventario';
import { WAREHOUSE_OPTIONS } from '../../../../constants/warehouses';
import { inventarioApi } from '../../services/inventarioApi';
import { apiService } from '../../../../utils/api';

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

const Label = styled.label<{ $required?: boolean }>`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
  
  ${props => props.$required && `
    &::after {
      content: ' *';
      color: #e74c3c;
    }
  `}
`;

const Input = styled.input<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }

  &::placeholder {
    color: #95a5a6;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$hasError ? '#e74c3c' : '#e1e8ed'};
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#e74c3c' : '#3498db'};
  }
`;

const AutocompleteContainer = styled.div`
  position: relative;
`;

const AutocompleteList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e8ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const AutocompleteItem = styled.li`
  padding: 0.75rem;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
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

interface FiltersKardexProps {
  onFilterChange: (filters: KardexFilters) => void;
  loading?: boolean;
  defaultWarehouseId?: string;
}

const FiltersKardex: React.FC<FiltersKardexProps> = ({ onFilterChange, loading = false, defaultWarehouseId }) => {
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
          <Label htmlFor="warehouseId" $required>Almacén</Label>
          <Select
            id="warehouseId"
            value={filters.warehouseId}
            onChange={(e) => handleFilterChange('warehouseId', e.target.value)}
            $hasError={!!errors.warehouseId}
            data-testid="kardex-filter-warehouse"
          >
            <option value="">Seleccionar almacén</option>
            {warehouseOptions.map(warehouse => (
              <option key={warehouse.value} value={warehouse.value}>
                {warehouse.label}
              </option>
            ))}
          </Select>
          {errors.warehouseId && <ErrorMessage>{errors.warehouseId}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="productSearch">Producto</Label>
          <AutocompleteContainer ref={autocompleteRef}>
            <Input
              id="productSearch"
              type="text"
              placeholder="Buscar por código o nombre..."
              value={productSearch}
              onChange={(e) => handleProductSearchChange(e.target.value)}
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
          <Label htmlFor="tipoMovimiento">Tipo de Movimiento</Label>
          <Select
            id="tipoMovimiento"
            value={filters.tipoMovimiento || ''}
            onChange={(e) => handleFilterChange('tipoMovimiento', e.target.value || undefined)}
            data-testid="kardex-filter-tipo"
          >
            <option value="">Todos los tipos</option>
            <option value="ENTRADA">Entrada</option>
            <option value="SALIDA">Salida</option>
            <option value="AJUSTE">Ajuste</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label htmlFor="fechaDesde">Fecha Desde</Label>
          <Input
            id="fechaDesde"
            type="date"
            value={filters.fechaDesde || ''}
            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
            data-testid="kardex-filter-fecha-desde"
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="fechaHasta">Fecha Hasta</Label>
          <Input
            id="fechaHasta"
            type="date"
            value={filters.fechaHasta || ''}
            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
            $hasError={!!errors.fechaHasta}
            data-testid="kardex-filter-fecha-hasta"
          />
          {errors.fechaHasta && <ErrorMessage>{errors.fechaHasta}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="pageSize">Elementos por página</Label>
          <Select
            id="pageSize"
            value={filters.pageSize || 20}
            onChange={(e) => handleFilterChange('pageSize', parseInt(e.target.value))}
            data-testid="kardex-filter-pagesize"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
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
          data-testid="kardex-filter-clear"
        >
          Limpiar
        </Button>
        <Button 
          type="button" 
          $variant="primary" 
          onClick={handleSearch}
          disabled={loading || !filters.warehouseId}
          data-testid="kardex-filter-search-button"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </ButtonGroup>
    </FiltersContainer>
  );
};

export default FiltersKardex;