import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateSaleStatus() {
  console.log('🔄 Iniciando migración de estados de venta...');

  try {
    // Actualizar todas las ventas "Completada" a "Pagada"
    const result = await prisma.$executeRaw`
      UPDATE sales 
      SET estado = 'Pagada'
      WHERE estado = 'Completada'
    `;

    console.log(`✅ ${result} ventas actualizadas de "Completada" a "Pagada"`);
    
    // Verificar que no queden ventas con estado "Completada"
    const remaining = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM sales 
      WHERE estado = 'Completada'
    `;
    
    console.log('Ventas restantes con estado "Completada":', remaining);
    
    if (Array.isArray(remaining) && remaining[0]?.count === '0') {
      console.log('✅ Migración completada exitosamente');
      console.log('Ahora puedes ejecutar: npx prisma migrate dev --name add-payment-tracking-and-status');
    }

  } catch (error) {
    console.error('❌ Error en la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateSaleStatus();
