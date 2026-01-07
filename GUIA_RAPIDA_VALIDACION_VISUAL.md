# 🎯 GUÍA RÁPIDA - VALIDACIÓN VISUAL DEL FLUJO

## 🚀 INICIO RÁPIDO

**URLs abiertas:**
- ✅ Backend: http://localhost:3001/api
- ✅ Frontend: http://localhost:5173/compras/ordenes
- ✅ Navegador VS Code: Abierto en módulo de compras

**Login:**
- Email: `admin@alexatech.com`
- Password: `admin123`

---

## 📋 FLUJO VISUAL (8 PASOS)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  PENDIENTE  │────▶│   ENVIADA   │────▶│ CONFIRMADA  │────▶│EN_RECEPCION │
│   (amarillo)│ [1] │    (azul)   │ [2] │   (verde)   │ [3] │  (naranja)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
    Manual              Manual              Manual           🤖 AUTOMÁTICO

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   PARCIAL   │────▶│ COMPLETADA  │────▶│   CERRADA   │
│ (amarillo)  │ [5] │   (verde)   │ [7] │    (gris)   │
└─────────────┘     └─────────────┘     └─────────────┘
  🤖 AUTOMÁTICO      🤖 AUTOMÁTICO         Manual

[1] Click "➡️ Enviar a Proveedor"
[2] Click "➡️ Confirmar Orden"
[3] Click "📦 Crear Recepción" → Llenar form → Cantidades parciales (30, 20)
[4] Confirmar recepción → AUTOMÁTICO → PARCIAL
[5] Click "📦 Crear Recepción" → Llenar form → Cantidades completas (20, 10)
[6] Confirmar recepción → AUTOMÁTICO → COMPLETADA
[7] Click "➡️ Cerrar Orden"
```

---

## 🔍 LOGS DE CONSOLA ESPERADOS

### 📺 Consola del Backend (PowerShell - alexa-tech-backend)

```powershell
# PASO 1: Crear Orden
[Nest] 12345  - LOG     [RouterExplorer] Mapped {/api/compras/ordenes, POST}
[Nest] 12345  - INFO    [PurchasesService] Orden creada: OC-2025-0040
[Nest] 12345  - INFO    [PurchasesService] Estado: PENDIENTE
[Nest] 12345  - INFO    [PurchasesService] Total: S/ 7400.00

# PASO 2: Enviar (Manual)
[Nest] 12345  - LOG     [PurchasesController] Actualizando estado orden
[Nest] 12345  - INFO    [PurchasesService] Transición: PENDIENTE → ENVIADA
[Nest] 12345  - INFO    [PurchasesService] Fecha envío: 2025-12-04T10:30:00Z

# PASO 3: Confirmar (Manual)
[Nest] 12345  - LOG     [PurchasesController] Actualizando estado orden
[Nest] 12345  - INFO    [PurchasesService] Transición: ENVIADA → CONFIRMADA
[Nest] 12345  - INFO    [PurchasesService] Fecha confirmación: 2025-12-04T10:31:00Z

# PASO 4: Crear Recepción Parcial
[Nest] 12345  - LOG     [PurchaseReceiptsController] Creando recepción
[Nest] 12345  - INFO    [PurchaseReceiptsService] Recepción creada: RC-2025-0009
[Nest] 12345  - INFO    [PurchaseReceiptsService] Estado recepción: PENDIENTE
[Nest] 12345  - WARN    [PurchaseReceiptsService] ⚡ TRANSICIÓN AUTOMÁTICA DETECTADA
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✨ CONFIRMADA → EN_RECEPCION
[Nest] 12345  - INFO    [PurchaseReceiptsService] Orden OC-2025-0040 actualizada

# PASO 5: Confirmar Recepción Parcial
[Nest] 12345  - LOG     [PurchaseReceiptsController] Confirmando recepción
[Nest] 12345  - INFO    [PurchaseReceiptsService] Recepción RC-2025-0009 confirmada
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✅ Stock actualizado en almacén WH-PRINCIPAL
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✅ Kardex: 2 movimientos ENTRADA creados
[Nest] 12345  - INFO    [PurchaseReceiptsService] 📊 Evaluando cantidades...
[Nest] 12345  - WARN    [PurchaseReceiptsService] ⚡ Producto 1: 30/50 recibido (20 pendientes)
[Nest] 12345  - WARN    [PurchaseReceiptsService] ⚡ Producto 2: 20/30 recibido (10 pendientes)
[Nest] 12345  - WARN    [PurchaseReceiptsService] ⚡ TRANSICIÓN AUTOMÁTICA DETECTADA
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✨ EN_RECEPCION → PARCIAL
[Nest] 12345  - INFO    [PurchaseReceiptsService] Orden OC-2025-0040 actualizada

