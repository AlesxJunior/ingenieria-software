// Script para crear series de documentos de compras
// Ejecutar: node scripts/seed-comprobantes-compras.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedComprobantesCompras() {
  console.log('🔄 Creando series de documentos para módulo de compras...\n');

  try {
    // Verificar si ya existen
    const existingOC = await prisma.comprobanteType.findFirst({
      where: { tipo: 'orden-compra' },
    });

    const existingRC = await prisma.comprobanteType.findFirst({
      where: { tipo: 'recepcion-compra' },
    });

    // Crear Orden de Compra si no existe
    if (!existingOC) {
      const oc = await prisma.comprobanteType.create({
        data: {
          codigo: 'OC',
          nombre: 'Orden de Compra',
          descripcion: 'Documento interno para solicitar mercadería a proveedores',
          tipo: 'orden-compra',
          serie: 'OC25', // OC + año (últimos 2 dígitos)
          numeroActual: 0,
          numeroInicio: 1,
          numeroFin: 9999,
          activo: true,
          predeterminado: true,
        },
      });
      console.log(`✅ Orden de Compra creada:`);
      console.log(`   Serie: ${oc.serie}`);
      console.log(`   Próximo: ${oc.serie}-${String(oc.numeroActual + 1).padStart(4, '0')}`);
      console.log('');
    } else {
      console.log(`✓ Orden de Compra ya existe (${existingOC.serie})`);
    }

    // Crear Recepción de Compra si no existe
    if (!existingRC) {
      const rc = await prisma.comprobanteType.create({
        data: {
          codigo: 'RC',
          nombre: 'Recepción de Compra',
          descripcion: 'Documento interno para registrar ingreso de mercadería',
          tipo: 'recepcion-compra',
          serie: 'RC25', // RC + año (últimos 2 dígitos)
          numeroActual: 0,
          numeroInicio: 1,
          numeroFin: 9999,
          activo: true,
          predeterminado: true,
        },
      });
      console.log(`✅ Recepción de Compra creada:`);
      console.log(`   Serie: ${rc.serie}`);
      console.log(`   Próximo: ${rc.serie}-${String(rc.numeroActual + 1).padStart(4, '0')}`);
      console.log('');
    } else {
      console.log(`✓ Recepción de Compra ya existe (${existingRC.serie})`);
    }

    console.log('✅ Seed de comprobantes de compras completado\n');

    // Mostrar todos los comprobantes
    const todos = await prisma.comprobanteType.findMany({
      orderBy: { tipo: 'asc' },
    });

    console.log('📋 COMPROBANTES CONFIGURADOS:\n');
    console.log('┌─────────┬───────────────────────────┬────────┬──────────┬────────┐');
    console.log('│ Código  │ Nombre                    │ Serie  │ Próximo  │ Estado │');
    console.log('├─────────┼───────────────────────────┼────────┼──────────┼────────┤');
    
    todos.forEach(c => {
      const proximo = `${c.serie}-${String(c.numeroActual + 1).padStart(c.serie.length === 4 ? 8 : 4, '0')}`;
      const estado = c.activo ? '✅' : '❌';
      console.log(
        `│ ${c.codigo.padEnd(7)} │ ${c.nombre.padEnd(25).substring(0, 25)} │ ${c.serie.padEnd(6)} │ ${proximo.padEnd(8)} │ ${estado}     │`
      );
    });
    
    console.log('└─────────┴───────────────────────────┴────────┴──────────┴────────┘\n');

  } catch (error) {
    console.error('❌ Error al crear series de compras:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedComprobantesCompras()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
