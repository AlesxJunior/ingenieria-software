const axios = require('axios');

(async () => {
  try {
    console.log('\n🧪 Verificación Rápida del Endpoint de Alertas\n');
    
    // Login
    const login = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    const token = login.data.data.accessToken;
    console.log('✅ Login exitoso\n');
    
    // Test endpoint alertas
    const res = await axios.get('http://localhost:3001/api/inventory/alertas', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const alertas = res.data.data;
    console.log('✅ Endpoint /api/inventory/alertas funciona correctamente!\n');
    console.log(`📊 Total de alertas: ${alertas.length}`);
    
    if (alertas.length > 0) {
      const criticas = alertas.filter(a => a.tipoAlerta === 'CRITICO').length;
      const bajas = alertas.filter(a => a.tipoAlerta === 'BAJO').length;
      
      console.log(`   🔴 Críticas: ${criticas}`);
      console.log(`   🟡 Bajas: ${bajas}\n`);
      
      console.log('📦 Primera alerta (ejemplo):');
      const first = alertas[0];
      console.log(`   Producto: ${first.nombre} (${first.codigo})`);
      console.log(`   Almacén: ${first.almacen}`);
      console.log(`   Stock: ${first.cantidad}/${first.stockMinimo}`);
      console.log(`   Estado: ${first.tipoAlerta}`);
      console.log(`   Porcentaje: ${first.porcentaje}%`);
      console.log(`   Faltante: ${first.diferenciaUnidades} unidades\n`);
      
      // Verificar campos nuevos
      console.log('✅ Campos implementados verificados:');
      console.log(`   - almacenId: ${first.almacenId ? '✓' : '✗'}`);
      console.log(`   - porcentaje: ${first.porcentaje !== undefined ? '✓' : '✗'}`);
      console.log(`   - diferenciaUnidades: ${first.diferenciaUnidades !== undefined ? '✓' : '✗'}`);
    } else {
      console.log('\nℹ️  No hay alertas activas (todos los productos tienen stock normal)');
    }
    
    console.log('\n🎉 ¡Verificación completada exitosamente!\n');
    
  } catch(e) {
    console.error('\n❌ Error:', e.response?.data?.message || e.message);
    process.exit(1);
  }
})();
