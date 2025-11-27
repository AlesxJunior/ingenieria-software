import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando datos de SAN MARTÍN en la base de datos...\n');

  // Buscar departamento SAN MARTÍN
  const departamento = await prisma.departamento.findFirst({
    where: {
      nombre: {
        contains: 'SAN MARTIN',
        mode: 'insensitive',
      },
    },
  });

  if (!departamento) {
    console.log('❌ Departamento SAN MARTÍN no encontrado');
    return;
  }

  console.log(`✅ Departamento encontrado: ${departamento.nombre} (${departamento.id})\n`);

  // Obtener todas las provincias de San Martín
  const provincias = await prisma.provincia.findMany({
    where: { departamentoId: departamento.id },
    orderBy: { nombre: 'asc' },
  });

  console.log(`📋 Provincias de SAN MARTÍN (${provincias.length}):`);
  for (const prov of provincias) {
    const distritos = await prisma.distrito.findMany({
      where: { provinciaId: prov.id },
      orderBy: { nombre: 'asc' },
    });
    
    console.log(`\n   ${prov.nombre} (${prov.id}) - ${distritos.length} distritos:`);
    distritos.forEach(d => {
      console.log(`      - ${d.nombre} (${d.id})`);
    });
  }

  // Simular búsqueda de provincia "TARAPOTO"
  console.log('\n\n🔎 Simulando búsqueda de provincia "TARAPOTO":');
  const tarapotoProv = provincias.find(p => 
    p.nombre.toUpperCase().includes('TARAPOTO') || 
    'TARAPOTO'.includes(p.nombre.toUpperCase())
  );
  
  if (tarapotoProv) {
    console.log(`   ✅ Encontrada: ${tarapotoProv.nombre} (${tarapotoProv.id})`);
  } else {
    console.log('   ❌ No encontrada');
    console.log('   💡 Provincias disponibles:', provincias.map(p => p.nombre).join(', '));
  }

  // Simular búsqueda de provincia "SAN MARTÍN"
  console.log('\n🔎 Simulando búsqueda de provincia "SAN MARTÍN":');
  const sanMartinProv = provincias.find(p => 
    p.nombre.toUpperCase().includes('SAN MARTIN') || 
    'SAN MARTIN'.includes(p.nombre.toUpperCase())
  );
  
  if (sanMartinProv) {
    console.log(`   ✅ Encontrada: ${sanMartinProv.nombre} (${sanMartinProv.id})`);
    
    // Buscar distrito TARAPOTO en esta provincia
    const distritosTarapoto = await prisma.distrito.findMany({
      where: { 
        provinciaId: sanMartinProv.id,
        nombre: {
          contains: 'TARAPOTO',
          mode: 'insensitive',
        },
      },
    });
    
    console.log(`\n   🔎 Buscando distrito "TARAPOTO" en ${sanMartinProv.nombre}:`);
    if (distritosTarapoto.length > 0) {
      distritosTarapoto.forEach(d => {
        console.log(`      ✅ ${d.nombre} (${d.id})`);
      });
    } else {
      console.log('      ❌ No encontrado');
    }
  } else {
    console.log('   ❌ No encontrada');
  }

  // Buscar cualquier provincia que contenga "MARTIN"
  console.log('\n🔎 Buscando provincias que contengan "MARTIN":');
  const martinProvs = provincias.filter(p => 
    p.nombre.toUpperCase().includes('MARTIN')
  );
  
  if (martinProvs.length > 0) {
    martinProvs.forEach(p => {
      console.log(`   ✅ ${p.nombre} (${p.id})`);
    });
  } else {
    console.log('   ❌ Ninguna encontrada');
  }

  console.log('\n✅ Verificación completada');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
