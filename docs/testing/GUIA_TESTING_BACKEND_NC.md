# 🧪 Guía de Testing Backend - Notas de Crédito con Postman

**Fecha:** 12 de noviembre de 2025  
**Backend URL:** http://localhost:3001  
**Estado:** ✅ Servidor corriendo correctamente

---

## 📋 Prerequisitos

1. **Backend corriendo** en `http://localhost:3001`
2. **Postman** instalado
3. **Token de autenticación** válido
4. **Usuario con permisos** de ventas y caja
5. **Sesión de caja abierta** (necesaria para NC con Efectivo)

---

## 🔐 Paso 0: Obtener Token de Autenticación

### Request: Login
```http
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "correo": "admin@alexatech.com",
  "contrasena": "admin123"
}
```

### Response Esperado:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "nombre": "Admin",
      "role": "ADMIN"
    }
  }
}
```

**📝 Nota:** Guarda el token, lo usarás en todos los requests siguientes como:
```
Authorization: Bearer {TOKEN_AQUI}
```

---

## 🧪 Test 1: Obtener Sesión de Caja Activa

**Objetivo:** Necesitamos el `cashSessionId` para NC con Efectivo

### Request:
```http
GET http://localhost:3001/api/cash-movements/sessions
Authorization: Bearer {TU_TOKEN}
```

### Response Esperado:
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "cm...",
        "fechaApertura": "2025-11-12T...",
        "montoInicial": 500.00,
        "estado": "Abierta"
      }
    ]
  }
}
```

**✅ Verificaciones:**
- [ ] Status: 200 OK
- [ ] `sessions` contiene al menos 1 sesión con `estado: "Abierta"`
- [ ] Guardar el `id` de la sesión activa

**📝 Nota:** Si no hay sesión abierta, crear una:
```http
POST http://localhost:3001/api/cash-movements/sessions
Authorization: Bearer {TU_TOKEN}

{
  "montoInicial": 500
}
```

---

## 🧪 Test 2: Crear Venta de Prueba

**Objetivo:** Necesitamos una venta para emitir NC

### Request:
```http
POST http://localhost:3001/api/sales
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json

{
  "tipoComprobante": "NotaVenta",
  "formaPago": "Efectivo",
  "clienteId": null,
  "items": [
    {
      "productId": "{PRODUCT_ID}",
      "cantidad": 5,
      "precioUnitario": 100.00
    }
  ],
  "observaciones": "Venta de prueba para NC"
}
```

### Response Esperado:
```json
{
  "success": true,
  "data": {
    "sale": {
      "id": "cm...",
      "codigoVenta": "V-20251112-00001",
      "total": 590.00,
      "subtotal": 500.00,
      "igv": 90.00,
      "items": [...]
    }
  }
}
```

**✅ Verificaciones:**
- [ ] Status: 201 Created
- [ ] `codigoVenta` generado correctamente
- [ ] `total = subtotal + igv`
- [ ] Guardar `sale.id` y `items[0].id`

---

## 🧪 Test 3: NC con Efectivo (Reembolso Inmediato)

**Objetivo:** NC con EGRESO automático en caja

### Request:
```http
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json

{
  "saleId": "{SALE_ID_DEL_TEST_2}",
  "creditNoteReason": "DevolucionTotal",
  "descripcion": "Cliente devuelve producto por defecto de fábrica",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 5
    }
  ],
  "paymentMethod": "Efectivo",
  "cashSessionId": "{CASH_SESSION_ID_DEL_TEST_1}"
}
```

### Response Esperado:
```json
{
  "success": true,
  "message": "Nota de crédito creada exitosamente",
  "data": {
    "creditNote": {
      "id": "cm...",
      "codigoVenta": "NC-20251112-00001",
      "total": -590.00,
      "creditNoteStatus": "Reembolsada",
      "creditNotePaymentMethod": "Efectivo",
      "cashMovementId": "cm...",
      "creditNoteRefundDate": "2025-11-12T..."
    }
  }
}
```

### ✅ Verificaciones Críticas:

1. **Status Code:**
   - [ ] Status: 201 Created

2. **NC Creada:**
   - [ ] `codigoVenta` empieza con `NC-`
   - [ ] `total` es **negativo** (-590.00)
   - [ ] `creditNoteStatus` = `"Reembolsada"`
   - [ ] `creditNotePaymentMethod` = `"Efectivo"`
   - [ ] `cashMovementId` **NO ES NULL**
   - [ ] `creditNoteRefundDate` tiene fecha actual

3. **Verificar CashMovement Creado:**
```http
GET http://localhost:3001/api/cash-movements/sessions/{CASH_SESSION_ID}/movements
Authorization: Bearer {TU_TOKEN}
```