# PASO 6: Crear Segunda Recepción Completa
[Nest] 12345  - LOG     [PurchaseReceiptsController] Creando recepción
[Nest] 12345  - INFO    [PurchaseReceiptsService] Recepción creada: RC-2025-0010
[Nest] 12345  - INFO    [PurchaseReceiptsService] Estado recepción: PENDIENTE
[Nest] 12345  - INFO    [PurchaseReceiptsService] Estado orden: PARCIAL (sin cambios)

# PASO 7: Confirmar Segunda Recepción
[Nest] 12345  - LOG     [PurchaseReceiptsController] Confirmando recepción
[Nest] 12345  - INFO    [PurchaseReceiptsService] Recepción RC-2025-0010 confirmada
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✅ Stock actualizado en almacén WH-PRINCIPAL
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✅ Kardex: 2 movimientos ENTRADA creados
[Nest] 12345  - INFO    [PurchaseReceiptsService] 📊 Evaluando cantidades...
[Nest] 12345  - INFO    [PurchaseReceiptsService] 🎉 Producto 1: 50/50 recibido (COMPLETO)
[Nest] 12345  - INFO    [PurchaseReceiptsService] 🎉 Producto 2: 30/30 recibido (COMPLETO)
[Nest] 12345  - WARN    [PurchaseReceiptsService] ⚡ TRANSICIÓN AUTOMÁTICA DETECTADA
[Nest] 12345  - INFO    [PurchaseReceiptsService] ✨ PARCIAL → COMPLETADA
[Nest] 12345  - INFO    [PurchaseReceiptsService] 📅 Fecha entrega real: 2025-12-04T10:35:00Z
[Nest] 12345  - INFO    [PurchaseReceiptsService] Orden OC-2025-0040 actualizada

# PASO 8: Cerrar Orden (Manual)
[Nest] 12345  - LOG     [PurchasesController] Actualizando estado orden
[Nest] 12345  - INFO    [PurchasesService] Transición: COMPLETADA → CERRADA
[Nest] 12345  - INFO    [PurchasesService] 🎉 Orden OC-2025-0040 cerrada
[Nest] 12345  - INFO    [PurchasesService] Flujo completo finalizado
```

---

### 🌐 Consola del Navegador (F12 → Console)

```javascript
// PASO 1: Crear Orden
POST http://localhost:3001/api/compras/ordenes 201
{
  success: true,
  data: {
    id: "...",
    codigo: "OC-2025-0040",
    estado: "PENDIENTE",
    total: "7400",
    items: [...]
  },
  message: "Orden de compra creada exitosamente"
}

// PASO 2: Enviar
PATCH http://localhost:3001/api/compras/ordenes/{id}/estado 200
{
  success: true,
  data: { estado: "ENVIADA", fechaEnvio: "2025-12-04T..." },
  message: "Estado actualizado correctamente"
}

// PASO 3: Confirmar
PATCH http://localhost:3001/api/compras/ordenes/{id}/estado 200
{
  success: true,
  data: { estado: "CONFIRMADA", fechaConfirmacion: "2025-12-04T..." },
  message: "Orden confirmada correctamente"
}

// PASO 4: Crear Recepción Parcial (¡Mira el estado de ordenCompra!)
POST http://localhost:3001/api/compras/recepciones 201
{
  success: true,
  data: {
    codigo: "RC-2025-0009",
    estado: "PENDIENTE",
    ordenCompra: {
      estado: "EN_RECEPCION",  // ← ¡CAMBIÓ AUTOMÁTICAMENTE!
      ...
    }
  },
  message: "Recepción creada exitosamente"
}

// PASO 5: Confirmar Recepción Parcial (¡Mira el estado de ordenCompra!)
PATCH http://localhost:3001/api/compras/recepciones/{id}/confirmar 200
{
  success: true,
  data: {
    estado: "CONFIRMADA",
    ordenCompra: {
      estado: "PARCIAL",  // ← ¡CAMBIÓ AUTOMÁTICAMENTE!
      items: [
        { cantidadRecibida: 30, cantidadPendiente: 20 },
        { cantidadRecibida: 20, cantidadPendiente: 10 }
      ]
    }
  },
  message: "Recepción confirmada. Inventario actualizado."
}

