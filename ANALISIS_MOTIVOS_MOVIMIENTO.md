# 📊 ANÁLISIS CRÍTICO: Motivos de Movimiento - Clasificación y Redundancias

**Fecha:** 2024-12-09  
**Módulo:** Inventario  
**Objetivo:** Optimizar y clarificar la taxonomía de motivos de movimiento

---

## 🎯 RESUMEN EJECUTIVO

### Problemas Identificados:
1. ❌ **MERMA en SALIDA** → Debería estar en AJUSTE
2. ⚠️ **Redundancia:** `AJU-CORRECCION` vs `AJU-ERROR` vs `AJUSTE_ENTRADA`/`AJUSTE_SALIDA`
3. ⚠️ **Redundancia:** `AJU-DANIO` solapa con `MERMA` y `AJU-VENCIDO`
4. ✅ **VENCIDO es necesario** → El sistema maneja lotes con fechaVencimiento

### Recomendaciones:
- **Consolidar:** 16 motivos → 13 motivos (eliminar 3 redundantes)
- **Reclasificar:** MERMA de SALIDA a AJUSTE
- **Mantener:** AJU-VENCIDO (sistema soporta productos perecederos)

---

## 📋 ANÁLISIS DETALLADO POR CATEGORÍA

### 🔵 ENTRADA (5 motivos) - ✅ CORRECTOS

| Código | Nombre | Descripción | Análisis |
|--------|--------|-------------|----------|
| `COMPRA` | Compra a Proveedor | Ingreso por compra | ✅ **CORRECTO**: Es la entrada principal del sistema. Requiere documento fiscal. |
| `DEVOLUCION_CLIENTE` | Devolución de Cliente | Retorno de producto vendido | ✅ **CORRECTO**: Cliente devuelve producto defectuoso/no deseado. |
| `PRODUCCION` | Producción Interna | Productos fabricados internamente | ✅ **CORRECTO**: Para empresas manufactureras que fabrican productos. |
| `TRANSFERENCIA_ENTRADA` | Transferencia entre Almacenes (Entrada) | Recepción desde otro almacén | ✅ **CORRECTO**: Parte del flujo de transferencias. |
| `AJUSTE_ENTRADA` | Ajuste de Inventario (Entrada) | Corrección por conteo físico | ⚠️ **REDUNDANTE**: Ver análisis de AJUSTES. |

**Conclusión ENTRADA:**
- 4 motivos son esenciales: COMPRA, DEVOLUCION_CLIENTE, PRODUCCION, TRANSFERENCIA_ENTRADA
- 1 motivo es redundante: AJUSTE_ENTRADA (debería ser tipo AJUSTE)

---

### 🔴 SALIDA (6 motivos) - ⚠️ REVISAR

| Código | Nombre | Descripción | Análisis |
|--------|--------|-------------|----------|
| `VENTA` | Venta a Cliente | Salida por venta | ✅ **CORRECTO**: Es la salida principal del sistema. Requiere documento fiscal. |
| `DEVOLUCION_PROVEEDOR` | Devolución a Proveedor | Mercadería defectuosa devuelta | ✅ **CORRECTO**: Empresa devuelve compra defectuosa al proveedor. |
| `TRANSFERENCIA_SALIDA` | Transferencia entre Almacenes (Salida) | Envío a otro almacén | ✅ **CORRECTO**: Parte del flujo de transferencias. |
| `CONSUMO_INTERNO` | Consumo Interno | Uso interno de la empresa | ✅ **CORRECTO**: Productos usados para operaciones (ej: útiles de oficina). |
| `MERMA` | Merma o Pérdida | Vencimiento o deterioro | ❌ **ERROR**: Debería ser AJUSTE, no SALIDA. Ver análisis detallado. |
| `AJUSTE_SALIDA` | Ajuste de Inventario (Salida) | Corrección por merma/robo/deterioro | ⚠️ **REDUNDANTE**: Ver análisis de AJUSTES. |

