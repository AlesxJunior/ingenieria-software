# 🧪 Guía Rápida de Pruebas: Notas de Crédito Simplificadas

**Fecha:** 11 de Noviembre, 2025  
**Sistema:** Alexa Tech - Módulo de Ventas  
**URL Frontend:** http://localhost:5173  
**URL Backend:** http://localhost:3001

---

## 🎯 Objetivo de Pruebas

Validar que los **5 motivos funcionales** de Notas de Crédito funcionan correctamente con sus comportamientos específicos.

---

## ✅ Checklist de Pruebas Rápidas

### Test 1: DevolucionTotal ⏱️ 2 min

**Comportamiento esperado:** Pre-llena TODAS las cantidades automáticamente

1. [X] Login en sistema
2. [X] Ir a "Ventas" → "Listado de Ventas"
3. [X] Abrir una venta COMPLETADA con al menos 2 productos
4. [X] Clic en botón "Emitir Nota de Crédito"
5. [X] **Verificar:** Modal se abre con "Devolución Total" seleccionado por defecto
6. [ ] **Verificar:** Todas las cantidades están PRE-LLENADAS automáticamente
7. [x] **Verificar:** Placeholder dice: "Ej: Producto defectuoso, cliente insatisfecho..."
8. [x] Escribir observación: "Cliente insatisfecho con el producto"
9. [ ] Confirmar NC
10. [ ] **Verificar:** NC aparece en historial de la venta
11. [ ] **Verificar:** Estado de venta ahora muestra "Tiene NC"
12. [ ] **Verificar:** Stock aumentó para TODOS los productos

**✅ Resultado esperado:** NC emitida, stock revertido totalmente

---

### Test 2: DevolucionParcial ⏱️ 3 min

**Comportamiento esperado:** Usuario selecciona manualmente qué productos devolver

1. [ ] Abrir otra venta COMPLETADA con al menos 3 productos
2. [ ] Clic en "Emitir Nota de Crédito"
3. [ ] Seleccionar "Devolución Parcial" en el dropdown
4. [ ] **Verificar:** Todas las cantidades se RESETEAN a 0 (no pre-llenadas)
5. [ ] **Verificar:** Placeholder dice: "Ej: Producto con falla, talla incorrecta..."
6. [ ] Cambiar cantidad del PRIMER producto a 1
7. [ ] **Verificar CRÍTICO:** Los otros productos mantienen cantidad 0 (independientes)
8. [ ] Cambiar cantidad del TERCER producto a 2
9. [ ] **Verificar:** Total NC es solo la suma de productos seleccionados (no el total de venta)
10. [ ] Escribir observación: "Camisa azul con mancha (defectuosa)"
11. [ ] Confirmar NC
12. [ ] **Verificar:** Stock aumentó SOLO para productos seleccionados
13. [ ] **Verificar:** Monto NC es proporcional (no 100% de venta)

**✅ Resultado esperado:** NC parcial, stock revertido solo para productos seleccionados

---

### Test 3: ErrorFacturacion ⏱️ 2 min

**Comportamiento esperado:** Ajuste numérico SIN reversión de inventario

1. [ ] Abrir venta COMPLETADA
2. [ ] Clic en "Emitir Nota de Crédito"
3. [ ] Seleccionar "Error en Facturación"
4. [ ] **Verificar:** Placeholder dice: "Ej: Precio incorrecto, descuento mal aplicado..."
5. [ ] **Verificar:** Grupo es "Ajustes Administrativos"
6. [ ] DEJAR todas las cantidades en 0 (sin seleccionar productos)
7. [ ] Escribir observación: "Descuento del 10% no aplicado correctamente"
8. [ ] Confirmar NC
9. [ ] **Verificar CRÍTICO:** Stock NO cambió (no se revirtió inventario)
10. [ ] **Verificar:** NC se registró como ajuste contable

**✅ Resultado esperado:** NC registrada, stock SIN CAMBIOS

---

### Test 4: ErrorDocumento ⏱️ 2 min

**Comportamiento esperado:** Corrección administrativa SIN reversión de inventario

1. [ ] Abrir venta COMPLETADA
2. [ ] Clic en "Emitir Nota de Crédito"
3. [ ] Seleccionar "Error en Documento"
4. [ ] **Verificar:** Placeholder dice: "Ej: RUC incorrecto, DNI mal digitado..."
5. [ ] **Verificar:** Grupo es "Ajustes Administrativos"
6. [ ] DEJAR todas las cantidades en 0 (sin seleccionar productos)
7. [ ] Escribir observación: "RUC incorrecto, debe ser 20123456789"
8. [ ] Confirmar NC
9. [ ] **Verificar CRÍTICO:** Stock NO cambió
10. [ ] **Verificar:** NC se registró como corrección documental

**✅ Resultado esperado:** NC registrada, stock SIN CAMBIOS

---

### Test 5: Otro (con validación obligatoria) ⏱️ 2 min

**Comportamiento esperado:** Comodín, requiere descripción obligatoria

1. [ ] Abrir venta COMPLETADA
2. [ ] Clic en "Emitir Nota de Crédito"
3. [ ] Seleccionar "Otro Motivo"
4. [ ] **Verificar:** Label "Observaciones" tiene asterisco (*) rojo
5. [ ] **Verificar:** Placeholder dice: "Ej: Solicitud del área contable, auditoría..."
6. [ ] Dejar campo de observación VACÍO
7. [ ] Intentar confirmar NC
8. [ ] **Verificar CRÍTICO:** Error "Por favor, especifica el motivo en las observaciones"
9. [ ] Modal NO se cierra
10. [ ] Escribir observación: "Solicitud del área de contabilidad para ajuste contable"
11. [ ] Confirmar NC
12. [ ] **Verificar:** NC se procesa correctamente
13. [ ] **Verificar:** Stock NO cambió (por defecto "Otro" no revierte)

