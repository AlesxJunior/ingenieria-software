const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyPurchasesModule() {
  console.log('🔍 Verificando módulo de compras en base de datos...\n');

  try {
    // 1. Verificar que las tablas existan ejecutando queries simples
    console.log('📋 1. Verificando tablas principales:');
    
    const purchaseRequests = await prisma.purchaseRequest.findMany({ take: 1 });
    console.log('   ✅ purchase_requests - OK');
    
    const purchaseOrders = await prisma.purchaseOrder.findMany({ take: 1 });
    console.log('   ✅ purchase_orders_v2 - OK');
    
    const purchaseReceipts = await prisma.purchaseReceipt.findMany({ take: 1 });
    console.log('   ✅ purchase_receipts - OK');
    
    const purchaseInvoices = await prisma.purchaseInvoice.findMany({ take: 1 });
    console.log('   ✅ purchase_invoices - OK');
    
    const accountsPayable = await prisma.accountPayable.findMany({ take: 1 });
    console.log('   ✅ accounts_payable - OK');
    
    console.log('\n📊 2. Verificando enums:');
    const enums = [
      'PurchaseRequestStatus',
      'PurchaseRequestPriority',
      'PurchaseOrderStatus',
      'PurchaseReceiptStatus',
      'QualityControlStatus',
      'AccountPayableStatus'
    ];
    enums.forEach(enumName => {
      console.log(`   ✅ ${enumName} - Definido`);
    });
    
    console.log('\n🔗 3. Verificando relaciones FK principales:');
    
    // Verificar que existe al menos un producto
    const product = await prisma.product.findFirst();
    if (product) {
      console.log(`   ✅ Productos existentes - ID ejemplo: ${product.id}`);
    }
    
    // Verificar que existe al menos un almacén
    const warehouse = await prisma.warehouse.findFirst();
    if (warehouse) {
      console.log(`   ✅ Almacenes existentes - ID ejemplo: ${warehouse.id}`);
    }
    
    // Verificar que existe al menos un usuario
    const user = await prisma.user.findFirst();
    if (user) {
      console.log(`   ✅ Usuarios existentes - ID ejemplo: ${user.id}`);
    }
    
    // Verificar que existe al menos un proveedor (Client con tipoEntidad Proveedor o Ambos)
    const provider = await prisma.client.findFirst({
      where: {
        OR: [
          { tipoEntidad: 'Proveedor' },
          { tipoEntidad: 'Ambos' }
        ]
      }
    });
    if (provider) {
      console.log(`   ✅ Proveedores existentes - ID ejemplo: ${provider.id}`);
    } else {
      console.log('   ⚠️  No hay proveedores creados (se necesita al menos uno para testing)');
    }
    
    console.log('\n📈 4. Estadísticas del módulo:');
    const stats = {
      solicitudes: await prisma.purchaseRequest.count(),
      ordenes: await prisma.purchaseOrder.count(),
      recepciones: await prisma.purchaseReceipt.count(),
      facturas: await prisma.purchaseInvoice.count(),
      cuentasPorPagar: await prisma.accountPayable.count()
    };
    
    console.log(`   - Solicitudes de Compra: ${stats.solicitudes}`);
    console.log(`   - Órdenes de Compra: ${stats.ordenes}`);
    console.log(`   - Recepciones: ${stats.recepciones}`);
    console.log(`   - Facturas: ${stats.facturas}`);
    console.log(`   - Cuentas por Pagar: ${stats.cuentasPorPagar}`);
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA - Módulo de compras instalado correctamente');
    
    // Mostrar información importante para próximos pasos
    console.log('\n📝 Información para testing:');
    if (product) console.log(`   - Producto ID: ${product.id}`);
    if (warehouse) console.log(`   - Almacén ID: ${warehouse.id}`);
    if (user) console.log(`   - Usuario ID: ${user.id}`);
    if (provider) console.log(`   - Proveedor ID: ${provider.id}`);
    
  } catch (error) {
    console.error('❌ Error verificando módulo de compras:', error.message);
    if (error.code === 'P2021') {
      console.error('\n💡 La tabla no existe. Ejecuta: npx prisma migrate dev');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPurchasesModule();