**Debe mostrar un EGRESO:**
```json
{
  "tipo": "EGRESO",
  "monto": 590.00,
  "motivo": "Reembolso por NC-20251112-00001",
  "creditNote": [{
    "id": "...",
    "codigoVenta": "NC-20251112-00001"
  }]
}
```

4. **Verificar Inventario Revertido:**
```http
GET http://localhost:3001/api/products/{PRODUCT_ID}
Authorization: Bearer {TU_TOKEN}
```

**Stock debe haber aumentado en 5 unidades**

---

## 🧪 Test 4: NC como Vale (Sin movimiento de caja)

**Objetivo:** NC que cliente usará en futuras compras

### Request:
```http
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json

{
  "saleId": "{OTRO_SALE_ID}",
  "creditNoteReason": "DevolucionParcial",
  "descripcion": "Cliente quiere vale para próxima compra",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 2
    }
  ],
  "paymentMethod": "Vale"
}
```

### Response Esperado:
```json
{
  "success": true,
  "data": {
    "creditNote": {
      "id": "cm...",
      "codigoVenta": "NC-20251112-00002",
      "total": -236.00,
      "creditNoteStatus": "Pendiente",
      "creditNotePaymentMethod": "Vale",
      "cashMovementId": null,
      "creditNoteRefundDate": null
    }
  }
}
```

### ✅ Verificaciones:

1. **NC Creada:**
   - [ ] Status: 201 Created
   - [ ] `creditNoteStatus` = `"Pendiente"`
   - [ ] `creditNotePaymentMethod` = `"Vale"`
   - [ ] `cashMovementId` = `null` ⚠️ **CRÍTICO**
   - [ ] `creditNoteRefundDate` = `null`

2. **Sin Movimiento de Caja:**
```http
GET http://localhost:3001/api/cash-movements/sessions/{CASH_SESSION_ID}/movements
Authorization: Bearer {TU_TOKEN}
```
**NO debe haber nuevo EGRESO** (solo el del Test 3)

3. **Inventario Revertido:**
   - [ ] Stock aumentó en 2 unidades

---

## 🧪 Test 5: NC con Transferencia Bancaria

**Objetivo:** NC que finanzas procesará después

### Request:
```http
POST http://localhost:3001/api/credit-notes
Authorization: Bearer {TU_TOKEN}
Content-Type: application/json

{
  "saleId": "{OTRO_SALE_ID}",
  "creditNoteReason": "DevolucionTotal",
  "descripcion": "Cliente solicita transferencia bancaria",
  "items": [
    {
      "saleItemId": "{SALE_ITEM_ID}",
      "cantidad": 3
    }
  ],
  "paymentMethod": "Transferencia"
}
```

### Response Esperado:
```json
{
  "success": true,
  "data": {
    "creditNote": {
      "id": "cm...",
      "codigoVenta": "NC-20251112-00003",
      "total": -354.00,
      "creditNoteStatus": "PendientePagoBancario",
      "creditNotePaymentMethod": "Transferencia",
      "cashMovementId": null,
      "creditNoteRefundDate": null
    }
  }
}
```

### ✅ Verificaciones:

1. **NC Creada:**
   - [ ] Status: 201 Created
   - [ ] `creditNoteStatus` = `"PendientePagoBancario"`
   - [ ] `creditNotePaymentMethod` = `"Transferencia"`
   - [ ] `cashMovementId` = `null`
   - [ ] `creditNoteRefundDate` = `null`

2. **Sin Movimiento de Caja:**
   - [ ] No se creó EGRESO en caja

3. **Inventario Revertido:**
   - [ ] Stock aumentó correctamente

---

## 🧪 Test 6: Descargar PDF de NC

**Objetivo:** Verificar generación de PDF

### Request:
```http
GET http://localhost:3001/api/credit-notes/{CREDIT_NOTE_ID}/pdf
Authorization: Bearer {TU_TOKEN}
```

