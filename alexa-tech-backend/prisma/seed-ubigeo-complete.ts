/**
 * Script para popular ubigeo completo del Perú
 * Fuente: API pública apis.net.pe (datos oficiales INEI)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UbigeoAPIResponse {
  id_ubigeo: string;
  nombre_ubigeo: string;
  id_padre?: string;
}

const INEI_API = 'https://api.apis.net.pe/v2/ubigeo';

async function fetchUbigeoData(endpoint: string): Promise<UbigeoAPIResponse[]> {
  try {
    const response = await fetch(`${INEI_API}/${endpoint}`);
    if (!response.ok) {
      console.error(`❌ Error ${response.status}: ${endpoint}`);
      return [];
    }
    return await response.json() as UbigeoAPIResponse[];
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}:`, error);
    return [];
  }
}

async function seedUbigeoComplete() {
  console.log('🗺️  Iniciando carga completa de Ubigeo del Perú...\n');

  // 1. Verificar si ya existen datos
  console.log('🔍 Verificando datos existentes...');
  const existingDeps = await prisma.departamento.count();
  
  if (existingDeps >= 25) {
    console.log(`✅ Ya existen ${existingDeps} departamentos. No es necesario volver a cargar.`);
    console.log('💡 Si deseas recargar, elimina manualmente las entidades comerciales primero.');
    return;
  }
  
  console.log(`⚠️  Solo hay ${existingDeps} departamentos. Cargando los faltantes...\n`);

  // 2. Cargar departamentos (25)
  console.log('📍 Cargando departamentos...');
  const depsAPI = await fetchUbigeoData('departamentos');
  
  if (depsAPI.length === 0) {
    console.error('❌ No se pudieron obtener departamentos. Abortando.');
    return;
  }

  const departamentos = depsAPI.map(d => ({
    id: `DEP-${d.id_ubigeo}`,
    nombre: d.nombre_ubigeo,
  }));

  // Usar upsert para evitar duplicados
  for (const dep of departamentos) {
    await prisma.departamento.upsert({
      where: { id: dep.id },
      update: { nombre: dep.nombre },
      create: dep,
    });
  }
  
  console.log(`✅ ${departamentos.length} departamentos procesados\n`);

  // 3. Cargar provincias por cada departamento
  console.log('📍 Cargando provincias...');
  let totalProvincias = 0;

  for (const dep of depsAPI) {
    const provsAPI = await fetchUbigeoData(`provincias/${dep.id_ubigeo}`);
    
    if (provsAPI.length > 0) {
      const provincias = provsAPI.map(p => ({
        id: `PRO-${p.id_ubigeo}`,
        nombre: p.nombre_ubigeo,
        departamentoId: `DEP-${dep.id_ubigeo}`,
      }));

      for (const prov of provincias) {
        await prisma.provincia.upsert({
          where: { id: prov.id },
          update: { nombre: prov.nombre, departamentoId: prov.departamentoId },
          create: prov,
        });
      }
      
      totalProvincias += provincias.length;
      console.log(`   ${dep.nombre_ubigeo}: ${provincias.length} provincias`);

      // 4. Cargar distritos por cada provincia
      for (const prov of provsAPI) {
        const distsAPI = await fetchUbigeoData(`distritos/${prov.id_ubigeo}`);
        
        if (distsAPI.length > 0) {
          const distritos = distsAPI.map(d => ({
            id: `DIS-${d.id_ubigeo}`,
            nombre: d.nombre_ubigeo,
            provinciaId: `PRO-${prov.id_ubigeo}`,
          }));

          for (const dist of distritos) {
            await prisma.distrito.upsert({
              where: { id: dist.id },
              update: { nombre: dist.nombre, provinciaId: dist.provinciaId },
              create: dist,
            });
          }
        }
      }
    }
  }

  console.log(`\n✅ ${totalProvincias} provincias insertadas`);

  // Contar distritos totales
  const totalDistritos = await prisma.distrito.count();
  console.log(`✅ ${totalDistritos} distritos insertados\n`);

  console.log('🎉 Ubigeo completo cargado exitosamente!');
  console.log(`📊 Resumen:`);
  console.log(`   - Departamentos: ${departamentos.length}`);
  console.log(`   - Provincias: ${totalProvincias}`);
  console.log(`   - Distritos: ${totalDistritos}`);
}

seedUbigeoComplete()
  .catch((e) => {
    console.error('❌ Error en seed ubigeo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
