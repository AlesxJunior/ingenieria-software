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

// 🆕 Interfaz para pagos múltiples
interface PaymentInput {
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
  monto: number;
  referencia?: string;
  observaciones?: string;
}

interface SaleCreateInput {
  cashSessionId?: string;
  clienteId?: string;
  almacenId: string;
  tipoComprobante: 'Boleta' | 'Factura' | 'NotaVenta';
  // ✅ Mantener formaPago para compatibilidad con pago simple
  formaPago?: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Yape' | 'Plin';
  // 🆕 Nuevo: Array de pagos múltiples (si no se envía, usa formaPago)
  payments?: PaymentInput[];
  incluyeIGV?: boolean; // 🆕 Para indicar si se aplica IGV (18%) o no
  comprobanteId?: string; // 🆕 ID del comprobante específico a usar (opcional)
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
  formaPago?: string | null;  // Ahora opcional
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  observaciones?: string;
  items: SaleItem[];
  payments?: Array<{ // 🆕 Pagos múltiples
    id: string;
    metodoPago: string;
    monto: number;
    referencia?: string;
    observaciones?: string;
    orden: number;
  }>;
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

// Generar código de venta con serie profesional según SUNAT
// Formato: SERIE-CORRELATIVO (Ej: F001-00000001, B001-00000001)
const genCodigoVenta = async (
  tipoComprobante: string,
  comprobanteId?: string
): Promise<{ codigo: string; comprobanteId: string; nuevoNumero: number }> => {
  let comprobante;

  if (comprobanteId) {
    // Usar comprobante específico
    comprobante = await prisma.comprobanteType.findUnique({
      where: { id: comprobanteId },
    });
  } else {
    // Buscar comprobante predeterminado para el tipo
    const tipoMap: { [key: string]: string } = {
      Factura: 'factura',
      Boleta: 'boleta',
      'Nota de Crédito': 'nota-credito',
      'Nota de Débito': 'nota-debito',
    };

    comprobante = await prisma.comprobanteType.findFirst({
      where: {
        tipo: tipoMap[tipoComprobante] || 'boleta',
        activo: true,
        predeterminado: true,
      },
    });

    // Si no hay predeterminado, buscar el primero activo
    if (!comprobante) {
      comprobante = await prisma.comprobanteType.findFirst({
        where: {
          tipo: tipoMap[tipoComprobante] || 'boleta',
          activo: true,
        },
        orderBy: { createdAt: 'asc' },
      });
    }
  }

  if (!comprobante) {
    throw new Error(
      `No se encontró comprobante activo para tipo: ${tipoComprobante}`
    );
  }

  // Validar que no se haya agotado la numeración
  if (comprobante.numeroActual >= comprobante.numeroFin) {
    throw new Error(
      `La numeración del comprobante ${comprobante.serie} se ha agotado. Actualice el rango en Configuración.`
    );
  }

  const nuevoNumero = comprobante.numeroActual + 1;
  const correlativo = String(nuevoNumero).padStart(8, '0');
  const codigo = `${comprobante.serie}-${correlativo}`;

  return {
    codigo,
    comprobanteId: comprobante.id,
    nuevoNumero,
  };
};

export const salesService = {
  async create(data: SaleCreateInput, userId: string): Promise<Sale> {
    console.log('🚨🚨🚨 CÓDIGO NUEVO VERSIÓN 2.0 🚨🚨🚨');
    console.log('🔍 [SERVICE] Datos completos recibidos:', JSON.stringify(data, null, 2));

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

    // ✅ SIEMPRE crear registros en SalePayment (migración completa)
    let paymentsData: any[];
    let formaPagoPrincipal: string | undefined;
    
    console.log('🔍 Verificando payments:', {
      hasPayments: !!data.payments,
      paymentsLength: data.payments?.length,
      paymentsData: data.payments,
      formaPago: data.formaPago
    });
    
    if (data.payments && data.payments.length > 0) {
      // ✅ Múltiples métodos de pago proporcionados
      const totalPagos = data.payments.reduce((sum, p) => sum + p.monto, 0);
      
      if (Math.abs(totalPagos - total) > 0.01) { // Tolerancia de 1 centavo
        throw new Error(
          `La suma de los pagos (S/ ${totalPagos.toFixed(2)}) no coincide con el total de la venta (S/ ${total.toFixed(2)})`
        );
      }

      paymentsData = data.payments.map((payment, index) => ({
        metodoPago: payment.metodoPago as any,
        monto: payment.monto as any,
        referencia: payment.referencia ?? null,
        observaciones: payment.observaciones ?? null,
        orden: index + 1,
      }));

      formaPagoPrincipal = data.payments[0]?.metodoPago; // Para compatibilidad legacy

      console.log('💳 Pagos múltiples detectados:', {
        cantidad: data.payments?.length || 0,
        totalPagos,
        totalVenta: total,
        pagos: paymentsData
      });
    } else {
      // ✅ Un solo método de pago - CREAR SalePayment igual
      const metodoPago = data.formaPago || 'Efectivo';
      
      paymentsData = [{
        metodoPago: metodoPago as any,
        monto: total as any,
        referencia: null,  // Sin referencia para pagos únicos simples
        observaciones: null,
        orden: 1,
      }];
      
      formaPagoPrincipal = metodoPago as any;

      console.log('💳 Pago único detectado, creando SalePayment:', {
        metodoPago,
        monto: total,
      });
    }

    // Generar código único con serie profesional
    const { codigo: codigoVenta, comprobanteId, nuevoNumero } = await genCodigoVenta(
      data.tipoComprobante,
      data.comprobanteId
    );

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
        formaPago: formaPagoPrincipal as any, // ⚠️ DEPRECATED: Solo compatibilidad legacy
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
        // ✅ SIEMPRE crear registros en SalePayment (uno o múltiples)
        payments: {
          create: paymentsData,
        },
      },
      include: { 
        items: true,
        payments: true, // 🆕 Incluir pagos en la respuesta
      },
    });

    // Actualizar el número correlativo del comprobante
    await prisma.comprobanteType.update({
      where: { id: comprobanteId },
      data: { numeroActual: nuevoNumero },
    });

    await AuditService.createAuditLog({
      action: 'CREATE_SALE',
      userId,
      targetId: created.id,
      details: `Venta creada: ${created.codigoVenta}${paymentsData && paymentsData.length > 1 ? ` con ${paymentsData.length} métodos de pago` : ''}`,
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
      // 🆕 Incluir pagos en la respuesta
      payments: created.payments?.map((p) => ({
        id: p.id,
        metodoPago: p.metodoPago,
        monto: Number(p.monto),
        referencia: p.referencia ?? undefined,
        observaciones: p.observaciones ?? undefined,
        orden: p.orden,
      })) ?? [],
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
      include: { items: true, payments: true },
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
        payments: true, // ✅ Incluir pagos múltiples
        cliente: true,
        usuario: true,
      },
    });

    // ✅ Actualizar totalVentas en la sesión de caja si existe
    if (sale.cashSessionId) {
      await prisma.cashSession.update({
        where: { id: sale.cashSessionId },
        data: {
          totalVentas: {
            increment: totalVenta, // Incrementar el total de ventas
          },
        },
      });
      console.log(`✅ CashSession ${sale.cashSessionId} actualizada: +S/ ${totalVenta.toFixed(2)}`);
    }

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
      // ✅ Incluir pagos múltiples en la respuesta
      payments: updated.payments?.map((p: any) => ({
        id: p.id,
        metodoPago: p.metodoPago,
        monto: Number(p.monto),
        referencia: p.referencia ?? undefined,
        observaciones: p.observaciones ?? undefined,
        orden: p.orden,
      })) ?? [],
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
        payments: true,     // ✅ Incluir métodos de pago múltiples
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
        // ✅ Métodos de pago múltiples
        payments: s.payments?.map((p: any) => ({
          id: p.id,
          metodoPago: p.metodoPago,
          monto: Number(p.monto),
          referencia: p.referencia ?? undefined,
          observaciones: p.observaciones ?? undefined,
          orden: p.orden,
        })) ?? [],
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
        payments: true, // 🆕 Incluir pagos múltiples
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
      // 🆕 Incluir pagos en la respuesta
      payments: s.payments?.map((p: any) => ({
        id: p.id,
        metodoPago: p.metodoPago,
        monto: Number(p.monto),
        referencia: p.referencia ?? undefined,
        observaciones: p.observaciones ?? undefined,
        orden: p.orden,
      })) ?? [],
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
      include: { 
        items: true,
        payments: true, // 🆕 Incluir pagos
      },
    });
    if (!existing) throw new Error('Venta no encontrada');

    const prevEstado = existing.estado;
    const nextEstado = estado;

    const updated = await prisma.sale.update({
      where: { id },
      data: { estado: nextEstado as any, updatedAt: new Date() },
      include: { 
        items: true,
        payments: true, // 🆕 Incluir pagos
      },
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
