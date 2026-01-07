import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ProductProvider, useProducts } from '../context/ProductContext';
import * as apiModule from '../../../utils/api';
import type { ReactNode } from 'react';

// Mock de los contextos dependientes
vi.mock('../../../context/UIContext', () => ({
  useUI: () => ({
    setIsLoading: vi.fn(),
  }),
}));

vi.mock('../../../context/NotificationContext', () => ({
  useNotification: () => ({
    showSuccess: vi.fn(),
    showError: vi.fn(),
  }),
}));

vi.mock('../../../utils/api', () => ({
  apiService: {
    getProducts: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));

describe('ProductContext', () => {
  const { apiService } = apiModule;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ProductProvider>{children}</ProductProvider>
  );

  describe('Estado inicial', () => {
    it('debe iniciar con array vacío de productos', async () => {
      // Mock para la carga inicial automática
      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: [], total: 0, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });
      
      // Esperar a que termine la carga inicial
      await waitFor(() => {
        expect(result.current.products).toEqual([]);
      });
    });
  });

  describe('loadProducts', () => {
    it('debe cargar productos exitosamente', async () => {
      const mockProducts = [
        {
          codigo: 'P001',
          nombre: 'Producto 1',
          categoria: 'Electrónica',
          precioVenta: 100,
          stock: 50,
          unidadMedida: 'unidad',
          estado: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
        {
          codigo: 'P002',
          nombre: 'Producto 2',
          categoria: 'Hogar',
          precioVenta: 200,
          stock: 0,
          unidadMedida: 'unidad',
          estado: true,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ];

      // Primera llamada: carga inicial automática (devuelve vacío)
      // Segunda llamada: loadProducts manual (devuelve productos)
      vi.mocked(apiService.getProducts)
        .mockResolvedValueOnce({
          success: true,
          data: { products: [], total: 0, filters: {} },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: { products: mockProducts, total: 2, filters: {} },
          message: 'Success',
        });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products).toEqual([]));

      await act(async () => {
        await result.current.loadProducts();
      });

      expect(result.current.products).toHaveLength(2);
      expect(result.current.products[0].productName).toBe('Producto 1');
      expect(result.current.products[0].status).toBe('disponible');
      expect(result.current.products[1].status).toBe('agotado');
    });

    it('debe cargar productos con filtros', async () => {
      vi.mocked(apiService.getProducts)
        .mockResolvedValueOnce({
          success: true,
          data: { products: [], total: 0, filters: {} },
          message: 'Success',
        })
        .mockResolvedValueOnce({
          success: true,
          data: { products: [], total: 0, filters: {} },
          message: 'Success',
        });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products).toEqual([]));

      await act(async () => {
        await result.current.loadProducts({
          categoria: 'Electrónica',
          minPrecio: 100,
          maxPrecio: 500,
        });
      });

      expect(apiService.getProducts).toHaveBeenCalledWith(
        {
          categoria: 'Electrónica',
          minPrecio: 100,
          maxPrecio: 500,
        },
        expect.any(Object)
      );
    });

    it('debe manejar error al cargar productos', async () => {
      vi.mocked(apiService.getProducts)
        .mockResolvedValueOnce({
          success: true,
          data: { products: [], total: 0, filters: {} },
          message: 'Success',
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products).toEqual([]));

      await act(async () => {
        await result.current.loadProducts();
      });

      expect(result.current.products).toEqual([]);
    });

    it('debe ignorar AbortError', async () => {
      const abortError = new Error('Request aborted');
      (abortError as any).name = 'AbortError';
      
      vi.mocked(apiService.getProducts)
        .mockResolvedValueOnce({
          success: true,
          data: { products: [], total: 0, filters: {} },
          message: 'Success',
        })
        .mockRejectedValueOnce(abortError);

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products).toEqual([]));

      await act(async () => {
        await result.current.loadProducts();
      });

      // No debe mostrar error en este caso
      expect(result.current.products).toEqual([]);
    });
  });

  describe('getProductById', () => {
    it('debe retornar producto por ID', async () => {
      const mockProducts = [
        {
          codigo: 'P001',
          nombre: 'Producto 1',
          categoria: 'Electrónica',
          precioVenta: 100,
          stock: 50,
          unidadMedida: 'unidad',
          estado: true,
        },
      ];

      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: mockProducts, total: 1, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0));

      const product = result.current.getProductById('P001');
      expect(product).toBeDefined();
      expect(product?.productName).toBe('Producto 1');
    });

    it('debe retornar undefined si no existe el producto', async () => {
      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: [], total: 0, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products).toEqual([]));

      const product = result.current.getProductById('P999');
      expect(product).toBeUndefined();
    });
  });

  describe('addProduct', () => {
    it('debe agregar producto al array', async () => {
      const mockProducts = [
        {
          codigo: 'P001',
          nombre: 'Producto 1',
          categoria: 'Electrónica',
          precioVenta: 100,
          stock: 50,
          unidadMedida: 'unidad',
          estado: true,
        },
      ];

      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: mockProducts, total: 1, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0));

      const initialCount = result.current.products.length;

      const newProduct = {
        productCode: 'P002',
        productName: 'Producto 2',
        category: 'Hogar',
        price: 200,
        initialStock: 30,
        currentStock: 30,
        status: 'disponible' as const,
        unit: 'unidad',
        isActive: true,
      };

      act(() => {
        result.current.addProduct(newProduct);
      });

      expect(result.current.products.length).toBe(initialCount + 1);
      expect(result.current.products.some(p => p.productCode === 'P002')).toBe(true);
    });
  });

  describe('updateProduct', () => {
    it('debe actualizar producto existente', async () => {
      const mockProducts = [
        {
          codigo: 'P001',
          nombre: 'Producto 1',
          categoria: 'Electrónica',
          precioVenta: 100,
          stock: 50,
          unidadMedida: 'unidad',
          estado: true,
        },
      ];

      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: mockProducts, total: 1, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0));

      const productId = result.current.products[0].id;

      act(() => {
        result.current.updateProduct(productId, {
          productName: 'Producto Actualizado',
          price: 150,
        });
      });

      const updatedProduct = result.current.products.find(p => p.id === productId);
      expect(updatedProduct?.productName).toBe('Producto Actualizado');
      expect(updatedProduct?.price).toBe(150);
    });

    it('no debe hacer nada si el producto no existe', async () => {
      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: [], total: 0, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products).toEqual([]));

      act(() => {
        result.current.updateProduct('P999', { productName: 'Test' });
      });

      expect(result.current.products).toEqual([]);
    });
  });

  describe('deleteProduct', () => {
    it('debe eliminar producto del array', async () => {
      const mockProducts = [
        {
          codigo: 'P001',
          nombre: 'Producto 1',
          categoria: 'Electrónica',
          precioVenta: 100,
          stock: 50,
          unidadMedida: 'unidad',
          estado: true,
        },
        {
          codigo: 'P002',
          nombre: 'Producto 2',
          categoria: 'Hogar',
          precioVenta: 200,
          stock: 30,
          unidadMedida: 'unidad',
          estado: true,
        },
      ];

      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: mockProducts, total: 2, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products.length).toBe(2));

      const initialCount = result.current.products.length;
      const productToDelete = result.current.products[0].id;

      act(() => {
        result.current.deleteProduct(productToDelete);
      });

      expect(result.current.products.length).toBe(initialCount - 1);
      expect(result.current.products.find(p => p.id === productToDelete)).toBeUndefined();
    });
  });

  describe('Mapeo de datos', () => {
    it('debe mapear correctamente los campos de la API', async () => {
      const mockProduct = {
        codigo: 'P001',
        nombre: 'Test Product',
        categoria: 'Test',
        precioVenta: 99.99,
        stock: 10,
        minStock: 5,
        unidadMedida: 'kg',
        estado: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
      };

      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: [mockProduct], total: 1, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0));

      const product = result.current.products[0];
      expect(product.id).toBe('P001');
      expect(product.productCode).toBe('P001');
      expect(product.productName).toBe('Test Product');
      expect(product.category).toBe('Test');
      expect(product.price).toBe(99.99);
      expect(product.currentStock).toBe(10);
      expect(product.minStock).toBe(5);
      expect(product.unit).toBe('kg');
      expect(product.isActive).toBe(true);
      expect(product.status).toBe('disponible');
    });

    it('debe asignar status "agotado" cuando stock es 0', async () => {
      const mockProduct = {
        codigo: 'P001',
        nombre: 'Test',
        categoria: 'Test',
        precioVenta: 100,
        stock: 0,
        unidadMedida: 'unidad',
        estado: true,
      };

      vi.mocked(apiService.getProducts).mockResolvedValue({
        success: true,
        data: { products: [mockProduct], total: 1, filters: {} },
        message: 'Success',
      });

      const { result } = renderHook(() => useProducts(), { wrapper });

      // Esperar la carga inicial
      await waitFor(() => expect(result.current.products.length).toBeGreaterThan(0));

      expect(result.current.products[0].status).toBe('agotado');
    });
  });
});
