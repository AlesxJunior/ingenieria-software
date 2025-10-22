import { test, expect, Page } from '@playwright/test';

// Helpers reused from patterns in purchases-validations and backend-errors specs
const login = async (page: Page) => {
  await page.addInitScript(() => {
    // Create a non-expiring-looking JWT payload that atob can decode
    const expPayload = 'eyJleHAiOjQxMDI0NDQ4MDAwfQ=='; // {"exp":4102444800}
    const fakeJwt = `hdr.${expPayload}.sig`;
    localStorage.setItem('authToken', fakeJwt);
    localStorage.setItem('alexatech_token', fakeJwt);
    localStorage.setItem('alexatech_refresh_token', 'e2e-refresh');
  });
};

const stubAuth = async (page: Page) => {
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'OK',
        data: {
          id: 'user-e2e',
          username: 'e2e.user',
          email: 'e2e@alexa.tech',
          firstName: 'E2E',
          lastName: 'User',
          isActive: true,
          permissions: ['purchases.create', 'purchases.read']
        }
      })
    });
  });
};

const stubProviders = async (page: Page) => {
  await page.route('**/api/entidades*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'OK',
        data: {
          clients: [
            {
              id: 'prov-1',
              tipoEntidad: 'Proveedor',
              razonSocial: 'Proveedor E2E',
              email: 'proveedor@e2e.test',
              telefono: '999999999',
              tipoDocumento: 'RUC',
              numeroDocumento: '12345678901',
              direccion: 'Av. Test 123',
              ciudad: 'Lima',
              departamentoId: '15',
              provinciaId: '127',
              distritoId: '1401',
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalClients: 1,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      })
    });
  });
};

const stubProductsSingle = async (page: Page) => {
  await page.route('**/api/productos*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'OK',
        data: {
          products: [
            {
              codigo: 'PRD-1',
              nombre: 'Producto E2E',
              categoria: 'Accesorios',
              precioVenta: 15,
              stock: 100,
              estado: true,
              unidadMedida: 'unidad',
              ubicacion: 'Almacén A',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          total: 1,
          filters: {}
        }
      })
    });
  });
};

const stubPurchasesList = async (page: Page, list: any[]) => {
  await page.route('**/api/compras*', async route => {
    const method = route.request().method().toUpperCase();
    if (method !== 'GET') {
      // Allow non-GET (e.g., POST create) to be handled elsewhere
      await route.fallback();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        message: 'OK',
        data: {
          purchases: list,
          total: list.length,
          filters: {}
        }
      })
    });
  });
};

const fillCommonFields = async (page: Page) => {
  await page.locator('#proveedorId').selectOption({ value: 'prov-1' });
  await page.locator('#almacenId').selectOption({ value: 'ALM-001' });
  await page.locator('#fechaEmision').fill(new Date().toISOString().slice(0,10));
  // Add one item using global search
  await page.locator('#items-global-search').fill('PRD-1');
  await page.getByTestId('global-suggestion-PRD-1').click();
  // Remove default empty item row if present
  const prodId0 = page.getByTestId('item-0-productoId');
  const val0 = await prodId0.inputValue();
  if (!val0) {
    await page.getByTestId('item-0-remove').click();
  }
  // Ensure quantity set on the first (valid) row
  await page.getByTestId('item-0-cantidad').fill('1');
};

const openNewPurchaseModal = async (page: Page) => {
  await page.goto('/compras');
  await expect(page.getByRole('heading', { name: 'Lista de Compras', level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva Compra' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toBeVisible();
};

const interceptCreateAndAssertFormaPago = async (page: Page, formaPago: string) => {
  let capturedBody: any = null;
  await page.route('**/api/compras', async route => {
    const req = route.request();
    const method = req.method().toUpperCase();
    if (method !== 'POST') {
      await route.fallback();
      return;
    }
    try {
      capturedBody = JSON.parse(req.postData() || '{}');
    } catch (_) {}
    // respond with created purchase (ApiResponse shape)
    const created = {
      id: 'compra-e2e-1',
      proveedorId: capturedBody?.proveedorId || 'prov-1',
      almacenId: capturedBody?.almacenId || 'ALM-001',
      fechaEmision: capturedBody?.fechaEmision || new Date().toISOString().slice(0,10),
      items: capturedBody?.items || [],
      formaPago: capturedBody?.formaPago || null,
      total: 15,
      estado: 'Pendiente'
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: created })
    });
  });
  return {
    getCaptured: () => capturedBody,
    assert: async () => {
      expect(capturedBody?.formaPago).toBe(formaPago);
    }
  };
};

// Before each: login and base stubs
test.beforeEach(async ({ page }) => {
  await stubAuth(page);
  await stubProviders(page);
  await stubProductsSingle(page);
  await stubPurchasesList(page, []); // initial list fetch
  await login(page);
});

for (const method of ['Efectivo', 'Tarjeta', 'Transferencia']) {
  test(`Crear compra con formaPago=${method} debe funcionar y persistir`, async ({ page }) => {
    await openNewPurchaseModal(page);

    // Intercept create to capture payload and respond
    const intercept = await interceptCreateAndAssertFormaPago(page, method);

    // Fill form
    await fillCommonFields(page);
    await page.getByLabel('Forma de Pago').selectOption(method);

    // After successful create, ListaCompras fetches again; return list with created purchase
    await stubPurchasesList(page, [{ id: 'compra-e2e-1', proveedorId: 'prov-1', total: 15, estado: 'Pendiente', formaPago: method }]);

    // Submit
    await page.getByRole('button', { name: 'Registrar' }).click();

    // Modal closes
    await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toHaveCount(0);

    // Assert payload
    await intercept.assert();

    // UI refreshed shows a row including provider text
    await expect(page.getByRole('row', { name: /Proveedor E2E/i })).toBeVisible();
  });
}

test('Validación UI: Forma de pago requerida', async ({ page }) => {
  await openNewPurchaseModal(page);
  await fillCommonFields(page);
  // No seleccionar forma de pago
  await page.getByLabel('Forma de Pago').selectOption('');
  // Intentar guardar
  await page.getByRole('button', { name: 'Registrar' }).click();
  // Debe mostrar error junto al campo
  await expect(page.locator('form').getByText('Forma de pago requerida')).toBeVisible();
  // Modal permanece abierto
  await expect(page.getByRole('heading', { name: 'Registrar Compra' })).toBeVisible();
});