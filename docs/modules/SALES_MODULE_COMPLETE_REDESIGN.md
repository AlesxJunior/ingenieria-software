# 📊 Plan de Implementación Completo - Módulo de Ventas AlexaTech
**Fecha:** 6 de Noviembre, 2025  
**Versión:** 2.0 (Rediseño Total)  
**Estado:** En Planificación

---

## 📋 Índice
1. [Análisis de Boceto HTML](#1-análisis-de-boceto-html)
2. [Gap Analysis (Estado Actual vs. Propuesta)](#2-gap-analysis)
3. [Arquitectura de Base de Datos](#3-arquitectura-de-base-de-datos)
4. [Plan de Implementación por Fases](#4-plan-de-implementación-por-fases)
5. [Recomendaciones y Mejoras](#5-recomendaciones-y-mejoras)
6. [Cronograma y Prioridades](#6-cronograma-y-prioridades)

---

## 1. Análisis de Boceto HTML

### 🎨 Diseño Visual Analizado

Tu boceto HTML muestra un diseño **muy superior** al actual con:

#### **Paleta de Colores y Componentes**
- ✅ Material Icons Outlined (más modernos que Font Awesome)
- ✅ Sidebar colapsable con submenu activo
- ✅ Diseño de cards con sombras sutiles
- ✅ Grid layouts responsivos
- ✅ Dialogs nativos (`<dialog>`) en lugar de modales custom
- ✅ Formularios bien estructurados con labels claros

#### **Estructura de Navegación**
```
📊 Ventas (menú principal)
  ├─ 💼 Gestión Caja
  ├─ 📚 Historial Caja
  ├─ 🛒 Realizar Venta
  └─ 📋 Lista de Ventas
```

**NOTA IMPORTANTE:** Tu boceto **NO incluye "Cotizaciones"** como página separada, pero lo mencionas en tu propuesta. ¿Deseas agregar una 5ta página?

---

## 2. Gap Analysis (Estado Actual vs. Propuesta)

### 🔴 **PROBLEMAS CRÍTICOS ACTUALES**

#### A. Backend: Falta de Modelos para Movimientos de Caja

**Estado Actual:**
```prisma
model CashSession {
  id              String   @id
  montoApertura   Decimal
  montoCierre     Decimal?
  totalVentas     Decimal
  diferencia      Decimal?
  // ❌ NO HAY MOVIMIENTOS DE CAJA (Ingresos/Egresos)
}
```

**Problema:** El boceto HTML muestra botones para registrar "Ingresos de Efectivo" y "Retiros de Efectivo", pero **NO EXISTE** modelo en la BD para almacenarlos.

**Impacto:**
- ❌ No se pueden registrar gastos operativos
- ❌ No se pueden registrar ingresos adicionales (ej: recuperación de cartera)
- ❌ El cálculo de cierre solo considera ventas (incompleto)

#### B. Frontend: Arquitectura Inconsistente

**Problemas Detectados:**
1. **GestionCaja.tsx** existe pero no tiene funcionalidad de movimientos
2. **AperturaCaja.tsx** (eliminado en Fase 1) duplicaba funcionalidad
3. **RealizarVenta.tsx** no tiene campo de IGV toggle (tu boceto sí)
4. **ListaVentas.tsx** no muestra tipo de comprobante ni documento del cliente
5. **NO EXISTE** módulo de Cotizaciones

#### C. Lógica de Negocio Incompleta

**Tu Propuesta:**
```
Resumen de Caja = 
  (+) Monto Apertura
  (+) Ventas en Efectivo
  (+) Otros Ingresos
  (-) Retiros/Gastos
  = Total Esperado
```

**Estado Actual:**
```typescript
// SalesContext.tsx solo calcula:
totalVentas = suma de ventas
diferencia = montoCierre - (montoApertura + totalVentas)
// ❌ No considera movimientos adicionales
```

---

## 3. Arquitectura de Base de Datos

### 📊 **MODELOS NECESARIOS (NUEVO)**

#### 3.1. CashMovement (CREAR)

```prisma
enum CashMovementType {
  INGRESO     // Entrada de efectivo adicional
  EGRESO      // Salida de efectivo (gastos)
}

model CashMovement {
  id              String             @id @default(cuid())
  cashSessionId   String
  tipo            CashMovementType
  monto           Decimal
  motivo          String             // Descripción del movimiento
  descripcion     String?            // Detalles adicionales
  usuarioId       String
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  // Relaciones
  cashSession  CashSession @relation(fields: [cashSessionId], references: [id], onDelete: Cascade)
  usuario      User        @relation("CashMovementUser", fields: [usuarioId], references: [id])

  @@map("cash_movements")
}
```

**Actualizar CashSession:**
```prisma
model CashSession {
  // ... campos existentes ...
  
  // NUEVAS RELACIONES
  movements      CashMovement[]  // ✅ Agregar movimientos
}
```

#### 3.2. Quote (Cotizaciones) - CREAR

```prisma
enum QuoteStatus {
  Pendiente    // Esperando conversión
  Convertida   // Ya se convirtió en venta
  Vencida      // Expiró el plazo
  Cancelada    // Cliente rechazó
}

model Quote {
  id                  String         @id @default(cuid())
  codigoCotizacion    String         @unique
  clienteId           String?
  almacenId           String
  usuarioId           String
  fechaEmision        DateTime       @default(now())
  fechaVencimiento    DateTime       // Validez de la cotización
  subtotal            Decimal        @default(0)
  igv                 Decimal        @default(0)
  total               Decimal        @default(0)
  estado              QuoteStatus    @default(Pendiente)
  observaciones       String?
  saleId              String?        @unique // Si se convirtió, link a venta
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  // Relaciones
  usuario      User          @relation("QuoteCreatedBy", fields: [usuarioId], references: [id])
  items        QuoteItem[]
  sale         Sale?         @relation(fields: [saleId], references: [id])

  @@map("quotes")
}

model QuoteItem {
  id             String   @id @default(cuid())
  quoteId        String
  productId      String
  nombreProducto String
  cantidad       Int
  precioUnitario Decimal
  subtotal       Decimal
  createdAt      DateTime @default(now())

  // Relaciones
  quote Quote @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  @@map("quote_items")
}
```

**Actualizar Sale para trackear origen:**
```prisma
model Sale {
  // ... campos existentes ...
  
  // NUEVOS CAMPOS
  quoteOriginId  String?  // Si viene de cotización
  quoteOrigin    Quote?   @relation("QuoteConvertedTo")
}
```

#### 3.3. Actualización de User

```prisma
model User {
  // ... relaciones existentes ...
  
  // NUEVAS RELACIONES
  cashMovements   CashMovement[] @relation("CashMovementUser")
  quotes          Quote[]        @relation("QuoteCreatedBy")
}
```

---

## 4. Plan de Implementación por Fases

### 🎯 **FASE 1: Migración de Base de Datos (2-3 horas)**

#### Tareas Backend:

1. **Crear migraciones Prisma**
   ```bash
   cd alexa-tech-backend
   # Editar schema.prisma (agregar modelos CashMovement, Quote, QuoteItem)
   npx prisma migrate dev --name add_cash_movements_and_quotes
   npx prisma generate
   ```

2. **Seeders para datos iniciales**
   ```typescript
   // prisma/seedCashMovements.ts
   // Crear movimientos de prueba para testing
   ```

3. **Validar integridad**
   ```bash
   node scripts/check-database-integrity.js
   ```

**Entregables:**
- ✅ Modelos CashMovement, Quote, QuoteItem en BD
- ✅ Relaciones actualizadas
- ✅ Datos de prueba poblados

---

### 🎯 **FASE 2: Backend - API para Movimientos de Caja (3-4 horas)**

#### 2.1. Servicios (cashMovementService.ts)

```typescript
// src/services/cashMovementService.ts
export class CashMovementService {
  /**
   * Registrar un ingreso de efectivo
   */
  async createIngreso(data: {
    cashSessionId: string;
    monto: number;
    motivo: string;
    usuarioId: string;
  }): Promise<CashMovement> {
    // Validar que la sesión esté abierta
    const session = await prisma.cashSession.findUnique({
      where: { id: data.cashSessionId }
    });

    if (!session || session.estado !== 'Abierta') {
      throw new Error('La caja no está abierta');
    }

    // Crear movimiento
    return await prisma.cashMovement.create({
      data: {
        cashSessionId: data.cashSessionId,
        tipo: 'INGRESO',
        monto: data.monto,
        motivo: data.motivo,
        usuarioId: data.usuarioId,
      },
    });
  }

  /**
   * Registrar un egreso (gasto/retiro)
   */
  async createEgreso(data: {
    cashSessionId: string;
    monto: number;
    motivo: string;
    usuarioId: string;
  }): Promise<CashMovement> {
    // Validaciones similares
    // ...
  }

  /**
   * Obtener movimientos de una sesión de caja
   */
  async getMovementsByCashSession(cashSessionId: string): Promise<CashMovement[]> {
    return await prisma.cashMovement.findMany({
      where: { cashSessionId },
      include: { usuario: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Calcular resumen de caja (ACTUALIZADO)
   */
  async calculateCashSummary(cashSessionId: string): Promise<{
    montoApertura: number;
    totalVentasEfectivo: number;
    totalIngresos: number;
    totalEgresos: number;
    totalEsperado: number;
  }> {
    const session = await prisma.cashSession.findUnique({
      where: { id: cashSessionId },
      include: {
        sales: {
          where: {
            formaPago: 'Efectivo',
            estado: 'Completada',
          },
        },
        movements: true,
      },
    });

    const totalVentasEfectivo = session.sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0
    );

    const totalIngresos = session.movements
      .filter((m) => m.tipo === 'INGRESO')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const totalEgresos = session.movements
      .filter((m) => m.tipo === 'EGRESO')
      .reduce((sum, m) => sum + Number(m.monto), 0);

    const totalEsperado =
      Number(session.montoApertura) +
      totalVentasEfectivo +
      totalIngresos -
      totalEgresos;

    return {
      montoApertura: Number(session.montoApertura),
      totalVentasEfectivo,
      totalIngresos,
      totalEgresos,
      totalEsperado,
    };
  }
}
```

#### 2.2. Controladores (cashMovementController.ts)

```typescript
// src/controllers/cashMovementController.ts
export const cashMovementController = {
  // POST /api/cash-movements/ingreso
  createIngreso: asyncHandler(async (req, res) => {
    const { cashSessionId, monto, motivo } = req.body;
    const userId = req.user!.id;

    const movement = await cashMovementService.createIngreso({
      cashSessionId,
      monto: parseFloat(monto),
      motivo,
      usuarioId: userId,
    });

    return ResponseHelper.created(
      res,
      movement,
      'Ingreso registrado correctamente'
    );
  }),

  // POST /api/cash-movements/egreso
  createEgreso: asyncHandler(async (req, res) => {
    // Similar...
  }),

  // GET /api/cash-movements/session/:sessionId
  getByCashSession: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const movements = await cashMovementService.getMovementsByCashSession(sessionId);

    return ResponseHelper.success(
      res,
      movements,
      'Movimientos obtenidos'
    );
  }),

  // GET /api/cash-movements/summary/:sessionId
  getSummary: asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const summary = await cashMovementService.calculateCashSummary(sessionId);

    return ResponseHelper.success(res, summary, 'Resumen calculado');
  }),
};
```

#### 2.3. Rutas

```typescript
// src/routes/cashMovementRoutes.ts
router.post('/ingreso', authMiddleware, cashMovementController.createIngreso);
router.post('/egreso', authMiddleware, cashMovementController.createEgreso);
router.get('/session/:sessionId', authMiddleware, cashMovementController.getByCashSession);
router.get('/summary/:sessionId', authMiddleware, cashMovementController.getSummary);
```

**Entregables:**
- ✅ API completa para movimientos de caja
- ✅ Cálculo de resumen mejorado (incluye ingresos/egresos)
- ✅ Tests unitarios (opcional pero recomendado)

---

### 🎯 **FASE 3: Frontend - Rediseñar GestionCaja.tsx (4-5 horas)**

#### Basado en tu Boceto HTML `gestion-caja.html`

**Componentes a Crear:**

```typescript
// src/modules/sales/pages/GestionCaja.tsx (REESCRIBIR COMPLETO)
```

**Estructura de Interfaz:**

```
┌─────────────────────────────────────────┐
│   GESTIÓN DE CAJA                       │
├────────────────┬────────────────────────┤
│ COLUMNA IZQ    │  COLUMNA DERECHA       │
├────────────────┼────────────────────────┤
│ 📦 Estado Caja │  💰 Resumen de Caja    │
│   - Cerrada    │   (+) Apertura: 200    │
│   [Abrir Caja] │   (+) Ventas: 1,500    │
│                │   (+) Ingresos: 50     │
│ 💸 Movimientos │   (-) Egresos: 100     │
│   [+ Ingreso]  │   ─────────────────    │
│   [- Retiro]   │   = Total: 1,650       │
└────────────────┴────────────────────────┘
```

**Modales (usando `<Dialog>`):**

1. **Modal Apertura Caja**
   ```tsx
   <Dialog open={showAperturaModal}>
     <FormGroup>
       <Label>Monto inicial en caja</Label>
       <Input type="number" min={0} step={0.01} />
     </FormGroup>
     <Button onClick={handleOpenCash}>Confirmar Apertura</Button>
   </Dialog>
   ```

2. **Modal Movimiento (Ingreso/Egreso)**
   ```tsx
   <Dialog open={showMovementModal}>
     <h3>{movementType === 'INGRESO' ? 'Ingreso de Efectivo' : 'Retiro de Efectivo'}</h3>
     <Input type="number" placeholder="Monto" />
     <Input type="text" placeholder="Motivo o Descripción" />
     <Button>Guardar Movimiento</Button>
   </Dialog>
   ```

3. **Modal Cierre de Caja**
   ```tsx
   <Dialog open={showCierreModal}>
     <SummaryList>
       <li>Total Esperado (Sistema): S/ {summary.totalEsperado}</li>
     </SummaryList>
     <Label>Monto Contado (Real)</Label>
     <Input type="number" />
     <DifferenceAlert>
       {montoCont ado > totalEsperado ? '✅ Sobrante' : '⚠️ Faltante'}
       Diferencia: S/ {Math.abs(difference)}
     </DifferenceAlert>
     <Button>Confirmar Cierre</Button>
   </Dialog>
   ```

**Context API Updates:**

```typescript
// src/modules/sales/context/SalesContext.tsx
export interface CashMovement {
  id: string;
  cashSessionId: string;
  tipo: 'INGRESO' | 'EGRESO';
  monto: number;
  motivo: string;
  usuario: { firstName: string; lastName: string };
  createdAt: string;
}

export interface SalesContextType {
  // Existentes...
  activeCashSession: CashSession | null;
  
  // NUEVOS
  cashMovements: CashMovement[];
  cashSummary: {
    montoApertura: number;
    totalVentasEfectivo: number;
    totalIngresos: number;
    totalEgresos: number;
    totalEsperado: number;
  } | null;
  
  createCashMovement: (type: 'INGRESO' | 'EGRESO', data: { monto: number; motivo: string }) => Promise<void>;
  loadCashSummary: (sessionId: string) => Promise<void>;
}
```

**Entregables:**
- ✅ GestionCaja.tsx completamente rediseñado
- ✅ 3 modales funcionando (Apertura, Movimiento, Cierre)
- ✅ Resumen dinámico con cálculos correctos
- ✅ Validaciones de UX (no cerrar si hay ventas abiertas, etc.)

---

### 🎯 **FASE 4: Frontend - Mejorar RealizarVenta.tsx (3-4 horas)**

#### Basado en `venta.html`

**Cambios Necesarios:**

1. **Toggle IGV (18%)**
   ```tsx
   <CheckboxContainer>
     <input
       type="checkbox"
       id="apply-igv"
       checked={applyIGV}
       onChange={(e) => setApplyIGV(e.target.checked)}
     />
     <label htmlFor="apply-igv">Aplicar IGV (18%)</label>
   </CheckboxContainer>

   // En cálculos:
   const calculateTotals = () => {
     const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
     const igv = applyIGV ? subtotal * 0.18 : 0;
     const total = subtotal + igv;
     return { subtotal, igv, total };
   };
   ```

2. **Búsqueda de Cliente Mejorada**
   ```tsx
   <FormGroup>
     <Label>N° de Documento</Label>
     <InputWithButton>
       <Input
         value={documentNumber}
         onChange={(e) => setDocumentNumber(e.target.value)}
       />
       <IconButton onClick={handleSearchClient}>
         <MaterialIcon>search</MaterialIcon>
       </IconButton>
     </InputWithButton>
   </FormGroup>

   <FormGroup>
     <Label>Nombre / Razón Social</Label>
     <Input value={clientName} readOnly />
   </FormGroup>
   ```

3. **Botón "Cotizar Venta"** (NUEVO)
   ```tsx
   <Button variant="secondary" onClick={handleCreateQuote}>
     <MaterialIcon>description</MaterialIcon>
     Cotizar Venta
   </Button>
   ```

4. **Modal Post-Venta Mejorado**
   ```tsx
   <Dialog open={showReceiptModal}>
     <h3>¡Venta Realizada!</h3>
     <p>Se ha generado el comprobante {saleCode}</p>
     <ButtonGroup>
       <Button onClick={handlePrintBoleta}>
         <MaterialIcon>print</MaterialIcon>
         Imprimir Boleta
       </Button>
       <Button onClick={handlePrintFactura}>
         <MaterialIcon>print</MaterialIcon>
         Imprimir Factura
       </Button>
       <Button onClick={handleNewSale}>
         <MaterialIcon>add_shopping_cart</MaterialIcon>
         Nueva Venta
       </Button>
     </ButtonGroup>
   </Dialog>
   ```

**Entregables:**
- ✅ Toggle IGV funcional
- ✅ Búsqueda de cliente mejorada
- ✅ Botón "Cotizar" implementado
- ✅ Modal post-venta con opciones de impresión

---

### 🎯 **FASE 5: Frontend - Rediseñar ListaVentas.tsx (2-3 horas)**

#### Basado en `lista-venta.html`

**Mejoras Necesarias:**

1. **Tabla con Columnas Adicionales**
   ```tsx
   <TableHeader>
     <tr>
       <th>Comprobante</th>         {/* NUEVO: mostrar tipo */}
       <th>Fecha y Hora</th>
       <th>Cliente</th>
       <th>Documento</th>            {/* NUEVO: DNI/RUC */}
       <th>Total</th>
       <th>Estado</th>
       <th>Acciones</th>
     </tr>
   </TableHeader>

   <tbody>
     <tr>
       <td>{sale.tipoComprobante} {sale.codigoVenta}</td>
       <td>{formatDateTime(sale.fechaEmision)}</td>
       <td>{sale.cliente?.nombres || 'Cliente General'}</td>
       <td>{sale.cliente?.numeroDocumento || '-'}</td>
       <td>S/ {sale.total.toFixed(2)}</td>
       <td><Badge status={sale.estado}>{sale.estado}</Badge></td>
       <td>
         {/* Botones existentes (Ver, PDF, Descargar) */}
         {sale.estado === 'Completada' && (
           <Button onClick={() => handleGenerateNotaCredito(sale.id)}>
             📝 Nota de Crédito
           </Button>
         )}
       </td>
     </tr>
   </tbody>
   ```

2. **Filtros Mejorados**
   ```tsx
   <FilterGrid>
     <FormGroup>
       <Label>Fecha Desde</Label>
       <Input type="date" value={dateFrom} onChange={...} />
     </FormGroup>
     <FormGroup>
       <Label>Fecha Hasta</Label>
       <Input type="date" value={dateTo} onChange={...} />
     </FormGroup>
     <FormGroup>
       <Label>Cliente (DNI/RUC/Nombre)</Label>
       <Input placeholder="Buscar cliente..." />
     </FormGroup>
     <FormGroup>
       <Label>Comprobante</Label>
       <Select>
         <option value="">Todos</option>
         <option value="Boleta">Boleta</option>
         <option value="Factura">Factura</option>
       </Select>
     </FormGroup>
   </FilterGrid>
   ```

**Entregables:**
- ✅ Tabla con columnas adicionales (Comprobante, Documento)
- ✅ Filtros mejorados (por tipo comprobante, cliente)
- ✅ Botón "Nota de Crédito" (funcionalidad básica)

---

### 🎯 **FASE 6: Nueva Página - Historial de Caja (3-4 horas)**

#### Basado en `historial-caja.html`

**Crear Nuevo Componente:**

```typescript
// src/modules/sales/pages/HistorialCaja.tsx
```

**Estructura de Interfaz:**

```
┌─────────────────────────────────────────┐
│   HISTORIAL DE ARQUEOS DE CAJA         │
├─────────────────────────────────────────┤
│ 🔍 FILTROS                              │
│  [Fecha Desde] [Fecha Hasta] [Usuario] │
│                             [🔍 Buscar] │
├─────────────────────────────────────────┤
│ 📋 TABLA DE CIERRES                     │
│┌───────────────────────────────────────┐│
││ Fecha │ Usuario │ Apert. │ Ventas │...││
││ 05/11 │ @admin  │ 200    │ 1,500  │...││
││ 04/11 │ @cajero │ 150    │ 800    │...││
│└───────────────────────────────────────┘│
│ Mostrando 1-10 de 50  [<] [1] [2] [>]  │
└─────────────────────────────────────────┘
```

**Columnas de Tabla:**
- Fecha Cierre
- Usuario
- Monto Apertura
- Ventas en Efectivo
- Otros Ingresos
- Retiros/Gastos
- Monto Esperado (Sistema)
- Monto Contado (Real)
- Diferencia (con color: verde si OK, rojo si faltante)

**API Backend:**

```typescript
// GET /api/cash-sessions/history
export const cashSessionController = {
  getHistory: asyncHandler(async (req, res) => {
    const { fechaDesde, fechaHasta, userId } = req.query;

    const sessions = await prisma.cashSession.findMany({
      where: {
        estado: 'Cerrada',
        fechaCierre: {
          gte: fechaDesde ? new Date(fechaDesde) : undefined,
          lte: fechaHasta ? new Date(fechaHasta) : undefined,
        },
        userId: userId || undefined,
      },
      include: {
        user: true,
        movements: true,
        sales: {
          where: {
            formaPago: 'Efectivo',
            estado: 'Completada',
          },
        },
      },
      orderBy: { fechaCierre: 'desc' },
    });

    // Calcular totales para cada sesión
    const history = sessions.map((session) => {
      const totalVentas = session.sales.reduce(
        (sum, s) => sum + Number(s.total),
        0
      );
      const totalIngresos = session.movements
        .filter((m) => m.tipo === 'INGRESO')
        .reduce((sum, m) => sum + Number(m.monto), 0);
      const totalEgresos = session.movements
        .filter((m) => m.tipo === 'EGRESO')
        .reduce((sum, m) => sum + Number(m.monto), 0);

      const totalEsperado =
        Number(session.montoApertura) +
        totalVentas +
        totalIngresos -
        totalEgresos;

      return {
        id: session.id,
        fechaCierre: session.fechaCierre,
        usuario: `${session.user.firstName} ${session.user.lastName}`,
        montoApertura: Number(session.montoApertura),
        totalVentas,
        totalIngresos,
        totalEgresos,
        totalEsperado,
        montoContado: Number(session.montoCierre),
        diferencia: Number(session.diferencia),
      };
    });

    return ResponseHelper.success(res, history, 'Historial obtenido');
  }),
};
```

**Entregables:**
- ✅ Página HistorialCaja.tsx funcional
- ✅ Filtros por fecha y usuario
- ✅ Tabla con cálculos de diferencia
- ✅ Paginación
- ✅ Ruta en App.tsx: `/ventas/historial-caja`

---

### 🎯 **FASE 7: Módulo de Cotizaciones (5-6 horas)**

#### Backend

**Servicios:**

```typescript
// src/services/quoteService.ts
export class QuoteService {
  async createQuote(data: CreateQuoteInput): Promise<Quote> {
    // Generar código único (COT-0001)
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const nextNumber = lastQuote
      ? parseInt(lastQuote.codigoCotizacion.split('-')[1]) + 1
      : 1;

    const codigoCotizacion = `COT-${nextNumber.toString().padStart(4, '0')}`;

    // Crear cotización
    const quote = await prisma.quote.create({
      data: {
        codigoCotizacion,
        clienteId: data.clienteId,
        almacenId: data.almacenId,
        usuarioId: data.usuarioId,
        fechaVencimiento: data.fechaVencimiento,
        subtotal: data.subtotal,
        igv: data.igv,
        total: data.total,
        observaciones: data.observaciones,
        items: {
          create: data.items,
        },
      },
      include: { items: true },
    });

    return quote;
  }

  async convertToSale(quoteId: string, userId: string): Promise<Sale> {
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
      include: { items: true },
    });

    if (!quote) throw new Error('Cotización no encontrada');
    if (quote.estado !== 'Pendiente') {
      throw new Error('Solo se pueden convertir cotizaciones pendientes');
    }

    // Crear venta basada en cotización
    const sale = await prisma.sale.create({
      data: {
        codigoVenta: await this.generateSaleCode(),
        quoteOriginId: quoteId,
        clienteId: quote.clienteId,
        almacenId: quote.almacenId,
        usuarioId: userId,
        subtotal: quote.subtotal,
        igv: quote.igv,
        total: quote.total,
        items: {
          create: quote.items.map((item) => ({
            productId: item.productId,
            nombreProducto: item.nombreProducto,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.subtotal,
          })),
        },
      },
    });

    // Actualizar estado de cotización
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        estado: 'Convertida',
        saleId: sale.id,
      },
    });

    return sale;
  }
}
```

#### Frontend

**Crear Página:**

```typescript
// src/modules/sales/pages/Cotizaciones.tsx
```

**Estructura:**

```
┌─────────────────────────────────────────┐
│   COTIZACIONES                          │
├─────────────────────────────────────────┤
│ 🔍 FILTROS                              │
│  [Fecha Desde] [Fecha Hasta] [Estado]  │
│                             [🔍 Buscar] │
├─────────────────────────────────────────┤
│ 📋 TABLA DE COTIZACIONES                │
│┌───────────────────────────────────────┐│
││ Código │ Cliente │ Total │ Estado │...││
││ COT-001│ Juan P. │ 1,500 │ Pend.  │...││
││ COT-002│ ACME SA │ 5,000 │ Conv.  │...││
│└───────────────────────────────────────┘│
│                             [+ Nueva]   │
└─────────────────────────────────────────┘
```

**Acciones:**
- 👁️ Ver Detalle
- 🖨️ Imprimir Cotización (PDF)
- ✅ Convertir a Venta (si estado = Pendiente)
- ❌ Cancelar Cotización

**Entregables:**
- ✅ CRUD completo de cotizaciones
- ✅ Conversión a venta funcional
- ✅ PDF de cotización generado
- ✅ Validación de fecha de vencimiento

---

## 5. Recomendaciones y Mejoras

### 🎯 **A. Lógica de Negocio**

#### ✅ **CORRECTO EN TU PROPUESTA:**

1. **Movimientos de Caja:** Esencial para negocios reales (pago de servicios, recuperación de deudas, etc.)

2. **Cálculo de Cierre:**
   ```
   Total Esperado = Apertura + Ventas Efectivo + Ingresos - Egresos
   Diferencia = Monto Contado - Total Esperado
   ```
   ✅ Esto permite detectar errores de caja (robos, errores de cambio, etc.)

3. **Historial de Arqueos:** Auditoría completa para contabilidad

4. **Cotizaciones:** Común en B2B, permite gestionar pipeline de ventas

#### ⚠️ **CONSIDERACIONES ADICIONALES:**

1. **Validación de Cierre:**
   - ❌ NO cerrar caja si hay ventas pendientes
   - ❌ NO cerrar si hay diferencias mayores a umbral (ej: 5%)
   - ✅ Exigir comentario si hay diferencia significativa

2. **Concurrencia:**
   ```typescript
   // ¿Qué pasa si 2 usuarios intentan cerrar la misma caja?
   // Solución: Lock optimista con versioning
   await prisma.cashSession.update({
     where: {
       id: sessionId,
       estado: 'Abierta', // ✅ Solo actualiza si aún está abierta
     },
     data: { estado: 'Cerrada', ... },
   });
   ```

3. **Notas de Crédito:**
   Tu boceto no lo incluye, pero mencionas "generar nota de crédito" en tu propuesta.
   
   **Recomendación:** Agregar enum en Sale:
   ```prisma
   enum SaleType {
     Venta       // Venta normal
     NotaCredito // Devolución/anulación
   }
   
   model Sale {
     tipo          SaleType @default(Venta)
     saleOriginId  String?  // Si es nota de crédito, referencia a venta original
   }
   ```

### 🎯 **B. Diseño UX/UI**

#### ✅ **LO QUE ESTÁ BIEN:**

1. **Material Icons:** Más livianas y modernas que Font Awesome
2. **Grid Layouts:** Mejor distribución de espacio
3. **Dialogs Nativos:** Menos dependencias, mejor performance
4. **Nomenclatura Clara:** "Gestión Caja" vs "Apertura Caja" (más descriptivo)

#### 💡 **MEJORAS SUGERIDAS:**

1. **Dark Mode:** Considera agregar toggle (tu diseño es muy light)

2. **Feedback Visual:**
   ```tsx
   // Cuando se registra un movimiento, mostrar toast
   <Toast variant="success">
     ✅ Ingreso de S/ 50.00 registrado
   </Toast>
   ```

3. **Confirmaciones Críticas:**
   ```tsx
   // Antes de cerrar caja con diferencia > 2%
   if (Math.abs(diferencia) > totalEsperado * 0.02) {
     const confirmed = window.confirm(
       `⚠️ Diferencia alta detectada: S/ ${diferencia}\n¿Continuar con el cierre?`
     );
     if (!confirmed) return;
   }
   ```

4. **Responsividad:**
   Tu boceto HTML tiene grids, pero asegúrate de que en móvil se apilen verticalmente:
   ```css
   @media (max-width: 768px) {
     .cash-management-grid {
       grid-template-columns: 1fr; /* Stack en móvil */
     }
   }
   ```

### 🎯 **C. Arquitectura Técnica**

#### ✅ **LO QUE MANTENEMOS:**

1. **Context API:** Suficiente para este alcance (no necesitas Redux)
2. **Styled Components:** Consistencia con el resto del proyecto
3. **Prisma ORM:** Excelente para migraciones y validaciones

#### 💡 **MEJORAS:**

1. **Cache de Resumen:**
   ```typescript
   // En SalesContext, cachear el resumen durante 30 segundos
   const [cashSummary, setCashSummary] = useState<CashSummary | null>(null);
   const [summaryTimestamp, setSummaryTimestamp] = useState<number>(0);

   const loadCashSummary = async (sessionId: string, force = false) => {
     const now = Date.now();
     if (!force && cashSummary && now - summaryTimestamp < 30000) {
       return; // Usar caché
     }
     // Fetch nuevo...
   };
   ```

2. **Optimistic UI Updates:**
   ```typescript
   const createCashMovement = async (type, data) => {
     // Actualizar UI inmediatamente (optimistic)
     const tempMovement = {
       id: 'temp-' + Date.now(),
       tipo: type,
       monto: data.monto,
       motivo: data.motivo,
       createdAt: new Date().toISOString(),
     };
     setCashMovements([tempMovement, ...cashMovements]);

     try {
       const realMovement = await api.post('/cash-movements', ...);
       // Reemplazar temp con real
       setCashMovements((prev) =>
         prev.map((m) => (m.id === tempMovement.id ? realMovement : m))
       );
     } catch (error) {
       // Rollback si falla
       setCashMovements((prev) => prev.filter((m) => m.id !== tempMovement.id));
       throw error;
     }
   };
   ```

---

## 6. Cronograma y Prioridades

### 📅 **Timeline Estimado**

| Fase | Descripción | Tiempo | Prioridad |
|------|-------------|--------|-----------|
| **Fase 1** | Migración BD (CashMovement, Quote) | 2-3h | 🔴 CRÍTICA |
| **Fase 2** | Backend - API Movimientos Caja | 3-4h | 🔴 CRÍTICA |
| **Fase 3** | Frontend - GestionCaja.tsx | 4-5h | 🔴 CRÍTICA |
| **Fase 4** | Frontend - RealizarVenta.tsx (mejoras) | 3-4h | 🟠 ALTA |
| **Fase 5** | Frontend - ListaVentas.tsx (mejoras) | 2-3h | 🟡 MEDIA |
| **Fase 6** | Nueva Página - HistorialCaja.tsx | 3-4h | 🟡 MEDIA |
| **Fase 7** | Módulo Cotizaciones (completo) | 5-6h | 🟢 BAJA |
| **Testing E2E** | Pruebas completas | 2-3h | 🔴 CRÍTICA |

**Total: 24-32 horas** (3-4 días de trabajo)

### 🎯 **Plan de Acción Inmediata (HOY - 6 Noviembre)**

#### Opción A: **Demo Funcional Mínimo (8 horas)**
Si necesitas algo funcional HOY para tu presentación:

1. ✅ **FASE 1** (2h): Migrar BD con CashMovement
2. ✅ **FASE 2** (3h): API de movimientos
3. ✅ **FASE 3 Parcial** (3h): Solo rediseñar GestionCaja con movimientos básicos

**Resultado:** Tendrás un módulo de Gestión de Caja funcional con cálculos correctos.

#### Opción B: **Implementación Completa (4-5 días)**
Si tienes tiempo:

- **Día 1:** Fases 1 + 2 (Backend)
- **Día 2:** Fase 3 + 4 (GestionCaja + RealizarVenta)
- **Día 3:** Fase 5 + 6 (ListaVentas + HistorialCaja)
- **Día 4:** Fase 7 (Cotizaciones)
- **Día 5:** Testing + Ajustes

---

## 7. Decisiones Requeridas

### ❓ **Preguntas para Ti:**

1. **Cotizaciones:**
   - ¿Son realmente necesarias para tu caso de uso?
   - ¿O podemos dejarlas como Fase 7 (opcional)?

2. **Notas de Crédito:**
   - Mencionas "generar nota de crédito" pero tu boceto no lo incluye.
   - ¿Quieres implementarlo o solo es un placeholder?

3. **Timeline:**
   - ¿Cuándo necesitas esto terminado?
   - ¿Priorizamos Gestión de Caja (crítico) o Cotizaciones (nice-to-have)?

4. **Diseño:**
   - ¿Quieres seguir 100% tu boceto HTML o podemos hacer ajustes de UX?
   - Por ejemplo: ¿Agregar dark mode? ¿Mejorar responsividad?

5. **Integración con Inventario:**
   - Al completar una venta, ya descontamos stock (correcto).
   - ¿Al crear cotización también reservamos stock temporalmente?

---

## 8. Conclusión

### ✅ **Tu Propuesta es EXCELENTE porque:**

1. ✅ Incluye movimientos de caja (crítico para negocio real)
2. ✅ Separa historial de caja (auditoría)
3. ✅ Cotizaciones (para B2B)
4. ✅ Diseño HTML moderno y limpio

### ⚠️ **Ajustes Necesarios:**

1. 🔴 **URGENTE:** Crear modelo `CashMovement` en BD
2. 🔴 **URGENTE:** Actualizar lógica de cierre de caja
3. 🟠 **IMPORTANTE:** Validaciones de concurrencia
4. 🟡 **DESEABLE:** Módulo de cotizaciones (si hay tiempo)

### 🚀 **Siguiente Paso:**

**Responde las 5 preguntas de la sección 7** y te genero el código completo para empezar con la Fase 1 inmediatamente.

---

**¿Procedemos con la implementación? 💪**
