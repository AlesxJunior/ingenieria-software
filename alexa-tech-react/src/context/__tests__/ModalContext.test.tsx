import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { ModalProvider, useModal } from '../ModalContext';
import type { ReactNode } from 'react';

describe('ModalContext', () => {
  describe('useModal', () => {
    it('debe lanzar error cuando se usa fuera del ModalProvider', () => {
      // Suprimir console.error para este test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useModal());
      }).toThrow('useModal must be used within a ModalProvider');

      consoleSpy.mockRestore();
    });

    it('debe retornar el contexto cuando se usa dentro del ModalProvider', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      expect(result.current).toBeDefined();
      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.modalContent).toBeNull();
      expect(result.current.modalTitle).toBeUndefined();
      expect(result.current.modalSize).toBe('medium');
      expect(typeof result.current.openModal).toBe('function');
      expect(typeof result.current.closeModal).toBe('function');
    });
  });

  describe('Estado inicial', () => {
    it('debe iniciar con el modal cerrado', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.modalContent).toBeNull();
      expect(result.current.modalTitle).toBeUndefined();
      expect(result.current.modalSize).toBe('medium');
    });
  });

  describe('openModal', () => {
    it('debe abrir el modal con contenido simple', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      const content = 'Test content';

      act(() => {
        result.current.openModal(content);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toBe(content);
      expect(result.current.modalTitle).toBeUndefined();
      expect(result.current.modalSize).toBe('medium');
    });

    it('debe abrir el modal con contenido y título', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      const content = 'Test content';
      const title = 'Test Title';

      act(() => {
        result.current.openModal(content, title);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toBe(content);
      expect(result.current.modalTitle).toBe(title);
      expect(result.current.modalSize).toBe('medium');
    });

    it('debe abrir el modal con tamaño small', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal('Content', 'Title', 'small');
      });

      expect(result.current.modalSize).toBe('small');
    });

    it('debe abrir el modal con tamaño large', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal('Content', 'Title', 'large');
      });

      expect(result.current.modalSize).toBe('large');
    });

    it('debe abrir el modal con tamaño fullscreen', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal('Content', 'Title', 'fullscreen');
      });

      expect(result.current.modalSize).toBe('fullscreen');
    });

    it('debe poder abrir con contenido JSX', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      const jsxContent = <div>JSX Content</div>;

      act(() => {
        result.current.openModal(jsxContent, 'JSX Title');
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toEqual(jsxContent);
      expect(result.current.modalTitle).toBe('JSX Title');
    });

    it('debe sobrescribir el contenido anterior al abrir nuevamente', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      // Abrir primera vez
      act(() => {
        result.current.openModal('First content', 'First title', 'small');
      });

      expect(result.current.modalContent).toBe('First content');
      expect(result.current.modalTitle).toBe('First title');
      expect(result.current.modalSize).toBe('small');

      // Abrir segunda vez
      act(() => {
        result.current.openModal('Second content', 'Second title', 'large');
      });

      expect(result.current.modalContent).toBe('Second content');
      expect(result.current.modalTitle).toBe('Second title');
      expect(result.current.modalSize).toBe('large');
    });
  });

  describe('closeModal', () => {
    it('debe cerrar el modal y limpiar el estado', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      // Abrir el modal primero
      act(() => {
        result.current.openModal('Test content', 'Test title', 'large');
      });

      expect(result.current.isModalOpen).toBe(true);

      // Cerrar el modal
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isModalOpen).toBe(false);
      expect(result.current.modalContent).toBeNull();
      expect(result.current.modalTitle).toBeUndefined();
      expect(result.current.modalSize).toBe('medium');
    });

    it('debe ser seguro llamar closeModal cuando el modal ya está cerrado', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      expect(() => {
        act(() => {
          result.current.closeModal();
        });
      }).not.toThrow();

      expect(result.current.isModalOpen).toBe(false);
    });

    it('debe poder abrir el modal después de cerrarlo', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      // Abrir
      act(() => {
        result.current.openModal('Content 1', 'Title 1');
      });
      expect(result.current.isModalOpen).toBe(true);

      // Cerrar
      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isModalOpen).toBe(false);

      // Abrir nuevamente
      act(() => {
        result.current.openModal('Content 2', 'Title 2');
      });
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toBe('Content 2');
      expect(result.current.modalTitle).toBe('Title 2');
    });
  });

  describe('Flujo completo', () => {
    it('debe manejar múltiples aperturas y cierres', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      // Ciclo 1
      act(() => {
        result.current.openModal('Content 1', 'Title 1', 'small');
      });
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalSize).toBe('small');

      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isModalOpen).toBe(false);

      // Ciclo 2
      act(() => {
        result.current.openModal('Content 2', 'Title 2', 'large');
      });
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalSize).toBe('large');

      act(() => {
        result.current.closeModal();
      });
      expect(result.current.isModalOpen).toBe(false);

      // Ciclo 3
      act(() => {
        result.current.openModal('Content 3', undefined, 'fullscreen');
      });
      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalTitle).toBeUndefined();
      expect(result.current.modalSize).toBe('fullscreen');
    });

    it('debe compartir el estado entre múltiples llamadas al hook dentro del mismo provider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ModalProvider>{children}</ModalProvider>
      );

      // Renderizar ambos hooks en el MISMO render para que compartan el provider
      const { result } = renderHook(() => {
        const modal1 = useModal();
        const modal2 = useModal();
        return { modal1, modal2 };
      }, { wrapper });

      // Abrir desde el primer hook
      act(() => {
        result.current.modal1.openModal('Shared content', 'Shared title');
      });

      // Ambos hooks deben ver el mismo estado (mismo contexto)
      expect(result.current.modal1.isModalOpen).toBe(true);
      expect(result.current.modal2.isModalOpen).toBe(true);
      expect(result.current.modal1.modalContent).toBe('Shared content');
      expect(result.current.modal2.modalContent).toBe('Shared content');

      // Cerrar desde el segundo hook
      act(() => {
        result.current.modal2.closeModal();
      });

      // Ambos hooks deben ver el modal cerrado
      expect(result.current.modal1.isModalOpen).toBe(false);
      expect(result.current.modal2.isModalOpen).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('debe manejar contenido null', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal(null);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toBeNull();
    });

    it('debe manejar contenido undefined', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal(undefined);
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toBeUndefined();
    });

    it('debe manejar string vacío como contenido', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal('');
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalContent).toBe('');
    });

    it('debe manejar título vacío', () => {
      const { result } = renderHook(() => useModal(), {
        wrapper: ModalProvider
      });

      act(() => {
        result.current.openModal('Content', '');
      });

      expect(result.current.isModalOpen).toBe(true);
      expect(result.current.modalTitle).toBe('');
    });
  });
});
