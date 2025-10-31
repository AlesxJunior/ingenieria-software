
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../utils/api';
import { useUI } from './UIContext';
import { useNotification } from './NotificationContext';

// Definición de la interfaz Product (movida desde AppContext)
export interface Product {
  id: string;
  productCode: string;
  productName: string;
  category: string;
  price: number;
  initialStock: number;
  currentStock: number;
  minStock?: number;
  status: 'disponible' | 'agotado' | 'proximamente';
  unit: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductContextType {
  products: Product[];
  loadProducts: (params?: {
    categoria?: string;
    estado?: boolean;
    unidadMedida?: string;
    q?: string;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    maxStock?: number;
    signal?: AbortSignal;
  }) => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const { setIsLoading } = useUI();
  const { showSuccess, showError } = useNotification();

  const loadProducts = useCallback(async (params?: any) => {
    try {
      setIsLoading(true);
      const { signal, ...filters } = params || {};
      const response = await apiService.getProducts(filters, { signal });
      if (response.success && response.data) {
        const mapped = response.data.products.map((p: any) => ({
          id: p.codigo || p.id || p._id || String(Date.now()),
          productCode: p.codigo,
          productName: p.nombre,
          category: p.categoria,
          price: p.precioVenta,
          initialStock: p.stock,
          currentStock: p.stock,
          minStock: p.minStock ?? undefined,
          status: (typeof p.stock === 'number' && p.stock > 0) ? 'disponible' : 'agotado',
          unit: p.unidadMedida,
          isActive: !!p.estado,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
          updatedAt: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        } as Product));
        setProducts(mapped);
      } else {
        showError(response.message || 'Error al cargar los productos');
      }
    } catch (error) {
      if ((error as any)?.name === 'AbortError') {
        // request cancelado, no mostrar error
      } else {
        console.error('Error loading products:', error);
        showError('Error al cargar los productos');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, showError]);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      currentStock: productData.initialStock,
      isActive: productData.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProducts(prev => [...prev, newProduct]);
    showSuccess(`El producto ${productData.productName} ha sido registrado exitosamente.`);
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...productData, updatedAt: new Date() } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <ProductContext.Provider value={{ products, loadProducts, addProduct, updateProduct, deleteProduct, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = (): ProductContextType => {
  const context = React.useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
