# 🔧 REFACTORIZACIÓN PROFESIONAL DE MOCKS - Tests Backend Purchases

**Fecha:** 2 de Diciembre 2025  
**Estado:** ⚠️ Refactorización profunda en progreso  
**Progreso:** 5/25 tests pasando (20%)

---

## 📊 Estado Actual

### **Tests Ejecutados**
```bash
 Test Files  1 failed (1)
      Tests  20 failed | 5 passed (25)
   Duration  1.96s
```

### **Tests que Pasan ✅ (5)**
1. ✅ `should fail if proveedor does not exist`
2. ✅ `should fail if proveedor is not type Proveedor or Ambos`
3. ✅ `update > should throw if purchase not found`
4. ✅ `updateStatus > should throw if purchase not found for status update`
5. ✅ `delete > should throw if purchase not found`

### **Tests que Fallan ❌ (20)**

#### **Categoría 1: Proveedor no encontrado** (6 tests)
- ❌ should create a purchase with calculated totals and discount
- ❌ create > should create purchase with Ambos type entity
- ❌ create > should handle duplicate codigo by appending timestamp
- ❌ create > should calculate subtotal from multiple items
- ❌ create > should create purchase with optional fields
- ❌ update > should update a pending purchase

**Error:**
```
Error: Proveedor no encontrado
 ❯ PurchasesService.create src/modules/purchases/purchases.service.ts:137:13
```

**Causa Raíz:**  
El mock de `clientService.getClientById` configurado en los tests individuales con `mockResolvedValueOnce()` no está siendo invocado. El servicio está llamando al mock pero está devolviendo `undefined`.

---

#### **Categoría 2: Mocks de Prisma no llamados** (6 tests)
- ❌ findAll > should list all purchases without filters
- ❌ findAll > should filter by proveedorId only
- ❌ findAll > should filter by almacenId only
- ❌ findAll > should filter by search query
- ❌ findAll > should filter by date range
- ❌ should list purchases with filters

**Error:**
```
AssertionError: expected "vi.fn()" to be called
Number of calls: 0
```

**Causa Raíz:**  
Los mocks de `prismaMock.purchaseOrder.findMany` y `prismaMock.purchaseOrder.count` están configurados con `mockResolvedValueOnce()` pero el servicio real no los está invocando, posiblemente porque falta algún setup previo.

---

#### **Categoría 3: Orden de compra no encontrada** (5 tests)
- ❌ should update status to Recibida and increase product stock
- ❌ should delete a pending purchase order
- ❌ should not delete a non-pending purchase order
- ❌ findOne > should return a purchase by id
- ❌ findOne > should return null if purchase not found
- ❌ updateStatus > should update status from Pendiente to En Transito

**Error:**
```
Error: Orden de compra no encontrada
 ❯ PurchasesService.findOne src/modules/purchases/purchases.service.ts:410:13
```

**Causa Raíz:**  
`prismaMock.purchaseOrder.findUnique.mockResolvedValueOnce()` no está devolviendo el mock configurado. El servicio llama a `findUnique` pero recibe `undefined`.

---

#### **Categoría 4: Estado inválido** (1 test)
- ❌ findAll > should filter by estado only

**Error:**
```
PrismaClientValidationError:
Invalid value for argument `estado`. Expected PurchaseOrderStatus.
  estado: "RECIBIDA"
```

**Causa Raíz:**  
El test pasa el string `'RECIBIDA'` pero Prisma espera el valor del enum `PurchaseOrderStatus.RECIBIDA`. El filtro debe usar el enum correcto.

---

## 🔍 Análisis del Problema Principal

### **Diagnóstico Técnico**

El problema fundamental es que **Vitest está creando nuevas instancias de las funciones mock en cada test** a pesar de usar `mockClear()`.

#### **Evidencia:**

1. **Mock configurado en test individual:**
```typescript
it('should create a purchase...', async () => {
  (clientService.getClientById as any).mockResolvedValueOnce({
    id: 'prov-1',
    tipoEntidad: 'Proveedor'
  });
  // ...
});
```

2. **Servicio invoca el mock:**
```typescript
// En PurchasesService.create()
const proveedor = await this.clientService.getClientById(data.proveedorId);
if (!proveedor) {
  throw new Error('Proveedor no encontrado'); // ❌ Llega aquí
}
```

3. **El mock devuelve undefined:**  
A pesar de configurar `mockResolvedValueOnce()`, cuando el servicio invoca `getClientById`, devuelve `undefined`.

---

### **Hipótesis de la Causa**

El problema está en cómo **Vitest maneja los mocks de módulos** vs **mocks de objetos**:

```typescript
// ❌ PROBLEMA: Mock del módulo
vi.mock('../../../services/entidadService', () => ({
  clientService: {
    getClientById: vi.fn(),  // Esta función se crea UNA vez
  },
}));

// En el test:
(clientService.getClientById as any).mockResolvedValueOnce(...);
// ↑ Configura el mock de la PRIMERA instancia
// Pero el servicio puede estar usando una SEGUNDA instancia
```

