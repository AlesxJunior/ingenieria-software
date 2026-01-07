// Script para corregir caracteres con tildes en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixUTF8Data() {
  console.log('\n═══ CORRECCIÓN DE DATOS UTF-8 ═══\n');

  try {
    // 1. Actualizar empresa con país correcto
    const empresa = await prisma.company.findFirst();
    if (empresa) {
      await prisma.company.update({
        where: { id: empresa.id },
        data: {
          pais: 'Perú' // Con tilde
        }
      });
      console.log('✅ País actualizado a "Perú" (con tilde)');
    }

    // 2. Actualizar comprobantes con nombres correctos
    const comprobantes = await prisma.comprobanteType.findMany();
    for (const comp of comprobantes) {
      let nuevoNombre = comp.nombre;
      
      if (comp.codigo === 'FACT') {
        nuevoNombre = 'Factura Electrónica';
      } else if (comp.codigo === 'BOL') {
        nuevoNombre = 'Boleta de Venta';
      } else if (comp.codigo === 'NC') {
        nuevoNombre = 'Nota de Crédito';
      }
      
      if (nuevoNombre !== comp.nombre) {
        await prisma.comprobanteType.update({
          where: { id: comp.id },
          data: { nombre: nuevoNombre }
        });
        console.log(`✅ Comprobante actualizado: ${nuevoNombre}`);
      }
    }

    // 3. Actualizar métodos de pago
    const metodos = await prisma.paymentMethodConfig.findMany();
    for (const metodo of metodos) {
      let nuevoNombre = metodo.nombre;
      
      if (metodo.codigo === 'EFE') {
        nuevoNombre = 'Efectivo';
      } else if (metodo.codigo === 'TAR') {
        nuevoNombre = 'Tarjeta de Crédito/Débito';
      } else if (metodo.codigo === 'TRA') {
        nuevoNombre = 'Transferencia Bancaria';
      } else if (metodo.codigo === 'YAP') {
        nuevoNombre = 'Yape';
      }
      
      if (nuevoNombre !== metodo.nombre) {
        await prisma.paymentMethodConfig.update({
          where: { id: metodo.id },
          data: { nombre: nuevoNombre }
        });
        console.log(`✅ Método de pago actualizado: ${nuevoNombre}`);
      }
    }

    console.log('\n═══ VERIFICACIÓN POST-CORRECCIÓN ═══\n');

    // Verificar datos actualizados
    const empresaActualizada = await prisma.company.findFirst();
    console.log(`País: ${empresaActualizada.pais}`);

    const comprobantesActualizados = await prisma.comprobanteType.findMany();
    console.log('\nComprobantes:');
    comprobantesActualizados.forEach(c => console.log(`  - ${c.nombre}`));

    const metodosActualizados = await prisma.paymentMethodConfig.findMany();
    console.log('\nMétodos de Pago:');
    metodosActualizados.forEach(m => console.log(`  - ${m.nombre}`));

    console.log('\n✅ DATOS CORREGIDOS EXITOSAMENTE\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUTF8Data();