**✅ Resultado esperado:** Validación funciona, NC registrada con descripción obligatoria

---

## 🔍 Verificaciones de Stock (Inventario)

### Cómo Verificar Stock:

1. Ir a "Almacén" → "Gestión de Productos"
2. Buscar el producto devuelto
3. Ver columna "Stock Disponible"
4. **Para DevolucionTotal/Parcial:** Stock debe AUMENTAR
5. **Para ErrorFacturacion/ErrorDocumento/Otro:** Stock debe MANTENERSE IGUAL

### Cálculo Esperado:

```
Stock Después = Stock Antes + Cantidad Devuelta (solo si revierte inventario)
```

**Ejemplo:**
- Stock antes: 50 unidades
- Venta original: 5 unidades
- DevolucionParcial: 2 unidades
- **Stock esperado:** 50 + 2 = 52 unidades ✅

---

## 🐛 Bugs a Reportar

Si encuentras alguno de estos problemas:

### Bug 1: Cantidades no independientes
- **Síntoma:** Al cambiar cantidad de producto A, también cambia producto B
- **Severidad:** CRÍTICA
- **Status Esperado:** ✅ RESUELTO (fix implementado)

### Bug 2: Modal muestra 9 motivos en lugar de 5
- **Síntoma:** Aparecen ProductoDefectuoso, ClienteInsatisfecho, etc.
- **Severidad:** ALTA
- **Status Esperado:** ✅ RESUELTO (simplificado a 5)

### Bug 3: ErrorFacturacion revierte inventario
- **Síntoma:** Al emitir NC por ErrorFacturacion, stock aumenta
- **Severidad:** CRÍTICA (error de lógica de negocio)
- **Status Esperado:** ✅ CORRECTO (NO debe revertir)

### Bug 4: Otro motivo NO valida descripción obligatoria
- **Síntoma:** Permite enviar NC con "Otro" sin observaciones
- **Severidad:** MEDIA
- **Status Esperado:** ✅ CORRECTO (valida obligatoriedad)

---

## 📊 Matriz de Pruebas

| Test | Motivo | Revierte Stock | Requiere Productos | Validación Especial | Estado |
|------|--------|----------------|-------------------|-------------------|--------|
| 1 | DevolucionTotal | ✅ SÍ (100%) | ✅ SÍ | Pre-llena cantidades | ⏳ Pendiente |
| 2 | DevolucionParcial | ✅ SÍ (parcial) | ✅ SÍ | Selección manual | ⏳ Pendiente |
| 3 | ErrorFacturacion | ❌ NO | ❌ NO | - | ⏳ Pendiente |
| 4 | ErrorDocumento | ❌ NO | ❌ NO | - | ⏳ Pendiente |
| 5 | Otro | ❌ NO | ❌ NO | Descripción obligatoria | ⏳ Pendiente |

**Instrucciones:** Marca con ✅ cuando completes cada test exitosamente.

---

## 🚀 Escenarios Adicionales (Opcional)

### Test 6: NC Parcial sobre NC previa
1. [ ] Emitir NC parcial devolviendo 2 de 5 productos
2. [ ] Intentar emitir OTRA NC sobre la misma venta
3. [ ] **Verificar:** Sistema permite devolver los 3 productos restantes
4. [ ] **Verificar:** NO permite devolver más de lo disponible

### Test 7: DevolucionTotal en venta con 1 solo producto
1. [ ] Crear/buscar venta con solo 1 producto
2. [ ] Emitir NC con DevolucionTotal
3. [ ] **Verificar:** Funciona correctamente
4. [ ] **Verificar:** Stock revierte la cantidad completa

### Test 8: Cambio de motivo en modal
1. [ ] Abrir modal NC con DevolucionTotal (pre-llena cantidades)
2. [ ] Cambiar a ErrorFacturacion
3. [ ] **Verificar:** Cantidades se RESETEAN a 0
4. [ ] Cambiar de vuelta a DevolucionTotal
5. [ ] **Verificar:** Cantidades se RE-LLENAN automáticamente

---

## 📝 Reporte de Resultados

### Completar después de pruebas:

**Fecha de prueba:** ___________  
**Probado por:** ___________  
**Versión:** Simplificación a 5 motivos  

**Resumen:**
- Tests Exitosos: ___ / 5
- Tests Fallidos: ___ / 5
- Bugs Encontrados: ___

**Observaciones:**
_______________________________________
_______________________________________
_______________________________________

**Estado Final:**
- [ ] ✅ Aprobado - Listo para producción
- [ ] ⚠️ Aprobado con observaciones menores
- [ ] ❌ Rechazado - Requiere correcciones

---

## 🎯 Criterios de Aceptación

Para aprobar las pruebas, TODOS estos criterios deben cumplirse:

1. ✅ Los 5 motivos aparecen correctamente en el dropdown
2. ✅ DevolucionTotal pre-llena cantidades automáticamente
3. ✅ DevolucionParcial permite selección manual independiente
4. ✅ ErrorFacturacion NO revierte inventario
5. ✅ ErrorDocumento NO revierte inventario
6. ✅ Otro valida descripción obligatoria
7. ✅ Placeholders contextuales aparecen según motivo seleccionado
8. ✅ Stock se actualiza correctamente según tipo de NC
9. ✅ NC aparece en historial de la venta
10. ✅ No hay errores en consola del navegador

---

**¡Listo para probar! 🚀**

Si todos los tests pasan, la simplificación está lista para producción.
