# Flujo de Estados - Módulo de Compras

## 📊 Diagrama de Flujo de Estados

```
PENDIENTE (Creada)
    ↓
    ├─→ ENVIADA (Enviada al proveedor)
    │       ↓
    │       └─→ CONFIRMADA (Proveedor confirma)
    │               ↓
    │               └─→ EN_RECEPCION (Llega producto, crear recepción)
    │                       ↓
    │                       ├─→ PARCIAL (Recepción parcial)
    │                       │       ↓
    │                       │       └─→ (loop) EN_RECEPCION
    │                       └─→ COMPLETADA (Todo recibido)
    │                               ↓
    │                               └─→ CERRADA (Proceso finalizado)
    └─→ CANCELADA (Cualquier momento desde PENDIENTE/ENVIADA)
```

## 🔄 Transiciones de Estado Permitidas

| Estado Actual | Puede cambiar a | Acción | Restricciones |
|---------------|----------------|--------|---------------|
| **PENDIENTE** | ENVIADA | Enviar a Proveedor | - |
| **PENDIENTE** | CANCELADA | Cancelar Orden | - |
| **ENVIADA** | CONFIRMADA | Confirmar Orden | - |
| **ENVIADA** | CANCELADA | Cancelar Orden | - |
| **CONFIRMADA** | EN_RECEPCION | Iniciar Recepción | Requiere crear recepción |
| **EN_RECEPCION** | PARCIAL | Recepción Parcial | Cantidad recibida < cantidad ordenada |
| **EN_RECEPCION** | COMPLETADA | Finalizar Recepción | Cantidad recibida = cantidad ordenada |
| **PARCIAL** | EN_RECEPCION | Nueva Recepción | Crear nueva recepción |
| **PARCIAL** | COMPLETADA | Última Recepción | Completar todas las cantidades |
| **COMPLETADA** | CERRADA | Cerrar Orden | Proceso finalizado |

## 🚫 Estados Bloqueados (No permiten cambios)

- **CANCELADA**: Estado final, no se puede modificar
- **CERRADA**: Estado final, proceso completado

## 📋 Acciones por Estado

### PENDIENTE
- ✅ **Editar orden** (productos, cantidades, precios)
- ✅ **Enviar a proveedor** → ENVIADA
- ✅ **Cancelar** → CANCELADA
- ✅ **Eliminar orden**
- ✅ **Generar PDF**

### ENVIADA
- ❌ **Editar orden** (solo observaciones)
- ✅ **Confirmar orden** → CONFIRMADA
- ✅ **Cancelar** → CANCELADA
- ✅ **Generar PDF**

### CONFIRMADA
- ❌ **Editar orden**
- ✅ **Crear recepción** → EN_RECEPCION
- ❌ **Cancelar** (ya confirmada)
- ✅ **Generar PDF**

### EN_RECEPCION
- ❌ **Editar orden**
- ✅ **Ver recepciones asociadas**
- ✅ **Completar recepción** → COMPLETADA o PARCIAL
- ✅ **Generar PDF**

### PARCIAL
- ❌ **Editar orden**
- ✅ **Crear nueva recepción** → EN_RECEPCION
- ✅ **Ver recepciones asociadas**
- ✅ **Generar PDF**

### COMPLETADA
- ❌ **Editar orden**
- ✅ **Cerrar orden** → CERRADA
- ✅ **Ver recepciones asociadas**
- ✅ **Generar PDF**

### CERRADA
- ❌ **Editar orden**
- ✅ **Ver recepciones asociadas**
- ✅ **Generar PDF**

### CANCELADA
- ❌ **Editar orden**
- ❌ **Cambiar estado**
- ✅ **Generar PDF**

## 🎯 Botones de Acción Según Estado

### Vista Lista (PurchaseOrderList)

| Estado | Botones Visibles |
|--------|-----------------|
| PENDIENTE | Ver \| Editar \| PDF \| **Enviar a Proveedor** \| Eliminar |
| ENVIADA | Ver \| PDF \| **Confirmar Orden** \| Cancelar |
| CONFIRMADA | Ver \| PDF \| **Crear Recepción** |
| EN_RECEPCION | Ver \| PDF \| Ver Recepciones |
| PARCIAL | Ver \| PDF \| Ver Recepciones \| **Nueva Recepción** |
| COMPLETADA | Ver \| PDF \| Ver Recepciones \| **Cerrar Orden** |
| CERRADA | Ver \| PDF \| Ver Recepciones |
| CANCELADA | Ver \| PDF |

