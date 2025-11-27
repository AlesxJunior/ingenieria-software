# 💳 IMPLEMENTACIÓN: PAGOS MÚLTIPLES EN VENTAS

## 📋 Resumen

Se ha implementado la funcionalidad para **realizar pagos combinados** en ventas, permitiendo que un cliente pague con hasta 2 o más métodos de pago diferentes en una misma venta.

---

## 🎯 Problema Resuelto

**Escenarios comunes:**
- Cliente paga parte en efectivo y parte con tarjeta
- Cliente paga parte con Yape y parte en efectivo
- Cliente combina transferencia + efectivo

**Ejemplo real:**
```
Total de venta: S/ 250.00
- Pago 1: Efectivo    → S/ 150.00
- Pago 2: Tarjeta     → S/ 100.00
Total pagado: S/ 250.00 ✅
```

---

## 🗄️ Cambios en Base de Datos

### Nueva Tabla: `sale_payments`

```sql
CREATE TABLE sale_payments (
  id              TEXT PRIMARY KEY,
  saleId          TEXT NOT NULL,
  metodoPago      SalePaymentMethod NOT NULL,
  monto           DECIMAL NOT NULL,
  referencia      TEXT,
  observaciones   TEXT,
  orden           INTEGER DEFAULT 1,
  createdAt       TIMESTAMP DEFAULT NOW(),
  
  FOREIGN KEY (saleId) REFERENCES sales(id) ON DELETE CASCADE
);
```

**Relación:** Una venta puede tener múltiples pagos (1:N)

---

## 🔧 Backend: Cambios Implementados

### 1️⃣ **Nueva Interfaz `PaymentInput`**

```typescript
interface PaymentInput {
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
  monto: number;
  referencia?: string;
  observaciones?: string;
}
```

### 2️⃣ **Actualización de `SaleCreateInput`**

```typescript
interface SaleCreateInput {
  // ... campos existentes
  
  // ✅ Mantener compatibilidad con pago simple
  formaPago?: 'Efectivo' | 'Tarjeta' | '...';
  
  // 🆕 NUEVO: Array de pagos múltiples
  payments?: PaymentInput[];
}
```

### 3️⃣ **Lógica de Validación**

```typescript
// Validar que la suma de pagos coincida con el total
const totalPagos = data.payments.reduce((sum, p) => sum + p.monto, 0);

if (Math.abs(totalPagos - total) > 0.01) {
  throw new Error('La suma de pagos no coincide con el total');
}
```

### 4️⃣ **Creación de Pagos**

```typescript
await prisma.sale.create({
  data: {
    // ... datos de venta
    payments: {
      create: paymentsData, // Array de pagos
    },
  },
  include: { 
    items: true,
    payments: true, // ✅ Incluir pagos en respuesta
  },
});
```

---

## 📡 API: Endpoint Actualizado

### POST `/api/sales`

**Opción 1: Pago Simple (Mantiene compatibilidad)**
```json
{
  "tipoComprobante": "Boleta",
  "formaPago": "Efectivo",
  "items": [...]
}
```

**Opción 2: Pagos Múltiples (NUEVO)**
```json
{
  "tipoComprobante": "Boleta",
  "payments": [
    {
      "metodoPago": "Efectivo",
      "monto": 150.00,
      "referencia": null
    },
    {
      "metodoPago": "Tarjeta",
      "monto": 100.00,
      "referencia": "VISA-4532"
    }
  ],
  "items": [...]
}
```

**Validaciones:**
- ✅ La suma de `payments[].monto` debe ser igual al total de la venta
- ✅ Cada pago debe tener un método válido
- ✅ El orden de los pagos se guarda automáticamente (1, 2, 3...)

---

## 💾 Respuesta del API

```json
{
  "id": "...",
  "codigoVenta": "B001-00000003",
  "total": 250.00,
  "formaPago": "Efectivo", // Método principal (primer pago)
  "payments": [
    {
      "id": "...",
      "metodoPago": "Efectivo",
      "monto": 150.00,
      "referencia": null,
      "orden": 1
    },
    {
      "id": "...",
      "metodoPago": "Tarjeta",
      "monto": 100.00,
      "referencia": "VISA-4532",
      "orden": 2
    }
  ],
  "items": [...]
}
```

---

## 🎨 Frontend: Próximos Pasos

### Componente a Crear: `PagosMultiples.tsx`

```tsx
interface PagoItem {
  metodoPago: string;
  monto: number;
  referencia?: string;
}

const [pagos, setPagos] = useState<PagoItem[]>([
  { metodoPago: 'Efectivo', monto: 0 }
]);

// Agregar nuevo pago
const agregarPago = () => {
  setPagos([...pagos, { metodoPago: 'Efectivo', monto: 0 }]);
};

// Validar antes de procesar
const totalPagos = pagos.reduce((sum, p) => sum + p.monto, 0);
if (totalPagos !== total) {
  showError('La suma de pagos no coincide con el total');
  return;
}
```

### UI Sugerida:

```
┌─────────────────────────────────────────┐
│ FORMAS DE PAGO                          │
├─────────────────────────────────────────┤
│ Pago 1:                                 │
│ [Efectivo ▼]  S/ [150.00]  [🗑️]         │
│                                         │
│ Pago 2:                                 │
│ [Tarjeta  ▼]  S/ [100.00]  [🗑️]         │
│ Ref: [VISA-4532]                        │
│                                         │
│ [+ Agregar Método de Pago]              │
├─────────────────────────────────────────┤
│ Total a pagar: S/ 250.00                │
│ Total pagado:  S/ 250.00 ✅             │
└─────────────────────────────────────────┘
```

---

## ✅ Beneficios

1. **Flexibilidad**: Cliente puede combinar métodos de pago
2. **Trazabilidad**: Cada pago se registra individualmente
3. **Auditoría**: Se sabe exactamente qué monto se pagó con cada método
4. **Reportes**: Puedes analizar qué métodos se usan más
5. **Caja**: Mejor control de efectivo vs. pagos electrónicos

---

## 🔮 Casos de Uso

### Caso 1: Efectivo + Tarjeta
```
Cliente: "Tengo S/ 150 en efectivo, el resto con tarjeta"
Sistema: 
  - Pago 1: Efectivo S/ 150.00
  - Pago 2: Tarjeta S/ 100.00
```

### Caso 2: Yape + Efectivo
```
Cliente: "Te paso S/ 200 por Yape y S/ 50 en efectivo"
Sistema:
  - Pago 1: Yape S/ 200.00 (Ref: 12345678)
  - Pago 2: Efectivo S/ 50.00
```

### Caso 3: Transferencia + Tarjeta
```
Cliente: "La mitad por transferencia y la mitad con tarjeta"
Sistema:
  - Pago 1: Transferencia S/ 125.00 (Ref: OP-987654)
  - Pago 2: Tarjeta S/ 125.00 (Ref: VISA-1234)
```

---

## 📊 Compatibilidad

✅ **Mantiene compatibilidad total con ventas existentes:**
- Si se envía solo `formaPago`, funciona como antes
- Si se envía `payments[]`, usa la nueva funcionalidad
- El campo `formaPago` en Sale almacena el método principal (primer pago)

---

## 🚀 Estado Actual

- ✅ Modelo de base de datos creado
- ✅ Migración aplicada
- ✅ Backend implementado y validando
- ✅ API actualizado
- ⏳ Frontend pendiente (próximo paso)

---

**Archivo modificado:** `sales.service.ts`
**Migración:** `20251120221855_add_sale_payments_for_multiple_payment_methods`
