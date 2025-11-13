# Integración Frontend - Módulo de Ventas

## ✅ Completado

### 1. SalesContext Actualizado
**Archivo**: `alexa-tech-react/src/modules/sales/context/SalesContext.tsx`

#### Interfaces Actualizadas:
- `CashRegister`: Cajas registradoras del sistema
- `CashSession`: Sesiones de caja (apertura/cierre)
- `Sale`: Ventas completas con items
- `SaleItem`: Items de venta individual
- `CreateSaleInput`: DTO para crear ventas

#### Funciones Implementadas:

**Cash Registers:**
- `loadCashRegisters()`: Obtiene todas las cajas registradoras
- Endpoint: `GET /api/cash-registers`

**Cash Sessions:**
- `openCashSession(cashRegisterId, montoApertura, observaciones)`: Abre sesión
  - Endpoint: `POST /api/cash-sessions/open`
  - Body: `{ cashRegisterId, montoApertura, observaciones }`
  
- `closeCashSession(sessionId, montoCierre, observaciones)`: Cierra sesión
  - Endpoint: `POST /api/cash-sessions/:id/close`
  - Body: `{ montoCierre, observaciones }`
  
- `loadCashSessions()`: Carga todas las sesiones
  - Endpoint: `GET /api/cash-sessions`
  - Auto-detecta sesión activa (estado === 'Abierta')

**Sales:**
- `createSale(saleData)`: Crea venta en estado Pendiente
  - Endpoint: `POST /api/sales`
  - Body: `CreateSaleInput`
  
- `completeSale(saleId)`: Completa venta (ejecuta movimientos de inventario)
  - Endpoint: `PATCH /api/sales/:id/status`
  - Body: `{ estado: 'Completada' }`
  
- `cancelSale(saleId, motivo)`: Cancela venta
  - Endpoint: `PATCH /api/sales/:id/status`
  - Body: `{ estado: 'Cancelada', observaciones: motivo }`
  
- `getSaleById(saleId)`: Obtiene detalle de venta
  - Endpoint: `GET /api/sales/:id`
  
- `loadSales(filters)`: Lista ventas con filtros opcionales
  - Endpoint: `GET /api/sales?estado=X&fechaInicio=Y&fechaFin=Z`

**Invoices (PDFs):**
- `previewInvoice(saleId)`: Abre PDF en nueva pestaña
  - Endpoint: `GET /api/sales/:id/invoice/preview`
  - Abre blob en nueva ventana
  
- `downloadInvoice(saleId)`: Descarga PDF
  - Endpoint: `GET /api/sales/:id/invoice/download`
  - Guarda como `factura-{saleId}.pdf`

#### Estados Globales:
- `loading: boolean` - Indica operación en curso
- `error: string | null` - Último error ocurrido
- `activeCashSession: CashSession | null` - Sesión activa automática

---

## 📋 Pendiente - Actualización de Componentes

### 2. GestionCaja.tsx
**Ubicación**: `alexa-tech-react/src/modules/sales/pages/GestionCaja.tsx`

#### Cambios Necesarios:

1. **Importar contexto actualizado:**
```tsx
import { useSales } from '../context/SalesContext';
```

2. **Reemplazar estado local con contexto:**
```tsx
const {
  cashRegisters,
  cashSessions,
  activeCashSession,
  openCashSession,
  closeCashSession,
  loadCashRegisters,
  loadCashSessions,
  loading,
  error
} = useSales();
```

3. **Apertura de Caja:**
```tsx
const handleAperturaCaja = async () => {
  try {
    const session = await openCashSession(
      selectedCashRegister,
      parseFloat(montoApertura),
      observaciones
    );
    
    addNotification('success', 'Caja Abierta', 
      `Sesión iniciada con S/ ${montoApertura}`);
    navigate('/ventas/realizar-venta');
  } catch (err) {
    addNotification('error', 'Error', err.message);
  }
};
```

4. **Cierre de Caja:**
```tsx
const handleCierreCaja = async () => {
  if (!activeCashSession) return;
  
  try {
    const closedSession = await closeCashSession(
      activeCashSession.id,
      parseFloat(montoCierre),
      observacionesCierre
    );
    
    const diferencia = closedSession.diferencia || 0;
    const mensaje = diferencia === 0 
      ? '¡Cuadre perfecto!'
      : `Diferencia: S/ ${Math.abs(diferencia)} ${diferencia > 0 ? '(Sobrante)' : '(Faltante)'}`;
    
    addNotification('success', 'Caja Cerrada', mensaje);
  } catch (err) {
    addNotification('error', 'Error', err.message);
  }
};
```

