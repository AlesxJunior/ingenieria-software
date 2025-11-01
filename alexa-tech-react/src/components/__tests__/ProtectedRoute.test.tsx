import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import * as useAuthModule from '../../hooks/useAuth';

// Mock del hook useAuth
const mockUseAuth = vi.spyOn(useAuthModule, 'useAuth');

const TestComponent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;

const renderProtectedRoute = (
  props: Partial<React.ComponentProps<typeof ProtectedRoute>> = {},
  initialPath = '/'
) => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute {...props}>
              <TestComponent />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Limpiar el bypass de pruebas
    if (typeof window !== 'undefined') {
      (window as any).__PW_TEST__ = undefined;
    }
  });

  describe('Estados de autenticación', () => {
    it('debe mostrar loading mientras se verifica la autenticación', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        hasPermission: vi.fn(),
        user: null,
        login: vi.fn(),
        logout: vi.fn(),
        updateUser: vi.fn()
      });

      renderProtectedRoute();

      expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
    });

    it('debe redirigir a login si no está autenticado', async () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        hasPermission: vi.fn(),
        user: null,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute();

      await waitFor(() => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });

    it('debe renderizar children cuando está autenticado', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission: vi.fn(() => true),
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute();

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Permisos: requiredPermission', () => {
    it('debe renderizar children cuando el usuario tiene el permiso requerido', () => {
      const hasPermission = vi.fn((permission: string) => permission === 'view:dashboard');
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission,
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ requiredPermission: 'view:dashboard' });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(hasPermission).toHaveBeenCalledWith('view:dashboard');
    });

    it('debe mostrar mensaje de error cuando el usuario NO tiene el permiso requerido', () => {
      const hasPermission = vi.fn(() => false);
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission,
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ requiredPermission: 'admin:access' });

      expect(screen.getByText('No tienes permisos para acceder a esta página.')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('debe verificar el permiso específico proporcionado', () => {
      const hasPermission = vi.fn((permission: string) => permission === 'edit:products');
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission,
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ requiredPermission: 'edit:products' });

      expect(hasPermission).toHaveBeenCalledWith('edit:products');
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Permisos: requiredPermissions (múltiples)', () => {
    it('debe renderizar children cuando el usuario tiene TODOS los permisos requeridos', () => {
      const hasPermission = vi.fn((permission: string) => 
        ['view:dashboard', 'edit:products', 'delete:products'].includes(permission)
      );
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission,
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ 
        requiredPermissions: ['view:dashboard', 'edit:products', 'delete:products'] 
      });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(hasPermission).toHaveBeenCalledWith('view:dashboard');
      expect(hasPermission).toHaveBeenCalledWith('edit:products');
      expect(hasPermission).toHaveBeenCalledWith('delete:products');
    });

    it('debe mostrar error cuando falta al menos uno de los permisos requeridos', () => {
      const hasPermission = vi.fn((permission: string) => 
        ['view:dashboard', 'edit:products'].includes(permission)
      );
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission,
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ 
        requiredPermissions: ['view:dashboard', 'edit:products', 'delete:products'] 
      });

      expect(screen.getByText('No tienes permisos para acceder a esta página.')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('debe funcionar con array vacío de permisos (sin restricciones)', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission: vi.fn(() => true),
        user: { id: '1', nombre: 'Test User', email: 'test@example.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ requiredPermissions: [] });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('Bypass de autenticación (Playwright)', () => {
    it('debe renderizar children directamente cuando __PW_TEST__ es true', () => {
      // No importa el estado de autenticación
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        hasPermission: vi.fn(() => false),
        user: null,
        login: vi.fn(),
        logout: vi.fn()
      });

      // Activar bypass de pruebas
      (window as any).__PW_TEST__ = true;

      renderProtectedRoute({ requiredPermission: 'admin:access' });

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('NO debe aplicar bypass cuando __PW_TEST__ es false', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        hasPermission: vi.fn(),
        user: null,
        login: vi.fn(),
        logout: vi.fn()
      });

      (window as any).__PW_TEST__ = false;

      renderProtectedRoute();

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Renderizado de children', () => {
    it('debe renderizar children simples', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission: vi.fn(() => true),
        user: { id: '1', nombre: 'Test', email: 'test@test.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>Simple Child</div>
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Simple Child')).toBeInTheDocument();
    });

    it('debe renderizar children complejos con múltiples elementos', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission: vi.fn(() => true),
        user: { id: '1', nombre: 'Test', email: 'test@test.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      render(
        <BrowserRouter>
          <ProtectedRoute>
            <div>
              <h1>Title</h1>
              <p>Description</p>
              <button>Action</button>
            </div>
          </ProtectedRoute>
        </BrowserRouter>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });

  describe('Estados edge cases', () => {
    it('debe priorizar isLoading sobre otros estados', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: true, // Loading tiene prioridad
        hasPermission: vi.fn(() => true),
        user: { id: '1', nombre: 'Test', email: 'test@test.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute();

      // Aunque esté autenticado, debe mostrar loading
      expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('debe verificar permisos solo cuando está autenticado y no está cargando', () => {
      const hasPermission = vi.fn(() => false);
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission,
        user: { id: '1', nombre: 'Test', email: 'test@test.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute({ requiredPermission: 'admin:access' });

      expect(hasPermission).toHaveBeenCalledWith('admin:access');
      expect(screen.getByText('No tienes permisos para acceder a esta página.')).toBeInTheDocument();
    });

    it('debe renderizar sin problemas cuando no hay permisos requeridos', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        hasPermission: vi.fn(() => true),
        user: { id: '1', nombre: 'Test', email: 'test@test.com' } as any,
        login: vi.fn(),
        logout: vi.fn()
      });

      renderProtectedRoute(); // Sin requiredPermission ni requiredPermissions

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });
});
