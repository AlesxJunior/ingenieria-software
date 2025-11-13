# 🧪 Guía de Testing E2E - Notas de Crédito Frontend

**Fecha:** 12 de noviembre de 2025  
**Frontend URL:** http://localhost:5173  
**Backend URL:** http://localhost:3001

---

## 📋 Prerequisitos

1. ✅ **Backend corriendo** en puerto 3001 (verificar con tests de Postman)
2. ✅ **Frontend corriendo** en puerto 5173
3. ✅ **Usuario con permisos** de ventas
4. ✅ **Sesión de caja abierta** (para NC con Efectivo)
5. ✅ **Productos en inventario** con stock suficiente

---

## 🚀 Iniciar Frontend

```powershell
cd "c:\Users\nesto\OneDrive\Escritorio\PROYECTO SOTFWARE\ingenieria-software\alexa-tech-react"
npm run dev
```

Verificar que abre en: **http://localhost:5173**

---

## 🧪 Test E2E 1: NC con Efectivo (Reembolso Inmediato)

**Objetivo:** Cliente devuelve producto y recibe dinero en efectivo inmediatamente.

### Paso 1: Preparación - Abrir Caja
1. Ir a **Gestión de Caja** → `http://localhost:5173/caja`
2. Si no hay caja abierta:
   - Click en **"Abrir Caja"**
   - Monto inicial: `500`
   - Click **"Abrir Sesión"**
3. ✅ Verificar: Badge muestra **"Caja Abierta"**
4. 📝 **Anotar el saldo actual**

### Paso 2: Crear Venta de Prueba
1. Ir a **Nueva Venta** → `http://localhost:5173/ventas/nueva`
2. Buscar producto (ej: "Laptop")
3. Agregar **5 unidades** al carrito
4. Click **"Procesar Venta"**
5. Tipo: **Nota de Venta**
6. Forma de pago: **Efectivo**
7. Click **"Confirmar Venta"**
8. ✅ Verificar: Notificación verde "Venta procesada exitosamente"
9. 📝 **Anotar:**
   - Código de venta (ej: V-20251112-00001)
   - Total de la venta (ej: S/ 5,900.00)

### Paso 3: Ir a Detalle de Venta
1. Ir a **Lista de Ventas** → `http://localhost:5173/ventas/lista`
2. Buscar la venta recién creada
3. Click en el **código de venta**
4. ✅ Verificar estás en: `/ventas/detalle/{saleId}`
5. ✅ Verificar botones visibles:
   - 🖨️ **Imprimir**
   - 📝 **Emitir Nota de Crédito**

### Paso 4: Abrir Modal de NC
1. Click en **"📝 Emitir Nota de Crédito"**
2. ✅ Verificar modal aparece con título: **"Emitir Nota de Crédito"**
3. ✅ Verificar campos:
   - Motivo (dropdown)
   - Lista de productos con checkboxes
   - Observaciones (textarea)

### Paso 5: Seleccionar Productos para Devolución Total
1. Seleccionar motivo: **"Devolución Total"**
2. Marcar el checkbox del producto
3. **Cantidad a devolver:** `5` (todas)
4. Observaciones: `"Cliente devuelve por defecto de fábrica"`
5. Click **"Continuar"**
6. ✅ Verificar: **Modal de selección se oculta**
7. ✅ Verificar: **Modal de pago aparece** con título: **"Seleccionar Método de Pago"**

### Paso 6: Modal de Método de Pago - Seleccionar Efectivo
1. ✅ Verificar información mostrada:
   - **"Monto a Procesar: S/ 5,900.00"** en fondo gris
2. ✅ Verificar 3 opciones de radio:
   - 💵 **Efectivo** - "Reembolso inmediato en caja"
   - 🏦 **Transferencia Bancaria** - "Se procesará fuera de caja"
   - 🎟️ **Vale** - "Cliente usa en futuras compras"
3. Seleccionar: **💵 Efectivo**
4. ✅ Verificar: **Alerta amarilla aparece**:
   ```
   ⚠️ Atención: Se registrará un EGRESO automático en la caja por S/ 5,900.00
   Asegúrate de tener efectivo suficiente antes de confirmar.
   ```
