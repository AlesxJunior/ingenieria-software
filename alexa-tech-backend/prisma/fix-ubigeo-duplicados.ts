/**
 * Script para limpiar duplicados en provincias y distritos
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUbigeoDuplicados() {
  console.log('🧹 Limpiando duplicados en ubigeo...\n');

  // 1. Encontrar provincias duplicadas
  console.log('🔍 Buscando provincias duplicadas...');
  const provincias = await prisma.provincia.findMany({ orderBy: { id: 'asc' } });
  
  // Agrupar por departamentoId + nombre
  const provinciasPorNombre = new Map<string, typeof provincias>();
  for (const prov of provincias) {
    const key = `${prov.departamentoId}-${prov.nombre.toUpperCase()}`;
    if (!provinciasPorNombre.has(key)) {
      provinciasPorNombre.set(key, []);
    }
    provinciasPorNombre.get(key)!.push(prov);
  }

  // Encontrar duplicados
  const provinciasDuplicadas: string[] = [];
  for (const [key, provs] of provinciasPorNombre.entries()) {
    if (provs.length > 1) {
      console.log(`   ⚠️  Duplicado: ${key} - ${provs.length} registros`);
      provs.forEach(p => console.log(`      - ${p.id}: ${p.nombre}`));
      
      // Mantener el primero (generalmente con formato correcto), eliminar el resto
      const [mantener, ...eliminar] = provs;
      
      if (!mantener) continue; // Safety check
      
      for (const prov of eliminar) {
        // Actualizar distritos que apuntan a este duplicado
        await prisma.distrito.updateMany({
          where: { provinciaId: prov.id },
          data: { provinciaId: mantener.id },
        });
        
        // Actualizar clientes que apuntan a este duplicado
        await prisma.client.updateMany({
          where: { provinciaId: prov.id },
          data: { provinciaId: mantener.id },
        });
        
        provinciasDuplicadas.push(prov.id);
      }
    }
  }

  // Eliminar provincias duplicadas
  if (provinciasDuplicadas.length > 0) {
    console.log(`\n🗑️  Eliminando ${provinciasDuplicadas.length} provincias duplicadas...`);
    for (const id of provinciasDuplicadas) {
      await prisma.provincia.delete({ where: { id } });
      console.log(`   ❌ Eliminado: ${id}`);
    }
  } else {
    console.log('   ✅ No hay provincias duplicadas');
  }

  // 2. Encontrar distritos duplicados
  console.log('\n🔍 Buscando distritos duplicados...');
  const distritos = await prisma.distrito.findMany({ orderBy: { id: 'asc' } });
  
  // Agrupar por provinciaId + nombre
  const distritosPorNombre = new Map<string, typeof distritos>();
  for (const dist of distritos) {
    const key = `${dist.provinciaId}-${dist.nombre.toUpperCase()}`;
    if (!distritosPorNombre.has(key)) {
      distritosPorNombre.set(key, []);
    }
    distritosPorNombre.get(key)!.push(dist);
  }

  // Encontrar duplicados
  const distritosDuplicados: string[] = [];
  for (const [key, dists] of distritosPorNombre.entries()) {
    if (dists.length > 1) {
      console.log(`   ⚠️  Duplicado: ${key} - ${dists.length} registros`);
      dists.forEach(d => console.log(`      - ${d.id}: ${d.nombre}`));
      
      // Mantener el primero, eliminar el resto
      const [mantener, ...eliminar] = dists;
      
      if (!mantener) continue; // Safety check
      
      for (const dist of eliminar) {
        // Actualizar clientes que apuntan a este duplicado
        await prisma.client.updateMany({
          where: { distritoId: dist.id },
          data: { distritoId: mantener.id },
        });
        
        distritosDuplicados.push(dist.id);
      }
    }
  }

  // Eliminar distritos duplicados
  if (distritosDuplicados.length > 0) {
    console.log(`\n🗑️  Eliminando ${distritosDuplicados.length} distritos duplicados...`);
    for (const id of distritosDuplicados) {
      await prisma.distrito.delete({ where: { id } });
      console.log(`   ❌ Eliminado: ${id}`);
    }
  } else {
    console.log('   ✅ No hay distritos duplicados');
  }

  // 3. Resumen final
  const finalProvs = await prisma.provincia.count();
  const finalDists = await prisma.distrito.count();
  
  console.log('\n📊 Resumen final:');
  console.log(`   Provincias: ${finalProvs}`);
  console.log(`   Distritos: ${finalDists}`);
  console.log('\n✅ Limpieza completada');
}

fixUbigeoDuplicados()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
