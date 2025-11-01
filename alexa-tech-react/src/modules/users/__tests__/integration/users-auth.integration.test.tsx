import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../../auth/context/AuthContext';
import { NotificationProvider } from '../../../../context/NotificationContext';
import { apiService, tokenUtils } from '../../../../utils/api';

// Mock de los servicios necesarios
vi.mock('../../../../utils/api', () => ({
  apiService: {
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
  tokenUtils: {
    getAccessToken: vi.fn(),
    isTokenExpired: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

// Componente de prueba que consume AuthContext
const TestAuthComponent = () => {
  const { isAuthenticated, user, hasPermission } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      {user && (
        <div data-testid="user-info">
          <div data-testid="user-name">{user.firstName} {user.lastName}</div>
          <div data-testid="user-email">{user.email}</div>
          <div data-testid="user-active">{user.isActive ? 'Active' : 'Inactive'}</div>
        </div>
      )}
      <div data-testid="has-users-permission">
        {hasPermission('users:read').toString()}
      </div>
      <div data-testid="has-admin-permission">
        {hasPermission('admin:access').toString()}
      </div>
    </div>
  );
};

describe('Integration: Users Module → Auth Context', () => {
  const mockUser = {
    id: '1',
    username: 'admin',
    email: 'admin@test.com',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    permissions: ['users:read', 'users:write', 'admin:access'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUserWithoutPermissions = {
    ...mockUser,
    id: '2',
    username: 'viewer',
    email: 'viewer@test.com',
    firstName: 'Viewer',
    lastName: 'User',
    permissions: [],
  };

  beforeEach(() => {
    // Mock tokenUtils
    (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue('mock-token');
    (tokenUtils.isTokenExpired as ReturnType<typeof vi.fn>).mockReturnValue(false);
    (tokenUtils.setTokens as ReturnType<typeof vi.fn>).mockImplementation(() => {});
    (tokenUtils.clearTokens as ReturnType<typeof vi.fn>).mockImplementation(() => {});
    
    // Mock apiService
    (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockUser,
    });
    
    (apiService.login as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      },
    });
    
    (apiService.logout as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'alexatech_token') return 'mock-token';
      if (key === 'alexatech_user') return JSON.stringify(mockUser);
      return null;
    });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});

    // Mock fetch (por si acaso)
    global.fetch = vi.fn((url) => {
      if (typeof url === 'string' && url.includes('/api/auth/me')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockUser),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <NotificationProvider>
          <AuthProvider>
            {component}
          </AuthProvider>
        </NotificationProvider>
      </BrowserRouter>
    );
  };

  describe('Flujo de autenticación básico', () => {
    it('debe cargar el usuario autenticado desde localStorage', async () => {
      renderWithProviders(<TestAuthComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@test.com');
      expect(screen.getByTestId('user-active')).toHaveTextContent('Active');
    });

    it('debe indicar que no está autenticado si no hay token', async () => {
      (tokenUtils.getAccessToken as ReturnType<typeof vi.fn>).mockReturnValue(null);

      renderWithProviders(<TestAuthComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });
  });

  describe('Verificación de permisos', () => {
    it('debe verificar correctamente los permisos del usuario', async () => {
      renderWithProviders(<TestAuthComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('has-users-permission')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('has-admin-permission')).toHaveTextContent('true');
    });

    it('debe retornar false para permisos que el usuario no tiene', async () => {
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: true,
        data: mockUserWithoutPermissions,
      });

      renderWithProviders(<TestAuthComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('has-users-permission')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('has-admin-permission')).toHaveTextContent('false');
    });
  });

  describe('Manejo de errores de autenticación', () => {
    it('debe manejar error al verificar usuario con el backend', async () => {
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        message: 'Unauthorized',
      });

      renderWithProviders(<TestAuthComponent />);

      // El contexto debe manejar el error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });

    it('debe manejar error de red al verificar usuario', async () => {
      (apiService.getCurrentUser as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      renderWithProviders(<TestAuthComponent />);

      // El contexto debe manejar el error sin crashear
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });
  });
});
