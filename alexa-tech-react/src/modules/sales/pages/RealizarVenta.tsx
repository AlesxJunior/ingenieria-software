import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../../../components/Layout';
import { useProducts, type Product } from '../../products/context/ProductContext';
import { useClients, type Client } from '../../clients/context/ClientContext';
import { useSales, type SaleItem } from '../context/SalesContext';
import { useAuth } from '../../auth/context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  height: calc(100vh - 120px);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const MainSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SidePanel = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const SearchSection = styled(Card)`
  margin-bottom: 1rem;
`;

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  max-height: 500px;
  overflow-y: auto;
  padding: 1rem 0;
`;

const ProductCard = styled.div`
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProductName = styled.h4`
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const ProductInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProductPrice = styled.span`
  color: #27ae60;
  font-weight: bold;
  font-size: 1.1rem;
`;

const ProductStock = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const SaleSummary = styled.div`
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
`;

const SaleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
`;

const ItemName = styled.div`
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const ItemDetails = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const QuantityButton = styled.button`
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #f8f9fa;
  }
`;

const QuantityInput = styled.input`
  width: 50px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.25rem;
`;

const RemoveButton = styled.button`
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  font-size: 0.8rem;

  &:hover {
    background: #c0392b;
  }
`;

const TotalSection = styled.div`
  padding: 1rem 0;
  border-top: 2px solid #ecf0f1;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
`;

const TotalAmount = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 1.3rem;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 2px solid #3498db;
`;

const PaymentSection = styled.div`
  margin-top: 1rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e8ed;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.5rem;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: #27ae60;
          color: white;
          &:hover {
            background: #229954;
          }
        `;
      case 'danger':
        return `
          background: #e74c3c;
          color: white;
          &:hover {
            background: #c0392b;
          }
        `;
      default:
        return `
          background: #95a5a6;
          color: white;
          &:hover {
            background: #7f8c8d;
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

interface CartItem extends SaleItem {
  product: Product;
}

const RealizarVenta: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, updateProduct } = useProducts();
  const { clients } = useClients();
  const { getActiveCashRegister, addSale } = useSales();
  const { addNotification } = useNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [isProcessing, setIsProcessing] = useState(false);

  const activeCashRegister = getActiveCashRegister();

  const filteredProducts = products.filter((product: Product) =>
    product.isActive &&
    product.status === 'disponible' &&
    product.currentStock > 0 &&
    (product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     product.productCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.currentStock) {
        setCart(cart.map(item =>
          item.productId === product.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.unitPrice
              }
            : item
        ));
      } else {
        addNotification('warning', 'Stock Insuficiente', 'No hay suficiente stock disponible');
      }
    } else {
      const newItem: CartItem = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
        total: product.price,
        product
      };
      setCart([...cart, newItem]);
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
            quantity: newQuantity,
            total: newQuantity * item.unitPrice
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
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // IGV 18%
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
    if (!activeCashRegister) {
      addNotification('error', 'Caja Cerrada', 'No hay una caja abierta. Abre una caja antes de realizar ventas.');
      return;
    }

    if (cart.length === 0) {
      addNotification('warning', 'Carrito Vacío', 'Agrega productos al carrito antes de procesar la venta');
      return;
    }

    if (!user) {
      addNotification('error', 'Error de Autenticación', 'Usuario no autenticado');
      return;
    }

    setIsProcessing(true);

    try {
      // Generar número de venta
      const saleNumber = `VENTA-${Date.now()}`;

      // Crear la venta
      const newSale = {
        saleNumber,
        clientId: selectedClient || 'CLIENTE-GENERAL',
        userId: user.id,
        cashRegisterId: activeCashRegister.id,
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        paymentMethod,
        status: 'completada' as const,
        createdAt: new Date()
      };

      addSale(newSale);

      // Actualizar stock de productos
      cart.forEach(item => {
        updateProduct(item.productId, {
          currentStock: item.product.currentStock - item.quantity
        });
      });

      addNotification('success', 'Venta Exitosa', `Venta ${saleNumber} procesada exitosamente`);

      // Limpiar carrito
      clearCart();

    } catch (error) {
      addNotification('error', 'Error de Venta', 'Error al procesar la venta');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!activeCashRegister) {
    return (
      <Layout title="Realizar Venta">
        <AlertCard $type="error">
          <h3>⚠️ Caja Cerrada</h3>
          <p>No puedes realizar ventas sin tener una caja abierta.</p>
          <Button 
            $variant="primary" 
            onClick={() => navigate('/ventas/apertura-caja')}
            style={{ marginTop: '1rem', width: 'auto', padding: '0.5rem 1rem' }}
          >
            Ir a Apertura de Caja
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
            <ProductsGrid>
              {filteredProducts.map((product: Product) => (
                <ProductCard key={product.id} onClick={() => addToCart(product)}>
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
            {filteredProducts.length === 0 && (
              <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
                No se encontraron productos disponibles
              </p>
            )}
          </Card>
        </MainSection>

        <SidePanel>
          <h3 style={{ marginBottom: '1rem', color: '#2c3e50' }}>Carrito de Compras</h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Entidad Comercial (Opcional)
            </label>
            <Select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">Entidad Comercial General</option>
              {clients.map((client: Client) => (
                <option key={client.id} value={client.id}>
                  {client.tipoDocumento === 'RUC' 
                    ? client.razonSocial || ''
                    : `${client.nombres || ''} ${client.apellidos || ''}`.trim()
                  } - {client.numeroDocumento}
                </option>
              ))}
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
                      {formatCurrency(item.unitPrice)} x {item.quantity}
                    </ItemDetails>
                  </ItemInfo>
                  <div style={{ textAlign: 'right' }}>
                    <QuantityControls>
                      <QuantityButton 
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        -
                      </QuantityButton>
                      <QuantityInput
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 0)}
                        min="1"
                        max={item.product.currentStock}
                      />
                      <QuantityButton 
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        +
                      </QuantityButton>
                    </QuantityControls>
                    <div style={{ marginTop: '0.5rem' }}>
                      <strong>{formatCurrency(item.total)}</strong>
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
              <TotalSection>
                <TotalRow>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculateSubtotal())}</span>
                </TotalRow>
                <TotalRow>
                  <span>IGV (18%):</span>
                  <span>{formatCurrency(calculateTax())}</span>
                </TotalRow>
                <TotalAmount>
                  <span>Total:</span>
                  <span>{formatCurrency(calculateTotal())}</span>
                </TotalAmount>
              </TotalSection>

              <PaymentSection>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Método de Pago
                </label>
                <Select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                </Select>

                <Button 
                  $variant="primary" 
                  onClick={processSale}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : 'Procesar Venta'}
                </Button>

                <Button 
                  $variant="danger" 
                  onClick={clearCart}
                >
                  Limpiar Carrito
                </Button>
              </PaymentSection>
            </>
          )}
        </SidePanel>
      </Container>
    </Layout>
  );
};

export default RealizarVenta;