5. ✅ Verificar botones al final:
   - **Cancelar** (gris)
   - **Confirmar Reembolso** (azul)

### Paso 7: Confirmar Reembolso
1. Click en **"Confirmar Reembolso"**
2. ⏳ Esperar procesamiento (spinner)
3. ✅ Verificar: **Notificación verde** aparece: "Nota de Crédito Emitida"
4. ✅ Verificar: **PDF descarga automáticamente** con nombre: `nota-credito-{id}.pdf`
5. ✅ Verificar: Modal se cierra automáticamente

### Paso 8: Verificar Detalle de Venta Actualizado
1. ✅ Verificar: **Alerta amarilla** aparece en la parte superior:
   ```
   ⚠️ Esta venta tiene Notas de Crédito asociadas por un total de S/ 5,900.00
   ```
2. ✅ Verificar: En "TOTAL" aparece badge rojo **[NC]**
3. ✅ Verificar: Nueva sección **"📋 Historial de Notas de Crédito"** aparece
4. ✅ Verificar datos en el historial:
   - **Código NC:** NC-20251112-00001
   - **Estado:** Badge verde **"Reembolsada"**
   - **Método de Pago:** 💵 Efectivo
   - **Monto NC:** S/ 5,900.00 (en rojo)
   - **Botón:** 📥 **"Descargar PDF"**

### Paso 9: Descargar PDF desde Detalle
1. Click en **"📥 Descargar PDF"**
2. ✅ Verificar: PDF descarga
3. **Abrir el PDF** y verificar:

#### ✅ Verificaciones del PDF (Efectivo):

**Header:**
- [ ] Borde rojo alrededor del encabezado
- [ ] Título: **"NOTA DE CRÉDITO"** en rojo y grande
- [ ] Código: **NC-20251112-00001**
- [ ] Estado: **"Reembolsada"** en verde

**Información:**
- [ ] **Comprobante Original:** V-20251112-00001
- [ ] **Fecha Emisión NC:** 12/11/2025
- [ ] **Motivo:** Devolución Total
- [ ] **Método de Pago:** Efectivo

**Datos Cliente:**
- [ ] Nombre o "Cliente General"
- [ ] Documento (si tiene)

**Tabla de Productos:**
- [ ] Producto: Laptop (o el que usaste)
- [ ] **Cantidad:** `-5` (negativo y en rojo)
- [ ] **Precio Unitario:** S/ 1,000.00 (en rojo)
- [ ] **Subtotal:** S/ -5,000.00 (en rojo)

**Totales:**
- [ ] **Subtotal:** S/ -5,000.00 (rojo)
- [ ] **IGV (18%):** S/ -900.00 (rojo)
- [ ] **TOTAL A FAVOR DEL CLIENTE:** S/ -5,900.00 (grande, rojo, negrita)

**Footer (Específico para Efectivo):**
- [ ] ✅ **"Reembolso procesado el 12/11/2025"**
- [ ] **"Monto devuelto: S/ 5,900.00"**

### Paso 10: Verificar EGRESO en Gestión de Caja
1. Ir a **Gestión de Caja** → `http://localhost:5173/caja`
2. Scroll hasta **"Historial de Movimientos"**
3. ✅ Verificar: **Nuevo EGRESO** aparece al inicio de la tabla:
   - **Tipo:** EGRESO (rojo)
   - **Monto:** S/ 5,900.00
   - **Motivo:** "Reembolso por NC-20251112-00001"
   - **Fecha:** 12/11/2025 (hoy)
4. ✅ Verificar: **Saldo actual se redujo en S/ 5,900.00**
   - Si saldo inicial era S/ 500.00
   - Saldo ahora debe ser: **S/ -5,400.00** (negativo, en rojo)

### Paso 11: Verificar Inventario
1. Ir a **Productos** → `http://localhost:5173/productos`
2. Buscar el producto devuelto (Laptop)
3. ✅ Verificar: **Stock aumentó en 5 unidades**
   - Si tenía 10, ahora tiene **15**

