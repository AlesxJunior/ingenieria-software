import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function extractPermissionsFromCode() {
  const permissions = new Set();
  
  const routesDirs = [
    path.join(__dirname, '..', 'src', 'routes'),
    path.join(__dirname, '..', 'src', 'modules'),
  ];
  
  for (const dir of routesDirs) {
    if (fs.existsSync(dir)) {
      scanDirectory(dir, permissions);
    }
  }
  
  return Array.from(permissions).sort();
}

function scanDirectory(dir, permissions) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      scanDirectory(fullPath, permissions);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Buscar requirePermission('xxx')
      const regex = /requirePermission\(['"]([a-z-]+\.[a-z-]+)['"]/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        permissions.add(match[1]);
      }
    }
  }
}

function extractPermissionsFromSeed() {
  const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
  const content = fs.readFileSync(seedPath, 'utf-8');
  
  const permissions = new Set();
  
  // Extraer permisos de arrays como ADMIN_PERMISSIONS, etc.
  const permissionArrayRegex = /'([a-z-]+\.[a-z-]+)'/g;
  let match;
  while ((match = permissionArrayRegex.exec(content)) !== null) {
    permissions.add(match[1]);
  }
  
  return Array.from(permissions).sort();
}

function groupPermissionsByModule(permissions) {
  const grouped = {};
  
  permissions.forEach(p => {
    const module = p.split('.')[0];
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(p);
  });
  
  // Ordenar módulos alfabéticamente
  const sorted = {};
  Object.keys(grouped).sort().forEach(key => {
    sorted[key] = grouped[key].sort();
  });
  
  return sorted;
}

