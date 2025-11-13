# 📮 Requests de Postman - Testing Backend NC

**Backend:** http://localhost:3001  
**Estado:** ✅ Servidor corriendo

---

## 🔐 TEST 0: Login y Obtener Token

### Request:
```
POST http://localhost:3001/api/auth/login
Content-Type: application/json
```

### Body (JSON):
```json
{
  "email": "admin@alexatech.com",
  "password": "admin123"
}
```

### ✅ Response Esperado (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "cm...",
      "nombre": "Admin",
      "correo": "admin@alexatech.com",
      "role": "ADMIN"
    }
  }
}
```

### 📝 IMPORTANTE:
**Guarda el TOKEN** para usarlo en todos los siguientes requests como:
```
Authorization: Bearer {TU_TOKEN_AQUI}
```

---

## 🏪 TEST 0.5: Obtener Cajas Registradoras

### Request:
```
GET http://localhost:3001/api/cash-registers
Authorization: Bearer {TU_TOKEN}
```

### ✅ Response Esperado (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "cmhtupodi001io19ske5kswsg",
      "codigo": "CAJA-01",
      "nombre": "Caja Principal",
      "ubicacion": "Mostrador Principal",
      "isActive": true
    }
  ]
}
```

### 📝 IMPORTANTE:
**Guarda el cashRegisterId** (ejemplo: `cmhtupodi001io19ske5kswsg`) para abrir la sesión.

---

## 🔓 TEST 1A: Abrir Sesión de Caja

### Request:
```
POST http://localhost:3001/api/cash-sessions/open
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

### Body (JSON):
```json
{
  "cashRegisterId": "cmhtupodi001io19ske5kswsg",
  "montoApertura": 100
}
```

### ✅ Response Esperado (201 Created):
```json
{
  "success": true,
  "message": "Sesión de caja abierta exitosamente",
  "data": {
    "id": "cm...",
    "cashRegisterId": "cmhtupodi001io19ske5kswsg",
    "montoApertura": 100,
    "montoCierre": null,
    "estado": "ABIERTA"
  }
}
```

### 📝 IMPORTANTE:
**Guarda el session.id** (cashSessionId) para los tests de NC con Efectivo.

---

## 💰 TEST 1B: Obtener Sesión de Caja Actual

### Request:
```
GET http://localhost:3001/api/cash-sessions/current?cashRegisterId=cmhtupodi001io19ske5kswsg
Authorization: Bearer {TU_TOKEN}
```

### ✅ Response Esperado (200 OK):
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "cm3...",
        "fechaApertura": "2025-11-12T...",
        "montoInicial": 500.00,
        "estado": "Abierta",
        "usuario": {...}
      }
    ]
  }
}
```

### 📝 IMPORTANTE:
**Guarda el `id`** de la sesión con `estado: "Abierta"` como `{CASH_SESSION_ID}`

### ⚠️ Si NO hay sesión abierta:

#### Crear Sesión de Caja:
```
POST http://localhost:3001/api/cash-movements/sessions
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

#### Body:
```json
{
  "montoInicial": 500
}
```

---

## 🛒 TEST 2: Crear Venta de Prueba

### PASO 2.1: Obtener ID de Producto

#### Request:
```
GET http://localhost:3001/api/products?search=&page=1&limit=10
Authorization: Bearer {TU_TOKEN}
```

#### 📝 Guardar:
- `products[0].id` como `{PRODUCT_ID}`
- Verificar que tenga `stock > 5`

### PASO 2.2: Crear Venta

#### Request:
```
POST http://localhost:3001/api/sales
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

#### Body:
```json
{
  "tipoComprobante": "NotaVenta",
  "formaPago": "Efectivo",
  "clienteId": null,
  "items": [
    {
      "productId": "{PRODUCT_ID}",
      "cantidad": 5,
      "precioUnitario": 1000.00
    }
  ],
  "observaciones": "Venta de prueba para NC"
}
```

#### ✅ Response Esperado (201 Created):
```json
{
  "success": true,
  "data": {
    "sale": {
      "id": "cm...",
      "codigoVenta": "V-20251112-00001",
      "tipoComprobante": "NotaVenta",
      "subtotal": 5000.00,
      "igv": 900.00,
      "total": 5900.00,
      "estado": "Completada",
      "items": [
        {
          "id": "cm...",
          "productId": "{PRODUCT_ID}",
          "cantidad": 5,
          "precioUnitario": 1000.00
        }
      ]
    }
  }
}
```

#### 📝 IMPORTANTE:
**Guardar:**
- `sale.id` como `{SALE_ID}`
- `sale.items[0].id` como `{SALE_ITEM_ID}`
- `sale.total` para verificar NC después

---

## 💵 TEST 3: NC con Efectivo (Reembolso Inmediato)

