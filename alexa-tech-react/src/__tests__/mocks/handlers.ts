import { http, HttpResponse } from 'msw';
import type { User } from '../../types/shared';

const BASE_URL = 'http://localhost:3001/api';

// Mock data
export const mockUsers = {
  admin: {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    isActive: true,
    lastAccess: new Date(),
    role: {
      id: 1,
      name: 'Administrador',
      permissions: [
        'dashboard.read',
        'products.read',
        'products.create',
        'products.update',
        'products.delete',
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'sales.read',
        'sales.create',
        'sales.update',
        'purchases.read',
        'purchases.create',
        'inventory.read',
        'inventory.update',
      ],
    },
    permissions: [
      'dashboard.read',
      'products.read',
      'products.create',
      'products.update',
      'products.delete',
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'sales.read',
      'sales.create',
      'sales.update',
      'purchases.read',
      'purchases.create',
      'inventory.read',
      'inventory.update',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any as User,
  vendedor: {
    id: '2',
    username: 'vendedor',
    email: 'vendedor@example.com',
    firstName: 'Vendedor',
    lastName: 'User',
    isActive: true,
    lastAccess: new Date(),
    role: {
      id: 2,
      name: 'Vendedor',
      permissions: ['dashboard.read', 'sales.read', 'sales.create', 'products.read'],
    },
    permissions: ['dashboard.read', 'sales.read', 'sales.create', 'products.read'],
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any as User,
};

export const mockProducts = [
  {
    id: '1',
    code: 'PROD001',
    name: 'Producto Test 1',
    description: 'Descripción del producto 1',
    price: 100.5,
    cost: 50.25,
    stock: 10,
    minStock: 5,
    category: { id: 1, name: 'Categoría 1' },
    unit: 'unidad',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    code: 'PROD002',
    name: 'Producto Test 2',
    description: 'Descripción del producto 2',
    price: 200.75,
    cost: 100.5,
    stock: 20,
    minStock: 10,
    category: { id: 2, name: 'Categoría 2' },
    unit: 'unidad',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as any[];

export const mockClients = [
  {
    id: '1',
    name: 'Cliente Test 1',
    email: 'cliente1@example.com',
    phone: '123456789',
    address: 'Dirección 1',
    documentType: 'DNI',
    documentNumber: '12345678',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Cliente Test 2',
    email: 'cliente2@example.com',
    phone: '987654321',
    address: 'Dirección 2',
    documentType: 'RUC',
    documentNumber: '20123456789',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as any[];

export const mockWarehouses = [
  {
    id: 'WH-PRINCIPAL',
    name: 'Almacén Principal',
    location: 'Lima',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'WH-SECUNDARIO',
    name: 'Almacén Secundario',
    location: 'Callao',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
] as any[];

// MSW Handlers
export const handlers = [
  // Auth endpoints
  http.get(`${BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: mockUsers.admin,
    });
  }),

  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { username: string; password: string };
    
    if (body.username === 'admin' && body.password === 'admin123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUsers.admin,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }
    
    if (body.username === 'vendedor' && body.password === 'vendedor123') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockUsers.vendedor,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Credenciales inválidas',
      },
      { status: 401 }
    );
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sesión cerrada correctamente',
    });
  }),

  // Users endpoints
  http.get(`${BASE_URL}/users`, () => {
    return HttpResponse.json({
      success: true,
      data: Object.values(mockUsers),
    });
  }),

  http.get(`${BASE_URL}/users/:id`, ({ params }) => {
    const { id } = params;
    const user = Object.values(mockUsers).find((u) => u.id === id || u.id === String(id));
    
    if (user) {
      return HttpResponse.json({
        success: true,
        data: user,
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Usuario no encontrado',
      },
      { status: 404 }
    );
  }),

  http.post(`${BASE_URL}/users`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { id: 3, ...body },
    });
  }),

  // Products endpoints
  http.get(`${BASE_URL}/products`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    let products = mockProducts;
    
    if (search) {
      products = mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.code.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: products,
    });
  }),

  http.get(`${BASE_URL}/products/:id`, ({ params }) => {
    const { id } = params;
    const product = mockProducts.find((p) => p.id === id || p.id === String(id));
    
    if (product) {
      return HttpResponse.json({
        success: true,
        data: product,
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Producto no encontrado',
      },
      { status: 404 }
    );
  }),

  http.post(`${BASE_URL}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { id: 3, ...body },
    });
  }),

  // Clients endpoints
  http.get(`${BASE_URL}/clients`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    
    let clients = mockClients;
    
    if (search) {
      clients = mockClients.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.documentNumber.includes(search)
      );
    }
    
    return HttpResponse.json({
      success: true,
      data: clients,
    });
  }),

  http.get(`${BASE_URL}/clients/:id`, ({ params }) => {
    const { id } = params;
    const client = mockClients.find((c) => c.id === id || c.id === String(id));
    
    if (client) {
      return HttpResponse.json({
        success: true,
        data: client,
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Cliente no encontrado',
      },
      { status: 404 }
    );
  }),

  http.post(`${BASE_URL}/clients`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { id: 3, ...body },
    });
  }),

  // Warehouses endpoints
  http.get(`${BASE_URL}/warehouses`, () => {
    return HttpResponse.json({
      success: true,
      data: mockWarehouses,
    });
  }),

  http.get(`${BASE_URL}/warehouses/:id`, ({ params }) => {
    const { id } = params;
    const warehouse = mockWarehouses.find((w) => w.id === id || w.id === String(id));
    
    if (warehouse) {
      return HttpResponse.json({
        success: true,
        data: warehouse,
      });
    }
    
    return HttpResponse.json(
      {
        success: false,
        message: 'Almacén no encontrado',
      },
      { status: 404 }
    );
  }),

  // Sales endpoints
  http.get(`${BASE_URL}/sales`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post(`${BASE_URL}/sales`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { id: 1, ...body },
    });
  }),

  // Purchases endpoints
  http.get(`${BASE_URL}/purchases`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.post(`${BASE_URL}/purchases`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: { id: 1, ...body },
    });
  }),

  // Inventory endpoints
  http.get(`${BASE_URL}/inventory`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.get(`${BASE_URL}/inventory/:productId`, ({ params }) => {
    const { productId } = params;
    return HttpResponse.json({
      success: true,
      data: {
        productId: Number(productId),
        stock: 100,
        minStock: 10,
      },
    });
  }),

  // Kardex endpoints
  http.get(`${BASE_URL}/kardex`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),

  http.get(`${BASE_URL}/kardex/movements`, () => {
    return HttpResponse.json({
      success: true,
      data: [],
    });
  }),
];
