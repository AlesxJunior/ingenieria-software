# 📊 ANÁLISIS DE FLUJO: MÓDULO DE PRODUCTOS Y RELACIONES

**Fecha:** 30 de Noviembre, 2025  
**Estado:** Análisis Arquitectónico Completo  
**Objetivo:** Establecer flujos profesionales claros entre Productos, Compras e Inventario

---

## 🎯 EXECUTIVE SUMMARY

### Problemas Identificados

1. **❌ CATEGORÍAS Y UNIDADES DE MEDIDA SIN GESTIÓN**
   - Actualmente son campos `String` hardcoded
   - No existe módulo de Configuración de Productos
   - Opciones quemadas en frontend (`CATEGORY_OPTIONS`, `UNIT_OPTIONS`)
   
2. **❌ FLUJO DE PRECIOS INCONSISTENTE**
   - `Product.precioVenta` existe, pero ¿dónde está `precioCompra`?
   - PurchaseItem tiene `precioUnitario` (precio de compra)
   - No hay trazabilidad de márgenes ni costos

3. **❌ FLUJO DE STOCK FRAGMENTADO**
   - `Product.stock` es un campo global sin contexto de almacén
   - `StockByWarehouse` es la tabla correcta pero subutilizada
   - Stock inicial no tiene flujo claro (¿viene de compras o ajuste manual?)

4. **❌ NOTIFICACIONES DE STOCK MÍNIMO SIN IMPLEMENTAR**
   - Campo `minStock` existe pero no hay alertas
   - No hay página/sección de alertas de inventario

---

## 📐 ARQUITECTURA ACTUAL

### Entidades Relacionadas

```
┌─────────────────────────────────────────────────────────────┐
│                    MÓDULO PRODUCTOS                         │
│                                                             │
│  ┌──────────────┐         ┌──────────────────┐            │
│  │   Product    │────────►│ StockByWarehouse │            │
│  │              │         │  (stock real)    │            │
│  │  - codigo    │         │  - productId     │            │
│  │  - nombre    │         │  - warehouseId   │            │
│  │  - categoria │  (str)  │  - quantity      │            │
│  │  - precioVenta        │  - minStock      │            │
│  │  - stock     │ ⚠️      └──────────────────┘            │
│  │  - minStock  │                                          │
│  │  - unidadMedida│(str)                                  │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
         │                          │
         │                          │
    ┌────▼──────┐          ┌────────▼────────┐
    │  COMPRAS  │          │   INVENTARIO    │
    │           │          │                 │
    │ Purchase  │          │ Inventory       │
    │ - items[] │          │ Movement        │
    │           │          │ - tipo          │
    │PurchaseItem        │ - cantidad      │
    │ - precioUnitario   │ - stockAntes    │
    │ (COMPRA) ⚠️        │ - stockDespues  │
    └───────────┘          │ - reasonId      │
                           │                 │
                           │ MovementReason  │
                           │ - codigo        │
                           │ - nombre        │
                           └─────────────────┘
```

---

## 🔴 PROBLEMA 1: CATEGORÍAS Y UNIDADES DE MEDIDA

### Estado Actual

**Backend (`schema.prisma`):**
```prisma
model Product {
  categoria    String  // ⚠️ Texto libre sin validación
  unidadMedida String  // ⚠️ Sin catálogo maestro
}
```

**Frontend (`productOptions.ts`):**
```typescript
// Hardcoded - no viene de BD
export const CATEGORY_OPTIONS = [
  'Abarrotes', 'Bebidas', 'Lácteos', 'Carnes'
];
export const UNIT_OPTIONS = [
  'Unidad', 'Kilogramo', 'Litro', 'Caja'
];
```

### ❌ Problemas

1. **Inconsistencia de datos:** Usuarios pueden escribir "kilogramo", "Kg", "kilo"
2. **Sin auditoría:** No se sabe quién creó/modificó categorías
3. **Sin inactivación:** No se pueden archivar categorías obsoletas
4. **Sin reportes:** No se puede agrupar por categoría de forma confiable

### ✅ SOLUCIÓN PROPUESTA

#### **Opción 1: Módulo de Configuración de Productos (RECOMENDADO)**

Crear tablas maestras gestionadas desde el módulo `configuracion`:

