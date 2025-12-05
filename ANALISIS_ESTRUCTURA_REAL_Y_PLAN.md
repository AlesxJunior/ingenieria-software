# 🔍 ANÁLISIS ESTRUCTURA REAL Y PLAN DE IMPLEMENTACIÓN

**Fecha:** 5 de Diciembre, 2025  
**Consideraciones:**
- ✅ Mantener Express (NO migrar a NestJS)
- ✅ Analizar TODOS los módulos (no solo purchases)
- ✅ Identificar archivos backup innecesarios
- ✅ Basarse en módulos más maduros y funcionales

---

## 📊 ANÁLISIS DE MADUREZ DE MÓDULOS

### Backend - Líneas de Código y Archivos

| Módulo | Líneas | Archivos | Madurez | Estructura |
|--------|--------|----------|---------|------------|
| **sales** | 2,888 | 12 | 🟢 **ALTA** | ✅ controller + routes + service (×4 sub-módulos) |
| **purchases** | 2,278 | 17 | 🟡 MEDIA | ⚠️ controllers/, dto/, decorators NestJS |
| **clients** | 1,492 | 5 | 🟢 **ALTA** | ✅ controller + routes + service + tests |
| **reportes** | 1,318 | 4 | 🟢 ALTA | ✅ controller + routes + service + tests |
| **ai** | 1,090 | 4 | 🟢 ALTA | ✅ controller + routes + service + data |
| **configuracion** | 1,041 | 5 | 🟢 ALTA | ✅ controller + routes + service + tests |
| **users** | 946 | 5 | 🟢 **ALTA** | ✅ controller + routes + service + tests |
| **roles** | 739 | 5 | 🟢 ALTA | ✅ controller + routes + service + tests |
| **inventory** | 589 | 5 | 🟢 ALTA | ✅ controller + routes + service + tests |
| **auth** | 576 | 8 | 🟢 **ALTA** | ✅ controller + routes + service + guards + decorators |
| **products** | 495 | 5 | 🟢 **ALTA** | ✅ controller + routes + service + tests |
| **permissions** | 393 | 4 | 🟢 ALTA | ✅ controller + routes + service + tests |
| **sunat** | 393 | 4 | 🟢 ALTA | ✅ controller + routes + service |
| **warehouses** | 354 | 5 | 🟢 ALTA | ✅ controller + routes + service + tests |

### Frontend - Archivos por Categoría

| Módulo | Total | Components | Pages | Services | Hooks | Types | Estructura |
|--------|-------|------------|-------|----------|-------|-------|------------|
| **purchases** | 32 | 16 | 4 | 6 | 5 | 1 | ✅ **COMPLETA** (mejor del proyecto) |
| **sales** | 18 | 6 | 12 | **0** | **0** | **0** | ⚠️ Solo components + pages |
| **inventory** | 18 | 8 | 5 | 3 | 2 | **0** | 🟡 Falta types |
| **users** | 15 | 10 | 5 | **0** | **0** | **0** | ⚠️ Solo components + pages |
| **clients** | 6 | 3 | 3 | **0** | **0** | **0** | ⚠️ Solo components + pages |
| **configuracion** | 5 | 0 | 4 | 1 | **0** | **0** | ⚠️ Desorganizado |
| **reportes** | 4 | 0 | 4 | **0** | **0** | **0** | ⚠️ Solo pages |
| **auth** | 3 | 1 | 1 | **0** | **0** | 1 | ⚠️ Mínimo |
| **products** | 3 | 2 | 1 | **0** | **0** | **0** | ⚠️ Mínimo |

---

## 🎯 CONCLUSIÓN: MÓDULO ESTÁNDAR A SEGUIR

### Backend: **PRODUCTS / CLIENTS / AUTH** son el mejor estándar

**¿Por qué NO purchases?**
- ❌ Usa decoradores `@Injectable()` de NestJS (incompatible con Express)
- ❌ Tiene `dto/` y `controllers/` (plural) cuando otros usan singular
- ❌ Es el módulo MENOS maduro en estructura Express pura

**Estructura Estándar Backend (Express):**
```
modules/{module}/
├── {module}.controller.ts   // ✅ Lógica de manejo de peticiones HTTP
├── {module}.routes.ts       // ✅ Definición de rutas
├── {module}.service.ts      // ✅ Lógica de negocio
├── index.ts                 // ✅ Exportaciones
└── __tests__/               // ✅ Tests unitarios
    └── {module}.test.ts
```

