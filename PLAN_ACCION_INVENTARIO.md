# 🎯 PLAN DE ACCIÓN - MÓDULO DE INVENTARIO (REVISADO)

**Fecha de creación:** 9 de Diciembre, 2025  
**Versión:** 2.0 - Ajustado a lógica de negocio real  
**Objetivo:** Implementar sistema completo de inventario con transferencias entre almacenes  
**Tiempo estimado total:** 68 horas (~9 días laborales)

---

## 🏪 CONTEXTO DEL NEGOCIO

**Modelo de Operación:**
- ✅ Una sola tienda física
- ✅ Almacén Principal (tienda) + Almacén Secundario (bodega externa)
- ✅ Stock mínimo único por producto (no varía por almacén)
- ✅ Transferencias entre almacenes para reabastecimiento

**Estados de Stock:**
- 🔴 **CRÍTICO:** Cantidad ≤ 50% del stock mínimo
- 🟡 **BAJO:** Cantidad < stock mínimo pero > 50%
- 🟢 **NORMAL:** Cantidad ≥ stock mínimo

---

## 📊 RESUMEN EJECUTIVO

| Categoría | Tareas | Esfuerzo | Prioridad |
|-----------|--------|----------|-----------|
| 🔴 **Crítico** | 3 | 14h | URGENTE |
| 🟡 **Importante** | 4 | 32h | ALTA |
| 🟢 **Mejoras** | 3 | 22h | MEDIA |
| **TOTAL** | **10** | **68h** | |

---

## 🔴 FASE 1: CORRECCIONES CRÍTICAS (URGENTE)

### Objetivo: Implementar lógica correcta de estados y alertas de stock

**Duración estimada:** 14 horas  
**Fecha límite:** 2 días laborales

---

### 📌 TAREA 1.1: Implementar Lógica de Estados de Stock (Backend)

**Problema:** Estados calculados en frontend, lógica inconsistente con stock mínimo del producto

**Impacto:** 🔴 ALTO - Alertas incorrectas, reportes inconsistentes  
**Prioridad:** 🔴 URGENTE  
**Esfuerzo:** 5 horas

#### Lógica de Negocio:

```typescript
// Product.minStock: Stock mínimo único para el producto
// StockByWarehouse.quantity: Cantidad actual en cada almacén

CRÍTICO: cantidad <= (minStock * 0.5)    // 50% o menos
BAJO:    cantidad < minStock              // Entre 51% y 99%
NORMAL:  cantidad >= minStock             // 100% o más

Ejemplo: Product "Cable HDMI" con minStock = 20
- Almacén Principal: 8 unidades → CRÍTICO (40%)
- Almacén Secundario: 15 unidades → BAJO (75%)
- Almacén Principal: 25 unidades → NORMAL (125%)
```

#### Pasos de implementación:

**1. Backend - Actualizar función calcularEstado existente (1h)**

```typescript
// src/services/inventoryService.ts - Línea 85 (YA EXISTE, SOLO VERIFICAR)

function calcularEstado(cantidad: number, stockMinimo: number | null): StockEstado {
  const min = Number(stockMinimo ?? 0);
  
  // Sin stock mínimo configurado, siempre es NORMAL
  if (min <= 0) return 'NORMAL';
  
  // CRÍTICO: Stock <= 50% del mínimo
  if (cantidad <= Math.floor(min * 0.5)) return 'CRITICO';
  
  // BAJO: Stock < mínimo pero > 50%
  if (cantidad < min) return 'BAJO';
  
  // NORMAL: Stock >= mínimo
  return 'NORMAL';
}
```

**2. Backend - Asegurar uso de Product.minStock SOLAMENTE (1h)**

```typescript
// src/services/inventoryService.ts - Línea 175 (MODIFICAR)

// ❌ ANTES: Usaba StockByWarehouse.minStock como prioridad
const minStock = r.minStock ?? r.product.minStock ?? null;

// ✅ DESPUÉS: Usar SOLO Product.minStock (stock mínimo único)
let rows: StockByWarehouseRow[] = records.map((r) => {
  const minStock = r.product.minStock ?? null; // ✅ SOLO del producto
  const estado = calcularEstado(r.quantity, minStock);
  
  return {
    stockByWarehouseId: r.id,
    productId: r.productId,
    codigo: r.product.codigo,
    nombre: r.product.nombre,
    almacen: r.warehouse.nombre,
    warehouseId: r.warehouseId,
    cantidad: r.quantity,
    stockMinimo: minStock, // ✅ Siempre del producto
    estado,
    updatedAt: r.updatedAt.toISOString(),
  };
});

// Filtros y ordenamiento ya funcionan correctamente
if (filters.estado) {
  rows = rows.filter((x) => x.estado === filters.estado);
}
```

**3. Frontend - Eliminar cálculo de estados (1h)**

```typescript
// src/components/Inventario/TablaStock.tsx

// ❌ ELIMINAR función calcularEstado si existe en frontend
// ❌ ELIMINAR cualquier lógica de estados en componentes

// ✅ Usar SOLO el estado del backend:
<StatusBadge $status={item.estado}>
  {item.estado === 'CRITICO' ? '🔴 Crítico' : 
   item.estado === 'BAJO' ? '🟡 Bajo' : 
   '🟢 Normal'}
</StatusBadge>
```

**4. Migración - Limpiar StockByWarehouse.minStock (1h)**

```sql
-- Opcional: Limpiar campo minStock de stock_by_warehouse
-- Ya que NO lo usaremos (solo Product.minStock)

UPDATE stock_by_warehouse SET "stockMinimo" = NULL;

-- O en Prisma Schema, marcar como deprecated:
model StockByWarehouse {
  minStock Int? @map("stockMinimo") // @deprecated - Usar Product.minStock
}
```

**5. Testing - Casos de uso completos (1h)**

