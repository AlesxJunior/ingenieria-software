import { test, expect, Page } from '@playwright/test';

// Seeded admin user credentials (stubbed)
const admin = { email: 'admin@alexatech.com', password: 'admin123' };

async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto('/login');
  await page.locator('#email').fill(creds.email);
  await page.locator('#password').fill(creds.password);
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

// E2E: Autocomplete de productos en Registrar/Editar Compra
// Verifica búsqueda, selección, validación de stock y filas duplicadas
test('Autocomplete de producto: buscar, seleccionar, validar stock y duplicados', async ({ page }) => {
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

  // Stub productos para el autocomplete (según ProductProvider mapping)
  const products = [
    { codigo: 'PROD-1', nombre: 'Laptop Pro 14', precioVenta: 1200, stock: 5, estado: true, unidadMedida: 'unidad', categoria: 'Laptops', ubicacion: 'A1' },
    { codigo: 'PROD-2', nombre: 'Mouse Wireless', precioVenta: 25, stock: 100, estado: true, unidadMedida: 'unidad', categoria: 'Periféricos', ubicacion: 'B2' },
    { codigo: 'PROD-3', nombre: 'Monitor CRT 17"', precioVenta: 80, stock: 0, estado: false, unidadMedida: 'unidad', categoria: 'Monitores', ubicacion: 'C3' },
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

  // Buscar producto global y verificar sugerencias
  await page.getByTestId('items-global-search').fill('PROD');
  const suggestList = page.getByTestId('items-global-suggestions');
  await expect(suggestList).toBeVisible();
  const suggestion = page.getByTestId('global-suggestion-PROD-1');
  await expect(suggestion).toBeVisible();
  await expect(suggestion.getByText('PROD-1')).toBeVisible();
  await expect(suggestion.getByText('Laptop Pro 14')).toBeVisible();
  await expect(suggestion.getByText(/Stock: 5/)).toBeVisible();
  await expect(suggestion.getByText(/Precio: 1200\.00/)).toBeVisible();

  // Seleccionar producto activo y verificar auto-llenado
  await suggestion.dispatchEvent('mousedown');
  await expect(page.getByTestId('item-0-productoId')).toHaveValue('PROD-1');
  await expect(page.getByTestId('item-0-nombreProducto')).toHaveValue('Laptop Pro 14');
  await expect(page.getByTestId('item-0-precioUnitario')).toHaveValue('1200.00');
  await expect(page.getByTestId('item-0-subtotal')).toHaveValue('1200.00');

  // Validación: cantidad no debe exceder stock disponible
  await page.getByTestId('item-0-cantidad').fill('6');
  await expect(page.getByText('Cantidad no puede superar stock disponible (5)')).toBeVisible();

  // Corregir cantidad y verificar actualización de subtotal/total
  await page.getByTestId('item-0-cantidad').fill('2');
  await expect(page.getByTestId('item-0-subtotal')).toHaveValue('2400.00');
  await expect(page.getByTestId('totals-subtotal')).toHaveValue('2400.00');

  // Duplicado: seleccionar mismo producto nuevamente debe incrementar cantidad
  await page.getByTestId('add-item').click();
  await page.getByTestId('items-global-search').fill('PROD');
  await expect(page.getByTestId('global-suggestion-PROD-1')).toBeVisible({ timeout: 10000 });
  await page.getByTestId('global-suggestion-PROD-1').dispatchEvent('mousedown');
  await expect(page.getByTestId('item-0-cantidad')).toHaveValue('3');
  await expect(page.getByTestId('totals-subtotal')).toHaveValue('3600.00');

  // Selección de producto descontinuado muestra error y no auto-llena
  await page.getByTestId('add-item').click();
  await page.getByTestId('items-global-search').fill('PROD-3');
  await page.getByTestId('global-suggestion-PROD-3').dispatchEvent('mousedown');
  await expect(page.getByText('Producto descontinuado')).toBeVisible();

  // Aplicar descuento y verificar total
  await page.locator('#descuento').fill('100');
  await expect(page.getByTestId('totals-final')).toHaveValue('3500.00');

  // Cerrar modal sin registrar
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toHaveCount(0);
});