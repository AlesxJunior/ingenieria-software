import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import * as apiModule from '../../../utils/api';
import type { ReactNode } from 'react';

// Mock del módulo completo
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
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthContext', () => {
  const { apiService, tokenUtils } = apiModule;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.mocked(tokenUtils.getAccessToken).mockReturnValue(null);
    vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(true);
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con usuario null cuando no hay token', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe cargar usuario si existe token válido', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        permissions: ['users:read'],
      };

      vi.mocked(tokenUtils.getAccessToken).mockReturnValue('valid-token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);
      vi.mocked(apiService.getCurrentUser).mockResolvedValue({
        success: true,
        data: mockUser,
        message: 'Success',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('debe limpiar tokens si están expirados', async () => {
      vi.mocked(tokenUtils.getAccessToken).mockReturnValue('expired-token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(true);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.user).toBeNull();
      expect(vi.mocked(tokenUtils.clearTokens)).toHaveBeenCalled();
    });
  });

  describe('Login', () => {
    it('debe hacer login exitoso', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        permissions: ['users:read'],
      };

      vi.mocked(apiService.login).mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
        message: 'Login successful',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let loginResult;
      await act(async () => {
        loginResult = await result.current.login('test@test.com', 'password123');
      });

      expect(loginResult).toBe(true);
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(vi.mocked(tokenUtils.setTokens)).toHaveBeenCalledWith('access-token', 'refresh-token');
    });

    it('debe manejar error de credenciales inválidas', async () => {
      vi.mocked(apiService.login).mockRejectedValue(new Error('Invalid credentials'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await expect(
        act(async () => {
          await result.current.login('test@test.com', 'wrong');
        })
      ).rejects.toThrow();

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('debe cambiar isLoading durante el proceso', async () => {
      vi.mocked(apiService.login).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: {
            user: { id: '1', username: 'test', email: 'test@test.com', firstName: 'T', lastName: 'U', isActive: true },
            accessToken: 'token',
            refreshToken: 'refresh',
          },
          message: 'OK',
        }), 100))
      );

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Esperar inicialización
      await waitFor(() => {
        return result.current !== null && result.current.isLoading === false;
      }, { timeout: 5000 });

      // Iniciar login sin await
      const loginPromise = result.current.login('test@test.com', 'pass');

      // Verificar que isLoading cambió a true
      await waitFor(() => expect(result.current.isLoading).toBe(true), { timeout: 200 });
      
      // Esperar a que termine
      await loginPromise;
      
      // Verificar que isLoading volvió a false
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('Logout', () => {
    it('debe hacer logout correctamente', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      };

      vi.mocked(tokenUtils.getAccessToken).mockReturnValue('token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);
      vi.mocked(apiService.getCurrentUser).mockResolvedValue({
        success: true,
        data: mockUser,
        message: 'Success',
      });
      vi.mocked(apiService.logout).mockResolvedValue({ success: true, message: 'Logged out' });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Primero esperar a que termine de cargar
      await waitFor(() => {
        return result.current !== null && result.current.isLoading === false;
      }, { timeout: 5000 });

      // Verificar que el usuario está autenticado
      expect(result.current.isAuthenticated).toBe(true);

      await act(async () => {
        await result.current!.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(vi.mocked(tokenUtils.clearTokens)).toHaveBeenCalled();
    });
  });

  describe('hasPermission', () => {
    it('debe verificar permisos correctamente', async () => {
      const mockUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
        permissions: ['users:read', 'users:write', 'products:read'],
      };

      vi.mocked(tokenUtils.getAccessToken).mockReturnValue('token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);
      vi.mocked(apiService.getCurrentUser).mockResolvedValue({
        success: true,
        data: mockUser,
        message: 'Success',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Esperar a que termine de cargar
      await waitFor(() => {
        return result.current !== null && result.current.isLoading === false;
      }, { timeout: 5000 });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.hasPermission('users:read')).toBe(true);
      expect(result.current.hasPermission('users:write')).toBe(true);
      expect(result.current.hasPermission('products:delete')).toBe(false);
    });

    it('debe retornar false sin usuario autenticado', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Esperar a que termine de cargar
      await waitFor(() => {
        return result.current !== null && result.current.isLoading === false;
      }, { timeout: 5000 });

      expect(result.current.hasPermission('users:read')).toBe(false);
    });
  });

  describe('updateUser', () => {
    it('debe actualizar usuario correctamente', async () => {
      const initialUser = {
        id: '1',
        username: 'testuser',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        isActive: true,
      };

      vi.mocked(tokenUtils.getAccessToken).mockReturnValue('token');
      vi.mocked(tokenUtils.isTokenExpired).mockReturnValue(false);
      vi.mocked(apiService.getCurrentUser).mockResolvedValue({
        success: true,
        data: initialUser,
        message: 'Success',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Esperar a que termine de cargar Y que el usuario esté cargado
      await waitFor(() => {
        return result.current !== null && 
               result.current.isLoading === false &&
               result.current.user !== null &&
               result.current.user.firstName === 'Test';
      }, { timeout: 5000 });

      expect(result.current.user?.firstName).toBe('Test');

      act(() => {
        result.current!.updateUser({ firstName: 'Updated', email: 'new@test.com' });
      });

      expect(result.current.user?.firstName).toBe('Updated');
      expect(result.current.user?.email).toBe('new@test.com');

      const stored = JSON.parse(localStorageMock.getItem('alexatech_user') || '{}');
      expect(stored.firstName).toBe('Updated');
    });
  });
});
