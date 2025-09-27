import { PrismaClient, UserRole, Permission } from '../src/generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Limpiar datos existentes
  await prisma.userPermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  console.log('🗑️  Datos existentes eliminados');

  // Crear permisos predefinidos
  console.log('🔐 Creando permisos...');
  const permissions = [
    // Dashboard
    { module: 'dashboard', submodule: 'pantalla_principal', name: 'Pantalla Principal', description: 'Acceso al panel principal del dashboard' },
    
    // Usuarios
    { module: 'usuarios', submodule: 'lista_usuarios', name: 'Lista de Usuarios', description: 'Ver y gestionar la lista de usuarios del sistema' },
    { module: 'usuarios', submodule: 'auditoria_logs', name: 'Auditoría y Logs', description: 'Ver registros de actividad y auditoría de usuarios' },
    
    // Clientes
    { module: 'clientes', submodule: 'lista_clientes', name: 'Lista de Clientes', description: 'Ver y gestionar la lista de clientes' },
    
    // Ventas (sin submódulos específicos por el momento)
    
    // Productos (sin submódulos específicos por el momento)
    
    // Inventario (sin submódulos específicos por el momento)
    
    // Compras (sin submódulos específicos por el momento)
    
    // Facturación (sin submódulos específicos por el momento)
    
    // Configuración (sin submódulos específicos por el momento)
    
    // Reportes (sin submódulos específicos por el momento)
  ];

  const createdPermissions: Permission[] = [];
  for (const permission of permissions) {
    const created = await prisma.permission.create({
      data: permission,
    });
    createdPermissions.push(created);
  }
  console.log(`✅ ${createdPermissions.length} permisos creados`);

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
      role: UserRole.ADMIN,
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
      role: UserRole.VENDEDOR,
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
      role: UserRole.CAJERO,
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
      role: UserRole.SUPERVISOR,
      isActive: true,
    },
  });

  console.log('👤 Usuarios creados:');
  console.log(`   Admin: ${admin.email} (${admin.role})`);
  console.log(`   Vendedor: ${vendedor.email} (${vendedor.role})`);
  console.log(`   Cajero: ${cajero.email} (${cajero.role})`);
  console.log(`   Supervisor: ${supervisor.email} (${supervisor.role})`);

  // Asignar permisos según el rol
  console.log('🔗 Asignando permisos...');
  
  // Admin tiene todos los permisos
  for (const permission of createdPermissions) {
    await prisma.userPermission.create({
      data: {
        userId: admin.id,
        permissionId: permission.id,
      },
    });
  }

  // Vendedor: dashboard, clientes, ventas, productos
  const vendedorModules = ['dashboard', 'clientes', 'ventas', 'productos'];
  const vendedorPermissions = createdPermissions.filter(p => 
    vendedorModules.includes(p.module)
  );
  for (const permission of vendedorPermissions) {
    await prisma.userPermission.create({
      data: {
        userId: vendedor.id,
        permissionId: permission.id,
      },
    });
  }

  // Cajero: dashboard, ventas, caja
  const cajeroModules = ['dashboard', 'ventas', 'caja'];
  const cajeroPermissions = createdPermissions.filter(p => 
    cajeroModules.includes(p.module)
  );
  for (const permission of cajeroPermissions) {
    await prisma.userPermission.create({
      data: {
        userId: cajero.id,
        permissionId: permission.id,
      },
    });
  }

  // Supervisor: dashboard, clientes, ventas, productos, inventario, reportes
  const supervisorModules = ['dashboard', 'clientes', 'ventas', 'productos', 'inventario', 'reportes'];
  const supervisorPermissions = createdPermissions.filter(p => 
    supervisorModules.includes(p.module)
  );
  for (const permission of supervisorPermissions) {
    await prisma.userPermission.create({
      data: {
        userId: supervisor.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Permisos asignados correctamente');
  console.log('✅ Seed completado exitosamente');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });