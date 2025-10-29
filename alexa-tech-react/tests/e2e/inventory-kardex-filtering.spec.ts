import { test, expect, Page } from '@playwright/test';

const DEBUG = process.env.PWDEBUG_PERF === '1';

type Mark = { name: string; t: number };
const perfMarks: Mark[] = [];
const now = () => (typeof performance !== 'undefined' && typeof performance.now === 'function') ? performance.now() : Date.now();
const mark = (name: string) => perfMarks.push({ name, t: now() });
const buildPerfReport = () => {
  const result: Record<string, number> = {};
  for (let i = 1; i < perfMarks.length; i++) {
    const key = `${perfMarks[i - 1].name}→${perfMarks[i].name}`;
    result[key] = +(perfMarks[i].t - perfMarks[i - 1].t).toFixed(1);
  }
  return result;
};

async function stubAuth(page: Page, permissions: string[]) {
  const fakeUser = {
    id: 'user-1',
    email: 'admin@alexa-tech.com',
    name: 'Admin Test',
    role: 'admin',
    permissions,
  };

  // Inyectar tokens válidos antes de que cargue la app y habilitar bypass de ProtectedRoute
  await page.addInitScript(() => {
    const expPayload = 'eyJleHAiOjQxMDI0NDQ4MDAwfQ=='; // { exp: 4102444800 } muy en futuro
    const fakeJwt = `hdr.${expPayload}.sig`;
    localStorage.setItem('authToken', fakeJwt);
    localStorage.setItem('alexatech_token', fakeJwt);
    localStorage.setItem('alexatech_refresh_token', 'refresh.token');
    (window as any).__PW_TEST__ = true; // bypass de ProtectedRoute en pruebas
  });

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Login ok', data: { user: fakeUser, accessToken: 'fake.jwt.token', refreshToken: 'fake.refresh.token' } }),
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: fakeUser }),
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
  });
}

