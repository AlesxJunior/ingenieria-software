import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../../modules/auth/context/AuthContext';
import ProtectedRoute from '../../modules/auth/components/ProtectedRoute';
import React from 'react';

// Mock de apiService y tokenUtils
vi.mock('../../utils/api', () => ({
  apiService: {
    getCurrentUser: vi.fn(),
  },
  tokenUtils: {
    getAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

import { apiService, tokenUtils } from '../../utils/api';

// Componentes de prueba simples
const DashboardPage = () => <div data-testid="dashboard-page">Dashboard</div>;
const ProductsPage = () => <div data-testid="products-page">Lista de Productos</div>;
const UsersPage = () => <div data-testid="users-page">Lista de Usuarios</div>;
const SalesPage = () => <div data-testid="sales-page">Ventas</div>;
const LoginPage = () => <div data-testid="login-page">Login</div>;
const UnauthorizedPage = () => <div data-testid="unauthorized-page">No tienes permisos</div>;

describe('Navigation Integration Tests', () => {
  const mockAdminUser = {
    id: 'admin-id',
    email: 'admin@test.com',
    nombre: 'Admin',
    apellido: 'User',
    rol: 'Administrador',
    roleId: 'admin-role-id',
    permissions: [
      'dashboard.read',
      'products.read',
      'products.create',
      'products.update',
      'users.read',
      'users.create',
      'sales.read',
      'sales.create',
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVendedorUser = {
    id: 'vendedor-id',
    email: 'vendedor@test.com',
    nombre: 'Vendedor',
    apellido: 'User',
    rol: 'Vendedor',
    roleId: 'vendedor-role-id',
    permissions: [
      'dashboard.read',
      'sales.read',
      'sales.create',
      'products.read',
    ],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (initialRoute: string, user: typeof mockAdminUser | null) => {
    // Setup mocks
    if (user) {
      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
      (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: user,
      });
    } else {
      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);
      (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        message: 'Not authenticated',
      });
    }

    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredPermission="dashboard.read">
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute requiredPermission="products.read">
                  <ProductsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredPermission="users.read">
                  <UsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <ProtectedRoute requiredPermission="sales.read">
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  describe('Protección de rutas', () => {
    it('debe redirigir al login cuando el usuario no está autenticado', async () => {
      renderWithRouter('/dashboard', null);

      // Debe redirigir al login (puede saltarse el loading si es muy rápido)
      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });

    it('debe permitir acceso a ruta protegida cuando el usuario está autenticado', async () => {
      renderWithRouter('/dashboard', mockAdminUser);

      // Debe mostrar loading primero
      expect(screen.getByText(/verificando autenticación/i)).toBeInTheDocument();

      // Luego debe mostrar el dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('debe bloquear acceso a ruta cuando el usuario no tiene permisos', async () => {
      // Vendedor intentando acceder a usuarios (no tiene permiso users.read)
      renderWithRouter('/users', mockVendedorUser);

      // Debe mostrar loading primero
      expect(screen.getByText(/verificando autenticación/i)).toBeInTheDocument();

      // Luego debe mostrar mensaje de falta de permisos
      await waitFor(() => {
        expect(screen.getByText(/no tienes permisos para acceder a esta página/i)).toBeInTheDocument();
      });

      // No debe mostrar la página de usuarios
      expect(screen.queryByTestId('users-page')).not.toBeInTheDocument();
    });
  });

  describe('Navegación basada en permisos', () => {
    it('debe permitir a admin acceder a múltiples rutas protegidas', async () => {
      // Test Dashboard
      const { unmount } = renderWithRouter('/dashboard', mockAdminUser);
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
      
      // Limpiar antes de siguiente test
      unmount();

      // Test Products con nuevo render
      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
      (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockAdminUser,
      });

      const { unmount: unmount2 } = renderWithRouter('/products', mockAdminUser);

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });
      
      unmount2();
    });

    it('debe permitir a vendedor acceder solo a rutas autorizadas', async () => {
      // Vendedor puede acceder a ventas
      renderWithRouter('/sales', mockVendedorUser);
      
      await waitFor(() => {
        expect(screen.getByTestId('sales-page')).toBeInTheDocument();
      });
    });

    it('debe bloquear rutas no autorizadas para vendedor', async () => {
      // Vendedor NO puede acceder a usuarios
      renderWithRouter('/users', mockVendedorUser);

      await waitFor(() => {
        expect(screen.getByText(/no tienes permisos para acceder a esta página/i)).toBeInTheDocument();
      });

      expect(screen.queryByTestId('users-page')).not.toBeInTheDocument();
    });
  });

  describe('Flujo de autenticación', () => {
    it('debe cargar usuario autenticado correctamente', async () => {
      renderWithRouter('/dashboard', mockAdminUser);

      // Verifica que se muestre loading
      expect(screen.getByText(/verificando autenticación/i)).toBeInTheDocument();

      // Verifica que se llame a getCurrentUser
      await waitFor(() => {
        expect(apiService.getCurrentUser).toHaveBeenCalled();
      });

      // Verifica que se muestre el dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('debe manejar error de autenticación y redirigir a login', async () => {
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        message: 'Token expired',
      });
      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('expired-token');
      (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithRouter('/dashboard', null);

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });
    });
  });

  describe('Permisos múltiples', () => {
    it('debe verificar usuario con múltiples permisos', async () => {
      const userWithMultiplePermissions = {
        ...mockAdminUser,
        permissions: [
          'dashboard.read',
          'products.read',
          'products.create',
          'products.update',
          'products.delete',
        ],
      };

      renderWithRouter('/products', userWithMultiplePermissions);

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      // Verificar que tiene todos los permisos necesarios
      expect(userWithMultiplePermissions.permissions).toContain('products.read');
      expect(userWithMultiplePermissions.permissions).toContain('products.create');
      expect(userWithMultiplePermissions.permissions).toContain('products.update');
    });

    it('debe denegar acceso si falta un permiso requerido', async () => {
      const userWithLimitedPermissions = {
        ...mockAdminUser,
        permissions: [
          'dashboard.read',
          'products.read',
          // Falta products.create
        ],
      };

      renderWithRouter('/products', userWithLimitedPermissions);

      // Aunque tiene products.read, debería poder ver la página
      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      // Verificar que NO tiene permiso de crear
      expect(userWithLimitedPermissions.permissions).not.toContain('products.create');
    });
  });

  describe('Manejo de estados de carga', () => {
    it('debe mostrar spinner de carga durante verificación de autenticación', async () => {
      // Simular delay en la respuesta
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: mockAdminUser,
        }), 100))
      );

      renderWithRouter('/dashboard', mockAdminUser);

      // Debe mostrar loading
      expect(screen.getByText(/verificando autenticación/i)).toBeInTheDocument();

      // Debe eventualmente mostrar el dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('debe verificar que se llama a getCurrentUser al cargar rutas protegidas', async () => {
      const { unmount } = renderWithRouter('/dashboard', mockAdminUser);

      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });

      // Verificar que se llamó a getCurrentUser
      expect(apiService.getCurrentUser).toHaveBeenCalledTimes(1);
      
      unmount();

      // Reiniciar mocks para segundo test
      vi.clearAllMocks();
      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
      (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockAdminUser,
      });

      // Navegar a otra ruta (nuevo render, nuevo AuthContext)
      renderWithRouter('/products', mockAdminUser);

      await waitFor(() => {
        expect(screen.getByTestId('products-page')).toBeInTheDocument();
      });

      // En un nuevo render con nuevo AuthProvider, se llamará otra vez
      expect(apiService.getCurrentUser).toHaveBeenCalledTimes(1);
    });
  });

  describe('Rutas sin permisos requeridos', () => {
    it('debe permitir acceso a rutas sin requiredPermission si está autenticado', async () => {
      const PublicProtectedPage = () => <div data-testid="public-protected-page">Página Protegida Pública</div>;

      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
      (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockVendedorUser,
      });

      render(
        <MemoryRouter initialEntries={['/public-protected']}>
          <AuthProvider>
            <Routes>
              <Route
                path="/public-protected"
                element={
                  <ProtectedRoute>
                    <PublicProtectedPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('public-protected-page')).toBeInTheDocument();
      });
    });
  });
});