---

## 🧪 Test E2E 2: NC como Vale (Sin movimiento de caja)

**Objetivo:** Cliente prefiere guardar el crédito para futuras compras.

### Paso 1: Crear Nueva Venta
1. Ir a **Nueva Venta**
2. Agregar producto: **3 unidades** de "Mouse" (S/ 100 c/u)
3. Total: S/ 354.00
4. Procesar como **Nota de Venta**, pago **Efectivo**
5. ✅ Verificar: Venta procesada
6. 📝 Anotar: Código venta (ej: V-20251112-00002)

### Paso 2: Ir a Detalle y Emitir NC
1. Ir al detalle de la venta
2. Click **"Emitir Nota de Crédito"**
3. Motivo: **"Devolución Total"**
4. Marcar producto, cantidad: **3**
5. Observaciones: `"Cliente quiere vale para próxima compra"`
6. Click **"Continuar"**

### Paso 3: Seleccionar Vale en Modal de Pago
1. ✅ Verificar: Modal de pago aparece
2. Seleccionar: **🎟️ Vale**
3. ✅ Verificar: **Alerta azul** aparece:
   ```
   ℹ️ Esta Nota de Crédito será un vale que el cliente puede usar en futuras compras.
   No se realizará ningún movimiento de efectivo en caja.
   ```
4. ✅ Verificar: **NO aparece** alerta amarilla de EGRESO
5. Click **"Confirmar"**

### Paso 4: Verificaciones Post-Emisión
1. ✅ Verificar: Notificación verde
2. ✅ Verificar: PDF descarga automáticamente
3. ✅ Verificar en Historial de NC:
   - **Estado:** Badge amarillo **"Pendiente (Vale)"**
   - **Método de Pago:** 🎟️ Vale
   - **Monto:** S/ 354.00

### Paso 5: Verificar PDF (Vale)
**Abrir el PDF descargado:**

**Footer (Específico para Vale):**
- [ ] ⚠️ **"Esta Nota de Crédito es un VALE para futuras compras"**
- [ ] **"Código de Vale: NC-20251112-00002"**
- [ ] **"Monto disponible: S/ 354.00"**
- [ ] **"Cliente debe presentar este comprobante en su próxima compra"**

### Paso 6: Verificar que NO hay EGRESO en Caja
1. Ir a **Gestión de Caja**
2. Ver historial de movimientos
3. ✅ Verificar: **NO aparece** nuevo EGRESO con este monto
4. ✅ Verificar: **Saldo de caja NO cambió**

### Paso 7: Verificar Inventario Aumentó
1. Ir a **Productos**
2. Buscar "Mouse"
3. ✅ Verificar: **Stock aumentó en 3 unidades**

---

## 🧪 Test E2E 3: NC con Transferencia Bancaria

**Objetivo:** Finanzas procesará el reembolso por transferencia más tarde.

### Paso 1: Crear Nueva Venta
1. Nueva venta con **2 unidades** de "Teclado" (S/ 200 c/u)
2. Total: S/ 472.00
3. Procesar venta
4. 📝 Anotar código

### Paso 2: Emitir NC con Transferencia
1. Ir al detalle
2. Click **"Emitir Nota de Crédito"**
3. Motivo: **"Devolución Parcial"**
4. Cantidad: **1** (de 2)
5. Observaciones: `"Cliente solicita transferencia bancaria"`
6. Click **"Continuar"**

### Paso 3: Seleccionar Transferencia
1. En modal de pago, seleccionar: **🏦 Transferencia Bancaria**
2. ✅ Verificar: **NO aparece** alerta amarilla
3. ✅ Verificar: Texto informativo: "Se procesará fuera de caja"
4. Click **"Confirmar"**

### Paso 4: Verificaciones
1. ✅ Verificar: PDF descarga
2. ✅ Verificar estado: Badge azul **"Pendiente Pago Bancario"**
3. ✅ Verificar método: 🏦 Transferencia
4. ✅ Verificar: **Sin EGRESO en caja**
5. ✅ Verificar: **Stock aumentó en 1 unidad**

