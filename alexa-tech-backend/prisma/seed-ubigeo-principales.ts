/**
 * Datos de ubigeo de UCAYALI para testing con SUNAT
 * RUC 20601233488: UCAYALI -> CORONEL PORTILLO -> YARINACOCHA
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Provincias principales de cada departamento
const PROVINCIAS_PRINCIPALES = [
  // UCAYALI (necesario para el RUC 20601233488)
  { id: 'PRO-2501', nombre: 'CORONEL PORTILLO', departamentoId: 'DEP-25' },
  { id: 'PRO-2502', nombre: 'ATALAYA', departamentoId: 'DEP-25' },
  { id: 'PRO-2503', nombre: 'PADRE ABAD', departamentoId: 'DEP-25' },
  { id: 'PRO-2504', nombre: 'PURUS', departamentoId: 'DEP-25' },
  
  // LIMA (importante)
  { id: 'PRO-1501', nombre: 'LIMA', departamentoId: 'DEP-15' },
  { id: 'PRO-1502', nombre: 'BARRANCA', departamentoId: 'DEP-15' },
  { id: 'PRO-1503', nombre: 'CAJATAMBO', departamentoId: 'DEP-15' },
  { id: 'PRO-1504', nombre: 'CANTA', departamentoId: 'DEP-15' },
  { id: 'PRO-1505', nombre: 'CAÑETE', departamentoId: 'DEP-15' },
  { id: 'PRO-1506', nombre: 'HUARAL', departamentoId: 'DEP-15' },
  { id: 'PRO-1507', nombre: 'HUAROCHIRI', departamentoId: 'DEP-15' },
  { id: 'PRO-1508', nombre: 'HUAURA', departamentoId: 'DEP-15' },
  { id: 'PRO-1509', nombre: 'OYON', departamentoId: 'DEP-15' },
  { id: 'PRO-1510', nombre: 'YAUYOS', departamentoId: 'DEP-15' },
  
  // AREQUIPA
  { id: 'PRO-0401', nombre: 'AREQUIPA', departamentoId: 'DEP-04' },
  { id: 'PRO-0402', nombre: 'CAMANA', departamentoId: 'DEP-04' },
  { id: 'PRO-0403', nombre: 'CARAVELI', departamentoId: 'DEP-04' },
  { id: 'PRO-0404', nombre: 'CASTILLA', departamentoId: 'DEP-04' },
  { id: 'PRO-0405', nombre: 'CAYLLOMA', departamentoId: 'DEP-04' },
  { id: 'PRO-0406', nombre: 'CONDESUYOS', departamentoId: 'DEP-04' },
  { id: 'PRO-0407', nombre: 'ISLAY', departamentoId: 'DEP-04' },
  { id: 'PRO-0408', nombre: 'LA UNION', departamentoId: 'DEP-04' },
  
  // CUSCO
  { id: 'PRO-0801', nombre: 'CUSCO', departamentoId: 'DEP-08' },
  { id: 'PRO-0802', nombre: 'ACOMAYO', departamentoId: 'DEP-08' },
  { id: 'PRO-0803', nombre: 'ANTA', departamentoId: 'DEP-08' },
  { id: 'PRO-0804', nombre: 'CALCA', departamentoId: 'DEP-08' },
  
  // Otros departamentos capitales
  { id: 'PRO-0101', nombre: 'CHACHAPOYAS', departamentoId: 'DEP-01' },
  { id: 'PRO-0201', nombre: 'HUARAZ', departamentoId: 'DEP-02' },
  { id: 'PRO-0301', nombre: 'ABANCAY', departamentoId: 'DEP-03' },
  { id: 'PRO-0501', nombre: 'HUAMANGA', departamentoId: 'DEP-05' },
  { id: 'PRO-0601', nombre: 'CAJAMARCA', departamentoId: 'DEP-06' },
  { id: 'PRO-0701', nombre: 'CALLAO', departamentoId: 'DEP-07' },
  { id: 'PRO-0901', nombre: 'HUANCAVELICA', departamentoId: 'DEP-09' },
  { id: 'PRO-1001', nombre: 'HUANUCO', departamentoId: 'DEP-10' },
  { id: 'PRO-1101', nombre: 'ICA', departamentoId: 'DEP-11' },
  { id: 'PRO-1201', nombre: 'HUANCAYO', departamentoId: 'DEP-12' },
  { id: 'PRO-1301', nombre: 'TRUJILLO', departamentoId: 'DEP-13' },
  { id: 'PRO-1401', nombre: 'CHICLAYO', departamentoId: 'DEP-14' },
  { id: 'PRO-1601', nombre: 'MAYNAS', departamentoId: 'DEP-16' },
  { id: 'PRO-1701', nombre: 'TAMBOPATA', departamentoId: 'DEP-17' },
  { id: 'PRO-1801', nombre: 'MARISCAL NIETO', departamentoId: 'DEP-18' },
  { id: 'PRO-1901', nombre: 'PASCO', departamentoId: 'DEP-19' },
  { id: 'PRO-2001', nombre: 'PIURA', departamentoId: 'DEP-20' },
  { id: 'PRO-2101', nombre: 'PUNO', departamentoId: 'DEP-21' },
  { id: 'PRO-2201', nombre: 'MOYOBAMBA', departamentoId: 'DEP-22' },
  { id: 'PRO-2301', nombre: 'TACNA', departamentoId: 'DEP-23' },
  { id: 'PRO-2401', nombre: 'TUMBES', departamentoId: 'DEP-24' },
];

// Distritos principales (capitales + los del RUC de prueba)
const DISTRITOS_PRINCIPALES = [
  // UCAYALI - CORONEL PORTILLO (importante para RUC 20601233488)
  { id: 'DIS-250101', nombre: 'CALLERIA', provinciaId: 'PRO-2501' },
  { id: 'DIS-250102', nombre: 'CAMPOVERDE', provinciaId: 'PRO-2501' },
  { id: 'DIS-250103', nombre: 'IPARIA', provinciaId: 'PRO-2501' },
  { id: 'DIS-250104', nombre: 'MASISEA', provinciaId: 'PRO-2501' },
  { id: 'DIS-250105', nombre: 'YARINACOCHA', provinciaId: 'PRO-2501' }, // ⭐ IMPORTANTE
  { id: 'DIS-250106', nombre: 'NUEVA REQUENA', provinciaId: 'PRO-2501' },
  { id: 'DIS-250107', nombre: 'MANANTAY', provinciaId: 'PRO-2501' },
  
  // LIMA principales
  { id: 'DIS-150101', nombre: 'LIMA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150102', nombre: 'ANCON', provinciaId: 'PRO-1501' },
  { id: 'DIS-150103', nombre: 'ATE', provinciaId: 'PRO-1501' },
  { id: 'DIS-150104', nombre: 'BARRANCO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150105', nombre: 'BREÑA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150106', nombre: 'CARABAYLLO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150107', nombre: 'CHACLACAYO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150108', nombre: 'CHORRILLOS', provinciaId: 'PRO-1501' },
  { id: 'DIS-150109', nombre: 'CIENEGUILLA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150110', nombre: 'COMAS', provinciaId: 'PRO-1501' },
  { id: 'DIS-150111', nombre: 'EL AGUSTINO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150112', nombre: 'INDEPENDENCIA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150113', nombre: 'JESUS MARIA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150114', nombre: 'LA MOLINA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150115', nombre: 'LA VICTORIA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150116', nombre: 'LINCE', provinciaId: 'PRO-1501' },
  { id: 'DIS-150117', nombre: 'LOS OLIVOS', provinciaId: 'PRO-1501' },
  { id: 'DIS-150118', nombre: 'LURIGANCHO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150119', nombre: 'LURIN', provinciaId: 'PRO-1501' },
  { id: 'DIS-150120', nombre: 'MAGDALENA DEL MAR', provinciaId: 'PRO-1501' },
  { id: 'DIS-150121', nombre: 'PUEBLO LIBRE', provinciaId: 'PRO-1501' },
  { id: 'DIS-150122', nombre: 'MIRAFLORES', provinciaId: 'PRO-1501' },
  { id: 'DIS-150123', nombre: 'PACHACAMAC', provinciaId: 'PRO-1501' },
  { id: 'DIS-150124', nombre: 'PUCUSANA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150125', nombre: 'PUENTE PIEDRA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150126', nombre: 'PUNTA HERMOSA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150127', nombre: 'PUNTA NEGRA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150128', nombre: 'RIMAC', provinciaId: 'PRO-1501' },
  { id: 'DIS-150129', nombre: 'SAN BARTOLO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150130', nombre: 'SAN BORJA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150131', nombre: 'SAN ISIDRO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150132', nombre: 'SAN JUAN DE LURIGANCHO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150133', nombre: 'SAN JUAN DE MIRAFLORES', provinciaId: 'PRO-1501' },
  { id: 'DIS-150134', nombre: 'SAN LUIS', provinciaId: 'PRO-1501' },
  { id: 'DIS-150135', nombre: 'SAN MARTIN DE PORRES', provinciaId: 'PRO-1501' },
  { id: 'DIS-150136', nombre: 'SAN MIGUEL', provinciaId: 'PRO-1501' },
  { id: 'DIS-150137', nombre: 'SANTA ANITA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150138', nombre: 'SANTA MARIA DEL MAR', provinciaId: 'PRO-1501' },
  { id: 'DIS-150139', nombre: 'SANTA ROSA', provinciaId: 'PRO-1501' },
  { id: 'DIS-150140', nombre: 'SANTIAGO DE SURCO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150141', nombre: 'SURQUILLO', provinciaId: 'PRO-1501' },
  { id: 'DIS-150142', nombre: 'VILLA EL SALVADOR', provinciaId: 'PRO-1501' },
  { id: 'DIS-150143', nombre: 'VILLA MARIA DEL TRIUNFO', provinciaId: 'PRO-1501' },
  
  // Capitales de departamentos
  { id: 'DIS-040101', nombre: 'AREQUIPA', provinciaId: 'PRO-0401' },
  { id: 'DIS-080101', nombre: 'CUSCO', provinciaId: 'PRO-0801' },
  { id: 'DIS-010101', nombre: 'CHACHAPOYAS', provinciaId: 'PRO-0101' },
  { id: 'DIS-020101', nombre: 'HUARAZ', provinciaId: 'PRO-0201' },
  { id: 'DIS-130101', nombre: 'TRUJILLO', provinciaId: 'PRO-1301' },
  { id: 'DIS-140101', nombre: 'CHICLAYO', provinciaId: 'PRO-1401' },
  { id: 'DIS-200101', nombre: 'PIURA', provinciaId: 'PRO-2001' },
  { id: 'DIS-160101', nombre: 'IQUITOS', provinciaId: 'PRO-1601' },
  { id: 'DIS-070101', nombre: 'CALLAO', provinciaId: 'PRO-0701' },
];

async function seedUbigeoPrincipales() {
  console.log('🗺️  Cargando provincias y distritos principales...\n');

  // 1. Insertar provincias
  console.log('📍 Insertando provincias...');
  for (const prov of PROVINCIAS_PRINCIPALES) {
    await prisma.provincia.upsert({
      where: { id: prov.id },
      update: { nombre: prov.nombre, departamentoId: prov.departamentoId },
      create: prov,
    });
  }
  console.log(`✅ ${PROVINCIAS_PRINCIPALES.length} provincias procesadas\n`);

  // 2. Insertar distritos
  console.log('📍 Insertando distritos...');
  for (const dist of DISTRITOS_PRINCIPALES) {
    await prisma.distrito.upsert({
      where: { id: dist.id },
      update: { nombre: dist.nombre, provinciaId: dist.provinciaId },
      create: dist,
    });
  }
  console.log(`✅ ${DISTRITOS_PRINCIPALES.length} distritos procesados\n`);

  // 3. Verificar resultados
  const totalProvs = await prisma.provincia.count();
  const totalDists = await prisma.distrito.count();
  
  console.log('📊 Resumen ubigeo:');
  console.log(`   Departamentos: 25`);
  console.log(`   Provincias: ${totalProvs}`);
  console.log(`   Distritos: ${totalDists}\n`);

  // 4. Verificar datos específicos para testing
  console.log('🔍 Verificando datos para RUC 20601233488:');
  const ucayali = await prisma.departamento.findUnique({ where: { id: 'DEP-25' } });
  const coronelPortillo = await prisma.provincia.findUnique({ where: { id: 'PRO-2501' } });
  const yarinacocha = await prisma.distrito.findUnique({ where: { id: 'DIS-250105' } });
  
  if (ucayali && coronelPortillo && yarinacocha) {
    console.log(`   ✅ Departamento: ${ucayali.nombre}`);
    console.log(`   ✅ Provincia: ${coronelPortillo.nombre}`);
    console.log(`   ✅ Distrito: ${yarinacocha.nombre}`);
    console.log('\n🎉 ¡Perfecto! El ubigeo está listo para autocompletar con SUNAT.');
  } else {
    console.log('   ❌ Falta algún dato de ubigeo');
  }
}

seedUbigeoPrincipales()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
