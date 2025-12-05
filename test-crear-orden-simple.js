const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

async function testCrearOrden() {
  try {
    // 1. Login
    console.log('\n🔐 LOGIN...');
    const loginResponse = await api.post('/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.accessToken;
    const userId = loginResponse.data.data.user.id;
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Login OK - User ID:', userId);

    // 2. Obtener datos
    console.log('\n📦 OBTENIENDO DATOS...');
    const proveedores = await api.get('/entidades?tipoEntidad=Proveedor&limit=1');
    const proveedor = proveedores.data.data.clients[0];
    console.log('✅ Proveedor:', proveedor.razonSocial);

    const almacenes = await api.get('/almacenes?activo=true&limit=1');
    const almacen = almacenes.data.data.rows[0];
    console.log('✅ Almacén:', almacen.nombre);

    const productos = await api.get('/productos?activo=true&limit=2');
    const producto1 = productos.data.data.products[0];
    const producto2 = productos.data.data.products[1];
    console.log('✅ Productos:', producto1.nombre, '+', producto2.nombre);

    // 3. Crear orden
    console.log('\n🛒 CREANDO ORDEN...');
    const ordenData = {
      proveedorId: proveedor.id,
      almacenDestinoId: almacen.id,
      creadoPorId: userId,
      moneda: 'PEN',
      condicionesPago: 'TEST Simple',
      formaPago: 'Efectivo',
      observaciones: 'Test crear orden simple',
      items: [
        {
          productoId: producto1.id,
          cantidadOrdenada: 10,
          precioUnitario: 100.00,
          descuento: 0,
          incluyeIGV: true,
        },
        {
          productoId: producto2.id,
          cantidadOrdenada: 5,
          precioUnitario: 80.00,
          descuento: 0,
          incluyeIGV: true,
        },
      ],
    };

    const response = await api.post('/compras/ordenes', ordenData);
    
    console.log('\n📋 RESPUESTA COMPLETA:');
    console.log(JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);
  }
}

testCrearOrden();