```prisma
// schema.prisma - NUEVAS TABLAS

model ProductCategory {
  id          String    @id @default(cuid())
  codigo      String    @unique  // "ABR", "BEB", "LAC"
  nombre      String    @unique  // "Abarrotes", "Bebidas"
  descripcion String?
  activo      Boolean   @default(true)
  
  // Auditoría
  createdBy   String?
  updatedBy   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relación
  products    Product[] @relation("ProductCategoryRelation")
  
  @@map("product_categories")
}

model UnitOfMeasure {
  id          String    @id @default(cuid())
  codigo      String    @unique  // "UND", "KG", "LT"
  nombre      String    @unique  // "Unidad", "Kilogramo"
  simbolo     String?              // "kg", "lt", "un"
  descripcion String?
  activo      Boolean   @default(true)
  
  // Auditoría
  createdBy   String?
  updatedBy   String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relación
  products    Product[] @relation("ProductUnitRelation")
  
  @@map("units_of_measure")
}

// MODIFICAR Product
model Product {
  // ... campos existentes ...
  
  // ❌ ELIMINAR: categoria String
  // ❌ ELIMINAR: unidadMedida String
  
  // ✅ AGREGAR:
  categoriaId   String
  categoria     ProductCategory @relation("ProductCategoryRelation", fields: [categoriaId], references: [id], onDelete: Restrict)
  
  unidadMedidaId String
  unidadMedida   UnitOfMeasure   @relation("ProductUnitRelation", fields: [unidadMedidaId], references: [id], onDelete: Restrict)
}
```

#### **Frontend: Nuevas Páginas**

**Estructura:**
```
src/modules/configuracion/
├── pages/
│   ├── ConfiguracionProductos.tsx  # Página principal con tabs
│   ├── Categorias.tsx              # Gestión de categorías
│   └── UnidadesMedida.tsx          # Gestión de unidades
├── components/
│   ├── CategoriaModal.tsx
│   └── UnidadMedidaModal.tsx
└── services/
    └── configuracionProductos.service.ts
```

**Configuración > Productos:**
```
┌─────────────────────────────────────────────┐
│  Configuración de Productos                 │
│                                             │
│  [Categorías] [Unidades de Medida]         │
│  ─────────────────────────────              │
│                                             │
│  Categorías de Productos                    │
│  ┌─────────────────────────────────────┐   │
│  │ Código │ Nombre    │ Estado │ Acción│   │
│  │ ABR    │ Abarrotes │ ✓      │ ✏️ 🗑️ │   │
│  │ BEB    │ Bebidas   │ ✓      │ ✏️ 🗑️ │   │
│  │ LAC    │ Lácteos   │ ✓      │ ✏️ 🗑️ │   │
│  └─────────────────────────────────────┘   │
│                       [+ Nueva Categoría]   │
└─────────────────────────────────────────────┘
```

#### **Backend: Endpoints**

```typescript
// src/modules/configuracion/configuracion.service.ts

// AGREGAR:
async getAllCategories(): Promise<ProductCategory[]>
async getCategoryById(id: string): Promise<ProductCategory | null>
async createCategory(data: CategoryInput): Promise<ProductCategory>
async updateCategory(id: string, data: CategoryInput): Promise<ProductCategory>
async deleteCategory(id: string): Promise<void>

async getAllUnits(): Promise<UnitOfMeasure[]>
async getUnitById(id: string): Promise<UnitOfMeasure | null>
async createUnit(data: UnitInput): Promise<UnitOfMeasure>
async updateUnit(id: string, data: UnitInput): Promise<UnitOfMeasure>
async deleteUnit(id: string): Promise<void>
```

---

## 🔴 PROBLEMA 2: FLUJO DE PRECIOS (COMPRA vs VENTA)

### Estado Actual

```typescript
// Product
precioVenta: Decimal  // ✅ Existe

// PurchaseItem
precioUnitario: Decimal  // ⚠️ Es precio de COMPRA, no de venta
```

### ❌ Problemas

1. **Sin trazabilidad de costos:** No sabemos cuánto nos costó el producto
2. **Sin cálculo de márgenes:** No podemos calcular utilidad
3. **Sin historial de precios:** Si el precio de compra cambia, se pierde

### ✅ SOLUCIÓN PROPUESTA

#### **Opción 1: Agregar `precioCompra` al Producto (SIMPLE)**