**Conclusión SALIDA:**
- 4 motivos son correctos: VENTA, DEVOLUCION_PROVEEDOR, TRANSFERENCIA_SALIDA, CONSUMO_INTERNO
- 2 motivos son problemáticos: MERMA (reclasificar) y AJUSTE_SALIDA (redundante)

---

### 🟡 AJUSTE (5 motivos) - ⚠️ CONSOLIDAR

| Código | Nombre | Descripción | Análisis |
|--------|--------|-------------|----------|
| `AJU-CORRECCION` | Corrección de inventario | Corrección de registros | ⚠️ **REDUNDANTE**: Solapa con AJU-ERROR y AJUSTE_ENTRADA/SALIDA |
| `AJU-ERROR` | Error de conteo | Error en conteo físico | ⚠️ **REDUNDANTE**: Es lo mismo que AJU-CORRECCION |
| `AJU-DANIO` | Merma por daño | Producto dañado o deteriorado | ⚠️ **SOLAPA**: Con MERMA y potencialmente con AJU-VENCIDO |
| `AJU-VENCIDO` | Producto vencido | Superó fecha de vencimiento | ✅ **NECESARIO**: Sistema maneja lotes con fechaVencimiento |
| `AJU-ROBO` | Robo o extravío | Producto robado/extraviado | ✅ **CORRECTO**: Caso especial que requiere documento/denuncia |

**Conclusión AJUSTE:**
- 2 motivos son necesarios: AJU-VENCIDO, AJU-ROBO
- 3 motivos son redundantes: AJU-CORRECCION, AJU-ERROR, AJU-DANIO

---

## 🔍 ANÁLISIS PROFUNDO DE REDUNDANCIAS

### Problema 1: ¿MERMA es SALIDA o AJUSTE?

**Estado actual:** 
- `MERMA` → SALIDA
- `AJU-DANIO` → AJUSTE

**¿Por qué es problemático?**

| Concepto | Tipo Correcto | Justificación |
|----------|---------------|---------------|
| **SALIDA** | ❌ Incorrecto para merma | Las salidas son **transacciones reales**: ventas, transferencias, devoluciones. La merma **NO sale del almacén**, simplemente **deja de existir**. |
| **AJUSTE** | ✅ Correcto para merma | Los ajustes corrigen discrepancias entre stock **registrado** vs **real**. La merma es una corrección negativa por pérdida física. |

**Ejemplo práctico:**
```
Caso 1: VENTA (SALIDA) ✅
- Stock registrado: 100 → 90
- Stock real: 100 → 90
- ✅ Stock y registro coinciden

Caso 2: MERMA (¿SALIDA?) ❌
- Stock registrado: 100 → 90 (registro de salida)
- Stock real: 90 (producto dañado, no salió)
- ❌ Stock y registro NO coinciden (90 real vs 90 registrado, pero el proceso fue diferente)

Caso 3: MERMA (AJUSTE) ✅
- Stock registrado: 100 → 90 (ajuste negativo)
- Stock real: 90 (se encontró daño en inventario)
- ✅ Stock y registro coinciden después del ajuste
```

**Recomendación:**
```diff
- MERMA (SALIDA) → Eliminar
+ AJU-MERMA (AJUSTE) → Crear o renombrar AJU-DANIO
```

---

### Problema 2: Redundancia en Correcciones

**Estado actual:**
```
ENTRADA:
  - AJUSTE_ENTRADA → "Corrección por conteo físico"

SALIDA:
  - AJUSTE_SALIDA → "Corrección por merma, robo o deterioro"

AJUSTE:
  - AJU-CORRECCION → "Corrección de registros de inventario"
  - AJU-ERROR → "Error en conteo físico"
```

**¿Por qué existen 4 motivos para "corrección"?**

Esto viene de un error de diseño conceptual:

