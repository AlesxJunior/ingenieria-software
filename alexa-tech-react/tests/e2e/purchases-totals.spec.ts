import { test, expect, Page } from '@playwright/test';

// Seeded admin user credentials (stubbed)
const admin = { email: 'admin@alexatech.com', password: 'admin123' };

async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(creds.email);
  await page.getByLabel('Contraseña').fill(creds.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

// Helper: select option by label case-insensitively
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

// E2E: Registrar Compra — verificar cálculos con 2 ítems y descuento
// Stubs de auth/entidades para entorno determinista; no se envía la compra
test('Registrar Compra calcula subtotales, descuento y total con 2 ítems', async ({ page }) => {
  // Stub auth endpoints para evitar dependencia de backend
  const fakeUser = {
    id: 'user-admin-1',
    username: 'admin',
    email: admin.email,
    firstName: 'Admin',
    lastName: 'Root',
    isActive: true,
    permissions: [
      'dashboard.read',
      'purchases.read',
      'purchases.create',
      'purchases.update',
      'purchases.delete'
    ],
  };
  await page.route('**/api/auth/login', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'Login ok',
        data: { user: fakeUser, accessToken: 'fake.jwt.token', refreshToken: 'fake.refresh.token' }
      })
    });
  });
  await page.route('**/api/auth/me', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: fakeUser })
    });
  });
  await page.route('**/api/auth/logout', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Logout ok' })
    });
  });

  // Stub entidades (proveedor)
  const clients: any[] = [
    {
      id: 'prov-1',
      tipoEntidad: 'Proveedor',
      tipoDocumento: 'RUC',
      numeroDocumento: '20123456789',
      razonSocial: 'Proveedor E2E',
      email: 'proveedor.e2e@example.com',
      telefono: '999888777',
      direccion: 'Av E2E 123',
      ciudad: 'Lima',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];
  await page.route('**/api/entidades*', async route => {
    const req = route.request();
    if (req.method() === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Lista de entidades',
          data: {
            clients,
            pagination: { currentPage: 1, totalPages: 1, totalClients: clients.length, hasNextPage: false, hasPrevPage: false }
          }
        })
      });
    }
    return route.continue();
  });

  // Stub productos (para autocomplete global)
  const products = [
    { codigo: 'PROD-1', nombre: 'Producto A', precioVenta: 10, stock: 10, estado: true, unidadMedida: 'unidad', categoria: 'Gen', ubicacion: 'A1' },
    { codigo: 'PROD-2', nombre: 'Producto B', precioVenta: 5, stock: 10, estado: true, unidadMedida: 'unidad', categoria: 'Gen', ubicacion: 'A1' },
  ];
  await page.route('**/api/productos*', async route => {
    const req = route.request();
    if (req.method() === 'GET') {
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
    }
    return route.continue();
  });

  // Login (stubbed)
  await login(page, admin);

  // Ir a Compras
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await expect(page.getByRole('heading', { name: 'Lista de Compras', level: 1 })).toBeVisible();

  // Abrir modal Nueva Compra
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toBeVisible();

  // Completar proveedor y almacén
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');

  // Ítem 1: seleccionar via autocomplete y establecer cantidad = 2
  await page.getByTestId('items-global-search').fill('PROD-1');
  await page.getByTestId('global-suggestion-PROD-1').dispatchEvent('mousedown');
  await page.getByTestId('item-0-cantidad').fill('2');
  await expect(page.getByTestId('item-0-precioUnitario')).toHaveValue('10.00');
  await expect(page.getByTestId('item-0-subtotal')).toHaveValue('20.00');

  // Ítem 2: agregar fila y seleccionar via autocomplete, cantidad = 1
  await page.getByTestId('add-item').click();
  await page.getByTestId('items-global-search').fill('PROD-2');
  await page.getByTestId('global-suggestion-PROD-2').dispatchEvent('mousedown');
  await page.getByTestId('item-1-cantidad').fill('1');
  await expect(page.getByTestId('item-1-precioUnitario')).toHaveValue('5.00');
  await expect(page.getByTestId('item-1-subtotal')).toHaveValue('5.00');

  // Verificar Subtotal general = 25.00
  await expect(page.getByTestId('totals-subtotal')).toHaveValue('25.00');

  // Aplicar descuento 3.00 y verificar Total final = 22.00
  await page.locator('#descuento').fill('3');
  await expect(page.getByTestId('totals-final')).toHaveValue('22.00');

  // Cerrar modal sin registrar
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toHaveCount(0);
});