```prisma
model Product {
  // ... campos existentes ...
  
  precioCompra  Decimal?  // Último precio de compra
  precioVenta   Decimal   // Precio de venta al público
  margen        Decimal?  // Calculado: (venta - compra) / compra * 100
  
  // Auditoría de precios
  ultimaCompraId String?
  fechaUltimaActualizacionPrecio DateTime?
}
```

**Flujo:**
1. **Al crear compra:** `PurchaseItem.precioUnitario` se guarda
2. **Al recibir compra:** Se actualiza `Product.precioCompra` con el último precio
3. **Frontend:** Se calcula margen automáticamente: `((precioVenta - precioCompra) / precioCompra) * 100`

#### **Opción 2: Tabla de Historial de Precios (PROFESIONAL)**

```prisma
model PriceHistory {
  id           String   @id @default(cuid())
  productId    String
  product      Product  @relation(fields: [productId], references: [id])
  
  tipo         PriceType  // "COMPRA" | "VENTA"
  precio       Decimal
  precioAnterior Decimal?
  
  // Contexto
  purchaseId   String?    // Si vino de una compra
  userId       String?    // Quién lo cambió
  motivo       String?    // "Actualización manual", "Compra recibida"
  
  createdAt    DateTime @default(now())
  
  @@map("price_history")
}

enum PriceType {
  COMPRA
  VENTA
}
```

**Flujo:**
1. **Al recibir compra:**
   - Se crea registro en `PriceHistory` con tipo "COMPRA"
   - Se actualiza `Product.precioCompra`
   
2. **Al editar precio de venta:**
   - Se crea registro en `PriceHistory` con tipo "VENTA"
   - Se actualiza `Product.precioVenta`

3. **Reportes:**
   - Se puede analizar evolución de precios
   - Se puede calcular margen histórico

---

## 🔴 PROBLEMA 3: FLUJO DE STOCK

### Estado Actual

```prisma
// ⚠️ PROBLEMA: Dos fuentes de verdad
model Product {
  stock Int @default(0)  // ❌ Stock "global" sin contexto
}

model StockByWarehouse {
  productId   String
  warehouseId String
  quantity    Int       // ✅ Stock REAL por almacén
  minStock    Int?
}
```

### ❌ Problemas

1. **Redundancia:** `Product.stock` está desincronizado de `StockByWarehouse`
2. **Sin flujo claro de stock inicial:** ¿Se crea manual o viene de compras?
3. **Confusión:** Frontend usa `initialStock` al crear producto, pero no queda claro dónde va

### ✅ SOLUCIÓN PROPUESTA

#### **Fase 1: Deprecar `Product.stock` (RECOMENDADO)**

```prisma
model Product {
  // ❌ ELIMINAR O DEPRECAR:
  // stock Int @default(0)
  
  // ✅ MANTENER SOLO:
  minStock Int?  // Stock mínimo GLOBAL (o por almacén en StockByWarehouse)
  
  // Stock real siempre viene de StockByWarehouse
}
```

#### **Fase 2: Flujo de Stock Inicial**

**Escenario 1: Stock Inicial desde Compras (PROFESIONAL)**

```typescript
// Al crear producto:
1. Crear Product SIN stock
2. Usuario DEBE crear una compra inicial (Purchase) para ingresar stock
3. Al recibir compra:
   - Se crea InventoryMovement (tipo: ENTRADA)
   - Se actualiza/crea StockByWarehouse
```

**Escenario 2: Stock Inicial Manual (PRÁCTICO)**

```typescript
// Al crear producto:
1. Usuario ingresa "Stock Inicial" y "Almacén"
2. Backend:
   - Crear Product
   - Crear StockByWarehouse con quantity = stockInicial
   - Crear InventoryMovement (tipo: ENTRADA, motivo: "Stock Inicial")
```

**RECOMENDACIÓN:** Usar Escenario 2 para permitir crear productos rápidamente, pero mostrar advertencia:

```
⚠️ Stock inicial ingresado. Recomendamos crear una Orden de Compra 
   para tener trazabilidad completa del origen del stock.
```

#### **Fase 3: Consulta de Stock en Frontend**

**Frontend siempre debe consultar:**
```typescript
// ❌ MAL:
const stock = product.stock;

// ✅ BIEN:
const stockPorAlmacen = await inventoryService.getStockByProduct(productId);
// Retorna: [{ almacen: "Principal", cantidad: 50, minStock: 10 }]

// O stock total:
const stockTotal = stockPorAlmacen.reduce((sum, s) => sum + s.cantidad, 0);
```

