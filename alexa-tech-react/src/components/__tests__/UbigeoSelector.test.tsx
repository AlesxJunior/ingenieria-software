import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UbigeoSelector from '../../modules/clients/components/UbigeoSelector';
import * as api from '../../utils/api';

// Mock del API service
vi.mock('../../utils/api', () => ({
  apiService: {
    getDepartamentos: vi.fn(),
    getProvincias: vi.fn(),
    getDistritos: vi.fn()
  }
}));

const mockDepartamentos = [
  { id: 'dep-1', nombre: 'Lima' },
  { id: 'dep-2', nombre: 'Arequipa' },
  { id: 'dep-3', nombre: 'Cusco' }
];

const mockProvincias = [
  { id: 'prov-1', nombre: 'Lima', departamentoId: 'dep-1' },
  { id: 'prov-2', nombre: 'Callao', departamentoId: 'dep-1' },
  { id: 'prov-3', nombre: 'Huarochirí', departamentoId: 'dep-1' }
];

const mockDistritos = [
  { id: 'dist-1', nombre: 'Miraflores', provinciaId: 'prov-1' },
  { id: 'dist-2', nombre: 'San Isidro', provinciaId: 'prov-1' },
  { id: 'dist-3', nombre: 'Surco', provinciaId: 'prov-1' }
];

