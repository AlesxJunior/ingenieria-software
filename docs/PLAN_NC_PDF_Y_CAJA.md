# 📋 PLAN: Notas de Crédito con PDF y Gestión de Caja

**Fecha:** 12 de noviembre de 2025  
**Objetivo:** Sistema completo de NC con PDF y control de reembolsos/vales  
**Decisión:** Mantener 2 motivos (DevolucionTotal/DevolucionParcial)  
**Tiempo estimado:** 9-10 horas (2 días)

---

## 🎯 Funcionalidades a Implementar

### **1. Generación de PDF para NC** 
- Reutilizar sistema de PDFKit existente
- Crear `creditNoteInvoiceService.ts`
- Diseño específico para NC con referencia a venta original
- Descarga automática al emitir

### **2. Sistema de Reembolso/Vale**
- Agregar campos al schema para estado de NC
- Modal de selección al emitir NC (3 opciones)
- Integración con CashMovement (si es reembolso efectivo)

### **3. Control de Estados**
- Pendiente (vale no usado)
- Reembolsada (dinero devuelto)
- PendientePagoBancario (transferencia pendiente)

---

## 📊 Flujo del Negocio

### **Escenario 1: NC con Reembolso Inmediato en Efectivo** 💵

```
1. Cliente devuelve productos físicamente
2. Cajero emite NC:
   - Motivo: DevolucionTotal/Parcial
   - Productos a devolver
   
3. ❓ Sistema pregunta: "¿Cómo desea procesar el crédito?"
   
4. ✅ Usuario elige: "💵 Reembolsar en efectivo ahora"
   
5. Sistema ejecuta:
   ✅ Crea NC (estado: Reembolsada)
   ✅ Revierte inventario
   ✅ Crea EGRESO automático en caja
   ✅ Genera y descarga PDF
   
6. Cajero entrega efectivo + PDF al cliente
```

**Resultado:**
- Stock: +10 unidades ✅
- Caja: -S/ 1,000 (EGRESO) ✅
- NC: Estado "Reembolsada" ✅
- Cliente: PDF + efectivo ✅

---

### **Escenario 2: NC como Vale (Crédito a Favor)** 🎫

```
1. Cliente devuelve productos físicamente
2. Cajero emite NC
   
3. ❓ Sistema pregunta: "¿Cómo desea procesar el crédito?"
   
4. ✅ Usuario elige: "🎫 Generar vale (crédito a favor)"
   
5. Sistema ejecuta:
   ✅ Crea NC (estado: Pendiente)
   ✅ Revierte inventario
   ❌ NO crea movimiento de caja
   ✅ Genera y descarga PDF
   
6. Cajero entrega PDF al cliente
7. Cliente puede usar vale en futuras compras (FUTURO)
```

**Resultado:**
- Stock: +10 unidades ✅
- Caja: Sin cambios ✅
- NC: Estado "Pendiente" ✅
- Cliente: PDF (vale) ✅

---

### **Escenario 3: NC con Reembolso Bancario** 🏦

```
1. Cliente devuelve productos físicamente
2. Cajero emite NC
   
3. ❓ Sistema pregunta: "¿Cómo desea procesar el crédito?"
   
4. ✅ Usuario elige: "🏦 Transferencia bancaria"
   
5. Sistema ejecuta:
   ✅ Crea NC (estado: PendientePagoBancario)
   ✅ Revierte inventario
   ❌ NO crea movimiento de caja
   ✅ Genera y descarga PDF
   
6. Finanzas procesa transferencia
7. Marca NC como "Reembolsada" (FUTURO)
```

**Resultado:**
- Stock: +10 unidades ✅
- Caja: Sin cambios ✅
- NC: Estado "PendientePagoBancario" ✅
- Cliente: PDF + transferencia posterior ✅

---

## 🗄️ Cambios en Base de Datos

### **Schema - Nuevos Enums y Campos**