**Ejemplo real (products):**
```typescript
// products.controller.ts
export const productsController = {
  async create(req, res, next) { ... },
  async getById(req, res, next) { ... },
  async list(req, res, next) { ... }
};

// products.routes.ts
router.post('/', authenticateToken, productsController.create);
router.get('/', authenticateToken, productsController.list);

// products.service.ts
export const productService = {
  async create(data, userId) { ... },
  async getById(id) { ... }
};
```

**Variación para módulos complejos (auth, sales):**
```
modules/sales/
├── sales.controller.ts       // Ventas principales
├── sales.routes.ts
├── sales.service.ts
├── cash-register.controller.ts  // Sub-módulo: cajas
├── cash-register.routes.ts
├── cash-register.service.ts
├── cash-session.controller.ts   // Sub-módulo: sesiones
├── cash-session.routes.ts
├── cash-session.service.ts
└── invoice.controller.ts        // Sub-módulo: facturación
    invoice.routes.ts
    invoice.service.ts
```

---

### Frontend: **INVENTORY** es el mejor estándar (no purchases)

**¿Por qué NO purchases?**
- ✅ Purchases tiene estructura completa PERO es el único
- ⚠️ Los demás 8 módulos usan estructura más simple
- ⚠️ Implementar estructura de purchases en todos sería trabajo masivo

**¿Por qué inventory?**
- ✅ Tiene `components/`, `pages/`, `services/`, `hooks/`
- ✅ Falta solo `types/` (fácil de agregar)
- ✅ Es realista: balance entre completitud y simplicidad
- ✅ Otros módulos (sales, users) pueden evolucionar a este estándar

**Estructura Estándar Frontend (Inventory-based):**
```
modules/{module}/
├── components/              // ✅ Componentes específicos del módulo
│   ├── {Module}Form.tsx
│   ├── {Module}List.tsx
│   └── index.ts
├── pages/                   // ✅ Páginas/vistas principales
│   ├── {Module}sPage.tsx
│   └── index.ts
├── services/                // ✅ Llamadas a API
│   ├── {module}.service.ts
│   └── index.ts
├── hooks/                   // ✅ Custom hooks (lógica reutilizable)
│   ├── use{Module}s.ts
│   └── index.ts
├── types/                   // 🆕 AGREGAR (TypeScript types)
│   ├── {module}.types.ts
│   └── index.ts
└── index.ts                 // ✅ Exportaciones
```

**Evolución gradual:**
```
Estado Actual → Estado Objetivo

auth:        components + pages → + services + hooks + types
products:    components + pages → + services + hooks + types
clients:     components + pages → + services + hooks + types
users:       components + pages → + services + hooks + types
sales:       components + pages → + services + hooks + types ⚠️ PRIORIDAD
```

---

## 🗑️ ARCHIVOS BACKUP - ANÁLISIS Y ACCIÓN

### Archivos Detectados

| Archivo | Tamaño | Ubicación | ¿Necesario? | Acción |
|---------|--------|-----------|-------------|---------|
| `purchases.service.test.ts.old` | 26.45 KB | backend/purchases/__tests__/ | ❌ NO | 🗑️ **ELIMINAR** |
| `GestionCaja.backup.tsx` | 20.58 KB | frontend/sales/pages/ | ❌ NO | 🗑️ **ELIMINAR** |
| `RealizarVenta.backup.tsx` | 33.94 KB | frontend/sales/pages/ | ❌ NO | 🗑️ **ELIMINAR** |
| `NuevoUsuarioModal.tsx.backup` | 19.86 KB | frontend/users/components/ | ❌ NO | 🗑️ **ELIMINAR** |

**Total espacio ocupado:** ~100 KB (insignificante pero genera confusión)

### Justificación

1. **purchases.service.test.ts.old**
   - ✅ Existe versión actualizada: `purchases.service.test.ts`
   - ❌ Código viejo de tests pre-refactor
   - 🗑️ Git ya tiene el historial

2. **GestionCaja.backup.tsx**
   - ✅ Existe versión actual: `GestionCaja.tsx` (2 ubicaciones)
   - ❌ Backup de código viejo
   - 🗑️ Git ya tiene el historial

3. **RealizarVenta.backup.tsx**
   - ✅ Existe versión actual: `RealizarVenta.tsx`
   - ❌ Backup pre-integración pagos múltiples
   - 🗑️ Git ya tiene el historial

