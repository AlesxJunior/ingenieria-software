const axios = require('axios');

async function getProducts() {
  const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
    email: 'admin@alexatech.com',
    password: 'admin123'
  });
  
  const token = loginRes.data.data.accessToken;
  
  const productsRes = await axios.get('http://localhost:3001/api/products', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const products = productsRes.data.data?.products || productsRes.data.data || productsRes.data;
  
  console.log('Tipo de datos recibidos:', typeof products);
  console.log('Es array?', Array.isArray(products));
  
  if (Array.isArray(products)) {
    console.log(`\nTotal productos: ${products.length}`);
    console.log('\nPrimeros 3 productos (estructura completa):');
    products.slice(0, 3).forEach((p, i) => {
      console.log(`\nProducto ${i + 1}:`, JSON.stringify(p, null, 2).substring(0, 300));
    });
    
    console.log('\nProductos con stock > 0:');
    const withStock = products.filter(p => (p.stock || p.currentStock || 0) > 0);
    withStock.slice(0, 5).forEach(p => {
      console.log(`  ID: ${p.id || p.codigo}`);
      console.log(`  Nombre: ${p.nombre || p.productName}`);
      console.log(`  Stock: ${p.stock || p.currentStock || 0}`);
      console.log('  ---');
    });
    
    if (withStock.length === 0) {
      console.log('  ⚠️ No hay productos con stock');
    }
  } else if (typeof products === 'object') {
    console.log('\nEstructura de respuesta completa:');
    console.log(JSON.stringify(products, null, 2).substring(0, 1000));
  }
}

getProducts();
