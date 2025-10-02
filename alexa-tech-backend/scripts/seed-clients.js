const { PrismaClient } = require('../src/generated/prisma');

const prisma = new PrismaClient();

async function seedClients() {
  console.log('🌱 Creando clientes de prueba...');

  try {
    // Limpiar clientes existentes
    await prisma.client.deleteMany();
    console.log('🗑️  Clientes existentes eliminados');
    // Clientes de prueba con diferentes tipos de documento, ciudades y fechas
    const clientsData = [
      {
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        nombres: 'Juan Carlos',
        apellidos: 'Pérez García',
        email: 'juan.perez@email.com',
        telefono: '987654321',
        direccion: 'Av. Principal 123',
        ciudad: 'Lima',
        isActive: true,
        createdAt: new Date('2024-01-15')
      },
      {
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        razonSocial: 'Empresa ABC S.A.C.',
        email: 'contacto@empresaabc.com',
        telefono: '987654322',
        direccion: 'Jr. Comercio 456',
        ciudad: 'Arequipa',
        isActive: true,
        createdAt: new Date('2024-02-10')
      },
      {
        tipoDocumento: 'CE',
        numeroDocumento: '001234567',
        nombres: 'María Elena',
        apellidos: 'González López',
        email: 'maria.gonzalez@email.com',
        telefono: '987654323',
        direccion: 'Calle Los Olivos 789',
        ciudad: 'Cusco',
        isActive: true,
        createdAt: new Date('2024-03-05')
      },
      {
        tipoDocumento: 'DNI',
        numeroDocumento: '87654321',
        nombres: 'Carlos Alberto',
        apellidos: 'Rodríguez Silva',
        email: 'carlos.rodriguez@email.com',
        telefono: '987654324',
        direccion: 'Av. Los Pinos 321',
        ciudad: 'Lima',
        isActive: true,
        createdAt: new Date('2024-01-20')
      },
      {
        tipoDocumento: 'RUC',
        numeroDocumento: '20987654321',
        razonSocial: 'Comercial XYZ E.I.R.L.',
        email: 'ventas@comercialxyz.com',
        telefono: '987654325',
        direccion: 'Av. Industrial 654',
        ciudad: 'Trujillo',
        isActive: true,
        createdAt: new Date('2024-02-28')
      },
      {
        tipoDocumento: 'DNI',
        numeroDocumento: '11223344',
        nombres: 'Ana Sofía',
        apellidos: 'Martínez Vega',
        email: 'ana.martinez@email.com',
        telefono: '987654326',
        direccion: 'Jr. Las Flores 147',
        ciudad: 'Piura',
        isActive: true,
        createdAt: new Date('2024-03-15')
      },
      {
        tipoDocumento: 'CE',
        numeroDocumento: '009876543',
        nombres: 'Roberto',
        apellidos: 'Johnson Smith',
        email: 'roberto.johnson@email.com',
        telefono: '987654327',
        direccion: 'Av. Internacional 258',
        ciudad: 'Lima',
        isActive: true,
        createdAt: new Date('2024-01-30')
      },
      {
        tipoDocumento: 'DNI',
        numeroDocumento: '55667788',
        nombres: 'Lucía Isabel',
        apellidos: 'Torres Mendoza',
        email: 'lucia.torres@email.com',
        telefono: '987654328',
        direccion: 'Calle San Martín 369',
        ciudad: 'Arequipa',
        isActive: true,
        createdAt: new Date('2024-04-01')
      }
    ];

    // Crear clientes
    for (const clientData of clientsData) {
      await prisma.client.create({
        data: clientData
      });
    }

    console.log(`✅ Se crearon ${clientsData.length} clientes de prueba exitosamente`);
    console.log('📊 Distribución:');
    console.log('   - DNI: 4 clientes');
    console.log('   - RUC: 2 clientes');
    console.log('   - CE: 2 clientes');
    console.log('   - Ciudades: Lima (3), Arequipa (2), Cusco (1), Trujillo (1), Piura (1)');
    console.log('   - Fechas: Enero-Abril 2024');

  } catch (error) {
    console.error('❌ Error al crear clientes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedClients();