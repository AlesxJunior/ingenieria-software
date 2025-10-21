import { PrismaClient, TipoEntidad } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Definir permisos para cada tipo de usuario
const ADMIN_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Usuarios
  'users.create', 'users.read', 'users.update', 'users.delete',
  // Entidades Comerciales
  'commercial_entities.create', 'commercial_entities.read', 'commercial_entities.update',
  // Ventas
  'sales.create', 'sales.read', 'sales.update', 'sales.delete',
  // Productos
  'products.create', 'products.read', 'products.update', 'products.delete',
  // Inventario
  'inventory.read', 'inventory.update',
  // Compras
  'purchases.create', 'purchases.read', 'purchases.update', 'purchases.delete',
  // Facturación
  'invoicing.create', 'invoicing.read', 'invoicing.update', 'invoicing.delete',
  // Configuración
  'configuration.read', 'configuration.update',
  // Reportes
  'reports.sales', 'reports.users', 'reports.inventory', 'reports.financial'
];

const SUPERVISOR_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Usuarios (solo lectura)
  'users.read',
  // Entidades Comerciales
  'commercial_entities.create', 'commercial_entities.read', 'commercial_entities.update',
  // Ventas
  'sales.create', 'sales.read', 'sales.update',
  // Productos
  'products.create', 'products.read', 'products.update',
  // Inventario
  'inventory.read', 'inventory.update',
  // Compras
  'purchases.create', 'purchases.read', 'purchases.update',
  // Facturación
  'invoicing.create', 'invoicing.read', 'invoicing.update',
  // Configuración (solo lectura)
  'configuration.read',
  // Reportes
  'reports.sales', 'reports.inventory', 'reports.financial'
];

const VENDEDOR_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Entidades Comerciales
  'commercial_entities.create', 'commercial_entities.read', 'commercial_entities.update',
  // Ventas
  'sales.create', 'sales.read',
  // Productos (solo lectura)
  'products.read',
  // Inventario (solo lectura)
  'inventory.read',
  // Facturación
  'invoicing.create', 'invoicing.read',
  // Reportes básicos
  'reports.sales'
];

const CAJERO_PERMISSIONS = [
  // Dashboard
  'dashboard.read',
  // Usuarios (solo lectura)
  'users.read',
  // Entidades Comerciales (solo lectura)
  'commercial_entities.read',
  // Ventas
  'sales.create', 'sales.read',
  // Productos (solo lectura)
  'products.read',
  // Inventario (solo lectura)
  'inventory.read',
  // Facturación
  'invoicing.create', 'invoicing.read'
];

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes (orden seguro por relaciones)
  await prisma.client.deleteMany();
  await prisma.distrito.deleteMany();
  await prisma.provincia.deleteMany();
  await prisma.departamento.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Datos existentes eliminados');

  // Hashear contraseñas
  const hashedAdminPassword = await bcrypt.hash('admin123', 12);
  const hashedVendedorPassword = await bcrypt.hash('vendedor123', 12);
  const hashedCajeroPassword = await bcrypt.hash('cajero123', 12);
  const hashedSupervisorPassword = await bcrypt.hash('supervisor123', 12);

  console.log('👤 Creando usuarios...');
  
  // Crear usuarios iniciales
  const admin = await prisma.user.create({
    data: {
      email: 'admin@alexatech.com',
      username: 'admin',
      password: hashedAdminPassword,
      firstName: 'Admin',
      lastName: 'User',
      permissions: ADMIN_PERMISSIONS,
      isActive: true,
    },
  });

  const vendedor = await prisma.user.create({
    data: {
      email: 'vendedor@alexatech.com',
      username: 'vendedor',
      password: hashedVendedorPassword,
      firstName: 'Juan',
      lastName: 'Vendedor',
      permissions: VENDEDOR_PERMISSIONS,
      isActive: true,
    },
  });

  const cajero = await prisma.user.create({
    data: {
      email: 'cajero@alexatech.com',
      username: 'cajero',
      password: hashedCajeroPassword,
      firstName: 'María',
      lastName: 'Cajero',
      permissions: CAJERO_PERMISSIONS,
      isActive: true,
    },
  });

  const supervisor = await prisma.user.create({
    data: {
      email: 'supervisor@alexatech.com',
      username: 'supervisor',
      password: hashedSupervisorPassword,
      firstName: 'Carlos',
      lastName: 'Supervisor',
      permissions: SUPERVISOR_PERMISSIONS,
      isActive: true,
    },
  });

  console.log('👤 Usuarios creados:');
  console.log(`   Admin: ${admin.email} (${admin.permissions.length} permisos)`);
  console.log(`   Vendedor: ${vendedor.email} (${vendedor.permissions.length} permisos)`);
  console.log(`   Cajero: ${cajero.email} (${cajero.permissions.length} permisos)`);
  console.log(`   Supervisor: ${supervisor.email} (${supervisor.permissions.length} permisos)`);

  // =====================
  // Ubigeo Perú (simplificado)
  // =====================
  console.log('🗺️  Creando ubigeo (Departamentos, Provincias, Distritos)...');

  const departamentos = [
    { id: 'DEP-LIM', nombre: 'Lima' },
    { id: 'DEP-ARE', nombre: 'Arequipa' },
    { id: 'DEP-LLI', nombre: 'La Libertad' },
    { id: 'DEP-CUS', nombre: 'Cusco' },
    { id: 'DEP-PIU', nombre: 'Piura' },
    { id: 'DEP-LAM', nombre: 'Lambayeque' },
    { id: 'DEP-LOR', nombre: 'Loreto' },
    { id: 'DEP-ANC', nombre: 'Ancash' },
    { id: 'DEP-TAC', nombre: 'Tacna' }
  ];

  await prisma.departamento.createMany({ data: departamentos });

  const provincias = [
    { id: 'PRO-LIM-LIMA', nombre: 'Lima', departamentoId: 'DEP-LIM' },
    { id: 'PRO-ARE-AREQUIPA', nombre: 'Arequipa', departamentoId: 'DEP-ARE' },
    { id: 'PRO-LLI-TRUJILLO', nombre: 'Trujillo', departamentoId: 'DEP-LLI' },
    { id: 'PRO-CUS-CUSCO', nombre: 'Cusco', departamentoId: 'DEP-CUS' },
    { id: 'PRO-PIU-PIURA', nombre: 'Piura', departamentoId: 'DEP-PIU' },
    { id: 'PRO-LAM-CHICLAYO', nombre: 'Chiclayo', departamentoId: 'DEP-LAM' },
    { id: 'PRO-LOR-MAYNAS', nombre: 'Maynas', departamentoId: 'DEP-LOR' },
    { id: 'PRO-ANC-HUARAZ', nombre: 'Huaraz', departamentoId: 'DEP-ANC' },
    { id: 'PRO-TAC-TACNA', nombre: 'Tacna', departamentoId: 'DEP-TAC' }
  ];

  await prisma.provincia.createMany({ data: provincias });

  const distritos = [
    // Lima
    { id: 'DIS-LIM-MIRAFLORES', nombre: 'Miraflores', provinciaId: 'PRO-LIM-LIMA' },
    { id: 'DIS-LIM-SANISIDRO', nombre: 'San Isidro', provinciaId: 'PRO-LIM-LIMA' },
    { id: 'DIS-LIM-SURCO', nombre: 'Santiago de Surco', provinciaId: 'PRO-LIM-LIMA' },
    // Arequipa
    { id: 'DIS-ARE-YANAHUARA', nombre: 'Yanahuara', provinciaId: 'PRO-ARE-AREQUIPA' },
    { id: 'DIS-ARE-CAYMA', nombre: 'Cayma', provinciaId: 'PRO-ARE-AREQUIPA' },
    // Trujillo
    { id: 'DIS-LLI-TRUJILLO', nombre: 'Trujillo', provinciaId: 'PRO-LLI-TRUJILLO' },
    { id: 'DIS-LLI-HUANCHACO', nombre: 'Huanchaco', provinciaId: 'PRO-LLI-TRUJILLO' },
    // Cusco
    { id: 'DIS-CUS-SANSEBASTIAN', nombre: 'San Sebastián', provinciaId: 'PRO-CUS-CUSCO' },
    { id: 'DIS-CUS-SANTIAGO', nombre: 'Santiago', provinciaId: 'PRO-CUS-CUSCO' },
    // Piura
    { id: 'DIS-PIU-CASTILLA', nombre: 'Castilla', provinciaId: 'PRO-PIU-PIURA' },
    { id: 'DIS-PIU-CATACAOS', nombre: 'Catacaos', provinciaId: 'PRO-PIU-PIURA' },
    // Lambayeque
    { id: 'DIS-LAM-CHICLAYO', nombre: 'Chiclayo', provinciaId: 'PRO-LAM-CHICLAYO' },
    { id: 'DIS-LAM-LAVICTORIA', nombre: 'La Victoria', provinciaId: 'PRO-LAM-CHICLAYO' },
    // Loreto
    { id: 'DIS-LOR-IQUITOS', nombre: 'Iquitos', provinciaId: 'PRO-LOR-MAYNAS' },
    { id: 'DIS-LOR-PUNCHANA', nombre: 'Punchana', provinciaId: 'PRO-LOR-MAYNAS' },
    // Ancash
    { id: 'DIS-ANC-HUARAZ', nombre: 'Huaraz', provinciaId: 'PRO-ANC-HUARAZ' },
    { id: 'DIS-ANC-INDEPENDENCIA', nombre: 'Independencia', provinciaId: 'PRO-ANC-HUARAZ' },
    // Tacna
    { id: 'DIS-TAC-TACNA', nombre: 'Tacna', provinciaId: 'PRO-TAC-TACNA' },
    { id: 'DIS-TAC-ALTOALIANZA', nombre: 'Alto de la Alianza', provinciaId: 'PRO-TAC-TACNA' }
  ];

  await prisma.distrito.createMany({ data: distritos });
  console.log(`   Departamentos: ${departamentos.length}, Provincias: ${provincias.length}, Distritos: ${distritos.length}`);

  // Crear productos de prueba
  console.log('📦 Creando productos de prueba...');
  const products = await prisma.product.createMany({
    data: [
      { codigo: 'LP-001', nombre: 'Laptop Pro', descripcion: 'Potente laptop para profesionales', categoria: 'Laptops', precioVenta: 1499.99, stock: 50, unidadMedida: 'Unidad', ubicacion: 'Almacén A', usuarioCreacion: admin.id },
      { codigo: 'SM-002', nombre: 'Smartphone X', descripcion: 'Teléfono inteligente de última generación', categoria: 'Smartphones', precioVenta: 899.99, stock: 120, unidadMedida: 'Unidad', ubicacion: 'Almacén B', usuarioCreacion: admin.id },
      { codigo: 'MN-003', nombre: 'Monitor UltraWide', descripcion: 'Monitor curvo de 34 pulgadas', categoria: 'Monitores', precioVenta: 599.99, stock: 80, unidadMedida: 'Unidad', ubicacion: 'Almacén A', usuarioCreacion: admin.id },
      { codigo: 'KB-004', nombre: 'Teclado Mecánico RGB', descripcion: 'Teclado para gaming con iluminación personalizable', categoria: 'Periféricos', precioVenta: 129.99, stock: 200, unidadMedida: 'Unidad', ubicacion: 'Almacén C', usuarioCreacion: admin.id },
      { codigo: 'MS-005', nombre: 'Mouse Inalámbrico Ergonómico', descripcion: 'Mouse diseñado para máxima comodidad', categoria: 'Periféricos', precioVenta: 49.99, stock: 300, unidadMedida: 'Unidad', ubicacion: 'Almacén C', usuarioCreacion: admin.id },
      { codigo: 'WC-006', nombre: 'Webcam HD 1080p', descripcion: 'Webcam con resolución Full HD para videollamadas', categoria: 'Accesorios', precioVenta: 69.99, stock: 150, unidadMedida: 'Unidad', ubicacion: 'Almacén B', usuarioCreacion: admin.id },
      { codigo: 'HD-007', nombre: 'Disco Duro Externo 2TB', descripcion: 'Almacenamiento portátil de alta capacidad', categoria: 'Almacenamiento', precioVenta: 89.99, stock: 100, unidadMedida: 'Unidad', ubicacion: 'Almacén A', usuarioCreacion: admin.id },
      { codigo: 'LS-008', nombre: 'Soporte para Laptop', descripcion: 'Soporte ergonómico de aluminio para laptops', categoria: 'Accesorios', precioVenta: 39.99, stock: 250, unidadMedida: 'Unidad', ubicacion: 'Almacén C', usuarioCreacion: admin.id },
      { codigo: 'HB-009', nombre: 'Hub USB-C 7 en 1', descripcion: 'Concentrador con múltiples puertos para conectividad', categoria: 'Accesorios', precioVenta: 59.99, stock: 180, unidadMedida: 'Unidad', ubicacion: 'Almacén B', usuarioCreacion: admin.id },
      { codigo: 'EA-010', nombre: 'Auriculares Inalámbricos TWS', descripcion: 'Auriculares con cancelación de ruido y alta fidelidad', categoria: 'Audio', precioVenta: 199.99, stock: 90, unidadMedida: 'Unidad', ubicacion: 'Almacén A', usuarioCreacion: admin.id },
    ],
  });
  console.log(`   ${products.count} productos creados.`);

  // Crear entidades comerciales de prueba (usando ubigeo)
  console.log('🏢 Creando entidades comerciales de prueba...');
  const entities = await prisma.client.createMany({
    data: [
      {
        razonSocial: 'Tech Solutions S.A.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20558963214',
        email: 'contacto@techsolutions.com',
        telefono: '987654321',
        direccion: 'Av. Principal 123',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-LIM',
        provinciaId: 'PRO-LIM-LIMA',
        distritoId: 'DIS-LIM-MIRAFLORES',
      },
      {
        razonSocial: 'Innovate Corp',
        tipoDocumento: 'RUC',
        numeroDocumento: '20601234567',
        email: 'ventas@innovate.com',
        telefono: '912345678',
        direccion: 'Calle Secundaria 456',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-ARE',
        provinciaId: 'PRO-ARE-AREQUIPA',
        distritoId: 'DIS-ARE-YANAHUARA',
      },
      {
        razonSocial: 'Global Supplies S.R.L.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20405060708',
        email: 'info@globalsupplies.com',
        telefono: '998877665',
        direccion: 'Jr. Independencia 789',
        tipoEntidad: TipoEntidad.Proveedor,
        usuarioCreacion: supervisor.id,
        departamentoId: 'DEP-LLI',
        provinciaId: 'PRO-LLI-TRUJILLO',
        distritoId: 'DIS-LLI-HUANCHACO',
      },
      {
        nombres: 'Juan',
        apellidos: 'Perez',
        tipoDocumento: 'DNI',
        numeroDocumento: '45678912',
        email: 'juan.perez@email.com',
        telefono: '955443322',
        direccion: 'Av. El Sol 101',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-CUS',
        provinciaId: 'PRO-CUS-CUSCO',
        distritoId: 'DIS-CUS-SANSEBASTIAN',
      },
      {
        razonSocial: 'Distribuidora del Norte S.A.C.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20789456123',
        email: 'logistica@disnorte.com',
        telefono: '933221100',
        direccion: 'Carretera Panamericana Norte Km 800',
        tipoEntidad: TipoEntidad.Proveedor,
        usuarioCreacion: supervisor.id,
        departamentoId: 'DEP-PIU',
        provinciaId: 'PRO-PIU-PIURA',
        distritoId: 'DIS-PIU-CASTILLA',
      },
      {
        nombres: 'Ana',
        apellidos: 'Gomez',
        tipoDocumento: 'DNI',
        numeroDocumento: '78945612',
        email: 'ana.gomez@email.com',
        telefono: '911223344',
        direccion: 'Calle Las Flores 202',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-LIM',
        provinciaId: 'PRO-LIM-LIMA',
        distritoId: 'DIS-LIM-SURCO',
      },
      {
        razonSocial: 'Comercial del Sur S.A.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20123456789',
        email: 'comercial.sur@email.com',
        telefono: '988776655',
        direccion: 'Av. La Marina 303',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-LAM',
        provinciaId: 'PRO-LAM-CHICLAYO',
        distritoId: 'DIS-LAM-CHICLAYO',
      },
      {
        razonSocial: 'Importaciones Rápidas E.I.R.L.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20987654321',
        email: 'compras@imporapid.com',
        telefono: '977665544',
        direccion: 'Jr. Los Pinos 404',
        tipoEntidad: TipoEntidad.Proveedor,
        usuarioCreacion: supervisor.id,
        departamentoId: 'DEP-LOR',
        provinciaId: 'PRO-LOR-MAYNAS',
        distritoId: 'DIS-LOR-IQUITOS',
      },
      {
        nombres: 'Carlos',
        apellidos: 'Rodriguez',
        tipoDocumento: 'DNI',
        numeroDocumento: '12345678',
        email: 'carlos.r@email.com',
        telefono: '966554433',
        direccion: 'Plaza de Armas 10',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-ANC',
        provinciaId: 'PRO-ANC-HUARAZ',
        distritoId: 'DIS-ANC-HUARAZ',
      },
      {
        razonSocial: 'Tecno-Integra S.A.C.',
        tipoDocumento: 'RUC',
        numeroDocumento: '20548796321',
        email: 'proyectos@tecno-integra.com',
        telefono: '955443322',
        direccion: 'Parque Industrial Mz. A Lote 5',
        tipoEntidad: TipoEntidad.Cliente,
        usuarioCreacion: vendedor.id,
        departamentoId: 'DEP-TAC',
        provinciaId: 'PRO-TAC-TACNA',
        distritoId: 'DIS-TAC-TACNA',
      },
    ],
  });
  console.log(`   ${entities.count} entidades comerciales creadas.`);

  console.log('✅ Seed completado exitosamente - Sistema basado en permisos + Ubigeo Perú');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });