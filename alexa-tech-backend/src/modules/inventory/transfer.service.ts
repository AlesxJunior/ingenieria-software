import { prisma } from '../../config/database';
import { TransferStatus, Prisma } from '@prisma/client';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface CreateTransferDTO {
  productId: string;
  cantidad: number;
  warehouseFromId: string;
  warehouseToId: string;
  motivoTransferencia?: string;
  observaciones?: string;
  solicitadoPor: string; // userId from JWT
}

export interface AprobarTransferDTO {
  transferId: string;
  aprobadoPor: string; // userId from JWT
  recibidoPor?: string; // Opcional: puede ser el mismo que aprueba
}

export interface TransferFilters {
  estado?: TransferStatus;
  warehouseFromId?: string;
  warehouseToId?: string;
  productId?: string;
  solicitadoPor?: string;
  fechaDesde?: Date;
  fechaHasta?: Date;
  q?: string; // Búsqueda por código o nombre de producto
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'codigo' | 'producto';
  order?: 'asc' | 'desc';
}

export interface TransferRow {
  id: string;
  codigo: string;
  product: {
    id: string;
    codigo: string;
    nombre: string;
  };
  cantidad: number;
  warehouseFrom: {
    id: string;
    codigo: string;
    nombre: string;
  };
  warehouseTo: {
    id: string;
    codigo: string;
    nombre: string;
  };
  estado: TransferStatus;
  motivoTransferencia?: string | null;
  observaciones?: string | null;
  solicitante: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  };
  aprobador?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  receptor?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
  } | null;
  fechaAprobacion?: Date | null;
  fechaRecepcion?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ============================================
// FUNCIONES DE VALIDACIÓN
// ============================================

/**
 * Valida que el producto exista y esté activo
 */
async function validarProducto(productId: string): Promise<void> {
  const producto = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, nombre: true, estado: true }
  });

  if (!producto) {
    throw new Error(`Producto con ID ${productId} no encontrado`);
  }

  if (!producto.estado) {
    throw new Error(`El producto "${producto.nombre}" está inactivo`);
  }
}

/**
 * Valida que ambos almacenes existan y estén activos
 */
async function validarAlmacenes(warehouseFromId: string, warehouseToId: string): Promise<void> {
  if (warehouseFromId === warehouseToId) {
    throw new Error('Los almacenes de origen y destino deben ser diferentes');
  }

  const [almacenOrigen, almacenDestino] = await Promise.all([
    prisma.warehouse.findUnique({
      where: { id: warehouseFromId },
      select: { id: true, nombre: true, activo: true }
    }),
    prisma.warehouse.findUnique({
      where: { id: warehouseToId },
      select: { id: true, nombre: true, activo: true }
    })
  ]);

  if (!almacenOrigen) {
    throw new Error(`Almacén origen con ID ${warehouseFromId} no encontrado`);
  }

  if (!almacenDestino) {
    throw new Error(`Almacén destino con ID ${warehouseToId} no encontrado`);
  }

  if (!almacenOrigen.activo) {
    throw new Error(`El almacén origen "${almacenOrigen.nombre}" está inactivo`);
  }

  if (!almacenDestino.activo) {
    throw new Error(`El almacén destino "${almacenDestino.nombre}" está inactivo`);
  }
}

/**
 * Valida que haya stock suficiente en el almacén de origen
 */
async function validarStockSuficiente(
  productId: string, 
  warehouseFromId: string, 
  cantidad: number
): Promise<void> {
  const stockByWarehouse = await prisma.stockByWarehouse.findUnique({
    where: {
      productId_warehouseId: {
        productId,
        warehouseId: warehouseFromId
      }
    },
    include: {
      product: { select: { nombre: true } },
      warehouse: { select: { nombre: true } }
    }
  });

  if (!stockByWarehouse) {
    throw new Error(
      `No existe stock del producto en el almacén de origen. ` +
      `El producto debe tener al menos 1 unidad registrada.`
    );
  }

  if (stockByWarehouse.quantity < cantidad) {
    throw new Error(
      `Stock insuficiente en "${stockByWarehouse.warehouse.nombre}". ` +
      `Disponible: ${stockByWarehouse.quantity}, Requerido: ${cantidad}`
    );
  }
}

/**
 * Valida que el usuario exista
 */
async function validarUsuario(userId: string): Promise<void> {
  const usuario = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, isActive: true }
  });

  if (!usuario) {
    throw new Error(`Usuario con ID ${userId} no encontrado`);
  }

  if (!usuario.isActive) {
    throw new Error('El usuario está inactivo');
  }
}

/**
 * Genera el siguiente código de transferencia (TRF-YYYY-XXX)
 */
async function generarCodigoTransferencia(): Promise<string> {
  const año = new Date().getFullYear();
  const prefix = `TRF-${año}-`;

  // Buscar el último código del año actual
  const ultimaTransferencia = await prisma.stockTransfer.findFirst({
    where: {
      codigo: {
        startsWith: prefix
      }
    },
    orderBy: {
      codigo: 'desc'
    },
    select: {
      codigo: true
    }
  });

  let siguienteNumero = 1;
  
  if (ultimaTransferencia) {
    // Extraer el número del código (TRF-2025-001 -> 001)
    const match = ultimaTransferencia.codigo.match(/-(\d+)$/);
    if (match) {
      siguienteNumero = parseInt(match[1]!, 10) + 1;
    }
  }

  // Formatear con ceros a la izquierda (001, 002, etc.)
  const numeroFormateado = siguienteNumero.toString().padStart(3, '0');
  return `${prefix}${numeroFormateado}`;
}

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

/**
 * Crear una nueva transferencia (estado PENDIENTE)
 */
