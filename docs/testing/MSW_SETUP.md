# Configuración de Mock Service Worker (MSW)

## 📋 Descripción General

Mock Service Worker (MSW) es una librería que intercepta las peticiones HTTP a nivel de red y permite mockear respuestas de API sin modificar el código de la aplicación. Esta configuración reemplaza el uso de `vi.mock()` para llamadas HTTP con un sistema más robusto y realista.

## 🎯 Beneficios de usar MSW

1. **Mayor Realismo**: Las peticiones HTTP reales son interceptadas, no el código
2. **Código Más Limpio**: No necesitas mockear módulos completos con `vi.mock()`
3. **Reutilización**: Los handlers se pueden compartir entre tests
4. **Debugging Más Fácil**: Puedes ver las peticiones HTTP en las herramientas de desarrollo
5. **Testing E2E**: Los mismos mocks pueden usarse en tests E2E con el browser

## 📁 Estructura de Archivos

```
src/
├── __tests__/
│   ├── mocks/
│   │   ├── handlers.ts      # Handlers HTTP de MSW
│   │   └── server.ts        # Configuración del servidor MSW
│   └── integration/         # Tests de integración
└── setupTests.ts            # Setup global con MSW
```

## 🔧 Archivos de Configuración

### 1. `src/__tests__/mocks/handlers.ts`

Define los handlers para todas las rutas de API:

```typescript
import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3001/api';

// Mock data
export const mockUsers = {
  admin: { id: 1, username: 'admin', ... },
  vendedor: { id: 2, username: 'vendedor', ... }
};

export const mockProducts = [...];
export const mockClients = [...];
export const mockWarehouses = [...];

// Handlers
export const handlers = [
  // Auth
  http.get(`${BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers.admin,
    });
  }),

  // Products
  http.get(`${BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    // ... filtrar productos
    return HttpResponse.json({ success: true, data: products });
  }),
  
  // ... más handlers
];
```

### 2. `src/__tests__/mocks/server.ts`

Configura el servidor MSW para Node.js:

```typescript
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### 3. `src/setupTests.ts`

Inicializa MSW antes de todos los tests:

```typescript
import '@testing-library/jest-dom/vitest';
import { server } from './__tests__/mocks/server';

// Establecer mocking de API antes de todos los tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Resetear handlers después de cada test
afterEach(() => {
  server.resetHandlers();
});

// Cerrar servidor después de todos los tests
afterAll(() => {
  server.close();
});
```

## 🎨 Uso en Tests

### Antes (con vi.mock)

```typescript
vi.mock('../../../../utils/api', () => ({
  apiService: {
    getCurrentUser: vi.fn().mockResolvedValue({
      success: true,
      data: mockUser,
    }),
    login: vi.fn().mockResolvedValue({ ... }),
    logout: vi.fn().mockResolvedValue({ ... }),
  },
  tokenUtils: { ... },
}));
```

### Después (con MSW)

```typescript
import { http, HttpResponse } from 'msw';
import { server } from '../../../../__tests__/mocks/server';
import { mockUsers } from '../../../../__tests__/mocks/handlers';

// Solo mockear utilities, no APIs
vi.mock('../../../../utils/api', async () => {
  const actual = await vi.importActual('../../../../utils/api');
  return {
    ...actual,
    tokenUtils: {
      getAccessToken: vi.fn(),
      isTokenExpired: vi.fn(),
      setTokens: vi.fn(),
      clearTokens: vi.fn(),
    },
  };
});

// Test normal - MSW maneja las peticiones HTTP automáticamente
it('debe cargar usuario', async () => {
  renderWithProviders(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });
});
```

### Override de Handlers en Tests Específicos

```typescript
it('debe manejar error de autenticación', async () => {
  // Override temporal del handler
  server.use(
    http.get('http://localhost:3001/api/auth/me', () => {
      return HttpResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    })
  );

  renderWithProviders(<Component />);
  
  await waitFor(() => {
    expect(screen.getByText('Not Authenticated')).toBeInTheDocument();
  });
});
```

### Simulación de Errores de Red

```typescript
it('debe manejar error de red', async () => {
  server.use(
    http.get('http://localhost:3001/api/auth/me', () => {
      return HttpResponse.error(); // Simula network error
    })
  );

  renderWithProviders(<Component />);
  // ... assertions
});
```

## 📊 Handlers Disponibles

### Auth Endpoints

- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/login` - Login (admin/admin123 o vendedor/vendedor123)
- `POST /api/auth/logout` - Logout

