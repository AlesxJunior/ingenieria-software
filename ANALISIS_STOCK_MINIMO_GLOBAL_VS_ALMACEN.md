# Análisis: Stock Mínimo Global vs Stock Mínimo por Almacén

## 📋 Situación Actual

### **Arquitectura de Stock Mínimo**

El sistema tiene **dos campos** para stock mínimo:

```prisma
model Product {
  minStock Int?  // ✅ Stock mínimo GLOBAL del producto
  // ...
}

model StockByWarehouse {
  minStock Int?  /// @deprecated Usar Product.minStock en su lugar
  // ...
}
```

### **Comportamiento Actual del Sistema**

1. **En ListaProductos** (edición de productos):
   - Se edita `Product.minStock` (stock mínimo global)
   - Este valor aplica para **todos los almacenes**

2. **En Inventario/Stock y Alertas**:
   - Se usa **SOLO `Product.minStock`** para calcular estados
   - El campo `StockByWarehouse.minStock` está marcado como **deprecated** y NO se usa

```typescript
// inventoryService.ts - Línea 177
const minStock = r.product.minStock ?? null;  // ✅ Usa Product.minStock
const estado = calcularEstado(r.quantity, minStock);
```

### **Cálculo de Estados de Stock**

```typescript
function calcularEstado(cantidad: number, stockMinimo: number | null): StockEstado {
  const min = Number(stockMinimo ?? 0);
  if (min <= 0) return 'NORMAL';
  if (cantidad <= Math.floor(min * 0.5)) return 'CRITICO';  // ≤ 50% del mínimo
  if (cantidad < min) return 'BAJO';                         // < mínimo
  return 'NORMAL';
}
```

---

## 🔍 Análisis del Problema

### **Escenario Real:**

Supongamos que tienes el producto **"Cable UTP Cat6"** con:
- **Stock mínimo global:** 100 unidades

Y este producto está en 3 almacenes:

| Almacén | Cantidad | Estado Calculado |
|---------|----------|------------------|
| Almacén Principal | 150 | ✅ NORMAL (> 100) |
| Almacén Sucursal 1 | 30 | ⚠️ CRITICO (≤ 50) |
| Almacén Sucursal 2 | 80 | ⚠️ BAJO (< 100) |

### **¿Es esto un problema?**

**Depende del tipo de negocio:**

#### **Caso A: Negocio con Stock Centralizado** ✅
Si tu negocio opera con un almacén principal y los demás son satélites que se reabastecen del principal:
- ✅ **Stock mínimo global tiene sentido**
- ✅ Las alertas indican cuando necesitas comprar más unidades del proveedor
- ✅ No importa que un almacén tenga poco stock si el principal tiene suficiente

**Ejemplo:** Tienda con bodega central + puntos de venta

#### **Caso B: Negocio con Almacenes Independientes** ❌
Si cada almacén opera de forma independiente y necesita mantener su propio stock mínimo:
- ❌ **Stock mínimo global NO tiene sentido**
- ❌ Un almacén pequeño no necesita las mismas 100 unidades que uno grande
- ❌ Las alertas no reflejan la realidad de cada almacén

**Ejemplo:** Cadena de tiendas donde cada sucursal compra directamente

---

## 🎯 Implicaciones Actuales

### **En la Página de Alertas:**
```
🔴 CRÍTICO:
   - Cable UTP Cat6 en Almacén Sucursal 1 (30/100 unidades) - 30%
   
⚠️ BAJO:
   - Cable UTP Cat6 en Almacén Sucursal 2 (80/100 unidades) - 80%
```

**¿Es correcto?** 
- Si el almacén Sucursal 1 **debe** tener 100 unidades mínimo → ✅ Correcto
- Si el almacén Sucursal 1 solo necesita 20 unidades → ❌ Alerta falsa

### **En la Página de Stock:**
Todos los almacenes muestran el mismo stock mínimo (100), sin importar su tamaño o necesidades.

---

## 💡 Soluciones Propuestas

### **Opción 1: Mantener Stock Mínimo Global (Actual)** ✅ Más simple
**Cuando usar:** Negocio centralizado, stock mínimo uniforme

**Ventajas:**
- ✅ Implementación simple
- ✅ Menos complejidad en el sistema
- ✅ Funciona bien para productos estandarizados

**Desventajas:**
- ❌ No flexible para almacenes de distintos tamaños
- ❌ Alertas pueden no ser relevantes por almacén

**Acción requerida:**
- Ninguna, el sistema ya funciona así
- Documentar claramente que el stock mínimo es global

---

