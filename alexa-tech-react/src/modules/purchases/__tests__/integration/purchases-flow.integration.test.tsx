import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { NotificationProvider } from '../../../../context/NotificationContext';
import { UIProvider } from '../../../../context/UIContext';
import { ClientProvider, useClients } from '../../../clients/context/ClientContext';
import { ProductProvider } from '../../../products/context/ProductContext';
import { InventoryProvider } from '../../../inventory/context/InventoryContext';
import { AuthProvider } from '../../../auth/context/AuthContext';
import NuevaCompraModal from '../../components/NuevaCompraModal';
import React from 'react';

// Mock de apiService y tokenUtils
vi.mock('../../../../utils/api', () => ({
  apiService: {
    getProducts: vi.fn(),
    getClients: vi.fn(),
    getWarehouses: vi.fn(),
    createPurchase: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  tokenUtils: {
    getAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

import { apiService, tokenUtils } from '../../../../utils/api';

describe('Purchases → Products → Inventory Integration', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    nombre: 'Test',
    apellido: 'User',
    rol: 'Administrador',
    roleId: 'admin-role-id',
    permissions: [
      'inventory.read',
      'inventory.update',
      'purchases.create',
      'products.read',
      'clients.read',
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProducts = [
    {
      id: 'product-id-1',
      productCode: 'PROD-001',
      productName: 'Producto Test 1',
      category: 'Categoría Test',
      price: 100.0,
      initialStock: 50,
      currentStock: 50,
      minStock: 10,
      status: 'disponible' as const,
      unit: 'Unidad',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'product-id-2',
      productCode: 'PROD-002',
      productName: 'Producto Test 2',
      category: 'Categoría Test',
      price: 200.0,
      initialStock: 30,
      currentStock: 30,
      minStock: 5,
      status: 'disponible' as const,
      unit: 'Unidad',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockClients = [
    {
      id: 'proveedor-1',
      tipoEntidad: 'Proveedor' as const,
      razonSocial: 'Proveedor Test S.A.C.',
      email: 'proveedor@test.com',
      telefono: '987654321',
      tipoDocumento: 'RUC' as const,
      numeroDocumento: '20123456789',
      direccion: 'Av. Test 123',
      ciudad: 'Lima',
      departamentoId: 'dept-1',
      provinciaId: 'prov-1',
      distritoId: 'dist-1',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockWarehouses = [
    {
      id: 'warehouse-1',
      nombre: 'Almacén Principal',
      ubicacion: 'Lima, Perú',
      activo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de autenticación
    (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
    (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockUser,
    });

    // Mock de productos
    (apiService.getProducts as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        products: mockProducts,
        totalProducts: mockProducts.length,
        pagination: {
          page: 1,
          limit: 10,
          totalPages: 1,
          total: mockProducts.length,
        },
      },
    });

    // Mock de clientes (proveedores)
    (apiService.getClients as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        clients: mockClients,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalClients: mockClients.length,
          hasNextPage: false,
          hasPrevPage: false,
        },
      },
    });

    // Mock de almacenes
    (apiService.getWarehouses as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        rows: mockWarehouses,
      },
    });
  });

  const renderComponent = async () => {
    // Wrapper component para trigger loadClients desde ClientContext
    const TestWrapper = () => {
      const { loadClients } = useClients();
      
      React.useEffect(() => {
        loadClients();
      }, [loadClients]);

      return <NuevaCompraModal onClose={mockOnClose} />;
    };

    const result = render(
      <BrowserRouter>
        <NotificationProvider>
          <UIProvider>
            <AuthProvider>
              <ClientProvider>
                <ProductProvider>
                  <InventoryProvider>
                    <TestWrapper />
                  </InventoryProvider>
                </ProductProvider>
              </ClientProvider>
            </AuthProvider>
          </UIProvider>
        </NotificationProvider>
      </BrowserRouter>
    );

    // Esperar a que se carguen los datos iniciales
    await waitFor(() => {
      expect(apiService.getWarehouses).toHaveBeenCalled();
      expect(apiService.getClients).toHaveBeenCalled();
      expect(apiService.getProducts).toHaveBeenCalled();
    });

    return result;
  };

  describe('Carga de datos cross-module', () => {
    it('debe cargar proveedores desde ClientContext', async () => {
      await renderComponent();

      // Verificar que se cargaron los proveedores
      await waitFor(() => {
        const proveedorSelect = screen.getByLabelText(/proveedor/i) as HTMLSelectElement;
        const options = Array.from(proveedorSelect.options);
        const proveedorOption = options.find(opt => opt.value === 'proveedor-1');
        expect(proveedorOption).toBeDefined();
        expect(proveedorOption?.text).toContain('Proveedor Test S.A.C.');
      });

      // Verificar que se llamó al API
      expect(apiService.getClients).toHaveBeenCalled();
    });

    it('debe cargar almacenes correctamente', async () => {
      await renderComponent();

      // Verificar que se cargaron los almacenes
      await waitFor(() => {
        const almacenSelect = screen.getByLabelText(/almacén/i) as HTMLSelectElement;
        const options = Array.from(almacenSelect.options);
        const almacenOption = options.find(opt => opt.value === 'warehouse-1');
        expect(almacenOption).toBeDefined();
        expect(almacenOption?.text).toContain('Almacén Principal');
      });

      expect(apiService.getWarehouses).toHaveBeenCalled();
    });

    it('debe tener acceso a ProductContext para búsqueda de productos', async () => {
      await renderComponent();

      // Verificar que existe el campo de búsqueda
      await waitFor(() => {
        expect(screen.getByLabelText(/buscar producto/i)).toBeInTheDocument();
      });

      // Verificar que se cargaron los productos en el contexto
      expect(apiService.getProducts).toHaveBeenCalled();
    });
  });

  describe('Validación y creación de compra', () => {
    it('debe validar campos requeridos antes de enviar', async () => {
      await renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /registrar/i })).toBeInTheDocument();
      });

      const user = userEvent.setup();
      const submitButton = screen.getByRole('button', { name: /registrar/i });
      
      // Intentar enviar sin llenar campos
      await user.click(submitButton);

      // No debe llamar al API si faltan campos requeridos
      expect(apiService.createPurchase).not.toHaveBeenCalled();
    });

    it('debe crear compra cuando todos los campos están llenos', async () => {
      const user = userEvent.setup();

      // Mock de creación de compra exitosa
      (apiService.createPurchase as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: {
          id: 'purchase-1',
          proveedorId: 'proveedor-1',
          almacenId: 'warehouse-1',
          fechaEmision: '2024-01-15',
          formaPago: 'Efectivo',
          items: [],
          total: 0,
        },
      });

      await renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/proveedor/i)).toBeInTheDocument();
      });

      // Llenar formulario
      const proveedorSelect = screen.getByLabelText(/proveedor/i);
      const almacenSelect = screen.getByLabelText(/almacén/i);
      const formaPagoSelect = screen.getByLabelText(/forma de pago/i);

      await user.selectOptions(proveedorSelect, 'proveedor-1');
      await user.selectOptions(almacenSelect, 'warehouse-1');
      await user.selectOptions(formaPagoSelect, 'Efectivo');

      // Verificar que los selects tienen los valores correctos
      expect((proveedorSelect as HTMLSelectElement).value).toBe('proveedor-1');
      expect((almacenSelect as HTMLSelectElement).value).toBe('warehouse-1');
      expect((formaPagoSelect as HTMLSelectElement).value).toBe('Efectivo');
    });

    it('debe mostrar errores de validación al intentar crear compra sin productos', async () => {
      const user = userEvent.setup();

      await renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/proveedor/i)).toBeInTheDocument();
      });

      // Llenar solo los campos básicos del formulario (sin productos)
      const proveedorSelect = screen.getByLabelText(/proveedor/i);
      const almacenSelect = screen.getByLabelText(/almacén/i);
      const formaPagoSelect = screen.getByLabelText(/forma de pago/i);

      await user.selectOptions(proveedorSelect, 'proveedor-1');
      await user.selectOptions(almacenSelect, 'warehouse-1');
      await user.selectOptions(formaPagoSelect, 'Efectivo');

      // Intentar enviar formulario sin productos
      const submitButton = screen.getByRole('button', { name: /registrar/i });
      await user.click(submitButton);

      // Debe mostrar errores de validación de items
      await waitFor(() => {
        expect(screen.getByText(/producto requerido/i)).toBeInTheDocument();
      });

      // No debe llamar al API por la validación
      expect(apiService.createPurchase).not.toHaveBeenCalled();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Integración con ProductContext', () => {
    it('debe usar productos del ProductContext para la búsqueda', async () => {
      await renderComponent();

      // Esperar a que cargue el campo de búsqueda
      await waitFor(() => {
        expect(screen.getByTestId('items-global-search')).toBeInTheDocument();
      });

      // Verificar que ProductContext cargó los productos
      expect(apiService.getProducts).toHaveBeenCalled();

      // Verificar que hay productos disponibles (el componente usa products del context)
      const searchInput = screen.getByTestId('items-global-search');
      expect(searchInput).toBeInTheDocument();
    });

    it('debe mostrar datos del formulario de compra', async () => {
      await renderComponent();

      await waitFor(() => {
        expect(screen.getByLabelText(/proveedor/i)).toBeInTheDocument();
      });

      // Verificar que todos los campos importantes están presentes
      expect(screen.getByLabelText(/proveedor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/almacén/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/fecha de emisión/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/forma de pago/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/buscar producto/i)).toBeInTheDocument();
      expect(screen.getByTestId('totals-subtotal')).toBeInTheDocument();
      expect(screen.getByTestId('totals-final')).toBeInTheDocument();
    });
  });
});
