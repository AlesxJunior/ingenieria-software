import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UIProvider, useUI } from '../UIContext';
import type { ReactNode } from 'react';

describe('UIContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <UIProvider>{children}</UIProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con isLoading en false', () => {
      const { result } = renderHook(() => useUI(), { wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setIsLoading', () => {
    it('debe cambiar isLoading a true', () => {
      const { result } = renderHook(() => useUI(), { wrapper });

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('debe cambiar isLoading a false', () => {
      const { result } = renderHook(() => useUI(), { wrapper });

      // Primero lo ponemos en true
      act(() => {
        result.current.setIsLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      // Luego lo ponemos en false
      act(() => {
        result.current.setIsLoading(false);
      });
      expect(result.current.isLoading).toBe(false);
    });

    it('debe poder cambiar isLoading múltiples veces', () => {
      const { result } = renderHook(() => useUI(), { wrapper });

      act(() => {
        result.current.setIsLoading(true);
      });
      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.setIsLoading(false);
      });
      expect(result.current.isLoading).toBe(false);

      act(() => {
        result.current.setIsLoading(true);
      });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('Memoización', () => {
    it('debe memoizar el valor del contexto', () => {
      const { result, rerender } = renderHook(() => useUI(), { wrapper });

      const firstValue = result.current;
      rerender();
      const secondValue = result.current;

      // El objeto debe ser el mismo si isLoading no cambió
      expect(firstValue).toBe(secondValue);
    });

    it('debe actualizar el valor memoizado cuando isLoading cambia', () => {
      const { result } = renderHook(() => useUI(), { wrapper });

      const firstValue = result.current;

      act(() => {
        result.current.setIsLoading(true);
      });

      const secondValue = result.current;

      // El objeto debe ser diferente porque isLoading cambió
      expect(firstValue).not.toBe(secondValue);
      expect(firstValue.isLoading).toBe(false);
      expect(secondValue.isLoading).toBe(true);
    });
  });

  describe('useUI hook', () => {
    it('debe lanzar error si se usa fuera del provider', () => {
      expect(() => {
        renderHook(() => useUI());
      }).toThrow('useUI must be used within a UIProvider');
    });
  });
});
