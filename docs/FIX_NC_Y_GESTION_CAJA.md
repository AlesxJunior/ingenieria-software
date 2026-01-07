# 💰 Análisis: Notas de Crédito y Gestión de Caja

**Fecha:** 12 de noviembre de 2025  
**Problema Identificado:** NC NO genera movimiento de caja (no hay salida automática de dinero)  
**Contexto:** Las NC son documentos contables, no reembolsos inmediatos

---

## 🔍 Situación Actual

### **Cuando se emite una NC:**
1. ✅ Se revierte el inventario (productos regresan al almacén)
2. ✅ Se genera el documento contable (NC)
3. ❌ **NO se afecta la caja** (no hay salida de dinero)

### **Problema:**
```
Cliente compra: S/ 1,000 → Ingresa a caja
Cliente devuelve con NC: S/ 1,000
  → Stock regresa ✅
  → NC emitida ✅  
  → Caja NO se actualiza ❌ (sigue mostrando S/ 1,000)
```

---

## 💡 La Realidad del Negocio (Perú)

### **Nota de Crédito ≠ Reembolso Inmediato**

Una NC es un **documento contable** que reconoce:
- ✅ Una deuda a favor del cliente
- ✅ Un crédito que puede aplicarse después
- ❌ NO es dinero que sale de caja inmediatamente

### **Flujos Posibles:**

#### **Opción 1: Cliente no pide el dinero aún**
```
1. Se emite NC por S/ 1,000
2. Cliente tiene crédito a favor
3. Caja NO se afecta (dinero aún en caja)
4. Cliente decide después qué hacer con su crédito
```

#### **Opción 2: Cliente pide reembolso inmediato**
```
1. Se emite NC por S/ 1,000
2. Cliente pide dinero en efectivo
3. Cajero hace movimiento manual: EGRESO S/ 1,000
4. Motivo: "Reembolso por NC-0001"
5. Ahora SÍ sale dinero de caja
```

#### **Opción 3: Cliente usa crédito en compra futura**
```
1. Cliente tiene NC por S/ 1,000
2. Hace compra nueva por S/ 1,500
3. Aplica NC → Solo paga S/ 500
4. INGRESO a caja: S/ 500 (no S/ 1,500)
5. Se marca NC como "Aplicada"
```

---

## 🎯 Solución Propuesta

### **Fase 1: Control de NC sin movimiento automático (ACTUAL)**

**Flujo:**
```
Cuando se emite NC:
1. Se crea el documento NC ✅
2. Se revierte inventario ✅
3. NO se afecta la caja ❌
4. Cajero hace movimiento MANUAL si cliente pide reembolso
```

**Ventajas:**
- ✅ Simple de implementar (ya está así)
- ✅ Flexible (cajero decide cuándo sale dinero)
- ✅ Realista (NC ≠ reembolso inmediato)

**Desventajas:**
- ❌ Requiere disciplina del cajero
- ❌ Fácil olvidar el movimiento manual
- ❌ Descuadre entre NC y caja

---

### **Fase 2: Modal de Reembolso al emitir NC (RECOMENDADO)**

**Flujo mejorado:**
```
Cuando se emite NC:
1. Modal de confirmación: "¿Cliente solicita reembolso ahora?"
   
   [SÍ, reembolsar ahora] → Continúa a paso 2
   [NO, solo crédito] → Solo emite NC (paso 5)

2. Modal: "¿Forma de reembolso?"
   - Efectivo
   - Transferencia
   - Cheque
   - Aplicar a próxima compra

3. Si elige "Efectivo":
   - Se emite NC
   - Se crea movimiento de caja AUTOMÁTICO:
     * Tipo: EGRESO
     * Monto: Total NC
     * Motivo: "Reembolso por NC-XXXX"
     * Usuario: cajero actual

4. Si elige "Transferencia/Cheque":
   - Se emite NC
   - NO se afecta caja
   - Se registra: "Pendiente de pago bancario"

5. Si elige "No, solo crédito":
   - Se emite NC
   - Estado: "Pendiente de aplicar"
   - NO se afecta caja
```

**Ventajas:**
- ✅ Claridad en el momento
- ✅ Movimiento de caja automático (si aplica)
- ✅ Trazabilidad completa
- ✅ Previene olvidos

---

### **Fase 3: Sistema de Aplicación de NC (FUTURO)**

**Funcionalidades adicionales:**

1. **Lista de NC Pendientes**
   ```
   - NC no aplicadas
   - Monto disponible
   - Cliente
   - Fecha de emisión
   ```

2. **Aplicar NC en Nueva Venta**
   ```
   Al realizar venta:
   - Sistema detecta si cliente tiene NC pendientes
   - Pregunta: "¿Aplicar NC-0001 (S/ 500)?"
   - Descuenta del total
   - Marca NC como "Aplicada parcial/total"
   ```

3. **Reportes de NC**
   ```
   - NC pendientes por aplicar
   - NC reembolsadas (con mov. caja)
   - NC aplicadas en ventas
   - Total créditos a favor de clientes
   ```

