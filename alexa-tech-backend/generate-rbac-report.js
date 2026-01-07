/**
 * Generador de Reporte Detallado de Base de Datos - Sistema RBAC
 * Genera un reporte JSON completo del estado de la base de datos
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function generateDetailedReport() {
  console.log('\n📄 Generando reporte detallado de la base de datos...\n');

  const report = {
    generatedAt: new Date().toISOString(),
    database: 'PostgreSQL',
    rbacVersion: '1.0',
    summary: {
      totalUsers: 0,
      totalRoles: 0,
      totalPermissions: 0,
      usersWithoutRole: 0,
      orphanUsers: 0
    },
    schema: {
      usersTable: [],
      rolesTable: []
    },
    data: {
      users: [],
      roles: []
    },
    integrity: {
      foreignKeys: [],
      constraints: []
    },
    validation: {
      passed: [],
      failed: [],
      warnings: []
    }
  };

  try {
    // Esquema de tabla users
    const usersTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position;
    `;
    report.schema.usersTable = usersTableInfo;

    // Esquema de tabla roles
    const rolesTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'roles'
      ORDER BY ordinal_position;
    `;
    report.schema.rolesTable = rolesTableInfo;

    // Datos de usuarios
    const users = await prisma.user.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
            isSystem: true,
            isActive: true
          }
        }
      }
    });
    
    report.summary.totalUsers = users.length;
    report.data.users = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roleId: user.roleId,
      role: user.role ? {
        id: user.role.id,
        name: user.role.name,
        permissionsCount: user.role.permissions?.length || 0,
        permissions: user.role.permissions || [],
        isSystem: user.role.isSystem,
        isActive: user.role.isActive
      } : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastAccess: user.lastAccess
    }));

    // Datos de roles
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      }
    });
    
    report.summary.totalRoles = roles.length;
    
    const allPermissions = new Set();
    roles.forEach(role => {
      role.permissions?.forEach(p => allPermissions.add(p));
    });
    report.summary.totalPermissions = allPermissions.size;

    report.data.roles = roles.map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions || [],
      permissionsCount: role.permissions?.length || 0,
      isActive: role.isActive,
      isSystem: role.isSystem,
      usersCount: role._count.users,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }));

    // Foreign Keys
    const fkInfo = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule,
        rc.update_rule
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      JOIN information_schema.referential_constraints AS rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND tc.table_name = 'users'
        AND kcu.column_name = 'roleId';
    `;
    report.integrity.foreignKeys = fkInfo;

    // Validaciones
    const hasPermissionsColumn = usersTableInfo.some(col => col.column_name === 'permissions');
    if (hasPermissionsColumn) {
      report.validation.failed.push('La columna "permissions" existe en tabla "users"');
    } else {
      report.validation.passed.push('La columna "permissions" fue eliminada de tabla "users"');
    }

    const roleIdColumn = usersTableInfo.find(col => col.column_name === 'roleId');
    if (!roleIdColumn) {
      report.validation.failed.push('La columna "roleId" no existe en tabla "users"');
    } else if (roleIdColumn.is_nullable === 'YES') {
      report.validation.failed.push('La columna "roleId" permite NULL');
    } else {
      report.validation.passed.push('La columna "roleId" es NOT NULL (correcto)');
    }

    const usersWithoutRole = await prisma.$queryRaw`
      SELECT COUNT(*) as count
      FROM "public"."users"
      WHERE "roleId" IS NULL OR "roleId" = '';
    `;
    const invalidCount = parseInt(usersWithoutRole[0]?.count || 0);
    report.summary.usersWithoutRole = invalidCount;

    if (invalidCount > 0) {
      report.validation.failed.push(`${invalidCount} usuario(s) sin roleId válido`);
    } else {
      report.validation.passed.push('Todos los usuarios tienen roleId asignado');
    }

    // Integridad referencial
    const orphanUsers = await prisma.$queryRaw`
      SELECT u.id, u.username, u.email, u."roleId"
      FROM "public"."users" u
      LEFT JOIN "public"."roles" r ON u."roleId" = r.id
      WHERE r.id IS NULL;
    `;
    report.summary.orphanUsers = orphanUsers.length;

    if (orphanUsers.length > 0) {
      report.validation.failed.push(`${orphanUsers.length} usuario(s) con roleId inválido`);
      report.data.orphanUsers = orphanUsers;
    } else {
      report.validation.passed.push('Todos los usuarios tienen roleId válido');
    }

    // Verificar FK
    if (fkInfo.length > 0 && fkInfo[0].delete_rule === 'RESTRICT') {
      report.validation.passed.push('Foreign Key tiene DELETE RESTRICT (correcto)');
    } else if (fkInfo.length === 0) {
      report.validation.failed.push('No se encontró la Foreign Key users.roleId → roles.id');
    } else {
      report.validation.warnings.push(`FK tiene DELETE ${fkInfo[0].delete_rule} (se esperaba RESTRICT)`);
    }

    // Guardar reporte
    const reportPath = path.join(__dirname, 'rbac-database-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

    console.log('✅ Reporte generado exitosamente:');
    console.log(`   ${reportPath}\n`);

    // Resumen en consola
    console.log('📊 RESUMEN:');
    console.log(`   Usuarios: ${report.summary.totalUsers}`);
    console.log(`   Roles: ${report.summary.totalRoles}`);
    console.log(`   Permisos únicos: ${report.summary.totalPermissions}`);
    console.log(`   Usuarios sin rol: ${report.summary.usersWithoutRole}`);
    console.log(`   Usuarios huérfanos: ${report.summary.orphanUsers}`);
    console.log(`\n   Validaciones:`);
    console.log(`     ✅ Pasadas: ${report.validation.passed.length}`);
    console.log(`     ❌ Falladas: ${report.validation.failed.length}`);
    console.log(`     ⚠️  Advertencias: ${report.validation.warnings.length}`);

    if (report.validation.failed.length === 0) {
      console.log('\n🎉 Base de datos RBAC: 100% Validada\n');
      return true;
    } else {
      console.log('\n❌ Se encontraron problemas en la validación\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Error generando reporte:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

generateDetailedReport()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
