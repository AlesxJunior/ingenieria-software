/**
 * Script de Migración: Crear SalePayment para ventas existentes
 * 
 * Este script migra las ventas antiguas que solo tienen formaPago
 * creando un registro en SalePayment para cada una
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateSalesToPayments() {
  console.log('🚀 Iniciando migración de ventas a pagos múltiples...\n');

  try {
    // 1. Buscar todas las ventas que NO tienen pagos en SalePayment
    const salesWithoutPayments = await prisma.sale.findMany({
      where: {
        payments: {
          none: {} // Ventas sin registros en SalePayment
        }
      },
      select: {
        id: true,
        codigoVenta: true,
        formaPago: true,
        total: true,
        referenciaPago: true,
      }
    });

    console.log(`📊 Ventas encontradas sin pagos: ${salesWithoutPayments.length}\n`);

    if (salesWithoutPayments.length === 0) {
      console.log('✅ No hay ventas para migrar. Todas las ventas ya tienen registros de pago.');
      return;
    }

    // 2. Crear SalePayment para cada venta
    let migrated = 0;
    let errors = 0;

    for (const sale of salesWithoutPayments) {
      try {
        const metodoPago = sale.formaPago || 'Efectivo';
        
        await prisma.salePayment.create({
          data: {
            saleId: sale.id,
            metodoPago: metodoPago,
            monto: sale.total,
            referencia: sale.referenciaPago || null,
            observaciones: 'Migrado automáticamente desde formaPago',
            orden: 1,
          }
        });

        migrated++;
        console.log(`✅ [${migrated}/${salesWithoutPayments.length}] ${sale.codigoVenta} - ${metodoPago}: S/ ${sale.total}`);

      } catch (error) {
        errors++;
        console.error(`❌ Error en venta ${sale.codigoVenta}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMEN DE MIGRACIÓN:');
    console.log('='.repeat(60));
    console.log(`✅ Ventas migradas exitosamente: ${migrated}`);
    console.log(`❌ Errores: ${errors}`);
    console.log(`📦 Total procesadas: ${salesWithoutPayments.length}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ ERROR GENERAL:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateSalesToPayments();
