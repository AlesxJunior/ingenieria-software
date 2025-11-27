// SUNAT API Service - Proxy para consultas de RUC y DNI
// ============================================
// CONFIGURACIÓN PROFESIONAL DE APIS
// ============================================
// 
// OPCIÓN 1 - apis.net.pe (Recomendado para producción)
//   - Registrarse en: https://apis.net.pe
//   - Plan gratuito: 25 consultas/día
//   - Plan básico: ~$5/mes con 1000 consultas
//   - Agregar en .env: SUNAT_API_TOKEN=tu-token
//
// OPCIÓN 2 - apiperu.dev (Alternativa gratuita)
//   - Registrarse en: https://apiperu.dev
//   - Plan gratuito: 50 consultas/día
//   - Agregar en .env: API_PERU_TOKEN=tu-token
//
// OPCIÓN 3 - migo.pe (Otra alternativa)
//   - API gratuita sin registro para desarrollo
//   - Límite: 100 consultas/día por IP
// ============================================

interface SunatRucResponse {
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  estado: string;
  condicion: string;
  ubigeo?: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  tipoVia?: string;
  nombreVia?: string;
  codigoZona?: string;
  tipoZona?: string;
  numero?: string;
  interior?: string;
  lote?: string;
  departamentoEmpresa?: string;
  manzana?: string;
  kilometro?: string;
}

interface ReniecDniResponse {
  dni: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  codVerifica?: string;
}

interface SunatServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  source?: string; // Indica qué API respondió
}

// ============================================
// CONFIGURACIÓN DE APIS
// ============================================

// API 1: decolecta.com (antes apis.net.pe - migrado 2024)
const APIS_NET_TOKEN = process.env.SUNAT_API_TOKEN || '';
const APIS_NET_BASE = 'https://api.decolecta.com/v1';

// API 2: apiperu.dev (requiere token de https://apiperu.dev)
const API_PERU_TOKEN = process.env.API_PERU_TOKEN || '';
const API_PERU_BASE = 'https://apiperu.dev/api';

// API 3: dniruc.com - API gratuita (sin token, con límites)
const DNIRUC_BASE = 'https://api.dniruc.com/api/v1';

// API 4: Facturacion API (alternativa)
const FACTURACION_TOKEN = process.env.FACTURACION_API_TOKEN || '';

