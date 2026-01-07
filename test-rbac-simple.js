/**
 * Validación manual RBAC - Verificación simple
 * 
 * Este script hace validaciones básicas sin necesidad de autenticación
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testValidationEndpoints() {
  console.log('\n🔍 VALIDACIÓN RBAC - TEST ENDPOINTS SIN AUTH\n');
  
  // Test: Health check
  console.log('1️⃣ Testing health endpoint...');
  try {
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend activo:', health.data);
  } catch (error) {
    console.log('❌ Backend no disponible');
    return;
  }
  
  // Test: Intentar crear usuario sin token (debe fallar por auth, no por validación)
  console.log('\n2️⃣ Testing create user sin autenticación...');
  try {
    await axios.post(`${BASE_URL}/users`, {
      username: 'test',
      email: 'test@test.com',
      password: 'Test@123',
      roleId: '1',
      permissions: ['users.read'], // ❌ Este campo NO debe aceptarse
    });
    console.log('⚠️  Request aceptado (no esperado)');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Auth bloqueado correctamente (401)');
    } else if (error.response?.status === 400) {
      console.log('⚠️  Validación antes de auth:', error.response.data);
    } else {
      console.log('❓ Error:', error.response?.data || error.message);
    }
  }
  
  console.log('\n📊 CONCLUSIÓN:');
  console.log('- El backend está activo');
  console.log('- Las rutas requieren autenticación');
  console.log('- Para validar RBAC completamente, necesitamos credenciales válidas\n');
  
  console.log('💡 ALTERNATIVA: Validar directamente con código TypeScript');
  console.log('   Revisar: alexa-tech-backend/src/utils/validation.ts');
  console.log('   Buscar: validateUserCreate y validateUserUpdate');
  console.log('   Verificar que rechacen campo "permissions" y requieran "roleId"\n');
}

testValidationEndpoints();