```javascript
// test/e2e-inventory-stock-states.js

describe('Estados de Stock basados en Product.minStock', () => {
  
  test('Producto sin minStock siempre es NORMAL', async () => {
    // Crear producto sin minStock
    const product = await createProduct({ minStock: null });
    const stock = await createStock(product.id, 'WH-PRINCIPAL', 5);
    
    const response = await api.get(`/api/inventory/stock?productId=${product.id}`);
    expect(response.data.data.rows[0].estado).toBe('NORMAL');
  });
  
  test('Estado CRÍTICO: cantidad <= 50% del mínimo', async () => {
    const product = await createProduct({ minStock: 20 });
    const stock = await createStock(product.id, 'WH-PRINCIPAL', 10); // 50%
    
    const response = await api.get(`/api/inventory/stock?productId=${product.id}`);
    expect(response.data.data.rows[0].estado).toBe('CRITICO');
  });
  
  test('Estado BAJO: cantidad < mínimo pero > 50%', async () => {
    const product = await createProduct({ minStock: 20 });
    const stock = await createStock(product.id, 'WH-PRINCIPAL', 15); // 75%
    
    const response = await api.get(`/api/inventory/stock?productId=${product.id}`);
    expect(response.data.data.rows[0].estado).toBe('BAJO');
  });
  
  test('Estado NORMAL: cantidad >= mínimo', async () => {
    const product = await createProduct({ minStock: 20 });
    const stock = await createStock(product.id, 'WH-PRINCIPAL', 25); // 125%
    
    const response = await api.get(`/api/inventory/stock?productId=${product.id}`);
    expect(response.data.data.rows[0].estado).toBe('NORMAL');
  });
  
  test('Mismo producto en 2 almacenes con estados diferentes', async () => {
    const product = await createProduct({ minStock: 20 });
    await createStock(product.id, 'WH-PRINCIPAL', 8);   // CRÍTICO
    await createStock(product.id, 'WH-SECUNDARIO', 25); // NORMAL
    
    const response = await api.get(`/api/inventory/stock?productId=${product.id}`);
    const stocks = response.data.data.rows;
    
    const principal = stocks.find(s => s.warehouseId === 'WH-PRINCIPAL');
    const secundario = stocks.find(s => s.warehouseId === 'WH-SECUNDARIO');
    
    expect(principal.estado).toBe('CRITICO');
    expect(secundario.estado).toBe('NORMAL');
  });
});
```

**Criterios de aceptación:**
- ✅ Estados basados SOLO en Product.minStock
- ✅ Mismo producto puede tener diferentes estados por almacén
- ✅ Frontend usa estados del backend
- ✅ StockByWarehouse.minStock ignorado
- ✅ Tests E2E pasan (5 casos)

---

### 📌 TAREA 1.2: Sistema de Alertas de Stock Bajo/Crítico

**Problema:** No hay sistema proactivo de alertas para productos con stock bajo

**Impacto:** 🔴 ALTO - Productos se agotan sin previo aviso  
**Prioridad:** 🔴 URGENTE  
**Esfuerzo:** 5 horas

#### Pasos de implementación:

**1. Backend - Endpoint de alertas mejorado (2h)**

```typescript
// src/services/inventoryService.ts - Mejorar getAlertas existente

async getAlertas(): Promise<Array<AlertaStock>> {
  // Obtener todos los stocks con su producto
  const stocks = await prisma.stockByWarehouse.findMany({
    where: {
      product: {
        trackInventory: true,
        estado: true,
        minStock: { gt: 0 } // ✅ Solo productos con mínimo configurado
      }
    },
    include: {
      product: true,
      warehouse: true
    }
  });

  const alertas: AlertaStock[] = [];

  for (const stock of stocks) {
    const minStock = stock.product.minStock ?? 0;
    if (minStock <= 0) continue; // Sin mínimo, sin alerta

    const estado = calcularEstado(stock.quantity, minStock);
    
    if (estado === 'CRITICO' || estado === 'BAJO') {
      alertas.push({
        productId: stock.productId,
        codigo: stock.product.codigo,
        nombre: stock.product.nombre,
        almacen: stock.warehouse.nombre,
        almacenId: stock.warehouseId,
        cantidad: stock.quantity,
        stockMinimo: minStock,
        tipoAlerta: estado,
        porcentaje: Math.round((stock.quantity / minStock) * 100),
        diferenciaUnidades: minStock - stock.quantity
      });
    }
  }

  // Ordenar: CRITICO primero, luego por % ascendente
  return alertas.sort((a, b) => {
    if (a.tipoAlerta === 'CRITICO' && b.tipoAlerta !== 'CRITICO') return -1;
    if (a.tipoAlerta !== 'CRITICO' && b.tipoAlerta === 'CRITICO') return 1;
    return a.porcentaje - b.porcentaje;
  });
}

**2. Frontend - Página de Alertas mejorada (2h)**

```typescript
// src/pages/Inventario/Alertas.tsx (NUEVA)

interface AlertaStock {
  productId: string;
  codigo: string;
  nombre: string;
  almacen: string;
  almacenId: string;
  cantidad: number;
  stockMinimo: number;
  tipoAlerta: 'CRITICO' | 'BAJO';
  porcentaje: number;
  diferenciaUnidades: number;
}

