const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

// Credenciales de admin (ajustar según tu base de datos)
const ADMIN_CREDENTIALS = {
  email: 'admin@alexatech.com',
  password: 'admin123',
};

async function probarAuditoria() {
  console.log('🧪 Probando módulo de Auditoría y Logs...\n');

  try {
    // 1. Login para obtener token
    console.log('1️⃣ Iniciando sesión como admin...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, ADMIN_CREDENTIALS);
    
    const token = loginResponse.data.data.accessToken;
    console.log('✅ Token obtenido\n');

    // 2. Obtener logs de auditoría
    console.log('2️⃣ Obteniendo logs de auditoría...');
    const logsResponse = await axios.get(`${API_URL}/audit/logs?page=1&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { logs, pagination } = logsResponse.data.data;
    console.log(`✅ Logs obtenidos: ${logs.length}`);
    console.log(`📊 Total de logs: ${pagination.total}`);
    console.log(`📄 Páginas: ${pagination.totalPages}\n`);

    // Mostrar primeros 3 logs
    console.log('📝 PRIMEROS 3 LOGS:\n');
    logs.slice(0, 3).forEach((log, index) => {
      console.log(`${index + 1}. [${log.action}]`);
      console.log(`   Usuario: ${log.user}`);
      console.log(`   Fecha: ${new Date(log.timestamp).toLocaleString('es-PE')}`);
      console.log(`   Detalles: ${log.details || 'N/A'}`);
      console.log(`   IP: ${log.ipAddress || 'N/A'}`);
      console.log('');
    });

    // 3. Obtener mi actividad
    console.log('3️⃣ Obteniendo mi actividad...');
    const myActivityResponse = await axios.get(`${API_URL}/audit/my-activity?page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const myActivity = myActivityResponse.data.data;
    console.log(`✅ Mi actividad: ${myActivity.activities.length} registros\n`);

    // 4. Obtener eventos del sistema
    console.log('4️⃣ Obteniendo eventos del sistema...');
    const eventsResponse = await axios.get(`${API_URL}/audit/system-events?page=1&limit=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const events = eventsResponse.data.data;
    console.log(`✅ Eventos del sistema: ${events.events.length} registros`);
    console.log(`📊 Total de eventos: ${events.pagination.total}\n`);

    // Mostrar eventos
    console.log('⚙️  EVENTOS DEL SISTEMA:\n');
    events.events.forEach((event, index) => {
      console.log(`${index + 1}. [${event.type}]`);
      console.log(`   Fecha: ${new Date(event.timestamp).toLocaleString('es-PE')}`);
      console.log(`   Detalles: ${event.details}`);
      console.log('');
    });

    console.log('✅ ¡Todas las pruebas pasaron exitosamente!\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 RESUMEN:');
    console.log(`   • Logs de auditoría: ${pagination.total}`);
    console.log(`   • Mi actividad: ${myActivity.pagination.total}`);
    console.log(`   • Eventos del sistema: ${events.pagination.total}`);
    console.log('═══════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
    throw error;
  }
}

// Ejecutar pruebas
probarAuditoria()
  .then(() => {
    console.log('🎉 Pruebas completadas!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error.message);
    process.exit(1);
  });
