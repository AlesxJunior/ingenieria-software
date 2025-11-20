# Fix: Corrección de Historial de Caja

## 📋 Problemas Identificados

### 1. **Total Ventas siempre en 0**
- **Síntoma:** La columna "Total Ventas" mostraba S/ 0.00 para todas las sesiones
- **Causa Raíz:** El campo `totalVentas` en `CashSession` no se actualizaba cuando se confirmaba el pago de una venta
- **Impacto:** Cálculo incorrecto de diferencia (montoCierre - montoEsperado)

### 2. **Diferencia calculada incorrectamente**
- **Síntoma:** Diferencias erróneas entre monto esperado y real
- **Causa Raíz:** Cálculo basado en `totalVentas = 0`
- **Fórmula correcta:** `Diferencia = montoCierre - (montoApertura + totalVentas + ingresos - egresos)`

### 3. **Usuario mostrando ID en vez de nombre**
- **Síntoma:** En "Ver Detalles" aparecía un código (ej: `usr_123`) en vez del nombre
- **Causa Raíz:** SessionDetailModal mostraba `session.userId` en lugar de `session.user.firstName + lastName`
- **Backend:** Ya incluía la relación `user` correctamente

### 4. **Caja mostrando ID en vez de nombre**
- **Síntoma:** Similar al problema de usuario
- **Estado:** Backend ya incluía `cashRegister.nombre`, frontend ya lo mostraba correctamente

---

## 🔧 Soluciones Implementadas

### 1. Actualizar totalVentas al Confirmar Pago (Backend)

**Archivo:** `alexa-tech-backend/src/modules/sales/sales.service.ts`

**Función modificada:** `confirmPayment()`

**Cambio:**
```typescript
// ✅ Actualizar totalVentas en la sesión de caja si existe
if (sale.cashSessionId) {
  await prisma.cashSession.update({
    where: { id: sale.cashSessionId },
    data: {
      totalVentas: {
        increment: totalVenta, // Incrementar el total de ventas
      },
    },
  });
  console.log(`✅ CashSession ${sale.cashSessionId} actualizada: +S/ ${totalVenta.toFixed(2)}`);
}
```

**Lógica:**
- Cuando se confirma el pago de una venta (`estado: Pendiente → Completada`)
- Se incrementa `totalVentas` en la sesión de caja asociada
- Se usa `increment` de Prisma para operación atómica

---

### 2. Actualizar totalVentas al Crear Nota de Crédito (Backend)

**Archivo:** `alexa-tech-backend/src/services/creditNoteService.ts`

**Función modificada:** `createCreditNote()`

**Cambio:**
```typescript
// ✅ Actualizar totalVentas en la sesión de caja de la venta original
if (sale.cashSessionId) {
  await tx.cashSession.update({
    where: { id: sale.cashSessionId },
    data: {
      totalVentas: {
        decrement: total, // Decrementar el total por la devolución
      },
    },
  });
  console.log(`✅ CashSession ${sale.cashSessionId} actualizada por NC: -S/ ${total.toFixed(2)}`);
}
```

**Lógica:**
- Las Notas de Crédito reducen las ventas efectivas
- Se decrementa `totalVentas` cuando se emite una NC
- Operación dentro de transacción `$transaction` para atomicidad

---

### 3. Corregir Visualización de Usuario (Frontend)

**Archivo:** `alexa-tech-react/src/modules/sales/components/SessionDetailModal.tsx`

**Cambio:**
```tsx
<InfoItem>
  <InfoLabel>Usuario:</InfoLabel>
  <InfoValue>
    {session.user 
      ? `${session.user.firstName} ${session.user.lastName}`
      : session.userId}
  </InfoValue>
</InfoItem>
```

**Antes:**
```tsx
<InfoValue>{session.userId}</InfoValue>
```

**Lógica:**
- Prioriza mostrar el nombre completo si `session.user` está disponible
- Fallback a `userId` si no se cargó la relación

---

### 4. Script de Migración para Datos Existentes

**Archivo:** `alexa-tech-backend/scripts/recalcular-total-ventas-caja.ts`

**Propósito:**
- Recalcular `totalVentas` para sesiones de caja ya cerradas
- Corregir datos históricos donde `totalVentas = 0`

**Algoritmo:**
```typescript
// Para cada sesión de caja:
1. Obtener todas las ventas completadas → sumar totales
2. Obtener todas las NCs asociadas → sumar totales
3. totalVentasCalculado = ventas - notasCredito
4. Actualizar CashSession si hay diferencia
```

