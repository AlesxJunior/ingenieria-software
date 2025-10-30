const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkEntidades() {
  try {
    console.log('🔍 Verificando módulo de Entidades Comerciales...\n');

    // 1. Contar entidades por tipo
    const totalEntidades = await prisma.client.count();
    const clientes = await prisma.client.count({ where: { tipoEntidad: 'Cliente' } });
    const proveedores = await prisma.client.count({ where: { tipoEntidad: 'Proveedor' } });
    const ambos = await prisma.client.count({ where: { tipoEntidad: 'Ambos' } });

    console.log('📊 Total de entidades:', totalEntidades);
    console.log('  👤 Clientes:', clientes);
    console.log('  🏢 Proveedores:', proveedores);
    console.log('  🔄 Ambos:', ambos);

    // 2. Verificar ubicaciones geográficas
    console.log('\n📍 Verificando ubicaciones geográficas:');
    const departamentos = await prisma.departamento.count();
    const provincias = await prisma.provincia.count();
    const distritos = await prisma.distrito.count();
    
    console.log('  Departamentos:', departamentos);
    console.log('  Provincias:', provincias);
    console.log('  Distritos:', distritos);

    // 3. Mostrar primeras 5 entidades
    if (totalEntidades > 0) {
      console.log('\n📋 Primeras 5 entidades:');
      const entidades = await prisma.client.findMany({
        take: 5,
        include: {
          departamento: true,
          provincia: true,
          distrito: true
        },
        orderBy: { createdAt: 'desc' }
      });

      entidades.forEach((e, i) => {
        const nombre = e.razonSocial || `${e.nombres} ${e.apellidos}`;
        console.log(`${i + 1}. [${e.tipoEntidad}] ${nombre}`);
        console.log(`   Doc: ${e.tipoDocumento} - ${e.numeroDocumento}`);
        console.log(`   📧 ${e.email} | 📞 ${e.telefono}`);
        console.log(`   📍 ${e.distrito.nombre}, ${e.provincia.nombre}, ${e.departamento.nombre}`);
      });
    }

    // 4. Estadísticas por tipo de documento
    console.log('\n📄 Entidades por tipo de documento:');
    const porTipoDoc = await prisma.client.groupBy({
      by: ['tipoDocumento'],
      _count: true
    });
    porTipoDoc.forEach(td => {
      console.log(`  ${td.tipoDocumento}: ${td._count}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkEntidades();