| Motivo | Problema |
|--------|----------|
| `AJUSTE_ENTRADA` | ❌ No debería existir. Si es ajuste, usa tipo AJUSTE. |
| `AJUSTE_SALIDA` | ❌ No debería existir. Si es ajuste, usa tipo AJUSTE. |
| `AJU-CORRECCION` | ⚠️ Demasiado genérico. ¿Qué tipo de corrección? |
| `AJU-ERROR` | ⚠️ Es lo mismo que AJU-CORRECCION. |

**¿Cuál es la diferencia real?**

```
AJU-CORRECCION: "Corrección de registros de inventario"
AJU-ERROR: "Error en conteo físico"
```

**Análisis:**
- **AJU-ERROR** es más específico: dice QUÉ causó la corrección (error de conteo)
- **AJU-CORRECCION** es genérico: solo dice que se corrigió algo

**Recomendación:**
```diff
- AJUSTE_ENTRADA → Eliminar (usar AJU-CONTEO con cantidad positiva)
- AJUSTE_SALIDA → Eliminar (usar motivos específicos como AJU-MERMA)
- AJU-CORRECCION → Eliminar (usar motivos más específicos)
+ AJU-CONTEO → Renombrar AJU-ERROR a esto (más claro)
```

---

### Problema 3: ¿AJU-DANIO vs MERMA vs AJU-VENCIDO?

**Estado actual:**
```
SALIDA:
  - MERMA → "Pérdida por vencimiento o deterioro"

AJUSTE:
  - AJU-DANIO → "Producto dañado o deteriorado"
  - AJU-VENCIDO → "Producto que superó fecha de vencimiento"
```

**Análisis semántico:**

| Motivo | Casos de uso |
|--------|--------------|
| `MERMA` (SALIDA) | "Vencimiento O deterioro" → **Demasiado amplio** |
| `AJU-DANIO` | "Dañado O deteriorado" → **Solapa con MERMA** |
| `AJU-VENCIDO` | "Superó fecha de vencimiento" → **Solapa con MERMA** |

**¿Por qué `AJU-VENCIDO` es necesario?**

Revisé el código y encontré:

```typescript
// purchase-receipts.service.ts
interface CreatePurchaseReceiptItemDto {
  numeroLote?: string;
  fechaVencimiento?: DateTime; // ✅ Sistema maneja lotes con vencimiento
}

// schema.prisma - PurchaseReceiptItem
model PurchaseReceiptItem {
  numeroLote       String?
  fechaVencimiento DateTime? // ✅ Campo existe en BD
}
```

**Conclusión:** El sistema **SÍ maneja productos perecederos** con fechaVencimiento por lote.

**Casos de uso reales:**

1. **Farmacia:** Medicamentos con fecha de vencimiento
2. **Alimentos:** Productos frescos, lácteos, etc.
3. **Químicos:** Reactivos con fecha de caducidad
4. **Cosméticos:** Cremas, perfumes con vencimiento

**Recomendación:**
```diff
- MERMA (SALIDA) → Eliminar
- AJU-DANIO → Renombrar a AJU-MERMA (más claro)
+ AJU-MERMA → "Producto dañado, deteriorado o no vendible"
+ AJU-VENCIDO → Mantener (caso específico con fechaVencimiento)
```

---

## ✅ PROPUESTA DE REORGANIZACIÓN

### Estructura Optimizada (13 motivos vs 16 actuales)

#### 🔵 ENTRADA (4 motivos)
```
✅ ENT-COMPRA          → Compra a proveedor (requiere documento)
✅ ENT-DEVOLUCION      → Devolución de cliente
✅ ENT-PRODUCCION      → Producción interna
✅ ENT-TRANSFERENCIA   → Recepción desde otro almacén
```