### Paso 5: Verificar PDF (Transferencia)
**Footer esperado:**
- [ ] **"Pendiente de pago por transferencia bancaria"**
- [ ] **"El área de finanzas procesará el reembolso"**
- [ ] **Monto:** S/ 236.00

---

## 🧪 Test E2E 4: Devolución Parcial con Efectivo

**Objetivo:** Cliente devuelve solo algunos productos y recibe efectivo.

### Paso 1: Crear Venta con Múltiples Productos
1. Nueva venta:
   - 5 unidades de "Laptop" (S/ 1,000 c/u)
   - 3 unidades de "Mouse" (S/ 100 c/u)
2. Total: S/ 6,254.00
3. Procesar venta

### Paso 2: Emitir NC Parcial
1. Detalle de venta
2. Click **"Emitir Nota de Crédito"**
3. Motivo: **"Devolución Parcial"**
4. Seleccionar:
   - ✅ Laptop: **2 unidades** (de 5)
   - ✅ Mouse: **1 unidad** (de 3)
5. Observaciones: `"Cliente solo devuelve algunos productos"`
6. Click **"Continuar"**

### Paso 3: Confirmar con Efectivo
1. Seleccionar **💵 Efectivo**
2. ✅ Verificar monto calculado: S/ 2,478.00
   - (2 × 1,000) + (1 × 100) = 2,100 subtotal
   - IGV 18%: 378
   - Total: 2,478
3. Click **"Confirmar Reembolso"**

### Paso 4: Verificaciones
1. ✅ PDF descarga
2. ✅ EGRESO en caja: S/ 2,478.00
3. ✅ Stock:
   - Laptop: +2 unidades
   - Mouse: +1 unidad
4. ✅ Venta original mantiene:
   - Total original: S/ 6,254.00
   - Monto NC: -S/ 2,478.00
   - **Monto efectivo:** S/ 3,776.00 (mostrado en naranja)

---

## 🧪 Test E2E 5: Intentar NC sin Caja Abierta (Efectivo)

**Objetivo:** Verificar validación cuando no hay caja abierta.

### Paso 1: Cerrar Caja
1. Ir a **Gestión de Caja**
2. Click **"Cerrar Caja"**
3. Confirmar cierre

### Paso 2: Intentar NC con Efectivo
1. Ir al detalle de cualquier venta
2. Click **"Emitir Nota de Crédito"**
3. Seleccionar productos
4. Click **"Continuar"**
5. Seleccionar **💵 Efectivo**
6. Click **"Confirmar Reembolso"**

### Paso 3: Verificar Error
1. ✅ Verificar: **Notificación roja** aparece
2. ✅ Mensaje esperado:
   ```
   "Se requiere cashSessionId para reembolsos en efectivo"
   ```
   O:
   ```
   "No hay sesión de caja abierta"
   ```
3. ✅ Verificar: Modal NO se cierra
4. ✅ Verificar: NC NO se creó

---

## 🧪 Test E2E 6: Descargar PDF desde Historial

**Objetivo:** Verificar que se pueden re-descargar PDFs.

### Paso 1: Ir a Detalle de Venta con NC
1. Ir a una venta que ya tiene NC emitida
2. Scroll hasta **"Historial de Notas de Crédito"**

### Paso 2: Descargar PDF
1. Click en **"📥 Descargar PDF"** de cualquier NC
2. ✅ Verificar: PDF descarga correctamente
3. ✅ Verificar: Contenido idéntico al original

---

## 📊 Checklist Final E2E

### Test 1: NC con Efectivo
- [ ] Modal de pago muestra 3 opciones
- [ ] Alerta amarilla aparece al seleccionar Efectivo
- [ ] PDF descarga automáticamente
- [ ] Estado: "Reembolsada" (verde)
- [ ] EGRESO registrado en caja
- [ ] Saldo de caja se redujo
- [ ] Stock aumentó
- [ ] PDF footer muestra "Reembolso procesado"

