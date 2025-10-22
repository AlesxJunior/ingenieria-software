import { test, expect } from '@playwright/test';

// Usaremos el usuario sembrado con permisos de compras
const email = 'supervisor@alexatech.com';
const password = 'supervisor123';
const API_BASE = 'http://localhost:3001/api';

// Utilidad: obtener token del localStorage
async function getToken(page: import('@playwright/test').Page) {
  return await page.evaluate(() => localStorage.getItem('alexatech_token'));
}

// Login por UI
async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

// Test: autentica, inserta datos vía API y valida flujos "Ver" y "Cambiar Estado"
test('Seed de compra vía API, ver detalle y cambiar estado', async ({ page, request }) => {
  // 1) Login para obtener token
  await login(page);
  const token = await getToken(page);
  expect(token).toBeTruthy();

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2) Obtener un proveedor existente (sembrado)
  const provRes = await request.get(`${API_BASE}/entidades?tipoEntidad=Proveedor&limit=1&page=1`, { headers: authHeaders });
  const provJson = await provRes.json();
  expect(provJson?.success).toBeTruthy();
  const provider = provJson?.data?.clients?.[0];
  expect(provider).toBeTruthy();

  // 3) Obtener un producto existente (sembrado)
  const prodRes = await request.get(`${API_BASE}/productos?limit=1&page=1`, { headers: authHeaders });
  const prodJson = await prodRes.json();
  expect(prodJson?.success).toBeTruthy();
  const product = prodJson?.data?.products?.[0];
  expect(product).toBeTruthy();

  // 4) Crear compra vía API
  const unique = Date.now();
  const payload = {
    proveedorId: provider.id,
    almacenId: 'ALM-001', // Se muestra como "Almacén A" en la UI
    fechaEmision: new Date().toISOString(),
    items: [
      {
        productoId: product.codigo, // backend usa el código del producto
        nombreProducto: product.nombre,
        cantidad: 2,
        precioUnitario: Number(product.precioVenta),
      },
    ],
    descuento: 5,
    observaciones: `E2E-${unique}`,
  };

  const createRes = await request.post(`${API_BASE}/compras`, {
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    data: payload,
  });
  const createJson = await createRes.json();
  expect(createJson?.success).toBeTruthy();
  const created = createJson?.data;
  expect(created?.id).toBeTruthy();
  const purchaseId = created.id as string;
  const purchaseCode = created.codigoOrden as string;

  // 5) Navegar a Compras y verificar que la compra aparezca en la lista
  await page.getByRole('complementary').getByRole('link', { name: 'Compras' }).click();
  await expect(page.getByRole('heading', { name: 'Lista de Compras', level: 1 })).toBeVisible();

  const row = page.getByRole('row', { name: new RegExp(purchaseCode) });
  await expect(row).toBeVisible();
  // Estado inicial pendiente y proveedor visible
  await expect(row.getByText('Pendiente')).toBeVisible();
  const proveedorNombre = provider.razonSocial
    ? provider.razonSocial
    : `${provider.nombres || ''} ${provider.apellidos || ''}`.trim();
  await expect(row.getByText(new RegExp(proveedorNombre, 'i'))).toBeVisible();

  // 6) Ver detalle
  await row.getByTestId('view-purchase').click();
  await expect(page.getByRole('heading', { name: 'Detalle de Compra' })).toBeVisible();
  await expect(page.locator('strong').filter({ hasText: purchaseCode })).toBeVisible();
  await expect(
    page
      .locator('div')
      .filter({ hasText: 'Proveedor:' })
      .filter({ hasText: proveedorNombre })
      .first()
  ).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();

  // 7) Cambiar estado a "Recibida"
  await row.getByTestId('change-status').click();
  await page.getByRole('radio', { name: 'Recibida' }).check();
  await page.getByRole('button', { name: 'Confirmar' }).click();

  // 8) Verificar estado actualizado en la tabla
  await expect(row.getByText('Recibida')).toBeVisible();
  await expect(row.getByTestId('change-status')).toHaveCount(0);
});