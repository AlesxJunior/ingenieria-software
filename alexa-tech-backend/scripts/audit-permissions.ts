import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

interface PermissionAudit {
  permissionsInDatabase: string[];
  permissionsInCode: string[];
  permissionsInSeed: string[];
  missingInDatabase: string[];
  unusedInCode: string[];
  adminPermissions: string[];
}

async function auditPermissions(): Promise<PermissionAudit> {
  console.log('🔍 Iniciando auditoría de permisos del sistema...\n');

  // 1. Extraer permisos de la base de datos
  console.log('1️⃣ Extrayendo permisos de la base de datos...');
  const users = await prisma.user.findMany({
    select: {
      email: true,
      permissions: true,
    },
  });

  const dbPermissionsSet = new Set<string>();
  users.forEach(user => {
    user.permissions.forEach(p => dbPermissionsSet.add(p));
  });
  const permissionsInDatabase = Array.from(dbPermissionsSet).sort();
  console.log(`   ✅ Encontrados ${permissionsInDatabase.length} permisos únicos en la BD`);

  // 2. Extraer permisos usados en el código (requirePermission)
  console.log('\n2️⃣ Extrayendo permisos del código fuente...');
  const permissionsInCode = await extractPermissionsFromCode();
  console.log(`   ✅ Encontrados ${permissionsInCode.length} permisos en el código`);

  // 3. Extraer permisos del seed
  console.log('\n3️⃣ Extrayendo permisos del seed.ts...');
  const permissionsInSeed = extractPermissionsFromSeed();
  console.log(`   ✅ Encontrados ${permissionsInSeed.length} permisos en seed.ts`);

  // 4. Obtener permisos del admin
  console.log('\n4️⃣ Extrayendo permisos del usuario admin...');
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@alexatech.com' },
    select: { permissions: true },
  });
  const adminPermissions = admin?.permissions || [];
  console.log(`   ✅ Admin tiene ${adminPermissions.length} permisos`);

  // 5. Análisis de discrepancias
  console.log('\n5️⃣ Analizando discrepancias...');
  
  const permissionsInCodeSet = new Set(permissionsInCode);
  const permissionsInDbSet = new Set(permissionsInDatabase);
  const permissionsInSeedSet = new Set(permissionsInSeed);

  const missingInDatabase = permissionsInCode.filter(p => !permissionsInDbSet.has(p));
  const unusedInCode = permissionsInDatabase.filter(p => !permissionsInCodeSet.has(p));
  const missingInSeed = permissionsInCode.filter(p => !permissionsInSeedSet.has(p));
  const missingFromAdmin = permissionsInCode.filter(p => !adminPermissions.includes(p));

  console.log(`   ⚠️  Permisos en código pero NO en BD: ${missingInDatabase.length}`);
  console.log(`   ⚠️  Permisos en BD pero NO usados en código: ${unusedInCode.length}`);
  console.log(`   ⚠️  Permisos en código pero NO en seed: ${missingInSeed.length}`);
  console.log(`   ⚠️  Permisos faltantes en Admin: ${missingFromAdmin.length}`);

  return {
    permissionsInDatabase,
    permissionsInCode,
    permissionsInSeed,
    missingInDatabase,
    unusedInCode,
    adminPermissions,
  };
}

function extractPermissionsFromSeed(): string[] {
  const seedPath = path.join(__dirname, '..', 'prisma', 'seed.ts');
  const content = fs.readFileSync(seedPath, 'utf-8');
  
  const permissions = new Set<string>();
  
  // Extraer permisos de arrays como ADMIN_PERMISSIONS, etc.
  const permissionArrayRegex = /'([a-z-]+\.[a-z-]+)'/g;
  let match;
  while ((match = permissionArrayRegex.exec(content)) !== null) {
    permissions.add(match[1]);
  }
  
  return Array.from(permissions).sort();
}

async function extractPermissionsFromCode(): Promise<string[]> {
  const permissions = new Set<string>();
  
  // Buscar en todos los archivos de rutas
  const routesDirs = [
    path.join(__dirname, '..', 'src', 'routes'),
    path.join(__dirname, '..', 'src', 'modules'),
  ];
  
  for (const dir of routesDirs) {
    if (fs.existsSync(dir)) {
      await scanDirectory(dir, permissions);
    }
  }
  
  return Array.from(permissions).sort();
}

async function scanDirectory(dir: string, permissions: Set<string>) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      await scanDirectory(fullPath, permissions);
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

