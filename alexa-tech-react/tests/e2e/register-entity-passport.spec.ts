import { test, expect, Page } from '@playwright/test';

// Seeded admin user from prisma seed
const admin = { email: 'admin@alexatech.com', password: 'admin123' };

async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto('/login');
  await page.getByLabel('Correo Electrónico').fill(creds.email);
  await page.getByLabel('Contraseña').fill(creds.password);
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
}

async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('alexatech_token');
    localStorage.removeItem('alexatech_refresh_token');
    localStorage.removeItem('alexatech_user');
  });
  await page.goto('/login');
  await expect(page).toHaveURL(/.*login/);
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

// E2E: Register new entity with Pasaporte via modal on ListaEntidades
test('Admin can register new entity with Pasaporte via modal', async ({ page }) => {
  // Stub API routes: auth and entidades
  const fakeUser = {
    id: 'user-1',
    username: 'admin',
    email: admin.email,
    firstName: 'Admin',
    lastName: 'Root',
    isActive: true,
    permissions: [
      'dashboard.read',
      'commercial_entities.read',
      'commercial_entities.create',
      'commercial_entities.update',
      'commercial_entities.delete'
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

  const clients: any[] = [];
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
    if (req.method() === 'POST') {
      const body = await req.postDataJSON();
      const newClient = { id: `c-${Date.now()}`, ...body, isActive: true };
      clients.push(newClient);
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Entidad creada', data: newClient })
      });
    }
    return route.continue();
  });
  await page.route('**/api/ubigeo/departamentos', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: { departamentos: [{ id: 'dep-lima', nombre: 'Lima' }] } })
    });
  });
  await page.route('**/api/ubigeo/departamentos/dep-lima/provincias', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: { provincias: [{ id: 'prov-lima', nombre: 'Lima', departamentoId: 'dep-lima' }] } })
    });
  });
  await page.route('**/api/ubigeo/provincias/prov-lima/distritos', async route => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'OK', data: { distritos: [{ id: 'dist-miraflores', nombre: 'Miraflores', provinciaId: 'prov-lima' }] } })
    });
  });

  await login(page, admin);
  // Navigate via sidebar to ensure SPA routing and state
  await page.getByRole('complementary').getByRole('link', { name: 'Entidades Comerciales' }).click();
  await page.getByRole('complementary').getByRole('link', { name: 'Lista de Entidades' }).click();
  await expect(page.getByRole('heading', { name: 'Entidades Comerciales' })).toBeVisible();

  // Open modal
  await expect(page.getByRole('button', { name: 'Nueva Entidad' })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva Entidad' }).click();
  await expect(page.getByRole('heading', { name: 'Registrar Nueva Entidad Comercial' })).toBeVisible();

  // Prepare unique data
  const unique = Date.now();
  const email = `e2e.passport.${unique}@example.com`;

  // Fill form
  await selectByLabelCI(page, '#tipoEntidad', 'Cliente');
  await selectByLabelCI(page, '#tipoDocumento', 'Pasaporte');
  await page.locator('#numeroDocumento').fill('a1234567'); // lower-case to verify normalization
  await page.locator('#nombres').fill('E2E Passport');
  await page.locator('#apellidos').fill('User');
  await page.locator('#email').fill(email);
  await page.locator('#telefono').fill('987654321');
  await page.locator('#direccion').fill('E2E Street 123');
  // Seleccionar Ubigeo (Departamento/Provincia/Distrito)
  const depSelect = page.locator('#departamentoId:visible');
  const provSelect = page.locator('#provinciaId:visible');
  const distSelect = page.locator('#distritoId:visible');
  await depSelect.waitFor();
  await expect(depSelect).toBeEnabled();
  await depSelect.selectOption({ label: 'Lima' });
  await expect(provSelect).toBeEnabled();
  await provSelect.selectOption({ label: 'Lima' });
  await expect(distSelect).toBeEnabled();
  await distSelect.selectOption({ label: 'Miraflores' });

  // Submit
  await page.getByRole('button', { name: 'Registrar Entidad' }).click();

  // Modal should close; list should update
  await expect(page.getByRole('heading', { name: 'Registrar Nueva Entidad Comercial' })).toHaveCount(0);
  await expect(page.getByRole('table').getByRole('cell', { name: email })).toBeVisible();
  // Lista muestra solo dígitos para Pasaporte
  await expect(page.getByRole('table').getByRole('cell', { name: 'Pasaporte 1234567' })).toBeVisible();

  await logout(page);
});