---

## 🔴 PROBLEMA 4: NOTIFICACIONES DE STOCK MÍNIMO

### Estado Actual

```prisma
model Product {
  minStock Int?  // ✅ Campo existe
}

model StockByWarehouse {
  minStock Int?  // ✅ Campo existe por almacén
}
```

**⚠️ PROBLEMA:** Campos existen pero NO hay:
1. Endpoint para consultar productos bajo stock mínimo
2. Página de alertas de inventario
3. Notificaciones visuales en dashboard

### ✅ SOLUCIÓN PROPUESTA

#### **Backend: Endpoint de Alertas**

```typescript
// src/modules/inventory/inventory.service.ts

interface StockAlert {
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  warehouseId: string;
  stockActual: number;
  stockMinimo: number;
  faltante: number;  // stockMinimo - stockActual
  estado: 'CRITICO' | 'BAJO';  // CRITICO: <50% del mínimo
  diasEstimados?: number;  // Estimación según consumo promedio
}

async getStockAlerts(filters?: {
  warehouseId?: string;
  estado?: 'CRITICO' | 'BAJO';
}): Promise<StockAlert[]> {
  const stocks = await prisma.stockByWarehouse.findMany({
    where: {
      quantity: { lt: prisma.raw('min_stock') },  // stock < minStock
      warehouseId: filters?.warehouseId,
    },
    include: {
      product: true,
      warehouse: true,
    },
  });
  
  return stocks.map(s => ({
    productId: s.productId,
    codigo: s.product.codigo,
    nombre: s.product.nombre,
    almacen: s.warehouse.nombre,
    warehouseId: s.warehouseId,
    stockActual: s.quantity,
    stockMinimo: s.minStock || 0,
    faltante: (s.minStock || 0) - s.quantity,
    estado: s.quantity <= (s.minStock || 0) * 0.5 ? 'CRITICO' : 'BAJO',
  }));
}
```

**Endpoint:**
```
GET /api/inventory/alerts
GET /api/inventory/alerts?warehouseId=abc123
GET /api/inventory/alerts?estado=CRITICO
```

#### **Frontend: Página de Alertas**

**Ubicación:** `src/modules/inventory/pages/AlertasInventario.tsx`

```tsx
┌────────────────────────────────────────────────────┐
│  🔔 Alertas de Inventario                         │
│                                                    │
│  Estado: [Todos ▼] Almacén: [Todos ▼]            │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ 🔴 CRÍTICO - 3 productos                 │    │
│  │ ┌────────────────────────────────────┐   │    │
│  │ │ PROD-001 | Arroz 50kg               │   │    │
│  │ │ Almacén Principal                    │   │    │
│  │ │ Stock: 2 | Mínimo: 10 | Falta: 8    │   │    │
│  │ │           [📋 Crear Orden de Compra] │   │    │
│  │ └────────────────────────────────────┘   │    │
│  └──────────────────────────────────────────┘    │
│                                                    │
│  ┌──────────────────────────────────────────┐    │
│  │ 🟡 BAJO - 7 productos                    │    │
│  │ ...                                       │    │
│  └──────────────────────────────────────────┘    │
└────────────────────────────────────────────────────┘
```

**Funcionalidades:**
1. **Filtros:** Por almacén, estado (crítico/bajo)
2. **Acciones rápidas:**
   - Crear orden de compra directamente
   - Ver kardex del producto
   - Ajustar stock mínimo
3. **Badge en menú:** Mostrar contador de alertas críticas

#### **Dashboard: Widget de Alertas**

```tsx
// src/modules/dashboard/components/StockAlertsWidget.tsx

<Card>
  <h3>⚠️ Alertas de Stock</h3>
  <AlertSummary>
    🔴 3 productos en nivel crítico
    🟡 7 productos bajo stock mínimo
  </AlertSummary>
  <Button onClick={() => navigate('/inventory/alerts')}>
    Ver todas las alertas
  </Button>
</Card>
```

---

## 🎯 FLUJOS PROFESIONALES PROPUESTOS

### Flujo 1: Alta de Producto Nuevo

