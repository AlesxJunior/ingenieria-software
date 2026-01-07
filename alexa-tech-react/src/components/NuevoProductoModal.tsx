import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import { apiService } from '../utils/api';
import { CATEGORY_OPTIONS, UNIT_OPTIONS } from '../utils/productOptions';
import { WAREHOUSE_OPTIONS as WAREHOUSE_SELECT_OPTIONS } from '../constants/warehouses';
import { COLORS, COLOR_SCALES, SPACING, BORDER_RADIUS, TYPOGRAPHY, TRANSITIONS } from '../styles/theme';
import { Button as SharedButton } from './shared/Button';

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;

  label {
    font-size: ${TYPOGRAPHY.fontSize.xs};
    color: ${COLORS.text.secondary};
    font-weight: ${TYPOGRAPHY.fontWeight.medium};
    margin-bottom: ${SPACING.sm};
  }

  input, select {
    width: 100%;
    padding: ${SPACING.md} ${SPACING.lg};
    border: 1px solid ${COLORS.neutral[300]};
    border-radius: ${BORDER_RADIUS.md};
    font-size: ${TYPOGRAPHY.fontSize.sm};
    outline: none;
    transition: ${TRANSITIONS.default};
  }

  input:focus, select:focus {
    border-color: ${COLOR_SCALES.primary[500]};
  }

  .error {
    color: ${COLOR_SCALES.danger[500]};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    margin-top: ${SPACING.xs};
  }
`;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${SPACING.lg};
`;

interface ProductFormData {
  productCode: string;
  productName: string;
  category: string;
  price: string;
  initialStock: string;
  warehouseId: string;
  unit: string;
  minStock: string;
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
    warehouseId: '',
    unit: '',
    minStock: ''
  });
  const [warehouseOptions, setWarehouseOptions] = useState<{ id: string; name: string }[]>(WAREHOUSE_SELECT_OPTIONS.map(o => ({ id: o.value, name: o.label })));
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiService.getWarehouses();
        console.log('[NuevoProductoModal] Warehouses full response:', resp);
        console.log('[NuevoProductoModal] Warehouses resp.data:', resp.data);
        
        // La respuesta puede venir de varias formas según el ResponseHelper del backend
        const respData = resp.data as any;
        let list: any[] = [];
        
        if (respData?.data?.rows) {
          list = respData.data.rows;
        } else if (respData?.rows) {
          list = respData.rows;
        } else if (respData?.warehouses) {
          list = respData.warehouses;
        } else if (Array.isArray(respData)) {
          list = respData;
        }
        
        console.log('[NuevoProductoModal] Parsed warehouse list:', list);
        
        if (Array.isArray(list) && list.length > 0 && mounted) {
          // Filtrar solo almacenes activos
          const activeWarehouses = list.filter((w: any) => w.activo !== false);
          setWarehouseOptions(activeWarehouses.map((w: any) => ({ id: w.id, name: w.nombre })));
          console.log('[NuevoProductoModal] Warehouses loaded:', activeWarehouses.length);
        }
      } catch (e) {
        console.error('[NuevoProductoModal] Error loading warehouses:', e);
        console.warn('[NuevoProductoModal] Usando fallback warehouses');
      }
    })();
    return () => { mounted = false; };
  }, []);

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

    if (name === 'minStock' && value) {
      const minStock = Number(value);
      if (isNaN(minStock) || minStock < 0 || !Number.isInteger(minStock)) {
        setErrors(prev => ({ ...prev, minStock: 'El stock mínimo debe ser entero ≥ 0' }));
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
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        newErrors.initialStock = 'Stock inválido';
      } else if (stock > 0 && !formData.warehouseId) {
        newErrors.warehouseId = 'Selecciona almacén';
      }
    }

    if (!formData.unit.trim()) newErrors.unit = 'La unidad es requerida';

    if (formData.minStock.trim()) {
      const minStock = Number(formData.minStock);
      if (isNaN(minStock) || minStock < 0 || !Number.isInteger(minStock)) {
        newErrors.minStock = 'Stock mínimo inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const initial = parseInt(formData.initialStock || '0');
      const minStock = formData.minStock.trim() ? parseInt(formData.minStock) : undefined;
      
      const payload = {
        codigo: formData.productCode,
        nombre: formData.productName,
        categoria: formData.category,
        precioVenta: parseFloat(formData.price),
        estado: true,
        unidadMedida: formData.unit.toLowerCase(),
        minStock: minStock,
        stockInitial: initial > 0 ? { warehouseId: formData.warehouseId, cantidad: initial } : undefined,
      };

      const response = await apiService.createProduct(payload);
      if (!response.success) throw new Error(response.message || 'Error al registrar');

      const stockStatus = initial > 0 ? 'disponible' : 'agotado';

      addProduct({
        productCode: payload.codigo,
        productName: payload.nombre,
        category: payload.categoria,
        price: payload.precioVenta,
        initialStock: initial,
        currentStock: initial,
        status: stockStatus as 'disponible' | 'agotado',
        unit: payload.unidadMedida,
        isActive: payload.estado
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
          <label htmlFor="warehouseId">Almacén para Stock Inicial *</label>
          <select id="warehouseId" name="warehouseId" value={formData.warehouseId} onChange={handleInputChange}>
            <option value="">Selecciona un almacén</option>
            {warehouseOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </select>
          {errors.warehouseId && <span className="error">{errors.warehouseId}</span>}
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
        <Button type="submit" $variant="primary" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Registrar'}</Button>
      </Actions>
    </form>
  );
};

export default NuevoProductoModal;