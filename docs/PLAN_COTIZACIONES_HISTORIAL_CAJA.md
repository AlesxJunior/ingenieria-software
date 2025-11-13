# 📋 Plan de Implementación - Módulo de Ventas Completo

**Fecha:** 13 de Noviembre, 2025  
**Presentación:** Mañana (14 de Noviembre)  
**Objetivo:** Completar módulo de ventas con Cotizaciones e Historial de Caja

---

## 🎯 Estado Actual del Sistema

### ✅ Páginas Implementadas (100%):
1. **Dashboard** - Resumen general
2. **Gestión de Caja** - Apertura, cierre, movimientos
3. **Realizar Venta** - Proceso completo de venta con cotización
4. **Lista de Ventas** - Historial y búsqueda de ventas
5. **Detalle de Venta** - Información completa + Notas de Crédito
6. **Historial de Ventas** (parcial) - Lista básica

### ⏳ Páginas Faltantes (2):
1. **📝 Cotizaciones** - Gestión completa de cotizaciones
2. **📊 Historial de Caja** - Historial detallado de sesiones cerradas

---

## 📝 PÁGINA 1: COTIZACIONES

### 🎯 Objetivo de Negocio:
Permitir al usuario:
- Crear cotizaciones rápidas sin compromiso de venta
- Visualizar todas las cotizaciones pendientes
- Convertir cotizaciones en ventas
- Rechazar/eliminar cotizaciones obsoletas
- Enviar cotizaciones a clientes (futuro: PDF/Email)

### 🏗️ Arquitectura Recomendada:

#### **A. Modelo de Datos (Backend)**
```typescript
// Tabla: Quote (Cotización)
{
  id: string (cuid)
  codigo: string (COT-YYYYMMDD-HHMMSS)
  clienteId?: string (opcional, puede ser "Cliente General")
  usuarioId: string (quien creó)
  fechaEmision: DateTime
  fechaVencimiento: DateTime (default: +7 días)
  
  // Items
  items: QuoteItem[]
  
  // Cálculos
  subtotal: Decimal
  igv: Decimal (18%)
  total: Decimal
  
  // Estado
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Expirada' | 'Convertida'
  
  // Tracking
  observaciones?: string
  motivoRechazo?: string
  ventaId?: string (si fue convertida)
  
  createdAt: DateTime
  updatedAt: DateTime
}

// Tabla: QuoteItem
{
  id: string
  quoteId: string
  productoId: string
  cantidad: number
  precioUnitario: Decimal
  descuento?: Decimal
  subtotal: Decimal
}
```

#### **B. Endpoints Backend (API)**
```
POST   /api/quotes                    - Crear cotización
GET    /api/quotes                    - Listar cotizaciones (con filtros)
GET    /api/quotes/:id                - Obtener una cotización
PUT    /api/quotes/:id                - Actualizar cotización
DELETE /api/quotes/:id                - Eliminar cotización
POST   /api/quotes/:id/convert-to-sale - Convertir a venta
POST   /api/quotes/:id/approve        - Aprobar cotización
POST   /api/quotes/:id/reject         - Rechazar cotización
GET    /api/quotes/:id/pdf            - Descargar PDF (futuro)
```

#### **C. Frontend - Componentes**

**1. Página Principal: `Cotizaciones.tsx`**
```tsx
// Lista de cotizaciones con tabla filtrable
- Filtros: Estado, Cliente, Fecha, Búsqueda por código
- Tabla: Código, Cliente, Fecha, Total, Estado, Acciones
- Acciones:
  • Ver Detalle (👁️)
  • Convertir a Venta (🛒) - solo si Pendiente
  • Aprobar (✅) - marca como Aprobada
  • Rechazar (❌) - marca como Rechazada
  • Eliminar (🗑️) - solo si NO convertida
```

**2. Modal/Página: `DetalleCotizacion.tsx`**
```tsx
// Información completa de la cotización
- Datos del cliente
- Lista de productos cotizados
- Totales (Subtotal, IGV, Total)
- Estado y fechas
- Botones de acción según estado
```

**3. Flujo desde "Realizar Venta"**
```tsx
// En RealizarVenta.tsx ya existe botón "Cotizar"
- Al dar click en "Cotizar Venta":
  • Valida que haya productos
  • Crea registro en tabla Quote
  • Genera código COT-YYYYMMDD-HHMMSS
  • Limpia formulario
  • Muestra mensaje: "Cotización creada"
  • Opcional: Redirige a página Cotizaciones
```

### 🎨 Diseño UX/UI Recomendado:

