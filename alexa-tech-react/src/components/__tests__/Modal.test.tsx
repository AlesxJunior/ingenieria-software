import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

describe('Modal', () => {
  beforeEach(() => {
    // Limpiar estilos del body antes de cada test
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Restaurar estilos del body después de cada test
    document.body.style.overflow = 'unset';
  });

  describe('Renderizado básico', () => {
    it('no debe renderizar nada cuando isOpen es false', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(container.firstChild).toBeNull();
    });

    it('debe renderizar el modal cuando isOpen es true', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Modal Content</p>
        </Modal>
      );

      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('debe renderizar el título cuando se proporciona', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('no debe renderizar el header cuando no se proporciona título', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      // El botón de cerrar solo aparece cuando hay título (en el header)
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('debe renderizar el botón de cerrar cuando hay título', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test">
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Prop: onClose', () => {
    it('debe llamar onClose cuando se hace clic en el botón de cerrar', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button');
      await userEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onClose al presionar la tecla Escape', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(handleClose).toHaveBeenCalledTimes(1);
      });
    });

    it('debe llamar onClose al hacer clic en el overlay (por defecto)', async () => {
      const handleClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      // Hacer clic en el overlay (primer hijo del container)
      const overlay = container.firstChild as HTMLElement;
      await userEvent.click(overlay);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('NO debe llamar onClose al hacer clic en el contenido del modal', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      const content = screen.getByText('Content');
      await userEvent.click(content);

      expect(handleClose).not.toHaveBeenCalled();
    });

    it('NO debe llamar onClose al hacer clic en el overlay cuando closeOnOverlayClick es false', async () => {
      const handleClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
          <p>Content</p>
        </Modal>
      );

      const overlay = container.firstChild as HTMLElement;
      await userEvent.click(overlay);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });

  describe('Prop: size', () => {
    it('debe aplicar el tamaño "medium" por defecto', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      // El ModalContainer debe estar presente
      expect(container.querySelector('div > div')).toBeInTheDocument();
    });

    it('debe aplicar el tamaño "small" cuando se especifica', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="small">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('debe aplicar el tamaño "large" cuando se especifica', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="large">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('debe aplicar el tamaño "fullscreen" cuando se especifica', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} size="fullscreen">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Body scroll lock', () => {
    it('debe prevenir el scroll del body cuando el modal está abierto', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('debe restaurar el scroll del body cuando el modal se cierra', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('unset');
    });

    it('debe limpiar el scroll lock cuando el componente se desmonta', () => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Event listeners', () => {
    it('debe agregar el event listener de Escape al abrir el modal', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      addEventListenerSpy.mockRestore();
    });

    it('debe remover el event listener de Escape al cerrar el modal', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it('NO debe llamar onClose con otras teclas que no sean Escape', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
      fireEvent.keyDown(document, { key: 'Space', code: 'Space' });
      fireEvent.keyDown(document, { key: 'Tab', code: 'Tab' });

      await waitFor(() => {
        expect(handleClose).not.toHaveBeenCalled();
      });
    });
  });

  describe('Children rendering', () => {
    it('debe renderizar children simples', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Simple child</div>
        </Modal>
      );

      expect(screen.getByText('Simple child')).toBeInTheDocument();
    });

    it('debe renderizar múltiples children', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>First</div>
          <div>Second</div>
          <button>Third</button>
        </Modal>
      );

      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /third/i })).toBeInTheDocument();
    });

    it('debe renderizar children complejos con formularios', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Form Modal">
          <form>
            <input type="text" placeholder="Name" />
            <textarea placeholder="Description" />
            <button type="submit">Submit</button>
          </form>
        </Modal>
      );

      expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Description')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });
});
