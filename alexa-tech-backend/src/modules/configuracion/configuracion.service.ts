import { prisma } from '../../config/database';
import type { 
  CompanyData, 
  ComprobanteTypeData, 
  PaymentMethodData,
  ProductCategoryData,
  ProductCategoryInput,
  ProductCategoryResponse,
  UnitOfMeasureData,
  UnitOfMeasureInput,
  UnitOfMeasureResponse
} from './configuracion.types';

// Servicio de Configuración - Maneja empresa, tipos de comprobantes y métodos de pago
export class ConfiguracionService {
  // ==========================================
  // EMPRESA
  // ==========================================

  async getCompany(): Promise<CompanyData | null> {
    const company = await prisma.company.findFirst();
    if (!company) return null;
    
    return {
      ...company,
      igvPorcentaje: Number(company.igvPorcentaje),
    } as CompanyData;
  }

  async updateCompany(data: Partial<CompanyData>): Promise<CompanyData> {
    // Buscar si ya existe una empresa
    const existing = await prisma.company.findFirst();

    if (existing) {
      // Actualizar
      const updated = await prisma.company.update({
        where: { id: existing.id },
        data: {
          ...data,
          igvPorcentaje: data.igvPorcentaje !== undefined ? Number(data.igvPorcentaje) : undefined,
        },
      });
      return {
        ...updated,
        igvPorcentaje: Number(updated.igvPorcentaje),
      } as CompanyData;
    } else {
      // Crear nueva
      const created = await prisma.company.create({
        data: {
          ruc: data.ruc || '',
          razonSocial: data.razonSocial || '',
          nombreComercial: data.nombreComercial || '',
          direccion: data.direccion || '',
          telefono: data.telefono || '',
          email: data.email || '',
          website: data.website,
          logo: data.logo,
          igvActivo: data.igvActivo ?? true,
          igvPorcentaje: data.igvPorcentaje ? Number(data.igvPorcentaje) : 18,
          moneda: data.moneda || 'PEN',
          pais: data.pais || 'Perú',
          departamento: data.departamento || '',
          provincia: data.provincia || '',
          distrito: data.distrito || '',
          codigoPostal: data.codigoPostal,
          sunatUsuario: data.sunatUsuario,
          sunatClave: data.sunatClave,
          sunatServidor: data.sunatServidor || 'homologacion',
        },
      });
      return {
        ...created,
        igvPorcentaje: Number(created.igvPorcentaje),
      } as CompanyData;
    }
  }

  // ==========================================
  // TIPOS DE COMPROBANTES
  // ==========================================

  async getAllComprobanteTypes(): Promise<ComprobanteTypeData[]> {
    const comprobantes = await prisma.comprobanteType.findMany({
      orderBy: { nombre: 'asc' },
    });
    return comprobantes as ComprobanteTypeData[];
  }

  async getComprobanteTypeById(id: string): Promise<ComprobanteTypeData | null> {
    const comprobante = await prisma.comprobanteType.findUnique({
      where: { id },
    });
    return comprobante as ComprobanteTypeData | null;
  }