4. **NuevoUsuarioModal.tsx.backup**
   - ✅ Existe versión actual: `NuevoUsuarioModal.tsx` (2 ubicaciones)
   - ❌ Backup pre-migración RBAC
   - 🗑️ Git ya tiene el historial

**Conclusión:** TODOS son innecesarios - Git ya mantiene el historial completo

---

## ⚠️ PROBLEMAS ADICIONALES DETECTADOS

### 1. Archivos Duplicados Frontend

**Detectados:**
```
// Duplicación en components globales vs módulos
src/components/NuevoUsuarioModal.tsx
src/modules/users/components/NuevoUsuarioModal.tsx

// Duplicación en pages vs módulos
src/pages/GestionCaja.tsx
src/modules/sales/pages/GestionCaja.tsx

src/pages/RealizarVenta.tsx
src/modules/sales/pages/RealizarVenta.tsx
```

**¿Cuál usar?**
- ✅ **Usar:** `src/modules/{module}/` (arquitectura modular)
- ❌ **Deprecar:** `src/components/` y `src/pages/` (legacy)

**Impacto:**
- ⚠️ Confusión: no está claro cuál es la versión correcta
- ⚠️ Imports rotos si se edita el archivo equivocado
- ⚠️ Duplicación de código

**Acción:**
1. Verificar cuál versión se importa en el código
2. Consolidar en `modules/`
3. Eliminar versiones legacy

---

### 2. Servicios Duplicados Backend (Confirmado)

```
// DUPLICACIÓN CONFIRMADA
src/services/productService.ts          ⚠️ 300+ líneas (legacy)
src/modules/products/products.service.ts  ✅ 291 líneas (modular)

src/services/inventoryService.ts        ⚠️ 250+ líneas (legacy)
src/modules/inventory/inventory.service.ts  ✅ 589 líneas (modular)
```

**¿Cuál se usa?**
- ⚠️ `sales.service.ts` importa de `services/` (legacy):
  ```typescript
  import { productService } from '../../services/productService';
  import { inventoryService } from '../../services/inventoryService';
  ```
- ✅ Rutas usan `modules/` (modular)

**Impacto:**
- ❌ Lógica duplicada
- ❌ Cambios deben hacerse en 2 lugares
- ❌ Confusión sobre fuente de verdad

---

## 📋 PLAN DE IMPLEMENTACIÓN AJUSTADO

### Fase 0: Limpieza Inmediata (1 día)

**Objetivo:** Eliminar archivos innecesarios

#### Tareas:
1. **Eliminar archivos backup** (15 min)
   ```powershell
   # Backend
   Remove-Item "alexa-tech-backend/src/modules/purchases/__tests__/purchases.service.test.ts.old"
   
   # Frontend
   Remove-Item "alexa-tech-react/src/modules/sales/pages/GestionCaja.backup.tsx"
   Remove-Item "alexa-tech-react/src/modules/sales/pages/RealizarVenta.backup.tsx"
   Remove-Item "alexa-tech-react/src/modules/users/components/NuevoUsuarioModal.tsx.backup"
   ```

2. **Verificar archivos duplicados** (2 horas)
   ```typescript
   // Verificar qué versión se importa:
   grep -r "import.*NuevoUsuarioModal" src/
   grep -r "import.*GestionCaja" src/
   grep -r "import.*RealizarVenta" src/
   ```

3. **Consolidar archivos duplicados** (2 horas)
   - Si se usa versión de `modules/`: eliminar de `pages/` y `components/`
   - Si se usa versión legacy: mover a `modules/` y actualizar imports

4. **Commit limpieza**
   ```bash
   git add .
   git commit -m "chore: eliminar archivos backup y consolidar duplicados"
   ```

---

### Fase 1: Estandarización Backend (1 semana)

**Objetivo:** Consolidar servicios y estandarizar estructura Express

#### Sprint 1.1: Consolidar Servicios Duplicados (3 días)

**Prioridad:** 🔴 CRÍTICA

**Problema:**
- `sales.service.ts` importa de `services/` (legacy)
- Otros módulos usan sus propios servicios modulares

**Solución:**
1. **Actualizar imports en sales.service.ts:**
   ```typescript
   // ANTES (legacy):
   import { productService } from '../../services/productService';
   import { inventoryService } from '../../services/inventoryService';
   
   // DESPUÉS (modular):
   import { productService } from '../products/products.service';
   import { inventoryService } from '../inventory/inventory.service';
   ```