test.describe('Inventario - Kardex filtrado y autocomplete', () => {
  test('Filtra por producto usando autocomplete y muestra movimientos', async ({ page }) => {
    mark('test:start')
    try {
      // Configurar viewport de escritorio para evitar navegación móvil
      await page.setViewportSize({ width: 1280, height: 720 });
      
      await stubAuth(page, ['inventory.read']);
      mark('stubAuth');
    
     // Debug: capturar consola y red (controlado por DEBUG)
     if (DEBUG) {
       page.on('console', (msg) => {
         console.log(`[BrowserConsole] ${msg.type()}:`, msg.text());
       });
       page.on('request', (req) => {
         console.log('[E2E Request]', req.method(), req.url());
       });
       page.on('response', async (resp) => {
         console.log('[E2E Response]', resp.request().method(), resp.url(), resp.status());
       });
     }

     // Stub global de productos para evitar 401 y logout desde ProductProvider
     await page.route('**/api/productos**', async (route) => {
      // Si es una búsqueda de productos, devolver productos específicos
      if (route.request().url().includes('/search')) {
        const response = {
          success: true,
          data: [
            { id: 'prod-laptop-1', codigo: 'LAP-14', nombre: 'Laptop Pro 14' },
            { id: 'prod-laptop-2', codigo: 'LAP-16', nombre: 'Laptop Pro 16' },
          ],
        };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
      } else {
        // Para otras llamadas de productos
        const response = { success: true, message: 'OK', data: { products: [], total: 0, filters: {} } };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
      }
    });

    // Stub global de entidades comerciales para evitar 401 desde ClientProvider
    await page.route('**/api/entidades**', async (route) => {
      const response = {
        success: true,
        message: 'OK',
        data: {
          clients: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });

    const initialMoves = [
      {
        id: 'mov-ent-1',
        fecha: new Date().toISOString(),
        productId: 'prod-mouse-1',
        codigo: 'MOUSE-1',
        nombre: 'Mouse Gamer',
        almacen: 'Principal',
        tipo: 'ENTRADA',
        cantidad: 20,
        stockAntes: 0,
        stockDespues: 20,
        motivo: 'Compra',
        usuario: 'Admin Test',
        documentoReferencia: 'FAC-001',
      },
      {
        id: 'mov-sal-1',
        fecha: new Date().toISOString(),
        productId: 'prod-mouse-1',
        codigo: 'MOUSE-1',
        nombre: 'Mouse Gamer',
        almacen: 'Principal',
        tipo: 'SALIDA',
        cantidad: 5,
        stockAntes: 20,
        stockDespues: 15,
        motivo: 'Venta',
        usuario: 'Admin Test',
        documentoReferencia: 'VEN-001',
      },
    ];

    const filteredMoves = [
      {
        id: 'mov-aj-1',
        fecha: new Date().toISOString(),
        productId: 'prod-laptop-1',
        codigo: 'LAP-14',
        nombre: 'Laptop Pro 14',
        almacen: 'Principal',
        tipo: 'AJUSTE',
        cantidad: 3,
        stockAntes: 10,
        stockDespues: 13,
        motivo: 'Devolución',
        usuario: 'Admin Test',
        documentoReferencia: 'AJ-002',
      },
    ];

    await page.route('**/api/inventario/kardex**', async (route) => {
      const url = new URL(route.request().url());
      const productId = url.searchParams.get('productId');
      const data = productId === 'prod-laptop-1' ? filteredMoves : initialMoves;
      const response = {
        data,
        total: data.length,
        page: 1,
        pageSize: 10,
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });

    mark('routesReady');

     // Navegar directamente a Inventario > Kardex (optimizado) y marcar tiempos
     mark('navigate:start');
     await page.goto('/inventario/kardex', { waitUntil: 'domcontentloaded' });
     try {
       await expect(page).toHaveURL(/\/inventario\/kardex$/, { timeout: 5000 });
     } catch {
       // Reintento rápido de navegación directa
       await page.goto('/inventario/kardex', { waitUntil: 'domcontentloaded' });
       try {
         await expect(page).toHaveURL(/\/inventario\/kardex$/, { timeout: 3000 });
       } catch {
         // Fallback: si por cualquier razón redirige a dashboard, usa el Sidebar
         await page.getByRole('link', { name: 'Kardex' }).click();
         await expect(page).toHaveURL(/\/inventario\/kardex$/, { timeout: 3000 });
       }
     }
     mark('navigate:end');

    // Esperar a que no haya actividad de red para estabilizar UI
    await page.waitForLoadState('networkidle', { timeout: 5000 });

    // Sincronizar autenticación antes de buscar UI
    await page.waitForResponse((resp) => resp.url().includes('/api/auth/me'), { timeout: 10000 }).catch(() => {});
 

    // Asegurar que al menos un filtro clave o la tabla esté visible (optimizado)
    const productInput = page.getByTestId('kardex-filter-product-input');
    const searchButton = page.getByTestId('kardex-filter-search-button');
    const kardexTable = page.getByTestId('kardex-table');

    mark('ui:init:start');
    let uiReady = false;
    try {
      await Promise.race([
        productInput.waitFor({ state: 'visible', timeout: 12000 }),
        searchButton.waitFor({ state: 'visible', timeout: 12000 }),
        kardexTable.waitFor({ state: 'visible', timeout: 12000 }),
      ]);
      uiReady = true;
    } catch (e) {
      if (DEBUG) {
        console.log('[DEBUG] UI inicial no visible en 12s. Reintentando navegación...');
      }
      await page.goto('/inventario/kardex', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/inventario\/kardex$/, { timeout: 4000 });
      await Promise.race([
        productInput.waitFor({ state: 'visible', timeout: 6000 }),
        searchButton.waitFor({ state: 'visible', timeout: 6000 }),
        kardexTable.waitFor({ state: 'visible', timeout: 6000 }),
      ]);
      uiReady = true;
    }
    mark('ui:init:end');
 
     const searchButtonByText = page.getByRole('button', { name: /Buscar|Buscando\.\.\./ });
     await expect(searchButton.or(searchButtonByText)).toBeVisible({ timeout: 8000 });
     await expect(searchButton.or(searchButtonByText)).toBeEnabled({ timeout: 8000 });
 
     // Disparar búsqueda inicial para cargar movimientos con espera del endpoint
     mark('search:initial:start');
     const waitInitial = page.waitForResponse((resp) => resp.url().includes('/api/inventario/kardex') && resp.request().method() === 'GET', { timeout: 8000 });
     await ((await searchButton.count()) ? searchButton : searchButtonByText).click();
     await waitInitial;
     mark('search:initial:end');

    // Esperar tabla con datos
    await expect(page.getByTestId('kardex-table')).toBeVisible({ timeout: 8000 });

    // Verificar movimientos iniciales
    await expect(page.getByTestId('kardex-row-mov-ent-1')).toBeVisible();
    await expect(page.getByTestId('kardex-row-mov-sal-1')).toBeVisible();
    mark('verify:initial:end');

    // Buscar por producto usando autocomplete
    mark('autocomplete:fill:start');
    await page.getByTestId('kardex-filter-product-input').fill('Laptop');
    await expect(page.getByTestId('kardex-filter-product-suggestions')).toBeVisible({ timeout: 8000 });
    mark('autocomplete:fill:end');
    // Usar mousedown para opciones tipo autocomplete y evitar problemas de click
    await page.getByTestId('kardex-filter-product-option-prod-laptop-1').dispatchEvent('mousedown');
    mark('autocomplete:select:end');

    // Hacer click estable en el botón de buscar
    await expect(searchButton.or(searchButtonByText)).toBeEnabled({ timeout: 8000 });
    mark('search:filtered:start');
    const waitFiltered = page.waitForResponse((resp) => resp.url().includes('/api/inventario/kardex') && resp.request().method() === 'GET', { timeout: 8000 });
    await ((await searchButton.count()) ? searchButton : searchButtonByText).click();
    await waitFiltered;
    mark('search:filtered:end');

    // Verificar tabla actualizada con el producto filtrado
    await expect(page.getByTestId('kardex-row-mov-aj-1')).toBeVisible({ timeout: 30000 });
    await expect(page.getByTestId('kardex-type-AJUSTE-mov-aj-1')).toBeVisible();
    await expect(page.getByTestId('kardex-quantity')).toContainText('3');
    await expect(page.getByTestId('kardex-stock-antes')).toContainText('10');
    await expect(page.getByTestId('kardex-stock-despues')).toContainText('13');

    mark('verify:filtered:end');
    const perf = buildPerfReport();
    console.log('[Perf] Kardex timings (ms):', JSON.stringify(perf));
    await test.info().attach('kardex-perf-metrics', { body: JSON.stringify(perf), contentType: 'application/json' });
    } finally {
      const perf = buildPerfReport();
      console.log('[Perf][finally] Kardex timings (ms):', JSON.stringify(perf));
      try {
        await test.info().attach('kardex-perf-metrics-finally', { body: JSON.stringify(perf), contentType: 'application/json' });
      } catch {}
    }
  });
});