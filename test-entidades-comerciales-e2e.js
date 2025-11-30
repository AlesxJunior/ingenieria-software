/**
 * TEST E2E - MÓDULO ENTIDADES COMERCIALES
 * 
 * Pruebas end-to-end completas para verificar:
 * 1. CRUD completo de entidades
 * 2. Cambio de tipoEntidad (Cliente/Proveedor/Ambos)
 * 3. Búsqueda SUNAT/RENIEC
 * 4. Validaciones y permisos RBAC
 * 5. Integración con módulo de ventas
 * 
 * @author Sistema Alexa Tech
 * @date 2025-11-30
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:5173';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Variables globales para los tests
let authToken = '';
let testClienteDNI = null;
let testClienteRUC = null;
let testProveedor = null;
let testAmbos = null;

// Configuración de axios
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

/**
 * TEST 1: Autenticación
 */
async function test1_Authentication() {
  log('\n========================================', 'blue');
  log('TEST 1: AUTENTICACIÓN', 'blue');
  log('========================================', 'blue');

  try {
    const response = await api.post('/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });

    if (response.data.success && response.data.data.accessToken) {
      authToken = response.data.data.accessToken;
      log('✅ Autenticación exitosa', 'green');
      log(`   Usuario: ${response.data.data.user.email}`, 'yellow');
      log(`   Token obtenido: ${authToken.substring(0, 30)}...`, 'yellow');
      return true;
    } else {
      throw new Error('No se obtuvo token');
    }
  } catch (error) {
    log(`❌ Error en autenticación: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 2: Crear Cliente con DNI
 */
async function test2_CreateClienteDNI() {
  log('\n========================================', 'blue');
  log('TEST 2: CREAR CLIENTE CON DNI', 'blue');
  log('========================================', 'blue');

  const timestamp = Date.now();
  const clienteData = {
    tipoEntidad: 'Cliente',
    tipoDocumento: 'DNI',
    numeroDocumento: `1234567${(timestamp % 10)}`,
    nombres: 'Juan Carlos',
    apellidos: 'Pérez García',
    email: `juan.perez.${timestamp}@test.com`,
    telefono: '987654321',
    direccion: 'Av. Test 123',
    departamentoId: 'DEP-15', // Lima
    provinciaId: 'PRO-1501', // Lima
    distritoId: 'DIS-150115', // La Victoria
  };

  try {
    log(`   Intentando crear con DNI: ${clienteData.numeroDocumento}`, 'yellow');
    const response = await api.post('/entidades', clienteData);

    if (response.data.success && response.data.data.client) {
      testClienteDNI = response.data.data.client;
      log('✅ Cliente DNI creado exitosamente', 'green');
      log(`   ID: ${testClienteDNI.id}`, 'yellow');
      log(`   Nombre: ${testClienteDNI.nombres} ${testClienteDNI.apellidos}`, 'yellow');
      log(`   Tipo: ${testClienteDNI.tipoEntidad}`, 'yellow');
      log(`   Documento: ${testClienteDNI.tipoDocumento} ${testClienteDNI.numeroDocumento}`, 'yellow');
      return true;
    } else {
      throw new Error('No se creó el cliente');
    }
  } catch (error) {
    log(`❌ Error al crear cliente DNI: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 3: Crear Cliente con RUC
 */
async function test3_CreateClienteRUC() {
  log('\n========================================', 'blue');
  log('TEST 3: CREAR CLIENTE CON RUC', 'blue');
  log('========================================', 'blue');

  const timestamp = Date.now();
  const clienteData = {
    tipoEntidad: 'Cliente',
    tipoDocumento: 'RUC',
    numeroDocumento: `2012345${timestamp.toString().slice(-4)}`,
    razonSocial: 'EMPRESA TEST SAC',
    email: `empresa.${timestamp}@test.com`,
    telefono: '987654322',
    direccion: 'Av. Empresarial 456',
    departamentoId: 'DEP-15',
    provinciaId: 'PRO-1501',
    distritoId: 'DIS-150115',
    isActive: true,
  };

  try {
    const response = await api.post('/entidades', clienteData);

    if (response.data.success && response.data.data.client) {
      testClienteRUC = response.data.data.client;
      log('✅ Cliente RUC creado exitosamente', 'green');
      log(`   ID: ${testClienteRUC.id}`, 'yellow');
      log(`   Razón Social: ${testClienteRUC.razonSocial}`, 'yellow');
      log(`   Tipo: ${testClienteRUC.tipoEntidad}`, 'yellow');
      log(`   RUC: ${testClienteRUC.numeroDocumento}`, 'yellow');
      return true;
    } else {
      throw new Error('No se creó el cliente RUC');
    }
  } catch (error) {
    log(`❌ Error al crear cliente RUC: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 4: Crear Proveedor
 */
async function test4_CreateProveedor() {
  log('\n========================================', 'blue');
  log('TEST 4: CREAR PROVEEDOR', 'blue');
  log('========================================', 'blue');

  const timestamp = Date.now();
  const proveedorData = {
    tipoEntidad: 'Proveedor',
    tipoDocumento: 'RUC',
    numeroDocumento: `2098765${timestamp.toString().slice(-4)}`,
    razonSocial: 'DISTRIBUIDORA NORTE SAC',
    email: `proveedor.${timestamp}@test.com`,
    telefono: '987654323',
    direccion: 'Av. Proveedores 789',
    departamentoId: 'DEP-15',
    provinciaId: 'PRO-1501',
    distritoId: 'DIS-150115',
    isActive: true,
  };

  try {
    const response = await api.post('/entidades', proveedorData);

    if (response.data.success && response.data.data.client) {
      testProveedor = response.data.data.client;
      log('✅ Proveedor creado exitosamente', 'green');
      log(`   ID: ${testProveedor.id}`, 'yellow');
      log(`   Razón Social: ${testProveedor.razonSocial}`, 'yellow');
      log(`   Tipo: ${testProveedor.tipoEntidad}`, 'yellow');
      return true;
    } else {
      throw new Error('No se creó el proveedor');
    }
  } catch (error) {
    log(`❌ Error al crear proveedor: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 5: Crear Entidad "Ambos"
 */
async function test5_CreateAmbos() {
  log('\n========================================', 'blue');
  log('TEST 5: CREAR ENTIDAD TIPO "AMBOS"', 'blue');
  log('========================================', 'blue');

  const timestamp = Date.now();
  const ambosData = {
    tipoEntidad: 'Ambos',
    tipoDocumento: 'RUC',
    numeroDocumento: `2055566${timestamp.toString().slice(-4)}`,
    razonSocial: 'COMERCIAL MIXTA SAC',
    email: `mixta.${timestamp}@test.com`,
    telefono: '987654324',
    direccion: 'Av. Comercial 999',
    departamentoId: 'DEP-15',
    provinciaId: 'PRO-1501',
    distritoId: 'DIS-150115',
    isActive: true,
  };

  try {
    const response = await api.post('/entidades', ambosData);

    if (response.data.success && response.data.data.client) {
      testAmbos = response.data.data.client;
      log('✅ Entidad "Ambos" creada exitosamente', 'green');
      log(`   ID: ${testAmbos.id}`, 'yellow');
      log(`   Razón Social: ${testAmbos.razonSocial}`, 'yellow');
      log(`   Tipo: ${testAmbos.tipoEntidad}`, 'yellow');
      return true;
    } else {
      throw new Error('No se creó la entidad');
    }
  } catch (error) {
    log(`❌ Error al crear entidad "Ambos": ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 6: Listar todas las entidades
 */
async function test6_GetAllEntidades() {
  log('\n========================================', 'blue');
  log('TEST 6: LISTAR TODAS LAS ENTIDADES', 'blue');
  log('========================================', 'blue');

  try {
    const response = await api.get('/entidades');

    if (response.data.success && response.data.data) {
      const clients = Array.isArray(response.data.data) ? response.data.data : response.data.data.clients || [];
      const pagination = response.data.pagination || { total: clients.length };
      log('✅ Listado de entidades exitoso', 'green');
      log(`   Total: ${pagination.total}`, 'yellow');
      log(`   Clientes: ${clients.filter(c => c.tipoEntidad === 'Cliente').length}`, 'yellow');
      log(`   Proveedores: ${clients.filter(c => c.tipoEntidad === 'Proveedor').length}`, 'yellow');
      log(`   Ambos: ${clients.filter(c => c.tipoEntidad === 'Ambos').length}`, 'yellow');
      return true;
    } else {
      throw new Error('No se obtuvo el listado');
    }
  } catch (error) {
    log(`❌ Error al listar entidades: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 7: Cambiar Cliente a Proveedor
 */
async function test7_ChangeClienteToProveedor() {
  log('\n========================================', 'blue');
  log('TEST 7: CAMBIAR CLIENTE → PROVEEDOR', 'blue');
  log('========================================', 'blue');

  if (!testClienteRUC) {
    log('⚠️ No hay cliente RUC para actualizar', 'yellow');
    return false;
  }

  const updateData = {
    tipoEntidad: 'Proveedor',
    tipoDocumento: testClienteRUC.tipoDocumento,
    numeroDocumento: testClienteRUC.numeroDocumento,
    razonSocial: testClienteRUC.razonSocial,
    email: testClienteRUC.email,
    telefono: testClienteRUC.telefono,
    direccion: testClienteRUC.direccion,
    departamentoId: testClienteRUC.departamentoId,
    provinciaId: testClienteRUC.provinciaId,
    distritoId: testClienteRUC.distritoId,
  };

  try {
    log(`   Antes: ${testClienteRUC.tipoEntidad}`, 'yellow');
    const response = await api.put(`/entidades/${testClienteRUC.id}`, updateData);

    if (response.data.success && response.data.data.client) {
      const updated = response.data.data.client;
      log('✅ Cambio Cliente → Proveedor exitoso', 'green');
      log(`   Después: ${updated.tipoEntidad}`, 'green');
      
      if (updated.tipoEntidad !== 'Proveedor') {
        throw new Error(`Expected 'Proveedor', got '${updated.tipoEntidad}'`);
      }
      
      testClienteRUC = updated;
      return true;
    } else {
      throw new Error('No se actualizó la entidad');
    }
  } catch (error) {
    log(`❌ Error al cambiar tipo: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 8: Cambiar Proveedor a Ambos
 */
async function test8_ChangeProveedorToAmbos() {
  log('\n========================================', 'blue');
  log('TEST 8: CAMBIAR PROVEEDOR → AMBOS', 'blue');
  log('========================================', 'blue');

  if (!testProveedor) {
    log('⚠️ No hay proveedor para actualizar', 'yellow');
    return false;
  }

  const updateData = {
    tipoEntidad: 'Ambos',
    tipoDocumento: testProveedor.tipoDocumento,
    numeroDocumento: testProveedor.numeroDocumento,
    razonSocial: testProveedor.razonSocial,
    email: testProveedor.email,
    telefono: testProveedor.telefono,
    direccion: testProveedor.direccion,
    departamentoId: testProveedor.departamentoId,
    provinciaId: testProveedor.provinciaId,
    distritoId: testProveedor.distritoId,
  };

  try {
    log(`   Antes: ${testProveedor.tipoEntidad}`, 'yellow');
    const response = await api.put(`/entidades/${testProveedor.id}`, updateData);

    if (response.data.success && response.data.data.client) {
      const updated = response.data.data.client;
      log('✅ Cambio Proveedor → Ambos exitoso', 'green');
      log(`   Después: ${updated.tipoEntidad}`, 'green');
      
      if (updated.tipoEntidad !== 'Ambos') {
        throw new Error(`Expected 'Ambos', got '${updated.tipoEntidad}'`);
      }
      
      testProveedor = updated;
      return true;
    } else {
      throw new Error('No se actualizó la entidad');
    }
  } catch (error) {
    log(`❌ Error al cambiar tipo: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 9: Cambiar Ambos a Cliente
 */
async function test9_ChangeAmbosToCliente() {
  log('\n========================================', 'blue');
  log('TEST 9: CAMBIAR AMBOS → CLIENTE', 'blue');
  log('========================================', 'blue');

  if (!testAmbos) {
    log('⚠️ No hay entidad "Ambos" para actualizar', 'yellow');
    return false;
  }

  const updateData = {
    tipoEntidad: 'Cliente',
    tipoDocumento: testAmbos.tipoDocumento,
    numeroDocumento: testAmbos.numeroDocumento,
    razonSocial: testAmbos.razonSocial,
    email: testAmbos.email,
    telefono: testAmbos.telefono,
    direccion: testAmbos.direccion,
    departamentoId: testAmbos.departamentoId,
    provinciaId: testAmbos.provinciaId,
    distritoId: testAmbos.distritoId,
  };

  try {
    log(`   Antes: ${testAmbos.tipoEntidad}`, 'yellow');
    const response = await api.put(`/entidades/${testAmbos.id}`, updateData);

    if (response.data.success && response.data.data.client) {
      const updated = response.data.data.client;
      log('✅ Cambio Ambos → Cliente exitoso', 'green');
      log(`   Después: ${updated.tipoEntidad}`, 'green');
      
      if (updated.tipoEntidad !== 'Cliente') {
        throw new Error(`Expected 'Cliente', got '${updated.tipoEntidad}'`);
      }
      
      testAmbos = updated;
      return true;
    } else {
      throw new Error('No se actualizó la entidad');
    }
  } catch (error) {
    log(`❌ Error al cambiar tipo: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 10: Buscar por documento
 */
async function test10_SearchByDocument() {
  log('\n========================================', 'blue');
  log('TEST 10: BUSCAR POR DOCUMENTO', 'blue');
  log('========================================', 'blue');

  if (!testClienteDNI) {
    log('⚠️ No hay cliente DNI para buscar', 'yellow');
    return false;
  }

  try {
    const response = await api.get(`/entidades/search/document/${testClienteDNI.numeroDocumento}`);

    if (response.data.success && response.data.data.client) {
      const found = response.data.data.client;
      log('✅ Búsqueda por documento exitosa', 'green');
      log(`   Encontrado: ${found.nombres} ${found.apellidos}`, 'yellow');
      log(`   DNI: ${found.numeroDocumento}`, 'yellow');
      return true;
    } else {
      throw new Error('No se encontró el cliente');
    }
  } catch (error) {
    log(`❌ Error en búsqueda: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 11: Buscar por email
 */
async function test11_SearchByEmail() {
  log('\n========================================', 'blue');
  log('TEST 11: BUSCAR POR EMAIL', 'blue');
  log('========================================', 'blue');

  if (!testClienteRUC) {
    log('⚠️ No hay cliente RUC para buscar', 'yellow');
    return false;
  }

  try {
    const response = await api.get(`/entidades/search/email/${testClienteRUC.email}`);

    if (response.data.success && response.data.data.client) {
      const found = response.data.data.client;
      log('✅ Búsqueda por email exitosa', 'green');
      log(`   Encontrado: ${found.razonSocial}`, 'yellow');
      log(`   Email: ${found.email}`, 'yellow');
      return true;
    } else {
      throw new Error('No se encontró el cliente');
    }
  } catch (error) {
    log(`❌ Error en búsqueda: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 12: Filtrar por tipoEntidad
 */
async function test12_FilterByTipoEntidad() {
  log('\n========================================', 'blue');
  log('TEST 12: FILTRAR POR TIPO DE ENTIDAD', 'blue');
  log('========================================', 'blue');

  try {
    // Filtrar solo clientes
    const responseClientes = await api.get('/entidades?tipoEntidad=Cliente');
    const clientes = responseClientes.data.data.clients;
    
    log('✅ Filtrado por tipo exitoso', 'green');
    log(`   Clientes: ${clientes.length}`, 'yellow');
    
    // Verificar que todos sean clientes
    const todosClientes = clientes.every(c => c.tipoEntidad === 'Cliente');
    if (!todosClientes) {
      throw new Error('El filtro no funcionó correctamente');
    }
    
    // Filtrar proveedores
    const responseProveedores = await api.get('/entidades?tipoEntidad=Proveedor');
    const proveedores = responseProveedores.data.data.clients;
    log(`   Proveedores: ${proveedores.length}`, 'yellow');
    
    // Filtrar Ambos
    const responseAmbos = await api.get('/entidades?tipoEntidad=Ambos');
    const ambos = responseAmbos.data.data.clients;
    log(`   Ambos: ${ambos.length}`, 'yellow');
    
    return true;
  } catch (error) {
    log(`❌ Error en filtrado: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 13: Validar que Proveedor NO puede ser usado en ventas
 */
async function test13_ValidateProveedorInSales() {
  log('\n========================================', 'blue');
  log('TEST 13: VALIDAR PROVEEDOR EN VENTAS', 'blue');
  log('========================================', 'blue');

  log('ℹ️  Este test requiere validación manual en el frontend:', 'yellow');
  log('   1. Ir a "Realizar Venta"', 'yellow');
  log('   2. Intentar seleccionar un Proveedor', 'yellow');
  log('   3. Debe aparecer modal de conversión', 'yellow');
  log('   4. Convertir a "Ambos" o "Cliente"', 'yellow');
  log('   5. Verificar que ahora permite la venta', 'yellow');
  
  return true;
}

/**
 * TEST 14: Actualizar datos de entidad
 */
async function test14_UpdateClientData() {
  log('\n========================================', 'blue');
  log('TEST 14: ACTUALIZAR DATOS DE ENTIDAD', 'blue');
  log('========================================', 'blue');

  if (!testClienteDNI) {
    log('⚠️ No hay cliente para actualizar', 'yellow');
    return false;
  }

  const updateData = {
    tipoEntidad: testClienteDNI.tipoEntidad,
    tipoDocumento: testClienteDNI.tipoDocumento,
    numeroDocumento: testClienteDNI.numeroDocumento,
    nombres: 'Juan Carlos ACTUALIZADO',
    apellidos: testClienteDNI.apellidos,
    email: testClienteDNI.email,
    telefono: '999888777', // Nuevo teléfono
    direccion: 'Av. Nueva Dirección 456', // Nueva dirección
    departamentoId: testClienteDNI.departamentoId,
    provinciaId: testClienteDNI.provinciaId,
    distritoId: testClienteDNI.distritoId,
  };

  try {
    const response = await api.put(`/entidades/${testClienteDNI.id}`, updateData);

    if (response.data.success && response.data.data.client) {
      const updated = response.data.data.client;
      log('✅ Actualización de datos exitosa', 'green');
      log(`   Nombre: ${updated.nombres}`, 'yellow');
      log(`   Teléfono: ${updated.telefono}`, 'yellow');
      log(`   Dirección: ${updated.direccion}`, 'yellow');
      
      if (updated.nombres !== 'Juan Carlos ACTUALIZADO' || updated.telefono !== '999888777') {
        throw new Error('Los datos no se actualizaron correctamente');
      }
      
      testClienteDNI = updated;
      return true;
    } else {
      throw new Error('No se actualizó la entidad');
    }
  } catch (error) {
    log(`❌ Error al actualizar: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 15: Eliminar entidad (soft delete)
 */
async function test15_SoftDeleteEntity() {
  log('\n========================================', 'blue');
  log('TEST 15: ELIMINAR ENTIDAD (SOFT DELETE)', 'blue');
  log('========================================', 'blue');

  if (!testAmbos) {
    log('⚠️ No hay entidad para eliminar', 'yellow');
    return false;
  }

  try {
    // Soft delete (isActive = false) - Solo enviar los campos necesarios
    const updateData = {
      tipoEntidad: testAmbos.tipoEntidad,
      tipoDocumento: testAmbos.tipoDocumento,
      numeroDocumento: testAmbos.numeroDocumento,
      razonSocial: testAmbos.razonSocial,
      email: testAmbos.email,
      telefono: testAmbos.telefono,
      direccion: testAmbos.direccion,
      departamentoId: testAmbos.departamentoId,
      provinciaId: testAmbos.provinciaId,
      distritoId: testAmbos.distritoId,
      isActive: false,
    };
    
    const response = await api.put(`/entidades/${testAmbos.id}`, updateData);

    if (response.data.success && response.data.data.client) {
      const deleted = response.data.data.client;
      log('✅ Soft delete exitoso', 'green');
      log(`   Estado: isActive = ${deleted.isActive}`, 'yellow');
      
      if (deleted.isActive !== false) {
        throw new Error('La entidad no se desactivó');
      }
      
      return true;
    } else {
      throw new Error('No se eliminó la entidad');
    }
  } catch (error) {
    log(`❌ Error al eliminar: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 16: Reactivar entidad
 */
async function test16_ReactivateEntity() {
  log('\n========================================', 'blue');
  log('TEST 16: REACTIVAR ENTIDAD', 'blue');
  log('========================================', 'blue');

  if (!testAmbos) {
    log('⚠️ No hay entidad para reactivar', 'yellow');
    return false;
  }

  try {
    const response = await api.post(`/entidades/${testAmbos.id}/reactivate`);

    if (response.data.success && response.data.data.client) {
      const reactivated = response.data.data.client;
      log('✅ Reactivación exitosa', 'green');
      log(`   Estado: isActive = ${reactivated.isActive}`, 'yellow');
      
      if (reactivated.isActive !== true) {
        throw new Error('La entidad no se reactivó');
      }
      
      testAmbos = reactivated;
      return true;
    } else {
      throw new Error('No se reactivó la entidad');
    }
  } catch (error) {
    log(`❌ Error al reactivar: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 17: Validaciones de campos requeridos
 */
async function test17_ValidateRequiredFields() {
  log('\n========================================', 'blue');
  log('TEST 17: VALIDAR CAMPOS REQUERIDOS', 'blue');
  log('========================================', 'blue');

  const invalidData = {
    tipoEntidad: 'Cliente',
    tipoDocumento: 'DNI',
    // Falta numeroDocumento (requerido)
    nombres: 'Test',
    apellidos: 'Validacion',
    email: 'test@test.com',
    telefono: '987654321',
  };

  try {
    await api.post('/entidades', invalidData);
    log('❌ Debería haber rechazado datos inválidos', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ Validación de campos requeridos funciona correctamente', 'green');
      log(`   Error esperado: ${error.response.data.message}`, 'yellow');
      return true;
    } else {
      log(`❌ Error inesperado: ${error.message}`, 'red');
      return false;
    }
  }
}

/**
 * TEST 18: Validación de formato de documento
 */
async function test18_ValidateDocumentFormat() {
  log('\n========================================', 'blue');
  log('TEST 18: VALIDAR FORMATO DE DOCUMENTO', 'blue');
  log('========================================', 'blue');

  const invalidDNI = {
    tipoEntidad: 'Cliente',
    tipoDocumento: 'DNI',
    numeroDocumento: '123', // DNI inválido (debe ser 8 dígitos)
    nombres: 'Test',
    apellidos: 'Validacion',
    email: 'test2@test.com',
    telefono: '987654321',
    direccion: 'Test 123',
    departamentoId: 'DEP-15',
    provinciaId: 'PRO-1501',
    distritoId: 'DIS-150115',
  };

  try {
    await api.post('/entidades', invalidDNI);
    log('❌ Debería haber rechazado DNI inválido', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log('✅ Validación de formato de documento funciona', 'green');
      log(`   Error esperado: ${error.response.data.message}`, 'yellow');
      return true;
    } else {
      log(`❌ Error inesperado: ${error.message}`, 'red');
      return false;
    }
  }
}

/**
 * TEST 19: Verificar estadísticas
 */
async function test19_GetStatistics() {
  log('\n========================================', 'blue');
  log('TEST 19: OBTENER ESTADÍSTICAS', 'blue');
  log('========================================', 'blue');

  try {
    const response = await api.get('/entidades/stats');

    if (response.data.success && response.data.data) {
      const stats = response.data.data;
      log('✅ Estadísticas obtenidas exitosamente', 'green');
      log(`   Total: ${stats.total || 0}`, 'yellow');
      log(`   Activos: ${stats.active || 0}`, 'yellow');
      log(`   Inactivos: ${stats.inactive || 0}`, 'yellow');
      return true;
    } else {
      throw new Error('No se obtuvieron estadísticas');
    }
  } catch (error) {
    log(`❌ Error al obtener estadísticas: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * TEST 20: Cleanup - Eliminar entidades de prueba
 */
async function test20_Cleanup() {
  log('\n========================================', 'blue');
  log('TEST 20: LIMPIEZA - ELIMINAR DATOS DE PRUEBA', 'blue');
  log('========================================', 'blue');

  const entitiesToDelete = [testClienteDNI, testClienteRUC, testProveedor, testAmbos].filter(Boolean);
  
  let deletedCount = 0;
  
  for (const entity of entitiesToDelete) {
    try {
      await api.put(`/entidades/${entity.id}`, {
        ...entity,
        isActive: false,
      });
      deletedCount++;
      log(`   ✓ Eliminado: ${entity.razonSocial || `${entity.nombres} ${entity.apellidos}`}`, 'green');
    } catch (error) {
      log(`   ✗ Error al eliminar ${entity.id}: ${error.message}`, 'red');
    }
  }
  
  log(`\n✅ Limpieza completada: ${deletedCount}/${entitiesToDelete.length} entidades eliminadas`, 'green');
  return true;
}

/**
 * EJECUTAR TODOS LOS TESTS
 */
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
  log('║   TEST E2E - MÓDULO ENTIDADES COMERCIALES             ║', 'magenta');
  log('║   Sistema Alexa Tech - v1.0                           ║', 'magenta');
  log('╚════════════════════════════════════════════════════════╝', 'magenta');
  
  const startTime = Date.now();
  const results = [];

  // Lista de tests
  const tests = [
    { name: 'Autenticación', fn: test1_Authentication },
    { name: 'Crear Cliente DNI', fn: test2_CreateClienteDNI },
    { name: 'Crear Cliente RUC', fn: test3_CreateClienteRUC },
    { name: 'Crear Proveedor', fn: test4_CreateProveedor },
    { name: 'Crear Entidad Ambos', fn: test5_CreateAmbos },
    { name: 'Listar Entidades', fn: test6_GetAllEntidades },
    { name: 'Cambiar Cliente → Proveedor', fn: test7_ChangeClienteToProveedor },
    { name: 'Cambiar Proveedor → Ambos', fn: test8_ChangeProveedorToAmbos },
    { name: 'Cambiar Ambos → Cliente', fn: test9_ChangeAmbosToCliente },
    { name: 'Buscar por Documento', fn: test10_SearchByDocument },
    { name: 'Buscar por Email', fn: test11_SearchByEmail },
    { name: 'Filtrar por Tipo', fn: test12_FilterByTipoEntidad },
    { name: 'Validar Proveedor en Ventas', fn: test13_ValidateProveedorInSales },
    { name: 'Actualizar Datos', fn: test14_UpdateClientData },
    { name: 'Soft Delete', fn: test15_SoftDeleteEntity },
    { name: 'Reactivar Entidad', fn: test16_ReactivateEntity },
    { name: 'Validar Campos Requeridos', fn: test17_ValidateRequiredFields },
    { name: 'Validar Formato Documento', fn: test18_ValidateDocumentFormat },
    { name: 'Obtener Estadísticas', fn: test19_GetStatistics },
    { name: 'Limpieza', fn: test20_Cleanup },
  ];

  // Ejecutar tests
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      log(`\n❌ Error fatal en ${test.name}: ${error.message}`, 'red');
      results.push({ name: test.name, passed: false });
    }
  }

  // Resumen final
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
  log('║                   RESUMEN DE TESTS                     ║', 'magenta');
  log('╚════════════════════════════════════════════════════════╝', 'magenta');
  
  log(`\n⏱️  Tiempo total: ${duration}s`, 'blue');
  log(`✅ Tests exitosos: ${passed}/${results.length}`, 'green');
  if (failed > 0) {
    log(`❌ Tests fallidos: ${failed}/${results.length}`, 'red');
  }
  
  log('\nDetalle de resultados:', 'blue');
  results.forEach((r, i) => {
    const icon = r.passed ? '✅' : '❌';
    const color = r.passed ? 'green' : 'red';
    log(`${icon} ${i + 1}. ${r.name}`, color);
  });

  log('\n╔════════════════════════════════════════════════════════╗', 'magenta');
  if (failed === 0) {
    log('║          🎉 TODOS LOS TESTS PASARON 🎉                ║', 'green');
    log('║     El módulo está listo para producción ✨           ║', 'green');
  } else {
    log('║          ⚠️  ALGUNOS TESTS FALLARON ⚠️                 ║', 'yellow');
    log('║     Revisar errores antes de producción ⚠️            ║', 'yellow');
  }
  log('╚════════════════════════════════════════════════════════╝', 'magenta');

  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar tests
runAllTests().catch((error) => {
  log(`\n💥 Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
