import { test, expect, Page } from '@playwright/test'

async function stubAuth(page: Page, permissions: string[]) {
  const fakeUser = {
    id: 'user-e2e',
    username: 'e2e.user',
    email: 'admin@alexatech.com',
    firstName: 'E2E',
    lastName: 'User',
    isActive: true,
    permissions,
  } as any;

  // Inject tokens before any scripts run so AuthProvider initializes authenticated
  await page.addInitScript(() => {
    const expPayload = 'eyJleHAiOjQxMDI0NDQ4MDAwfQ=='; // {"exp":4102444800}
    const fakeJwt = `hdr.${expPayload}.sig`;
    localStorage.setItem('authToken', fakeJwt);
    localStorage.setItem('alexatech_token', fakeJwt);
    localStorage.setItem('alexatech_refresh_token', 'e2e-refresh');
  });

  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: fakeUser }),
    });
  });

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Login ok', data: { user: fakeUser, accessToken: 'fake.jwt.token', refreshToken: 'fake.refresh.token' } }),
    });
  });

  await page.route('**/api/auth/logout', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Logout ok' }) });
  });
}

test.describe('Inventario - Ajuste de Stock', () => {
  test('Permite ajustar stock cuando el usuario tiene permisos', async ({ page }) => {
    // Configurar viewport de escritorio para evitar navegación móvil
    await page.setViewportSize({ width: 1280, height: 720 });
    
    await stubAuth(page, ['dashboard.read', 'inventory.read', 'inventory.update']);

    // Stub global de productos para evitar 401 y logout desde ProductProvider
    await page.route('**/api/productos**', async (route) => {
      const response = { success: true, message: 'OK', data: { products: [], total: 0, filters: {} } };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
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

    let stockQty = 10;
    let lastAdjustment = 0;
    let adjustmentsCount = 0;

    await page.route('**/api/inventario/stock**', async (route) => {
      const now = new Date().toISOString();
      const response = {
        rows: [
          {
            stockByWarehouseId: 's-1',
            productId: 'prod-1',
            codigo: 'PROD-INV-1',
            nombre: 'Laptop Pro 14',
            almacen: 'Principal',
            warehouseId: 'WH-PRINCIPAL',
            cantidad: stockQty,
            stockMinimo: 2,
            estado: stockQty <= 2 ? 'CRITICO' : stockQty <= 5 ? 'BAJO' : 'NORMAL',
            updatedAt: now,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });

    await page.route('**/api/inventario/kardex**', async (route) => {
      const baseMoves = adjustmentsCount > 0
        ? [
            {
              id: 'mov-1',
              fecha: new Date().toISOString(),
              productId: 'prod-1',
              codigo: 'PROD-INV-1',
              nombre: 'Laptop Pro 14',
              almacen: 'Principal',
              tipo: 'AJUSTE',
              cantidad: lastAdjustment,
              stockAntes: stockQty - lastAdjustment,
              stockDespues: stockQty,
              motivo: 'Devolución',
              usuario: 'Admin Test',
              documentoReferencia: 'AJ-001',
            },
          ]
        : [];

      const response = {
        data: baseMoves,
        total: baseMoves.length,
        page: 1,
        pageSize: 10,
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });

    await page.route('**/api/inventario/ajustes', async (route) => {
      const req = route.request();
      const body = JSON.parse((await req.postData()) || '{}');
      const cantidadAjuste = Number(body?.cantidadAjuste || 0);
      lastAdjustment = cantidadAjuste;
      stockQty += cantidadAjuste;
      adjustmentsCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Ajuste creado exitosamente' }),
      });
    });

    // Navegar directamente al inventario (AuthProvider ya está autenticado por tokens + /auth/me)
    await page.goto('/inventario/stock');
    await page.getByTestId('stock-table').waitFor({ state: 'visible' });
    await expect(page.getByTestId('stock-table')).toBeVisible();

    const ajustarBtn = page.getByTestId('stock-ajustar-PROD-INV-1-WH-PRINCIPAL');
    await ajustarBtn.waitFor({ state: 'visible' });
    await expect(ajustarBtn).toBeVisible();

    await ajustarBtn.click();

    await page.getByTestId('ajuste-input-cantidad').fill('5');
    await page.getByTestId('ajuste-select-motivo').selectOption({ label: 'Devolución' });
    await page.getByTestId('ajuste-input-observaciones').fill('Ajuste E2E');
    await page.getByTestId('ajuste-button-confirmar').click();

    await page.waitForResponse('**/api/inventario/ajustes');
    await page.waitForResponse('**/api/inventario/stock**');

    const row = page.getByTestId('stock-row-PROD-INV-1-WH-PRINCIPAL');
    await expect(row.getByTestId('stock-quantity')).toContainText('15');
  });

  test('Oculta "Ajustar" cuando el usuario no tiene permisos', async ({ page }) => {
    await stubAuth(page, ['dashboard.read', 'inventory.read']);

    // Stub global de productos para evitar 401 y logout desde ProductProvider
    await page.route('**/api/productos**', async (route) => {
      const response = { success: true, message: 'OK', data: { products: [], total: 0, filters: {} } };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
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

    // Stub de stock para mostrar tabla sin permisos de actualización
    let stockQty = 10;
    await page.route('**/api/inventario/stock**', async (route) => {
      const now = new Date().toISOString();
      const response = {
        rows: [
          {
            stockByWarehouseId: 's-1',
            productId: 'prod-1',
            codigo: 'PROD-INV-1',
            nombre: 'Laptop Pro 14',
            almacen: 'Principal',
            warehouseId: 'WH-PRINCIPAL',
            cantidad: stockQty,
            stockMinimo: 2,
            estado: stockQty <= 2 ? 'CRITICO' : stockQty <= 5 ? 'BAJO' : 'NORMAL',
            updatedAt: now,
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
      };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    });

    // Navegar directo al inventario
    await page.goto('/inventario/stock');
    await page.getByTestId('stock-table').waitFor({ state: 'visible' });
    await expect(page.getByTestId('stock-table')).toBeVisible();

    const ajustarBtn2 = page.getByTestId('stock-ajustar-PROD-INV-1-WH-PRINCIPAL');
    await expect(ajustarBtn2).toHaveCount(0);
    await expect(page.getByText('Acciones')).toHaveCount(0);
  });
});