```
┌─────────────────────────────────────────────────────┐
│  PASO 1: Crear Producto                            │
│  - Código, nombre, descripción                     │
│  - Categoría (select desde BD)                     │
│  - Unidad medida (select desde BD)                 │
│  - Precio venta inicial                            │
│  - Stock mínimo GLOBAL                             │
│  ❌ NO pedir "precio compra" aquí (viene de compra)│
│  ❌ NO pedir "stock inicial" aquí (se hace después)│
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  PASO 2: Ingresar Stock Inicial (OPCIONAL)        │
│  - Seleccionar almacén                             │
│  - Cantidad inicial                                │
│  - Sistema crea:                                    │
│    * StockByWarehouse                              │
│    * InventoryMovement (tipo: ENTRADA, motivo:     │
│      "Stock Inicial")                              │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  PASO 3: Primera Compra (RECOMENDADO)             │
│  - Crear Purchase con el nuevo producto           │
│  - Al recibir compra:                              │
│    * Se actualiza precioCompra del producto        │
│    * Se crea InventoryMovement (ENTRADA)           │
│    * Se actualiza StockByWarehouse                 │
└─────────────────────────────────────────────────────┘
```

### Flujo 2: Compra y Actualización de Stock

```
┌─────────────────────────────────────────────────────┐
│  COMPRAS > Nueva Orden de Compra                   │
│  - Seleccionar proveedor                           │
│  - Agregar productos                               │
│  - Precio unitario (COMPRA) por producto           │
│  - Cantidad                                        │
│  - Total calculado automáticamente                 │
│  - Estado: "Pendiente"                             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  COMPRAS > Recibir Orden                           │
│  - Cambiar estado a "Recibida"                     │
│  - Backend automáticamente:                        │
│    1. Actualiza Product.precioCompra con último    │
│       precio de PurchaseItem.precioUnitario        │
│    2. Crea InventoryMovement (tipo: ENTRADA)       │
│    3. Incrementa StockByWarehouse.quantity         │
│    4. Crea PriceHistory (tipo: COMPRA)             │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  INVENTARIO > Consultar Stock Actualizado          │
│  - Ver stock por almacén                           │
│  - Ver kardex con el movimiento de entrada         │
│  - Verificar alertas de stock mínimo               │
└─────────────────────────────────────────────────────┘
```

### Flujo 3: Venta y Descuento de Stock

```
┌─────────────────────────────────────────────────────┐
│  VENTAS > Nueva Venta                              │
│  - Seleccionar productos                           │
│  - Precio venta (traído de Product.precioVenta)    │
│  - Cantidad                                        │
│  - ⚠️ Validar stock disponible antes de confirmar │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Backend al confirmar venta:                       │
│  1. Crea Sale y SaleItems                          │
│  2. Crea InventoryMovement (tipo: SALIDA)          │
│  3. Decrementa StockByWarehouse.quantity           │
│  4. ⚠️ Si stock < minStock, genera alerta          │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  INVENTARIO > Alertas                              │
│  - Mostrar producto con stock bajo                 │
│  - Sugerir crear orden de compra                   │
│  - Ver historial de salidas (kardex)               │
└─────────────────────────────────────────────────────┘
```

### Flujo 4: Gestión de Stock Mínimo y Alertas

