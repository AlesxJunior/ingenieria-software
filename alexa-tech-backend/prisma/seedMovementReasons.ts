import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const INITIAL_MOVEMENT_REASONS = [
  // ENTRADA
  {
    tipo: 'ENTRADA' as const,
    codigo: 'ENT-COMPRA',
    nombre: 'Compra a proveedor',
    descripcion: 'Entrada de mercadería por compra a proveedor',
    requiereDocumento: true,
    activo: true,
  },
  {
    tipo: 'ENTRADA' as const,
    codigo: 'ENT-DEVOLUCION',
    nombre: 'Devolución de cliente',
    descripcion: 'Entrada por devolución de producto de un cliente',
    requiereDocumento: true,
    activo: true,
  },
  {
    tipo: 'ENTRADA' as const,
    codigo: 'ENT-TRANSFERENCIA',
    nombre: 'Transferencia entre almacenes (entrada)',
    descripcion: 'Entrada de producto desde otro almacén',
    requiereDocumento: true,
    activo: true,
  },
  {
    tipo: 'ENTRADA' as const,
    codigo: 'ENT-PRODUCCION',
    nombre: 'Producción interna',
    descripcion: 'Entrada por producción o fabricación interna',
    requiereDocumento: false,
    activo: true,
  },

  // SALIDA
  {
    tipo: 'SALIDA' as const,
    codigo: 'SAL-VENTA',
    nombre: 'Venta a cliente',
    descripcion: 'Salida de mercadería por venta',
    requiereDocumento: true,
    activo: true,
  },
  {
    tipo: 'SALIDA' as const,
    codigo: 'SAL-DEVOLUCION',
    nombre: 'Devolución a proveedor',
    descripcion: 'Salida por devolución de producto a proveedor',
    requiereDocumento: true,
    activo: true,
  },
  {
    tipo: 'SALIDA' as const,
    codigo: 'SAL-TRANSFERENCIA',
    nombre: 'Transferencia entre almacenes (salida)',
    descripcion: 'Salida de producto hacia otro almacén',
    requiereDocumento: true,
    activo: true,
  },
  {
    tipo: 'SALIDA' as const,
    codigo: 'SAL-CONSUMO',
    nombre: 'Consumo interno',
    descripcion: 'Salida por consumo o uso interno de la empresa',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'SALIDA' as const,
    codigo: 'SAL-MERMA',
    nombre: 'Merma operativa',
    descripcion: 'Salida por merma durante operaciones',
    requiereDocumento: false,
    activo: true,
  },

  // AJUSTE
  {
    tipo: 'AJUSTE' as const,
    codigo: 'AJU-DANIO',
    nombre: 'Merma por daño',
    descripcion: 'Ajuste por producto dañado o deteriorado',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE' as const,
    codigo: 'AJU-CORRECCION',
    nombre: 'Corrección de inventario',
    descripcion: 'Ajuste por corrección de registros de inventario',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE' as const,
    codigo: 'AJU-ERROR',
    nombre: 'Error de conteo',
    descripcion: 'Ajuste por error en conteo físico',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE' as const,
    codigo: 'AJU-VENCIDO',
    nombre: 'Producto vencido',
    descripcion: 'Ajuste por producto que ha superado su fecha de vencimiento',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE' as const,
    codigo: 'AJU-ROBO',
    nombre: 'Robo o extravío',
    descripcion: 'Ajuste por producto robado o extraviado',
    requiereDocumento: true,
    activo: true,
  },
];

async function seedMovementReasons() {
  console.log('🌱 Iniciando seed de motivos de movimiento...');

  try {
    // Verificar si ya existen motivos
    const existingCount = await prisma.movementReason.count();

    if (existingCount > 0) {
      console.log(
        `✅ Ya existen ${existingCount} motivos de movimiento. Saltando seed.`,
      );
      return;
    }

    // Crear motivos iniciales
    for (const reason of INITIAL_MOVEMENT_REASONS) {
      await prisma.movementReason.create({
        data: reason,
      });
      console.log(`✅ Creado: ${reason.codigo} - ${reason.nombre}`);
    }

    console.log(
      `\n✅ Seed completado: ${INITIAL_MOVEMENT_REASONS.length} motivos creados`,
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
  seedMovementReasons()
    .then(() => {
      console.log('✅ Seed finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    });
}

export { seedMovementReasons };
