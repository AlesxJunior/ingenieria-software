import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { useApp } from '../hooks/useApp';

const FormContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  label {
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
    font-size: 14px;
  }

  input, select {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 14px;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: #007bff;
    }

    &::placeholder {
      color: #999;
    }
  }

  .error {
    color: #dc3545;
    font-size: 12px;
    margin-top: 4px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  ${props => props.$variant === 'primary' ? `
    background-color: #007bff;
    color: white;
    
    &:hover {
      background-color: #0056b3;
    }

    &:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  ` : `
    background-color: #6c757d;
    color: white;
    
    &:hover {
      background-color: #5a6268;
    }
  `}
`;

interface ProductFormData {
  productCode: string;
  productName: string;
  category: string;
  price: string;
  initialStock: string;
  status: string;
  warranty: string;
  unit: string;
}

interface FormErrors {
  [key: string]: string | undefined;
  productCode?: string;
  productName?: string;
  category?: string;
  price?: string;
  initialStock?: string;
  unit?: string;
  warranty?: string;
}

const EditarProducto: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getProductById, updateProduct, showSuccess, showError } = useApp();
  
  const [formData, setFormData] = useState<ProductFormData>({
    productCode: '',
    productName: '',
    category: '',
    price: '',
    initialStock: '',
    status: 'active',
    warranty: '',
    unit: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      const product = getProductById(id);
      if (product) {
        setFormData({
          productCode: product.productCode,
          productName: product.productName,
          category: product.category,
          price: product.price.toString(),
          initialStock: product.currentStock.toString(),
          status: product.status,
          warranty: product.warranty || '',
          unit: product.unit
        });
      } else {
        showError('Producto no encontrado');
        navigate('/lista-productos');
      }
    }
  }, [id, getProductById, showError, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validación en tiempo real para campos numéricos
    if (name === 'price' && value) {
      const price = parseFloat(value);
      if (isNaN(price) || price <= 0) {
        setErrors(prev => ({
          ...prev,
          price: 'El precio debe ser un número mayor a 0'
        }));
      }
    }

    if (name === 'initialStock' && value) {
      const stock = parseInt(value);
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

    // Validar código de producto
    if (!formData.productCode.trim()) {
      newErrors.productCode = 'El código del producto es requerido';
    } else if (formData.productCode.length < 3) {
      newErrors.productCode = 'El código debe tener al menos 3 caracteres';
    }

    // Validar nombre del producto
    if (!formData.productName.trim()) {
      newErrors.productName = 'El nombre del producto es requerido';
    } else if (formData.productName.length < 2) {
      newErrors.productName = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar categoría
    if (!formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    // Validar precio
    if (!formData.price.trim()) {
      newErrors.price = 'El precio es requerido';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        newErrors.price = 'El precio debe ser un número válido';
      } else if (price <= 0) {
        newErrors.price = 'El precio debe ser mayor a 0';
      } else if (price > 999999.99) {
        newErrors.price = 'El precio no puede ser mayor a 999,999.99';
      }
    }

    // Validar stock inicial
    if (!formData.initialStock.trim()) {
      newErrors.initialStock = 'El stock inicial es requerido';
    } else {
      const stock = parseInt(formData.initialStock);
      if (isNaN(stock)) {
        newErrors.initialStock = 'El stock debe ser un número válido';
      } else if (stock < 0) {
        newErrors.initialStock = 'El stock no puede ser negativo';
      } else if (!Number.isInteger(stock)) {
        newErrors.initialStock = 'El stock debe ser un número entero';
      }
    }

    // Validar unidad
    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad es requerida';
    }

    // Validar garantía (opcional)
    if (formData.warranty && formData.warranty.trim()) {
      if (formData.warranty.length < 2) {
        newErrors.warranty = 'La garantía debe tener al menos 2 caracteres';
      }
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
      if (id) {
        updateProduct(id, {
          productCode: formData.productCode,
          productName: formData.productName,
          category: formData.category,
          price: parseFloat(formData.price),
          currentStock: parseInt(formData.initialStock),
          status: formData.status as 'disponible' | 'agotado' | 'proximamente',
          warranty: formData.warranty || undefined,
          unit: formData.unit
        });

        showSuccess('Producto actualizado exitosamente');
        navigate('/lista-productos');
      }
    } catch {
      showError('Error al actualizar el producto. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/lista-productos');
  };

  return (
    <Layout title="Editar Producto">
      <FormContainer>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <label htmlFor="productCode">Código del Producto *</label>
              <input
                type="text"
                id="productCode"
                name="productCode"
                value={formData.productCode}
                onChange={handleInputChange}
                placeholder="Ej: PROD001"
                disabled={isSubmitting}
              />
              {errors.productCode && <div className="error">{errors.productCode}</div>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="productName">Nombre del Producto *</label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Ej: Laptop Dell Inspiron"
                disabled={isSubmitting}
              />
              {errors.productName && <div className="error">{errors.productName}</div>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="category">Categoría *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar categoría</option>
                <option value="Electrónicos">Electrónicos</option>
                <option value="Ropa">Ropa</option>
                <option value="Hogar">Hogar</option>
                <option value="Deportes">Deportes</option>
                <option value="Libros">Libros</option>
                <option value="Otros">Otros</option>
              </select>
              {errors.category && <div className="error">{errors.category}</div>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="price">Precio *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isSubmitting}
              />
              {errors.price && <div className="error">{errors.price}</div>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="initialStock">Stock *</label>
              <input
                type="number"
                id="initialStock"
                name="initialStock"
                value={formData.initialStock}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                disabled={isSubmitting}
              />
              {errors.initialStock && <div className="error">{errors.initialStock}</div>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="unit">Unidad *</label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="">Seleccionar unidad</option>
                <option value="Unidad">Unidad</option>
                <option value="Kilogramo">Kilogramo</option>
                <option value="Litro">Litro</option>
                <option value="Metro">Metro</option>
                <option value="Caja">Caja</option>
                <option value="Paquete">Paquete</option>
              </select>
              {errors.unit && <div className="error">{errors.unit}</div>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="status">Estado</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isSubmitting}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </FormGroup>

            <FormGroup>
              <label htmlFor="warranty">Garantía (Opcional)</label>
              <input
                type="text"
                id="warranty"
                name="warranty"
                value={formData.warranty}
                onChange={handleInputChange}
                placeholder="Ej: 12 meses"
                disabled={isSubmitting}
              />
              {errors.warranty && <div className="error">{errors.warranty}</div>}
            </FormGroup>
          </FormGrid>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" $variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Actualizando...' : 'Actualizar Producto'}
            </Button>
          </ButtonGroup>
        </form>
      </FormContainer>
    </Layout>
  );
};

export default EditarProducto;