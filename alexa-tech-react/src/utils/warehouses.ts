export const WAREHOUSES: Record<string, string> = {
  'ALM-001': 'Almacén A',
  'ALM-002': 'Almacén B',
  'ALM-003': 'Almacén C',
  'MST-001': 'Mostrador',
  'DEP-001': 'Depósito',
};

export const getWarehouseName = (id?: string): string => {
  if (!id) return '';
  return WAREHOUSES[id] || id;
};

export const WAREHOUSE_OPTIONS: { id: string; name: string }[] = Object.entries(WAREHOUSES).map(([id, name]) => ({ id, name }));