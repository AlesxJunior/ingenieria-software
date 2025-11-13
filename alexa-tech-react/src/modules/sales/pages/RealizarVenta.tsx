import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useProducts, type Product } from '../../products/context/ProductContext';
import { useClients, type Client } from '../../clients/context/ClientContext';
import { useSales, type CreateSaleInput } from '../context/SalesContext';
import { useQuotes } from '../context/QuotesContext';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';
import { tokenUtils } from '../../../utils/api';

// 🎨 DISEÑO SIGUIENDO EL BOCETO HTML
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

// 1. Grid para datos del comprobante
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

// 2. Búsqueda de productos
const SearchContainer = styled.div`
  position: relative;
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

// 4. Resumen y botones
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
const AlertCard = styled.div`
  background-color: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  
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

const ClientName = styled.strong`
  color: #333;
  font-size: 14px;
  display: block;
`;

const ClientDocument = styled.span`
  color: #666;
  font-size: 12px;
`;

// 🆕 Modal de confirmación de pago
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.2s ease-in;

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from { transform: translateY(50px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const ModalHeader = styled.div`
  margin-bottom: 24px;
  text-align: center;
  
  h2 {
    color: #2c3e50;
    font-size: 24px;
    margin: 0 0 8px 0;
  }

  p {
    color: #7f8c8d;
    font-size: 14px;
    margin: 0;
  }
`;

const TotalDisplay = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 24px;

  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }

  h3 {
    margin: 8px 0 0 0;
    font-size: 36px;
    font-weight: 700;
  }
`;

const PaymentForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PaymentFormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-weight: 600;
    color: #2c3e50;
    font-size: 14px;
  }

  input {
    padding: 12px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
  }

  input[type="number"] {
    font-size: 20px;
    font-weight: 600;
    text-align: right;
  }
`;

const ChangeDisplay = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #d4edda;
  border: 2px solid #28a745;
  border-radius: 8px;
  
  span {
    color: #155724;
    font-weight: 600;
  }

  strong {
    color: #155724;
    font-size: 24px;
  }
`;

const ModalActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const ModalButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 14px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  ` : `
    background: #e0e0e0;
    color: #666;

    &:hover {
      background: #d0d0d0;
    }
  `}
`;

const PaymentMethodInfo = styled.div`
  background: #e7f3ff;
  border-left: 4px solid #2196F3;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;

  p {
    margin: 0;
    color: #1565C0;
    font-size: 13px;
  }

  strong {
    color: #0D47A1;
  }
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

// 🆕 Spinner de carga
const Spinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

interface CartItem {
  productId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  stock: number;
}

