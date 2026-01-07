const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function executeSQL() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'alexa_tech_pos',
    user: 'postgres',
    password: 'Menta2024*'
  });

  try {
    await client.connect();
    console.log('✅ Conectado a la base de datos\n');

    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'create-test-alerts.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Dividir en statements individuales
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log('📝 Ejecutando script SQL...\n');

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments
      if (statement.startsWith('--')) continue;
      
      try {
        const result = await client.query(statement);
        
        if (statement.toLowerCase().includes('select')) {
          console.log(`\n🔍 Consulta de verificación:`);
          console.table(result.rows);
        } else if (statement.toLowerCase().includes('insert')) {
          console.log(`✅ Insert ejecutado: ${result.rowCount} filas insertadas`);
        }
      } catch (err) {
        // Si el error es porque ya existe, ignorarlo
        if (err.message.includes('duplicate key') || err.message.includes('already exists')) {
          console.log(`⚠️  Ya existe, ignorando...`);
        } else {
          console.error(`❌ Error en statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('\n✅ Script ejecutado correctamente\n');

    // Verificar las alertas que se generarán
    console.log('📊 Verificando alertas generadas:\n');
    const alertasResult = await client.query(`
      SELECT 
        p.codigo,
        p.nombre,
        w.nombre as almacen,
        p."stockMinimo" as min_stock,
        s.quantity as stock_actual,
        ROUND((s.quantity::numeric / NULLIF(p."stockMinimo", 0)) * 100, 2) as porcentaje,
        CASE
          WHEN s.quantity <= (p."stockMinimo" * 0.5) THEN 'CRÍTICO'
          WHEN s.quantity < p."stockMinimo" THEN 'BAJO'
          ELSE 'NORMAL'
        END as estado
      FROM "Product" p
      JOIN "StockByWarehouse" s ON p.id = s."productId"
      JOIN "Warehouse" w ON s."warehouseId" = w.id
      WHERE p.codigo LIKE 'TEST-%'
      ORDER BY estado DESC, porcentaje ASC
    `);

    console.table(alertasResult.rows);

    // Probar el endpoint de alertas
    console.log('\n🔌 Probando endpoint /api/inventory/alertas...\n');
    const axios = require('axios');
    
    // Login
    const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin'
    });

    const token = loginRes.data.data.accessToken;

    // Obtener alertas
    const alertasRes = await axios.get('http://localhost:3001/api/inventory/alertas', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const alertas = alertasRes.data.data.rows;
    
    console.log(`📢 Total de alertas: ${alertas.length}`);
    console.log(`🔴 Alertas CRÍTICAS: ${alertas.filter(a => a.tipoAlerta === 'CRITICO').length}`);
    console.log(`🟡 Alertas BAJAS: ${alertas.filter(a => a.tipoAlerta === 'BAJO').length}`);
    
    console.log('\n📋 Detalle de alertas:\n');
    alertas.forEach(a => {
      const emoji = a.tipoAlerta === 'CRITICO' ? '🔴' : '🟡';
      console.log(`${emoji} ${a.nombre} (${a.codigo})`);
      console.log(`   Almacén: ${a.almacen}`);
      console.log(`   Stock: ${a.cantidad} / ${a.stockMinimo} (${a.porcentaje}%)`);
      console.log(`   Faltan: ${a.diferenciaUnidades} unidades`);
      console.log('');
    });

    console.log('\n✅ VERIFICACIÓN COMPLETA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 El AlertasBadge debería mostrar las alertas en 2 minutos');
    console.log('🌐 Abre http://localhost:5173 y verás el badge en el header');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  } finally {
    await client.end();
  }
}

executeSQL().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
