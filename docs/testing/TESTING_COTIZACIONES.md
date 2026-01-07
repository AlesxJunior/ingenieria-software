# 🧪 Guía de Testing - Módulo de Cotizaciones

**Fecha:** 13 de Noviembre, 2025  
**Módulo:** Cotizaciones  
**Estado:** ✅ Implementado - Pendiente Testing

---

## 📋 Pre-requisitos

### Verificar Servicios Activos:
- ✅ **Backend:** http://localhost:3001 (debe estar corriendo)
- ✅ **Frontend:** http://localhost:5173 (debe estar corriendo)
- ✅ **Base de Datos:** PostgreSQL (debe estar activa)

### Verificar en el navegador:
1. Abrir http://localhost:5173
2. Iniciar sesión con tus credenciales
3. Verificar que el menú **Ventas** tiene la opción **Cotizaciones**

---

## 🎯 Test 1: Acceso al Módulo de Cotizaciones

### Objetivo:
Verificar que la página de Cotizaciones carga correctamente.

### Pasos:
1. En el menú lateral, expandir **Ventas** (ícono 🏪)
2. Hacer clic en **Cotizaciones** (ícono 📄)
3. Esperar a que cargue la página

### Resultado Esperado:
- ✅ La página carga sin errores
- ✅ Se muestran 6 tarjetas de estadísticas:
  - Total
  - Pendientes
  - Aprobadas
  - Convertidas
  - Rechazadas
  - Vencidas
- ✅ Se muestra la sección de filtros
- ✅ Se muestra una tabla (vacía o con datos)
- ✅ Si no hay datos: mensaje "No hay cotizaciones registradas" con ícono 📋

### Capturas de Pantalla:
- [ ] Página de Cotizaciones cargada
- [ ] Estadísticas visibles

---

## 🎯 Test 2: Crear Cotización desde Realizar Venta

### Objetivo:
Crear una cotización nueva y verificar que aparece en la lista.

### Pasos:

#### A. Preparar Venta
1. Ir a **Ventas → Realizar Venta**
2. Seleccionar un almacén (si pregunta)
3. Agregar 2-3 productos al carrito:
   - Buscar producto
   - Ajustar cantidad
   - Agregar al carrito
4. Opcionalmente seleccionar un cliente

#### B. Crear Cotización
5. Hacer clic en el botón **💾 Cotizar Venta** (botón gris)
6. Aparecerá un diálogo de confirmación mostrando:
   - Número de productos
   - Total
   - Cliente (o "Cliente General")
   - Validez: 15 días
7. Confirmar haciendo clic en **Aceptar**

#### C. Verificar Creación
8. Debe aparecer notificación verde: "Cotización creada exitosamente"
9. El carrito debe limpiarse automáticamente
10. Ir a **Ventas → Cotizaciones**
11. La nueva cotización debe aparecer en la tabla

### Resultado Esperado:
- ✅ Notificación de éxito visible
- ✅ Carrito limpio después de cotizar
- ✅ Nueva cotización visible en la lista con:
  - Código: COT-YYYYMMDD-HHMMSS
  - Cliente correcto
  - Fecha de emisión: hoy
  - Fecha de vencimiento: +15 días
  - Total correcto
  - Estado: 🟡 Pendiente (badge amarillo)
  - Botones de acción visibles

### Capturas de Pantalla:
- [ ] Carrito con productos antes de cotizar
- [ ] Diálogo de confirmación
- [ ] Notificación de éxito
- [ ] Cotización en la lista

---

## 🎯 Test 3: Ver Detalle de Cotización

### Objetivo:
Visualizar toda la información de una cotización.

### Pasos:
1. En la tabla de cotizaciones, localizar la cotización recién creada
2. Hacer clic en el botón **👁️ Ver** (azul)
3. Se abre un modal con el detalle

### Resultado Esperado:
- ✅ Modal se abre correctamente
- ✅ **Sección Información General** muestra:
  - Código de cotización
  - Estado con badge colorido
  - Cliente
  - Fecha de emisión
  - Fecha de vencimiento
  - Días de validez (15)
- ✅ **Sección Productos** muestra tabla con:
  - Nombre del producto
  - Cantidad
  - Precio unitario
  - Subtotal
- ✅ **Totales** correctos:
  - Subtotal
  - IGV (18%)
  - Total (en verde, tamaño grande)
- ✅ Botón **Cerrar** funciona

### Capturas de Pantalla:
- [ ] Modal de detalle completo
- [ ] Tabla de productos
- [ ] Totales calculados

