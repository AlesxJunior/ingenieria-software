/**
 * Script para verificar permisos del rol Admin
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function login() {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@alexatech.com', password: 'admin123' })
  });
  const data = await response.json();
  return data.data?.accessToken || data.accessToken;
}

async function checkPermissions(token) {
  // Intentar acceder al endpoint de categorías
  console.log('🔍 Intentando acceder a /api/configuracion/categorias\n');
  
  const response = await fetch(`${BASE_URL}/configuracion/categorias?activo=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log(`Status: ${response.status} ${response.statusText}`);
  
  if (response.status === 403) {
    const error = await response.json();
    console.log('\n❌ ACCESO DENEGADO (403 Forbidden)');
    console.log('Mensaje:', error.message);
    console.log('\nPermiso requerido: system.settings');
    console.log('El rol Admin NO tiene este permiso\n');
    return false;
  } else if (response.ok) {
    const data = await response.json();
    console.log('\n✅ ACCESO CONCEDIDO');
    console.log(`Categorías encontradas: ${data.data?.length || 0}\n`);
    return true;
  } else {
    console.log('\n⚠️  Error inesperado:', await response.text());
    return false;
  }
}

async function checkUnidades(token) {
  console.log('🔍 Intentando acceder a /api/configuracion/unidades-medida\n');
  
  const response = await fetch(`${BASE_URL}/configuracion/unidades-medida?activo=true`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  console.log(`Status: ${response.status} ${response.statusText}`);
  
  if (response.status === 403) {
    const error = await response.json();
    console.log('\n❌ ACCESO DENEGADO (403 Forbidden)');
    console.log('Mensaje:', error.message);
    return false;
  } else if (response.ok) {
    const data = await response.json();
    console.log('\n✅ ACCESO CONCEDIDO');
    console.log(`Unidades encontradas: ${data.data?.length || 0}\n`);
    return true;
  }
}

async function main() {
  try {
    const token = await login();
    console.log('✅ Login exitoso\n');
    console.log('═'.repeat(80));
    
    await checkPermissions(token);
    
    console.log('═'.repeat(80));
    
    await checkUnidades(token);
    
    console.log('═'.repeat(80));
    console.log('\n💡 SOLUCIÓN:');
    console.log('Ejecutar script para agregar permisos system.settings al rol Admin\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