**Layout de Cotizaciones:**
```
┌─────────────────────────────────────────────────────┐
│  📝 Cotizaciones                                    │
├─────────────────────────────────────────────────────┤
│  [ Buscar... ]  [Estado ▼]  [Cliente ▼]  [Fecha]  │
│                                                      │
│  📊 Resumen:  Pendientes: 5  |  Convertidas: 12    │
├─────────────────────────────────────────────────────┤
│  Código      Cliente    Fecha       Total   Estado │
│  COT-001     Juan P.    12/11/2025  S/150   🟡 Pend│
│  COT-002     María G.   11/11/2025  S/320   ✅ Conv│
│  COT-003     Cliente G. 10/11/2025  S/89    ❌ Rech│
│                                                      │
│  [👁️ Ver] [🛒 Convertir] [❌ Rechazar]             │
└─────────────────────────────────────────────────────┘
```

### ✅ Estados de Cotización:

| Estado | Color | Icono | Acciones Disponibles |
|--------|-------|-------|---------------------|
| **Pendiente** | 🟡 Amarillo | ⏳ | Ver, Convertir, Aprobar, Rechazar, Eliminar |
| **Aprobada** | 🟢 Verde | ✅ | Ver, Convertir, Rechazar |
| **Convertida** | 🔵 Azul | 🛒 | Ver (read-only), Link a Venta |
| **Rechazada** | 🔴 Rojo | ❌ | Ver, Eliminar |
| **Expirada** | ⚫ Gris | 📅 | Ver, Eliminar |

### 🔄 Flujo de Conversión a Venta:

```
1. Usuario en página Cotizaciones
2. Click en "🛒 Convertir a Venta" en cotización Pendiente/Aprobada
3. Sistema:
   a. Valida que cotización esté en estado válido
   b. Valida stock disponible de productos
   c. Abre modal "Convertir Cotización"
4. Modal muestra:
   - Datos de la cotización
   - Selector de Caja Registradora
   - Método de Pago
   - Tipo de Comprobante
   - Opción de modificar cliente
5. Usuario confirma
6. Sistema:
   a. Crea venta en estado "Completada"
   b. Actualiza cotización: estado = "Convertida", ventaId = {nueva venta}
   c. Reduce stock de productos
   d. Registra movimiento de caja (si es Efectivo)
7. Redirige a Detalle de Venta creada
```

---

## 📊 PÁGINA 2: HISTORIAL DE CAJA

### 🎯 Objetivo de Negocio:
Permitir al usuario:
- Ver todas las sesiones de caja cerradas
- Consultar detalles de cada sesión histórica
- Verificar diferencias de arqueo
- Auditar movimientos de efectivo
- Generar reportes de caja por período

### 🏗️ Arquitectura Recomendada:

#### **A. Modelo de Datos (Ya existe)**
```typescript
// Tabla: CashSession (ya implementada)
{
  id: string
  cashRegisterId: string
  userId: string
  fechaApertura: DateTime
  fechaCierre?: DateTime
  montoApertura: Decimal
  montoCierre?: Decimal
  totalVentas: Decimal
  diferencia?: Decimal  // montoCierre - (montoApertura + totalVentas + ingresos - egresos)
  estado: 'Abierta' | 'Cerrada'
  observaciones?: string
  
  // Relaciones
  cashRegister: CashRegister
  user: User
  movements: CashMovement[]  // INGRESO/EGRESO
  sales: Sale[]
}
```

#### **B. Endpoints Backend (Ya existen)**
```
GET /api/cash-sessions                      - Listar sesiones (con filtro estado=Cerrada)
GET /api/cash-sessions/:id                  - Detalle de sesión
GET /api/cash-sessions/:id/movements        - Movimientos de sesión
GET /api/cash-sessions/:id/report           - Reporte PDF (futuro)
```

#### **C. Frontend - Componentes**

**1. Página Principal: `HistorialCaja.tsx`**
```tsx
// Lista de sesiones cerradas con información resumida
- Filtros:
  • Caja Registradora
  • Usuario
  • Rango de fechas (desde-hasta)
  • Búsqueda por ID/observaciones
- Tabla:
  • Fecha Apertura / Cierre
  • Caja
  • Usuario
  • Monto Inicial / Final
  • Total Ventas
  • Diferencia (con indicador de sobrante/faltante)
  • Acciones (Ver Detalle)
- Resumen:
  • Total sesiones cerradas
  • Promedio de ventas por sesión
  • Diferencias acumuladas
```

**2. Modal/Página: `DetalleHistorialCaja.tsx`**
```tsx
// Información detallada de una sesión cerrada
- Información General:
  • Caja, Usuario, Fechas
  • Montos de apertura/cierre
  • Observaciones
- Ventas de la Sesión:
  • Lista de todas las ventas procesadas
  • Totales por método de pago
- Movimientos de Caja:
  • Tabla de INGRESOS y EGRESOS
  • Motivos y descripciones
  • Notas de crédito con EGRESO
- Resumen Financiero:
  • Total esperado
  • Total contado
  • Diferencia (con alerta si > umbral)
- Opciones:
  • Imprimir reporte
  • Exportar a Excel (futuro)
```

