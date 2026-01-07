/**
 * Script simplificado: Solo agrega departamentos faltantes
 * Completa los 25 departamentos del Perú
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 25 departamentos del Perú (oficiales INEI)
const DEPARTAMENTOS_PERU = [
  { id: 'DEP-01', codigo: '01', nombre: 'AMAZONAS' },
  { id: 'DEP-02', codigo: '02', nombre: 'ANCASH' },
  { id: 'DEP-03', codigo: '03', nombre: 'APURIMAC' },
  { id: 'DEP-04', codigo: '04', nombre: 'AREQUIPA' },
  { id: 'DEP-05', codigo: '05', nombre: 'AYACUCHO' },
  { id: 'DEP-06', codigo: '06', nombre: 'CAJAMARCA' },
  { id: 'DEP-07', codigo: '07', nombre: 'CALLAO' },
  { id: 'DEP-08', codigo: '08', nombre: 'CUSCO' },
  { id: 'DEP-09', codigo: '09', nombre: 'HUANCAVELICA' },
  { id: 'DEP-10', codigo: '10', nombre: 'HUANUCO' },
  { id: 'DEP-11', codigo: '11', nombre: 'ICA' },
  { id: 'DEP-12', codigo: '12', nombre: 'JUNIN' },
  { id: 'DEP-13', codigo: '13', nombre: 'LA LIBERTAD' },
  { id: 'DEP-14', codigo: '14', nombre: 'LAMBAYEQUE' },
  { id: 'DEP-15', codigo: '15', nombre: 'LIMA' },
  { id: 'DEP-16', codigo: '16', nombre: 'LORETO' },
  { id: 'DEP-17', codigo: '17', nombre: 'MADRE DE DIOS' },
  { id: 'DEP-18', codigo: '18', nombre: 'MOQUEGUA' },
  { id: 'DEP-19', codigo: '19', nombre: 'PASCO' },
  { id: 'DEP-20', codigo: '20', nombre: 'PIURA' },
  { id: 'DEP-21', codigo: '21', nombre: 'PUNO' },
  { id: 'DEP-22', codigo: '22', nombre: 'SAN MARTIN' },
  { id: 'DEP-23', codigo: '23', nombre: 'TACNA' },
  { id: 'DEP-24', codigo: '24', nombre: 'TUMBES' },
  { id: 'DEP-25', codigo: '25', nombre: 'UCAYALI' },
];

async function seedDepartamentos() {
  console.log('🗺️  Agregando departamentos faltantes del Perú...\n');

  let created = 0;
  let updated = 0;

  for (const dep of DEPARTAMENTOS_PERU) {
    const result = await prisma.departamento.upsert({
      where: { id: dep.id },
      update: { nombre: dep.nombre },
      create: {id: dep.id, nombre: dep.nombre },
    });

    if (result) {
      const exists = await prisma.departamento.findUnique({ where: { id: dep.id } });
      if (exists) updated++;
      else created++;
    }
  }

  const total = await prisma.departamento.count();
  console.log(`✅ Departamentos procesados:`);
  console.log(`   Total en DB: ${total}/25`);
  console.log(`   Nuevos: ${created}`);
  console.log(`   Actualizados: ${updated}\n`);

  // Mostrar departamentos cargados
  const allDeps = await prisma.departamento.findMany({ orderBy: { nombre: 'asc' } });
  console.log('📋 Departamentos en la base de datos:');
  allDeps.forEach((d, i) => {
    console.log(`   ${String(i + 1).padStart(2, '0')}. ${d.nombre}`);
  });

  console.log('\n🎉 ¡Listo! Ahora puedes buscar RUCs de cualquier departamento del Perú.');
  console.log('💡 Nota: Las provincias y distritos se pueden agregar después si es necesario.');
}

seedDepartamentos()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