---

## 🎯 Test 4: Aprobar Cotización

### Objetivo:
Cambiar el estado de una cotización a "Aceptada".

### Pasos:
1. En la tabla, localizar una cotización con estado **Pendiente**
2. Hacer clic en el botón **✅ Aprobar** (verde)
3. Confirmar en el diálogo que aparece

### Resultado Esperado:
- ✅ Notificación: "Cotización aprobada exitosamente"
- ✅ El estado cambia a **Aceptada** (badge verde claro)
- ✅ El contador de "Aprobadas" aumenta en 1
- ✅ El contador de "Pendientes" disminuye en 1
- ✅ Los botones de acción se actualizan:
  - Ya NO aparece ✅ Aprobar
  - Ya NO aparece ❌ Rechazar
  - SÍ aparece 🛒 Convertir
  - SÍ aparece 🗑️ Eliminar

### Capturas de Pantalla:
- [ ] Cotización antes de aprobar (Pendiente)
- [ ] Cotización después de aprobar (Aceptada)
- [ ] Estadísticas actualizadas

---

## 🎯 Test 5: Rechazar Cotización

### Objetivo:
Cambiar el estado de una cotización a "Rechazada" con motivo.

### Pre-requisito:
- Crear otra cotización nueva (repetir Test 2)

### Pasos:
1. En la tabla, localizar una cotización con estado **Pendiente**
2. Hacer clic en el botón **❌ Rechazar** (rojo)
3. Aparece un prompt solicitando motivo de rechazo
4. Escribir motivo: "Cliente canceló la orden"
5. Hacer clic en **Aceptar**

### Resultado Esperado:
- ✅ Notificación: "Cotización rechazada"
- ✅ El estado cambia a **Rechazada** (badge rojo)
- ✅ El contador de "Rechazadas" aumenta en 1
- ✅ Los botones de acción se actualizan:
  - Ya NO aparece ✅ Aprobar
  - Ya NO aparece ❌ Rechazar
  - Ya NO aparece 🛒 Convertir
  - SÍ aparece 🗑️ Eliminar
6. Al abrir el detalle con **👁️ Ver**:
  - ✅ Se muestra el **Motivo de Rechazo** en rojo

### Capturas de Pantalla:
- [ ] Prompt de motivo de rechazo
- [ ] Cotización rechazada en la lista
- [ ] Detalle mostrando motivo de rechazo

---

## 🎯 Test 6: Convertir Cotización a Venta

### Objetivo:
Convertir una cotización aprobada en una venta real.

### Pre-requisitos:
- Tener una cotización en estado **Aceptada** o **Pendiente**
- Tener una **sesión de caja abierta** (ir a Gestión de Caja → Abrir Sesión si no hay)

### Pasos:

#### A. Verificar Sesión de Caja
1. Ir a **Ventas → Gestión de Caja**
2. Verificar que hay una sesión **Abierta**
3. Si no hay, hacer clic en **Abrir Sesión** y completar el formulario

#### B. Convertir Cotización
4. Volver a **Ventas → Cotizaciones**
5. Localizar una cotización con estado **Pendiente** o **Aceptada**
6. Hacer clic en el botón **🛒 Convertir** (morado)
7. Se abre el modal "Convertir a Venta"

#### C. Completar Datos de Conversión
8. En el modal, verificar:
   - **Resumen de Cotización**: Cliente y Total
   - **Método de Pago**: Seleccionar (Efectivo / Tarjeta / Transferencia / Yape / Plin)
   - **Tipo de Comprobante**: Seleccionar (Boleta / Factura / Nota de Venta)
   - **Caja Registradora**: Debe mostrar la caja abierta
9. Hacer clic en **🛒 Confirmar Conversión**

### Resultado Esperado:
- ✅ Notificación verde: "Cotización convertida a venta exitosamente"
- ✅ Redirige automáticamente al **Detalle de la Venta** creada
- ✅ En el detalle de venta se muestra:
  - Código de venta generado
  - Estado: Completada
  - Productos correctos
  - Total correcto
  - Cliente correcto
- ✅ Al volver a **Cotizaciones**, la cotización convertida tiene:
  - Estado: **Convertida** (badge azul)
  - Ya NO aparecen botones de acción excepto 👁️ Ver
- ✅ En el detalle de la cotización convertida:
  - Aparece sección **Ventas Generadas**
  - Muestra el código de venta y total
