# 🎯 Guía de Testing E2E Frontend - Notas de Crédito

**Frontend URL:** http://localhost:5173  
**Backend URL:** http://localhost:3001  
**Estado:** ✅ Ambos servidores corriendo

---

## 📋 Checklist de Tests E2E

- [ ] **Test 1:** Login en UI
- [ ] **Test 2:** Abrir sesión de caja desde UI
- [ ] **Test 3:** Crear venta con Efectivo
- [ ] **Test 4:** Emitir NC con Efectivo (verificar EGRESO)
- [ ] **Test 5:** Emitir NC con Vale (descargar PDF)
- [ ] **Test 6:** Emitir NC con Transferencia
- [ ] **Test 7:** Validar error sin sesión de caja
- [ ] **Test 8:** Re-descargar PDF desde historial
- [ ] **Test 9:** Verificar movimientos en Gestión de Caja
- [ ] **Test 10:** Verificación final del flujo completo

---

## 🔐 TEST 1: Login en UI

### Pasos:
1. Abre el navegador en: **http://localhost:5173**
2. Deberías ver la pantalla de login
3. Ingresa credenciales:
   - **Email:** `admin@alexatech.com`
   - **Password:** `admin123`
4. Click en **"Iniciar Sesión"**

### ✅ Resultado Esperado:
- Login exitoso
- Redirección al Dashboard
- Usuario visible en header: "Admin User"
- Sidebar con módulos: Dashboard, Productos, Ventas, Inventario, etc.

### 📸 Verifica:
- [ ] ¿Se cargó el Dashboard correctamente?
- [ ] ¿Aparece el nombre del usuario en el header?
- [ ] ¿El sidebar muestra todos los módulos?

---

## 💰 TEST 2: Abrir Sesión de Caja desde UI

### Pasos:
1. En el sidebar, click en **"Ventas"** → **"Gestión de Caja"**
2. Deberías ver mensaje: "No hay sesión de caja abierta"
3. Click en botón **"Abrir Caja"**
4. En el modal que aparece:
   - **Caja Registradora:** Selecciona "Caja Principal (CAJA-01)"
   - **Monto de Apertura:** Ingresa `200.00`
   - **Observaciones:** "Sesión para testing NC"
5. Click en **"Abrir Sesión"**

### ✅ Resultado Esperado:
- Modal se cierra
- Página muestra: "Sesión de Caja Activa"
- Se visualiza:
  - **Caja:** Caja Principal
  - **Monto Inicial:** S/ 200.00
  - **Estado:** Abierta
  - **Usuario:** Admin User
  - Sección "Movimientos de Caja" (vacía por ahora)

### 📸 Verifica:
- [ ] ¿Se abrió la sesión correctamente?
- [ ] ¿Aparece el monto inicial S/ 200.00?
- [ ] ¿El estado es "Abierta"?
- [ ] ¿La sección "Movimientos de Caja" está visible pero vacía?

---

## 🛒 TEST 3: Crear Venta con Efectivo

### Pasos:
1. En el sidebar, click en **"Ventas"** → **"Realizar Venta"**
2. Selecciona **"Caja Principal"** en el selector de caja (debería estar pre-seleccionada)
3. Busca productos y agrega 3 items:
   - **Mouse Inalámbrico Ergonómico** - Cantidad: 3
   - **Teclado Mecánico RGB** - Cantidad: 2
   - **Webcam HD 1080p** - Cantidad: 1
4. En el resumen de venta, verifica:
   - Subtotal se calcula automáticamente
   - IGV (18%)
   - Total
5. Selecciona **"Método de Pago: Efectivo"**
6. **Tipo de Comprobante:** Boleta
7. Click en **"Procesar Venta"**

### ✅ Resultado Esperado:
- Mensaje de éxito: "Venta registrada exitosamente"
- Número de venta generado (ej: VEN-20251113-XXXXXX)
- Opción para imprimir comprobante
- Formulario limpio listo para nueva venta

### 📸 Verifica:
- [ ] ¿La venta se registró correctamente?
- [ ] ¿Se generó el código de venta?
- [ ] ¿Apareció mensaje de éxito?
- [ ] ¿El formulario se limpió para nueva venta?

**🔖 IMPORTANTE:** Anota el **código de venta** generado para usarlo en el siguiente test.

---

## 💸 TEST 4: Emitir NC con Efectivo (Verificar EGRESO)