2. **Deprecar servicios legacy:**
   - Mantener solo `auditService.ts` (usado globalmente)
   - Mover lógica única de `services/` a `modules/`
   - Agregar comentario deprecation:
   ```typescript
   /**
    * @deprecated Use modules/{module}/{module}.service.ts instead
    */
   ```

3. **Verificar no hay imports rotos:**
   ```bash
   npm run build
   npm run test
   ```

**Resultado esperado:**
- ✅ Un solo servicio por módulo
- ✅ Imports consistentes
- ✅ Directorio `services/` solo con `auditService`

---

#### Sprint 1.2: Refactorizar Purchases (2 días)

**Problema:**
- Usa decoradores NestJS en proyecto Express
- Estructura inconsistente con otros módulos

**Solución:**

**ANTES:**
```
purchases/
├── controllers/
│   ├── purchases.controller.ts        // @Injectable
│   └── purchase-receipts.controller.ts
├── dto/
│   ├── create-purchase-order.dto.ts
│   └── ...
├── purchases.service.ts               // @Injectable
└── purchases.module.ts                // Vacío
```

**DESPUÉS:**
```
purchases/
├── purchases.controller.ts            // Express puro
├── purchases.routes.ts
├── purchases.service.ts               // Sin decoradores
├── purchase-receipts.controller.ts    // Nuevo sub-módulo
├── purchase-receipts.routes.ts
├── purchase-receipts.service.ts
├── index.ts
└── __tests__/
```

**Acciones:**
1. Remover decoradores `@Injectable()`:
   ```typescript
   // ANTES
   @Injectable()
   export class PurchasesService { ... }
   
   // DESPUÉS
   export const purchasesService = { ... }
   ```

2. Convertir DTOs a interfaces TypeScript:
   ```typescript
   // ANTES: dto/create-purchase-order.dto.ts
   export class CreatePurchaseOrderDto { ... }
   
   // DESPUÉS: En purchases.service.ts o types/
   export interface CreatePurchaseOrderInput { ... }
   ```

3. Consolidar controllers:
   ```typescript
   // purchases.controller.ts
   export const purchasesController = {
     async createOrder(req, res, next) { ... },
     async getOrders(req, res, next) { ... }
   };
   ```

---

### Fase 2: Estandarización Frontend (2 semanas)

**Objetivo:** Evolucionar módulos a estructura inventory-based

#### Sprint 2.1: Prioridad - Módulo Sales (5 días)

**Estado Actual:** 18 archivos (6 components, 12 pages, 0 services, 0 hooks, 0 types)

**Objetivo:** Agregar `services/`, `hooks/`, `types/`

**Tareas:**

1. **Crear `services/` (2 días)**
   ```typescript
   // modules/sales/services/sales.service.ts
   import { apiClient } from '../../../utils/api';
   
   export const salesService = {
     create: (data: CreateSaleInput) => 
       apiClient.post('/api/ventas', data),
     
     getById: (id: string) => 
       apiClient.get(`/api/ventas/${id}`),
     
     list: (filters: SaleFilters) => 
       apiClient.get('/api/ventas', { params: filters }),
   };
   
   // modules/sales/services/cash-register.service.ts
   export const cashRegisterService = { ... };
   
   // modules/sales/services/cash-session.service.ts
   export const cashSessionService = { ... };
   
   // modules/sales/services/index.ts
   export * from './sales.service';
   export * from './cash-register.service';
   export * from './cash-session.service';
   ```

2. **Crear `hooks/` (2 días)**
   ```typescript
   // modules/sales/hooks/useSales.ts
   import { useState } from 'react';
   import { salesService } from '../services';
   
   export const useSales = () => {
     const [sales, setSales] = useState([]);
     const [loading, setLoading] = useState(false);
     
     const fetchSales = async (filters) => {
       setLoading(true);
       try {
         const response = await salesService.list(filters);
         setSales(response.data.sales);
       } finally {
         setLoading(false);
       }
     };
     
     return { sales, loading, fetchSales };
   };
   
   // modules/sales/hooks/useCashSession.ts
   export const useCashSession = () => { ... };
   
   // modules/sales/hooks/index.ts
   export * from './useSales';
   export * from './useCashSession';
   ```