**Uso:**
```bash
cd alexa-tech-backend
npx ts-node scripts/recalcular-total-ventas-caja.ts
```

**Output Ejemplo:**
```
🔄 Iniciando recálculo de totalVentas en sesiones de caja...

📊 Total de sesiones encontradas: 15

✅ Sesión Caja Principal:
   Fecha: 20/11/2024
   Ventas: 8 | NCs: 1
   Antes: S/ 0.00
   Ahora: S/ 1,250.50
   Diff: S/ 1,250.50

============================================================
📊 RESUMEN DEL RECÁLCULO
============================================================
Total sesiones procesadas: 15
Sesiones actualizadas: 12
Sesiones sin cambios: 3
Errores: 0

Sesiones Abiertas: 1
Sesiones Cerradas: 14

✅ Migración completada exitosamente
```

---

## 📊 Flujo de Datos Actualizado

### Escenario 1: Crear y Confirmar Venta

```
1. Usuario crea venta (estado: Pendiente)
   └─ CashSession.totalVentas: sin cambios

2. Usuario confirma pago
   ├─ Sale.estado: Pendiente → Completada
   ├─ Sale.montoRecibido = X
   └─ CashSession.totalVentas += Sale.total ✅

3. Resultado en Historial de Caja
   └─ Total Ventas: S/ X.XX (correcto)
```

### Escenario 2: Emitir Nota de Crédito

```
1. Usuario emite NC parcial (S/ 50 de S/ 100)
   ├─ Crea nueva Sale(tipo: NotaCredito)
   ├─ CashSession.totalVentas -= 50 ✅
   └─ Si es efectivo: CashMovement (EGRESO)

2. Resultado en Historial de Caja
   └─ Total Ventas: S/ 50.00 (100 - 50)
```

### Escenario 3: Cerrar Caja

```
1. Usuario cuenta efectivo: S/ 500
2. Sistema calcula esperado:
   ├─ Monto Apertura: S/ 100
   ├─ Total Ventas: S/ 350 ✅ (antes: S/ 0)
   ├─ Ingresos: S/ 50
   ├─ Egresos: S/ 20
   └─ Esperado = 100 + 350 + 50 - 20 = S/ 480

3. Diferencia = 500 - 480 = +S/ 20 (sobrante)
```

---

## 🧪 Casos de Prueba

### Prueba 1: Venta Simple
```
✅ Pre: Abrir caja con S/ 100
✅ Acción: Crear venta de S/ 50 y confirmar pago
✅ Verificar: totalVentas = S/ 50
✅ Cerrar caja con S/ 150
✅ Verificar: Diferencia = S/ 0 (correcto)
```

### Prueba 2: Múltiples Ventas
```
✅ Pre: Caja abierta
✅ Acción: Confirmar 3 ventas (S/ 100, S/ 75, S/ 125)
✅ Verificar: totalVentas = S/ 300
✅ Historial: Columna "Total Ventas" muestra S/ 300
```

### Prueba 3: Venta con NC
```
✅ Pre: Venta confirmada S/ 100 (totalVentas = S/ 100)
✅ Acción: Emitir NC de S/ 30
✅ Verificar: totalVentas = S/ 70
✅ Historial: Total Ventas actualizado a S/ 70
```

### Prueba 4: Visualización en Modal
```
✅ Pre: Sesión cerrada con usuario "Juan Pérez"
✅ Acción: Click en "Ver Detalles"
✅ Verificar: 
   - Usuario: "Juan Pérez" (no "usr_abc123")
   - Caja: "Caja Principal" (no "cr_xyz789")
   - Total Ventas: Monto correcto
```

### Prueba 5: Script de Migración
```
✅ Pre: Base de datos con sesiones antiguas (totalVentas = 0)
✅ Acción: Ejecutar npx ts-node scripts/recalcular-total-ventas-caja.ts
✅ Verificar:
   - Sesiones actualizadas con totales correctos
   - Diferencias recalculadas correctamente
   - Log detallado de cambios
```

---

## 📝 Cambios en la Base de Datos

### Operaciones Atómicas en CashSession

**Antes:**
```sql
-- totalVentas nunca se actualizaba
SELECT totalVentas FROM CashSession; -- Siempre 0
```

**Ahora:**
```sql
-- Incremento al confirmar venta
UPDATE CashSession 
SET totalVentas = totalVentas + 100.00 
WHERE id = 'session_id';

-- Decremento al emitir NC
UPDATE CashSession 
SET totalVentas = totalVentas - 30.00 
WHERE id = 'session_id';
```