### Pasos:
1. En el sidebar, click en **"Ventas"** → **"Lista de Ventas"**
2. Busca la venta que acabas de crear (última en la lista)
3. Click en el botón **"Ver Detalle"** (ícono de ojo 👁️)
4. En la página de detalle de venta:
   - Verifica los productos vendidos
   - Click en botón **"Emitir Nota de Crédito"**
5. En el modal de NC:
   - **Motivo:** Selecciona "Devolución Parcial"
   - **Productos a Devolver:**
     - Mouse: Cambia cantidad a **2** (de 3 vendidos)
     - Teclado: Deja en **0** (no se devuelve)
     - Webcam: Deja en **0** (no se devuelve)
   - **Observaciones:** "Cliente reporta defecto en 2 mouse"
   - Verifica que el **Total NC** se calcule automáticamente
   - Click en **"Emitir Nota de Crédito"**
6. **Modal de Método de Pago aparece:**
   - Selecciona **💵 Reembolsar en efectivo ahora**
   - Lee el mensaje: "Se registrará EGRESO automático en caja"
   - Click en **"Confirmar y Emitir NC"**

### ✅ Resultado Esperado:
- Mensaje: "Nota de crédito creada exitosamente"
- **PDF se descarga automáticamente** (nota-credito-XXXXX.pdf)
- Vuelve a la lista de ventas
- La venta muestra estado actualizado (tiene NC asociada)

### 📸 Verifica:
- [ ] ¿Se emitió la NC correctamente?
- [ ] ¿Se descargó el PDF automáticamente?
- [ ] ¿El PDF contiene todos los datos de la NC?
- [ ] ¿La venta muestra que tiene NC asociada?

**📄 IMPORTANTE:** Abre el PDF descargado y verifica:
- Código de NC (NC-XXXX)
- Motivo: Devolución Parcial
- Productos devueltos: 2 Mouse
- Total de reembolso
- Estado: Reembolsada

---

## 🎫 TEST 5: Emitir NC con Vale (Descargar PDF)

### Pasos:
1. Desde la **"Lista de Ventas"**, abre de nuevo el detalle de la misma venta
2. Click en **"Emitir Nota de Crédito"** nuevamente
3. En el modal de NC:
   - **Motivo:** "Devolución Parcial"
   - **Productos a Devolver:**
     - Mouse: Cambia a **1** (queda 1 de los 3 originales no devueltos aún)
     - Teclado: **0**
     - Webcam: **0**
   - **Observaciones:** "Cliente prefiere vale para compra futura"
   - Click en **"Emitir Nota de Crédito"**
4. **Modal de Método de Pago:**
   - Selecciona **🎫 Generar vale (crédito a favor)**
   - Lee el mensaje: "Cliente recibirá PDF como vale. No habrá movimiento de caja."
   - Click en **"Confirmar y Emitir NC"**

### ✅ Resultado Esperado:
- NC emitida exitosamente
- **PDF descargado automáticamente**
- Estado de NC: "Pendiente" (crédito a favor)
- **NO se genera EGRESO en caja**

### 📸 Verifica:
- [ ] ¿Se emitió la NC con Vale?
- [ ] ¿Se descargó el PDF?
- [ ] ¿El PDF indica que es un Vale?
- [ ] ¿El estado es "Pendiente"?

**📄 Abre el PDF y verifica:**
- Estado: Pendiente (o crédito a favor)
- Método: Vale
- Monto del vale
- Código de NC

---

## 💳 TEST 6: Emitir NC con Transferencia

### Pasos:
1. **Crea una NUEVA venta:**
   - Productos: Teclado Mecánico (1 unidad)
   - Método de Pago: Efectivo
   - Procesar venta
2. Ve a **"Lista de Ventas"** → **Ver Detalle** de esta nueva venta
3. Click en **"Emitir Nota de Crédito"**
4. En el modal:
   - **Motivo:** "Devolución Total"
   - **Productos:** Teclado cantidad 1 (debería estar pre-seleccionado todo)
   - **Observaciones:** "Cliente solicita reembolso bancario"
   - Click en **"Emitir Nota de Crédito"**
5. **Modal de Método de Pago:**
   - Selecciona **🏦 Transferencia bancaria**
   - Lee: "Se procesará fuera de caja"
   - Click en **"Confirmar y Emitir NC"**

### ✅ Resultado Esperado:
- NC emitida con éxito
- PDF descargado automáticamente
- Estado: "PendientePagoBancario"
- **NO se genera EGRESO en caja** (se procesa fuera del sistema)

