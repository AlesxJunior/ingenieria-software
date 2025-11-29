/**
 * Script de Verificación de Base de Datos - Sistema RBAC
 * Verifica que no queden datos residuales del sistema antiguo de permisos
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyDatabase() {
  console.log('\n🔍 ============================================');
  console.log('  VERIFICACIÓN DE BASE DE DATOS - RBAC');
  console.log('============================================\n');

  const errors = [];
  const warnings = [];
  const success = [];

  try {
    // ====================================
    // 1. VERIFICAR ESQUEMA DE TABLA USERS
    // ====================================
    console.log('📊 1. Verificando esquema de tabla "users"...\n');

    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'users'
      ORDER BY ordinal_position;
    `;

    console.log('Columnas encontradas en tabla "users":');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (Nullable: ${col.is_nullable})`);
    });

    // Verificar que NO exista columna "permissions"
    const hasPermissionsColumn = tableInfo.some(col => col.column_name === 'permissions');
    if (hasPermissionsColumn) {
      errors.push('❌ ERROR: La columna "permissions" todavía existe en la tabla "users"');
    } else {
      success.push('✅ OK: La columna "permissions" fue eliminada correctamente de "users"');
    }

    // Verificar que exista columna "roleId" y sea NOT NULL
    const roleIdColumn = tableInfo.find(col => col.column_name === 'roleId');
    if (!roleIdColumn) {
      errors.push('❌ ERROR: La columna "roleId" no existe en la tabla "users"');
    } else if (roleIdColumn.is_nullable === 'YES') {
      errors.push('❌ ERROR: La columna "roleId" permite valores NULL (debería ser NOT NULL)');
    } else {
      success.push('✅ OK: La columna "roleId" existe y es NOT NULL');
    }

    console.log('');

    // ====================================
    // 2. VERIFICAR TABLA ROLES
    // ====================================
    console.log('📊 2. Verificando tabla "roles"...\n');

    const rolesTableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'roles'
      ORDER BY ordinal_position;
    `;

    console.log('Columnas encontradas en tabla "roles":');
    rolesTableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (Nullable: ${col.is_nullable})`);
    });

    // Verificar que exista columna "permissions" en roles
    const roleHasPermissions = rolesTableInfo.some(col => col.column_name === 'permissions');
    if (roleHasPermissions) {
      success.push('✅ OK: La tabla "roles" tiene la columna "permissions"');
    } else {
      errors.push('❌ ERROR: La tabla "roles" no tiene la columna "permissions"');
    }

    console.log('');

    // ====================================
    // 3. VERIFICAR DATOS DE USUARIOS
    // ====================================
    console.log('📊 3. Verificando datos de usuarios...\n');

    const totalUsers = await prisma.user.count();
    console.log(`Total de usuarios en base de datos: ${totalUsers}`);

    if (totalUsers > 0) {
      // Como roleId es NOT NULL, todos los usuarios deben tenerlo
      // Intentar encontrar usuarios sin roleId válido usando raw query
      const usersWithoutRole = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "public"."users"
        WHERE "roleId" IS NULL OR "roleId" = '';
      `;

      const invalidCount = parseInt(usersWithoutRole[0]?.count || 0);

      if (invalidCount > 0) {
        errors.push(`❌ ERROR: ${invalidCount} usuario(s) sin roleId asignado`);
      } else {
        success.push(`✅ OK: Todos los ${totalUsers} usuarios tienen roleId asignado`);
      }

      // Obtener muestra de usuarios
      const sampleUsers = await prisma.user.findMany({
        take: 3,
        include: {
          role: {
            select: {
              id: true,
              name: true,
              permissions: true
            }
          }
        }
      });

      console.log('\nMuestra de usuarios (primeros 3):');
      sampleUsers.forEach(user => {
        console.log(`\n  Usuario: ${user.username} (${user.email})`);
        console.log(`  - roleId: ${user.roleId}`);
        console.log(`  - Rol: ${user.role?.name || 'NO ASIGNADO'}`);
        console.log(`  - Permisos (desde rol): ${user.role?.permissions?.length || 0} permisos`);
        if (user.role?.permissions && user.role.permissions.length > 0) {
          console.log(`    ${user.role.permissions.slice(0, 3).join(', ')}${user.role.permissions.length > 3 ? '...' : ''}`);
        }
      });
    } else {
      warnings.push('⚠️  WARNING: No hay usuarios en la base de datos');
    }

    console.log('');

    // ====================================
    // 4. VERIFICAR DATOS DE ROLES
    // ====================================
    console.log('📊 4. Verificando datos de roles...\n');

    const totalRoles = await prisma.role.count();
    console.log(`Total de roles en base de datos: ${totalRoles}`);

    if (totalRoles > 0) {
      const roles = await prisma.role.findMany({
        include: {
          _count: {
            select: { users: true }
          }
        }
      });

      console.log('\nRoles existentes:');
      roles.forEach(role => {
        console.log(`\n  Rol: ${role.name}`);
        console.log(`  - ID: ${role.id}`);
        console.log(`  - Descripción: ${role.description || 'Sin descripción'}`);
        console.log(`  - Usuarios asignados: ${role._count.users}`);
        console.log(`  - Total permisos: ${role.permissions?.length || 0}`);
        console.log(`  - isSystem: ${role.isSystem}`);
        console.log(`  - isActive: ${role.isActive}`);
        if (role.permissions && role.permissions.length > 0) {
          console.log(`  - Permisos: ${role.permissions.slice(0, 5).join(', ')}${role.permissions.length > 5 ? '...' : ''}`);
        }
      });

      success.push(`✅ OK: Sistema tiene ${totalRoles} rol(es) configurado(s)`);
    } else {
      warnings.push('⚠️  WARNING: No hay roles en la base de datos');
    }

    console.log('');

    // ====================================
    // 5. VERIFICAR RELACIÓN FK
    // ====================================
    console.log('📊 5. Verificando relaciones de Foreign Keys...\n');

    const fkInfo = await prisma.$queryRaw`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name,
        rc.delete_rule
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

    if (fkInfo.length > 0) {
      console.log('Foreign Key encontrada:');
      fkInfo.forEach(fk => {
        console.log(`  - ${fk.table_name}.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        console.log(`  - Delete Rule: ${fk.delete_rule}`);
      });

      const deleteRule = fkInfo[0].delete_rule;
      if (deleteRule === 'RESTRICT') {
        success.push('✅ OK: La FK users.roleId → roles.id tiene DELETE RESTRICT (correcto)');
      } else {
        warnings.push(`⚠️  WARNING: La FK tiene DELETE ${deleteRule} (se esperaba RESTRICT)`);
      }
    } else {
      errors.push('❌ ERROR: No se encontró la Foreign Key users.roleId → roles.id');
    }

    console.log('');

    // ====================================
    // 6. VERIFICAR INTEGRIDAD REFERENCIAL
    // ====================================
    console.log('📊 6. Verificando integridad referencial...\n');

    // Buscar usuarios con roleId que no existe en roles
    const orphanUsers = await prisma.$queryRaw`
      SELECT u.id, u.username, u.email, u."roleId"
      FROM "public"."users" u
      LEFT JOIN "public"."roles" r ON u."roleId" = r.id
      WHERE r.id IS NULL;
    `;

    if (orphanUsers.length > 0) {
      errors.push(`❌ ERROR: ${orphanUsers.length} usuario(s) con roleId que no existe en tabla roles`);
      console.log('Usuarios huérfanos:');
      orphanUsers.forEach(u => {
        console.log(`  - ${u.username}: roleId=${u.roleId} (no existe)`);
      });
    } else {
      success.push('✅ OK: Todos los usuarios tienen roleId válido que existe en tabla roles');
    }

    console.log('');

    // ====================================
    // RESUMEN FINAL
    // ====================================
    console.log('\n' + '='.repeat(50));
    console.log('  📋 RESUMEN DE VERIFICACIÓN');
    console.log('='.repeat(50) + '\n');

    if (success.length > 0) {
      console.log('✅ ÉXITOS:');
      success.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    if (warnings.length > 0) {
      console.log('⚠️  ADVERTENCIAS:');
      warnings.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    if (errors.length > 0) {
      console.log('❌ ERRORES:');
      errors.forEach(msg => console.log(`   ${msg}`));
      console.log('');
    }

    console.log('='.repeat(50));

    if (errors.length === 0 && warnings.length === 0) {
      console.log('\n🎉 ¡VERIFICACIÓN EXITOSA!');
      console.log('La base de datos está completamente migrada al sistema RBAC.');
      console.log('No se encontraron datos residuales del sistema anterior.\n');
      return true;
    } else if (errors.length === 0) {
      console.log('\n✅ VERIFICACIÓN COMPLETADA CON ADVERTENCIAS');
      console.log(`Se encontraron ${warnings.length} advertencia(s) que deberías revisar.\n`);
      return true;
    } else {
      console.log('\n❌ VERIFICACIÓN FALLIDA');
      console.log(`Se encontraron ${errors.length} error(es) que deben corregirse.\n`);
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO durante la verificación:');
    console.error(error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar verificación
verifyDatabase()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