describe('UbigeoSelector', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (api.apiService.getDepartamentos as any).mockResolvedValue({
      success: true,
      data: mockDepartamentos
    });
    (api.apiService.getProvincias as any).mockResolvedValue({
      success: true,
      data: mockProvincias
    });
    (api.apiService.getDistritos as any).mockResolvedValue({
      success: true,
      data: mockDistritos
    });
  });

  describe('Renderizado inicial', () => {
    it('debe renderizar los tres selectores (departamento, provincia, distrito)', async () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/provincia/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/distrito/i)).toBeInTheDocument();
      });
    });

    it('debe cargar departamentos automáticamente al montar', async () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(api.apiService.getDepartamentos).toHaveBeenCalledTimes(1);
      });

      const depSelect = screen.getByLabelText(/departamento/i);
      expect(within(depSelect as HTMLSelectElement).getByText('Lima')).toBeInTheDocument();
      expect(within(depSelect as HTMLSelectElement).getByText('Arequipa')).toBeInTheDocument();
      expect(within(depSelect as HTMLSelectElement).getByText('Cusco')).toBeInTheDocument();
    });

    it('debe deshabilitar provincia y distrito inicialmente', async () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });

      expect(screen.getByLabelText(/provincia/i)).toBeDisabled();
      expect(screen.getByLabelText(/distrito/i)).toBeDisabled();
    });
  });

  describe('Selección de departamento', () => {
    it('debe llamar onChange cuando se selecciona un departamento', async () => {
      const user = userEvent.setup();
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });

      const depSelect = screen.getByLabelText(/departamento/i);
      await user.selectOptions(depSelect, 'dep-1');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: 'dep-1',
        provinciaId: '',
        distritoId: ''
      });
    });

    it('debe cargar provincias cuando se selecciona un departamento', async () => {
      const { rerender } = render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });

      // Simular que onChange actualiza el value
      rerender(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(api.apiService.getProvincias).toHaveBeenCalledWith('dep-1');
      });
    });

    it('debe limpiar provincia y distrito al cambiar departamento', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1', distritoId: 'dist-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });

      const depSelect = screen.getByLabelText(/departamento/i);
      await user.selectOptions(depSelect, 'dep-2');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: 'dep-2',
        provinciaId: '',
        distritoId: ''
      });
    });
  });

  describe('Selección de provincia', () => {
    it('debe habilitar provincia cuando hay departamento seleccionado', async () => {
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        const provSelect = screen.getByLabelText(/provincia/i);
        expect(provSelect).not.toBeDisabled();
      });
    });

    it('debe llamar onChange cuando se selecciona una provincia', async () => {
      const user = userEvent.setup();
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/provincia/i)).not.toBeDisabled();
      });

      const provSelect = screen.getByLabelText(/provincia/i);
      await user.selectOptions(provSelect, 'prov-1');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: ''
      });
    });

    it('debe cargar distritos cuando se selecciona una provincia', async () => {
      const { rerender } = render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/provincia/i)).not.toBeDisabled();
      });

      // Simular que onChange actualiza el value
      rerender(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(api.apiService.getDistritos).toHaveBeenCalledWith('prov-1');
      });
    });

    it('debe limpiar distrito al cambiar provincia', async () => {
      const user = userEvent.setup();
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1', distritoId: 'dist-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/provincia/i)).not.toBeDisabled();
      });

      const provSelect = screen.getByLabelText(/provincia/i);
      await user.selectOptions(provSelect, 'prov-2');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: 'dep-1',
        provinciaId: 'prov-2',
        distritoId: ''
      });
    });
  });

  describe('Selección de distrito', () => {
    it('debe habilitar distrito cuando hay provincia seleccionada', async () => {
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        const distSelect = screen.getByLabelText(/distrito/i);
        expect(distSelect).not.toBeDisabled();
      });
    });

    it('debe llamar onChange cuando se selecciona un distrito', async () => {
      const user = userEvent.setup();
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/distrito/i)).not.toBeDisabled();
      });

      const distSelect = screen.getByLabelText(/distrito/i);
      await user.selectOptions(distSelect, 'dist-1');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: 'dep-1',
        provinciaId: 'prov-1',
        distritoId: 'dist-1'
      });
    });

    it('debe mostrar los distritos cargados', async () => {
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        const distSelect = screen.getByLabelText(/distrito/i);
        expect(within(distSelect as HTMLSelectElement).getByText('Miraflores')).toBeInTheDocument();
        expect(within(distSelect as HTMLSelectElement).getByText('San Isidro')).toBeInTheDocument();
        expect(within(distSelect as HTMLSelectElement).getByText('Surco')).toBeInTheDocument();
      });
    });
  });

  describe('Prop: disabled', () => {
    it('debe deshabilitar todos los selectores cuando disabled es true', async () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
          disabled={true}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).toBeDisabled();
        expect(screen.getByLabelText(/provincia/i)).toBeDisabled();
        expect(screen.getByLabelText(/distrito/i)).toBeDisabled();
      });
    });

    it('debe permitir interacción cuando disabled es false', async () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
          disabled={false}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });
    });
  });

  describe('Prop: compact', () => {
    it('debe renderizar en modo compacto cuando compact es true', () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
          compact={true}
        />
      );

      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/provincia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/distrito/i)).toBeInTheDocument();
    });

    it('debe renderizar en modo normal cuando compact es false', () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
          compact={false}
        />
      );

      expect(screen.getByLabelText(/departamento/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/provincia/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/distrito/i)).toBeInTheDocument();
    });
  });

  describe('Prop: errors', () => {
    it('debe mostrar error de departamento cuando se proporciona', () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
          errors={{ departamentoId: 'Departamento requerido' }}
        />
      );

      expect(screen.getByText('Departamento requerido')).toBeInTheDocument();
    });

    it('debe mostrar error de provincia cuando se proporciona', () => {
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
          errors={{ provinciaId: 'Provincia requerida' }}
        />
      );

      expect(screen.getByText('Provincia requerida')).toBeInTheDocument();
    });

    it('debe mostrar error de distrito cuando se proporciona', () => {
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1' }}
          onChange={mockOnChange}
          errors={{ distritoId: 'Distrito requerido' }}
        />
      );

      expect(screen.getByText('Distrito requerido')).toBeInTheDocument();
    });

    it('debe mostrar múltiples errores simultáneamente', () => {
      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
          errors={{
            departamentoId: 'Error departamento',
            provinciaId: 'Error provincia',
            distritoId: 'Error distrito'
          }}
        />
      );

      expect(screen.getByText('Error departamento')).toBeInTheDocument();
      expect(screen.getByText('Error provincia')).toBeInTheDocument();
      expect(screen.getByText('Error distrito')).toBeInTheDocument();
    });
  });

  describe('Estados de carga', () => {
    it('debe deshabilitar departamento mientras se cargan los datos', async () => {
      (api.apiService.getDepartamentos as any).mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockDepartamentos }), 100))
      );

      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      // Debe estar deshabilitado inicialmente
      expect(screen.getByLabelText(/departamento/i)).toBeDisabled();

      // Esperar a que se carguen los datos
      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });
    });

    it('debe deshabilitar provincia mientras se cargan las provincias', async () => {
      (api.apiService.getProvincias as any).mockReturnValue(
        new Promise(resolve => setTimeout(() => resolve({ success: true, data: mockProvincias }), 100))
      );

      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
        />
      );

      // Debe estar deshabilitado mientras carga
      expect(screen.getByLabelText(/provincia/i)).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByLabelText(/provincia/i)).not.toBeDisabled();
      });
    });
  });

  describe('Manejo de errores de API', () => {
    it('debe manejar error al cargar departamentos', async () => {
      (api.apiService.getDepartamentos as any).mockResolvedValue({
        success: false,
        error: 'Error de red'
      });

      render(
        <UbigeoSelector
          value={{}}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        // Debe dejar el select habilitado pero sin opciones (solo placeholder)
        const depSelect = screen.getByLabelText(/departamento/i);
        expect(depSelect).not.toBeDisabled();
      });
    });

    it('debe manejar error al cargar provincias', async () => {
      (api.apiService.getProvincias as any).mockResolvedValue({
        success: false,
        error: 'Error de red'
      });

      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        const provSelect = screen.getByLabelText(/provincia/i);
        expect(provSelect).not.toBeDisabled();
      });
    });

    it('debe manejar error al cargar distritos', async () => {
      (api.apiService.getDistritos as any).mockResolvedValue({
        success: false,
        error: 'Error de red'
      });

      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        const distSelect = screen.getByLabelText(/distrito/i);
        expect(distSelect).not.toBeDisabled();
      });
    });
  });

  describe('Cascada de limpieza', () => {
    it('debe limpiar provincia y distrito al limpiar departamento', async () => {
      const user = userEvent.setup();
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1', distritoId: 'dist-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/departamento/i)).not.toBeDisabled();
      });

      const depSelect = screen.getByLabelText(/departamento/i);
      await user.selectOptions(depSelect, '');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: '',
        provinciaId: '',
        distritoId: ''
      });
    });

    it('debe limpiar distrito al limpiar provincia', async () => {
      const user = userEvent.setup();
      render(
        <UbigeoSelector
          value={{ departamentoId: 'dep-1', provinciaId: 'prov-1', distritoId: 'dist-1' }}
          onChange={mockOnChange}
        />
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/provincia/i)).not.toBeDisabled();
      });

      const provSelect = screen.getByLabelText(/provincia/i);
      await user.selectOptions(provSelect, '');

      expect(mockOnChange).toHaveBeenCalledWith({
        departamentoId: 'dep-1',
        provinciaId: '',
        distritoId: ''
      });
    });
  });
});