const Alertas: React.FC = () => {
  const [alertas, setAlertas] = useState<AlertaStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<'ALL' | 'CRITICO' | 'BAJO'>('ALL');

  useEffect(() => {
    loadAlertas();
    const interval = setInterval(loadAlertas, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  const loadAlertas = async () => {
    try {
      const response = await api.get('/api/inventory/alertas');
      setAlertas(response.data.data || []);
    } catch (error) {
      console.error('Error loading alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const alertasFiltradas = alertas.filter(a => 
    filtroTipo === 'ALL' ? true : a.tipoAlerta === filtroTipo
  );

  return (
    <Layout title="Alertas de Stock">
      <Header>
        <Title>⚠️ Alertas de Inventario</Title>
        <Stats>
          <StatCard variant="critico">
            <StatNumber>{alertas.filter(a => a.tipoAlerta === 'CRITICO').length}</StatNumber>
            <StatLabel>Críticos</StatLabel>
          </StatCard>
          <StatCard variant="bajo">
            <StatNumber>{alertas.filter(a => a.tipoAlerta === 'BAJO').length}</StatNumber>
            <StatLabel>Bajos</StatLabel>
          </StatCard>
        </Stats>
      </Header>

      <Filters>
        <FilterButton 
          active={filtroTipo === 'ALL'} 
          onClick={() => setFiltroTipo('ALL')}
        >
          Todas ({alertas.length})
        </FilterButton>
        <FilterButton 
          active={filtroTipo === 'CRITICO'} 
          onClick={() => setFiltroTipo('CRITICO')}
        >
          🔴 Críticas ({alertas.filter(a => a.tipoAlerta === 'CRITICO').length})
        </FilterButton>
        <FilterButton 
          active={filtroTipo === 'BAJO'} 
          onClick={() => setFiltroTipo('BAJO')}
        >
          🟡 Bajas ({alertas.filter(a => a.tipoAlerta === 'BAJO').length})
        </FilterButton>
      </Filters>

      <AlertasGrid>
        {alertasFiltradas.map(alerta => (
          <AlertCard key={`${alerta.productId}-${alerta.almacenId}`} tipo={alerta.tipoAlerta}>
            <AlertHeader>
              <AlertIcon>{alerta.tipoAlerta === 'CRITICO' ? '🔴' : '🟡'}</AlertIcon>
              <AlertTitle>{alerta.nombre}</AlertTitle>
              <AlertCode>{alerta.codigo}</AlertCode>
            </AlertHeader>
            
            <AlertBody>
              <InfoRow>
                <Label>Almacén:</Label>
                <Value>{alerta.almacen}</Value>
              </InfoRow>
              <InfoRow>
                <Label>Stock actual:</Label>
                <Value>{alerta.cantidad} unidades</Value>
              </InfoRow>
              <InfoRow>
                <Label>Stock mínimo:</Label>
                <Value>{alerta.stockMinimo} unidades</Value>
              </InfoRow>
              <InfoRow>
                <Label>Faltante:</Label>
                <Value highlight>{alerta.diferenciaUnidades} unidades</Value>
              </InfoRow>
              <ProgressBar>
                <ProgressFill width={alerta.porcentaje} tipo={alerta.tipoAlerta} />
                <ProgressLabel>{alerta.porcentaje}%</ProgressLabel>
              </ProgressBar>
            </AlertBody>
            
            <AlertActions>
              <ActionButton variant="primary" onClick={() => handleAjuste(alerta)}>
                ➕ Ajustar Stock
              </ActionButton>
              <ActionButton variant="secondary" onClick={() => handleTransferencia(alerta)}>
                🔄 Transferir
              </ActionButton>
            </AlertActions>
          </AlertCard>
        ))}
      </AlertasGrid>

      {alertasFiltradas.length === 0 && (
        <EmptyState>
          <EmptyIcon>✅</EmptyIcon>
          <EmptyText>No hay alertas de stock</EmptyText>
        </EmptyState>
      )}
    </Layout>
  );
};
```

**3. Agregar badge de alertas en navbar (1h)**

```typescript
// src/components/Layout/Navbar.tsx

const Navbar: React.FC = () => {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const loadAlertCount = async () => {
      try {
        const response = await api.get('/api/inventory/alertas');
        setAlertCount(response.data.data?.length || 0);
      } catch (error) {
        console.error('Error loading alert count:', error);
      }
    };

    loadAlertCount();
    const interval = setInterval(loadAlertCount, 120000); // Cada 2 minutos
    return () => clearInterval(interval);
  }, []);

  return (
    <Nav>
      <NavLink to="/inventario/alertas">
        ⚠️ Alertas
        {alertCount > 0 && <Badge variant="danger">{alertCount}</Badge>}
      </NavLink>
    </Nav>
  );
};
```

**Criterios de aceptación:**
- ✅ Endpoint /alertas devuelve solo productos con estado BAJO o CRÍTICO
- ✅ Alertas ordenadas por prioridad (CRÍTICO primero)
- ✅ UI muestra porcentaje y unidades faltantes
- ✅ Badge en navbar con contador de alertas
- ✅ Botones de acción rápida (Ajustar/Transferir)

---

### 📌 TAREA 1.3: Validación de Stock Negativo

**Problema:** Posibles ajustes que dejen stock en negativo

**Impacto:** 🔴 MEDIO - Inconsistencias en inventario  
**Prioridad:** 🔴 URGENTE  
**Esfuerzo:** 4 horas

#### Implementación:

**1. Backend - Validación estricta (2h)**

```typescript
// src/services/inventoryService.ts - Mejorar createAjuste

async createAjuste(body: AjusteBody, userId?: string) {
  // ... validaciones existentes ...

  // ✅ NUEVO: Validación de stock negativo
  const stockActual = stockRecord.quantity;
  const stockResultante = stockActual + body.cantidadAjuste;

  if (stockResultante < 0) {
    throw new Error(
      `El ajuste resultaría en stock negativo. ` +
      `Stock actual: ${stockActual}, ` +
      `Ajuste: ${body.cantidadAjuste}, ` +
      `Resultado: ${stockResultante}`
    );
  }

  // ✅ NUEVO: Advertencia para ajustes grandes
  if (Math.abs(body.cantidadAjuste) > 100) {
    console.warn(
      `[AJUSTE GRANDE] Usuario ${userId}, ` +
      `Producto ${product.codigo}, ` +
      `Ajuste: ${body.cantidadAjuste}`
    );
  }

  // Continuar con la transacción...
}
```

**2. Backend - Constraint en base de datos (1h)**

```sql
-- Agregar check constraint en PostgreSQL
ALTER TABLE stock_by_warehouse 
ADD CONSTRAINT check_positive_quantity 
CHECK (cantidad >= 0);
```

```prisma
// schema.prisma - Documentar constraint
model StockByWarehouse {
  quantity Int @default(0) @map("cantidad") // >= 0 (DB constraint)
}
```

**3. Testing - Casos edge (1h)**

```javascript
test('Rechazar ajuste que resulte en stock negativo', async () => {
  const stock = await createStock(productId, warehouseId, 10);
  
  await expect(
    api.post('/api/inventory/ajustes', {
      productId,
      warehouseId,
      cantidadAjuste: -15 // Intentar dejar en -5
    })
  ).rejects.toThrow('stock negativo');
});

test('Permitir ajuste que deje stock en 0', async () => {
  const stock = await createStock(productId, warehouseId, 10);
  
  const response = await api.post('/api/inventory/ajustes', {
    productId,
    warehouseId,
    cantidadAjuste: -10 // Dejar en 0
  });
  
  expect(response.status).toBe(200);
  expect(response.data.data.stockDespues).toBe(0);
});
```

**Criterios de aceptación:**
- ✅ Backend rechaza ajustes que dejen stock < 0
- ✅ DB constraint evita inconsistencias
- ✅ Logs de advertencia para ajustes grandes
- ✅ Tests de casos edge pasan

---

## 🟡 FASE 2: FUNCIONALIDADES IMPORTANTES (ALTA PRIORIDAD)

### Objetivo: Implementar transferencias entre almacenes y exportación de datos

**Duración estimada:** 32 horas  
**Fecha límite:** 4 días laborales

---

### 📌 TAREA 2.1: Sistema de Transferencias entre Almacenes ⭐ (CLAVE)

**Problema:** No existe funcionalidad para transferir productos entre almacén principal y secundario

**Impacto:** 🟡 CRÍTICO - Funcionalidad core del módulo  
**Prioridad:** 🟡 URGENTE  
**Esfuerzo:** 18 horas

#### Casos de Uso:

```
CASO 1: Transferencia de Principal → Secundario
- Tienda llena, mover excedente a bodega externa
- Movimiento: SALIDA en Principal, ENTRADA en Secundario

CASO 2: Transferencia de Secundario → Principal  
- Reabastecer tienda desde bodega
- Movimiento: SALIDA en Secundario, ENTRADA en Principal

CASO 3: Validaciones
- Stock suficiente en origen
- No permite stock negativo
- Registra ambos movimientos en Kardex
- Documento de referencia único
```

#### Pasos de implementación:

**1. Backend - Modelo de Transferencia (3h)**

```prisma
// schema.prisma - NUEVO modelo

model StockTransfer {
  id                  String   @id @default(cuid())
  codigo              String   @unique // TRF-2025-001
  
  // Producto y cantidad
  productId           String
  product             Product  @relation(fields: [productId], references: [id])
  cantidad            Int
  
  // Almacenes origen y destino
  warehouseFromId     String
  warehouseFrom       Warehouse @relation("TransferFrom", fields: [warehouseFromId], references: [id])
  
  warehouseToId       String
  warehouseTo         Warehouse @relation("TransferTo", fields: [warehouseToId], references: [id])
  
  // Estado del transfer
  estado              TransferStatus @default(PENDIENTE)
  // PENDIENTE → APROBADO → ENVIADO → RECIBIDO → CANCELADO
  
  // Auditoría
  observaciones       String?
  motivoTransferencia String? // "Reabastecimiento tienda", "Excedente a bodega"
  
  solicitadoPor       String
  solicitante         User     @relation("TransferSolicitante", fields: [solicitadoPor], references: [id])
  
  aprobadoPor         String?
  aprobador           User?    @relation("TransferAprobador", fields: [aprobadoPor], references: [id])
  fechaAprobacion     DateTime?
  
  recibidoPor         String?
  receptor            User?    @relation("TransferReceptor", fields: [recibidoPor], references: [id])
  fechaRecepcion      DateTime?
  
  // Referencias a movimientos de inventario
  movimientoSalidaId  String?  @unique
  movimientoSalida    InventoryMovement? @relation("TransferSalida", fields: [movimientoSalidaId], references: [id])
  
  movimientoEntradaId String?  @unique
  movimientoEntrada   InventoryMovement? @relation("TransferEntrada", fields: [movimientoEntradaId], references: [id])
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@map("stock_transfers")
}

enum TransferStatus {
  PENDIENTE   // Creado, esperando aprobación
  APROBADO    // Aprobado, listo para enviar
  ENVIADO     // En tránsito
  RECIBIDO    // Completado
  CANCELADO   // Cancelado
}
```

**2. Backend - Service de Transferencias (6h)**

```typescript
// src/services/transferService.ts (NUEVO)

interface CreateTransferData {
  productId: string;
  warehouseFromId: string;
  warehouseToId: string;
  cantidad: number;
  observaciones?: string;
  motivoTransferencia?: string;
}

export const transferService = {
  
  async createTransfer(data: CreateTransferData, userId: string) {
    // Validaciones
    if (data.warehouseFromId === data.warehouseToId) {
      throw new Error('Los almacenes de origen y destino no pueden ser iguales');
    }

    if (data.cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a 0');
    }

    // Verificar producto
    const product = await prisma.product.findUnique({
      where: { id: data.productId }
    });

    if (!product || !product.trackInventory) {
      throw new Error('Producto no encontrado o no gestiona inventario');
    }

    // Verificar stock suficiente en origen
    const stockOrigen = await prisma.stockByWarehouse.findUnique({
      where: {
        productId_warehouseId: {
          productId: data.productId,
          warehouseId: data.warehouseFromId
        }
      }
    });

    if (!stockOrigen || stockOrigen.quantity < data.cantidad) {
      throw new Error(
        `Stock insuficiente en origen. Disponible: ${stockOrigen?.quantity || 0}, ` +
        `Solicitado: ${data.cantidad}`
      );
    }

    // Generar código único
    const count = await prisma.stockTransfer.count();
    const codigo = `TRF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Crear transferencia
    const transfer = await prisma.stockTransfer.create({
      data: {
        codigo,
        productId: data.productId,
        warehouseFromId: data.warehouseFromId,
        warehouseToId: data.warehouseToId,
        cantidad: data.cantidad,
        observaciones: data.observaciones,
        motivoTransferencia: data.motivoTransferencia,
        solicitadoPor: userId,
        estado: 'PENDIENTE'
      },
      include: {
        product: true,
        warehouseFrom: true,
        warehouseTo: true,
        solicitante: true
      }
    });

    return transfer;
  },

  async aprobarTransfer(transferId: string, userId: string) {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: transferId },
      include: { product: true }
    });

    if (!transfer) throw new Error('Transferencia no encontrada');
    if (transfer.estado !== 'PENDIENTE') {
      throw new Error(`No se puede aprobar. Estado actual: ${transfer.estado}`);
    }

    // Verificar stock actual (puede haber cambiado)
    const stockOrigen = await prisma.stockByWarehouse.findUnique({
      where: {
        productId_warehouseId: {
          productId: transfer.productId,
          warehouseId: transfer.warehouseFromId
        }
      }
    });

    if (!stockOrigen || stockOrigen.quantity < transfer.cantidad) {
      throw new Error('Stock insuficiente en origen');
    }

    // Buscar motivo de transferencia
    const motivoSalida = await prisma.movementReason.findFirst({
      where: { codigo: 'SAL-TRANSFERENCIA', activo: true }
    });
    const motivoEntrada = await prisma.movementReason.findFirst({
      where: { codigo: 'ENT-TRANSFERENCIA', activo: true }
    });

    // TRANSACCIÓN ATÓMICA
    const result = await prisma.$transaction(async (tx) => {
      // 1. Crear movimiento de SALIDA en origen
      const movSalida = await tx.inventoryMovement.create({
        data: {
          productId: transfer.productId,
          warehouseId: transfer.warehouseFromId,
          type: 'SALIDA',
          quantity: transfer.cantidad,
          stockBefore: stockOrigen.quantity,
          stockAfter: stockOrigen.quantity - transfer.cantidad,
          reasonId: motivoSalida?.id,
          referenceDoc: transfer.codigo,
          observaciones: `Transferencia a ${transfer.warehouseTo.nombre}`,
          userId
        }
      });

      // 2. Actualizar stock en origen
      await tx.stockByWarehouse.update({
        where: {
          productId_warehouseId: {
            productId: transfer.productId,
            warehouseId: transfer.warehouseFromId
          }
        },
        data: {
          quantity: { decrement: transfer.cantidad }
        }
      });

      // 3. Obtener o crear stock en destino
      const stockDestino = await tx.stockByWarehouse.upsert({
        where: {
          productId_warehouseId: {
            productId: transfer.productId,
            warehouseId: transfer.warehouseToId
          }
        },
        create: {
          productId: transfer.productId,
          warehouseId: transfer.warehouseToId,
          quantity: 0
        },
        update: {}
      });

      // 4. Crear movimiento de ENTRADA en destino
      const movEntrada = await tx.inventoryMovement.create({
        data: {
          productId: transfer.productId,
          warehouseId: transfer.warehouseToId,
          type: 'ENTRADA',
          quantity: transfer.cantidad,
          stockBefore: stockDestino.quantity,
          stockAfter: stockDestino.quantity + transfer.cantidad,
          reasonId: motivoEntrada?.id,
          referenceDoc: transfer.codigo,
          observaciones: `Transferencia desde ${transfer.warehouseFrom.nombre}`,
          userId
        }
      });

      // 5. Actualizar stock en destino
      await tx.stockByWarehouse.update({
        where: {
          productId_warehouseId: {
            productId: transfer.productId,
            warehouseId: transfer.warehouseToId
          }
        },
        data: {
          quantity: { increment: transfer.cantidad }
        }
      });

      // 6. Actualizar estado de transferencia
      const updatedTransfer = await tx.stockTransfer.update({
        where: { id: transferId },
        data: {
          estado: 'RECIBIDO', // Directamente a RECIBIDO (flujo simplificado)
          aprobadoPor: userId,
          fechaAprobacion: new Date(),
          recibidoPor: userId,
          fechaRecepcion: new Date(),
          movimientoSalidaId: movSalida.id,
          movimientoEntradaId: movEntrada.id
        },
        include: {
          product: true,
          warehouseFrom: true,
          warehouseTo: true,
          movimientoSalida: true,
          movimientoEntrada: true
        }
      });

      return updatedTransfer;
    });

    return result;
  },

  async cancelarTransfer(transferId: string, userId: string, motivo?: string) {
    const transfer = await prisma.stockTransfer.findUnique({
      where: { id: transferId }
    });

    if (!transfer) throw new Error('Transferencia no encontrada');
    if (transfer.estado !== 'PENDIENTE') {
      throw new Error('Solo se pueden cancelar transferencias pendientes');
    }

    return await prisma.stockTransfer.update({
      where: { id: transferId },
      data: {
        estado: 'CANCELADO',
        observaciones: motivo || transfer.observaciones
      }
    });
  },

  async listTransfers(filters: {
    estado?: TransferStatus;
    warehouseFromId?: string;
    warehouseToId?: string;
    productId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Number(filters.page || 1);
    const limit = Math.min(Number(filters.limit || 20), 100);
    const skip = (page - 1) * limit;

    const where: any = {
      ...(filters.estado && { estado: filters.estado }),
      ...(filters.warehouseFromId && { warehouseFromId: filters.warehouseFromId }),
      ...(filters.warehouseToId && { warehouseToId: filters.warehouseToId }),
      ...(filters.productId && { productId: filters.productId }),
    };

    const [total, transfers] = await Promise.all([
      prisma.stockTransfer.count({ where }),
      prisma.stockTransfer.findMany({
        where,
        include: {
          product: true,
          warehouseFrom: true,
          warehouseTo: true,
          solicitante: { select: { id: true, nombres: true, apellidos: true } },
          aprobador: { select: { id: true, nombres: true, apellidos: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })
    ]);

    return {
      rows: transfers,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1
    };
  }
};
```

#### Pasos de implementación:

**1. Backend - Instalar ExcelJS (0.5h)**

```bash
npm install exceljs
npm install --save-dev @types/exceljs
```

**2. Backend - Endpoints de exportación (3h)**

```typescript
// src/controllers/inventoryController.ts

import ExcelJS from 'exceljs';

exportStock: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const filters = {
    almacenId: req.query.almacenId as string,
    productId: req.query.productId as string,
    estado: req.query.estado as StockEstado,
  };
  
  // Obtener todos los datos sin paginación
  const data = await inventoryService.getStockByWarehouse({
    ...filters,
    limit: 10000 // Límite alto para exportación
  });
  
  // Crear workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'AlexaTech';
  workbook.created = new Date();
  
  const sheet = workbook.addWorksheet('Inventario');
  
  // Configurar columnas
  sheet.columns = [
    { header: 'Código', key: 'codigo', width: 15 },
    { header: 'Producto', key: 'nombre', width: 40 },
    { header: 'Almacén', key: 'almacen', width: 25 },
    { header: 'Cantidad', key: 'cantidad', width: 12 },
    { header: 'Stock Mínimo', key: 'stockMinimo', width: 15 },
    { header: 'Estado', key: 'estado', width: 12 },
    { header: 'Última Actualización', key: 'updatedAt', width: 20 },
  ];
  
  // Estilo del header
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };
  
  // Agregar datos
  data.rows.forEach((item) => {
    const row = sheet.addRow({
      codigo: item.codigo,
      nombre: item.nombre,
      almacen: item.almacen,
      cantidad: item.cantidad,
      stockMinimo: item.stockMinimo || 0,
      estado: item.estado,
      updatedAt: new Date(item.updatedAt).toLocaleString('es-ES'),
    });
    
    // Colorear según estado
    switch (item.estado) {
      case 'CRITICO':
        row.getCell('estado').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE0E0' }
        };
        row.getCell('estado').font = { color: { argb: 'FF8B0000' } };
        break;
      case 'BAJO':
        row.getCell('estado').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF4E0' }
        };
        row.getCell('estado').font = { color: { argb: 'FFB8860B' } };
        break;
      case 'NORMAL':
        row.getCell('estado').fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0FFE0' }
        };
        row.getCell('estado').font = { color: { argb: 'FF006400' } };
        break;
    }
  });
  
  // Agregar filtros
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: 7 }
  };
  
  // Ajustar ancho de columnas
  sheet.columns.forEach((column) => {
    if (column.width < 10) column.width = 10;
  });
  
  // Generar nombre de archivo
  const timestamp = new Date().toISOString().split('T')[0];
  const almacen = filters.almacenId || 'Todos';
  const filename = `inventario_${almacen}_${timestamp}.xlsx`;
  
  // Configurar headers de respuesta
  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${filename}"`
  );
  
  // Escribir y enviar
  await workbook.xlsx.write(res);
  res.end();
}),

// Similar para Kardex
exportKardex: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // Similar implementación pero con datos de kardex
  // ...
}),
```

**3. Frontend - Botón de exportar en Stock y Kardex (2h)**

```typescript
// src/pages/Inventario/ListadoStock.tsx

