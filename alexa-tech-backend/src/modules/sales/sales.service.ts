import { prisma } from '../../config/database';
import { productService } from '../../services/productService';
import { AuditService } from '../../services/auditService';
import { inventoryService } from '../../services/inventoryService';

interface SaleItem {
  productId: string;
  nombreProducto?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productCode?: string; // ✅ Código real del producto
}

interface SaleCreateInput {
  cashSessionId?: string;
  clienteId?: string;
  almacenId: string;
  tipoComprobante: 'Boleta' | 'Factura' | 'NotaVenta';
  formaPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
  incluyeIGV?: boolean; // 🆕 Para indicar si se aplica IGV (18%) o no
  items: Array<{
    productId: string;
    nombreProducto?: string;
    cantidad: number;
    precioUnitario: number;
  }>;
  observaciones?: string;
}

interface Sale {
  id: string;
  codigoVenta: string;
  cashSessionId?: string;
  clienteId?: string;
  almacenId: string;
  usuarioId: string;
  fechaEmision: string;
  tipoComprobante: string;
  formaPago: string;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  observaciones?: string;
  items: SaleItem[];
  cliente?: { // ✅ Datos del cliente
    id: string;
    nombres: string;
    apellidos: string;
    razonSocial: string | null;
    tipoDocumento: string;
    numeroDocumento: string;
    direccion: string;
    telefono: string | null;
  };
  usuario?: { // ✅ Datos del usuario
    id: string;
    nombre: string;
    email: string;
  };
  creditNotes?: Array<{ // ✅ Notas de Crédito asociadas (solo en getById)
    id: string;
    codigoVenta: string;
    creditNoteReason: string;
    creditNoteDescription: string | null;
    fechaEmision: string;
    subtotal: number;
    igv: number;
    total: number;
    items: Array<{
      id: string;
      productId: string;
      nombreProducto: string;
      cantidad: number;
      precioUnitario: number;
      subtotal: number;
    }>;
    usuario?: {
      id: string;
      nombre: string;
    };
  }>;
  montoNotaCredito?: number; // ✅ Total de NC (solo en list)
  montoEfectivo?: number; // ✅ Total menos NC (solo en list)
  tieneNotaCredito?: boolean; // ✅ Indicador (solo en list)
  createdAt: string;
  updatedAt: string;
}

const genCodigoVenta = (): string => {
  const now = new Date();
  const y = String(now.getFullYear());
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `VEN-${y}${m}${d}-${hh}${mm}${ss}`;
};