### Request:
```
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

### Body:
```json
{
  "saleId": "{SALE_ID}",
  "creditNoteReason": "DevolucionTotal",
  "descripcion": "Cliente devuelve producto por defecto de fábrica",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 5
    }
  ],
  "paymentMethod": "Efectivo",
  "cashSessionId": "{CASH_SESSION_ID}"
}
```

### ✅ Response Esperado (201 Created):
```json
{
  "success": true,
  "message": "Nota de crédito creada exitosamente",
  "data": {
    "creditNote": {
      "id": "cm...",
      "codigoVenta": "NC-20251112-00001",
      "subtotal": -5000.00,
      "igv": -900.00,
      "total": -5900.00,
      "creditNoteStatus": "Reembolsada",
      "creditNotePaymentMethod": "Efectivo",
      "cashMovementId": "cm...",
      "creditNoteRefundDate": "2025-11-12T..."
    }
  }
}
```

### ✅ Verificaciones Críticas:

1. **Status Code:** 201 Created
2. **creditNoteStatus:** `"Reembolsada"`
3. **creditNotePaymentMethod:** `"Efectivo"`
4. **cashMovementId:** **NO ES NULL** ⚠️
5. **total:** Negativo (-5900.00)
6. **📝 Guardar:** `creditNote.id` como `{CREDIT_NOTE_ID_1}`

### PASO 3.1: Verificar EGRESO en Caja

#### Request:
```
GET http://localhost:3001/api/cash-movements/sessions/{CASH_SESSION_ID}/movements
Authorization: Bearer {TU_TOKEN}
```

#### ✅ Debe aparecer EGRESO:
```json
{
  "movements": [
    {
      "tipo": "EGRESO",
      "monto": 5900.00,
      "motivo": "Reembolso por NC-20251112-00001",
      "creditNote": [
        {
          "id": "{CREDIT_NOTE_ID_1}",
          "codigoVenta": "NC-20251112-00001"
        }
      ]
    }
  ]
}
```

---

## 🎟️ TEST 4: NC como Vale

### PASO 4.1: Crear Nueva Venta

#### Request: (igual que TEST 2.2)
```
POST http://localhost:3001/api/sales
```

#### Body:
```json
{
  "tipoComprobante": "NotaVenta",
  "formaPago": "Efectivo",
  "clienteId": null,
  "items": [
    {
      "productId": "{PRODUCT_ID}",
      "cantidad": 3,
      "precioUnitario": 100.00
    }
  ]
}
```

#### 📝 Guardar: Nuevo `{SALE_ID_2}` y `{SALE_ITEM_ID_2}`

### PASO 4.2: Crear NC con Vale

#### Request:
```
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

#### Body:
```json
{
  "saleId": "{SALE_ID_2}",
  "creditNoteReason": "DevolucionTotal",
  "descripcion": "Cliente quiere vale para próxima compra",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID_2}",
      "cantidad": 3
    }
  ],
  "paymentMethod": "Vale"
}
```

### ✅ Response Esperado (201 Created):
```json
{
  "success": true,
  "data": {
    "creditNote": {
      "id": "cm...",
      "codigoVenta": "NC-20251112-00002",
      "total": -354.00,
      "creditNoteStatus": "Pendiente",
      "creditNotePaymentMethod": "Vale",
      "cashMovementId": null,
      "creditNoteRefundDate": null
    }
  }
}
```

### ✅ Verificaciones Críticas:

1. **Status Code:** 201 Created
2. **creditNoteStatus:** `"Pendiente"`
3. **creditNotePaymentMethod:** `"Vale"`
4. **cashMovementId:** `null` ⚠️ **CRÍTICO**
5. **creditNoteRefundDate:** `null`

### PASO 4.3: Verificar SIN EGRESO

#### Request:
```
GET http://localhost:3001/api/cash-movements/sessions/{CASH_SESSION_ID}/movements
```

#### ✅ Verificar:
**NO debe haber nuevo EGRESO** con esta NC (solo el del Test 3)

---

## 🏦 TEST 5: NC con Transferencia

### PASO 5.1: Crear Nueva Venta (igual que TEST 4.1)
- Guardar `{SALE_ID_3}` y `{SALE_ITEM_ID_3}`

### PASO 5.2: Crear NC con Transferencia

#### Request:
```
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

#### Body:
```json
{
  "saleId": "{SALE_ID_3}",
  "creditNoteReason": "DevolucionTotal",
  "descripcion": "Cliente solicita transferencia bancaria",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID_3}",
      "cantidad": 3
    }
  ],
  "paymentMethod": "Transferencia"
}
```

### ✅ Response Esperado:
```json
{
  "success": true,
  "data": {
    "creditNote": {
      "creditNoteStatus": "PendientePagoBancario",
      "creditNotePaymentMethod": "Transferencia",
      "cashMovementId": null
    }
  }
}
```

### ✅ Verificaciones:
1. **creditNoteStatus:** `"PendientePagoBancario"`
2. **cashMovementId:** `null`
3. **Sin EGRESO en caja**

---

## 📄 TEST 6: Descargar PDF

### Request:
```
GET http://localhost:3001/api/credit-notes/{CREDIT_NOTE_ID_1}/pdf
Authorization: Bearer {TU_TOKEN}
```

### ✅ Response Esperado:
- **Status:** 200 OK
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="NC-20251112-00001.pdf"`
- **Body:** Binary PDF data

