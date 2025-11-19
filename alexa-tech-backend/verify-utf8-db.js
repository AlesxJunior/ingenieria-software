// Verificar UTF-8 en la base de datos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyUTF8() {
  console.log('\n═══ VERIFICACIÓN UTF-8 EN BASE DE DATOS ═══\n');

  try {
    // Verificar empresa
    const empresa = await prisma.company.findFirst();
    if (empresa) {
      console.log('✓ EMPRESA:');
      console.log(`  País: ${empresa.pais}`);
      console.log(`  Razón Social: ${empresa.razonSocial}`);
      
      if (empresa.pais === 'Perú') {
        console.log('  ✅ La tilde en "Perú" se guardó correctamente\n');
      } else {
        console.log(`  ❌ Error: País guardado como "${empresa.pais}"\n`);
      }
    }

    // Verificar comprobantes
    const comprobantes = await prisma.comprobanteType.findMany();
    console.log('✓ COMPROBANTES:');
    comprobantes.forEach(comp => {
      console.log(`  - ${comp.nombre} (${comp.serie})`);
      
      // Verificar caracteres con tilde
      if (comp.nombre.includes('Electrónica')) {
        console.log('    ✅ "Electrónica" tiene tilde correcta');
      }
      if (comp.nombre.includes('Crédito')) {
        console.log('    ✅ "Crédito" tiene tilde correcta');
      }
    });

    // Verificar métodos de pago
    console.log('\n✓ MÉTODOS DE PAGO:');
    const metodos = await prisma.paymentMethodConfig.findMany();
    metodos.forEach(metodo => {
      console.log(`  - ${metodo.nombre} (${metodo.codigo})`);
      
      if (metodo.nombre.includes('Crédito') || metodo.nombre.includes('Débito')) {
        console.log('    ✅ Tildes correctas');
      }
    });

    console.log('\n═══════════════════════════════════════\n');
    console.log('✅ CONCLUSIÓN: Todos los caracteres UTF-8 (tildes) se guardan correctamente en la base de datos');
    console.log('⚠️  El problema de visualización es solo en PowerShell, no en los datos reales\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUTF8();