### Vista Detalle (PurchaseOrderDetail)

| Estado | Botones Visibles |
|--------|-----------------|
| PENDIENTE | PDF \| **→ Enviar** \| Cancelar \| Cerrar |
| ENVIADA | PDF \| **→ Confirmar** \| Cancelar \| Cerrar |
| CONFIRMADA | PDF \| **→ Crear Recepción** \| Cerrar |
| EN_RECEPCION | PDF \| Ver Recepciones \| Cerrar |
| PARCIAL | PDF \| Ver Recepciones \| **→ Nueva Recepción** \| Cerrar |
| COMPLETADA | PDF \| Ver Recepciones \| **→ Cerrar Orden** \| Cerrar |
| CERRADA | PDF \| Ver Recepciones \| Cerrar |
| CANCELADA | PDF \| Cerrar |

## 🔗 Relación Orden - Recepción

### Validaciones Automáticas

1. **Crear Recepción:**
   - ✅ Solo si estado = CONFIRMADA, EN_RECEPCION o PARCIAL
   - ✅ Validar productos pendientes
   - ✅ Cantidad a recibir ≤ cantidad pendiente

2. **Cambio Automático de Estado:**
   - Si cantidad recibida < cantidad ordenada → PARCIAL
   - Si cantidad recibida = cantidad ordenada → COMPLETADA
   - Al crear primera recepción → EN_RECEPCION

3. **Cálculo de Cantidades:**
   ```
   cantidadPendiente = cantidadOrdenada - cantidadRecibida
   cantidadRecibida = Σ(todas las recepciones confirmadas)
   ```

## 📊 Colores de Estado (UI)

| Estado | Color | Hexadecimal | Significado |
|--------|-------|-------------|-------------|
| PENDIENTE | Amarillo | #ffc107 | Esperando acción |
| ENVIADA | Cyan | #17a2b8 | En tránsito |
| CONFIRMADA | Azul | #007bff | Confirmado |
| EN_RECEPCION | Púrpura | #6f42c1 | Procesando |
| PARCIAL | Naranja | #fd7e14 | Incompleto |
| COMPLETADA | Verde | #28a745 | Exitoso |
| CERRADA | Gris | #6c757d | Finalizado |
| CANCELADA | Rojo | #dc3545 | Cancelado |

## 🧪 Testing del Flujo

### Test Case 1: Flujo Completo Exitoso
```
1. Crear orden → PENDIENTE
2. Enviar a proveedor → ENVIADA
3. Proveedor confirma → CONFIRMADA
4. Crear recepción (100%) → EN_RECEPCION → COMPLETADA
5. Cerrar orden → CERRADA
```

### Test Case 2: Flujo con Recepciones Parciales
```
1. Crear orden (100 unidades) → PENDIENTE
2. Enviar a proveedor → ENVIADA
3. Proveedor confirma → CONFIRMADA
4. Recepción 1 (50 unidades) → EN_RECEPCION → PARCIAL
5. Recepción 2 (30 unidades) → EN_RECEPCION → PARCIAL
6. Recepción 3 (20 unidades) → EN_RECEPCION → COMPLETADA
7. Cerrar orden → CERRADA
```

### Test Case 3: Cancelación
```
1. Crear orden → PENDIENTE
2. Cancelar → CANCELADA (estado final)
```

### Test Case 4: Cancelación Después de Enviar
```
1. Crear orden → PENDIENTE
2. Enviar → ENVIADA
3. Cancelar → CANCELADA (antes de confirmar)
```

## 🚀 Próximos Pasos de Implementación

1. ✅ Mejorar diseño de filtros (tabs horizontales)
2. ✅ Botones de acción con nombres de estado destino
3. ✅ Validar transiciones de estado en backend
4. ✅ Implementar lógica de recepciones
5. ✅ Testing E2E completo con logs
