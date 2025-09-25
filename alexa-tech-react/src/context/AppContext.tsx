import React, { createContext, useState } from 'react';
import type { ReactNode } from 'react';

// Interfaces para los datos de la aplicación
export interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  price: number;
  initialStock: number;
  currentStock: number;
  status: 'disponible' | 'agotado' | 'proximamente';
  warranty?: string;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  documentNumber: string;
  documentType: 'DNI' | 'RUC';
  address: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

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

interface AppContextType {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;

  // Cash Registers
  cashRegisters: CashRegister[];
  addCashRegister: (cashRegister: Omit<CashRegister, 'id'>) => void;
  updateCashRegister: (id: string, cashRegister: Partial<CashRegister>) => void;
  getActiveCashRegister: () => CashRegister | undefined;

  // Sales
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  getSalesByDate: (date: Date) => Sale[];

  // UI State
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Estados para los datos de la aplicación
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Juan Pérez',
      documentNumber: '12345678',
      documentType: 'DNI',
      address: 'Av. Principal 123',
      phone: '987654321',
      email: 'juan.perez@email.com',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      name: 'María García',
      documentNumber: '87654321',
      documentType: 'DNI',
      address: 'Jr. Secundario 456',
      phone: '123456789',
      email: 'maria.garcia@email.com',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      name: 'Empresa ABC S.A.C.',
      documentNumber: '20123456789',
      documentType: 'RUC',
      address: 'Av. Comercial 789',
      phone: '555-0123',
      email: 'contacto@empresaabc.com',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [cashRegisters, setCashRegisters] = useState<CashRegister[]>([
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
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Funciones para productos
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      currentStock: productData.initialStock,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setProducts(prev => [...prev, newProduct]);
    addNotification({
      type: 'success',
      title: 'Producto registrado',
      message: `El producto ${productData.productName} ha sido registrado exitosamente.`
    });
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...productData, updatedAt: new Date() }
        : product
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Funciones para clientes
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClients(prev => [...prev, newClient]);
    addNotification({
      type: 'success',
      title: 'Cliente registrado',
      message: `El cliente ${clientData.name} ha sido registrado exitosamente.`
    });
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id 
        ? { ...client, ...clientData, updatedAt: new Date() }
        : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    addNotification({
      type: 'success',
      title: 'Cliente eliminado',
      message: 'El cliente ha sido eliminado exitosamente.'
    });
  };

  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  // Funciones para cajas
  const addCashRegister = (cashRegisterData: Omit<CashRegister, 'id'>) => {
    const newCashRegister: CashRegister = {
      ...cashRegisterData,
      id: Date.now().toString()
    };
    setCashRegisters(prev => [...prev, newCashRegister]);
  };

  const updateCashRegister = (id: string, cashRegisterData: Partial<CashRegister>) => {
    setCashRegisters(prev => prev.map(cashRegister => 
      cashRegister.id === id 
        ? { ...cashRegister, ...cashRegisterData }
        : cashRegister
    ));
  };

  const getActiveCashRegister = () => {
    return cashRegisters.find(cashRegister => cashRegister.status === 'abierta');
  };

  // Funciones para ventas
  const addSale = (saleData: Omit<Sale, 'id'>) => {
    const newSale: Sale = {
      ...saleData,
      id: Date.now().toString()
    };
    setSales(prev => [...prev, newSale]);
  };

  const getSalesByDate = (date: Date) => {
    return sales.filter(sale => 
      sale.createdAt.toDateString() === date.toDateString()
    );
  };

  // Funciones para notificaciones
  const addNotification = (notificationData: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString()
    };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover notificación después del tiempo especificado
    const duration = notificationData.duration || 5000;
    setTimeout(() => {
      removeNotification(newNotification.id);
    }, duration);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const showSuccess = (message: string) => {
    addNotification({ type: 'success', title: 'Éxito', message });
  };

  const showError = (message: string) => {
    addNotification({ type: 'error', title: 'Error', message });
  };

  const showWarning = (message: string) => {
    addNotification({ type: 'warning', title: 'Advertencia', message });
  };

  const showInfo = (message: string) => {
    addNotification({ type: 'info', title: 'Información', message });
  };

  const value: AppContextType = {
    // Products
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,

    // Clients
    clients,
    addClient,
    updateClient,
    deleteClient,
    getClientById,

    // Cash Registers
    cashRegisters,
    addCashRegister,
    updateCashRegister,
    getActiveCashRegister,

    // Sales
    sales,
    addSale,
    getSalesByDate,

    // UI State
    isLoading,
    setIsLoading,
    notifications,
    addNotification,
    removeNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Hook personalizado para usar el contexto de la aplicación
export const useApp = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export type { AppContextType };
export default AppContext;