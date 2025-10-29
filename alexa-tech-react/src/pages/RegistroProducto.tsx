import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../context/NotificationContext';
import { apiService } from '../utils/api';
import { media } from '../styles/breakpoints';
import { CATEGORY_OPTIONS, UNIT_OPTIONS } from '../utils/productOptions';
import { WAREHOUSE_OPTIONS as WAREHOUSE_SELECT_OPTIONS } from '../constants/warehouses';

const FormContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
  
  ${media.tablet} {
    padding: 20px;
    margin: 0 1rem;
  }
  
  ${media.mobile} {
    padding: 15px;
    margin: 0 0.5rem;
    border-radius: 6px;
  }
`;

const FormTitle = styled.h2`
  color: #00224d;
  margin-bottom: 30px;
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  
  ${media.tablet} {
    font-size: 22px;
    margin-bottom: 25px;
  }
  
  ${media.mobile} {
    font-size: 20px;
    margin-bottom: 20px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;

  ${media.tablet} {
    grid-template-columns: 1fr;
    gap: 15px;
    margin-bottom: 25px;
  }
  
  ${media.mobile} {
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 14px;
  color: #555;
  font-weight: 500;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #0047b3;
  }

  &::placeholder {
    color: #a0a0a0;
  }
  
  ${media.mobile} {
    padding: 14px 15px;
    font-size: 16px; /* Evita zoom en iOS */
    min-height: 44px; /* Tamaño mínimo de toque */
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.3s;
  background-color: white;

  &:focus {
    border-color: #0047b3;
  }
  
  ${media.mobile} {
    padding: 14px 15px;
    font-size: 16px; /* Evita zoom en iOS */
    min-height: 44px; /* Tamaño mínimo de toque */
  }
`;

const FormActions = styled.div`
  text-align: center;
  margin-top: 25px;
`;

const SubmitButton = styled.button`
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  background-color: #0047b3;
  color: #fff;

  &:hover {
    background-color: #003380;
    transform: translateY(-2px);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
  }
  
  ${media.mobile} {
    padding: 14px 30px;
    font-size: 16px;
    min-height: 48px; /* Tamaño mínimo de toque */
    width: 100%;
  }
`;

const ErrorMessage = styled.span`
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  border: 1px solid #c3e6cb;
`;

interface ProductFormData {
  productCode: string;
  productName: string;
  category: string;
  price: string;
  initialStock: string;
  warehouseId: string;
  unit: string;
}

interface FormErrors {
  [key: string]: string | undefined;
  productCode?: string;
  productName?: string;
  category?: string;
  price?: string;
  initialStock?: string;
  warehouseId?: string;
  unit?: string;
}

const RegistroProducto: React.FC = () => {
  const { addProduct, products } = useProducts();
  const { showSuccess, showError } = useNotification();
  
  const [formData, setFormData] = useState<ProductFormData>({
    productCode: '',
    productName: '',
    category: '',
    price: '',
    initialStock: '',
    warehouseId: '',
    unit: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Opciones de almacén (fallback estático + fetch real)
  const [warehouseOptions, setWarehouseOptions] = useState<{ id: string; name: string }[]>(WAREHOUSE_SELECT_OPTIONS.map(o => ({ id: o.value, name: o.label })));
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await apiService.getWarehouses();
        const list = (resp.data?.warehouses || resp.data || []) as Array<{ id: string; nombre: string }>;
        if (Array.isArray(list) && mounted) {
          setWarehouseOptions(list.map(w => ({ id: w.id, name: w.nombre })));
        }
      } catch (e) {
        // fallback ya set, no romper UI
        console.warn('No se pudieron cargar almacenes, usando fallback');
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Fusionar opciones dinámicas desde BD con opciones por defecto
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

  // Eliminado: locationOptions y campo ubicacion

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    if (name === 'price' && value) {
      const price = Number(value);
      if (isNaN(price) || price <= 0) {
        setErrors(prev => ({
          ...prev,
          price: 'El precio debe ser un número mayor a 0'
        }));
      }
    }

    if (name === 'initialStock' && value) {
      const stock = Number(value);
      if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        setErrors(prev => ({
          ...prev,
          initialStock: 'El stock debe ser un número entero mayor o igual a 0'
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.productCode.trim()) {
      newErrors.productCode = 'El código del producto es requerido';
    } else if (formData.productCode.length < 3) {
      newErrors.productCode = 'El código debe tener al menos 3 caracteres';
    }

    if (!formData.productName.trim()) {
      newErrors.productName = 'El nombre del producto es requerido';
    } else if (formData.productName.length < 2) {
      newErrors.productName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const price = Number(formData.price);
      if (isNaN(price)) {
        newErrors.price = 'El precio debe ser un número válido';
      } else if (price <= 0) {
        newErrors.price = 'El precio debe ser mayor a 0';
      } else if (price > 999999.99) {
        newErrors.price = 'El precio no puede exceder 999,999.99';
      }
    }

    if (!formData.initialStock.trim()) {
      newErrors.initialStock = 'El stock inicial es requerido';
    } else {
      const stock = Number(formData.initialStock);
      if (isNaN(stock)) {
        newErrors.initialStock = 'El stock debe ser un número válido';
      } else if (stock < 0) {
        newErrors.initialStock = 'El stock no puede ser negativo';
      } else if (!Number.isInteger(stock)) {
        newErrors.initialStock = 'El stock debe ser un número entero';
      } else if (stock > 0 && !formData.warehouseId) {
        newErrors.warehouseId = 'Selecciona un almacén para el stock inicial';
      }
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad de medida es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const initial = parseInt(formData.initialStock);
      const payload = {
        codigo: formData.productCode,
        nombre: formData.productName,
        categoria: formData.category,
        precioVenta: parseFloat(formData.price),
        estado: true,
        unidadMedida: formData.unit.toLowerCase(),
        stockInitial: initial > 0 ? { warehouseId: formData.warehouseId, cantidad: initial } : undefined,
      };

      const response = await apiService.createProduct(payload);
      if (!response.success) {
        throw new Error(response.message || 'Error al registrar el producto');
      }

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
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      
      setFormData({
        productCode: '',
        productName: '',
        category: '',
        price: '',
        initialStock: '',
        warehouseId: '',
        unit: ''
      });

    } catch (error) {
      console.error('Error al registrar producto:', error);
      showError('Error al registrar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Registrar Producto">
      <FormContainer>
        <FormTitle>Registrar Producto Nuevo</FormTitle>
        
        {showSuccessMessage && (
          <SuccessMessage>
            ¡Producto registrado exitosamente!
          </SuccessMessage>
        )}

        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="productCode">Código de Producto *</Label>
              <Input
                type="text"
                id="productCode"
                name="productCode"
                value={formData.productCode}
                onChange={handleInputChange}
                placeholder="Ej. CAM-IP-001"
              />
              {errors.productCode && <ErrorMessage>{errors.productCode}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="productName">Nombre *</Label>
              <Input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Ej. Cámara de Seguridad Wi-Fi"
              />
              {errors.productName && <ErrorMessage>{errors.productName}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="category">Categoría *</Label>
              <Select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="">Selecciona una categoría</option>
                {categoryOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="price">Precio de Venta *</Label>
              <Input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Ej. 150.00"
                step="0.01"
                min="0"
              />
              {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="initialStock">Stock Inicial *</Label>
              <Input
                type="number"
                id="initialStock"
                name="initialStock"
                value={formData.initialStock}
                onChange={handleInputChange}
                placeholder="Ej. 50"
                min="0"
              />
              {errors.initialStock && <ErrorMessage>{errors.initialStock}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="stockWarehouse">Almacén para Stock Inicial *</Label>
              <Select
                id="stockWarehouse"
                name="warehouseId"
                value={formData.warehouseId}
                onChange={handleInputChange}
              >
                <option value="">Selecciona un almacén</option>
                {warehouseOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </Select>
              {errors.warehouseId && <ErrorMessage>{errors.warehouseId}</ErrorMessage>}
            </FormGroup>

            {/* Eliminado: campo Ubicación */}

            <FormGroup>
              <Label htmlFor="unit">Unidad de Medida *</Label>
              <Select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
              >
                <option value="">Selecciona unidad</option>
                {unitOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
              {errors.unit && <ErrorMessage>{errors.unit}</ErrorMessage>}
            </FormGroup>
          </FormGrid>

          <FormActions>
            <SubmitButton type="submit" disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Registrar'}</SubmitButton>
          </FormActions>
        </form>
      </FormContainer>
    </Layout>
  );
}

export default RegistroProducto;