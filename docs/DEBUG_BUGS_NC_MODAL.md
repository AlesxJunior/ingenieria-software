# 🐛 Corrección de Bugs en Modal de Notas de Crédito

**Fecha:** 11 de Noviembre, 2025  
**Estado:** 🔧 EN PROGRESO - Debugging Activo  
**Bugs Reportados:** 4 críticos

---

## 📋 Bugs Reportados por Usuario

### Bug 1: Cantidades Pre-llenadas Incorrectamente ❌
**Descripción:** En DevolucionTotal, todos los productos muestran el mismo valor en lugar de sus cantidades individuales.

**Ejemplo:**
- Producto A: Cantidad original 5 → Muestra 3
- Producto B: Cantidad original 3 → Muestra 3 (debería ser 3)
- Producto C: Cantidad original 2 → Muestra 3 (debería ser 2)

**Estado:** 🔍 INVESTIGANDO con console.log

### Bug 2: No Permite Confirmar NC ❌
**Descripción:** Modal muestra error "requiere devolver todos los productos" incluso cuando ya están pre-llenados.

**Estado:** ✅ CORREGIDO
- Validación mejorada para verificar cantidad completa de cada item
- Ahora verifica tanto el número de items como las cantidades individuales

### Bug 3: Item ID Undefined ❌
**Descripción:** Backend rechaza NC con error "Item con ID undefined no encontrado en la venta original"

**Estado:** 🔍 INVESTIGANDO con console.log
- Agregado debugging para rastrear saleItemId en payload

### Bug 4: React Key Warning ⚠️
**Descripción:** Consola muestra "Each child in a list should have a unique key prop"

**Estado:** ✅ CORREGIDO
- Eliminada key innecesaria "header-row" del elemento `<tr>` del header

---

## 🔧 Cambios Implementados

### 1. Validación de DevolucionTotal Mejorada

**Archivo:** `ModalNotaCredito.tsx` líneas ~158-171

**Antes (INCORRECTO):**
```typescript
if (!reasonConfig.allowPartialReturn && itemsToReturn.size !== sale.items.length) {
  setErrorMessage(`El motivo "${reasonConfig.label}" requiere devolver todos los productos`);
  return;
}
```

**Problema:** Solo verificaba el número de items en el Map, no las cantidades.

**Después (CORREGIDO):**
```typescript
if (!reasonConfig.allowPartialReturn) {
  // Debe haber un entry por cada item de la venta
  if (itemsToReturn.size !== sale.items.length) {
    setErrorMessage(`El motivo "${reasonConfig.label}" requiere devolver todos los productos`);
    return;
  }
  
  // ✅ Cada item debe tener su cantidad completa
  for (const item of sale.items) {
    const cantidadDevuelta = itemsToReturn.get(item.id) || 0;
    if (cantidadDevuelta !== item.cantidad) {
      setErrorMessage(`El motivo "${reasonConfig.label}" requiere devolver la cantidad completa de todos los productos`);
      return;
    }
  }
}
```

**Beneficio:** Ahora valida correctamente que CADA producto tenga su cantidad completa.

---

### 2. Eliminación de Key Innecesaria

**Archivo:** `ModalNotaCredito.tsx` línea ~301

**Antes:**
```typescript
<thead>
  <tr key="header-row">
    <th>Producto</th>
    ...
  </tr>
</thead>
```

**Después:**
```typescript
<thead>
  <tr>
    <th>Producto</th>
    ...
  </tr>
</thead>
```

**Razón:** El `<tr>` dentro de `<thead>` no necesita key porque no está en un array.

---

### 3. Debugging Agregado

Se agregaron múltiples `console.log` para diagnosticar los problemas:

#### A. En useEffect de Pre-llenado
```typescript
useEffect(() => {
  console.log('🔍 useEffect ejecutado - selectedReason:', selectedReason);
  if (selectedReason === 'DevolucionTotal') {
    const allItems = new Map<string, number>();
    sale.items.forEach(item => {
      console.log('🔍 Pre-llenando item:', item.id, 'cantidad:', item.cantidad);
      allItems.set(item.id, item.cantidad);
    });
    console.log('🔍 Map creado:', Array.from(allItems.entries()));
    setItemsToReturn(allItems);
  }
}, [selectedReason, sale.items]);
```