function generateReport(audit: PermissionAudit): string {
  let report = `
╔══════════════════════════════════════════════════════════════════
║  REPORTE DE AUDITORÍA DE PERMISOS - AlexaTech
╚══════════════════════════════════════════════════════════════════

📊 RESUMEN GENERAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  • Permisos en base de datos:  ${audit.permissionsInDatabase.length}
  • Permisos en código fuente:  ${audit.permissionsInCode.length}
  • Permisos en seed.ts:        ${audit.permissionsInSeed.length}
  • Permisos del Admin:         ${audit.adminPermissions.length}

`;

  // Permisos en código
  report += `\n🔐 PERMISOS USADOS EN EL CÓDIGO (${audit.permissionsInCode.length})\n`;
  report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  const grouped = groupPermissionsByModule(audit.permissionsInCode);
  for (const [module, perms] of Object.entries(grouped)) {
    report += `\n  📁 ${module.toUpperCase()}\n`;
    perms.forEach(p => report += `     • ${p}\n`);
  }

  // Permisos faltantes en BD
  if (audit.missingInDatabase.length > 0) {
    report += `\n\n⚠️  PERMISOS EN CÓDIGO PERO NO EN BASE DE DATOS (${audit.missingInDatabase.length})\n`;
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    const groupedMissing = groupPermissionsByModule(audit.missingInDatabase);
    for (const [module, perms] of Object.entries(groupedMissing)) {
      report += `\n  📁 ${module.toUpperCase()}\n`;
      perms.forEach(p => report += `     ❌ ${p}\n`);
    }
    report += '\n  ⚡ ACCIÓN REQUERIDA: Estos permisos deben agregarse al seed.ts\n';
  }

  // Permisos no usados
  if (audit.unusedInCode.length > 0) {
    report += `\n\n🗑️  PERMISOS EN BD PERO NO USADOS EN CÓDIGO (${audit.unusedInCode.length})\n`;
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    const groupedUnused = groupPermissionsByModule(audit.unusedInCode);
    for (const [module, perms] of Object.entries(groupedUnused)) {
      report += `\n  📁 ${module.toUpperCase()}\n`;
      perms.forEach(p => report += `     ⚠️  ${p}\n`);
    }
    report += '\n  ⚡ ACCIÓN SUGERIDA: Considerar eliminar permisos obsoletos o implementar su uso\n';
  }

  // Validación Admin
  const missingFromAdmin = audit.permissionsInCode.filter(p => !audit.adminPermissions.includes(p));
  if (missingFromAdmin.length > 0) {
    report += `\n\n🚨 PERMISOS FALTANTES EN ROL ADMIN (${missingFromAdmin.length})\n`;
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    const groupedAdmin = groupPermissionsByModule(missingFromAdmin);
    for (const [module, perms] of Object.entries(groupedAdmin)) {
      report += `\n  📁 ${module.toUpperCase()}\n`;
      perms.forEach(p => report += `     🔴 ${p}\n`);
    }
    report += '\n  ⚡ ACCIÓN CRÍTICA: El Admin debe tener TODOS los permisos del sistema\n';
  } else {
    report += `\n\n✅ ROL ADMIN VERIFICADO\n`;
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    report += '  El usuario Admin tiene todos los permisos necesarios del sistema.\n';
  }

  // Redundancias
  const redundant = findRedundantPermissions(audit.permissionsInCode);
  if (redundant.length > 0) {
    report += `\n\n🔄 POSIBLES REDUNDANCIAS DETECTADAS (${redundant.length})\n`;
    report += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
    redundant.forEach(r => report += `  ⚠️  ${r}\n`);
    report += '\n  💡 SUGERENCIA: Revisar si estos permisos son realmente necesarios\n';
  }

  report += `\n\n${'═'.repeat(68)}\n`;
  report += `Generado: ${new Date().toLocaleString('es-PE')}\n`;
  report += `${'═'.repeat(68)}\n`;

  return report;
}

function groupPermissionsByModule(permissions: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  permissions.forEach(p => {
    const module = p.split('.')[0];
    if (!grouped[module]) {
      grouped[module] = [];
    }
    grouped[module].push(p);
  });
  
  // Ordenar módulos alfabéticamente
  const sorted: Record<string, string[]> = {};
  Object.keys(grouped).sort().forEach(key => {
    sorted[key] = grouped[key].sort();
  });
  
  return sorted;
}

function findRedundantPermissions(permissions: string[]): string[] {
  const redundant: string[] = [];
  
  // Buscar patrones como "commercial_entities" vs "clients"
  const patterns = [
    { old: 'commercial_entities', new: 'clients', desc: 'commercial_entities puede ser reemplazado por clients' },
    { old: 'configuration', new: 'system', desc: 'configuration y system pueden ser consolidados' },
  ];
  
  for (const pattern of patterns) {
    const hasOld = permissions.some(p => p.startsWith(pattern.old));
    const hasNew = permissions.some(p => p.startsWith(pattern.new));
    
    if (hasOld && hasNew) {
      redundant.push(pattern.desc);
    }
  }
  
  return redundant;
}

async function main() {
  try {
    const audit = await auditPermissions();
    const report = generateReport(audit);
    
    console.log('\n' + report);
    
    // Guardar reporte en archivo
    const reportPath = path.join(__dirname, '..', 'docs', 'AUDITORIA_PERMISOS.md');
    fs.writeFileSync(reportPath, report, 'utf-8');
    console.log(`\n📄 Reporte guardado en: ${reportPath}`);
    
    // Generar script de corrección
    await generateFixScript(audit);
    
  } catch (error) {
    console.error('❌ Error durante la auditoría:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateFixScript(audit: PermissionAudit) {
  const missingFromAdmin = audit.permissionsInCode.filter(p => !audit.adminPermissions.includes(p));
  
  if (missingFromAdmin.length === 0 && audit.missingInDatabase.length === 0) {
    console.log('\n✅ No se requieren correcciones');
    return;
  }
  
  let script = `import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPermissions() {
  console.log('🔧 Iniciando corrección de permisos...\\n');
  
`;

  if (missingFromAdmin.length > 0) {
    script += `  // Agregar permisos faltantes al Admin
  console.log('1️⃣ Actualizando permisos del Admin...');
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@alexatech.com' },
  });
  
  if (admin) {
    const newPermissions = [
      ...admin.permissions,
${missingFromAdmin.map(p => `      '${p}',`).join('\n')}
    ];
    
    await prisma.user.update({
      where: { id: admin.id },
      data: { permissions: newPermissions },
    });
    
    console.log(\`   ✅ Se agregaron \${${missingFromAdmin.length}} permisos al Admin\`);
  }
  
`;
  }

  script += `  console.log('\\n✅ Corrección completada');
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

  const scriptPath = path.join(__dirname, '..', 'scripts', 'fix-permissions.ts');
  fs.writeFileSync(scriptPath, script, 'utf-8');
  console.log(`\n🔧 Script de corrección generado: ${scriptPath}`);
  console.log('   Ejecutar con: npx ts-node scripts/fix-permissions.ts');
}

main();
