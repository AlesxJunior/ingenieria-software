/**
 * TEST E2E: Sistema de Transferencias entre Almacenes
 * 
 * Valida el flujo completo de transferencias:
 * 1. Crear transferencia PENDIENTE
 * 2. Aprobar transferencia (movimientos atómicos)
 * 3. Verificar stock actualizado en ambos almacenes
 * 4. Intentar cancelar transferencia RECIBIDA (debe fallar)
 * 5. Cancelar transferencia PENDIENTE
 */

import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:3001/api';

let authToken = '';
let testProductId = '';
let warehousePrincipalId = '';
let warehouseSecundarioId = '';
let transferIdPendiente = '';
let transferIdAprobada = '';

// ============================================
// HELPERS
// ============================================

async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@alexatech.com',
      password: 'admin123'
    });
    authToken = response.data.data.accessToken;
    console.log('✅ Login exitoso\n');
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    process.exit(1);
  }
}

function formatStock(stock) {
  return {
    codigo: stock.codigo,
    nombre: stock.nombre,
    almacen: stock.almacen,
    cantidad: stock.cantidad
  };
}

// ============================================
// TESTS
// ============================================

async function test1_PrepararDatos() {
  console.log('📋 TEST 1: Preparar datos de prueba');
  console.log('─'.repeat(60));

  try {
    // Obtener producto de prueba
    const productsRes = await axios.get(`${API_URL}/products`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 1 }
    });

    const productos = productsRes.data.data?.products || productsRes.data.data?.rows || productsRes.data.data || [];
    
    if (productos.length === 0) {
      throw new Error('No hay productos en la base de datos');
    }

    const producto = productos[0];
    if (!producto || !producto.id) {
      console.log('Producto recibido:', producto);
      throw new Error('Producto inválido o sin ID');
    }

    testProductId = producto.id;
    console.log(`✅ Producto: ${producto.codigo} - ${producto.nombre}`);

    // Obtener almacenes
    const warehousesRes = await axios.get(`http://localhost:3001/api/warehouses`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    // Manejar estructura de respuesta (puede ser .rows o .warehouses)
    const almacenes = warehousesRes.data.data?.rows 
      || warehousesRes.data.data?.warehouses 
      || warehousesRes.data.data 
      || [];
    
    if (almacenes.length === 0) {
      throw new Error('No hay almacenes en la base de datos');
    }

    const principal = almacenes.find(a => a.codigo === 'WH-PRINCIPAL');
    const secundario = almacenes.find(a => a.codigo === 'WH-SECUNDARIO');

    if (!principal || !secundario) {
      console.log('Almacenes disponibles:', almacenes.map(a => a.codigo).join(', '));
      throw new Error('No se encontraron los almacenes WH-PRINCIPAL o WH-SECUNDARIO');
    }

    warehousePrincipalId = principal.id;
    warehouseSecundarioId = secundario.id;

    console.log(`✅ Almacén Principal: ${principal.nombre} (${principal.id})`);
    console.log(`✅ Almacén Secundario: ${secundario.nombre} (${secundario.id})`);

    // Asegurar que haya stock en almacén principal
    const stockRes = await axios.get(`${API_URL}/inventory/stock`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: {
        productId: testProductId,
        almacenId: warehousePrincipalId
      }
    });

    const stockActual = stockRes.data.data.rows[0];
    
    if (!stockActual || stockActual.cantidad < 50) {
      console.log(`⚠️  Stock insuficiente (${stockActual?.cantidad || 0}), ajustando...`);
      
      await axios.post(
        `${API_URL}/inventory/ajustes`,
        {
          productId: testProductId,
          warehouseId: warehousePrincipalId,
          tipo: 'ENTRADA',
          cantidad: 100,
          motivo: 'Preparación para test de transferencias'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      console.log('✅ Stock ajustado a 100+ unidades');
    } else {
      console.log(`✅ Stock disponible: ${stockActual.cantidad} unidades`);
    }

    console.log('\n✨ Datos preparados correctamente\n');
  } catch (error) {
    console.error('❌ Error preparando datos:', error.response?.data || error.message);
    throw error;
  }
}

