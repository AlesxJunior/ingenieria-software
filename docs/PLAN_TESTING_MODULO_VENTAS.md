# 🧪 PLAN DE TESTING COMPLETO - MÓDULO DE VENTAS
## Sistema AlexaTech - Testing End-to-End

**Fecha:** 13 de Noviembre, 2025  
**Módulo:** Ventas (Sales Module)  
**Objetivo:** Verificar el flujo completo y lógica de negocio del módulo de ventas

---

## 📋 ESCENARIOS DE PRUEBA

### 1️⃣ **GESTIÓN DE CAJA**

#### Caso 1.1: Abrir Sesión de Caja
**Precondiciones:**
- Usuario autenticado con permisos `cash-sessions.create`
- No debe haber sesión abierta actualmente
- Debe existir al menos una caja registrada

**Pasos:**
1. Ir a "Gestión de Caja" desde el sidebar
2. Verificar que muestra "No hay sesión de caja abierta"
3. Hacer clic en "Abrir Caja"
4. Completar formulario:
   - Caja: Seleccionar "Caja Principal" (o la disponible)
   - Monto de Apertura: S/ 200.00
   - Observaciones: "Apertura turno mañana"
5. Hacer clic en "Abrir Sesión"

**Resultado Esperado:**
- ✅ Notificación de éxito: "Sesión de caja abierta exitosamente"
- ✅ Vista cambia a "Estado de Caja" mostrando:
  - Fecha de Apertura
  - Monto Inicial: S/ 200.00
  - Total Ventas: S/ 0.00
  - Total Esperado: S/ 200.00
- ✅ Botones disponibles: "Registrar Ingreso", "Registrar Egreso", "Cerrar Caja"

---

#### Caso 1.2: Registrar Ingreso en Caja
**Precondiciones:**
- Sesión de caja abierta

**Pasos:**
1. Hacer clic en "Registrar Ingreso"
2. Completar formulario:
   - Monto: S/ 50.00
   - Motivo: Ingreso adicional
   - Descripción: "Pago de deuda cliente"
3. Confirmar

**Resultado Esperado:**
- ✅ Notificación: "Ingreso registrado exitosamente"
- ✅ Total Esperado actualizado: S/ 250.00 (200 + 50)
- ✅ Movimiento aparece en lista con badge verde "INGRESO"

---

#### Caso 1.3: Registrar Egreso en Caja
**Precondiciones:**
- Sesión de caja abierta

**Pasos:**
1. Hacer clic en "Registrar Egreso"
2. Completar formulario:
   - Monto: S/ 30.00
   - Motivo: Gastos operativos
   - Descripción: "Pago delivery"
3. Confirmar

**Resultado Esperado:**
- ✅ Notificación: "Egreso registrado exitosamente"
- ✅ Total Esperado actualizado: S/ 220.00 (250 - 30)
- ✅ Movimiento aparece con badge rojo "EGRESO"

---

### 2️⃣ **REALIZAR VENTA**

#### Caso 2.1: Venta en Efectivo (Sin Cliente)
**Precondiciones:**
- Sesión de caja abierta
- Productos con stock disponible

**Pasos:**
1. Ir a "Realizar Venta"
2. Configurar:
   - Almacén: Seleccionar almacén disponible
   - Tipo Comprobante: Boleta
   - Forma de Pago: Efectivo
3. Buscar producto (ej: "Laptop HP")
4. Agregar 2 unidades
5. Verificar que subtotal e IGV se calculan correctamente
6. Hacer clic en "Generar Venta"
7. Ingresar monto recibido: S/ 3000.00
8. Verificar cálculo de cambio
9. Confirmar venta

**Resultado Esperado:**
- ✅ Venta registrada con estado "Pendiente"
- ✅ Código de venta generado (V-XXXXXXXX)
- ✅ Cambio calculado correctamente
- ✅ Confirmación con botón "Ir a Historial" y "Nueva Venta"
- ✅ Stock del producto disminuido

---

#### Caso 2.2: Venta con Cliente (Factura)
**Precondiciones:**
- Cliente registrado en el sistema
- Sesión de caja abierta

**Pasos:**
1. Ir a "Realizar Venta"
2. Seleccionar cliente existente
3. Tipo Comprobante: Factura
4. Forma de Pago: Transferencia
5. Agregar productos
6. Generar venta
7. Ingresar referencia de pago: "OP-123456"

**Resultado Esperado:**
- ✅ Venta con cliente asociado
- ✅ Referencia de pago guardada
- ✅ Total calculado con IGV (18%)

