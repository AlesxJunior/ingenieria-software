import { test, expect } from '@playwright/test';

// Seeded supervisor user from prisma seed
const email = 'supervisor@alexatech.com';
const password = 'supervisor123';

test('Login and register a new product via modal', async ({ page }) => {
  // Helper: select option by label case-insensitively
  const selectByLabelCI = async (selector: string, label: string) => {
    const value = await page.locator(selector).evaluate((select, target) => {
      const opts = Array.from((select as HTMLSelectElement).options);
      const match = opts.find(o => (o.textContent || '').trim().toLowerCase() === target.toLowerCase());
      return match ? match.value : null;
    }, label);
    if (value) {
      await page.locator(selector).selectOption(value);
    } else {
      throw new Error(`Option with label "${label}" not found for ${selector}`);
    }
  };
  // Login
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Assert dashboard loaded
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Navigate directly to product list
  await page.goto('/lista-productos');
  await expect(page.getByRole('heading', { level: 1, name: 'Lista de Productos' })).toBeVisible();

  // Open Nuevo Producto modal
  await page.getByRole('button', { name: 'Nuevo Producto' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Producto' })).toBeVisible();

  // Prepare unique product data
  const unique = Date.now();
  const code = `E2E-${unique}`;
  const name = `Producto E2E ${unique}`;

  // Fill form fields
  await page.locator('#productCode').fill(code);
  await page.locator('#productName').fill(name);
  await selectByLabelCI('#category', 'Cámaras');
  await page.locator('#price').fill('199.99');
  await page.locator('#initialStock').fill('5');
  await selectByLabelCI('#unit', 'Unidad');
  await selectByLabelCI('#warehouseId', 'Almacén A');

  // Submit
  await page.getByRole('button', { name: 'Registrar' }).click();

  // Modal should close; expect product appears in table
  await expect(page.getByRole('row', { name: new RegExp(`${code}.*${name}`) })).toBeVisible();
});