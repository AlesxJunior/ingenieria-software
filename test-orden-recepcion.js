/**
 * Test para verificar datos de Orden OC-2025-0022 y Recepción RC25-0016
 * Verifica que cantidadRecibida y cantidadPendiente se actualizan correctamente
 */

const API_BASE_URL = 'http://localhost:3001/api';

async function testOrdenRecepcion() {
  try {
    console.log('🔍 Verificando Orden OC-2025-0022...\n');

    // 1. Obtener lista de órdenes para encontrar el ID
    const ordenesResponse = await fetch(`${API_BASE_URL}/compras/ordenes?estado=PARCIAL`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTU0aTV1aGkwMDAwMTJ5eGNnMzlzNjFzIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczMzY4MDI1MCwiZXhwIjoxNzMzNzY2NjUwfQ.Sp-lHqJBZueTOCgn9_aHdUBaNDCe7wf2CAlSE1YiBv8'
      }
    });

    if (!ordenesResponse.ok) {
      throw new Error(`Error al obtener órdenes: ${ordenesResponse.status}`);
    }

    const ordenesData = await ordenesResponse.json();
    console.log(`✅ Total órdenes PARCIAL: ${ordenesData.data.length}`);

    // Buscar OC-2025-0022
    const orden = ordenesData.data.find(o => o.codigo === 'OC-2025-0022');
    if (!orden) {
      console.log('❌ No se encontró la orden OC-2025-0022');
      return;
    }

    console.log(`✅ Orden encontrada: ${orden.codigo} (ID: ${orden.id})`);
    console.log(`   Estado: ${orden.estado}`);
    console.log(`   Proveedor: ${orden.proveedor?.razonSocial || 'N/A'}`);

    // 2. Obtener detalle completo de la orden
    const ordenDetalleResponse = await fetch(`${API_BASE_URL}/compras/ordenes/${orden.id}`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTU0aTV1aGkwMDAwMTJ5eGNnMzlzNjFzIiwidXNlcm5hbWUiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczMzY4MDI1MCwiZXhwIjoxNzMzNzY2NjUwfQ.Sp-lHqJBZueTOCgn9_aHdUBaNDCe7wf2CAlSE1YiBv8'
      }
    });

    if (!ordenDetalleResponse.ok) {
      throw new Error(`Error al obtener detalle: ${ordenDetalleResponse.status}`);
    }

    const ordenDetalle = await ordenDetalleResponse.json();
    
    console.log('\n📦 ITEMS DE LA ORDEN:');
    console.log('═══════════════════════════════════════════════════════════');
    
    ordenDetalle.items.forEach(item => {
      console.log(`\n🔹 Producto: ${item.producto?.nombre || 'N/A'}`);
      console.log(`   Código: ${item.producto?.codigo || 'N/A'}`);
      console.log(`   ✅ Cantidad Ordenada: ${item.cantidadOrdenada}`);
      console.log(`   📥 Cantidad Recibida: ${item.cantidadRecibida || 0}`);
      console.log(`   ⏳ Cantidad Pendiente: ${item.cantidadPendiente || 0}`);
      console.log(`   ✓ Cantidad Aceptada: ${item.cantidadAceptada || 0}`);
      console.log(`   ✗ Cantidad Rechazada: ${item.cantidadRechazada || 0}`);
    });

    // Calcular totales
    const totalOrdenado = ordenDetalle.items.reduce((sum, item) => sum + item.cantidadOrdenada, 0);
    const totalRecibido = ordenDetalle.items.reduce((sum, item) => sum + (item.cantidadRecibida || 0), 0);
    const totalPendiente = ordenDetalle.items.reduce((sum, item) => sum + (item.cantidadPendiente || 0), 0);
    const progreso = totalOrdenado > 0 ? Math.round((totalRecibido / totalOrdenado) * 100) : 0;

    console.log('\n📊 RESUMEN:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Total Ordenado:  ${totalOrdenado}`);
    console.log(`   Total Recibido:  ${totalRecibido}`);
    console.log(`   Total Pendiente: ${totalPendiente}`);
    console.log(`   Progreso:        ${progreso}%`);

    // 3. Obtener recepciones de esta orden
    console.log('\n🧾 RECEPCIONES:');
    console.log('═══════════════════════════════════════════════════════════');

    if (ordenDetalle.recepciones && ordenDetalle.recepciones.length > 0) {
      ordenDetalle.recepciones.forEach(recepcion => {
        console.log(`\n   📄 ${recepcion.codigo || 'N/A'}`);
        console.log(`      Estado: ${recepcion.estado}`);
        console.log(`      Fecha: ${recepcion.fechaRecepcion ? new Date(recepcion.fechaRecepcion).toLocaleDateString() : 'N/A'}`);
        console.log(`      Recibido por: ${recepcion.recibidoPor?.firstName || 'N/A'} ${recepcion.recibidoPor?.lastName || ''}`);
      });
    } else {
      console.log('   ⚠️ No hay recepciones registradas');
    }

    // 4. Validaciones
    console.log('\n🔍 VALIDACIONES:');
    console.log('═══════════════════════════════════════════════════════════');

    if (orden.estado === 'PARCIAL' && totalRecibido === 0) {
      console.log('   ❌ ERROR: Estado es PARCIAL pero totalRecibido = 0');
      console.log('   💡 Esto indica que la transacción de confirmación no actualizó los items');
    } else if (orden.estado === 'PARCIAL' && totalRecibido > 0) {
      console.log('   ✅ CORRECTO: Estado PARCIAL con recepciones registradas');
    }

    if (totalOrdenado !== (totalRecibido + totalPendiente)) {
      console.log(`   ⚠️ ADVERTENCIA: Las cantidades no cuadran`);
      console.log(`      Ordenado: ${totalOrdenado}`);
      console.log(`      Recibido + Pendiente: ${totalRecibido + totalPendiente}`);
    } else {
      console.log('   ✅ CORRECTO: Ordenado = Recibido + Pendiente');
    }

    console.log('\n✅ Test completado\n');

  } catch (error) {
    console.error('❌ Error en test:', error.message);
  }
}

// Ejecutar test
testOrdenRecepcion();
