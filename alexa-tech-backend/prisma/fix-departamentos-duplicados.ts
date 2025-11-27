/**
 * Script para eliminar departamentos duplicados
 * Deja solo los 25 departamentos en MAYÚSCULA
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 25 departamentos oficiales del Perú (MAYÚSCULA)
const DEPARTAMENTOS_OFICIALES = [
  { id: 'DEP-01', nombre: 'AMAZONAS' },
  { id: 'DEP-02', nombre: 'ANCASH' },
  { id: 'DEP-03', nombre: 'APURIMAC' },
  { id: 'DEP-04', nombre: 'AREQUIPA' },
  { id: 'DEP-05', nombre: 'AYACUCHO' },
  { id: 'DEP-06', nombre: 'CAJAMARCA' },
  { id: 'DEP-07', nombre: 'CALLAO' },
  { id: 'DEP-08', nombre: 'CUSCO' },
  { id: 'DEP-09', nombre: 'HUANCAVELICA' },
  { id: 'DEP-10', nombre: 'HUANUCO' },
  { id: 'DEP-11', nombre: 'ICA' },
  { id: 'DEP-12', nombre: 'JUNIN' },
  { id: 'DEP-13', nombre: 'LA LIBERTAD' },
  { id: 'DEP-14', nombre: 'LAMBAYEQUE' },
  { id: 'DEP-15', nombre: 'LIMA' },
  { id: 'DEP-16', nombre: 'LORETO' },
  { id: 'DEP-17', nombre: 'MADRE DE DIOS' },
  { id: 'DEP-18', nombre: 'MOQUEGUA' },
  { id: 'DEP-19', nombre: 'PASCO' },
  { id: 'DEP-20', nombre: 'PIURA' },
  { id: 'DEP-21', nombre: 'PUNO' },
  { id: 'DEP-22', nombre: 'SAN MARTIN' },
  { id: 'DEP-23', nombre: 'TACNA' },
  { id: 'DEP-24', nombre: 'TUMBES' },
  { id: 'DEP-25', nombre: 'UCAYALI' },
];

async function fixDepartamentos() {
  console.log('🔧 Limpiando departamentos duplicados...\n');

  // 1. Obtener todos los departamentos actuales
  const allDeps = await prisma.departamento.findMany();
  console.log(`📊 Departamentos actuales: ${allDeps.length}`);
  
  // 2. Identificar IDs oficiales
  const idsOficiales = DEPARTAMENTOS_OFICIALES.map(d => d.id);
  
  // 3. Encontrar duplicados (los que NO están en la lista oficial)
  const duplicados = allDeps.filter(d => !idsOficiales.includes(d.id));
  console.log(`🗑️  Duplicados a eliminar: ${duplicados.length}`);
  
  if (duplicados.length > 0) {
    console.log('\n📋 Departamentos duplicados:');
    duplicados.forEach(d => console.log(`   - ${d.id}: ${d.nombre}`));
  }

  // 4. Actualizar provincias que apuntan a departamentos duplicados
  console.log('\n🔄 Actualizando referencias...');
  
  // Mapeo de IDs viejos a nuevos
  const mapeo: Record<string, string> = {
    'DEP-LIM': 'DEP-15',
    'DEP-ARE': 'DEP-04',
    'DEP-LLI': 'DEP-13',
    'DEP-CUS': 'DEP-08',
    'DEP-PIU': 'DEP-20',
    'DEP-LAM': 'DEP-14',
    'DEP-LOR': 'DEP-16',
    'DEP-ANC': 'DEP-02',
    'DEP-TAC': 'DEP-23',
  };

  for (const [viejoId, nuevoId] of Object.entries(mapeo)) {
    // Actualizar provincias
    const provinciasAfectadas = await prisma.provincia.updateMany({
      where: { departamentoId: viejoId },
      data: { departamentoId: nuevoId },
    });
    
    if (provinciasAfectadas.count > 0) {
      console.log(`   ✅ ${provinciasAfectadas.count} provincias actualizadas: ${viejoId} → ${nuevoId}`);
    }

    // Actualizar entidades comerciales (clients)
    const entidadesAfectadas = await prisma.client.updateMany({
      where: { departamentoId: viejoId },
      data: { departamentoId: nuevoId },
    });
    
    if (entidadesAfectadas.count > 0) {
      console.log(`   ✅ ${entidadesAfectadas.count} clientes actualizados: ${viejoId} → ${nuevoId}`);
    }
  }

  // 5. Eliminar duplicados
  console.log('\n🗑️  Eliminando duplicados...');
  for (const dup of duplicados) {
    await prisma.departamento.delete({ where: { id: dup.id } });
    console.log(`   ❌ Eliminado: ${dup.id} (${dup.nombre})`);
  }

  // 6. Asegurar que existan los 25 oficiales
  console.log('\n✅ Insertando/actualizando departamentos oficiales...');
  for (const dep of DEPARTAMENTOS_OFICIALES) {
    await prisma.departamento.upsert({
      where: { id: dep.id },
      update: { nombre: dep.nombre },
      create: dep,
    });
  }

  // 7. Verificar resultado final
  const finalDeps = await prisma.departamento.findMany({ orderBy: { id: 'asc' } });
  console.log(`\n✅ Total final: ${finalDeps.length}/25 departamentos`);
  
  console.log('\n📋 Departamentos finales:');
  finalDeps.forEach((d, i) => {
    console.log(`   ${String(i + 1).padStart(2, '0')}. ${d.id} - ${d.nombre}`);
  });

  if (finalDeps.length === 25) {
    console.log('\n🎉 ¡Perfecto! 25 departamentos oficiales del Perú cargados correctamente.');
  } else {
    console.log(`\n⚠️  Advertencia: Se esperaban 25 departamentos, pero hay ${finalDeps.length}`);
  }
}

fixDepartamentos()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