---

#### Caso 2.3: Venta con IGV Exonerado
**Precondiciones:**
- Sesión de caja abierta

**Pasos:**
1. Ir a "Realizar Venta"
2. Tipo Comprobante: NotaVenta
3. Desmarcar "Incluir IGV"
4. Agregar producto con precio S/ 100.00
5. Generar venta

**Resultado Esperado:**
- ✅ IGV = S/ 0.00
- ✅ Total = Subtotal (sin IGV)
- ✅ Venta registrada correctamente

---

### 3️⃣ **COTIZACIONES**

#### Caso 3.1: Crear Cotización
**Precondiciones:**
- Usuario autenticado

**Pasos:**
1. Ir a "Realizar Venta"
2. Agregar productos al carrito
3. Hacer clic en "Cotizar" en lugar de "Generar Venta"
4. Confirmar cotización

**Resultado Esperado:**
- ✅ Cotización creada con estado "Pendiente"
- ✅ Código generado (COT-XXXXXXXX)
- ✅ Válido hasta: 7 días desde hoy
- ✅ Aparece en módulo "Cotizaciones"

---

#### Caso 3.2: Aprobar Cotización
**Precondiciones:**
- Cotización en estado "Pendiente"

**Pasos:**
1. Ir a "Cotizaciones"
2. Buscar cotización creada
3. Hacer clic en botón "Aprobar" (✓)
4. Confirmar aprobación

**Resultado Esperado:**
- ✅ Estado cambia a "Aceptada"
- ✅ Badge verde
- ✅ Botón "Convertir a Venta" habilitado

---

#### Caso 3.3: Convertir Cotización a Venta
**Precondiciones:**
- Cotización aprobada
- Sesión de caja abierta

**Pasos:**
1. En cotización aprobada, hacer clic en "Convertir a Venta"
2. Seleccionar forma de pago: Efectivo
3. Confirmar conversión

**Resultado Esperado:**
- ✅ Venta creada con mismo detalle que cotización
- ✅ Cotización cambia a estado "Convertida"
- ✅ Stock descontado
- ✅ Venta asociada a la cotización

---

#### Caso 3.4: Rechazar Cotización
**Precondiciones:**
- Cotización en estado "Pendiente"

**Pasos:**
1. Seleccionar cotización
2. Hacer clic en "Rechazar" (✗)
3. Ingresar motivo: "Cliente no aceptó precio"
4. Confirmar

**Resultado Esperado:**
- ✅ Estado cambia a "Rechazada"
- ✅ Badge rojo
- ✅ Motivo de rechazo guardado
- ✅ No se puede convertir a venta

---

#### Caso 3.5: Filtrar Cotizaciones
**Precondiciones:**
- Múltiples cotizaciones con diferentes estados

**Pasos:**
1. Ir a "Cotizaciones"
2. Aplicar filtro: Estado = "Aceptada"
3. Verificar resultados
4. Aplicar filtro por rango de fechas
5. Hacer clic en "Limpiar Filtros"

**Resultado Esperado:**
- ✅ Solo muestra cotizaciones aceptadas
- ✅ Filtro por fecha funciona correctamente
- ✅ "Limpiar" resetea todos los filtros
- ✅ Estadísticas actualizadas según filtros

---

### 4️⃣ **HISTORIAL DE VENTAS**

#### Caso 4.1: Ver Listado de Ventas
**Precondiciones:**
- Ventas registradas en el sistema

**Pasos:**
1. Ir a "Historial de Ventas"
2. Verificar que muestra todas las ventas
3. Revisar estadísticas en la parte superior

**Resultado Esperado:**
- ✅ Cards de estadísticas:
  - Total de Ventas (cantidad)
  - Total en Soles (S/)
  - Ventas Completadas
  - Ventas Pendientes
- ✅ Tabla con todas las ventas
- ✅ Badges de colores según estado

---

#### Caso 4.2: Buscar Venta por Código
**Precondiciones:**
- Ventas existentes

**Pasos:**
1. En Historial de Ventas
2. Ingresar código de venta en buscador (V-00000001)
3. Presionar Enter

**Resultado Esperado:**
- ✅ Muestra solo la venta con ese código
- ✅ Si no existe, muestra empty state

---

#### Caso 4.3: Filtrar por Estado y Fecha
**Precondiciones:**
- Ventas con diferentes estados

