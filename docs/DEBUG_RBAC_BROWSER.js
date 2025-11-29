/**
 * 🔍 HELPER DE DIAGNÓSTICO - FRONTEND
 * ====================================
 * Ejecutar en consola del navegador para debug rápido
 * 
 * INSTRUCCIONES:
 * 1. Abrir DevTools (F12)
 * 2. Copiar y pegar todo este código en la consola
 * 3. Ejecutar: debugRBAC()
 */

function debugRBAC() {
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' '.repeat(20) + '🔍 DEBUG RBAC - FRONTEND' + ' '.repeat(33) + '║');
  console.log('╚' + '═'.repeat(78) + '╝\n');

  // ============================================================================
  // 1. VERIFICAR USUARIO EN LOCALSTORAGE
  // ============================================================================
  console.log('1️⃣ USUARIO EN LOCALSTORAGE\n' + '─'.repeat(80));
  
  const userStr = localStorage.getItem('alexatech_user');
  if (!userStr) {
    console.error('❌ No hay usuario en localStorage (alexatech_user)');
    console.log('💡 Solución: Inicia sesión nuevamente\n');
    return;
  }
  
  const user = JSON.parse(userStr);
  console.log('✅ Usuario encontrado:', user.username, `(${user.firstName} ${user.lastName})`);
  console.log('📧 Email:', user.email);
  console.log('🆔 ID:', user.id);
  console.log('🔑 Rol:', user.role?.name || 'N/A');
  
  // ============================================================================
  // 2. VERIFICAR ESTRUCTURA DE PERMISOS
  // ============================================================================
  console.log('\n2️⃣ ESTRUCTURA DE PERMISOS\n' + '─'.repeat(80));
  
  let permissions = [];
  let permissionsSource = '';
  
  // Verificar estructura RBAC nueva (user.role.permissions)
  if (user.role && Array.isArray(user.role.permissions)) {
    permissions = user.role.permissions;
    permissionsSource = 'user.role.permissions ✅ (RBAC correcto)';
    console.log('✅ Estructura RBAC correcta: user.role.permissions');
  } 
  // Verificar estructura legacy (user.permissions directo)
  else if (Array.isArray(user.permissions)) {
    permissions = user.permissions;
    permissionsSource = 'user.permissions ⚠️ (Legacy - reiniciar sesión)';
    console.warn('⚠️ Estructura legacy: user.permissions');
    console.warn('💡 Recomendación: Cierra sesión y vuelve a iniciar para actualizar a RBAC');
  } 
  else {
    console.error('❌ No se encontraron permisos en ninguna estructura');
    console.error('Estructura del usuario:', user);
    console.log('💡 Solución: Reinicia sesión o verifica backend');
    return;
  }
  
  console.log('📍 Fuente de permisos:', permissionsSource);
  console.log('📊 Total de permisos:', permissions.length);
  
  // ============================================================================
  // 3. LISTAR PERMISOS
  // ============================================================================
  console.log('\n3️⃣ PERMISOS DISPONIBLES\n' + '─'.repeat(80));
  
  if (permissions.length === 0) {
    console.warn('⚠️ El usuario no tiene permisos asignados');
    console.log('💡 Solución: Asigna un rol con permisos al usuario');
    return;
  }
  
  // Agrupar permisos por módulo
  const permisosPorModulo = {};
  permissions.forEach(perm => {
    const [modulo, accion] = perm.split('.');
    if (!permisosPorModulo[modulo]) permisosPorModulo[modulo] = [];
    permisosPorModulo[modulo].push(accion);
  });
  
  console.table(permisosPorModulo);
  
  // ============================================================================
  // 4. VERIFICAR PERMISOS CLAVE
  // ============================================================================
  console.log('\n4️⃣ PERMISOS CLAVE\n' + '─'.repeat(80));
  
  const permisosImportantes = [
    'users.create',
    'users.read',
    'users.update',
    'users.delete',
    'dashboard.view',
    'sales.create',
    'sales.read'
  ];
  
  permisosImportantes.forEach(perm => {
    const tiene = permissions.includes(perm);
    const icon = tiene ? '✅' : '❌';
    console.log(`${icon} ${perm.padEnd(30)} ${tiene ? 'SÍ' : 'NO'}`);
  });
  
  // ============================================================================
  // 5. VERIFICAR TOKEN
  // ============================================================================
  console.log('\n5️⃣ TOKEN DE AUTENTICACIÓN\n' + '─'.repeat(80));
  
  const token = localStorage.getItem('alexatech_token');
  if (!token) {
    console.error('❌ No hay token en localStorage (alexatech_token)');
    console.log('💡 Solución: Inicia sesión nuevamente');
  } else {
    console.log('✅ Token encontrado');
    console.log('📏 Longitud:', token.length, 'caracteres');
    console.log('🔐 Inicio:', token.substring(0, 30) + '...');
    
    // Intentar decodificar JWT (sin validación de firma)
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      console.log('📅 Emitido:', new Date(decoded.iat * 1000).toLocaleString('es-PE'));
      console.log('⏰ Expira:', new Date(decoded.exp * 1000).toLocaleString('es-PE'));
      
      const now = Date.now() / 1000;
      if (decoded.exp < now) {
        console.error('❌ TOKEN EXPIRADO');
        console.log('💡 Solución: Inicia sesión nuevamente');
      } else {
        const horasRestantes = Math.floor((decoded.exp - now) / 3600);
        console.log(`✅ Token válido (expira en ${horasRestantes}h)`);
      }
    } catch (e) {
      console.warn('⚠️ No se pudo decodificar el token (formato inesperado)');
    }
  }
  
  // ============================================================================
  // 6. RESUMEN Y RECOMENDACIONES
  // ============================================================================
  console.log('\n6️⃣ RESUMEN Y RECOMENDACIONES\n' + '─'.repeat(80));
  
  const diagnostico = {
    'Usuario autenticado': user ? '✅ Sí' : '❌ No',
    'Tiene rol asignado': user?.role ? '✅ Sí' : '❌ No',
    'Tiene permisos': permissions.length > 0 ? '✅ Sí' : '❌ No',
    'Estructura RBAC': user?.role?.permissions ? '✅ Correcta' : '⚠️ Legacy',
    'Token válido': token ? '✅ Sí' : '❌ No'
  };
  
  console.table(diagnostico);
  
  // Recomendaciones específicas
  console.log('\n💡 RECOMENDACIONES:\n');
  
  if (!user.role?.permissions && user.permissions) {
    console.log('🔄 Reiniciar sesión para actualizar a estructura RBAC');
    console.log('   Ejecuta: logout() y vuelve a iniciar sesión');
  }
  
  if (!permissions.includes('users.create')) {
    console.log('🔒 No tienes permiso "users.create" - No verás botón "Nuevo Rol"');
    console.log('   Solución: Pide al admin que te asigne un rol con este permiso');
  }
  
  if (permissions.length === 0) {
    console.log('⚠️ No tienes permisos asignados');
    console.log('   Solución: Contacta al administrador para que te asigne un rol');
  }
  
  console.log('\n✅ Diagnóstico completado\n');
  
  // Retornar objeto útil
  return {
    user,
    permissions,
    permissionsSource,
    hasUsersCreate: permissions.includes('users.create'),
    token: token ? token.substring(0, 30) + '...' : null
  };
}

