import { test, expect } from '@playwright/test';

// Seeded users from prisma seed
const admin = { email: 'admin@alexatech.com', password: 'admin123' };
const supervisor = { email: 'supervisor@alexatech.com', password: 'supervisor123' };
const vendedor = { email: 'vendedor@alexatech.com', password: 'vendedor123' };

async function login(page: any, creds: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(creds.email);
  await page.getByLabel('Contraseña').fill(creds.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function logout(page: any) {
  // Limpiar tokens y usuario del almacenamiento para cerrar sesión
  await page.evaluate(() => {
    localStorage.removeItem('alexatech_token');
    localStorage.removeItem('alexatech_refresh_token');
    localStorage.removeItem('alexatech_user');
  });
  await page.goto('/login');
  await expect(page).toHaveURL(/.*login/);
}

test.describe('Permisos de Usuarios', () => {
  test('Vendedor: acceso denegado a Lista de Usuarios', async ({ page }) => {
    await login(page, vendedor);
    await page.goto('/usuarios');
    await expect(page.getByText('No tienes permisos para acceder a esta página.')).toBeVisible();
    await logout(page);
  });

  test('Supervisor: puede ver lista, pero no crear usuario (API bloquea)', async ({ page }) => {
    await login(page, supervisor);
    await page.goto('/usuarios');
    await expect(page.getByRole('heading', { name: 'Lista de Usuarios' }).first()).toBeVisible();

    // Abrir modal de nuevo usuario
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toBeVisible();

    const unique = Date.now();
    const username = `e2e-supervisor-${unique}`;
    const email = `e2e.supervisor.${unique}@example.com`;

    // Completar formulario
    await page.locator('#username').fill(username);
    await page.locator('#email').fill(email);
    await page.locator('#firstName').fill('E2E');
    await page.locator('#lastName').fill('Supervisor');
    await page.locator('#password').fill('Sup3rvisor#123');
    await page.locator('#confirmPassword').fill('Sup3rvisor#123');
    await page.locator('#isActive').check();
    // Seleccionar algunos permisos
    await page.locator('#users\\.read').check();
    await page.locator('#products\\.read').check();

    // Intentar crear
    await page.getByRole('button', { name: 'Crear Usuario' }).click();

    // Modal debe permanecer abierto por error de permiso (403)
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toBeVisible();

    // Cerrar modal
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toHaveCount(0);

    // El usuario NO debe aparecer en la tabla
    await expect(page.getByText(email)).toHaveCount(0);

    await logout(page);
  });

  test('Admin: puede crear un nuevo usuario', async ({ page }) => {
    await login(page, admin);
    await page.goto('/usuarios');
    await expect(page.getByRole('heading', { name: 'Lista de Usuarios' }).first()).toBeVisible();

    // Abrir modal
    await page.getByRole('button', { name: 'Nuevo Usuario' }).click();
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toBeVisible();

    const unique = Date.now();
    const username = `e2e-admin-${unique}`;
    const email = `e2e.admin.${unique}@example.com`;

    // Completar formulario
    await page.locator('#username').fill(username);
    await page.locator('#email').fill(email);
    await page.locator('#firstName').fill('E2E');
    await page.locator('#lastName').fill('Admin');
    await page.locator('#password').fill('Adm1n#12345');
    await page.locator('#confirmPassword').fill('Adm1n#12345');
    await page.locator('#isActive').check();
    // Permisos mínimos
    await page.locator('#users\\.read').check();
    await page.locator('#products\\.read').check();

    // Crear
    await page.getByRole('button', { name: 'Crear Usuario' }).click();

    // Modal debe cerrarse tras éxito
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toHaveCount(0);

    // El nuevo usuario debe aparecer en la tabla
    await expect(page.getByText(email)).toBeVisible();

    await logout(page);
  });
});