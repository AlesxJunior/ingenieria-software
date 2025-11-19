import { prisma } from '../../config/database';
import type { CompanyData, ComprobanteTypeData, PaymentMethodData } from './configuracion.types';

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
}

export const configuracionService = new ConfiguracionService();
