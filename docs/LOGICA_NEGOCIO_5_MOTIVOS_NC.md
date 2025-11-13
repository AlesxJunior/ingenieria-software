# 📋 Lógica de Negocio: 5 Motivos de Notas de Crédito

**Fecha:** 12 de noviembre de 2025  
**Contexto:** Sistema de gestión comercial - Perú  
**Versión:** 1.0 (Simplificado de 9 a 5 motivos)

---

## 🎯 Visión General

El sistema implementa **5 motivos funcionales** para emitir Notas de Crédito, divididos en 3 grupos según su impacto en el negocio:

| Motivo | Requiere Productos | Revierte Inventario | Uso Principal |
|--------|-------------------|---------------------|---------------|
| **Devolución Total** | ✅ Sí (todos) | ✅ Sí | Cliente devuelve todo |
| **Devolución Parcial** | ✅ Sí (algunos) | ✅ Sí | Cliente devuelve parte |
| **Error Facturación** | ❌ No (opcional) | ❌ No | Corrección de montos |
| **Error Documento** | ❌ No | ❌ No | Corrección de datos |
| **Otro Motivo** | ❌ No (opcional) | ❌ No | Casos especiales |

---

## 📦 GRUPO 1: DEVOLUCIONES (Revierten Inventario)

### 1.1 Devolución Total

**Código:** `DevolucionTotal`

**Descripción:** Cliente devuelve **TODOS** los productos de la venta.

**Casos de Uso:**
- Producto defectuoso/con fallas
- Cliente insatisfecho con toda la compra
- Pedido equivocado (se entregó lo incorrecto)
- Compra por error

**Lógica de Validación:**
```typescript
✅ Debe incluir TODOS los productos de la venta
✅ Cada producto con su cantidad COMPLETA
❌ No permite devolución parcial
✅ Requiere especificar motivo en observaciones
```

**Impacto en el Sistema:**
- 📦 **Inventario:** Stock se revierte al almacén (productos regresan)
- 💰 **Contabilidad:** NC por el 100% del total de la venta
- 🧾 **Comprobante:** NC anula completamente la venta original

**Ejemplo:**
```
Venta VE-001: 2 Laptops + 1 Monitor = S/ 5,000
→ NC-001 (DevolucionTotal): 2 Laptops + 1 Monitor = S/ -5,000
→ Stock: +2 Laptops, +1 Monitor
```

---

### 1.2 Devolución Parcial

**Código:** `DevolucionParcial`

**Descripción:** Cliente devuelve **ALGUNOS** productos (no todos).

**Casos de Uso:**
- Un producto tenía falla, los demás están bien
- Talla/modelo incorrectos en algunos items
- Cliente cambia de opinión sobre parte de la compra
- Cantidad recibida fue menor a la facturada

**Lógica de Validación:**
```typescript
✅ Puede incluir 1 o más productos (no necesariamente todos)
✅ Puede ser cantidad parcial de un producto
❌ La cantidad devuelta NO puede exceder la original
✅ Requiere especificar motivo en observaciones
```

**Impacto en el Sistema:**
- 📦 **Inventario:** Stock se revierte solo por productos devueltos
- 💰 **Contabilidad:** NC por el valor de los productos devueltos
- 🧾 **Comprobante:** NC parcial (venta original queda vigente por diferencia)

**Ejemplo:**
```
Venta VE-001: 2 Laptops + 1 Monitor = S/ 5,000
→ NC-001 (DevolucionParcial): 1 Monitor = S/ -1,000
→ Stock: +1 Monitor
→ Venta efectiva: S/ 4,000 (2 Laptops)
```

---

## 🔧 GRUPO 2: AJUSTES ADMINISTRATIVOS (NO Revierten Inventario)

### 2.1 Error en Facturación

**Código:** `ErrorFacturacion`

**Descripción:** Error en cálculos, precios, descuentos o montos del comprobante.

**Casos de Uso:**
- Precio unitario incorrecto
- Descuento mal aplicado (% erróneo)
- IGV calculado incorrectamente
- Se facturó cantidad incorrecta (pero se entregó lo correcto)
- Error en totales por sistema

**Lógica de Validación:**
```typescript
❌ NO requiere seleccionar productos
✅ Si NO se seleccionan productos → NC por el TOTAL de la venta
✅ Si se seleccionan productos → NC parcial por esos items
✅ Requiere descripción del error en observaciones
```