// ============================================================================
// HELPERS ADICIONALES
// ============================================================================

function checkPermission(permission) {
  const user = JSON.parse(localStorage.getItem('alexatech_user'));
  const perms = user?.role?.permissions || user?.permissions || [];
  const tiene = perms.includes(permission);
  
  console.log(`${tiene ? '✅' : '❌'} Permiso "${permission}": ${tiene ? 'SÍ' : 'NO'}`);
  return tiene;
}

function listarRoles() {
  console.log('🔍 Consultando endpoint /roles...\n');
  
  const token = localStorage.getItem('alexatech_token');
  if (!token) {
    console.error('❌ No hay token. Inicia sesión primero.');
    return;
  }
  
  fetch('http://localhost:3001/api/roles', {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      const roles = data.data || data;
      console.log(`✅ Roles encontrados: ${roles.length}\n`);
      console.table(roles.map(r => ({
        Nombre: r.name,
        Tipo: r.isSystem ? 'Sistema' : 'Personalizado',
        Estado: r.isActive ? 'Activo' : 'Inactivo',
        Permisos: r.permissions.length
      })));
    })
    .catch(err => {
      console.error('❌ Error al consultar roles:', err.message);
    });
}

function logout() {
  localStorage.removeItem('alexatech_user');
  localStorage.removeItem('alexatech_token');
  console.log('✅ Sesión cerrada. Refresca la página para volver al login.');
}

// ============================================================================
// MOSTRAR AYUDA
// ============================================================================

console.log('\n📚 FUNCIONES DISPONIBLES:\n');
console.log('• debugRBAC()              - Diagnóstico completo del sistema RBAC');
console.log('• checkPermission("perm")  - Verificar si tienes un permiso específico');
console.log('• listarRoles()            - Ver roles disponibles en el sistema');
console.log('• logout()                 - Cerrar sesión\n');

console.log('💡 Ejecuta: debugRBAC() para comenzar\n');
