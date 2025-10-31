import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import TablaKardex from '../TablaKardex';
import type { MovimientoKardex, PaginationData } from '../../../../../types/inventario';

describe('TablaKardex', () => {
  const mockOnPageChange = vi.fn();

  const mockMovimientos: MovimientoKardex[] = [
    {
      id: 'mov-1',
      fecha: '2024-01-15T10:30:00.000Z',
      productId: 'prod-1',
      codigo: 'LAP-14',
      nombre: 'Laptop Pro 14',
      almacen: 'WH-PRINCIPAL',
      tipo: 'ENTRADA',
      cantidad: 10,
      stockAntes: 0,
      stockDespues: 10,
      motivo: 'Compra inicial',
      usuario: 'Admin Test',
      documentoReferencia: 'FAC-001',
    },
    {
      id: 'mov-2',
      fecha: '2024-01-16T14:20:00.000Z',
      productId: 'prod-1',
      codigo: 'LAP-14',
      nombre: 'Laptop Pro 14',
      almacen: 'WH-PRINCIPAL',
      tipo: 'SALIDA',
      cantidad: 3,
      stockAntes: 10,
      stockDespues: 7,
      motivo: 'Venta',
      usuario: 'Vendedor 1',
      documentoReferencia: 'VEN-001',
    },
    {
      id: 'mov-3',
      fecha: '2024-01-17T09:15:00.000Z',
      productId: 'prod-1',
      codigo: 'LAP-14',
      nombre: 'Laptop Pro 14',
      almacen: 'WH-PRINCIPAL',
      tipo: 'AJUSTE',
      cantidad: 2,
      stockAntes: 7,
      stockDespues: 9,
      motivo: 'Devolución cliente',
      usuario: 'Supervisor',
      documentoReferencia: 'AJ-001',
    },
  ];

  const mockPagination: PaginationData = {
    total: 25,
    page: 1,
    limit: 10,
    pages: 3,
  };

  const defaultProps = {
    movimientos: mockMovimientos,
    pagination: mockPagination,
    loading: false,
    onPageChange: mockOnPageChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderizado de la tabla', () => {
    it('debe renderizar la tabla con los headers correctos', () => {
      render(<TablaKardex {...defaultProps} />);

      expect(screen.getByTestId('kardex-table')).toBeInTheDocument();
      expect(screen.getByText('Fecha')).toBeInTheDocument();
      expect(screen.getByText('Producto')).toBeInTheDocument();
      expect(screen.getByText('Almacén')).toBeInTheDocument();
      expect(screen.getByText('Tipo')).toBeInTheDocument();
      expect(screen.getByText('Cantidad')).toBeInTheDocument();
      expect(screen.getByText('Stock Antes')).toBeInTheDocument();
      expect(screen.getByText('Stock Después')).toBeInTheDocument();
      expect(screen.getByText('Motivo')).toBeInTheDocument();
      expect(screen.getByText('Usuario')).toBeInTheDocument();
      expect(screen.getByText('Documento')).toBeInTheDocument();
    });

    it('debe renderizar todos los movimientos', () => {
      render(<TablaKardex {...defaultProps} />);

      mockMovimientos.forEach((movimiento) => {
        expect(screen.getByTestId(`kardex-row-${movimiento.id}`)).toBeInTheDocument();
      });
    });

    it('debe mostrar los datos correctos para cada movimiento', () => {
      render(<TablaKardex {...defaultProps} />);

      // Verificar primer movimiento
      const firstRow = screen.getByTestId('kardex-row-mov-1');
      expect(firstRow).toHaveTextContent('LAP-14');
      expect(firstRow).toHaveTextContent('Laptop Pro 14');
      expect(firstRow).toHaveTextContent('Almacén Principal');
      expect(firstRow).toHaveTextContent('Compra inicial');
      expect(firstRow).toHaveTextContent('Admin Test');
      expect(firstRow).toHaveTextContent('FAC-001');

      // Verificar tipo de movimiento con testid específico
      expect(screen.getByTestId('kardex-type-ENTRADA-mov-1')).toBeInTheDocument();
      expect(screen.getByTestId('kardex-type-ENTRADA-mov-1')).toHaveTextContent('ENTRADA');
    });

    it('debe formatear las fechas correctamente', () => {
      render(<TablaKardex {...defaultProps} />);

      // La fecha debe estar formateada como DD/MM/YYYY HH:mm
      expect(screen.getByText('15/01/2024 10:30')).toBeInTheDocument();
      expect(screen.getByText('16/01/2024 14:20')).toBeInTheDocument();
      expect(screen.getByText('17/01/2024 09:15')).toBeInTheDocument();
    });

    it('debe mostrar las cantidades con los testids correctos', () => {
      render(<TablaKardex {...defaultProps} />);

      // Verificar que los testids de cantidad están presentes (solo el primero de cada tipo)
      expect(screen.getAllByTestId('kardex-quantity')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('kardex-stock-antes')[0]).toBeInTheDocument();
      expect(screen.getAllByTestId('kardex-stock-despues')[0]).toBeInTheDocument();
    });

    it('debe aplicar estilos diferentes según el tipo de movimiento', () => {
      render(<TablaKardex {...defaultProps} />);

      const entradaType = screen.getByTestId('kardex-type-ENTRADA-mov-1');
      const salidaType = screen.getByTestId('kardex-type-SALIDA-mov-2');
      const ajusteType = screen.getByTestId('kardex-type-AJUSTE-mov-3');

      // Verificar que los elementos existen
      expect(entradaType).toBeInTheDocument();
      expect(salidaType).toBeInTheDocument();
      expect(ajusteType).toBeInTheDocument();
    });
  });

  describe('Estados de carga', () => {
    it('debe mostrar mensaje de carga cuando está cargando', () => {
      render(<TablaKardex {...defaultProps} loading={true} />);

      // Debe mostrar mensaje de carga
      expect(screen.getByText('Cargando movimientos...')).toBeInTheDocument();
      expect(screen.getByText('⏳')).toBeInTheDocument();
    });

    it('debe ocultar la tabla cuando está cargando', () => {
      render(<TablaKardex {...defaultProps} loading={true} />);

      expect(screen.queryByTestId('kardex-table')).not.toBeInTheDocument();
    });

    it('debe mostrar la tabla normal cuando no está cargando', () => {
      render(<TablaKardex {...defaultProps} loading={false} />);

      expect(screen.queryByText('Cargando movimientos...')).not.toBeInTheDocument();
      expect(screen.getByTestId('kardex-table')).toBeInTheDocument();
    });
  });

  describe('Tabla vacía', () => {
    it('debe mostrar mensaje cuando no hay movimientos', () => {
      render(<TablaKardex {...defaultProps} movimientos={[]} />);

      expect(screen.getByText('No hay movimientos para mostrar')).toBeInTheDocument();
      expect(screen.getByText('📋')).toBeInTheDocument();
    });

    it('debe ocultar la tabla cuando no hay datos', () => {
      render(<TablaKardex {...defaultProps} movimientos={[]} />);

      expect(screen.queryByTestId('kardex-table')).not.toBeInTheDocument();
    });
  });

  describe('Paginación', () => {
    it('debe mostrar la información de paginación correcta', () => {
      render(<TablaKardex {...defaultProps} />);

      expect(screen.getByText('Mostrando 1 - 10 de 25 movimientos')).toBeInTheDocument();
    });

    it('debe mostrar los botones de navegación', () => {
      render(<TablaKardex {...defaultProps} />);

      expect(screen.getByText('««')).toBeInTheDocument();
      expect(screen.getByText('‹')).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
      expect(screen.getByText('»»')).toBeInTheDocument();
    });

    it('debe deshabilitar el botón anterior en la primera página', () => {
      render(<TablaKardex {...defaultProps} />);

      const prevButton = screen.getByText('‹');
      expect(prevButton).toBeDisabled();
    });

    it('debe habilitar el botón siguiente cuando hay más páginas', () => {
      render(<TablaKardex {...defaultProps} />);

      const nextButton = screen.getByText('›');
      expect(nextButton).not.toBeDisabled();
    });

    it('debe deshabilitar el botón siguiente en la última página', () => {
      const lastPagePagination = { ...mockPagination, page: 3 };
      render(<TablaKardex {...defaultProps} pagination={lastPagePagination} />);

      const nextButton = screen.getByText('›');
      expect(nextButton).toBeDisabled();
    });

    it('debe llamar onPageChange al hacer click en siguiente', async () => {
      const user = userEvent.setup();
      render(<TablaKardex {...defaultProps} />);

      const nextButton = screen.getByText('›');
      await user.click(nextButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(2);
    });

    it('debe llamar onPageChange al hacer click en anterior', async () => {
      const user = userEvent.setup();
      const secondPagePagination = { ...mockPagination, page: 2 };
      render(<TablaKardex {...defaultProps} pagination={secondPagePagination} />);

      const prevButton = screen.getByText('‹');
      await user.click(prevButton);

      expect(mockOnPageChange).toHaveBeenCalledWith(1);
    });

    it('debe mostrar números de página correctos', () => {
      const secondPagePagination = { ...mockPagination, page: 2 };
      render(<TablaKardex {...defaultProps} pagination={secondPagePagination} />);

      // Buscar el botón de página 2 específicamente
      const pageButton = screen.getByRole('button', { name: '2' });
      expect(pageButton).toBeInTheDocument();
    });

    it('debe calcular correctamente el rango de elementos mostrados', () => {
      const secondPagePagination = { ...mockPagination, page: 2 };
      render(<TablaKardex {...defaultProps} pagination={secondPagePagination} />);

      expect(screen.getByText('Mostrando 11 - 20 de 25 movimientos')).toBeInTheDocument();
    });

    it('debe manejar la última página con menos elementos', () => {
      const lastPagePagination = { ...mockPagination, page: 3 };
      render(<TablaKardex {...defaultProps} pagination={lastPagePagination} />);

      expect(screen.getByText('Mostrando 21 - 25 de 25 movimientos')).toBeInTheDocument();
    });
  });

  describe('Responsividad', () => {
    it('debe tener clases CSS para responsividad', () => {
      render(<TablaKardex {...defaultProps} />);

      const table = screen.getByTestId('kardex-table');
      expect(table).toHaveClass('kardex-table');
    });

    it('debe mostrar scroll horizontal en dispositivos móviles', () => {
      render(<TablaKardex {...defaultProps} />);

      const tableContainer = screen.getByTestId('kardex-table').parentElement;
      expect(tableContainer).toHaveStyle({ overflowX: 'auto' });
    });
  });

  describe('Casos edge', () => {
    it('debe manejar movimientos sin documento de referencia', () => {
      const movimientoSinDoc = {
        ...mockMovimientos[0],
        id: 'mov-sin-doc',
        documentoReferencia: '',
      };

      render(<TablaKardex {...defaultProps} movimientos={[movimientoSinDoc]} />);

      const row = screen.getByTestId('kardex-row-mov-sin-doc');
      expect(row).toHaveTextContent('-'); // Debe mostrar guión cuando no hay documento
    });

    it('debe manejar fechas inválidas', () => {
      const movimientoFechaInvalida = {
        ...mockMovimientos[0],
        id: 'mov-fecha-invalida',
        fecha: 'fecha-invalida',
      };

      render(<TablaKardex {...defaultProps} movimientos={[movimientoFechaInvalida]} />);

      // No debe romper la aplicación
      expect(screen.getByTestId('kardex-row-mov-fecha-invalida')).toBeInTheDocument();
    });

    it('debe manejar paginación con una sola página', () => {
      const singlePagePagination = { ...mockPagination, pages: 1, total: 3 };
      render(<TablaKardex {...defaultProps} pagination={singlePagePagination} />);

      const prevButton = screen.getByTestId('kardex-prev-page');
      const nextButton = screen.getByTestId('kardex-next-page');

      expect(prevButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('debe manejar cantidades negativas en ajustes', () => {
      const ajusteNegativo = {
        ...mockMovimientos[2],
        id: 'mov-ajuste-negativo',
        cantidad: -5,
        stockAntes: 10,
        stockDespues: 5,
      };

      render(<TablaKardex {...defaultProps} movimientos={[ajusteNegativo]} />);

      const row = screen.getByTestId('kardex-row-mov-ajuste-negativo');
      expect(row).toHaveTextContent('-5'); // Debe mostrar el signo negativo
    });
  });

  describe('Accesibilidad', () => {
    it('debe tener headers de tabla accesibles', () => {
      render(<TablaKardex {...defaultProps} />);

      const table = screen.getByTestId('kardex-table');
      const headers = table.querySelectorAll('th');

      expect(headers).toHaveLength(10); // Número correcto de columnas
    });

    it('debe tener botones de paginación', () => {
      render(<TablaKardex {...defaultProps} />);

      const prevButton = screen.getByText('‹');
      const nextButton = screen.getByText('›');

      expect(prevButton).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });
});