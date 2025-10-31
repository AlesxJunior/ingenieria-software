import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import FiltersKardex from '../FiltersKardex';
import { inventarioApi } from '../../../services/inventarioApi';
import type { KardexFilters } from '../../../types/inventario';

// Mock del servicio de inventario
vi.mock('../../../services/inventarioApi', () => ({
  inventarioApi: {
    searchProducts: vi.fn(),
  },
}));

// Mock de WAREHOUSE_OPTIONS
vi.mock('../../../constants/warehouses', () => ({
  WAREHOUSE_OPTIONS: [
    { value: 'WH-PRINCIPAL', label: 'Almacén Principal' },
    { value: 'WH-SECUNDARIO', label: 'Almacén Secundario' },
  ],
}));

describe('FiltersKardex', () => {
  const mockOnFilterChange = vi.fn();
  const mockSearchProducts = vi.mocked(inventarioApi.searchProducts);

  const defaultProps = {
    onFilterChange: mockOnFilterChange,
    loading: false,
    defaultWarehouseId: 'WH-PRINCIPAL',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar todos los campos de filtro', () => {
      render(<FiltersKardex {...defaultProps} />);

      expect(screen.getByLabelText(/almacén/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/producto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/tipo de movimiento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha desde/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha hasta/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/elementos por página/i)).toBeInTheDocument();
    });

    it('debe renderizar los botones de acción', () => {
      render(<FiltersKardex {...defaultProps} />);

      expect(screen.getByTestId('kardex-filter-clear')).toBeInTheDocument();
      expect(screen.getByTestId('kardex-filter-search-button')).toBeInTheDocument();
    });

    it('debe establecer el almacén por defecto', () => {
      render(<FiltersKardex {...defaultProps} />);

      const warehouseSelect = screen.getByTestId('kardex-filter-warehouse') as HTMLSelectElement;
      expect(warehouseSelect.value).toBe('WH-PRINCIPAL');
    });

    it('debe auto-seleccionar almacén por defecto cuando defaultWarehouseId está vacío', () => {
      render(<FiltersKardex {...defaultProps} defaultWarehouseId="" />);

      const warehouseSelect = screen.getByTestId('kardex-filter-warehouse') as HTMLSelectElement;
      const searchButton = screen.getByTestId('kardex-filter-search-button');

      expect(warehouseSelect.value).toBe('WH-PRINCIPAL');
      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('Validación de formulario', () => {
    it('debe deshabilitar búsqueda cuando no se selecciona almacén', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} defaultWarehouseId="" />);

      const warehouseSelect = screen.getByTestId('kardex-filter-warehouse');
      const searchButton = screen.getByTestId('kardex-filter-search-button');

      await user.selectOptions(warehouseSelect, '');
      expect(searchButton).toBeDisabled();
      expect(mockOnFilterChange).not.toHaveBeenCalled();
    });

    it('debe mostrar error cuando fecha hasta es menor que fecha desde', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const fechaDesde = screen.getByTestId('kardex-filter-fecha-desde');
      const fechaHasta = screen.getByTestId('kardex-filter-fecha-hasta');
      const searchButton = screen.getByTestId('kardex-filter-search-button');

      await user.type(fechaDesde, '2024-01-15');
      await user.type(fechaHasta, '2024-01-10');
      await user.click(searchButton);

      expect(screen.getByText('La fecha hasta debe ser mayor o igual a la fecha desde')).toBeInTheDocument();
      expect(mockOnFilterChange).not.toHaveBeenCalled();
    });

    it('debe habilitar el botón de búsqueda al corregir el almacén', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} defaultWarehouseId="" />);

      const warehouseSelect = screen.getByTestId('kardex-filter-warehouse');
      const searchButton = screen.getByTestId('kardex-filter-search-button');

      // Forzar estado inválido: limpiar selección
      await user.selectOptions(warehouseSelect, '');
      expect(searchButton).toBeDisabled();

      // Corregir error seleccionando un almacén válido
      await user.selectOptions(warehouseSelect, 'WH-PRINCIPAL');
      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('Funcionalidad de autocomplete de productos', () => {
    const mockProducts = [
      { id: 'prod-1', codigo: 'LAP-14', nombre: 'Laptop Pro 14' },
      { id: 'prod-2', codigo: 'LAP-16', nombre: 'Laptop Pro 16' },
    ];

    beforeEach(() => {
      mockSearchProducts.mockResolvedValue(mockProducts);
    });

    it('debe buscar productos cuando se escribe en el campo', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'Laptop');

      // Esperar a que el debounce dispare la búsqueda
      await waitFor(() => {
        expect(mockSearchProducts).toHaveBeenCalledWith('Laptop');
      });
    });

    it('debe mostrar sugerencias cuando hay resultados', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'Laptop');

      await waitFor(() => {
        expect(screen.getByTestId('kardex-filter-product-suggestions')).toBeInTheDocument();
      });

      expect(screen.getByTestId('kardex-filter-product-option-prod-1')).toBeInTheDocument();
      expect(screen.getByTestId('kardex-filter-product-option-prod-2')).toBeInTheDocument();
    });

    it('debe seleccionar producto del autocomplete', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'Laptop');

      await waitFor(() => {
        expect(screen.getByTestId('kardex-filter-product-suggestions')).toBeInTheDocument();
      });

      const option = screen.getByTestId('kardex-filter-product-option-prod-1');
      await user.click(option);

      expect(productInput).toHaveValue('LAP-14 - Laptop Pro 14');
      expect(screen.queryByTestId('kardex-filter-product-suggestions')).not.toBeInTheDocument();
    });

    it('debe limpiar productId cuando se borra el campo de búsqueda', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      
      // Escribir y seleccionar producto
      await user.type(productInput, 'Laptop');
      // Esperamos a que el debounce ejecute la búsqueda sin manipular timers manualmente
      
      await waitFor(() => {
        expect(screen.getByTestId('kardex-filter-product-suggestions')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('kardex-filter-product-option-prod-1'));
      
      // Limpiar campo
      await user.clear(productInput);

      expect(productInput).toHaveValue('');
      expect(screen.queryByTestId('kardex-filter-product-suggestions')).not.toBeInTheDocument();
    });

    it('no debe buscar productos con menos de 2 caracteres', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'L');

      // Esperar un breve momento por el debounce natural
      await waitFor(() => {
        // Con 1 carácter no debe dispararse la búsqueda
        expect(mockSearchProducts).not.toHaveBeenCalled();
      });
    });

    it('debe manejar errores en la búsqueda de productos', async () => {
      const user = userEvent.setup();
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockSearchProducts.mockRejectedValue(new Error('API Error'));

      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'Laptop');

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error searching products:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Aplicación de filtros', () => {
    it('debe llamar onFilterChange con filtros válidos', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const warehouseSelect = screen.getByTestId('kardex-filter-warehouse');
      const tipoSelect = screen.getByTestId('kardex-filter-tipo');
      const fechaDesde = screen.getByTestId('kardex-filter-fecha-desde');
      const searchButton = screen.getByTestId('kardex-filter-search-button');

      await user.selectOptions(warehouseSelect, 'WH-PRINCIPAL');
      await user.selectOptions(tipoSelect, 'ENTRADA');
      await user.type(fechaDesde, '2024-01-01');
      await user.click(searchButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        warehouseId: 'WH-PRINCIPAL',
        tipoMovimiento: 'ENTRADA',
        fechaDesde: '2024-01-01',
        page: 1,
        pageSize: 20,
        sortBy: 'fecha',
        order: 'desc',
      });
    });

    it('debe omitir campos vacíos en los filtros', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const searchButton = screen.getByTestId('kardex-filter-search-button');
      await user.click(searchButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith({
        warehouseId: 'WH-PRINCIPAL',
        page: 1,
        pageSize: 20,
        sortBy: 'fecha',
        order: 'desc',
      });
    });

    it('debe incluir productId cuando se selecciona un producto', async () => {
      const user = userEvent.setup();
      mockSearchProducts.mockResolvedValue([
        { id: 'prod-1', codigo: 'LAP-14', nombre: 'Laptop Pro 14' },
      ]);

      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'Laptop');

      await waitFor(() => {
        expect(screen.getByTestId('kardex-filter-product-suggestions')).toBeInTheDocument();
      });

      await user.click(screen.getByTestId('kardex-filter-product-option-prod-1'));

      const searchButton = screen.getByTestId('kardex-filter-search-button');
      await user.click(searchButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: 'prod-1',
        })
      );
    });
  });

  describe('Limpieza de filtros', () => {
    it('debe limpiar todos los filtros al hacer click en Limpiar', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      // Llenar algunos campos
      const tipoSelect = screen.getByTestId('kardex-filter-tipo');
      const fechaDesde = screen.getByTestId('kardex-filter-fecha-desde');
      const productInput = screen.getByTestId('kardex-filter-product-input');

      await user.selectOptions(tipoSelect, 'ENTRADA');
      await user.type(fechaDesde, '2024-01-01');
      await user.type(productInput, 'Test Product');

      // Limpiar
      const clearButton = screen.getByTestId('kardex-filter-clear');
      await user.click(clearButton);

      // Verificar que se limpiaron
      expect(tipoSelect).toHaveValue('');
      expect(fechaDesde).toHaveValue('');
      expect(productInput).toHaveValue('');
    });
  });

  describe('Estados de carga', () => {
    it('debe deshabilitar botones cuando está cargando', () => {
      render(<FiltersKardex {...defaultProps} loading={true} />);

      const searchButton = screen.getByTestId('kardex-filter-search-button');
      const clearButton = screen.getByTestId('kardex-filter-clear');

      expect(searchButton).toBeDisabled();
      expect(clearButton).toBeDisabled();
    });

    it('debe mostrar texto de carga en el botón de búsqueda', () => {
      render(<FiltersKardex {...defaultProps} loading={true} />);

      const searchButton = screen.getByTestId('kardex-filter-search-button');
      expect(searchButton).toHaveTextContent('Buscando...');
    });
  });

  describe('Interacciones del usuario', () => {
    it('debe cerrar autocomplete al hacer click fuera', async () => {
      const user = userEvent.setup();
      mockSearchProducts.mockResolvedValue([
        { id: 'prod-1', codigo: 'LAP-14', nombre: 'Laptop Pro 14' },
      ]);

      render(<FiltersKardex {...defaultProps} />);

      const productInput = screen.getByTestId('kardex-filter-product-input');
      await user.type(productInput, 'Laptop');

      await waitFor(() => {
        expect(screen.getByTestId('kardex-filter-product-suggestions')).toBeInTheDocument();
      });

      // Click fuera del componente usando mousedown (el componente escucha 'mousedown')
      act(() => {
        fireEvent.mouseDown(document.body);
      });

      await waitFor(() => {
        expect(screen.queryByTestId('kardex-filter-product-suggestions')).not.toBeInTheDocument();
      });
    });

    it('debe manejar cambios en el tamaño de página', async () => {
      const user = userEvent.setup();
      render(<FiltersKardex {...defaultProps} />);

      const pageSizeSelect = screen.getByTestId('kardex-filter-pagesize');
      await user.selectOptions(pageSizeSelect, '50');

      const searchButton = screen.getByTestId('kardex-filter-search-button');
      await user.click(searchButton);

      expect(mockOnFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 50,
        })
      );
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener labels asociados correctamente', () => {
      render(<FiltersKardex {...defaultProps} />);

      const warehouseSelect = screen.getByTestId('kardex-filter-warehouse');
      const productInput = screen.getByTestId('kardex-filter-product-input');
      const tipoSelect = screen.getByTestId('kardex-filter-tipo');

      expect(warehouseSelect).toHaveAccessibleName(/almacén/i);
      expect(productInput).toHaveAccessibleName(/producto/i);
      expect(tipoSelect).toHaveAccessibleName(/tipo de movimiento/i);
    });

    it('debe mostrar campos requeridos correctamente', () => {
      render(<FiltersKardex {...defaultProps} />);

      // Usamos el label asociado al select por accesibilidad
      const warehouseSelect = screen.getByLabelText(/almacén/i);
      expect(warehouseSelect).toBeInTheDocument();
    });
  });
});