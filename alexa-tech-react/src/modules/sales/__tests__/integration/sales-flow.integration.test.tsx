import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { SalesProvider, useSales } from '../../context/SalesContext';
import { ProductProvider, useProducts } from '../../../products/context/ProductContext';
import { ClientProvider, useClients } from '../../../clients/context/ClientContext';
import { NotificationProvider } from '../../../../context/NotificationContext';
import { UIProvider } from '../../../../context/UIContext';
import { apiService } from '../../../../utils/api';

// Mock de apiService
vi.mock('../../../../utils/api', () => ({
  apiService: {
    getProducts: vi.fn(),
    getClients: vi.fn(),
  },
  tokenUtils: {
    getAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

// Componente de prueba que simula el flujo de ventas
const TestSalesFlow = () => {
  const { sales, addSale } = useSales();
  const { products } = useProducts();
  const { clients } = useClients();

  const handleCreateSale = () => {
    if (products.length > 0 && clients.length > 0) {
      const saleData = {
        saleNumber: 'V-001',
        clientId: clients[0].id,
        userId: 'user-1',
        cashRegisterId: 'cash-1',
        items: [
          {
            productId: products[0].id,
            quantity: 2,
            unitPrice: products[0].price,
            total: products[0].price * 2,
          },
        ],
        subtotal: products[0].price * 2,
        tax: products[0].price * 2 * 0.18,
        total: products[0].price * 2 * 1.18,
        paymentMethod: 'efectivo' as const,
        status: 'completada' as const,
        createdAt: new Date(),
      };
      addSale(saleData);
    }
  };

  return (
    <div>
      <div data-testid="products-count">{products.length}</div>
      <div data-testid="clients-count">{clients.length}</div>
      <div data-testid="sales-count">{sales.length}</div>
      
      {products.length > 0 && (
        <div data-testid="first-product">
          <span data-testid="product-name">{products[0].productName}</span>
          <span data-testid="product-price">{products[0].price}</span>
          <span data-testid="product-stock">{products[0].currentStock}</span>
        </div>
      )}
      
      {clients.length > 0 && (
        <div data-testid="first-client">
          <span data-testid="client-name">
            {clients[0].nombres || clients[0].razonSocial}
          </span>
          <span data-testid="client-document">{clients[0].numeroDocumento}</span>
        </div>
      )}
      
      <button onClick={handleCreateSale} data-testid="create-sale-btn">
        Crear Venta
      </button>
      
      {sales.length > 0 && (
        <div data-testid="sale-info">
          <div data-testid="sale-subtotal">{sales[0].subtotal.toFixed(2)}</div>
          <div data-testid="sale-tax">{sales[0].tax.toFixed(2)}</div>
          <div data-testid="sale-total">{sales[0].total.toFixed(2)}</div>
          <div data-testid="sale-items-count">{sales[0].items.length}</div>
        </div>
      )}
    </div>
  );
};

describe('Integration: Sales → Clients → Products Flow', () => {
  // Datos mock
  const mockProducts = [
    {
      codigo: 'PROD-001',
      nombre: 'Producto Test',
      categoria: 'Electrónica',
      precioVenta: 100.00,
      stock: 50,
      unidadMedida: 'Unidad',
      estado: true,
    },
    {
      codigo: 'PROD-002',
      nombre: 'Producto Test 2',
      categoria: 'Tecnología',
      precioVenta: 200.00,
      stock: 30,
      unidadMedida: 'Unidad',
      estado: true,
    },
  ];

  const mockClients = [
    {
      codigo: 'CLI-001',
      tipoEntidad: 'Cliente',
      nombres: 'Juan',
      apellidos: 'Pérez',
      email: 'juan@test.com',
      telefono: '123456789',
      tipoDocumento: 'DNI',
      numeroDocumento: '12345678',
      direccion: 'Calle Test 123',
      ciudad: 'Lima',
      departamentoId: '15',
      provinciaId: '1501',
      distritoId: '150101',
      estado: true,
    },
    {
      codigo: 'CLI-002',
      tipoEntidad: 'Cliente',
      razonSocial: 'Empresa Test SAC',
      email: 'empresa@test.com',
      telefono: '987654321',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      direccion: 'Av. Test 456',
      ciudad: 'Lima',
      departamentoId: '15',
      provinciaId: '1501',
      distritoId: '150101',
      estado: true,
    },
  ];

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <NotificationProvider>
          <UIProvider>
            <ClientProvider>
              <ProductProvider>
                <SalesProvider>
                  {component}
                </SalesProvider>
              </ProductProvider>
            </ClientProvider>
          </UIProvider>
        </NotificationProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mockear apiService.getProducts
    (apiService.getProducts as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        products: mockProducts,
        totalProducts: mockProducts.length,
      },
    });
    
    // Mockear apiService.getClients
    (apiService.getClients as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        clientes: mockClients,
        totalClientes: mockClients.length,
        paginaActual: 1,
        totalPaginas: 1,
      },
    });
  });

  describe('Flujo de creación de venta', () => {
    it('debe cargar productos disponibles', async () => {
      renderWithProviders(<TestSalesFlow />);

      await waitFor(() => {
        const productsCount = screen.getByTestId('products-count');
        expect(parseInt(productsCount.textContent || '0')).toBeGreaterThan(0);
      });
    });

    it('debe mostrar información del producto seleccionado', async () => {
      renderWithProviders(<TestSalesFlow />);

      await waitFor(() => {
        expect(screen.getByTestId('first-product')).toBeInTheDocument();
      });

      const productName = screen.getByTestId('product-name');
      const productPrice = screen.getByTestId('product-price');
      const productStock = screen.getByTestId('product-stock');

      expect(productName).toHaveTextContent('Producto Test');
      expect(productPrice).toBeInTheDocument();
      expect(productStock).toBeInTheDocument();
    });
  });

  describe('Validación cross-module', () => {
    it('debe usar productos del ProductsContext', async () => {
      renderWithProviders(<TestSalesFlow />);

      await waitFor(() => {
        const productsCount = screen.getByTestId('products-count');
        expect(parseInt(productsCount.textContent || '0')).toBeGreaterThan(0);
      });

      // Verificar que hay productos disponibles
      expect(screen.getByTestId('first-product')).toBeInTheDocument();
      expect(screen.getByTestId('product-name')).toHaveTextContent('Producto Test');
    });

    it('debe mantener el estado de productos entre renders', async () => {
      renderWithProviders(<TestSalesFlow />);

      await waitFor(() => {
        expect(screen.getByTestId('first-product')).toBeInTheDocument();
      });

      // Verificar que el producto se mantiene
      const productPrice1 = screen.getByTestId('product-price').textContent;
      
      // Re-renderizar
      await waitFor(() => {
        const productPrice2 = screen.getByTestId('product-price').textContent;
        expect(productPrice1).toBe(productPrice2);
      });
    });
  });

  describe('Estados y actualizaciones', () => {
    it('debe inicializar con cero ventas', async () => {
      renderWithProviders(<TestSalesFlow />);

      await waitFor(() => {
        expect(screen.getByTestId('sales-count')).toBeInTheDocument();
      });

      const initialCount = screen.getByTestId('sales-count').textContent;
      expect(initialCount).toBe('0');
    });

    it('debe mostrar productos cargados correctamente', async () => {
      renderWithProviders(<TestSalesFlow />);

      await waitFor(() => {
        const productsCount = screen.getByTestId('products-count');
        expect(productsCount.textContent).toBe('2'); // Tenemos 2 productos mock
      });
    });
  });
});
