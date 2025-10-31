import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as apiModule from '../../../utils/api';
import type { ReactNode } from 'react';

// Mock del apiService
vi.mock('../../../utils/api', () => ({
  apiService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  tokenUtils: {
    getAccessToken: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    isTokenExpired: vi.fn(),
  },
}));

// Mock de localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('AuthContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con usuario null y isAuthenticated false', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe cargar usuario desde localStorage si existe', () => {
      const mockUser = {
        id: '1',
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'ADMIN' as const,
        permisos: ['users:read', 'users:write'],
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Login', () => {
    it('debe hacer login exitoso y guardar usuario', async () => {
      const mockUser = {
        id: '1',
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'ADMIN' as const,
        permisos: ['users:read'],
      };

      const mockResponse = {
        data: {
          success: true,
          user: mockUser,
          token: 'fake-token',
        },
      };

      vi.mocked(apiService.post).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('test@test.com', 'password123');
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorageMock.getItem('user')).toBeTruthy();
    });

    it('debe manejar error en login', async () => {
      vi.mocked(apiService.post).mockRejectedValueOnce(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@test.com', 'wrong-password')
      ).rejects.toThrow();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe actualizar isLoading durante login', async () => {
      const mockResponse = {
        data: {
          success: true,
          user: { id: '1', nombre: 'Test', email: 'test@test.com', rol: 'ADMIN' as const },
          token: 'token',
        },
      };

      vi.mocked(apiService.post).mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockResponse), 100);
          })
      );

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isLoading).toBe(false);

      const loginPromise = act(async () => {
        await result.current.login('test@test.com', 'password');
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      await loginPromise;

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Logout', () => {
    it('debe hacer logout y limpiar usuario', async () => {
      const mockUser = {
        id: '1',
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'ADMIN' as const,
        permisos: ['users:read'],
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorageMock.getItem('user')).toBeNull();
    });

    it('debe manejar logout sin usuario autenticado', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('debe retornar true si el usuario tiene el permiso', () => {
      const mockUser = {
        id: '1',
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'ADMIN' as const,
        permisos: ['users:read', 'users:write', 'products:read'],
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:write')).toBe(true);
      expect(result.current.hasPermission('products:read')).toBe(true);
    });

    it('debe retornar false si el usuario no tiene el permiso', () => {
      const mockUser = {
        id: '1',
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'VENDEDOR' as const,
        permisos: ['sales:read', 'sales:write'],
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasPermission('users:write')).toBe(false);
      expect(result.current.hasPermission('products:delete')).toBe(false);
    });

    it('debe retornar false si no hay usuario autenticado', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.hasPermission('users:read')).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('debe retornar true si el rol es ADMIN', () => {
      const mockUser = {
        id: '1',
        nombre: 'Admin User',
        email: 'admin@test.com',
        rol: 'ADMIN' as const,
        permisos: [],
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAdmin()).toBe(true);
    });

    it('debe retornar false si el rol no es ADMIN', () => {
      const mockUser = {
        id: '1',
        nombre: 'Regular User',
        email: 'user@test.com',
        rol: 'VENDEDOR' as const,
        permisos: [],
      };

      localStorageMock.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAdmin()).toBe(false);
    });

    it('debe retornar false si no hay usuario', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.isAdmin()).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('debe actualizar el usuario en el contexto y localStorage', async () => {
      const initialUser = {
        id: '1',
        nombre: 'Test User',
        email: 'test@test.com',
        rol: 'ADMIN' as const,
        permisos: ['users:read'],
      };

      const updatedUser = {
        ...initialUser,
        nombre: 'Updated Name',
        email: 'updated@test.com',
      };

      localStorageMock.setItem('user', JSON.stringify(initialUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user?.nombre).toBe('Test User');

      act(() => {
        result.current.updateUser(updatedUser);
      });

      expect(result.current.user?.nombre).toBe('Updated Name');
      expect(result.current.user?.email).toBe('updated@test.com');

      const storedUser = JSON.parse(localStorageMock.getItem('user') || '{}');
      expect(storedUser.nombre).toBe('Updated Name');
    });
  });

  describe('Casos Edge', () => {
    it('debe manejar localStorage corrupto', () => {
      localStorageMock.setItem('user', 'invalid-json');

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe manejar respuesta de login sin usuario', async () => {
      const mockResponse = {
        data: {
          success: false,
          message: 'Invalid credentials',
        },
      };

      vi.mocked(apiService.post).mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        result.current.login('test@test.com', 'password')
      ).rejects.toThrow();
    });
  });
});
