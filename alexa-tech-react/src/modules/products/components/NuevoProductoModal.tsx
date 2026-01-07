import React, { useState, useMemo, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useProducts } from '../context/ProductContext';
import { useNotification } from '../../../context/NotificationContext';
import { apiService } from '../../../utils/api';
import { configuracionApi } from '../../../services/configuracionApi';
import type { ProductCategory, UnitOfMeasure } from '../../../types/configuracion';
import { WAREHOUSE_OPTIONS as WAREHOUSE_SELECT_OPTIONS } from '../../../constants/warehouses';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS, Z_INDEX, TRANSITIONS } from '../../../styles/theme';
import { Button, Input, Select, Label, RequiredMark, ValidationMessage, ButtonGroup } from '../../../components/shared';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${Z_INDEX.modal};
  padding: ${SPACING.lg};
  
  @media (max-width: 768px) {
    padding: 0;
  }
`;

const ModalWrapper = styled.div`
  position: relative;
  max-width: 900px;
  width: 95vw;
  max-height: 85vh;
  background: white;
  border-radius: ${BORDER_RADIUS.md};
  box-shadow: ${SHADOWS.xl};
  overflow: hidden;
  
  @media (max-width: 768px) {
    width: 100vw;
    max-height: 95vh;
    border-radius: 0;
  }
`;

const ModalContent = styled.div`
  max-height: 85vh;
  overflow-y: auto;
  padding: ${SPACING.xl};
  
  @media (max-width: 768px) {
    max-height: 95vh;
    padding: ${SPACING.md};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${SPACING.xl};
  padding-bottom: ${SPACING.md};
  border-bottom: 2px solid ${COLORS.border.light};
  
  h2 {
    font-size: ${TYPOGRAPHY.fontSize.h3};
    color: ${COLORS.text.primary};
    margin: 0;
    font-weight: ${TYPOGRAPHY.fontWeight.semibold};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: ${COLORS.text.muted};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${BORDER_RADIUS.sm};
  transition: ${TRANSITIONS.fast};
  
  &:hover {
    background: ${COLORS.background.secondary};
    color: ${COLORS.text.primary};
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${SPACING.lg};
  margin-bottom: ${SPACING.xl};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${SPACING.md};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${SPACING.xs};
`;

const FullWidthGroup = styled(FormGroup)`
  grid-column: 1 / -1;
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
  margin-top: ${SPACING.xs};
  display: block;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const StatusIcon = styled.span<{ $type: 'loading' | 'success' | 'error' }>`
  position: absolute;
  right: ${SPACING.sm};
  top: 38px;
  font-size: ${TYPOGRAPHY.fontSize.xs};
  color: ${props => 
    props.$type === 'loading' ? COLORS.text.muted :
    props.$type === 'success' ? COLORS.success :
    COLORS.danger
  };
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
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalWrapper>
        <ModalContent>
          <ModalHeader>
            <h2>Crear Nuevo Producto</h2>
            <CloseButton onClick={onClose} type="button">
              ×
            </CloseButton>
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <FormGrid>
        <FormGroup>
          <Label htmlFor="productCode">
            Código
            <RequiredMark />
          </Label>
          <InputWrapper>
            <Input 
              id="productCode" 
              name="productCode" 
              type="text" 
              value={formData.productCode} 
              onChange={handleInputChange}
              style={{
                borderColor: codigoExists ? COLORS.danger : (formData.productCode && !checkingCodigo && !codigoExists) ? COLORS.success : undefined,
                paddingRight: '30px'
              }}
            />
            {checkingCodigo && <StatusIcon $type="loading">⏳</StatusIcon>}
            {!checkingCodigo && formData.productCode && codigoExists && <StatusIcon $type="error">✗</StatusIcon>}
            {!checkingCodigo && formData.productCode && !codigoExists && <StatusIcon $type="success">✓</StatusIcon>}
          </InputWrapper>
          {errors.productCode && <ValidationMessage $type="error">{errors.productCode}</ValidationMessage>}
        </FormGroup>
        <FormGroup>
          <Label htmlFor="productName">
            Nombre
            <RequiredMark />
          </Label>
          <Input id="productName" name="productName" type="text" value={formData.productName} onChange={handleInputChange} />
          {errors.productName && <ValidationMessage $type="error">{errors.productName}</ValidationMessage>}
        </FormGroup>
        <FullWidthGroup>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea 
            id="descripcion" 
            name="descripcion" 
            maxLength={500}
            value={formData.descripcion} 
            onChange={handleInputChange}
            placeholder="Descripción detallada del producto (opcional, máx 500 caracteres)"
          />
          <CharCounter>
            {formData.descripcion.length}/500 caracteres
          </CharCounter>
          {errors.descripcion && <ValidationMessage $type="error">{errors.descripcion}</ValidationMessage>}
        </FullWidthGroup>
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
          <Label htmlFor="initialStock">
            Stock inicial
            <RequiredMark />
          </Label>
          <Input id="initialStock" name="initialStock" type="number" min="0" value={formData.initialStock} onChange={handleInputChange} />
          {errors.initialStock && <ValidationMessage $type="error">{errors.initialStock}</ValidationMessage>}
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
          <Label htmlFor="warehouseId">
            Almacén para Stock Inicial
            <RequiredMark />
          </Label>
          <Select id="warehouseId" name="warehouseId" value={formData.warehouseId} onChange={handleInputChange}>
            <option value="">Selecciona un almacén</option>
            {warehouseOptions.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
          </Select>
          {errors.warehouseId && <ValidationMessage $type="error">{errors.warehouseId}</ValidationMessage>}
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
      <ButtonGroup style={{ justifyContent: 'flex-end', marginTop: SPACING.xl, paddingTop: SPACING.lg, borderTop: `1px solid ${COLORS.border.light}` }}>
        <Button type="button" $variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button 
          type="submit" 
          $variant="primary" 
          disabled={isSubmitting || checkingCodigo || codigoExists}
        >
          {isSubmitting ? 'Guardando...' : checkingCodigo ? 'Verificando...' : 'Registrar'}
        </Button>
      </ButtonGroup>
    </form>
        </ModalContent>
      </ModalWrapper>
    </ModalOverlay>
  );
};

export default NuevoProductoModal;