const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function poblarAuditoria() {
  console.log('🔄 Iniciando población de datos de auditoría...\n');

  try {
    // Obtener usuarios existentes
    const usuarios = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios en la base de datos. Creando usuario de prueba...');
      const adminUser = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@alexatech.com',
          password: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // password123
          firstName: 'Admin',
          lastName: 'System',
          isActive: true,
        },
      });
      usuarios.push(adminUser);
      console.log('✅ Usuario admin creado');
    }

    console.log(`📋 Usuarios encontrados: ${usuarios.length}\n`);

    // Acciones de auditoría realistas
    const acciones = [
      { action: 'LOGIN', details: 'Inicio de sesión exitoso' },
      { action: 'LOGOUT', details: 'Cierre de sesión' },
      { action: 'CREATE_USER', details: 'Usuario creado: nuevo_usuario@email.com' },
      { action: 'UPDATE_USER', details: 'Información de usuario actualizada' },
      { action: 'DELETE_USER', details: 'Usuario eliminado del sistema' },
      { action: 'CHANGE_PASSWORD', details: 'Contraseña actualizada' },
      { action: 'UPDATE_PROFILE', details: 'Información de perfil actualizada' },
      { action: 'CREATE', details: 'Nuevo registro creado en el sistema' },
      { action: 'UPDATE', details: 'Registro actualizado' },
      { action: 'DELETE', details: 'Registro eliminado' },
    ];

    const ips = [
      '192.168.1.100',
      '192.168.1.101',
      '192.168.1.102',
      '192.168.1.103',
      '192.168.1.104',
      '10.0.0.50',
      '10.0.0.51',
      '172.16.0.10',
    ];

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    ];

    // Generar logs de auditoría de los últimos 30 días
    const logsCreados = [];
    const actividadesCreadas = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
      const accion = acciones[Math.floor(Math.random() * acciones.length)];
      const ip = ips[Math.floor(Math.random() * ips.length)];
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

      // Fecha aleatoria en los últimos 30 días
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const minutesAgo = Math.floor(Math.random() * 60);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(createdAt.getHours() - hoursAgo);
      createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

      // Crear log de auditoría
      const auditLog = await prisma.auditLog.create({
        data: {
          action: accion.action,
          userId: usuario.id,
          details: accion.details,
          ipAddress: ip,
          userAgent: userAgent,
          createdAt: createdAt,
        },
      });

      logsCreados.push(auditLog);

      // Crear actividad de usuario correspondiente
      const userActivity = await prisma.userActivity.create({
        data: {
          userId: usuario.id,
          action: accion.action.replace(/_/g, ' '),
          details: accion.details,
          ipAddress: ip,
          userAgent: userAgent,
          createdAt: createdAt,
        },
      });

      actividadesCreadas.push(userActivity);
    }

    console.log(`✅ Logs de auditoría creados: ${logsCreados.length}`);
    console.log(`✅ Actividades de usuario creadas: ${actividadesCreadas.length}\n`);

    // Crear algunos eventos del sistema
    const eventosCreados = [];
    const tiposEventos = [
      { type: 'SYSTEM_START', details: 'Sistema iniciado correctamente' },
      { type: 'SYSTEM_STOP', details: 'Sistema detenido' },
      { type: 'DATABASE_BACKUP', details: 'Respaldo de base de datos completado' },
      { type: 'DATABASE_ERROR', details: 'Error de conexión a la base de datos' },
      { type: 'API_ERROR', details: 'Error en endpoint de API' },
    ];

    for (let i = 0; i < 10; i++) {
      const evento = tiposEventos[Math.floor(Math.random() * tiposEventos.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const hoursAgo = Math.floor(Math.random() * 24);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(createdAt.getHours() - hoursAgo);

      const systemEvent = await prisma.systemEvent.create({
        data: {
          type: evento.type,
          details: evento.details,
          metadata: { timestamp: createdAt.toISOString() },
          createdAt: createdAt,
        },
      });

      eventosCreados.push(systemEvent);
    }

    console.log(`✅ Eventos del sistema creados: ${eventosCreados.length}\n`);

    // Mostrar resumen
    console.log('📊 RESUMEN DE DATOS CREADOS:');
    console.log('═══════════════════════════════════════');
    console.log(`📋 Logs de Auditoría: ${logsCreados.length}`);
    console.log(`👤 Actividades de Usuario: ${actividadesCreadas.length}`);
    console.log(`⚙️  Eventos del Sistema: ${eventosCreados.length}`);
    console.log('═══════════════════════════════════════\n');

    // Mostrar ejemplos de logs creados
    console.log('📝 EJEMPLOS DE LOGS CREADOS:\n');
    logsCreados.slice(0, 5).forEach((log, index) => {
      console.log(`${index + 1}. [${log.action}]`);
      console.log(`   Usuario: ${log.userId}`);
      console.log(`   Detalles: ${log.details}`);
      console.log(`   IP: ${log.ipAddress}`);
      console.log(`   Fecha: ${log.createdAt.toLocaleString('es-PE')}`);
      console.log('');
    });

    console.log('✅ Población de datos de auditoría completada exitosamente!\n');
  } catch (error) {
    console.error('❌ Error al poblar datos de auditoría:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
poblarAuditoria()
  .then(() => {
    console.log('🎉 Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