### ✅ En Postman:
1. Click **Send**
2. Click **Save Response** → **Save to a file**
3. Guardar como `NC-TEST.pdf`
4. **Abrir el PDF** y verificar:

#### Verificaciones del PDF:

**Header:**
- [ ] Borde rojo alrededor
- [ ] Título "NOTA DE CRÉDITO" en rojo
- [ ] Código NC-20251112-00001
- [ ] Estado "Reembolsada"

**Información:**
- [ ] Comprobante Original: V-20251112-00001
- [ ] Fecha emisión
- [ ] Motivo: Devolución Total
- [ ] Método: Efectivo

**Tabla:**
- [ ] Cantidades en **negativo** (ej: -5)
- [ ] Cantidades en color **rojo**
- [ ] Montos en rojo

**Totales:**
- [ ] "TOTAL A FAVOR DEL CLIENTE:" en rojo
- [ ] Total: S/ -5,900.00 (negativo)

**Footer:**
- [ ] "✅ Reembolso procesado el DD/MM/YYYY"
- [ ] "Monto devuelto: S/ 5,900.00"

---

## ❌ TEST 7: Validaciones de Errores

### TEST 7.1: Sin paymentMethod

#### Request:
```
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json
```

#### Body (SIN paymentMethod):
```json
{
  "saleId": "{SALE_ID}",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 1
    }
  ]
}
```

#### ✅ Response Esperado (400 Bad Request):
```json
{
  "success": false,
  "message": "El método de pago es requerido",
  "statusCode": 400
}
```

---

### TEST 7.2: Efectivo sin cashSessionId

#### Body:
```json
{
  "saleId": "{SALE_ID}",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 1
    }
  ],
  "paymentMethod": "Efectivo"
}
```

#### ✅ Response Esperado (400):
```json
{
  "success": false,
  "message": "Se requiere cashSessionId para reembolsos en efectivo",
  "statusCode": 400
}
```

---

### TEST 7.3: Venta inexistente

#### Body:
```json
{
  "saleId": "venta-falsa-12345",
  "items": [
    {
      "saleItemId": "item-falso",
      "cantidad": 1
    }
  ],
  "paymentMethod": "Vale"
}
```

#### ✅ Response Esperado (404):
```json
{
  "success": false,
  "message": "Venta no encontrada",
  "statusCode": 404
}
```

---

### TEST 7.4: Cantidad excedida

#### Body (cantidad > vendida):
```json
{
  "saleId": "{SALE_ID}",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 999
    }
  ],
  "paymentMethod": "Vale"
}
```

#### ✅ Response Esperado (400):
```json
{
  "success": false,
  "message": "Cantidad a devolver excede la cantidad vendida",
  "statusCode": 400
}
```

---

## 📊 Checklist Final Backend

### Tests Principales:
- [ ] ✅ Test 0: Login y token obtenido
- [ ] ✅ Test 1: Sesión de caja obtenida/creada
- [ ] ✅ Test 2: Venta creada correctamente
- [ ] ✅ Test 3: NC Efectivo → EGRESO creado
- [ ] ✅ Test 4: NC Vale → Sin EGRESO
- [ ] ✅ Test 5: NC Transferencia → Sin EGRESO
- [ ] ✅ Test 6: PDF descarga y formato correcto

### Validaciones:
- [ ] ✅ Test 7.1: Error sin paymentMethod (400)
- [ ] ✅ Test 7.2: Error Efectivo sin session (400)
- [ ] ✅ Test 7.3: Error venta inexistente (404)
- [ ] ✅ Test 7.4: Error cantidad excedida (400)

### Verificaciones Extra:
- [ ] Stock revertido en todos los casos
- [ ] Saldo de caja reducido solo con Efectivo
- [ ] Estados de NC correctos
- [ ] cashMovementId null para Vale y Transferencia
- [ ] cashMovementId NOT null para Efectivo

---

## 🎯 Variables a Guardar en Postman

Para facilitar, guarda estas variables en Postman:

1. **TOKEN:** `{TU_TOKEN}`
2. **CASH_SESSION_ID:** `{ID_DE_SESION_ABIERTA}`
3. **PRODUCT_ID:** `{ID_DE_PRODUCTO}`
4. **SALE_ID:** `{ID_VENTA_1}`
5. **SALE_ITEM_ID:** `{ID_ITEM_VENTA_1}`
6. **SALE_ID_2:** `{ID_VENTA_2}`
7. **SALE_ITEM_ID_2:** `{ID_ITEM_VENTA_2}`
8. **SALE_ID_3:** `{ID_VENTA_3}`
9. **SALE_ITEM_ID_3:** `{ID_ITEM_VENTA_3}`
10. **CREDIT_NOTE_ID_1:** `{ID_NC_EFECTIVO}`

---

## ✅ Estado

**Backend:** ✅ Corriendo en puerto 3001  
**Listo para testing:** ✅ Sí  
**Última actualización:** 12/11/2025 21:15
