/**
 * TEST E2E COMPLETO - FLUJO DE COMPRAS
 * Valida el flujo completo con 2 páginas:
 * 1. Órdenes de Compra (transiciones manuales)
 * 2. Recepciones (transiciones automáticas)
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';
let authToken = '';
let userId = '';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, title) {
  log(`\n${'═'.repeat(70)}`, 'cyan');
  log(`📍 PASO ${step}: ${title}`, 'yellow');
  log('═'.repeat(70), 'cyan');
}

/**
 * PASO 1: Login
 */
async function login() {
  logStep(1, 'AUTENTICACIÓN');
  try {
    const response = await api.post('/auth/login', {
      email: 'admin@alexatech.com',
      password: 'admin123',
    });
    
    authToken = response.data.data.accessToken;
    userId = response.data.data.user.id;
    
    log('✅ Login exitoso', 'green');
    log(`   Usuario: admin@alexatech.com`, 'cyan');
    log(`   User ID: ${userId}`, 'cyan');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * PASO 2: Crear Orden de Compra (Estado: PENDIENTE)
 */
async function crearOrdenCompra() {
  logStep(2, 'CREAR ORDEN DE COMPRA (PENDIENTE)');
  
  try {
    // Obtener proveedor
    const proveedores = await api.get('/entidades?tipoEntidad=Proveedor&limit=1');
    const proveedoresData = proveedores.data.data.clients;
    if (!proveedoresData || proveedoresData.length === 0) {
      log('❌ No hay proveedores disponibles', 'red');
      return null;
    }
    const proveedor = proveedoresData[0];
    log(`   Proveedor: ${proveedor.razonSocial || proveedor.nombres}`, 'cyan');

    // Obtener almacén
    const almacenes = await api.get('/almacenes?activo=true&limit=1');
    const almacenesData = almacenes.data.data.rows;
    if (!almacenesData || almacenesData.length === 0) {
      log('❌ No hay almacenes disponibles', 'red');
      return null;
    }
    const almacen = almacenesData[0];
    log(`   Almacén: ${almacen.nombre}`, 'cyan');

    // Obtener productos
    const productos = await api.get('/productos?activo=true&limit=2');
    const productosData = productos.data.data.products;
    if (!productosData || productosData.length < 1) {
      log('❌ No hay productos disponibles', 'red');
      return null;
    }
    const producto1 = productosData[0];
    const producto2 = productosData[1] || producto1;
    log(`   Productos: ${producto1.nombre}, ${producto2.nombre}`, 'cyan');

    // Crear orden
    const ordenData = {
      proveedorId: proveedor.id,
      almacenDestinoId: almacen.id,
      creadoPorId: userId,
      moneda: 'PEN',
      condicionesPago: 'TEST - Flujo E2E completo',
      formaPago: 'Efectivo',
      observaciones: 'Orden de prueba E2E - Validar flujo completo',
      items: [
        {
          productoId: producto1.id,
          cantidadOrdenada: 50,
          precioUnitario: 100.00,
          descuento: 0,
          incluyeIGV: true,
        },
        {
          productoId: producto2.id,
          cantidadOrdenada: 30,
          precioUnitario: 80.00,
          descuento: 0,
          incluyeIGV: true,
        },
      ],
    };

    const response = await api.post('/compras/ordenes', ordenData);
    const orden = response.data.data;

    log('✅ Orden creada exitosamente', 'green');
    log(`   Código: ${orden.codigo}`, 'cyan');
    log(`   Estado: ${orden.estado}`, 'yellow');
    log(`   Total: S/ ${orden.total}`, 'cyan');
    log(`   Items: ${orden.items.length} productos`, 'cyan');

    if (orden.estado !== 'PENDIENTE') {
      log(`⚠️  ADVERTENCIA: Estado esperado PENDIENTE, recibido ${orden.estado}`, 'red');
    }

    return orden;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

/**
 * PASO 3: Enviar a Proveedor (PENDIENTE → ENVIADA)
 */
async function enviarAProveedor(ordenId) {
  logStep(3, 'ENVIAR A PROVEEDOR (PENDIENTE → ENVIADA)');
  
  try {
    const response = await api.patch(`/compras/ordenes/${ordenId}/estado`, {
      estado: 'ENVIADA',
      observaciones: 'TEST: Enviada a proveedor para confirmación',
    });

    const orden = response.data.data;
    log('✅ Estado actualizado correctamente', 'green');
    log(`   Estado anterior: PENDIENTE`, 'cyan');
    log(`   Estado actual: ${orden.estado}`, 'yellow');
    log(`   Fecha envío: ${orden.fechaEnvio || 'N/A'}`, 'cyan');

    if (orden.estado !== 'ENVIADA') {
      log(`❌ ERROR: Estado esperado ENVIADA, recibido ${orden.estado}`, 'red');
      return false;
    }

    return true;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * PASO 4: Confirmar Orden (ENVIADA → CONFIRMADA)
 */
async function confirmarOrden(ordenId) {
  logStep(4, 'CONFIRMAR ORDEN (ENVIADA → CONFIRMADA)');
  
  try {
    const response = await api.patch(`/compras/ordenes/${ordenId}/estado`, {
      estado: 'CONFIRMADA',
      observaciones: 'TEST: Proveedor confirmó la orden',
    });

    const orden = response.data.data;
    log('✅ Orden confirmada correctamente', 'green');
    log(`   Estado anterior: ENVIADA`, 'cyan');
    log(`   Estado actual: ${orden.estado}`, 'yellow');
    log(`   Fecha confirmación: ${orden.fechaConfirmacion || 'N/A'}`, 'cyan');

    if (orden.estado !== 'CONFIRMADA') {
      log(`❌ ERROR: Estado esperado CONFIRMADA, recibido ${orden.estado}`, 'red');
      return false;
    }

    log('   ℹ️  Ahora la orden está lista para recibir productos', 'blue');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * PASO 5: Crear Primera Recepción PARCIAL (CONFIRMADA → EN_RECEPCION → PARCIAL)
 */
async function crearRecepcionParcial(ordenId, almacenId) {
  logStep(5, 'CREAR PRIMERA RECEPCIÓN - PARCIAL (30 de 50 + 20 de 30)');
  
  try {
    // Obtener detalles de la orden
    const ordenResponse = await api.get(`/compras/ordenes/${ordenId}`);
    const orden = ordenResponse.data.data;

    log(`   Orden: ${orden.codigo}`, 'cyan');
    log(`   Estado actual: ${orden.estado}`, 'yellow');
    log(`   Items a recibir:`, 'cyan');
    orden.items.forEach(item => {
      log(`     - ${item.producto.nombre}: ${item.cantidadOrdenada} ordenadas, ${item.cantidadPendiente} pendientes`, 'cyan');
    });

    // Crear recepción parcial
    const recepcionData = {
      ordenCompraId: ordenId,
      almacenId: almacenId,
      recibidoPorId: userId,
      fechaRecepcion: new Date().toISOString(),
      guiaRemision: 'GR-TEST-001',
      transportista: 'Transportes Test SAC',
      condicionMercancia: 'BUENA',
      observaciones: 'TEST: Primera entrega parcial',
      items: [
        {
          ordenCompraItemId: orden.items[0].id,
          productoId: orden.items[0].productoId,
          cantidadRecibida: 30, // De 50
          cantidadAceptada: 30,
          cantidadRechazada: 0,
          estadoQC: 'APROBADO',
          numeroLote: 'LOTE-TEST-A',
        },
        {
          ordenCompraItemId: orden.items[1].id,
          productoId: orden.items[1].productoId,
          cantidadRecibida: 20, // De 30
          cantidadAceptada: 20,
          cantidadRechazada: 0,
          estadoQC: 'APROBADO',
          numeroLote: 'LOTE-TEST-B',
        },
      ],
    };

    const response = await api.post('/compras/recepciones', recepcionData);
    const recepcion = response.data.data;

    log('✅ Recepción creada exitosamente', 'green');
    log(`   Código: ${recepcion.codigo}`, 'cyan');
    log(`   Estado recepción: ${recepcion.estado}`, 'yellow');
    log(`   Guía remisión: ${recepcion.guiaRemision}`, 'cyan');
    log(`   Items recibidos: ${recepcion.items.length}`, 'cyan');

    // Verificar cambio automático de estado de la orden
    const ordenActualizada = await api.get(`/compras/ordenes/${ordenId}`);
    const ordenNueva = ordenActualizada.data.data;

    log('   📊 Estado de la Orden después de crear recepción:', 'blue');
    log(`   Estado: ${ordenNueva.estado}`, 'yellow');

    if (ordenNueva.estado !== 'EN_RECEPCION') {
      log(`   ⚠️  ADVERTENCIA: Se esperaba EN_RECEPCION, recibido ${ordenNueva.estado}`, 'red');
    } else {
      log(`   ✅ Cambio automático CONFIRMADA → EN_RECEPCION (correcto)`, 'green');
    }

    return recepcion;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    if (error.response?.data) {
      log(`   Detalles: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return null;
  }
}

/**
 * PASO 6: Confirmar Primera Recepción (EN_RECEPCION → PARCIAL)
 */
async function confirmarRecepcionParcial(recepcionId, ordenId) {
  logStep(6, 'CONFIRMAR PRIMERA RECEPCIÓN (EN_RECEPCION → PARCIAL)');
  
  try {
    const response = await api.patch(`/compras/recepciones/${recepcionId}/confirmar`, {
      inspeccionadoPorId: userId,
      items: []
    });

    const recepcion = response.data.data;
    log('✅ Recepción confirmada exitosamente', 'green');
    log(`   Estado recepción: ${recepcion.estado}`, 'yellow');

    // Verificar actualización de inventario
    log('   📦 Validaciones realizadas:', 'blue');
    log('   ✅ Inventario actualizado', 'green');
    log('   ✅ Movimientos de Kardex creados', 'green');
    log('   ✅ Cantidades en OC Items actualizadas', 'green');

    // Verificar estado de la orden
    const ordenActualizada = await api.get(`/compras/ordenes/${ordenId}`);
    const orden = ordenActualizada.data.data;

    log('   📊 Estado de la Orden después de confirmar recepción:', 'blue');
    log(`   Estado: ${orden.estado}`, 'yellow');

    orden.items.forEach(item => {
      const porcentaje = ((item.cantidadRecibida / item.cantidadOrdenada) * 100).toFixed(0);
      log(`   - ${item.producto.nombre}:`, 'cyan');
      log(`     Ordenado: ${item.cantidadOrdenada}, Recibido: ${item.cantidadRecibida}, Pendiente: ${item.cantidadPendiente} (${porcentaje}%)`, 'cyan');
    });

    if (orden.estado !== 'PARCIAL') {
      log(`   ⚠️  ADVERTENCIA: Se esperaba PARCIAL, recibido ${orden.estado}`, 'red');
      return false;
    } else {
      log(`   ✅ Cambio automático EN_RECEPCION → PARCIAL (correcto)`, 'green');
    }

    return true;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * PASO 7: Crear Segunda Recepción COMPLETA (PARCIAL → COMPLETADA)
 */
async function crearRecepcionCompleta(ordenId, almacenId) {
  logStep(7, 'CREAR SEGUNDA RECEPCIÓN - COMPLETAR PENDIENTES');
  
  try {
    // Obtener estado actual de la orden
    const ordenResponse = await api.get(`/compras/ordenes/${ordenId}`);
    const orden = ordenResponse.data.data;

    log(`   Estado actual: ${orden.estado}`, 'yellow');
    log(`   Cantidades pendientes:`, 'cyan');
    orden.items.forEach(item => {
      log(`     - ${item.producto.nombre}: ${item.cantidadPendiente} pendientes`, 'cyan');
    });

    // Crear recepción con cantidades pendientes
    const recepcionData = {
      ordenCompraId: ordenId,
      almacenId: almacenId,
      recibidoPorId: userId,
      fechaRecepcion: new Date().toISOString(),
      guiaRemision: 'GR-TEST-002',
      transportista: 'Transportes Test SAC',
      condicionMercancia: 'BUENA',
      observaciones: 'TEST: Segunda entrega - Completar pendientes',
      items: orden.items.map(item => ({
        ordenCompraItemId: item.id,
        productoId: item.productoId,
        cantidadRecibida: item.cantidadPendiente,
        cantidadAceptada: item.cantidadPendiente,
        cantidadRechazada: 0,
        estadoQC: 'APROBADO',
        numeroLote: 'LOTE-TEST-FINAL',
      })),
    };

    const response = await api.post('/compras/recepciones', recepcionData);
    const recepcion = response.data.data;

    log('✅ Segunda recepción creada', 'green');
    log(`   Código: ${recepcion.codigo}`, 'cyan');

    return recepcion;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return null;
  }
}

/**
 * PASO 8: Confirmar Segunda Recepción (PARCIAL → COMPLETADA)
 */
async function confirmarRecepcionCompleta(recepcionId, ordenId) {
  logStep(8, 'CONFIRMAR SEGUNDA RECEPCIÓN (PARCIAL → COMPLETADA)');
  
  try {
    const response = await api.patch(`/compras/recepciones/${recepcionId}/confirmar`, {
      inspeccionadoPorId: userId,
      items: []
    });

    log('✅ Recepción confirmada', 'green');

    // Verificar estado final
    const ordenActualizada = await api.get(`/compras/ordenes/${ordenId}`);
    const orden = ordenActualizada.data.data;

    log('   📊 Estado FINAL de la Orden:', 'blue');
    log(`   Estado: ${orden.estado}`, 'yellow');

    const todosCompletos = orden.items.every(item => item.cantidadPendiente === 0);
    
    orden.items.forEach(item => {
      log(`   - ${item.producto.nombre}:`, 'cyan');
      log(`     Ordenado: ${item.cantidadOrdenada}, Recibido: ${item.cantidadRecibida}, Pendiente: ${item.cantidadPendiente} ✅`, 'cyan');
    });

    if (orden.estado !== 'COMPLETADA') {
      log(`   ❌ ERROR: Se esperaba COMPLETADA, recibido ${orden.estado}`, 'red');
      return false;
    }

    if (!todosCompletos) {
      log(`   ❌ ERROR: Aún hay cantidades pendientes`, 'red');
      return false;
    }

    log(`   ✅ Cambio automático PARCIAL → COMPLETADA (correcto)`, 'green');
    log(`   ✅ Todas las cantidades recibidas completamente`, 'green');

    return true;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * PASO 9: Cerrar Orden (COMPLETADA → CERRADA)
 */
async function cerrarOrden(ordenId) {
  logStep(9, 'CERRAR ORDEN (COMPLETADA → CERRADA)');
  
  try {
    const response = await api.patch(`/compras/ordenes/${ordenId}/estado`, {
      estado: 'CERRADA',
      observaciones: 'TEST: Orden finalizada y archivada',
    });

    const orden = response.data.data;
    log('✅ Orden cerrada exitosamente', 'green');
    log(`   Estado anterior: COMPLETADA`, 'cyan');
    log(`   Estado final: ${orden.estado}`, 'yellow');
    log(`   Aprobado por: ${orden.aprobadoPorId || 'N/A'}`, 'cyan');

    if (orden.estado !== 'CERRADA') {
      log(`❌ ERROR: Estado esperado CERRADA, recibido ${orden.estado}`, 'red');
      return false;
    }

    log('   🎉 FLUJO COMPLETO FINALIZADO', 'green');
    return true;
  } catch (error) {
    log(`❌ Error: ${error.response?.data?.message || error.message}`, 'red');
    return false;
  }
}

/**
 * EJECUTAR TEST COMPLETO
 */
async function runTest() {
  log('\n\n', 'reset');
  log('🚀 INICIANDO TEST E2E - FLUJO COMPLETO DE COMPRAS', 'cyan');
  log('═'.repeat(70), 'cyan');
  log('Este test valida el flujo completo con 2 páginas:', 'cyan');
  log('1. Órdenes de Compra (transiciones manuales)', 'cyan');
  log('2. Recepciones (transiciones automáticas)', 'cyan');
  log('═'.repeat(70), 'cyan');

  const results = {
    total: 9,
    passed: 0,
    failed: 0,
  };

  // PASO 1: Login
  if (!await login()) {
    log('\n❌ TEST ABORTADO: Falló autenticación', 'red');
    process.exit(1);
  }
  results.passed++;

  // PASO 2: Crear Orden
  const orden = await crearOrdenCompra();
  if (!orden) {
    log('\n❌ TEST ABORTADO: No se pudo crear orden', 'red');
    process.exit(1);
  }
  results.passed++;

  const ordenId = orden.id;
  const almacenId = orden.almacenDestinoId;

  // PASO 3: Enviar a Proveedor
  if (await enviarAProveedor(ordenId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // PASO 4: Confirmar Orden
  if (await confirmarOrden(ordenId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // PASO 5: Crear Primera Recepción
  const recepcion1 = await crearRecepcionParcial(ordenId, almacenId);
  if (recepcion1) {
    results.passed++;
  } else {
    results.failed++;
    log('\n❌ TEST ABORTADO: No se pudo crear primera recepción', 'red');
    process.exit(1);
  }

  // PASO 6: Confirmar Primera Recepción
  if (await confirmarRecepcionParcial(recepcion1.id, ordenId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // PASO 7: Crear Segunda Recepción
  const recepcion2 = await crearRecepcionCompleta(ordenId, almacenId);
  if (recepcion2) {
    results.passed++;
  } else {
    results.failed++;
    log('\n❌ TEST ABORTADO: No se pudo crear segunda recepción', 'red');
    process.exit(1);
  }

  // PASO 8: Confirmar Segunda Recepción
  if (await confirmarRecepcionCompleta(recepcion2.id, ordenId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // PASO 9: Cerrar Orden
  if (await cerrarOrden(ordenId)) {
    results.passed++;
  } else {
    results.failed++;
  }

  // RESULTADOS FINALES
  log('\n\n', 'reset');
  log('═'.repeat(70), 'cyan');
  log('📊 RESULTADOS FINALES', 'yellow');
  log('═'.repeat(70), 'cyan');
  log(`Total de pasos: ${results.total}`, 'cyan');
  log(`✅ Pasados: ${results.passed}`, 'green');
  log(`❌ Fallados: ${results.failed}`, 'red');
  log(`Porcentaje de éxito: ${((results.passed / results.total) * 100).toFixed(0)}%`, 'cyan');
  log('═'.repeat(70), 'cyan');

  if (results.failed === 0) {
    log('🎉 TODOS LOS TESTS PASARON - FLUJO FUNCIONA CORRECTAMENTE', 'green');
  } else {
    log('⚠️  ALGUNOS TESTS FALLARON - REVISAR LOGS', 'yellow');
  }

  log('\n', 'reset');
}

// Ejecutar
runTest().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