### 📸 Verifica:
- [ ] ¿NC emitida con Transferencia?
- [ ] ¿PDF descargado?
- [ ] ¿Estado es "PendientePagoBancario"?
- [ ] ¿No afectó la caja física?

---

## ⚠️ TEST 7: Validar Error sin Sesión de Caja

### Pasos:
1. Ve a **"Gestión de Caja"**
2. Click en **"Cerrar Sesión de Caja"**
3. Confirma el cierre (ingresa monto de cierre y observaciones)
4. Ahora ve a **"Lista de Ventas"**
5. Abre el detalle de cualquier venta anterior
6. Click en **"Emitir Nota de Crédito"**
7. Completa el formulario:
   - Motivo y productos
   - Click en **"Emitir Nota de Crédito"**
8. En el modal de método de pago:
   - Selecciona **💵 Efectivo**
   - Click en **"Confirmar"**

### ✅ Resultado Esperado:
- **Error:** "Se requiere sesión de caja activa para reembolsos en efectivo"
- Mensaje de error visible en rojo
- NC NO se emite
- Usuario debe abrir sesión de caja primero

### 📸 Verifica:
- [ ] ¿Apareció mensaje de error?
- [ ] ¿La NC NO se emitió?
- [ ] ¿El sistema indica que falta sesión de caja?

**💡 SOLUCIÓN:** Para continuar con otros tests, vuelve a abrir una sesión de caja nueva.

---

## 📄 TEST 8: Re-descargar PDF desde Historial

### Pasos:
1. Ve a **"Lista de Ventas"**
2. Busca una venta que YA tenga NC emitida (de tests anteriores)
3. Click en **"Ver Detalle"**
4. En la sección **"Notas de Crédito Asociadas"** deberías ver las NC emitidas
5. Cada NC debería tener un botón **"Descargar PDF"** o ícono de descarga
6. Click en el botón de descarga

### ✅ Resultado Esperado:
- PDF se descarga nuevamente
- Contenido idéntico al PDF original
- Sin necesidad de re-emitir la NC

### 📸 Verifica:
- [ ] ¿Puedes ver las NC asociadas a la venta?
- [ ] ¿Hay botón de descarga de PDF?
- [ ] ¿El PDF se descarga correctamente?
- [ ] ¿El contenido del PDF es correcto?

---

## 💰 TEST 9: Verificar Movimientos en Gestión de Caja

### Pasos:
1. Ve a **"Gestión de Caja"**
2. Verifica que haya una sesión abierta (si cerraste antes, abre una nueva)
3. En la sección **"Movimientos de Caja"** deberías ver:
   - **EGRESOS** de las NC con Efectivo que emitiste
   - **Monto:** Debe coincidir con el total de cada NC
   - **Motivo:** "Reembolso por NC NC-XXXX"
   - **Descripción:** Detalles de la devolución

### ✅ Resultado Esperado:
- Se visualizan TODOS los EGRESOS de NC con Efectivo
- **NO aparecen movimientos** de NC con Vale o Transferencia
- Los montos coinciden con los totales de las NC
- Fechas y horas correctas

### 📸 Verifica:
- [ ] ¿Se muestran los EGRESOS de NC Efectivo?
- [ ] ¿Los montos son correctos?
- [ ] ¿NO aparecen movimientos de Vale/Transferencia?
- [ ] ¿La información es precisa?

**🧮 Calcula el Balance:**
```
Monto Inicial: S/ 200.00
+ Ingresos por Ventas: S/ XXX.XX (ventas en efectivo)
- Egresos por NC Efectivo: S/ XXX.XX (suma de todas las NC en efectivo)
= Balance Actual: S/ XXX.XX
```

Verifica que el balance calculado manualmente coincida con el mostrado en la UI.

---

## ✅ TEST 10: Verificación Final del Flujo Completo

### Checklist de Funcionalidades:

#### 🔐 Autenticación
- [ ] Login funcional
- [ ] Sesión persistente
- [ ] Permisos correctos

#### 💰 Gestión de Caja
- [ ] Abrir sesión de caja
- [ ] Visualizar sesión activa
- [ ] Ver movimientos (INGRESO/EGRESO)
- [ ] Cerrar sesión de caja

#### 🛒 Ventas
- [ ] Crear venta con múltiples productos
- [ ] Seleccionar método de pago (Efectivo)
- [ ] Generar código de venta
- [ ] Ver lista de ventas
- [ ] Ver detalle de venta individual

