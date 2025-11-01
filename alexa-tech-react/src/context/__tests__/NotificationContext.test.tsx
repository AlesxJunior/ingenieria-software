import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NotificationProvider, useNotification } from '../NotificationContext';
import type { ReactNode } from 'react';

describe('NotificationContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <NotificationProvider>{children}</NotificationProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con array vacío de notificaciones', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      expect(result.current.notifications).toEqual([]);
    });
  });

  describe('showNotification', () => {
    it('debe agregar una notificación', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('success', 'Test', 'Test message', 5000);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[0].title).toBe('Test');
      expect(result.current.notifications[0].message).toBe('Test message');
      expect(result.current.notifications[0].duration).toBe(5000);
    });

    it('debe generar un ID único para cada notificación', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('info', 'First', 'Message 1');
        result.current.showNotification('info', 'Second', 'Message 2');
      });

      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0].id).toBeDefined();
      expect(result.current.notifications[1].id).toBeDefined();
      expect(result.current.notifications[0].id).not.toBe(result.current.notifications[1].id);
    });

    it('debe auto-remover la notificación después de la duración', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('info', 'Auto-remove', 'Will disappear', 3000);
      });

      expect(result.current.notifications).toHaveLength(1);

      // Avanzar el tiempo 3 segundos
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('no debe auto-remover si duration es 0', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('warning', 'Persistent', 'Will stay', 0);
      });

      expect(result.current.notifications).toHaveLength(1);

      // Avanzar el tiempo mucho
      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // La notificación debe seguir ahí
      expect(result.current.notifications).toHaveLength(1);
    });

    it('debe usar 5000ms como duración por defecto', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('info', 'Default', 'Default duration');
      });

      expect(result.current.notifications[0].duration).toBe(5000);

      // No debe removerse antes de 5 segundos
      act(() => {
        vi.advanceTimersByTime(4999);
      });
      expect(result.current.notifications).toHaveLength(1);

      // Debe removerse después de 5 segundos
      act(() => {
        vi.advanceTimersByTime(1);
      });
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('showSuccess', () => {
    it('debe mostrar notificación de éxito', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showSuccess('Operation successful');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('success');
      expect(result.current.notifications[0].title).toBe('Éxito');
      expect(result.current.notifications[0].message).toBe('Operation successful');
    });

    it('debe aceptar duración personalizada', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showSuccess('Quick message', 2000);
      });

      expect(result.current.notifications[0].duration).toBe(2000);
    });
  });

  describe('showError', () => {
    it('debe mostrar notificación de error', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showError('Something went wrong');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('error');
      expect(result.current.notifications[0].title).toBe('Error');
      expect(result.current.notifications[0].message).toBe('Something went wrong');
    });
  });

  describe('showWarning', () => {
    it('debe mostrar notificación de advertencia', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showWarning('Please be careful');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('warning');
      expect(result.current.notifications[0].title).toBe('Advertencia');
      expect(result.current.notifications[0].message).toBe('Please be careful');
    });
  });

  describe('showInfo', () => {
    it('debe mostrar notificación informativa', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showInfo('For your information');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('info');
      expect(result.current.notifications[0].title).toBe('Información');
      expect(result.current.notifications[0].message).toBe('For your information');
    });
  });

  describe('addNotification (alias)', () => {
    it('debe funcionar como alias de showNotification', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.addNotification('info', 'Alias Test', 'Testing alias');
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].type).toBe('info');
      expect(result.current.notifications[0].title).toBe('Alias Test');
    });
  });

  describe('removeNotification', () => {
    it('debe remover una notificación específica por ID', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('info', 'First', 'Message 1', 0);
        result.current.showNotification('info', 'Second', 'Message 2', 0);
      });

      expect(result.current.notifications).toHaveLength(2);
      const firstId = result.current.notifications[0].id;

      act(() => {
        result.current.removeNotification(firstId);
      });

      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Second');
    });

    it('no debe hacer nada si el ID no existe', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('info', 'Test', 'Message', 0);
      });

      expect(result.current.notifications).toHaveLength(1);

      act(() => {
        result.current.removeNotification('non-existent-id');
      });

      expect(result.current.notifications).toHaveLength(1);
    });
  });

  describe('clearAllNotifications', () => {
    it('debe limpiar todas las notificaciones', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('success', 'First', 'Message 1', 0);
        result.current.showNotification('error', 'Second', 'Message 2', 0);
        result.current.showNotification('warning', 'Third', 'Message 3', 0);
      });

      expect(result.current.notifications).toHaveLength(3);

      act(() => {
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });

    it('no debe causar error si ya está vacío', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      expect(result.current.notifications).toHaveLength(0);

      act(() => {
        result.current.clearAllNotifications();
      });

      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('Múltiples notificaciones', () => {
    it('debe manejar múltiples notificaciones con diferentes duraciones', () => {
      const { result } = renderHook(() => useNotification(), { wrapper });

      act(() => {
        result.current.showNotification('info', 'Short', 'Expires at 1s', 1000);
        result.current.showNotification('info', 'Medium', 'Expires at 3s', 3000);
        result.current.showNotification('info', 'Long', 'Expires at 5s', 5000);
      });

      expect(result.current.notifications).toHaveLength(3);

      // Después de 1 segundo
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(2);
      expect(result.current.notifications[0].title).toBe('Medium');

      // Después de 3 segundos (total 4s)
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.notifications).toHaveLength(1);
      expect(result.current.notifications[0].title).toBe('Long');

      // Después de 1 segundo más (total 5s)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('useNotification hook', () => {
    it('debe lanzar error si se usa fuera del provider', () => {
      expect(() => {
        renderHook(() => useNotification());
      }).toThrow('useNotification must be used within a NotificationProvider');
    });
  });
});