### 🎨 Diseño UX/UI Recomendado:

**Layout de Historial de Caja:**
```
┌─────────────────────────────────────────────────────────┐
│  📊 Historial de Caja                                   │
├─────────────────────────────────────────────────────────┤
│  [Caja ▼]  [Usuario ▼]  [Desde: ___] [Hasta: ___]     │
│                                                          │
│  📈 Resumen del Período:                                │
│  Sesiones: 25  |  Ventas: S/ 12,450  |  Dif: +S/ 15.50│
├─────────────────────────────────────────────────────────┤
│  Fecha Apertura  Caja    Usuario  Ventas   Dif   Estado│
│  12/11 08:00    Caja-1   Admin    S/450   +5.00  🔒 Cerr│
│  11/11 08:00    Caja-1   Admin    S/320   -2.50  🔒 Cerr│
│  10/11 14:00    Caja-2   Vendedor S/180    0.00  🔒 Cerr│
│                                                          │
│  [👁️ Ver Detalle] [🖨️ Imprimir]                       │
└─────────────────────────────────────────────────────────┘
```

### 💡 Features Importantes:

**1. Indicadores Visuales:**
- ✅ **Diferencia = 0:** Badge verde "Cuadrada"
- ⚠️ **Diferencia Positiva (<S/10):** Badge amarillo "Sobrante"
- 🔴 **Diferencia Negativa o >S/10:** Badge rojo "Faltante" o "Sobrante Alto"

**2. Drill-Down (Ver Detalle):**
```
Clic en sesión → Modal/Página Detalle:
  ├─ Info General (fechas, montos, usuario)
  ├─ Ventas (tabla con todas las ventas)
  ├─ Movimientos (tabla de INGRESO/EGRESO)
  ├─ Cálculo de Diferencia:
  │    = Monto Cierre 
  │    - (Monto Apertura 
  │       + Total Ventas Efectivo 
  │       + Total Ingresos 
  │       - Total Egresos)
  └─ Observaciones de cierre
```

**3. Exportación/Impresión:**
- Botón "Imprimir Reporte" → PDF con resumen de sesión
- Futuro: Exportar a Excel para análisis

---

## 🚀 PLAN DE IMPLEMENTACIÓN

### ⏱️ Estimación de Tiempo:
- **Backend (Cotizaciones):** 2-3 horas
- **Frontend Cotizaciones:** 3-4 horas
- **Frontend Historial Caja:** 2-3 horas
- **Testing & Ajustes:** 1-2 horas
- **TOTAL:** ~10 horas (1 día completo)

### 📅 Cronograma Sugerido (Para Hoy):

**Fase 1: Backend Cotizaciones (2-3h)**
1. Crear schema de Quote y QuoteItem en Prisma
2. Migrar base de datos
3. Implementar servicios (QuoteService)
4. Crear controladores y rutas
5. Probar con Postman/Thunder Client

**Fase 2: Frontend Cotizaciones (3-4h)**
1. Crear página Cotizaciones.tsx (lista)
2. Crear componente DetalleCotizacion.tsx
3. Integrar botón "Cotizar" en RealizarVenta.tsx
4. Implementar conversión a venta
5. Testing manual completo

**Fase 3: Frontend Historial Caja (2-3h)**
1. Crear página HistorialCaja.tsx
2. Crear modal/página DetalleHistorialCaja.tsx
3. Implementar filtros y búsqueda
4. Agregar cálculos de diferencias
5. Testing manual

**Fase 4: Integración & Testing (1-2h)**
1. Pruebas E2E de flujo completo
2. Ajustes de UX/UI
3. Validar todos los cálculos
4. Preparar demo para presentación

---

## 🎯 PRIORIZACIÓN

### 🔥 Crítico (Debe estar SÍ o SÍ):
1. ✅ Cotizaciones - Lista y Conversión a Venta
2. ✅ Historial de Caja - Lista y Detalle básico

### 🟡 Importante (Nice to have):
3. Filtros avanzados en Cotizaciones
4. Indicadores visuales en Historial
5. Botones de Aprobar/Rechazar cotización

### 🔵 Opcional (Para después de presentación):
6. PDF de Cotización
7. Exportación Excel de Historial
8. Estadísticas avanzadas
9. Email de cotización

---

## 🎬 FLUJO COMPLETO DEL SISTEMA (Con las 2 nuevas páginas)