**Pasos:**
1. Aplicar filtro: Estado = "Completada"
2. Seleccionar rango de fechas (última semana)
3. Verificar resultados

**Resultado Esperado:**
- ✅ Solo ventas completadas
- ✅ Dentro del rango de fechas
- ✅ Estadísticas recalculadas

---

#### Caso 4.4: Ver Detalle de Venta
**Precondiciones:**
- Venta existente

**Pasos:**
1. Hacer clic en icono de ojo (👁️) de una venta
2. Revisar modal de detalle

**Resultado Esperado:**
- ✅ Modal muestra:
  - Información completa de la venta
  - Cliente (si aplica)
  - Productos con cantidades y precios
  - Subtotal, IGV, Total
  - Estado actual
  - Botones de acción según estado

---

#### Caso 4.5: Completar Venta Pendiente
**Precondiciones:**
- Venta en estado "Pendiente"

**Pasos:**
1. Abrir detalle de venta pendiente
2. Hacer clic en "Confirmar Pago"
3. Ingresar:
   - Monto recibido
   - Cambio (auto-calculado)
4. Confirmar

**Resultado Esperado:**
- ✅ Estado cambia a "Completada"
- ✅ Badge verde
- ✅ Monto y cambio guardados
- ✅ Total de caja actualizado

---

### 5️⃣ **NOTAS DE CRÉDITO**

#### Caso 5.1: Crear Nota de Crédito por Devolución Total
**Precondiciones:**
- Venta completada
- Sesión de caja abierta

**Pasos:**
1. Ir a detalle de venta
2. Hacer clic en "Nota de Crédito"
3. Seleccionar motivo: "Devolución"
4. Marcar TODOS los productos
5. Método de devolución: Efectivo
6. Confirmar

**Resultado Esperado:**
- ✅ NC creada con código NC-XXXXXXXX
- ✅ Monto devuelto al cliente (egreso de caja)
- ✅ Stock repuesto
- ✅ Venta marcada con "Tiene NC"
- ✅ Total efectivo de venta = S/ 0.00

---

#### Caso 5.2: Crear Nota de Crédito Parcial
**Precondiciones:**
- Venta con múltiples productos

**Pasos:**
1. Abrir detalle de venta
2. Crear NC
3. Motivo: "Defecto de Fábrica"
4. Seleccionar solo 1 producto de 3
5. Cantidad: 1 de 2
6. Confirmar

**Resultado Esperado:**
- ✅ NC parcial creada
- ✅ Solo el producto seleccionado devuelto al stock
- ✅ Monto proporcional devuelto
- ✅ Venta sigue "Completada" pero con NC asociada

---

#### Caso 5.3: Ver Notas de Crédito en Detalle de Venta
**Precondiciones:**
- Venta con NC aplicadas

**Pasos:**
1. Abrir detalle de venta que tiene NC
2. Scroll hasta sección "Notas de Crédito"

**Resultado Esperado:**
- ✅ Lista de todas las NC asociadas
- ✅ Código, fecha, motivo, monto
- ✅ Productos devueltos
- ✅ Total efectivo calculado: (Total Venta - Total NC)

---

### 6️⃣ **CIERRE DE CAJA**

#### Caso 6.1: Cerrar Caja sin Diferencia
**Precondiciones:**
- Sesión abierta con ventas realizadas

**Pasos:**
1. Ir a "Gestión de Caja"
2. Revisar "Total Esperado" (ej: S/ 2500.00)
3. Hacer clic en "Cerrar Caja"
4. Contar efectivo físico
5. Ingresar "Monto de Cierre": S/ 2500.00
6. Observaciones: "Cierre turno mañana"
7. Confirmar

**Resultado Esperado:**
- ✅ Sesión cerrada exitosamente
- ✅ Diferencia: S/ 0.00 (sin sobrante ni faltante)
- ✅ Vista vuelve a "No hay sesión abierta"
- ✅ Sesión guardada en historial

---

#### Caso 6.2: Cerrar Caja con Sobrante
**Precondiciones:**
- Sesión abierta

**Pasos:**
1. Total Esperado: S/ 2500.00
2. Monto de Cierre: S/ 2550.00
3. Cerrar caja

**Resultado Esperado:**
- ✅ Diferencia: +S/ 50.00 (sobrante en VERDE)
- ✅ Alerta visible sobre el sobrante
- ✅ Registro guardado para auditoría

---

#### Caso 6.3: Cerrar Caja con Faltante
**Precondiciones:**
- Sesión abierta

