import { test, expect, Page } from '@playwright/test';

const admin = { email: 'admin@alexatech.com', password: 'admin123' };

async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(creds.email);
  await page.getByLabel('Contraseña').fill(creds.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function selectByLabelCI(page: Page, selector: string, label: string) {
  const value = await page.locator(selector).evaluate((select: HTMLSelectElement, target: string) => {
    const opts = Array.from(select.options);
    const match = opts.find(o => (o.textContent || '').trim().toLowerCase() === target.toLowerCase());
    return match ? match.value : null;
  }, label);
  if (value) {
    await page.locator(selector).selectOption(value);
  } else {
    throw new Error(`Option with label "${label}" not found for ${selector}`);
  }
}

async function stubAuth(page: Page) {
  const fakeUser = {
    id: 'user-admin-1',
    username: 'admin',
    email: admin.email,
    firstName: 'Admin',
    lastName: 'Root',
    isActive: true,
    permissions: ['dashboard.read', 'purchases.read', 'purchases.create', 'purchases.update', 'purchases.delete'],
  };
  await page.route('**/api/auth/login', async route => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Login ok', data: { user: fakeUser, accessToken: 'fake.jwt.token', refreshToken: 'fake.refresh.token' } }) });
  });
  await page.route('**/api/auth/me', async route => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'OK', data: fakeUser }) });
  });
  await page.route('**/api/auth/logout', async route => {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Logout ok' }) });
  });
}

async function stubProviders(page: Page) {
  const clients = [
    {
      id: 'prov-1',
      tipoEntidad: 'Proveedor',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      razonSocial: 'Proveedor E2E',
      email: 'prov@e2e.com',
      telefono: '999888777',
      direccion: 'Av E2E 123',
      ciudad: 'Lima',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  await page.route('**/api/entidades*', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Lista de entidades',
        data: {
          clients,
          pagination: { currentPage: 1, totalPages: 1, totalClients: clients.length, hasNextPage: false, hasPrevPage: false },
        },
      }),
    });
  });
}

async function stubProductsSingle(page: Page) {
  const products = [
    { codigo: 'PROD-E2E', nombre: 'Producto E2E', precioVenta: 15, stock: 10, estado: true, unidadMedida: 'unidad', categoria: 'Gen', ubicacion: 'A1' },
  ];
  await page.route('**/api/productos*', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Lista de productos',
        data: {
          products,
          pagination: { currentPage: 1, totalPages: 1, totalProducts: products.length, hasNextPage: false, hasPrevPage: false }
        }
      })
    });
  });
}

// 1) Normaliza formaPago "efectivo" -> "Efectivo" en payload
test('Normaliza formaPago a capitalizado antes de enviar', async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await stubProductsSingle(page);
  // Stub: listado inicial de compras para evitar 401 y redirecciones
  await page.route('**/api/compras*', async route => {
    const method = route.request().method().toUpperCase();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OK', data: { purchases: [], total: 0 } }),
      });
    }
    return route.continue();
  });

  let capturedPayload: any = null;
  await page.route('**/api/compras', async route => {
    const req = route.request();
    if (req.method().toUpperCase() === 'POST') {
      capturedPayload = req.postDataJSON();
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Compra creada', data: { id: 'comp-2', codigoOrden: 'ORD-002' } }) });
    }
    return route.continue();
  });

  await login(page, admin);
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');
  await page.getByTestId('items-global-search').fill('PROD-E2E');
  await page.getByTestId('global-suggestion-PROD-E2E').dispatchEvent('mousedown');
  await page.getByTestId('item-0-cantidad').fill('2');
  // Selección por label "Efectivo" asigna value "efectivo" en el select
  await page.locator('#formaPago').selectOption({ label: 'Efectivo' });
  const today = new Date().toISOString().slice(0,10);
  await page.locator('#fechaEntregaEstimada').fill(today);
  await page.getByRole('button', { name: 'Registrar' }).click();

  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toHaveCount(0);
  expect(capturedPayload).not.toBeNull();
  expect(capturedPayload.formaPago).toBe('Efectivo');
});

// 2) Backend 400: fechaEntregaEstimada en pasado -> banner y error en campo
test('Backend 400: fechaEntregaEstimada pasada muestra banner y error', async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await stubProductsSingle(page);
  // Stub: listado inicial de compras para evitar 401 y redirecciones
  await page.route('**/api/compras*', async route => {
    const method = route.request().method().toUpperCase();
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OK', data: { purchases: [], total: 0 } }),
      });
    }
    return route.continue();
  });

  await page.route('**/api/compras', async route => {
    const req = route.request();
    if (req.method().toUpperCase() === 'POST') {
      return route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Errores de validación',
          error: 'VALIDATION_ERROR',
          details: [
            { path: ['fechaEntregaEstimada'], message: 'Fecha de entrega estimada debe ser posterior a hoy' }
          ]
        })
      });
    }
    return route.continue();
  });

  await login(page, admin);
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');
  await page.getByTestId('items-global-search').fill('PROD-E2E');
  await page.getByTestId('global-suggestion-PROD-E2E').dispatchEvent('mousedown');
  await page.getByTestId('item-0-cantidad').fill('2');
  await page.locator('#formaPago').selectOption({ label: 'Efectivo' });
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0,10);
  await page.locator('#fechaEntregaEstimada').fill(yesterday);
  await page.getByRole('button', { name: 'Registrar' }).click();

  await expect(page.getByTestId('validation-banner')).toBeVisible();
  await expect(page.getByTestId('validation-banner')).toContainText('Fecha de entrega estimada debe ser posterior a hoy');
  await expect(page.locator('#fechaEntregaEstimada').locator('xpath=following-sibling::*')).toContainText('Fecha de entrega estimada debe ser posterior a hoy');
});