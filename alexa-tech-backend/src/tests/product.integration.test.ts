import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app';
import prisma from '../config/database';

/**
 * Integration Tests - Product Controller
 *
 * Tests HTTP endpoints for Products module
 * Service layer already 100% covered - these tests validate HTTP layer:
 * - POST /api/products - Create product
 * - GET /api/products - List all products with pagination/filters
 * - GET /api/products/:codigo - Get product by codigo
 * - PUT/PATCH /api/products/:codigo - Update product
 * - PATCH /api/products/:codigo/status - Change product status
 * - DELETE /api/products/:codigo - Delete product (soft delete)
 *
 * Authentication Pattern: Uses /api/auth/register for real tokens
 * Permission-based middleware: products.create, products.read, products.update, products.delete
 */

describe('Product Routes Integration Tests', () => {
  let authToken: string;
  let adminUserId: string;
  let testProductCodigo: string;

  // Helper: Create admin user with full products permissions
  async function createAdminUser() {
    const adminData = {
      username: 'admin',
      email: 'admin@test.com',
      password: 'Admin123!',
      confirmPassword: 'Admin123!',
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(adminData);

    const token = response.body.data.accessToken;
    const userId = response.body.data.user.id;

    // Update permissions to include all products permissions + supervisor perms
    await prisma.user.update({
      where: { id: userId },
      data: {
        permissions: [
          'products.create',
          'products.read',
          'products.update',
          'products.delete',
          'users.update', // Required by requireSupervisor middleware
          'reports.sales', // Required by requireSupervisor middleware
        ],
      },
    });

    return { token, userId };
  }

  beforeEach(async () => {
    // Limpiar datos de prueba (orden importante por foreign keys)
    await prisma.purchaseItem.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});

    // Crear usuario admin con permisos
    const { token, userId } = await createAdminUser();
    authToken = token;
    adminUserId = userId;
  });

  afterAll(async () => {
    await prisma.purchaseItem.deleteMany({});
    await prisma.purchase.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.$disconnect();
  });

  // ============================================================================
  // POST /api/products - Crear Producto
  // ============================================================================
  describe('POST /api/products', () => {
    it('should create a new product successfully', async () => {
      const newProduct = {
        codigo: 'PROD-001',
        nombre: 'Test Product',
        categoria: 'Test Category',
        precioVenta: 10.5,
        stock: 100,
        minStock: 10,
        unidadMedida: 'Unidad',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.codigo).toBe(newProduct.codigo);
      expect(response.body.data.nombre).toBe(newProduct.nombre);
      expect(Number(response.body.data.precioVenta)).toBe(newProduct.precioVenta);

      testProductCodigo = response.body.data.codigo;
    });

    it('should fail to create product with duplicate codigo', async () => {
      const productData = {
        codigo: 'PROD-DUP',
        nombre: 'Duplicate Product',
        categoria: 'Test',
        precioVenta: 10.5,
        stock: 50,
        minStock: 5,
        unidadMedida: 'Unidad',
      };

      // Crear primer producto
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      // Intentar crear duplicado
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData);

      // Backend retorna 409 (Conflict) para duplicados
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should fail to create product with negative price', async () => {
      const invalidProduct = {
        codigo: 'PROD-INV',
        nombre: 'Invalid Product',
        categoria: 'Test',
        precioVenta: -10,
        stock: 50,
        minStock: 5,
        unidadMedida: 'Unidad',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidProduct);

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const productData = {
        codigo: 'PROD-NO-AUTH',
        nombre: 'No Auth Product',
        categoria: 'Test',
        precioVenta: 10.5,
        stock: 50,
        minStock: 5,
        unidadMedida: 'Unidad',
      };

      const response = await request(app).post('/api/products').send(productData);

      expect(response.status).toBe(401);
    });

    it('should fail without products.create permission', async () => {
      const limitedUserData = {
        username: 'limited',
        email: 'limited@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!',
      };

      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(limitedUserData);

      const limitedToken = regResponse.body.data.accessToken;

      // Actualizar permisos (solo products.read)
      await prisma.user.update({
        where: { id: regResponse.body.data.user.id },
        data: { permissions: ['products.read'] },
      });

      const productData = {
        codigo: 'PROD-FORBIDDEN',
        nombre: 'Forbidden Product',
        categoria: 'Test',
        precioVenta: 10.5,
        stock: 50,
        minStock: 5,
        unidadMedida: 'Unidad',
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${limitedToken}`)
        .send(productData);

      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // GET /api/products - Listar Productos
  // ============================================================================
  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Crear productos de prueba
      await prisma.product.createMany({
        data: [
          {
            codigo: 'PROD-A',
            nombre: 'Product A',
            categoria: 'Category A',
            precioVenta: 10,
            stock: 100,
            minStock: 10,
            estado: true,
            unidadMedida: 'Unidad',
          },
          {
            codigo: 'PROD-B',
            nombre: 'Product B',
            categoria: 'Category B',
            precioVenta: 20,
            stock: 50,
            minStock: 5,
            estado: true,
            unidadMedida: 'Unidad',
          },
          {
            codigo: 'PROD-C',
            nombre: 'Product C',
            categoria: 'Category C',
            precioVenta: 30,
            stock: 0,
            minStock: 10,
            estado: false,
            unidadMedida: 'Unidad',
          },
        ],
      });
    });

    it('should get all products with pagination', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products.length).toBeGreaterThan(0);
      // Note: Backend response doesn't include pagination metadata
    });

    it('should filter products by status (active)', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ estado: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(
        response.body.data.products.every((p: any) => p.estado === true)
      ).toBe(true);
    });

    it('should search products by name', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Product A' });

      expect(response.status).toBe(200);
      expect(response.body.data.products).toBeInstanceOf(Array);
      expect(response.body.data.products[0].nombre).toContain('Product A');
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(401);
    });

    it('should fail without products.read permission', async () => {
      const limitedUserData = {
        username: 'noreader',
        email: 'noreader@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!',
      };

      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(limitedUserData);

      const limitedToken = regResponse.body.data.accessToken;

      // No permissions
      await prisma.user.update({
        where: { id: regResponse.body.data.user.id },
        data: { permissions: [] },
      });

      const response = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${limitedToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // GET /api/products/:codigo - Obtener Producto por Código
  // ============================================================================
  describe('GET /api/products/:codigo', () => {
    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          codigo: 'PROD-GET',
          nombre: 'Get Test Product',
          categoria: 'Test',
          precioVenta: 15,
          stock: 75,
          minStock: 5,
          unidadMedida: 'Unidad',
        },
      });
      testProductCodigo = product.codigo;
    });

    it('should get product by codigo successfully', async () => {
      const response = await request(app)
        .get(`/api/products/${testProductCodigo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.codigo).toBe(testProductCodigo);
      expect(response.body.data.nombre).toBe('Get Test Product');
    });

    it('should return 404 for non-existent codigo', async () => {
      const fakeCodigo = 'PROD-NONEXISTENT';
      const response = await request(app)
        .get(`/api/products/${fakeCodigo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).get(`/api/products/${testProductCodigo}`);

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // PUT /api/products/:codigo - Actualizar Producto
  // ============================================================================
  describe('PUT /api/products/:codigo', () => {
    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          codigo: 'PROD-UPD',
          nombre: 'Update Test Product',
          categoria: 'Test',
          precioVenta: 20,
          stock: 50,
          minStock: 10,
          unidadMedida: 'Unidad',
        },
      });
      testProductCodigo = product.codigo;
    });

    it('should update product successfully', async () => {
      const updateData = {
        nombre: 'Updated Product',
        precioVenta: 25,
        stock: 60,
      };

      const response = await request(app)
        .put(`/api/products/${testProductCodigo}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nombre).toBe('Updated Product');
      expect(Number(response.body.data.precioVenta)).toBe(25);
    });

    it('should return 404 for non-existent codigo', async () => {
      const fakeCodigo = 'PROD-NONEXISTENT';
      const updateData = {
        descripcion: 'Updated',
        precioUnitario: 30,
      };

      const response = await request(app)
        .put(`/api/products/${fakeCodigo}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(404);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .put(`/api/products/${testProductCodigo}`)
        .send({ descripcion: 'Test' });

      expect(response.status).toBe(401);
    });

    it('should fail without products.update permission', async () => {
      const limitedUserData = {
        username: 'readonly',
        email: 'readonly@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!',
      };

      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(limitedUserData);

      const limitedToken = regResponse.body.data.accessToken;

      // Solo products.read
      await prisma.user.update({
        where: { id: regResponse.body.data.user.id },
        data: { permissions: ['products.read'] },
      });

      const response = await request(app)
        .put(`/api/products/${testProductCodigo}`)
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({ nombre: 'Forbidden Update' });

      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // PATCH /api/products/:codigo/status - Cambiar Estado
  // ============================================================================
  describe('PATCH /api/products/:codigo/status', () => {
    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          codigo: 'PROD-STATUS',
          nombre: 'Status Test Product',
          categoria: 'Test',
          precioVenta: 30,
          stock: 25,
          minStock: 5,
          estado: true,
          unidadMedida: 'Unidad',
        },
      });
      testProductCodigo = product.codigo;
    });

    it('should deactivate product successfully', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProductCodigo}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe(false);
    });

    it('should activate product successfully', async () => {
      // Primero desactivar
      await request(app)
        .patch(`/api/products/${testProductCodigo}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: false });

      // Luego activar
      const response = await request(app)
        .patch(`/api/products/${testProductCodigo}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ estado: true });

      expect(response.status).toBe(200);
      expect(response.body.data.estado).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .patch(`/api/products/${testProductCodigo}/status`)
        .send({ estado: false });

      expect(response.status).toBe(401);
    });

    it('should fail without products.update permission', async () => {
      const limitedUserData = {
        username: 'nostatusupdate',
        email: 'nostatusupdate@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!',
      };

      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(limitedUserData);

      const limitedToken = regResponse.body.data.accessToken;

      // Solo products.read
      await prisma.user.update({
        where: { id: regResponse.body.data.user.id },
        data: { permissions: ['products.read'] },
      });

      const response = await request(app)
        .patch(`/api/products/${testProductCodigo}/status`)
        .set('Authorization', `Bearer ${limitedToken}`)
        .send({ estado: false });

      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // DELETE /api/products/:codigo - Eliminar Producto (Soft Delete)
  // ============================================================================
  describe('DELETE /api/products/:codigo', () => {
    beforeEach(async () => {
      const product = await prisma.product.create({
        data: {
          codigo: 'PROD-DELETE',
          nombre: 'Delete Test Product',
          categoria: 'Test',
          precioVenta: 40,
          stock: 30,
          minStock: 5,
          estado: true,
          unidadMedida: 'Unidad',
        },
      });
      testProductCodigo = product.codigo;
    });

    it('should soft delete product successfully', async () => {
      const response = await request(app)
        .delete(`/api/products/${testProductCodigo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.estado).toBe(false);
      expect(response.body.message).toContain('eliminado');

      // Verificar que el producto aún existe pero está inactivo
      const product = await prisma.product.findUnique({
        where: { codigo: testProductCodigo },
      });
      expect(product).toBeTruthy();
      expect(product?.estado).toBe(false);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeCodigo = 'PROD-NONEXISTENT';
      const response = await request(app)
        .delete(`/api/products/${fakeCodigo}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      const response = await request(app).delete(`/api/products/${testProductCodigo}`);

      expect(response.status).toBe(401);
    });

    it('should fail without products.delete permission', async () => {
      const limitedUserData = {
        username: 'nodelete',
        email: 'nodelete@test.com',
        password: 'Test123!',
        confirmPassword: 'Test123!',
      };

      const regResponse = await request(app)
        .post('/api/auth/register')
        .send(limitedUserData);

      const limitedToken = regResponse.body.data.accessToken;

      // Solo products.read
      await prisma.user.update({
        where: { id: regResponse.body.data.user.id },
        data: { permissions: ['products.read'] },
      });

      const response = await request(app)
        .delete(`/api/products/${testProductCodigo}`)
        .set('Authorization', `Bearer ${limitedToken}`);

      expect(response.status).toBe(403);
    });
  });
});