// PASO 6: Crear Segunda Recepción
POST http://localhost:3001/api/compras/recepciones 201
{
  success: true,
  data: {
    codigo: "RC-2025-0010",
    estado: "PENDIENTE",
    ...
  }
}

// PASO 7: Confirmar Segunda Recepción (¡Mira el estado de ordenCompra!)
PATCH http://localhost:3001/api/compras/recepciones/{id}/confirmar 200
{
  success: true,
  data: {
    estado: "CONFIRMADA",
    ordenCompra: {
      estado: "COMPLETADA",  // ← ¡CAMBIÓ AUTOMÁTICAMENTE!
      fechaEntregaReal: "2025-12-04T...",
      items: [
        { cantidadRecibida: 50, cantidadPendiente: 0 },  // ← COMPLETO
        { cantidadRecibida: 30, cantidadPendiente: 0 }   // ← COMPLETO
      ]
    }
  },
  message: "Recepción confirmada. Inventario actualizado."
}

// PASO 8: Cerrar Orden
PATCH http://localhost:3001/api/compras/ordenes/{id}/estado 200
{
  success: true,
  data: { estado: "CERRADA" },
  message: "Orden cerrada exitosamente"
}
```

---

## 🎨 CAMBIOS VISUALES EN LA UI

### Estado PENDIENTE
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [PENDIENTE]  S/ 7,400.00     │
│ ➡️ Enviar a Proveedor   👁️ Ver   ✏️ Editar │
└─────────────────────────────────────────────┘
Badge: 🟡 Amarillo
```

### Estado ENVIADA
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [ENVIADA]    S/ 7,400.00     │
│ ➡️ Confirmar Orden      👁️ Ver             │
└─────────────────────────────────────────────┘
Badge: 🔵 Azul
```

### Estado CONFIRMADA
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [CONFIRMADA]  S/ 7,400.00    │
│ 📦 Crear Recepción      👁️ Ver             │
└─────────────────────────────────────────────┘
Badge: 🟢 Verde
Botón nuevo: "📦 Crear Recepción" (verde)
```

### Estado EN_RECEPCION (Automático!)
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [EN_RECEPCION]  S/ 7,400.00  │
│ 📦 Crear Recepción      👁️ Ver             │
└─────────────────────────────────────────────┘
Badge: 🟠 Naranja/Azul
¡CAMBIÓ AUTOMÁTICAMENTE AL CREAR RECEPCIÓN!
```

### Estado PARCIAL (Automático!)
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [PARCIAL]     S/ 7,400.00    │
│ 📦 Crear Recepción      👁️ Ver             │
│ Recibido: 60% | Pendiente: 40%             │
└─────────────────────────────────────────────┘
Badge: 🟡 Amarillo/Naranja
¡CAMBIÓ AUTOMÁTICAMENTE AL CONFIRMAR RECEPCIÓN!
```