- ✅ Estadísticas actualizadas:
  - "Convertidas" aumentó en 1

### Resultado Esperado si NO hay sesión de caja:
- ⚠️ Notificación amarilla: "Debe abrir una sesión de caja primero"
- ❌ El modal NO se abre

### Capturas de Pantalla:
- [ ] Modal de conversión
- [ ] Detalle de venta creada
- [ ] Cotización con estado "Convertida"
- [ ] Detalle mostrando venta generada

---

## 🎯 Test 7: Filtros de Búsqueda

### Objetivo:
Verificar que los filtros funcionan correctamente.

### Test 7A: Filtro por Estado

#### Pasos:
1. Crear al menos 3 cotizaciones con estados diferentes (Pendiente, Aceptada, Rechazada)
2. En **Cotizaciones**, en la sección de filtros:
3. Seleccionar **Estado: Pendiente**
4. Hacer clic en **🔍 Buscar**

#### Resultado Esperado:
- ✅ Solo se muestran cotizaciones con estado "Pendiente"
- ✅ Otras cotizaciones desaparecen de la tabla

### Test 7B: Filtro por Fecha

#### Pasos:
1. Seleccionar **Fecha Desde:** (hace 7 días)
2. Seleccionar **Fecha Hasta:** (hoy)
3. Hacer clic en **🔍 Buscar**

#### Resultado Esperado:
- ✅ Solo se muestran cotizaciones dentro del rango de fechas

### Test 7C: Búsqueda por Código

#### Pasos:
1. Copiar el código de una cotización (ej: COT-20251113-123456)
2. Pegar los primeros caracteres en **Buscar por Código** (ej: COT-20251113)
3. Hacer clic en **🔍 Buscar**

#### Resultado Esperado:
- ✅ Solo se muestran cotizaciones que coinciden con el código

### Test 7D: Limpiar Filtros

#### Pasos:
1. Después de aplicar filtros, hacer clic en **🔄 Limpiar**

#### Resultado Esperado:
- ✅ Todos los campos de filtro se resetean
- ✅ Se muestran todas las cotizaciones nuevamente

### Capturas de Pantalla:
- [ ] Filtros aplicados
- [ ] Resultados filtrados

---

## 🎯 Test 8: Eliminar Cotización

### Objetivo:
Verificar que se puede eliminar una cotización que NO fue convertida.

### Test 8A: Eliminar Cotización Válida

#### Pre-requisito:
- Tener una cotización con estado **Pendiente**, **Aceptada** o **Rechazada**

#### Pasos:
1. En la tabla, hacer clic en **🗑️ Eliminar** (rojo)
2. Confirmar en el diálogo: "¿Está seguro de eliminar esta cotización?"

#### Resultado Esperado:
- ✅ Notificación verde: "Cotización eliminada exitosamente"
- ✅ La cotización desaparece de la tabla
- ✅ Estadísticas se actualizan

### Test 8B: Intentar Eliminar Cotización Convertida

#### Pre-requisito:
- Tener una cotización con estado **Convertida**

#### Pasos:
1. Localizar la cotización convertida
2. Intentar hacer clic en **🗑️ Eliminar**

#### Resultado Esperado:
- ✅ El botón **🗑️ Eliminar** NO aparece para cotizaciones convertidas
- ✅ O si aparece y se hace clic: Error "No se puede eliminar una cotización convertida a venta"

### Capturas de Pantalla:
- [ ] Confirmación de eliminación
- [ ] Cotización eliminada

---

## 🎯 Test 9: Validaciones y Casos Borde

### Test 9A: Cotizar sin Productos

#### Pasos:
1. Ir a **Realizar Venta**
2. SIN agregar productos, hacer clic en **💾 Cotizar Venta**

#### Resultado Esperado:
- ⚠️ Notificación amarilla: "Agrega productos al carrito antes de guardar la cotización"
- ❌ No se crea la cotización

### Test 9B: Convertir sin Sesión de Caja

#### Pasos:
1. Cerrar todas las sesiones de caja
2. Intentar convertir una cotización

#### Resultado Esperado:
- ⚠️ Notificación amarilla: "Debe abrir una sesión de caja primero"
- ❌ El modal NO se abre

### Test 9C: Aprobar Cotización Vencida

#### Pre-requisito:
- Tener una cotización con estado **Vencida** (manualmente cambiar en BD o esperar 15 días)

#### Resultado Esperado:
- ❌ Error: "No se puede aprobar una cotización vencida"