export const sunatService = {
  /**
   * Consulta información de una empresa por RUC
   * Intenta múltiples APIs con fallback automático
   */
  async consultarRuc(ruc: string): Promise<SunatServiceResponse<SunatRucResponse>> {
    // Validar formato de RUC
    if (!/^\d{11}$/.test(ruc)) {
      return {
        success: false,
        message: 'El RUC debe tener 11 dígitos numéricos',
      };
    }

    // Intentar con las APIs disponibles en orden de prioridad
    const apis = [
      { name: 'decolecta.com', fn: () => this.consultarRucApisNet(ruc), enabled: !!APIS_NET_TOKEN },
      { name: 'apiperu.dev', fn: () => this.consultarRucApiPeru(ruc), enabled: !!API_PERU_TOKEN },
    ];

    for (const api of apis) {
      if (!api.enabled) continue;
      
      try {
        console.log(`🔍 Consultando RUC en ${api.name}...`);
        const result = await api.fn();
        if (result.success) {
          console.log(`✅ RUC encontrado en ${api.name}`);
          return { ...result, source: api.name };
        }
      } catch (error) {
        console.log(`⚠️ ${api.name} falló:`, error instanceof Error ? error.message : 'Error desconocido');
      }
    }

    return {
      success: false,
      message: 'No se pudo obtener información del RUC. Configure un token de API en las variables de entorno (SUNAT_API_TOKEN o API_PERU_TOKEN). Ver documentación en sunat.service.ts',
    };
  },

  /**
   * Consulta información de una persona por DNI
   * Intenta múltiples APIs con fallback automático
   */
  async consultarDni(dni: string): Promise<SunatServiceResponse<ReniecDniResponse>> {
    // Validar formato de DNI
    if (!/^\d{8}$/.test(dni)) {
      return {
        success: false,
        message: 'El DNI debe tener 8 dígitos numéricos',
      };
    }

    // Intentar con las APIs disponibles
    const apis = [
      { name: 'decolecta.com', fn: () => this.consultarDniApisNet(dni), enabled: !!APIS_NET_TOKEN },
      { name: 'apiperu.dev', fn: () => this.consultarDniApiPeru(dni), enabled: !!API_PERU_TOKEN },
    ];

    for (const api of apis) {
      if (!api.enabled) continue;
      
      try {
        console.log(`🔍 Consultando DNI en ${api.name}...`);
        const result = await api.fn();
        if (result.success) {
          console.log(`✅ DNI encontrado en ${api.name}`);
          return { ...result, source: api.name };
        }
      } catch (error) {
        console.log(`⚠️ ${api.name} falló:`, error instanceof Error ? error.message : 'Error desconocido');
      }
    }

    return {
      success: false,
      message: 'No se pudo obtener información del DNI. Configure un token de API en las variables de entorno (SUNAT_API_TOKEN o API_PERU_TOKEN). Ver documentación en sunat.service.ts',
    };
  },

  // ============================================
  // APIs ESPECÍFICAS
  // ============================================

  // API 1: decolecta.com (antes apis.net.pe)
  async consultarRucApisNet(ruc: string): Promise<SunatServiceResponse<SunatRucResponse>> {
    console.log(`📡 Request: GET ${APIS_NET_BASE}/sunat/ruc?numero=${ruc}`);
    const response = await fetch(`${APIS_NET_BASE}/sunat/ruc?numero=${ruc}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${APIS_NET_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as Record<string, unknown>;
    console.log(`📦 RUC Response:`, JSON.stringify(data).substring(0, 300));

    // La API decolecta.com usa snake_case: razon_social, numero_documento, etc.
    return {
      success: true,
      data: {
        ruc: (data.numero_documento as string) || (data.numeroDocumento as string) || ruc,
        razonSocial: (data.razon_social as string) || (data.razonSocial as string) || '',
        nombreComercial: (data.nombre_comercial as string) || (data.nombreComercial as string),
        direccion: data.direccion as string,
        estado: (data.estado as string) || 'ACTIVO',
        condicion: (data.condicion as string) || 'HABIDO',
        departamento: data.departamento as string,
        provincia: data.provincia as string,
        distrito: data.distrito as string,
      },
    };
  },

  // API 2: apiperu.dev
  async consultarRucApiPeru(ruc: string): Promise<SunatServiceResponse<SunatRucResponse>> {
    const response = await fetch(`${API_PERU_BASE}/ruc/${ruc}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_PERU_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json() as Record<string, unknown>;
    const data = (result.data || result) as Record<string, unknown>;

    return {
      success: true,
      data: {
        ruc: (data.ruc as string) || ruc,
        razonSocial: (data.nombre_o_razon_social as string) || (data.razonSocial as string) || '',
        nombreComercial: (data.nombre_comercial as string) || (data.nombreComercial as string),
        direccion: (data.direccion as string) || (data.direccion_completa as string),
        estado: (data.estado as string) || 'ACTIVO',
        condicion: (data.condicion as string) || 'HABIDO',
        departamento: data.departamento as string,
        provincia: data.provincia as string,
        distrito: data.distrito as string,
      },
    };
  },

  // API 3: dniruc.com (gratuita)
  async consultarRucDniruc(ruc: string): Promise<SunatServiceResponse<SunatRucResponse>> {
    const response = await fetch(`${DNIRUC_BASE}/ruc/${ruc}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as Record<string, unknown>;

    if (!data.success && !data.ruc && !data.razonSocial) {
      throw new Error('RUC no encontrado');
    }

    return {
      success: true,
      data: {
        ruc: (data.ruc as string) || ruc,
        razonSocial: (data.razonSocial as string) || (data.nombre as string) || '',
        nombreComercial: data.nombreComercial as string,
        direccion: data.direccion as string,
        estado: (data.estado as string) || 'ACTIVO',
        condicion: (data.condicion as string) || 'HABIDO',
        departamento: data.departamento as string,
        provincia: data.provincia as string,
        distrito: data.distrito as string,
      },
    };
  },

  // API 1: decolecta.com - DNI (antes apis.net.pe)
  async consultarDniApisNet(dni: string): Promise<SunatServiceResponse<ReniecDniResponse>> {
    console.log(`📡 Request: GET ${APIS_NET_BASE}/reniec/dni?numero=${dni}`);
    const response = await fetch(`${APIS_NET_BASE}/reniec/dni?numero=${dni}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${APIS_NET_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as Record<string, unknown>;
    console.log(`📦 DNI Response:`, JSON.stringify(data));

    // La API decolecta.com usa snake_case: first_name, first_last_name, second_last_name, document_number
    return {
      success: true,
      data: {
        dni: (data.document_number as string) || (data.numeroDocumento as string) || dni,
        nombres: (data.first_name as string) || (data.nombres as string) || '',
        apellidoPaterno: (data.first_last_name as string) || (data.apellidoPaterno as string) || '',
        apellidoMaterno: (data.second_last_name as string) || (data.apellidoMaterno as string) || '',
        codVerifica: data.codVerifica as string,
      },
    };
  },

  // API 2: apiperu.dev - DNI
  async consultarDniApiPeru(dni: string): Promise<SunatServiceResponse<ReniecDniResponse>> {
    const response = await fetch(`${API_PERU_BASE}/dni/${dni}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_PERU_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json() as Record<string, unknown>;
    const data = (result.data || result) as Record<string, unknown>;

    return {
      success: true,
      data: {
        dni: (data.dni as string) || (data.numero as string) || dni,
        nombres: (data.nombres as string) || '',
        apellidoPaterno: (data.apellido_paterno as string) || (data.apellidoPaterno as string) || '',
        apellidoMaterno: (data.apellido_materno as string) || (data.apellidoMaterno as string) || '',
      },
    };
  },

  // API 3: dniruc.com - DNI (gratuita)
  async consultarDniDniruc(dni: string): Promise<SunatServiceResponse<ReniecDniResponse>> {
    const response = await fetch(`${DNIRUC_BASE}/dni/${dni}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json() as Record<string, unknown>;

    if (!data.success && !data.dni && !data.nombres) {
      throw new Error('DNI no encontrado');
    }

    return {
      success: true,
      data: {
        dni: (data.dni as string) || dni,
        nombres: (data.nombres as string) || '',
        apellidoPaterno: (data.apellidoPaterno as string) || (data.apellido_paterno as string) || '',
        apellidoMaterno: (data.apellidoMaterno as string) || (data.apellido_materno as string) || '',
      },
    };
  },
};

export default sunatService;