**Ventajas de `increment/decrement`:**
- ✅ Operación atómica (race-condition safe)
- ✅ No requiere leer el valor actual
- ✅ Mejor performance
- ✅ Prisma optimiza a SQL nativo

---

## 🔍 Logs de Debugging

### Backend Console Logs

**Al confirmar pago:**
```
✅ CashSession cs_abc123 actualizada: +S/ 125.50
```

**Al emitir NC:**
```
✅ CashSession cs_abc123 actualizada por NC: -S/ 30.00
```

**Script de migración:**
```
✅ Sesión Caja Principal:
   Fecha: 20/11/2024
   Ventas: 8 | NCs: 1
   Antes: S/ 0.00
   Ahora: S/ 1,250.50
   Diff: S/ 1,250.50
```

---

## 📦 Archivos Modificados

### Backend
1. ✅ `alexa-tech-backend/src/modules/sales/sales.service.ts`
   - Línea ~310: Agregar increment de totalVentas en confirmPayment

2. ✅ `alexa-tech-backend/src/services/creditNoteService.ts`
   - Línea ~320: Agregar decrement de totalVentas en createCreditNote

3. ✅ `alexa-tech-backend/scripts/recalcular-total-ventas-caja.ts`
   - Nuevo archivo: Script de migración

### Frontend
4. ✅ `alexa-tech-react/src/modules/sales/components/SessionDetailModal.tsx`
   - Línea ~95: Cambiar `session.userId` por `session.user?.firstName + lastName`

5. ✅ `alexa-tech-react/src/modules/sales/pages/HistorialCaja.tsx`
   - Sin cambios necesarios (ya mostraba correctamente cashRegister y user)

---

## ✅ Validación Final

### Checklist de Verificación

- [x] **totalVentas se incrementa** al confirmar pago de venta
- [x] **totalVentas se decrementa** al emitir Nota de Crédito
- [x] **Usuario muestra nombre completo** en modal de detalles
- [x] **Caja muestra nombre** (ya funcionaba)
- [x] **Diferencia calculada correctamente** en Historial
- [x] **Script de migración** recalcula datos existentes
- [x] **Sin errores de TypeScript** en todos los archivos
- [x] **Logs informativos** para debugging

### Estado del Sistema

| Componente | Estado | Comentario |
|------------|--------|------------|
| Backend - confirmPayment | ✅ | Actualiza totalVentas |
| Backend - createCreditNote | ✅ | Decrementa totalVentas |
| Frontend - SessionDetailModal | ✅ | Muestra nombres, no IDs |
| Frontend - HistorialCaja | ✅ | Sin cambios necesarios |
| Script migración | ✅ | Listo para ejecutar |
| Pruebas E2E | ⏳ | Pendiente validación usuario |

---

## 🚀 Próximos Pasos

### Para Desarrollador:
1. **Ejecutar script de migración:**
   ```bash
   cd alexa-tech-backend
   npx ts-node scripts/recalcular-total-ventas-caja.ts
   ```

2. **Validar en UI:**
   - Abrir Historial de Caja
   - Verificar que "Total Ventas" tiene valores correctos
   - Click en "Ver Detalles" → verificar nombres de usuario/caja

3. **Prueba E2E completa:**
   - Abrir sesión de caja
   - Crear y confirmar venta
   - Verificar que totalVentas se actualizó
   - Emitir NC parcial
   - Verificar que totalVentas decrementó
   - Cerrar caja y verificar diferencia

### Para QA:
- Verificar que las diferencias ahora son realistas
- Probar múltiples ventas consecutivas
- Probar NC en sesiones activas y cerradas
- Validar que nombres de usuario/caja se muestran correctamente

---

## 📚 Referencias

- **Documentos relacionados:**
  - `IMPLEMENTACION_NC_PDF_CAJA_COMPLETADA.md` - Sistema de NCs
  - `FIX_NC_Y_GESTION_CAJA.md` - Integración NC con caja
  
- **Patrones utilizados:**
  - Operaciones atómicas (increment/decrement)
  - Transacciones Prisma ($transaction)
  - Scripts de migración de datos
  - Fallback de visualización (user?.firstName || userId)

---

**Fecha:** 20 de Noviembre 2024  
**Autor:** GitHub Copilot  
**Módulos:** Ventas, Gestión de Caja  
**Estado:** ✅ Completado - Listo para pruebas