async function test2_CrearTransferenciaPendiente() {
  console.log('📋 TEST 2: Crear transferencia PENDIENTE');
  console.log('─'.repeat(60));

  try {
    const response = await axios.post(
      `${API_URL}/inventory/transfers`,
      {
        productId: testProductId,
        cantidad: 20,
        warehouseFromId: warehousePrincipalId,
        warehouseToId: warehouseSecundarioId,
        motivoTransferencia: 'Test E2E - Transferencia de prueba',
        observaciones: 'Creada desde test automatizado'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const transferencia = response.data.data;
    transferIdPendiente = transferencia.id;

    console.log('✅ Transferencia creada exitosamente');
    console.log(`   - Código: ${transferencia.codigo}`);
    console.log(`   - Estado: ${transferencia.estado}`);
    console.log(`   - Producto: ${transferencia.product.nombre}`);
    console.log(`   - Cantidad: ${transferencia.cantidad}`);
    console.log(`   - Origen: ${transferencia.warehouseFrom.nombre}`);
    console.log(`   - Destino: ${transferencia.warehouseTo.nombre}`);
    console.log(`   - Solicitante: ${transferencia.solicitante.firstName} ${transferencia.solicitante.lastName}`);

    // Verificar que el estado es PENDIENTE
    if (transferencia.estado !== 'PENDIENTE') {
      throw new Error(`Estado incorrecto. Esperado: PENDIENTE, Recibido: ${transferencia.estado}`);
    }

    console.log('\n✨ Test superado: Transferencia PENDIENTE creada\n');
  } catch (error) {
    console.error('❌ Error creando transferencia:', error.response?.data || error.message);
    throw error;
  }
}

async function test3_AprobarTransferencia() {
  console.log('📋 TEST 3: Aprobar transferencia (transacción atómica)');
  console.log('─'.repeat(60));

  try {
    // Obtener stock ANTES de aprobar
    const [stockOrigenAntes, stockDestinoAntes] = await Promise.all([
      axios.get(`${API_URL}/inventory/stock`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { productId: testProductId, almacenId: warehousePrincipalId }
      }),
      axios.get(`${API_URL}/inventory/stock`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { productId: testProductId, almacenId: warehouseSecundarioId }
      })
    ]);

    const stockOrigenAntesCant = stockOrigenAntes.data.data.rows[0]?.cantidad || 0;
    const stockDestinoAntesCant = stockDestinoAntes.data.data.rows[0]?.cantidad || 0;

    console.log('📊 Stock ANTES de aprobar:');
    console.log(`   - Principal: ${stockOrigenAntesCant} unidades`);
    console.log(`   - Secundario: ${stockDestinoAntesCant} unidades`);

    // Aprobar transferencia
    const response = await axios.put(
      `${API_URL}/inventory/transfers/${transferIdPendiente}/aprobar`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const transferencia = response.data.data;
    transferIdAprobada = transferencia.id;

    console.log('\n✅ Transferencia aprobada y ejecutada');
    console.log(`   - Estado: ${transferencia.estado}`);
    console.log(`   - Aprobado por: ${transferencia.aprobador.firstName} ${transferencia.aprobador.lastName}`);
    console.log(`   - Recibido por: ${transferencia.receptor.firstName} ${transferencia.receptor.lastName}`);

    // Verificar que el estado es RECIBIDO
    if (transferencia.estado !== 'RECIBIDO') {
      throw new Error(`Estado incorrecto. Esperado: RECIBIDO, Recibido: ${transferencia.estado}`);
    }

    // Obtener stock DESPUÉS de aprobar
    const [stockOrigenDespues, stockDestinoDespues] = await Promise.all([
      axios.get(`${API_URL}/inventory/stock`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { productId: testProductId, almacenId: warehousePrincipalId }
      }),
      axios.get(`${API_URL}/inventory/stock`, {
        headers: { Authorization: `Bearer ${authToken}` },
        params: { productId: testProductId, almacenId: warehouseSecundarioId }
      })
    ]);

    const stockOrigenDespuesCant = stockOrigenDespues.data.data.rows[0]?.cantidad || 0;
    const stockDestinoDespuesCant = stockDestinoDespues.data.data.rows[0]?.cantidad || 0;

    console.log('\n📊 Stock DESPUÉS de aprobar:');
    console.log(`   - Principal: ${stockOrigenDespuesCant} unidades (${stockOrigenAntesCant - stockOrigenDespuesCant} menos)`);
    console.log(`   - Secundario: ${stockDestinoDespuesCant} unidades (+${stockDestinoDespuesCant - stockDestinoAntesCant} más)`);

    // Validar que el stock se actualizó correctamente
    if (stockOrigenDespuesCant !== stockOrigenAntesCant - 20) {
      throw new Error(
        `Stock origen incorrecto. ` +
        `Esperado: ${stockOrigenAntesCant - 20}, Recibido: ${stockOrigenDespuesCant}`
      );
    }

    if (stockDestinoDespuesCant !== stockDestinoAntesCant + 20) {
      throw new Error(
        `Stock destino incorrecto. ` +
        `Esperado: ${stockDestinoAntesCant + 20}, Recibido: ${stockDestinoDespuesCant}`
      );
    }

    // Verificar movimientos de inventario
    const kardexRes = await axios.get(`${API_URL}/inventory/kardex`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { productId: testProductId, pageSize: 10 }
    });

    const movimientos = kardexRes.data.data.rows;
    
    console.log('\n📋 Verificando movimientos en kardex...');
    console.log(`   Total movimientos encontrados: ${movimientos.length}`);
    
    // Buscar movimientos recientes de transferencia por documentoReferencia
    const movimientoSalida = movimientos.find(m => 
      m.tipo === 'SALIDA' && 
      m.documentoReferencia?.includes('TRF-')
    );
    const movimientoEntrada = movimientos.find(m => 
      m.tipo === 'ENTRADA' && 
      m.documentoReferencia?.includes('TRF-')
    );

    if (!movimientoEntrada || !movimientoSalida) {
      console.log('Movimientos encontrados:', movimientos.slice(0, 5).map(m => ({
        tipo: m.tipo,
        almacen: m.almacen,
        cantidad: m.cantidad,
        ref: m.documentoReferencia,
        motivo: m.motivo
      })));
      throw new Error('No se encontraron los movimientos SALIDA/ENTRADA en el kardex');
    }

    console.log('✅ Movimientos de inventario creados:');
    console.log(`   - SALIDA: ${movimientoSalida.almacen} (${movimientoSalida.cantidad} unidades) - ${movimientoSalida.documentoReferencia}`);
    console.log(`   - ENTRADA: ${movimientoEntrada.almacen} (${movimientoEntrada.cantidad} unidades) - ${movimientoEntrada.documentoReferencia}`);

    console.log('\n✨ Test superado: Transacción atómica ejecutada correctamente\n');
  } catch (error) {
    console.error('❌ Error aprobando transferencia:', error.response?.data || error.message);
    throw error;
  }
}