export const salesService = {
  async create(data: SaleCreateInput, userId: string): Promise<Sale> {
    // 🐛 Debug: Ver si llega incluyeIGV
    console.log('🔍 Datos recibidos en create:', { 
      incluyeIGV: data.incluyeIGV,
      tipoComprobante: data.tipoComprobante,
      formaPago: data.formaPago 
    });

    // Validar sesión de caja si se proporciona
    if (data.cashSessionId) {
      const session = await prisma.cashSession.findUnique({
        where: { id: data.cashSessionId },
      });
      if (!session || session.estado !== 'Abierta') {
        throw new Error('Sesión de caja no encontrada o no está abierta');
      }
    }

    // Validar cliente si es Factura
    if (data.tipoComprobante === 'Factura' && !data.clienteId) {
      throw new Error('Se requiere cliente para emitir una Factura');
    }

    // Validar disponibilidad de stock y calcular items
    const items: Array<{
      productId: string;
      nombreProducto: string;
      cantidad: number;
      precioUnitario: any;
      subtotal: any;
    }> = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Producto ${item.productId} no encontrado`);
      }

      if (!product.estado) {
        throw new Error(`Producto ${product.nombre} está inactivo`);
      }

      // Verificar stock si el producto tiene control de inventario
      if (product.trackInventory) {
        const stockByWarehouse = await prisma.stockByWarehouse.findFirst({
          where: {
            productId: item.productId,
            warehouseId: data.almacenId,
          },
        });

        const availableStock = stockByWarehouse?.quantity ?? 0;
        if (availableStock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para ${product.nombre}. Disponible: ${availableStock}, Solicitado: ${item.cantidad}`
          );
        }
      }

      const subtotal = item.cantidad * item.precioUnitario;
      items.push({
        productId: item.productId,
        nombreProducto: item.nombreProducto ?? product.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario as any,
        subtotal: subtotal as any,
      });
    }

    // Calcular totales (IGV 18% opcional)
    const subtotal = items.reduce((acc, cur) => acc + Number(cur.subtotal), 0);
    const incluyeIGV = data.incluyeIGV !== false; // Por defecto true si no se especifica
    const igv = incluyeIGV ? subtotal * 0.18 : 0;
    const total = subtotal + igv;

    // 🐛 Debug: Ver cálculo de totales
    console.log('💰 Cálculo de totales:', {
      subtotal,
      incluyeIGV,
      igv,
      total
    });

    // Generar código único
    let codigoVenta = genCodigoVenta();
    const exists = await prisma.sale.findUnique({ where: { codigoVenta } });
    if (exists) {
      codigoVenta = `${codigoVenta}-${Date.now()}`;
    }

    const now = new Date();
    const created = await prisma.sale.create({
      data: {
        codigoVenta,
        cashSessionId: data.cashSessionId ?? null,
        clienteId: data.clienteId ?? null,
        almacenId: data.almacenId,
        usuarioId: userId,
        fechaEmision: now,
        tipoComprobante: data.tipoComprobante as any,
        formaPago: data.formaPago as any,
        subtotal: subtotal as any,
        igv: igv as any,
        total: total as any,
        estado: 'Pendiente' as any,
        observaciones: data.observaciones ?? null,
        createdAt: now,
        updatedAt: now,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });

    await AuditService.createAuditLog({
      action: 'CREATE_SALE',
      userId,
      targetId: created.id,
      details: `Venta creada: ${created.codigoVenta}`,
    });

    return {
      id: created.id,
      codigoVenta: created.codigoVenta,
      cashSessionId: created.cashSessionId ?? undefined,
      clienteId: created.clienteId ?? undefined,
      almacenId: created.almacenId,
      usuarioId: created.usuarioId,
      fechaEmision: created.fechaEmision.toISOString(),
      tipoComprobante: created.tipoComprobante,
      formaPago: created.formaPago,
      subtotal: Number(created.subtotal),
      igv: Number(created.igv),
      total: Number(created.total),
      estado: created.estado,
      observaciones: created.observaciones ?? undefined,
      items: created.items.map((it) => ({
        id: it.id,  // ✅ CRÍTICO: Necesario para Notas de Crédito
        productId: it.productId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  },

  // 🆕 NUEVA FUNCIÓN: Confirmar pago de una venta
  async confirmPayment(
    saleId: string,
    paymentData: {
      montoRecibido: number;
      montoCambio?: number;
      referenciaPago?: string;
    },
    userId: string
  ): Promise<Sale> {
    // Verificar que la venta existe
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    if (!sale) {
      throw new Error('Venta no encontrada');
    }

    // Verificar que la venta está en estado Pendiente
    if (sale.estado === 'Completada') {
      throw new Error('Esta venta ya fue pagada');
    }

    if (sale.estado !== 'Pendiente') {
      throw new Error('Solo se pueden confirmar pagos de ventas pendientes');
    }

    // Validar que el monto recibido sea suficiente
    const totalVenta = Number(sale.total);
    if (paymentData.montoRecibido < totalVenta) {
      throw new Error(
        `Monto insuficiente. Total: S/ ${totalVenta.toFixed(2)}, Recibido: S/ ${paymentData.montoRecibido.toFixed(2)}`
      );
    }

    // Calcular cambio si no se proporcionó
    const montoCambio = paymentData.montoCambio ?? (paymentData.montoRecibido - totalVenta);

    // Actualizar la venta
    const updated = await prisma.sale.update({
      where: { id: saleId },
      data: {
        estado: 'Completada', // ✅ Simplificado: solo usar estado
        montoRecibido: paymentData.montoRecibido,
        montoCambio,
        referenciaPago: paymentData.referenciaPago ?? null,
        fechaPago: new Date(),
      },
      include: {
        items: { include: { product: true } },
        cliente: true,
        usuario: true,
      },
    });

    // 🔄 Registrar movimiento de kardex para cada producto (COMENTADO temporalmente - implementar después)
    // for (const item of sale.items) {
    //   await inventoryService.createKardexMovement({
    //     productId: item.productId,
    //     warehouseId: sale.almacenId,
    //     type: 'SALIDA',
    //     reason: 'VENTA',
    //     quantity: item.cantidad,
    //     unitCost: Number(item.precioUnitario),
    //     referenceType: 'SALE',
    //     referenceId: sale.id,
    //     userId,
    //   });
    // }

    // Registrar auditoría
    await AuditService.createAuditLog({
      action: 'CONFIRM_PAYMENT',
      userId,
      targetId: saleId,
      details: `Pago confirmado para venta ${sale.codigoVenta}. Monto: S/ ${paymentData.montoRecibido}, Cambio: S/ ${montoCambio.toFixed(2)}`,
    });

    // Retornar venta actualizada
    return {
      id: updated.id,
      codigoVenta: updated.codigoVenta,
      cashSessionId: updated.cashSessionId ?? undefined,
      clienteId: updated.clienteId ?? undefined,
      almacenId: updated.almacenId,
      usuarioId: updated.usuarioId,
      fechaEmision: updated.fechaEmision.toISOString(),
      tipoComprobante: updated.tipoComprobante,
      formaPago: updated.formaPago,
      subtotal: Number(updated.subtotal),
      igv: Number(updated.igv),
      total: Number(updated.total),
      estado: updated.estado,
      observaciones: updated.observaciones ?? undefined,
      items: updated.items.map((it: any) => ({
        id: it.id,  // ✅ CRÍTICO: Necesario para Notas de Crédito
        productId: it.productId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
        productCode: it.product?.codigo || 'N/A',
      })),
      cliente: updated.cliente
        ? {
            id: updated.cliente.id,
            nombres: updated.cliente.nombres || '',
            apellidos: updated.cliente.apellidos || '',
            razonSocial: updated.cliente.razonSocial ?? null,
            tipoDocumento: updated.cliente.tipoDocumento,
            numeroDocumento: updated.cliente.numeroDocumento,
            direccion: updated.cliente.direccion,
            telefono: updated.cliente.telefono ?? null,
          }
        : undefined,
      usuario: updated.usuario
        ? {
            id: updated.usuario.id,
            nombre: `${updated.usuario.firstName} ${updated.usuario.lastName}`,
            email: updated.usuario.email,
          }
        : undefined,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async list(filters: any = {}): Promise<Sale[]> {
    const where: any = {
      tipo: { not: 'NotaCredito' }, // ✅ MEJORA UX: Excluir NC del listado principal
    };
    
    if (filters.cashSessionId) where.cashSessionId = String(filters.cashSessionId);
    if (filters.clienteId) where.clienteId = String(filters.clienteId);
    if (filters.almacenId) where.almacenId = String(filters.almacenId);
    if (filters.estado) where.estado = String(filters.estado) as any;
    if (filters.fechaInicio || filters.fechaFin) {
      const start = filters.fechaInicio ? new Date(filters.fechaInicio) : undefined;
      const end = filters.fechaFin ? new Date(filters.fechaFin) : undefined;
      where.fechaEmision = {};
      if (start) (where.fechaEmision as any).gte = start;
      if (end) (where.fechaEmision as any).lte = end;
    }
    if (filters.q) {
      const q = String(filters.q);
      where.OR = [
        { codigoVenta: { contains: q, mode: 'insensitive' } },
        { items: { some: { nombreProducto: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    const sales = await prisma.sale.findMany({
      where,
      orderBy: { fechaEmision: 'desc' },
      include: { 
        items: true,
        creditNotes: true, // ✅ Incluir Notas de Crédito asociadas
        cliente: true,      // ✅ Incluir datos del cliente
      },
    });

    return sales.map((s) => {
      // ✅ Calcular monto total de Notas de Crédito
      const montoNotaCredito = s.creditNotes.reduce((sum, nc) => sum + Number(nc.total), 0);
      const montoEfectivo = Number(s.total) - montoNotaCredito;
      
      return {
        id: s.id,
        codigoVenta: s.codigoVenta,
        cashSessionId: s.cashSessionId ?? undefined,
        clienteId: s.clienteId ?? undefined,
        almacenId: s.almacenId,
        usuarioId: s.usuarioId,
        fechaEmision: s.fechaEmision.toISOString(),
        tipoComprobante: s.tipoComprobante,
        formaPago: s.formaPago,
        subtotal: Number(s.subtotal),
        igv: Number(s.igv),
        total: Number(s.total),
        estado: s.estado,
        observaciones: s.observaciones ?? undefined,
        // ✅ Campos calculados de NC
        montoNotaCredito,
        montoEfectivo,
        tieneNotaCredito: s.creditNotes.length > 0,
      items: s.items.map((it) => ({
        id: it.id,  // ✅ CRÍTICO: Necesario para Notas de Crédito
        productId: it.productId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      // ✅ Datos del cliente
      cliente: s.cliente ? {
        id: s.cliente.id,
        nombres: s.cliente.nombres || '',
        apellidos: s.cliente.apellidos || '',
        razonSocial: s.cliente.razonSocial || null,
        tipoDocumento: s.cliente.tipoDocumento,
        numeroDocumento: s.cliente.numeroDocumento,
        direccion: s.cliente.direccion,
        telefono: s.cliente.telefono || null,
      } : undefined,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
      };
    });
  },

  async getById(id: string): Promise<Sale | null> {
    const s: any = await prisma.sale.findUnique({
      where: { id },
      include: { 
        items: {
          include: {
            product: true // ✅ Incluir producto para obtener el código
          }
        },
        creditNotes: {  // ✅ Incluir NC para mostrar en detalle
          include: {
            items: true,
            usuario: true
          }
        },
        cliente: true, // ✅ Incluir cliente para el PDF
        usuario: true  // ✅ Incluir usuario para auditoría
      },
    });
    if (!s) return null;

    return {
      id: s.id,
      codigoVenta: s.codigoVenta,
      cashSessionId: s.cashSessionId ?? undefined,
      clienteId: s.clienteId ?? undefined,
      almacenId: s.almacenId,
      usuarioId: s.usuarioId,
      fechaEmision: s.fechaEmision.toISOString(),
      tipoComprobante: s.tipoComprobante,
      formaPago: s.formaPago,
      subtotal: Number(s.subtotal),
      igv: Number(s.igv),
      total: Number(s.total),
      estado: s.estado,
      observaciones: s.observaciones ?? undefined,
      items: s.items.map((it: any) => ({
        id: it.id,  // ✅ CRÍTICO: Necesario para Notas de Crédito
        productId: it.productId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
        productCode: it.product?.codigo || 'N/A', // ✅ Obtener código del producto
      })),
      cliente: s.cliente ? {
        id: s.cliente.id,
        nombres: s.cliente.nombres,
        apellidos: s.cliente.apellidos,
        razonSocial: s.cliente.razonSocial,
        tipoDocumento: s.cliente.tipoDocumento,
        numeroDocumento: s.cliente.numeroDocumento,
        direccion: s.cliente.direccion,
        telefono: s.cliente.telefono,
      } : undefined,
      usuario: {
        id: s.usuario.id,
        nombre: s.usuario.nombre,
        email: s.usuario.email,
      },
      // ✅ Incluir Notas de Crédito para mostrar en DetalleVenta
      creditNotes: s.creditNotes?.map((nc: any) => ({
        id: nc.id,
        codigoVenta: nc.codigoVenta,
        creditNoteReason: nc.creditNoteReason,
        creditNoteDescription: nc.creditNoteDescription,
        fechaEmision: nc.fechaEmision.toISOString(),
        subtotal: Number(nc.subtotal),
        igv: Number(nc.igv),
        total: Number(nc.total),
        items: nc.items?.map((it: any) => ({
          id: it.id,
          productId: it.productId,
          nombreProducto: it.nombreProducto,
          cantidad: it.cantidad,
          precioUnitario: Number(it.precioUnitario),
          subtotal: Number(it.subtotal),
        })) || [],
        usuario: nc.usuario ? {
          id: nc.usuario.id,
          nombre: `${nc.usuario.firstName} ${nc.usuario.lastName}`,
        } : undefined,
      })) || [],
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    };
  },

  async updateStatus(
    id: string,
    estado: 'Pendiente' | 'Completada' | 'Cancelada',
    userId: string
  ): Promise<Sale> {
    const existing = await prisma.sale.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!existing) throw new Error('Venta no encontrada');

    const prevEstado = existing.estado;
    const nextEstado = estado;

    const updated = await prisma.sale.update({
      where: { id },
      data: { estado: nextEstado as any, updatedAt: new Date() },
      include: { items: true },
    });

    await AuditService.createAuditLog({
      action: 'CHANGE_SALE_STATUS',
      userId,
      targetId: id,
      details: `Estado cambiado de ${prevEstado} a ${nextEstado} (${existing.codigoVenta})`,
    });

    // Si se completa la venta, aplicar SALIDA de inventario
    if (nextEstado === 'Completada' && prevEstado !== 'Completada') {
      const itemsForInventory = existing.items.map((it) => ({
        productId: it.productId,
        cantidad: it.cantidad,
      }));

      if (itemsForInventory.length > 0 && existing.almacenId) {
        await inventoryService.applySaleSalida(id, itemsForInventory, existing.almacenId, userId);
      }

      // Actualizar total de ventas en la sesión de caja
      if (existing.cashSessionId) {
        const session = await prisma.cashSession.findUnique({
          where: { id: existing.cashSessionId },
        });
        if (session) {
          const newTotal = Number(session.totalVentas) + Number(existing.total);
          await prisma.cashSession.update({
            where: { id: existing.cashSessionId },
            data: { totalVentas: newTotal as any },
          });
        }
      }
    }

    // Si se cancela, revertir inventario si estaba completada
    if (nextEstado === 'Cancelada' && prevEstado === 'Completada') {
      const itemsForInventory = existing.items.map((it) => ({
        productId: it.productId,
        cantidad: it.cantidad,
      }));

      if (itemsForInventory.length > 0 && existing.almacenId) {
        // Revertir: aplicar ENTRADA para devolver el stock
        await inventoryService.applyPurchaseEntrada(
          id,
          itemsForInventory,
          existing.almacenId,
          userId
        );
      }

      // Actualizar total de ventas en la sesión de caja (restar)
      if (existing.cashSessionId) {
        const session = await prisma.cashSession.findUnique({
          where: { id: existing.cashSessionId },
        });
        if (session) {
          const newTotal = Number(session.totalVentas) - Number(existing.total);
          await prisma.cashSession.update({
            where: { id: existing.cashSessionId },
            data: { totalVentas: newTotal as any },
          });
        }
      }
    }

    return {
      id: updated.id,
      codigoVenta: updated.codigoVenta,
      cashSessionId: updated.cashSessionId ?? undefined,
      clienteId: updated.clienteId ?? undefined,
      almacenId: updated.almacenId,
      usuarioId: updated.usuarioId,
      fechaEmision: updated.fechaEmision.toISOString(),
      tipoComprobante: updated.tipoComprobante,
      formaPago: updated.formaPago,
      subtotal: Number(updated.subtotal),
      igv: Number(updated.igv),
      total: Number(updated.total),
      estado: updated.estado,
      observaciones: updated.observaciones ?? undefined,
      items: updated.items.map((it) => ({
        productId: it.productId,
        nombreProducto: it.nombreProducto,
        cantidad: it.cantidad,
        precioUnitario: Number(it.precioUnitario),
        subtotal: Number(it.subtotal),
      })),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  },

  async delete(id: string, userId: string): Promise<void> {
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) throw new Error('Venta no encontrada');
    if (existing.estado !== 'Pendiente') {
      throw new Error('Solo se puede eliminar ventas en estado Pendiente');
    }

    await prisma.sale.delete({ where: { id } });

    await AuditService.createAuditLog({
      action: 'DELETE_SALE',
      userId,
      targetId: id,
      details: `Venta eliminada: ${existing.codigoVenta}`,
    });
  },
};

export default salesService;
