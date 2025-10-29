const { inventoryService } = require('../src/services/inventoryService');

async function testKardexAPI() {
  try {
    console.log('🔍 Probando API de kardex después del arreglo...\n');

    // Probar con filtros mínimos (solo warehouseId)
    console.log('1. Probando con warehouseId=WH-PRINCIPAL (sin filtro de tipo):');
    const result1 = await inventoryService.getKardex({
      warehouseId: 'WH-PRINCIPAL',
      page: 1,
      pageSize: 10
    });
    console.log(`   ✅ Total encontrados: ${result1.total}`);
    console.log(`   ✅ Registros en página: ${result1.rows.length}`);
    
    if (result1.rows.length > 0) {
      console.log('   📋 Primer movimiento:');
      const first = result1.rows[0];
      console.log(`      - Fecha: ${first.fecha}`);
      console.log(`      - Producto: ${first.nombre} (${first.codigo})`);
      console.log(`      - Tipo: ${first.tipo}`);
      console.log(`      - Cantidad: ${first.cantidad}`);
      console.log(`      - Stock antes: ${first.stockAntes} → después: ${first.stockDespues}`);
    }

    // Probar con filtro de tipo específico
    console.log('\n2. Probando con filtro tipo=ENTRADA:');
    const result2 = await inventoryService.getKardex({
      warehouseId: 'WH-PRINCIPAL',
      tipoMovimiento: 'ENTRADA',
      page: 1,
      pageSize: 10
    });
    console.log(`   ✅ Total ENTRADA encontrados: ${result2.total}`);
    console.log(`   ✅ Registros en página: ${result2.rows.length}`);

    // Probar con almacén secundario
    console.log('\n3. Probando con warehouseId=WH-SECUNDARIO:');
    const result3 = await inventoryService.getKardex({
      warehouseId: 'WH-SECUNDARIO',
      page: 1,
      pageSize: 10
    });
    console.log(`   ✅ Total en almacén secundario: ${result3.total}`);
    console.log(`   ✅ Registros en página: ${result3.rows.length}`);

    console.log('\n🎉 Pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.error('❌ Stack:', error.stack);
  }
}

testKardexAPI();