#### 📝 Notas de Crédito
- [ ] Emitir NC con Devolución Total
- [ ] Emitir NC con Devolución Parcial
- [ ] Seleccionar productos y cantidades
- [ ] Elegir método de pago (Efectivo/Vale/Transferencia)
- [ ] Validación de cantidades (no exceder original)
- [ ] Validación de sesión de caja para Efectivo

#### 💸 Cash Flow (Flujo de Efectivo)
- [ ] NC Efectivo genera EGRESO automático
- [ ] NC Vale NO genera EGRESO
- [ ] NC Transferencia NO genera EGRESO
- [ ] EGRESOS visibles en Gestión de Caja
- [ ] Balance de caja correcto

#### 📄 PDFs
- [ ] Descarga automática al emitir NC
- [ ] PDF contiene todos los datos correctos
- [ ] Re-descarga desde historial funciona
- [ ] PDFs diferentes según método de pago

#### ⚠️ Validaciones
- [ ] Error sin sesión de caja para Efectivo
- [ ] Error si cantidad excede original
- [ ] Mensajes de error claros y útiles

---

## 🎯 Resumen de Resultados Esperados

| Test | Funcionalidad | Resultado Esperado | Status |
|------|---------------|-------------------|--------|
| 1 | Login UI | ✅ Acceso dashboard | ⬜ |
| 2 | Sesión Caja UI | ✅ Sesión abierta S/ 200 | ⬜ |
| 3 | Venta UI | ✅ Venta registrada | ⬜ |
| 4 | NC Efectivo | ✅ EGRESO + PDF | ⬜ |
| 5 | NC Vale | ✅ Crédito + PDF (sin EGRESO) | ⬜ |
| 6 | NC Transferencia | ✅ Pendiente + PDF (sin EGRESO) | ⬜ |
| 7 | Validación Error | ✅ Mensaje error correcto | ⬜ |
| 8 | Re-descargar PDF | ✅ PDF descargado | ⬜ |
| 9 | Cash Flow UI | ✅ EGRESOS visibles | ⬜ |
| 10 | Verificación Final | ✅ Todo funcional | ⬜ |

---

## 📸 Capturas Recomendadas

Para documentar los resultados, toma capturas de:

1. **Dashboard** después del login
2. **Gestión de Caja** con sesión abierta
3. **Formulario de Venta** con productos agregados
4. **Lista de Ventas** mostrando ventas registradas
5. **Modal de Nota de Crédito** con productos seleccionados
6. **Modal de Método de Pago** con las 3 opciones
7. **Mensaje de éxito** después de emitir NC
8. **PDF descargado** (captura del archivo)
9. **Gestión de Caja - Movimientos** con EGRESOS visibles
10. **Mensaje de error** cuando falta sesión de caja

---

## 🐛 Problemas Conocidos / Solucionados

### ✅ Solucionados:
- ✅ Backend esperaba `email` y `password` (no `correo` y `contrasena`)
- ✅ Cash session route era `/current` con query param
- ✅ Ventas requerían `almacenId`, `tipoComprobante` y `formaPago`
- ✅ NC requería `creditNoteReason` (enum: DevolucionTotal/Parcial)
- ✅ PDF se descarga automáticamente después de emitir NC

### ⚠️ Por Verificar:
- Rendimiento con muchas ventas en la lista
- Manejo de errores de red (backend caído)
- Validación de stock disponible al crear venta

---

## 📚 Recursos Adicionales

- **Backend Tests:** `docs/testing/BACKEND_TEST_RESULTS.md`
- **Postman Guide:** `docs/testing/POSTMAN_REQUESTS_NC.md`
- **Implementación Completa:** `docs/IMPLEMENTACION_NC_PDF_CAJA_COMPLETADA.md`

---

## ✅ Checklist Final de Testing

Al completar todos los tests, verifica:

- [ ] ✅ Login y autenticación funcional
- [ ] ✅ Gestión de caja completa (abrir/cerrar)
- [ ] ✅ Creación de ventas con Efectivo
- [ ] ✅ NC Efectivo con EGRESO automático
- [ ] ✅ NC Vale sin EGRESO (crédito a favor)
- [ ] ✅ NC Transferencia sin afectar caja
- [ ] ✅ Descarga automática de PDFs
- [ ] ✅ Re-descarga de PDFs desde historial
- [ ] ✅ Validaciones de error funcionando
- [ ] ✅ Cash flow correcto (solo Efectivo genera EGRESO)
- [ ] ✅ Balance de caja calculado correctamente

---

**🎉 ¡Sistema Completamente Funcional!**

Si todos los tests pasan, el módulo de Notas de Crédito está **100% operativo** y listo para producción.