#### 🔴 SALIDA (4 motivos)
```
✅ SAL-VENTA           → Venta a cliente (requiere documento)
✅ SAL-DEVOLUCION      → Devolución a proveedor
✅ SAL-TRANSFERENCIA   → Envío a otro almacén
✅ SAL-CONSUMO         → Consumo interno de la empresa
```

#### 🟡 AJUSTE (5 motivos)
```
✅ AJU-CONTEO          → Error en conteo físico (renombrado de AJU-ERROR)
✅ AJU-MERMA           → Daño, deterioro o pérdida física (unifica MERMA + AJU-DANIO)
✅ AJU-VENCIDO         → Producto que superó fecha de vencimiento (mantener)
✅ AJU-ROBO            → Robo o extravío (requiere documento/denuncia)
✅ AJU-SISTEMA         → Ajuste por migración/importación de datos (nuevo)
```

---

## 📊 TABLA COMPARATIVA: ANTES vs DESPUÉS

| Antes (16) | Tipo | Estado | Después (13) | Tipo | Acción |
|------------|------|--------|--------------|------|--------|
| COMPRA | ENTRADA | ✅ | ENT-COMPRA | ENTRADA | Mantener |
| DEVOLUCION_CLIENTE | ENTRADA | ✅ | ENT-DEVOLUCION | ENTRADA | Mantener |
| PRODUCCION | ENTRADA | ✅ | ENT-PRODUCCION | ENTRADA | Mantener |
| TRANSFERENCIA_ENTRADA | ENTRADA | ✅ | ENT-TRANSFERENCIA | ENTRADA | Mantener |
| **AJUSTE_ENTRADA** | ENTRADA | ❌ | - | - | **Eliminar** |
| VENTA | SALIDA | ✅ | SAL-VENTA | SALIDA | Mantener |
| DEVOLUCION_PROVEEDOR | SALIDA | ✅ | SAL-DEVOLUCION | SALIDA | Mantener |
| TRANSFERENCIA_SALIDA | SALIDA | ✅ | SAL-TRANSFERENCIA | SALIDA | Mantener |
| CONSUMO_INTERNO | SALIDA | ✅ | SAL-CONSUMO | SALIDA | Mantener |
| **MERMA** | SALIDA | ❌ | - | - | **Eliminar** (mover a AJUSTE) |
| **AJUSTE_SALIDA** | SALIDA | ❌ | - | - | **Eliminar** |
| **AJU-CORRECCION** | AJUSTE | ❌ | - | - | **Eliminar** (redundante) |
| **AJU-ERROR** | AJUSTE | ⚠️ | **AJU-CONTEO** | AJUSTE | **Renombrar** |
| **AJU-DANIO** | AJUSTE | ⚠️ | **AJU-MERMA** | AJUSTE | **Renombrar** + unificar |
| AJU-VENCIDO | AJUSTE | ✅ | AJU-VENCIDO | AJUSTE | Mantener |
| AJU-ROBO | AJUSTE | ✅ | AJU-ROBO | AJUSTE | Mantener |
| - | - | - | **AJU-SISTEMA** | AJUSTE | **Nuevo** |

**Resumen de cambios:**
- ❌ **Eliminar:** 5 motivos (AJUSTE_ENTRADA, AJUSTE_SALIDA, MERMA, AJU-CORRECCION, AJU-DANIO)
- ✏️ **Renombrar:** 2 motivos (AJU-ERROR → AJU-CONTEO)
- ➕ **Crear:** 2 motivos (AJU-MERMA unificado, AJU-SISTEMA nuevo)
- ✅ **Mantener:** 11 motivos sin cambios

---

## 🎯 JUSTIFICACIÓN DE CADA MOTIVO

### ¿Por qué estos 13 y no otros?

