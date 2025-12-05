/**
 * SCRIPT: Crear datos de prueba para módulo de compras
 * Crea: Proveedores, Almacenes y Productos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    console.log('🚀 Iniciando creación de datos de prueba...\n');

    // ====================
    // 1. CREAR PROVEEDORES
    // ====================
    console.log('📦 Creando proveedores...');
    
    const proveedor1 = await prisma.client.upsert({
      where: { numeroDocumento: '20100070970' },
      update: {},
      create: {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20100070970',
        razonSocial: 'Distribuidora El Sol S.A.C.',
        email: 'ventas@elsol.com.pe',
        telefono: '016234567',
        direccion: 'Av. Industrial 456, Lima',
        departamentoId: 'DEP-15', // Lima
        provinciaId: 'PRO-1501', // Lima
        distritoId: 'DIS-150101', // Lima
        isActive: true,
      },
    });

    const proveedor2 = await prisma.client.upsert({
      where: { numeroDocumento: '20100055555' },
      update: {},
      create: {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20100055555',
        razonSocial: 'Importaciones Globales E.I.R.L.',
        email: 'contacto@globales.com',
        telefono: '014567890',
        direccion: 'Jr. Comercio 789, Callao',
        departamentoId: 'DEP-07', // Callao
        provinciaId: 'PRO-0701', // Callao
        distritoId: 'DIS-070101', // Callao
        isActive: true,
      },
    });

    const proveedor3 = await prisma.client.upsert({
      where: { numeroDocumento: '20100099999' },
      update: {},
      create: {
        tipoEntidad: 'Proveedor',
        tipoDocumento: 'RUC',
        numeroDocumento: '20100099999',
        razonSocial: 'Suministros Industriales SAC',
        email: 'ventas@suministros.pe',
        telefono: '017778888',
        direccion: 'Av. Argentina 321, Lima',
        departamentoId: 'DEP-15', // Lima
        provinciaId: 'PRO-1501', // Lima
        distritoId: 'DIS-150101', // Lima
        isActive: true,
      },
    });

    console.log(`✅ Proveedores creados: ${proveedor1.razonSocial}, ${proveedor2.razonSocial}, ${proveedor3.razonSocial}`);

    // ====================
    // 2. CREAR ALMACENES
    // ====================
    console.log('\n🏭 Creando almacenes...');

    const almacen1 = await prisma.warehouse.upsert({
      where: { codigo: 'ALM-001' },
      update: {},
      create: {
        codigo: 'ALM-001',
        nombre: 'Almacén Principal',
        ubicacion: 'Av. Los Alamos 123, Lima',
        capacidad: 1000,
        activo: true,
      },
    });

    const almacen2 = await prisma.warehouse.upsert({
      where: { codigo: 'ALM-002' },
      update: {},
      create: {
        codigo: 'ALM-002',
        nombre: 'Almacén Secundario',
        ubicacion: 'Jr. Industrial 456, Callao',
        capacidad: 500,
        activo: true,
      },
    });

    const almacen3 = await prisma.warehouse.upsert({
      where: { codigo: 'ALM-003' },
      update: {},
      create: {
        codigo: 'ALM-003',
        nombre: 'Almacén Tránsito',
        ubicacion: 'Av. Venezuela 789, Lima',
        capacidad: 200,
        activo: true,
      },
    });

    console.log(`✅ Almacenes creados: ${almacen1.nombre}, ${almacen2.nombre}, ${almacen3.nombre}`);

    // ====================
    // 3. CREAR CATEGORÍAS
    // ====================
    console.log('\n📁 Creando categorías...');

    const categoria1 = await prisma.productCategory.upsert({
      where: { codigo: 'CAT-001' },
      update: {},
      create: {
        codigo: 'CAT-001',
        nombre: 'Electrónica',
        descripcion: 'Productos electrónicos y tecnológicos',
        activo: true,
      },
    });

    const categoria2 = await prisma.productCategory.upsert({
      where: { codigo: 'CAT-002' },
      update: {},
      create: {
        codigo: 'CAT-002',
        nombre: 'Oficina',
        descripcion: 'Artículos de oficina y papelería',
        activo: true,
      },
    });

    const categoria3 = await prisma.productCategory.upsert({
      where: { codigo: 'CAT-003' },
      update: {},
      create: {
        codigo: 'CAT-003',
        nombre: 'Herramientas',
        descripcion: 'Herramientas y equipos industriales',
        activo: true,
      },
    });

    console.log(`✅ Categorías creadas: ${categoria1.nombre}, ${categoria2.nombre}, ${categoria3.nombre}`);

    // ====================
    // 4. CREAR PRODUCTOS
    // ====================
    console.log('\n📦 Creando productos...');

    const producto1 = await prisma.product.upsert({
      where: { codigo: 'PROD-001' },
      update: {},
      create: {
        codigo: 'PROD-001',
        nombre: 'Laptop HP Pavilion 15',
        descripcion: 'Laptop empresarial con Intel Core i5, 8GB RAM, 512GB SSD',
        categoriaId: categoria1.id,
        precioVenta: 3200.00,
        stock: 0,
        minStock: 5,
        estado: true,
      },
    });

    const producto2 = await prisma.product.upsert({
      where: { codigo: 'PROD-002' },
      update: {},
      create: {
        codigo: 'PROD-002',
        nombre: 'Mouse Inalámbrico Logitech M170',
        descripcion: 'Mouse inalámbrico con tecnología 2.4GHz',
        categoriaId: categoria1.id,
        precioVenta: 39.90,
        stock: 0,
        minStock: 20,
        estado: true,
      },
    });

    const producto3 = await prisma.product.upsert({
      where: { codigo: 'PROD-003' },
      update: {},
      create: {
        codigo: 'PROD-003',
        nombre: 'Papel Bond A4 75g',
        descripcion: 'Papel bond tamaño A4, 75 gramos, paquete x 500 hojas',
        categoriaId: categoria2.id,
        precioVenta: 18.50,
        stock: 0,
        minStock: 50,
        estado: true,
      },
    });

    const producto4 = await prisma.product.upsert({
      where: { codigo: 'PROD-004' },
      update: {},
      create: {
        codigo: 'PROD-004',
        nombre: 'Lapicero Pilot BPS-GP',
        descripcion: 'Lapicero tinta líquida, punta fina 0.5mm',
        categoriaId: categoria2.id,
        precioVenta: 2.50,
        stock: 0,
        minStock: 100,
        estado: true,
      },
    });

    const producto5 = await prisma.product.upsert({
      where: { codigo: 'PROD-005' },
      update: {},
      create: {
        codigo: 'PROD-005',
        nombre: 'Taladro Bosch 600W',
        descripcion: 'Taladro percutor 600W con maletín y accesorios',
        categoriaId: categoria3.id,
        precioVenta: 350.00,
        stock: 0,
        minStock: 10,
        estado: true,
      },
    });

    console.log(`✅ Productos creados: ${producto1.nombre}, ${producto2.nombre}, ${producto3.nombre}, ${producto4.nombre}, ${producto5.nombre}`);

    // ====================
    // RESUMEN
    // ====================
    console.log('\n' + '='.repeat(60));
    console.log('✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE');
    console.log('='.repeat(60));
    console.log(`📦 Proveedores: 3`);
    console.log(`🏭 Almacenes: 3`);
    console.log(`📁 Categorías: 3`);
    console.log(`📦 Productos: 5`);
    console.log('\n💡 Ahora puedes crear órdenes de compra con estos datos.');

  } catch (error) {
    console.error('\n❌ Error creando datos de prueba:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
createTestData()
  .then(() => {
    console.log('\n✅ Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
