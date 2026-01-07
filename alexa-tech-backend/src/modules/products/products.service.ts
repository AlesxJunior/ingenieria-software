import { prisma } from '../../config/database';
import { ProductCreateInput, ProductUpdateInput } from '../../types';
import { configuracionService } from '../configuracion/configuracion.service';

export const productService = {
  async create(data: ProductCreateInput, userId?: string) {
    const now = new Date();

    // Si viene categoria (nombre) pero no categoriaId, buscar ID por nombre
    let categoriaId = data.categoriaId;
    if (!categoriaId && data.categoria) {
      const categoriaByNombre = await configuracionService.getCategoryByNombre(data.categoria);
      if (categoriaByNombre && categoriaByNombre.activo) {
        categoriaId = categoriaByNombre.id;
      }
    }

    // Si viene unidadMedida (nombre) pero no unidadMedidaId, buscar ID por nombre
    let unidadMedidaId = data.unidadMedidaId;
    if (!unidadMedidaId && data.unidadMedida) {
      const unidadByNombre = await configuracionService.getUnitByNombre(data.unidadMedida);
      if (unidadByNombre && unidadByNombre.activo) {
        unidadMedidaId = unidadByNombre.id;
      }
    }

    // Validar categoría si se proporciona categoriaId
    if (categoriaId) {
      const categoria = await configuracionService.getCategoryById(categoriaId);
      if (!categoria) {
        throw new Error(`Categoría con ID ${categoriaId} no existe`);
      }
      if (!categoria.activo) {
        throw new Error(`Categoría ${categoria.nombre} está inactiva`);
      }
    }

    // Validar unidad de medida si se proporciona unidadMedidaId
    if (unidadMedidaId) {
      const unidad = await configuracionService.getUnitById(unidadMedidaId);
      if (!unidad) {
        throw new Error(`Unidad de medida con ID ${unidadMedidaId} no existe`);
      }
      if (!unidad.activo) {
        throw new Error(`Unidad de medida ${unidad.nombre} está inactiva`);
      }
    }

    return prisma.$transaction(async (tx) => {
      // Crear producto como catálogo puro; stock se calcula desde StockByWarehouse
      const product = await tx.product.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion ?? null,
          categoriaId: categoriaId ?? null, // FK a tabla maestra (mapeado desde nombre)
          precioVenta: data.precioVenta as any,
          stock: 0, // se actualizará después
          minStock: data.minStock ?? null,
          estado: data.estado ?? true,
          unidadMedidaId: unidadMedidaId ?? null, // FK a tabla maestra (mapeado desde nombre)
          usuarioCreacion: userId ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Crear stock inicial por almacén si corresponde
      const cantidadInicial = Number(data.stockInitial?.cantidad ?? 0);
      const warehouseIdInicial = data.stockInitial?.warehouseId;
      if (Number.isInteger(cantidadInicial) && cantidadInicial > 0 && warehouseIdInicial) {
        // Crear registro en StockByWarehouse
        await tx.stockByWarehouse.upsert({
          where: { productId_warehouseId: { productId: product.id, warehouseId: warehouseIdInicial } },
          update: { quantity: cantidadInicial, updatedAt: new Date() },
          create: {
            productId: product.id,
            warehouseId: warehouseIdInicial,
            quantity: cantidadInicial,
          },
        });

        // Crear movimiento de inventario tipo ENTRADA con motivo "Stock Inicial"
        await tx.inventoryMovement.create({
          data: {
            productId: product.id,
            warehouseId: warehouseIdInicial,
            type: 'ENTRADA',
            quantity: cantidadInicial,
            reason: 'Stock Inicial',
            stockBefore: 0,
            stockAfter: cantidadInicial,
            userId: userId ?? null,
            createdAt: now,
          },
        });
      }

      // Recalcular stock total del producto desde StockByWarehouse
      const totalByProduct = await tx.stockByWarehouse.aggregate({
        where: { productId: product.id },
        _sum: { quantity: true },
      });
      const total = totalByProduct._sum.quantity ?? 0;

      const updated = await tx.product.update({
        where: { id: product.id },
        data: { stock: total, updatedAt: new Date() },
        include: {
          stockByWarehouses: {
            select: { quantity: true }
          }
        }
      });

      // Calculate real stock from all warehouses
      const totalStock = updated.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
      return {
        ...updated,
        initialStock: totalStock,
        currentStock: totalStock,
        stockByWarehouses: undefined
      };
    });
  },

  async findByCodigo(codigo: string) {
    const product = await prisma.product.findUnique({
      where: { codigo },
      include: {
        stockByWarehouses: {
          select: {
            quantity: true
          }
        }
      }
    });

    if (!product) return null;

    // Calcular stock real agregado de todos los almacenes
    const totalStock = product.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);

    return {
      ...product,
      initialStock: totalStock,
      currentStock: totalStock,
      stockByWarehouses: undefined
    };
  },

  async updateByCodigo(
    codigo: string,
    data: ProductUpdateInput,
    userId?: string,
  ) {
    // Validar categoría si se proporciona categoriaId
    if (data.categoriaId !== undefined) {
      if (data.categoriaId) {
        const categoria = await configuracionService.getCategoryById(data.categoriaId);
        if (!categoria) {
          throw new Error(`Categoría con ID ${data.categoriaId} no existe`);
        }
        if (!categoria.activo) {
          throw new Error(`Categoría ${categoria.nombre} está inactiva`);
        }
      }
    }

    // Validar unidad de medida si se proporciona unidadMedidaId
    if (data.unidadMedidaId !== undefined) {
      if (data.unidadMedidaId) {
        const unidad = await configuracionService.getUnitById(data.unidadMedidaId);
        if (!unidad) {
          throw new Error(`Unidad de medida con ID ${data.unidadMedidaId} no existe`);
        }
        if (!unidad.activo) {
          throw new Error(`Unidad de medida ${unidad.nombre} está inactiva`);
        }
      }
    }

    // No actualizar stock directamente aquí; se gestiona por inventario
    const updated = await prisma.product.update({
      where: { codigo },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoriaId: data.categoriaId !== undefined ? data.categoriaId : undefined,
        precioVenta: data.precioVenta as any,
        minStock: data.minStock !== undefined ? data.minStock : undefined,
        estado: data.estado,
        unidadMedidaId: data.unidadMedidaId !== undefined ? data.unidadMedidaId : undefined,
        usuarioActualizacion: userId ?? null,
        updatedAt: new Date(),
      },
      include: {
        stockByWarehouses: {
          select: { quantity: true }
        }
      }
    });

    // Calculate real stock from all warehouses
    const totalStock = updated.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
    return {
      ...updated,
      initialStock: totalStock,
      currentStock: totalStock,
      stockByWarehouses: undefined
    };
  },

  async updateStatusByCodigo(codigo: string, estado: boolean, userId?: string) {
    const updated = await prisma.product.update({
      where: { codigo },
      data: {
        estado,
        usuarioActualizacion: userId ?? null,
        updatedAt: new Date(),
      },
      include: {
        stockByWarehouses: {
          select: { quantity: true }
        }
      }
    });

    // Calculate real stock from all warehouses
    const totalStock = updated.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
    return {
      ...updated,
      initialStock: totalStock,
      currentStock: totalStock,
      stockByWarehouses: undefined
    };
  },

  async deleteByCodigo(codigo: string, userId?: string) {
    // Soft delete: marcar como inactivo
    const deleted = await prisma.product.update({
      where: { codigo },
      data: {
        estado: false,
        usuarioActualizacion: userId ?? null,
        updatedAt: new Date(),
      },
      include: {
        stockByWarehouses: {
          select: { quantity: true }
        }
      }
    });

    // Calculate real stock from all warehouses
    const totalStock = deleted.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
    return {
      ...deleted,
      initialStock: totalStock,
      currentStock: totalStock,
      stockByWarehouses: undefined
    };
  },

  async list(filters: {
    categoria?: string;
    estado?: boolean;
    unidadMedida?: string;
    q?: string;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    maxStock?: number;
  }) {
    const where: any = {};
    if (filters.categoria) where.categoria = filters.categoria;
    if (typeof filters.estado === 'boolean') where.estado = filters.estado;
    if (filters.unidadMedida) where.unidadMedida = filters.unidadMedida;

    if (filters.q) {
      where.OR = [
        { nombre: { contains: filters.q, mode: 'insensitive' } },
        { descripcion: { contains: filters.q, mode: 'insensitive' } },
        { codigo: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrecio != null || filters.maxPrecio != null) {
      where.precioVenta = {};
      if (filters.minPrecio != null)
        where.precioVenta.gte = Number(filters.minPrecio);
      if (filters.maxPrecio != null)
        where.precioVenta.lte = Number(filters.maxPrecio);
    }

    if (filters.minStock != null || filters.maxStock != null) {
      where.stock = {};
      if (filters.minStock != null) where.stock.gte = Number(filters.minStock);
      if (filters.maxStock != null) where.stock.lte = Number(filters.maxStock);
    }

    const products = await prisma.product.findMany({ 
      where, 
      orderBy: { nombre: 'asc' },
      include: {
        categoria: {
          select: { id: true, codigo: true, nombre: true }
        },
        unidadMedida: {
          select: { id: true, codigo: true, nombre: true }
        },
        stockByWarehouses: {
          select: { quantity: true }
        }
      }
    });

    // Calculate real stock from all warehouses
    return products.map(product => {
      const totalStock = product.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
      return {
        ...product,
        initialStock: totalStock,
        currentStock: totalStock,
        stockByWarehouses: undefined
      };
    });
  },

  async listPaginated(filters: {
    categoria?: string;
    estado?: boolean;
    unidadMedida?: string;
    q?: string;
    minPrecio?: number;
    maxPrecio?: number;
    minStock?: number;
    maxStock?: number;
  }, pagination: { limit: number; offset: number }) {
    const where: any = {};
    if (filters.categoria) where.categoria = filters.categoria;
    if (typeof filters.estado === 'boolean') where.estado = filters.estado;
    if (filters.unidadMedida) where.unidadMedida = filters.unidadMedida;

    if (filters.q) {
      where.OR = [
        { nombre: { contains: filters.q, mode: 'insensitive' } },
        { descripcion: { contains: filters.q, mode: 'insensitive' } },
        { codigo: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.minPrecio != null || filters.maxPrecio != null) {
      where.precioVenta = {};
      if (filters.minPrecio != null)
        where.precioVenta.gte = Number(filters.minPrecio);
      if (filters.maxPrecio != null)
        where.precioVenta.lte = Number(filters.maxPrecio);
    }

    if (filters.minStock != null || filters.maxStock != null) {
      where.stock = {};
      if (filters.minStock != null) where.stock.gte = Number(filters.minStock);
      if (filters.maxStock != null) where.stock.lte = Number(filters.maxStock);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip: pagination.offset,
        take: pagination.limit,
        include: {
          categoria: {
            select: { id: true, codigo: true, nombre: true }
          },
          unidadMedida: {
            select: { id: true, codigo: true, nombre: true }
          },
          stockByWarehouses: {
            select: {
              quantity: true
            }
          }
        }
      }),
      prisma.product.count({ where }),
    ]);

    // Calcular stock real agregado de todos los almacenes
    const productsWithRealStock = products.map(product => {
      const totalStock = product.stockByWarehouses.reduce((sum: number, stock: any) => sum + stock.quantity, 0);
      
      return {
        ...product,
        initialStock: totalStock, // Campo que usa el frontend
        currentStock: totalStock, // Alias para compatibilidad
        // Eliminar la relación stockByWarehouses del response para no enviar datos innecesarios
        stockByWarehouses: undefined
      };
    });

    return { products: productsWithRealStock, total };
  },
};

export default productService;
