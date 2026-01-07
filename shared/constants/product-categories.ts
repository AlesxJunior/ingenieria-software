// Constantes relacionadas con productos

export const PRODUCT_CATEGORIES = [
  { value: 'ELECTRONICS', label: 'Electrónica' },
  { value: 'CLOTHING', label: 'Ropa' },
  { value: 'FOOD', label: 'Alimentos' },
  { value: 'BOOKS', label: 'Libros' },
  { value: 'TOYS', label: 'Juguetes' },
  { value: 'SPORTS', label: 'Deportes' },
  { value: 'HOME', label: 'Hogar' },
  { value: 'BEAUTY', label: 'Belleza' },
  { value: 'AUTOMOTIVE', label: 'Automotriz' },
  { value: 'OFFICE', label: 'Oficina' },
  { value: 'OTHER', label: 'Otros' },
] as const;

export const PRODUCT_UNITS = [
  { value: 'UNIT', label: 'Unidad', abbr: 'UN' },
  { value: 'KG', label: 'Kilogramo', abbr: 'KG' },
  { value: 'LITER', label: 'Litro', abbr: 'L' },
  { value: 'METER', label: 'Metro', abbr: 'M' },
  { value: 'BOX', label: 'Caja', abbr: 'CJ' },
  { value: 'PACK', label: 'Paquete', abbr: 'PQ' },
  { value: 'DOZEN', label: 'Docena', abbr: 'DOC' },
  { value: 'GALLON', label: 'Galón', abbr: 'GAL' },
] as const;

// Mapeo de categorías a español
export const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: 'Electrónica',
  CLOTHING: 'Ropa',
  FOOD: 'Alimentos',
  BOOKS: 'Libros',
  TOYS: 'Juguetes',
  SPORTS: 'Deportes',
  HOME: 'Hogar',
  BEAUTY: 'Belleza',
  AUTOMOTIVE: 'Automotriz',
  OFFICE: 'Oficina',
  OTHER: 'Otros',
};

// Mapeo de unidades a español
export const UNIT_LABELS: Record<string, string> = {
  UNIT: 'Unidad',
  KG: 'Kilogramo',
  LITER: 'Litro',
  METER: 'Metro',
  BOX: 'Caja',
  PACK: 'Paquete',
  DOZEN: 'Docena',
  GALLON: 'Galón',
};
