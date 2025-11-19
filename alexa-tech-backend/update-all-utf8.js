// Actualizar todos los registros con encoding correcto
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllData() {
  console.log('\n═══ ACTUALIZACIÓN COMPLETA DE DATOS ═══\n');

  try {
    // Actualizar todos los comprobantes uno por uno
    const facturaElectronica = 'Factura Electrónica';
    const notaCredito = 'Nota de Crédito';
    
    await prisma.comprobanteType.updateMany({
      where: { codigo: 'FACT' },
      data: { nombre: facturaElectronica }
    });
    console.log('✅ Actualizado: ' + facturaElectronica);

    await prisma.comprobanteType.updateMany({
      where: { codigo: 'NC' },
      data: { nombre: notaCredito }
    });
    console.log('✅ Actualizado: ' + notaCredito);

    // Actualizar método de pago con código actualizado
    const tarjetaCredito = 'Tarjeta de Crédito/Débito';
    await prisma.paymentMethodConfig.updateMany({
      where: { tipo: 'Tarjeta' },
      data: { nombre: tarjetaCredito }
    });
    console.log('✅ Actualizado: ' + tarjetaCredito);

    console.log('\n═══ VERIFICACIÓN FINAL ═══\n');

    // Leer y mostrar todos los datos
    const comprobantes = await prisma.comprobanteType.findMany({
      orderBy: { nombre: 'asc' }
    });
    
    console.log('Comprobantes en base de datos:');
    for (const comp of comprobantes) {
      const bytes = Buffer.from(comp.nombre, 'utf8');
      console.log(`  ${comp.codigo}: "${comp.nombre}" (bytes: ${bytes.length}, chars: ${comp.nombre.length})`);
    }

    const metodos = await prisma.paymentMethodConfig.findMany({
      orderBy: { nombre: 'asc' }
    });
    
    console.log('\nMétodos de Pago en base de datos:');
    for (const metodo of metodos) {
      const bytes = Buffer.from(metodo.nombre, 'utf8');
      console.log(`  ${metodo.codigo}: "${metodo.nombre}" (bytes: ${bytes.length}, chars: ${metodo.nombre.length})`);
    }

    console.log('\n✅ ACTUALIZACIÓN COMPLETADA\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAllData();