### **Opción 2: Habilitar Stock Mínimo por Almacén** 🔧 Más flexible
**Cuando usar:** Almacenes independientes con necesidades distintas

**Ventajas:**
- ✅ Alertas más precisas por almacén
- ✅ Flexibilidad para almacenes de distintos tamaños
- ✅ Mejor control de inventario distribuido

**Desventajas:**
- ❌ Mayor complejidad de configuración
- ❌ Más trabajo administrativo (configurar mínimo por almacén)

**Implementación:**

1. **Reactivar `StockByWarehouse.minStock`:**
```typescript
// inventoryService.ts
const minStock = r.minStock ?? r.product.minStock ?? null;
// Prioridad: StockByWarehouse.minStock → Product.minStock → null
```

2. **Agregar UI para configurar stock mínimo por almacén:**
   - En la página de Stock de Inventario
   - Permitir editar el stock mínimo de cada producto por almacén
   - Si no se configura, usar el global del producto

3. **Lógica de fallback:**
```
Si StockByWarehouse.minStock existe → Usar ese valor
Si no → Usar Product.minStock (global)
Si tampoco existe → No generar alerta
```

---

### **Opción 3: Híbrida (Recomendada)** ⭐ Balance

**Combinar ambos enfoques:**

1. **Mantener `Product.minStock`** como valor por defecto global
2. **Permitir sobrescribir** con `StockByWarehouse.minStock` si se configura

**Ventajas:**
- ✅ Funciona out-of-the-box con mínimo global
- ✅ Permite personalizar por almacén cuando sea necesario
- ✅ No rompe la funcionalidad actual

**UI Sugerida:**
```
En Stock de Inventario → Botón "Ajustar" en cada fila:
┌──────────────────────────────────────────┐
│ Ajustar Stock Mínimo                     │
├──────────────────────────────────────────┤
│ Producto: Cable UTP Cat6                 │
│ Almacén: Sucursal 1                      │
│                                          │
│ ☐ Usar stock mínimo global (100)        │
│ ☑ Configurar para este almacén:         │
│   [20] unidades                          │
│                                          │
│ [Cancelar] [Guardar]                     │
└──────────────────────────────────────────┘
```

---

## 📊 Comparación de Opciones

| Aspecto | Opción 1 (Global) | Opción 2 (Por Almacén) | Opción 3 (Híbrida) |
|---------|-------------------|------------------------|-------------------|
| Complejidad | ⭐ Baja | ⭐⭐⭐ Alta | ⭐⭐ Media |
| Flexibilidad | ⭐ Baja | ⭐⭐⭐ Alta | ⭐⭐⭐ Alta |
| Facilidad de uso | ⭐⭐⭐ Alta | ⭐ Baja | ⭐⭐ Media |
| Mantenimiento | ⭐⭐⭐ Fácil | ⭐ Difícil | ⭐⭐ Moderado |
| Cambios requeridos | Ninguno | Muchos | Pocos |

---

## ✅ Recomendación Final

**Para tu caso específico:**

Si tu negocio es una **tienda única o con bodega central** → **Mantener Opción 1** (actual)

Si tienes **múltiples sucursales independientes** → **Implementar Opción 3** (híbrida)

---

## 🛠️ Acciones Inmediatas (Si decides cambiar)

### Para Opción 3 (Híbrida):

1. **Backend:**
   - Modificar `inventoryService.ts` para priorizar `StockByWarehouse.minStock`
   - Crear endpoint `PUT /inventario/stock/:id/min-stock` para actualizar

2. **Frontend:**
   - Agregar modal de configuración de stock mínimo en la página de Stock
   - Mostrar indicador visual si usa mínimo global o personalizado

3. **Base de datos:**
   - El schema ya está listo (campo existe pero está deprecated)
   - Remover el comentario `@deprecated` de `StockByWarehouse.minStock`

---

## 📝 Conclusión

**El sistema actual NO tiene un bug**, simplemente usa un enfoque de **stock mínimo global** que puede no ser ideal para todos los casos de uso.

**La decisión de cambiar depende de:**
- ¿Tus almacenes tienen diferentes tamaños/necesidades?
- ¿Necesitas alertas específicas por almacén?
- ¿Vale la pena la complejidad adicional?

Si la respuesta es **SÍ** a las tres preguntas → **Implementar Opción 3**  
Si la respuesta es **NO** → **Mantener como está y documentar el comportamiento**

---

**Fecha:** 2026-01-07  
**Analista:** GitHub Copilot  
**Módulos Afectados:** Productos, Inventario, Alertas