#### 🔵 ENTRADA (4)
```
ENT-COMPRA:
  ✅ Entrada principal del negocio (compras a proveedores)
  ✅ Requiere factura/documento fiscal
  ✅ Incrementa stock y crea cuentas por pagar

ENT-DEVOLUCION:
  ✅ Cliente devuelve producto defectuoso o no deseado
  ✅ Genera nota de crédito o reembolso
  ✅ Restaura stock disponible

ENT-PRODUCCION:
  ✅ Empresas manufactureras fabrican productos
  ✅ Convierte materias primas en productos terminados
  ✅ Incrementa stock sin costo de compra directo

ENT-TRANSFERENCIA:
  ✅ Recepción desde otro almacén propio
  ✅ No cambia stock total, solo redistribuye
  ✅ Requiere orden de transferencia aprobada
```

#### 🔴 SALIDA (4)
```
SAL-VENTA:
  ✅ Salida principal del negocio (ventas a clientes)
  ✅ Requiere factura/boleta
  ✅ Decrementa stock y genera ingresos

SAL-DEVOLUCION:
  ✅ Empresa devuelve compra defectuosa al proveedor
  ✅ Genera nota de crédito del proveedor
  ✅ Decrementa stock y ajusta cuentas por pagar

SAL-TRANSFERENCIA:
  ✅ Envío a otro almacén propio
  ✅ No cambia stock total, solo redistribuye
  ✅ Requiere orden de transferencia aprobada

SAL-CONSUMO:
  ✅ Uso interno de productos (ej: útiles de oficina, muestras)
  ✅ Decrementa stock pero no genera venta
  ✅ Se registra como gasto operativo
```

#### 🟡 AJUSTE (5)
```
AJU-CONTEO:
  ✅ Error humano en registro o conteo físico
  ✅ Diferencia encontrada en inventario cíclico
  ✅ Puede ser positivo (faltó registrar entrada) o negativo (faltó registrar salida)

AJU-MERMA:
  ✅ Pérdida física de producto por daño, deterioro, rotura
  ✅ Producto no vendible pero no vencido
  ✅ Causas: manipulación, transporte, almacenamiento

AJU-VENCIDO:
  ✅ Producto superó su fecha de vencimiento
  ✅ Sistema maneja lotes con fechaVencimiento
  ✅ Aplica a: alimentos, medicamentos, químicos, cosméticos

AJU-ROBO:
  ✅ Producto robado o extraviado
  ✅ Requiere documento (denuncia policial, informe de seguridad)
  ✅ Puede tener implicaciones legales/seguros

AJU-SISTEMA:
  ✅ Ajuste técnico por migración de datos
  ✅ Corrección de errores de sistema/integración
  ✅ NO es error humano de conteo
```

---

## 🚨 IMPACTO DE LOS CAMBIOS

### Análisis de Riesgo

#### ✅ **Bajo Riesgo** (Cambios seguros)
```
➕ Crear AJU-SISTEMA
  → No afecta datos existentes
  → Solo agrega nueva opción

✏️ Renombrar AJU-ERROR → AJU-CONTEO
  → Cambio solo en nombre/descripción
  → Código permanece igual o se actualiza en BD
```

#### ⚠️ **Riesgo Medio** (Requiere migración)
```
❌ Eliminar AJUSTE_ENTRADA
  → Buscar movimientos existentes con este motivo
  → Reasignar a AJU-CONTEO (si cantidad positiva)

❌ Eliminar AJUSTE_SALIDA
  → Buscar movimientos existentes
  → Reasignar según razón: AJU-MERMA o AJU-ROBO
```

#### 🔴 **Alto Riesgo** (Cambio de tipo)
```
❌ Eliminar MERMA (tipo SALIDA)
➕ Crear AJU-MERMA (tipo AJUSTE)
  → Requiere:
    1. Script de migración de datos históricos
    2. Actualizar InventoryMovement.type: SALIDA → AJUSTE
    3. Verificar reports/KPIs que filtran por tipo
    4. Actualizar UI que muestra motivos de SALIDA
```

---

## 📋 PLAN DE IMPLEMENTACIÓN

