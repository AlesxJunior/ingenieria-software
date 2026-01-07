import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useProducts, type Product } from '../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import { configuracionApi } from '../../../services/configuracionApi';
import type { ProductCategory, UnitOfMeasure } from '../../../types/configuracion';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../../../styles/theme';
import { Button, Input, Select, Label, RequiredMark, ValidationMessage, ButtonGroup } from '../../../components/shared';

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.md};
  margin-bottom: ${SPACING.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: ${SPACING.sm};
  border: 2px solid ${COLORS.border.medium};
  border-radius: ${BORDER_RADIUS.sm};
  font-size: ${TYPOGRAPHY.fontSize.body};
  font-family: ${TYPOGRAPHY.fontFamily};
  resize: vertical;
  min-height: 80px;
  transition: ${TRANSITIONS.normal};

  &:focus {
    outline: none;
    border-color: ${COLORS.primary};
    box-shadow: 0 0 0 3px ${COLORS.primary}1a;
  }
`;

const CharCounter = styled.small`
  color: ${COLORS.text.muted};
  font-size: ${TYPOGRAPHY.fontSize.xs};
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
          <Label htmlFor="productCode">Código</Label>
          <Input id="productCode" name="productCode" type="text" value={formData.productCode} disabled />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="productName">
            Nombre
            <RequiredMark />
          </Label>
          <Input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} />
          {errors.productName && <ValidationMessage $type="error">{errors.productName}</ValidationMessage>}
        </FormGroup>
        <FormGroup style={{ gridColumn: '1 / -1' }}>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea 
            id="descripcion" 
            name="descripcion" 
            rows={3}
            maxLength={500}
            value={formData.descripcion} 
            onChange={handleInputChange}
            placeholder="Descripción detallada del producto (opcional, máx 500 caracteres)"
          />
          <CharCounter>
            {formData.descripcion.length}/500 caracteres
          </CharCounter>
          {errors.descripcion && <ValidationMessage $type="error">{errors.descripcion}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="category">
            Categoría
            <RequiredMark />
          </Label>
          <Select id="category" name="category" value={formData.category} onChange={handleInputChange}>
            <option value="">Selecciona una categoría</option>
            {categoryOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
          {errors.category && <ValidationMessage $type="error">{errors.category}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="price">
            Precio
            <RequiredMark />
          </Label>
          <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} />
          {errors.price && <ValidationMessage $type="error">{errors.price}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="currentStock">Stock</Label>
          <Input id="currentStock" name="currentStock" type="number" min="0" value={formData.currentStock} disabled />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="unit">
            Unidad
            <RequiredMark />
          </Label>
          <Select id="unit" name="unit" value={formData.unit} onChange={handleInputChange}>
            <option value="">Selecciona unidad</option>
            {unitOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </Select>
          {errors.unit && <ValidationMessage $type="error">{errors.unit}</ValidationMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="minStock">Stock Mínimo</Label>
          <Input 
            id="minStock" 
            name="minStock" 
            type="number" 
            min="0" 
            value={formData.minStock} 
            onChange={handleInputChange}
            placeholder="Opcional: alertas de stock bajo"
          />
          {errors.minStock && <ValidationMessage $type="error">{errors.minStock}</ValidationMessage>}
        </FormGroup>
      </FormGrid>
      <ButtonGroup style={{ justifyContent: 'flex-end' }}>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button type="submit" $variant="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </ButtonGroup>
    </form>
  );
};

export default EditarProductoModal;