# 🔧 Fix: Item ID Undefined + Propuesta Mejora UX

**Fecha:** 11 de Noviembre, 2025  
**Bug Crítico:** ✅ RESUELTO  
**Mejora UX:** 📋 PROPUESTA

---

## 🐛 Bug Crítico Resuelto: Item ID Undefined

### Síntoma
Al crear una venta nueva y emitir NC inmediatamente:
```
🔍 Pre-llenando item: undefined cantidad: 1  ❌
```

Después de recargar página:
```
🔍 Pre-llenando item: cmhuzoh5j0024o1a4cc2qaqp9 cantidad: 1  ✅
```

### Causa Raíz
Backend NO devolvía `item.id` en respuestas de:
1. `create()` - Crear venta
2. `confirmPayment()` - Confirmar pago

### Solución
**Archivo:** `sales.service.ts`

Agregado `id: it.id` en líneas ~221 y ~337:

```typescript
items: created.items.map((it) => ({
  id: it.id,  // ✅ Agregado
  productId: it.productId,
  nombreProducto: it.nombreProducto,
  cantidad: it.cantidad,
  precioUnitario: Number(it.precioUnitario),
  subtotal: Number(it.subtotal),
}))
```

### Resultado
✅ Ahora se puede emitir NC inmediatamente después de crear venta

---

## 🎨 Propuesta de Mejora UX: NC Solo en Detalle de Venta

### Problema Actual
NC aparece en 2 lugares:
1. Columna "NC" de venta original ✅ Correcto
2. Como fila separada en listado ❌ Innecesario y confuso

### Solución Propuesta

#### Backend
Modificar `list()` para excluir NC del listado:

```typescript
where: {
  tipo: { not: 'NotaCredito' }, // Excluir NC
}
```

#### Frontend  
Mostrar NC dentro de `DetalleVenta.tsx`:

```typescript
=== Notas de Crédito Emitidas ===
NC-0004
Motivo: Devolución Parcial
Productos Devueltos:
  Mouse Ergonómico  1  S/ -39.99
Total NC: S/ -39.99

Total Neto (después de NC): S/ 439.95
```

### Ventajas
- ✅ Menos confusión
- ✅ Mejor contexto
- ✅ Total neto calculado automáticamente

---

## ✅ Checklist

- [x] Fix: Agregar `id` en sales.service create()
- [x] Fix: Agregar `id` en sales.service confirmPayment()
- [x] Limpiar console.log debugging
- [ ] Verificar IGV en NC (venta sin IGV)
- [ ] Implementar NC en DetalleVenta
- [ ] Filtrar NC de listado principal

---

**Próximo:** Probar venta nueva + NC sin recargar página
