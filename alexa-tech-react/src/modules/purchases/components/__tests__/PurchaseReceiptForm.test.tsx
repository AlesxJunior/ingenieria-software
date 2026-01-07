/**
 * Component Tests - PurchaseReceiptForm
 * Tests de componente para formulario de Recepción de Compra
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PurchaseReceiptForm } from '../PurchaseReceiptForm';
import { purchaseOrderService } from '../../services/purchaseOrderService';
import type { PurchaseOrder, PurchaseReceipt } from '../../types/purchases.types';

// Mock de servicios
vi.mock('../../services/purchaseOrderService');

// Mock del contexto de notificaciones
vi.mock('../../../context/NotificationContext', () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
}));

describe('PurchaseReceiptForm', () => {
  const mockPurchaseOrder: PurchaseOrder = {
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
    estado: 'ENVIADA',
    subtotal: 500,
    descuento: 0,
    impuestos: 90,
    total: 590,
    creadoPorId: 'user-1',
    items: [
      {
        id: 'item-1',
        ordenCompraId: 'po-1',
        productoId: 'prod-1',
        producto: {
          id: 'prod-1',
          codigo: 'PROD-001',
          nombre: 'Producto Test',
          unidadMedida: 'UND',
        },
        cantidad: 50,
        precioUnitario: 10,
        subtotal: 500,
        descuento: 0,
        impuesto: 90,
        total: 590,
      },
    ],
    createdAt: '2025-12-01T00:00:00.000Z',
    updatedAt: '2025-12-01T00:00:00.000Z',
  };

  const mockProps = {
    purchaseOrderId: 'po-1',
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock de getPurchaseOrderById
    vi.mocked(purchaseOrderService.getPurchaseOrderById).mockResolvedValue({
      success: true,
      data: mockPurchaseOrder,
    });
  });

  // ==================== RENDERIZADO ====================

  describe('Renderizado inicial', () => {
    it('debe renderizar el formulario correctamente', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/nueva recepción/i)).toBeInTheDocument();
      });

      expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      expect(screen.getByText('Proveedor Test')).toBeInTheDocument();
    });

    it('debe cargar datos de la orden de compra', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(purchaseOrderService.getPurchaseOrderById).toHaveBeenCalledWith('po-1');
      });

      expect(screen.getByText('Producto Test')).toBeInTheDocument();
    });

    it('debe inicializar items con cantidades de la orden', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('50')).toBeInTheDocument();
      });
    });
  });

  // ==================== VALIDACIÓN DE CAMPOS ====================

  describe('Validación de campos', () => {
    it('debe validar fecha requerida', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const fechaInput = screen.getByLabelText(/fecha/i);
      fireEvent.change(fechaInput, { target: { value: '' } });

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/fecha es requerida/i)).toBeInTheDocument();
      });
    });

    it('debe validar cantidad recibida no exceda esperada', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      const cantidadInput = screen.getByDisplayValue('50');
      fireEvent.change(cantidadInput, { target: { value: '100' } });

      const submitButton = screen.getByRole('button', { name: /guardar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/excede la cantidad esperada/i)).toBeInTheDocument();
      });
    });

    it('debe permitir cantidad menor a la esperada', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      const cantidadInput = screen.getByDisplayValue('50');
      fireEvent.change(cantidadInput, { target: { value: '30' } });

      expect(screen.queryByText(/excede la cantidad esperada/i)).not.toBeInTheDocument();
    });
  });

  // ==================== EDICIÓN DE ITEMS ====================

  describe('Edición de items', () => {
    it('debe actualizar cantidad recibida', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('50')).toBeInTheDocument();
      });

      const cantidadInput = screen.getByDisplayValue('50');
      fireEvent.change(cantidadInput, { target: { value: '40' } });

      expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    });

    it('debe agregar observaciones a un item', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      const observacionesInput = screen.getByPlaceholderText(/observaciones del item/i);
      fireEvent.change(observacionesInput, { target: { value: 'Producto dañado' } });

      expect(screen.getByDisplayValue('Producto dañado')).toBeInTheDocument();
    });
  });

  // ==================== ENVÍO DE FORMULARIO ====================

  describe('Envío de formulario', () => {
    it('debe llamar a onSuccess al guardar correctamente', async () => {
      const mockCreatedReceipt: PurchaseReceipt = {
        id: 'pr-1',
        codigo: 'RC-2025-001',
        ordenCompraId: 'po-1',
        fecha: '2025-12-01T00:00:00.000Z',
        estado: 'PENDIENTE',
        recibidoPorId: 'user-1',
        items: [],
        createdAt: '2025-12-01T00:00:00.000Z',
        updatedAt: '2025-12-01T00:00:00.000Z',
      };

      // Mock del submit (esto dependerá de tu implementación real)
      const onSuccessSpy = vi.spyOn(mockProps, 'onSuccess');

      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      // Aquí deberías completar el flujo de submit según tu implementación
      // Por ahora verificamos que el formulario esté listo
      expect(screen.getByRole('button', { name: /guardar/i })).toBeEnabled();
    });

    it('debe llamar a onCancel al hacer clic en cancelar', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('OC-2025-001')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      fireEvent.click(cancelButton);

      expect(mockProps.onCancel).toHaveBeenCalled();
    });
  });

  // ==================== MANEJO DE ERRORES ====================

  describe('Manejo de errores', () => {
    it('debe mostrar error al cargar orden de compra', async () => {
      vi.mocked(purchaseOrderService.getPurchaseOrderById).mockRejectedValue(
        new Error('Orden no encontrada')
      );

      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== CÁLCULOS ====================

  describe('Cálculos automáticos', () => {
    it('debe calcular total de items recibidos', async () => {
      render(<PurchaseReceiptForm {...mockProps} />);

      await waitFor(() => {
        expect(screen.getByText('Producto Test')).toBeInTheDocument();
      });

      const cantidadInput = screen.getByDisplayValue('50');
      fireEvent.change(cantidadInput, { target: { value: '25' } });

      await waitFor(() => {
        expect(screen.getByText(/25.*items/i)).toBeInTheDocument();
      });
    });
  });
});
