import { test, expect, Page } from '@playwright/test';

// Seeded admin user credentials
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

// E2E: Create a new purchase via modal and verify it appears in the list
// This test stubs compras, entidades y productos APIs para ejecutar determinísticamente
test('Admin can create a new purchase via modal', async ({ page }) => {
  // Capture browser console and network activity for debugging
  page.on('console', (msg) => {
    try {
      const args = msg.args().map(a => a.toString()).join(' | ');
      console.log(`[BrowserConsole] ${msg.type()}:`, msg.text(), args);
    } catch {
      console.log(`[BrowserConsole] ${msg.type()}:`, msg.text());
    }
  });
  page.on('request', (req) => {
    console.log('[E2E Request]', req.method(), req.url());
  });
  page.on('response', async (resp) => {
    console.log('[E2E Response]', resp.request().method(), resp.url(), resp.status());
  });
  // Stub auth endpoints to avoid backend dependency
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
        data: {
          user: fakeUser,
          accessToken: 'fake.jwt.token',
          refreshToken: 'fake.refresh.token',
        }
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

  // Stub entidades (clients) to provide a provider option
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
            pagination: {
              currentPage: 1,
              totalPages: 1,
              totalClients: clients.length,
              hasNextPage: false,
              hasPrevPage: false,
            }
          }
        })
      });
    }
    return route.continue();
  });

  // Stub productos para el autocomplete (precio determinista)
  const products = [
    { codigo: 'PROD-1', nombre: 'Producto X', precioVenta: 10, stock: 50, estado: true, unidadMedida: 'unidad', categoria: 'Gen', ubicacion: 'A1' },
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

  // Stub compras endpoints
  const purchases: any[] = [];
  await page.route('**/compras*', async route => {
    const req = route.request();
    const method = req.method();
    const url = req.url();
    console.log('[E2E Stub] compras intercept:', method, url);
    if (method === 'GET') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Lista de compras',
          data: {
            purchases,
            total: purchases.length,
            filters: {}
          }
        })
      });
    }
    if (method === 'OPTIONS') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
    }
    if (method === 'POST') {
      const payload = await req.postDataJSON();
      const now = new Date().toISOString();
      const subtotal = (payload.items || []).reduce((acc: number, it: any) => acc + (Number(it.cantidad) * Number(it.precioUnitario)), 0);
      const descuento = Number(payload.descuento || 0);
      const total = Math.max(0, subtotal - descuento);
      const purchase = {
        id: `compra-${Date.now()}`,
        codigoOrden: `OC-${Date.now()}`,
        proveedorId: payload.proveedorId,
        almacenId: payload.almacenId,
        fechaEmision: payload.fechaEmision,
        estado: 'Pendiente',
        items: payload.items,
        subtotal,
        total,
        tipoComprobante: payload.tipoComprobante || null,
        formaPago: payload.formaPago || null,
        fechaEntregaEstimada: payload.fechaEntregaEstimada || null,
        observaciones: payload.observaciones || null,
        usuarioId: fakeUser.id,
        createdAt: now,
        updatedAt: now,
      };
      purchases.unshift(purchase);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Compra creada', data: purchase })
      });
    }
    return route.continue();
  });

  // Login (stubbed)
  await login(page, admin);

  // Navigate to Compras via sidebar
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await expect(page.getByRole('heading', { name: 'Lista de Compras', level: 1 })).toBeVisible();

  // Open Nueva Compra modal
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toBeVisible();

  // Fill form
  await selectByLabelCI(page, '#proveedorId', 'Proveedor E2E');
  await selectByLabelCI(page, '#almacenId', 'Almacén A');

  // Seleccionar producto via autocomplete global y cantidad
  await page.getByTestId('items-global-search').fill('PROD-1');
  await page.getByTestId('global-suggestion-PROD-1').dispatchEvent('mousedown');
  await expect(page.getByTestId('item-0-precioUnitario')).toHaveValue('10.00');
  await page.getByTestId('item-0-cantidad').fill('2');
  await page.locator('#descuento').fill('5');

  // Submit
  await page.getByRole('button', { name: 'Registrar' }).click();
  const postResp = await page.waitForResponse(r => r.url().includes('/api/compras') && r.request().method() === 'POST', { timeout: 5000 });
  console.log('[E2E] POST /api/compras status:', postResp.status());

  // Modal closes; list updates
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toHaveCount(0);
  // Row contains provider, status and total
  await expect(page.getByRole('row', { name: /Proveedor E2E/i })).toBeVisible();
  await expect(page.getByRole('table').getByText(/Pendiente/)).toBeVisible();
  await expect(page.getByRole('table').getByText(/15\.00/)).toBeVisible();
});