**Pasos:**
1. Total Esperado: S/ 2500.00
2. Monto de Cierre: S/ 2450.00
3. Cerrar caja

**Resultado Esperado:**
- ✅ Diferencia: -S/ 50.00 (faltante en ROJO)
- ✅ Alerta visible sobre el faltante
- ✅ Registro guardado para auditoría

---

### 7️⃣ **HISTORIAL DE CAJA**

#### Caso 7.1: Ver Sesiones Cerradas
**Precondiciones:**
- Sesiones cerradas previamente

**Pasos:**
1. Ir a "Historial de Caja"
2. Verificar listado

**Resultado Esperado:**
- ✅ Tabla con todas las sesiones cerradas
- ✅ Columnas:
  - Fecha Cierre
  - Usuario
  - Caja
  - M. Apertura
  - Total Ventas
  - M. Cierre
  - Diferencia (con colores)
- ✅ Acción: Ver detalles

---

#### Caso 7.2: Filtrar Historial por Fecha
**Precondiciones:**
- Múltiples sesiones cerradas

**Pasos:**
1. Seleccionar "Fecha Desde": 01/11/2025
2. Seleccionar "Fecha Hasta": 13/11/2025
3. Hacer clic en "Buscar"

**Resultado Esperado:**
- ✅ Solo sesiones dentro del rango
- ✅ Contador actualizado

---

#### Caso 7.3: Ver Detalle de Sesión Cerrada
**Precondiciones:**
- Sesión cerrada

**Pasos:**
1. Hacer clic en icono de ojo (👁️)
2. Revisar modal

**Resultado Esperado:**
- ✅ Modal con:
  - **Información General**: Caja, Usuario, Fechas
  - **Resumen Financiero**:
    - Monto Apertura
    - Total Ventas (azul)
    - Ingresos Adicionales (verde)
    - Egresos (rojo)
    - Monto Esperado
    - Monto Contado
    - Diferencia (color según tipo)
  - **Movimientos de Caja**: Tabla con todos los movimientos
- ✅ Scroll funcional para contenido largo

---

### 8️⃣ **FLUJOS INTEGRADOS**

#### Caso 8.1: Flujo Completo de Venta con NC
**Escenario:** Cliente compra, luego devuelve producto defectuoso

**Pasos:**
1. Abrir caja (S/ 200.00)
2. Realizar venta:
   - 2x Mouse Logitech @ S/ 50.00 c/u
   - Total: S/ 118.00 (con IGV)
   - Efectivo: S/ 150.00
   - Cambio: S/ 32.00
3. Confirmar pago
4. Cliente regresa al día siguiente
5. Crear NC:
   - Motivo: Defecto de Fábrica
   - 1x Mouse devuelto
   - Devolución: S/ 59.00
6. Cerrar caja

**Resultado Esperado:**
- ✅ Caja apertura: S/ 200.00
- ✅ Venta registrada: S/ 118.00
- ✅ NC registrada: S/ 59.00
- ✅ Total Esperado: S/ 259.00 (200 + 118 - 59)
- ✅ Stock: 1 mouse devuelto
- ✅ Historial muestra venta con NC

---

#### Caso 8.2: Flujo Cotización → Venta → Nota de Crédito
**Escenario:** Cotización aprobada, convertida a venta, luego NC parcial

**Pasos:**
1. Crear cotización:
   - 3x Teclado Mecánico @ S/ 200.00
   - Total: S/ 708.00
2. Aprobar cotización
3. Convertir a venta (Efectivo)
4. Completar pago
5. Cliente devuelve 1 teclado
6. Crear NC parcial:
   - 1x Teclado
   - Monto: S/ 236.00

**Resultado Esperado:**
- ✅ Cotización: Convertida
- ✅ Venta: Completada con NC
- ✅ Monto efectivo venta: S/ 472.00 (708 - 236)
- ✅ Stock: 1 teclado repuesto
- ✅ Caja: Egreso por devolución

---

#### Caso 8.3: Múltiples Ventas en Una Sesión
**Escenario:** Día completo de operaciones

**Pasos:**
1. Abrir caja: S/ 200.00
2. Venta 1: S/ 500.00 (Efectivo)
3. Ingreso adicional: S/ 50.00
4. Venta 2: S/ 300.00 (Transferencia)
5. Egreso: S/ 30.00 (Gastos)
6. Venta 3: S/ 450.00 (Efectivo)
7. Cerrar caja

