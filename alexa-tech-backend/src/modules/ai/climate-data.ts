// alexa-tech-backend/src/modules/ai/climate-data.ts

/**
 * Base de datos de características climáticas de Perú por ubicación
 * Usada para enriquecer recomendaciones de productos según el clima
 */

export interface ClimateData {
  clima: string;
  temperatura: string;
  caracteristicas: string[];
  recomendaciones: string[];
}

type UbigeoKey = `${string}-${string}`;

export const CLIMATE_DATABASE: Record<UbigeoKey, ClimateData> = {
  // ========================================
  // COSTA
  // ========================================
  'LIMA-LIMA': {
    clima: 'Húmedo costero',
    temperatura: '15-28°C',
    caracteristicas: [
      'Alta humedad relativa (80-95%)',
      'Presencia de salitre marino',
      'Neblina frecuente (garúa)',
      'Poco sol en invierno',
    ],
    recomendaciones: [
      'Protección IP67 mínimo',
      'Recubrimiento anti-corrosión',
      'Resistente a humedad',
      'Mantenimiento cada 6 meses',
    ],
  },

  'LIMA-CALLAO': {
    clima: 'Húmedo costero industrial',
    temperatura: '15-28°C',
    caracteristicas: [
      'Muy alta humedad (85-98%)',
      'Salitre intenso por cercanía al mar',
      'Contaminación industrial',
      'Ambiente salino corrosivo',
    ],
    recomendaciones: [
      'Protección IP68 obligatoria',
      'Carcasa de acero inoxidable 316L',
      'Recubrimiento anti-corrosión reforzado',
      'Mantenimiento cada 3-4 meses',
    ],
  },

  'AREQUIPA-AREQUIPA': {
    clima: 'Seco de altura templado',
    temperatura: '8-24°C',
    caracteristicas: [
      'Baja humedad (30-50%)',
      'Alta radiación solar',
      'Ceniza volcánica ocasional',
      'Amplitud térmica día/noche',
    ],
    recomendaciones: [
      'Protección UV',
      'Compensación térmica automática',
      'Sellado contra polvo IP66+',
      'Resistente a radiación solar',
    ],
  },

  'PIURA-PIURA': {
    clima: 'Cálido desértico',
    temperatura: '20-35°C',
    caracteristicas: [
      'Altas temperaturas constantes',
      'Baja humedad',
      'Presencia de arena/polvo',
      'Lluvias intensas en fenómeno El Niño',
    ],
    recomendaciones: [
      'Rango de temperatura amplio (hasta 60°C)',
      'Protección IP66 contra polvo',
      'Ventilación especial',
      'Carcasa reforzada contra calor',
    ],
  },

  'LAMBAYEQUE-CHICLAYO': {
    clima: 'Cálido costero',
    temperatura: '18-32°C',
    caracteristicas: [
      'Temperatura alta constante',
      'Humedad moderada-alta',
      'Brisa marina',
      'Polvo en temporada seca',
    ],
    recomendaciones: [
      'Resistencia térmica hasta 60°C',
      'Protección IP67',
      'Filtros de ventilación',
      'Material resistente a salitre',
    ],
  },

  // ========================================
  // SIERRA
  // ========================================
  'PUNO-PUNO': {
    clima: 'Frío de altura',
    temperatura: '-5 a 15°C',
    caracteristicas: [
      'Temperaturas muy bajas',
      'Lluvias intensas (diciembre-marzo)',
      'Granizo frecuente',
      'Baja presión atmosférica',
      'Radiación UV extrema',
    ],
    recomendaciones: [
      'Calefactor interno integrado',
      'Rango de temperatura: -40°C a 60°C',
      'Protección IP67 contra lluvia/granizo',
      'Carcasa metálica resistente',
    ],
  },

  'CUSCO-CUSCO': {
    clima: 'Templado de altura',
    temperatura: '0-20°C',
    caracteristicas: [
      'Lluvia estacional intensa',
      'Radiación solar alta',
      'Temperatura variable día/noche',
      'Heladas nocturnas',
    ],
    recomendaciones: [
      'Protección UV obligatoria',
      'Resistente a lluvia (IP67)',
      'Compensación térmica',
      'Rango operativo: -20°C a 50°C',
    ],
  },

  'JUNIN-HUANCAYO': {
    clima: 'Templado de valle alto',
    temperatura: '3-20°C',
    caracteristicas: [
      'Clima templado pero variable',
      'Lluvias estacionales',
      'Vientos fuertes',
      'Heladas ocasionales',
    ],
    recomendaciones: [
      'Protección contra lluvia IP66+',
      'Montaje reforzado contra viento',
      'Resistente a heladas',
      'Compensación de temperatura',
    ],
  },

  'CAJAMARCA-CAJAMARCA': {
    clima: 'Lluvioso de sierra',
    temperatura: '5-22°C',
    caracteristicas: [
      'Lluvias muy frecuentes',
      'Humedad alta',
      'Neblina constante',
      'Temperaturas frescas',
    ],
    recomendaciones: [
      'Protección IP67 mínimo',
      'Resistente a humedad extrema',
      'Visión clara en neblina',
      'Calefactor para lente',
    ],
  },

  'AYACUCHO-HUAMANGA': {
    clima: 'Seco de sierra',
    temperatura: '5-23°C',
    caracteristicas: [
      'Clima seco',
      'Alta radiación solar',
      'Lluvias estacionales',
      'Amplitud térmica',
    ],
    recomendaciones: [
      'Protección UV',
      'Resistente a polvo IP65+',
      'Compensación térmica',
      'Sellado contra polvo',
    ],
  },

  // ========================================
  // SELVA
  // ========================================
  'LORETO-MAYNAS': {
    clima: 'Tropical húmedo extremo',
    temperatura: '20-35°C',
    caracteristicas: [
      'Humedad extrema (85-100%)',
      'Lluvias torrenciales constantes',
      'Presencia de insectos',
      'Hongos y moho',
      'Ambiente selvático',
    ],
    recomendaciones: [
      'Protección IP68 obligatoria',
      'Tratamiento anti-hongos',
      'Ventilación especial sellada',
      'Carcasa totalmente hermética',
      'Mantenimiento frecuente',
    ],
  },

  'UCAYALI-CORONEL PORTILLO': {
    clima: 'Tropical húmedo',
    temperatura: '22-33°C',
    caracteristicas: [
      'Alta humedad constante',
      'Lluvias intensas',
      'Calor permanente',
      'Proliferación de hongos',
    ],
    recomendaciones: [
      'IP68 obligatorio',
      'Resistente a hongos',
      'Ventilación hermética',
      'Disipador de calor',
    ],
  },

  'MADRE DE DIOS-TAMBOPATA': {
    clima: 'Tropical lluvioso',
    temperatura: '20-32°C',
    caracteristicas: [
      'Lluvias torrenciales',
      'Humedad extrema',
      'Fango y lodo constante',
      'Insectos abundantes',
    ],
    recomendaciones: [
      'IP68 sumergible',
      'Sellado total',
      'Fácil limpieza',
      'Resistente a impactos',
    ],
  },

  'SAN MARTIN-MOYOBAMBA': {
    clima: 'Tropical de montaña',
    temperatura: '18-30°C',
    caracteristicas: [
      'Humedad muy alta',
      'Lluvia frecuente',
      'Neblina en altura',
      'Hongos y moho',
    ],
    recomendaciones: [
      'Protección IP67-IP68',
      'Anti-hongos',
      'Visión en neblina',
      'Sellado hermético',
    ],
  },

  'AMAZONAS-CHACHAPOYAS': {
    clima: 'Nuboso de ceja de selva',
    temperatura: '12-24°C',
    caracteristicas: [
      'Neblina constante',
      'Lluvia frecuente',
      'Humedad alta',
      'Vientos fuertes',
    ],
    recomendaciones: [
      'Visión clara en neblina',
      'IP67 contra lluvia',
      'Calefactor de lente',
      'Montaje anti-viento',
    ],
  },

  // ========================================
  // OTRAS REGIONES IMPORTANTES
  // ========================================
  'ICA-ICA': {
    clima: 'Desértico',
    temperatura: '15-30°C',
    caracteristicas: [
      'Muy seco',
      'Arena y polvo constante',
      'Sol intenso',
      'Vientos con arena',
    ],
    recomendaciones: [
      'Protección IP66 contra polvo',
      'Sellado hermético',
      'Fácil limpieza',
      'Resistente a abrasión',
    ],
  },

  'TACNA-TACNA': {
    clima: 'Desértico costero',
    temperatura: '12-28°C',
    caracteristicas: [
      'Muy seco',
      'Arena constante',
      'Brisa marina ocasional',
      'Alta radiación solar',
    ],
    recomendaciones: [
      'IP66 contra polvo',
      'Protección UV',
      'Resistente a arena',
      'Sellado reforzado',
    ],
  },

  'TUMBES-TUMBES': {
    clima: 'Tropical seco',
    temperatura: '22-35°C',
    caracteristicas: [
      'Muy caluroso',
      'Humedad moderada',
      'Lluvias en verano',
      'Salitre marino',
    ],
    recomendaciones: [
      'Resistencia térmica alta',
      'IP67 para lluvias',
      'Anti-corrosión',
      'Ventilación especial',
    ],
  },

  'HUANUCO-HUANUCO': {
    clima: 'Templado de valle',
    temperatura: '10-26°C',
    caracteristicas: [
      'Clima templado agradable',
      'Lluvias moderadas',
      'Sol intenso en día',
      'Frío nocturno',
    ],
    recomendaciones: [
      'Protección estándar IP65+',
      'Compensación térmica',
      'Resistente a lluvia',
      'Rango -10°C a 50°C',
    ],
  },

  'ANCASH-HUARAZ': {
    clima: 'Frío de altura',
    temperatura: '0-18°C',
    caracteristicas: [
      'Frío intenso',
      'Heladas frecuentes',
      'Lluvias y granizo',
      'Radiación UV alta',
    ],
    recomendaciones: [
      'Calefactor interno',
      'Rango: -30°C a 50°C',
      'IP67 contra granizo',
      'Protección UV',
    ],
  },
};

