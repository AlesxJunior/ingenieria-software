import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../__tests__/mocks/server';
import { mockUsers } from '../../../../__tests__/mocks/handlers';
import { AuthProvider, useAuth } from '../../../auth/context/AuthContext';
import { NotificationProvider } from '../../../../context/NotificationContext';
import { tokenUtils } from '../../../../utils/api';

// Solo necesitamos mockear tokenUtils (MSW maneja las llamadas HTTP)
vi.mock('../../../../utils/api', async () => {
  const actual = await vi.importActual('../../../../utils/api');
  return {
    ...actual,
    tokenUtils: {
      getAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
    },
  };
});

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
        {hasPermission('users.read').toString()}
      </div>
      <div data-testid="has-admin-permission">
        {hasPermission('dashboard.read').toString()}
      </div>
    </div>
  );
};

describe('Integration: Users Module → Auth Context', () => {
  const mockUser = {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    permissions: ['users.read', 'users.write', 'users.create', 'dashboard.read'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockUserWithoutPermissions = {
    ...mockUser,
    id: '2',
    username: 'viewer',
    email: 'viewer@example.com',
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

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'alexatech_token') return 'mock-token';
      if (key === 'alexatech_user') return JSON.stringify(mockUser);
      return null;
    });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {});
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
      expect(screen.getByTestId('user-email')).toHaveTextContent('admin@example.com');
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
      // Override MSW handler para devolver usuario sin permisos
      server.use(
        http.get('http://localhost:3001/api/auth/me', () => {
          return HttpResponse.json({
            success: true,
            data: mockUserWithoutPermissions,
          });
        })
      );

      renderWithProviders(<TestAuthComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('has-users-permission')).toHaveTextContent('false');
      });

      expect(screen.getByTestId('has-admin-permission')).toHaveTextContent('false');
    });
  });

  describe('Manejo de errores de autenticación', () => {
    it('debe manejar error al verificar usuario con el backend', async () => {
      // Override MSW handler para devolver error
      server.use(
        http.get('http://localhost:3001/api/auth/me', () => {
          return HttpResponse.json(
            {
              success: false,
              message: 'Unauthorized',
            },
            { status: 401 }
          );
        })
      );

      renderWithProviders(<TestAuthComponent />);

      // El contexto debe manejar el error gracefully
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });

    it('debe manejar error de red al verificar usuario', async () => {
      // Override MSW handler para simular error de red
      server.use(
        http.get('http://localhost:3001/api/auth/me', () => {
          return HttpResponse.error();
        })
      );

      renderWithProviders(<TestAuthComponent />);

      // El contexto debe manejar el error sin crashear
      await waitFor(() => {
        expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      });
    });
  });
});