```prisma
// ✅ NUEVOS ENUMS
enum CreditNoteStatus {
  Pendiente              // Vale no usado
  Reembolsada            // Ya se devolvió el dinero
  PendientePagoBancario  // Esperando transferencia
  Aplicada               // Usada en otra venta (FUTURO)
  Cancelada              // Anulada
}

enum CreditNotePaymentMethod {
  Efectivo        // Reembolso en efectivo
  Transferencia   // Transferencia bancaria
  Vale            // Crédito a favor
}

// ✅ ACTUALIZAR modelo Sale
model Sale {
  id String @id @default(cuid())
  codigoVenta String @unique
  tipo SaleType @default(Venta)
  
  // ... campos existentes ...
  
  // ✅ NUEVOS CAMPOS
  creditNoteStatus        CreditNoteStatus?             
  creditNotePaymentMethod CreditNotePaymentMethod?      
  creditNoteRefundDate    DateTime?                     
  cashMovementId          String?                       
  
  // ✅ NUEVA RELACIÓN
  cashMovement            CashMovement? @relation("CreditNoteCashMovement", fields: [cashMovementId], references: [id])
  
  // ... relaciones existentes ...
}

// ✅ ACTUALIZAR modelo CashMovement
model CashMovement {
  // ... campos existentes ...
  
  // ✅ NUEVA RELACIÓN
  creditNote Sale[] @relation("CreditNoteCashMovement")
}
```

### **Migración**

```bash
npx prisma migrate dev --name add_credit_note_status_and_payment
```

---

## 🔧 Implementación Backend

### **Paso 1: Schema y Migración (30 min)**

**Archivos a modificar:**
- `prisma/schema.prisma`

**Tareas:**
1. Agregar enum `CreditNoteStatus`
2. Agregar enum `CreditNotePaymentMethod`
3. Agregar campos a modelo `Sale`:
   - `creditNoteStatus`
   - `creditNotePaymentMethod`
   - `creditNoteRefundDate`
   - `cashMovementId`
4. Agregar relación en `CashMovement`
5. Ejecutar migración

---

### **Paso 2: PDF Service (2 horas)**

**Crear archivo:** `src/services/creditNoteInvoiceService.ts`

**Métodos a implementar:**

```typescript
// Método principal
async generateCreditNoteInvoice(creditNoteId: string): Promise<PDFDocumentType>

// Métodos auxiliares (copiar de invoice.service.ts y adaptar)
generateHeader(doc, data)          // Logo, empresa, recuadro NC (rojo)
generateCreditNoteInfo(doc, data)  // Ref venta original, fechas, método
generateCustomerInfo(doc, data)    // Datos del cliente
generateItemsTable(doc, data)      // Items devueltos (cantidades en negativo)
generateTotals(doc, data)          // Totales en rojo (negativos)
generateFooter(doc, data)          // Mensaje según estado (Vale/Reembolsada)

// Helpers
getReasonLabel(reason)             // DevolucionTotal → "Devolución Total"
getStatusLabel(status)             // Pendiente → "Pendiente"
getPaymentMethodLabel(method)      // Efectivo → "Reembolso en Efectivo"
```

**Características del PDF:**
- Color rojo para destacar (NC)
- Cantidades negativas
- Referencia a venta original
- Mensaje según estado (Vale/Reembolsada)

---

### **Paso 3: Actualizar Credit Note Service (1 hora)**

**Archivo a modificar:** `src/services/creditNoteService.ts`

**Cambios en método `createCreditNote`:**

```typescript
// ✅ NUEVO: Agregar parámetro paymentData
async createCreditNote(
  data: CreateCreditNoteInput, 
  paymentData: {
    method: 'Efectivo' | 'Transferencia' | 'Vale';
    cashSessionId?: string;
  }
): Promise<any> {
  
  // ... validaciones existentes ...

  // ✅ NUEVO: Determinar estado según método
  let creditNoteStatus: CreditNoteStatus;
  let creditNotePaymentMethod: CreditNotePaymentMethod;
  
  switch (paymentData.method) {
    case 'Efectivo':
      creditNoteStatus = 'Reembolsada';
      creditNotePaymentMethod = 'Efectivo';
      break;
    case 'Transferencia':
      creditNoteStatus = 'PendientePagoBancario';
      creditNotePaymentMethod = 'Transferencia';
      break;
    case 'Vale':
      creditNoteStatus = 'Pendiente';
      creditNotePaymentMethod = 'Vale';
      break;
  }

  // ✅ NUEVO: Transacción con movimiento de caja
  const result = await prisma.$transaction(async (tx) => {
    
    // 1. Crear NC con nuevos campos
    const creditNote = await tx.sale.create({
      data: {
        // ... campos existentes ...
        creditNoteStatus,
        creditNotePaymentMethod,
        // ...
      },
    });

    // 2. Si es efectivo, crear EGRESO automático
    if (paymentData.method === 'Efectivo' && paymentData.cashSessionId) {
      const cashMovement = await tx.cashMovement.create({
        data: {
          cashSessionId: paymentData.cashSessionId,
          tipo: 'EGRESO',
          monto: total,
          motivo: `Reembolso por NC ${codigoCreditNote}`,
          descripcion: `Devolución ${data.creditNoteReason}`,
          usuarioId: data.usuarioId,
        },
      });

      // Vincular NC con movimiento
      await tx.sale.update({
        where: { id: creditNote.id },
        data: {
          cashMovementId: cashMovement.id,
          creditNoteRefundDate: new Date(),
        },
      });
    }

    // 3. Reversar inventario (ya existe)
    await this.reversarInventario(...);

    return creditNote;
  });

  return result;
}
```