### Fase 1: Análisis de Impacto (1 hora)
```sql
-- Contar movimientos por motivo actual
SELECT 
  mr.codigo,
  mr.nombre,
  mr.tipo,
  COUNT(im.id) as cant_movimientos
FROM "MovementReason" mr
LEFT JOIN "InventoryMovement" im ON im."reasonId" = mr.id
GROUP BY mr.id, mr.codigo, mr.nombre, mr.tipo
ORDER BY mr.tipo, cant_movimientos DESC;
```

### Fase 2: Crear Nuevos Motivos (30 min)
```sql
-- 1. Crear AJU-SISTEMA
INSERT INTO "MovementReason" (tipo, codigo, nombre, descripcion, requiereDocumento, activo)
VALUES (
  'AJUSTE',
  'AJU-SISTEMA',
  'Ajuste de sistema',
  'Corrección técnica por migración o integración de datos',
  false,
  true
);

-- 2. Crear AJU-MERMA (unificado)
INSERT INTO "MovementReason" (tipo, codigo, nombre, descripcion, requiereDocumento, activo)
VALUES (
  'AJUSTE',
  'AJU-MERMA',
  'Merma operativa',
  'Pérdida física por daño, deterioro, rotura o manipulación',
  false,
  true
);
```

### Fase 3: Migrar Datos Existentes (1 hora)
```sql
-- 3. Migrar movimientos de AJUSTE_ENTRADA a AJU-CONTEO
UPDATE "InventoryMovement"
SET "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJU-CONTEO')
WHERE "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJUSTE_ENTRADA');

-- 4. Migrar movimientos de AJUSTE_SALIDA a AJU-MERMA
UPDATE "InventoryMovement"
SET "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJU-MERMA')
WHERE "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJUSTE_SALIDA');

-- 5. Migrar movimientos de MERMA (SALIDA) a AJU-MERMA (AJUSTE)
-- ⚠️ También cambiar el tipo de movimiento
UPDATE "InventoryMovement"
SET 
  type = 'AJUSTE',
  "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJU-MERMA')
WHERE "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'MERMA');

-- 6. Migrar AJU-DANIO a AJU-MERMA
UPDATE "InventoryMovement"
SET "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJU-MERMA')
WHERE "reasonId" = (SELECT id FROM "MovementReason" WHERE codigo = 'AJU-DANIO');
```

### Fase 4: Renombrar Motivos (15 min)
```sql
-- 7. Renombrar AJU-ERROR a AJU-CONTEO
UPDATE "MovementReason"
SET 
  codigo = 'AJU-CONTEO',
  nombre = 'Error de conteo',
  descripcion = 'Ajuste por diferencia encontrada en conteo físico de inventario'
WHERE codigo = 'AJU-ERROR';

-- 8. Renombrar códigos para seguir convención
UPDATE "MovementReason" SET codigo = 'ENT-COMPRA' WHERE codigo = 'COMPRA';
UPDATE "MovementReason" SET codigo = 'ENT-DEVOLUCION' WHERE codigo = 'DEVOLUCION_CLIENTE';
UPDATE "MovementReason" SET codigo = 'ENT-PRODUCCION' WHERE codigo = 'PRODUCCION';
UPDATE "MovementReason" SET codigo = 'ENT-TRANSFERENCIA' WHERE codigo = 'TRANSFERENCIA_ENTRADA';

UPDATE "MovementReason" SET codigo = 'SAL-VENTA' WHERE codigo = 'VENTA';
UPDATE "MovementReason" SET codigo = 'SAL-DEVOLUCION' WHERE codigo = 'DEVOLUCION_PROVEEDOR';
UPDATE "MovementReason" SET codigo = 'SAL-TRANSFERENCIA' WHERE codigo = 'TRANSFERENCIA_SALIDA';
UPDATE "MovementReason" SET codigo = 'SAL-CONSUMO' WHERE codigo = 'CONSUMO_INTERNO';
```

