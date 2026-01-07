import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';

// Limpiar la base de datos antes de cada prueba
beforeEach(async () => {
  await prisma.user.deleteMany({});
});

// Nota: No desconectar Prisma en afterAll para no interferir con otras suites
// Si se requiere teardown global, usar la configuración de Jest global setup/teardown

describe('Auth Routes: POST /api/auth/register', () => {
  const newUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  it('should register a new user successfully and return tokens', async () => {
    // Act: Realizar la petición a la API
    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    // Assert: Verificar la respuesta de la API
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Registro exitoso');
    expect(response.body.data.user.email).toBe(newUser.email);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();

    // Assert: Verificar que el usuario fue creado en la base de datos
    const dbUser = await prisma.user.findUnique({
      where: { email: newUser.email },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser?.username).toBe(newUser.username);
    // Verificar que la contraseña está hasheada y no en texto plano
    expect(dbUser?.password).not.toBe(newUser.password);
  });

  it('should return a 409 conflict error if the email already exists', async () => {
    // Arrange: Crear un usuario directamente en la BD
    await prisma.user.create({
      data: {
        username: 'existinguser',
        email: newUser.email, // Mismo email
        password: 'somehashedpassword',
        firstName: '',
        lastName: '',
      },
    });

    // Act: Intentar registrar el mismo usuario a través de la API
    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser);

    // Assert: Verificar la respuesta de error
    expect(response.status).toBe(409); // 409 Conflict
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('El email ya está registrado');
  });

  it('should return a 400 validation error if passwords do not match', async () => {
    // Act: Realizar la petición con contraseñas que no coinciden
    const response = await request(app)
      .post('/api/auth/register')
      .send({ ...newUser, confirmPassword: 'wrongpassword' });

    // Assert: Verificar la respuesta de error de validación
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Errores de validación');
    expect(response.body).toHaveProperty('error'); // Verificar que la propiedad 'error' existe
  });
});

describe('Auth Routes: POST /api/auth/login', () => {
  const testUser = {
    username: 'loginuser',
    email: 'login@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  beforeEach(async () => {
    // Crear usuario para tests de login
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('should login successfully with valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login exitoso');
    expect(response.body.data.user.email).toBe(testUser.email);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: 'wrongpassword',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app).post('/api/auth/login').send({
      password: testUser.password,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Errores de validación');
  });

  it('should return 400 for missing password', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: testUser.email,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Errores de validación');
  });

  it('should return 401 for non-existent user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'Password123!',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('Auth Routes: POST /api/auth/refresh', () => {
  let refreshToken: string;

  beforeEach(async () => {
    // Registrar y obtener refreshToken
    const response = await request(app).post('/api/auth/register').send({
      username: 'refreshuser',
      email: 'refresh@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    refreshToken = response.body.data.refreshToken;
  });

  it('should refresh token successfully with valid refreshToken', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Token renovado exitosamente');
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.refreshToken).toBeDefined();
  });

  it('should return 400 if refreshToken is missing', async () => {
    const response = await request(app).post('/api/auth/refresh').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Errores de validación');
  });

  it('should return 401 for invalid refreshToken', async () => {
    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid-token' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('Auth Routes: POST /api/auth/logout', () => {
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'logoutuser',
      email: 'logout@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    accessToken = response.body.data.accessToken;
    refreshToken = response.body.data.refreshToken;
  });

  it('should logout successfully with valid refreshToken', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Logout exitoso');
  });

  it('should logout successfully even without refreshToken', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Auth Routes: POST /api/auth/logout-all', () => {
  let accessToken: string;

  beforeEach(async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'logoutalluser',
      email: 'logoutall@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    accessToken = response.body.data.accessToken;
  });

  it('should logout from all devices successfully', async () => {
    const response = await request(app)
      .post('/api/auth/logout-all')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      'Logout de todos los dispositivos exitoso',
    );
  });

  it('should return 401 if not authenticated', async () => {
    const response = await request(app).post('/api/auth/logout-all').send({});

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('Auth Routes: GET /api/auth/me', () => {
  let accessToken: string;

  beforeEach(async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'meuser',
      email: 'me@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    accessToken = response.body.data.accessToken;
  });

  it('should return current user info when authenticated', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('me@example.com');
    expect(response.body.data.username).toBe('meuser');
  });

  it('should return 401 if not authenticated', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});

describe('Auth Routes: GET /api/auth/check-email/:email', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      username: 'checkemailuser',
      email: 'checkemail@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
  });

  it('should return exists:true for existing email', async () => {
    const response = await request(app).get(
      '/api/auth/check-email/checkemail@example.com',
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.exists).toBe(true);
  });

  it('should return exists:false for non-existing email', async () => {
    const response = await request(app).get(
      '/api/auth/check-email/nonexistent@example.com',
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.exists).toBe(false);
  });
});

describe('Auth Routes: POST /api/auth/validate-token', () => {
  let accessToken: string;

  beforeEach(async () => {
    const response = await request(app).post('/api/auth/register').send({
      username: 'validateuser',
      email: 'validate@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });
    accessToken = response.body.data.accessToken;
  });

  it('should return valid:true for valid token', async () => {
    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: accessToken });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.valid).toBe(true);
    expect(response.body.data.decoded).toBeDefined();
    expect(response.body.data.decoded.userId).toBeDefined();
  });

  it('should return valid:false for invalid token', async () => {
    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({ token: 'invalid-token-123' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.valid).toBe(false);
  });

  it('should return 400 if token is missing', async () => {
    const response = await request(app)
      .post('/api/auth/validate-token')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Errores de validación');
  });
});