export async function createTransfer(data: CreateTransferDTO): Promise<TransferRow> {
  // Validar cantidad
  if (data.cantidad <= 0) {
    throw new Error('La cantidad debe ser mayor a 0');
  }

  // Validar usuario solicitante
  await validarUsuario(data.solicitadoPor);

  // Validar producto
  await validarProducto(data.productId);

  // Validar almacenes
  await validarAlmacenes(data.warehouseFromId, data.warehouseToId);

  // Validar stock suficiente en origen
  await validarStockSuficiente(data.productId, data.warehouseFromId, data.cantidad);

  // Generar código único
  const codigo = await generarCodigoTransferencia();

  // Crear transferencia
  const transferencia = await prisma.stockTransfer.create({
    data: {
      codigo,
      productId: data.productId,
      cantidad: data.cantidad,
      warehouseFromId: data.warehouseFromId,
      warehouseToId: data.warehouseToId,
      estado: TransferStatus.PENDIENTE,
      motivoTransferencia: data.motivoTransferencia,
      observaciones: data.observaciones,
      solicitadoPor: data.solicitadoPor
    },
    include: {
      product: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      warehouseFrom: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      warehouseTo: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      solicitante: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      aprobador: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      receptor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  console.log(`✅ Transferencia creada: ${codigo} (${data.cantidad} unidades de ${transferencia.product.nombre})`);

  return transferencia;
}

/**
 * Aprobar transferencia (transacción atómica que actualiza stocks y crea movimientos)
 */
export async function aprobarTransfer(data: AprobarTransferDTO): Promise<TransferRow> {
  // Validar usuario aprobador
  await validarUsuario(data.aprobadoPor);

  if (data.recibidoPor) {
    await validarUsuario(data.recibidoPor);
  }

  // Buscar la transferencia
  const transferencia = await prisma.stockTransfer.findUnique({
    where: { id: data.transferId },
    include: {
      product: { select: { id: true, nombre: true, codigo: true } },
      warehouseFrom: { select: { id: true, nombre: true } },
      warehouseTo: { select: { id: true, nombre: true } }
    }
  });

  if (!transferencia) {
    throw new Error(`Transferencia con ID ${data.transferId} no encontrada`);
  }

  // Validar estado
  if (transferencia.estado !== TransferStatus.PENDIENTE) {
    throw new Error(
      `No se puede aprobar una transferencia en estado ${transferencia.estado}. ` +
      `Solo se pueden aprobar transferencias PENDIENTES.`
    );
  }

  // Validar que aún hay stock suficiente (por si hubo cambios desde la creación)
  await validarStockSuficiente(
    transferencia.productId,
    transferencia.warehouseFromId,
    transferencia.cantidad
  );

  // TRANSACCIÓN ATÓMICA
  const resultado = await prisma.$transaction(async (tx) => {
    // 1. Obtener stock actual en ambos almacenes
    const [stockOrigen, stockDestino] = await Promise.all([
      tx.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: transferencia.productId,
            warehouseId: transferencia.warehouseFromId
          }
        }
      }),
      tx.stockByWarehouse.findUnique({
        where: {
          productId_warehouseId: {
            productId: transferencia.productId,
            warehouseId: transferencia.warehouseToId
          }
        }
      })
    ]);

    if (!stockOrigen) {
      throw new Error('Stock en origen no encontrado');
    }

    const stockAntesOrigen = stockOrigen.quantity;
    const stockDespuesOrigen = stockAntesOrigen - transferencia.cantidad;

    // Verificar nuevamente stock (dentro de transacción)
    if (stockAntesOrigen < transferencia.cantidad) {
      throw new Error(
        `Stock insuficiente en origen durante transacción. ` +
        `Disponible: ${stockAntesOrigen}, Requerido: ${transferencia.cantidad}`
      );
    }

    // 2. Crear registro en almacén destino si no existe
    const stockAntesDestino = stockDestino?.quantity || 0;
    const stockDespuesDestino = stockAntesDestino + transferencia.cantidad;

    if (!stockDestino) {
      await tx.stockByWarehouse.create({
        data: {
          productId: transferencia.productId,
          warehouseId: transferencia.warehouseToId,
          quantity: transferencia.cantidad
        }
      });
    } else {
      await tx.stockByWarehouse.update({
        where: {
          id: stockDestino.id
        },
        data: {
          quantity: stockDespuesDestino
        }
      });
    }

    // 3. Actualizar stock en origen (descontar)
    await tx.stockByWarehouse.update({
      where: {
        id: stockOrigen.id
      },
      data: {
        quantity: stockDespuesOrigen
      }
    });

    // 4. Crear movimiento de SALIDA en almacén origen
    const movimientoSalida = await tx.inventoryMovement.create({
      data: {
        productId: transferencia.productId,
        warehouseId: transferencia.warehouseFromId,
        type: 'SALIDA',
        quantity: transferencia.cantidad,
        stockBefore: stockAntesOrigen,
        stockAfter: stockDespuesOrigen,
        reason: `Transferencia ${transferencia.codigo} a ${transferencia.warehouseTo.nombre}`,
        documentRef: transferencia.codigo,
        userId: data.aprobadoPor
      }
    });

    // 5. Crear movimiento de ENTRADA en almacén destino
    const movimientoEntrada = await tx.inventoryMovement.create({
      data: {
        productId: transferencia.productId,
        warehouseId: transferencia.warehouseToId,
        type: 'ENTRADA',
        quantity: transferencia.cantidad,
        stockBefore: stockAntesDestino,
        stockAfter: stockDespuesDestino,
        reason: `Transferencia ${transferencia.codigo} desde ${transferencia.warehouseFrom.nombre}`,
        documentRef: transferencia.codigo,
        userId: data.recibidoPor || data.aprobadoPor
      }
    });

    // 6. Actualizar transferencia a estado RECIBIDO
    const transferenciaActualizada = await tx.stockTransfer.update({
      where: { id: data.transferId },
      data: {
        estado: TransferStatus.RECIBIDO,
        aprobadoPor: data.aprobadoPor,
        fechaAprobacion: new Date(),
        recibidoPor: data.recibidoPor || data.aprobadoPor,
        fechaRecepcion: new Date(),
        movimientoSalidaId: movimientoSalida.id,
        movimientoEntradaId: movimientoEntrada.id
      },
      include: {
        product: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        warehouseFrom: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        warehouseTo: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        solicitante: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        aprobador: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        receptor: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    console.log(`✅ Transferencia aprobada: ${transferencia.codigo}`);
    console.log(`   - SALIDA: ${transferencia.warehouseFrom.nombre} (${stockAntesOrigen} → ${stockDespuesOrigen})`);
    console.log(`   - ENTRADA: ${transferencia.warehouseTo.nombre} (${stockAntesDestino} → ${stockDespuesDestino})`);

    return transferenciaActualizada;
  });

  return resultado;
}

/**
 * Cancelar transferencia (solo si está PENDIENTE)
 */
export async function cancelarTransfer(transferId: string, userId: string): Promise<TransferRow> {
  // Validar usuario
  await validarUsuario(userId);

  // Buscar transferencia
  const transferencia = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
    select: {
      id: true,
      codigo: true,
      estado: true,
      solicitadoPor: true
    }
  });

  if (!transferencia) {
    throw new Error(`Transferencia con ID ${transferId} no encontrada`);
  }

  // Validar estado
  if (transferencia.estado !== TransferStatus.PENDIENTE) {
    throw new Error(
      `No se puede cancelar una transferencia en estado ${transferencia.estado}. ` +
      `Solo se pueden cancelar transferencias PENDIENTES.`
    );
  }

  // Actualizar estado a CANCELADO
  const transferenciaCancelada = await prisma.stockTransfer.update({
    where: { id: transferId },
    data: {
      estado: TransferStatus.CANCELADO
    },
    include: {
      product: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      warehouseFrom: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      warehouseTo: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      solicitante: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      aprobador: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      receptor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  console.log(`❌ Transferencia cancelada: ${transferencia.codigo}`);

  return transferenciaCancelada;
}

/**
 * Listar transferencias con filtros y paginación
 */
export async function listTransfers(filters: TransferFilters = {}): Promise<Paginated<TransferRow>> {
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const skip = (page - 1) * limit;
  const sortBy = filters.sortBy || 'createdAt';
  const order = filters.order || 'desc';

  // Construir filtros WHERE
  const where: Prisma.StockTransferWhereInput = {};

  if (filters.estado) {
    where.estado = filters.estado;
  }

  if (filters.warehouseFromId) {
    where.warehouseFromId = filters.warehouseFromId;
  }

  if (filters.warehouseToId) {
    where.warehouseToId = filters.warehouseToId;
  }

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.solicitadoPor) {
    where.solicitadoPor = filters.solicitadoPor;
  }

  if (filters.fechaDesde || filters.fechaHasta) {
    where.createdAt = {};
    if (filters.fechaDesde) {
      where.createdAt.gte = filters.fechaDesde;
    }
    if (filters.fechaHasta) {
      where.createdAt.lte = filters.fechaHasta;
    }
  }

  // Búsqueda por código de transferencia o nombre de producto
  if (filters.q) {
    where.OR = [
      {
        codigo: {
          contains: filters.q,
          mode: 'insensitive'
        }
      },
      {
        product: {
          nombre: {
            contains: filters.q,
            mode: 'insensitive'
          }
        }
      },
      {
        product: {
          codigo: {
            contains: filters.q,
            mode: 'insensitive'
          }
        }
      }
    ];
  }

  // Construir orderBy
  let orderBy: Prisma.StockTransferOrderByWithRelationInput = {};
  
  if (sortBy === 'codigo') {
    orderBy = { codigo: order };
  } else if (sortBy === 'producto') {
    orderBy = { product: { nombre: order } };
  } else {
    orderBy = { createdAt: order };
  }

  // Ejecutar consultas en paralelo
  const [transferencias, total] = await Promise.all([
    prisma.stockTransfer.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        product: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        warehouseFrom: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        warehouseTo: {
          select: {
            id: true,
            codigo: true,
            nombre: true
          }
        },
        solicitante: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        aprobador: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        receptor: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    }),
    prisma.stockTransfer.count({ where })
  ]);

  return {
    rows: transferencias,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit)
  };
}

/**
 * Obtener detalle de una transferencia por ID
 */
export async function getTransferById(transferId: string): Promise<TransferRow | null> {
  const transferencia = await prisma.stockTransfer.findUnique({
    where: { id: transferId },
    include: {
      product: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      warehouseFrom: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      warehouseTo: {
        select: {
          id: true,
          codigo: true,
          nombre: true
        }
      },
      solicitante: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      aprobador: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      receptor: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      movimientoSalida: {
        select: {
          id: true,
          createdAt: true,
          stockBefore: true,
          stockAfter: true
        }
      },
      movimientoEntrada: {
        select: {
          id: true,
          createdAt: true,
          stockBefore: true,
          stockAfter: true
        }
      }
    }
  });

  return transferencia;
}
