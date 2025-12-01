import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useProducts, type Product } from '../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import { configuracionApi } from '../../../services/configuracionApi';
import type { ProductCategory, UnitOfMeasure } from '../../../types/configuracion';

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: 13px;
    color: #555;
    font-weight: 500;
    margin-bottom: 6px;
  }

  input, select {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s ease;
  }

  input:focus, select:focus {
    border-color: #0047b3;
  }

  .error {
    color: #e74c3c;
    font-size: 12px;
    margin-top: 5px;
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  ${props => props.$variant === 'primary' ? `
    background-color: #0047b3;
    color: white;

    &:hover { background-color: #003a92; }
    &:disabled { background-color: #8fa8d6; cursor: not-allowed; }
  ` : `
    background-color: #6c757d;
    color: white;
    &:hover { background-color: #5a6268; }
  `}
`;

interface EditProductFormData {
  productCode: string;
  productName: string;
  descripcion: string;
  category: string;
  price: string;
  currentStock: string;
  unit: string;
  minStock: string;
}

interface EditarProductoModalProps {
  product: Product;
  onClose: () => void;
}

const EditarProductoModal: React.FC<EditarProductoModalProps> = ({ product, onClose }) => {
  const { updateProduct, products } = useProducts();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [categorias, setCategorias] = useState<ProductCategory[]>([]);
  const [unidades, setUnidades] = useState<UnitOfMeasure[]>([]);

  // Extraer valor inicial defensivo para category y unit
  const initialCategory = typeof product.category === 'string' 
    ? product.category 
    : product.category?.nombre || product.categoria?.nombre || '';
  
  const initialUnit = typeof product.unit === 'string' 
    ? product.unit 
    : product.unit?.nombre || product.unidadMedida?.nombre || '';

  const [formData, setFormData] = useState<EditProductFormData>({
    productCode: product.productCode,
    productName: product.productName,
    descripcion: product.descripcion || '',
    category: initialCategory,
    price: product.price?.toString() || '',
    currentStock: product.currentStock?.toString() || '0',
    unit: initialUnit,
    minStock: product.minStock?.toString() || ''
  });

  // Cargar maestros de configuración
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [cats, units] = await Promise.all([
          configuracionApi.getActiveCategories(),
          configuracionApi.getActiveUnits()
        ]);
        if (mounted) {
          setCategorias(cats);
          setUnidades(units);
          console.log('[EditarProductoModal] Maestros cargados:', { categorias: cats.length, unidades: units.length });
        }
      } catch (e) {
        console.error('[EditarProductoModal] Error cargando maestros:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Opciones de categorías desde maestros
  const categoryOptions = useMemo(() => {
    const opciones = [...categorias.map(c => c.nombre)];
    // Agregar categorías existentes en productos que no estén en maestros
    const fromProducts = Array.from(new Set(
      (products || []).map(p => {
        const cat = p.categoria?.nombre || p.category;
        return typeof cat === 'string' ? cat : cat?.nombre || '';
      }).filter(Boolean)
    ));
    fromProducts.forEach(cat => {
      if (!opciones.includes(cat)) opciones.push(cat);
    });
    return opciones.sort();
  }, [categorias, products]);

  const unitOptions = useMemo(() => {
    const opciones = [...unidades.map(u => u.nombre)];
    // Agregar unidades existentes en productos que no estén en maestros
    const fromProducts = Array.from(new Set(
      (products || []).map(p => {
        const unit = p.unidadMedida?.nombre || p.unit;
        return typeof unit === 'string' ? unit : unit?.nombre || '';
      }).filter(Boolean)
    ));
    fromProducts.forEach(unit => {
      if (!opciones.includes(unit)) opciones.push(unit);
    });
    return opciones.sort();
  }, [unidades, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    if (name === 'price' && value) {
      const price = Number(value);
      if (isNaN(price) || price <= 0) {
        setErrors(prev => ({ ...prev, price: 'El precio debe ser mayor a 0' }));
      }
    }

    if (name === 'minStock' && value) {
      const minStock = Number(value);
      if (isNaN(minStock) || minStock < 0 || !Number.isInteger(minStock)) {
        setErrors(prev => ({ ...prev, minStock: 'El stock mínimo debe ser entero ≥ 0' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (!formData.productName.trim()) newErrors.productName = 'El nombre es requerido';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const price = Number(formData.price);
      if (isNaN(price) || price <= 0) newErrors.price = 'Precio inválido';
    }

    if (!formData.unit.trim()) newErrors.unit = 'La unidad es requerida';

    if (formData.minStock.trim()) {
      const minStock = Number(formData.minStock);
      if (isNaN(minStock) || minStock < 0 || !Number.isInteger(minStock)) {
        newErrors.minStock = 'Stock mínimo inválido';
      }
    }

    if (formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const minStock = formData.minStock.trim() ? parseInt(formData.minStock) : undefined;
      
      const payload = {
        nombre: formData.productName,
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.category,
        precioVenta: parseFloat(formData.price),
        estado: product.isActive ?? true,
        unidadMedida: formData.unit.toLowerCase(),
        minStock: minStock,
      };

      const response = await apiService.updateProductByCodigo(product.productCode, payload);
      if (!response.success) throw new Error(response.message || 'Error al actualizar');

      const stockStatus = (product.currentStock ?? 0) > 0 ? 'disponible' : 'agotado';

      updateProduct(product.id, {
        productCode: product.productCode,
        productName: payload.nombre,
        descripcion: payload.descripcion,
        category: payload.categoria,
        price: payload.precioVenta,
        currentStock: product.currentStock ?? 0,
        initialStock: product.initialStock ?? product.currentStock ?? 0,
        minStock: minStock,
        status: stockStatus as 'disponible' | 'agotado',
        unit: payload.unidadMedida,
        isActive: product.isActive ?? true
      });

      showSuccess('Producto actualizado exitosamente');
      onClose();
    } catch (err) {
      console.error('Error actualizando producto:', err);
      showError('No se pudo actualizar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGrid>
        <FormGroup>
          <label htmlFor="productCode">Código</label>
          <input id="productCode" name="productCode" type="text" value={formData.productCode} disabled />
        </FormGroup>
        <FormGroup>
          <label htmlFor="productName">Nombre *</label>
          <input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} />
          {errors.productName && <span className="error">{errors.productName}</span>}
        </FormGroup>
        <FormGroup style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="descripcion">Descripción</label>
          <textarea 
            id="descripcion" 
            name="descripcion" 
            rows={3}
            maxLength={500}
            value={formData.descripcion} 
            onChange={handleInputChange}
            placeholder="Descripción detallada del producto (opcional, máx 500 caracteres)"
            style={{ 
              resize: 'vertical',
              minHeight: '80px',
              fontFamily: 'inherit',
              padding: '10px 12px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '14px'
            }}
          />
          <small style={{ color: '#666', fontSize: '12px' }}>
            {formData.descripcion.length}/500 caracteres
          </small>
          {errors.descripcion && <span className="error">{errors.descripcion}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="category">Categoría *</label>
          <select id="category" name="category" value={formData.category} onChange={handleInputChange}>
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.category && <span className="error">{errors.category}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="price">Precio *</label>
          <input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} />
          {errors.price && <span className="error">{errors.price}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="currentStock">Stock</label>
          <input id="currentStock" name="currentStock" type="number" min="0" value={formData.currentStock} disabled />
        </FormGroup>
        <FormGroup>
          <label htmlFor="unit">Unidad *</label>
          <select id="unit" name="unit" value={formData.unit} onChange={handleInputChange}>
            <option value="">Selecciona unidad</option>
            {unitOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          {errors.unit && <span className="error">{errors.unit}</span>}
        </FormGroup>

        <FormGroup>
          <label htmlFor="minStock">Stock Mínimo</label>
          <input 
            id="minStock" 
            name="minStock" 
            type="number" 
            min="0" 
            value={formData.minStock} 
            onChange={handleInputChange}
            placeholder="Opcional: alertas de stock bajo"
          />
          {errors.minStock && <span className="error">{errors.minStock}</span>}
        </FormGroup>
      </FormGrid>
      <Actions>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar cambios'}</Button>
      </Actions>
    </form>
  );
};

export default EditarProductoModal;