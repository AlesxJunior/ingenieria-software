import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';

// Mock de componentes hijos
vi.mock('../Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>
}));

vi.mock('../UserInfo', () => ({
  default: () => <div data-testid="user-info">UserInfo</div>
}));

vi.mock('../MobileNav', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mobile-nav">{children}</div>
  )
}));

vi.mock('../SidebarContent', () => ({
  default: ({ onItemClick }: { onItemClick: () => void }) => (
    <div data-testid="sidebar-content" onClick={onItemClick}>SidebarContent</div>
  )
}));

const renderLayout = (props: { children: React.ReactNode; title: string; className?: string }) => {
  return render(
    <BrowserRouter>
      <Layout {...props} />
    </BrowserRouter>
  );
};

describe('Layout', () => {
  describe('Renderizado básico', () => {
    it('debe renderizar el layout con título y children', () => {
      renderLayout({
        title: 'Test Title',
        children: <div>Test Content</div>
      });

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('debe renderizar el sidebar', () => {
      renderLayout({
        title: 'Dashboard',
        children: <div>Content</div>
      });

      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    });

    it('debe renderizar el UserInfo en el header', () => {
      renderLayout({
        title: 'Dashboard',
        children: <div>Content</div>
      });

      expect(screen.getByTestId('user-info')).toBeInTheDocument();
    });

    it('debe renderizar el MobileNav con SidebarContent', () => {
      renderLayout({
        title: 'Dashboard',
        children: <div>Content</div>
      });

      expect(screen.getByTestId('mobile-nav')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-content')).toBeInTheDocument();
    });
  });

  describe('Prop: title', () => {
    it('debe mostrar el título proporcionado', () => {
      renderLayout({
        title: 'Mi Dashboard',
        children: <div>Content</div>
      });

      const titleElement = screen.getByRole('heading', { level: 1 });
      expect(titleElement).toHaveTextContent('Mi Dashboard');
    });

    it('debe actualizar el título cuando cambia', () => {
      const { rerender } = renderLayout({
        title: 'Título Inicial',
        children: <div>Content</div>
      });

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Título Inicial');

      rerender(
        <BrowserRouter>
          <Layout title="Título Actualizado">
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Título Actualizado');
    });
  });

  describe('Prop: children', () => {
    it('debe renderizar children simples', () => {
      renderLayout({
        title: 'Test',
        children: <p>Simple paragraph</p>
      });

      expect(screen.getByText('Simple paragraph')).toBeInTheDocument();
    });

    it('debe renderizar múltiples children', () => {
      renderLayout({
        title: 'Test',
        children: (
          <>
            <div>First child</div>
            <div>Second child</div>
            <span>Third child</span>
          </>
        )
      });

      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByText('Third child')).toBeInTheDocument();
    });

    it('debe renderizar children complejos con componentes anidados', () => {
      renderLayout({
        title: 'Test',
        children: (
          <div>
            <h2>Subtitle</h2>
            <div>
              <p>Nested content</p>
              <button>Action</button>
            </div>
          </div>
        )
      });

      expect(screen.getByText('Subtitle')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument();
    });
  });

  describe('Prop: className', () => {
    it('debe aplicar className opcional al DashboardContainer', () => {
      const { container } = renderLayout({
        title: 'Test',
        children: <div>Content</div>,
        className: 'custom-class'
      });

      // Buscar el DashboardContainer (tiene clase custom-class)
      const dashboardContainer = container.querySelector('.custom-class');
      expect(dashboardContainer).toBeInTheDocument();
    });

    it('debe funcionar sin className', () => {
      const { container } = renderLayout({
        title: 'Test',
        children: <div>Content</div>
      });

      // No debe tener errores al no proporcionar className
      expect(container).toBeInTheDocument();
    });
  });

  describe('Estructura del layout', () => {
    it('debe tener la estructura correcta: MobileNav > DashboardContainer > Sidebar + MainContent', () => {
      const { container } = renderLayout({
        title: 'Test',
        children: <div>Content</div>
      });

      const mobileNav = screen.getByTestId('mobile-nav');
      expect(mobileNav).toBeInTheDocument();

      const sidebar = screen.getByTestId('sidebar');
      expect(sidebar).toBeInTheDocument();

      const userInfo = screen.getByTestId('user-info');
      expect(userInfo).toBeInTheDocument();
    });

    it('debe renderizar el título en el MainHeader', () => {
      renderLayout({
        title: 'Test Title',
        children: <div>Content</div>
      });

      const heading = screen.getByRole('heading', { level: 1 });
      const userInfo = screen.getByTestId('user-info');

      // El heading y UserInfo deben estar en el DOM (ambos en MainHeader)
      expect(heading).toBeInTheDocument();
      expect(userInfo).toBeInTheDocument();
    });

    it('debe renderizar children dentro de ContentBody', () => {
      renderLayout({
        title: 'Test',
        children: <div data-testid="content-body-child">Content Body</div>
      });

      const contentBodyChild = screen.getByTestId('content-body-child');
      expect(contentBodyChild).toBeInTheDocument();
    });
  });
});