async function main() {
  console.log('🔍 AUDITORÍA DE PERMISOS - AlexaTech\n');
  console.log('═'.repeat(70) + '\n');

  // 1. Extraer permisos de la base de datos
  console.log('1️⃣ Extrayendo permisos de la base de datos...');
  const users = await prisma.user.findMany({
    select: {
      email: true,
      permissions: true,
    },
  });

  const dbPermissionsSet = new Set();
  users.forEach(user => {
    user.permissions.forEach(p => dbPermissionsSet.add(p));
  });
  const permissionsInDatabase = Array.from(dbPermissionsSet).sort();
  console.log(`   ✅ Encontrados ${permissionsInDatabase.length} permisos únicos en la BD\n`);

  // 2. Extraer permisos usados en el código
  console.log('2️⃣ Extrayendo permisos del código fuente...');
  const permissionsInCode = await extractPermissionsFromCode();
  console.log(`   ✅ Encontrados ${permissionsInCode.length} permisos en el código\n`);

  // 3. Extraer permisos del seed
  console.log('3️⃣ Extrayendo permisos del seed.ts...');
  const permissionsInSeed = extractPermissionsFromSeed();
  console.log(`   ✅ Encontrados ${permissionsInSeed.length} permisos en seed.ts\n`);

  // 4. Obtener permisos del admin
  console.log('4️⃣ Extrayendo permisos del usuario admin...');
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@alexatech.com' },
    select: { permissions: true, email: true },
  });
  const adminPermissions = admin?.permissions || [];
  console.log(`   ✅ Admin tiene ${adminPermissions.length} permisos\n`);

  // 5. Análisis de discrepancias
  console.log('5️⃣ Analizando discrepancias...');
  
  const permissionsInCodeSet = new Set(permissionsInCode);
  const permissionsInDbSet = new Set(permissionsInDatabase);

  const missingInDatabase = permissionsInCode.filter(p => !permissionsInDbSet.has(p));
  const unusedInCode = permissionsInDatabase.filter(p => !permissionsInCodeSet.has(p));
  const missingFromAdmin = permissionsInCode.filter(p => !adminPermissions.includes(p));

  console.log(`   ⚠️  Permisos en código pero NO en BD: ${missingInDatabase.length}`);
  console.log(`   ⚠️  Permisos en BD pero NO usados en código: ${unusedInCode.length}`);
  console.log(`   🚨 Permisos faltantes en Admin: ${missingFromAdmin.length}\n`);

  // REPORTE DETALLADO
  console.log('\n' + '═'.repeat(70));
  console.log('📋 PERMISOS USADOS EN EL CÓDIGO (' + permissionsInCode.length + ')');
  console.log('═'.repeat(70) + '\n');
  
  const grouped = groupPermissionsByModule(permissionsInCode);
  for (const [module, perms] of Object.entries(grouped)) {
    console.log(`📁 ${module.toUpperCase()} (${perms.length})`);
    perms.forEach(p => console.log(`   • ${p}`));
    console.log('');
  }

  // Permisos faltantes en BD
  if (missingInDatabase.length > 0) {
    console.log('\n' + '═'.repeat(70));
    console.log('⚠️  PERMISOS EN CÓDIGO PERO NO EN BASE DE DATOS (' + missingInDatabase.length + ')');
    console.log('═'.repeat(70) + '\n');
    const groupedMissing = groupPermissionsByModule(missingInDatabase);
    for (const [module, perms] of Object.entries(groupedMissing)) {
      console.log(`📁 ${module.toUpperCase()}`);
      perms.forEach(p => console.log(`   ❌ ${p}`));
      console.log('');
    }
    console.log('⚡ ACCIÓN REQUERIDA: Estos permisos deben agregarse al seed.ts\n');
  }

  // Permisos no usados
  if (unusedInCode.length > 0) {
    console.log('\n' + '═'.repeat(70));
    console.log('🗑️  PERMISOS EN BD PERO NO USADOS EN CÓDIGO (' + unusedInCode.length + ')');
    console.log('═'.repeat(70) + '\n');
    const groupedUnused = groupPermissionsByModule(unusedInCode);
    for (const [module, perms] of Object.entries(groupedUnused)) {
      console.log(`📁 ${module.toUpperCase()}`);
      perms.forEach(p => console.log(`   ⚠️  ${p}`));
      console.log('');
    }
    console.log('⚡ ACCIÓN SUGERIDA: Considerar eliminar permisos obsoletos o implementar su uso\n');
  }

  // Validación Admin
  if (missingFromAdmin.length > 0) {
    console.log('\n' + '═'.repeat(70));
    console.log('🚨 PERMISOS FALTANTES EN ROL ADMIN (' + missingFromAdmin.length + ')');
    console.log('═'.repeat(70) + '\n');
    const groupedAdmin = groupPermissionsByModule(missingFromAdmin);
    for (const [module, perms] of Object.entries(groupedAdmin)) {
      console.log(`📁 ${module.toUpperCase()}`);
      perms.forEach(p => console.log(`   🔴 ${p}`));
      console.log('');
    }
    console.log('⚡ ACCIÓN CRÍTICA: El Admin debe tener TODOS los permisos del sistema\n');
  } else {
    console.log('\n' + '═'.repeat(70));
    console.log('✅ ROL ADMIN VERIFICADO');
    console.log('═'.repeat(70));
    console.log('El usuario Admin tiene todos los permisos necesarios del sistema.\n');
  }

  // Generar array de permisos completo para seed
  console.log('\n' + '═'.repeat(70));
  console.log('📝 ARRAY DE PERMISOS COMPLETO PARA ADMIN');
  console.log('═'.repeat(70) + '\n');
  console.log('const ADMIN_PERMISSIONS = [');
  const groupedAll = groupPermissionsByModule(permissionsInCode);
  for (const [module, perms] of Object.entries(groupedAll)) {
    console.log(`  // ${module.charAt(0).toUpperCase() + module.slice(1)}`);
    perms.forEach(p => console.log(`  '${p}',`));
  }
  console.log('];\n');

  // Estadísticas finales
  console.log('═'.repeat(70));
  console.log('📊 ESTADÍSTICAS FINALES');
  console.log('═'.repeat(70));
  console.log(`Permisos en código:        ${permissionsInCode.length}`);
  console.log(`Permisos en BD:            ${permissionsInDatabase.length}`);
  console.log(`Permisos en seed:          ${permissionsInSeed.length}`);
  console.log(`Permisos del Admin:        ${adminPermissions.length}`);
  console.log(`Faltantes en BD:           ${missingInDatabase.length}`);
  console.log(`No usados:                 ${unusedInCode.length}`);
  console.log(`Faltantes en Admin:        ${missingFromAdmin.length}`);
  console.log('═'.repeat(70) + '\n');

  if (missingFromAdmin.length > 0 || missingInDatabase.length > 0) {
    console.log('🔧 GENERANDO SCRIPT DE CORRECCIÓN...\n');
    
    let script = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPermissions() {
  console.log('🔧 Iniciando corrección de permisos...\\n');
  
  // Definir todos los permisos necesarios del sistema
  const ALL_SYSTEM_PERMISSIONS = [
`;

    permissionsInCode.forEach(p => {
      script += `    '${p}',\n`;
    });

    script += `  ];

  // Actualizar Admin
  console.log('1️⃣ Actualizando permisos del Admin...');
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@alexatech.com' },
  });
  
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { permissions: ALL_SYSTEM_PERMISSIONS },
    });
    console.log(\`   ✅ Admin actualizado con \${ALL_SYSTEM_PERMISSIONS.length} permisos\`);
  }
  
  console.log('\\n✅ Corrección completada');
}

fixPermissions()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
`;

    const scriptPath = path.join(__dirname, 'fix-permissions.mjs');
    fs.writeFileSync(scriptPath, script, 'utf-8');
    console.log(`✅ Script de corrección generado: fix-permissions.mjs`);
    console.log(`   Ejecutar con: node scripts/fix-permissions.mjs\n`);
  } else {
    console.log('✅ No se requieren correcciones\n');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