const RealizarVenta: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { clients } = useClients();
  const {
    activeCashSession,
    createSale,
    confirmPayment, // 🆕
    downloadInvoice,
    loading: salesLoading,
  } = useSales();
  const { createQuote } = useQuotes();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  // Estados
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedWarehouse] = useState<string>('WH-PRINCIPAL'); // 🆕 Siempre almacén principal
  const [tipoDocumento, setTipoDocumento] = useState<'DNI' | 'RUC' | 'CE' | 'Pasaporte'>('DNI'); // 🆕 Tipo de documento del cliente
  const [tipoComprobante, setTipoComprobante] = useState<'Boleta' | 'Factura' | 'NotaVenta'>('Boleta');
  const [formaPago, setFormaPago] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin'>('Efectivo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [includeIGV, setIncludeIGV] = useState(true);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // 🆕 Estados para modal de confirmación de pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingSaleId, setPendingSaleId] = useState<string | null>(null);
  const [montoRecibido, setMontoRecibido] = useState<string>('');
  const [referenciaPago, setReferenciaPago] = useState<string>('');
  const [pendingSaleTotal, setPendingSaleTotal] = useState<number>(0);

  // Fecha y hora actual
  const currentDate = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().slice(0, 5);

  // Filtrar productos
  const filteredProducts = products.filter((product: Product) =>
    product.isActive &&
    product.status === 'disponible' &&
    product.currentStock > 0 &&
    searchTerm.length > 0 &&
    (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtrar clientes
  const filteredClients = clients.filter((client: Client) => {
    if (!clientSearchTerm) return false;
    const searchLower = clientSearchTerm.toLowerCase();
    const name = client.tipoDocumento === 'RUC' 
      ? (client.razonSocial || '').toLowerCase()
      : `${client.nombres || ''} ${client.apellidos || ''}`.trim().toLowerCase();
    const document = (client.numeroDocumento || '').toLowerCase();
    return name.includes(searchLower) || document.includes(searchLower);
  });

  const selectedClientData = clients.find((c: Client) => c.id === selectedClient);

  // 🆕 Actualizar tipo de comprobante automáticamente según el tipo de documento
  useEffect(() => {
    if (tipoDocumento === 'RUC') {
      setTipoComprobante('Factura');
    } else {
      setTipoComprobante('Boleta');
    }
  }, [tipoDocumento]);

  // 🆕 Actualizar tipo de documento cuando se selecciona un cliente
  useEffect(() => {
    if (selectedClientData) {
      setTipoDocumento(selectedClientData.tipoDocumento as 'DNI' | 'RUC' | 'CE' | 'Pasaporte');
    }
  }, [selectedClientData]);

  // Cálculos
  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);
  };

  const calculateTax = () => {
    return includeIGV ? calculateSubtotal() * 0.18 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // 🆕 Función para redondear al décimo más cercano (monedas de S/ 0.10)
  const redondearAlDecimo = (monto: number): number => {
    return Math.round(monto * 10) / 10;
  };

  // Agregar al carrito
  const addToCart = (product: Product) => {
    // 🐛 Debug: verificar ID del producto
    console.log('➕ Agregando producto al carrito:', { id: product.id, name: product.productName, code: product.productCode });
    
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.cantidad < product.currentStock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        ));
        addNotification('success', 'Cantidad Actualizada', `${product.productName} +1`);
      } else {
        addNotification('warning', 'Stock Insuficiente', `Solo hay ${product.currentStock} unidades disponibles`);
      }
    } else {
      const newItem: CartItem = {
        productId: product.id,
        nombreProducto: product.productName,
        cantidad: 1,
        precioUnitario: typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0,
        stock: product.currentStock,
      };
      setCart([...cart, newItem]);
      addNotification('success', 'Producto Agregado', product.productName);
    }
    
    setSearchTerm('');
    setShowProductDropdown(false);
  };

  // Actualizar cantidad
  const updateQuantity = (productId: string, newQuantity: number) => {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQuantity > item.stock) {
      addNotification('warning', 'Stock Insuficiente', `Solo hay ${item.stock} unidades disponibles`);
      return;
    }

    setCart(cart.map(i =>
      i.productId === productId ? { ...i, cantidad: newQuantity } : i
    ));
  };

  // Eliminar del carrito
  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
    addNotification('info', 'Producto Eliminado', 'Se quitó el producto del carrito');
  };

  // Limpiar carrito
  const clearCart = () => {
    setCart([]);
    setSelectedClient('');
    setClientSearchTerm('');
    addNotification('info', 'Carrito Limpio', 'Se eliminaron todos los productos');
  };

  // Seleccionar cliente
  const handleSelectClient = (client: Client) => {
    setSelectedClient(client.id);
    setClientSearchTerm('');
    setShowClientDropdown(false);
  };

  // Limpiar cliente
  const handleClearClient = () => {
    setSelectedClient('');
    setClientSearchTerm('');
  };

  // Procesar venta (PASO 1: Registrar venta en estado Pendiente)
  const processSale = async () => {
    if (!activeCashSession) {
      addNotification('error', 'Caja Cerrada', 'No hay una caja abierta. Abre una caja antes de realizar ventas.');
      return;
    }

    if (cart.length === 0) {
      addNotification('warning', 'Carrito Vacío', 'Agrega productos al carrito antes de procesar la venta');
      return;
    }

    // 🆕 Validar cliente para Factura
    if (tipoComprobante === 'Factura' && !selectedClient) {
      addNotification('warning', 'Cliente Requerido', 'Debes seleccionar un cliente para emitir una Factura');
      return;
    }

    // 🆕 Confirmación antes de procesar
    const subtotal = calculateSubtotal();
    const total = calculateTotal();
    const confirmed = window.confirm(
      `¿Confirmar venta?\n\n` +
      `Productos: ${cart.length}\n` +
      `Subtotal: S/ ${subtotal.toFixed(2)}\n` +
      `IGV (18%): S/ ${calculateTax().toFixed(2)}\n` +
      `Total: S/ ${total.toFixed(2)}\n\n` +
      `Comprobante: ${tipoComprobante}\n` +
      `Forma de pago: ${formaPago}`
    );

    if (!confirmed) {
      return;
    }

    setIsProcessing(true);

    try {
      const saleData: CreateSaleInput = {
        cashSessionId: activeCashSession.id,
        clienteId: selectedClient || undefined,
        almacenId: selectedWarehouse,
        tipoComprobante,
        formaPago,
        incluyeIGV: includeIGV, // 🆕 Enviar si incluye IGV o no
        items: cart.map(item => ({
          productId: item.productId,
          nombreProducto: item.nombreProducto,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precioUnitario)
        })),
        observaciones: ''
      };

      console.log('🛒 Creando venta (estado Pendiente):', saleData);
      console.log('💡 IncludeIGV:', includeIGV);

      // PASO 1: Crear venta en estado Pendiente
      const newSale = await createSale(saleData);
      
      console.log('✅ Venta creada:', newSale);
      console.log('💰 Total recibido del backend:', newSale.total);
      console.log('💰 IGV recibido del backend:', newSale.igv);

      // PASO 2: Mostrar modal de confirmación de pago
      setPendingSaleId(newSale.id);
      setPendingSaleTotal(Number(newSale.total)); // ✅ Usar el total real del backend
      
      // 🆕 Para efectivo: sugerir monto redondeado, para otros: monto exacto
      const totalExacto = Number(newSale.total);
      const montoSugerido = formaPago === 'Efectivo' 
        ? redondearAlDecimo(totalExacto)
        : totalExacto;
      
      setMontoRecibido(montoSugerido.toFixed(2));
      setShowPaymentModal(true);

    } catch (error: any) {
      console.error('❌ Error al crear venta:', error);
      addNotification('error', 'Error de Venta', error.message || 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 PASO 2: Confirmar pago de la venta
  const handleConfirmPayment = async () => {
    if (!pendingSaleId) return;

    const montoRecibidoNum = parseFloat(montoRecibido);

    // Validaciones
    if (isNaN(montoRecibidoNum) || montoRecibidoNum <= 0) {
      addNotification('warning', 'Monto Inválido', 'Ingresa un monto válido');
      return;
    }

    if (formaPago === 'Efectivo' && montoRecibidoNum < pendingSaleTotal) {
      addNotification('warning', 'Monto Insuficiente', `El monto recibido debe ser al menos S/ ${pendingSaleTotal.toFixed(2)}`);
      return;
    }

    if ((formaPago !== 'Efectivo') && !referenciaPago.trim()) {
      addNotification('warning', 'Referencia Requerida', 'Ingresa el número de operación/voucher');
      return;
    }

    setIsProcessing(true);

    try {
      // 🆕 Calcular cambio con redondeo al décimo (monedas disponibles en Perú)
      let montoCambio = 0;
      let cambioExacto = 0;
      let cambioRedondeado = 0;
      
      if (formaPago === 'Efectivo') {
        cambioExacto = montoRecibidoNum - pendingSaleTotal;
        cambioRedondeado = redondearAlDecimo(cambioExacto);
        montoCambio = cambioRedondeado; // Usar el cambio redondeado
      }

      const paymentData = {
        montoRecibido: montoRecibidoNum,
        montoCambio,
        referenciaPago: referenciaPago.trim() || undefined,
      };

      console.log('💰 Confirmando pago:', paymentData);
      
      // 🐛 Debug: mostrar redondeo de cambio
      if (formaPago === 'Efectivo' && Math.abs(cambioExacto - cambioRedondeado) > 0.001) {
        console.log('🔄 Redondeo de cambio:', {
          cambioExacto: cambioExacto.toFixed(2),
          cambioRedondeado: cambioRedondeado.toFixed(2),
          diferencia: (cambioExacto - cambioRedondeado).toFixed(2)
        });
      }

      const completedSale = await confirmPayment(pendingSaleId, paymentData);
      
      console.log('✅ Pago confirmado:', completedSale);

      // Cerrar modal
      setShowPaymentModal(false);
      
      // Guardar ID para imprimir
      setLastSaleId(completedSale.id);

      // Mostrar mensaje de éxito
      if (formaPago === 'Efectivo' && montoCambio > 0) {
        // 🆕 Mostrar si hubo redondeo en el cambio
        const hayRedondeo = Math.abs(cambioExacto - cambioRedondeado) > 0.001;
        const mensajeCambio = hayRedondeo
          ? `Cambio a entregar: S/ ${cambioRedondeado.toFixed(2)} (de S/ ${cambioExacto.toFixed(2)} exacto)`
          : `Cambio: S/ ${montoCambio.toFixed(2)}`;
        
        addNotification(
          'success',
          'Venta Completada',
          `Venta ${completedSale.codigoVenta} pagada.\n${mensajeCambio}`
        );
      } else {
        addNotification(
          'success',
          'Venta Completada',
          `Venta ${completedSale.codigoVenta} pagada. Total: S/ ${completedSale.total.toFixed(2)}`
        );
      }

      // Limpiar carrito
      clearCart();

      // Resetear estados del modal
      setPendingSaleId(null);
      setMontoRecibido('');
      setReferenciaPago('');
      setPendingSaleTotal(0);

      // Preguntar si quiere imprimir
      setTimeout(async () => {
        const shouldPrint = window.confirm('¿Deseas imprimir el comprobante?');
        if (shouldPrint) {
          try {
            // Descargar PDF con autenticación
            const token = tokenUtils.getAccessToken();
            const pdfUrl = `${import.meta.env.VITE_API_URL}/sales/${completedSale.id}/invoice/preview`;
            
            const response = await fetch(pdfUrl, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              throw new Error('Error al generar el PDF');
            }

            // Crear un Blob del PDF y abrirlo en nueva ventana
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            // Abrir en nueva ventana y activar el diálogo de impresión
            const printWindow = window.open(blobUrl, '_blank');
            
            // Esperar a que cargue el PDF y abrir diálogo de impresión
            if (printWindow) {
              printWindow.onload = () => {
                printWindow.focus();
                printWindow.print();
              };
            }
            
            // Liberar memoria después de 1 minuto
            setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
          } catch (error) {
            console.error('❌ Error al abrir PDF:', error);
            addNotification('error', 'Error', 'No se pudo abrir el comprobante para imprimir');
          }
        }
      }, 500);

    } catch (error: any) {
      console.error('❌ Error al confirmar pago:', error);
      addNotification('error', 'Error de Pago', error.message || 'Error al confirmar el pago');
    } finally {
      setIsProcessing(false);
    }
  };

  // 🆕 Cancelar modal de pago
  const handleCancelPayment = () => {
    const confirmed = window.confirm(
      '¿Cancelar la confirmación de pago?\n\nLa venta quedará en estado PENDIENTE y podrás confirmarla después desde Lista de Ventas.'
    );

    if (confirmed) {
      setShowPaymentModal(false);
      setPendingSaleId(null);
      setMontoRecibido('');
      setReferenciaPago('');
      setPendingSaleTotal(0);
      clearCart();
      
      addNotification('info', 'Pago Pendiente', 'La venta quedó registrada en estado PENDIENTE');
    }
  };

  // Guardar como cotización
  const saveAsQuote = async () => {
    if (cart.length === 0) {
      addNotification('warning', 'Carrito Vacío', 'Agrega productos al carrito antes de guardar la cotización');
      return;
    }

    // Confirmación antes de cotizar
    const total = calculateTotal();
    const confirmed = window.confirm(
      `¿Guardar como cotización?\n\n` +
      `Productos: ${cart.length}\n` +
      `Total: S/ ${total.toFixed(2)}\n` +
      `Cliente: ${selectedClientData ? (selectedClientData.tipoDocumento === 'RUC' ? selectedClientData.razonSocial : `${selectedClientData.nombres} ${selectedClientData.apellidos}`) : 'Cliente General'}\n\n` +
      `La cotización tendrá validez de 15 días.`
    );

    if (!confirmed) {
      return;
    }

    setIsProcessing(true);

    try {
      const quoteData = {
        clienteId: selectedClient || undefined,
        almacenId: selectedWarehouse,
        usuarioId: user?.id || '',
        diasValidez: 15,
        observaciones: '',
        items: cart.map(item => ({
          productId: item.productId,
          nombreProducto: item.nombreProducto,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precioUnitario),
          subtotal: Number((item.cantidad * item.precioUnitario).toFixed(2))
        }))
      };

      await createQuote(quoteData);
      
      addNotification(
        'success',
        'Cotización Guardada',
        `La cotización se creó exitosamente con validez de 15 días. Puedes verla en Ventas → Cotizaciones`
      );

      clearCart();

      // Opcional: Redirigir a la página de cotizaciones
      // navigate('/ventas/cotizaciones');

    } catch (error: any) {
      addNotification('error', 'Error', error.message || 'Error al crear la cotización');
    } finally {
      setIsProcessing(false);
    }
  };

  // Alerta si no hay caja abierta
  if (!activeCashSession) {
    return (
      <Layout title="Realizar Venta">
        <SalesContainer>
          <AlertCard>
            <h3>⚠️ Caja Cerrada</h3>
            <p>No puedes realizar ventas sin tener una caja abierta.</p>
            <Button 
              $variant="primary" 
              onClick={() => navigate('/gestion-caja')}
              style={{ width: 'auto', maxWidth: '300px' }}
            >
              Ir a Gestión de Caja
            </Button>
          </AlertCard>
        </SalesContainer>
      </Layout>
    );
  }

  return (
    <Layout title="Realizar Venta">
      <SalesContainer>
        {/* 1. Datos del Comprobante */}
        <Card>
          <CardTitle>1. Datos del Comprobante</CardTitle>
          <FormGrid>
            <FormGroup>
              <Label htmlFor="tipo-documento">Tipo Documento</Label>
              <Select 
                id="tipo-documento" 
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value as 'DNI' | 'RUC' | 'CE' | 'Pasaporte')}
              >
                <option value="DNI">DNI</option>
                <option value="RUC">RUC</option>
                <option value="CE">C. Extranjería</option>
                <option value="Pasaporte">Pasaporte</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor="numero-documento">N° de Documento</Label>
              <InputWithButton>
                <Input
                  id="numero-documento"
                  type="text"
                  placeholder="Buscar..."
                  value={clientSearchTerm}
                  onChange={(e) => {
                    setClientSearchTerm(e.target.value);
                    setShowClientDropdown(e.target.value.length > 0);
                  }}
                  style={{ borderRadius: '6px 0 0 6px' }}
                />
                <SearchButton>🔍</SearchButton>
              </InputWithButton>
              {showClientDropdown && filteredClients.length > 0 && (
                <AutocompleteDropdown>
                  {filteredClients.map((client: Client) => (
                    <AutocompleteItem
                      key={client.id}
                      onClick={() => handleSelectClient(client)}
                    >
                      <ClientName>
                        {client.tipoDocumento === 'RUC'
                          ? client.razonSocial
                          : `${client.nombres} ${client.apellidos}`}
                      </ClientName>
                      <ClientDocument>
                        {client.tipoDocumento}: {client.numeroDocumento}
                      </ClientDocument>
                    </AutocompleteItem>
                  ))}
                </AutocompleteDropdown>
              )}
              {selectedClientData && (
                <SelectedClientCard>
                  <div>
                    <ClientName>
                      {selectedClientData.tipoDocumento === 'RUC'
                        ? selectedClientData.razonSocial
                        : `${selectedClientData.nombres} ${selectedClientData.apellidos}`}
                    </ClientName>
                    <ClientDocument>
                      {selectedClientData.tipoDocumento}: {selectedClientData.numeroDocumento}
                    </ClientDocument>
                  </div>
                  <ClearButton onClick={handleClearClient}>✕</ClearButton>
                </SelectedClientCard>
              )}
            </FormGroup>

            <FormGroup>
              <Label htmlFor="nombre-cliente">Nombre / Razón Social</Label>
              <Input
                id="nombre-cliente"
                type="text"
                readOnly
                placeholder="Nombres del cliente..."
                value={
                  selectedClientData
                    ? selectedClientData.tipoDocumento === 'RUC'
                      ? selectedClientData.razonSocial || ''
                      : `${selectedClientData.nombres || ''} ${selectedClientData.apellidos || ''}`
                    : ''
                }
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={currentDate}
                readOnly
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                value={currentTime}
                readOnly
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor="tipo-pago">Tipo de Pago</Label>
              <Select
                id="tipo-pago"
                value={formaPago}
                onChange={(e) => setFormaPago(e.target.value as any)}
              >
                <option value="Efectivo">💵 Efectivo</option>
                <option value="Tarjeta">💳 Tarjeta</option>
                <option value="Transferencia">🏦 Transferencia</option>
                <option value="Yape">📱 Yape</option>
                <option value="Plin">📱 Plin</option>
              </Select>
            </FormGroup>

            <CheckboxGroup>
              <input
                type="checkbox"
                id="apply-igv"
                checked={includeIGV}
                onChange={(e) => setIncludeIGV(e.target.checked)}
              />
              <label htmlFor="apply-igv">Aplicar IGV (18%)</label>
            </CheckboxGroup>
          </FormGrid>
        </Card>

        {/* 2. Buscar Productos */}
        <Card>
          <CardTitle>2. Buscar Productos</CardTitle>
          <SearchContainer>
            <SearchInput
              type="text"
              placeholder="Escribe el nombre o código del producto..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowProductDropdown(e.target.value.length > 0);
              }}
            />
            {showProductDropdown && searchTerm.length > 0 && (
              <SearchResultsDropdown>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product: Product) => (
                    <SearchResultItem
                      key={product.id}
                      onClick={() => addToCart(product)}
                    >
                      <strong>{product.productName}</strong>
                      <span>
                        Código: {product.productCode} | Precio: S/ {(typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0).toFixed(2)} | Stock: {product.currentStock}
                      </span>
                    </SearchResultItem>
                  ))
                ) : (
                  <NoResults>No se encontraron productos</NoResults>
                )}
              </SearchResultsDropdown>
            )}
          </SearchContainer>
        </Card>

        {/* 3. Resumen de Pedido */}
        <Card>
          <CardTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>3. Resumen de Pedido</span>
            <span style={{ fontSize: '13px', fontWeight: 'normal', color: '#666' }}>
              📦 Almacén: Principal | 📄 {tipoComprobante} {tipoDocumento === 'RUC' ? '(RUC)' : '(DNI/CE/Pasaporte)'}
            </span>
          </CardTitle>

          <CartTableContainer>
            <CartTable>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>P. Unitario</th>
                  <th>Subtotal</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <tr key={item.productId}>
                      <td>{item.nombreProducto}</td>
                      <td>
                        <QuantityControls>
                          <QuantityButton
                            onClick={() => updateQuantity(item.productId, item.cantidad - 1)}
                          >
                            −
                          </QuantityButton>
                          <QuantityInput
                            type="number"
                            min="1"
                            max={item.stock}
                            value={item.cantidad}
                            onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                          />
                          <QuantityButton
                            onClick={() => updateQuantity(item.productId, item.cantidad + 1)}
                            disabled={item.cantidad >= item.stock}
                          >
                            +
                          </QuantityButton>
                        </QuantityControls>
                      </td>
                      <td>S/ {item.precioUnitario.toFixed(2)}</td>
                      <td>S/ {(item.cantidad * item.precioUnitario).toFixed(2)}</td>
                      <td>
                        <RemoveButton onClick={() => removeFromCart(item.productId)}>
                          🗑️ Eliminar
                        </RemoveButton>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5}>
                      <EmptyCart>Tu carrito está vacío.</EmptyCart>
                    </td>
                  </tr>
                )}
              </tbody>
            </CartTable>
          </CartTableContainer>
        </Card>

        {/* 4. Totales y Botones */}
        <Card>
          <SummaryGrid>
            <div>
              <TotalsList>
                <li>
                  <span>Subtotal</span>
                  <strong>S/ {calculateSubtotal().toFixed(2)}</strong>
                </li>
                {includeIGV && (
                  <li>
                    <span>IGV (18%)</span>
                    <strong>S/ {calculateTax().toFixed(2)}</strong>
                  </li>
                )}
                <li className="totals-main">
                  <span>Total</span>
                  <strong>S/ {calculateTotal().toFixed(2)}</strong>
                </li>
              </TotalsList>
            </div>

            <ButtonsColumn>
              <Button
                $variant="primary"
                onClick={processSale}
                disabled={isProcessing || salesLoading || cart.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Spinner /> Procesando venta...
                  </>
                ) : (
                  <>✓ Procesar Venta</>
                )}
              </Button>

              <Button
                $variant="secondary"
                onClick={saveAsQuote}
                disabled={isProcessing || cart.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Spinner /> Guardando cotización...
                  </>
                ) : (
                  <>💾 Cotizar Venta</>
                )}
              </Button>

              <Button
                $variant="danger"
                onClick={clearCart}
                disabled={cart.length === 0 || isProcessing}
              >
                🗑️ Limpiar Carrito
              </Button>

              {lastSaleId && (
                <Button
                  $variant="secondary"
                  onClick={() => downloadInvoice(lastSaleId)}
                >
                  🖨️ Imprimir Última Venta
                </Button>
              )}
            </ButtonsColumn>
          </SummaryGrid>
        </Card>
      </SalesContainer>

      {/* 🆕 Modal de confirmación de pago */}
      {showPaymentModal && pendingSaleId && (
        <ModalOverlay onClick={(e) => e.target === e.currentTarget && handleCancelPayment()}>
          <ModalContent>
            <ModalHeader>
              <h2>💰 Confirmar Pago</h2>
              <p>Completa los datos del pago para finalizar la venta</p>
            </ModalHeader>

            <TotalDisplay>
              <p>Total a Cobrar</p>
              <h3>S/ {pendingSaleTotal.toFixed(2)}</h3>
            </TotalDisplay>

            <PaymentMethodInfo>
              <p><strong>Forma de Pago:</strong> {formaPago}</p>
            </PaymentMethodInfo>

            <PaymentForm>
              {formaPago === 'Efectivo' ? (
                <>
                  {/* 🆕 Mostrar info de redondeo sugerido */}
                  {(() => {
                    const totalExacto = pendingSaleTotal;
                    const totalRedondeado = redondearAlDecimo(totalExacto);
                    const hayRedondeo = Math.abs(totalExacto - totalRedondeado) > 0.001;
                    
                    return hayRedondeo ? (
                      <div style={{
                        background: '#e3f2fd',
                        border: '1px solid #2196F3',
                        borderRadius: '6px',
                        padding: '12px',
                        marginBottom: '16px',
                        fontSize: '0.9em',
                        color: '#1565C0'
                      }}>
                        <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>
                          💡 Sugerencia de cobro
                        </p>
                        <p style={{ margin: 0 }}>
                          Total exacto: S/ {totalExacto.toFixed(2)}<br/>
                          Monto sugerido: S/ {totalRedondeado.toFixed(2)} 
                          <span style={{ fontSize: '0.9em', color: '#666' }}>
                            {' '}(facilita el cambio con monedas disponibles)
                          </span>
                        </p>
                      </div>
                    ) : null;
                  })()}

                  <PaymentFormGroup>
                    <label htmlFor="montoRecibido">Monto Recibido *</label>
                    <input
                      id="montoRecibido"
                      type="number"
                      step="0.10"
                      min="0"
                      value={montoRecibido}
                      onChange={(e) => setMontoRecibido(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleConfirmPayment();
                        }
                      }}
                    />
                  </PaymentFormGroup>

                  <ChangeDisplay $show={parseFloat(montoRecibido) > pendingSaleTotal}>
                    <span>💵 Cambio a entregar:</span>
                    <strong>
                      S/ {redondearAlDecimo(parseFloat(montoRecibido || '0') - pendingSaleTotal).toFixed(2)}
                    </strong>
                    {(() => {
                      const cambioExacto = parseFloat(montoRecibido || '0') - pendingSaleTotal;
                      const cambioRedondeado = redondearAlDecimo(cambioExacto);
                      const hayDiferencia = Math.abs(cambioExacto - cambioRedondeado) > 0.001;
                      
                      return hayDiferencia ? (
                        <span style={{ 
                          fontSize: '0.85em', 
                          color: '#666',
                          display: 'block',
                          marginTop: '4px'
                        }}>
                          (de S/ {cambioExacto.toFixed(2)} exacto)
                        </span>
                      ) : null;
                    })()}
                  </ChangeDisplay>
                </>
              ) : (
                <PaymentFormGroup>
                  <label htmlFor="referenciaPago">
                    Número de Operación / Voucher *
                  </label>
                  <input
                    id="referenciaPago"
                    type="text"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    placeholder="Ej: 123456789"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleConfirmPayment();
                      }
                    }}
                  />
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    Ingresa el código de operación de {formaPago}
                  </small>
                </PaymentFormGroup>
              )}
            </PaymentForm>

            <ModalActions>
              <ModalButton 
                $variant="secondary" 
                onClick={handleCancelPayment}
                disabled={isProcessing}
              >
                ❌ Cancelar
              </ModalButton>
              <ModalButton 
                $variant="primary" 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
              >
                {isProcessing ? '⏳ Procesando...' : '✅ Confirmar Pago'}
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </Layout>
  );
};

export default RealizarVenta;