3. **Crear `types/` (1 día)**
   ```typescript
   // modules/sales/types/sales.types.ts
   export interface Sale {
     id: string;
     codigoVenta: string;
     clienteId?: string;
     almacenId: string;
     tipoComprobante: 'Boleta' | 'Factura' | 'NotaVenta';
     formaPago: SalePaymentMethod;
     subtotal: number;
     igv: number;
     total: number;
     items: SaleItem[];
   }
   
   export interface SaleItem { ... }
   export interface CreateSaleInput { ... }
   export interface SaleFilters { ... }
   
   // modules/sales/types/cash-session.types.ts
   export interface CashSession { ... }
   
   // modules/sales/types/index.ts
   export * from './sales.types';
   export * from './cash-session.types';
   ```

4. **Refactorizar componentes para usar hooks (1 día)**
   ```typescript
   // ANTES: RealizarVenta.tsx
   const [sales, setSales] = useState([]);
   useEffect(() => {
     fetch('/api/ventas')...
   }, []);
   
   // DESPUÉS:
   import { useSales } from '../hooks';
   
   const { sales, loading, fetchSales } = useSales();
   useEffect(() => { fetchSales(); }, []);
   ```

**Resultado esperado:**
```
modules/sales/
├── components/      (6 archivos) ✅
├── pages/          (12 archivos) ✅
├── services/        (4 archivos) 🆕
├── hooks/           (3 archivos) 🆕
├── types/           (3 archivos) 🆕
└── index.ts         ✅
```

---

#### Sprint 2.2: Módulos Restantes (5 días)

**Orden de prioridad:**
1. **users** (15 archivos) - Alta prioridad, se usa mucho
2. **clients** (6 archivos) - Pequeño, rápido
3. **products** (3 archivos) - Pequeño, rápido
4. **auth** (3 archivos) - Crítico pero pequeño

**Plantilla por módulo (2-3 horas cada uno):**
```
1. Crear services/ (1 hora)
2. Crear hooks/ (1 hora)
3. Crear types/ (30 min)
4. Refactorizar componentes (30 min)
5. Verificar funcionamiento (30 min)
```

---

### Fase 3: Mejoras Arquitectónicas (1 semana)

#### Sprint 3.1: Separar ApiService Monolito (3 días)

**ANTES: utils/api.ts (779 líneas)**
```typescript
class ApiService {
  async createProduct(...) { }
  async getProducts(...) { }
  async createPurchase(...) { }
  async getPurchases(...) { }
  async getSales(...) { }
  async createSale(...) { }
  // ... 50+ métodos
}
```

**DESPUÉS: api/ separado por módulo**
```
api/
├── config.ts              // Configuración base
├── client.ts              // Axios instance
├── auth.api.ts
├── products.api.ts
├── sales.api.ts
├── purchases.api.ts
├── inventory.api.ts
├── clients.api.ts
├── users.api.ts
└── index.ts               // Re-exports
```

**Implementación:**
```typescript
// api/config.ts
export const API_BASE_URL = getApiBaseUrl();

// api/client.ts
import axios from 'axios';
import { API_BASE_URL } from './config';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// api/sales.api.ts
import { apiClient } from './client';

export const salesApi = {
  create: (data) => apiClient.post('/ventas', data),
  getById: (id) => apiClient.get(`/ventas/${id}`),
  list: (filters) => apiClient.get('/ventas', { params: filters }),
};

// api/index.ts
export * from './auth.api';
export * from './sales.api';
export * from './products.api';
// ... resto
```

---

#### Sprint 3.2: Implementar Shared Types (2 días)

**Problema:**
- Tipos duplicados en backend y frontend
- Cambios en backend requieren actualizar frontend manualmente

**Solución:**
```
shared/
├── package.json
├── src/
│   ├── types/
│   │   ├── sales.types.ts
│   │   ├── products.types.ts
│   │   ├── users.types.ts
│   │   └── index.ts
│   └── index.ts
└── tsconfig.json
```

**Ejemplo:**
```typescript
// shared/src/types/sales.types.ts
export interface Sale {
  id: string;
  codigoVenta: string;
  tipoComprobante: 'Boleta' | 'Factura' | 'NotaVenta';
  // ... mismo en backend y frontend
}

// Backend: alexa-tech-backend/src/modules/sales/sales.service.ts
import { Sale } from '@alexa-tech/shared';

// Frontend: alexa-tech-react/src/modules/sales/types/index.ts
export { Sale, SaleItem } from '@alexa-tech/shared';
```

