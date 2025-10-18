import { prisma } from '../config/database';
import { ProductCreateInput, ProductUpdateInput } from '../types';

export const productService = {
  async create(data: ProductCreateInput, userId?: string) {
    const now = new Date();
    return prisma.product.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion ?? null,
        categoria: data.categoria,
        precioVenta: data.precioVenta as any,
        stock: data.stock ?? 0,
        estado: data.estado ?? true,
        unidadMedida: data.unidadMedida,
        ubicacion: data.ubicacion ?? null,
        usuarioCreacion: userId ?? null,
        createdAt: now,
        updatedAt: now,
      },
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
    return prisma.product.update({
      where: { codigo },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        categoria: data.categoria,
        precioVenta: data.precioVenta as any,
        stock: data.stock,
        estado: data.estado,
        unidadMedida: data.unidadMedida,
        ubicacion: data.ubicacion,
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
    ubicacion?: string;
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
    if (filters.ubicacion) {
      where.ubicacion = { contains: filters.ubicacion, mode: 'insensitive' };
    }

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
