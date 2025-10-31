import { prisma } from '../../config/database';
import { ProductCreateInput, ProductUpdateInput } from '../../types';

export const productService = {
  async create(data: ProductCreateInput, userId?: string) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      // Crear producto como catálogo puro; stock se calcula desde StockByWarehouse
      const product = await tx.product.create({
        data: {
          codigo: data.codigo,
          nombre: data.nombre,
          descripcion: data.descripcion ?? null,
          categoria: data.categoria,
          precioVenta: data.precioVenta as any,
          stock: 0, // se actualizará después
          minStock: data.minStock ?? null,
          estado: data.estado ?? true,
          unidadMedida: data.unidadMedida,
          usuarioCreacion: userId ?? null,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Crear stock inicial por almacén si corresponde
      const cantidadInicial = Number(data.stockInitial?.cantidad ?? 0);
      const warehouseIdInicial = data.stockInitial?.warehouseId;
      if (Number.isInteger(cantidadInicial) && cantidadInicial >= 0 && warehouseIdInicial) {
        await tx.stockByWarehouse.upsert({
          where: { productId_warehouseId: { productId: product.id, warehouseId: warehouseIdInicial } },
          update: { quantity: cantidadInicial, updatedAt: new Date() },
          create: {
            productId: product.id,
            warehouseId: warehouseIdInicial,
            quantity: cantidadInicial,
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
      });

      return updated;
    });
  },

  async findByCodigo(codigo: string) {
    return prisma.product.findUnique({
      where: { codigo },
    });
  },

  async updateByCodigo(
    codigo: string,
    data: ProductUpdateInput,
    userId?: string,
  ) {
    // No actualizar stock directamente aquí; se gestiona por inventario
    return prisma.product.update({
      where: { codigo },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        precioVenta: data.precioVenta as any,
        minStock: data.minStock !== undefined ? data.minStock : undefined,
        estado: data.estado,
        unidadMedida: data.unidadMedida,
        usuarioActualizacion: userId ?? null,
        updatedAt: new Date(),
      },
    });
  },

  async updateStatusByCodigo(codigo: string, estado: boolean, userId?: string) {
    return prisma.product.update({
      where: { codigo },
      data: {
        estado,
        usuarioActualizacion: userId ?? null,
        updatedAt: new Date(),
      },
    });
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

    return prisma.product.findMany({ where, orderBy: { nombre: 'asc' } });
  },
};

export default productService;