---

## 🔧 Implementación Propuesta (Fase 2)

### **Cambios Necesarios:**

#### **1. Schema (Agregar estado a NC)**
```prisma
model Sale {
  ...
  creditNoteStatus  String?  // "Pendiente" | "Reembolsada" | "Aplicada" | null
  creditNotePaymentMethod String? // "Efectivo" | "Transferencia" | "Credito" | null
  ...
}
```

#### **2. Backend: Endpoint de Reembolso**
```typescript
POST /api/credit-notes/:id/refund
Body: {
  method: "Efectivo" | "Transferencia" | "Cheque",
  cashSessionId?: string // Si es efectivo
}

Lógica:
1. Validar que NC existe y no está reembolsada
2. Si method === "Efectivo":
   - Crear CashMovement (EGRESO)
   - Actualizar creditNoteStatus = "Reembolsada"
3. Si method === "Transferencia":
   - Solo actualizar estado
   - NO crear movimiento de caja
```

#### **3. Frontend: Modal de Reembolso**
```tsx
// Al emitir NC, preguntar:
<ModalReembolso>
  <h3>Nota de Crédito Emitida</h3>
  <p>NC-0001 por S/ 1,000</p>
  
  <Question>¿El cliente solicita reembolso ahora?</Question>
  
  <Options>
    <Radio value="efectivo">Sí, reembolsar en efectivo</Radio>
    <Radio value="transferencia">Sí, transferencia bancaria</Radio>
    <Radio value="credito">No, solo generar crédito</Radio>
  </Options>
  
  {selected === "efectivo" && (
    <Alert>
      ⚠️ Se registrará EGRESO de S/ 1,000 en la caja actual
    </Alert>
  )}
  
  <Actions>
    <Button onClick={handleConfirm}>Confirmar</Button>
    <Button onClick={handleCancel}>Cancelar</Button>
  </Actions>
</ModalReembolso>
```

#### **4. GestionCaja: Mostrar Reembolsos**
```tsx
// En lista de movimientos
<MovementsTable>
  <tr>
    <td>🔴 EGRESO</td>
    <td>Reembolso por NC-0001</td>
    <td>S/ -1,000</td>
    <td>12/11/2025 14:30</td>
  </tr>
</MovementsTable>
```

---

## 📊 Comparación de Enfoques

| Aspecto | Fase 1 (Manual) | Fase 2 (Recomendado) | Fase 3 (Avanzado) |
|---------|----------------|---------------------|-------------------|
| **Movimiento automático** | ❌ | ✅ (opcional) | ✅ |
| **Prevención de olvidos** | ❌ | ✅ | ✅ |
| **Aplicar NC en ventas** | ❌ | ❌ | ✅ |
| **Reportes completos** | ❌ | ⚠️ Básicos | ✅ |
| **Complejidad** | Baja | Media | Alta |
| **Tiempo implementación** | Ya está | 2-3 horas | 1-2 días |

---

## 🎯 Recomendación Inmediata

### **Para el Sistema Actual:**

1. **Documentar claramente el flujo:**
   ```
   Al emitir NC:
   1. Sistema emite NC y revierte stock
   2. Cajero DEBE hacer movimiento manual si cliente pide reembolso:
      - Ir a Gestión de Caja
      - Click "Egreso"
      - Monto: Total de la NC
      - Motivo: "Reembolso NC-XXXX"
   ```

2. **Agregar alerta en el modal de NC:**
   ```tsx
   <AlertBox type="warning">
     ⚠️ Recuerda: Si el cliente solicita reembolso en efectivo,
     debes registrar un EGRESO manual en Gestión de Caja.
   </AlertBox>
   ```

3. **Capacitar usuarios:**
   - NC ≠ Reembolso automático
   - Siempre preguntar al cliente qué desea hacer
   - Registrar mov. de caja cuando salga dinero

### **Para Futuro (Fase 2):**

Implementar modal de reembolso (2-3 horas de trabajo):
- ✅ Pregunta en el momento
- ✅ Movimiento automático si elige efectivo
- ✅ Estado de NC claro
- ✅ Previene errores

---

## ✅ Próximos Pasos

**Inmediato (hoy):**
1. Agregar AlertBox en ModalNotaCredito
2. Documentar flujo manual en README

**Corto plazo (esta semana):**
3. Implementar Fase 2 (modal de reembolso)
4. Agregar campo creditNoteStatus al schema
5. Crear endpoint de reembolso

**Mediano plazo (próximo sprint):**
6. Sistema de aplicación de NC en ventas
7. Reportes de NC pendientes
8. Dashboard de créditos a favor

---

**Conclusión:**  
El sistema actual es **funcionalmente correcto** (NC no debería afectar caja automáticamente), pero puede mejorarse con un **modal de reembolso** que pregunte al usuario qué hacer con el crédito en el momento de emisión.

---

**Documentado por:** GitHub Copilot  
**Decisión final:** Usuario
