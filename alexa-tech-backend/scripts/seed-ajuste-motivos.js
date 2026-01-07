const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MOTIVOS_AJUSTE = [
  {
    tipo: 'AJUSTE',
    codigo: 'AJU-DANIO',
    nombre: 'Merma por daño',
    descripcion: 'Ajuste por producto dañado o deteriorado',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE',
    codigo: 'AJU-CORRECCION',
    nombre: 'Corrección de inventario',
    descripcion: 'Ajuste por corrección de registros de inventario',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE',
    codigo: 'AJU-ERROR',
    nombre: 'Error de conteo',
    descripcion: 'Ajuste por error en conteo físico',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE',
    codigo: 'AJU-VENCIDO',
    nombre: 'Producto vencido',
    descripcion: 'Ajuste por producto que ha superado su fecha de vencimiento',
    requiereDocumento: false,
    activo: true,
  },
  {
    tipo: 'AJUSTE',
    codigo: 'AJU-ROBO',
    nombre: 'Robo o extravío',
    descripcion: 'Ajuste por producto robado o extraviado',
    requiereDocumento: true,
    activo: true,
  },
];

async function seedMotivosAjuste() {
  console.log('\n🌱 ===== SEED: Motivos de AJUSTE =====\n');

  try {
    // Verificar cuántos ya existen
    const existentes = await prisma.movementReason.findMany({
      where: { tipo: 'AJUSTE' }
    });

    console.log(`📋 Motivos de AJUSTE existentes: ${existentes.length}`);

    if (existentes.length > 0) {
      console.log('\n📝 Motivos ya existentes:');
      existentes.forEach((m, i) => {
        console.log(`  ${i + 1}. [${m.codigo}] ${m.nombre}`);
      });
      console.log('\n⚠️  Ya existen motivos de AJUSTE. Si quieres agregar más, elimina los duplicados primero.\n');
      return;
    }

    // Crear motivos
    console.log('\n✨ Creando motivos de AJUSTE...\n');
    
    let creados = 0;
    for (const motivo of MOTIVOS_AJUSTE) {
      try {
        const existe = await prisma.movementReason.findUnique({
          where: { codigo: motivo.codigo }
        });

        if (existe) {
          console.log(`⏭️  Ya existe: [${motivo.codigo}] ${motivo.nombre}`);
        } else {
          await prisma.movementReason.create({
            data: motivo
          });
          console.log(`✅ Creado: [${motivo.codigo}] ${motivo.nombre}`);
          creados++;
        }
      } catch (error) {
        console.error(`❌ Error creando [${motivo.codigo}]:`, error.message);
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`  ✅ Motivos creados: ${creados}`);
    console.log(`  📝 Total de AJUSTE: ${creados + existentes.length}`);
    console.log('\n🎉 Seed completado exitosamente!\n');

  } catch (error) {
    console.error('\n❌ Error al ejecutar seed:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
seedMotivosAjuste()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