5. **Mostrar información de sesión activa:**
```tsx
{activeCashSession && (
  <div>
    <p>Caja: {activeCashSession.cashRegister?.nombre}</p>
    <p>Apertura: {new Date(activeCashSession.fechaApertura).toLocaleString()}</p>
    <p>Monto Inicial: S/ {activeCashSession.montoApertura.toFixed(2)}</p>
    <p>Total Ventas: S/ {activeCashSession.totalVentas.toFixed(2)}</p>
    <p>Estado: {activeCashSession.estado}</p>
  </div>
)}
```

---

### 3. RealizarVenta.tsx
**Ubicación**: `alexa-tech-react/src/modules/sales/pages/RealizarVenta.tsx`

#### Cambios Necesarios:

1. **Importar contexto actualizado:**
```tsx
import { useSales, type CreateSaleInput } from '../context/SalesContext';
import { useWarehouses } from '../../inventory/context/WarehouseContext';
```

2. **Reemplazar funciones mock:**
```tsx
const {
  activeCashSession,
  createSale,
  completeSale,
  loading,
  error
} = useSales();

const { warehouses, loadWarehouses } = useWarehouses();
```

3. **Agregar estados necesarios:**
```tsx
const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
const [tipoComprobante, setTipoComprobante] = useState<'Boleta' | 'Factura' | 'NotaVenta'>('Boleta');
const [formaPago, setFormaPago] = useState<'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin'>('Efectivo');
```

4. **Cargar almacenes al iniciar:**
```tsx
useEffect(() => {
  loadWarehouses();
}, []);
```

5. **Procesar Venta (2 pasos):**
```tsx
const handleProcessSale = async () => {
  if (cart.length === 0) {
    addNotification('warning', 'Carrito Vacío', 'Agrega productos al carrito');
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
      cashSessionId: activeCashSession?.id,
      clienteId: selectedClient || undefined,
      almacenId: selectedWarehouse,
      tipoComprobante,
      formaPago,
      items: cart.map(item => ({
        productId: item.productId,
        nombreProducto: item.product.productName,
        cantidad: item.quantity,
        precioUnitario: item.unitPrice
      })),
      observaciones: ''
    };

    const newSale = await createSale(saleData);
    
    // Paso 2: Completar venta (ejecuta movimientos de inventario)
    const completedSale = await completeSale(newSale.id);
    
    addNotification('success', 'Venta Exitosa', 
      `Venta ${completedSale.codigoVenta} completada. Total: S/ ${completedSale.total.toFixed(2)}`);

    // Limpiar carrito
    clearCart();
    
    // Opcional: Mostrar opción de descargar PDF
    const shouldDownload = window.confirm('¿Deseas descargar la factura?');
    if (shouldDownload) {
      downloadInvoice(completedSale.id);
    }

  } catch (err: any) {
    addNotification('error', 'Error de Venta', err.message || 'Error al procesar');
  } finally {
    setIsProcessing(false);
  }
};
```

6. **Validar sesión activa:**
```tsx
if (!activeCashSession) {
  return (
    <Layout title="Realizar Venta">
      <AlertCard $type="error">
        <h3>⚠️ Caja Cerrada</h3>
        <p>No puedes realizar ventas sin tener una caja abierta.</p>
        <Button 
          $variant="primary" 
          onClick={() => navigate('/ventas/gestion-caja')}
        >
          Ir a Gestión de Caja
        </Button>
      </AlertCard>
    </Layout>
  );
}
```

7. **Selector de Almacén en el form:**
```tsx
<Select
  value={selectedWarehouse}
  onChange={(e) => setSelectedWarehouse(e.target.value)}
>
  <option value="">Seleccionar Almacén</option>
  {warehouses.map(w => (
    <option key={w.id} value={w.id}>{w.name}</option>
  ))}
</Select>
```

---

### 4. ListaVentas.tsx (Nuevo componente recomendado)
**Crear**: `alexa-tech-react/src/modules/sales/pages/ListaVentas.tsx`

```tsx
import React, { useEffect, useState } from 'react';
import { useSales } from '../context/SalesContext';
import Layout from '../../../components/Layout';

const ListaVentas: React.FC = () => {
  const {
    sales,
    loadSales,
    previewInvoice,
    downloadInvoice,
    loading
  } = useSales();

  const [filtroEstado, setFiltroEstado] = useState<string>('');

  useEffect(() => {
    loadSales({ estado: filtroEstado || undefined });
  }, [filtroEstado]);

  return (
    <Layout title="Lista de Ventas">
      {/* Filtros */}
      <select 
        value={filtroEstado}
        onChange={(e) => setFiltroEstado(e.target.value)}
      >
        <option value="">Todas</option>
        <option value="Pendiente">Pendiente</option>
        <option value="Completada">Completada</option>
        <option value="Cancelada">Cancelada</option>
      </select>

      {/* Tabla de ventas */}
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map(sale => (
            <tr key={sale.id}>
              <td>{sale.codigoVenta}</td>
              <td>{sale.cliente?.nombre || 'GENERAL'}</td>
              <td>{new Date(sale.fechaEmision).toLocaleDateString()}</td>
              <td>S/ {sale.total.toFixed(2)}</td>
              <td>
                <span className={`badge badge-${sale.estado.toLowerCase()}`}>
                  {sale.estado}
                </span>
              </td>
              <td>
                {sale.estado === 'Completada' && (
                  <>
                    <button onClick={() => previewInvoice(sale.id)}>
                      👁️ Vista Previa
                    </button>
                    <button onClick={() => downloadInvoice(sale.id)}>
                      📥 Descargar PDF
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && <p>Cargando ventas...</p>}
    </Layout>
  );
};

export default ListaVentas;
```