### Test 2: NC como Vale
- [ ] Alerta azul aparece al seleccionar Vale
- [ ] Estado: "Pendiente (Vale)" (amarillo)
- [ ] Sin EGRESO en caja
- [ ] Saldo de caja NO cambió
- [ ] Stock aumentó
- [ ] PDF footer muestra "VALE para futuras compras"

### Test 3: NC con Transferencia
- [ ] Sin alertas al seleccionar Transferencia
- [ ] Estado: "Pendiente Pago Bancario" (azul cyan)
- [ ] Sin EGRESO en caja
- [ ] Stock aumentó
- [ ] PDF footer muestra "Pendiente de pago"

### Test 4: Devolución Parcial
- [ ] Se pueden seleccionar cantidades menores
- [ ] Monto calculado correctamente
- [ ] Venta original muestra "Monto efectivo"
- [ ] Stock aumentó solo en cantidad devuelta

### Test 5: Validación sin Caja
- [ ] Error mostrado correctamente
- [ ] Modal no se cierra
- [ ] NC no se crea

### Test 6: Re-descargar PDF
- [ ] Botón funciona múltiples veces
- [ ] PDF idéntico al original

---

## 🎯 Matriz de Estados vs Métodos de Pago

| Método | Estado NC | EGRESO Caja | PDF Footer |
|--------|-----------|-------------|------------|
| **Efectivo** | Reembolsada | ✅ Sí | "Reembolso procesado" |
| **Vale** | Pendiente | ❌ No | "VALE para futuras compras" |
| **Transferencia** | PendientePagoBancario | ❌ No | "Pendiente de pago" |

---

## 🐛 Bugs Conocidos / Edge Cases

### ⚠️ Casos a probar manualmente:

1. **Múltiples NC sobre la misma venta:**
   - Crear venta con 10 unidades
   - NC 1: Devolver 3 unidades
   - NC 2: Devolver 2 unidades más
   - ✅ Verificar: Total NC = -5 unidades
   - ✅ Verificar: Stock +5 total

2. **NC total elimina toda la venta:**
   - ✅ Verificar: Monto efectivo = S/ 0.00
   - ✅ Verificar: Badge [NC] se muestra

3. **Saldo de caja negativo después de EGRESO:**
   - Saldo inicial: S/ 500
   - NC de S/ 6,000
   - ✅ Verificar: Saldo = -S/ 5,500 (en rojo)
   - ✅ Verificar: Sistema permite (no bloquea)

---

## ✅ Criterios de Aceptación Final

### Funcionalidad:
- [ ] Los 3 métodos de pago funcionan correctamente
- [ ] PDF descarga automáticamente al emitir NC
- [ ] PDF se puede re-descargar desde historial
- [ ] Estados de NC correctos según método
- [ ] EGRESO solo se crea con Efectivo
- [ ] Inventario se revierte en todos los casos

### UX:
- [ ] Modal de pago es intuitivo
- [ ] Alertas informativas claras
- [ ] Badges de estado con colores correctos
- [ ] Iconos de método de pago (💵🏦🎟️)
- [ ] Notificaciones de éxito/error

### PDF:
- [ ] Formato en rojo (header, cantidades, totales)
- [ ] Cantidades negativas
- [ ] Footer específico por método
- [ ] Logo y datos empresa
- [ ] Código QR (si aplica)

---

## 🚀 Siguiente Paso

Si todos los tests E2E pasan:
- ✅ **Marcar TODO #10 como completado**
- ✅ **Documentar en PR_DESCRIPTION.md**
- ✅ **Crear commit con mensaje:**
  ```
  feat: Implementar NC con PDF y gestión de caja

  - Sistema de 3 métodos de pago (Efectivo, Vale, Transferencia)
  - Generación automática de PDF con formato en rojo
  - Integración con gestión de caja (EGRESO automático)
  - Modal de selección de método de pago
  - Badges de estado en DetalleVenta
  - Tests backend y E2E completos
  ```

---

**Estado:** 🟡 Pendiente de ejecución  
**Última actualización:** 12/11/2025 21:00