### Estado COMPLETADA (Automático!)
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [COMPLETADA]  S/ 7,400.00    │
│ ➡️ Cerrar Orden         👁️ Ver             │
│ Recibido: 100% ✅                           │
└─────────────────────────────────────────────┘
Badge: 🟢 Verde brillante
¡CAMBIÓ AUTOMÁTICAMENTE AL COMPLETAR TODO!
Ya NO aparece botón "📦 Crear Recepción"
```

### Estado CERRADA
```
┌─────────────────────────────────────────────┐
│ OC-2025-0040  [CERRADA]     S/ 7,400.00    │
│ 👁️ Ver (solo lectura)                      │
└─────────────────────────────────────────────┘
Badge: ⚫ Gris
Sin botones de acción
```

---

## 🔥 PUNTOS CRÍTICOS A OBSERVAR

### 1️⃣ Después de Crear Primera Recepción Parcial
**¡OBSERVA EL BADGE!** Debe cambiar de verde "CONFIRMADA" a naranja "EN_RECEPCION" **automáticamente**.

**En logs del backend verás:**
```
✨ CONFIRMADA → EN_RECEPCION
```

### 2️⃣ Después de Confirmar Primera Recepción
**¡OBSERVA EL BADGE!** Debe cambiar de naranja "EN_RECEPCION" a amarillo "PARCIAL" **automáticamente**.

**En logs del backend verás:**
```
📊 Evaluando cantidades...
⚡ Producto 1: 30/50 recibido (20 pendientes)
✨ EN_RECEPCION → PARCIAL
```

### 3️⃣ Después de Confirmar Segunda Recepción
**¡OBSERVA EL BADGE!** Debe cambiar de amarillo "PARCIAL" a verde brillante "COMPLETADA" **automáticamente**.

**En logs del backend verás:**
```
🎉 Producto 1: 50/50 recibido (COMPLETO)
🎉 Producto 2: 30/30 recibido (COMPLETO)
✨ PARCIAL → COMPLETADA
```

---

## 📊 INVENTARIO Y KARDEX

### Verificar Inventario
1. **Ir a:** http://localhost:5173/inventario
2. **Buscar productos:** Los 2 productos de la orden
3. **Verificar stock:**
   - Después de 1ra recepción: +30 y +20
   - Después de 2da recepción: +20 y +10
   - **Total incrementado:** +50 y +30

### Verificar Kardex
1. **Ir a:** http://localhost:5173/inventario/kardex
2. **Filtrar por fecha:** Hoy (4 dic 2025)
3. **Verificar movimientos:**
   - **Tipo:** ENTRADA
   - **Documentos:** RC-2025-0009, RC-2025-0010
   - **Cantidades:** Primera recepción (30, 20), Segunda recepción (20, 10)

---

## ✅ CHECKLIST DE VALIDACIÓN

Marca cada punto al validarlo:

- [ ] **PASO 1:** Orden creada en PENDIENTE (badge amarillo)
- [ ] **PASO 2:** Botón "➡️ Enviar a Proveedor" funciona → Badge azul ENVIADA
- [ ] **PASO 3:** Botón "➡️ Confirmar Orden" funciona → Badge verde CONFIRMADA
- [ ] **PASO 3.1:** Aparece botón "📦 Crear Recepción" (verde)
- [ ] **PASO 4:** Click "📦 Crear Recepción" navega a formulario
- [ ] **PASO 4.1:** Cantidades parciales (30, 20) ingresadas
- [ ] **PASO 4.2:** Recepción creada → Regresa a órdenes
- [ ] **PASO 4.3:** 🔥 **Badge cambió a EN_RECEPCION (automático)**
- [ ] **PASO 5:** Navegar a recepciones, confirmar RC-2025-0009
- [ ] **PASO 5.1:** 🔥 **Regresa a órdenes → Badge cambió a PARCIAL (automático)**
- [ ] **PASO 5.2:** Ver detalle → Cantidades 30/50 y 20/30, pendientes 20 y 10
- [ ] **PASO 6:** Click "📦 Crear Recepción" nuevamente
- [ ] **PASO 6.1:** Cantidades completas (20, 10) pre-llenadas
- [ ] **PASO 6.2:** Recepción RC-2025-0010 creada
- [ ] **PASO 7:** Confirmar RC-2025-0010
- [ ] **PASO 7.1:** 🔥 **Regresa a órdenes → Badge cambió a COMPLETADA (automático)**
- [ ] **PASO 7.2:** Ya NO aparece botón "📦 Crear Recepción"
- [ ] **PASO 7.3:** Aparece botón "➡️ Cerrar Orden"
- [ ] **PASO 7.4:** Ver detalle → Cantidades 50/50 y 30/30, pendientes 0 y 0 ✅
- [ ] **PASO 8:** Click "➡️ Cerrar Orden" → Badge gris CERRADA
- [ ] **PASO 8.1:** Sin botones de acción disponibles
- [ ] **Inventario:** Stock incrementado correctamente
- [ ] **Kardex:** Movimientos ENTRADA registrados

---

## 🎉 RESULTADO FINAL

Si todos los puntos están marcados:

```
✅ FLUJO DE COMPRAS: 100% FUNCIONAL
✅ Transiciones automáticas: FUNCIONANDO
✅ Transiciones manuales: FUNCIONANDO
✅ Inventario: ACTUALIZÁNDOSE
✅ Kardex: REGISTRANDO
✅ UI/UX: CORRECTA

🏆 MÓDULO DE COMPRAS VALIDADO EXITOSAMENTE
```

---

**¡Comienza las pruebas ahora!** 🚀

El navegador ya está abierto en: http://localhost:5173/compras/ordenes

Sigue los pasos y observa los logs en las consolas de backend y navegador.
