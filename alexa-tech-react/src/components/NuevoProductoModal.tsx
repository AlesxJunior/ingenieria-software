import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import { apiService } from '../utils/api';
import { CATEGORY_OPTIONS, UNIT_OPTIONS, LOCATION_OPTIONS } from '../utils/productOptions';

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

interface ProductFormData {
  productCode: string;
  productName: string;
  category: string;
  price: string;
  initialStock: string;
  ubicacion: string;
  unit: string;
}

interface NuevoProductoModalProps {
  onClose: () => void;
}

const NuevoProductoModal: React.FC<NuevoProductoModalProps> = ({ onClose }) => {
  const { addProduct, products } = useProducts();
  const { showSuccess, showError } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formData, setFormData] = useState<ProductFormData>({
    productCode: '',
    productName: '',
    category: '',
    price: '',
    initialStock: '',
    ubicacion: '',
    unit: ''
  });

  // Fusionar opciones dinámicas con listas por defecto evitando duplicados
  const mergeOptions = (primary: string[], fallback: string[]) => {
    const seen = new Set(primary.map(v => v.toLowerCase()));
    const merged = [...primary];
    for (const f of fallback) {
      if (!seen.has(f.toLowerCase())) {
        merged.push(f);
        seen.add(f.toLowerCase());
      }
    }
    return merged;
  };

  const categoryOptions = useMemo(() => {
    const dyn = Array.from(new Set((products || []).map(p => p.category).filter(Boolean))).sort();
    return mergeOptions(dyn, CATEGORY_OPTIONS);
  }, [products]);

  const unitOptions = useMemo(() => {
    const dyn = Array.from(new Set((products || []).map(p => p.unit).filter(Boolean))).sort();
    return mergeOptions(dyn, UNIT_OPTIONS);
  }, [products]);

  const locationOptions = useMemo(() => {
    const dyn = Array.from(new Set((products || []).map(p => p.ubicacion || '').filter(v => v))).sort();
    return mergeOptions(dyn, LOCATION_OPTIONS);
  }, [products]);

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

    if (name === 'initialStock' && value) {
      const stock = Number(value);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        setErrors(prev => ({ ...prev, initialStock: 'El stock debe ser entero ≥ 0' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string | undefined> = {};

    if (!formData.productCode.trim()) newErrors.productCode = 'El código es requerido';
    if (!formData.productName.trim()) newErrors.productName = 'El nombre es requerido';
    if (!formData.category.trim()) newErrors.category = 'La categoría es requerida';

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const price = Number(formData.price);
      if (isNaN(price) || price <= 0) newErrors.price = 'Precio inválido';
    }

    if (!formData.initialStock.trim()) {
      newErrors.initialStock = 'El stock es requerido';
    } else {
      const stock = Number(formData.initialStock);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) newErrors.initialStock = 'Stock inválido';
    }

    if (!formData.unit.trim()) newErrors.unit = 'La unidad es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        codigo: formData.productCode,
        nombre: formData.productName,
        categoria: formData.category,
        precioVenta: parseFloat(formData.price),
        stock: parseInt(formData.initialStock),
        estado: true,
        unidadMedida: formData.unit.toLowerCase(),
        ubicacion: formData.ubicacion?.trim() ? formData.ubicacion : undefined,
      };

      const response = await apiService.createProduct(payload);
      if (!response.success) throw new Error(response.message || 'Error al registrar');

      const stockStatus = payload.stock > 0 ? 'disponible' : 'agotado';

      addProduct({
        productCode: payload.codigo,
        productName: payload.nombre,
        category: payload.categoria,
        price: payload.precioVenta,
        initialStock: payload.stock,
        currentStock: payload.stock,
        status: stockStatus as 'disponible' | 'agotado',
        ubicacion: payload.ubicacion,
        unit: payload.unidadMedida,
        isActive: true
      });

      showSuccess('Producto registrado exitosamente');
      onClose();
    } catch (err) {
      console.error('Error creando producto:', err);
      showError('No se pudo registrar el producto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormGrid>
        <FormGroup>
          <label htmlFor="productCode">Código *</label>
          <input id="productCode" name="productCode" type="text" value={formData.productCode} onChange={handleInputChange} />
          {errors.productCode && <span className="error">{errors.productCode}</span>}
        </FormGroup>
        <FormGroup>
          <label htmlFor="productName">Nombre *</label>
          <input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} />
          {errors.productName && <span className="error">{errors.productName}</span>}
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
          <label htmlFor="initialStock">Stock inicial *</label>
          <input id="initialStock" name="initialStock" type="number" min="0" value={formData.initialStock} onChange={handleInputChange} />
          {errors.initialStock && <span className="error">{errors.initialStock}</span>}
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
          <label htmlFor="ubicacion">Ubicación (almacén)</label>
          <select id="ubicacion" name="ubicacion" value={formData.ubicacion} onChange={handleInputChange}>
            <option value="">Sin ubicación</option>
            {locationOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </FormGroup>
      </FormGrid>
      <Actions>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Registrar'}</Button>
      </Actions>
    </form>
  );
};

export default NuevoProductoModal;