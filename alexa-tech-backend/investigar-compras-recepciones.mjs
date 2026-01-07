/**
 * Investigar diferencia entre Purchase y PurchaseReceipt
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function investigarCompras() {
  try {
    console.log('🔍 INVESTIGANDO COMPRAS VS RECEPCIONES...\n');

    // 1. Purchase (Órdenes de Compra)
    console.log('📋 ÓRDENES DE COMPRA (Purchase):');
    const purchases = await prisma.purchase.findMany({
      orderBy: { fechaEmision: 'desc' },
      take: 5
    });
    console.log(`   Total: ${await prisma.purchase.count()}`);
    purchases.forEach(p => {
      console.log(`   - ${p.codigoOrden} | Fecha: ${p.fechaEmision.toISOString().split('T')[0]} | Estado: ${p.estado} | Total: S/. ${p.total}`);
    });

    // 2. PurchaseReceipt (Recepciones de Compra)
    console.log('\n📦 RECEPCIONES DE COMPRA (PurchaseReceipt):');
    const receipts = await prisma.purchaseReceipt.findMany({
      orderBy: { fechaRecepcion: 'desc' },
      take: 10,
      include: {
        ordenCompra: true
      }
    });
    console.log(`   Total: ${await prisma.purchaseReceipt.count()}`);
    receipts.forEach(r => {
      console.log(`   - ${r.codigo} | Fecha: ${r.fechaRecepcion.toISOString().split('T')[0]} | OC: ${r.ordenCompraId?.substring(0, 10)}... | Estado: ${r.estado}`);
    });

    // 3. InventoryMovement (Movimientos Kardex)
    console.log('\n📊 MOVIMIENTOS DE INVENTARIO (Kardex):');
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        tipo: 'ENTRADA'
      },
      orderBy: { fecha: 'desc' },
      take: 10
    });
    console.log(`   Total ENTRADAS: ${await prisma.inventoryMovement.count({ where: { tipo: 'ENTRADA' }})}`);
    movements.forEach(m => {
      console.log(`   - ${m.motivoMovimientoId || 'Sin motivo'} | Fecha: ${m.fecha.toISOString().split('T')[0]} | Cantidad: ${m.cantidad} | Referencia: ${m.referenciaDocumento || 'N/A'}`);
    });

    // 4. Análisis de fechas
    console.log('\n📅 ANÁLISIS DE FECHAS:');
    
    const primeraRecepcion = await prisma.purchaseReceipt.findFirst({
      orderBy: { fechaRecepcion: 'asc' }
    });
    const ultimaRecepcion = await prisma.purchaseReceipt.findFirst({
      orderBy: { fechaRecepcion: 'desc' }
    });

    if (primeraRecepcion && ultimaRecepcion) {
      console.log(`   Recepciones desde: ${primeraRecepcion.fechaRecepcion.toISOString().split('T')[0]}`);
      console.log(`   Recepciones hasta: ${ultimaRecepcion.fechaRecepcion.toISOString().split('T')[0]}`);
    }

    const primeraPurchase = await prisma.purchase.findFirst({
      orderBy: { fechaEmision: 'asc' }
    });
    const ultimaPurchase = await prisma.purchase.findFirst({
      orderBy: { fechaEmision: 'desc' }
    });

    if (primeraPurchase && ultimaPurchase) {
      console.log(`   Órdenes desde: ${primeraPurchase.fechaEmision.toISOString().split('T')[0]}`);
      console.log(`   Órdenes hasta: ${ultimaPurchase.fechaEmision.toISOString().split('T')[0]}`);
    }

    // 5. Recepciones en diciembre 2025
    console.log('\n🎯 RECEPCIONES EN DICIEMBRE 2025:');
    const recepcionesDic = await prisma.purchaseReceipt.findMany({
      where: {
        fechaRecepcion: {
          gte: new Date('2025-12-01'),
          lte: new Date('2025-12-31')
        }
      },
      include: {
        items: true,
        ordenCompra: true
      }
    });

    console.log(`   Total: ${recepcionesDic.length} recepciones`);
    let totalDic = 0;
    recepcionesDic.forEach(r => {
      const total = r.items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
      totalDic += total;
      console.log(`   - ${r.codigo} | ${r.fechaRecepcion.toISOString().split('T')[0]} | Items: ${r.items.length} | Total estimado: S/. ${total.toFixed(2)}`);
    });
    console.log(`   Total invertido (dic): S/. ${totalDic.toFixed(2)}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

investigarCompras();