---

#### Sprint 3.3: Documentación y Guías (2 días)

**Crear documentos:**

1. **CONTRIBUTING.md**
   - Guía de estilo (nomenclatura en inglés)
   - Estructura de módulos
   - Flujo de trabajo Git

2. **docs/BACKEND_ARCHITECTURE.md**
   - Patrón de módulos
   - Ejemplo de módulo completo
   - Best practices

3. **docs/FRONTEND_ARCHITECTURE.md**
   - Estructura inventory-based
   - Ejemplo de módulo completo
   - Uso de hooks y services

4. **docs/API_CONTRACTS.md**
   - Formatos de request/response
   - Códigos de error
   - Ejemplos por endpoint

---

## 📈 CRONOGRAMA GENERAL

| Fase | Duración | Esfuerzo | Bloqueante |
|------|----------|----------|------------|
| **Fase 0:** Limpieza | 1 día | 4 horas | NO |
| **Fase 1:** Backend | 1 semana | 40 horas | SÍ (para Fase 2) |
| **Fase 2:** Frontend | 2 semanas | 80 horas | SÍ (para Fase 3) |
| **Fase 3:** Mejoras | 1 semana | 40 horas | NO |
| **TOTAL** | **4 semanas** | **164 horas** | - |

**Timeline:**
```
Semana 1: Limpieza + Backend
├── Día 1: Limpieza archivos
├── Día 2-3: Consolidar servicios
└── Día 4-5: Refactorizar purchases

Semana 2-3: Frontend
├── Semana 2: Sales + Users
└── Semana 3: Clients + Products + Auth

Semana 4: Mejoras
├── Día 1-3: Separar ApiService
├── Día 4-5: Shared types + Docs
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 0: Limpieza
- [ ] Eliminar 4 archivos backup
- [ ] Verificar archivos duplicados (GestionCaja, RealizarVenta, NuevoUsuarioModal)
- [ ] Consolidar en `modules/`
- [ ] Commit limpieza

### Fase 1: Backend
- [ ] Actualizar imports en sales.service.ts
- [ ] Deprecar services/ legacy
- [ ] Remover decoradores NestJS de purchases
- [ ] Convertir DTOs a interfaces
- [ ] Reestructurar purchases siguiendo estándar products
- [ ] Verificar build y tests pasan

### Fase 2: Frontend - Sales
- [ ] Crear sales/services/ (4 archivos)
- [ ] Crear sales/hooks/ (3 archivos)
- [ ] Crear sales/types/ (3 archivos)
- [ ] Refactorizar componentes usar hooks
- [ ] Verificar funcionamiento

### Fase 2: Frontend - Otros
- [ ] Aplicar estructura a users
- [ ] Aplicar estructura a clients
- [ ] Aplicar estructura a products
- [ ] Aplicar estructura a auth

### Fase 3: Mejoras
- [ ] Crear api/ separado por módulo
- [ ] Deprecar utils/api.ts monolito
- [ ] Actualizar imports en todos los módulos
- [ ] Implementar @alexa-tech/shared types
- [ ] Crear documentación (CONTRIBUTING.md, etc)

---

## 🎯 MÉTRICAS DE ÉXITO

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Archivos backup | 4 | 0 | -100% |
| Archivos duplicados | 6 | 0 | -100% |
| Servicios duplicados | 3 | 1 | -67% |
| Módulos con estructura completa (Backend) | 13/14 | 14/14 | +7% |
| Módulos con estructura completa (Frontend) | 1/9 | 5/9 | +400% |
| Líneas en ApiService | 779 | ~100 | -87% |
| Módulos con types compartidos | 0 | 9 | ∞ |

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. **Revisar este documento** con el equipo
2. **Validar decisiones:**
   - ¿Estándar backend (products) es correcto?
   - ¿Estándar frontend (inventory) es realista?
   - ¿Priorización de módulos es correcta?
3. **Iniciar Fase 0** (limpieza) - Bajo riesgo, alta recompensa
4. **Planificar Fase 1** con sprints concretos

---

**Documento generado:** 5 de Diciembre, 2025  
**Basado en:** Análisis real de 14 módulos backend + 9 módulos frontend  
**Próxima revisión:** Después de Fase 0 (limpieza)
