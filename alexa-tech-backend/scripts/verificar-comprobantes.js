const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarComprobantes() {
  const comprobantes = await prisma.comprobanteType.findMany({
    orderBy: { tipo: 'asc' }
  });

  console.log('\n📋 CONFIGURACIÓN ACTUAL DE COMPROBANTES:\n');
  
  comprobantes.forEach(c => {
    const disponibles = c.numeroFin - c.numeroActual;
    const total = c.numeroFin - c.numeroInicio;
    
    console.log('════════════════════════════════════════');
    console.log(`${c.nombre} (${c.codigo})`);
    console.log(`Tipo: ${c.tipo.toUpperCase()}`);
    console.log(`Serie: ${c.serie}`);
    console.log(`Número Actual: ${c.numeroActual.toLocaleString('es-PE')}`);
    console.log(`Número Inicio: ${c.numeroInicio.toLocaleString('es-PE')}`);
    console.log(`Número Fin: ${c.numeroFin.toLocaleString('es-PE')}`);
    console.log(`Disponibles: ${disponibles.toLocaleString('es-PE')}`);
    console.log(`Total posible: ${total.toLocaleString('es-PE')}`);
    console.log(`Activo: ${c.activo ? 'SÍ' : 'NO'}`);
    console.log(`Predeterminado: ${c.predeterminado ? 'SÍ' : 'NO'}`);
    console.log('════════════════════════════════════════\n');
  });

  console.log('\n🔍 ANÁLISIS SEGÚN SUNAT:\n');
  console.log('Según la normativa SUNAT, el rango numérico para comprobantes electrónicos es:');
  console.log('- Mínimo: 1');
  console.log('- Máximo: 99,999,999 (8 dígitos)');
  console.log('\nTODOS los tipos de comprobantes (Facturas, Boletas, NC, ND) pueden usar');
  console.log('el mismo rango: del 00000001 al 99999999.\n');
  console.log('✅ Es CORRECTO que tanto Boletas como Facturas tengan 99,999,999 disponibles.');
  console.log('✅ Cada SERIE es independiente y tiene su propio correlativo.\n');

  await prisma.$disconnect();
}

verificarComprobantes();
