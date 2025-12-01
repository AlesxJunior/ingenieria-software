/**
 * Script para limpiar estado de migraciones fallidas y continuar
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanMigrationState() {
  try {
    console.log('🔍 Verificando estado de migraciones...\n');

    // Verificar migraciones aplicadas
    const migrations = await prisma.$queryRaw<Array<{ migration_name: string; finished_at: Date | null }>>`
      SELECT migration_name, finished_at
      FROM "_prisma_migrations"
      ORDER BY finished_at DESC
      LIMIT 10
    `;

    console.log('Últimas migraciones:');
    migrations.forEach(m => {
      console.log(`  - ${m.migration_name} (${m.finished_at || 'PENDIENTE'})`);
    });

    // Buscar migraciones fallidas
    const failedMigrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name
      FROM "_prisma_migrations"
      WHERE finished_at IS NULL OR rolled_back_at IS NOT NULL
    `;

    if (failedMigrations.length > 0) {
      console.log('\n⚠️  Migraciones fallidas/revertidas encontradas:');
      failedMigrations.forEach(m => {
        console.log(`  - ${m.migration_name}`);
      });

      console.log('\n🔨 Eliminando migraciones fallidas del registro...');
      
      for (const migration of failedMigrations) {
        await prisma.$executeRaw`
          DELETE FROM "_prisma_migrations"
          WHERE migration_name = ${migration.migration_name}
        `;
        console.log(`  ✅ Eliminada: ${migration.migration_name}`);
      }
    } else {
      console.log('\n✅ No hay migraciones fallidas');
    }

    // Verificar si existen las tablas maestras
    const tablesCheck = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'product_categories'
      ) as exists
    `;

    if (tablesCheck[0].exists) {
      console.log('\n⚠️  ADVERTENCIA: Las tablas maestras ya existen en la BD');
      console.log('   Puede ser necesario eliminarlas manualmente antes de migrar');
    }

    console.log('\n✅ Estado de migraciones limpio');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanMigrationState();