```
┌─────────────────────────────────────────────────────┐
│  CONFIGURACIÓN > Productos > Stock Mínimo          │
│  - Configurar minStock global en Product           │
│  - O configurar por almacén en StockByWarehouse    │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Sistema detecta automáticamente:                  │
│  - Cuando stock < minStock → Alerta "BAJO"         │
│  - Cuando stock < minStock * 0.5 → Alerta "CRÍTICO"│
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  INVENTARIO > Alertas                              │
│  - Dashboard muestra badge: "⚠️ 10 alertas"        │
│  - Página de alertas lista productos críticos      │
│  - Botón "Crear Orden de Compra" preselecciona     │
│    producto y cantidad sugerida (minStock - actual)│
└─────────────────────────────────────────────────────┘
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Maestros de Configuración (ALTA PRIORIDAD)

**Estimación:** 3-4 días

1. **Backend:**
   - [ ] Crear modelos `ProductCategory` y `UnitOfMeasure` en schema.prisma
   - [ ] Migración de datos existentes (convertir strings a registros)
   - [ ] Endpoints CRUD en `configuracion.service.ts`
   - [ ] Tests unitarios

2. **Frontend:**
   - [ ] Página `ConfiguracionProductos.tsx` con tabs
   - [ ] CRUD de Categorías
   - [ ] CRUD de Unidades de Medida
   - [ ] Actualizar modales de producto para usar selects dinámicos

3. **Migración:**
   - [ ] Script para poblar tablas maestras con valores actuales únicos
   - [ ] Actualizar productos existentes con IDs de categorías/unidades

### Fase 2: Flujo de Precios (MEDIA PRIORIDAD)

**Estimación:** 2-3 días

1. **Backend:**
   - [ ] Agregar `precioCompra` a modelo `Product`
   - [ ] Lógica para actualizar `precioCompra` al recibir compra
   - [ ] (Opcional) Crear modelo `PriceHistory`
   - [ ] Endpoint para historial de precios

2. **Frontend:**
   - [ ] Mostrar `precioCompra` en detalles de producto (solo lectura)
   - [ ] Calcular y mostrar margen: `((venta - compra) / compra) * 100`
   - [ ] (Opcional) Gráfico de evolución de precios

### Fase 3: Normalización de Stock (ALTA PRIORIDAD)

**Estimación:** 3-4 días

1. **Backend:**
   - [ ] Deprecar `Product.stock` (mantener por compatibilidad)
   - [ ] Forzar uso de `StockByWarehouse` como fuente única
   - [ ] Lógica de "stock inicial" al crear producto:
     ```typescript
     if (initialStock > 0) {
       // Crear StockByWarehouse
       // Crear InventoryMovement (tipo: ENTRADA, motivo: "Stock Inicial")
     }
     ```
   - [ ] Validar stock disponible antes de confirmar venta

2. **Frontend:**
   - [ ] Actualizar `NuevoProductoModal` para solicitar almacén destino
   - [ ] Mostrar stock por almacén en ListaProductos
   - [ ] Widget de "Stock Total" (suma de todos los almacenes)

### Fase 4: Sistema de Alertas (MEDIA PRIORIDAD)

**Estimación:** 2-3 días

1. **Backend:**
   - [ ] Endpoint `GET /api/inventory/alerts`
   - [ ] Filtros por almacén y estado (CRITICO/BAJO)
   - [ ] Endpoint para estadísticas: `{ criticos: 3, bajos: 7 }`

2. **Frontend:**
   - [ ] Página `AlertasInventario.tsx`
   - [ ] Widget en Dashboard con contador de alertas
   - [ ] Badge en menú de Inventario: "⚠️ 10"
   - [ ] Botón "Crear Orden de Compra" desde alerta

### Fase 5: Tests E2E (BAJA PRIORIDAD)

**Estimación:** 2 días

- [ ] Tests de flujo completo: Producto → Compra → Stock → Venta → Alerta

---

## 🎯 MÉTRICAS DE ÉXITO

### Antes (Estado Actual)
- ❌ Categorías/Unidades: Hardcoded, inconsistentes
- ❌ Precios: Solo venta, sin costo ni margen
- ❌ Stock: Duplicado (Product.stock vs StockByWarehouse)
- ❌ Alertas: Sin implementar

### Después (Estado Deseado)
- ✅ Categorías/Unidades: Gestionadas desde Configuración, auditadas
- ✅ Precios: Venta + Compra + Margen + Historial
- ✅ Stock: Única fuente (StockByWarehouse), trazabilidad completa
- ✅ Alertas: Página dedicada, notificaciones automáticas, acciones rápidas

---

## 🚀 RECOMENDACIONES FINALES

### Priorización Sugerida

1. **🔴 URGENTE - Fase 3:** Normalizar stock para evitar inconsistencias
2. **🟠 ALTA - Fase 1:** Maestros de configuración para datos limpios
3. **🟡 MEDIA - Fase 2:** Flujo de precios para análisis de márgenes
4. **🟢 BAJA - Fase 4:** Sistema de alertas (nice to have)

### Consideraciones Técnicas

1. **Migraciones:** Crear scripts de migración para datos existentes
2. **Compatibilidad:** Mantener campos legacy durante 1-2 sprints antes de eliminar
3. **Documentación:** Actualizar README con nuevos flujos
4. **Capacitación:** Crear guía de usuario para nuevas funcionalidades

### Siguiente Paso Inmediato

**Comenzar con Fase 1 (Maestros)** porque:
- ✅ No rompe funcionalidad existente
- ✅ Mejora calidad de datos inmediatamente
- ✅ Sienta bases para las demás fases
- ✅ Estimación baja (3-4 días)

---

**¿Procedemos con la Fase 1: Maestros de Configuración?** 🚀