**Qué verifica:**
- Confirma que el useEffect se ejecuta
- Muestra cada item con su ID y cantidad
- Muestra el Map completo antes de establecerlo en el state

#### B. En Render de Items
```typescript
{sale.items.map(item => {
  const cantidadDevuelta = itemsToReturn.get(item.id) || 0;
  
  console.log(`🔍 Rendering item ${item.nombreProducto}:`, {
    itemId: item.id,
    cantidadOriginal: item.cantidad,
    cantidadDevuelta,
    mapHasKey: itemsToReturn.has(item.id),
    mapSize: itemsToReturn.size
  });
  
  return <tr key={item.id}>...</tr>
})}
```

**Qué verifica:**
- Confirma qué valor se está mostrando en cada input
- Verifica si el Map tiene la key correspondiente
- Muestra el tamaño del Map en cada render

#### C. En handleSubmit (inicio)
```typescript
const handleSubmit = async () => {
  console.log('🔍 DEBUG - Sale items:', sale.items.map(i => ({ 
    id: i.id, 
    nombre: i.nombreProducto, 
    cantidad: i.cantidad 
  })));
  console.log('🔍 DEBUG - itemsToReturn Map:', Array.from(itemsToReturn.entries()));
  
  // ... validaciones
}
```

**Qué verifica:**
- Muestra todos los items de la venta con sus IDs
- Muestra el contenido del Map antes de validar

#### D. Antes de Enviar al Backend
```typescript
const itemsArray = Array.from(itemsToReturn.entries()).map(([saleItemId, cantidad]) => ({
  saleItemId,
  cantidad,
}));

console.log('🔍 DEBUG - itemsArray a enviar:', itemsArray);

// Después del confirm
console.log('🔍 DEBUG - Payload completo:', {
  saleId: sale.id,
  creditNoteReason: selectedReason,
  descripcion: descripcion.trim() || undefined,
  items: itemsArray,
});
```

**Qué verifica:**
- Muestra el array exacto que se enviará al backend
- Verifica si algún saleItemId es undefined
- Muestra el payload completo antes del request

---

## 🔍 Hipótesis de Problemas Pendientes

### Hipótesis 1: Bug en Pre-llenado (Bug 1)
**Posible causa:** El Map se está creando correctamente pero el state no se actualiza bien o hay un problema de timing.

**Qué buscar en consola:**
```
🔍 Pre-llenando item: abc123 cantidad: 5
🔍 Pre-llenando item: def456 cantidad: 3
🔍 Map creado: [['abc123', 5], ['def456', 3]]

🔍 Rendering item Producto A: { itemId: 'abc123', cantidadDevuelta: 5, ... }
🔍 Rendering item Producto B: { itemId: 'def456', cantidadDevuelta: 3, ... }
```

**Si sale esto es CORRECTO ✅**

**Si sale esto es INCORRECTO ❌:**
```
🔍 Rendering item Producto A: { itemId: 'abc123', cantidadDevuelta: 3, ... }
🔍 Rendering item Producto B: { itemId: 'def456', cantidadDevuelta: 3, ... }
```

### Hipótesis 2: IDs Undefined (Bug 3)
**Posible causa:** Los items de la venta no tienen el campo `id` correctamente populado desde el backend.

**Qué buscar en consola:**
```
🔍 DEBUG - Sale items: [
  { id: undefined, nombre: 'Producto A', cantidad: 5 },  // ❌ PROBLEMA
  { id: undefined, nombre: 'Producto B', cantidad: 3 }   // ❌ PROBLEMA
]
```

**Si los IDs son undefined, el problema está en el backend** (sales.service.ts no está enviando el `id`)