---

### **Paso 4: Controller y Routes (30 min)**

**Archivo a modificar:** `src/controllers/creditNoteController.ts`

**Actualizar método `create`:**

```typescript
async create(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { 
      saleId, 
      creditNoteReason, 
      descripcion, 
      items, 
      paymentMethod,      // ✅ NUEVO
      cashSessionId       // ✅ NUEVO
    } = req.body;
    
    const usuarioId = req.user!.id;

    // ✅ NUEVO: Validar método de pago
    if (!['Efectivo', 'Transferencia', 'Vale'].includes(paymentMethod)) {
      res.status(400).json({
        success: false,
        message: 'Método de pago inválido',
      });
      return;
    }

    // ✅ NUEVO: Si es efectivo, validar cashSessionId
    if (paymentMethod === 'Efectivo' && !cashSessionId) {
      res.status(400).json({
        success: false,
        message: 'Se requiere sesión de caja para reembolsos en efectivo',
      });
      return;
    }

    // ✅ NUEVO: Pasar paymentData al servicio
    const creditNote = await creditNoteService.createCreditNote(
      {
        saleId,
        usuarioId,
        creditNoteReason,
        descripcion,
        items,
      },
      {
        method: paymentMethod,
        cashSessionId,
      }
    );

    res.status(201).json({
      success: true,
      message: 'Nota de crédito creada exitosamente',
      data: creditNote,
    });
  } catch (error: any) {
    console.error('Error:', error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}
```

**Agregar método `generatePDF`:**

```typescript
async generatePDF(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const pdfDoc = await creditNoteInvoiceService.generateCreditNoteInvoice(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="nc-${id}.pdf"`);

    pdfDoc.pipe(res);

  } catch (error: any) {
    console.error('Error:', error);
    
    if (res.headersSent) {
      res.end();
    } else {
      res.status(400).json({
        success: false,
        message: 'Error al generar PDF',
      });
    }
  }
}
```

**Archivo a modificar:** `src/routes/creditNoteRoutes.ts`

```typescript
// ✅ NUEVA RUTA
router.get('/:id/pdf', authenticateToken, creditNoteController.generatePDF);
```

---

## 🎨 Implementación Frontend

### **Paso 1: Modal de Método de Pago (1.5 horas)**

**Archivo a modificar:** `ModalNotaCredito.tsx`

**Agregar estados:**

```tsx
const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Vale'>('Vale');
const [showPaymentModal, setShowPaymentModal] = useState(false);
```

**Modificar flujo de submit:**

```tsx
// Cambiar handleSubmit para mostrar modal de pago
const handleSubmit = async () => {
  // ... validaciones existentes ...
  
  // ✅ NUEVO: Mostrar modal de selección
  setShowPaymentModal(true);
};

