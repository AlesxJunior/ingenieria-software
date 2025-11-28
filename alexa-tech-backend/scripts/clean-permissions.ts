/**
 * ⚠️ SCRIPT DE LIMPIEZA HISTÓRICO - YA EJECUTADO ⚠️
 * 
 * Este script se utilizó para limpiar el campo 'permissions' antes de la migración RBAC.
 * Fecha de ejecución: 28 de noviembre de 2025
 * Resultado: 4 usuarios limpiados exitosamente
 * 
 * NOTA: Este script NO puede ejecutarse nuevamente porque:
 * - El modelo User ya no tiene el campo 'permissions'
 * - La migración de Prisma eliminó la columna de la base de datos
 * 
 * Se mantiene como referencia histórica.
 */

// SCRIPT DESHABILITADO - MIGRACIÓN YA COMPLETADA

export function cleanPermissionsCompleted() {
  console.log('✅ Limpieza de permisos completada el 28/11/2025');
  console.log('📊 4 usuarios limpiados exitosamente');
  return {
    status: 'completed',
    date: '2025-11-28',
    usersCleaned: 4,
    message: 'Permissions cleanup successfully completed before RBAC migration'
  };
}

/*
// Código original comentado - Ya no es compatible con el nuevo schema
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando campo permissions de todos los usuarios...');
  
  const result = await prisma.user.updateMany({
    data: {
      permissions: []
    }
  });
  
  console.log(`✅ ${result.count} usuarios actualizados`);
  
  // Verificar
  const usersWithPerms = await prisma.user.findMany({
    where: {
      permissions: {
        isEmpty: false
      }
    },
    select: {
      username: true,
      permissions: true
    }
  });
  
  if (usersWithPerms.length > 0) {
    console.log('⚠️  Usuarios con permisos todavía:');
    usersWithPerms.forEach(u => console.log(`   - ${u.username}: ${u.permissions}`));
  } else {
    console.log('✅ Todos los usuarios tienen permissions vacío');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
*/
