
import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../../../utils/api';
import { useUI } from '../../../context/UIContext';
import { useNotification } from '../../../context/NotificationContext';

// Definición de la interfaz Product (movida desde AppContext)
export interface Product {
  id: string;
  productCode: string;
  productName: string;
  descripcion?: string;
  category: string;  // Campo legacy - mantener por compatibilidad
  categoriaId?: string;  // FK a tabla maestra
  categoria?: {  // Relación incluida desde backend
    id: string;
    codigo: string;
    nombre: string;
  };
  price: number;
  initialStock: number;
  currentStock: number;
  minStock?: number;
  status: 'disponible' | 'agotado' | 'proximamente';
  unit: string;  // Campo legacy - mantener por compatibilidad
  unidadMedidaId?: string;  // FK a tabla maestra
  unidadMedida?: {  // Relación incluida desde backend
    id: string;
    codigo: string;
    nombre: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ProductContextType {
  products: Product[];
  pagination: PaginationMetadata | null;
  loadProducts: (params?: {
    categoria?: string;
    estado?: boolean;
    unidadMedida?: string;
    q?: string;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    maxStock?: number;
    page?: number;
    limit?: number;
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
  const [pagination, setPagination] = useState<PaginationMetadata | null>(null);
  const { setIsLoading } = useUI();
  const { showSuccess, showError } = useNotification();

  const loadProducts = useCallback(async (params?: any) => {
    try {
      setIsLoading(true);
      const { signal, ...filters } = params || {};
      const response = await apiService.getProducts(filters, { signal });
      if (response.success && response.data) {
        const mapped = response.data.products.map((p: any) => ({
          id: p.id || p._id || p.codigo || String(Date.now()), // ✅ Usar p.id primero (PRD-XXX)
          productCode: p.codigo,
          productName: p.nombre,
          descripcion: p.descripcion || undefined,
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
        
        // Actualizar metadata de paginación si existe
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('alexatech_token');
    if (token) {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo cargar al montar el componente

  return (
    <ProductContext.Provider value={{ products, pagination, loadProducts, addProduct, updateProduct, deleteProduct, getProductById }}>
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
