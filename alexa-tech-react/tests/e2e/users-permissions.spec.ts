import { test, expect } from '@playwright/test';

// Helpers de autenticación y stubs
const injectTokens = async (page: any) => {
  await page.addInitScript(() => {
    const expPayload = 'eyJleHAiOjQxMDI0NDQ4MDAwfQ=='; // {"exp":4102444800}
    const fakeJwt = `hdr.${expPayload}.sig`;
    localStorage.setItem('authToken', fakeJwt);
    localStorage.setItem('alexatech_token', fakeJwt);
    localStorage.setItem('alexatech_refresh_token', 'e2e-refresh');
  });
};

const stubAuth = async (page: any, permissions: string[]) => {
  const fakeUser = {
    id: 'user-e2e',
    username: 'e2e.user',
    email: 'e2e@alexa.tech',
    firstName: 'E2E',
    lastName: 'User',
    isActive: true,
    permissions,
  } as any;

  await page.route('**/api/auth/me', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: fakeUser }),
    });
  });

  await page.route('**/api/auth/login', async (route: any) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Login ok', data: { user: fakeUser, accessToken: 'fake.jwt.token', refreshToken: 'fake.refresh.token' } }),
    });
  });

  await page.route('**/api/auth/logout', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, message: 'Logout ok' }) });
  });
};

const stubUsersApi = async (page: any, opts?: { postStatus?: number }) => {
  let createdEmail: string | null = null;
  await page.route('**/api/users*', async (route: any) => {
    const req = route.request();
    const method = req.method().toUpperCase();

    if (method === 'GET') {
      const baseUsers = [
        { id: 'u1', username: 'john', email: 'john@example.com', firstName: 'John', lastName: 'Doe', isActive: true, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'u2', username: 'mary', email: 'mary@example.com', firstName: 'Mary', lastName: 'Jane', isActive: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];
      const list = createdEmail ? [...baseUsers, { id: 'new', username: 'newuser', email: createdEmail, firstName: 'Nuevo', lastName: 'Usuario', isActive: true, createdAt: '2024-01-02', updatedAt: '2024-01-02' }] : baseUsers;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'OK', data: { users: list, pagination: { currentPage: 1, totalPages: 1, totalUsers: list.length, hasNextPage: false, hasPrevPage: false } } })
      });
    }

    if (method === 'POST') {
      if (opts?.postStatus === 403) {
        return route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, message: 'No tienes permisos para crear usuarios' })
        });
      }
      let payload: any = {};
      try { payload = JSON.parse(req.postData() || '{}'); } catch {}
      createdEmail = payload?.email || null;
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Usuario creado', data: { id: 'new', ...payload } })
      });
    }

    return route.continue();
  });
};

// Tests

test.describe('Permisos de Usuarios', () => {
  test('Vendedor: acceso denegado a Lista de Usuarios', async ({ page }) => {
    await injectTokens(page);
    await stubAuth(page, ['dashboard.read']);

    await page.goto('/usuarios');
    await expect(page.getByText('No tienes permisos para acceder a esta página.')).toBeVisible();
  });

  test('Supervisor: puede ver lista, pero no crear usuario (API bloquea)', async ({ page }) => {
    await injectTokens(page);
    await stubAuth(page, ['dashboard.read', 'users.read']);
    await stubUsersApi(page, { postStatus: 403 });

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

    // El usuario NO debe aparecer en la tabla
    await expect(page.getByText(email)).toHaveCount(0);

    // Cerrar modal si sigue abierto (tolerante)
    const cancelBtn = page.getByRole('button', { name: 'Cancelar' });
    const closeHeaderBtn = page.getByRole('button', { name: 'Cerrar' });
    if (await cancelBtn.isVisible().catch(() => false)) {
      await cancelBtn.click();
      await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toHaveCount(0);
    } else if (await closeHeaderBtn.isVisible().catch(() => false)) {
      await closeHeaderBtn.click();
      await expect(page.getByRole('heading', { name: 'Crear Nuevo Usuario' })).toHaveCount(0);
    }
  });

  test('Admin: puede crear un nuevo usuario', async ({ page }) => {
    await injectTokens(page);
    await stubAuth(page, ['dashboard.read', 'users.read', 'users.create']);
    await stubUsersApi(page);

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

    // El nuevo usuario debe aparecer en la tabla (GET posterior incluye creado)
    await expect(page.getByText(email)).toBeVisible();
  });
});