### Users Endpoints

- `GET /api/users` - Lista de usuarios
- `GET /api/users/:id` - Usuario por ID
- `POST /api/users` - Crear usuario

### Products Endpoints

- `GET /api/products` - Lista de productos (con búsqueda opcional)
- `GET /api/products/:id` - Producto por ID
- `POST /api/products` - Crear producto

### Clients Endpoints

- `GET /api/clients` - Lista de clientes (con búsqueda opcional)
- `GET /api/clients/:id` - Cliente por ID
- `POST /api/clients` - Crear cliente

### Warehouses Endpoints

- `GET /api/warehouses` - Lista de almacenes
- `GET /api/warehouses/:id` - Almacén por ID

### Sales & Purchases

- `GET /api/sales` - Lista de ventas
- `POST /api/sales` - Crear venta
- `GET /api/purchases` - Lista de compras
- `POST /api/purchases` - Crear compra

### Inventory & Kardex

- `GET /api/inventory` - Lista de inventario
- `GET /api/inventory/:productId` - Stock de producto
- `GET /api/kardex` - Movimientos de kardex
- `GET /api/kardex/movements` - Lista de movimientos

## 🔍 Mock Data

### Usuarios

```typescript
mockUsers.admin     // Admin con todos los permisos
mockUsers.vendedor  // Vendedor con permisos limitados
```

### Productos

```typescript
mockProducts[0]  // PROD001 - Producto Test 1
mockProducts[1]  // PROD002 - Producto Test 2
```

### Clientes

```typescript
mockClients[0]  // Cliente Test 1 (DNI)
mockClients[1]  // Cliente Test 2 (RUC)
```

### Almacenes

```typescript
mockWarehouses[0]  // WH-PRINCIPAL - Almacén Principal (Lima)
mockWarehouses[1]  // WH-SECUNDARIO - Almacén Secundario (Callao)
```

## ✅ Tests Migrados

### Completados

1. **Users → Auth Integration** (6 tests) ✅
   - Flujo de autenticación
   - Verificación de permisos
   - Manejo de errores

### Pendientes de Migración

2. **Sales → Products Integration** (6 tests) ⏳
3. **Purchases → Products → Inventory Integration** (8 tests) ⏳
4. **Navigation Integration** (13 tests) ⏳

## 🚀 Próximos Pasos

1. **Refactorizar tests restantes** para usar MSW
2. **Agregar más mock data** según sea necesario
3. **Crear handlers adicionales** para endpoints faltantes
4. **Documentar patrones comunes** de testing con MSW
5. **Considerar MSW para browser** para debugging visual

## 📚 Referencias

- [MSW Documentation](https://mswjs.io/)
- [MSW with Vitest](https://mswjs.io/docs/integrations/node)
- [MSW Recipes](https://mswjs.io/docs/recipes)

## 📝 Notas

- MSW intercepta peticiones a nivel de red, no código
- `server.resetHandlers()` se ejecuta después de cada test
- Puedes override handlers con `server.use()` temporalmente
- Los handlers se resetean automáticamente después de cada test
- El servidor se cierra automáticamente al finalizar todos los tests

## ⚠️ Troubleshooting

### Tests fallan con "fetch failed"

Verifica que:
1. El handler esté definido en `handlers.ts`
2. La URL coincida exactamente (incluyendo BASE_URL)
3. MSW esté inicializado en `setupTests.ts`

### Handlers no se aplican

```typescript
// Asegúrate de usar server.use() dentro del test, no beforeEach
it('test', () => {
  server.use(/* nuevo handler */);
  // ... rest of test
});
```

### Mock data no coincide

Verifica que el mock data tenga todas las propiedades necesarias:
```typescript
// Asegúrate de incluir todas las propiedades requeridas
mockUser: {
  id, username, email, 
  firstName, lastName,  // ← Pueden ser requeridas
  isActive, permissions,
  createdAt, updatedAt
}
```

---

**Última actualización**: 01/11/2025  
**Versión MSW**: 2.x  
**Tests totales con MSW**: 347/347 ✅