const handleExportStock = async () => {
  try {
    const params = new URLSearchParams();
    if (filters.almacenId) params.append('almacenId', filters.almacenId);
    if (filters.estado) params.append('estado', filters.estado);
    
    const response = await fetch(`/api/inventory/export/stock?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    
    showToast('✅ Archivo exportado', 'success');
  } catch (error) {
    showToast('❌ Error al exportar', 'error');
  }
};

// Agregar botón en UI
<Button onClick={handleExportStock}>📥 Exportar Excel</Button>
```

**Criterios de aceptación:**
- ✅ Export a Excel con colores por estado
- ✅ Botones en Stock y Kardex
- ✅ Respeta filtros activos
- ✅ Nombre descriptivo con fecha

---

### 📌 TAREA 2.3: Confirmación para Ajustes Grandes

**Problema:** Ajustes grandes sin doble confirmación

**Impacto:** 🟡 MEDIO - Riesgo de errores  
**Prioridad:** 🟡 MEDIA  
**Esfuerzo:** 2 horas

#### Implementación (Ya existe ModalAjuste, solo agregar):

```typescript
// src/components/Inventario/ModalAjuste.tsx

const UMBRAL_GRANDE = 100;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const cantidadAbs = Math.abs(formData.cantidadAjuste);
  
  // Confirmación para ajustes grandes
  if (cantidadAbs >= UMBRAL_GRANDE) {
    const confirmado = window.confirm(
      `⚠️ Ajuste de ${formData.cantidadAjuste} unidades.\n` +
      `Stock resultante: ${stockResultante}\n\n` +
      `¿Confirmar?`
    );
    if (!confirmado) return;
  }
  
  // Continuar con el ajuste...
};
```

---

### 📌 TAREA 2.4: Date Pickers en Filtros de Kardex

**Problema:** Inputs de texto para fechas poco usables

**Impacto:** 🟡 BAJO - UX mejorable  
**Prioridad:** 🟡 BAJA  
**Esfuerzo:** 6 horas

#### Implementación:

```bash
npm install react-datepicker @types/react-datepicker
```

```typescript
// src/components/Inventario/FiltersKardex.tsx

import DatePicker from 'react-datepicker';

const FiltersKardex = () => {
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  
  const presets = [
    { label: 'Hoy', days: 0 },
    { label: 'Últimos 7 días', days: 7 },
    { label: 'Este mes', days: 30 },
  ];
  
  return (
    <>
      {presets.map(preset => (
        <Button key={preset.label} onClick={() => setDates(preset.days)}>
          {preset.label}
        </Button>
      ))}
      
      <DatePicker 
        selected={fechaDesde} 
        onChange={setFechaDesde}
        dateFormat="dd/MM/yyyy"
        placeholderText="Desde"
      />
      <DatePicker 
        selected={fechaHasta} 
        onChange={setFechaHasta}
        minDate={fechaDesde}
        dateFormat="dd/MM/yyyy"
        placeholderText="Hasta"
      />
    </>
  );
};
```

---

## 🟢 FASE 3: MEJORAS Y OPTIMIZACIONES (BAJA PRIORIDAD)

### Objetivo: Optimizar performance y agregar funcionalidades avanzadas

**Duración estimada:** 22 horas  
**Fecha límite:** 3 días laborales

---

### 📌 TAREA 3.1: Tests E2E Completos del Módulo

**Esfuerzo:** 10 horas

```javascript
// test/e2e-inventory-complete.js

describe('Módulo de Inventario - E2E', () => {
  test('Flujo completo de ajuste positivo', async () => {
    // 1. Crear ajuste
    // 2. Verificar stock actualizado
    // 3. Verificar movimiento en kardex
    // 4. Verificar estado recalculado
  });

  test('Flujo de transferencia entre almacenes', async () => {
    // 1. Crear transferencia
    // 2. Aprobar transferencia
    // 3. Verificar stocks actualizados en ambos almacenes
    // 4. Verificar movimientos en kardex
  });

  test('Sistema de alertas', async () => {
    // 1. Producto con stock bajo
    // 2. Verificar que aparece en alertas
    // 3. Hacer ajuste
    // 4. Verificar que desaparece de alertas
  });

  test('Exportación a Excel', async () => {
    // 1. Exportar stock
    // 2. Verificar formato Excel válido
    // 3. Verificar datos correctos
  });

  test('Permisos y autorizaciones', async () => {
    // 1. Usuario sin permisos no puede ajustar
    // 2. Usuario sin permisos no puede transferir
    // 3. Usuario con permisos sí puede
  });
});
```

---

### 📌 TAREA 3.2: Gráficas de Evolución de Stock

**Esfuerzo:** 8 horas

```bash
npm install recharts
```

```typescript
// src/pages/Inventario/GraficasStock.tsx

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const GraficasStock = () => {
  const [datosEvolucion, setDatosEvolucion] = useState([]);

  // Gráfica 1: Evolución de stock en el tiempo
  // Gráfica 2: Comparación entre almacenes
  // Gráfica 3: Top 10 productos más movidos

  return (
    <Layout title="Gráficas de Inventario">
      <ChartCard>
        <ChartTitle>Evolución de Stock - Últimos 30 días</ChartTitle>
        <LineChart width={800} height={400} data={datosEvolucion}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="cantidad" stroke="#8884d8" />
        </LineChart>
      </ChartCard>
    </Layout>
  );
};
```

---

### 📌 TAREA 3.3: Índices de Base de Datos Optimizados

**Esfuerzo:** 4 horas

```prisma
// schema.prisma - Agregar índices para optimizar queries

model StockByWarehouse {
  // ... campos existentes ...
  
  @@index([quantity])                      // Búsquedas por cantidad
  @@index([updatedAt])                     // Ordenar por recientes
  @@index([warehouseId, quantity])         // Filtros por almacén + cantidad
  @@index([productId, warehouseId])        // Ya existe (unique)
}

model InventoryMovement {
  // ... campos existentes ...
  
  @@index([type, createdAt])               // Filtros por tipo + fecha
  @@index([warehouseId, type])             // Movimientos por almacén
  @@index([productId, warehouseId, createdAt]) // Kardex por producto
  @@index([userId])                        // Auditoría por usuario
  @@index([referenceDoc])                  // Búsqueda por documento
}

model StockTransfer {
  // ... campos existentes ...
  
  @@index([estado, createdAt])             // Filtros por estado
  @@index([warehouseFromId])               // Transferencias desde
  @@index([warehouseToId])                 // Transferencias hacia
  @@index([solicitadoPor])                 // Por usuario solicitante
}
```

```bash
# Generar y aplicar migración
npx prisma migrate dev --name add_inventory_indexes
```

---

## 📅 CRONOGRAMA DE EJECUCIÓN

### Semana 1: Correcciones Críticas (Días 1-2) ⭐
- **Día 1:** Estados de stock en backend (5h) + Sistema de alertas (5h)
- **Día 2:** Validación stock negativo (4h)
- **TOTAL:** 14 horas

### Semana 2: Transferencias y Exportación (Días 3-6) ⭐⭐⭐
- **Día 3:** Modelo y service de transferencias (9h)
- **Día 4:** Controller, rutas y página frontend (7h)
- **Día 5:** Modal y testing de transferencias (2h)
- **Día 6:** Exportación Excel (6h) + Confirmaciones (2h)
- **TOTAL:** 26 horas

### Semana 3: Date Pickers y Optimización (Días 7-8)
- **Día 7:** Date pickers en Kardex (6h)
- **Día 8:** Tests E2E (10h)
- **TOTAL:** 16 horas

### Semana 4: Mejoras Opcionales (Días 9-10)
- **Día 9:** Gráficas de evolución (8h)
- **Día 10:** Índices de BD (4h)
- **TOTAL:** 12 horas

---

**TIEMPO TOTAL:** 68 horas (~9 días laborales)  
**CRÍTICO (debe hacerse):** 40 horas  
**OPCIONAL (valor agregado):** 28 horas

---

## ✅ CHECKLIST DE ENTREGABLES

### 🔴 Fase 1 - Crítico (14h)
- [ ] Estados de stock calculados en backend usando Product.minStock
- [ ] Frontend usa estados del backend
- [ ] Sistema de alertas con endpoint /alertas
- [ ] Página de Alertas con filtros y acciones
- [ ] Badge de alertas en navbar
- [ ] Validación de stock negativo (backend + DB constraint)
- [ ] Tests E2E de estados (5 casos)

### 🟡 Fase 2 - Importante (32h)
- [ ] Modelo StockTransfer con estados
- [ ] Service de transferencias con transacciones atómicas
- [ ] Controller y rutas de transferencias
- [ ] Página de Transferencias con listado y filtros
- [ ] Modal Nueva Transferencia con validaciones
- [ ] Kardex muestra movimientos de transferencias
- [ ] Exportación a Excel (Stock + Kardex)
- [ ] Botones de exportar en UI
- [ ] Confirmaciones para ajustes grandes
- [ ] Date pickers en filtros de Kardex

### 🟢 Fase 3 - Mejoras (22h)
- [ ] Suite completa de tests E2E (8 escenarios)
- [ ] Gráficas de evolución con Recharts
- [ ] Índices de BD optimizados
- [ ] Migración aplicada exitosamente

---

## 🎯 MÉTRICAS DE ÉXITO

| Métrica | Antes | Meta | Forma de Medición |
|---------|-------|------|-------------------|
| **Funcionalidad** | | | |
| Transferencias/mes | 0 | >20 | DB: count StockTransfer |
| Alertas activas | N/A | Visibles 24/7 | Badge en navbar |
| Exports/mes | 0 | >30 | Analytics / Logs |
| Ajustes rechazados | N/A | <5% | Validación stock negativo |
| **Performance** | | | |
| Tiempo carga stock | ~800ms | <500ms | Network tab |
| Tiempo transferencia | N/A | <2s | Backend logs |
| **UX** | | | |
| Errores de usuario | ~15% | <5% | Error tracking |
| Satisfacción | 7/10 | 9/10 | Encuestas |
| **Datos** | | | |
| Consistencia kardex | ~95% | 100% | Tests E2E |
| Stock negativo | >0 casos | 0 casos | DB constraint |

---

## 🚀 RECURSOS NECESARIOS

### Equipo
- **1 Full Stack Developer** (68h) o
- **1 Backend Developer** (35h) + **1 Frontend Developer** (33h)
- **QA/Testing** (incluido en las 68h)

### Herramientas y Dependencias
```bash
# Backend
npm install exceljs

# Frontend  
npm install react-datepicker @types/react-datepicker
npm install recharts  # (Fase 3 - opcional)
```

### Base de Datos
- **Nueva tabla:** `StockTransfer`
- **Nuevo enum:** `TransferStatus`
- **Migración:** Índices optimizados
- **Constraint:** `check_positive_quantity` en stock_by_warehouse

### Endpoints Nuevos
- `GET /api/inventory/alertas`
- `GET /api/inventory/export/stock`
- `GET /api/inventory/export/kardex`
- `GET /api/transfers`
- `POST /api/transfers`
- `POST /api/transfers/:id/aprobar`
- `POST /api/transfers/:id/cancelar`
- `GET /api/transfers/:id`

### Páginas Nuevas
- `/inventario/alertas` - Vista de alertas de stock
- `/inventario/transferencias` - Gestión de transferencias
- `/inventario/transferencias/:id` - Detalle de transferencia (opcional)

---

## 📝 NOTAS FINALES

### Priorización Recomendada:

**MVP (Mínimo Viable):** 40 horas
1. ⭐⭐⭐ **CRÍTICO:** Fase 1 completa (14h) - Estados, alertas, validaciones
2. ⭐⭐⭐ **CLAVE:** Transferencias (18h) - Funcionalidad core del módulo
3. ⭐⭐ **IMPORTANTE:** Exportación Excel (6h) + Confirmaciones (2h)

**Completo:** 68 horas
4. ⭐ Date pickers (6h)
5. ⭐ Tests E2E (10h)
6. ⭐ Gráficas (8h) + Índices (4h)

---

### Riesgos y Mitigaciones:

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Cambio en lógica de estados afecta reportes | Alto | Tests E2E exhaustivos, rollout gradual |
| Transferencias dejan inconsistencias | Crítico | Transacciones atómicas, validaciones estrictas |
| Export de grandes volúmenes lento | Medio | Paginación, límite de 10k registros |
| Stock negativo por race conditions | Alto | DB constraint + validaciones backend |

---

### Consideraciones Importantes:

**✅ Lógica de Negocio Confirmada:**
- Stock mínimo **ÚNICO** por producto (Product.minStock)
- Dos almacenes: Principal (tienda) + Secundario (bodega)
- Transferencias: flujo simplificado PENDIENTE → RECIBIDO
- Estados: CRÍTICO (≤50%), BAJO (<100%), NORMAL (≥100%)

**✅ Integraciones con Otros Módulos:**
- **Compras:** Entrada de inventario al recibir orden → MovementReason ENT-COMPRA
- **Ventas:** Salida de inventario al vender → MovementReason SAL-VENTA
- **Transferencias:** Movimientos internos → ENT-TRANSFERENCIA + SAL-TRANSFERENCIA

**✅ Permisos Requeridos:**
- `inventory.read` - Ver stock, kardex, alertas, transferencias
- `inventory.update` - Ajustes, transferencias, aprobar

---

### Siguientes Pasos:

1. **Revisar y aprobar** este plan de acción
2. **Crear branch:** `feature/inventory-improvements`
3. **Ejecutar Fase 1** (14h) - Estados y alertas
4. **Testing y validación** con usuarios
5. **Ejecutar Fase 2** (32h) - Transferencias y exportación
6. **Deploy a producción** con feature flags
7. **Monitoreo** de métricas de éxito
8. **Fase 3** según feedback y prioridades

---

**Creado por:** GitHub Copilot  
**Fecha:** 9 de Diciembre, 2025  
**Versión:** 2.0 - Ajustado a lógica de negocio real  
**Estado:** 🟢 Listo para ejecutar

**Tiempo Total:** 68 horas (~9 días laborales)  
**Prioridad Alta:** 40 horas (~5 días laborales)  
**ROI Estimado:** Alto - Funcionalidad core del sistema de inventario
