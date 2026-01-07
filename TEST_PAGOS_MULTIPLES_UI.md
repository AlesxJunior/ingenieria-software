# ✅ Pruebas de Pagos Múltiples - UI Completa

## 🎯 Objetivo
Verificar que la funcionalidad de pagos múltiples funciona correctamente tanto en frontend como backend.

---

## 📋 Checklist de Pruebas

### ✅ Fase 1: Verificación Visual
- [ ] Abrir módulo "Realizar Venta"
- [ ] Verificar que existe checkbox "💳 Usar múltiples métodos de pago"
- [ ] Activar el checkbox
- [ ] Verificar que aparece sección de "Métodos de Pago"
- [ ] Verificar que el campo "Tipo de Pago" se deshabilita
- [ ] Verificar que hay un pago inicial (Efectivo)

### ✅ Fase 2: Agregar Productos
- [ ] Buscar y agregar 2-3 productos al carrito
- [ ] Verificar que el total se calcula correctamente
- [ ] Ejemplo: Total = S/ 250.00

### ✅ Fase 3: Configurar Pagos Múltiples

#### Test Case 1: Dos Pagos (Efectivo + Tarjeta)
```
Pago #1:
  Método: Efectivo
  Monto: 150.00
  Referencia: -
  Observaciones: -

Pago #2:
  Método: Tarjeta
  Monto: 100.00
  Referencia: OP-123456
  Observaciones: Visa débito
```

**Verificaciones:**
- [ ] Suma de pagos = S/ 250.00
- [ ] Indicador muestra "✅ Correcto" en verde
- [ ] Fondo verde en el resumen

#### Test Case 2: Tres Pagos (Yape + Efectivo + Transferencia)
```
Total de la venta: S/ 350.00

Pago #1:
  Método: Yape
  Monto: 150.00
  Referencia: YP-789456
  Observaciones: Cliente principal

Pago #2:
  Método: Efectivo
  Monto: 100.00
  Referencia: -
  Observaciones: -

Pago #3:
  Método: Transferencia
  Monto: 100.00
  Referencia: TRF-2024-001
  Observaciones: BCP
```

**Verificaciones:**
- [ ] Suma de pagos = S/ 350.00
- [ ] Indicador muestra "✅ Correcto"
- [ ] Puede procesar la venta

#### Test Case 3: Validación de Monto Incorrecto
```
Total de la venta: S/ 200.00

Pago #1:
  Método: Efectivo
  Monto: 100.00

Pago #2:
  Método: Tarjeta
  Monto: 50.00

Suma: S/ 150.00 (Falta S/ 50.00)
```

**Verificaciones:**
- [ ] Resumen muestra fondo rojo
- [ ] Indica "Falta: S/ 50.00"
- [ ] Al intentar procesar, muestra error: "La suma de los pagos debe ser igual al total"

#### Test Case 4: Validación de Exceso
```
Total de la venta: S/ 200.00

Pago #1:
  Método: Efectivo
  Monto: 150.00

Pago #2:
  Método: Tarjeta
  Monto: 100.00

Suma: S/ 250.00 (Exceso: S/ 50.00)
```

**Verificaciones:**
- [ ] Resumen muestra fondo rojo
- [ ] Indica "Exceso: S/ 50.00"
- [ ] Al intentar procesar, muestra error

### ✅ Fase 4: Procesamiento de Venta

#### Test Case 5: Procesar Venta con Pagos Múltiples
1. Configurar pagos que sumen exactamente el total
2. Click en "Procesar Venta"
3. Verificar modal de confirmación muestra:
   ```
   ¿Confirmar venta?

   Productos: 3
   Subtotal: S/ 211.86
   IGV (18%): S/ 38.14
   Total: S/ 250.00

   Comprobante: Boleta
   Pagos:
     1. Efectivo: S/ 150.00
     2. Tarjeta: S/ 100.00
   ```

**Verificaciones:**
- [ ] Modal muestra desglose de pagos
- [ ] Click en "Aceptar"
- [ ] NO muestra modal de "Monto Recibido" (se salta directamente)
- [ ] Venta se completa automáticamente
- [ ] Navega a lista de ventas
- [ ] Carrito se limpia
- [ ] Pagos múltiples se resetean

### ✅ Fase 5: Verificación en Backend

#### Verificar en Base de Datos
```sql
-- Ver última venta creada
SELECT * FROM sales ORDER BY "createdAt" DESC LIMIT 1;

-- Ver pagos asociados
SELECT * FROM sale_payments WHERE "saleId" = '<ID_DE_VENTA>' ORDER BY orden;
```

**Verificaciones:**
- [ ] Venta tiene `formaPago` = primer método de pago (Efectivo)
- [ ] Tabla `sale_payments` tiene 2-3 registros
- [ ] Cada pago tiene: `metodoPago`, `monto`, `referencia`, `orden`
- [ ] Suma de montos = total de venta

#### Test API Directo
```bash
# En ingenieria-software/
node test-pagos-multiples.js
```

**Verificaciones:**
- [ ] Test 1: Pago simple (backward compatible) ✅
- [ ] Test 2: Dos pagos múltiples ✅
- [ ] Test 3: Tres pagos (Yape + Efectivo) ✅
- [ ] Test 4: Validación rechaza suma incorrecta ✅

### ✅ Fase 6: Backward Compatibility

#### Test Case 6: Pago Simple (Sin usar checkbox)
1. NO activar "Usar múltiples métodos de pago"
2. Seleccionar "Efectivo" en "Tipo de Pago"
3. Agregar productos (Total: S/ 150.00)
4. Procesar venta
5. Modal muestra "Monto Recibido"
6. Ingresar S/ 150.00
7. Confirmar pago