---

## 🛠️ Soluciones Profesionales

### **Opción A: Usar vi.mocked() (Recomendada)**

Vitest proporciona `vi.mocked()` para obtener referencias type-safe a los mocks:

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { clientService } from '../../../services/entidadService';

// Mock del módulo
vi.mock('../../../services/entidadService');

describe('PurchasesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create purchase', async () => {
    // ✅ Usar vi.mocked() para obtener referencia correcta
    vi.mocked(clientService.getClientById).mockResolvedValueOnce({
      id: 'prov-1',
      tipoEntidad: 'Proveedor',
    });

    vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValueOnce(null);
    vi.mocked(prisma.purchaseOrder.create).mockResolvedValueOnce(mockData);

    const result = await purchasesService.create(data);
    expect(result).toBeDefined();
  });
});
```

**Ventajas:**
- ✅ Type-safe (TypeScript infiere tipos correctamente)
- ✅ Garantiza que se use la misma instancia del mock
- ✅ Más fácil de mantener
- ✅ Recomendación oficial de Vitest

---

### **Opción B: Usar mockImplementation() en beforeEach**

Configurar los mocks en `beforeEach` con `mockImplementation()` que devuelve promesas:

```typescript
describe('PurchasesService', () => {
  let mockProveedor: any;
  let mockOrden: any;

  beforeEach(() => {
    mockProveedor = { id: 'prov-1', tipoEntidad: 'Proveedor' };
    mockOrden = null;

    // Configurar implementaciones por defecto
    (clientService.getClientById as any).mockImplementation(async () => mockProveedor);
    prismaMock.purchaseOrder.findUnique.mockImplementation(async () => mockOrden);
  });

  it('should create purchase', async () => {
    // Los tests pueden modificar las variables antes de la llamada
    mockOrden = null; // código único
    
    prismaMock.purchaseOrder.create.mockResolvedValueOnce(mockData);
    const result = await purchasesService.create(data);
    expect(result).toBeDefined();
  });

  it('should fail with duplicate code', async () => {
    mockOrden = { id: 'existing', codigo: 'OC-001' }; // código duplicado
    
    await expect(purchasesService.create(data)).rejects.toThrow();
  });
});
```

**Ventajas:**
- ✅ Control total sobre el comportamiento del mock
- ✅ Fácil debuggear valores de retorno
- ✅ Permite tests más expresivos

**Desventajas:**
- ⚠️ Más verbose
- ⚠️ Requiere variables globales en el describe

---

### **Opción C: Usar Spy en lugar de Mock**

Para servicios reales, usar `vi.spyOn()` en lugar de mocks completos:

```typescript
import { PurchasesService } from '../purchases.service';
import { clientService } from '../../../services/entidadService';

describe('PurchasesService', () => {
  let purchasesService: PurchasesService;
  let getClientSpy: any;

  beforeEach(() => {
    purchasesService = new PurchasesService();
    
    // ✅ Spy en el método real
    getClientSpy = vi.spyOn(clientService, 'getClientById');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create purchase', async () => {
    getClientSpy.mockResolvedValueOnce({
      id: 'prov-1',
      tipoEntidad: 'Proveedor',
    });

    // ... resto del test
  });
});
```

**Ventajas:**
- ✅ Más cercano al comportamiento real
- ✅ Fácil restaurar comportamiento original
- ✅ Mejor para integration tests

**Desventajas:**
- ⚠️ Requiere que el servicio exista realmente
- ⚠️ Más setup boilerplate

---

### **Opción D: Crear Factory de Mocks**

Crear una función helper que configure todos los mocks necesarios:

```typescript
// __tests__/__helpers__/mockFactory.ts
export const createMockSetup = () => {
  const mockProveedor = { id: 'prov-1', tipoEntidad: 'Proveedor' };
  const mockOrden = {
    id: 'po-1',
    codigo: 'OC-001',
    // ... propiedades completas
  };

  return {
    mockProveedor,
    mockOrden,
    
    setupCreateSuccess: () => {
      vi.mocked(clientService.getClientById).mockResolvedValueOnce(mockProveedor);
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValueOnce(null);
      vi.mocked(prisma.purchaseOrder.create).mockResolvedValueOnce(mockOrden);
    },
    
    setupProveedorNotFound: () => {
      vi.mocked(clientService.getClientById).mockResolvedValueOnce(null);
    },
    
    setupDuplicateCode: () => {
      vi.mocked(clientService.getClientById).mockResolvedValueOnce(mockProveedor);
      vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValueOnce(mockOrden);
    },
  };
};

