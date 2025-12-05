/**
 * Component Tests - PurchaseOrderList
 * Tests de componente para lista de Órdenes de Compra
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PurchaseOrderList } from '../PurchaseOrderList';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import type { PurchaseOrder } from '../../types/purchases.types';

// Mock del servicio
vi.mock('../../services/purchaseOrderService');

// Mock del contexto de notificaciones
vi.mock('../../../context/NotificationContext', () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
}));

describe('PurchaseOrderList', () => {
  const mockOrders: PurchaseOrder[] = [
    {
      id: 'po-1',
      codigo: 'OC-2025-001',
      fecha: '2025-12-01T00:00:00.000Z',
      proveedorId: 'prov-1',
      proveedor: {
        id: 'prov-1',
        numeroDocumento: '12345678901',
        nombres: 'Proveedor Test',
        email: 'test@proveedor.com',
      },
      almacenDestinoId: 'alm-1',
      almacenDestino: {
        id: 'alm-1',
        codigo: 'ALM-001',
        nombre: 'Almacén Principal',
      },
      estado: 'PENDIENTE',
      subtotal: 100,
      descuento: 0,
      impuestos: 18,
      total: 118,
      creadoPorId: 'user-1',
      items: [],
      createdAt: '2025-12-01T00:00:00.000Z',
      updatedAt: '2025-12-01T00:00:00.000Z',
    },
    {
      id: 'po-2',
      codigo: 'OC-2025-002',
      fecha: '2025-12-02T00:00:00.000Z',
      proveedorId: 'prov-2',
      proveedor: {
        id: 'prov-2',
        numeroDocumento: '98765432109',
        nombres: 'Otro Proveedor',
        email: 'otro@proveedor.com',
      },
      almacenDestinoId: 'alm-1',
      estado: 'ENVIADA',
      subtotal: 200,
      descuento: 10,
      impuestos: 36,
      total: 226,
      creadoPorId: 'user-1',
      items: [],
      createdAt: '2025-12-02T00:00:00.000Z',
      updatedAt: '2025-12-02T00:00:00.000Z',
    },
  ];

  const mockProps = {
    onEdit: vi.fn(),
    onView: vi.fn(),
    onDelete: vi.fn(),
    onRefresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de getPurchaseOrders
    vi.mocked(purchaseOrderService.getPurchaseOrders).mockResolvedValue({
      success: true,
      data: mockOrders,
      pagination: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  // ==================== RENDERIZADO ====================

  describe('Renderizado inicial', () => {
    it('debe renderizar el componente correctamente', async () => {
      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      expect(screen.getByText('OC-2025-002')).toBeInTheDocument();
      expect(screen.getByText('Proveedor Test')).toBeInTheDocument();
      expect(screen.getByText('Otro Proveedor')).toBeInTheDocument();
    });

    it('debe mostrar estado de carga inicial', () => {
      render(<PurchaseOrderList {...mockProps} />);

      expect(screen.getByText(/cargando/i)).toBeInTheDocument();
    });

    it('debe mostrar mensaje cuando no hay órdenes', async () => {
      vi.mocked(purchaseOrderService.getPurchaseOrders).mockResolvedValue({
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      });

      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/no se encontraron órdenes/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== FILTROS ====================

  describe('Filtros', () => {
    it('debe filtrar por estado', async () => {
      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const filtroEnviada = screen.getByRole('button', { name: /enviada/i });
      fireEvent.click(filtroEnviada);

      await waitFor(() => {
        expect(purchaseOrderService.getPurchaseOrders).toHaveBeenCalledWith(
          expect.objectContaining({ estado: 'ENVIADA' })
        );
      });
    });

    it('debe buscar por código o proveedor', async () => {
      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/buscar/i);
      fireEvent.change(searchInput, { target: { value: 'OC-2025-001' } });

      await waitFor(() => {
        expect(purchaseOrderService.getPurchaseOrders).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'OC-2025-001' })
        );
      }, { timeout: 600 });
    });
  });

  // ==================== ACCIONES ====================

  describe('Acciones de orden', () => {
    it('debe llamar a onView al hacer clic en ver', async () => {
      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const viewButtons = screen.getAllByRole('button', { name: /ver/i });
      fireEvent.click(viewButtons[0]);

      expect(mockProps.onView).toHaveBeenCalledWith(mockOrders[0]);
    });

    it('debe llamar a onEdit al hacer clic en editar', async () => {
      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      fireEvent.click(editButtons[0]);

      expect(mockProps.onEdit).toHaveBeenCalledWith(mockOrders[0]);
    });

    it('debe eliminar orden con confirmación', async () => {
      // Mock de window.confirm
      global.confirm = vi.fn(() => true);

      vi.mocked(purchaseOrderService.deletePurchaseOrder).mockResolvedValue({
        success: true,
        data: undefined,
        message: 'Eliminado',
      });

      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButtons[0]);

      expect(global.confirm).toHaveBeenCalledWith(
        expect.stringContaining('eliminar')
      );

      await waitFor(() => {
        expect(purchaseOrderService.deletePurchaseOrder).toHaveBeenCalledWith('po-1');
      });
    });

    it('debe cancelar eliminación si no se confirma', async () => {
      global.confirm = vi.fn(() => false);

      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButtons[0]);

      expect(purchaseOrderService.deletePurchaseOrder).not.toHaveBeenCalled();
    });
  });

  // ==================== PAGINACIÓN ====================

  describe('Paginación', () => {
    it('debe cambiar de página correctamente', async () => {
      vi.mocked(purchaseOrderService.getPurchaseOrders).mockResolvedValue({
        success: true,
        data: mockOrders,
        pagination: {
          total: 25,
          page: 1,
          limit: 10,
          totalPages: 3,
        },
      });

      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /siguiente/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(purchaseOrderService.getPurchaseOrders).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        );
      });
    });
  });

  // ==================== MANEJO DE ERRORES ====================

  describe('Manejo de errores', () => {
    it('debe mostrar mensaje de error al fallar carga', async () => {
      vi.mocked(purchaseOrderService.getPurchaseOrders).mockRejectedValue(
        new Error('Error de red')
      );

      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });

    it('debe manejar error al eliminar', async () => {
      global.confirm = vi.fn(() => true);

      vi.mocked(purchaseOrderService.deletePurchaseOrder).mockRejectedValue(
        new Error('No se puede eliminar')
      );

      render(<PurchaseOrderList {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(purchaseOrderService.deletePurchaseOrder).toHaveBeenCalled();
      });
    });
  });
});