```
1. DASHBOARD
   └─→ Ver resumen general
   
2. GESTIÓN DE CAJA
   └─→ Abrir sesión → Estado: Abierta
   
3. REALIZAR VENTA
   ├─→ Agregar productos
   ├─→ Opción A: "Cotizar Venta" 
   │   └─→ Crea cotización → Redirige a COTIZACIONES ✨ NUEVA
   │       └─→ Convertir a Venta → Procesa como venta normal
   └─→ Opción B: "Procesar Venta"
       └─→ Completa venta → Registra en sistema
   
4. LISTA DE VENTAS
   └─→ Ver todas las ventas
       └─→ Detalle de Venta
           └─→ Emitir Nota de Crédito
               └─→ Genera EGRESO en caja (si Efectivo)
   
5. COTIZACIONES ✨ NUEVA
   ├─→ Ver todas las cotizaciones
   ├─→ Filtrar por estado
   └─→ Convertir a venta
   
6. HISTORIAL DE CAJA ✨ NUEVA
   └─→ Ver sesiones cerradas
       └─→ Detalle de sesión histórica
           ├─→ Ventas procesadas
           ├─→ Movimientos de efectivo
           └─→ Diferencia de arqueo
   
7. GESTIÓN DE CAJA (Cierre)
   └─→ Cerrar sesión → Estado: Cerrada
       └─→ Aparece en HISTORIAL DE CAJA ✨
```

---

## 📝 VALIDACIONES IMPORTANTES

### Cotizaciones:
- ✅ Código único: COT-YYYYMMDD-HHMMSS
- ✅ Stock disponible al convertir a venta
- ✅ Solo estados Pendiente/Aprobada pueden convertirse
- ✅ Cliente puede ser opcional (Cliente General)
- ✅ Vencimiento automático después de 7 días
- ✅ No permitir editar cotización convertida

### Historial de Caja:
- ✅ Solo mostrar sesiones con estado = "Cerrada"
- ✅ Diferencia = Monto Cierre - (Apertura + Ventas + Ingresos - Egresos)
- ✅ Alertas visuales si diferencia > umbral configurable
- ✅ No permitir modificar sesiones cerradas
- ✅ Filtros de fecha deben ser eficientes (índices en BD)

---

## 🎨 Consistencia de Diseño

### Colores por Estado:
```css
/* Cotizaciones */
.estado-pendiente   { background: #fff3cd; color: #856404; } /* Amarillo */
.estado-aprobada    { background: #d4edda; color: #155724; } /* Verde */
.estado-convertida  { background: #d1ecf1; color: #0c5460; } /* Azul */
.estado-rechazada   { background: #f8d7da; color: #721c24; } /* Rojo */
.estado-expirada    { background: #e2e3e5; color: #383d41; } /* Gris */

/* Diferencias de Caja */
.diferencia-cero     { background: #d4edda; color: #155724; } /* Verde */
.diferencia-positiva { background: #fff3cd; color: #856404; } /* Amarillo */
.diferencia-negativa { background: #f8d7da; color: #721c24; } /* Rojo */
```

---

## 🔐 Seguridad y Permisos

### Cotizaciones:
- `quotes.create` - Crear cotización
- `quotes.read` - Ver cotizaciones
- `quotes.update` - Aprobar/Rechazar
- `quotes.delete` - Eliminar
- `quotes.convert` - Convertir a venta

### Historial de Caja:
- `cash-sessions.history` - Ver historial
- `cash-sessions.details` - Ver detalles de sesión
- `cash-sessions.report` - Generar reportes

---

## ✅ CHECKLIST FINAL (Antes de Presentación)

### Backend:
- [ ] Schema de Quote/QuoteItem creado
- [ ] Migrations ejecutadas sin errores
- [ ] Endpoints de cotizaciones funcionando
- [ ] Conversión a venta probada
- [ ] Permisos configurados

### Frontend:
- [ ] Página Cotizaciones renderiza correctamente
- [ ] Conversión a venta funciona end-to-end
- [ ] Historial de Caja muestra sesiones cerradas
- [ ] Detalle de sesión histórica completo
- [ ] Filtros funcionando
- [ ] Responsive (mobile/tablet)

### Testing:
- [ ] Crear cotización desde Realizar Venta
- [ ] Convertir cotización a venta
- [ ] Procesar venta y cerrar caja
- [ ] Ver sesión en Historial de Caja
- [ ] Verificar cálculos de diferencia
- [ ] Probar todos los filtros

### Presentación:
- [ ] Demo script preparado
- [ ] Datos de prueba cargados
- [ ] Screenshots de respaldo
- [ ] Explicación de flujo lista

---

**🚀 SIGUIENTE PASO: GENERAR LISTA DE TAREAS DETALLADA**

¿Listo para comenzar con la implementación paso a paso? 💪