// En el test:
it('should create purchase', async () => {
  const mocks = createMockSetup();
  mocks.setupCreateSuccess();
  
  const result = await purchasesService.create(data);
  expect(result).toBeDefined();
});
```

**Ventajas:**
- ✅ DRY (Don't Repeat Yourself)
- ✅ Tests más legibles
- ✅ Fácil agregar nuevos scenarios
- ✅ Centraliza la lógica de mocking

**Desventajas:**
- ⚠️ Requiere archivo adicional
- ⚠️ Puede ocultar complejidad

---

## 📋 Plan de Acción Recomendado

### **Fase 1: Adoptar vi.mocked() (Prioridad ALTA)**

```typescript
// 1. Actualizar imports
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../../../config/database';
import { clientService } from '../../../services/entidadService';
import { AuditService } from '../../../services/auditService';

// 2. Actualizar mocks
vi.mock('../../../config/database');
vi.mock('../../../services/entidadService');
vi.mock('../../../services/auditService');

// 3. En los tests, usar vi.mocked()
it('should create purchase', async () => {
  vi.mocked(clientService.getClientById).mockResolvedValueOnce({
    id: 'prov-1',
    tipoEntidad: 'Proveedor',
  });
  
  vi.mocked(prisma.purchaseOrder.findUnique).mockResolvedValueOnce(null);
  vi.mocked(prisma.purchaseOrder.create).mockResolvedValueOnce(mockData);
  
  const result = await purchasesService.create(data);
  expect(result).toBeDefined();
});
```

**Tiempo estimado:** 2 horas  
**Impacto:** Debería resolver 15/20 tests fallando

---

### **Fase 2: Crear Mock Factory (Prioridad MEDIA)**

```typescript
// tests/__helpers__/purchaseMockFactory.ts
export const createPurchaseMocks = () => {
  // ... implementación de factory
};

// En cada test:
const mocks = createPurchaseMocks();
mocks.setupCreateSuccess();
```

**Tiempo estimado:** 1 hora  
**Impacto:** Mejora mantenibilidad y legibilidad

---

### **Fase 3: Agregar Tests Faltantes (Prioridad BAJA)**

```typescript
describe('Helper Methods', () => {
  it('should generate unique purchase order code', async () => {
    const service = new PurchasesService();
    const code = await service['generatePurchaseOrderCode']();
    expect(code).toMatch(/^OC-\d{8}-\d{6}$/);
  });

  it('should calculate item totals', () => {
    const item = { cantidad: 10, precioUnitario: 100 };
    const totals = service['calculateItemTotals'](item);
    expect(totals.subtotal).toBe(1000);
  });
});
```

**Tiempo estimado:** 30 minutos  
**Impacto:** Mejora cobertura de código

---

## 🎯 Métricas de Éxito

### **Objetivo Final**
```bash
 ✓ purchases.service.test.ts (32)
   ✓ PurchasesService (32)
     ✓ create (8)
     ✓ findAll (6)
     ✓ findOne (2)
     ✓ update (3)
     ✓ updateStatus (3)
     ✓ delete (2)
     ✓ getStatistics (1)
     ✓ Helper methods (3)

 Test Files  1 passed (1)
      Tests  32 passed (32)
   Duration  < 3s
   Coverage  90%+
```

---

## 📚 Recursos y Referencias

### **Documentación Oficial**
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Vitest API: vi.mocked()](https://vitest.dev/api/vi.html#vi-mocked)
- [Vitest API: mockClear vs mockReset](https://vitest.dev/api/mock.html)

### **Best Practices**
1. **Usar `vi.mocked()` siempre que sea posible**
2. **Evitar `vi.clearAllMocks()` - usar `mockClear()` específico**
3. **Usar `mockResolvedValueOnce()` para valores únicos**
4. **Usar `mockResolvedValue()` para valores reutilizables**
5. **Crear factories para mocks complejos**
6. **Mantener los mocks cerca de los tests que los usan**

---

## ✅ Checklist de Implementación

### Fase 1: vi.mocked()
- [ ] Actualizar imports de vitest
- [ ] Cambiar todos los `(service.method as any).mock...` por `vi.mocked(service.method).mock...`
- [ ] Actualizar beforeEach para usar `vi.clearAllMocks()`
- [ ] Ejecutar tests: `npm run test purchases`
- [ ] Verificar que pasen > 15 tests

### Fase 2: Mock Factory
- [ ] Crear archivo `__helpers__/purchaseMockFactory.ts`
- [ ] Implementar funciones setup para cada scenario
- [ ] Migrar 5 tests para usar factory
- [ ] Ejecutar tests: `npm run test purchases`
- [ ] Verificar que pasen > 20 tests

### Fase 3: Tests Adicionales
- [ ] Agregar tests para helper methods
- [ ] Agregar tests para getStatistics
- [ ] Ejecutar tests: `npm run test purchases`
- [ ] Verificar 100% de tests pasando

---

## 🚀 Siguiente Paso Inmediato

**RECOMENDACIÓN:** Implementar Opción A (vi.mocked()) ahora mismo.

¿Quieres que proceda con la implementación de `vi.mocked()` en todos los tests?

---

**Autor:** GitHub Copilot  
**Fecha:** 2 Diciembre 2025  
**Status:** 📋 Análisis completo - Listo para refactorización con vi.mocked()
