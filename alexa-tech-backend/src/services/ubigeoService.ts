import { prisma } from '../config/database';

export const ubigeoService = {
  async listDepartamentos() {
    return prisma.departamento.findMany({
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' },
    });
  },

  async listProvinciasByDepartamento(departamentoId: string) {
    const dep = await prisma.departamento.findUnique({ where: { id: departamentoId } });
    if (!dep) {
      throw new Error('Departamento no encontrado');
    }
    return prisma.provincia.findMany({
      where: { departamentoId },
      select: { id: true, nombre: true, departamentoId: true },
      orderBy: { nombre: 'asc' },
    });
  },

  async listDistritosByProvincia(provinciaId: string) {
    const prov = await prisma.provincia.findUnique({ where: { id: provinciaId } });
    if (!prov) {
      throw new Error('Provincia no encontrada');
    }
    return prisma.distrito.findMany({
      where: { provinciaId },
      select: { id: true, nombre: true, provinciaId: true },
      orderBy: { nombre: 'asc' },
    });
  },
};

export default ubigeoService;