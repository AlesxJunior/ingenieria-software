const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function poblarEntidades() {
  try {
    console.log('🚀 Poblando módulo de Entidades Comerciales...\n');

    // 1. Poblar ubicaciones geográficas (simplificado - solo Lima)
    console.log('📍 Creando ubicaciones geográficas...');
    
    const lima = await prisma.departamento.upsert({
      where: { id: 'LIMA' },
      update: {},
      create: {
        id: 'LIMA',
        nombre: 'Lima'
      }
    });

    const provinciaLima = await prisma.provincia.upsert({
      where: { id: 'LIMA-LIMA' },
      update: {},
      create: {
        id: 'LIMA-LIMA',
        nombre: 'Lima',
        departamentoId: lima.id
      }
    });

    const distritos = [
      { id: 'LIMA-LIMA-MIRAFLORES', nombre: 'Miraflores' },
      { id: 'LIMA-LIMA-SURCO', nombre: 'Santiago de Surco' },
      { id: 'LIMA-LIMA-SANISIDRO', nombre: 'San Isidro' },
      { id: 'LIMA-LIMA-LAMOINA', nombre: 'La Molina' },
      { id: 'LIMA-LIMA-SANBORJA', nombre: 'San Borja' }
    ];

    for (const d of distritos) {
      await prisma.distrito.upsert({
        where: { id: d.id },
        update: {},
        create: {
          id: d.id,
          nombre: d.nombre,
          provinciaId: provinciaLima.id
        }
      });
    }

    console.log('✅ Ubicaciones creadas\n');

    // 2. Crear entidades comerciales de ejemplo
    console.log('👥 Creando entidades comerciales...\n');

    const entidadesEjemplo = [
      // Clientes personas naturales
      {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan.perez@email.com',
        telefono: '987654321',
        direccion: 'Av. Larco 1234',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-MIRAFLORES'
      },
      {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '87654321',
        nombres: 'María Isabel',
        apellidos: 'Rodríguez López',
        email: 'maria.rodriguez@email.com',
        telefono: '987123456',
        direccion: 'Jr. Los Pinos 567',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-SURCO'
      },
      // Proveedores (empresas)
      {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        razonSocial: 'TECH SOLUTIONS S.A.C.',
        email: 'ventas@techsolutions.com',
        telefono: '014567890',
        direccion: 'Av. Javier Prado 2345',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-SANISIDRO'
      },
      {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20987654321',
        razonSocial: 'DISTRIBUIDORA GLOBAL E.I.R.L.',
        email: 'contacto@distriglobal.com',
        telefono: '013456789',
        direccion: 'Av. La Molina 890',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-LAMOINA'
      },
      {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20555666777',
        razonSocial: 'IMPORTACIONES PERU S.R.L.',
        email: 'info@importperu.com',
        telefono: '012345678',
        direccion: 'Av. República de Panamá 5678',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-SURCO'
      },
      // Entidades mixtas (Cliente y Proveedor)
      {
        tipoEntidad: 'Ambos',
        tipoDocumento: 'RUC',
        numeroDocumento: '20111222333',
        razonSocial: 'COMERCIALIZADORA UNIVERSAL S.A.',
        email: 'ventas@universal.com',
        telefono: '016789012',
        direccion: 'Av. Aviación 3456',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-SANBORJA'
      },
      // Más clientes
      {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'DNI',
        numeroDocumento: '45678912',
        nombres: 'Carlos Alberto',
        apellidos: 'Mendoza Silva',
        email: 'carlos.mendoza@email.com',
        telefono: '998877665',
        direccion: 'Calle Las Begonias 234',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-SANISIDRO'
      },
      {
        tipoEntidad: 'Cliente',
        tipoDocumento: 'CE',
        numeroDocumento: '001234567',
        nombres: 'Ana Lucía',
        apellidos: 'Fernández Torres',
        email: 'ana.fernandez@email.com',
        telefono: '987555444',
        direccion: 'Av. El Golf 789',
        departamentoId: 'LIMA',
        provinciaId: 'LIMA-LIMA',
        distritoId: 'LIMA-LIMA-SANISIDRO'
      }
    ];

    for (const entidad of entidadesEjemplo) {
      try {
        const created = await prisma.client.create({
          data: entidad
        });
        
        const nombre = created.razonSocial || `${created.nombres} ${created.apellidos}`;
        console.log(`✅ [${created.tipoEntidad}] ${nombre}`);
        console.log(`   ${created.tipoDocumento}: ${created.numeroDocumento}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Ya existe: ${entidad.numeroDocumento}`);
        } else {
          console.error(`❌ Error creando ${entidad.numeroDocumento}:`, error.message);
        }
      }
    }

    console.log('\n📊 Resumen final:');
    const total = await prisma.client.count();
    const clientes = await prisma.client.count({ where: { tipoEntidad: 'Cliente' } });
    const proveedores = await prisma.client.count({ where: { tipoEntidad: 'Proveedor' } });
    const ambos = await prisma.client.count({ where: { tipoEntidad: 'Ambos' } });
    
    console.log(`Total: ${total} entidades`);
    console.log(`  👤 Clientes: ${clientes}`);
    console.log(`  🏢 Proveedores: ${proveedores}`);
    console.log(`  🔄 Ambos: ${ambos}`);

  } catch (error) {
    console.error('❌ Error general:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

poblarEntidades();
