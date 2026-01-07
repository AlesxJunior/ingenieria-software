import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';

// ============================================
// TIPOS
// ============================================

interface Product {
  id: string;
  codigo: string;
  nombre: string;
}

interface Warehouse {
  id: string;
  codigo: string;
  nombre: string;
}

interface ModalNuevaTransferenciaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preloadedData?: {
    productId?: string;
    warehouseToId?: string;
  };
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const ModalNuevaTransferencia: React.FC<ModalNuevaTransferenciaProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  preloadedData
}) => {
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<Product[]>([]);
  const [almacenes, setAlmacenes] = useState<Warehouse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    productoNombre: '',
    warehouseFromId: '',
    warehouseToId: '',
    cantidad: '',
    motivoTransferencia: '',
    observaciones: ''
  });

  const [stockDisponible, setStockDisponible] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cargar productos y almacenes al abrir modal
  useEffect(() => {
    if (isOpen) {
      loadProductos();
      loadAlmacenes();
    }
  }, [isOpen]);

  // Efecto separado para precargar datos cuando productos ya están cargados
  useEffect(() => {
    if (isOpen && preloadedData && productos.length > 0) {
      // Buscar el producto en la lista para obtener su nombre
      if (preloadedData.productId) {
        const producto = productos.find(p => p.id === preloadedData.productId);
        
        if (producto) {
          setFormData(prev => ({
            ...prev,
            productId: producto.id,
            productoNombre: producto.nombre,
            warehouseToId: preloadedData.warehouseToId || prev.warehouseToId,
          }));
          setSearchTerm(producto.nombre);
          setShowDropdown(false); // Cerrar dropdown ya que el producto está seleccionado
        }
      } else if (preloadedData.warehouseToId) {
        // Solo precarga almacén destino
        setFormData(prev => ({
          ...prev,
          warehouseToId: preloadedData.warehouseToId || '',
        }));
      }
    }
  }, [isOpen, preloadedData, productos]);

  // Limpiar formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        productId: '',
        productoNombre: '',
        warehouseFromId: '',
        warehouseToId: '',
        cantidad: '',
        motivoTransferencia: '',
        observaciones: ''
      });
      setSearchTerm('');
      setStockDisponible(null);
      setError(null);
      setShowDropdown(false);
    }
  }, [isOpen]);

  // Verificar stock cuando cambian producto y almacén origen
  useEffect(() => {
    if (formData.productId && formData.warehouseFromId) {
      checkStock();
    } else {
      setStockDisponible(null);
    }
  }, [formData.productId, formData.warehouseFromId]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const loadProductos = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/products`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit: 100 } // Cargar todos los productos (activos e inactivos)
        }
      );
      
      console.log('📦 Response productos:', response.data);
      // El endpoint de productos devuelve { data: { products: [...] } }
      const productosData = response.data.data?.products || response.data.data?.rows || [];
      console.log('📦 Productos cargados:', productosData.length, productosData);
      setProductos(productosData);
    } catch (err) {
      console.error('❌ Error loading productos:', err);
      setProductos([]); // Asegurar array vacío en caso de error
    }
  };

  const loadAlmacenes = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/warehouses`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = response.data.data;
      // Asegurar que siempre sea un array
      const almacenesArray = Array.isArray(data) ? data : (data?.rows || []);
      setAlmacenes(almacenesArray);
    } catch (err) {
      console.error('Error loading almacenes:', err);
      setAlmacenes([]); // Asegurar array vacío en caso de error
    }
  };

  const checkStock = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/stock`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            productId: formData.productId,
            almacenId: formData.warehouseFromId,
            limit: 1
          }
        }
      );

      const stock = response.data.data?.rows?.[0];
      setStockDisponible(stock?.cantidad || 0);
    } catch (err) {
      console.error('Error checking stock:', err);
      setStockDisponible(0);
    }
  };

  // Asegurar que productos sea un array antes de filtrar
  const productosFiltrados = Array.isArray(productos)
    ? searchTerm
      ? productos.filter(p => 
          p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : productos // Mostrar todos los productos si no hay búsqueda
    : [];
  
  console.log('🔍 Total productos:', productos.length);
  console.log('🔍 SearchTerm:', searchTerm);
  console.log('🔍 Productos filtrados:', productosFiltrados.length);

  const handleSelectProducto = (producto: Product) => {
    setFormData({
      ...formData,
      productId: producto.id,
      productoNombre: producto.nombre
    });
    setSearchTerm(producto.nombre);
    setShowDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.productId) {
      setError('Debe seleccionar un producto');
      return;
    }

    if (!formData.warehouseFromId) {
      setError('Debe seleccionar un almacén de origen');
      return;
    }

    if (!formData.warehouseToId) {
      setError('Debe seleccionar un almacén de destino');
      return;
    }

    if (formData.warehouseFromId === formData.warehouseToId) {
      setError('Los almacenes de origen y destino deben ser diferentes');
      return;
    }

    const cantidad = parseInt(formData.cantidad);
    if (!cantidad || cantidad <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }

    if (stockDisponible !== null && cantidad > stockDisponible) {
      setError(`Stock insuficiente. Disponible: ${stockDisponible} unidades`);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/inventory/transfers`,
        {
          productId: formData.productId,
          cantidad,
          warehouseFromId: formData.warehouseFromId,
          warehouseToId: formData.warehouseToId,
          motivoTransferencia: formData.motivoTransferencia || undefined,
          observaciones: formData.observaciones || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Resetear formulario
      setFormData({
        productId: '',
        productoNombre: '',
        warehouseFromId: '',
        warehouseToId: '',
        cantidad: '',
        motivoTransferencia: '',
        observaciones: ''
      });
      setSearchTerm('');
      setStockDisponible(null);

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating transfer:', err);
      setError(err.response?.data?.message || 'Error al crear la transferencia');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Asegurar que almacenes sea un array antes de filtrar
  const almacenesDestino = Array.isArray(almacenes) 
    ? almacenes.filter(a => a.id !== formData.warehouseFromId)
    : [];

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <Title>Nueva Transferencia</Title>
          <CloseButton onClick={onClose}>✕</CloseButton>
        </ModalHeader>

        <ModalBody>
          {error && (
            <ErrorBanner>
              ⚠️ {error}
            </ErrorBanner>
          )}

          <Form onSubmit={handleSubmit}>
            {/* Producto (Autocomplete) */}
            <FormGroup>
              <Label>
                Producto <Required>*</Required>
              </Label>
              <AutocompleteContainer ref={autocompleteRef}>
                <Input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowDropdown(true);
                    // Limpiar selección si se modifica el texto
                    if (formData.productId) {
                      setFormData({ ...formData, productId: '', productoNombre: '' });
                    }
                  }}
                  onFocus={() => setShowDropdown(true)}
                  autoComplete="off"
                />
                {/* Campo oculto para validación HTML5 */}
                <input
                  type="hidden"
                  value={formData.productId}
                  required
                />
                {formData.productId && (
                  <div style={{ fontSize: '0.85rem', color: '#28a745', marginTop: '0.25rem' }}>
                    ✓ Producto seleccionado: <strong>{formData.productoNombre}</strong>
                  </div>
                )}
                {showDropdown && (
                  <Dropdown>
                    {productos.length === 0 ? (
                      <DropdownItem $disabled>
                        {loading ? 'Cargando productos...' : 'No hay productos disponibles'}
                      </DropdownItem>
                    ) : productosFiltrados.length === 0 ? (
                      <DropdownItem $disabled>
                        No se encontraron productos con "{searchTerm}"
                      </DropdownItem>
                    ) : (
                      productosFiltrados.slice(0, 10).map((producto) => (
                        <DropdownItem
                          key={producto.id}
                          onClick={() => handleSelectProducto(producto)}
                        >
                          <ProductCode>{producto.codigo}</ProductCode>
                          <ProductName>{producto.nombre}</ProductName>
                        </DropdownItem>
                      ))
                    )}
                  </Dropdown>
                )}
              </AutocompleteContainer>
            </FormGroup>

            {/* Almacén Origen */}
            <FormGroup>
              <Label>
                Almacén Origen <Required>*</Required>
              </Label>
              <Select
                value={formData.warehouseFromId}
                onChange={(e) => setFormData({ ...formData, warehouseFromId: e.target.value })}
                required
              >
                <option value="">Seleccionar almacén...</option>
                {Array.isArray(almacenes) && almacenes.map((almacen) => (
                  <option key={almacen.id} value={almacen.id}>
                    {almacen.nombre}
                  </option>
                ))}
              </Select>
            </FormGroup>

            {/* Almacén Destino */}
            <FormGroup>
              <Label>
                Almacén Destino <Required>*</Required>
              </Label>
              <Select
                value={formData.warehouseToId}
                onChange={(e) => setFormData({ ...formData, warehouseToId: e.target.value })}
                required
                disabled={!formData.warehouseFromId}
              >
                <option value="">Seleccionar almacén...</option>
                {Array.isArray(almacenesDestino) && almacenesDestino.map((almacen) => (
                  <option key={almacen.id} value={almacen.id}>
                    {almacen.nombre}
                  </option>
                ))}
              </Select>
              {!formData.warehouseFromId && (
                <HelpText>Primero seleccione el almacén de origen</HelpText>
              )}
            </FormGroup>

            {/* Cantidad con Stock Disponible */}
            <FormGroup>
              <Label>
                Cantidad <Required>*</Required>
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="Cantidad a transferir"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
              {stockDisponible !== null && (
                <StockInfo $available={stockDisponible > 0}>
                  {stockDisponible > 0 ? (
                    <>✅ Stock disponible: <strong>{stockDisponible} unidades</strong></>
                  ) : (
                    <>⚠️ Sin stock disponible en almacén origen</>
                  )}
                </StockInfo>
              )}
            </FormGroup>

            {/* Motivo */}
            <FormGroup>
              <Label>Motivo de la Transferencia</Label>
              <Input
                type="text"
                placeholder="Ejemplo: Reabastecimiento de tienda"
                value={formData.motivoTransferencia}
                onChange={(e) => setFormData({ ...formData, motivoTransferencia: e.target.value })}
              />
            </FormGroup>

            {/* Observaciones */}
            <FormGroup>
              <Label>Observaciones</Label>
              <TextArea
                placeholder="Notas adicionales sobre la transferencia..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                rows={3}
              />
            </FormGroup>
          </Form>
        </ModalBody>

        <ModalFooter>
          <Button type="button" $variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" $variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Creando...' : '✓ Crear Transferencia'}
          </Button>
        </ModalFooter>
      </ModalContainer>
    </Overlay>
  );
};

