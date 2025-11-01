# Fase 6: Tests Superiores - Plan de Acción

## 📋 Objetivo

Implementar una suite completa de tests para garantizar la calidad y estabilidad del código después de la reestructuración modular.

## 🎯 Metas de Cobertura

- **Frontend**: Mínimo 60% de cobertura
- **Backend**: Mínimo 70% de cobertura (ya tiene tests existentes)
- **E2E**: Al menos 5 flujos críticos completos

## 📊 Estado Actual

### Frontend Tests Existentes

✅ **Unit Tests (Vitest)**
- `src/components/UserInfo.test.tsx` ✅ (2 tests pasando)
- `src/components/Inventario/__tests__/FiltersKardex.test.tsx` ⚠️ (requiere backend)
- `src/components/Inventario/__tests__/TablaKardex.test.tsx` ⚠️ (requiere backend)
- `src/modules/inventory/components/Inventario/__tests__/FiltersKardex.test.tsx` ⚠️
- `src/modules/inventory/components/Inventario/__tests__/TablaKardex.test.tsx` ⚠️

✅ **E2E Tests (Playwright)** - 12 archivos
- `inventory-kardex-filtering.spec.ts`
- `inventory-stock-ajuste.spec.ts`
- `product-register.spec.ts`
- `purchases-*.spec.ts` (7 archivos)
- `register-entity-passport.spec.ts`
- `users-permissions.spec.ts`

### Backend Tests Existentes

✅ **Unit Tests (Jest)**
- `modules/users/__tests__/users.service.test.ts`
- `modules/clients/__tests__/clients.service.test.ts`
- `modules/products/__tests__/products.service.test.ts`
- `modules/purchases/__tests__/purchases.service.test.ts`
- `services/*.test.ts` (4 archivos legacy)
- `tests/*.test.ts` (3 archivos legacy)

## 🚀 Plan de Implementación

### Etapa 1: Tests Unitarios Frontend (Prioridad Alta)

#### 1.1 Tests de Contextos
- [ ] `AuthContext.test.tsx` - Autenticación y estados
- [ ] `ProductContext.test.tsx` - Gestión de productos
- [ ] `ClientContext.test.tsx` - Gestión de clientes
- [ ] `InventoryContext.test.tsx` - Gestión de inventario
- [ ] `SalesContext.test.tsx` - Gestión de ventas
- [ ] `NotificationContext.test.tsx` - Sistema de notificaciones
- [ ] `UIContext.test.tsx` - Estados de UI

#### 1.2 Tests de Hooks Personalizados
- [ ] `useAuth.test.ts` - Hook de autenticación
- [ ] `useInventario.test.ts` - Hook de inventario con debounce
- [ ] `useModal.test.ts` - Hook de modales

#### 1.3 Tests de Componentes Críticos
- [ ] `Layout.test.tsx` - Componente de layout
- [ ] `Modal.test.tsx` - Componente modal
- [ ] `ProtectedRoute.test.tsx` - Rutas protegidas
- [ ] `UbigeoSelector.test.tsx` - Selector de ubicación

#### 1.4 Migrar Tests Existentes a Módulos
- [ ] Mover tests de `src/components/Inventario/__tests__/` a `src/modules/inventory/`
- [ ] Actualizar imports en tests duplicados
- [ ] Eliminar archivos de tests obsoletos

### Etapa 2: Tests de Integración Frontend (Prioridad Media)

#### 2.1 Cross-Module Tests
- [ ] Test de flujo Users → Auth
- [ ] Test de flujo Sales → Clients → Products
- [ ] Test de flujo Purchases → Products → Inventory
- [ ] Test de navegación entre módulos

#### 2.2 API Mocking
- [ ] Crear mocks de API para tests aislados
- [ ] Test de manejo de errores de API
- [ ] Test de estados de carga

### Etapa 3: Tests Backend (Prioridad Alta)

#### 3.1 Completar Tests de Módulos
- [ ] `inventory/__tests__/inventory.service.test.ts`
- [ ] `warehouses/__tests__/warehouses.service.test.ts`
- [ ] `permissions/__tests__/permissions.service.test.ts`
- [ ] `auth/__tests__/auth.service.test.ts`

#### 3.2 Tests de Integración Backend
- [ ] Test de flujo completo de compra → inventario
- [ ] Test de flujo completo de venta → inventario
- [ ] Test de flujo completo de ajuste de stock
- [ ] Test de permisos y autenticación

#### 3.3 Migrar Tests Legacy
- [ ] Mover tests de `services/*.test.ts` a módulos
- [ ] Mover tests de `tests/*.test.ts` a módulos
- [ ] Actualizar imports y estructura

### Etapa 4: Tests E2E (Prioridad Media)

#### 4.1 Actualizar Tests E2E Existentes
- [ ] Verificar que funcionen con nueva estructura modular
- [ ] Actualizar selectores si es necesario
- [ ] Agregar screenshots en fallos

