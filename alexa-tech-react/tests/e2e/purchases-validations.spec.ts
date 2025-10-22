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

// Utilidad: stubs comunes de auth
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
    { codigo: 'PROD-VALID', nombre: 'Producto Válido', precioVenta: 10, stock: 5, estado: true, unidadMedida: 'unidad', categoria: 'Gen', ubicacion: 'A1' },
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

// 1) Falta proveedor -> mensaje específico
test('Validación: falta proveedor muestra "Proveedor requerido"', async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await page.route('**/api/productos**', route => route.continue());
  await login(page, admin);
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await expect(page.getByRole('heading', { name: 'Lista de Compras', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toBeVisible();
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByText('Proveedor requerido')).toBeVisible();
});

// 2) Falta items -> "Mínimo 1 item requerido"
test('Validación: sin items muestra "Mínimo 1 item requerido"', async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await stubProductsSingle(page);
  await login(page, admin);
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toBeVisible();
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');
  await page.locator('#tipoComprobante').selectOption({ label: 'Factura' });
  await page.locator('#formaPago').selectOption({ label: 'Efectivo' });
  const today = new Date().toISOString().slice(0,10);
  await page.locator('#fechaEntregaEstimada').fill(today);
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByText('Mínimo 1 item requerido')).toBeVisible();
});

// 3) Ítem con cantidad 0 -> mensaje específico y badge en fila
test('Validación: cantidad 0 muestra "Cantidad debe ser > 0" en el item', async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await stubProductsSingle(page);
  await login(page, admin);
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');
  // Seleccionar producto
  await page.getByTestId('items-global-search').fill('PROD-VALID');
  await page.getByTestId('global-suggestion-PROD-VALID').dispatchEvent('mousedown');
  // Set cantidad 0 y registrar
  await page.getByTestId('item-0-cantidad').fill('0');
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByTestId('item-0-cantidad-error')).toHaveText('Cantidad debe ser > 0');
});

// 4) Todos los datos completos -> creación exitosa (stub)
test('Crear compra con datos completos cierra el modal', async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await stubProductsSingle(page);
  await page.route('**/api/compras', async route => {
    const req = route.request();
    if (req.method().toUpperCase() === 'POST') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Compra creada', data: { id: 'comp-1', codigoOrden: 'ORD-001', proveedorId: 'prov-1', almacenId: 'alm-a', fechaEmision: new Date().toISOString(), items: [], subtotal: 20, total: 20 } }) });
    }
    return route.continue();
  });
  await login(page, admin);
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');
  await page.getByTestId('items-global-search').fill('PROD-VALID');
  await page.getByTestId('global-suggestion-PROD-VALID').dispatchEvent('mousedown');
  await page.getByTestId('item-0-cantidad').fill('2');
  await page.locator('#tipoComprobante').selectOption({ label: 'Factura' });
  await page.locator('#formaPago').selectOption({ label: 'Efectivo' });
  const today = new Date().toISOString().slice(0,10);
  await page.locator('#fechaEntregaEstimada').fill(today);
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toHaveCount(0);
});