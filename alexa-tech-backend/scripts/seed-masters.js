const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ==========================================
// CATEGORÍAS PARA ALEXATECH
// Negocio: Cámaras de Seguridad y Tecnología
// ==========================================
const categories = [
  { codigo: 'CCTV', nombre: 'Cámaras de Seguridad', descripcion: 'Cámaras IP, análogas, PTZ, domo, bullet, etc.', activo: true },
  { codigo: 'DVR', nombre: 'Grabadores DVR/NVR', descripcion: 'Grabadores digitales de video, híbridos y NVR', activo: true },
  { codigo: 'ACCESO', nombre: 'Control de Acceso', descripcion: 'Lectoras biométricas, RFID, cerraduras electrónicas', activo: true },
  { codigo: 'ALARMA', nombre: 'Sistemas de Alarma', descripcion: 'Paneles de alarma, sensores de movimiento, sirenas', activo: true },
  { codigo: 'REDES', nombre: 'Equipos de Red', descripcion: 'Switches, routers, access points, repetidores', activo: true },
  { codigo: 'CABLES', nombre: 'Cableado Estructurado', descripcion: 'Cable UTP, coaxial, fibra óptica, conectores', activo: true },
  { codigo: 'ENERGIA', nombre: 'Energía y UPS', descripcion: 'Fuentes de poder, UPS, PoE, baterías', activo: true },
  { codigo: 'MONITOR', nombre: 'Monitores y Pantallas', descripcion: 'Monitores de vigilancia, videowall, LED', activo: true },
  { codigo: 'ACCES', nombre: 'Accesorios', descripcion: 'Soportes, carcasas, conectores, herramientas', activo: true },
  { codigo: 'COMP', nombre: 'Computadoras', descripcion: 'PC, laptops, componentes de computadora', activo: true },
  { codigo: 'AUDIO', nombre: 'Audio y Comunicación', descripcion: 'Intercomunicadores, micrófonos, parlantes', activo: true },
  { codigo: 'SOFT', nombre: 'Software y Licencias', descripcion: 'Software de videovigilancia, licencias VMS', activo: true }
];

// ==========================================
// UNIDADES DE MEDIDA PARA ALEXATECH
// Solo las unidades realmente utilizadas
// ==========================================
const units = [
  { codigo: 'UND', nombre: 'Unidad', simbolo: 'und', activo: true, descripcion: 'Unidad individual (cámaras, DVRs, switches, sensores, etc.)' },
  { codigo: 'MT', nombre: 'Metro', simbolo: 'm', activo: true, descripcion: 'Metros de cable (UTP, coaxial, fibra óptica)' },
  { codigo: 'CJ', nombre: 'Caja', simbolo: 'cj', activo: true, descripcion: 'Caja de cable (305m), cajas de conectores y accesorios' },
  { codigo: 'LIC', nombre: 'Licencia', simbolo: 'lic', activo: true, descripcion: 'Licencias de software y sistemas VMS' }
];

async function main() {
  console.log('🌱 Poblando maestros de productos...\n');

  try {
    // Crear categorías
    console.log('📦 Creando categorías...');
    let createdCategories = 0;
    for (const cat of categories) {
      const existing = await prisma.productCategory.findUnique({
        where: { codigo: cat.codigo }
      });

      if (!existing) {
        await prisma.productCategory.create({ data: cat });
        console.log(`   ✅ Creada: ${cat.nombre} (${cat.codigo})`);
        createdCategories++;
      } else {
        console.log(`   ⏭️  Ya existe: ${cat.nombre} (${cat.codigo})`);
      }
    }
    console.log(`\n✅ ${createdCategories} categorías nuevas creadas\n`);

    // Crear unidades
    console.log('📏 Creando unidades de medida...');
    let createdUnits = 0;
    for (const unit of units) {
      const existing = await prisma.unitOfMeasure.findUnique({
        where: { codigo: unit.codigo }
      });

      if (!existing) {
        await prisma.unitOfMeasure.create({ data: unit });
        console.log(`   ✅ Creada: ${unit.nombre} (${unit.codigo} - ${unit.simbolo})`);
        createdUnits++;
      } else {
        console.log(`   ⏭️  Ya existe: ${unit.nombre} (${unit.codigo})`);
      }
    }
    console.log(`\n✅ ${createdUnits} unidades nuevas creadas\n`);

    // Resumen final
    const finalCategories = await prisma.productCategory.count();
    const finalUnits = await prisma.unitOfMeasure.count();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 RESUMEN FINAL');
    console.log('='.repeat(50));
    console.log(`📦 Categorías en BD: ${finalCategories}`);
    console.log(`📏 Unidades en BD: ${finalUnits}`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Seed completado exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  });