### Response Esperado:
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="NC-20251112-00001.pdf"`
- **Status:** 200 OK
- **Body:** Binary PDF data

### ✅ Verificaciones del PDF:

Abrir el PDF descargado y verificar:

1. **Header:**
   - [ ] Borde rojo alrededor
   - [ ] Título "NOTA DE CRÉDITO" en rojo
   - [ ] Código `NC-YYYYMMDD-XXXXX`
   - [ ] Estado (Reembolsada/Pendiente/etc)

2. **Información de NC:**
   - [ ] "Comprobante Original: V-YYYYMMDD-XXXXX"
   - [ ] Fecha emisión NC
   - [ ] Motivo correcto (Devolución Total/Parcial)
   - [ ] Método de pago (Efectivo/Vale/Transferencia)

3. **Datos del Cliente:**
   - [ ] Nombre/Razón social
   - [ ] Documento

4. **Tabla de Productos:**
   - [ ] Cantidades en **negativo** (ej: -5)
   - [ ] Cantidades en color **rojo**
   - [ ] Precios en rojo
   - [ ] Subtotales en rojo

5. **Totales:**
   - [ ] "TOTAL A FAVOR DEL CLIENTE:" en rojo
   - [ ] Montos en **negativo** y rojo

6. **Footer:**
   - **Si es Vale:**
     - [ ] "⚠️ Esta Nota de Crédito es un VALE..."
     - [ ] "Cliente puede usarlo en futuras compras"
   - **Si es Reembolsada:**
     - [ ] "✅ Reembolso procesado el DD/MM/YYYY"
     - [ ] "Monto devuelto: S/ XXX.XX"

---

## 🧪 Test 7: Validaciones de Errores

### Test 7.1: NC sin paymentMethod
```http
POST http://localhost:3001/api/credit-notes
...
{
  "saleId": "...",
  "items": [...],
  // ❌ Falta paymentMethod
}
```

**Esperado:**
```json
{
  "success": false,
  "message": "El método de pago es requerido",
  "statusCode": 400
}
```

### Test 7.2: NC Efectivo sin cashSessionId
```http
POST http://localhost:3001/api/credit-notes
...
{
  "saleId": "...",
  "items": [...],
  "paymentMethod": "Efectivo"
  // ❌ Falta cashSessionId
}
```

**Esperado:**
```json
{
  "success": false,
  "message": "Se requiere cashSessionId para reembolsos en efectivo",
  "statusCode": 400
}
```

### Test 7.3: NC de venta inexistente
```http
POST http://localhost:3001/api/credit-notes
...
{
  "saleId": "venta-falsa-123",
  "items": [...],
  "paymentMethod": "Vale"
}
```

**Esperado:**
```json
{
  "success": false,
  "message": "Venta no encontrada",
  "statusCode": 404
}
```

### Test 7.4: NC con cantidad mayor a la vendida
```http
POST http://localhost:3001/api/credit-notes
...
{
  "saleId": "...",
  "items": [
    {
      "saleItemId": "...",
      "cantidad": 999 // ❌ Mayor a lo vendido
    }
  ],
  "paymentMethod": "Vale"
}
```

**Esperado:**
```json
{
  "success": false,
  "message": "Cantidad a devolver excede la cantidad vendida",
  "statusCode": 400
}
```

---

## 📊 Resumen de Tests

| # | Test | Esperado | Status |
|---|------|----------|--------|
| 0 | Login y obtener token | Token válido | ⬜ |
| 1 | Obtener sesión de caja | cashSessionId | ⬜ |
| 2 | Crear venta de prueba | saleId + items | ⬜ |
| 3 | NC con Efectivo | EGRESO en caja | ⬜ |
| 4 | NC como Vale | Sin EGRESO | ⬜ |
| 5 | NC con Transferencia | Sin EGRESO | ⬜ |
| 6 | Descargar PDF | PDF con formato correcto | ⬜ |
| 7.1 | Error: sin paymentMethod | 400 | ⬜ |
| 7.2 | Error: Efectivo sin session | 400 | ⬜ |
| 7.3 | Error: venta inexistente | 404 | ⬜ |
| 7.4 | Error: cantidad excedida | 400 | ⬜ |

---

## 🎯 Checklist Final

### Backend:
- [ ] ✅ Servidor corriendo en 3001
- [ ] ✅ Compilación TypeScript exitosa
- [ ] ✅ Base de datos conectada
- [ ] ✅ Migración aplicada

### Tests Funcionales:
- [ ] NC con Efectivo crea EGRESO automático
- [ ] NC con Vale NO crea EGRESO
- [ ] NC con Transferencia NO crea EGRESO
- [ ] PDF se genera correctamente
- [ ] PDF tiene formato en rojo
- [ ] Inventario se revierte en todos los casos
- [ ] Estados de NC correctos (Reembolsada/Pendiente/PendientePagoBancario)

### Validaciones:
- [ ] paymentMethod es requerido
- [ ] cashSessionId requerido para Efectivo
- [ ] Errores 400/404 correctos
- [ ] Mensajes de error claros

---

## 🚀 Siguiente Paso

Una vez completados estos tests backend, continuar con:
- **Testing E2E Frontend** (ver `GUIA_TESTING_E2E_NC.md`)

---

**Estado:** ✅ Backend listo para testing  
**Última actualización:** 12/11/2025 20:55