**Si los IDs están presentes:**
```
🔍 DEBUG - Sale items: [
  { id: 'abc123', nombre: 'Producto A', cantidad: 5 },  // ✅ OK
  { id: 'def456', nombre: 'Producto B', cantidad: 3 }   // ✅ OK
]
```

**Entonces el problema está en cómo se construye itemsArray**

---

## 🧪 Instrucciones de Prueba con Debugging

### Paso 1: Limpiar Consola
1. Abrir DevTools (F12)
2. Ir a pestaña Console
3. Clic derecho → Clear console

### Paso 2: Abrir Modal NC
1. Ir a Ventas → Listado de Ventas
2. Abrir una venta COMPLETADA
3. Clic en "Emitir Nota de Crédito"

### Paso 3: Observar Logs Iniciales
Buscar en consola:
```
🔍 useEffect ejecutado - selectedReason: DevolucionTotal
🔍 Pre-llenando item: ...
🔍 Map creado: ...
```

**Anotar:**
- ¿Cuántos items se pre-llenan?
- ¿Qué IDs y cantidades tienen?

### Paso 4: Observar Logs de Render
Buscar múltiples logs:
```
🔍 Rendering item Producto X: { itemId: ..., cantidadDevuelta: ... }
```

**Anotar:**
- ¿Todos los productos muestran la misma `cantidadDevuelta`?
- ¿O cada uno muestra su cantidad correcta?

### Paso 5: Intentar Submit
1. Clic en "Emitir Nota de Crédito"
2. Observar logs:
```
🔍 DEBUG - Sale items: ...
🔍 DEBUG - itemsToReturn Map: ...
🔍 DEBUG - itemsArray a enviar: ...
🔍 DEBUG - Payload completo: ...
```

**Anotar:**
- ¿Los `saleItemId` son undefined o tienen valores?
- ¿Los IDs en `Sale items` son undefined?

---

## 📊 Checklist de Diagnóstico

Completar después de ver los logs:

### Bug 1: Cantidades Pre-llenadas
- [ ] useEffect se ejecuta correctamente
- [ ] Map se crea con cantidades correctas
- [ ] Render muestra cantidades CORRECTAS por item
- [ ] Render muestra cantidades INCORRECTAS (todas iguales)

### Bug 3: Item ID Undefined
- [ ] `sale.items` tienen IDs válidos (no undefined)
- [ ] `sale.items` tienen IDs undefined ← **PROBLEMA EN BACKEND**
- [ ] `itemsArray` tiene saleItemId undefined ← **PROBLEMA EN FRONTEND**

---

## 🎯 Próximos Pasos Según Resultados

### Si IDs son undefined en sale.items:
1. Volver a verificar backend `sales.service.ts`
2. Confirmar que `id: it.id` está en ambos métodos (list y getById)
3. Reiniciar servidor backend
4. Volver a cargar página del frontend

### Si IDs están OK pero cantidades pre-llenadas mal:
1. Verificar si hay algún useEffect adicional que modifique itemsToReturn
2. Verificar si hay algún problema con la referencia del Map
3. Considerar usar useCallback para estabilizar las funciones

### Si todo se ve bien en logs pero aún falla:
1. Verificar el tipo de datos (¿item.id es string o number?)
2. Verificar si hay alguna transformación en el Context
3. Revisar si hay algún middleware que modifique los datos

---

## 📝 Template de Reporte de Logs

**Por favor copiar y pegar estos logs cuando aparezcan:**

```
=== LOGS DEL USEEFFECT ===
[Pegar aquí los logs 🔍 useEffect...]

=== LOGS DEL RENDER ===
[Pegar aquí los logs 🔍 Rendering item...]

=== LOGS DEL SUBMIT ===
[Pegar aquí los logs 🔍 DEBUG - Sale items...]
[Pegar aquí los logs 🔍 DEBUG - itemsArray...]
[Pegar aquí los logs 🔍 DEBUG - Payload completo...]

=== ERROR DEL BACKEND (si aparece) ===
[Pegar aquí el error ❌ Error del backend...]
```

---

**Estado Actual:** 🔍 Esperando logs de consola para diagnóstico preciso
