import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// Interfaces (movidas desde AppContext)
export interface CashRegister {
  id: string;
  registerNumber: string;
  openDate: Date;
  closeDate?: Date;
  openTime: string;
  closeTime?: string;
  initialAmount: number;
  finalAmount?: number;
  status: 'abierta' | 'cerrada';
  userId: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  clientId: string;
  userId: string;
  cashRegisterId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'efectivo' | 'tarjeta' | 'transferencia';
  status: 'completada' | 'pendiente' | 'cancelada';
  createdAt: Date;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SalesContextType {
  cashRegisters: CashRegister[];
  addCashRegister: (cashRegister: Omit<CashRegister, 'id'>) => void;
  updateCashRegister: (id: string, cashRegister: Partial<CashRegister>) => void;
  getActiveCashRegister: () => CashRegister | undefined;
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  getSalesByDate: (date: Date) => Sale[];
}

const SalesContext = createContext<SalesContextType | undefined>(undefined);

export const SalesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([
    // Datos mock iniciales, idealmente vendrían de una API
    {
      id: '1',
      registerNumber: 'CAJA-001',
      openDate: new Date(),
      openTime: '08:00',
      initialAmount: 100.00,
      status: 'abierta',
      userId: '1'
    }
  ]);
  const [sales, setSales] = useState<Sale[]>([]);

  const addCashRegister = (cashRegisterData: Omit<CashRegister, 'id'>) => {
    const newCashRegister: CashRegister = {
      ...cashRegisterData,
      id: Date.now().toString()
    };
    setCashRegisters(prev => [...prev, newCashRegister]);
  };

  const updateCashRegister = (id: string, cashRegisterData: Partial<CashRegister>) => {
    setCashRegisters(prev => prev.map(cr => 
      cr.id === id ? { ...cr, ...cashRegisterData } : cr
    ));
  };

  const getActiveCashRegister = () => {
    return cashRegisters.find(cr => cr.status === 'abierta');
  };

  const addSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString()
    };
    setSales(prev => [...prev, newSale]);
  };

  const getSalesByDate = (date: Date) => {
    return sales.filter(s => s.createdAt.toDateString() === date.toDateString());
  };

  return (
    <SalesContext.Provider value={{ cashRegisters, addCashRegister, updateCashRegister, getActiveCashRegister, sales, addSale, getSalesByDate }}>
      {children}
    </SalesContext.Provider>
  );
};

export const useSales = (): SalesContextType => {
  const context = React.useContext(SalesContext);
  if (context === undefined) {
    throw new Error('useSales must be used within a SalesProvider');
  }
  return context;
};
