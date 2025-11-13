import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useProducts, type Product } from '../../products/context/ProductContext';
import { useClients, type Client } from '../../clients/context/ClientContext';
import { useSales, type CreateSaleInput } from '../context/SalesContext';
import { useNotification } from '../../../context/NotificationContext';

// 🎨 NUEVO DISEÑO - Siguiendo el boceto HTML
const SalesContainer = styled.div`
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
`;

const CardTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
  font-size: 16px;
  color: #333;
`;

// 1. Grid para datos del comprobante (horizontal)
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-weight: 600;
  font-size: 13px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
  }
`;

const InputWithButton = styled.div`
  display: flex;
`;

const SearchButton = styled.button`
  padding: 10px 16px;
  background-color: #1e3a5f;
  color: white;
  border: none;
  border-radius: 0 6px 6px 0;
  cursor: pointer;
  margin-left: -1px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #2a528a;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 20px;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  label {
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
  }

  &::placeholder {
    color: #999;
  }
`;

// 2. Dropdown de búsqueda de productos
const SearchResultsDropdown = styled.div`
  position: absolute;
  width: 100%;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 6px 6px;
  margin-top: -2px;
  max-height: 250px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const SearchResultItem = styled.div`
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f4f7fa;
  }

  strong {
    display: block;
    color: #333;
    margin-bottom: 4px;
  }

  span {
    font-size: 13px;
    color: #555;
  }
`;

const NoResults = styled.div`
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 14px;
`;

// 3. Tabla del carrito
const CartTableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const CartTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 12px;
    border-bottom: 1px solid #e0e0e0;
    text-align: left;
    vertical-align: middle;
  }

  th {
    font-size: 13px;
    color: #555;
    font-weight: 600;
    background-color: #f9f9f9;
  }

  tbody tr:hover {
    background-color: #f4f7fa;
  }
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;

  &:hover {
    background: #f4f7fa;
    border-color: #1e3a5f;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const QuantityInput = styled.input`
  width: 60px;
  text-align: center;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #1e3a5f;
  }
`;

const RemoveButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: #c82333;
  }
`;

const EmptyCart = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #999;
  font-size: 14px;
`;

// 4. Resumen y botones (grid de 2 columnas)
const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TotalsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;

    &:last-child {
      border-bottom: none;
    }

    &.totals-main {
      font-size: 18px;
      font-weight: bold;
      color: #1e3a5f;
      border-top: 2px solid #1e3a5f;
      padding-top: 12px;
      margin-top: 8px;
    }

    span {
      color: #555;
    }

    strong {
      color: #333;
      font-weight: 600;
    }
  }
`;

const ButtonsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: #28a745;
          color: white;
          &:hover { background-color: #218838; }
        `;
      case 'secondary':
        return `
          background-color: #0d6efd;
          color: white;
          &:hover { background-color: #0b5ed7; }
        `;
      case 'danger':
        return `
          background-color: #dc3545;
          color: white;
          &:hover { background-color: #c82333; }
        `;
      default:
        return `
          background-color: #6c757d;
          color: white;
          &:hover { background-color: #5a6268; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Alerta para caja cerrada
const AlertCard = styled(Card)`
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  
  h3 {
    color: #856404;
    margin-top: 0;
  }

  p {
    color: #856404;
    margin-bottom: 1rem;
  }
`;

// Dropdown de clientes (autocompletado)
const AutocompleteContainer = styled.div`
  position: relative;
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  width: 100%;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 6px 6px;
  margin-top: -2px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const AutocompleteItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f4f7fa;
  }
`;

const ClientInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ClientName = styled.strong`
  color: #333;
  font-size: 14px;
`;

const ClientDocument = styled.span`
  color: #666;
  font-size: 12px;
`;

const SelectedClientCard = styled.div`
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const ClearButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #c82333;
  }
`;

interface CartItem {
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  stock: number;
}
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AlertCard = styled.div<{ $type: 'warning' | 'error' }>`
  background: ${props => props.$type === 'warning' ? '#fff3cd' : '#f8d7da'};
  border: 1px solid ${props => props.$type === 'warning' ? '#ffeaa7' : '#f5c6cb'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.$type === 'warning' ? '#856404' : '#721c24'};
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ToggleLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #2c3e50;
  cursor: pointer;
  user-select: none;
`;

const ToggleSwitch = styled.div<{ $checked: boolean }>`
  position: relative;
  width: 50px;
  height: 26px;
  background-color: ${props => props.$checked ? '#27ae60' : '#95a5a6'};
  border-radius: 13px;
  transition: background-color 0.3s;
  cursor: pointer;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$checked ? '26px' : '3px'};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: left 0.3s;
  }
`;

const ToggleInput = styled.input`
  display: none;
`;

const AutocompleteContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #e1e8ed;
  border-top: none;
  border-radius: 0 0 8px 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const AutocompleteItem = styled.div`
  padding: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f8f9fa;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ClientInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ClientName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.95rem;
`;

const ClientDocument = styled.div`
  color: #7f8c8d;
  font-size: 0.85rem;
`;

const SelectedClientCard = styled.div`
  background: #e8f5e9;
  border: 2px solid #4caf50;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ClearButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s;

  &:hover {
    background: #c0392b;
  }
`;

interface CartItem {
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  product: Product;
}

const RealizarVenta: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { clients } = useClients();
  const {
    activeCashSession,
    createSale,
    completeSale,
    createQuote,
    downloadInvoice,
    loading: salesLoading,
  } = useSales();
  const { addNotification } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [tipoComprobante, setTipoComprobante] = useState<'Boleta' | 'Factura' | 'NotaVenta'>('Boleta');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin'>('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null); // 🆕 Última venta para reimprimir
  const [includeIGV, setIncludeIGV] = useState(true); // 🆕 Toggle para IGV
  const [clientSearchTerm, setClientSearchTerm] = useState(''); // 🆕 Búsqueda de clientes
  const [showClientDropdown, setShowClientDropdown] = useState(false); // 🆕 Mostrar dropdown

  // Cargar almacenes disponibles
  const warehouses = [
    { id: 'WH-PRINCIPAL', name: 'Almacén Principal' },
    { id: 'WH-SECUNDARIO', name: 'Almacén Secundario' },
  ];

  // Validar caja abierta al cargar el componente
  useEffect(() => {
    if (!activeCashSession) {
      addNotification('error', 'Caja Cerrada', 'Debes abrir una caja antes de realizar ventas');
      navigate('/gestion-caja');
    }
  }, [activeCashSession, navigate, addNotification]);

  // Seleccionar primer almacén por defecto, pero dejar vacío para forzar selección
  useEffect(() => {
    // Dejamos selectedWarehouse vacío para forzar al usuario a seleccionar
    // Si queremos pre-seleccionar, descomentar:
    // if (warehouses.length > 0) {
    //   setSelectedWarehouse(warehouses[0].id);
    // }
  }, []);

  const filteredProducts = products.filter((product: Product) =>
    product.isActive &&
    product.status === 'disponible' &&
    product.currentStock > 0 &&
    (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 🆕 Filtrar clientes para autocompletado
  const filteredClients = clients.filter((client: Client) => {
    if (!clientSearchTerm) return false;
    const searchLower = clientSearchTerm.toLowerCase();
    const name = client.tipoDocumento === 'RUC' 
      ? (client.razonSocial || '').toLowerCase()
      : `${client.nombres || ''} ${client.apellidos || ''}`.trim().toLowerCase();
    const document = (client.numeroDocumento || '').toLowerCase();
    return name.includes(searchLower) || document.includes(searchLower);
  });

  // 🆕 Obtener cliente seleccionado
  const selectedClientData = clients.find((c: Client) => c.id === selectedClient);

  // 🆕 Manejar selección de cliente
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client.id);
    setClientSearchTerm('');
    setShowClientDropdown(false);
  };

  // 🆕 Limpiar selección de cliente
  const handleClearClient = () => {
    setSelectedClient('');
    setClientSearchTerm('');
  };

  const addToCart = (product: Product) => {
    // Validar almacén seleccionado PRIMERO
    if (!selectedWarehouse) {
      addNotification('warning', 'Almacén Requerido', '⚠️ Debes seleccionar un almacén antes de agregar productos');
      return;
    }

    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.cantidad < product.currentStock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { 
                ...item, 
                cantidad: item.cantidad + 1,
                subtotal: (item.cantidad + 1) * item.precioUnitario
              }
            : item
        ));
        addNotification('success', 'Producto Agregado', `${product.productName} (x${existingItem.cantidad + 1})`);
      } else {
        addNotification('warning', 'Stock Insuficiente', `Solo hay ${product.currentStock} unidades disponibles`);
      }
    } else {
      const newItem: CartItem = {
        productId: product.id,
        nombreProducto: product.productName,
        cantidad: 1,
        precioUnitario: product.price,
        subtotal: product.price,
        product
      };
      setCart([...cart, newItem]);
      addNotification('success', 'Producto Agregado', `${product.productName} añadido al carrito`);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find(item => item.productId === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.product.currentStock) {
      addNotification('warning', 'Stock Insuficiente', 'Cantidad excede el stock disponible');
      return;
    }

    setCart(cart.map(item =>
      item.productId === productId
        ? { 
            ...item, 
            cantidad: newQuantity,
            subtotal: newQuantity * item.precioUnitario
          }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedClient('');
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateTax = () => {
    return includeIGV ? calculateSubtotal() * 0.18 : 0; // 🆕 IGV solo si está activado
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount);
  };

  const processSale = async () => {
    if (!activeCashSession) {
      addNotification('error', 'Caja Cerrada', 'No hay una caja abierta. Abre una caja antes de realizar ventas.');
      return;
    }

    if (cart.length === 0) {
      addNotification('warning', 'Carrito Vacío', 'Agrega productos al carrito antes de procesar la venta');
      return;
    }

    if (!selectedWarehouse) {
      addNotification('warning', 'Almacén Requerido', 'Selecciona un almacén');
      return;
    }

    setIsProcessing(true);

    try {
      // Paso 1: Crear venta (estado: Pendiente)
      const saleData: CreateSaleInput = {
        cashSessionId: activeCashSession.id,
        clienteId: selectedClient || undefined,
        almacenId: selectedWarehouse,
        tipoComprobante,
        formaPago,
        items: cart.map(item => ({
          productId: item.productId,
          nombreProducto: item.nombreProducto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        observaciones: ''
      };

      const newSale = await createSale(saleData);
      
      // Paso 2: Completar venta (ejecuta movimientos de inventario)
      const completedSale = await completeSale(newSale.id);
      
      // Guardar ID de la última venta para reimprimir
      setLastSaleId(completedSale.id);
      
      addNotification(
        'success',
        'Venta Exitosa',
        `Venta ${completedSale.codigoVenta} completada. Total: S/ ${completedSale.total.toFixed(2)}`
      );

      // Limpiar carrito
      clearCart();
      
      // Preguntar si desea descargar PDF
      const shouldDownload = window.confirm('¿Deseas descargar la factura en PDF?');
      if (shouldDownload) {
        downloadInvoice(completedSale.id);
      }

    } catch (error: any) {
      addNotification('error', 'Error de Venta', error.message || 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAsQuote = async () => {
    if (cart.length === 0) {
      addNotification('warning', 'Carrito Vacío', 'Agrega productos al carrito antes de guardar la cotización');
      return;
    }

    if (!selectedWarehouse) {
      addNotification('warning', 'Almacén Requerido', 'Selecciona un almacén');
      return;
    }

    setIsProcessing(true);

    try {
      const quoteData: CreateSaleInput = {
        cashSessionId: activeCashSession?.id || '',
        clienteId: selectedClient || undefined,
        almacenId: selectedWarehouse,
        tipoComprobante,
        formaPago,
        items: cart.map(item => ({
          productId: item.productId,
          nombreProducto: item.nombreProducto,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        observaciones: ''
      };

      await createQuote(quoteData);
      
      addNotification(
        'success',
        'Cotización Guardada',
        'La cotización se creó exitosamente con validez de 7 días'
      );

      // Limpiar carrito
      clearCart();

    } catch (error: any) {
      addNotification('error', 'Error', error.message || 'Error al crear la cotización');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeCashSession) {
    return (
      <Layout title="Realizar Venta">
        <AlertCard $type="error">
          <h3>⚠️ Caja Cerrada</h3>
          <p>No puedes realizar ventas sin tener una caja abierta.</p>
          <Button 
            $variant="primary" 
            onClick={() => navigate('/gestion-caja')}
            style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1rem' }}
          >
            Ir a Gestión de Caja
          </Button>
        </AlertCard>
      </Layout>
    );
  }

  return (
    <Layout title="Realizar Venta">
      <Container>
        <MainSection>
          <SearchSection>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Buscar Productos</h3>
            <SearchInput
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchSection>

          <Card>
            <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Productos Disponibles</h3>
            
            {!selectedWarehouse && (
              <AlertCard $type="warning">
                <strong>⚠️ Almacén Requerido</strong>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  Selecciona un almacén en el panel derecho antes de agregar productos al carrito.
                </p>
              </AlertCard>
            )}

            <ProductsGrid $disabled={!selectedWarehouse}>
              {filteredProducts.map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  $disabled={!selectedWarehouse}
                >
                  <ProductName>{product.productName}</ProductName>
                  <ProductInfo>
                    <ProductPrice>{formatCurrency(product.price)}</ProductPrice>
                    <ProductStock>Stock: {product.currentStock}</ProductStock>
                  </ProductInfo>
                  <div style={{ fontSize: '0.8rem', color: '#7f8c8d' }}>
                    Código: {product.productCode}
                  </div>
                </ProductCard>
              ))}
            </ProductsGrid>
            {filteredProducts.length === 0 && selectedWarehouse && (
              <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
                No se encontraron productos disponibles
              </p>
            )}
          </Card>
        </MainSection>

        <SidePanel>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Carrito de Compras</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              📦 Almacén <span style={{ color: '#e74c3c' }}>*</span>
            </label>
            <Select
              value={selectedWarehouse}
              onChange={(e) => {
                setSelectedWarehouse(e.target.value);
                if (e.target.value) {
                  addNotification('info', 'Almacén Seleccionado', `Productos de: ${warehouses.find(w => w.id === e.target.value)?.name}`);
                }
              }}
              $required={true}
            >
              <option value="">⚠️ Seleccionar almacén primero...</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name}
                </option>
              ))}
            </Select>
            {!selectedWarehouse && (
              <small style={{ color: '#e74c3c', fontSize: '0.85rem' }}>
                ⚠️ Debes seleccionar un almacén antes de agregar productos
              </small>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              👤 Cliente (Opcional)
            </label>
            
            {selectedClientData ? (
              <SelectedClientCard>
                <div>
                  <ClientName>
                    {selectedClientData.tipoDocumento === 'RUC' 
                      ? selectedClientData.razonSocial 
                      : `${selectedClientData.nombres} ${selectedClientData.apellidos}`.trim()}
                  </ClientName>
                  <ClientDocument>
                    {selectedClientData.tipoDocumento}: {selectedClientData.numeroDocumento}
                  </ClientDocument>
                </div>
                <ClearButton onClick={handleClearClient}>
                  ✕ Quitar
                </ClearButton>
              </SelectedClientCard>
            ) : (
              <AutocompleteContainer>
                <SearchInput
                  type="text"
                  placeholder="Buscar cliente por nombre o documento..."
                  value={clientSearchTerm}
                  onChange={(e) => {
                    setClientSearchTerm(e.target.value);
                    setShowClientDropdown(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowClientDropdown(clientSearchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowClientDropdown(false), 200)}
                />
                {showClientDropdown && filteredClients.length > 0 && (
                  <AutocompleteDropdown>
                    {filteredClients.map((client: Client) => (
                      <AutocompleteItem 
                        key={client.id}
                        onClick={() => handleSelectClient(client)}
                      >
                        <ClientInfo>
                          <div>
                            <ClientName>
                              {client.tipoDocumento === 'RUC' 
                                ? client.razonSocial 
                                : `${client.nombres} ${client.apellidos}`.trim()}
                            </ClientName>
                            <ClientDocument>
                              {client.tipoDocumento}: {client.numeroDocumento}
                            </ClientDocument>
                          </div>
                        </ClientInfo>
                      </AutocompleteItem>
                    ))}
                  </AutocompleteDropdown>
                )}
                {showClientDropdown && clientSearchTerm && filteredClients.length === 0 && (
                  <AutocompleteDropdown>
                    <AutocompleteItem style={{ textAlign: 'center', color: '#7f8c8d' }}>
                      No se encontraron clientes
                    </AutocompleteItem>
                  </AutocompleteDropdown>
                )}
              </AutocompleteContainer>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
              📄 Tipo de Comprobante
            </label>
            <Select
              value={tipoComprobante}
              onChange={(e) => setTipoComprobante(e.target.value as any)}
            >
              <option value="Boleta">Boleta</option>
              <option value="Factura">Factura</option>
              <option value="NotaVenta">Nota de Venta</option>
            </Select>
          </div>

          <SaleSummary>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
                Carrito vacío
              </p>
            ) : (
              cart.map(item => (
                <SaleItem key={item.productId}>
                  <ItemInfo>
                    <ItemName>{item.product.productName}</ItemName>
                    <ItemDetails>
                      {formatCurrency(item.precioUnitario)} x {item.cantidad}
                    </ItemDetails>
                  </ItemInfo>
                  <div style={{ textAlign: 'right' }}>
                    <QuantityControls>
                      <QuantityButton 
                        onClick={() => updateQuantity(item.productId, item.cantidad - 1)}
                      >
                        -
                      </QuantityButton>
                      <QuantityInput
                        type="number"
                        value={item.cantidad}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        min="1"
                        max={item.product.currentStock}
                      />
                      <QuantityButton 
                        onClick={() => updateQuantity(item.productId, item.cantidad + 1)}
                      >
                        +
                      </QuantityButton>
                    </QuantityControls>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>{formatCurrency(item.subtotal)}</strong>
                    </div>
                    <RemoveButton onClick={() => removeFromCart(item.productId)}>
                      Eliminar
                    </RemoveButton>
                  </div>
                </SaleItem>
              ))
            )}
          </SaleSummary>

          {cart.length > 0 && (
            <>
              <ToggleContainer>
                <ToggleLabel>
                  <span>📊 Incluir IGV (18%)</span>
                </ToggleLabel>
                <ToggleLabel htmlFor="igv-toggle">
                  <ToggleInput
                    id="igv-toggle"
                    type="checkbox"
                    checked={includeIGV}
                    onChange={(e) => setIncludeIGV(e.target.checked)}
                  />
                  <ToggleSwitch $checked={includeIGV} onClick={() => setIncludeIGV(!includeIGV)} />
                </ToggleLabel>
              </ToggleContainer>

              <TotalSection>
                <TotalRow>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </TotalRow>
                {includeIGV && (
                  <TotalRow>
                    <span>IGV (18%):</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </TotalRow>
                )}
                <TotalAmount>
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </TotalAmount>
              </TotalSection>

              <PaymentSection>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#2c3e50' }}>
                  💳 Forma de Pago
                </label>
                <Select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value as any)}
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Tarjeta">💳 Tarjeta</option>
                  <option value="Transferencia">🏦 Transferencia</option>
                  <option value="Yape">📱 Yape</option>
                  <option value="Plin">📱 Plin</option>
                </Select>

                <Button 
                  $variant="secondary" 
                  onClick={saveAsQuote}
                  disabled={isProcessing || cart.length === 0}
                >
                  💾 Guardar como Cotización
                </Button>

                <Button 
                  $variant="primary" 
                  onClick={processSale}
                  disabled={isProcessing || salesLoading || !selectedWarehouse}
                >
                  {isProcessing ? 'Procesando...' : 'Procesar Venta'}
                </Button>

                <Button 
                  $variant="danger" 
                  onClick={clearCart}
                >
                  Limpiar Carrito
                </Button>

                {lastSaleId && (
                  <Button 
                    $variant="secondary" 
                    onClick={() => downloadInvoice(lastSaleId)}
                  >
                    🖨️ Imprimir Última Venta
                  </Button>
                )}
              </PaymentSection>
            </>
          )}
        </SidePanel>
      </Container>
    </Layout>
  );
};

export default RealizarVenta;
