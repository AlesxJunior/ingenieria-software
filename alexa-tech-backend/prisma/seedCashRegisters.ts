import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_CASH_REGISTERS = [
  {
    codigo: 'CAJA-01',
    nombre: 'Caja Principal',
    ubicacion: 'Mostrador Principal',
    activo: true,
  },
  {
    codigo: 'CAJA-02',
    nombre: 'Caja Secundaria',
    ubicacion: 'Mostrador 2',
    activo: true,
  },
  {
    codigo: 'CAJA-03',
    nombre: 'Caja Express',
    ubicacion: 'Área de Pago Rápido',
    activo: true,
  },
];

async function seedCashRegisters() {
  console.log('🌱 Iniciando seed de cajas registradoras...');

  try {
    // Verificar si ya existen cajas
    const existingCount = await prisma.cashRegister.count();

    if (existingCount > 0) {
      console.log(
        `✅ Ya existen ${existingCount} cajas registradoras. Saltando seed.`,
      );
      return;
    }

    // Crear cajas iniciales
    for (const register of INITIAL_CASH_REGISTERS) {
      await prisma.cashRegister.create({
        data: register,
      });
      console.log(`✅ Creada: ${register.codigo} - ${register.nombre}`);
    }

    console.log(
      `\n✅ Seed completado: ${INITIAL_CASH_REGISTERS.length} cajas registradoras creadas`,
    );
  } catch (error) {
    console.error('❌ Error al ejecutar seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedCashRegisters()
    .then(() => {
      console.log('✅ Seed de cajas registradoras finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}

export { seedCashRegisters };
