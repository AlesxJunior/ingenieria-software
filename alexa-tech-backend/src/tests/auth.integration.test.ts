import request from 'supertest';
import app from '../app';
import { prisma } from '../config/database';

// Limpiar la base de datos antes de cada prueba y desconectar al final
beforeEach(async () => {
  await prisma.user.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

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
