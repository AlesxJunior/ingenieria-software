import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixMigrations() {
  console.log('🔧 Limpiando registros de migraciones fallidas...');

  try {
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20251109063409_add_payment_tracking_and_status'
    `);

    console.log('✅ Registro de migración eliminado');
    console.log('Ahora puedes ejecutar: npx prisma migrate dev');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigrations();