// ✅ NUEVO: Confirmar con método seleccionado
const handleConfirmPayment = async () => {
  try {
    setIsSubmitting(true);

    const payload = {
      saleId: sale.id,
      creditNoteReason: motivo,
      descripcion: descripcion.trim() || undefined,
      items: itemsToReturn
        .filter(item => item.cantidadDevolver > 0)
        .map(item => ({
          saleItemId: item.id,
          cantidad: item.cantidadDevolver,
        })),
      paymentMethod: paymentMethod,
      cashSessionId: paymentMethod === 'Efectivo' ? currentCashSessionId : undefined,
    };

    const response = await fetch(`${API_BASE_URL}/credit-notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Error al crear NC');

    const result = await response.json();

    toast.success('Nota de crédito creada');

    // ✅ NUEVO: Descargar PDF automáticamente
    await downloadCreditNotePDF(result.data.id);

    onClose();
    onSuccess?.();

  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsSubmitting(false);
    setShowPaymentModal(false);
  }
};

// ✅ NUEVO: Función para descargar PDF
const downloadCreditNotePDF = async (creditNoteId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credit-notes/${creditNoteId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Error al descargar PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NC-${creditNoteId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.success('PDF descargado');
  } catch (error) {
    toast.error('Error al descargar PDF');
  }
};
```

**Agregar modal de pago:**

```tsx
{showPaymentModal && (
  <PaymentMethodModal>
    <ModalOverlay onClick={() => setShowPaymentModal(false)} />
    <ModalContent>
      <h3>💰 ¿Cómo desea procesar el crédito?</h3>
      
      <InfoBox>
        <p><strong>Monto total:</strong> S/ {totalDevolucion.toFixed(2)}</p>
      </InfoBox>

      <PaymentOptions>
        <PaymentOption
          selected={paymentMethod === 'Efectivo'}
          onClick={() => setPaymentMethod('Efectivo')}
        >
          <input
            type="radio"
            checked={paymentMethod === 'Efectivo'}
            onChange={() => setPaymentMethod('Efectivo')}
          />
          <div>
            <strong>💵 Reembolsar en efectivo ahora</strong>
            <span>Se registrará EGRESO automático en caja</span>
          </div>
        </PaymentOption>

        <PaymentOption
          selected={paymentMethod === 'Transferencia'}
          onClick={() => setPaymentMethod('Transferencia')}
        >
          <input
            type="radio"
            checked={paymentMethod === 'Transferencia'}
            onChange={() => setPaymentMethod('Transferencia')}
          />
          <div>
            <strong>🏦 Transferencia bancaria</strong>
            <span>Se procesará fuera de caja</span>
          </div>
        </PaymentOption>

        <PaymentOption
          selected={paymentMethod === 'Vale'}
          onClick={() => setPaymentMethod('Vale')}
        >
          <input
            type="radio"
            checked={paymentMethod === 'Vale'}
            onChange={() => setPaymentMethod('Vale')}
          />
          <div>
            <strong>🎫 Generar vale (crédito a favor)</strong>
            <span>Cliente usa en futuras compras</span>
          </div>
        </PaymentOption>
      </PaymentOptions>

      {paymentMethod === 'Efectivo' && (
        <AlertBox type="warning">
          ⚠️ Se creará EGRESO de S/ {totalDevolucion.toFixed(2)} en caja.
          Entrega el efectivo al cliente.
        </AlertBox>
      )}

      {paymentMethod === 'Vale' && (
        <AlertBox type="info">
          ℹ️ Cliente recibirá PDF como vale.
          No habrá movimiento de caja.
        </AlertBox>
      )}

      <ModalActions>
        <CancelButton onClick={() => setShowPaymentModal(false)}>
          Cancelar
        </CancelButton>
        <ConfirmButton 
          onClick={handleConfirmPayment} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Confirmar y Emitir NC'}
        </ConfirmButton>
      </ModalActions>
    </ModalContent>
  </PaymentMethodModal>
)}
```

**Agregar estilos:**

```tsx
const PaymentMethodModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 30px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1;

  h3 {
    margin: 0 0 20px;
    font-size: 20px;
    color: #2c3e50;
  }
`;

const InfoBox = styled.div`
  background: #ecf0f1;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;

  p {
    margin: 0;
    font-size: 14px;
    color: #2c3e50;
  }
`;

const PaymentOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

const PaymentOption = styled.div<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  border: 2px solid ${props => props.selected ? '#3498db' : '#dfe6e9'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.selected ? '#e8f4fd' : 'white'};

  &:hover {
    border-color: #3498db;
  }

  input[type="radio"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  div {
    flex: 1;

    strong {
      display: block;
      font-size: 14px;
      color: #2c3e50;
      margin-bottom: 4px;
    }

    span {
      display: block;
      font-size: 12px;
      color: #7f8c8d;
    }
  }
`;

const AlertBox = styled.div<{ type: 'warning' | 'info' }>`
  padding: 12px 15px;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.5;
  margin-bottom: 20px;
  background: ${props => props.type === 'warning' ? '#fff3cd' : '#d1ecf1'};
  border-left: 4px solid ${props => props.type === 'warning' ? '#ffc107' : '#17a2b8'};
  color: ${props => props.type === 'warning' ? '#856404' : '#0c5460'};
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8f9fa;
  }
`;

const ConfirmButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: #3498db;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #2980b9;
  }

  &:disabled {
    background: #95a5a6;
    cursor: not-allowed;
  }
`;
```

---

### **Paso 2: Botón de descarga en DetalleVenta (30 min)**

**Archivo a modificar:** `DetalleVenta.tsx`

**Agregar función de descarga:**

```tsx
const downloadCreditNotePDF = async (creditNoteId: string, codigoNC: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/credit-notes/${creditNoteId}/pdf`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) throw new Error('Error al descargar PDF');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${codigoNC}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success('PDF descargado');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error al descargar PDF');
  }
};

const getNCStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    Pendiente: 'Pendiente',
    Reembolsada: 'Reembolsada',
    PendientePagoBancario: 'Pago Pendiente',
    Aplicada: 'Aplicada',
    Cancelada: 'Cancelada',
  };
  return labels[status] || status;
};
```

**Actualizar renderizado de NC:**

```tsx
<NCItem key={nc.id}>
  <NCInfo>
    <span><strong>{nc.codigoVenta}</strong></span>
    <span>{new Date(nc.fechaEmision).toLocaleDateString('es-PE')}</span>
    <span>-S/ {nc.total.toFixed(2)}</span>
    <NCStatus status={nc.creditNoteStatus}>
      {getNCStatusLabel(nc.creditNoteStatus)}
    </NCStatus>
  </NCInfo>
  <NCActions>
    <IconButton 
      onClick={() => downloadCreditNotePDF(nc.id, nc.codigoVenta)} 
      title="Descargar PDF"
    >
      📄 PDF
    </IconButton>
  </NCActions>
</NCItem>
```

**Agregar estilos:**

```tsx
const NCStatus = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'Reembolsada': return '#d4edda';
      case 'Pendiente': return '#fff3cd';
      case 'PendientePagoBancario': return '#d1ecf1';
      case 'Cancelada': return '#f8d7da';
      default: return '#e2e3e5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'Reembolsada': return '#155724';
      case 'Pendiente': return '#856404';
      case 'PendientePagoBancario': return '#0c5460';
      case 'Cancelada': return '#721c24';
      default: return '#383d41';
    }
  }};
`;

const IconButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #dfe6e9;
  border-radius: 6px;
  background: white;
  color: #2c3e50;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #3498db;
    color: white;
    border-color: #3498db;
  }
`;
```

---

## ✅ Checklist de Implementación

### **Backend (5 horas)**

- [ ] **Schema y Migración (30 min)**
  - [ ] Agregar `CreditNoteStatus` enum
  - [ ] Agregar `CreditNotePaymentMethod` enum
  - [ ] Agregar campos a `Sale`
  - [ ] Actualizar `CashMovement`
  - [ ] Crear y aplicar migración
  - [ ] Verificar `npx prisma generate`

- [ ] **PDF Service (2 horas)**
  - [ ] Crear `creditNoteInvoiceService.ts`
  - [ ] Implementar `generateCreditNoteInvoice()`
  - [ ] Implementar `generateHeader()` con color rojo
  - [ ] Implementar `generateCreditNoteInfo()` con ref venta
  - [ ] Implementar `generateCustomerInfo()`
  - [ ] Implementar `generateItemsTable()` con negativos
  - [ ] Implementar `generateTotals()` en rojo
  - [ ] Implementar `generateFooter()` con mensaje según estado
  - [ ] Implementar helpers (getReasonLabel, etc.)

- [ ] **Credit Note Service (1 hora)**
  - [ ] Actualizar firma de `createCreditNote()` con `paymentData`
  - [ ] Agregar switch para determinar estado
  - [ ] Implementar creación de CashMovement si es efectivo
  - [ ] Vincular NC con movimiento
  - [ ] Probar transacción completa

- [ ] **Controller y Routes (30 min)**
  - [ ] Actualizar `create()` para recibir `paymentMethod` y `cashSessionId`
  - [ ] Agregar validaciones de método
  - [ ] Crear método `generatePDF()`
  - [ ] Agregar ruta `GET /:id/pdf`

- [ ] **Testing Backend (1 hora)**
  - [ ] Probar NC con efectivo → verificar EGRESO creado
  - [ ] Probar NC con vale → verificar caja sin cambios
  - [ ] Probar NC con transferencia
  - [ ] Probar generación de PDF
  - [ ] Verificar inventario se revierte

### **Frontend (4 horas)**

- [ ] **Modal de Pago (1.5 horas)**
  - [ ] Agregar estados `paymentMethod` y `showPaymentModal`
  - [ ] Modificar `handleSubmit()` para mostrar modal
  - [ ] Crear `handleConfirmPayment()`
  - [ ] Crear `downloadCreditNotePDF()`
  - [ ] Agregar JSX del modal
  - [ ] Agregar estilos completos
  - [ ] Probar flujo completo

- [ ] **Obtener cashSessionId (30 min)**
  - [ ] Agregar al context o estado global
  - [ ] Obtener de API al cargar módulo
  - [ ] Validar que existe sesión abierta

- [ ] **Botón descarga en DetalleVenta (30 min)**
  - [ ] Agregar función `downloadCreditNotePDF()`
  - [ ] Agregar función `getNCStatusLabel()`
  - [ ] Actualizar renderizado de NC con botón
  - [ ] Agregar estilos de badge de estado

- [ ] **Testing Frontend (1.5 horas)**
  - [ ] Probar modal se abre correctamente
  - [ ] Probar selección de método
  - [ ] Probar alertas según método
  - [ ] Probar descarga automática de PDF
  - [ ] Probar descarga desde DetalleVenta

### **Testing E2E (2 horas)**

- [ ] **Flujo Completo: Efectivo**
  - [ ] Crear venta
  - [ ] Abrir modal NC
  - [ ] Elegir "Efectivo"
  - [ ] Verificar alerta de EGRESO
  - [ ] Confirmar
  - [ ] Verificar PDF descarga
  - [ ] Verificar NC aparece en detalle
  - [ ] Ir a GestionCaja
  - [ ] Verificar EGRESO registrado
  - [ ] Verificar monto correcto

- [ ] **Flujo Completo: Vale**
  - [ ] Crear venta
  - [ ] Emitir NC como vale
  - [ ] Verificar PDF descarga
  - [ ] Verificar estado "Pendiente"
  - [ ] Ir a GestionCaja
  - [ ] Verificar NO hay EGRESO

- [ ] **Flujo Completo: Transferencia**
  - [ ] Emitir NC con transferencia
  - [ ] Verificar estado "PendientePagoBancario"
  - [ ] Verificar caja sin cambios

---

## 📊 Resumen de Tiempos

| Fase | Tiempo |
|------|--------|
| Backend: Schema + Migración | 30 min |
| Backend: PDF Service | 2 horas |
| Backend: Credit Note Service | 1 hora |
| Backend: Controller + Routes | 30 min |
| Backend: Testing | 1 hora |
| Frontend: Modal de Pago | 1.5 horas |
| Frontend: CashSessionId | 30 min |
| Frontend: Botón Descarga | 30 min |
| Frontend: Testing | 1.5 horas |
| Testing E2E | 2 horas |
| **TOTAL** | **11 horas** |

---

## 🚀 Orden Recomendado

### **Día 1: Backend Completo (5 horas)**

1. ✅ Schema y migración (30 min)
2. ✅ PDF Service (2 horas)
3. ☕ Break
4. ✅ Credit Note Service (1 hora)
5. ✅ Controller y routes (30 min)
6. ✅ Testing con Postman (1 hora)

### **Día 2: Frontend Completo (6 horas)**

7. ✅ Obtener cashSessionId (30 min)
8. ✅ Modal de método de pago (1.5 horas)
9. ☕ Break
10. ✅ Botón de descarga (30 min)
11. ✅ Testing frontend (1.5 horas)
12. ✅ Testing E2E (2 horas)

---

## 🎯 Resultado Final

Al completar este plan, tendrás:

✅ **Sistema de NC con 3 flujos:**
1. Reembolso en efectivo → Crea EGRESO automático
2. Vale (crédito a favor) → Sin movimiento de caja
3. Transferencia bancaria → Sin movimiento de caja

✅ **PDF profesional:**
- Diseño específico para NC
- Color rojo distintivo
- Referencia a venta original
- Mensaje según estado

✅ **Gestión de caja correcta:**
- EGRESO solo si es efectivo
- Trazabilidad completa
- Estados claros

✅ **UX mejorada:**
- Modal claro de selección
- Descarga automática
- Alertas contextuales
- Badge de estado en listado

---

**Documentado por:** GitHub Copilot  
**Fecha:** 12 de noviembre de 2025  
**Estado:** ✅ Listo para implementar

**¿Comenzamos?** 🚀