#### 4.2 Nuevos Flujos E2E
- [ ] Flujo completo de usuario: Login → Dashboard → Logout
- [ ] Flujo de administración: Crear usuario → Asignar permisos
- [ ] Flujo de inventario: Ver stock → Ajuste → Ver kardex
- [ ] Flujo de ventas: Abrir caja → Venta → Cerrar caja

### Etapa 5: Coverage y Optimización (Prioridad Baja)

- [ ] Ejecutar coverage report frontend
- [ ] Ejecutar coverage report backend
- [ ] Identificar áreas con baja cobertura
- [ ] Agregar tests para alcanzar metas
- [ ] Optimizar tests lentos

## 📝 Convenciones de Testing

### Estructura de Archivos
```
src/modules/[module]/
  ├── __tests__/
  │   ├── [Component].test.tsx
  │   ├── [Context].test.tsx
  │   └── [Hook].test.ts
  ├── components/
  ├── context/
  ├── hooks/
  └── pages/
```

### Naming Conventions
- Unit tests: `*.test.ts` / `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: `*.spec.ts`

### Best Practices
1. **Arrange-Act-Assert** pattern
2. **Descriptive test names** en español
3. **Mock external dependencies** (API, localStorage, etc.)
4. **Test user behavior**, not implementation
5. **One assertion per test** cuando sea posible

## 🛠️ Herramientas

- **Frontend Unit/Integration**: Vitest + React Testing Library
- **Backend Unit/Integration**: Jest
- **E2E**: Playwright
- **Coverage**: Vitest Coverage (v8) / Jest Coverage (Istanbul)

## 📈 Métricas de Éxito

| Categoría | Meta | Actual | Estado |
|-----------|------|--------|--------|
| Frontend Unit Tests | 30+ | 2 | ⏸️ |
| Frontend Coverage | 60% | ~5% | ⏸️ |
| Backend Unit Tests | 15+ | 8 | 🟡 |
| Backend Coverage | 70% | ~40% | 🟡 |
| E2E Tests | 15+ | 12 | 🟢 |
| E2E Pass Rate | 100% | TBD | ⏸️ |

## 🔄 Workflow

1. **TDD cuando sea posible**: Escribir test antes que código
2. **CI/CD**: Tests automáticos en cada commit
3. **Pre-commit hooks**: Ejecutar tests relevantes
4. **Coverage gates**: No permitir merges que bajen cobertura

## 📅 Timeline Estimado

- **Etapa 1**: 2-3 días (Tests unitarios frontend)
- **Etapa 2**: 1-2 días (Tests integración frontend)
- **Etapa 3**: 1-2 días (Tests backend)
- **Etapa 4**: 1 día (E2E)
- **Etapa 5**: 1 día (Coverage y optimización)

**Total estimado**: 6-9 días de trabajo

---

**Fecha de inicio**: 2025-10-31  
**Última actualización**: 2025-10-31  
**Estado**: 🚀 En Progreso Activo
**Progreso**: 25% de 100%

## 📈 Registro de Avances

### 2025-10-31 - Sesión 1 (Completa) ✅
✅ **AuthContext.test.tsx COMPLETADO - 10/10 tests pasando**
- Creados 10 tests para autenticación completa
- Ajustados patrones de timing para tests asíncronos
- **Lección aprendida:** Esperar solo `isLoading === false`, no condiciones complejas en waitFor
- Patrón correcto: `await waitFor(() => expect(result.current.isLoading).toBe(false))`
- **Problema resuelto:** Race conditions con `result.current` null
- **Problema resuelto:** waitFor con múltiples condiciones causing timeouts

✅ **ProductContext.test.tsx COMPLETADO - 13/13 tests pasando**
- Creados 13 tests para gestión de productos
- Tests de CRUD, filtros, error handling
- Incluye manejo especial de AbortError
- **Problema resuelto:** Loop infinito de useEffect + useCallback
- **Solución aplicada:** Removido loadProducts de dependencias del useEffect
- Todos los tests manejan carga inicial automática correctamente

📊 **Métricas sesión 1**:
- Tests creados: 23
- Tests pasando: 23/23 (100%) ✅
- AuthContext: ✅ 10/10 tests (100%)
- ProductContext: ✅ 13/13 tests (100%)
- Cobertura frontend estimada: ~30% (incremento de +15%)
- Tiempo de ejecución: <6s para 23 tests

🎯 **Patrones establecidos**:
1. ✅ Mock de localStorage con closure
2. ✅ Mock de apiService con mockResolvedValue/mockResolvedValueOnce
3. ✅ Manejo de carga inicial automática en contextos
4. ✅ waitFor simple: solo verificar `isLoading === false`
5. ✅ Assertions después del waitFor, no dentro
6. ✅ Uso de mockResolvedValueOnce para múltiples llamadas

🐛 **Problemas resueltos**:
- ❌→✅ result.current null en waitFor
- ❌→✅ waitFor timeout con condiciones complejas  
- ❌→✅ Loop infinito useEffect + useCallback
- ❌→✅ Tests haciendo timeout (5000ms)
- ❌→✅ Race conditions en async tests