---

## 🔄 Flujo Completo de Venta

### Paso a Paso:

1. **Gestión de Caja → Apertura**
   - Usuario selecciona caja registradora
   - Ingresa monto inicial
   - `openCashSession()` → Estado: `activeCashSession !== null`

2. **Realizar Venta**
   - Agregar productos al carrito
   - Seleccionar cliente (opcional)
   - Seleccionar almacén (obligatorio)
   - Seleccionar tipo comprobante y forma de pago
   - Click "Procesar Venta":
     - `createSale()` → Venta en estado "Pendiente"
     - `completeSale()` → Ejecuta movimientos, estado "Completada"

3. **Generar PDF**
   - `previewInvoice(saleId)` → Abre PDF en nueva pestaña
   - `downloadInvoice(saleId)` → Descarga archivo

4. **Gestión de Caja → Cierre**
   - Usuario ingresa monto final contado
   - `closeCashSession()` → Calcula diferencia automáticamente
   - Backend suma todas las ventas de la sesión
   - Muestra: Esperado vs Contado vs Diferencia

---

## 📊 Estructura de Datos

### Venta Completada (Response):
```json
{
  "id": "cmhl4xe090006o13wwhd34j5w",
  "codigoVenta": "VEN-20251104-172255",
  "cashSessionId": "session-123",
  "clienteId": "client-456",
  "almacenId": "WH-PRINCIPAL",
  "usuarioId": "user-789",
  "fechaEmision": "2025-11-04T17:22:55.000Z",
  "tipoComprobante": "Boleta",
  "formaPago": "Efectivo",
  "subtotal": 150.00,
  "igv": 27.00,
  "total": 177.00,
  "estado": "Completada",
  "items": [
    {
      "productId": "PRD-EA-010",
      "nombreProducto": "Auriculares Inalámbricos TWS",
      "cantidad": 1,
      "precioUnitario": 150.00,
      "subtotal": 150.00
    }
  ],
  "createdAt": "2025-11-04T17:22:55.000Z",
  "updatedAt": "2025-11-04T17:23:10.000Z"
}
```

### Sesión Cerrada (Response):
```json
{
  "id": "session-123",
  "cashRegisterId": "CAJA-001",
  "userId": "user-789",
  "fechaApertura": "2025-11-04T08:00:00.000Z",
  "fechaCierre": "2025-11-04T20:00:00.000Z",
  "montoApertura": 100.00,
  "montoCierre": 480.00,
  "totalVentas": 377.00,  // Suma automática de ventas
  "diferencia": 3.00,      // montoCierre - (montoApertura + totalVentas)
  "estado": "Cerrada",
  "observaciones": null
}
```

---

## ✅ Checklist de Integración

- [x] SalesContext actualizado con API real
- [ ] GestionCaja.tsx - Apertura/Cierre con API
- [ ] RealizarVenta.tsx - Crear y completar ventas
- [ ] ListaVentas.tsx - Mostrar historial y PDFs
- [ ] Rutas actualizadas en App.tsx
- [ ] Testing E2E del flujo completo
- [ ] Validación de permisos en componentes
- [ ] Manejo de errores mejorado (toasts/notifications)

---

## 🎯 URLs de Testing

### Backend:
- Login: `POST http://localhost:3001/api/auth/login`
- Cash Sessions: `http://localhost:3001/api/cash-sessions`
- Sales: `http://localhost:3001/api/sales`
- Invoice Preview: `http://localhost:3001/api/sales/:id/invoice/preview`
- Invoice Download: `http://localhost:3001/api/sales/:id/invoice/download`

### Credenciales de prueba:
```
Email: admin@alexatech.com
Password: admin123
```

---

## 📝 Notas Importantes

1. **Orden de operaciones**: Siempre crear venta primero (Pendiente), luego completar
2. **Stock**: Solo se descuenta al completar venta, no al crearla
3. **IGV**: Backend calcula automáticamente 18% sobre subtotal
4. **Sesión activa**: Se auto-detecta en `loadCashSessions()`
5. **PDFs**: Requieren venta en estado "Completada"
6. **Almacenes**: Son obligatorios para validar stock disponible
7. **Cliente General**: Si no se selecciona cliente, backend usa null (cliente general)

