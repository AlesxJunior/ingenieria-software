const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function actualizarSeries() {
  console.log('🔄 Actualizando series de comprobantes a formato profesional SUNAT...\n');

  try {
    // Obtener todos los comprobantes
    const comprobantes = await prisma.comprobanteType.findMany();

    console.log(`📋 Comprobantes encontrados: ${comprobantes.length}\n`);

    const seriesMap = {
      'factura': 'F001',
      'boleta': 'B001',
      'nota-credito': 'NC01',
      'nota-debito': 'ND01',
    };

    for (const comprobante of comprobantes) {
      const serieAntigua = comprobante.serie;
      const nuevaSerie = seriesMap[comprobante.tipo] || comprobante.serie;

      // Solo actualizar si la serie no es profesional (4 caracteres)
      if (serieAntigua.length !== 4 || !nuevaSerie) {
        await prisma.comprobanteType.update({
          where: { id: comprobante.id },
          data: { 
            serie: nuevaSerie,
            // Resetear numeración si es necesario
            numeroActual: comprobante.numeroActual < 1 ? 1 : comprobante.numeroActual,
          },
        });

        console.log(`✅ ${comprobante.nombre}:`);
        console.log(`   Serie antigua: ${serieAntigua}`);
        console.log(`   Serie nueva: ${nuevaSerie}`);
        console.log(`   Próximo correlativo: ${nuevaSerie}-${String(comprobante.numeroActual + 1).padStart(8, '0')}`);
        console.log('');
      } else {
        console.log(`✓ ${comprobante.nombre}: Serie ya es profesional (${serieAntigua})`);
      }
    }

    // Crear comprobantes faltantes si no existen
    const tiposExistentes = comprobantes.map(c => c.tipo);
    const tiposFaltantes = Object.keys(seriesMap).filter(tipo => !tiposExistentes.includes(tipo));

    if (tiposFaltantes.length > 0) {
      console.log(`\n📝 Creando comprobantes faltantes: ${tiposFaltantes.join(', ')}\n`);

      for (const tipo of tiposFaltantes) {
        const nombreMap = {
          'factura': 'Factura Electrónica',
          'boleta': 'Boleta de Venta Electrónica',
          'nota-credito': 'Nota de Crédito Electrónica',
          'nota-debito': 'Nota de Débito Electrónica',
        };

        const codigoMap = {
          'factura': '01',
          'boleta': '03',
          'nota-credito': '07',
          'nota-debito': '08',
        };

        const nuevo = await prisma.comprobanteType.create({
          data: {
            codigo: codigoMap[tipo],
            nombre: nombreMap[tipo],
            descripcion: `Comprobante electrónico - ${nombreMap[tipo]}`,
            tipo: tipo,
            serie: seriesMap[tipo],
            numeroActual: 1,
            numeroInicio: 1,
            numeroFin: 99999999,
            activo: true,
            predeterminado: tipo === 'boleta', // Boleta por defecto
          },
        });

        console.log(`✅ Creado: ${nuevo.nombre} (${nuevo.serie})`);
      }
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Series actualizadas correctamente');
    console.log('═══════════════════════════════════════\n');

    // Mostrar resumen final
    const todosComprobantes = await prisma.comprobanteType.findMany({
      orderBy: { tipo: 'asc' },
    });

    console.log('📊 RESUMEN DE COMPROBANTES CONFIGURADOS:\n');
    todosComprobantes.forEach(c => {
      const siguiente = `${c.serie}-${String(c.numeroActual + 1).padStart(8, '0')}`;
      const disponibles = c.numeroFin - c.numeroActual;
      console.log(`${c.activo ? '✅' : '❌'} ${c.nombre}`);
      console.log(`   Serie: ${c.serie}`);
      console.log(`   Próximo: ${siguiente}`);
      console.log(`   Disponibles: ${disponibles.toLocaleString()}`);
      console.log(`   Predeterminado: ${c.predeterminado ? 'Sí' : 'No'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
actualizarSeries()
  .then(() => {
    console.log('🎉 Proceso completado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