**Impacto en el Sistema:**
- 📦 **Inventario:** NO se revierte (productos no regresan, ya fueron entregados)
- 💰 **Contabilidad:** NC anula el comprobante para re-emitir con montos correctos
- 🧾 **Comprobante:** Se anula y se emite uno nuevo con valores correctos

**Flujo de Trabajo:**
1. Detectar error (ej: precio S/ 100 cuando debía ser S/ 90)
2. Emitir NC por el total (anula comprobante erróneo)
3. Emitir nueva venta con datos correctos
4. Stock NO cambia (productos ya se entregaron)

**Ejemplo:**
```
Venta VE-001: Laptop a S/ 3,500 (ERROR: precio real S/ 3,000)
→ NC-001 (ErrorFacturacion): S/ -3,500 (anula comprobante)
→ VE-002: Laptop a S/ 3,000 (nuevo comprobante correcto)
→ Stock: Sin cambios (cliente ya tiene el producto)
```

---

### 2.2 Error en Documento

**Código:** `ErrorDocumento`

**Descripción:** Error en datos del cliente (RUC, DNI, razón social, nombres).

**Casos de Uso:**
- RUC incorrecto o mal digitado
- DNI con errores
- Razón social desactualizada
- Nombre del cliente con typos
- Se emitió boleta cuando debía ser factura (por datos incorrectos)

**Lógica de Validación:**
```typescript
❌ NO requiere seleccionar productos
✅ SIEMPRE anula el comprobante completo (NC por el 100%)
✅ Requiere descripción del error en observaciones
```

**Impacto en el Sistema:**
- 📦 **Inventario:** NO se revierte (productos no regresan)
- 💰 **Contabilidad:** NC anula el comprobante para re-emitir con datos correctos
- 🧾 **Comprobante:** Se anula y se emite uno nuevo con datos correctos del cliente

**Flujo de Trabajo:**
1. Detectar error en datos del cliente
2. Emitir NC por el total (anula comprobante)
3. Actualizar datos del cliente en sistema
4. Emitir nuevo comprobante con datos correctos
5. Stock NO cambia

**Ejemplo:**
```
Factura VE-001: RUC 20123456789 (ERROR: RUC real 20987654321)
→ NC-001 (ErrorDocumento): S/ -5,000 (anula factura)
→ VE-002: RUC 20987654321 (factura correcta)
→ Stock: Sin cambios
→ Cliente: Mismos productos, documento correcto para SUNAT
```

---

## 🔄 GRUPO 3: COMODÍN

### 3.1 Otro Motivo

**Código:** `Otro`

**Descripción:** Cualquier otro caso no contemplado en los motivos anteriores.

**Casos de Uso:**
- Solicitud del área contable/auditoría
- Corrección por normativa SUNAT
- Ajuste por política interna de la empresa
- Casos especiales autorizados por gerencia
- Crédito comercial (descuento posterior)

**Lógica de Validación:**
```typescript
❌ NO requiere seleccionar productos
✅ Si NO se seleccionan → NC por el TOTAL
✅ Si se seleccionan → NC parcial
⚠️ Descripción OBLIGATORIA (debe explicar el motivo real)
```

**Impacto en el Sistema:**
- 📦 **Inventario:** Por defecto NO revierte (salvo casos especiales)
- 💰 **Contabilidad:** Flexible según el caso
- 🧾 **Comprobante:** Puede ser total o parcial

**Ejemplo:**
```
Venta VE-001: S/ 10,000
→ NC-001 (Otro): S/ -1,000 
→ Observaciones: "Descuento comercial aprobado por gerencia 
   según política de fidelización Q4-2025"
→ Stock: Sin cambios
→ Venta efectiva: S/ 9,000
```

---

## 📊 Resumen de Validaciones

### Validación 1: Productos Obligatorios
```typescript
if (reasonConfig.requiresProducts && itemsToReturn.size === 0) {
  ❌ "El motivo requiere seleccionar al menos un producto"
}
```
**Aplica a:** DevolucionTotal, DevolucionParcial

---

### Validación 2: Devolución Total Completa
```typescript
if (!reasonConfig.allowPartialReturn) {
  if (itemsToReturn.size !== sale.items.length) {
    ❌ "DevolucionTotal requiere devolver todos los productos"
  }
  if (cantidadDevuelta !== cantidadOriginal) {
    ❌ "Debe devolver la cantidad completa de cada producto"
  }
}
```
**Aplica a:** DevolucionTotal

---

### Validación 3: Cantidad Máxima
```typescript
if (cantidadDevuelta > cantidadOriginal) {
  ❌ "La cantidad excede la cantidad original"
}
```
**Aplica a:** Todos los motivos

