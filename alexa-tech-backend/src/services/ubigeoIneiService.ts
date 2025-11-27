/**
 * Servicio para consumir ubigeo desde API pública del INEI Perú
 * API: https://apis.net.pe/api-ubigeo-peru
 */

interface DepartamentoINEI {
  id_ubigeo: string;
  nombre_ubigeo: string;
}

interface ProvinciaINEI {
  id_ubigeo: string;
  nombre_ubigeo: string;
  id_dep: string;
}

interface DistritoINEI {
  id_ubigeo: string;
  nombre_ubigeo: string;
  id_prov: string;
}

const INEI_API_BASE = 'https://api.apis.net.pe/v2/ubigeo';

export const ubigeoIneiService = {
  /**
   * Obtener todos los departamentos del Perú (25 departamentos)
   */
  async getDepartamentos(): Promise<DepartamentoINEI[]> {
    try {
      const response = await fetch(`${INEI_API_BASE}/departamentos`);
      if (!response.ok) throw new Error('Error al obtener departamentos');
      return await response.json() as DepartamentoINEI[];
    } catch (error) {
      console.error('Error ubigeo INEI departamentos:', error);
      return [];
    }
  },

  /**
   * Obtener provincias por departamento
   */
  async getProvinciasByDepartamento(idDep: string): Promise<ProvinciaINEI[]> {
    try {
      const response = await fetch(`${INEI_API_BASE}/provincias/${idDep}`);
      if (!response.ok) throw new Error('Error al obtener provincias');
      return await response.json() as ProvinciaINEI[];
    } catch (error) {
      console.error('Error ubigeo INEI provincias:', error);
      return [];
    }
  },

  /**
   * Obtener distritos por provincia
   */
  async getDistritosByProvincia(idProv: string): Promise<DistritoINEI[]> {
    try {
      const response = await fetch(`${INEI_API_BASE}/distritos/${idProv}`);
      if (!response.ok) throw new Error('Error al obtener distritos');
      return await response.json() as DistritoINEI[];
    } catch (error) {
      console.error('Error ubigeo INEI distritos:', error);
      return [];
    }
  },

  /**
   * Buscar departamento por nombre (útil para autocompletado SUNAT)
   */
  async findDepartamentoByName(name: string): Promise<DepartamentoINEI | null> {
    const deps = await this.getDepartamentos();
    const normalized = name.toUpperCase().trim();
    return deps.find(d => 
      d.nombre_ubigeo.toUpperCase().includes(normalized) ||
      normalized.includes(d.nombre_ubigeo.toUpperCase())
    ) || null;
  },

  /**
   * Buscar provincia por nombre dentro de un departamento
   */
  async findProvinciaByName(idDep: string, name: string): Promise<ProvinciaINEI | null> {
    const provs = await this.getProvinciasByDepartamento(idDep);
    const normalized = name.toUpperCase().trim();
    return provs.find(p => 
      p.nombre_ubigeo.toUpperCase().includes(normalized) ||
      normalized.includes(p.nombre_ubigeo.toUpperCase())
    ) || null;
  },

  /**
   * Buscar distrito por nombre dentro de una provincia
   */
  async findDistritoByName(idProv: string, name: string): Promise<DistritoINEI | null> {
    const dists = await this.getDistritosByProvincia(idProv);
    const normalized = name.toUpperCase().trim();
    return dists.find(d => 
      d.nombre_ubigeo.toUpperCase().includes(normalized) ||
      normalized.includes(d.nombre_ubigeo.toUpperCase())
    ) || null;
  }
};

export default ubigeoIneiService;