**Cálculo Esperado:**
- Apertura: 200.00
- Ventas efectivo: 500 + 450 = 950.00
- Ingresos: 50.00
- Egresos: 30.00
- **Total Esperado: 1170.00** (200 + 950 + 50 - 30)
- Venta transferencia NO afecta caja física

**Resultado Esperado:**
- ✅ Historial muestra 3 ventas
- ✅ Caja solo cuenta ventas en efectivo
- ✅ Transferencia no suma al total esperado
- ✅ Cierre correcto con diferencia calculada

---

## 🎯 CHECKLIST DE VALIDACIÓN

### ✅ Funcionalidades Core
- [ ] Abrir/Cerrar Caja
- [ ] Registrar Ingresos/Egresos
- [ ] Realizar Venta (Efectivo, Transferencia, Tarjeta)
- [ ] Confirmar Pago
- [ ] Crear Cotización
- [ ] Aprobar/Rechazar Cotización
- [ ] Convertir Cotización a Venta
- [ ] Crear Nota de Crédito (Total y Parcial)
- [ ] Ver Historial de Ventas
- [ ] Ver Historial de Caja
- [ ] Filtros funcionales
- [ ] Búsquedas

### ✅ Cálculos
- [ ] IGV (18%) calculado correctamente
- [ ] Cambio en ventas efectivo
- [ ] Total Esperado en caja
- [ ] Diferencias (sobrante/faltante)
- [ ] Monto efectivo con NC
- [ ] Redondeo a 2 decimales

### ✅ Stock
- [ ] Descuento al vender
- [ ] Reposición con NC
- [ ] No vender sin stock

### ✅ Validaciones
- [ ] No abrir caja si ya hay una abierta
- [ ] No cerrar sin permiso
- [ ] No crear NC sin sesión abierta
- [ ] No convertir cotización sin aprobar
- [ ] Montos > 0

### ✅ UX/UI
- [ ] Notificaciones claras
- [ ] Estados visuales (badges)
- [ ] Loading states
- [ ] Empty states
- [ ] Modales funcionales
- [ ] Responsive design

### ✅ Permisos
- [ ] Respeta permisos de usuario
- [ ] Bloquea acciones sin permiso

---

## 📝 REGISTRO DE PRUEBAS

| # | Caso | Estado | Observaciones |
|---|------|--------|---------------|
| 1.1 | Abrir Caja | ⏳ | |
| 1.2 | Registrar Ingreso | ⏳ | |
| 1.3 | Registrar Egreso | ⏳ | |
| 2.1 | Venta Efectivo | ⏳ | |
| 2.2 | Venta Factura | ⏳ | |
| 2.3 | Venta sin IGV | ⏳ | |
| 3.1 | Crear Cotización | ⏳ | |
| 3.2 | Aprobar Cotización | ⏳ | |
| 3.3 | Convertir a Venta | ⏳ | |
| 3.4 | Rechazar Cotización | ⏳ | |
| 3.5 | Filtrar Cotizaciones | ⏳ | |
| 4.1 | Ver Listado | ⏳ | |
| 4.2 | Buscar por Código | ⏳ | |
| 4.3 | Filtrar Ventas | ⏳ | |
| 4.4 | Ver Detalle | ⏳ | |
| 4.5 | Completar Venta | ⏳ | |
| 5.1 | NC Total | ⏳ | |
| 5.2 | NC Parcial | ⏳ | |
| 5.3 | Ver NCs | ⏳ | |
| 6.1 | Cerrar sin Diferencia | ⏳ | |
| 6.2 | Cerrar con Sobrante | ⏳ | |
| 6.3 | Cerrar con Faltante | ⏳ | |
| 7.1 | Ver Sesiones | ⏳ | |
| 7.2 | Filtrar Historial | ⏳ | |
| 7.3 | Detalle Sesión | ⏳ | |
| 8.1 | Flujo Venta + NC | ⏳ | |
| 8.2 | Flujo COT → Venta → NC | ⏳ | |
| 8.3 | Múltiples Ventas | ⏳ | |

**Leyenda:**
- ⏳ Pendiente
- ✅ Aprobado
- ❌ Fallido
- ⚠️ Con observaciones

---

## 🚀 PRÓXIMOS PASOS

1. Ejecutar cada caso de prueba en orden
2. Marcar estado en la tabla
3. Documentar cualquier bug encontrado
4. Verificar flujos integrados
5. Validar con datos reales de la BD
6. Preparar demo para presentación

**¡VAMOS A TERMINAR ESTE MÓDULO! 🎉**