/**
 * Obtiene datos climáticos basados en departamento y provincia
 */
export function getClimateData(
  departamento: string,
  provincia: string
): ClimateData {
  const key: UbigeoKey = `${departamento.toUpperCase()}-${provincia.toUpperCase()}`;

  // Si existe en la BD, devolver datos específicos
  if (CLIMATE_DATABASE[key]) {
    return CLIMATE_DATABASE[key];
  }

  // Fallback: datos genéricos según región
  const dept = departamento.toUpperCase();

  // Costa
  if (['LIMA', 'CALLAO', 'ICA', 'AREQUIPA', 'MOQUEGUA', 'TACNA', 'PIURA', 'LAMBAYEQUE', 'LA LIBERTAD', 'ANCASH', 'TUMBES'].includes(dept)) {
    return {
      clima: 'Costero',
      temperatura: '15-30°C',
      caracteristicas: ['Humedad moderada-alta', 'Brisa marina', 'Salitre ocasional'],
      recomendaciones: ['Protección IP65+', 'Anti-corrosión recomendado', 'Resistente a humedad'],
    };
  }

  // Sierra
  if (['PUNO', 'CUSCO', 'APURIMAC', 'HUANCAVELICA', 'AYACUCHO', 'JUNIN', 'PASCO', 'HUANUCO', 'ANCASH', 'CAJAMARCA'].includes(dept)) {
    return {
      clima: 'Andino',
      temperatura: '0-20°C',
      caracteristicas: ['Frío', 'Lluvias estacionales', 'Radiación solar alta', 'Heladas'],
      recomendaciones: ['Rango -20°C a 50°C', 'Protección IP66+', 'Resistente a heladas', 'Compensación térmica'],
    };
  }

  // Selva
  if (['LORETO', 'UCAYALI', 'MADRE DE DIOS', 'SAN MARTIN', 'AMAZONAS'].includes(dept)) {
    return {
      clima: 'Tropical',
      temperatura: '20-35°C',
      caracteristicas: ['Humedad extrema', 'Lluvias intensas', 'Calor constante', 'Hongos'],
      recomendaciones: ['IP68 obligatorio', 'Anti-hongos', 'Sellado hermético', 'Ventilación especial'],
    };
  }

  // Default genérico
  return {
    clima: 'Moderado',
    temperatura: '10-28°C',
    caracteristicas: ['Clima variable', 'Condiciones mixtas'],
    recomendaciones: ['Protección IP65 mínimo', 'Resistente a condiciones estándar'],
  };
}

/**
 * Obtiene todas las ubicaciones disponibles en la BD
 */
export function getAvailableLocations(): string[] {
  return Object.keys(CLIMATE_DATABASE);
}
