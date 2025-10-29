const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function checkSystemLogs() {
  try {
    console.log('🔍 Revisando logs del sistema para detectar errores...\n');

    // 1. Verificar logs de auditoría
    console.log('1. Verificando logs de auditoría:');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { action: { contains: 'INVENTORY' } },
          { action: { contains: 'KARDEX' } },
          { action: { contains: 'ERROR' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log(`   Logs de auditoría encontrados: ${auditLogs.length}`);
    if (auditLogs.length > 0) {
      auditLogs.forEach(log => {
        console.log(`   - ${log.createdAt.toISOString()}: ${log.action} - ${log.details || 'Sin detalles'}`);
      });
    }

    // 2. Verificar eventos del sistema
    console.log('\n2. Verificando eventos del sistema:');
    const systemEvents = await prisma.systemEvent.findMany({
      where: {
        OR: [
          { type: { contains: 'ERROR' } },
          { type: { contains: 'INVENTORY' } },
          { type: { contains: 'DATABASE' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log(`   Eventos del sistema encontrados: ${systemEvents.length}`);
    if (systemEvents.length > 0) {
      systemEvents.forEach(event => {
        console.log(`   - ${event.createdAt.toISOString()}: ${event.type} - ${event.details || 'Sin detalles'}`);
      });
    }

    // 3. Verificar actividades de usuario relacionadas con inventario
    console.log('\n3. Verificando actividades de usuario:');
    const userActivities = await prisma.userActivity.findMany({
      where: {
        OR: [
          { action: { contains: 'inventory' } },
          { action: { contains: 'kardex' } },
          { action: { contains: 'INVENTORY' } },
          { action: { contains: 'KARDEX' } }
        ]
      },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    console.log(`   Actividades de usuario encontradas: ${userActivities.length}`);
    if (userActivities.length > 0) {
      userActivities.forEach(activity => {
        console.log(`   - ${activity.createdAt.toISOString()}: ${activity.user?.username || 'Usuario desconocido'} - ${activity.action} - ${activity.details || 'Sin detalles'}`);
      });
    }

    // 4. Verificar logs de aplicación (si existen archivos de log)
    console.log('\n4. Verificando archivos de log de la aplicación:');
    const logDir = path.join(__dirname, '..', 'logs');
    const possibleLogFiles = [
      path.join(logDir, 'app.log'),
      path.join(logDir, 'error.log'),
      path.join(logDir, 'inventory.log'),
      path.join(__dirname, '..', 'app.log'),
      path.join(__dirname, '..', 'error.log')
    ];

    let logFilesFound = false;
    for (const logFile of possibleLogFiles) {
      if (fs.existsSync(logFile)) {
        logFilesFound = true;
        console.log(`   📄 Archivo de log encontrado: ${logFile}`);
        
        try {
          const logContent = fs.readFileSync(logFile, 'utf8');
          const lines = logContent.split('\n');
          const recentLines = lines.slice(-50); // Últimas 50 líneas
          
          // Buscar errores relacionados con inventario/kardex
          const relevantLines = recentLines.filter(line => 
            line.toLowerCase().includes('error') ||
            line.toLowerCase().includes('inventory') ||
            line.toLowerCase().includes('kardex') ||
            line.toLowerCase().includes('sigo')
          );
          
          if (relevantLines.length > 0) {
            console.log(`   🔍 Líneas relevantes encontradas (${relevantLines.length}):`);
            relevantLines.slice(-10).forEach(line => {
              console.log(`     ${line.trim()}`);
            });
          } else {
            console.log(`   ✅ No se encontraron errores relevantes en ${path.basename(logFile)}`);
          }
        } catch (error) {
          console.log(`   ❌ Error al leer ${logFile}: ${error.message}`);
        }
      }
    }

    if (!logFilesFound) {
      console.log('   📝 No se encontraron archivos de log específicos');
    }

    // 5. Verificar errores recientes en la base de datos
    console.log('\n5. Verificando errores recientes en consultas:');
    
    // Intentar detectar consultas problemáticas
    try {
      const recentMovements = await prisma.inventoryMovement.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Últimas 24 horas
          }
        },
        include: {
          product: true,
          warehouse: true,
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      console.log(`   📊 Movimientos de inventario en las últimas 24 horas: ${recentMovements.length}`);
      
      if (recentMovements.length === 0) {
        console.log('   ⚠️  POSIBLE PROBLEMA: No hay movimientos recientes de inventario');
      } else {
        console.log('   ✅ Se están registrando movimientos de inventario correctamente');
      }
      
    } catch (error) {
      console.log(`   ❌ Error al consultar movimientos recientes: ${error.message}`);
    }

    // 6. Verificar estado de conexiones y rendimiento
    console.log('\n6. Verificando estado de la base de datos:');
    try {
      const dbStats = await prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables 
        WHERE tablename IN ('inventory_movements', 'products', 'warehouses')
        ORDER BY tablename;
      `;
      
      console.log('   📈 Estadísticas de tablas:');
      dbStats.forEach(stat => {
        console.log(`     ${stat.tablename}: ${stat.inserts} inserts, ${stat.updates} updates, ${stat.deletes} deletes`);
      });
      
    } catch (error) {
      console.log(`   ❌ Error al obtener estadísticas de BD: ${error.message}`);
    }

    console.log('\n✅ Revisión de logs del sistema completada');

  } catch (error) {
    console.error('❌ Error al revisar logs del sistema:', error);
    console.error('❌ Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkSystemLogs();