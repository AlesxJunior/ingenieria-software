import { PrismaClient, CashMovementType } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed de Movimientos de Caja de prueba
 * Solo se ejecuta si hay sesiones de caja abiertas
 */
async function seedCashMovements() {
  console.log('🔄 Iniciando seed de movimientos de caja...');

  try {
    // Buscar una sesión de caja abierta
    const openSession = await prisma.cashSession.findFirst({
      where: { estado: 'Abierta' },
      include: { user: true },
    });

    if (!openSession) {
      console.log('⚠️  No hay sesiones de caja abiertas. Saltando seed de movimientos.');
      return;
    }

    console.log(`✅ Sesión de caja encontrada: ${openSession.id}`);

    // Verificar si ya existen movimientos para esta sesión
    const existingMovements = await prisma.cashMovement.count({
      where: { cashSessionId: openSession.id },
    });

    if (existingMovements > 0) {
      console.log(`⚠️  Ya existen ${existingMovements} movimientos para esta sesión. Saltando seed.`);
      return;
    }

    // Crear movimientos de prueba
    const movements = [
      {
        tipo: CashMovementType.INGRESO,
        monto: 50.00,
        motivo: 'Recuperación de cartera',
        descripcion: 'Pago de deuda de cliente Juan Pérez',
        usuarioId: openSession.userId,
      },
      {
        tipo: CashMovementType.INGRESO,
        monto: 30.00,
        motivo: 'Venta de material reciclable',
        descripcion: 'Venta de cajas de cartón',
        usuarioId: openSession.userId,
      },
      {
        tipo: CashMovementType.EGRESO,
        monto: 25.00,
        motivo: 'Pago de delivery',
        descripcion: 'Pago a courier por envío urgente',
        usuarioId: openSession.userId,
      },
      {
        tipo: CashMovementType.EGRESO,
        monto: 15.50,
        motivo: 'Compra de útiles',
        descripcion: 'Papel bond, lapiceros y folders',
        usuarioId: openSession.userId,
      },
      {
        tipo: CashMovementType.INGRESO,
        monto: 100.00,
        motivo: 'Aporte del dueño',
        descripcion: 'Capital adicional para operaciones',
        usuarioId: openSession.userId,
      },
    ];

    for (const movement of movements) {
      await prisma.cashMovement.create({
        data: {
          ...movement,
          cashSessionId: openSession.id,
        },
      });
    }

    console.log(`✅ ${movements.length} movimientos de caja creados exitosamente`);

    // Mostrar resumen
    const totalIngresos = movements
      .filter((m) => m.tipo === CashMovementType.INGRESO)
      .reduce((sum, m) => sum + m.monto, 0);

    const totalEgresos = movements
      .filter((m) => m.tipo === CashMovementType.EGRESO)
      .reduce((sum, m) => sum + m.monto, 0);

    console.log(`📊 Resumen:`);
    console.log(`   💰 Total Ingresos: S/ ${totalIngresos.toFixed(2)}`);
    console.log(`   💸 Total Egresos: S/ ${totalEgresos.toFixed(2)}`);
    console.log(`   📈 Balance: S/ ${(totalIngresos - totalEgresos).toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error al crear movimientos de caja:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCashMovements()
    .then(() => {
      console.log('✅ Seed de movimientos de caja completado');
      prisma.$disconnect();
    })
    .catch((error) => {
      console.error('❌ Error en seed de movimientos de caja:', error);
      prisma.$disconnect();
      process.exit(1);
    });
}

export default seedCashMovements;
