import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import { configuracionApi } from '../../../services/configuracionApi';
import type { ProductCategory, UnitOfMeasure } from '../../../types/configuracion';
import { WAREHOUSE_OPTIONS as WAREHOUSE_SELECT_OPTIONS } from '../../../constants/warehouses';

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
  descripcion: string;
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
  const [codigoExists, setCodigoExists] = useState(false);
  const [checkingCodigo, setCheckingCodigo] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    productCode: '',
    productName: '',
    descripcion: '',
    category: '',
    price: '',
    initialStock: '',
    warehouseId: '',
    unit: '',
    minStock: ''
  });
  const [warehouseOptions, setWarehouseOptions] = useState<{ id: string; name: string }[]>(WAREHOUSE_SELECT_OPTIONS.map(o => ({ id: o.value, name: o.label })));
  const [categorias, setCategorias] = useState<ProductCategory[]>([]);
  const [unidades, setUnidades] = useState<UnitOfMeasure[]>([]);

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
          console.log('[NuevoProductoModal] Maestros cargados:', { categorias: cats.length, unidades: units.length });
        }
      } catch (e) {
        console.error('[NuevoProductoModal] Error cargando maestros:', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Cargar almacenes
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

  // Función debounced para verificar código único
  const checkCodigoUnique = useCallback(
    async (codigo: string) => {
      if (codigo.length < 3) {
        setCodigoExists(false);
        return;
      }
      
      setCheckingCodigo(true);
      try {
        const response = await apiService.getProductByCodigo(codigo);
        setCodigoExists(response.success && response.data ? true : false);
        
        if (response.success && response.data) {
          setErrors(prev => ({ 
            ...prev, 
            productCode: `El código "${codigo}" ya existe` 
          }));
        }
      } catch (error) {
        setCodigoExists(false);
      } finally {
        setCheckingCodigo(false);
      }
    },
    []
  );

  // Debounce timer para evitar múltiples llamadas
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.productCode) {
        checkCodigoUnique(formData.productCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.productCode, checkCodigoUnique]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Limpiar error de código duplicado cuando el usuario cambia el código
    if (name === 'productCode') {
      setCodigoExists(false);
      if (errors.productCode && errors.productCode.includes('ya existe')) {
        setErrors(prev => ({ ...prev, productCode: undefined }));
      }
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
    else if (codigoExists) newErrors.productCode = `El código "${formData.productCode}" ya existe`;
    
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
      const initial = parseInt(formData.initialStock || '0');
      const minStock = formData.minStock.trim() ? parseInt(formData.minStock) : undefined;
      
      const payload = {
        codigo: formData.productCode,
        nombre: formData.productName,
        descripcion: formData.descripcion.trim() || undefined,
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
        descripcion: payload.descripcion,
        category: payload.categoria,
        price: payload.precioVenta,
        initialStock: initial,
        currentStock: initial,
        minStock: minStock,
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
          <div style={{ position: 'relative' }}>
            <input 
              id="productCode" 
              name="productCode" 
              type="text" 
              value={formData.productCode} 
              onChange={handleInputChange}
              style={{
                borderColor: codigoExists ? '#e74c3c' : (formData.productCode && !checkingCodigo && !codigoExists) ? '#27ae60' : undefined,
                paddingRight: '30px'
              }}
            />
            {checkingCodigo && (
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#7f8c8d' }}>
                ⏳
              </span>
            )}
            {!checkingCodigo && formData.productCode && codigoExists && (
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#e74c3c' }}>
                ✗
              </span>
            )}
            {!checkingCodigo && formData.productCode && !codigoExists && (
              <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', color: '#27ae60' }}>
                ✓
              </span>
            )}
          </div>
          {errors.productCode && <span className="error">{errors.productCode}</span>}
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
        <Button 
          type="submit" 
          $variant="primary" 
          disabled={isSubmitting || checkingCodigo || codigoExists}
        >
          {isSubmitting ? 'Guardando...' : checkingCodigo ? 'Verificando...' : 'Registrar'}
        </Button>
      </Actions>
    </form>
  );
};

export default NuevoProductoModal;