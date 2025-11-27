import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Dataset completo de SAN MARTÍN
// 10 provincias - 77 distritos
const SAN_MARTIN_COMPLETO = {
  // MOYOBAMBA (PRO-2201) - 6 distritos
  'PRO-2201': [
    { nombre: 'MOYOBAMBA', codigo: '220101' },
    { nombre: 'CALZADA', codigo: '220102' },
    { nombre: 'HABANA', codigo: '220103' },
    { nombre: 'JEPELACIO', codigo: '220104' },
    { nombre: 'SORITOR', codigo: '220105' },
    { nombre: 'YANTALO', codigo: '220106' },
  ],

  // BELLAVISTA (PRO-2202) - 6 distritos
  'PRO-2202': [
    { nombre: 'BELLAVISTA', codigo: '220201' },
    { nombre: 'ALTO BIAVO', codigo: '220202' },
    { nombre: 'BAJO BIAVO', codigo: '220203' },
    { nombre: 'HUALLAGA', codigo: '220204' },
    { nombre: 'SAN PABLO', codigo: '220205' },
    { nombre: 'SAN RAFAEL', codigo: '220206' },
  ],

  // EL DORADO (PRO-2203) - 5 distritos
  'PRO-2203': [
    { nombre: 'SAN JOSÉ DE SISA', codigo: '220301' },
    { nombre: 'AGUA BLANCA', codigo: '220302' },
    { nombre: 'SAN MARTÍN', codigo: '220303' },
    { nombre: 'SANTA ROSA', codigo: '220304' },
    { nombre: 'SHATOJA', codigo: '220305' },
  ],

  // HUALLAGA (PRO-2204) - 6 distritos
  'PRO-2204': [
    { nombre: 'SAPOSOA', codigo: '220401' },
    { nombre: 'ALTO SAPOSOA', codigo: '220402' },
    { nombre: 'EL ESLABÓN', codigo: '220403' },
    { nombre: 'PISCOYACU', codigo: '220404' },
    { nombre: 'SACANCHE', codigo: '220405' },
    { nombre: 'TINGO DE SAPOSOA', codigo: '220406' },
  ],

  // LAMAS (PRO-2205) - 11 distritos
  'PRO-2205': [
    { nombre: 'LAMAS', codigo: '220501' },
    { nombre: 'ALONSO DE ALVARADO', codigo: '220502' },
    { nombre: 'BARRANQUITA', codigo: '220503' },
    { nombre: 'CAYNARACHI', codigo: '220504' },
    { nombre: 'CUÑUMBUQUI', codigo: '220505' },
    { nombre: 'PINTO RECODO', codigo: '220506' },
    { nombre: 'RUMISAPA', codigo: '220507' },
    { nombre: 'SAN ROQUE DE CUMBAZA', codigo: '220508' },
    { nombre: 'SHANAO', codigo: '220509' },
    { nombre: 'TABALOSOS', codigo: '220510' },
    { nombre: 'ZAPATERO', codigo: '220511' },
  ],

  // MARISCAL CÁCERES (PRO-2206) - 5 distritos
  'PRO-2206': [
    { nombre: 'JUANJUÍ', codigo: '220601' },
    { nombre: 'CAMPANILLA', codigo: '220602' },
    { nombre: 'HUICUNGO', codigo: '220603' },
    { nombre: 'PACHIZA', codigo: '220604' },
    { nombre: 'PAJARILLO', codigo: '220605' },
  ],

  // PICOTA (PRO-2207) - 10 distritos
  'PRO-2207': [
    { nombre: 'PICOTA', codigo: '220701' },
    { nombre: 'BUENOS AIRES', codigo: '220702' },
    { nombre: 'CASPISAPA', codigo: '220703' },
    { nombre: 'PILLUANA', codigo: '220704' },
    { nombre: 'PUCACACA', codigo: '220705' },
    { nombre: 'SAN CRISTÓBAL', codigo: '220706' },
    { nombre: 'SAN HILARIÓN', codigo: '220707' },
    { nombre: 'SHAMBOYACU', codigo: '220708' },
    { nombre: 'TINGO DE PONASA', codigo: '220709' },
    { nombre: 'TRES UNIDOS', codigo: '220710' },
  ],

  // RIOJA (PRO-2208) - 9 distritos
  'PRO-2208': [
    { nombre: 'RIOJA', codigo: '220801' },
    { nombre: 'AWAJÚN', codigo: '220802' },
    { nombre: 'ELÍAS SOPLIN VARGAS', codigo: '220803' },
    { nombre: 'NUEVA CAJAMARCA', codigo: '220804' },
    { nombre: 'PARDO MIGUEL', codigo: '220805' },
    { nombre: 'POSIC', codigo: '220806' },
    { nombre: 'SAN FERNANDO', codigo: '220807' },
    { nombre: 'YORONGOS', codigo: '220808' },
    { nombre: 'YURACYACU', codigo: '220809' },
  ],

  // SAN MARTÍN (PRO-2209) - 14 distritos
  'PRO-2209': [
    { nombre: 'TARAPOTO', codigo: '220901' },
    { nombre: 'ALBERTO LEVEAU', codigo: '220902' },
    { nombre: 'CACATACHI', codigo: '220903' },
    { nombre: 'CHAZUTA', codigo: '220904' },
    { nombre: 'CHIPURANA', codigo: '220905' },
    { nombre: 'EL PORVENIR', codigo: '220906' },
    { nombre: 'HUIMBAYOC', codigo: '220907' },
    { nombre: 'JUAN GUERRA', codigo: '220908' },
    { nombre: 'LA BANDA DE SHILCAYO', codigo: '220909' },
    { nombre: 'MORALES', codigo: '220910' },
    { nombre: 'PAPAPLAYA', codigo: '220911' },
    { nombre: 'SAN ANTONIO', codigo: '220912' },
    { nombre: 'SAUCE', codigo: '220913' },
    { nombre: 'SHAPAJA', codigo: '220914' },
  ],

  // TOCACHE (PRO-2210) - 5 distritos
  'PRO-2210': [
    { nombre: 'TOCACHE', codigo: '221001' },
    { nombre: 'NUEVO PROGRESO', codigo: '221002' },
    { nombre: 'POLVORA', codigo: '221003' },
    { nombre: 'SHUNTE', codigo: '221004' },
    { nombre: 'UCHIZA', codigo: '221005' },
  ],
};