// ============================================
// STYLED COMPONENTS
// ============================================

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
`;

const Title = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f1f3f5;
    color: #495057;
  }
`;

const ModalBody = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const ErrorBanner = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
`;

const Required = styled.span`
  color: #dc3545;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background: #f1f3f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background: #f1f3f5;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const AutocompleteContainer = styled.div`
  position: relative;
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ced4da;
  border-top: none;
  border-radius: 0 0 6px 6px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const DropdownItem = styled.div<{ $disabled?: boolean }>`
  padding: 0.75rem 1rem;
  cursor: ${props => props.$disabled ? 'default' : 'pointer'};
  transition: background 0.2s ease;
  border-bottom: 1px solid #f1f3f5;

  ${props => !props.$disabled && `
    &:hover {
      background: #f8f9fa;
    }
  `}

  &:last-child {
    border-bottom: none;
  }
`;

const ProductCode = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  font-family: 'Courier New', monospace;
`;

const ProductName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  margin-top: 0.25rem;
`;

const HelpText = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  font-style: italic;
`;

const StockInfo = styled.div<{ $available: boolean }>`
  font-size: 0.9rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: ${props => props.$available ? '#d4edda' : '#fff3cd'};
  color: ${props => props.$available ? '#155724' : '#856404'};
  border: 1px solid ${props => props.$available ? '#c3e6cb' : '#ffeeba'};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  background: ${props => props.$variant === 'secondary' ? '#6c757d' : '#007bff'};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.$variant === 'secondary' ? '#5a6268' : '#0056b3'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export default ModalNuevaTransferencia;