### Fase 5: Desactivar Motivos Obsoletos (5 min)
```sql
-- 9. Desactivar motivos obsoletos (NO eliminar para mantener historial)
UPDATE "MovementReason"
SET activo = false
WHERE codigo IN (
  'AJUSTE_ENTRADA',
  'AJUSTE_SALIDA',
  'MERMA',
  'AJU-CORRECCION',
  'AJU-DANIO'
);
```

### Fase 6: Actualizar Frontend (30 min)
```typescript
// Actualizar dropdowns y filtros para ocultar motivos inactivos
// Ya implementado: getMovementReasons({ activo: true })
```

### Fase 7: Testing (1 hora)
```
✅ Crear movimiento con cada motivo nuevo
✅ Verificar kardex muestra correctamente
✅ Exportar Excel con motivos renombrados
✅ Alertas de stock usan nuevos motivos
✅ Reportes no se rompen
```

---

## 🎯 RESPUESTAS A PREGUNTAS ORIGINALES

### 1. ¿MERMA debería estar en SALIDA o en AJUSTE?

**Respuesta:** ✅ **AJUSTE**

**Justificación:**
- ❌ SALIDA implica que el producto **sale del almacén** (venta, transferencia, devolución)
- ✅ AJUSTE implica que el producto **dejó de existir** (merma, daño, vencimiento, robo)
- La merma es una **corrección del stock** porque el producto físicamente ya no está disponible
- No es una transacción comercial, es una pérdida operativa

---

### 2. ¿Genera redundancia `AJU-CORRECCION` vs `AJU-ERROR`?

**Respuesta:** ✅ **SÍ, son redundantes**

**Análisis:**
- `AJU-CORRECCION`: "Corrección de registros de inventario" → **Demasiado genérico**
- `AJU-ERROR`: "Error en conteo físico" → **Más específico y claro**

**Solución:**
```diff
- AJU-CORRECCION → Eliminar
- AJU-ERROR → Renombrar a AJU-CONTEO (más descriptivo)
```

---

### 3. ¿Es necesario realmente `AJU-VENCIDO`? ¿Tenemos productos que pueden vencer?

**Respuesta:** ✅ **SÍ, es necesario**

**Evidencia del código:**
```prisma
model PurchaseReceiptItem {
  numeroLote       String?      // ✅ Sistema maneja lotes
  fechaVencimiento DateTime?    // ✅ Campo existe en BD
}
```

**Casos de uso reales:**
1. **Farmacia:** Medicamentos con fecha de caducidad
2. **Alimentos:** Lácteos, carnes, bebidas
3. **Químicos:** Reactivos, solventes
4. **Cosméticos:** Cremas, perfumes
5. **Software:** Licencias con fecha de vencimiento

**Decisión:** ✅ **Mantener AJU-VENCIDO**

---

## ✅ CONCLUSIÓN Y RECOMENDACIÓN FINAL

### Implementar Fase 1 (Segura):
```
✅ Crear AJU-SISTEMA (nuevo motivo)
✅ Renombrar códigos para seguir convención (ENT-*, SAL-*, AJU-*)
✅ Desactivar AJUSTE_ENTRADA y AJUSTE_SALIDA
```

### Posponer Fase 2 (Requiere análisis de impacto):
```
⏸️ Reclasificar MERMA de SALIDA a AJUSTE
⏸️ Unificar AJU-DANIO con nuevo AJU-MERMA
⏸️ Eliminar AJU-CORRECCION
```

**Justificación:**
- La Fase 2 requiere **migración de datos** y puede afectar reportes
- Mejor hacerlo cuando tengamos **tiempo para testing exhaustivo**
- La Fase 1 es **no destructiva** y mejora la claridad inmediatamente

---

**Generado:** 2024-12-09  
**Autor:** GitHub Copilot  
**Módulo:** Inventario - Motivos de Movimiento