async function main() {
  console.log('🌴 Cargando dataset completo de SAN MARTÍN...\n');

  let distritosCreados = 0;
  let distritosActualizados = 0;
  let errores = 0;
  const resumenProvincias: { [key: string]: number } = {};

  for (const [provinciaId, distritos] of Object.entries(SAN_MARTIN_COMPLETO)) {
    try {
      // Verificar si la provincia existe
      const provincia = await prisma.provincia.findUnique({
        where: { id: provinciaId },
      });

      if (!provincia) {
        console.log(`❌ Provincia no encontrada: ${provinciaId}`);
        errores++;
        continue;
      }

      console.log(`\n📍 Procesando ${provincia.nombre}...`);
      let procesados = 0;

      for (const distrito of distritos) {
        try {
          const id = `DIS-${distrito.codigo}`;
          const existing = await prisma.distrito.findUnique({ where: { id } });

          if (existing) {
            // Actualizar si ya existe
            await prisma.distrito.update({
              where: { id },
              data: {
                nombre: distrito.nombre,
                provinciaId: provinciaId,
              },
            });
            distritosActualizados++;
          } else {
            // Crear nuevo
            await prisma.distrito.create({
              data: {
                id,
                nombre: distrito.nombre,
                provinciaId: provinciaId,
              },
            });
            distritosCreados++;
          }
          procesados++;
        } catch (error) {
          console.error(`   ❌ Error procesando distrito ${distrito.nombre}:`, error);
          errores++;
        }
      }

      resumenProvincias[provincia.nombre] = procesados;
      console.log(`   ✅ ${procesados} distritos procesados`);
    } catch (error) {
      console.error(`❌ Error procesando provincia ${provinciaId}:`, error);
      errores++;
    }
  }

  console.log('\n📊 Resumen de carga:');
  console.log(`   ✅ Distritos creados: ${distritosCreados}`);
  console.log(`   🔄 Distritos actualizados: ${distritosActualizados}`);
  console.log(`   ❌ Errores: ${errores}`);

  // Verificar totales de San Martín
  const distritosSanMartin = await prisma.distrito.findMany({
    where: {
      provincia: {
        departamento: {
          nombre: 'SAN MARTIN',
        },
      },
    },
    include: {
      provincia: true,
    },
  });

  console.log(`\n📈 Total de distritos de SAN MARTÍN en BD: ${distritosSanMartin.length}`);

  // Agrupar por provincia
  const porProvincia = distritosSanMartin.reduce((acc, d) => {
    const prov = d.provincia.nombre;
    if (!acc[prov]) acc[prov] = 0;
    acc[prov]++;
    return acc;
  }, {} as { [key: string]: number });

  console.log('\n📋 Distritos por provincia en SAN MARTÍN:');
  Object.entries(porProvincia)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([prov, count]) => {
      console.log(`   ${prov}: ${count} distritos`);
    });

  console.log('\n✅ Carga de SAN MARTÍN completada!');
  console.log('🎯 SAN MARTÍN ahora tiene cobertura completa: 10 provincias, 77 distritos');
}

main()
  .catch((e) => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