### Test 9D: Rechazar Cotización ya Convertida

#### Resultado Esperado:
- ✅ El botón **❌ Rechazar** NO aparece para cotizaciones convertidas

---

## 🎯 Test 10: Navegación y UX

### Objetivo:
Verificar que la experiencia de usuario es fluida.

### Verificaciones:

#### Loading States:
- ✅ Se muestra spinner al cargar cotizaciones
- ✅ Botones deshabilitados durante operaciones
- ✅ Mensajes de "Procesando..." al crear/aprobar/rechazar

#### Notificaciones:
- ✅ Aparecen en la esquina superior derecha
- ✅ Colores correctos (verde = éxito, rojo = error, amarillo = warning)
- ✅ Desaparecen automáticamente después de unos segundos

#### Responsividad:
- ✅ En pantalla grande: tabla completa visible
- ✅ En pantalla mediana: tabla con scroll horizontal
- ✅ En móvil: considerar cards en lugar de tabla (futuro)

#### Modales:
- ✅ Se pueden cerrar con la X
- ✅ Se pueden cerrar haciendo clic fuera
- ✅ No se cierran si se hace clic dentro

---

## 📊 Resumen de Tests

### Checklist de Validación:

**Funcionalidad Básica:**
- [ ] Test 1: Acceso al módulo ✅
- [ ] Test 2: Crear cotización ✅
- [ ] Test 3: Ver detalle ✅

**Gestión de Estados:**
- [ ] Test 4: Aprobar cotización ✅
- [ ] Test 5: Rechazar cotización ✅
- [ ] Test 6: Convertir a venta ✅

**Filtros y Búsqueda:**
- [ ] Test 7A: Filtro por estado ✅
- [ ] Test 7B: Filtro por fecha ✅
- [ ] Test 7C: Búsqueda por código ✅
- [ ] Test 7D: Limpiar filtros ✅

**Eliminación:**
- [ ] Test 8A: Eliminar válida ✅
- [ ] Test 8B: NO eliminar convertida ✅

**Validaciones:**
- [ ] Test 9A: Sin productos ✅
- [ ] Test 9B: Sin sesión de caja ✅
- [ ] Test 9C: Cotización vencida ✅
- [ ] Test 9D: Ya convertida ✅

**UX:**
- [ ] Test 10: Loading, notificaciones, modales ✅

---

## 🐛 Reporte de Bugs

### Template para reportar bugs encontrados:

```
**Bug #:** [número]
**Test:** [nombre del test]
**Severidad:** [Crítico / Alto / Medio / Bajo]

**Descripción:**
[Qué pasó]

**Pasos para Reproducir:**
1. [paso 1]
2. [paso 2]

**Resultado Esperado:**
[qué debería pasar]

**Resultado Actual:**
[qué pasó realmente]

**Screenshots:**
[adjuntar]

**Consola del Navegador:**
[errores en F12 → Console]
```

---

## ✅ Criterios de Aceptación Final

El módulo de Cotizaciones está **COMPLETO** y **LISTO** cuando:

1. ✅ Todos los 10 tests pasan exitosamente
2. ✅ No hay errores en la consola del navegador
3. ✅ No hay errores en la consola del backend
4. ✅ Las notificaciones aparecen correctamente
5. ✅ Los cálculos de totales son correctos
6. ✅ Los estados de cotización cambian correctamente
7. ✅ La conversión a venta funciona con sesión de caja
8. ✅ Las validaciones previenen acciones incorrectas
9. ✅ La interfaz es responsive y fluida
10. ✅ Los datos persisten correctamente en la base de datos

---

## 📝 Notas Adicionales

### Datos de Prueba Recomendados:
- **Productos:** Mínimo 5 productos con stock
- **Clientes:** Mínimo 3 clientes (1 con RUC, 2 con DNI)
- **Cotizaciones:** Crear mínimo 5 en diferentes estados

### Verificaciones en Base de Datos:
```sql
-- Ver todas las cotizaciones
SELECT id, "codigoCotizacion", estado, total, "fechaEmision" 
FROM quotes 
ORDER BY "createdAt" DESC;

-- Ver items de una cotización
SELECT * FROM quote_items WHERE "quoteId" = 'id-de-cotizacion';

-- Ver ventas generadas desde cotizaciones
SELECT * FROM sales WHERE "quoteOriginId" IS NOT NULL;
```

---

**¡Vamos con todo! 🚀 Testea cada punto y reporta cualquier bug que encuentres.**