  async createComprobanteType(data: Omit<ComprobanteTypeData, 'id' | 'createdAt' | 'updatedAt'>): Promise<ComprobanteTypeData> {
    // Si es predeterminado, desactivar otros predeterminados del mismo tipo
    if (data.predeterminado) {
      await prisma.comprobanteType.updateMany({
        where: { tipo: data.tipo, predeterminado: true },
        data: { predeterminado: false },
      });
    }

    const comprobante = await prisma.comprobanteType.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        serie: data.serie,
        numeroActual: data.numeroActual,
        numeroInicio: data.numeroInicio,
        numeroFin: data.numeroFin,
        activo: data.activo,
        predeterminado: data.predeterminado,
      },
    });
    return comprobante as ComprobanteTypeData;
  }

  async updateComprobanteType(id: string, data: Partial<ComprobanteTypeData>): Promise<ComprobanteTypeData> {
    // Si es predeterminado, desactivar otros predeterminados del mismo tipo
    if (data.predeterminado) {
      const current = await prisma.comprobanteType.findUnique({ where: { id } });
      if (current) {
        await prisma.comprobanteType.updateMany({
          where: { tipo: current.tipo, predeterminado: true, id: { not: id } },
          data: { predeterminado: false },
        });
      }
    }

    const comprobante = await prisma.comprobanteType.update({
      where: { id },
      data,
    });
    return comprobante as ComprobanteTypeData;
  }

  async deleteComprobanteType(id: string): Promise<void> {
    await prisma.comprobanteType.delete({
      where: { id },
    });
  }

  // ==========================================
  // MÉTODOS DE PAGO
  // ==========================================

  async getAllPaymentMethods(): Promise<PaymentMethodData[]> {
    const methods = await prisma.paymentMethodConfig.findMany({
      orderBy: { nombre: 'asc' },
    });
    return methods as PaymentMethodData[];
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethodData | null> {
    const method = await prisma.paymentMethodConfig.findUnique({
      where: { id },
    });
    return method as PaymentMethodData | null;
  }

  async createPaymentMethod(data: Omit<PaymentMethodData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethodData> {
    // Si es predeterminado, desactivar otros predeterminados del mismo tipo
    if (data.predeterminado) {
      await prisma.paymentMethodConfig.updateMany({
        where: { tipo: data.tipo, predeterminado: true },
        data: { predeterminado: false },
      });
    }

    const method = await prisma.paymentMethodConfig.create({
      data: {
        codigo: data.codigo,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        activo: data.activo,
        predeterminado: data.predeterminado,
        requiereReferencia: data.requiereReferencia,
      },
    });
    return method as PaymentMethodData;
  }

  async updatePaymentMethod(id: string, data: Partial<PaymentMethodData>): Promise<PaymentMethodData> {
    // Si es predeterminado, desactivar otros predeterminados del mismo tipo
    if (data.predeterminado) {
      const current = await prisma.paymentMethodConfig.findUnique({ where: { id } });
      if (current) {
        await prisma.paymentMethodConfig.updateMany({
          where: { tipo: current.tipo, predeterminado: true, id: { not: id } },
          data: { predeterminado: false },
        });
      }
    }

    const method = await prisma.paymentMethodConfig.update({
      where: { id },
      data,
    });
    return method as PaymentMethodData;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await prisma.paymentMethodConfig.delete({
      where: { id },
    });
  }

  // ==========================================
  // CATEGORÍAS DE PRODUCTOS
  // ==========================================

  async getAllCategories(): Promise<ProductCategoryResponse[]> {
    const categories = await prisma.productCategory.findMany({
      orderBy: { nombre: 'asc' },
    });
    return categories as ProductCategoryResponse[];
  }

  async getActiveCategories(): Promise<ProductCategoryResponse[]> {
    const categories = await prisma.productCategory.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    return categories as ProductCategoryResponse[];
  }

  async getInactiveCategories(): Promise<ProductCategoryResponse[]> {
    const categories = await prisma.productCategory.findMany({
      where: { activo: false },
      orderBy: { nombre: 'asc' },
    });
    return categories as ProductCategoryResponse[];
  }

  async getCategoryById(id: string): Promise<ProductCategoryResponse | null> {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });
    return category as ProductCategoryResponse | null;
  }

  async getCategoryByCodigo(codigo: string): Promise<ProductCategoryResponse | null> {
    const category = await prisma.productCategory.findUnique({
      where: { codigo },
    });
    return category as ProductCategoryResponse | null;
  }

  async getCategoryByNombre(nombre: string): Promise<ProductCategoryResponse | null> {
    const category = await prisma.productCategory.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
    });
    return category as ProductCategoryResponse | null;
  }

  async createCategory(data: ProductCategoryInput, userId?: string): Promise<ProductCategoryResponse> {
    // Verificar que el código no exista
    const existing = await prisma.productCategory.findUnique({
      where: { codigo: data.codigo },
    });
    
    if (existing) {
      throw new Error(`Ya existe una categoría con el código ${data.codigo}`);
    }

    // Verificar que el nombre no exista
    const existingName = await prisma.productCategory.findUnique({
      where: { nombre: data.nombre },
    });
    
    if (existingName) {
      throw new Error(`Ya existe una categoría con el nombre ${data.nombre}`);
    }

    const category = await prisma.productCategory.create({
      data: {
        codigo: data.codigo.toUpperCase(),
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
        createdBy: userId,
      },
    });
    
    return category as ProductCategoryResponse;
  }

  async updateCategory(id: string, data: Partial<ProductCategoryInput>, userId?: string): Promise<ProductCategoryResponse> {
    // Si se actualiza el código, verificar que no exista
    if (data.codigo) {
      const existing = await prisma.productCategory.findUnique({
        where: { codigo: data.codigo },
      });
      
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe otra categoría con el código ${data.codigo}`);
      }
    }

    // Si se actualiza el nombre, verificar que no exista
    if (data.nombre) {
      const existingName = await prisma.productCategory.findUnique({
        where: { nombre: data.nombre },
      });
      
      if (existingName && existingName.id !== id) {
        throw new Error(`Ya existe otra categoría con el nombre ${data.nombre}`);
      }
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(data.codigo && { codigo: data.codigo.toUpperCase() }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.activo !== undefined && { activo: data.activo }),
        updatedBy: userId,
      },
    });
    
    return category as ProductCategoryResponse;
  }

  async deleteCategory(id: string, userId?: string): Promise<ProductCategoryResponse> {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Soft delete - marcar como inactivo
    const updated = await prisma.productCategory.update({
      where: { id },
      data: { 
        activo: false,
        updatedBy: userId,
      },
    });

    return updated as ProductCategoryResponse;
  }

  async hardDeleteCategory(id: string): Promise<void> {
    const category = await prisma.productCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error('Categoría no encontrada');
    }

    // Verificar que no haya productos usando esta categoría
    const productsCount = await prisma.product.count({
      where: { categoriaId: id },
    });

    if (productsCount > 0) {
      throw new Error(`No se puede eliminar la categoría porque tiene ${productsCount} productos asociados`);
    }

    await prisma.productCategory.delete({
      where: { id },
    });
  }

  // ==========================================
  // UNIDADES DE MEDIDA
  // ==========================================

  async getAllUnits(): Promise<UnitOfMeasureResponse[]> {
    const units = await prisma.unitOfMeasure.findMany({
      orderBy: { nombre: 'asc' },
    });
    return units as UnitOfMeasureResponse[];
  }

  async getActiveUnits(): Promise<UnitOfMeasureResponse[]> {
    const units = await prisma.unitOfMeasure.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' },
    });
    return units as UnitOfMeasureResponse[];
  }

  async getInactiveUnits(): Promise<UnitOfMeasureResponse[]> {
    const units = await prisma.unitOfMeasure.findMany({
      where: { activo: false },
      orderBy: { nombre: 'asc' },
    });
    return units as UnitOfMeasureResponse[];
  }

  async getUnitById(id: string): Promise<UnitOfMeasureResponse | null> {
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id },
    });
    return unit as UnitOfMeasureResponse | null;
  }

  async getUnitByCodigo(codigo: string): Promise<UnitOfMeasureResponse | null> {
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { codigo },
    });
    return unit as UnitOfMeasureResponse | null;
  }

  async getUnitByNombre(nombre: string): Promise<UnitOfMeasureResponse | null> {
    const unit = await prisma.unitOfMeasure.findFirst({
      where: { nombre: { equals: nombre, mode: 'insensitive' } },
    });
    return unit as UnitOfMeasureResponse | null;
  }

  async createUnit(data: UnitOfMeasureInput, userId?: string): Promise<UnitOfMeasureResponse> {
    // Verificar que el código no exista
    const existing = await prisma.unitOfMeasure.findUnique({
      where: { codigo: data.codigo },
    });
    
    if (existing) {
      throw new Error(`Ya existe una unidad de medida con el código ${data.codigo}`);
    }

    // Verificar que el nombre no exista
    const existingName = await prisma.unitOfMeasure.findUnique({
      where: { nombre: data.nombre },
    });
    
    if (existingName) {
      throw new Error(`Ya existe una unidad de medida con el nombre ${data.nombre}`);
    }

    const unit = await prisma.unitOfMeasure.create({
      data: {
        codigo: data.codigo.toUpperCase(),
        nombre: data.nombre,
        simbolo: data.simbolo,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
        createdBy: userId,
      },
    });
    
    return unit as UnitOfMeasureResponse;
  }

  async updateUnit(id: string, data: Partial<UnitOfMeasureInput>, userId?: string): Promise<UnitOfMeasureResponse> {
    // Si se actualiza el código, verificar que no exista
    if (data.codigo) {
      const existing = await prisma.unitOfMeasure.findUnique({
        where: { codigo: data.codigo },
      });
      
      if (existing && existing.id !== id) {
        throw new Error(`Ya existe otra unidad de medida con el código ${data.codigo}`);
      }
    }

    // Si se actualiza el nombre, verificar que no exista
    if (data.nombre) {
      const existingName = await prisma.unitOfMeasure.findUnique({
        where: { nombre: data.nombre },
      });
      
      if (existingName && existingName.id !== id) {
        throw new Error(`Ya existe otra unidad de medida con el nombre ${data.nombre}`);
      }
    }

    const unit = await prisma.unitOfMeasure.update({
      where: { id },
      data: {
        ...(data.codigo && { codigo: data.codigo.toUpperCase() }),
        ...(data.nombre && { nombre: data.nombre }),
        ...(data.simbolo !== undefined && { simbolo: data.simbolo }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.activo !== undefined && { activo: data.activo }),
        updatedBy: userId,
      },
    });
    
    return unit as UnitOfMeasureResponse;
  }

  async deleteUnit(id: string, userId?: string): Promise<UnitOfMeasureResponse> {
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new Error('Unidad de medida no encontrada');
    }

    // Soft delete - marcar como inactivo
    const updated = await prisma.unitOfMeasure.update({
      where: { id },
      data: { 
        activo: false,
        updatedBy: userId,
      },
    });

    return updated as UnitOfMeasureResponse;
  }

  async hardDeleteUnit(id: string): Promise<void> {
    const unit = await prisma.unitOfMeasure.findUnique({
      where: { id },
    });

    if (!unit) {
      throw new Error('Unidad de medida no encontrada');
    }

    // Verificar que no haya productos usando esta unidad
    const productsCount = await prisma.product.count({
      where: { unidadMedidaId: id },
    });

    if (productsCount > 0) {
      throw new Error(`No se puede eliminar la unidad de medida porque tiene ${productsCount} productos asociados`);
    }

    await prisma.unitOfMeasure.delete({
      where: { id },
    });
  }
}

export const configuracionService = new ConfiguracionService();
