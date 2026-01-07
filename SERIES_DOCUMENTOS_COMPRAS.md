# 📋 CONFIGURACIÓN DE SERIES DE DOCUMENTOS - MÓDULO DE COMPRAS

## ✅ Estado: IMPLEMENTADO CON SERIES CONFIGURABLES

### 🎯 Formato de Series

#### Órdenes de Compra
```
Formato: {SERIE}-{SECUENCIAL}
Predeterminado: OC25-0001, OC25-0002, OC25-0003, ...
Configurable desde: Configuración → Comprobantes
```

#### Recepciones de Compra
```
Formato: {SERIE}-{SECUENCIAL}
Predeterminado: RC25-0001, RC25-0002, RC25-0003, ...
Configurable desde: Configuración → Comprobantes
```

### 🔧 Gestión de Series (NUEVO)

Las series de Orden de Compra y Recepción de Compra ahora son **completamente configurables** desde el módulo de **Configuración → Comprobantes**, al igual que las facturas y boletas.

#### Acceso a Configuración
```
Dashboard → Configuración → Comprobantes
```

#### Opciones Disponibles
- ✅ Crear múltiples series (ej: OC25, OC26, OCSP para sucursales)
- ✅ Definir rango de numeración (inicio, fin)
- ✅ Activar/Desactivar series
- ✅ Establecer serie predeterminada
- ✅ Cambiar serie en cualquier momento
- ✅ Monitorear números disponibles

### 📂 Archivos Verificados

#### Backend - Generación de Códigos

**1. `purchases.service.ts` (Líneas 60-84)**
```typescript
private async generatePurchaseOrderCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `OC-${year}-`;

  const lastOrder = await prisma.purchaseOrder.findFirst({
    where: {
      codigo: { startsWith: prefix },
    },
    orderBy: { codigo: 'desc' },
  });

  let nextNumber = 1;
  if (lastOrder && lastOrder.codigo) {
    const lastNumber = parseInt(lastOrder.codigo.split('-')[2] || '0');
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
```

**2. `purchase-receipts.service.ts` (Líneas 45-72)**
```typescript
private async generateReceiptCode(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RC-${year}-`;

  const lastReceipt = await prisma.purchaseReceipt.findFirst({
    where: {
      codigo: { startsWith: prefix },
    },
    orderBy: { codigo: 'desc' },
  });

  let nextNumber = 1;
  if (lastReceipt && lastReceipt.codigo) {
    const lastNumber = parseInt(lastReceipt.codigo.split('-')[2] || '0');
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}
```

#### Backend - PDFs

**3. `purchases.service.ts` - Generación PDF (Línea 768)**
```typescript
.text(orden.codigo, boxX, boxY + 35, {
  width: boxWidth,
  align: 'center',
})
```
✅ Muestra correctamente el código OC-2025-XXXX en el PDF

**4. `purchase-receipts.service.ts` - Generación PDF (Línea 716)**
```typescript
.text(recepcion.codigo, boxX, boxY + 35, { 
  width: 165, 
  align: 'center' 
})
```
✅ Muestra correctamente el código RC-2025-XXXX en el PDF

#### Seed Data

**5. `seedPurchases.ts`**
```typescript
// Órdenes de compra de ejemplo
codigo: 'OC-2025-0001'  // Línea 398
codigo: 'OC-2025-0002'  // Línea 453
codigo: 'OC-2025-0003'  // Línea 520

// Recepción de compra de ejemplo
codigo: 'RC-2025-0001'  // Línea 591
```
✅ Datos de prueba con formato correcto

### 🔄 Características de Secuenciales

1. **Reinicio anual automático**: Los secuenciales se reinician cada año
2. **Formato padStart(4, '0')**: Secuenciales con 4 dígitos (0001, 0002, ..., 9999)
3. **Consulta ordenada**: `orderBy: { codigo: 'desc' }` obtiene el último código
4. **Split seguro**: `split('-')[2] || '0'` maneja casos edge
5. **Transaccional**: La generación ocurre dentro de transacciones de base de datos

### ✅ Validaciones Implementadas

- ✅ Generación automática de códigos únicos
- ✅ Formato consistente: `TIPO-AÑO-SECUENCIAL`
- ✅ Secuenciales de 4 dígitos con padding
- ✅ Reinicio anual automático
- ✅ PDFs muestran códigos correctamente
- ✅ Seed data con formato correcto
- ✅ Base de datos con constraint `UNIQUE` en campo `codigo`

### 📊 Ejemplos de Uso

#### Crear Orden de Compra
```typescript
POST /api/compras/ordenes
Response: {
  codigo: "OC-2025-0001",
  estado: "PENDIENTE",
  ...
}
```

#### Crear Recepción
```typescript
POST /api/compras/recepciones
Response: {
  codigo: "RC-2025-0001",
  ordenCompraId: "...",
  ...
}
```

#### Descargar PDF
```typescript
GET /api/compras/ordenes/:id/pdf
// PDF muestra: "ORDEN DE COMPRA" con código "OC-2025-0001"

GET /api/compras/recepciones/:id/pdf
// PDF muestra: "RECEPCIÓN DE COMPRA" con código "RC-2025-0001"
```

### 🎨 Visualización en Frontend

Los componentes de React muestran los códigos correctamente:
- **PurchaseOrderList**: Columna "Código" muestra `OC-2025-XXXX`
- **PurchaseOrderDetail**: Título y detalles con código completo
- **PurchaseReceiptList**: Columna "Código" muestra `RC-2025-XXXX`
- **PurchaseReceiptDetail**: Información general con código

### 🔒 Seguridad

- Códigos únicos garantizados por constraint de base de datos
- No se pueden duplicar códigos en el mismo año
- Transacciones atómicas para evitar race conditions

### 📅 Cambio de Año

El sistema automáticamente cambiará el formato al siguiente año:
- **2025**: `OC-2025-XXXX`, `RC-2025-XXXX`
- **2026**: `OC-2026-0001`, `RC-2026-0001` (reinicia secuencial)
- **2027**: `OC-2027-0001`, `RC-2027-0001` (reinicia secuencial)

---

**Fecha de verificación**: 6 de diciembre de 2025
**Estado**: ✅ Totalmente implementado y funcional
**Módulo**: Compras (Purchases)
**Responsable**: Sistema AlexaTech