async function test4_IntentarCancelarAprobada() {
  console.log('📋 TEST 4: Intentar cancelar transferencia RECIBIDA (debe fallar)');
  console.log('─'.repeat(60));

  try {
    await axios.put(
      `${API_URL}/inventory/transfers/${transferIdAprobada}/cancelar`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    // Si llegamos aquí, el test FALLÓ (debería haber lanzado error)
    console.error('❌ TEST FALLIDO: Se pudo cancelar una transferencia RECIBIDA');
    throw new Error('No se debería poder cancelar una transferencia RECIBIDA');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Error esperado recibido:');
      console.log(`   "${error.response.data.message}"`);
      console.log('\n✨ Test superado: No se puede cancelar transferencia RECIBIDA\n');
    } else {
      console.error('❌ Error inesperado:', error.response?.data || error.message);
      throw error;
    }
  }
}

async function test5_CancelarTransferenciaPendiente() {
  console.log('📋 TEST 5: Cancelar transferencia PENDIENTE');
  console.log('─'.repeat(60));

  try {
    // Crear nueva transferencia para cancelar
    const createRes = await axios.post(
      `${API_URL}/inventory/transfers`,
      {
        productId: testProductId,
        cantidad: 10,
        warehouseFromId: warehousePrincipalId,
        warehouseToId: warehouseSecundarioId,
        motivoTransferencia: 'Test E2E - Para cancelar'
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const transferenciaNueva = createRes.data.data;
    console.log(`✅ Transferencia creada: ${transferenciaNueva.codigo}`);

    // Cancelar transferencia
    const cancelRes = await axios.put(
      `${API_URL}/inventory/transfers/${transferenciaNueva.id}/cancelar`,
      {},
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    const transferenciaCancelada = cancelRes.data.data;

    console.log('✅ Transferencia cancelada exitosamente');
    console.log(`   - Código: ${transferenciaCancelada.codigo}`);
    console.log(`   - Estado: ${transferenciaCancelada.estado}`);

    // Verificar que el estado es CANCELADO
    if (transferenciaCancelada.estado !== 'CANCELADO') {
      throw new Error(
        `Estado incorrecto. Esperado: CANCELADO, Recibido: ${transferenciaCancelada.estado}`
      );
    }

    console.log('\n✨ Test superado: Transferencia PENDIENTE cancelada correctamente\n');
  } catch (error) {
    console.error('❌ Error cancelando transferencia:', error.response?.data || error.message);
    throw error;
  }
}

async function test6_ListarTransferencias() {
  console.log('📋 TEST 6: Listar transferencias con filtros');
  console.log('─'.repeat(60));

  try {
    // Listar todas
    const todasRes = await axios.get(`${API_URL}/inventory/transfers`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { limit: 10 }
    });

    console.log(`✅ Total de transferencias: ${todasRes.data.data.total}`);

    // Filtrar por estado RECIBIDO
    const recibidasRes = await axios.get(`${API_URL}/inventory/transfers`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { estado: 'RECIBIDO' }
    });

    console.log(`✅ Transferencias RECIBIDAS: ${recibidasRes.data.data.total}`);

    // Filtrar por estado CANCELADO
    const canceladasRes = await axios.get(`${API_URL}/inventory/transfers`, {
      headers: { Authorization: `Bearer ${authToken}` },
      params: { estado: 'CANCELADO' }
    });

    console.log(`✅ Transferencias CANCELADAS: ${canceladasRes.data.data.total}`);

    console.log('\n✨ Test superado: Filtros funcionando correctamente\n');
  } catch (error) {
    console.error('❌ Error listando transferencias:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// EJECUTAR TODOS LOS TESTS
// ============================================

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 TEST E2E: Sistema de Transferencias entre Almacenes');
  console.log('='.repeat(60) + '\n');

  try {
    await login();
    await test1_PrepararDatos();
    await test2_CrearTransferenciaPendiente();
    await test3_AprobarTransferencia();
    await test4_IntentarCancelarAprobada();
    await test5_CancelarTransferenciaPendiente();
    await test6_ListarTransferencias();

    console.log('='.repeat(60));
    console.log('✅ TODOS LOS TESTS PASARON EXITOSAMENTE');
    console.log('='.repeat(60) + '\n');

    console.log('📊 Resumen:');
    console.log('   ✓ Crear transferencia PENDIENTE');
    console.log('   ✓ Aprobar transferencia (transacción atómica)');
    console.log('   ✓ Verificar stock actualizado correctamente');
    console.log('   ✓ Validar que no se puede cancelar transferencia RECIBIDA');
    console.log('   ✓ Cancelar transferencia PENDIENTE');
    console.log('   ✓ Listar con filtros\n');

    process.exit(0);
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ TESTS FALLARON');
    console.log('='.repeat(60) + '\n');
    process.exit(1);
  }
}

// Ejecutar
runAllTests();
