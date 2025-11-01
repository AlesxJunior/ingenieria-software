import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SalesProvider, useSales } from '../context/SalesContext';
import type { ReactNode } from 'react';
import type { CashRegister, Sale } from '../context/SalesContext';

describe('SalesContext', () => {
  beforeEach(() => {
    // Reset any state if needed
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <SalesProvider>{children}</SalesProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con una caja registradora mock', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      expect(result.current.cashRegisters).toHaveLength(1);
      expect(result.current.cashRegisters[0].registerNumber).toBe('CAJA-001');
      expect(result.current.cashRegisters[0].status).toBe('abierta');
      expect(result.current.cashRegisters[0].initialAmount).toBe(100.00);
    });

    it('debe iniciar con array vacío de ventas', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      expect(result.current.sales).toEqual([]);
    });
  });

  describe('addCashRegister', () => {
    it('debe agregar una nueva caja registradora', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const newCashRegister: Omit<CashRegister, 'id'> = {
        registerNumber: 'CAJA-002',
        openDate: new Date('2025-01-01'),
        openTime: '09:00',
        initialAmount: 200.00,
        status: 'abierta',
        userId: '2',
      };

      act(() => {
        result.current.addCashRegister(newCashRegister);
      });

      expect(result.current.cashRegisters).toHaveLength(2);
      expect(result.current.cashRegisters[1].registerNumber).toBe('CAJA-002');
      expect(result.current.cashRegisters[1].initialAmount).toBe(200.00);
    });

    it('debe generar un ID automáticamente', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const newCashRegister: Omit<CashRegister, 'id'> = {
        registerNumber: 'CAJA-003',
        openDate: new Date(),
        openTime: '10:00',
        initialAmount: 150.00,
        status: 'abierta',
        userId: '3',
      };

      act(() => {
        result.current.addCashRegister(newCashRegister);
      });

      const addedRegister = result.current.cashRegisters[1];
      expect(addedRegister.id).toBeDefined();
      expect(typeof addedRegister.id).toBe('string');
    });
  });

  describe('updateCashRegister', () => {
    it('debe actualizar una caja registradora existente', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const initialId = result.current.cashRegisters[0].id;

      act(() => {
        result.current.updateCashRegister(initialId, {
          status: 'cerrada',
          closeTime: '18:00',
          finalAmount: 500.00,
        });
      });

      const updatedRegister = result.current.cashRegisters.find(cr => cr.id === initialId);
      expect(updatedRegister?.status).toBe('cerrada');
      expect(updatedRegister?.closeTime).toBe('18:00');
      expect(updatedRegister?.finalAmount).toBe(500.00);
    });

    it('no debe modificar otras cajas registradoras', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      // Agregar segunda caja
      act(() => {
        result.current.addCashRegister({
          registerNumber: 'CAJA-002',
          openDate: new Date(),
          openTime: '09:00',
          initialAmount: 200.00,
          status: 'abierta',
          userId: '2',
        });
      });

      const firstId = result.current.cashRegisters[0].id;

      act(() => {
        result.current.updateCashRegister(firstId, { status: 'cerrada' });
      });

      expect(result.current.cashRegisters[0].status).toBe('cerrada');
      expect(result.current.cashRegisters[1].status).toBe('abierta');
    });
  });

  describe('getActiveCashRegister', () => {
    it('debe retornar la caja registradora activa', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const activeCashRegister = result.current.getActiveCashRegister();

      expect(activeCashRegister).toBeDefined();
      expect(activeCashRegister?.status).toBe('abierta');
      expect(activeCashRegister?.registerNumber).toBe('CAJA-001');
    });

    it('debe retornar undefined si no hay cajas abiertas', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const initialId = result.current.cashRegisters[0].id;

      act(() => {
        result.current.updateCashRegister(initialId, { status: 'cerrada' });
      });

      const activeCashRegister = result.current.getActiveCashRegister();
      expect(activeCashRegister).toBeUndefined();
    });

    it('debe retornar la primera caja abierta si hay múltiples', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      // Agregar segunda caja abierta
      act(() => {
        result.current.addCashRegister({
          registerNumber: 'CAJA-002',
          openDate: new Date(),
          openTime: '09:00',
          initialAmount: 200.00,
          status: 'abierta',
          userId: '2',
        });
      });

      const activeCashRegister = result.current.getActiveCashRegister();
      expect(activeCashRegister?.registerNumber).toBe('CAJA-001');
    });
  });

  describe('addSale', () => {
    it('debe agregar una nueva venta', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const newSale: Omit<Sale, 'id'> = {
        saleNumber: 'V-001',
        clientId: 'C-001',
        userId: 'U-001',
        cashRegisterId: 'CR-001',
        items: [
          {
            productId: 'P-001',
            quantity: 2,
            unitPrice: 50.00,
            total: 100.00,
          },
        ],
        subtotal: 100.00,
        tax: 18.00,
        total: 118.00,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: new Date('2025-01-01'),
      };

      act(() => {
        result.current.addSale(newSale);
      });

      expect(result.current.sales).toHaveLength(1);
      expect(result.current.sales[0].saleNumber).toBe('V-001');
      expect(result.current.sales[0].total).toBe(118.00);
      expect(result.current.sales[0].items).toHaveLength(1);
    });

    it('debe generar un ID automáticamente para la venta', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const newSale: Omit<Sale, 'id'> = {
        saleNumber: 'V-002',
        clientId: 'C-002',
        userId: 'U-002',
        cashRegisterId: 'CR-002',
        items: [],
        subtotal: 50.00,
        tax: 9.00,
        total: 59.00,
        paymentMethod: 'tarjeta',
        status: 'completada',
        createdAt: new Date(),
      };

      act(() => {
        result.current.addSale(newSale);
      });

      const addedSale = result.current.sales[0];
      expect(addedSale.id).toBeDefined();
      expect(typeof addedSale.id).toBe('string');
    });

    it('debe agregar múltiples ventas', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const sale1: Omit<Sale, 'id'> = {
        saleNumber: 'V-001',
        clientId: 'C-001',
        userId: 'U-001',
        cashRegisterId: 'CR-001',
        items: [],
        subtotal: 100.00,
        tax: 18.00,
        total: 118.00,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: new Date('2025-01-01'),
      };

      const sale2: Omit<Sale, 'id'> = {
        saleNumber: 'V-002',
        clientId: 'C-002',
        userId: 'U-002',
        cashRegisterId: 'CR-002',
        items: [],
        subtotal: 200.00,
        tax: 36.00,
        total: 236.00,
        paymentMethod: 'tarjeta',
        status: 'completada',
        createdAt: new Date('2025-01-02'),
      };

      act(() => {
        result.current.addSale(sale1);
        result.current.addSale(sale2);
      });

      expect(result.current.sales).toHaveLength(2);
      expect(result.current.sales[0].saleNumber).toBe('V-001');
      expect(result.current.sales[1].saleNumber).toBe('V-002');
    });
  });

  describe('getSalesByDate', () => {
    it('debe retornar ventas por fecha específica', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const date1 = new Date('2025-01-01');
      const date2 = new Date('2025-01-02');

      const sale1: Omit<Sale, 'id'> = {
        saleNumber: 'V-001',
        clientId: 'C-001',
        userId: 'U-001',
        cashRegisterId: 'CR-001',
        items: [],
        subtotal: 100.00,
        tax: 18.00,
        total: 118.00,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: date1,
      };

      const sale2: Omit<Sale, 'id'> = {
        saleNumber: 'V-002',
        clientId: 'C-002',
        userId: 'U-002',
        cashRegisterId: 'CR-002',
        items: [],
        subtotal: 200.00,
        tax: 36.00,
        total: 236.00,
        paymentMethod: 'tarjeta',
        status: 'completada',
        createdAt: date2,
      };

      act(() => {
        result.current.addSale(sale1);
        result.current.addSale(sale2);
      });

      const salesOnDate1 = result.current.getSalesByDate(date1);
      expect(salesOnDate1).toHaveLength(1);
      expect(salesOnDate1[0].saleNumber).toBe('V-001');
    });

    it('debe retornar array vacío si no hay ventas en la fecha', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const sale: Omit<Sale, 'id'> = {
        saleNumber: 'V-001',
        clientId: 'C-001',
        userId: 'U-001',
        cashRegisterId: 'CR-001',
        items: [],
        subtotal: 100.00,
        tax: 18.00,
        total: 118.00,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: new Date('2025-01-01'),
      };

      act(() => {
        result.current.addSale(sale);
      });

      const salesOnDate = result.current.getSalesByDate(new Date('2025-01-15'));
      expect(salesOnDate).toEqual([]);
    });

    it('debe retornar múltiples ventas de la misma fecha', () => {
      const { result } = renderHook(() => useSales(), { wrapper });

      const date = new Date('2025-01-01');

      const sale1: Omit<Sale, 'id'> = {
        saleNumber: 'V-001',
        clientId: 'C-001',
        userId: 'U-001',
        cashRegisterId: 'CR-001',
        items: [],
        subtotal: 100.00,
        tax: 18.00,
        total: 118.00,
        paymentMethod: 'efectivo',
        status: 'completada',
        createdAt: date,
      };

      const sale2: Omit<Sale, 'id'> = {
        saleNumber: 'V-002',
        clientId: 'C-002',
        userId: 'U-002',
        cashRegisterId: 'CR-002',
        items: [],
        subtotal: 200.00,
        tax: 36.00,
        total: 236.00,
        paymentMethod: 'tarjeta',
        status: 'completada',
        createdAt: date,
      };

      act(() => {
        result.current.addSale(sale1);
        result.current.addSale(sale2);
      });

      const salesOnDate = result.current.getSalesByDate(date);
      expect(salesOnDate).toHaveLength(2);
      expect(salesOnDate[0].saleNumber).toBe('V-001');
      expect(salesOnDate[1].saleNumber).toBe('V-002');
    });
  });

  describe('useSales hook', () => {
    it('debe lanzar error si se usa fuera del provider', () => {
      expect(() => {
        renderHook(() => useSales());
      }).toThrow('useSales must be used within a SalesProvider');
    });
  });
});