**Verificaciones:**
- [ ] Venta se procesa normalmente
- [ ] Modal de pago funciona correctamente
- [ ] Backend registra venta con `formaPago: "Efectivo"`
- [ ] NO crea registros en `sale_payments`
- [ ] Funcionalidad anterior sigue funcionando

### ✅ Fase 7: Operaciones con Pagos Múltiples

#### Test Case 7: Agregar/Eliminar Pagos
1. Activar pagos múltiples
2. Click en "+ Agregar Pago" → Aparece Pago #2
3. Click en "+ Agregar Pago" → Aparece Pago #3
4. Click en "Eliminar" en Pago #2 → Se elimina
5. Click en "Eliminar" en único pago → Muestra error "Debe haber al menos un método de pago"

**Verificaciones:**
- [ ] Puede agregar hasta N pagos
- [ ] Elimina correctamente pagos intermedios
- [ ] No permite eliminar el último pago
- [ ] Numeración se mantiene correcta (#1, #2, #3...)

#### Test Case 8: Cambio de Métodos
1. Activar pagos múltiples
2. Cambiar Pago #1 de "Efectivo" a "Yape"
3. Verificar que selector funciona
4. Agregar otro pago con "Transferencia"
5. Verificar que ambos pagos tienen métodos diferentes

**Verificaciones:**
- [ ] Puede seleccionar cualquier método
- [ ] Los métodos configurados aparecen con emojis
- [ ] Métodos por defecto (si no hay config) funcionan

### ✅ Fase 8: Validaciones de Campos

#### Test Case 9: Montos Inválidos
```
Test con monto vacío:
- Pago #1: Efectivo, Monto: ""
- Pago #2: Tarjeta, Monto: 100

Test con monto cero:
- Pago #1: Efectivo, Monto: 0

Test con monto negativo:
- Pago #1: Efectivo, Monto: -50
```

**Verificaciones:**
- [ ] Monto vacío → Error "Todos los pagos deben tener un monto mayor a cero"
- [ ] Monto cero → Mismo error
- [ ] Monto negativo → HTML5 input no permite negativos

---

## 🎨 Verificaciones de UI/UX

### Visual Design
- [ ] Sección de pagos múltiples tiene fondo gris claro (#f8fafc)
- [ ] Cada pago tiene tarjeta blanca con borde
- [ ] Botón "+ Agregar Pago" es azul (#3b82f6)
- [ ] Botón "Eliminar" es rojo (#ef4444)
- [ ] Resumen tiene borde verde si correcto, rojo si incorrecto

### Feedback Visual
- [ ] Total de la venta se muestra claramente
- [ ] Suma de pagos se actualiza en tiempo real
- [ ] Indicador "Falta" / "Exceso" / "✅ Correcto" es claro
- [ ] Colores indican claramente el estado

### Responsividad
- [ ] Layout se adapta a pantallas pequeñas
- [ ] Grid de 2 columnas funciona bien
- [ ] Campos no se solapan

---

## 🔍 Verificación de Datos Guardados

### Consulta SQL Detallada
```sql
-- Ver venta completa con pagos
SELECT 
  s.id,
  s."codigoVenta",
  s."formaPago",
  s.total,
  s.estado,
  json_agg(
    json_build_object(
      'metodoPago', sp."metodoPago",
      'monto', sp.monto,
      'referencia', sp.referencia,
      'orden', sp.orden
    )
  ) as pagos
FROM sales s
LEFT JOIN sale_payments sp ON sp."saleId" = s.id
WHERE s."codigoVenta" LIKE 'B001-%'
GROUP BY s.id
ORDER BY s."createdAt" DESC
LIMIT 5;
```

**Verificaciones:**
- [ ] `formaPago` contiene el primer método de pago
- [ ] Array `pagos` contiene todos los pagos
- [ ] `orden` está en secuencia (1, 2, 3...)
- [ ] Suma de `monto` = `total`

---

## 📊 Resultados Esperados

### ✅ Funcionalidad Completa
- Backend acepta `payments` array
- Frontend envía pagos múltiples correctamente
- Validación suma = total funciona
- Datos se guardan en `sale_payments`
- Backward compatibility mantenida

### ✅ Validaciones
- No permite suma incorrecta
- No permite montos inválidos
- Requiere al menos un pago

### ✅ UI/UX
- Toggle claro y funcional
- Agregar/eliminar pagos intuitivo
- Feedback visual inmediato
- Confirmación muestra desglose

---

## 🐛 Problemas Conocidos
Ninguno detectado hasta ahora.

---

## 📝 Notas Adicionales

### Flujo Normal (Pago Simple)
1. Seleccionar productos
2. Elegir método de pago
3. Procesar venta
4. Ingresar monto recibido
5. Confirmar pago
6. Venta completada

### Flujo Nuevo (Pagos Múltiples)
1. Seleccionar productos
2. Activar "Usar múltiples métodos de pago"
3. Configurar cada pago (método + monto)
4. Verificar suma = total
5. Procesar venta
6. Venta completada automáticamente (sin modal de monto)

---

## ✅ Criterios de Aceptación

1. ✅ UI muestra checkbox para activar pagos múltiples
2. ✅ Puede agregar N métodos de pago
3. ✅ Validación en tiempo real de suma
4. ✅ Backend guarda cada pago en `sale_payments`
5. ✅ Backward compatible con pago simple
6. ✅ Confirmación muestra desglose de pagos
7. ✅ No muestra modal de monto si usa pagos múltiples
8. ✅ Limpia formulario correctamente

---

**Estado:** ✅ IMPLEMENTACIÓN COMPLETA
**Fecha:** 20 de Noviembre, 2024
**Versión:** 1.0.0