---

### Validación 4: Descripción Obligatoria
```typescript
if (selectedReason === 'Otro' && !descripcion.trim()) {
  ❌ "Especifica el motivo en observaciones (obligatorio)"
}
```
**Aplica a:** Otro

---

## 💡 Casos Especiales de Uso

### ✅ Caso 1: Cliente devuelve 1 producto de 3
```
Motivo: DevolucionParcial
Productos: Seleccionar el producto a devolver
Stock: +1 producto devuelto
NC: Por el valor de ese producto
```

### ✅ Caso 2: Error en precio (cliente ya tiene el producto)
```
Motivo: ErrorFacturacion
Productos: NO seleccionar (anula comprobante completo)
Stock: Sin cambios
NC: Por el 100% → Luego re-emitir con precio correcto
```

### ✅ Caso 3: RUC incorrecto en factura
```
Motivo: ErrorDocumento
Productos: NO seleccionar (anula comprobante)
Stock: Sin cambios
NC: Por el 100% → Luego re-emitir con RUC correcto
```

### ✅ Caso 4: Descuento comercial posterior
```
Motivo: Otro
Descripción: "Descuento por compra mayorista aprobado..."
Productos: NO seleccionar (NC por monto de descuento = total)
Stock: Sin cambios
NC: Por el 100% (si es descuento total) o parcial
```

---

## 🔍 Flujo de Confirmación

Al emitir una NC, el sistema muestra:

```
¿Emitir Nota de Crédito?

Venta: VE-20251112-001
Motivo: [Nombre del motivo]
Productos: [Cantidad de items]
Monto NC: S/ [Total a revertir]

[⚠️ Esta acción revertirá el inventario]
   O
[ℹ️ Esta NC NO afecta el inventario (solo ajuste contable)]

[Aceptar] [Cancelar]
```

---

## 📈 Impacto en Reportes

### Lista de Ventas
- ❌ NC **NO aparecen** como líneas separadas
- ✅ Se muestran **dentro del detalle** de la venta original
- ✅ Campos calculados:
  - `montoNotaCredito`: Total de NC asociadas
  - `montoEfectivo`: Total venta - Total NC
  - `tieneNotaCredito`: Indicador booleano

### Detalle de Venta
- ✅ Sección "Historial de Notas de Crédito"
- ✅ Muestra: Código, Fecha, Motivo, Productos, Montos, Usuario emisor
- ✅ Total NC en **negativo** (indica reducción)

---

## 🎓 Preguntas Frecuentes

**Q1: ¿Puedo emitir varias NC para la misma venta?**  
✅ Sí, el sistema valida que la suma de cantidades devueltas no exceda las originales.

**Q2: ¿Qué pasa si emito ErrorFacturacion y el cliente ya tiene el producto?**  
✅ Correcto. El inventario NO cambia. Solo anulas el comprobante y emites uno nuevo.

**Q3: ¿Cuándo uso ErrorDocumento vs ErrorFacturacion?**  
- **ErrorDocumento**: Error en datos del CLIENTE (RUC, DNI, nombre)
- **ErrorFacturacion**: Error en MONTOS/CÁLCULOS (precio, descuento, IGV)

**Q4: ¿Puedo usar "Otro" para devoluciones?**  
❌ No. Para devoluciones usa DevolucionTotal o DevolucionParcial (revierten inventario).

**Q5: ¿Qué pasa si selecciono productos en ErrorDocumento?**  
✅ El sistema permite seleccionar, pero lo usual es NO hacerlo (anula comprobante completo).

---

## ✅ Checklist de Implementación

- [x] Enum `CreditNoteReason` con 5 valores en schema.prisma
- [x] Migración de base de datos aplicada
- [x] Backend filtra NC de `list()` principal
- [x] Backend incluye `creditNotes` en `getById()`
- [x] Frontend: Modal con 5 motivos + validaciones
- [x] Frontend: Placeholders dinámicos por motivo
- [x] Frontend: Lógica de productos opcionales
- [x] Frontend: Cálculo de totales (productos seleccionados vs total venta)
- [x] Frontend: Mensaje de confirmación con impacto en inventario
- [x] Frontend: Sección NC en DetalleVenta
- [x] IGV respeta configuración original (0% o 18%)
- [x] Validación de cantidades disponibles
- [x] Auditoría de usuario emisor

---

**Documentado por:** GitHub Copilot  
**Revisado:** 12/11/2025  
**Próxima revisión:** Después de pruebas de usuario
